package io.github.aerithmetiq.crosscodebox

import android.content.Context
import android.net.Uri
import java.io.File
import java.io.IOException
import java.util.zip.ZipFile

/**
 * CrossCode mods, loaded by CCLoader3 (MIT, © Dmytro Meleshko; github.com/CCDirectLink/CCLoader3).
 *
 * The app carries CCLoader3's release files in its own assets ([LOADER_DIR]). While mods are on
 * (Settings, `GameSettings.KEY_MODS`), the game's process copies them into the game folder
 * ([ensureLoader]) and starts the game from [ENTRY] instead of the game's own page; CCLoader3 then
 * loads the mods in [MODS_DIR] and starts the game itself. The game's files are not changed: the
 * loader only adds files of its own, and the downloader leaves [MODS_DIR] alone.
 *
 * A mod is a folder holding `ccmod.json` (or an older mod's `package.json`), or a `.ccmod` file (a
 * zip of such a folder), which CCLoader3 reads as it is. [install] takes either: a `.ccmod` is copied,
 * a `.zip` is unpacked into a folder of its own.
 */
object Mods {

    /** CCLoader3's files: in the APK's assets, and copied to this folder below the game folder. */
    const val LOADER_DIR = "ccloader3"

    /** The page CCLoader3 starts the game from, below the game folder. */
    const val ENTRY = "$LOADER_DIR/main.html"

    /** Where CCLoader3 looks for mods, below the game folder. */
    const val MODS_DIR = "assets/mods"

    private val MANIFESTS = setOf("ccmod.json", "package.json")

    fun dir(context: Context): File = File(GameFiles.root(context), MODS_DIR)

    /** The installed mods, by their folder or file name, sorted. */
    fun list(context: Context): List<String> = list(dir(context))

    fun list(dir: File): List<String> =
        dir.listFiles().orEmpty()
            .filter { (it.isDirectory && MANIFESTS.any { m -> File(it, m).isFile }) || (it.isFile && it.name.endsWith(".ccmod")) }
            .map { it.name }
            .sorted()

    /** Removes the installed mod [name] (a folder or a `.ccmod` file in [MODS_DIR]). */
    fun remove(context: Context, name: String): Boolean {
        if (!plainName(name)) return false
        val f = File(dir(context), name)
        return f.exists() && f.deleteRecursively()
    }

    /**
     * Installs the mod in the file [uri] names ([fileName] is its display name). Returns the mod's
     * name. Throws [IOException] when the file is not a mod.
     */
    fun install(context: Context, uri: Uri, fileName: String): String {
        val mods = dir(context).apply { mkdirs() }
        val tmp = File(context.cacheDir, "mod-import.tmp")
        try {
            context.contentResolver.openInputStream(uri)?.use { input -> tmp.outputStream().use { input.copyTo(it) } }
                ?: throw IOException("could not read $fileName")
            val base = fileName.substringBeforeLast('.').ifBlank { "mod" }
            ZipFile(tmp).use { zip ->
                val names = zip.entries().asSequence().filter { !it.isDirectory }.map { it.name }.toList()
                val layout = layout(names) ?: throw IOException("$fileName holds no ccmod.json or package.json: it is not a CrossCode mod")
                if (fileName.endsWith(".ccmod", ignoreCase = true) && layout.prefix.isEmpty()) {
                    val name = safeName(base) + ".ccmod"
                    tmp.copyTo(File(mods, name), overwrite = true)
                    return name
                }
                val name = safeName(layout.folder ?: base)
                val target = File(mods, name)
                target.deleteRecursively()
                for (entry in zip.entries()) {
                    if (entry.isDirectory) continue
                    val rel = target(entry.name, layout.prefix) ?: continue
                    val out = File(target, rel)
                    out.parentFile?.mkdirs()
                    zip.getInputStream(entry).use { input -> out.outputStream().use { input.copyTo(it) } }
                }
                return name
            }
        } catch (e: java.util.zip.ZipException) {
            throw IOException("$fileName is not a zip or .ccmod file", e)
        } finally {
            tmp.delete()
        }
    }

    /** Where a mod's files sit inside its zip: at the top ([prefix] ""), or in one folder ([folder]). */
    data class Layout(val prefix: String, val folder: String?)

    /**
     * Finds the mod in a zip's file [names]: its manifest at the top, or inside a single top-level
     * folder. Null when there is none.
     */
    fun layout(names: List<String>): Layout? {
        val clean = names.map { it.replace('\\', '/').trimStart('/') }
        if (clean.any { it in MANIFESTS }) return Layout("", null)
        val tops = clean.map { it.substringBefore('/', "") }.filter { it.isNotEmpty() }.toSet()
        if (tops.size != 1) return null
        val folder = tops.first()
        return if (clean.any { it == "$folder/ccmod.json" || it == "$folder/package.json" }) Layout("$folder/", folder) else null
    }

    /** Where zip entry [name] goes inside the mod's folder, or null for anything outside [prefix] or not a plain path. */
    fun target(name: String, prefix: String): String? {
        val clean = name.replace('\\', '/').trimStart('/')
        if (!clean.startsWith(prefix)) return null
        val rel = clean.removePrefix(prefix)
        val parts = rel.split('/')
        if (rel.isEmpty() || parts.any { it.isEmpty() || it == "." || it == ".." }) return null
        return rel
    }

    /** A file name made safe to use as a folder name. */
    fun safeName(name: String): String =
        name.replace(Regex("[^A-Za-z0-9._ -]"), "_").trim().trimStart('.').ifBlank { "mod" }

    private fun plainName(name: String) = name.isNotBlank() && !name.contains('/') && !name.contains('\\') && name != "." && name != ".."

    /**
     * Copies CCLoader3 from the APK into the game folder when it is not there or is another version.
     * Called from the game's process before the game folder is read. Returns false when it could not.
     */
    fun ensureLoader(context: Context, gameRoot: File): Boolean = try {
        val target = File(gameRoot, LOADER_DIR)
        val shipped = context.assets.open("$LOADER_DIR/metadata.json").use { it.readBytes().toString(Charsets.UTF_8) }
        val present = runCatching { File(target, "metadata.json").readText() }.getOrNull()
        if (present != shipped || !File(target, "main.html").isFile) {
            target.deleteRecursively()
            copyAssets(context, LOADER_DIR, target)
        }
        true
    } catch (e: Exception) {
        android.util.Log.w("CrossCodeBox", "mods: could not put CCLoader3 in place: ${e.message}")
        false
    }

    private fun copyAssets(context: Context, path: String, to: File) {
        val children = context.assets.list(path).orEmpty()
        if (children.isEmpty()) {
            to.parentFile?.mkdirs()
            context.assets.open(path).use { input -> to.outputStream().use { input.copyTo(it) } }
            return
        }
        to.mkdirs()
        for (child in children) copyAssets(context, "$path/$child", File(to, child))
    }
}
