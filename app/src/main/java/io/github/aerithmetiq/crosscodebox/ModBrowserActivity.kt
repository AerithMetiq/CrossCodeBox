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
import com.google.android.material.button.MaterialButton
import io.github.aerithmetiq.crosscodebox.host.GameSettings
import java.io.File
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest
import java.text.DateFormat
import java.util.Date

/**
 * Settings → Mods → Browse mods: the mods CCModDB lists ([ModDb]), with a search box, an order (stars,
 * name, author, last update, either way round) and a category and an author to keep to, remembered
 * between visits ([ModView]). Choosing one
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
    private lateinit var sortButton: MaterialButton
    private lateinit var orderButton: MaterialButton
    private lateinit var categoryButton: MaterialButton
    private lateinit var authorButton: MaterialButton
    private lateinit var showButton: MaterialButton
    private lateinit var updateAllButton: MaterialButton
    /** The order and filters; the search text is read from [search] when the list is drawn. */
    private var view = ModView()
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
        view = loadView()
        sortButton = Screens.outlined(ctx, "") { chooseSort() }
        orderButton = Screens.outlined(ctx, "") { setView(view.copy(reversed = !view.reversed)) }
        categoryButton = Screens.outlined(ctx, "") { chooseCategory() }
        authorButton = Screens.outlined(ctx, "") { chooseAuthor() }
        showButton = Screens.outlined(ctx, "") { chooseShow() }
        updateAllButton = Screens.primary(ctx, "") { updateAll() }
        showView()
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
            addView(Screens.row(ctx, 8, sortButton, orderButton))
            addView(Screens.row(ctx, 8, categoryButton, authorButton))
            addView(Screens.row(ctx, 8, showButton, updateAllButton))
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
                /* A remembered category or author the list no longer has would show nothing. */
                if (view.tag != null && ModDb.categories(mods).none { it.first == view.tag }) view = view.copy(tag = null)
                if (view.author != null && ModDb.authorList(mods).none { it.first.equals(view.author, ignoreCase = true) }) view = view.copy(author = null)
                showView()
                render()
                list.getChildAt(0)?.requestFocus()
            }
        }, "mod-list").start()
    }

    private fun render() {
        if (mods.isEmpty()) return
        val shown = ModDb.select(mods, view.copy(text = search.text.toString()), installed)
        val updates = mods.count { ModDb.hasUpdate(it, installed) }
        updateAllButton.text = if (updates == 1) "Update 1 mod" else "Update all $updates mods"
        updateAllButton.visibility = if (updates > 0 && !busy) android.view.View.VISIBLE else android.view.View.GONE
        val modsOn = GameSettings.prefs(this).getBoolean(GameSettings.KEY_MODS, GameSettings.MODS_DEFAULT)
        if (!busy) {
            val narrowed = listOfNotNull(
                when (view.show) { ModShow.ALL -> null; ModShow.INSTALLED -> "installed"; ModShow.UPDATES -> "with an update" },
                view.tag?.let { "in $it" },
                view.author?.let { "by $it" },
            ).joinToString(" ")
            status.text = "${shown.size} of ${mods.size} mods${if (narrowed.isEmpty()) "" else " $narrowed"}. ${installed.size} installed." +
                if (modsOn) "" else " Mods are off: turn them on in Settings → Mods to load them."
        }
        list.removeAllViews()
        for (mod in shown) {
            val state = when (val have = installed[mod.id]) {
                null -> ""
                mod.version -> "  ·  installed"
                else -> "  ·  installed $have, update available"
            }
            val updated = if (view.sort == ModSort.UPDATED && mod.updated > 0) "  ·  ${date(mod.updated)}" else ""
            val head = "${mod.title}  ${mod.version}" + (if (mod.authors.isNotEmpty()) "  ·  ${mod.byline}" else "") +
                "  ·  ★ ${mod.stars}" + updated + state
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
            if (mod.authors.isNotEmpty()) append(" by ${mod.byline}")
            append('.')
            if (mod.updated > 0) append(" Last updated ${date(mod.updated)}.")
            append(" ★ ${mod.stars} on GitHub.")
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

    private fun date(ms: Long): String = DateFormat.getDateInstance(DateFormat.MEDIUM).format(Date(ms))

    /* ------------------------------------------------------------- order and filters ---- */

    private val viewPrefs get() = getSharedPreferences("mod_browser", MODE_PRIVATE)

    private fun loadView(): ModView {
        val p = viewPrefs
        return ModView(
            sort = runCatching { ModSort.valueOf(p.getString(KEY_SORT, null) ?: "") }.getOrDefault(ModSort.POPULAR),
            reversed = p.getBoolean(KEY_REVERSED, false),
            tag = p.getString(KEY_TAG, null),
            author = p.getString(KEY_AUTHOR, null),
            show = runCatching { ModShow.valueOf(p.getString(KEY_SHOW, null) ?: "") }.getOrDefault(ModShow.ALL),
        )
    }

    /** Applies, remembers and shows a new order or filter. */
    private fun setView(next: ModView) {
        view = next
        viewPrefs.edit()
            .putString(KEY_SORT, next.sort.name)
            .putBoolean(KEY_REVERSED, next.reversed)
            .putString(KEY_TAG, next.tag)
            .putString(KEY_AUTHOR, next.author)
            .putString(KEY_SHOW, next.show.name)
            .apply()
        showView()
        render()
    }

    private fun showView() {
        sortButton.text = "Sort: ${view.sort.label}"
        orderButton.text = if (view.reversed) view.sort.reverse else view.sort.natural
        categoryButton.text = "Category: ${view.tag ?: "all"}"
        authorButton.text = "Author: ${view.author ?: "all"}"
        showButton.text = "Show: ${view.show.label}"
    }

    /** A list to pick one from, controller-friendly; [current] is ticked. */
    private fun pick(title: String, labels: List<String>, current: Int, chosen: (Int) -> Unit) {
        AlertDialog.Builder(this)
            .setTitle(title)
            .setSingleChoiceItems(labels.toTypedArray(), current) { dialog, which ->
                dialog.dismiss()
                chosen(which)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    /** A new order starts in its natural direction (most stars, A to Z, newest first). */
    private fun chooseSort() {
        val sorts = ModSort.entries
        pick("Sort by", sorts.map { it.label }, sorts.indexOf(view.sort)) { i ->
            setView(view.copy(sort = sorts[i], reversed = false))
        }
    }

    private fun chooseCategory() {
        if (mods.isEmpty()) return
        val tags = ModDb.categories(mods)
        val current = tags.indexOfFirst { it.first == view.tag } + 1
        pick("Category", listOf("All categories") + tags.map { "${it.first} (${it.second})" }, current) { i ->
            setView(view.copy(tag = if (i == 0) null else tags[i - 1].first))
        }
    }

    private fun chooseAuthor() {
        if (mods.isEmpty()) return
        val authors = ModDb.authorList(mods)
        val current = authors.indexOfFirst { it.first.equals(view.author, ignoreCase = true) } + 1
        pick("Author", listOf("All authors") + authors.map { "${it.first} (${it.second})" }, current) { i ->
            setView(view.copy(author = if (i == 0) null else authors[i - 1].first))
        }
    }

    private fun chooseShow() {
        val choices = ModShow.entries
        val labels = listOf("All mods", "Installed mods", "Installed mods with an update")
        pick("Show", labels, choices.indexOf(view.show)) { i -> setView(view.copy(show = choices[i])) }
    }

    /** Every installed mod with an update, with what they need, after one confirmation. */
    private fun updateAll() {
        if (busy) return
        val targets = mods.filter { ModDb.hasUpdate(it, installed) }
        if (targets.isEmpty()) return
        val (plan, unknown) = ModDb.planAll(targets, mods, installed)
        val extra = plan.filter { step -> targets.none { it.id == step.id } }
        val message = buildString {
            append(targets.joinToString("\n") { "${it.title}: ${installed[it.id].orEmpty().ifBlank { "unknown" }} → ${it.version}" })
            if (extra.isNotEmpty()) append("\n\nAlso installs what they need: ${extra.joinToString { "${it.title} ${it.version}" }}.")
            if (unknown.isNotEmpty()) append("\n\nThey also need ${unknown.joinToString()}, which the database does not list.")
        }
        AlertDialog.Builder(this)
            .setTitle(if (targets.size == 1) "Update 1 mod" else "Update ${targets.size} mods")
            .setMessage(message)
            .setPositiveButton("Update") { _, _ -> install(plan) }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun install(plan: List<ModEntry>) {
        busy = true
        updateAllButton.visibility = android.view.View.GONE
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

    private companion object {
        const val KEY_SORT = "sort"
        const val KEY_REVERSED = "reversed"
        const val KEY_TAG = "category"
        const val KEY_AUTHOR = "author"
        const val KEY_SHOW = "show"
    }
}
