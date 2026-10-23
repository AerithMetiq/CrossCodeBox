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
- Look, matched to the running CrossDroid (screenshots, 2026-10-21): cyan accent `#40C4FF`, a dark navy
  status bar with light icons (`Screens.statusBar`, `@color/status_bar`), the game's `title-bg.png`
  behind the launcher, the game's logo (the top band of `media/gui/title-logo-new.png`, cropped and
  its black made see-through at runtime by `TitleArt`) in place of the "CROSSCODE / BOX" wordmark,
  the "STEAM CLOUD LAUNCHER" line in cyan, and a green dot before "Signed in as" while Steam answers.
  Both pictures are drawn without smoothing. The original icon stays.
- The diagnostics probe CrossCode only (achievements included, as in AlabasterDawnBox).
- Mods (`Mods.kt`, CCLoader3): CrossCode only; Alabaster Dawn has no mod loader. `PARITY.md` lists
  every feature and where it stands in each app.
- **`python3 tools/parity.py`** (2026-10-22, the same file in both repositories) compares every file
  under `app/src` with the other app's, the names that differ by design replaced, and fails on any
  difference not recorded in `PARITY.lock.json` (a reason and a fingerprint per file; also the files
  only one app has). Run it after a change; carry the change over, or run `--accept` (writes both
  repositories' lock) and replace the TODO reason. It needs both repositories checked out side by side,
  so it is not part of CI.
- **CI** (`.github/workflows/tests.yml`, 2026-10-22): unit tests and a debug build on every push and pull
  request (JDK 21 on ubuntu-latest). Not yet run: it starts with the first push after it.

## Status

| Milestone | Scope | State |
|---|---|---|
| 1 | Launcher, sign-in, download of `assets/`, the host with `cc-shim.js` | **runs on the Nova** (2026-10-21): download 697 MiB / 4 722 files in 70 s from depot 368341 (the Windows depot; the shared 916190 does not hold the entry page), boot to the title screen with no missing files, `platform=Desktop`, canvas 1136x640, canvas 2D (`gl=none`). Gameplay, audio and pad mapping not yet tried |
| 2 | Steam Cloud saves for `cc.save` | mapping set 2026-10-21 from the Nova's diagnostics (see CrossCode facts). "Check now" listed `cc.save: would DOWNLOAD`; PLAY then downloaded it (checksum matched). **Upload confirmed on the Nova** (2026-10-21): with uploads switched on for the test, PLAY uploaded 3 files (`cc.save`, `.backup`, `.backup2`), first keeping the Cloud's previous `cc.save` (132 429 bytes, from 2026-10-13) in `SaveBackups/<stamp>-steam`; the sync after the game found nothing left to do. Uploads were switched back off (AerithMetiq's setting) |
| 3 | Steam achievements | on the Nova (2026-10-21): the read works ("1 of 86 unlocked on Steam"), and at boot the game reported the save's one trophy, which Steam already had, so nothing was stored. The store works too: after the Rhombus Square trophy Steam had 2 of 86, and AerithMetiq saw it on Steam (2026-10-21). See Achievements below |
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
- **DLC and the depots for every platform** (`GameDownload.extras`, 2026-10-21): after the main depot,
  every other depot of the app with a public manifest and no `oslist` is added, DLC included, and
  their files under `assets/` are merged in (an added depot's file replaces the main one's at the same
  path; `GameDownload.merge`). A depot Steam refuses a key for (DLC not owned) is left out and logged.
  `installed.txt` lists them as `extra=<depot>:<manifest>,…`. The game needs no ownership check of its
  own: it enables every folder in `assets/extension/` that holds its `<name>.json`. The base depot
  carries the four free bonus extensions (`fish-gear`, `flying-hedgehag`, `scorpion-robo`,
  `snowman-tank`). On AerithMetiq's account (Nova, "Verify game files"): 960310 (6 files) and 1517030
  (200 files, 39 MiB) added `post-game` ("A New Home") and `ninja-skin`, and the game then listed
  both as enabled (`ig.extensions.getExtensionList()`); 1585790 was refused (DLC not owned), and so was
  916190 (`AccessDenied`, though it names no DLC; what it holds is unknown).
- **Steam Cloud** (`ufs`): quota 100 MB, at most **5** files, one rule: root `WinAppDataLocal`, path `.`,
  pattern `cc.sav*`. Root overrides put it in `%LOCALAPPDATA%\CrossCode` (Windows),
  `MacAppSupport/CrossCode/Default` (macOS) and `~/.config/CrossCode/Default` (Linux). Cloud names carry
  the token themselves, with no path prefix: `%WinAppDataLocal%cc.save` (AerithMetiq's Cloud held just
  that file, 129.3 KiB). `CloudSaves` maps `%WinAppDataLocal%<name>` to `userdata/Default/<name>` and
  syncs only top-level `cc.sav*` files (`CloudSaves.isSaveName`).

## Touch and vibration options (CrossDroid's, rebuilt 2026-10-21)

Settings → Game, read when the game starts (`GameSettings.KEY_ALWAYS_SPRINT`, `KEY_DASH_ON_TAP`,
`KEY_VIBRATE`; defaults on/off/on, as in AerithMetiq's CrossDroid). From the game's code:

- **Always sprint** (`OnScreenPadModel.alwaysSprint`): CrossCode sets the walk speed from the left
  stick's tilt `f` as `f > 0.8 ? 1 : f² / 0.64`, so the touch stick reports full tilt, in its
  direction, whenever it is out of its dead zone. Physical sticks are untouched.
- **Dash only on a fresh tap** (`OnScreenPadModel.dashOnTap`): dash is a *press* of L1, or L2 with the
  game's "gamepad-dash" option (`_getDashButton`). Our pad never presses a button a finger slides onto
  (each finger belongs to what it first touched), so CrossDroid's "swiped into the dash area" case
  cannot happen; what the option stops is a finger sliding off L1/L2 and back, which re-presses it.
- **Vibrate when the screen shakes**: every shake goes through `ig.rumble.addRumble(handle)`, whose
  `power` (0.5-15) already follows the game's Rumble Strength option and whose `_duration` is in
  seconds (-1 until stopped). `cc-shim.js` (`hookRumble`) wraps it once `ig.rumble` exists and calls
  `PortBridge.vibrate`; `host/ShakeVibrator.kt` maps it (`Shake.of`: length capped at 600 ms, an
  open-ended shake is one 150 ms pulse, amplitude power/10) and vibrates as game media, not touch
  feedback. Verified on the Nova by firing a test shake over CDP at the title screen: 300 ms, finished,
  `Usage=MEDIA`. AerithMetiq reports that always sprint works (2026-10-21); dash-on-tap has not been
  tried in play yet.
- **Hide the touch controls in cutscenes, conversations and Direct Links** (`KEY_HIDE_IN_SCENES`, on
  by default): `cc-shim.js` (`watchScenes`) checks `sc.model.isCutscene()`, `sc.message.blocking` (a
  dialogue or choice waiting for the player) and `sc.message.isSideMessageVisible()` (Direct Links)
  four times a second and calls `PortBridge.gameScene` when the answer changes; `OnScreenPadView.
  sceneHides` then hides the controls and the pill row (not while the editor is open) and stops
  consuming touches, so a tap reaches the game, which advances text and picks choices on a tap.
- **Touch controls transparency** (`KEY_TOUCH_TRANSPARENCY`, 0-100, default 0): the whole overlay's
  alpha (`OnScreenPadView.transparency`); at 100 it is invisible and still works. A slider in
  Settings → Game.
- AerithMetiq confirmed both working on the Nova (2026-10-21), with touch controls turned on for the
  test (they normally play with them off).
- **A held direction repeats in the side menu** (`GameActivity.holdMenuDirection`, 2026-10-22, same in
  AlabasterDawnBox): D-pad key, hat or stick held moves the selection once, then again after 400 ms
  and every 120 ms until let go; the system's own key repeats are dropped. AerithMetiq confirmed it feels right.
- **The pad's left half mirrors its right** (`OnScreenPadModel.computeBase`, 2026-10-22, same change
  in AlabasterDawnBox): D-pad in the corner like the face buttons, the fixed left stick inside it like
  the right stick, L1/L2 over the D-pad like R1/R2. alabaster-android put the left stick in the corner,
  outside the D-pad, which AerithMetiq saw as lopsided with dynamic sticks off.
- **Font glyph widths** (`cc-shim.js`, `exactUnscaledDraws`): `ig.Font._loadMetrics` draws a font's
  PNG unscaled onto a new canvas with smoothing on, reads the bottom row back, and treats any alpha
  above 0 as glyph and alpha 0 as a gap. On the Nova's WebView 109 the glyph edges bled into the gaps
  (alpha 1 or 254 where the file has 0 or 255). `media/font/hall-fetica-small.png` lost its first gap,
  so it measured 222 glyphs instead of 223, and every small-font character drew the next one: save
  slots read "Sipncvt !Trvbsf" for "Rhombus Square" (reported by AerithMetiq 2026-10-21). With
  smoothing off, or on a `willReadFrequently` canvas, the read matches the file. The shim draws any
  3-argument, whole-pixel `drawImage` with smoothing off, and leaves contexts that already have it
  off (the game's screen) alone. Verified on the Nova: all three fonts measure 223 glyphs (check
  `sc.fontsystem.smallFont.widthMap.length` over CDP), and the Load Game slots read right.

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
- Found on the Nova: JavaSteam's `getUserStats` leaves `schema_local_version` at 0 and Steam then sends
  **no schema**, so the request is built here with -1. CrossCode's schema (60 KB) has three
  ACHIEVEMENTS stats (31, 32, 23 bits) whose bit entries are keyed by the bit number with no `bit`
  field (`Achievements.bits` reads the key; JavaSteam's own `getExpandedAchievements` would miss them).
  Steam dropped the connection twice right as the app started, mid-read; the retries cover that.
- First real store (2026-10-21, "Chapter 1 Complete" earned on the Nova): the session claimed the
  game while storing and Steam logged it off as **LoggedInElsewhere**, because the playing-status
  session (on in Settings) already held the game; an account is in game on one session at a time.
  Now the change is sent as is first, and only if Steam refuses it is it sent again with the session
  running the game (`SteamSession.runningGame`). JavaSteam's 10 s job timeout also cancelled stats
  reads that Steam answered slowly; the read's job now has 30 s.
- **While the playing status holds the game, achievements wait** (2026-10-21): with the game running
  and `PlayingService` showing it "in game", every stats read from the achievements session was cut
  off (Steam disconnected it) a moment after it was sent; from the launcher, with no game running, the
  same read worked. `AchievementService` now leaves the queue while `PlayingService.holdsGame`, and the
  launcher's `onResume` (which stops the playing status first) sends it. With the playing status off,
  achievements still go up during play.
- **JavaSteam handlers must be added before connecting**: `SteamAchievements` used to add its reply
  handler to a connected client, and JavaSteam's connection thread, which walks the handler map without
  a lock, crashed the launcher with a `ConcurrentModificationException` (Nova, 2026-10-21).
  `SteamSession` now adds one router at construction (`onMessage`), and the reply catcher listens
  through it.
- A game with no stats on Steam answers the stats request with `Fail` (seen for Alabaster Dawn);
  `SteamAchievements.read` takes that as "no achievements", so the names are dropped, not retried.

## Mods (CCLoader3, 2026-10-21)

- **Off by default** (`GameSettings.KEY_MODS`, Settings → Mods). On: `GameActivity` has
  `Mods.ensureLoader` copy CCLoader3 (MIT, shipped unchanged in `assets/ccloader3/`, release
  v3.5.2-alpha) into the game folder's `ccloader3/` (again only when its `metadata.json` differs) before
  the folder is indexed, and loads `https://appassets.androidplatform.net/ccloader3/main.html` instead
  of the game's page. CCLoader3 then reads the mods in `assets/mods/` and starts the game itself.
- What CCLoader3 needed from the host, each found on the Nova: the game folder served at the site
  root as well as `/game/` (it builds `cwd`-relative URLs as `/assets/…`); a `ServiceWorkerClient`
  routed to the same asset loader (it registers `dist-ccmod-service-worker.js` even on the desktop
  path, and reloads the page once it is active); `fs.promises.readdir` and `access`; `require("util")`
  with `format` (its console wrapper); and `./` dropped from paths (`GameIndex.clean`). Both host
  pieces are only set up while mods are on. It takes its desktop path because the shim defines `nw`.
- "Add a mod" (Settings) takes a `.ccmod` (copied as it is; CCLoader3 reads it through the service
  worker) or a `.zip` (unpacked into a folder of its own; the manifest may sit at the top or in one
  folder; entries with `..` are skipped). "Remove a mod" deletes one. The downloader leaves
  `assets/mods/` alone (`GameDownload.KEPT`), checked by a verify with two mods installed.
- Checked on the Nova (2026-10-21): a folder mod and a zip-installed mod both loaded
  (`modloader.loadedMods`: ccloader-runtime, hello-test, hello-zip; their `poststart` scripts ran);
  the title screen shows "CCLOADER V3.5.2-ALPHA". Not tried: a real community mod, a `.ccmod` file,
  CCLoader3's in-game Mods tab. CCModManager (GPL-3.0, not shipped) installs mods by writing files,
  which the shim's `fs` refuses outside the saves folder, so it would not work as is.
- Mods change saves like the game does, and those sync to Steam Cloud; achievements stay on.
- **Mod browser** (`ModBrowserActivity`, `ModDb`, 2026-10-22; Settings → Mods → Browse mods): reads
  CCModDB's `npDatabase.min.json` (`stable` branch; cached in `cacheDir` for when GitHub cannot be
  reached), lists the mods with a search box, and installs one with the dependencies it lacks
  (`ModDb.plan`: dependencies first; CCLoader3's own packages and the game's extensions are not
  installed). Each archive comes from the mod's own release URL (HTTPS only, redirects followed), is
  checked against the database's SHA-256, and is unpacked into `assets/mods/<id>/` from the
  database's `source` folder (`Mods.installArchive`; a `.ccmod` is unpacked too). Left out of the list:
  CCLoader v2 and its base libraries (tag `base`), and CCModManager. Checked on the Nova: Boki Colors
  (a `.ccmod`, which pulled element-hair) and clean-title-screen (a `.zip` with its mod in a folder)
  installed, and with mods on all three loaded and Lea was gone from the title screen; then removed.
- **Order and filters** (2026-10-22, `ModDb.select`, `ModView`, unit-tested): sort by popularity
  (GitHub stars, `stars` in the database: CCModDB has no download counts), name, author (first
  listed) or last update (`lastUpdateTimestamp`), each with a button to flip its direction; keep to
  one category (the mods' tags) and one author (spellings that differ only in case are one author).
  Remembered in the `mod_browser` preferences; a remembered category or author the list no longer has
  is dropped. Titles and descriptions lose CrossCode's text codes (`\i[…]` icons as well as `\c[n]`).
  Checked on the Nova: sort, order, a category, and a title that had icon codes.
- **Show: all / installed / updates, and Update all** (`ModShow`, `ModDb.hasUpdate`, `ModDb.planAll`,
  2026-10-22): an update is an installed version that differs from the database's (any difference, as
  versions follow no one scheme). Update all asks once, listing old → new, and installs each mod once
  with what it lacks. Unit-tested; on the Nova only seen with nothing installed (no Update all button).

## The extension double load (fixed 2026-10-21)

The shim's `fs.readdir` called back at once, inside the game's resource loader
(`ig.ExtensionList.loadExtensionsNWJS`), which then loaded every extension twice. Silent for the free
extensions; once the DLC brought `ninja-skin`, the skin library threw "Tried to register skin of id
'ninja' twice" at every boot. The callback now comes later, as Node's does; one load each, no error.

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
  `Screens.statusBar`.

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

- **The status bar is dark navy with light icons on every launcher screen**: call
  `Screens.statusBar(this)` after `setContentView`. It lays the window out edge to edge and draws a
  strip the height of the status bar, because Android 15+ ignores `statusBarColor`.
- Match the launcher: dark gradient (`launcher_bg`), one accent colour (`@color/accent`, cyan),
  `text_primary` / `text_secondary`, the game's logo (the serif "CROSSCODE / BOX" wordmark until the game
  is downloaded).
- **Controller-first:** every control focusable, with the white focus ring; give each screen a sensible
  initial focus.
- **Back leaves for the app that opened the launcher** (`ReturnTo`, 2026-10-22): the home screen, or a
  frontend such as ES-DE (its launch intent), never the next task in Android's order. Android's Back
  on a task's root moves the task back and shows the task under it, which after a switch through
  recents is another app: with both Box apps open, B in one showed the other and leaving took a
  second B (the "double B" AerithMetiq reported). The opener is `Activity.referrer`, kept in the
  `launcher` preferences (`opener`); a start by the app itself keeps it. Checked on the Nova: icon,
  home, the other app's icon, quick switch back, one B → home screen. The launcher is `singleTop`:
  ES-DE resuming the app while the launcher was on top only brought the task forward, so Back went to
  the first opener (AerithMetiq, 2026-10-22); now such a start arrives as `onNewIntent` and is logged
  (`launcher: opened by …`). A start while the game or Settings is on top still only brings the task
  forward, and the opener stays the previous one.
- Landscape-first, but nothing may clip on 4:3 handhelds or phones.
- UI text is plain and direct; say what happened and what to do next.
