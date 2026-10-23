package io.github.aerithmetiq.crosscodebox

import org.json.JSONArray
import org.json.JSONObject

/** One mod as CCModDB lists it (see [ModDb]). */
data class ModEntry(
    val id: String,
    val title: String,
    val version: String,
    val description: String,
    val authors: List<String>,
    val tags: List<String>,
    /** The archive to download: a `.ccmod` or a `.zip`. */
    val url: String,
    val sha256: String?,
    /** The folder inside the archive that holds the mod; "" when it sits at the top. */
    val source: String,
    /** Mod id to version range, as the mod's manifest states them. */
    val dependencies: Map<String, String>,
    val repository: String?,
    /** The repository's GitHub stars, as CCModDB counts them: the only popularity figure it has. */
    val stars: Int = 0,
    /** When the mod last had a release, in ms since 1970; 0 when unknown. */
    val updated: Long = 0,
) {
    /** The authors as one line ("A, B"). */
    val byline: String get() = authors.joinToString(", ")
}

/**
 * The orders the mod browser offers. Each has a natural direction ([ModView.reversed] false):
 * most stars, A to Z, newest first; [natural] and [reverse] name the two directions for its button.
 */
enum class ModSort(val label: String, val natural: String, val reverse: String) {
    POPULAR("Popularity", "Most stars first", "Fewest stars first"),
    NAME("Name", "A to Z", "Z to A"),
    AUTHOR("Author", "A to Z", "Z to A"),
    UPDATED("Last updated", "Newest first", "Oldest first"),
}

/** What the mod browser shows: the search text, the order, and a category and an author to keep to (null: all). */
data class ModView(
    val text: String = "",
    val sort: ModSort = ModSort.POPULAR,
    val reversed: Boolean = false,
    val tag: String? = null,
    val author: String? = null,
)

/**
 * The mod list for the mod browser: CCModDB (github.com/CCDirectLink/CCModDB), the community's
 * database that CCModManager reads too. Its `npDatabase.min.json` maps a name to the mod's manifest
 * (`metadataCCMod`) and how to install it (`installation`: a zip URL, the folder inside it, its
 * SHA-256). The app only reads it; what it lists is downloaded from each mod's own release page.
 * Pure, so it is unit-tested.
 */
object ModDb {

    const val URL = "https://raw.githubusercontent.com/CCDirectLink/CCModDB/stable/npDatabase.min.json"

    /**
     * Dependencies nothing has to be installed for: what CCLoader3 provides itself (its virtual
     * packages) and the game's extensions (DLC), which the download brings when the account owns them.
     */
    val PROVIDED = setOf(
        "crosscode", "ccloader", "ccloader-runtime", "Simplify", "input-api", "extension-asset-preloader",
        "nax-module-cache", "nw",
        "post-game", "ninja-skin", "manlea", "fish-gear", "flying-hedgehag", "scorpion-robo", "snowman-tank",
    )

    fun parse(json: String): List<ModEntry> {
        val root = JSONObject(json)
        val out = ArrayList<ModEntry>()
        for (key in root.keys()) {
            val entry = root.optJSONObject(key) ?: continue
            val meta = entry.optJSONObject("metadataCCMod") ?: continue
            val install = entry.optJSONArray("installation")?.let(::firstZip) ?: continue
            val id = meta.optString("id").ifBlank { key }
            out.add(
                ModEntry(
                    id = id,
                    title = text(meta.opt("title")).ifBlank { id },
                    version = meta.optString("version"),
                    description = text(meta.opt("description")),
                    authors = authors(meta.opt("authors")),
                    stars = entry.optInt("stars"),
                    updated = entry.optLong("lastUpdateTimestamp"),
                    tags = meta.optJSONArray("tags")?.let { a -> (0 until a.length()).map { a.optString(it) } }.orEmpty(),
                    url = install.optString("url"),
                    sha256 = install.optJSONObject("hash")?.optString("sha256")?.takeIf { it.isNotBlank() },
                    source = install.optString("source").trim('/'),
                    dependencies = meta.optJSONObject("dependencies")?.let { d -> d.keys().asSequence().associateWith { d.optString(it) } }.orEmpty(),
                    repository = meta.optString("repository").takeIf { it.isNotBlank() },
                )
            )
        }
        return out.filter { it.url.startsWith("https://") && !hidden(it) }.sortedBy { it.title.lowercase() }
    }

