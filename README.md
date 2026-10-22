# CrossCodeBox

Play **CrossCode** on Android: sign in with Steam, download the copy you own, and keep your saves in
sync with **Steam Cloud**, so you can switch between PC and handheld. Built for controller-first
handhelds (tested on a Retroid Pocket Nova) and phones.

> **Unofficial fan project.** Not affiliated with or endorsed by Radical Fish Games or Valve. It ships
> **no game files and no game art**: you need your own copy of CrossCode on Steam.

## How it works

CrossCode is a web game: HTML5 and JavaScript, shipped on PC inside NW.js (Chromium plus Node.js).
CrossCodeBox downloads the game's own files from Steam (only its `assets/` folder; the rest of a Steam
install is the desktop runtime) and runs them in Android's built-in browser engine, the WebView, with a
small compatibility layer in place of NW.js: a shim that answers the desktop calls the game makes
(files, saves, quitting), a local file server, controllers turned into the browser's Gamepad API, and
the Android glue (pausing in the background, frame-rate limit, touch controls). Nothing is emulated, and
the game's files are never modified.

## Status

CrossCodeBox is new (October 2026). It is built from
[AlabasterDawnBox](https://github.com/AerithMetiq/AlabasterDawnBox), the same launcher for Alabaster
Dawn, and runs CrossCode with the game host from
[alabaster-android](https://github.com/moronigranja/alabaster-android), which has booted CrossCode to its
title screen on a phone.

| Milestone | What it adds | State |
|---|---|---|
| 1 | Launcher, Steam sign-in, download from Steam, the game host with CrossCode's shim | written, not yet run on a device |
| 2 | Steam Cloud saves for CrossCode's `cc.save` | waiting for CrossCode's Steam Cloud layout |
| 3 | Steam achievements | planned |

## What it does

- **Sign in with Steam**: username and password (with Steam Guard by app approval or code), or a QR code
  you scan with the Steam Mobile app.
- **Your login stays private**: the password is passed to Steam and never stored. The refresh token
  Steam returns is encrypted with a key kept in the Android Keystore.
- **Download from Steam** in the background with a notification, updates when Steam has a newer
  build, and verify or delete from Settings.
- **In-game menu** (Back): pauses the game; controller navigation; touch controls on or off; FPS
  readout; frame-rate limit (30/45/60, plus 90/120 on screens that have them).
- **Touch controls for CrossCode** (Settings → Game): always sprint with the touch stick, dash only on
  a fresh tap of L1/L2, and vibration when the screen shakes (following the game's Rumble Strength).
- **Steam achievements**, unlocked as the game awards them (on by default; Settings → Steam).
- **Controller-first launcher**: every control is reachable with a D-pad, with a clear focus ring.
- **Playing status** (optional, off by default): show as playing CrossCode on Steam.
- **Steam diagnostics** (Settings): a read-only report of CrossCode's depots, Steam Cloud rules and your
  Cloud files. It changes nothing on Steam.

## Building

Requirements: Android Studio (or the Android SDK with platform 36) and JDK 17 or newer.

```sh
./gradlew :app:assembleDebug        # APK at app/build/outputs/apk/debug/app-debug.apk
./gradlew :app:testDebugUnitTest    # unit tests
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

## Credits

- **Written by Claude** (Anthropic's AI model, Claude Opus 5.5). **Reviewed and tested by
  AerithMetiq.** Commits name Claude as the author.
- [RadicalFish Ports / alabaster-android](https://github.com/moronigranja/alabaster-android) by Moroni
  Granja (MIT): the research and the code that run these games in an Android WebView, CrossCode's shim
  included. The game host in this app is its code; see `NOTICE.md`.
- [CrossDroid](https://github.com/dain98/CrossDroid) by dain98: the launcher whose look and flow this
  follows. None of its code or art is used; see `NOTICE.md`.
- [JavaSteam](https://github.com/Longi94/JavaSteam): the Steam client library.
- **CrossCode** © [Radical Fish Games](https://www.radicalfishgames.com/). Go buy it.

## License

MIT, see `LICENSE`. Third-party notices are in `NOTICE.md`.
