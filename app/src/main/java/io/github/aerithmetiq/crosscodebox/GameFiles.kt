package io.github.aerithmetiq.crosscodebox

import android.content.Context
import io.github.aerithmetiq.crosscodebox.steam.GameDownload
import io.github.aerithmetiq.crosscodebox.steam.GameDownload.WEB_ROOT
import java.io.File

/**
 * Where the downloaded game lives: the app's own external files folder, so it can also be reached
 * over USB (Android/data/io.github.aerithmetiq.crosscodebox/files/CrossCode) without any storage
 * permission. Only the web game (`assets/`) is kept; the desktop runtime around it is not needed.
 */
object GameFiles {

    fun root(context: Context): File =
        File(context.getExternalFilesDir(null) ?: context.filesDir, TheGame.FOLDER)

    /**
     * Installed means a download ran to the end (it leaves [GameDownload.MARKER]) and the engine's entry
     * page is there. A download that was interrupted is not installed; PLAY carries it on.
     */
    fun installed(context: Context): Boolean =
        File(root(context), GameDownload.MARKER).isFile && File(root(context), GameDownload.ENTRY).isFile

    /** The Steam build id of the installed game, from the marker; null when unknown or not installed. */
    fun installedBuild(context: Context): String? =
        runCatching { GameDownload.parseMarker(File(root(context), GameDownload.MARKER).readText())["build"] }.getOrNull()

    /** How much storage the game's files take, in bytes (walks the folder; call off the main thread). */
    fun gameBytes(context: Context): Long =
        File(root(context), WEB_ROOT).walkTopDown().filter { it.isFile }.sumOf { it.length() }

    /** Deletes the downloaded game. Saves, their backups and the settings are kept. */
    fun deleteGame(context: Context) {
        File(root(context), GameDownload.MARKER).delete()
        File(root(context), WEB_ROOT).deleteRecursively()
    }

    /*
     * The game's own title-screen art, drawn on the launcher once the game is downloaded. It is read
     * from the user's copy at runtime and never bundled; a build of the game that moves a file simply
     * gets the launcher's own look for that part.
     */

    /** The backdrop, behind the whole launcher. */
    fun titleBackground(context: Context): File? =
        File(root(context), TheGame.titleBackground).takeIf { it.isFile }

    /**
     * The game's name as its title screen draws it, in place of the launcher's own wordmark. CrossCode
     * draws its logo from an atlas rather than one picture, so the wordmark stays.
     */
    @Suppress("UNUSED_PARAMETER")
    fun titleName(context: Context): File? = null

    /*
     * Saves. The host gives the engine `userdata/` as its save root and CrossCode writes `Default/cc.save`
     * under it (its desktop folder is `~/.config/CrossCode/Default`), so the folder Steam Cloud mirrors is
     * `userdata/Default/`. Everything the sync keeps for itself is outside it, and outside `assets/`,
     * which the downloader cleans.
     */

    fun saves(context: Context): File = File(root(context), "userdata/Default")

    /** The checksums of the last sync (see steam/CloudSaves). */
    fun syncBase(context: Context): File = File(root(context), "cloud-sync.txt")

    /** Local saves a sync replaced or removed, a folder per sync, newest few kept. */
    fun saveBackups(context: Context): File = File(root(context), "SaveBackups")

    /**
     * Whether this device's saves are uploaded to Steam Cloud. Off until the user turns it on in
     * Settings: writing to Steam is deliberate. Downloads do not depend on it.
     */
    fun cloudUploads(context: Context): Boolean = prefs(context).getBoolean(KEY_UPLOADS, false)

    fun setCloudUploads(context: Context, on: Boolean) = prefs(context).edit().putBoolean(KEY_UPLOADS, on).apply()

    /**
     * Whether Steam shows the account as playing CrossCode while the game runs. Off until the
     * user turns it on in Settings: it writes to Steam (friends see it, play time is counted).
     */
    fun playingStatus(context: Context): Boolean = prefs(context).getBoolean(KEY_PLAYING, false)

    fun setPlayingStatus(context: Context, on: Boolean) = prefs(context).edit().putBoolean(KEY_PLAYING, on).apply()

    /**
     * Whether the game's achievements are unlocked on Steam as it awards them. It writes to Steam, but
     * is **on** until the user turns it off in Settings: AerithMetiq's call (2026-10-21), since it only
     * ever adds what the game itself awarded.
     */
    fun steamAchievements(context: Context): Boolean = prefs(context).getBoolean(KEY_ACHIEVEMENTS, true)

    fun setSteamAchievements(context: Context, on: Boolean) = prefs(context).edit().putBoolean(KEY_ACHIEVEMENTS, on).apply()

    /** Achievements the game awarded that Steam does not have yet, one name per line (see AchievementService). */
    fun achievementQueue(context: Context): File = File(root(context), "achievements-queue.txt")

    /** The public build id Steam last reported, kept so an update is still offered when offline. */
    fun steamBuild(context: Context): String? = prefs(context).getString(KEY_STEAM_BUILD, null)

    fun setSteamBuild(context: Context, build: String) = prefs(context).edit().putString(KEY_STEAM_BUILD, build).apply()

    fun updateAvailable(context: Context): Boolean =
        installed(context) && GameDownload.updateAvailable(installedBuild(context), steamBuild(context))

    /** When the last save sync that reached Steam finished, in epoch milliseconds; 0 for never. */
    fun lastSync(context: Context): Long = prefs(context).getLong(KEY_LAST_SYNC, 0)

    fun setLastSync(context: Context, at: Long) = prefs(context).edit().putLong(KEY_LAST_SYNC, at).apply()

    private fun prefs(context: Context) = context.getSharedPreferences("launcher", Context.MODE_PRIVATE)

    private const val KEY_UPLOADS = "cloudUploads"
    private const val KEY_PLAYING = "playingStatus"
    private const val KEY_ACHIEVEMENTS = "steamAchievements"
    private const val KEY_STEAM_BUILD = "steamBuild"
    private const val KEY_LAST_SYNC = "lastSync"
}
