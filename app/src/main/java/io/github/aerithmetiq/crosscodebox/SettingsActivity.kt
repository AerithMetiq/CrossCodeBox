package io.github.aerithmetiq.crosscodebox

import android.content.Intent
import android.content.SharedPreferences
import android.content.res.ColorStateList
import android.os.Bundle
import android.widget.CheckBox
import android.widget.SeekBar
import android.widget.LinearLayout
import io.github.aerithmetiq.crosscodebox.host.FpsLimit
import io.github.aerithmetiq.crosscodebox.host.GameSettings
import io.github.aerithmetiq.crosscodebox.host.LogFile
import io.github.aerithmetiq.crosscodebox.host.ViewAlign
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import android.widget.ScrollView

/**
 * Settings: the game's own settings (the same values its in-game menu changes, see [GameSettings]),
 * Steam Cloud saves, the Steam diagnostics, the open-source notices and the version.
 */
class SettingsActivity : AppCompatActivity() {

    /** B is Back on the first press (see [Screens.bIsBack]). */
    override fun dispatchKeyEvent(event: android.view.KeyEvent): Boolean =
        Screens.bIsBack(this, event) || super.dispatchKeyEvent(event)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val ctx = this
        setContentView(Screens.page(ctx) {
            addView(Screens.title(ctx, "Settings"))
            gameSettings(this)

            addView(Screens.body(ctx, "Steam", topDp = 24).apply { textSize = 16f; setTextColor(getColor(R.color.text_primary)) })
            addView(CheckBox(ctx).apply {
                text = "Show me as playing CrossCode on Steam"
                textSize = 15f
                setTextColor(getColor(R.color.text_primary))
                buttonTintList = ColorStateList.valueOf(getColor(R.color.accent))
                isChecked = GameFiles.playingStatus(ctx)
                setOnCheckedChangeListener { _, on -> GameFiles.setPlayingStatus(ctx, on) }
            })
            addView(
                Screens.body(
                    ctx,
                    "Off: Steam is not told when you play. On: while the game runs, your friends see you " +
                        "online and in CrossCode, and Steam counts the play time. Not used with Play offline.",
                    topDp = 0,
                )
            )
            addView(CheckBox(ctx).apply {
                text = "Unlock my CrossCode achievements on Steam"
                textSize = 15f
                setTextColor(getColor(R.color.text_primary))
                buttonTintList = ColorStateList.valueOf(getColor(R.color.accent))
                isChecked = GameFiles.steamAchievements(ctx)
                setOnCheckedChangeListener { _, on -> GameFiles.setSteamAchievements(ctx, on) }
            })
            addView(
                Screens.body(
                    ctx,
                    "On (the default): each achievement the game awards is unlocked on your Steam account, " +
                        "and the ones your save already holds are added the next time it loads. Earned " +
                        "offline, they go up once Steam can be reached. Nothing is ever removed. Off: they " +
                        "stay in the game. Steam diagnostics lists what Steam has.",
                    topDp = 0,
                )
            )

            addView(Screens.body(ctx, "Steam Cloud saves", topDp = 24).apply { textSize = 16f; setTextColor(getColor(R.color.text_primary)) })
            addView(
                Screens.body(
                    ctx,
                    "Turn uploads to Steam Cloud on or off, and check what a sync would do with each save " +
                        "file before it does anything."
                )
            )
            val cloud = Screens.outlined(ctx, "Open Steam Cloud saves") {
                startActivity(Intent(ctx, CloudSavesActivity::class.java))
            }
            addView(Screens.row(ctx, 10, cloud))

            addView(Screens.body(ctx, "Steam diagnostics", topDp = 24).apply { textSize = 16f; setTextColor(getColor(R.color.text_primary)) })
            addView(
                Screens.body(
                    ctx,
                    "A read-only report of what Steam says about CrossCode: its depots (where the game " +
                        "files are), its Steam Cloud rules and your Steam Cloud files. Changes nothing."
                )
            )
            val probe = Screens.outlined(ctx, "Open Steam diagnostics") {
                startActivity(Intent(ctx, SteamProbeActivity::class.java))
            }
            addView(Screens.row(ctx, 10, probe))

            addView(Screens.body(ctx, "About", topDp = 24).apply { textSize = 16f; setTextColor(getColor(R.color.text_primary)) })
            addView(
                Screens.body(
                    ctx,
                    "CrossCodeBox ${versionName()}. An unofficial launcher: you play your own copy of " +
                        "CrossCode from Steam. Not affiliated with Radical Fish Games or Valve. " +
                        "Written by Claude (Anthropic); reviewed by AerithMetiq."
                )
            )
            val notices = Screens.outlined(ctx, "Open-source notices") { showNotices() }
            val back = Screens.outlined(ctx, "Back") { finish() }
            addView(Screens.row(ctx, 10, notices, back))
            /* Controller focus on the first button once the page is laid out. */
        })
        Screens.statusBar(this)
    }

    /** The game's settings: each control writes straight to the file the game reads when it starts. */
    private fun gameSettings(page: LinearLayout) {
        val ctx = this
        val prefs = GameSettings.prefs(ctx)
        val choices = FpsLimit.choicesFor(GameSettings.screenRefreshRates(this))
        page.addView(Screens.body(ctx, "Game", topDp = 20).apply { textSize = 16f; setTextColor(getColor(R.color.text_primary)) })
        page.addView(Screens.body(ctx, "The same settings as the menu inside the game (Back while playing). They apply the next time the game starts."))

        fun toggle(label: String, key: String, default: Boolean, also: (SharedPreferences.Editor) -> Unit = {}) =
            CheckBox(ctx).apply {
                text = label
                textSize = 15f
                setTextColor(getColor(R.color.text_primary))
                buttonTintList = ColorStateList.valueOf(getColor(R.color.accent))
                isChecked = prefs.getBoolean(key, default)
                setOnCheckedChangeListener { _, on -> prefs.edit().putBoolean(key, on).also(also).commit() }
                page.addView(this)
            }

        val first = toggle("Touch controls on screen", GameSettings.KEY_TOUCH_CONTROLS, true)
        toggle("Hide the touch controls while a controller is used", GameSettings.KEY_HIDE_EXTERNAL_INPUT, true)
        toggle("Dynamic sticks (touch anywhere)", GameSettings.KEY_DYNAMIC_STICKS, true)
        /* CrossCodeBox: CrossCode's own touch and vibration options. */
        toggle("Always sprint with the touch stick", GameSettings.KEY_ALWAYS_SPRINT, GameSettings.ALWAYS_SPRINT_DEFAULT)
        toggle("Dash only on a fresh tap of L1/L2", GameSettings.KEY_DASH_ON_TAP, GameSettings.DASH_ON_TAP_DEFAULT)
        toggle("Vibrate when the screen shakes", GameSettings.KEY_VIBRATE, GameSettings.VIBRATE_DEFAULT)
        toggle("Hide the touch controls in cutscenes, conversations and Direct Links",
            GameSettings.KEY_HIDE_IN_SCENES, GameSettings.HIDE_IN_SCENES_DEFAULT)
        fun transparencyLabel(value: Int) = "Touch controls transparency: $value %"
        val transparencyText = Screens.body(ctx, transparencyLabel(
            prefs.getInt(GameSettings.KEY_TOUCH_TRANSPARENCY, GameSettings.TOUCH_TRANSPARENCY_DEFAULT)), topDp = 8)
            .apply { textSize = 15f; setTextColor(getColor(R.color.text_primary)) }
        page.addView(transparencyText)
        page.addView(SeekBar(ctx).apply {
            max = 100
            progress = prefs.getInt(GameSettings.KEY_TOUCH_TRANSPARENCY, GameSettings.TOUCH_TRANSPARENCY_DEFAULT)
            keyProgressIncrement = 5
            isFocusable = true
            progressTintList = ColorStateList.valueOf(getColor(R.color.accent))
            thumbTintList = ColorStateList.valueOf(getColor(R.color.accent))
            setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
                override fun onProgressChanged(bar: SeekBar, value: Int, fromUser: Boolean) {
                    transparencyText.text = transparencyLabel(value)
                    if (fromUser) prefs.edit().putInt(GameSettings.KEY_TOUCH_TRANSPARENCY, value).commit()
                }
                override fun onStartTrackingTouch(bar: SeekBar) {}
                override fun onStopTrackingTouch(bar: SeekBar) {}
            })
        })
        page.addView(
            Screens.body(
                ctx,
                "Always sprint: the touch stick runs at full speed however far it is pushed (CrossCode walks " +
                    "below about 80 % tilt). Dash only on a fresh tap: sliding off L1/L2 and back does not dash " +
                    "again. Vibrate: follows the game's own Rumble Strength option. Hidden in cutscenes, a tap " +
                    "goes to the game, which advances its text on a tap. Transparency: 0 is solid, 100 invisible " +
                    "(the controls still work).",
                topDp = 0,
            )
        )
        toggle("Show FPS / battery / temperature", GameSettings.KEY_STATS, false)
        /* A choice made here ends the log's automatic switch-off, as a tap in the game's menu does. */
        toggle("Keep a log with the saves", LogFile.PREF_KEY, true) { it.putBoolean(LogFile.PREF_SET_KEY, true) }

        fun capLabel(cap: Int) = "Frame rate limit: " + if (cap == FpsLimit.OFF) "Off" else "$cap fps"
        lateinit var fps: com.google.android.material.button.MaterialButton
        fps = Screens.outlined(ctx, capLabel(GameSettings.fpsCap(prefs, choices))) {
            val cap = GameSettings.next(GameSettings.fpsCap(prefs, choices), choices)
            prefs.edit().putBoolean(GameSettings.KEY_LIMIT_FPS, cap != FpsLimit.OFF).apply {
                if (cap != FpsLimit.OFF) putInt(GameSettings.KEY_FPS_LIMIT, cap)
            }.commit()
            fps.text = capLabel(cap)
        }
        fun alignLabel(a: ViewAlign) = "Game position: " + a.wire.replaceFirstChar { it.uppercase() }
        lateinit var align: com.google.android.material.button.MaterialButton
        align = Screens.outlined(ctx, alignLabel(ViewAlign.fromWire(prefs.getString(GameSettings.KEY_VIEW_ALIGN, null)))) {
            val all = ViewAlign.entries
            val next = all[(all.indexOf(ViewAlign.fromWire(prefs.getString(GameSettings.KEY_VIEW_ALIGN, null))) + 1) % all.size]
            prefs.edit().putString(GameSettings.KEY_VIEW_ALIGN, next.wire).commit()
            align.text = alignLabel(next)
        }
        /* CrossCodeBox: no Resolution here. AlabasterDawnBox sets the terra engine's stored option; CrossCode
         * has its own display options in the game. */
        page.addView(Screens.row(ctx, 8, fps, align))
        gameFiles(page)
        mods(page, prefs)
        /* Controller focus on the first control once the page is laid out. */
        first.post { first.requestFocus() }
    }

    /** The downloaded game: check it against Steam, or delete it. */
    private fun gameFiles(page: LinearLayout) {
        val ctx = this
        page.addView(Screens.body(ctx, "Game files", topDp = 24).apply { textSize = 16f; setTextColor(getColor(R.color.text_primary)) })
        val about = Screens.body(ctx, "")
        page.addView(about)
        fun describe() {
            if (!java.io.File(GameFiles.root(ctx), io.github.aerithmetiq.crosscodebox.steam.GameDownload.WEB_ROOT).exists()) {
                about.text = "CrossCode is not downloaded."
                return
            }
            about.text = "Measuring…"
            Thread({
                val mib = GameFiles.gameBytes(ctx) / 1048576
                val build = GameFiles.installedBuild(ctx)
                runOnUiThread {
                    about.text = "CrossCode takes $mib MiB on this device" +
                        (if (build != null) ", build $build." else "; the download is not complete.") +
                        " Saves are kept apart and are not touched by either button."
                }
            }, "game-size").start()
        }
        describe()
        val verify = Screens.outlined(ctx, "Verify game files") {
            if (GameDownloadState.running) return@outlined
            /* The download checks every file against Steam's list and fetches what is missing or
             * different, so verifying is running it again. The launcher shows its progress. */
            GameDownloadService.start(ctx)
            finish()
        }
        val delete = Screens.outlined(ctx, "Delete game files") {
            if (GameDownloadState.running) {
                about.text = "A download is running. Cancel it on the launcher first."
                return@outlined
            }
            AlertDialog.Builder(ctx)
                .setTitle("Delete the game files?")
                .setMessage("This frees the storage CrossCode takes. Your saves, their backups and your settings stay. You can download the game again at any time.")
                .setPositiveButton("Delete") { _, _ ->
                    about.text = "Deleting…"
                    Thread({
                        GameFiles.deleteGame(ctx)
                        runOnUiThread { describe() }
                    }, "game-delete").start()
                }
                .setNegativeButton("Cancel", null)
                .show()
        }
        page.addView(Screens.row(ctx, 8, verify, delete))
    }

    /* CrossCodeBox: the mods section, see [Mods]. */
    private var modsStatus: android.widget.TextView? = null

    private val pickMod = registerForActivityResult(androidx.activity.result.contract.ActivityResultContracts.OpenDocument()) { uri ->
        if (uri == null) return@registerForActivityResult
        val name = contentResolver.query(uri, arrayOf(android.provider.OpenableColumns.DISPLAY_NAME), null, null, null)
            ?.use { c -> if (c.moveToFirst()) c.getString(0) else null } ?: "mod.zip"
        modsStatus?.text = "Adding $name…"
        Thread({
            val result = runCatching { Mods.install(this, uri, name) }
            runOnUiThread {
                modsStatus?.text = result.fold(
                    { "Added $it. It loads the next time the game starts with mods on. ${modsCount()}" },
                    { "Could not add $name: ${it.message}" },
                )
            }
        }, "mod-install").start()
    }

    override fun onResume() {
        super.onResume()
        /* Back from the mod browser: the count may have changed. */
        modsStatus?.text = modsCount()
    }

    private fun modsCount(): String = Mods.list(this).size.let { n ->
        if (n == 0) "No mods are installed." else "$n ${if (n == 1) "mod is" else "mods are"} installed."
    }

    private fun mods(page: LinearLayout, prefs: SharedPreferences) {
        val ctx = this
        page.addView(Screens.body(ctx, "Mods", topDp = 24).apply { textSize = 16f; setTextColor(getColor(R.color.text_primary)) })
        page.addView(CheckBox(ctx).apply {
            text = "Start the game with mods (CCLoader3)"
            textSize = 15f
            setTextColor(getColor(R.color.text_primary))
            buttonTintList = ColorStateList.valueOf(getColor(R.color.accent))
            isChecked = prefs.getBoolean(GameSettings.KEY_MODS, GameSettings.MODS_DEFAULT)
            setOnCheckedChangeListener { _, on -> prefs.edit().putBoolean(GameSettings.KEY_MODS, on).commit() }
        })
        page.addView(
            Screens.body(
                ctx,
                "Off by default. On: the game starts through CCLoader3, the community mod loader, which loads " +
                    "the mods you install here: from the mod browser (CCModDB, the community's mod list), or a " +
                    ".ccmod or .zip file you have. The game's own files are not changed, and " +
                    "\"Verify game files\" leaves your mods alone. Mods can change your saves, which then sync " +
                    "to Steam Cloud like any other; keep the backups in mind. Mods are made by other people: " +
                    "add only ones you trust. CCLoader3 adds a Mods tab to the game's options to switch mods.",
                topDp = 0,
            )
        )
        val status = Screens.body(ctx, modsCount())
        modsStatus = status
        page.addView(status)
        val browse = Screens.outlined(ctx, "Browse mods") { startActivity(android.content.Intent(ctx, ModBrowserActivity::class.java)) }
        val add = Screens.outlined(ctx, "Add a file") { pickMod.launch(arrayOf("*/*")) }
        val remove = Screens.outlined(ctx, "Remove a mod") {
            val names = Mods.list(ctx)
            if (names.isEmpty()) {
                status.text = "No mods are installed."
                return@outlined
            }
            AlertDialog.Builder(ctx)
                .setTitle("Remove which mod?")
                .setItems(names.toTypedArray()) { _, which ->
                    val name = names[which]
                    AlertDialog.Builder(ctx)
                        .setTitle("Remove $name?")
                        .setMessage("Its files are deleted from this device. Your saves stay.")
                        .setPositiveButton("Remove") { _, _ ->
                            status.text = if (Mods.remove(ctx, name)) "Removed $name. ${modsCount()}" else "Could not remove $name."
                        }
                        .setNegativeButton("Cancel", null)
                        .show()
                }
                .setNegativeButton("Cancel", null)
                .show()
        }
        page.addView(Screens.row(ctx, 8, browse, add, remove))
    }

    private fun showNotices() {
        val text = listOf("NOTICE.md", "LICENSE").joinToString("\n\n" + "-".repeat(60) + "\n\n") { name ->
            runCatching { assets.open(name).bufferedReader().use { it.readText() } }.getOrDefault("($name missing)")
        }
        AlertDialog.Builder(this)
            .setView(ScrollView(this).apply {
                val pad = Screens.dp(this@SettingsActivity, 20)
                setPadding(pad, pad, pad, 0)
                addView(Screens.mono(this@SettingsActivity, text))
            })
            .setPositiveButton("Close", null)
            .show()
    }

    private fun versionName(): String =
        runCatching { packageManager.getPackageInfo(packageName, 0).versionName }.getOrNull() ?: "?"
}
