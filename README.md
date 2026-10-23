# CrossCodeBox

Play **CrossCode** on Android. Sign in with Steam, download the copy your account owns, and keep your
save in step with **Steam Cloud**, so you can carry it between your PC and your handheld. Steam
achievements unlock as you play, and community mods are one menu away. Made for controller-first
handhelds and phones; tested on a Retroid Pocket Nova.

> **Unofficial fan project.** Not affiliated with or endorsed by Radical Fish Games or Valve. The app
> contains **no game files and no game art**: you need your own copy of CrossCode on Steam, and the
> game is downloaded from Steam to your device.

## Install

1. Download `CrossCodeBox-1.0.0.apk` from the [latest release](https://github.com/AerithMetiq/CrossCodeBox/releases/latest) and open it on
   the device (allow installs from your browser or file manager when Android asks).
2. Open CrossCodeBox and sign in to Steam: username and password (Steam Guard by app approval or
   code), or **Sign in with QR code** and scan it with the Steam Mobile app.
3. Press **DOWNLOAD**. The game takes about 840 MiB on the device; the download carries on in the
   background with a notification, and can be cancelled. The DLC your account owns (A New Home and the
   skins) comes with it.
4. Press **PLAY**.

Needs Android 8.0 or newer.

## How it works

CrossCode is a web game: HTML5 and JavaScript, shipped on PC inside NW.js. CrossCodeBox downloads only
the game's own files from Steam (its `assets/` folder; the rest of a Steam install is the desktop
runtime) and runs them in Android's WebView, with a small layer standing in for NW.js: it answers the
desktop calls the game makes (files, saves, quitting), serves the files, turns controllers into the
browser's Gamepad API, and adds the Android parts (pausing in the background, the frame-rate limit,
touch controls). Nothing is emulated, and the game's files are never changed.

## What it does

**Steam**
- Signs in with Steam Guard or a QR code that fits any screen, 4:3 included. Your password goes to
  Steam and is never stored; the login token Steam returns is kept encrypted with a key held in the
  Android Keystore.
- Shows your Steam name and avatar, with a green dot while Steam can be reached.
- Checks every downloaded file against Steam's checksums, and offers **UPDATE** when Steam has a newer
  build ("Update now" or "Play this version"). Settings can verify or delete the game files.
- **Achievements** (on by default, Settings → Steam): each one the game awards is unlocked on your
  Steam account, and the ones your save already holds are added the next time it loads. Earned
  offline, they go up once Steam can be reached. Nothing is ever removed.
- **Playing status** (off by default, Settings → Steam): shows you as playing CrossCode on Steam, and
  Steam counts the play time.
- **Steam diagnostics** (Settings): a read-only report of the game's depots, its Steam Cloud rules,
  your Cloud files and your achievements, which you can share. It leaves out your account name.

**Steam Cloud saves**
- PLAY first brings down your save if it is newer in Steam Cloud, then starts the game. Coming back
  from the game syncs again.
- **Uploads are off until you turn them on** (Settings → Steam Cloud saves). Until then your changes
  stay on the device and are counted under PLAY. "Check now" there shows what a sync would do, without
  doing it.
- The save is compared with the last version both sides agreed on, so only the side that changed
  wins. If both changed, you choose which to keep.
- Nothing is lost: a save about to be replaced on the device is copied to a backup first, and before
  an upload replaces the one in Steam Cloud, Steam's copy is kept on the device too. Settings → Steam
  Cloud saves → **Restore a backup** puts any of them back. The app never deletes a file from Steam
  Cloud.
- **Play offline** (under PLAY) skips Steam altogether. If Steam cannot be reached, the game starts
  with the save on the device.
- Under PLAY: when you last played, when the save was last in step with Steam Cloud, and whether it
  has changed since.

**Playing**
- Controllers work as they do on PC. **Back** (or B in the launcher) pauses the game and opens the
  side menu: touch controls on or off, hide them while a controller is in use, dynamic sticks (touch
  anywhere), an FPS / battery / temperature readout, a **frame-rate limit** (30, 45, 60, and 90 or 120
  on screens that have them), Troubleshoot and Exit. Holding a direction scrolls the menu.