    /**
     * Left out of the browser: CCLoader v2 and its base libraries (tag `base`, and the packages
     * CCLoader3 provides itself), which would clash with CCLoader3; and CCModManager, which installs
     * mods by writing files, which the game's process does not allow here.
     */
    private fun hidden(entry: ModEntry): Boolean =
        entry.id in PROVIDED || "base" in entry.tags || entry.id == "ccmodmanager"

    private fun firstZip(list: JSONArray): JSONObject? =
        (0 until list.length()).mapNotNull { list.optJSONObject(it) }.firstOrNull { it.optString("type") == "zip" }

    /**
     * A manifest text: a plain string, or a language map (`en_US` first). CrossCode's text codes
     * (`\c[3]` colour, `\i[class-tri]` icon, and the like) are dropped, and the spaces they leave.
     */
    fun text(value: Any?): String = when (value) {
        is String -> value
        is JSONObject -> value.optString("en_US").ifBlank { value.keys().asSequence().map { value.optString(it) }.firstOrNull { it.isNotBlank() }.orEmpty() }
        else -> ""
    }.replace(Regex("\\\\[a-z]\\[[^]]*]"), "").replace(Regex("[ \t]{2,}"), " ").trim()

    private fun authors(value: Any?): List<String> = when (value) {
        is String -> listOf(value)
        is JSONArray -> (0 until value.length()).map { value.optString(it) }
        else -> emptyList()
    }.map { it.trim() }.filter { it.isNotEmpty() }

    /** Whether [entry] matches what was typed in the search box (title, id, author, tags, description). */
    fun matches(entry: ModEntry, query: String): Boolean {
        val q = query.trim().lowercase()
        if (q.isEmpty()) return true
        return listOf(entry.title, entry.id, entry.byline, entry.description, entry.tags.joinToString(" "))
            .any { it.lowercase().contains(q) }
    }

    /**
     * The mods [view] shows, in its order: matching the search text, in its category and by its author
     * (an author's name compared without case, as the database spells some two ways). Ties go by title.
     */
    fun select(all: List<ModEntry>, view: ModView): List<ModEntry> {
        val shown = all.filter { mod ->
            matches(mod, view.text) &&
                (view.tag == null || view.tag in mod.tags) &&
                (view.author == null || mod.authors.any { it.equals(view.author, ignoreCase = true) })
        }
        val byTitle = compareBy<ModEntry> { it.title.lowercase() }
        val order: Comparator<ModEntry> = when (view.sort) {
            ModSort.POPULAR -> compareByDescending { it.stars }
            ModSort.UPDATED -> compareByDescending { it.updated }
            ModSort.NAME -> byTitle
            /* A mod with no author goes after the named ones. */
            ModSort.AUTHOR -> compareBy { it.authors.firstOrNull()?.lowercase() ?: "\uFFFF" }
        }
        return shown.sortedWith((if (view.reversed) order.reversed() else order).then(byTitle))
    }

    /** The categories (tags) the mods use, A to Z, each with how many mods have it. */
    fun categories(all: List<ModEntry>): List<Pair<String, Int>> =
        all.flatMap { it.tags }.filter { it.isNotBlank() }.groupingBy { it }.eachCount()
            .toList().sortedBy { it.first.lowercase() }

    /**
     * The authors, A to Z, each with how many mods they made. Spellings that differ only in case are one
     * author, named as most of their mods spell it.
     */
    fun authorList(all: List<ModEntry>): List<Pair<String, Int>> =
        all.flatMap { mod -> mod.authors.distinctBy { it.lowercase() } }
            .groupBy { it.lowercase() }
            .map { (_, names) -> names.groupingBy { it }.eachCount().maxBy { it.value }.key to names.size }
            .sortedBy { it.first.lowercase() }

    /**
     * What to download to install [target]: its dependencies not installed yet (theirs first, each
     * once), then [target] itself; and the dependencies the database does not have, which the user is
     * told about. [installed] holds the installed mods' ids.
     */
    fun plan(target: ModEntry, all: List<ModEntry>, installed: Set<String>): Pair<List<ModEntry>, List<String>> {
        val byId = all.associateBy { it.id }
        val order = ArrayList<ModEntry>()
        val unknown = LinkedHashSet<String>()
        val seen = HashSet<String>()
        fun visit(entry: ModEntry) {
            if (!seen.add(entry.id)) return
            for (dep in entry.dependencies.keys) {
                if (dep in PROVIDED || dep in installed) continue
                val found = byId[dep]
                if (found == null) unknown.add(dep) else visit(found)
            }
            order.add(entry)
        }
        visit(target)
        return order to unknown.toList()
    }
}
