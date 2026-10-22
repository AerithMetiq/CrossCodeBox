# CLAUDE.md

Guidance for Claude Code working in this repository. Read it before changing anything.

## What this is

**CrossCodeBox**: an unofficial Android launcher that plays **CrossCode** (Radical Fish Games, Steam app
**368340**) on Android. The user signs in to Steam, the app downloads the copy their account owns (only
the web game, `assets/`), runs it in a WebView with a compatibility layer in place of NW.js, and syncs
saves with Steam Cloud. Built for controller-first handhelds (the maintainer's **Retroid Pocket Nova**)
and phones.

Package / applicationId: `io.github.aerithmetiq.crosscodebox`. MIT licensed. **Public** repository:
`AerithMetiq/CrossCodeBox`.

It was created on 2026-10-21 from **AlabasterDawnBox** (the same launcher for Alabaster Dawn: local
`~/AlabasterDroid`, private repo `AerithMetiq/AlabasterDawnBox`), whose code is copied here without its
history. It keeps the look and flow of CrossDroid (dain98's CrossCode launcher) but none of its code or
art (hard rule 2). The game host is alabaster-android's, which already had a CrossCode profile.

## Who does what

- **Claude writes the code; AerithMetiq reviews and tests it** on real devices. AerithMetiq is not an
  Android developer: give exact, copy-pasteable steps, one thing at a time, and say what output to
  expect. Claude can also build, install and test on the Nova over wireless adb.
- **Commit attribution:** Claude is the commit author: `Claude <noreply@anthropic.com>`. A
  `Reviewed-by:` trailer may be added at AerithMetiq's request.
- **Never push, force-push, rewrite published history or publish a release** unless AerithMetiq asks for
  that specific action in the session. The repository is public: everything pushed is published.

## Hard rules

1. **No game files or game art in the repo or APK.** No CrossCode art, audio, data, code or fonts, from any
   source. The launcher's backdrop is read at runtime from the user's downloaded copy
   (`TheGame.titleBackground`); the icon and the "CROSSCODE / BOX" wordmark are original.
2. **No CrossDroid code.** CrossCodeBox contains none of CrossDroid's code or art and must stay that
   way. Do not read, copy or adapt CrossDroid's source (github.com/dain98/CrossDroid, and the local
   `~/CrossDroid`, which is AerithMetiq's old fork of it) or its art. Its **look and flow** are recreated from
   screenshots of the running app (installed on the Nova as `de.radicalfishgames.crosscode`), never
   from its layouts or code. `NOTICE.md` credits the design only.
3. **alabaster-android** (github.com/moronigranja/alabaster-android, commit `f1cedd5`) is MIT, © 2026
   Moroni Granja. Every reused file keeps its notice and is listed in `NOTICE.md`: `host/` and
   `assets/cc-shim.js`.
4. **Secrets stay secret.** Never log or display the Steam password, refresh token or Steam Guard data.
   Diagnostic reports leave out the account name and Steam Cloud machine names.
5. **Read-only by default against Steam.** Anything that writes to Steam (Cloud uploads, playing status)
   must be deliberate, and testable first in a dry-run or diagnostics form. **Exception, AerithMetiq's
   call (2026-10-21): achievements are on by default**, since they only add what the game awarded.

## Keeping the two apps in step

Most files are the same as AlabasterDawnBox's apart from the package name, so a fix in one usually
belongs in the other. What differs here, deliberately:

- `TheGame.kt`: CrossCode's facts (Steam app, host profile, install folder `CrossCode`, title art).
- `steam/GameDownload.kt`: `WEB_ROOT = "assets"`, `ENTRY = "assets/node-webkit.html"` (`webPrefix`
  instead of `terraPrefix`).
- `GameFiles.kt`: the saves folder Steam Cloud mirrors is `userdata/Default` (CrossCode writes
  `Default/cc.save`); no title-name image (the wordmark stays).
- `assets/cc-shim.js` instead of `ada-shim.js`, with the same three changes AlabasterDawnBox made to its
  shim (settings read every 30th poll, running-deadline frame gate, pad JSON parsed only on change).
- Settings has no Resolution button (that one sets the terra engine's stored option).
- Look: cyan accent `#40C4FF`, "CROSSCODE / BOX" wordmark, original icon; `Screens.accentStatusBar`.
- The diagnostics probe CrossCode only.

## Status

| Milestone | Scope | State |
|---|---|---|
| 1 | Launcher, sign-in, download of `assets/`, the host with `cc-shim.js` | **runs on the Nova** (2026-10-21): download 697 MiB / 4 722 files in 70 s from depot 368341 (the Windows depot; the shared 916190 does not hold the entry page), boot to the title screen with no missing files, `platform=Desktop`, canvas 1136x640, canvas 2D (`gl=none`). Gameplay, audio and pad mapping not yet tried |
| 2 | Steam Cloud saves for `cc.save` | mapping set 2026-10-21 from the Nova's diagnostics (see CrossCode facts). "Check now" listed `cc.save: would DOWNLOAD`; PLAY then downloaded it (checksum matched). Upload not yet run (off by default) |
| 3 | Steam achievements | written 2026-10-21, unit-tested, **not yet run on a device**. See Achievements below |
| - | Match CrossDroid's look | from screenshots of the running CrossDroid on the Nova (hard rule 2) |

## CrossCode facts (from alabaster-android's README and host profile)

- Entry page `assets/node-webkit.html`, engine Cubic Impact 0.5 on canvas 2D: none of the shader
  rewrites apply (`GameProfile.CROSSCODE.rewrites = false`). The shim needs `window.require` **and**
  `window.process` as an object (that pair selects the engine's desktop path) and stubs greenworks.
- alabaster-android booted Steam build 1.0.0 (`v1.4.2-4`) to the title screen at 60 fps on a Galaxy Z
  Fold 7 and saw it write `Default/cc.save`. Still open there: audio, in-game pad mapping, heavier
  scenes' GPU cost, and saves round-tripping to a desktop.
- Saves: the engine writes `<dataPath>/cc.save` with `dataPath = /saves/Default`, so `userdata/Default/
  cc.save` here. Desktop: `~/.config/CrossCode/Default/cc.save` on Linux; `%LOCALAPPDATA%\CrossCode` on
  Windows (the game also looks inside its `User Data\Default`).
- Depots (Nova's diagnostics, 2026-10-21, public build 20004663): 916190 `os=any` 333.0 MiB (shared),
  368341/368345/368349 Windows (~955-975 MiB), 368342/368343 Linux 32/64 (1.14 GiB), 368344 macOS,
  368346-368348 with no public manifest, Steamworks redist (228987, 228990) and DLC depots (960310,
  1517030, 1585790 and their macOS twins). Branches besides `public`: `nwjs_old` ("Might crash less
  often."), `speedrunner`, `aprilfools2016`. The downloader does not assume a depot: it reads manifests
  until one lists `assets/node-webkit.html`.
- **Steam Cloud** (`ufs`): quota 100 MB, at most **5** files, one rule: root `WinAppDataLocal`, path `.`,
  pattern `cc.sav*`. Root overrides put it in `%LOCALAPPDATA%\CrossCode` (Windows),
  `MacAppSupport/CrossCode/Default` (macOS) and `~/.config/CrossCode/Default` (Linux). Cloud names carry
  the token themselves, with no path prefix: `%WinAppDataLocal%cc.save` (AerithMetiq's Cloud held just
  that file, 129.3 KiB). `CloudSaves` maps `%WinAppDataLocal%<name>` to `userdata/Default/<name>` and
  syncs only top-level `cc.sav*` files (`CloudSaves.isSaveName`).

## Achievements

- CrossCode reports achievements through greenworks. `cc-shim.js` reports NW.js 0.86.0, so the engine
  computes `ig.nwjsVersion[1]` = 8600 and loads the shim's greenworks object as its NW.js 0.35+ build;
  `ig.greenworks.isActive()` is then true. The game calls `activateAchievement(steamName)` when a trophy
  triggers, and for every trophy the save holds each time global data loads (so a boot re-reports
  them all: that is the catch-up path). The shim passes the name to `PortBridge.unlockAchievement`;
  `clearAchievement` stays a no-op (nothing is ever removed from Steam).
- `GameActivity` hands the name to `AchievementService` (launcher process, which holds the login). It
  queues names in `achievements-queue.txt`, waits 3 s after the last one, opens a
  `Purpose.ACHIEVEMENTS` session and calls `SteamAchievements.unlock`: `getUserStats` (JavaSteam) for
  the schema, stat values and `crc_stats`; `Achievements.toStore` sets only the missing bits; the
  change goes as `ClientStoreUserStats2` (JavaSteam cannot store stats, so the message is built here)
  and the `ClientStoreUserStatsResponse` is caught by a small `ClientMsgHandler`. Then the stats are
  read again and every name must show as unlocked. A failure keeps the queue; the launcher's
  `onResume` retries.
- **Writes to Steam**: **on by default** at AerithMetiq's request (`GameFiles.steamAchievements`,
  Settings → Steam turns it off). With it off the service drops the names; the record still shows
  `achievement awarded: …` lines. The dry run is
  Settings → Steam diagnostics, which lists every achievement and whether Steam has it.
- Unknown: whether Steam accepts a stats change from a session that is not "in game" (no
  `notifyGamesPlayed`). If the store is refused, try it in the playing-status session.

## Build and test

```sh
./gradlew :app:assembleDebug        # app/build/outputs/apk/debug/app-debug.apk
./gradlew :app:testDebugUnitTest    # JVM unit tests
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb logcat -s CrossCodeBox RfPort   # the app's and the host's log tags
```

Keep pure logic in small Android-free functions with unit tests. Code that needs a device or Steam must
be described as untested until it has run on one.

## Environment

- AerithMetiq's PC: **Bazzite (KDE)**, an immutable Fedora. Install CLI tools with Homebrew (`brew`), not
  `dnf`. Android Studio is the **Flathub** build (sandboxed); its Gradle JDK is set to 21.
- Devices are reached with **adb over Wi-Fi** (wireless debugging). If adb reports more than one device,
  use `adb -s <serial>` or `export ANDROID_SERIAL=<serial>`.
- The Nova's screen has **60 Hz and 120 Hz modes** (`dumpsys display`); which one is active is a
  system setting.
- The **Retroid Pocket Nova** (Android 13, Adreno 740, 1280x960 4:3 screen) ships the AOSP WebView
  `com.android.webview` **109** and it cannot be updated or switched (checked 2026-10-12).
  alabaster-android was measured on WebView 153, so anything the host needs must work on 109. The 16:9
  game fills a 1280x720 strip of that screen. Its WebView is also **32-bit**, which cripples the
  game unless the page runs in the app's own 64-bit process, which `InProcessRenderer` arranges
  (measured with Alabaster Dawn in AlabasterDawnBox's CLAUDE.md, Performance).
- Toolchain: AGP 8.13.2, Kotlin 2.2.10, Gradle 8.14.3, compileSdk/targetSdk 36, minSdk 26, Java 17 target.
  targetSdk 36 means edge-to-edge on Android 15+: screens use `fitsSystemWindows` and
  `Screens.accentStatusBar`.

## Steam / JavaSteam notes

- JavaSteam **1.8.0** (`in.dragonbra:javasteam`) plus `org.bouncycastle:bcprov-jdk18on` (required on
  Android; the platform's BC provider is stripped). If code builds JavaSteam protobuf messages directly,
  add `com.google.protobuf:protobuf-java` at the version JavaSteam uses (4.31.1 for 1.8.0); JavaSteam
  keeps it as an implementation dependency, so it is not on the app's compile classpath otherwise.
- The game download does **not** use JavaSteam's separate depot downloader artifact: in 1.8.0 its file
  filter is not wired up (`usingFileList` is never set), so it can only fetch whole depots, and it
  swallows chunk errors. `GameDownloader` calls the core API instead (`SteamApps.getDepotDecryptionKey`,
  `SteamContent.getManifestRequestCode` / `getServersForSteamPipe`, `cdn.Client`, `DepotChunk.process`)
  and downloads only the files under `assets/`. Revisit if a later JavaSteam adds a working filter.
- **Download speed** (designed and measured in AlabasterDawnBox, 2026-10-21): a web game is thousands of
  small files, so a download is mostly waiting for answers. `GameDownloader` keeps `CONNECTIONS` (16)
  chunk requests in flight across all files, to the 3 least loaded servers (a server that fails a
  request goes to the back of the list), and interleaves big and small files
  (`GameDownload.interleaveBySize`). The download session's `SteamClient` gets an OkHttp client sized
  for that (`SteamSession`); JavaSteam's default allows 5 requests per host. A failed request is tried
  again on another server after a pause that doubles (0.5 s to 8 s, 8 attempts). A run logs the
  servers it uses and `download: N files, X MiB fetched in S s` (`adb logcat -s CrossCodeBox`). With
  Alabaster Dawn (341 MiB) on the Nova this took 88 s against about 4 min 53 s before.
- `com.squareup.okhttp3:okhttp` is `compileOnly` (5.3.2, the version JavaSteam brings) for that client.
- `com.google.protobuf:protobuf-java` is `compileOnly` (4.31.1): `SteamCloudFiles` reads a protobuf
  enum (a Cloud file's persist state; only `Persisted` files count as existing).
- JavaSteam leaves the chunk decompressors to the app (`compileOnly`): `com.github.luben:zstd-jni` (the
  `@aar`, for Android's native libraries) and `org.tukaani:xz`. Without them chunks fail to unpack.
  `SteamContent` returns coroutine `Deferred`s, so `kotlinx-coroutines-core` is a direct dependency.
- A finished download leaves `installed.txt` (depot, manifest, build id) in `GameFiles.root`;
  `GameFiles.installed` needs it. Compare its manifest id with PICS to detect a game update.
- `SteamSession` is blocking; drive it from a worker thread and close it from any thread to cancel.
  `IOException` = Steam unreachable (keep the login, allow offline play); `LoginRejectedException` = the
  login is invalid (clear it, ask to sign in again).
- A QR sign-in must be scanned within about a minute or Steam drops the connection.
- Use a non-zero `loginID` on logon so a Steam client on the same network is not kicked off.

## UI conventions

- **The status bar is the accent colour with dark icons on every launcher screen**: call
  `Screens.accentStatusBar(this)` after `setContentView`. It lays the window out edge to edge and draws
  an accent-coloured strip the height of the status bar, because Android 15+ ignores `statusBarColor`.
- Match the launcher: dark gradient (`launcher_bg`), one accent colour (`@color/accent`, cyan),
  `text_primary` / `text_secondary`, the serif "CROSSCODE / BOX" wordmark.
- **Controller-first:** every control focusable, with the white focus ring; give each screen a sensible
  initial focus.
- Landscape-first, but nothing may clip on 4:3 handhelds or phones.
- UI text is plain and direct; say what happened and what to do next.