- **Touch controls** for phones, with a layout editor and a transparency slider. Made for CrossCode:
  the touch stick always sprints (CrossCode walks below 80 % tilt), dash can be set to fire only on a
  fresh tap of L1/L2, and the controls step aside in cutscenes, conversations and Direct Links so a
  tap reaches the game.
- **Vibration** when the screen shakes, following the game's own Rumble Strength option.
- The game's settings are also in the launcher's Settings → Game, so you can set them before playing.

**Mods** (off by default, Settings → Mods)
- With mods on, CrossCode starts through [CCLoader3](https://github.com/CCDirectLink/CCLoader3), the
  community mod loader, which adds a Mods tab to the game's options.
- **Browse mods** lists the mods in [CCModDB](https://github.com/CCDirectLink/CCModDB), the
  community's mod database. Search, sort by popularity (GitHub stars), name, author or last update,
  either way round, and keep to one category or one author. Installing a mod also installs the mods it
  needs. Each download comes from the mod's own release page and is checked against the database's
  checksum.
- Show only installed mods, or only those with an update, and **Update all** at once.
- **Add a file** installs a `.ccmod` or `.zip` you already have; **Remove a mod** deletes one.
- Verifying the game files leaves your mods alone. Mods are made by other people and run with the
  game: install only ones you trust. They can change your save like the game does, and it syncs to
  Steam Cloud like any other; the backups are there if you need them.

**Launcher**
- Every control works with a D-pad and shows a clear focus ring. B goes back on every screen.
- Leaving with B returns to whatever opened the app: the home screen, or a frontend such as ES-DE.

## How it compares

### With AlabasterDawnBox

[AlabasterDawnBox](https://github.com/AerithMetiq/AlabasterDawnBox) is the same launcher for
Alabaster Dawn; CrossCodeBox is built from it, and the two are kept in step (`PARITY.md` lists every
feature in both). Everything above works the same in both, except:

- **Only in CrossCodeBox:** achievements that unlock (AlabasterDawnBox carries the same support, but
  Alabaster Dawn has no Steam achievements yet); the DLC your account owns is downloaded with the
  game; mods; the touch option that fires L1/L2 only on a fresh tap, for dashing; a fix that spaces
  CrossCode's pixel font right.
- **Only in AlabasterDawnBox:** a Resolution setting, and the shader fixes mobile GPUs need for
  Alabaster Dawn's lighting and fog (CrossCode draws on a 2D canvas and needs neither).
- **Different because the games differ:** vibration follows CrossCode's screen shakes, and Alabaster
  Dawn's controller rumble. Touch controls step aside in CrossCode's cutscenes, conversations and
  Direct Links, and in Alabaster Dawn's cutscenes. The touch stick always sprints by default here; in
  AlabasterDawnBox that option is off by default, because Alabaster Dawn moves by how far the stick is
  tilted.

### With alabaster-android

[alabaster-android](https://github.com/moronigranja/alabaster-android) runs Alabaster Dawn and
CrossCode in one app, from a copy of the game you copy to the device and pick with Android's file
picker. CrossCodeBox's game host and CrossCode shim are its code (from commit `f1cedd5`, see
`NOTICE.md`). On top of it, CrossCodeBox adds:

- **Steam:** sign-in, the download from Steam (with your DLC) with updates and verifying, Steam Cloud
  saves with backups and restore, achievements, and the playing status.
- **A launcher:** controller-first, with the game's settings before it starts, and Back returning to
  whatever opened the app.
- **Mods from the community's database:** browse, search and filter CCModDB, install a mod with the
  mods it needs, update all at once. CCLoader3 ships with the app.
- **Changes to the game host:**
  - On a device whose WebView is 32-bit (the Retroid Pocket Nova's), the game runs in the app's own
    64-bit process, which gives it the fast cores and the memory a 32-bit process cannot have.
  - Less work per frame: the side menu's settings are read twice a second instead of every frame,
    and the controller's state is parsed only when it changes.
  - Frame-rate limits of 30, 45, 60, 90 and 120 (alabaster-android: 20, 30, 40, 45, 60), only those
    the screen can show, with the screen's refresh rate picked to match. A limit the refresh rate
    does not divide (45 on 60 Hz) averages out instead of dropping to the next one down.
  - The side menu pauses the game and is driven by the controller; a held direction repeats.
  - Back opens the side menu on Android 13, where it did nothing.
  - Touch controls made for CrossCode: always sprint, dash on a fresh tap, a left side that mirrors
    the right, a transparency slider, a switch that removes the whole overlay, and hiding in
    cutscenes, conversations and Direct Links.
  - Vibration from the game's screen shakes, and the pixel font's letters spaced right.

alabaster-android has things this app does not (at the time of writing): one app for both games; it
runs a copy you put on the device yourself, with no Steam sign-in; its screens in Spanish and
Brazilian Portuguese; the community Spanish translation for CrossCode in one tap; switching a mod off
without removing it; home-screen shortcuts for each game; and a controller fix for the games' PC
builds.

## Performance

The **frame-rate limit** saves heat and battery. Above 60 fps the game does draw new frames, so 90 or
120 is smoother on a screen that has those modes, not wasted. Some devices, the Retroid Pocket Nova
among them, ship a 32-bit WebView, which starves the game of CPU and memory; the app detects that and
runs the game in its own 64-bit process instead, and Troubleshoot's record says which happened.

## Where things are

The game, your save, its backups and your mods are in
`Android/data/io.github.aerithmetiq.crosscodebox/files/CrossCode/` (the save is
`userdata/Default/cc.save`, mods are in `assets/mods/`). You can reach that folder over USB.
**Uninstalling deletes it**, so turn uploads on and sync, or copy the save, before you uninstall.

## Troubleshooting

- **The game does not start or looks wrong:** in the game, Back → Troubleshoot shows a record of the
  start (device, WebView, errors) and can share it. With mods on, try once with mods off.
- **Steam problems:** Settings → Steam diagnostics. The report holds no account name, so it can be
  shared as it is.
- **"Couldn't reach Steam":** you can still play with the save on the device; it syncs, and earned
  achievements go up, the next time Steam answers.

## Building

Requirements: Android Studio, or the Android SDK with platform 36, and JDK 17 or newer.

```sh
./gradlew :app:assembleDebug        # APK at app/build/outputs/apk/debug/app-debug.apk
./gradlew :app:testDebugUnitTest    # unit tests
./gradlew :app:assembleRelease      # signed when keystore.properties names a key (see below)
```

Release builds are signed with the key that `keystore.properties` at the repository root names
(`storeFile`, `storePassword`, `keyAlias`, `keyPassword`); the file is never committed, and without it
the release APK is unsigned. A debug build and a release build cannot be installed over each other.
CrossCodeBox shares most of its code with AlabasterDawnBox, the same launcher for Alabaster Dawn;
`tools/parity.py` compares the two when both repositories are checked out side by side.

## Credits

- **Written by Claude** (Anthropic's AI model, Claude Opus 5.5). **Reviewed and tested by
  AerithMetiq.** Commits name Claude as the author.
- [RadicalFish Ports / alabaster-android](https://github.com/moronigranja/alabaster-android) by Moroni
  Granja (MIT): the research and the code that run these games in an Android WebView, CrossCode's shim
  included. The game host in this app is its code; see `NOTICE.md`.
- [CCLoader3](https://github.com/CCDirectLink/CCLoader3), shipped unchanged, and
  [CCModDB](https://github.com/CCDirectLink/CCModDB), by the CCDirectLink community.
- [CrossDroid](https://github.com/dain98/CrossDroid) by dain98: the launcher whose look and flow this
  follows. None of its code or art is used.
- [JavaSteam](https://github.com/Longi94/JavaSteam): the Steam client library.
- **CrossCode** © [Radical Fish Games](https://www.radicalfishgames.com/). Go buy it.

## License

MIT, see `LICENSE`. Third-party notices are in `NOTICE.md`.
