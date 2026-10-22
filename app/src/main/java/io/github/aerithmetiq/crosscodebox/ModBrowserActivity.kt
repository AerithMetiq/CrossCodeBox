package io.github.aerithmetiq.crosscodebox

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.Gravity
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import io.github.aerithmetiq.crosscodebox.host.GameSettings
import java.io.File
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest

/**
 * Settings → Mods → Browse mods: the mods CCModDB lists ([ModDb]), with a search box. Choosing one
 * shows what it is and installs it, with the mods it depends on: each archive is downloaded from the
 * mod's own release, checked against the SHA-256 the database gives, and unpacked into the mods
 * folder ([Mods.installArchive]). Nothing runs until the game starts with mods on.
 */
class ModBrowserActivity : AppCompatActivity() {

    /** B is Back on the first press (see [Screens.bIsBack]). */
    override fun dispatchKeyEvent(event: android.view.KeyEvent): Boolean =
        Screens.bIsBack(this, event) || super.dispatchKeyEvent(event)

    private lateinit var status: TextView
    private lateinit var list: LinearLayout
    private lateinit var search: EditText
    private var mods: List<ModEntry> = emptyList()
    private var installed: Map<String, String> = emptyMap()
    @Volatile private var busy = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val ctx = this
        status = Screens.body(ctx, "Loading the mod list…", topDp = 12)
        list = LinearLayout(ctx).apply { orientation = LinearLayout.VERTICAL }
        search = EditText(ctx).apply {
            hint = "Search mods"
            textSize = 15f
            setSingleLine()
            /* Not the landscape keyboard's full-screen field: the list stays in view while typing. */
            imeOptions = android.view.inputmethod.EditorInfo.IME_FLAG_NO_EXTRACT_UI or android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH
            setTextColor(getColor(R.color.text_primary))
            setHintTextColor(getColor(R.color.text_secondary))
            addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
                override fun afterTextChanged(s: Editable?) = render()
            })
        }
        val back = Screens.outlined(ctx, "Back") { finish() }
        setContentView(Screens.page(ctx) {
            addView(Screens.title(ctx, "Mod browser"))
            addView(
                Screens.body(
                    ctx,
                    "Mods listed by CCModDB, the CrossCode community's mod database. Each is downloaded from its " +
                        "author's own release page and checked against the database's checksum. Mods are made by " +
                        "other people and run with the game: install only ones you trust.",
                )
            )
            addView(status)
            addView(Screens.row(ctx, 12, back))
            addView(search)
            addView(list)
        })
        Screens.statusBar(this)
        back.post { back.requestFocus() }
        load()
    }

    override fun onResume() {
        super.onResume()
        installed = Mods.installedVersions(this)
        if (mods.isNotEmpty()) render()
    }

    private fun load() {
        val cache = File(cacheDir, "ccmoddb.json")
        Thread({
            val fresh = runCatching { fetchText(ModDb.URL).also { cache.writeText(it) } }
            val text = fresh.getOrNull() ?: runCatching { cache.readText() }.getOrNull()
            val parsed = text?.let { runCatching { ModDb.parse(it) }.getOrNull() }
            val owned = Mods.installedVersions(this)
            runOnUiThread {
                if (isFinishing || isDestroyed) return@runOnUiThread
                installed = owned
                if (parsed == null) {
                    status.text = "Could not load the mod list: ${fresh.exceptionOrNull()?.message ?: "no answer"}. Check the connection and open this again."
                    return@runOnUiThread
                }
                mods = parsed
                render()
                list.getChildAt(0)?.requestFocus()
            }
        }, "mod-list").start()
    }

    private fun render() {
        if (mods.isEmpty()) return
        val shown = mods.filter { ModDb.matches(it, search.text.toString()) }
        val modsOn = GameSettings.prefs(this).getBoolean(GameSettings.KEY_MODS, GameSettings.MODS_DEFAULT)
        if (!busy) {
            status.text = "${shown.size} of ${mods.size} mods. ${installed.size} installed." +
                if (modsOn) "" else " Mods are off: turn them on in Settings → Mods to load them."
        }
        list.removeAllViews()
        for (mod in shown) {
            val state = when (val have = installed[mod.id]) {
                null -> ""
                mod.version -> "  ·  installed"
                else -> "  ·  installed $have, update available"
            }
            val head = "${mod.title}  ${mod.version}" + (if (mod.authors.isNotBlank()) "  ·  ${mod.authors}" else "") + state
            val line = mod.description.lineSequence().firstOrNull().orEmpty().let { if (it.length > 140) it.take(137) + "…" else it }
            val row = Screens.outlined(this, if (line.isEmpty()) head else "$head\n$line") { details(mod) }.apply {
                gravity = Gravity.START or Gravity.CENTER_VERTICAL
                letterSpacing = 0f
                textSize = 14f
                maxLines = 3
            }
            list.addView(row, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply {
                topMargin = Screens.dp(this@ModBrowserActivity, 8)
            })
        }
    }

    private fun details(mod: ModEntry) {
        if (busy) return
        val (plan, unknown) = ModDb.plan(mod, mods, installed.keys - mod.id)
        val extra = plan.filter { it.id != mod.id }
        val have = installed[mod.id]
        val message = buildString {
            if (mod.description.isNotBlank()) append(mod.description).append("\n\n")
            append("Version ${mod.version}")
            if (mod.authors.isNotBlank()) append(" by ${mod.authors}")
            append('.')
            if (mod.tags.isNotEmpty()) append("\nTags: ${mod.tags.joinToString(", ")}")
            mod.repository?.let { append("\n$it") }
            if (have != null) append("\n\nInstalled: version ${have.ifBlank { "unknown" }}.")
            if (extra.isNotEmpty()) append("\n\nAlso installs what it needs: ${extra.joinToString { "${it.title} ${it.version}" }}.")
            if (unknown.isNotEmpty()) append("\n\nIt also needs ${unknown.joinToString()}, which the database does not list; CCLoader3 says so in the game if it is missing.")
        }
        AlertDialog.Builder(this)
            .setTitle(mod.title)
            .setMessage(message)
            .setPositiveButton(if (have == null) "Install" else if (have == mod.version) "Install again" else "Update") { _, _ -> install(plan) }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun install(plan: List<ModEntry>) {
        busy = true
        Thread({
            val done = ArrayList<String>()
            var error: String? = null
            for ((i, mod) in plan.withIndex()) {
                val step = if (plan.size > 1) " (${i + 1} of ${plan.size})" else ""
                ui { status.text = "Downloading ${mod.title}$step…" }
                val tmp = File(cacheDir, "mod-download.tmp")
                try {
                    val sha = download(mod.url, tmp) { bytes -> ui { status.text = "Downloading ${mod.title}$step: ${bytes / 1024} KiB" } }
                    if (mod.sha256 != null && !sha.equals(mod.sha256, ignoreCase = true)) {
                        throw IOException("the file does not match the database's checksum")
                    }
                    Mods.installArchive(this, tmp, mod.id, mod.source)
                    done.add(mod.title)
                } catch (e: Exception) {
                    Log.w("CrossCodeBox", "mods: ${mod.id} not installed", e)
                    error = "Could not install ${mod.title}: ${e.message}"
                    break
                } finally {
                    tmp.delete()
                }
            }
            val owned = Mods.installedVersions(this)
            ui {
                busy = false
                installed = owned
                render()
                status.text = error ?: ("Installed ${done.joinToString()}. " +
                    (if (done.size == 1) "It loads" else "They load") + " the next time the game starts with mods on.")
            }
        }, "mod-install").start()
    }

    /** Downloads [url] to [to], returning the file's SHA-256 (hex). */
    private fun download(url: String, to: File, progress: (Long) -> Unit): String {
        val conn = open(url)
        try {
            if (conn.responseCode != 200) throw IOException("the server answered ${conn.responseCode}")
            val digest = MessageDigest.getInstance("SHA-256")
            var total = 0L
            var reported = 0L
            conn.inputStream.use { input ->
                to.outputStream().use { out ->
                    val buffer = ByteArray(64 * 1024)
                    while (true) {
                        val n = input.read(buffer)
                        if (n < 0) break
                        out.write(buffer, 0, n)
                        digest.update(buffer, 0, n)
                        total += n
                        if (total - reported > 256 * 1024) { reported = total; progress(total) }
                    }
                }
            }
            return digest.digest().joinToString("") { "%02x".format(it) }
        } finally {
            conn.disconnect()
        }
    }

    private fun fetchText(url: String): String {
        val conn = open(url)
        try {
            if (conn.responseCode != 200) throw IOException("the server answered ${conn.responseCode}")
            return conn.inputStream.use { it.readBytes().toString(Charsets.UTF_8) }
        } finally {
            conn.disconnect()
        }
    }

    /** An HTTPS request; redirects (GitHub's release downloads use them) are followed, HTTPS only. */
    private fun open(url: String): HttpURLConnection {
        var target = URL(url)
        repeat(5) {
            if (target.protocol != "https") throw IOException("refusing a non-HTTPS address")
            val conn = (target.openConnection() as HttpURLConnection).apply {
                instanceFollowRedirects = false
                connectTimeout = 20_000
                readTimeout = 60_000
                setRequestProperty("User-Agent", "CrossCodeBox")
            }
            val code = conn.responseCode
            if (code in 300..399) {
                val next = conn.getHeaderField("Location") ?: throw IOException("a redirect without a target")
                conn.disconnect()
                target = URL(target, next)
            } else {
                return conn
            }
        }
        throw IOException("too many redirects")
    }

    private fun ui(block: () -> Unit) = runOnUiThread {
        if (!isFinishing && !isDestroyed) block()
    }
}
