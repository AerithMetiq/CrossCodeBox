package io.github.aerithmetiq.crosscodebox

import io.github.aerithmetiq.crosscodebox.host.GameProfile
import io.github.aerithmetiq.crosscodebox.steam.SteamGame

/**
 * The one game this launcher plays: CrossCode (Radical Fish Games, Steam app 368340). The launcher,
 * the download, the Steam Cloud sync and the game host all take the game's facts from here.
 *
 * CrossCode is a web game in an NW.js desktop runtime. Only its web game, the `assets/` folder of the
 * Steam install, is downloaded; the host (from alabaster-android, profile [GameProfile.CROSSCODE])
 * runs it in Android's WebView with `cc-shim.js` standing in for NW.js.
 */
object TheGame {

    val steam = SteamGame.CROSSCODE
    val host = GameProfile.CROSSCODE

    /** The game's name, as the launcher writes it. */
    val name: String get() = steam.displayName

    /** The folder, under the app's external files folder, that holds the download and the saves. */
    const val FOLDER = "CrossCode"

    /** The title-screen backdrop, read from the downloaded copy and drawn behind the launcher. */
    val titleBackground: String get() = host.artPath
}
