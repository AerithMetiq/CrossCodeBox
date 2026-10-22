var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// packages/core/src/files.desktop.ts
var files_desktop_exports = {};
__export(files_desktop_exports, {
  findRecursively: () => findRecursively,
  getInstalledExtensions: () => getInstalledExtensions,
  getModPathsIn: () => getModPathsIn,
  isReadable: () => isReadable,
  loadText: () => loadText,
  readFile: () => readFile
});

// packages/common/src/paths.ts
var CHAR_DOT = ".".charCodeAt(0);
var CHAR_FORWARD_SLASH = "/".charCodeAt(0);
function validateString(value, name) {
  if (typeof value !== "string") {
    throw new TypeError(`expected ${name} to be a string`);
  }
}
function normalizeString(path, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code = 0;
  for (let i = 0; i <= path.length; i++) {
    if (i < path.length) code = path.charCodeAt(i);
    else if (code === CHAR_FORWARD_SLASH) break;
    else code = CHAR_FORWARD_SLASH;
    if (code === CHAR_FORWARD_SLASH) {
      if (lastSlash === i - 1 || dots === 1) {
      } else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== CHAR_DOT || res.charCodeAt(res.length - 2) !== CHAR_DOT) {
          if (res.length > 2) {
            let lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = i;
            dots = 0;
            continue;
          } else if (res.length !== 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? `/..` : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) res += `/${path.slice(lastSlash + 1, i)}`;
        else res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === CHAR_DOT && dots !== -1) {
      dots++;
    } else {
      dots = -1;
    }
  }
  return res;
}
function normalize(path) {
  validateString(path, "path");
  if (path.length === 0) return ".";
  let hasRoot = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
  let trailingSeparator = path.charCodeAt(path.length - 1) === CHAR_FORWARD_SLASH;
  path = normalizeString(path, !hasRoot);
  if (path.length === 0) {
    if (hasRoot) return "/";
    return trailingSeparator ? "./" : ".";
  }
  if (trailingSeparator) path += "/";
  return hasRoot ? `/${path}` : path;
}
function jailRelative(path) {
  validateString(path, "path");
  if (path.length === 0) return ".";
  let trailingSeparator = path.charCodeAt(path.length - 1) === CHAR_FORWARD_SLASH;
  path = normalizeString(path, false);
  if (path.length === 0) path = ".";
  if (trailingSeparator) path += "/";
  return path;
}
function join(...args) {
  if (args.length === 0) return ".";
  let joined = null;
  for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    validateString(arg, "path");
    if (arg.length > 0) {
      if (joined == null) joined = arg;
      else joined += `/${arg}`;
    }
  }
  if (joined == null) return ".";
  return normalize(joined);
}

// packages/common/src/utils.ts
var PLATFORM_TYPE = (() => {
  if (typeof nw !== "undefined") {
    return "DESKTOP" /* DESKTOP */;
  }
  let params = new URLSearchParams(window.location.search);
  if (params.has("crossandroid")) {
    return "ANDROID" /* ANDROID */;
  }
  return "BROWSER" /* BROWSER */;
})();
function showDevTools(window2 = nw.Window.get()) {
  return new Promise(
    (resolve) => (
      // eslint-disable-next-line no-undefined
      window2.showDevTools(void 0, () => resolve())
    )
  );
}
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function compare(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
}
function errorHasMessage(error) {
  return typeof error.message === "string";
}
function errorHasCode(error) {
  return typeof error.code === "string";
}
function hasKey(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
function mapGetOrInsert(map, key, defaultValue) {
  if (map.has(key)) {
    return map.get(key);
  } else {
    map.set(key, defaultValue);
    return defaultValue;
  }
}
function cwdFilePathToURL(path, base = document.baseURI) {
  let url = new URL(base);
  url.pathname = path;
  url.search = "";
  url.hash = "";
  return url;
}
function html(tagName, options) {
  let element = document.createElement(tagName);
  if (options.attrs != null) {
    for (let [k, v] of Object.entries(options.attrs)) {
      if (v != null) {
        element.setAttribute(k, v);
      }
    }
  }
  if (options.id != null) {
    element.id = options.id;
  }
  if (options.class != null) {
    element.classList.add(...options.class);
  }
  if (options.style != null) {
    for (let [k, v] of Object.entries(options.style)) {
      if (v != null) {
        element.style[k] = v;
      }
    }
  }
  if (options.children != null) {
    element.append(...options.children);
  }
  return element;
}

// packages/core/src/files.desktop.ts
var _a;
var fs = (_a = window.require) == null ? void 0 : _a.call(window, "fs");
async function readFile(path) {
  return fs.promises.readFile(path);
}
async function loadText(path) {
  return fs.promises.readFile(path, "utf8");
}
async function isReadable(path) {
  try {
    await fs.promises.access(path, fs.constants.R_OK);
    return true;
  } catch (_err) {
    return false;
  }
}
async function findRecursively(dir) {
  if (dir.endsWith("/")) dir = dir.slice(0, -1);
  let fileList = [];
  await findRecursivelyInternal(dir, "", fileList);
  return fileList;
}
async function findRecursivelyInternal(currentDir, relativePrefix, fileList) {
  let contents;
  try {
    contents = await fs.promises.readdir(currentDir);
  } catch (err2) {
    if (errorHasCode(err2) && err2.code === "ENOENT") return;
    throw err2;
  }
  await Promise.all(
    contents.map(async (name) => {
      let fullPath = `${currentDir}/${name}`;
      let stat = await fs.promises.stat(fullPath);
      if (stat.isDirectory()) {
        await findRecursivelyInternal(fullPath, `${relativePrefix}${name}/`, fileList);
      } else {
        fileList.push(`${relativePrefix}${name}`);
      }
    })
  );
}
async function getModPathsIn(dir, _config) {
  if (dir.endsWith("/")) dir = dir.slice(0, -1);
  let allContents;
  try {
    allContents = await fs.promises.readdir(dir);
  } catch (err2) {
    if (errorHasCode(err2) && err2.code === "ENOENT") {
      await fs.promises.mkdir(dir);
      allContents = await fs.promises.readdir(dir);
    }
    throw err2;
  }
  const modDirectories = [];
  const ccmods = [];
  await Promise.all(
    allContents.map(async (name) => {
      let fullPath = `${dir}/${name}`;
      let stat = await fs.promises.stat(fullPath);
      if (stat.isDirectory()) modDirectories.push(fullPath);
      else if (stat.isFile() && name.endsWith(".ccmod")) {
        ccmods.push(fullPath);
      }
    })
  );
  return { modDirectories, ccmods };
}
async function getInstalledExtensions(config) {
  var _a6;
  let igRoot = (_a6 = config.impactConfig.IG_ROOT) != null ? _a6 : "";
  let igDebug = Boolean(config.impactConfig.IG_GAME_DEBUG);
  let extensionsDir = `${igRoot}${igDebug ? "data" : "assets"}/extension`;
  let allContents;
  try {
    allContents = await fs.promises.readdir(extensionsDir);
  } catch (err2) {
    if (errorHasCode(err2) && err2.code === "ENOENT") return [];
    throw err2;
  }
  let extensionIds = [];
  await Promise.all(
    allContents.map(async (name) => {
      if (name.startsWith(".")) return;
      if (igDebug) {
        if (name.endsWith(".json")) {
          extensionIds.push(name.slice(0, -5));
        }
        return;
      }
      try {
        await fs.promises.access(`${extensionsDir}/${name}/${name}.json`);
      } catch (_err) {
        return;
      }
      extensionIds.push(name);
    })
  );
  return extensionIds;
}

// packages/core/src/files.browser.ts
var files_browser_exports = {};
__export(files_browser_exports, {
  getInstalledExtensions: () => getInstalledExtensions2,
  getModPathsIn: () => getModPathsIn2,
  isReadable: () => isReadable2,
  loadText: () => loadText2,
  readFile: () => readFile2
});
async function request(path) {
  try {
    let res = await fetch(cwdFilePathToURL(path).href);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res;
  } catch (err2) {
    if (errorHasMessage(err2)) {
      err2.message = `Failed to load file '${path}': ${err2.message}`;
    }
    throw err2;
  }
}
async function readFile2(path) {
  return (await request(path)).arrayBuffer();
}
async function loadText2(path) {
  return (await request(path)).text();
}
async function isReadable2(path) {
  try {
    let res = await fetch(cwdFilePathToURL(path).href, { method: "HEAD" });
    return res.ok;
  } catch (_err) {
    return false;
  }
}
async function getModPathsIn2(dir, _config) {
  if (dir.endsWith("/")) dir = dir.slice(0, -1);
  let indexPath = `${dir}/index.json`;
  let indexJsonText = await loadText2(indexPath);
  let index;
  try {
    index = JSON.parse(indexJsonText);
  } catch (err2) {
    if (errorHasMessage(err2)) {
      err2.message = `Syntax error in mods directory index in '${indexPath}': ${err2.message}`;
    }
    throw err2;
  }
  const modPaths = index.map((modDirPath) => join(dir, jailRelative(modDirPath)));
  const modDirectories = [];
  const ccmods = [];
  for (const path of modPaths) {
    if (path.endsWith(".ccmod")) {
      ccmods.push(path);
    } else {
      modDirectories.push(path);
    }
  }
  return { modDirectories, ccmods };
}
async function getInstalledExtensions2(config) {
  var _a6;
  let igRoot = (_a6 = config.impactConfig.IG_ROOT) != null ? _a6 : "";
  let igDebug = Boolean(config.impactConfig.IG_GAME_DEBUG);
  let extensionsApiUrl = `${igRoot}page/api/get-extension-list.php?debug=${igDebug ? 1 : 0}`;
  try {
    let res = await fetch(extensionsApiUrl);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return JSON.parse(await res.text());
  } catch (err2) {
    if (errorHasMessage(err2)) {
      err2.message = `Failed to send request to '${extensionsApiUrl}': ${err2.message}`;
    }
    return [];
  }
}

// packages/core/src/files.android.ts
var files_android_exports = {};
__export(files_android_exports, {
  getInstalledExtensions: () => getInstalledExtensions3,
  getModPathsIn: () => getModPathsIn3,
  isReadable: () => isReadable2,
  loadText: () => loadText2,
  readFile: () => readFile2
});
async function getModPathsIn3(dir, config) {
  if (dir === `${config.gameAssetsDir}mods/`) {
    try {
      let modsDirEntries = JSON.parse(CrossAndroidModListProvider.getModListAsJson());
      let modSubdirs = [];
      for (let modDirName of modsDirEntries) {
        if (modDirName.endsWith("/")) {
          modSubdirs.push(`${dir}/${modDirName.slice(0, -1)}`);
        }
      }
      return { modDirectories: modSubdirs, ccmods: [] };
    } catch (err2) {
      console.error("Failed to get the list of mods from CrossAndroid:", err2);
    }
  }
  return getModPathsIn2(dir, config);
}
async function getInstalledExtensions3(config) {
  try {
    return JSON.parse(CrossAndroidExtensionListProvider.getExtensionListAsJson());
  } catch (err2) {
    console.error("Failed to get the list of extensions from CrossAndroid:", err2);
  }
  return getInstalledExtensions2(config);
}

// node_modules/.pnpm/fflate@0.8.2/node_modules/fflate/esm/browser.js
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i = 0; i < 31; ++i) {
    b[i] = start += 1 << eb[i - 1];
  }
  var r = new i32(b[30]);
  for (var i = 1; i < 30; ++i) {
    for (var j = b[i]; j < b[i + 1]; ++j) {
      r[j] = j - b[i] << 5 | i;
    }
  }
  return { b, r };
};
var _a2 = freb(fleb, 2);
var fl = _a2.b;
var revfl = _a2.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x = (i & 43690) >> 1 | (i & 21845) << 1;
  x = (x & 52428) >> 2 | (x & 13107) << 2;
  x = (x & 61680) >> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var x;
var i;
var hMap = function(cd, mb, r) {
  var s = cd.length;
  var i = 0;
  var l = new u16(mb);
  for (; i < s; ++i) {
    if (cd[i])
      ++l[cd[i] - 1];
  }
  var le = new u16(mb);
  for (i = 1; i < mb; ++i) {
    le[i] = le[i - 1] + l[i - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        var sv = i << 4 | cd[i];
        var r_1 = mb - cd[i];
        var v = le[cd[i] - 1]++ << r_1;
        for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
          co[rev[v] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        co[i] = rev[le[cd[i] - 1]++] >> 15 - cd[i];
      }
    }
  }
  return co;
};
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a) {
  var m = a[0];
  for (var i = 1; i < a.length; ++i) {
    if (a[i] > m)
      m = a[i];
  }
  return m;
};
var bits = function(d, p, m) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
};
var bits16 = function(d, p) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
};
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  return new u8(v.subarray(s, e));
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
];
var err = function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt)
    throw e;
  return e;
};
var inflt = function(dat, st, buf, dict) {
  var sl = dat.length, dl = dict ? dict.length : 0;
  if (!sl || st.f && !st.l)
    return buf || new u8(0);
  var noBuf = !buf;
  var resize = noBuf || st.i != 2;
  var noSt = st.i;
  if (noBuf)
    buf = new u8(sl * 3);
  var cbuf = function(l2) {
    var bl = buf.length;
    if (l2 > bl) {
      var nbuf = new u8(Math.max(bl * 2, l2));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
        if (t > sl) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + l);
        buf.set(dat.subarray(s, t), bt);
        st.b = bt += l, st.p = pos = t * 8, st.f = final;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i = 0; i < hcLen; ++i) {
          clt[clim[i]] = bits(dat, pos + i * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i = 0; i < tl; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s = r >> 4;
          if (s < 16) {
            ldt[i++] = s;
          } else {
            var c = 0, n = 0;
            if (s == 16)
              n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
            else if (s == 17)
              n = 3 + bits(dat, pos, 7), pos += 3;
            else if (s == 18)
              n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--)
              ldt[i++] = c;
          }
        }
        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
        lbt = max(lt);
        dbt = max(dt);
        lm = hMap(lt, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (resize)
      cbuf(bt + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (; ; lpos = pos) {
      var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
      pos += c & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c)
        err(2);
      if (sym < 256)
        buf[bt++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i = sym - 257, b = fleb[i];
          add = bits(dat, pos, (1 << b) - 1) + fl[i];
          pos += b;
        }
        var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
        if (!d)
          err(3);
        pos += d & 15;
        var dt = fd[dsym];
        if (dsym > 3) {
          var b = fdeb[dsym];
          dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + 131072);
        var end = bt + add;
        if (bt < dt) {
          var shift = dl - dt, dend = Math.min(dt, end);
          if (shift + bt < 0)
            err(3);
          for (; bt < dend; ++bt)
            buf[bt] = dict[shift + bt];
        }
        for (; bt < end; ++bt)
          buf[bt] = buf[bt - dt];
      }
    }
    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
    if (lm)
      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
var et = /* @__PURE__ */ new u8(0);
var b2 = function(d, b) {
  return d[b] | d[b + 1] << 8;
};
var b4 = function(d, b) {
  return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
var b8 = function(d, b) {
  return b4(d, b) + b4(d, b + 4) * 4294967296;
};
function inflateSync(data2, opts) {
  return inflt(data2, { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {
}
var dutf8 = function(d) {
  for (var r = "", i = 0; ; ) {
    var c = d[i++];
    var eb = (c > 127) + (c > 223) + (c > 239);
    if (i + eb > d.length)
      return { s: r, r: slc(d, i - 1) };
    if (!eb)
      r += String.fromCharCode(c);
    else if (eb == 3) {
      c = ((c & 15) << 18 | (d[i++] & 63) << 12 | (d[i++] & 63) << 6 | d[i++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
    } else if (eb & 1)
      r += String.fromCharCode((c & 31) << 6 | d[i++] & 63);
    else
      r += String.fromCharCode((c & 15) << 12 | (d[i++] & 63) << 6 | d[i++] & 63);
  }
};
function strFromU8(dat, latin1) {
  if (latin1) {
    var r = "";
    for (var i = 0; i < dat.length; i += 16384)
      r += String.fromCharCode.apply(null, dat.subarray(i, i + 16384));
    return r;
  } else if (td) {
    return td.decode(dat);
  } else {
    var _a6 = dutf8(dat), s = _a6.s, r = _a6.r;
    if (r.length)
      err(8);
    return s;
  }
}
var slzh = function(d, b) {
  return b + 30 + b2(d, b + 26) + b2(d, b + 28);
};
var zh = function(d, b, z) {
  var fnl = b2(d, b + 28), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl, bs = b4(d, b + 20);
  var _a6 = z && bs == 4294967295 ? z64e(d, es) : [bs, b4(d, b + 24), b4(d, b + 42)], sc = _a6[0], su = _a6[1], off = _a6[2];
  return [b2(d, b + 10), sc, su, fn, es + b2(d, b + 30) + b2(d, b + 32), off];
};
var z64e = function(d, b) {
  for (; b2(d, b) != 1; b += 4 + b2(d, b + 2))
    ;
  return [b8(d, b + 12), b8(d, b + 4), b8(d, b + 20)];
};
function unzipSync(data2, opts) {
  var files = {};
  var e = data2.length - 22;
  for (; b4(data2, e) != 101010256; --e) {
    if (!e || data2.length - e > 65558)
      err(13);
  }
  ;
  var c = b2(data2, e + 8);
  if (!c)
    return {};
  var o = b4(data2, e + 16);
  var z = o == 4294967295 || c == 65535;
  if (z) {
    var ze = b4(data2, e - 12);
    z = b4(data2, ze) == 101075792;
    if (z) {
      c = b4(data2, ze + 32);
      o = b4(data2, ze + 48);
    }
  }
  var fltr = opts && opts.filter;
  for (var i = 0; i < c; ++i) {
    var _a6 = zh(data2, o, z), c_2 = _a6[0], sc = _a6[1], su = _a6[2], fn = _a6[3], no = _a6[4], off = _a6[5], b = slzh(data2, off);
    o = no;
    if (!fltr || fltr({
      name: fn,
      size: sc,
      originalSize: su,
      compression: c_2
    })) {
      if (!c_2)
        files[fn] = slc(data2, b, b + sc);
      else if (c_2 == 8)
        files[fn] = inflateSync(data2.subarray(b, b + sc), { out: new u8(su) });
      else
        err(14, "unknown compression type " + c_2);
    }
  }
  return files;
}

// packages/core/src/service-worker-bridge.ts
var fetchHandler;
var validPathPrefixes = [];
function sendServiceWorkerMessage(packet) {
  const { controller } = window.navigator.serviceWorker;
  controller == null ? void 0 : controller.postMessage(packet);
}
function setFetchHandler(pathPrefixes, handler) {
  fetchHandler = handler;
  validPathPrefixes = pathPrefixes.map((path) => `/${path}/`);
  sendServiceWorkerMessage({ type: "ValidPathPrefixes", validPathPrefixes });
}
function setMessageHandling() {
  navigator.serviceWorker.onmessage = async (event) => {
    var _a6;
    const packet = event.data;
    let responsePacket;
    if (packet.type === "Path") {
      const { path } = packet;
      responsePacket = {
        type: "Data",
        path,
        data: (_a6 = await (fetchHandler == null ? void 0 : fetchHandler(path).catch((e) => {
          console.error(`error while handing fetch of ${path}:`, e);
        }))) != null ? _a6 : null
      };
    } else {
      responsePacket = { type: "ValidPathPrefixes", validPathPrefixes };
    }
    sendServiceWorkerMessage(responsePacket);
  };
}
async function loadServiceWorker() {
  const currentRegistration = await window.navigator.serviceWorker.getRegistration();
  if (currentRegistration) {
    void currentRegistration.update();
  } else {
    const path = "dist-ccmod-service-worker.js";
    await window.navigator.serviceWorker.register(path, {
      updateViaCache: "none"
    });
  }
  const { controller } = window.navigator.serviceWorker;
  if (!controller || controller.state !== "activated") {
    window.location.reload();
    window.location.href = window.location.toString();
    history.go(0);
    throw new Error("(\u256F\xB0\u25A1\xB0\uFF09\u256F\uFE35 \u253B\u2501\u253B");
  }
  setMessageHandling();
  sendServiceWorkerMessage({ type: "ValidPathPrefixes", validPathPrefixes });
  return controller;
}

// packages/core/src/files.ccmod.ts
var fileMap = /* @__PURE__ */ new Map();
function findPrefix(path) {
  if (path.startsWith("/")) path = path.substring(1);
  const prefix = [...fileMap.keys()].find((dir) => path.startsWith(dir));
  if (!prefix) return null;
  path = path.substring(prefix.length + 1);
  return [path, prefix];
}
async function isReadable3(path) {
  return Boolean(findPrefix(path));
}
async function loadText3(path) {
  const buf = await readFile4(path);
  if (!buf) return null;
  return new TextDecoder("utf-8").decode(buf);
}
async function readFile4(path) {
  const prefixObj = findPrefix(path);
  if (!prefixObj) return null;
  const [relativePath, prefix] = prefixObj;
  const unzipped = fileMap.get(prefix);
  const data2 = unzipped[relativePath];
  return data2.buffer;
}
async function findRecursively2(dir) {
  const prefixObj = findPrefix(dir);
  if (!prefixObj) return null;
  const [relativePath, prefix] = prefixObj;
  const unzipped = fileMap.get(prefix);
  const dirs = Object.keys(unzipped).filter((path) => !path.endsWith("/") && path.startsWith(relativePath)).map((dir2) => dir2.substring(relativePath.length));
  return dirs;
}
async function loadCCMods(ccmods) {
  const ccmodArrayBuffers = await Promise.all(
    ccmods.map(async (modDir) => {
      const url = `./${modDir}`;
      return new Uint8Array(await readFile3(url));
    })
  );
  const uncompressed = ccmodArrayBuffers.map((buf) => unzipSync(buf));
  for (let i = 0; i < ccmods.length; i++) {
    const modDir = ccmods[i];
    const buf = uncompressed[i];
    fileMap.set(modDir, buf);
  }
  setFetchHandler(ccmods, readFile4);
}

// packages/core/src/files.ts
var modules = {
  ["DESKTOP" /* DESKTOP */]: files_desktop_exports,
  ["ANDROID" /* ANDROID */]: files_android_exports,
  ["BROWSER" /* BROWSER */]: files_browser_exports
};
var currentModule = modules[PLATFORM_TYPE];
var { getModPathsIn: getModPathsIn4, getInstalledExtensions: getInstalledExtensions4 } = currentModule;
async function isReadable4(path) {
  return await isReadable3(path) || currentModule.isReadable(path);
}
async function readFile3(path) {
  return await readFile4(path) || currentModule.readFile(path);
}
async function loadText4(path) {
  return await loadText3(path) || currentModule.loadText(path);
}
async function findRecursively3(dir) {
  return await findRecursively2(dir) || ("findRecursively" in currentModule ? currentModule.findRecursively(dir) : null);
}

// packages/core/src/config.ts
var CONFIG_SCRIPT_NAME = `ccloader-user-config.js`;
async function load(modloaderVersion) {
  let config = createDefaultConfig();
  let ctx = { modloaderVersion };
  let configScriptPath = CONFIG_SCRIPT_NAME;
  if (await isReadable4(configScriptPath)) {
    try {
      let configModule = await import(cwdFilePathToURL(configScriptPath).href);
      await configModule.default(config, ctx);
    } catch (err2) {
      if (errorHasMessage(err2)) {
        err2.message = `Error while loading '${configScriptPath}': ${err2.message}`;
      }
      throw err2;
    }
    console.log("loaded the user configuration");
  }
  return config;
}
function createDefaultConfig() {
  let gameAssetsDir = PLATFORM_TYPE === "ANDROID" /* ANDROID */ ? "/" : "assets/";
  return {
    gameAssetsDir,
    modsDirs: [`${gameAssetsDir}mods/`],
    // no stylesheets have been removed
    stylesheetURLs: [
      // See note about jQuery UI below
      "impact/page/css/ui-darkness/jquery-ui-1.10.2.custom.min.css",
      // The core stylesheet
      "impact/page/css/style.css",
      // Defines cursor images and styles used by `game/page/game-base.js`
      "game/page/game-base.css"
    ],
    // no scripts have been removed
    scriptURLs: [
      // Used for encrypting/decrypting save slots and settings/globals data
      "impact/page/js/aes.js",
      // Adds seeded RNG, exact version of the library is unknown. Appears to be
      // used only for generating random names for runner NPCs.
      "impact/page/js/seedrandom.js",
      // Yes. CrossCode absolutely can't function without jQuery
      "impact/page/js/jquery-1.11.1.min.js",
      // It is unknown whether jQuery UI is required, an audit of game code is
      // necessary. Possibly it is used by RFG's internal browser-based editors.
      "impact/page/js/jquery-ui-1.10.2.custom.min.js",
      // Implements the following functions:
      // 1. `SHOW_GAMECODE`
      //    shows a dialog for entering bonus codes
      // 2. `SHOW_TWITTER`
      //    shows a popup with links to developers' twitter accounts
      // 3. `SHOW_SCREENSHOT`
      //    shows a popup which contains a screenshot when you press F8 in the
      //    browser
      // 4. `SHOW_INDIEGOGO`
      //    shows popup with a link to the Indiegogo campaign, unused since at
      //    least 2016
      // 5. `GAME_ERROR_CALLBACK`
      //    shows the "CRITICAL BUG!" popup
      // 6. `SHOW_SAVE_DIALOG`
      //    shows a dialog for importing/exporting save slots when you press F10
      // To be honest, I have no idea why these aren't implemented in
      // `js/game.compiled.js`, so this script is required.
      "game/page/game-base.js",
      // The most useless script in the entire CrossCode and yet it is still
      // required. It does the following things:
      //  1. Fills the `div#options.optionList` element with a bunch of sliders
      //      and buttons. This is not required anymore since the game doesn't
      //      use DOM for GUI and the options menu is already implemented, see
      //     `sc.OptionsMenu` and others. In fact this is so useless that the
      //     game hides this option list by adding a `display: none` rule in the
      //     inline styles.
      //  2. Creates a global `BrowserDetect` object which contains, obviously,
      //     browser detection functions. This "library" is unused since Impact
      //     already contains browser detection functionality.
      //  3. Loads some options (pixel size, scaling mode, music and sound
      //     volume) from `localStorage` which are saved somewhere in
      //     options-related game code. This is needed so that when users change
      //     display-related options their values are used during very early
      //     game window initialization.
      //  4. Updates canvas size on start and when the window is resized.
      // This script can't be disabled exactly because of the last two points.
      // TODO: having thought about it, we might as well reimplement required
      // parts of its functionality ourselves.
      "impact/page/js/options.js"
    ],
    gameScriptURL: "js/game.compiled.js",
    // General (Cubic) Impact configuration constants. Interesting fact: the
    // only two differences between the config from v0.1.0 and v1.2.0-5 is the
    // removal of `IG_LANG` and the addition of `IG_GAME_BETA` which has been
    // turned on in the pre-1.0 versions (at least in v0.7.0).
    // TODO: add descriptions of each constant
    impactConfig: {
      IG_GAME_SCALE: 2,
      IG_GAME_CACHE: 0,
      IG_ROOT: "",
      IG_WIDTH: 568,
      IG_HEIGHT: 320,
      IG_HIDE_DEBUG: false,
      IG_SCREEN_MODE_OVERRIDE: 2,
      IG_WEB_AUDIO_BGM: false,
      IG_FORCE_HTML5_AUDIO: false,
      LOAD_LEVEL_ON_GAME_START: null,
      IG_GAME_DEBUG: false,
      IG_GAME_BETA: false
    },
    onGameDOMCreated: () => {
    }
  };
}

// packages/core/src/manifest.ts
function getType(value) {
  if (value === null) return "null" /* null */;
  if (typeof value === "string") return "string" /* string */;
  if (typeof value === "number") return "number" /* number */;
  if (typeof value === "boolean") return "boolean" /* boolean */;
  if (Array.isArray(value)) return "array" /* array */;
  if (typeof value === "object") return "object" /* object */;
  return "unknown" /* unknown */;
}
var ManifestValidationError = class extends Error {
  constructor(problems) {
    super(`
${problems.map((p) => `- ${p}`).join("\n")}`);
    this.problems = problems;
    this.name = new.target.name;
  }
};
function jsonPathToString(path) {
  if (path.length === 0) return "<document>";
  let str = "";
  for (let i = 0; i < path.length; i++) {
    let key = path[i];
    if (typeof key === "number") {
      str += `[${key}]`;
    } else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
      if (i > 0) str += ".";
      str += key;
    } else {
      str += `[${JSON.stringify(key)}]`;
    }
  }
  return str;
}
var ccmodIdValidationExceptions = [
  "CrossCode Map Editor",
  "Azure's Adjustments",
  "Boki Colors",
  "CCLoader display version",
  "CrossCode C Edition",
  "New game++"
];
var Validator = class {
  constructor() {
    this.problems = [];
  }
  validate(data2) {
    this.problems = [];
    if (this.assertType([], data2, ["object" /* object */]).status === "ok") {
      if (this.assertType(["id"], data2.id, ["string" /* string */]).status === "ok") {
        if (!/^[a-zA-Z0-9_-]+$/.test(data2.id) && !ccmodIdValidationExceptions.includes(data2.id)) {
          this.problems.push(
            "id must consist only of one or more alphanumberic characters, hyphens or underscores"
          );
        }
      }
      this.assertType(["version"], data2.version, ["string" /* string */], true);
      this.assertLocalizedString(["title"], data2.title, true);
      this.assertLocalizedString(["description"], data2.description, true);
      this.assertType(["license"], data2.license, ["string" /* string */], true);
      this.assertLocalizedString(["homepage"], data2.homepage, true);
      this.assertKeywords(["tags"], data2.tags);
      this.assertModIcons(["icons"], data2.icons);
      this.assertPeople(["authors"], data2.authors);
      this.assertDependencies(["dependencies"], data2.dependencies, false);
      this.assertAssets(["assets"], data2.assets);
      this.assertType(["assetsDir"], data2.assetsDir, ["string" /* string */], true);
      this.assertType(["modPrefix"], data2.modPrefix, ["string" /* string */], true);
      this.assertType(["plugin"], data2.plugin, ["string" /* string */], true);
      this.assertType(["preload"], data2.preload, ["string" /* string */], true);
      this.assertType(["postload"], data2.postload, ["string" /* string */], true);
      this.assertType(["prestart"], data2.prestart, ["string" /* string */], true);
      this.assertType(["poststart"], data2.poststart, ["string" /* string */], true);
    }
    if (this.problems.length > 0) {
      throw new ManifestValidationError(this.problems);
    }
  }
  validateLegacy(data2) {
    this.problems = [];
    if (this.assertType([], data2, ["object" /* object */]).status === "ok") {
      this.assertType(["name"], data2.name, ["string" /* string */]);
      this.assertType(["version"], data2.version, ["string" /* string */], true);
      this.assertType(["ccmodHumanName"], data2.ccmodHumanName, ["string" /* string */], true);
      this.assertType(["description"], data2.description, ["string" /* string */], true);
      this.assertType(["license"], data2.license, ["string" /* string */], true);
      this.assertType(["homepage"], data2.homepage, ["string" /* string */], true);
      this.assertModIcons(["icons"], data2.icons);
      if (data2.ccmodDependencies !== void 0) {
        this.assertDependencies(["ccmodDependencies"], data2.ccmodDependencies, true);
      } else {
        this.assertDependencies(["dependencies"], data2.dependencies, true);
      }
      this.assertAssets(["assets"], data2.assets);
      this.assertType(["plugin"], data2.plugin, ["string" /* string */], true);
      this.assertType(["preload"], data2.preload, ["string" /* string */], true);
      this.assertType(["postload"], data2.postload, ["string" /* string */], true);
      this.assertType(["prestart"], data2.prestart, ["string" /* string */], true);
      this.assertType(["main"], data2.main, ["string" /* string */], true);
    }
    if (this.problems.length > 0) {
      throw new ManifestValidationError(this.problems);
    }
  }
  assertType(valuePath, value, expectedTypes, optional = false) {
    if (value === void 0) {
      if (optional) {
        return { status: "optional" };
      } else {
        this.problems.push(`'${jsonPathToString(valuePath)}' is required`);
        return { status: "failed" };
      }
    }
    let actualType = getType(value);
    if (!expectedTypes.includes(actualType)) {
      let valuePathStr = jsonPathToString(valuePath);
      let expectedTypesStr = expectedTypes.join(" or ");
      this.problems.push(
        `expected type of '${valuePathStr}' to be '${expectedTypesStr}', got '${actualType}'`
      );
      return { status: "failed" };
    }
    return { status: "ok", type: actualType };
  }
  assertLocalizedString(valuePath, value, optional = false) {
    let assertion = this.assertType(valuePath, value, ["object" /* object */, "string" /* string */], optional);
    if (assertion.status !== "ok") return;
    value = value;
    if (assertion.type === "string" /* string */) return;
    for (let [key, value2] of Object.entries(value)) {
      this.assertType([...valuePath, key], value2, ["string" /* string */]);
    }
  }
  assertKeywords(valuePath, value) {
    let assertion = this.assertType(valuePath, value, ["array" /* array */], true);
    if (assertion.status !== "ok") return;
    value = value;
    for (let index = 0; index < value.length; index++) {
      let value2 = value[index];
      this.assertLocalizedString([...valuePath, index], value2);
    }
  }
  assertPeople(valuePath, value) {
    let assertion = this.assertType(valuePath, value, ["array" /* array */, "string" /* string */], true);
    if (assertion.status !== "ok") return;
    value = value;
    if (assertion.type === "string" /* string */) return;
    const people = value;
    for (let index = 0; index < people.length; index++) {
      let value2 = people[index];
      this.assertPerson([...valuePath, index], value2);
    }
  }
  assertPerson(valuePath, value) {
    let assertion = this.assertType(valuePath, value, ["object" /* object */, "string" /* string */]);
    if (assertion.status !== "ok") return;
    if (assertion.type === "string" /* string */) return;
    value = value;
    this.assertLocalizedString([...valuePath, "name"], value.name);
    this.assertLocalizedString([...valuePath, "email"], value.email, true);
    this.assertLocalizedString([...valuePath, "url"], value.url, true);
    this.assertLocalizedString([...valuePath, "comment"], value.comment, true);
  }
  assertDependencies(valuePath, value, legacy) {
    let assertion = this.assertType(valuePath, value, ["object" /* object */], true);
    if (assertion.status !== "ok") return;
    value = value;
    for (let [key, value2] of Object.entries(value)) {
      let valuePath2 = [...valuePath, key];
      if (legacy) this.assertType(valuePath2, value2, ["string" /* string */]);
      else this.assertDependency(valuePath2, value2);
    }
  }
  assertDependency(valuePath, value) {
    let assertion = this.assertType(valuePath, value, ["object" /* object */, "string" /* string */]);
    if (assertion.status !== "ok") return;
    if (assertion.type === "string" /* string */) return;
    value = value;
    this.assertType([...valuePath, "version"], value.version, ["string" /* string */]);
    this.assertType([...valuePath, "optional"], value.optional, ["boolean" /* boolean */], true);
  }
  assertAssets(valuePath, value) {
    let assertion = this.assertType(valuePath, value, ["array" /* array */], true);
    if (assertion.status !== "ok") return;
    value = value;
    for (let index = 0; index < value.length; index++) {
      let value2 = value[index];
      this.assertType([...valuePath, index], value2, ["string" /* string */]);
    }
  }
  assertModIcons(valuePath, value) {
    let assertion = this.assertType(valuePath, value, ["object" /* object */], true);
    if (assertion.status !== "ok") return;
    value = value;
    for (let [key, value2] of Object.entries(value)) {
      this.assertType([...valuePath, key], value2, ["string" /* string */]);
    }
  }
};
function convertFromLegacy(data2) {
  var _a6, _b3;
  return {
    id: data2.name,
    version: data2.version,
    license: data2.license,
    title: data2.ccmodHumanName,
    description: data2.description,
    homepage: data2.homepage,
    icons: data2.icons,
    dependencies: (_a6 = data2.ccmodDependencies) != null ? _a6 : data2.dependencies,
    assets: (_b3 = data2.assets) == null ? void 0 : _b3.map((path) => path.startsWith("assets/") ? path.slice(7) : path),
    plugin: data2.plugin,
    preload: data2.preload,
    postload: data2.postload,
    prestart: data2.prestart,
    poststart: data2.main
  };
}

// packages/common/src/vendor-libs/semver.ts
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var require_semver = __commonJS({
  "node_modules/.pnpm/semver@6.3.0/node_modules/semver/semver.js"(exports, module) {
    exports = module.exports = SemVer;
    var debug;
    if (typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG)) {
      debug = function() {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift("SEMVER");
        console.log.apply(console, args);
      };
    } else {
      debug = function() {
      };
    }
    exports.SEMVER_SPEC_VERSION = "2.0.0";
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
    9007199254740991;
    var MAX_SAFE_COMPONENT_LENGTH = 16;
    var re = exports.re = [];
    var src = exports.src = [];
    var t = exports.tokens = {};
    var R = 0;
    function tok(n) {
      t[n] = R++;
    }
    tok("NUMERICIDENTIFIER");
    src[t.NUMERICIDENTIFIER] = "0|[1-9]\\d*";
    tok("NUMERICIDENTIFIERLOOSE");
    src[t.NUMERICIDENTIFIERLOOSE] = "[0-9]+";
    tok("NONNUMERICIDENTIFIER");
    src[t.NONNUMERICIDENTIFIER] = "\\d*[a-zA-Z-][a-zA-Z0-9-]*";
    tok("MAINVERSION");
    src[t.MAINVERSION] = "(" + src[t.NUMERICIDENTIFIER] + ")\\.(" + src[t.NUMERICIDENTIFIER] + ")\\.(" + src[t.NUMERICIDENTIFIER] + ")";
    tok("MAINVERSIONLOOSE");
    src[t.MAINVERSIONLOOSE] = "(" + src[t.NUMERICIDENTIFIERLOOSE] + ")\\.(" + src[t.NUMERICIDENTIFIERLOOSE] + ")\\.(" + src[t.NUMERICIDENTIFIERLOOSE] + ")";
    tok("PRERELEASEIDENTIFIER");
    src[t.PRERELEASEIDENTIFIER] = "(?:" + src[t.NUMERICIDENTIFIER] + "|" + src[t.NONNUMERICIDENTIFIER] + ")";
    tok("PRERELEASEIDENTIFIERLOOSE");
    src[t.PRERELEASEIDENTIFIERLOOSE] = "(?:" + src[t.NUMERICIDENTIFIERLOOSE] + "|" + src[t.NONNUMERICIDENTIFIER] + ")";
    tok("PRERELEASE");
    src[t.PRERELEASE] = "(?:-(" + src[t.PRERELEASEIDENTIFIER] + "(?:\\." + src[t.PRERELEASEIDENTIFIER] + ")*))";
    tok("PRERELEASELOOSE");
    src[t.PRERELEASELOOSE] = "(?:-?(" + src[t.PRERELEASEIDENTIFIERLOOSE] + "(?:\\." + src[t.PRERELEASEIDENTIFIERLOOSE] + ")*))";
    tok("BUILDIDENTIFIER");
    src[t.BUILDIDENTIFIER] = "[0-9A-Za-z-]+";
    tok("BUILD");
    src[t.BUILD] = "(?:\\+(" + src[t.BUILDIDENTIFIER] + "(?:\\." + src[t.BUILDIDENTIFIER] + ")*))";
    tok("FULL");
    tok("FULLPLAIN");
    src[t.FULLPLAIN] = "v?" + src[t.MAINVERSION] + src[t.PRERELEASE] + "?" + src[t.BUILD] + "?";
    src[t.FULL] = "^" + src[t.FULLPLAIN] + "$";
    tok("LOOSEPLAIN");
    src[t.LOOSEPLAIN] = "[v=\\s]*" + src[t.MAINVERSIONLOOSE] + src[t.PRERELEASELOOSE] + "?" + src[t.BUILD] + "?";
    tok("LOOSE");
    src[t.LOOSE] = "^" + src[t.LOOSEPLAIN] + "$";
    tok("GTLT");
    src[t.GTLT] = "((?:<|>)?=?)";
    tok("XRANGEIDENTIFIERLOOSE");
    src[t.XRANGEIDENTIFIERLOOSE] = src[t.NUMERICIDENTIFIERLOOSE] + "|x|X|\\*";
    tok("XRANGEIDENTIFIER");
    src[t.XRANGEIDENTIFIER] = src[t.NUMERICIDENTIFIER] + "|x|X|\\*";
    tok("XRANGEPLAIN");
    src[t.XRANGEPLAIN] = "[v=\\s]*(" + src[t.XRANGEIDENTIFIER] + ")(?:\\.(" + src[t.XRANGEIDENTIFIER] + ")(?:\\.(" + src[t.XRANGEIDENTIFIER] + ")(?:" + src[t.PRERELEASE] + ")?" + src[t.BUILD] + "?)?)?";
    tok("XRANGEPLAINLOOSE");
    src[t.XRANGEPLAINLOOSE] = "[v=\\s]*(" + src[t.XRANGEIDENTIFIERLOOSE] + ")(?:\\.(" + src[t.XRANGEIDENTIFIERLOOSE] + ")(?:\\.(" + src[t.XRANGEIDENTIFIERLOOSE] + ")(?:" + src[t.PRERELEASELOOSE] + ")?" + src[t.BUILD] + "?)?)?";
    tok("XRANGE");
    src[t.XRANGE] = "^" + src[t.GTLT] + "\\s*" + src[t.XRANGEPLAIN] + "$";
    tok("XRANGELOOSE");
    src[t.XRANGELOOSE] = "^" + src[t.GTLT] + "\\s*" + src[t.XRANGEPLAINLOOSE] + "$";
    tok("COERCE");
    src[t.COERCE] = "(^|[^\\d])(\\d{1," + MAX_SAFE_COMPONENT_LENGTH + "})(?:\\.(\\d{1," + MAX_SAFE_COMPONENT_LENGTH + "}))?(?:\\.(\\d{1," + MAX_SAFE_COMPONENT_LENGTH + "}))?(?:$|[^\\d])";
    tok("COERCERTL");
    re[t.COERCERTL] = new RegExp(src[t.COERCE], "g");
    tok("LONETILDE");
    src[t.LONETILDE] = "(?:~>?)";
    tok("TILDETRIM");
    src[t.TILDETRIM] = "(\\s*)" + src[t.LONETILDE] + "\\s+";
    re[t.TILDETRIM] = new RegExp(src[t.TILDETRIM], "g");
    var tildeTrimReplace = "$1~";
    tok("TILDE");
    src[t.TILDE] = "^" + src[t.LONETILDE] + src[t.XRANGEPLAIN] + "$";
    tok("TILDELOOSE");
    src[t.TILDELOOSE] = "^" + src[t.LONETILDE] + src[t.XRANGEPLAINLOOSE] + "$";
    tok("LONECARET");
    src[t.LONECARET] = "(?:\\^)";
    tok("CARETTRIM");
    src[t.CARETTRIM] = "(\\s*)" + src[t.LONECARET] + "\\s+";
    re[t.CARETTRIM] = new RegExp(src[t.CARETTRIM], "g");
    var caretTrimReplace = "$1^";
    tok("CARET");
    src[t.CARET] = "^" + src[t.LONECARET] + src[t.XRANGEPLAIN] + "$";
    tok("CARETLOOSE");
    src[t.CARETLOOSE] = "^" + src[t.LONECARET] + src[t.XRANGEPLAINLOOSE] + "$";
    tok("COMPARATORLOOSE");
    src[t.COMPARATORLOOSE] = "^" + src[t.GTLT] + "\\s*(" + src[t.LOOSEPLAIN] + ")$|^$";
    tok("COMPARATOR");
    src[t.COMPARATOR] = "^" + src[t.GTLT] + "\\s*(" + src[t.FULLPLAIN] + ")$|^$";
    tok("COMPARATORTRIM");
    src[t.COMPARATORTRIM] = "(\\s*)" + src[t.GTLT] + "\\s*(" + src[t.LOOSEPLAIN] + "|" + src[t.XRANGEPLAIN] + ")";
    re[t.COMPARATORTRIM] = new RegExp(src[t.COMPARATORTRIM], "g");
    var comparatorTrimReplace = "$1$2$3";
    tok("HYPHENRANGE");
    src[t.HYPHENRANGE] = "^\\s*(" + src[t.XRANGEPLAIN] + ")\\s+-\\s+(" + src[t.XRANGEPLAIN] + ")\\s*$";
    tok("HYPHENRANGELOOSE");
    src[t.HYPHENRANGELOOSE] = "^\\s*(" + src[t.XRANGEPLAINLOOSE] + ")\\s+-\\s+(" + src[t.XRANGEPLAINLOOSE] + ")\\s*$";
    tok("STAR");
    src[t.STAR] = "(<|>)?=?\\s*\\*";
    for (i = 0; i < R; i++) {
      debug(i, src[i]);
      if (!re[i]) {
        re[i] = new RegExp(src[i]);
      }
    }
    var i;
    exports.parse = parse;
    function parse(version, options) {
      if (!options || typeof options !== "object") {
        options = {
          loose: !!options,
          includePrerelease: false
        };
      }
      if (version instanceof SemVer) {
        return version;
      }
      if (typeof version !== "string") {
        return null;
      }
      if (version.length > MAX_LENGTH) {
        return null;
      }
      var r = options.loose ? re[t.LOOSE] : re[t.FULL];
      if (!r.test(version)) {
        return null;
      }
      try {
        return new SemVer(version, options);
      } catch (er) {
        return null;
      }
    }
    exports.valid = valid;
    function valid(version, options) {
      var v = parse(version, options);
      return v ? v.version : null;
    }
    exports.clean = clean;
    function clean(version, options) {
      var s = parse(version.trim().replace(/^[=v]+/, ""), options);
      return s ? s.version : null;
    }
    exports.SemVer = SemVer;
    function SemVer(version, options) {
      if (!options || typeof options !== "object") {
        options = {
          loose: !!options,
          includePrerelease: false
        };
      }
      if (version instanceof SemVer) {
        if (version.loose === options.loose) {
          return version;
        } else {
          version = version.version;
        }
      } else if (typeof version !== "string") {
        throw new TypeError("Invalid Version: " + version);
      }
      if (version.length > MAX_LENGTH) {
        throw new TypeError("version is longer than " + MAX_LENGTH + " characters");
      }
      if (!(this instanceof SemVer)) {
        return new SemVer(version, options);
      }
      debug("SemVer", version, options);
      this.options = options;
      this.loose = !!options.loose;
      var m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
      if (!m) {
        throw new TypeError("Invalid Version: " + version);
      }
      this.raw = version;
      this.major = +m[1];
      this.minor = +m[2];
      this.patch = +m[3];
      if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
        throw new TypeError("Invalid major version");
      }
      if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
        throw new TypeError("Invalid minor version");
      }
      if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
        throw new TypeError("Invalid patch version");
      }
      if (!m[4]) {
        this.prerelease = [];
      } else {
        this.prerelease = m[4].split(".").map(function(id) {
          if (/^[0-9]+$/.test(id)) {
            var num = +id;
            if (num >= 0 && num < MAX_SAFE_INTEGER) {
              return num;
            }
          }
          return id;
        });
      }
      this.build = m[5] ? m[5].split(".") : [];
      this.format();
    }
    SemVer.prototype.format = function() {
      this.version = this.major + "." + this.minor + "." + this.patch;
      if (this.prerelease.length) {
        this.version += "-" + this.prerelease.join(".");
      }
      return this.version;
    };
    SemVer.prototype.toString = function() {
      return this.version;
    };
    SemVer.prototype.compare = function(other) {
      debug("SemVer.compare", this.version, this.options, other);
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      return this.compareMain(other) || this.comparePre(other);
    };
    SemVer.prototype.compareMain = function(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
    };
    SemVer.prototype.comparePre = function(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      if (this.prerelease.length && !other.prerelease.length) {
        return -1;
      } else if (!this.prerelease.length && other.prerelease.length) {
        return 1;
      } else if (!this.prerelease.length && !other.prerelease.length) {
        return 0;
      }
      var i2 = 0;
      do {
        var a = this.prerelease[i2];
        var b = other.prerelease[i2];
        debug("prerelease compare", i2, a, b);
        if (a === void 0 && b === void 0) {
          return 0;
        } else if (b === void 0) {
          return 1;
        } else if (a === void 0) {
          return -1;
        } else if (a === b) {
          continue;
        } else {
          return compareIdentifiers(a, b);
        }
      } while (++i2);
    };
    SemVer.prototype.compareBuild = function(other) {
      if (!(other instanceof SemVer)) {
        other = new SemVer(other, this.options);
      }
      var i2 = 0;
      do {
        var a = this.build[i2];
        var b = other.build[i2];
        debug("prerelease compare", i2, a, b);
        if (a === void 0 && b === void 0) {
          return 0;
        } else if (b === void 0) {
          return 1;
        } else if (a === void 0) {
          return -1;
        } else if (a === b) {
          continue;
        } else {
          return compareIdentifiers(a, b);
        }
      } while (++i2);
    };
    SemVer.prototype.inc = function(release, identifier) {
      switch (release) {
        case "premajor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor = 0;
          this.major++;
          this.inc("pre", identifier);
          break;
        case "preminor":
          this.prerelease.length = 0;
          this.patch = 0;
          this.minor++;
          this.inc("pre", identifier);
          break;
        case "prepatch":
          this.prerelease.length = 0;
          this.inc("patch", identifier);
          this.inc("pre", identifier);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          if (this.prerelease.length === 0) {
            this.inc("patch", identifier);
          }
          this.inc("pre", identifier);
          break;
        case "major":
          if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
            this.major++;
          }
          this.minor = 0;
          this.patch = 0;
          this.prerelease = [];
          break;
        case "minor":
          if (this.patch !== 0 || this.prerelease.length === 0) {
            this.minor++;
          }
          this.patch = 0;
          this.prerelease = [];
          break;
        case "patch":
          if (this.prerelease.length === 0) {
            this.patch++;
          }
          this.prerelease = [];
          break;
        // This probably shouldn't be used publicly.
        // 1.0.0 "pre" would become 1.0.0-0 which is the wrong direction.
        case "pre":
          if (this.prerelease.length === 0) {
            this.prerelease = [0];
          } else {
            var i2 = this.prerelease.length;
            while (--i2 >= 0) {
              if (typeof this.prerelease[i2] === "number") {
                this.prerelease[i2]++;
                i2 = -2;
              }
            }
            if (i2 === -1) {
              this.prerelease.push(0);
            }
          }
          if (identifier) {
            if (this.prerelease[0] === identifier) {
              if (isNaN(this.prerelease[1])) {
                this.prerelease = [identifier, 0];
              }
            } else {
              this.prerelease = [identifier, 0];
            }
          }
          break;
        default:
          throw new Error("invalid increment argument: " + release);
      }
      this.format();
      this.raw = this.version;
      return this;
    };
    exports.inc = inc;
    function inc(version, release, loose, identifier) {
      if (typeof loose === "string") {
        identifier = loose;
        loose = void 0;
      }
      try {
        return new SemVer(version, loose).inc(release, identifier).version;
      } catch (er) {
        return null;
      }
    }
    exports.diff = diff;
    function diff(version1, version2) {
      if (eq(version1, version2)) {
        return null;
      } else {
        var v1 = parse(version1);
        var v2 = parse(version2);
        var prefix = "";
        if (v1.prerelease.length || v2.prerelease.length) {
          prefix = "pre";
          var defaultResult = "prerelease";
        }
        for (var key in v1) {
          if (key === "major" || key === "minor" || key === "patch") {
            if (v1[key] !== v2[key]) {
              return prefix + key;
            }
          }
        }
        return defaultResult;
      }
    }
    exports.compareIdentifiers = compareIdentifiers;
    var numeric = /^[0-9]+$/;
    function compareIdentifiers(a, b) {
      var anum = numeric.test(a);
      var bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
    }
    exports.rcompareIdentifiers = rcompareIdentifiers;
    function rcompareIdentifiers(a, b) {
      return compareIdentifiers(b, a);
    }
    exports.major = major;
    function major(a, loose) {
      return new SemVer(a, loose).major;
    }
    exports.minor = minor;
    function minor(a, loose) {
      return new SemVer(a, loose).minor;
    }
    exports.patch = patch;
    function patch(a, loose) {
      return new SemVer(a, loose).patch;
    }
    exports.compare = compare2;
    function compare2(a, b, loose) {
      return new SemVer(a, loose).compare(new SemVer(b, loose));
    }
    exports.compareLoose = compareLoose;
    function compareLoose(a, b) {
      return compare2(a, b, true);
    }
    exports.compareBuild = compareBuild;
    function compareBuild(a, b, loose) {
      var versionA = new SemVer(a, loose);
      var versionB = new SemVer(b, loose);
      return versionA.compare(versionB) || versionA.compareBuild(versionB);
    }
    exports.rcompare = rcompare;
    function rcompare(a, b, loose) {
      return compare2(b, a, loose);
    }
    exports.sort = sort;
    function sort(list, loose) {
      return list.sort(function(a, b) {
        return exports.compareBuild(a, b, loose);
      });
    }
    exports.rsort = rsort;
    function rsort(list, loose) {
      return list.sort(function(a, b) {
        return exports.compareBuild(b, a, loose);
      });
    }
    exports.gt = gt;
    function gt(a, b, loose) {
      return compare2(a, b, loose) > 0;
    }
    exports.lt = lt;
    function lt(a, b, loose) {
      return compare2(a, b, loose) < 0;
    }
    exports.eq = eq;
    function eq(a, b, loose) {
      return compare2(a, b, loose) === 0;
    }
    exports.neq = neq;
    function neq(a, b, loose) {
      return compare2(a, b, loose) !== 0;
    }
    exports.gte = gte;
    function gte(a, b, loose) {
      return compare2(a, b, loose) >= 0;
    }
    exports.lte = lte;
    function lte(a, b, loose) {
      return compare2(a, b, loose) <= 0;
    }
    exports.cmp = cmp;
    function cmp(a, op, b, loose) {
      switch (op) {
        case "===":
          if (typeof a === "object")
            a = a.version;
          if (typeof b === "object")
            b = b.version;
          return a === b;
        case "!==":
          if (typeof a === "object")
            a = a.version;
          if (typeof b === "object")
            b = b.version;
          return a !== b;
        case "":
        case "=":
        case "==":
          return eq(a, b, loose);
        case "!=":
          return neq(a, b, loose);
        case ">":
          return gt(a, b, loose);
        case ">=":
          return gte(a, b, loose);
        case "<":
          return lt(a, b, loose);
        case "<=":
          return lte(a, b, loose);
        default:
          throw new TypeError("Invalid operator: " + op);
      }
    }
    exports.Comparator = Comparator;
    function Comparator(comp, options) {
      if (!options || typeof options !== "object") {
        options = {
          loose: !!options,
          includePrerelease: false
        };
      }
      if (comp instanceof Comparator) {
        if (comp.loose === !!options.loose) {
          return comp;
        } else {
          comp = comp.value;
        }
      }
      if (!(this instanceof Comparator)) {
        return new Comparator(comp, options);
      }
      debug("comparator", comp, options);
      this.options = options;
      this.loose = !!options.loose;
      this.parse(comp);
      if (this.semver === ANY) {
        this.value = "";
      } else {
        this.value = this.operator + this.semver.version;
      }
      debug("comp", this);
    }
    var ANY = {};
    Comparator.prototype.parse = function(comp) {
      var r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
      var m = comp.match(r);
      if (!m) {
        throw new TypeError("Invalid comparator: " + comp);
      }
      this.operator = m[1] !== void 0 ? m[1] : "";
      if (this.operator === "=") {
        this.operator = "";
      }
      if (!m[2]) {
        this.semver = ANY;
      } else {
        this.semver = new SemVer(m[2], this.options.loose);
      }
    };
    Comparator.prototype.toString = function() {
      return this.value;
    };
    Comparator.prototype.test = function(version) {
      debug("Comparator.test", version, this.options.loose);
      if (this.semver === ANY || version === ANY) {
        return true;
      }
      if (typeof version === "string") {
        try {
          version = new SemVer(version, this.options);
        } catch (er) {
          return false;
        }
      }
      return cmp(version, this.operator, this.semver, this.options);
    };
    Comparator.prototype.intersects = function(comp, options) {
      if (!(comp instanceof Comparator)) {
        throw new TypeError("a Comparator is required");
      }
      if (!options || typeof options !== "object") {
        options = {
          loose: !!options,
          includePrerelease: false
        };
      }
      var rangeTmp;
      if (this.operator === "") {
        if (this.value === "") {
          return true;
        }
        rangeTmp = new Range(comp.value, options);
        return satisfies(this.value, rangeTmp, options);
      } else if (comp.operator === "") {
        if (comp.value === "") {
          return true;
        }
        rangeTmp = new Range(this.value, options);
        return satisfies(comp.semver, rangeTmp, options);
      }
      var sameDirectionIncreasing = (this.operator === ">=" || this.operator === ">") && (comp.operator === ">=" || comp.operator === ">");
      var sameDirectionDecreasing = (this.operator === "<=" || this.operator === "<") && (comp.operator === "<=" || comp.operator === "<");
      var sameSemVer = this.semver.version === comp.semver.version;
      var differentDirectionsInclusive = (this.operator === ">=" || this.operator === "<=") && (comp.operator === ">=" || comp.operator === "<=");
      var oppositeDirectionsLessThan = cmp(this.semver, "<", comp.semver, options) && ((this.operator === ">=" || this.operator === ">") && (comp.operator === "<=" || comp.operator === "<"));
      var oppositeDirectionsGreaterThan = cmp(this.semver, ">", comp.semver, options) && ((this.operator === "<=" || this.operator === "<") && (comp.operator === ">=" || comp.operator === ">"));
      return sameDirectionIncreasing || sameDirectionDecreasing || sameSemVer && differentDirectionsInclusive || oppositeDirectionsLessThan || oppositeDirectionsGreaterThan;
    };
    exports.Range = Range;
    function Range(range, options) {
      if (!options || typeof options !== "object") {
        options = {
          loose: !!options,
          includePrerelease: false
        };
      }
      if (range instanceof Range) {
        if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
          return range;
        } else {
          return new Range(range.raw, options);
        }
      }
      if (range instanceof Comparator) {
        return new Range(range.value, options);
      }
      if (!(this instanceof Range)) {
        return new Range(range, options);
      }
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      this.raw = range;
      this.set = range.split(/\s*\|\|\s*/).map(function(range2) {
        return this.parseRange(range2.trim());
      }, this).filter(function(c) {
        return c.length;
      });
      if (!this.set.length) {
        throw new TypeError("Invalid SemVer Range: " + range);
      }
      this.format();
    }
    Range.prototype.format = function() {
      this.range = this.set.map(function(comps) {
        return comps.join(" ").trim();
      }).join("||").trim();
      return this.range;
    };
    Range.prototype.toString = function() {
      return this.range;
    };
    Range.prototype.parseRange = function(range) {
      var loose = this.options.loose;
      range = range.trim();
      var hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
      range = range.replace(hr, hyphenReplace);
      debug("hyphen replace", range);
      range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
      debug("comparator trim", range, re[t.COMPARATORTRIM]);
      range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
      range = range.replace(re[t.CARETTRIM], caretTrimReplace);
      range = range.split(/\s+/).join(" ");
      var compRe = loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
      var set = range.split(" ").map(function(comp) {
        return parseComparator(comp, this.options);
      }, this).join(" ").split(/\s+/);
      if (this.options.loose) {
        set = set.filter(function(comp) {
          return !!comp.match(compRe);
        });
      }
      set = set.map(function(comp) {
        return new Comparator(comp, this.options);
      }, this);
      return set;
    };
    Range.prototype.intersects = function(range, options) {
      if (!(range instanceof Range)) {
        throw new TypeError("a Range is required");
      }
      return this.set.some(function(thisComparators) {
        return isSatisfiable(thisComparators, options) && range.set.some(function(rangeComparators) {
          return isSatisfiable(rangeComparators, options) && thisComparators.every(function(thisComparator) {
            return rangeComparators.every(function(rangeComparator) {
              return thisComparator.intersects(rangeComparator, options);
            });
          });
        });
      });
    };
    function isSatisfiable(comparators, options) {
      var result = true;
      var remainingComparators = comparators.slice();
      var testComparator = remainingComparators.pop();
      while (result && remainingComparators.length) {
        result = remainingComparators.every(function(otherComparator) {
          return testComparator.intersects(otherComparator, options);
        });
        testComparator = remainingComparators.pop();
      }
      return result;
    }
    exports.toComparators = toComparators;
    function toComparators(range, options) {
      return new Range(range, options).set.map(function(comp) {
        return comp.map(function(c) {
          return c.value;
        }).join(" ").trim().split(" ");
      });
    }
    function parseComparator(comp, options) {
      debug("comp", comp, options);
      comp = replaceCarets(comp, options);
      debug("caret", comp);
      comp = replaceTildes(comp, options);
      debug("tildes", comp);
      comp = replaceXRanges(comp, options);
      debug("xrange", comp);
      comp = replaceStars(comp, options);
      debug("stars", comp);
      return comp;
    }
    function isX(id) {
      return !id || id.toLowerCase() === "x" || id === "*";
    }
    function replaceTildes(comp, options) {
      return comp.trim().split(/\s+/).map(function(comp2) {
        return replaceTilde(comp2, options);
      }).join(" ");
    }
    function replaceTilde(comp, options) {
      var r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
      return comp.replace(r, function(_, M, m, p, pr) {
        debug("tilde", comp, _, M, m, p, pr);
        var ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = ">=" + M + ".0.0 <" + (+M + 1) + ".0.0";
        } else if (isX(p)) {
          ret = ">=" + M + "." + m + ".0 <" + M + "." + (+m + 1) + ".0";
        } else if (pr) {
          debug("replaceTilde pr", pr);
          ret = ">=" + M + "." + m + "." + p + "-" + pr + " <" + M + "." + (+m + 1) + ".0";
        } else {
          ret = ">=" + M + "." + m + "." + p + " <" + M + "." + (+m + 1) + ".0";
        }
        debug("tilde return", ret);
        return ret;
      });
    }
    function replaceCarets(comp, options) {
      return comp.trim().split(/\s+/).map(function(comp2) {
        return replaceCaret(comp2, options);
      }).join(" ");
    }
    function replaceCaret(comp, options) {
      debug("caret", comp, options);
      var r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
      return comp.replace(r, function(_, M, m, p, pr) {
        debug("caret", comp, _, M, m, p, pr);
        var ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = ">=" + M + ".0.0 <" + (+M + 1) + ".0.0";
        } else if (isX(p)) {
          if (M === "0") {
            ret = ">=" + M + "." + m + ".0 <" + M + "." + (+m + 1) + ".0";
          } else {
            ret = ">=" + M + "." + m + ".0 <" + (+M + 1) + ".0.0";
          }
        } else if (pr) {
          debug("replaceCaret pr", pr);
          if (M === "0") {
            if (m === "0") {
              ret = ">=" + M + "." + m + "." + p + "-" + pr + " <" + M + "." + m + "." + (+p + 1);
            } else {
              ret = ">=" + M + "." + m + "." + p + "-" + pr + " <" + M + "." + (+m + 1) + ".0";
            }
          } else {
            ret = ">=" + M + "." + m + "." + p + "-" + pr + " <" + (+M + 1) + ".0.0";
          }
        } else {
          debug("no pr");
          if (M === "0") {
            if (m === "0") {
              ret = ">=" + M + "." + m + "." + p + " <" + M + "." + m + "." + (+p + 1);
            } else {
              ret = ">=" + M + "." + m + "." + p + " <" + M + "." + (+m + 1) + ".0";
            }
          } else {
            ret = ">=" + M + "." + m + "." + p + " <" + (+M + 1) + ".0.0";
          }
        }
        debug("caret return", ret);
        return ret;
      });
    }
    function replaceXRanges(comp, options) {
      debug("replaceXRanges", comp, options);
      return comp.split(/\s+/).map(function(comp2) {
        return replaceXRange(comp2, options);
      }).join(" ");
    }
    function replaceXRange(comp, options) {
      comp = comp.trim();
      var r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
      return comp.replace(r, function(ret, gtlt, M, m, p, pr) {
        debug("xRange", comp, ret, gtlt, M, m, p, pr);
        var xM = isX(M);
        var xm = xM || isX(m);
        var xp = xm || isX(p);
        var anyX = xp;
        if (gtlt === "=" && anyX) {
          gtlt = "";
        }
        pr = options.includePrerelease ? "-0" : "";
        if (xM) {
          if (gtlt === ">" || gtlt === "<") {
            ret = "<0.0.0-0";
          } else {
            ret = "*";
          }
        } else if (gtlt && anyX) {
          if (xm) {
            m = 0;
          }
          p = 0;
          if (gtlt === ">") {
            gtlt = ">=";
            if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else {
              m = +m + 1;
              p = 0;
            }
          } else if (gtlt === "<=") {
            gtlt = "<";
            if (xm) {
              M = +M + 1;
            } else {
              m = +m + 1;
            }
          }
          ret = gtlt + M + "." + m + "." + p + pr;
        } else if (xm) {
          ret = ">=" + M + ".0.0" + pr + " <" + (+M + 1) + ".0.0" + pr;
        } else if (xp) {
          ret = ">=" + M + "." + m + ".0" + pr + " <" + M + "." + (+m + 1) + ".0" + pr;
        }
        debug("xRange return", ret);
        return ret;
      });
    }
    function replaceStars(comp, options) {
      debug("replaceStars", comp, options);
      return comp.trim().replace(re[t.STAR], "");
    }
    function hyphenReplace($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) {
      if (isX(fM)) {
        from = "";
      } else if (isX(fm)) {
        from = ">=" + fM + ".0.0";
      } else if (isX(fp)) {
        from = ">=" + fM + "." + fm + ".0";
      } else {
        from = ">=" + from;
      }
      if (isX(tM)) {
        to = "";
      } else if (isX(tm)) {
        to = "<" + (+tM + 1) + ".0.0";
      } else if (isX(tp)) {
        to = "<" + tM + "." + (+tm + 1) + ".0";
      } else if (tpr) {
        to = "<=" + tM + "." + tm + "." + tp + "-" + tpr;
      } else {
        to = "<=" + to;
      }
      return (from + " " + to).trim();
    }
    Range.prototype.test = function(version) {
      if (!version) {
        return false;
      }
      if (typeof version === "string") {
        try {
          version = new SemVer(version, this.options);
        } catch (er) {
          return false;
        }
      }
      for (var i2 = 0; i2 < this.set.length; i2++) {
        if (testSet(this.set[i2], version, this.options)) {
          return true;
        }
      }
      return false;
    };
    function testSet(set, version, options) {
      for (var i2 = 0; i2 < set.length; i2++) {
        if (!set[i2].test(version)) {
          return false;
        }
      }
      if (version.prerelease.length && !options.includePrerelease) {
        for (i2 = 0; i2 < set.length; i2++) {
          debug(set[i2].semver);
          if (set[i2].semver === ANY) {
            continue;
          }
          if (set[i2].semver.prerelease.length > 0) {
            var allowed = set[i2].semver;
            if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    }
    exports.satisfies = satisfies;
    function satisfies(version, range, options) {
      try {
        range = new Range(range, options);
      } catch (er) {
        return false;
      }
      return range.test(version);
    }
    exports.maxSatisfying = maxSatisfying;
    function maxSatisfying(versions, range, options) {
      var max2 = null;
      var maxSV = null;
      try {
        var rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach(function(v) {
        if (rangeObj.test(v)) {
          if (!max2 || maxSV.compare(v) === -1) {
            max2 = v;
            maxSV = new SemVer(max2, options);
          }
        }
      });
      return max2;
    }
    exports.minSatisfying = minSatisfying;
    function minSatisfying(versions, range, options) {
      var min = null;
      var minSV = null;
      try {
        var rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach(function(v) {
        if (rangeObj.test(v)) {
          if (!min || minSV.compare(v) === 1) {
            min = v;
            minSV = new SemVer(min, options);
          }
        }
      });
      return min;
    }
    exports.minVersion = minVersion;
    function minVersion(range, loose) {
      range = new Range(range, loose);
      var minver = new SemVer("0.0.0");
      if (range.test(minver)) {
        return minver;
      }
      minver = new SemVer("0.0.0-0");
      if (range.test(minver)) {
        return minver;
      }
      minver = null;
      for (var i2 = 0; i2 < range.set.length; ++i2) {
        var comparators = range.set[i2];
        comparators.forEach(function(comparator) {
          var compver = new SemVer(comparator.semver.version);
          switch (comparator.operator) {
            case ">":
              if (compver.prerelease.length === 0) {
                compver.patch++;
              } else {
                compver.prerelease.push(0);
              }
              compver.raw = compver.format();
            /* fallthrough */
            case "":
            case ">=":
              if (!minver || gt(minver, compver)) {
                minver = compver;
              }
              break;
            case "<":
            case "<=":
              break;
            /* istanbul ignore next */
            default:
              throw new Error("Unexpected operation: " + comparator.operator);
          }
        });
      }
      if (minver && range.test(minver)) {
        return minver;
      }
      return null;
    }
    exports.validRange = validRange;
    function validRange(range, options) {
      try {
        return new Range(range, options).range || "*";
      } catch (er) {
        return null;
      }
    }
    exports.ltr = ltr;
    function ltr(version, range, options) {
      return outside(version, range, "<", options);
    }
    exports.gtr = gtr;
    function gtr(version, range, options) {
      return outside(version, range, ">", options);
    }
    exports.outside = outside;
    function outside(version, range, hilo, options) {
      version = new SemVer(version, options);
      range = new Range(range, options);
      var gtfn, ltefn, ltfn, comp, ecomp;
      switch (hilo) {
        case ">":
          gtfn = gt;
          ltefn = lte;
          ltfn = lt;
          comp = ">";
          ecomp = ">=";
          break;
        case "<":
          gtfn = lt;
          ltefn = gte;
          ltfn = gt;
          comp = "<";
          ecomp = "<=";
          break;
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"');
      }
      if (satisfies(version, range, options)) {
        return false;
      }
      for (var i2 = 0; i2 < range.set.length; ++i2) {
        var comparators = range.set[i2];
        var high = null;
        var low = null;
        comparators.forEach(function(comparator) {
          if (comparator.semver === ANY) {
            comparator = new Comparator(">=0.0.0");
          }
          high = high || comparator;
          low = low || comparator;
          if (gtfn(comparator.semver, high.semver, options)) {
            high = comparator;
          } else if (ltfn(comparator.semver, low.semver, options)) {
            low = comparator;
          }
        });
        if (high.operator === comp || high.operator === ecomp) {
          return false;
        }
        if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
          return false;
        } else if (low.operator === ecomp && ltfn(version, low.semver)) {
          return false;
        }
      }
      return true;
    }
    exports.prerelease = prerelease;
    function prerelease(version, options) {
      var parsed = parse(version, options);
      return parsed && parsed.prerelease.length ? parsed.prerelease : null;
    }
    exports.intersects = intersects;
    function intersects(r1, r2, options) {
      r1 = new Range(r1, options);
      r2 = new Range(r2, options);
      return r1.intersects(r2);
    }
    exports.coerce = coerce;
    function coerce(version, options) {
      if (version instanceof SemVer) {
        return version;
      }
      if (typeof version === "number") {
        version = String(version);
      }
      if (typeof version !== "string") {
        return null;
      }
      options = options || {};
      var match = null;
      if (!options.rtl) {
        match = version.match(re[t.COERCE]);
      } else {
        var next;
        while ((next = re[t.COERCERTL].exec(version)) && (!match || match.index + match[0].length !== version.length)) {
          if (!match || next.index + next[0].length !== match.index + match[0].length) {
            match = next;
          }
          re[t.COERCERTL].lastIndex = next.index + next[1].length + next[2].length;
        }
        re[t.COERCERTL].lastIndex = -1;
      }
      if (match === null) {
        return null;
      }
      return parse(match[2] + "." + (match[3] || "0") + "." + (match[4] || "0"), options);
    }
  }
});
var semver_default = require_semver();

// packages/core/src/mod.ts
var Mod = class {
  constructor(baseDirectory, manifest, legacyMode) {
    this.baseDirectory = baseDirectory;
    this.manifest = manifest;
    this.legacyMode = legacyMode;
    this.version = null;
    this.assets = /* @__PURE__ */ new Set();
    this.pluginClassInstance = null;
    var _a6, _b3;
    if (!this.baseDirectory.endsWith("/")) this.baseDirectory += "/";
    this.id = this.manifest.id;
    if (this.manifest.version != null) {
      try {
        this.version = new semver_default.SemVer(this.manifest.version, {
          includePrerelease: true
        });
      } catch (err2) {
        if (errorHasMessage(err2)) {
          err2.message = `mod version '${this.manifest.version}' is not a valid semver version: ${err2.message}`;
        }
        throw err2;
      }
    }
    let dependencies = /* @__PURE__ */ new Map();
    if (this.manifest.dependencies != null) {
      for (let [depId, dep] of Object.entries(this.manifest.dependencies)) {
        if (typeof dep === "string") dep = { version: dep };
        let depVersionRange;
        try {
          depVersionRange = new semver_default.Range(dep.version, {
            includePrerelease: true
          });
        } catch (err2) {
          if (errorHasMessage(err2)) {
            err2.message = `dependency version constraint '${dep.version}' for mod '${depId}' is not a valid semver range: ${err2.message}`;
          }
          throw err2;
        }
        dependencies.set(depId, {
          version: depVersionRange,
          optional: (_a6 = dep.optional) != null ? _a6 : false
        });
      }
    }
    this.dependencies = dependencies;
    this.assetsDirectory = this.resolvePath(`${(_b3 = this.manifest.assetsDir) != null ? _b3 : "assets"}/`);
  }
  async findAllAssets() {
    var _a6;
    let assets = [];
    if (this.manifest.assets != null) {
      assets = this.manifest.assets.map((path) => jailRelative(path));
    } else {
      assets = (_a6 = await findRecursively3(this.assetsDirectory)) != null ? _a6 : [];
    }
    this.assets = new Set(assets);
  }
  async initClass() {
    let script = this.manifest.plugin;
    if (script == null) return;
    let scriptFullPath = this.resolvePath(script);
    let module;
    try {
      module = await import(cwdFilePathToURL(scriptFullPath).href);
    } catch (err2) {
      if (errorHasMessage(err2)) {
        err2.message = `Error while importing '${scriptFullPath}': ${err2.message}`;
      }
      throw err2;
    }
    if (!hasKey(module, "default")) {
      throw new Error(`Module '${scriptFullPath}' has no default export`);
    }
    let ModPluginClass = module.default;
    this.pluginClassInstance = new ModPluginClass(this);
  }
  async executeStage(stage) {
    let pluginCls = this.pluginClassInstance;
    if (pluginCls != null) {
      if (!this.legacyMode) {
        if (stage in pluginCls) await pluginCls[stage](this);
      } else {
        let legacyPluginCls = pluginCls;
        let methodName = stage === "poststart" ? "main" : stage;
        if (methodName in legacyPluginCls) await legacyPluginCls[methodName]();
      }
    }
    let script = this.manifest[stage];
    if (script == null) return;
    let scriptFullPath = this.resolvePath(script);
    await import(cwdFilePathToURL(scriptFullPath).href);
  }
  resolvePath(path) {
    return join(this.baseDirectory, jailRelative(path));
  }
};

// packages/common/src/resources.ts
function loadStylesheet(url, options) {
  return new Promise((resolve, reject) => {
    options = options != null ? options : {};
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    if (options.type != null) link.type = options.type;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load stylesheet '${url}'`));
    document.head.appendChild(link);
  });
}
function loadScript(url, options) {
  return new Promise((resolve, reject) => {
    options = options != null ? options : {};
    let script = document.createElement("script");
    script.src = url;
    if (options.type != null) script.type = options.type;
    if (options.async != null) script.async = options.async;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script '${url}'`));
    document.body.appendChild(script);
  });
}

// packages/core/src/game.ts
var KNOWN_EXTENSION_IDS = /* @__PURE__ */ new Set([
  "fish-gear",
  "flying-hedgehag",
  "manlea",
  "ninja-skin",
  "post-game",
  "scorpion-robo",
  "snowman-tank"
]);
async function loadVersion(config) {
  let changelogText = await loadText4(
    jailRelative(join(config.gameAssetsDir, "data/changelog.json"))
  );
  let { changelog } = JSON.parse(changelogText);
  let latestEntry = changelog[0];
  let version = new semver_default.SemVer(latestEntry.version);
  let hotfix = 0;
  let changes = [];
  if (latestEntry.changes != null) changes.push(...latestEntry.changes);
  if (latestEntry.fixes != null) changes.push(...latestEntry.fixes);
  for (let change of changes) {
    let match = /^\W*HOTFIX\((\d+)\)/i.exec(change);
    if (match != null && match.length === 2) {
      hotfix = Math.max(hotfix, parseInt(match[1], 10));
    }
  }
  return { version, hotfix };
}
async function buildNecessaryDOM(config) {
  document.head.appendChild(
    html("base", {
      attrs: {
        href: cwdFilePathToURL(join(config.gameAssetsDir, "/"), window.location.origin).href
      }
    })
  );
  document.body.appendChild(
    html("div", {
      id: "game",
      children: [
        html("canvas", {
          id: "canvas"
        })
      ]
    })
  );
  document.body.style.overflow = "hidden";
  Object.assign(window, config.impactConfig);
  await config.onGameDOMCreated();
  await Promise.all([
    ...config.stylesheetURLs.map((url) => loadStylesheet(url)),
    ...config.scriptURLs.map(
      (url) => (
        // async is turned off so that these scripts are loaded in the order of
        // addition
        loadScript(url, { async: false })
      )
    )
  ]);
}
async function loadMainScript(config, eventReceiver) {
  let domReadyCallback = null;
  callOnImpactInit(() => {
    domReadyCallback = ig._DOMReady;
    ig._DOMReady = () => {
    };
    eventReceiver.onImpactInit();
  });
  await loadScript(config.gameScriptURL, { async: false });
  if (!(domReadyCallback != null)) {
    throw new Error("Assertion failed: domReadyCallback != null");
  }
  return domReadyCallback;
}
function callOnImpactInit(callback) {
  Object.defineProperty(window, "ig", {
    configurable: true,
    enumerable: true,
    get() {
      return void 0;
    },
    set(value) {
      delete window.ig;
      window.ig = value;
      callback();
    }
  });
}
function getStartFunction() {
  return new Promise((resolve) => {
    (function waitForStartFunction() {
      if (typeof window.startCrossCode === "function") {
        resolve(window.startCrossCode);
      } else {
        console.log("waiting for startCrossCode()...");
        setTimeout(waitForStartFunction, 100);
      }
    })();
  });
}
function getDelegateActivationFunction() {
  return new Promise((resolve) => {
    if (ig.system.delegate == null) {
      let realSetDelegate = ig.system.setDelegate;
      ig.system.setDelegate = function(...args) {
        ig.system.setDelegate = realSetDelegate;
        resolve(() => realSetDelegate.apply(this, args));
      };
    } else {
      resolve(() => {
      });
    }
  });
}

// packages/core/src/mod-data-storage.ts
var _a3, _b2;
var fs2 = (_b2 = (_a3 = window.require) == null ? void 0 : _a3.call(window, "fs")) == null ? void 0 : _b2.promises;
var _a4;
var pathsNative = (_a4 = window.require) == null ? void 0 : _a4.call(window, "path");
var FILE_NAME = "cc-mod-settings.json";
var fileDir = function getFilePath() {
  return null;
  if (typeof nw === "undefined") return null;
  let saveDirPath = nw.App.dataPath;
  let userDataIndex = saveDirPath.indexOf("\\User Data\\Default");
  if (userDataIndex >= 0) saveDirPath = saveDirPath.slice(0, userDataIndex);
  return saveDirPath;
}();
var data = /* @__PURE__ */ new Map();
var queuedWritesPromise = null;
var queuedWritesFlag = false;
async function readImmediately() {
  data.clear();
  if (fileDir != null) {
    let rawData;
    try {
      rawData = await fs2.readFile(pathsNative.join(fileDir, FILE_NAME));
    } catch (err2) {
      if (errorHasCode(err2) && err2.code === "ENOENT") return;
      throw err2;
    }
    deserialize(rawData);
  } else {
    readFromLocalStorage();
  }
}
async function writeImmediately() {
  if (fileDir != null) {
    let rawData = serialize();
    let filePath = pathsNative.join(fileDir, FILE_NAME);
    let tmpFilePath = pathsNative.join(fileDir, `~${FILE_NAME}`);
    await fs2.writeFile(tmpFilePath, rawData);
    await fs2.rename(tmpFilePath, filePath);
  } else {
    writeToLocalStorage();
  }
}
async function write() {
  if (queuedWritesPromise == null) {
    let queuedWritesResolve = null;
    queuedWritesPromise = new Promise((resolve) => {
      queuedWritesResolve = resolve;
    });
    do {
      queuedWritesFlag = false;
      try {
        await writeImmediately();
      } catch (err2) {
        console.error("Error while writing mod data and settings:", err2);
      }
    } while (queuedWritesFlag);
    queuedWritesPromise = null;
    queuedWritesResolve();
  } else {
    queuedWritesFlag = true;
    await queuedWritesPromise;
  }
}
function deserialize(rawData) {
  let jsonData = JSON.parse(rawData.toString("utf8"));
  if (jsonData.version !== 1) {
    throw new Error(`Unsupported format version '${jsonData.version}'`);
  }
  for (let [modID, modEntry] of Object.entries(jsonData.data)) {
    data.set(modID, modEntry);
  }
}
function readFromLocalStorage() {
  for (let [key, value] of Object.entries(localStorage)) {
    let match = /^modEnabled-(.+)$/.exec(key);
    if (match != null && match.length === 2) {
      let modID = match[1];
      data.set(modID, { enabled: value !== "false" });
    }
  }
}
function serialize() {
  let jsonData = { version: 1, data: {} };
  for (let [modID, modEntry] of data) {
    jsonData.data[modID] = modEntry;
  }
  return Buffer.from(JSON.stringify(jsonData), "utf8");
}
function writeToLocalStorage() {
  for (let [modID, modEntry] of data) {
    localStorage.setItem(`modEnabled-${modID}`, modEntry.enabled ? "true" : "false");
  }
}
function isModEnabled(id) {
  var _a6, _b3;
  return (_b3 = (_a6 = data.get(id)) == null ? void 0 : _a6.enabled) != null ? _b3 : true;
}
function setModEnabled(id, enabled) {
  mapGetOrInsert(data, id, { enabled }).enabled = enabled;
}
var namespace = {
  FILE_NAME,
  fileDir,
  data,
  readImmediately,
  writeImmediately,
  write,
  isModEnabled,
  setModEnabled
};

// packages/core/src/dependency-resolver.ts
function sortModsInLoadOrder(runtimeMod, installedMods) {
  let sortedMods = /* @__PURE__ */ new Map();
  sortedMods.set(runtimeMod.id, runtimeMod);
  let unsortedModsList = [];
  for (let mod of installedMods.values()) {
    if (mod !== runtimeMod) unsortedModsList.push(mod);
  }
  unsortedModsList.sort((mod1, mod2) => compare(mod1.id, mod2.id));
  while (unsortedModsList.length > 0) {
    let dependencyCyclesExist = true;
    for (let i = 0; i < unsortedModsList.length; ) {
      let mod = unsortedModsList[i];
      if (!modHasUnsortedInstalledDependencies(mod, sortedMods, installedMods)) {
        unsortedModsList.splice(i, 1);
        sortedMods.set(mod.id, mod);
        dependencyCyclesExist = false;
      } else {
        i++;
      }
    }
    if (dependencyCyclesExist) {
      throw new Error(
        `Detected a dependency cycle, most likely in the following mods: ${unsortedModsList.map((mod) => mod.id).join(", ")}`
      );
    }
  }
  return sortedMods;
}
function modHasUnsortedInstalledDependencies(mod, sortedMods, installedMods) {
  for (let depId of mod.dependencies.keys()) {
    if (!sortedMods.has(depId) && installedMods.has(depId)) return true;
  }
  return false;
}
function verifyModDependencies(mod, installedMods, virtualPackages, installedExtensions, enabledExtensions, loadedMods) {
  let problems = [];
  for (let [depId, dep] of mod.dependencies) {
    if (depId === mod.id) {
      problems.push("a mod can't depend on itself");
    } else {
      let problem = checkDependencyConstraint(
        depId,
        dep,
        installedMods,
        virtualPackages,
        installedExtensions,
        enabledExtensions,
        loadedMods
      );
      if (problem != null) problems.push(problem);
    }
  }
  return problems;
}
function checkDependencyConstraint(depId, depConstraint, installedMods, virtualPackages, installedExtensions, enabledExtensions, loadedMods) {
  let depTitle = depId;
  let depVersion = null;
  let depIsInstalled = false;
  let depIsEnabled = false;
  let depIsLoaded = false;
  if (virtualPackages.has(depId)) {
    depVersion = virtualPackages.get(depId);
    depIsInstalled = true;
    depIsEnabled = true;
    depIsLoaded = true;
  } else if (installedExtensions.has(depId) || KNOWN_EXTENSION_IDS.has(depId)) {
    depTitle = `extension '${depId}'`;
    depIsInstalled = installedExtensions.has(depId);
    if (depIsInstalled) {
      depVersion = installedExtensions.get(depId);
      depIsEnabled = enabledExtensions.has(depId);
      depIsLoaded = depIsEnabled;
    }
  } else {
    depTitle = `mod '${depId}'`;
    depIsInstalled = installedMods.has(depId);
    if (depIsInstalled) {
      let depMod = installedMods.get(depId);
      depVersion = depMod.version;
      depIsEnabled = isModEnabled(depId);
      depIsLoaded = loadedMods.has(depId);
    }
  }
  let { optional } = depConstraint;
  if (!depIsInstalled) {
    return optional ? null : `${depTitle} is not installed`;
  }
  if (depVersion == null) {
    return optional ? null : `${depTitle} doesn't have a version`;
  }
  if (!depIsEnabled) {
    return optional ? null : `${depTitle} is disabled`;
  }
  if (!depIsLoaded) {
    return optional ? null : `${depTitle} is not loaded`;
  }
  if (!depConstraint.version.test(depVersion)) {
    return `version of ${depTitle} (${depVersion}) is not in range '${depConstraint.version}'`;
  }
  return null;
}

// packages/common/src/console.ts
var _a5;
var nodejsUtil = (_a5 = window.require) == null ? void 0 : _a5.call(window, "util");
var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2[LogLevel2["LOG"] = 2] = "LOG";
  LogLevel2[LogLevel2["WARN"] = 1] = "WARN";
  LogLevel2[LogLevel2["ERROR"] = 0] = "ERROR";
  return LogLevel2;
})(LogLevel || {});
var LOG_LEVEL_NAMES = ["LOG", "WARN", "ERROR"];
var DEFAULT_LOG_LEVELS = {
  LOG: false,
  WARN: true,
  ERROR: true
};
function logLevelsFromBitFlags(flags) {
  let levels = {};
  for (let level of LOG_LEVEL_NAMES) {
    let bit = LogLevel[level];
    levels[level] = Boolean(flags & 1 << bit);
  }
  return levels;
}
function getLogLevels() {
  let flagsStr = localStorage.getItem("logFlags");
  if (flagsStr != null) {
    let flags = parseInt(flagsStr, 10);
    if (Number.isSafeInteger(flags)) {
      return logLevelsFromBitFlags(flags);
    }
  }
  return { ...DEFAULT_LOG_LEVELS };
}
var EVENTS_BLOCKED_BY_CONSOLE = [
  "mousewheel",
  "contextmenu",
  "mousedown",
  "mouseup",
  "mousemove",
  "touchstart",
  "touchend",
  "touchmove",
  "keydown",
  "keyup",
  "keypress"
];
var LOG_LEVEL_APPEARENCE_DURATIONS = {
  LOG: 2e3,
  WARN: 5e3,
  ERROR: 15e3
};
var rootElement;
function inject() {
  let logLevels = getLogLevels();
  rootElement = html("div", {
    id: "ccloader-console",
    class: ["ccloader-overlay", "ccloader-vbox", "ccloader-vscroll"]
  });
  for (let eventType of EVENTS_BLOCKED_BY_CONSOLE) {
    rootElement.addEventListener(eventType, (event) => event.stopPropagation());
  }
  document.body.append(rootElement);
  function hookConsoleMethod(name, level) {
    let old = console[name];
    console[name] = function(...message) {
      let result = old.apply(this, message);
      log(level, ...message);
      return result;
    };
  }
  if (logLevels.ERROR) {
    hookConsoleMethod("error", 0 /* ERROR */);
  }
  if (logLevels.WARN) {
    hookConsoleMethod("warn", 1 /* WARN */);
  }
  if (logLevels.LOG) {
    hookConsoleMethod("log", 2 /* LOG */);
    hookConsoleMethod("info", 2 /* LOG */);
  }
}
function log(level, ...message) {
  let levelName = LogLevel[level];
  let el = html("div", {
    class: ["ccloader-message", `ccloader-${levelName}`],
    children: [`[${LogLevel[level]}] ${formatMessage(...message)}`]
  });
  rootElement.append(el);
  let removeTimeout = setTimeout(() => {
    el.remove();
  }, LOG_LEVEL_APPEARENCE_DURATIONS[levelName]);
  el.addEventListener("click", (event) => {
    event.stopPropagation();
    event.preventDefault();
    el.remove();
    clearTimeout(removeTimeout);
  });
  rootElement.scrollTo(0, rootElement.scrollHeight);
}
function formatMessage(...message) {
  if (nodejsUtil != null) {
    let formatFn = nodejsUtil.format;
    return formatFn(...message);
  } else {
    return message.map((m) => String(m)).join(" ");
  }
}

// packages/core/src/modloader.ts
async function boot() {
  inject();
  const serviceWorker = await loadServiceWorker();
  let modloaderMetadata = await loadModloaderMetadata();
  console.log(`CCLoader ${modloaderMetadata.version}`);
  let config = await load(modloaderMetadata.version);
  try {
    await readImmediately();
  } catch (err2) {
    if (errorHasMessage(err2)) {
      err2.message = `Failed to read mod data storage: ${err2.message}`;
    }
    throw err2;
  }
  console.log(`loaded mod data storage and settings, ${data.size} entries`);
  let { version: gameVersion, hotfix: gameVersionHotfix } = await loadVersion(config);
  console.log(`crosscode ${gameVersion}-${gameVersionHotfix}`);
  let runtimeModBaseDirectory = "./ccloader3/dist/runtime";
  let runtimeMod;
  try {
    runtimeMod = await loadModMetadata(runtimeModBaseDirectory);
    if (!(runtimeMod != null)) {
      throw new Error("Assertion failed: runtimeMod != null");
    }
  } catch (err2) {
    if (errorHasMessage(err2)) {
      err2.message = `Failed to load metadata of the runtime mod in '${runtimeModBaseDirectory}', please check if you installed CCLoader correctly! ${err2.message}`;
    }
    throw err2;
  }
  console.log(`${runtimeMod.id} ${runtimeMod.version}`);
  let virtualPackages = (/* @__PURE__ */ new Map()).set("crosscode", gameVersion).set("ccloader", modloaderMetadata.version).set("Simplify", new semver_default.SemVer("2.14.2")).set("input-api", new semver_default.SemVer("1.0.2")).set("extension-asset-preloader", new semver_default.SemVer("1.0.0")).set("nax-module-cache", new semver_default.SemVer("1.0.2"));
  if (typeof process !== "undefined") {
    virtualPackages.set("nw", new semver_default.SemVer(process.versions.nw));
  }
  let installedExtensions = /* @__PURE__ */ new Map();
  let enabledExtensions = /* @__PURE__ */ new Map();
  await findAllExtensions(config, installedExtensions, enabledExtensions, gameVersion);
  console.log(
    `found ${installedExtensions.size} extensions: ${Array.from(installedExtensions.keys()).map((extID) => {
      let str = extID;
      if (!enabledExtensions.has(extID)) str += " (disabled)";
      return str;
    }).join(", ")}`
  );
  let installedMods = /* @__PURE__ */ new Map();
  installedMods.set(runtimeMod.id, runtimeMod);
  await loadAllModMetadata(config, installedMods);
  installedMods = sortModsInLoadOrder(runtimeMod, installedMods);
  let loadedMods = /* @__PURE__ */ new Map();
  let loadedModsSetupPromises = [];
  for (let [modID, mod] of installedMods) {
    if (mod !== runtimeMod && !isModEnabled(modID)) {
      continue;
    }
    let dependencyProblems = verifyModDependencies(
      mod,
      installedMods,
      virtualPackages,
      installedExtensions,
      enabledExtensions,
      loadedMods
    );
    if (dependencyProblems.length > 0) {
      for (let problem of dependencyProblems) {
        console.warn(`Problem with requirements of mod '${modID}': ${problem}`);
      }
      continue;
    }
    loadedMods.set(modID, mod);
    loadedModsSetupPromises.push(
      mod.findAllAssets().catch((err2) => {
        console.error(`An error occured while searching assets of mod '${modID}':`, err2);
      })
    );
  }
  if (!loadedMods.has(runtimeMod.id)) {
    throw new Error("Could not load the runtime mod, game initialization is impossible!");
  }
  await Promise.all(loadedModsSetupPromises);
  console.log(
    `${loadedMods.size} mods will be loaded: ${Array.from(loadedMods.values()).map((mod) => {
      let str = mod.id;
      if (mod.version != null) str += ` v${mod.version}`;
      return str;
    }).join(", ")}`
  );
  window.modloader = {
    name: "ccloader",
    version: modloaderMetadata.version,
    gameVersion,
    gameVersionHotfix,
    installedMods,
    config,
    loadedMods,
    virtualPackages: new Map(
      [...virtualPackages].filter(([k]) => k !== "crosscode" && k !== "ccloader" && k !== "nw")
    ),
    modDataStorage: namespace,
    Mod: {},
    _runtimeMod: runtimeMod,
    serviceWorker
  };
  console.log("beginning the game boot sequence...");
  await buildNecessaryDOM(config);
  await initModPluginClasses(loadedMods);
  console.log("mod plugin classes created!");
  console.log("stage 'preload' reached!");
  await executeStage(loadedMods, "preload");
  console.log("running the main game script...");
  let domReadyCallback = await loadMainScript(
    config,
    runtimeMod.pluginClassInstance
  );
  console.log("stage 'postload' reached!");
  await executeStage(loadedMods, "postload");
  domReadyCallback();
  let startGameFn = await getStartFunction();
  console.log("stage 'prestart' reached!");
  if (PLATFORM_TYPE === "ANDROID" /* ANDROID */) {
    try {
      CrossAndroid.executePostGameLoad();
    } catch (err2) {
      console.error(`Failed to apply CrossAndroid's built-in mods:`, err2);
    }
  }
  await executeStage(loadedMods, "prestart");
  console.log("running startCrossCode()...");
  startGameFn();
  let activeDelegateFn = await getDelegateActivationFunction();
  console.log("stage 'poststart' reached!");
  await executeStage(loadedMods, "poststart");
  document.body.dispatchEvent(new Event("modsLoaded", { bubbles: true }));
  activeDelegateFn();
  console.log("crosscode with mods is now fully loaded!");
}
async function loadModloaderMetadata() {
  let filePath = "./ccloader3/metadata.json";
  let jsonText = await loadText4(filePath);
  let data2 = JSON.parse(jsonText);
  return {
    version: new semver_default.SemVer(data2.version, {
      includePrerelease: true
    })
  };
}
async function loadAllModMetadata(config, installedMods) {
  let allModsList = [];
  let ccmodPaths = [];
  for (let dir of config.modsDirs) {
    let subdirsList;
    let ccmods;
    try {
      ({ modDirectories: subdirsList, ccmods } = await getModPathsIn4(dir, config));
    } catch (err2) {
      console.warn(`Failed to load the list of mods in '${dir}':`, err2);
      continue;
    }
    for (let subdir of [...subdirsList, ...ccmods]) {
      allModsList.push({ parentDir: dir, dir: subdir });
    }
    ccmodPaths.push(...ccmods);
  }
  await loadCCMods(ccmodPaths);
  let modsCountPerDir = /* @__PURE__ */ new Map();
  await Promise.all(
    allModsList.map(async ({ parentDir, dir }) => {
      var _a6;
      try {
        let mod = await loadModMetadata(dir);
        if (mod == null) return;
        let modWithSameId = installedMods.get(mod.id);
        if (modWithSameId != null) {
          throw new Error(
            `A mod with ID '${mod.id}' has already been loaded from '${modWithSameId.baseDirectory}'`
          );
        }
        installedMods.set(mod.id, mod);
        modsCountPerDir.set(parentDir, ((_a6 = modsCountPerDir.get(parentDir)) != null ? _a6 : 0) + 1);
      } catch (err2) {
        console.error(`An error occured while loading the metadata of a mod in '${dir}':`, err2);
      }
    })
  );
  for (let [dir, count] of modsCountPerDir) {
    console.log(`found ${count} mods in '${dir}'`);
  }
}
async function findAllExtensions(config, installedExtensions, enabledExtensions, defaultExtVersion) {
  let extList;
  try {
    extList = await getInstalledExtensions4(config);
  } catch (err2) {
    console.warn("Failed to load the extensions list:", err2);
    return;
  }
  for (let extID of extList) {
    let extVersion = new semver_default.SemVer(defaultExtVersion, defaultExtVersion.options);
    if (extID.startsWith("-")) {
      extID = extID.slice(1);
    } else {
      enabledExtensions.set(extID, extVersion);
    }
    installedExtensions.set(extID, extVersion);
  }
}
var manifestValidator = new Validator();
async function loadModMetadata(baseDirectory) {
  var _a6;
  let manifestFile;
  let manifestText;
  let legacyMode = false;
  try {
    manifestFile = `${baseDirectory}/ccmod.json`;
    manifestText = await loadText4(manifestFile);
  } catch (_e1) {
    try {
      legacyMode = true;
      manifestFile = `${baseDirectory}/package.json`;
      manifestText = await loadText4(manifestFile);
    } catch (_e2) {
      return null;
    }
  }
  let manifestData;
  try {
    manifestData = JSON.parse(manifestText);
  } catch (err2) {
    if (errorHasMessage(err2)) {
      err2.message = `Syntax error in mod manifest in '${manifestFile}': ${err2.message}`;
    }
    throw err2;
  }
  try {
    if (legacyMode) {
      manifestData = manifestData;
      manifestValidator.validateLegacy(manifestData);
      manifestData = convertFromLegacy(manifestData);
    } else {
      manifestData = manifestData;
      manifestValidator.validate(manifestData);
      manifestData.assets = (_a6 = manifestData.assets) == null ? void 0 : _a6.map((e) => e.replace(/^assets\//, ""));
    }
  } catch (err2) {
    if (errorHasMessage(err2)) {
      err2.message = `Invalid mod manifest in '${manifestFile}': ${err2.message}`;
    }
    throw err2;
  }
  return new Mod(baseDirectory, manifestData, legacyMode);
}
async function initModPluginClasses(mods) {
  for (let mod of mods.values()) {
    try {
      await mod.initClass();
    } catch (err2) {
      console.error(`Failed to initialize class of mod '${mod.id}':`, err2);
    }
  }
}
async function executeStage(mods, stage) {
  for (let mod of mods.values()) {
    try {
      await mod.executeStage(stage);
    } catch (err2) {
      console.error(`Failed to execute ${stage} of mod '${mod.id}':`, err2);
    }
  }
}

// packages/core/src/main.ts
async function main() {
  let onloadPromise = new Promise((resolve) => {
    window.addEventListener("load", () => resolve());
  });
  if (typeof process !== "undefined") {
    let { env } = process;
    if (env.CCLOADER_OPEN_DEVTOOLS != null) {
      delete env.CCLOADER_OPEN_DEVTOOLS;
      let win = nw.Window.get();
      await showDevTools();
      win.focus();
      await wait(500);
    }
    let urlOverride = env.CCLOADER_OVERRIDE_MAIN_URL;
    if (urlOverride != null) {
      delete env.CCLOADER_OVERRIDE_MAIN_URL;
      window.location.replace(new URL(urlOverride, window.location.origin));
      return;
    }
  }
  await onloadPromise;
  await boot();
}
main().catch((err2) => {
  console.error(err2);
});
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicGFja2FnZXMvY29yZS9zcmMvZmlsZXMuZGVza3RvcC50cyIsICJwYWNrYWdlcy9jb21tb24vc3JjL3BhdGhzLnRzIiwgInBhY2thZ2VzL2NvbW1vbi9zcmMvdXRpbHMudHMiLCAicGFja2FnZXMvY29yZS9zcmMvZmlsZXMuYnJvd3Nlci50cyIsICJwYWNrYWdlcy9jb3JlL3NyYy9maWxlcy5hbmRyb2lkLnRzIiwgIm5vZGVfbW9kdWxlcy8ucG5wbS9mZmxhdGVAMC44LjIvbm9kZV9tb2R1bGVzL2ZmbGF0ZS9lc20vYnJvd3Nlci5qcyIsICJwYWNrYWdlcy9jb3JlL3NyYy9zZXJ2aWNlLXdvcmtlci1icmlkZ2UudHMiLCAicGFja2FnZXMvY29yZS9zcmMvZmlsZXMuY2Ntb2QudHMiLCAicGFja2FnZXMvY29yZS9zcmMvZmlsZXMudHMiLCAicGFja2FnZXMvY29yZS9zcmMvY29uZmlnLnRzIiwgInBhY2thZ2VzL2NvcmUvc3JjL21hbmlmZXN0LnRzIiwgInBhY2thZ2VzL2NvbW1vbi9zcmMvdmVuZG9yLWxpYnMvc2VtdmVyLnRzIiwgInBhY2thZ2VzL2NvcmUvc3JjL21vZC50cyIsICJwYWNrYWdlcy9jb21tb24vc3JjL3Jlc291cmNlcy50cyIsICJwYWNrYWdlcy9jb3JlL3NyYy9nYW1lLnRzIiwgInBhY2thZ2VzL2NvcmUvc3JjL21vZC1kYXRhLXN0b3JhZ2UudHMiLCAicGFja2FnZXMvY29yZS9zcmMvZGVwZW5kZW5jeS1yZXNvbHZlci50cyIsICJwYWNrYWdlcy9jb21tb24vc3JjL2NvbnNvbGUudHMiLCAicGFja2FnZXMvY29yZS9zcmMvbW9kbG9hZGVyLnRzIiwgInBhY2thZ2VzL2NvcmUvc3JjL21haW4udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCAqIGFzIHV0aWxzIGZyb20gJ0BjY2xvYWRlcjMvY29tbW9uL3V0aWxzJztcbmltcG9ydCB7IENvbmZpZyB9IGZyb20gJy4vY29uZmlnJztcblxuY29uc3QgZnM6IHR5cGVvZiBpbXBvcnQoJ2ZzJykgPSB3aW5kb3cucmVxdWlyZT8uKCdmcycpO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZEZpbGUocGF0aDogc3RyaW5nKTogUHJvbWlzZTxCdWZmZXI+IHtcbiAgcmV0dXJuIGZzLnByb21pc2VzLnJlYWRGaWxlKHBhdGgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZFRleHQocGF0aDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgcmV0dXJuIGZzLnByb21pc2VzLnJlYWRGaWxlKHBhdGgsICd1dGY4Jyk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpc1JlYWRhYmxlKHBhdGg6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICB0cnkge1xuICAgIGF3YWl0IGZzLnByb21pc2VzLmFjY2VzcyhwYXRoLCBmcy5jb25zdGFudHMuUl9PSyk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKF9lcnIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZpbmRSZWN1cnNpdmVseShkaXI6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgaWYgKGRpci5lbmRzV2l0aCgnLycpKSBkaXIgPSBkaXIuc2xpY2UoMCwgLTEpO1xuXG4gIGxldCBmaWxlTGlzdDogc3RyaW5nW10gPSBbXTtcbiAgYXdhaXQgZmluZFJlY3Vyc2l2ZWx5SW50ZXJuYWwoZGlyLCAnJywgZmlsZUxpc3QpO1xuICByZXR1cm4gZmlsZUxpc3Q7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGZpbmRSZWN1cnNpdmVseUludGVybmFsKFxuICBjdXJyZW50RGlyOiBzdHJpbmcsXG4gIHJlbGF0aXZlUHJlZml4OiBzdHJpbmcsXG4gIGZpbGVMaXN0OiBzdHJpbmdbXSxcbik6IFByb21pc2U8dm9pZD4ge1xuICBsZXQgY29udGVudHM6IHN0cmluZ1tdO1xuICB0cnkge1xuICAgIGNvbnRlbnRzID0gYXdhaXQgZnMucHJvbWlzZXMucmVhZGRpcihjdXJyZW50RGlyKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKHV0aWxzLmVycm9ySGFzQ29kZShlcnIpICYmIGVyci5jb2RlID09PSAnRU5PRU5UJykgcmV0dXJuO1xuICAgIHRocm93IGVycjtcbiAgfVxuXG4gIGF3YWl0IFByb21pc2UuYWxsKFxuICAgIGNvbnRlbnRzLm1hcChhc3luYyAobmFtZSkgPT4ge1xuICAgICAgbGV0IGZ1bGxQYXRoID0gYCR7Y3VycmVudERpcn0vJHtuYW1lfWA7XG4gICAgICBsZXQgc3RhdCA9IGF3YWl0IGZzLnByb21pc2VzLnN0YXQoZnVsbFBhdGgpO1xuICAgICAgaWYgKHN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICBhd2FpdCBmaW5kUmVjdXJzaXZlbHlJbnRlcm5hbChmdWxsUGF0aCwgYCR7cmVsYXRpdmVQcmVmaXh9JHtuYW1lfS9gLCBmaWxlTGlzdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmaWxlTGlzdC5wdXNoKGAke3JlbGF0aXZlUHJlZml4fSR7bmFtZX1gKTtcbiAgICAgIH1cbiAgICB9KSxcbiAgKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldE1vZFBhdGhzSW4oXG4gIGRpcjogc3RyaW5nLFxuICBfY29uZmlnOiBDb25maWcsXG4pOiBQcm9taXNlPHsgbW9kRGlyZWN0b3JpZXM6IHN0cmluZ1tdOyBjY21vZHM6IHN0cmluZ1tdIH0+IHtcbiAgaWYgKGRpci5lbmRzV2l0aCgnLycpKSBkaXIgPSBkaXIuc2xpY2UoMCwgLTEpO1xuXG4gIGxldCBhbGxDb250ZW50czogc3RyaW5nW107XG4gIHRyeSB7XG4gICAgYWxsQ29udGVudHMgPSBhd2FpdCBmcy5wcm9taXNlcy5yZWFkZGlyKGRpcik7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmICh1dGlscy5lcnJvckhhc0NvZGUoZXJyKSAmJiBlcnIuY29kZSA9PT0gJ0VOT0VOVCcpIHtcbiAgICAgIGF3YWl0IGZzLnByb21pc2VzLm1rZGlyKGRpcik7XG4gICAgICBhbGxDb250ZW50cyA9IGF3YWl0IGZzLnByb21pc2VzLnJlYWRkaXIoZGlyKTtcbiAgICB9XG4gICAgdGhyb3cgZXJyO1xuICB9XG5cbiAgY29uc3QgbW9kRGlyZWN0b3JpZXM6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IGNjbW9kczogc3RyaW5nW10gPSBbXTtcbiAgYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgYWxsQ29udGVudHMubWFwKGFzeW5jIChuYW1lKSA9PiB7XG4gICAgICBsZXQgZnVsbFBhdGggPSBgJHtkaXJ9LyR7bmFtZX1gO1xuICAgICAgLy8gdGhlIGB3aXRoRmlsZVR5cGVzYCBvcHRpb24gb2YgYHJlYWRkaXJgIGNhbid0IGJlIHVzZWQgaGVyZSBiZWNhdXNlIGl0XG4gICAgICAvLyBkb2Vzbid0IGRlcmVmZXJlbmNlIHN5bWJvbGljIGxpbmtzIHNpbWlsYXJseSB0byBgc3RhdGBcbiAgICAgIGxldCBzdGF0ID0gYXdhaXQgZnMucHJvbWlzZXMuc3RhdChmdWxsUGF0aCk7XG4gICAgICBpZiAoc3RhdC5pc0RpcmVjdG9yeSgpKSBtb2REaXJlY3Rvcmllcy5wdXNoKGZ1bGxQYXRoKTtcbiAgICAgIGVsc2UgaWYgKHN0YXQuaXNGaWxlKCkgJiYgbmFtZS5lbmRzV2l0aCgnLmNjbW9kJykpIHtcbiAgICAgICAgY2Ntb2RzLnB1c2goZnVsbFBhdGgpO1xuICAgICAgfVxuICAgIH0pLFxuICApO1xuICByZXR1cm4geyBtb2REaXJlY3RvcmllcywgY2Ntb2RzIH07XG59XG5cbi8vIFJlcGxpY2F0ZXMgdGhlIGJlaGF2aW9yIG9mIGBpZy5FeHRlbnNpb25MaXN0I2xvYWRFeHRlbnNpb25zTldKU2AuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0SW5zdGFsbGVkRXh0ZW5zaW9ucyhjb25maWc6IENvbmZpZyk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgbGV0IGlnUm9vdCA9IChjb25maWcuaW1wYWN0Q29uZmlnLklHX1JPT1QgYXMgc3RyaW5nKSA/PyAnJztcbiAgbGV0IGlnRGVidWcgPSBCb29sZWFuKGNvbmZpZy5pbXBhY3RDb25maWcuSUdfR0FNRV9ERUJVRyk7XG4gIGxldCBleHRlbnNpb25zRGlyID0gYCR7aWdSb290fSR7aWdEZWJ1ZyA/ICdkYXRhJyA6ICdhc3NldHMnfS9leHRlbnNpb25gO1xuXG4gIGxldCBhbGxDb250ZW50czogc3RyaW5nW107XG4gIHRyeSB7XG4gICAgYWxsQ29udGVudHMgPSBhd2FpdCBmcy5wcm9taXNlcy5yZWFkZGlyKGV4dGVuc2lvbnNEaXIpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICAvLyBPbGRlciB2ZXJzaW9ucyBvZiB0aGUgZ2FtZSBzaW1wbHkgZG9uJ3QgaGF2ZSB0aGUgc3VwcG9ydCBmb3IgZXh0ZW5zaW9ucy5cbiAgICBpZiAodXRpbHMuZXJyb3JIYXNDb2RlKGVycikgJiYgZXJyLmNvZGUgPT09ICdFTk9FTlQnKSByZXR1cm4gW107XG4gICAgdGhyb3cgZXJyO1xuICB9XG5cbiAgbGV0IGV4dGVuc2lvbklkczogc3RyaW5nW10gPSBbXTtcbiAgYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgYWxsQ29udGVudHMubWFwKGFzeW5jIChuYW1lKSA9PiB7XG4gICAgICAvLyBObyBpZGVhIHdoeSB0aGlzIGlzIGNoZWNrZWQgYnkgdGhlIGdhbWUuXG4gICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCcuJykpIHJldHVybjtcblxuICAgICAgaWYgKGlnRGVidWcpIHtcbiAgICAgICAgLy8gVGhlIGRlYnVnIG1vZGUgaXMgaW50ZXJlc3Rpbmc6IGl0IHNlZW1zIHRoYXQgd2hlbiBpdCBpcyBlbmFibGVkLFxuICAgICAgICAvLyBvbmx5IGV4dGVuc2lvbiBtYW5pZmVzdHMgYXJlIGxvYWRlZCBmcm9tIGBkYXRhL2V4dGVuc2lvbi9gLCB3aGlsZVxuICAgICAgICAvLyB0aGUgZmlsZXMgb2YgdGhlIGV4dGVuc2lvbnMgcmVzaWRlIGluc2lkZSBnYW1lJ3Mgbm9ybWFsIGRpcmVjdG9yeVxuICAgICAgICAvLyBzdHJ1Y3R1cmUuIFNvLCBleHRlbnNpb24gZGlyZWN0b3JpZXMgd2l0aCBhc3NldHMgYXJlIGNyZWF0ZWQgb25seVxuICAgICAgICAvLyB3aGVuIHRoZSBnYW1lIGlzIGNvbXBpbGVkIGZvciByZWxlYXNlLlxuICAgICAgICBpZiAobmFtZS5lbmRzV2l0aCgnLmpzb24nKSkge1xuICAgICAgICAgIGV4dGVuc2lvbklkcy5wdXNoKG5hbWUuc2xpY2UoMCwgLTUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFRoZSBnYW1lIGFsc28gY2hlY2tzIGlmIHRoZSBjb250YWluaW5nIGRpcmVjdG9yeSBleGlzdHMgYmVmb3JlXG4gICAgICAgIC8vIGNoZWNraW5nIGlmIHRoZXJlIGlzIGEgZmlsZSBpbnNpZGUsIGJ1dCBpdCBpcyByZWR1bmRhbnQuXG4gICAgICAgIGF3YWl0IGZzLnByb21pc2VzLmFjY2VzcyhgJHtleHRlbnNpb25zRGlyfS8ke25hbWV9LyR7bmFtZX0uanNvbmApO1xuICAgICAgfSBjYXRjaCAoX2Vycikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBleHRlbnNpb25JZHMucHVzaChuYW1lKTtcbiAgICB9KSxcbiAgKTtcbiAgcmV0dXJuIGV4dGVuc2lvbklkcztcbn1cbiIsICIvLyBQT1NJWC1vbmx5IGltcGxlbWVudGF0aW9uIG9mIHRoZSBgcGF0aGAgbW9kdWxlLCBwb3J0ZWQgZnJvbVxuLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvNjgwZmI4ZmM2MmY2YzE3MTYwYjM3MjdiYTc0MDBjZTI4ZjhkMjJkNS9saWIvcGF0aC5qc1xuLy8gd2l0aCBzbWFsbCBzdHlsaXN0aWMgYWRqdXN0ZW1lbnRzLlxuXG5jb25zdCBDSEFSX0RPVDogbnVtYmVyID0gJy4nLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBDSEFSX0ZPUldBUkRfU0xBU0g6IG51bWJlciA9ICcvJy5jaGFyQ29kZUF0KDApO1xuXG5mdW5jdGlvbiB2YWxpZGF0ZVN0cmluZyh2YWx1ZTogdW5rbm93biwgbmFtZTogc3RyaW5nKTogdm9pZCB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgZXhwZWN0ZWQgJHtuYW1lfSB0byBiZSBhIHN0cmluZ2ApO1xuICB9XG59XG5cbi8vIFJlc29sdmVzIC4gYW5kIC4uIGVsZW1lbnRzIGluIGEgcGF0aCB3aXRoIGRpcmVjdG9yeSBuYW1lc1xuZnVuY3Rpb24gbm9ybWFsaXplU3RyaW5nKHBhdGg6IHN0cmluZywgYWxsb3dBYm92ZVJvb3Q6IGJvb2xlYW4pOiBzdHJpbmcge1xuICBsZXQgcmVzID0gJyc7XG4gIGxldCBsYXN0U2VnbWVudExlbmd0aCA9IDA7XG4gIGxldCBsYXN0U2xhc2ggPSAtMTtcbiAgbGV0IGRvdHMgPSAwO1xuICBsZXQgY29kZSA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDw9IHBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoaSA8IHBhdGgubGVuZ3RoKSBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xuICAgIGVsc2UgaWYgKGNvZGUgPT09IENIQVJfRk9SV0FSRF9TTEFTSCkgYnJlYWs7XG4gICAgZWxzZSBjb2RlID0gQ0hBUl9GT1JXQVJEX1NMQVNIO1xuXG4gICAgaWYgKGNvZGUgPT09IENIQVJfRk9SV0FSRF9TTEFTSCkge1xuICAgICAgaWYgKGxhc3RTbGFzaCA9PT0gaSAtIDEgfHwgZG90cyA9PT0gMSkge1xuICAgICAgICAvLyBOT09QXG4gICAgICB9IGVsc2UgaWYgKGRvdHMgPT09IDIpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIHJlcy5sZW5ndGggPCAyIHx8XG4gICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggIT09IDIgfHxcbiAgICAgICAgICByZXMuY2hhckNvZGVBdChyZXMubGVuZ3RoIC0gMSkgIT09IENIQVJfRE9UIHx8XG4gICAgICAgICAgcmVzLmNoYXJDb2RlQXQocmVzLmxlbmd0aCAtIDIpICE9PSBDSEFSX0RPVFxuICAgICAgICApIHtcbiAgICAgICAgICBpZiAocmVzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIGxldCBsYXN0U2xhc2hJbmRleCA9IHJlcy5sYXN0SW5kZXhPZignLycpO1xuICAgICAgICAgICAgaWYgKGxhc3RTbGFzaEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICByZXMgPSAnJztcbiAgICAgICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzID0gcmVzLnNsaWNlKDAsIGxhc3RTbGFzaEluZGV4KTtcbiAgICAgICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSByZXMubGVuZ3RoIC0gMSAtIHJlcy5sYXN0SW5kZXhPZignLycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFzdFNsYXNoID0gaTtcbiAgICAgICAgICAgIGRvdHMgPSAwO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfSBlbHNlIGlmIChyZXMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICByZXMgPSAnJztcbiAgICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gMDtcbiAgICAgICAgICAgIGxhc3RTbGFzaCA9IGk7XG4gICAgICAgICAgICBkb3RzID0gMDtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoYWxsb3dBYm92ZVJvb3QpIHtcbiAgICAgICAgICByZXMgKz0gcmVzLmxlbmd0aCA+IDAgPyBgLy4uYCA6ICcuLic7XG4gICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSAyO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocmVzLmxlbmd0aCA+IDApIHJlcyArPSBgLyR7cGF0aC5zbGljZShsYXN0U2xhc2ggKyAxLCBpKX1gO1xuICAgICAgICBlbHNlIHJlcyA9IHBhdGguc2xpY2UobGFzdFNsYXNoICsgMSwgaSk7XG4gICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gaSAtIGxhc3RTbGFzaCAtIDE7XG4gICAgICB9XG4gICAgICBsYXN0U2xhc2ggPSBpO1xuICAgICAgZG90cyA9IDA7XG4gICAgfSBlbHNlIGlmIChjb2RlID09PSBDSEFSX0RPVCAmJiBkb3RzICE9PSAtMSkge1xuICAgICAgZG90cysrO1xuICAgIH0gZWxzZSB7XG4gICAgICBkb3RzID0gLTE7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlKC4uLmFyZ3M6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgbGV0IHJlc29sdmVkUGF0aCA9ICcnO1xuICBsZXQgcmVzb2x2ZWRBYnNvbHV0ZSA9IGZhbHNlO1xuXG4gIGZvciAobGV0IGkgPSBhcmdzLmxlbmd0aCAtIDE7IGkgPj0gLTEgJiYgIXJlc29sdmVkQWJzb2x1dGU7IGktLSkge1xuICAgIGxldCBwYXRoID0gaSA+PSAwID8gYXJnc1tpXSA6IHByb2Nlc3MuY3dkKCk7XG5cbiAgICB2YWxpZGF0ZVN0cmluZyhwYXRoLCAncGF0aCcpO1xuXG4gICAgLy8gU2tpcCBlbXB0eSBlbnRyaWVzXG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSBjb250aW51ZTtcblxuICAgIHJlc29sdmVkUGF0aCA9IGAke3BhdGh9LyR7cmVzb2x2ZWRQYXRofWA7XG4gICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IHBhdGguY2hhckNvZGVBdCgwKSA9PT0gQ0hBUl9GT1JXQVJEX1NMQVNIO1xuICB9XG5cbiAgLy8gQXQgdGhpcyBwb2ludCB0aGUgcGF0aCBzaG91bGQgYmUgcmVzb2x2ZWQgdG8gYSBmdWxsIGFic29sdXRlIHBhdGgsIGJ1dFxuICAvLyBoYW5kbGUgcmVsYXRpdmUgcGF0aHMgdG8gYmUgc2FmZSAobWlnaHQgaGFwcGVuIHdoZW4gcHJvY2Vzcy5jd2QoKSBmYWlscylcblxuICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgcmVzb2x2ZWRQYXRoID0gbm9ybWFsaXplU3RyaW5nKHJlc29sdmVkUGF0aCwgIXJlc29sdmVkQWJzb2x1dGUpO1xuXG4gIGlmIChyZXNvbHZlZEFic29sdXRlKSByZXR1cm4gYC8ke3Jlc29sdmVkUGF0aH1gO1xuXG4gIHJldHVybiByZXNvbHZlZFBhdGgubGVuZ3RoID4gMCA/IHJlc29sdmVkUGF0aCA6ICcuJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZShwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICB2YWxpZGF0ZVN0cmluZyhwYXRoLCAncGF0aCcpO1xuXG4gIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcuJztcblxuICBsZXQgaGFzUm9vdCA9IHBhdGguY2hhckNvZGVBdCgwKSA9PT0gQ0hBUl9GT1JXQVJEX1NMQVNIO1xuICBsZXQgdHJhaWxpbmdTZXBhcmF0b3IgPSBwYXRoLmNoYXJDb2RlQXQocGF0aC5sZW5ndGggLSAxKSA9PT0gQ0hBUl9GT1JXQVJEX1NMQVNIO1xuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICBwYXRoID0gbm9ybWFsaXplU3RyaW5nKHBhdGgsICFoYXNSb290KTtcblxuICBpZiAocGF0aC5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaGFzUm9vdCkgcmV0dXJuICcvJztcbiAgICByZXR1cm4gdHJhaWxpbmdTZXBhcmF0b3IgPyAnLi8nIDogJy4nO1xuICB9XG4gIGlmICh0cmFpbGluZ1NlcGFyYXRvcikgcGF0aCArPSAnLyc7XG5cbiAgcmV0dXJuIGhhc1Jvb3QgPyBgLyR7cGF0aH1gIDogcGF0aDtcbn1cblxuLy8gZXF1aXZhbGVudCB0byBzdHJpcFJvb3Qoam9pbignLycsIHBhdGgpKVxuZXhwb3J0IGZ1bmN0aW9uIGphaWxSZWxhdGl2ZShwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICB2YWxpZGF0ZVN0cmluZyhwYXRoLCAncGF0aCcpO1xuXG4gIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcuJztcblxuICBsZXQgdHJhaWxpbmdTZXBhcmF0b3IgPSBwYXRoLmNoYXJDb2RlQXQocGF0aC5sZW5ndGggLSAxKSA9PT0gQ0hBUl9GT1JXQVJEX1NMQVNIO1xuXG4gIHBhdGggPSBub3JtYWxpemVTdHJpbmcocGF0aCwgZmFsc2UpO1xuXG4gIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkgcGF0aCA9ICcuJztcbiAgaWYgKHRyYWlsaW5nU2VwYXJhdG9yKSBwYXRoICs9ICcvJztcbiAgcmV0dXJuIHBhdGg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Fic29sdXRlKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICB2YWxpZGF0ZVN0cmluZyhwYXRoLCAncGF0aCcpO1xuICByZXR1cm4gcGF0aC5sZW5ndGggPiAwICYmIHBhdGguY2hhckNvZGVBdCgwKSA9PT0gQ0hBUl9GT1JXQVJEX1NMQVNIO1xufVxuXG4vLyBlcXVpdmFsZW50IHRvIHJlbGF0aXZlKCcvJywgcGF0aClcbmV4cG9ydCBmdW5jdGlvbiBzdHJpcFJvb3QocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVTdHJpbmcocGF0aCwgJ3BhdGgnKTtcbiAgd2hpbGUgKHBhdGgubGVuZ3RoID4gMCAmJiBwYXRoLmNoYXJDb2RlQXQoMCkgPT09IENIQVJfRk9SV0FSRF9TTEFTSCkge1xuICAgIHBhdGggPSBwYXRoLnNsaWNlKDEpO1xuICB9XG4gIHJldHVybiBwYXRoO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gam9pbiguLi5hcmdzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcuJztcbiAgbGV0IGpvaW5lZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBhcmcgPSBhcmdzW2ldO1xuICAgIHZhbGlkYXRlU3RyaW5nKGFyZywgJ3BhdGgnKTtcbiAgICBpZiAoYXJnLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmIChqb2luZWQgPT0gbnVsbCkgam9pbmVkID0gYXJnO1xuICAgICAgZWxzZSBqb2luZWQgKz0gYC8ke2FyZ31gO1xuICAgIH1cbiAgfVxuICBpZiAoam9pbmVkID09IG51bGwpIHJldHVybiAnLic7XG4gIHJldHVybiBub3JtYWxpemUoam9pbmVkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbGF0aXZlKGZyb206IHN0cmluZywgdG86IHN0cmluZyk6IHN0cmluZyB7XG4gIHZhbGlkYXRlU3RyaW5nKGZyb20sICdmcm9tJyk7XG4gIHZhbGlkYXRlU3RyaW5nKHRvLCAndG8nKTtcblxuICBpZiAoZnJvbSA9PT0gdG8pIHJldHVybiAnJztcblxuICAvLyBUcmltIGxlYWRpbmcgZm9yd2FyZCBzbGFzaGVzLlxuICBmcm9tID0gcmVzb2x2ZShmcm9tKTtcbiAgdG8gPSByZXNvbHZlKHRvKTtcblxuICBpZiAoZnJvbSA9PT0gdG8pIHJldHVybiAnJztcblxuICBsZXQgZnJvbVN0YXJ0ID0gMTtcbiAgbGV0IGZyb21FbmQgPSBmcm9tLmxlbmd0aDtcbiAgbGV0IGZyb21MZW4gPSBmcm9tRW5kIC0gZnJvbVN0YXJ0O1xuICBsZXQgdG9TdGFydCA9IDE7XG4gIGxldCB0b0xlbiA9IHRvLmxlbmd0aCAtIHRvU3RhcnQ7XG5cbiAgLy8gQ29tcGFyZSBwYXRocyB0byBmaW5kIHRoZSBsb25nZXN0IGNvbW1vbiBwYXRoIGZyb20gcm9vdFxuICBsZXQgbGVuZ3RoID0gZnJvbUxlbiA8IHRvTGVuID8gZnJvbUxlbiA6IHRvTGVuO1xuICBsZXQgbGFzdENvbW1vblNlcCA9IC0xO1xuICBsZXQgaSA9IDA7XG4gIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgZnJvbUNvZGUgPSBmcm9tLmNoYXJDb2RlQXQoZnJvbVN0YXJ0ICsgaSk7XG4gICAgaWYgKGZyb21Db2RlICE9PSB0by5jaGFyQ29kZUF0KHRvU3RhcnQgKyBpKSkgYnJlYWs7XG4gICAgZWxzZSBpZiAoZnJvbUNvZGUgPT09IENIQVJfRk9SV0FSRF9TTEFTSCkgbGFzdENvbW1vblNlcCA9IGk7XG4gIH1cbiAgaWYgKGkgPT09IGxlbmd0aCkge1xuICAgIGlmICh0b0xlbiA+IGxlbmd0aCkge1xuICAgICAgaWYgKHRvLmNoYXJDb2RlQXQodG9TdGFydCArIGkpID09PSBDSEFSX0ZPUldBUkRfU0xBU0gpIHtcbiAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYGZyb21gIGlzIHRoZSBleGFjdCBiYXNlIHBhdGggZm9yIGB0b2AuXG4gICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvZm9vL2Jhcic7IHRvPScvZm9vL2Jhci9iYXonXG4gICAgICAgIHJldHVybiB0by5zbGljZSh0b1N0YXJ0ICsgaSArIDEpO1xuICAgICAgfVxuICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYGZyb21gIGlzIHRoZSByb290XG4gICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvJzsgdG89Jy9mb28nXG4gICAgICAgIHJldHVybiB0by5zbGljZSh0b1N0YXJ0ICsgaSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChmcm9tTGVuID4gbGVuZ3RoKSB7XG4gICAgICBpZiAoZnJvbS5jaGFyQ29kZUF0KGZyb21TdGFydCArIGkpID09PSBDSEFSX0ZPUldBUkRfU0xBU0gpIHtcbiAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYHRvYCBpcyB0aGUgZXhhY3QgYmFzZSBwYXRoIGZvciBgZnJvbWAuXG4gICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvZm9vL2Jhci9iYXonOyB0bz0nL2Zvby9iYXInXG4gICAgICAgIGxhc3RDb21tb25TZXAgPSBpO1xuICAgICAgfSBlbHNlIGlmIChpID09PSAwKSB7XG4gICAgICAgIC8vIFdlIGdldCBoZXJlIGlmIGB0b2AgaXMgdGhlIHJvb3QuXG4gICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvZm9vL2Jhcic7IHRvPScvJ1xuICAgICAgICBsYXN0Q29tbW9uU2VwID0gMDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBsZXQgb3V0ID0gJyc7XG4gIC8vIEdlbmVyYXRlIHRoZSByZWxhdGl2ZSBwYXRoIGJhc2VkIG9uIHRoZSBwYXRoIGRpZmZlcmVuY2UgYmV0d2VlbiBgdG9gXG4gIC8vIGFuZCBgZnJvbWAuXG4gIGZvciAoaSA9IGZyb21TdGFydCArIGxhc3RDb21tb25TZXAgKyAxOyBpIDw9IGZyb21FbmQ7IGkrKykge1xuICAgIGlmIChpID09PSBmcm9tRW5kIHx8IGZyb20uY2hhckNvZGVBdChpKSA9PT0gQ0hBUl9GT1JXQVJEX1NMQVNIKSB7XG4gICAgICBvdXQgKz0gb3V0Lmxlbmd0aCA9PT0gMCA/ICcuLicgOiAnLy4uJztcbiAgICB9XG4gIH1cblxuICAvLyBMYXN0bHksIGFwcGVuZCB0aGUgcmVzdCBvZiB0aGUgZGVzdGluYXRpb24gKGB0b2ApIHBhdGggdGhhdCBjb21lcyBhZnRlclxuICAvLyB0aGUgY29tbW9uIHBhdGggcGFydHMuXG4gIHJldHVybiBgJHtvdXR9JHt0by5zbGljZSh0b1N0YXJ0ICsgbGFzdENvbW1vblNlcCl9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpcm5hbWUocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVTdHJpbmcocGF0aCwgJ3BhdGgnKTtcbiAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSByZXR1cm4gJy4nO1xuICBsZXQgaGFzUm9vdCA9IHBhdGguY2hhckNvZGVBdCgwKSA9PT0gQ0hBUl9GT1JXQVJEX1NMQVNIO1xuICBsZXQgZW5kID0gLTE7XG4gIGxldCBtYXRjaGVkU2xhc2ggPSB0cnVlO1xuICBmb3IgKGxldCBpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDE7IC0taSkge1xuICAgIGlmIChwYXRoLmNoYXJDb2RlQXQoaSkgPT09IENIQVJfRk9SV0FSRF9TTEFTSCkge1xuICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcbiAgICAgICAgZW5kID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yXG4gICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBpZiAoZW5kID09PSAtMSkgcmV0dXJuIGhhc1Jvb3QgPyAnLycgOiAnLic7XG4gIGlmIChoYXNSb290ICYmIGVuZCA9PT0gMSkgcmV0dXJuICcvLyc7XG4gIHJldHVybiBwYXRoLnNsaWNlKDAsIGVuZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNlbmFtZShwYXRoOiBzdHJpbmcsIGV4dD86IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmIChleHQgIT0gbnVsbCkgdmFsaWRhdGVTdHJpbmcoZXh0LCAnZXh0Jyk7XG4gIHZhbGlkYXRlU3RyaW5nKHBhdGgsICdwYXRoJyk7XG5cbiAgbGV0IHN0YXJ0ID0gMDtcbiAgbGV0IGVuZCA9IC0xO1xuICBsZXQgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcblxuICBpZiAoZXh0ICE9IG51bGwgJiYgZXh0Lmxlbmd0aCA+IDAgJiYgZXh0Lmxlbmd0aCA8PSBwYXRoLmxlbmd0aCkge1xuICAgIGlmIChleHQgPT09IHBhdGgpIHJldHVybiAnJztcbiAgICBsZXQgZXh0SWR4ID0gZXh0Lmxlbmd0aCAtIDE7XG4gICAgbGV0IGZpcnN0Tm9uU2xhc2hFbmQgPSAtMTtcbiAgICBmb3IgKGxldCBpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgbGV0IGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XG4gICAgICBpZiAoY29kZSA9PT0gQ0hBUl9GT1JXQVJEX1NMQVNIKSB7XG4gICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBwYXRoIHNlcGFyYXRvciB0aGF0IHdhcyBub3QgcGFydCBvZiBhIHNldCBvZiBwYXRoXG4gICAgICAgIC8vIHNlcGFyYXRvcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nLCBzdG9wIG5vd1xuICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xuICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChmaXJzdE5vblNsYXNoRW5kID09PSAtMSkge1xuICAgICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yLCByZW1lbWJlciB0aGlzIGluZGV4IGluIGNhc2VcbiAgICAgICAgICAvLyB3ZSBuZWVkIGl0IGlmIHRoZSBleHRlbnNpb24gZW5kcyB1cCBub3QgbWF0Y2hpbmdcbiAgICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcbiAgICAgICAgICBmaXJzdE5vblNsYXNoRW5kID0gaSArIDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV4dElkeCA+PSAwKSB7XG4gICAgICAgICAgLy8gVHJ5IHRvIG1hdGNoIHRoZSBleHBsaWNpdCBleHRlbnNpb25cbiAgICAgICAgICBpZiAoY29kZSA9PT0gZXh0LmNoYXJDb2RlQXQoZXh0SWR4KSkge1xuICAgICAgICAgICAgaWYgKC0tZXh0SWR4ID09PSAtMSkge1xuICAgICAgICAgICAgICAvLyBXZSBtYXRjaGVkIHRoZSBleHRlbnNpb24sIHNvIG1hcmsgdGhpcyBhcyB0aGUgZW5kIG9mIG91ciBwYXRoXG4gICAgICAgICAgICAgIC8vIGNvbXBvbmVudFxuICAgICAgICAgICAgICBlbmQgPSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBFeHRlbnNpb24gZG9lcyBub3QgbWF0Y2gsIHNvIG91ciByZXN1bHQgaXMgdGhlIGVudGlyZSBwYXRoXG4gICAgICAgICAgICAvLyBjb21wb25lbnRcbiAgICAgICAgICAgIGV4dElkeCA9IC0xO1xuICAgICAgICAgICAgZW5kID0gZmlyc3ROb25TbGFzaEVuZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3RhcnQgPT09IGVuZCkgZW5kID0gZmlyc3ROb25TbGFzaEVuZDtcbiAgICBlbHNlIGlmIChlbmQgPT09IC0xKSBlbmQgPSBwYXRoLmxlbmd0aDtcbiAgICByZXR1cm4gcGF0aC5zbGljZShzdGFydCwgZW5kKTtcbiAgfVxuICBmb3IgKGxldCBpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgIGlmIChwYXRoLmNoYXJDb2RlQXQoaSkgPT09IENIQVJfRk9SV0FSRF9TTEFTSCkge1xuICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHBhdGggc2VwYXJhdG9yIHRoYXQgd2FzIG5vdCBwYXJ0IG9mIGEgc2V0IG9mIHBhdGhcbiAgICAgIC8vIHNlcGFyYXRvcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nLCBzdG9wIG5vd1xuICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcbiAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChlbmQgPT09IC0xKSB7XG4gICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyXG4gICAgICAvLyBwYXRoIGNvbXBvbmVudFxuICAgICAgbWF0Y2hlZFNsYXNoID0gZmFsc2U7XG4gICAgICBlbmQgPSBpICsgMTtcbiAgICB9XG4gIH1cblxuICBpZiAoZW5kID09PSAtMSkgcmV0dXJuICcnO1xuICByZXR1cm4gcGF0aC5zbGljZShzdGFydCwgZW5kKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dG5hbWUocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVTdHJpbmcocGF0aCwgJ3BhdGgnKTtcbiAgbGV0IHN0YXJ0RG90ID0gLTE7XG4gIGxldCBzdGFydFBhcnQgPSAwO1xuICBsZXQgZW5kID0gLTE7XG4gIGxldCBtYXRjaGVkU2xhc2ggPSB0cnVlO1xuICAvLyBUcmFjayB0aGUgc3RhdGUgb2YgY2hhcmFjdGVycyAoaWYgYW55KSB3ZSBzZWUgYmVmb3JlIG91ciBmaXJzdCBkb3QgYW5kXG4gIC8vIGFmdGVyIGFueSBwYXRoIHNlcGFyYXRvciB3ZSBmaW5kXG4gIGxldCBwcmVEb3RTdGF0ZSA9IDA7XG4gIGZvciAobGV0IGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgbGV0IGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XG4gICAgaWYgKGNvZGUgPT09IENIQVJfRk9SV0FSRF9TTEFTSCkge1xuICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHBhdGggc2VwYXJhdG9yIHRoYXQgd2FzIG5vdCBwYXJ0IG9mIGEgc2V0IG9mIHBhdGhcbiAgICAgIC8vIHNlcGFyYXRvcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nLCBzdG9wIG5vd1xuICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcbiAgICAgICAgc3RhcnRQYXJ0ID0gaSArIDE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChlbmQgPT09IC0xKSB7XG4gICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyXG4gICAgICAvLyBleHRlbnNpb25cbiAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xuICAgICAgZW5kID0gaSArIDE7XG4gICAgfVxuICAgIGlmIChjb2RlID09PSBDSEFSX0RPVCkge1xuICAgICAgLy8gSWYgdGhpcyBpcyBvdXIgZmlyc3QgZG90LCBtYXJrIGl0IGFzIHRoZSBzdGFydCBvZiBvdXIgZXh0ZW5zaW9uXG4gICAgICBpZiAoc3RhcnREb3QgPT09IC0xKSBzdGFydERvdCA9IGk7XG4gICAgICBlbHNlIGlmIChwcmVEb3RTdGF0ZSAhPT0gMSkgcHJlRG90U3RhdGUgPSAxO1xuICAgIH0gZWxzZSBpZiAoc3RhcnREb3QgIT09IC0xKSB7XG4gICAgICAvLyBXZSBzYXcgYSBub24tZG90IGFuZCBub24tcGF0aCBzZXBhcmF0b3IgYmVmb3JlIG91ciBkb3QsIHNvIHdlIHNob3VsZFxuICAgICAgLy8gaGF2ZSBhIGdvb2QgY2hhbmNlIGF0IGhhdmluZyBhIG5vbi1lbXB0eSBleHRlbnNpb25cbiAgICAgIHByZURvdFN0YXRlID0gLTE7XG4gICAgfVxuICB9XG5cbiAgaWYgKFxuICAgIHN0YXJ0RG90ID09PSAtMSB8fFxuICAgIGVuZCA9PT0gLTEgfHxcbiAgICAvLyBXZSBzYXcgYSBub24tZG90IGNoYXJhY3RlciBpbW1lZGlhdGVseSBiZWZvcmUgdGhlIGRvdFxuICAgIHByZURvdFN0YXRlID09PSAwIHx8XG4gICAgLy8gVGhlIChyaWdodC1tb3N0KSB0cmltbWVkIHBhdGggY29tcG9uZW50IGlzIGV4YWN0bHkgJy4uJ1xuICAgIChwcmVEb3RTdGF0ZSA9PT0gMSAmJiBzdGFydERvdCA9PT0gZW5kIC0gMSAmJiBzdGFydERvdCA9PT0gc3RhcnRQYXJ0ICsgMSlcbiAgKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIHJldHVybiBwYXRoLnNsaWNlKHN0YXJ0RG90LCBlbmQpO1xufVxuIiwgImltcG9ydCB0eXBlIHtcbiAgTWF5YmVQcm9taXNlLFxuICBQcm9taXNlUmVzdWx0LFxufSBmcm9tICd1bHRpbWF0ZS1jcm9zc2NvZGUtdHlwZWRlZnMvbW9kbG9hZGVyLXN0ZGxpYi91dGlscyc7XG5pbXBvcnQgKiBhcyBwYXRocyBmcm9tICcuL3BhdGhzJztcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXZhciwgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuZGVjbGFyZSB2YXIgY2hyb21lOiBhbnk7XG5cbmV4cG9ydCB7IE1heWJlUHJvbWlzZSB9O1xuXG5leHBvcnQgZW51bSBQbGF0Zm9ybVR5cGUge1xuICBERVNLVE9QID0gJ0RFU0tUT1AnLFxuICBBTkRST0lEID0gJ0FORFJPSUQnLFxuICBCUk9XU0VSID0gJ0JST1dTRVInLFxufVxuXG5leHBvcnQgY29uc3QgUExBVEZPUk1fVFlQRTogUGxhdGZvcm1UeXBlID0gKCgpID0+IHtcbiAgaWYgKHR5cGVvZiBudyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gUGxhdGZvcm1UeXBlLkRFU0tUT1A7XG4gIH1cbiAgbGV0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG4gIGlmIChwYXJhbXMuaGFzKCdjcm9zc2FuZHJvaWQnKSkge1xuICAgIHJldHVybiBQbGF0Zm9ybVR5cGUuQU5EUk9JRDtcbiAgfVxuICByZXR1cm4gUGxhdGZvcm1UeXBlLkJST1dTRVI7XG59KSgpO1xuXG5leHBvcnQgZnVuY3Rpb24gc2hvd0RldlRvb2xzKHdpbmRvdzogbncuV2luZG93ID0gbncuV2luZG93LmdldCgpKTogUHJvbWlzZTx2b2lkPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZpbmVkXG4gICAgd2luZG93LnNob3dEZXZUb29scyh1bmRlZmluZWQsICgpID0+IHJlc29sdmUoKSksXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93QmFja2dyb3VuZFBhZ2VEZXZUb29scygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PlxuICAgIGNocm9tZS5kZXZlbG9wZXJQcml2YXRlLm9wZW5EZXZUb29scyhcbiAgICAgIHtcbiAgICAgICAgcmVuZGVyVmlld0lkOiAtMSxcbiAgICAgICAgcmVuZGVyUHJvY2Vzc0lkOiAtMSxcbiAgICAgICAgZXh0ZW5zaW9uSWQ6IGNocm9tZS5ydW50aW1lLmlkLFxuICAgICAgfSxcbiAgICAgICgpID0+IHJlc29sdmUoKSxcbiAgICApLFxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd2FpdChtczogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcGFyZTxUPihhOiBULCBiOiBUKTogbnVtYmVyIHtcbiAgcmV0dXJuIGEgPiBiID8gMSA6IGEgPCBiID8gLTEgOiAwO1xufVxuXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55ICovXG5cbi8vIFRPRE86IG1lbnRpb24gc29tZXdoZXJlIGluIGRvY3MgdGhhdCBtb2RpZmljYXRpb24gb2YgYFR5cGVFcnJvcmAncyBgbWVzc2FnZWBcbi8vIGRvZXNuJ3Qgd29yay5cbmV4cG9ydCBmdW5jdGlvbiBlcnJvckhhc01lc3NhZ2UoZXJyb3I6IGFueSk6IGVycm9yIGlzIHsgbWVzc2FnZTogc3RyaW5nIH0ge1xuICByZXR1cm4gdHlwZW9mIGVycm9yLm1lc3NhZ2UgPT09ICdzdHJpbmcnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JIYXNDb2RlKGVycm9yOiBhbnkpOiBlcnJvciBpcyB7IGNvZGU6IHN0cmluZyB9IHtcbiAgcmV0dXJuIHR5cGVvZiBlcnJvci5jb2RlID09PSAnc3RyaW5nJztcbn1cblxuLyogZXNsaW50LWVuYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55ICovXG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwUHJvbWlzZVJlc3VsdDxUPihwcm9taXNlOiBQcm9taXNlPFQ+KTogUHJvbWlzZTxQcm9taXNlUmVzdWx0PFQ+PiB7XG4gIHJldHVybiBwcm9taXNlLnRoZW4oXG4gICAgKHZhbHVlKSA9PiAoeyB0eXBlOiAncmVzb2x2ZWQnLCB2YWx1ZSB9KSxcbiAgICAocmVhc29uKSA9PiAoeyB0eXBlOiAncmVqZWN0ZWQnLCByZWFzb24gfSksXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNLZXkob2JqOiB1bmtub3duLCBrZXk6IFByb3BlcnR5S2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFwR2V0T3JJbnNlcnQ8SywgVj4obWFwOiBNYXA8SywgVj4sIGtleTogSywgZGVmYXVsdFZhbHVlOiBWKTogViB7XG4gIGlmIChtYXAuaGFzKGtleSkpIHtcbiAgICByZXR1cm4gbWFwLmdldChrZXkpITtcbiAgfSBlbHNlIHtcbiAgICBtYXAuc2V0KGtleSwgZGVmYXVsdFZhbHVlKTtcbiAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjd2RGaWxlUGF0aFRvVVJMKHBhdGg6IHN0cmluZywgYmFzZTogc3RyaW5nID0gZG9jdW1lbnQuYmFzZVVSSSk6IFVSTCB7XG4gIGxldCB1cmwgPSBuZXcgVVJMKGJhc2UpO1xuICAvLyBJbXBsaWNpdGx5IHBlcmNlbnQtZW5jb2RlcyBhbmQgZG9lc24ndCB0cmltIHBhdGggb24gdGhlIGVuZHMuXG4gIHVybC5wYXRobmFtZSA9IHBhdGg7XG4gIHVybC5zZWFyY2ggPSAnJztcbiAgdXJsLmhhc2ggPSAnJztcbiAgcmV0dXJuIHVybDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGN3ZEZpbGVQYXRoRnJvbVVSTCh1cmw6IFVSTCk6IHN0cmluZyB7XG4gIC8vIFdoeSB1c2UgZGVjb2RlVVJJQ29tcG9uZW50IGhlcmUgaW5zdGVhZCBvZiBkZWNvZGVVUkksIHlvdSBtaWdodCBhc2s/IFlvdVxuICAvLyBzZWUsIHRoZSBjcnVjaWFsIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgdHdvIGlzIHRoYXQgZGVjb2RlVVJJQ29tcG9uZW50XG4gIC8vIGRlY29kZXMgZXZlcnkgcGVyY2VudC1lbmNvZGVkIGNoYXJhY3RlciB3aXRob3V0IGV4Y2VwdGlvbnMsIHdoaWxlXG4gIC8vIGRlY29kZVVSSSwgYXMgdGhlIEVTMjYyIHNwZWNpZmljYXRpb24gc2F5cywgZG9lcyBub3QgZGVjb2RlIFwiZXNjYXBlXG4gIC8vIHNlcXVlbmNlcyB0aGF0IGNvdWxkIG5vdCBoYXZlIGJlZW4gaW50cm9kdWNlZCBieSBlbmNvZGVVUklcIiwgd2hpY2gsIGluXG4gIC8vIHByYWN0aWNlLCBtZWFucyB0aGF0IGl0IGRvZXNuJ3QgZGVjb2RlIHBlcmNlbnQtZW5jb2RpbmdzIG9mIHRoZXNlXG4gIC8vIGNoYXJhY3RlcnM6IDsvPzpAJj0rJCwjIC4gTm93LCBob3cgaXMgdGhpcyBiZWhhdmlvciB1c2VmdWwgaW4gcHJhY3RpY2U/XG4gIC8vIFBlcmhhcHMgdGhlIGludGVuZGVkIHVzZWNhc2UgaXMgdG8gbWFrZSBVUkxzIGxvb2sgbmljZXIgYnkgZGVjb2Rpbmcgc3R1ZmZcbiAgLy8gbGlrZSBVbmljb2RlIGNoYXJhY3RlcnMsIHlldCBwcmVzZXJ2aW5nIHRoZSB2YWxpZGl0eSBhbmQgbWVhbmluZyBvZiB0aGVcbiAgLy8gb3JpZ2luYWwgVVJMLiBCdXQgaXQgbWF5IGxlYWQgdG8gb2JzY3VyZSBidWdzIGluIGhhbmRsaW5nIGZpbGUgcGF0aHNcbiAgLy8gYmVjYXVzZSwgYWxiZWl0IHNlbGRvbSB1c2VkLCBhbGwgb2YgdGhlIG1lbnRpb25lZCBjaGFyYWN0ZXJzLCB3aXRoIHRoZVxuICAvLyBleGNlcHRpb24gb2Ygc2xhc2gsIGFyZSB2YWxpZCBpbiBmaWxlbmFtZXMgb24gVU5JWCwgYW5kLCBleGNlcHQgY29sb24gYW5kXG4gIC8vIHF1ZXN0aW9uIG1hcmssIHRoZSByZXN0IGlzIGFsc28gdmFsaWQgb24gV2luZG93cywgYW5kIHNvIHRob3NlIGNoYXJhY3RlcnNcbiAgLy8gd2lsbCBiZSBrZXB0IHVuZGVjb2RlZC4gSGVyZSBhcmUgc29tZSBzcGVjaWZpY2F0aW9uIGxpbmtzOlxuICAvLyA8aHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvbXVsdGlwYWdlL2dsb2JhbC1vYmplY3QuaHRtbCNzZWMtZGVjb2RldXJpLWVuY29kZWR1cmk+XG4gIC8vIDxodHRwczovL3RjMzkuZXMvZWNtYTI2Mi9tdWx0aXBhZ2UvZ2xvYmFsLW9iamVjdC5odG1sI3NlYy1kZWNvZGV1cmljb21wb25lbnQtZW5jb2RlZHVyaWNvbXBvbmVudD5cbiAgcmV0dXJuIHBhdGhzLnN0cmlwUm9vdChkZWNvZGVVUklDb21wb25lbnQodXJsLnBhdGhuYW1lKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBodG1sPEsgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KFxuICB0YWdOYW1lOiBLLFxuICBvcHRpb25zOiB7XG4gICAgYXR0cnM/OiB7IFthdHRyOiBzdHJpbmddOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkIH0gfCBudWxsO1xuICAgIGlkPzogc3RyaW5nIHwgbnVsbDtcbiAgICBjbGFzcz86IHN0cmluZ1tdIHwgbnVsbDtcbiAgICBzdHlsZT86IHtcbiAgICAgIFtQIGluIGtleW9mIENTU1N0eWxlRGVjbGFyYXRpb25dPzogRXh0cmFjdDxDU1NTdHlsZURlY2xhcmF0aW9uW1BdLCBzdHJpbmcgfCBudW1iZXI+IHwgbnVsbDtcbiAgICB9O1xuICAgIGNoaWxkcmVuPzogQXJyYXk8c3RyaW5nIHwgTm9kZT4gfCBudWxsO1xuICB9LFxuKTogSFRNTEVsZW1lbnRUYWdOYW1lTWFwW0tdIHtcbiAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuXG4gIGlmIChvcHRpb25zLmF0dHJzICE9IG51bGwpIHtcbiAgICBmb3IgKGxldCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXMob3B0aW9ucy5hdHRycykpIHtcbiAgICAgIGlmICh2ICE9IG51bGwpIHtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoaywgdik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKG9wdGlvbnMuaWQgIT0gbnVsbCkge1xuICAgIGVsZW1lbnQuaWQgPSBvcHRpb25zLmlkO1xuICB9XG4gIGlmIChvcHRpb25zLmNsYXNzICE9IG51bGwpIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoLi4ub3B0aW9ucy5jbGFzcyk7XG4gIH1cblxuICBpZiAob3B0aW9ucy5zdHlsZSAhPSBudWxsKSB7XG4gICAgZm9yIChsZXQgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKG9wdGlvbnMuc3R5bGUpKSB7XG4gICAgICBpZiAodiAhPSBudWxsKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgIChlbGVtZW50LnN0eWxlIGFzIGFueSlba10gPSB2O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChvcHRpb25zLmNoaWxkcmVuICE9IG51bGwpIHtcbiAgICBlbGVtZW50LmFwcGVuZCguLi5vcHRpb25zLmNoaWxkcmVuKTtcbiAgfVxuXG4gIHJldHVybiBlbGVtZW50O1xufVxuXG5leHBvcnQgY29uc3Qgc3RkbGliTmFtZXNwYWNlID0ge1xuICBQbGF0Zm9ybVR5cGUsXG4gIFBMQVRGT1JNX1RZUEUsXG4gIHNob3dEZXZUb29scyxcbiAgc2hvd0JhY2tncm91bmRQYWdlRGV2VG9vbHMsXG4gIHdhaXQsXG4gIGNvbXBhcmUsXG4gIHdyYXBQcm9taXNlUmVzdWx0LFxuICBoYXNLZXksXG4gIG1hcEdldE9ySW5zZXJ0LFxufTtcbiIsICJpbXBvcnQgKiBhcyB1dGlscyBmcm9tICdAY2Nsb2FkZXIzL2NvbW1vbi91dGlscyc7XG5pbXBvcnQgKiBhcyBwYXRocyBmcm9tICdAY2Nsb2FkZXIzL2NvbW1vbi9wYXRocyc7XG5pbXBvcnQgeyBDb25maWcgfSBmcm9tICcuL2NvbmZpZyc7XG5cbmFzeW5jIGZ1bmN0aW9uIHJlcXVlc3QocGF0aDogc3RyaW5nKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICB0cnkge1xuICAgIGxldCByZXMgPSBhd2FpdCBmZXRjaCh1dGlscy5jd2RGaWxlUGF0aFRvVVJMKHBhdGgpLmhyZWYpO1xuICAgIGlmICghcmVzLm9rKSB0aHJvdyBuZXcgRXJyb3IoYCR7cmVzLnN0YXR1c30gJHtyZXMuc3RhdHVzVGV4dH1gKTtcbiAgICByZXR1cm4gcmVzO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAodXRpbHMuZXJyb3JIYXNNZXNzYWdlKGVycikpIHtcbiAgICAgIGVyci5tZXNzYWdlID0gYEZhaWxlZCB0byBsb2FkIGZpbGUgJyR7cGF0aH0nOiAke2Vyci5tZXNzYWdlfWA7XG4gICAgfVxuICAgIHRocm93IGVycjtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZEZpbGUocGF0aDogc3RyaW5nKTogUHJvbWlzZTxBcnJheUJ1ZmZlcj4ge1xuICByZXR1cm4gKGF3YWl0IHJlcXVlc3QocGF0aCkpLmFycmF5QnVmZmVyKCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkVGV4dChwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gKGF3YWl0IHJlcXVlc3QocGF0aCkpLnRleHQoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzUmVhZGFibGUocGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHRyeSB7XG4gICAgbGV0IHJlcyA9IGF3YWl0IGZldGNoKHV0aWxzLmN3ZEZpbGVQYXRoVG9VUkwocGF0aCkuaHJlZiwgeyBtZXRob2Q6ICdIRUFEJyB9KTtcbiAgICByZXR1cm4gcmVzLm9rO1xuICB9IGNhdGNoIChfZXJyKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRNb2RQYXRoc0luKFxuICBkaXI6IHN0cmluZyxcbiAgX2NvbmZpZzogQ29uZmlnLFxuKTogUHJvbWlzZTx7IG1vZERpcmVjdG9yaWVzOiBzdHJpbmdbXTsgY2Ntb2RzOiBzdHJpbmdbXSB9PiB7XG4gIGlmIChkaXIuZW5kc1dpdGgoJy8nKSkgZGlyID0gZGlyLnNsaWNlKDAsIC0xKTtcblxuICBsZXQgaW5kZXhQYXRoID0gYCR7ZGlyfS9pbmRleC5qc29uYDtcbiAgbGV0IGluZGV4SnNvblRleHQgPSBhd2FpdCBsb2FkVGV4dChpbmRleFBhdGgpO1xuICBsZXQgaW5kZXg6IHN0cmluZ1tdO1xuXG4gIHRyeSB7XG4gICAgaW5kZXggPSBKU09OLnBhcnNlKGluZGV4SnNvblRleHQpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAodXRpbHMuZXJyb3JIYXNNZXNzYWdlKGVycikpIHtcbiAgICAgIGVyci5tZXNzYWdlID0gYFN5bnRheCBlcnJvciBpbiBtb2RzIGRpcmVjdG9yeSBpbmRleCBpbiAnJHtpbmRleFBhdGh9JzogJHtlcnIubWVzc2FnZX1gO1xuICAgIH1cbiAgICB0aHJvdyBlcnI7XG4gIH1cblxuICBjb25zdCBtb2RQYXRocyA9IGluZGV4Lm1hcCgobW9kRGlyUGF0aCkgPT4gcGF0aHMuam9pbihkaXIsIHBhdGhzLmphaWxSZWxhdGl2ZShtb2REaXJQYXRoKSkpO1xuICBjb25zdCBtb2REaXJlY3Rvcmllczogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgY2Ntb2RzOiBzdHJpbmdbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHBhdGggb2YgbW9kUGF0aHMpIHtcbiAgICBpZiAocGF0aC5lbmRzV2l0aCgnLmNjbW9kJykpIHtcbiAgICAgIGNjbW9kcy5wdXNoKHBhdGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtb2REaXJlY3Rvcmllcy5wdXNoKHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7IG1vZERpcmVjdG9yaWVzLCBjY21vZHMgfTtcbn1cblxuLy8gUmVwbGljYXRlcyB0aGUgYmVoYXZpb3Igb2YgYGlnLkV4dGVuc2lvbkxpc3QjbG9hZEV4dGVuc2lvbnNQSFBgLlxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEluc3RhbGxlZEV4dGVuc2lvbnMoY29uZmlnOiBDb25maWcpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gIGxldCBpZ1Jvb3QgPSAoY29uZmlnLmltcGFjdENvbmZpZy5JR19ST09UIGFzIHN0cmluZykgPz8gJyc7XG4gIGxldCBpZ0RlYnVnID0gQm9vbGVhbihjb25maWcuaW1wYWN0Q29uZmlnLklHX0dBTUVfREVCVUcpO1xuICBsZXQgZXh0ZW5zaW9uc0FwaVVybCA9IGAke2lnUm9vdH1wYWdlL2FwaS9nZXQtZXh0ZW5zaW9uLWxpc3QucGhwP2RlYnVnPSR7aWdEZWJ1ZyA/IDEgOiAwfWA7XG4gIHRyeSB7XG4gICAgbGV0IHJlcyA9IGF3YWl0IGZldGNoKGV4dGVuc2lvbnNBcGlVcmwpO1xuICAgIGlmICghcmVzLm9rKSB0aHJvdyBuZXcgRXJyb3IoYCR7cmVzLnN0YXR1c30gJHtyZXMuc3RhdHVzVGV4dH1gKTtcbiAgICAvLyBTaG91bGQgdGhlIHJlc3BvbnNlIGJlIHZhbGlkYXRlZD9cbiAgICByZXR1cm4gSlNPTi5wYXJzZShhd2FpdCByZXMudGV4dCgpKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKHV0aWxzLmVycm9ySGFzTWVzc2FnZShlcnIpKSB7XG4gICAgICBlcnIubWVzc2FnZSA9IGBGYWlsZWQgdG8gc2VuZCByZXF1ZXN0IHRvICcke2V4dGVuc2lvbnNBcGlVcmx9JzogJHtlcnIubWVzc2FnZX1gO1xuICAgIH1cbiAgICAvLyB0aHJvdyBlcnI7XG4gICAgcmV0dXJuIFtdO1xuICB9XG59XG4iLCAiaW1wb3J0ICogYXMgZmlsZXNCcm93c2VyIGZyb20gJy4vZmlsZXMuYnJvd3Nlcic7XG5pbXBvcnQgeyBDb25maWcgfSBmcm9tICcuL2NvbmZpZyc7XG5cbmV4cG9ydCB7IGlzUmVhZGFibGUsIHJlYWRGaWxlLCBsb2FkVGV4dCB9IGZyb20gJy4vZmlsZXMuYnJvd3Nlcic7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRNb2RQYXRoc0luKFxuICBkaXI6IHN0cmluZyxcbiAgY29uZmlnOiBDb25maWcsXG4pOiBQcm9taXNlPHsgbW9kRGlyZWN0b3JpZXM6IHN0cmluZ1tdOyBjY21vZHM6IHN0cmluZ1tdIH0+IHtcbiAgaWYgKGRpciA9PT0gYCR7Y29uZmlnLmdhbWVBc3NldHNEaXJ9bW9kcy9gKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBtb2RzRGlyRW50cmllcyA9IEpTT04ucGFyc2UoQ3Jvc3NBbmRyb2lkTW9kTGlzdFByb3ZpZGVyLmdldE1vZExpc3RBc0pzb24oKSkgYXMgc3RyaW5nW107XG4gICAgICBsZXQgbW9kU3ViZGlyczogc3RyaW5nW10gPSBbXTtcbiAgICAgIGZvciAobGV0IG1vZERpck5hbWUgb2YgbW9kc0RpckVudHJpZXMpIHtcbiAgICAgICAgaWYgKG1vZERpck5hbWUuZW5kc1dpdGgoJy8nKSkge1xuICAgICAgICAgIG1vZFN1YmRpcnMucHVzaChgJHtkaXJ9LyR7bW9kRGlyTmFtZS5zbGljZSgwLCAtMSl9YCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB7IG1vZERpcmVjdG9yaWVzOiBtb2RTdWJkaXJzLCBjY21vZHM6IFtdIH07XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gZ2V0IHRoZSBsaXN0IG9mIG1vZHMgZnJvbSBDcm9zc0FuZHJvaWQ6JywgZXJyKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZpbGVzQnJvd3Nlci5nZXRNb2RQYXRoc0luKGRpciwgY29uZmlnKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEluc3RhbGxlZEV4dGVuc2lvbnMoY29uZmlnOiBDb25maWcpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoQ3Jvc3NBbmRyb2lkRXh0ZW5zaW9uTGlzdFByb3ZpZGVyLmdldEV4dGVuc2lvbkxpc3RBc0pzb24oKSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBnZXQgdGhlIGxpc3Qgb2YgZXh0ZW5zaW9ucyBmcm9tIENyb3NzQW5kcm9pZDonLCBlcnIpO1xuICB9XG4gIHJldHVybiBmaWxlc0Jyb3dzZXIuZ2V0SW5zdGFsbGVkRXh0ZW5zaW9ucyhjb25maWcpO1xufVxuIiwgIi8vIERFRkxBVEUgaXMgYSBjb21wbGV4IGZvcm1hdDsgdG8gcmVhZCB0aGlzIGNvZGUsIHlvdSBzaG91bGQgcHJvYmFibHkgY2hlY2sgdGhlIFJGQyBmaXJzdDpcbi8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMxOTUxXG4vLyBZb3UgbWF5IGFsc28gd2lzaCB0byB0YWtlIGEgbG9vayBhdCB0aGUgZ3VpZGUgSSBtYWRlIGFib3V0IHRoaXMgcHJvZ3JhbTpcbi8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tLzEwMWFycm93ei8yNTNmMzFlYjVhYmMzZDkyNzVhYjk0MzAwM2ZmZWNhZFxuLy8gU29tZSBvZiB0aGUgZm9sbG93aW5nIGNvZGUgaXMgc2ltaWxhciB0byB0aGF0IG9mIFVaSVAuanM6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vcGhvdG9wZWEvVVpJUC5qc1xuLy8gSG93ZXZlciwgdGhlIHZhc3QgbWFqb3JpdHkgb2YgdGhlIGNvZGViYXNlIGhhcyBkaXZlcmdlZCBmcm9tIFVaSVAuanMgdG8gaW5jcmVhc2UgcGVyZm9ybWFuY2UgYW5kIHJlZHVjZSBidW5kbGUgc2l6ZS5cbi8vIFNvbWV0aW1lcyAwIHdpbGwgYXBwZWFyIHdoZXJlIC0xIHdvdWxkIGJlIG1vcmUgYXBwcm9wcmlhdGUuIFRoaXMgaXMgYmVjYXVzZSB1c2luZyBhIHVpbnRcbi8vIGlzIGJldHRlciBmb3IgbWVtb3J5IGluIG1vc3QgZW5naW5lcyAoSSAqdGhpbmsqKS5cbnZhciBjaDIgPSB7fTtcbnZhciB3ayA9IChmdW5jdGlvbiAoYywgaWQsIG1zZywgdHJhbnNmZXIsIGNiKSB7XG4gICAgdmFyIHcgPSBuZXcgV29ya2VyKGNoMltpZF0gfHwgKGNoMltpZF0gPSBVUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFtcbiAgICAgICAgYyArICc7YWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsZnVuY3Rpb24oZSl7ZT1lLmVycm9yO3Bvc3RNZXNzYWdlKHskZSQ6W2UubWVzc2FnZSxlLmNvZGUsZS5zdGFja119KX0pJ1xuICAgIF0sIHsgdHlwZTogJ3RleHQvamF2YXNjcmlwdCcgfSkpKSk7XG4gICAgdy5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgZCA9IGUuZGF0YSwgZWQgPSBkLiRlJDtcbiAgICAgICAgaWYgKGVkKSB7XG4gICAgICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKGVkWzBdKTtcbiAgICAgICAgICAgIGVyclsnY29kZSddID0gZWRbMV07XG4gICAgICAgICAgICBlcnIuc3RhY2sgPSBlZFsyXTtcbiAgICAgICAgICAgIGNiKGVyciwgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY2IobnVsbCwgZCk7XG4gICAgfTtcbiAgICB3LnBvc3RNZXNzYWdlKG1zZywgdHJhbnNmZXIpO1xuICAgIHJldHVybiB3O1xufSk7XG5cbi8vIGFsaWFzZXMgZm9yIHNob3J0ZXIgY29tcHJlc3NlZCBjb2RlIChtb3N0IG1pbmlmZXJzIGRvbid0IGRvIHRoaXMpXG52YXIgdTggPSBVaW50OEFycmF5LCB1MTYgPSBVaW50MTZBcnJheSwgaTMyID0gSW50MzJBcnJheTtcbi8vIGZpeGVkIGxlbmd0aCBleHRyYSBiaXRzXG52YXIgZmxlYiA9IG5ldyB1OChbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMSwgMSwgMSwgMSwgMiwgMiwgMiwgMiwgMywgMywgMywgMywgNCwgNCwgNCwgNCwgNSwgNSwgNSwgNSwgMCwgLyogdW51c2VkICovIDAsIDAsIC8qIGltcG9zc2libGUgKi8gMF0pO1xuLy8gZml4ZWQgZGlzdGFuY2UgZXh0cmEgYml0c1xudmFyIGZkZWIgPSBuZXcgdTgoWzAsIDAsIDAsIDAsIDEsIDEsIDIsIDIsIDMsIDMsIDQsIDQsIDUsIDUsIDYsIDYsIDcsIDcsIDgsIDgsIDksIDksIDEwLCAxMCwgMTEsIDExLCAxMiwgMTIsIDEzLCAxMywgLyogdW51c2VkICovIDAsIDBdKTtcbi8vIGNvZGUgbGVuZ3RoIGluZGV4IG1hcFxudmFyIGNsaW0gPSBuZXcgdTgoWzE2LCAxNywgMTgsIDAsIDgsIDcsIDksIDYsIDEwLCA1LCAxMSwgNCwgMTIsIDMsIDEzLCAyLCAxNCwgMSwgMTVdKTtcbi8vIGdldCBiYXNlLCByZXZlcnNlIGluZGV4IG1hcCBmcm9tIGV4dHJhIGJpdHNcbnZhciBmcmViID0gZnVuY3Rpb24gKGViLCBzdGFydCkge1xuICAgIHZhciBiID0gbmV3IHUxNigzMSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzMTsgKytpKSB7XG4gICAgICAgIGJbaV0gPSBzdGFydCArPSAxIDw8IGViW2kgLSAxXTtcbiAgICB9XG4gICAgLy8gbnVtYmVycyBoZXJlIGFyZSBhdCBtYXggMTggYml0c1xuICAgIHZhciByID0gbmV3IGkzMihiWzMwXSk7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCAzMDsgKytpKSB7XG4gICAgICAgIGZvciAodmFyIGogPSBiW2ldOyBqIDwgYltpICsgMV07ICsraikge1xuICAgICAgICAgICAgcltqXSA9ICgoaiAtIGJbaV0pIDw8IDUpIHwgaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyBiOiBiLCByOiByIH07XG59O1xudmFyIF9hID0gZnJlYihmbGViLCAyKSwgZmwgPSBfYS5iLCByZXZmbCA9IF9hLnI7XG4vLyB3ZSBjYW4gaWdub3JlIHRoZSBmYWN0IHRoYXQgdGhlIG90aGVyIG51bWJlcnMgYXJlIHdyb25nOyB0aGV5IG5ldmVyIGhhcHBlbiBhbnl3YXlcbmZsWzI4XSA9IDI1OCwgcmV2ZmxbMjU4XSA9IDI4O1xudmFyIF9iID0gZnJlYihmZGViLCAwKSwgZmQgPSBfYi5iLCByZXZmZCA9IF9iLnI7XG4vLyBtYXAgb2YgdmFsdWUgdG8gcmV2ZXJzZSAoYXNzdW1pbmcgMTYgYml0cylcbnZhciByZXYgPSBuZXcgdTE2KDMyNzY4KTtcbmZvciAodmFyIGkgPSAwOyBpIDwgMzI3Njg7ICsraSkge1xuICAgIC8vIHJldmVyc2UgdGFibGUgYWxnb3JpdGhtIGZyb20gU09cbiAgICB2YXIgeCA9ICgoaSAmIDB4QUFBQSkgPj4gMSkgfCAoKGkgJiAweDU1NTUpIDw8IDEpO1xuICAgIHggPSAoKHggJiAweENDQ0MpID4+IDIpIHwgKCh4ICYgMHgzMzMzKSA8PCAyKTtcbiAgICB4ID0gKCh4ICYgMHhGMEYwKSA+PiA0KSB8ICgoeCAmIDB4MEYwRikgPDwgNCk7XG4gICAgcmV2W2ldID0gKCgoeCAmIDB4RkYwMCkgPj4gOCkgfCAoKHggJiAweDAwRkYpIDw8IDgpKSA+PiAxO1xufVxuLy8gY3JlYXRlIGh1ZmZtYW4gdHJlZSBmcm9tIHU4IFwibWFwXCI6IGluZGV4IC0+IGNvZGUgbGVuZ3RoIGZvciBjb2RlIGluZGV4XG4vLyBtYiAobWF4IGJpdHMpIG11c3QgYmUgYXQgbW9zdCAxNVxuLy8gVE9ETzogb3B0aW1pemUvc3BsaXQgdXA/XG52YXIgaE1hcCA9IChmdW5jdGlvbiAoY2QsIG1iLCByKSB7XG4gICAgdmFyIHMgPSBjZC5sZW5ndGg7XG4gICAgLy8gaW5kZXhcbiAgICB2YXIgaSA9IDA7XG4gICAgLy8gdTE2IFwibWFwXCI6IGluZGV4IC0+ICMgb2YgY29kZXMgd2l0aCBiaXQgbGVuZ3RoID0gaW5kZXhcbiAgICB2YXIgbCA9IG5ldyB1MTYobWIpO1xuICAgIC8vIGxlbmd0aCBvZiBjZCBtdXN0IGJlIDI4OCAodG90YWwgIyBvZiBjb2RlcylcbiAgICBmb3IgKDsgaSA8IHM7ICsraSkge1xuICAgICAgICBpZiAoY2RbaV0pXG4gICAgICAgICAgICArK2xbY2RbaV0gLSAxXTtcbiAgICB9XG4gICAgLy8gdTE2IFwibWFwXCI6IGluZGV4IC0+IG1pbmltdW0gY29kZSBmb3IgYml0IGxlbmd0aCA9IGluZGV4XG4gICAgdmFyIGxlID0gbmV3IHUxNihtYik7XG4gICAgZm9yIChpID0gMTsgaSA8IG1iOyArK2kpIHtcbiAgICAgICAgbGVbaV0gPSAobGVbaSAtIDFdICsgbFtpIC0gMV0pIDw8IDE7XG4gICAgfVxuICAgIHZhciBjbztcbiAgICBpZiAocikge1xuICAgICAgICAvLyB1MTYgXCJtYXBcIjogaW5kZXggLT4gbnVtYmVyIG9mIGFjdHVhbCBiaXRzLCBzeW1ib2wgZm9yIGNvZGVcbiAgICAgICAgY28gPSBuZXcgdTE2KDEgPDwgbWIpO1xuICAgICAgICAvLyBiaXRzIHRvIHJlbW92ZSBmb3IgcmV2ZXJzZXJcbiAgICAgICAgdmFyIHJ2YiA9IDE1IC0gbWI7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBzOyArK2kpIHtcbiAgICAgICAgICAgIC8vIGlnbm9yZSAwIGxlbmd0aHNcbiAgICAgICAgICAgIGlmIChjZFtpXSkge1xuICAgICAgICAgICAgICAgIC8vIG51bSBlbmNvZGluZyBib3RoIHN5bWJvbCBhbmQgYml0cyByZWFkXG4gICAgICAgICAgICAgICAgdmFyIHN2ID0gKGkgPDwgNCkgfCBjZFtpXTtcbiAgICAgICAgICAgICAgICAvLyBmcmVlIGJpdHNcbiAgICAgICAgICAgICAgICB2YXIgcl8xID0gbWIgLSBjZFtpXTtcbiAgICAgICAgICAgICAgICAvLyBzdGFydCB2YWx1ZVxuICAgICAgICAgICAgICAgIHZhciB2ID0gbGVbY2RbaV0gLSAxXSsrIDw8IHJfMTtcbiAgICAgICAgICAgICAgICAvLyBtIGlzIGVuZCB2YWx1ZVxuICAgICAgICAgICAgICAgIGZvciAodmFyIG0gPSB2IHwgKCgxIDw8IHJfMSkgLSAxKTsgdiA8PSBtOyArK3YpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZXZlcnkgMTYgYml0IHZhbHVlIHN0YXJ0aW5nIHdpdGggdGhlIGNvZGUgeWllbGRzIHRoZSBzYW1lIHJlc3VsdFxuICAgICAgICAgICAgICAgICAgICBjb1tyZXZbdl0gPj4gcnZiXSA9IHN2O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY28gPSBuZXcgdTE2KHMpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgczsgKytpKSB7XG4gICAgICAgICAgICBpZiAoY2RbaV0pIHtcbiAgICAgICAgICAgICAgICBjb1tpXSA9IHJldltsZVtjZFtpXSAtIDFdKytdID4+ICgxNSAtIGNkW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY287XG59KTtcbi8vIGZpeGVkIGxlbmd0aCB0cmVlXG52YXIgZmx0ID0gbmV3IHU4KDI4OCk7XG5mb3IgKHZhciBpID0gMDsgaSA8IDE0NDsgKytpKVxuICAgIGZsdFtpXSA9IDg7XG5mb3IgKHZhciBpID0gMTQ0OyBpIDwgMjU2OyArK2kpXG4gICAgZmx0W2ldID0gOTtcbmZvciAodmFyIGkgPSAyNTY7IGkgPCAyODA7ICsraSlcbiAgICBmbHRbaV0gPSA3O1xuZm9yICh2YXIgaSA9IDI4MDsgaSA8IDI4ODsgKytpKVxuICAgIGZsdFtpXSA9IDg7XG4vLyBmaXhlZCBkaXN0YW5jZSB0cmVlXG52YXIgZmR0ID0gbmV3IHU4KDMyKTtcbmZvciAodmFyIGkgPSAwOyBpIDwgMzI7ICsraSlcbiAgICBmZHRbaV0gPSA1O1xuLy8gZml4ZWQgbGVuZ3RoIG1hcFxudmFyIGZsbSA9IC8qI19fUFVSRV9fKi8gaE1hcChmbHQsIDksIDApLCBmbHJtID0gLyojX19QVVJFX18qLyBoTWFwKGZsdCwgOSwgMSk7XG4vLyBmaXhlZCBkaXN0YW5jZSBtYXBcbnZhciBmZG0gPSAvKiNfX1BVUkVfXyovIGhNYXAoZmR0LCA1LCAwKSwgZmRybSA9IC8qI19fUFVSRV9fKi8gaE1hcChmZHQsIDUsIDEpO1xuLy8gZmluZCBtYXggb2YgYXJyYXlcbnZhciBtYXggPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciBtID0gYVswXTtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGEubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgaWYgKGFbaV0gPiBtKVxuICAgICAgICAgICAgbSA9IGFbaV07XG4gICAgfVxuICAgIHJldHVybiBtO1xufTtcbi8vIHJlYWQgZCwgc3RhcnRpbmcgYXQgYml0IHAgYW5kIG1hc2sgd2l0aCBtXG52YXIgYml0cyA9IGZ1bmN0aW9uIChkLCBwLCBtKSB7XG4gICAgdmFyIG8gPSAocCAvIDgpIHwgMDtcbiAgICByZXR1cm4gKChkW29dIHwgKGRbbyArIDFdIDw8IDgpKSA+PiAocCAmIDcpKSAmIG07XG59O1xuLy8gcmVhZCBkLCBzdGFydGluZyBhdCBiaXQgcCBjb250aW51aW5nIGZvciBhdCBsZWFzdCAxNiBiaXRzXG52YXIgYml0czE2ID0gZnVuY3Rpb24gKGQsIHApIHtcbiAgICB2YXIgbyA9IChwIC8gOCkgfCAwO1xuICAgIHJldHVybiAoKGRbb10gfCAoZFtvICsgMV0gPDwgOCkgfCAoZFtvICsgMl0gPDwgMTYpKSA+PiAocCAmIDcpKTtcbn07XG4vLyBnZXQgZW5kIG9mIGJ5dGVcbnZhciBzaGZ0ID0gZnVuY3Rpb24gKHApIHsgcmV0dXJuICgocCArIDcpIC8gOCkgfCAwOyB9O1xuLy8gdHlwZWQgYXJyYXkgc2xpY2UgLSBhbGxvd3MgZ2FyYmFnZSBjb2xsZWN0b3IgdG8gZnJlZSBvcmlnaW5hbCByZWZlcmVuY2UsXG4vLyB3aGlsZSBiZWluZyBtb3JlIGNvbXBhdGlibGUgdGhhbiAuc2xpY2VcbnZhciBzbGMgPSBmdW5jdGlvbiAodiwgcywgZSkge1xuICAgIGlmIChzID09IG51bGwgfHwgcyA8IDApXG4gICAgICAgIHMgPSAwO1xuICAgIGlmIChlID09IG51bGwgfHwgZSA+IHYubGVuZ3RoKVxuICAgICAgICBlID0gdi5sZW5ndGg7XG4gICAgLy8gY2FuJ3QgdXNlIC5jb25zdHJ1Y3RvciBpbiBjYXNlIHVzZXItc3VwcGxpZWRcbiAgICByZXR1cm4gbmV3IHU4KHYuc3ViYXJyYXkocywgZSkpO1xufTtcbi8qKlxuICogQ29kZXMgZm9yIGVycm9ycyBnZW5lcmF0ZWQgd2l0aGluIHRoaXMgbGlicmFyeVxuICovXG5leHBvcnQgdmFyIEZsYXRlRXJyb3JDb2RlID0ge1xuICAgIFVuZXhwZWN0ZWRFT0Y6IDAsXG4gICAgSW52YWxpZEJsb2NrVHlwZTogMSxcbiAgICBJbnZhbGlkTGVuZ3RoTGl0ZXJhbDogMixcbiAgICBJbnZhbGlkRGlzdGFuY2U6IDMsXG4gICAgU3RyZWFtRmluaXNoZWQ6IDQsXG4gICAgTm9TdHJlYW1IYW5kbGVyOiA1LFxuICAgIEludmFsaWRIZWFkZXI6IDYsXG4gICAgTm9DYWxsYmFjazogNyxcbiAgICBJbnZhbGlkVVRGODogOCxcbiAgICBFeHRyYUZpZWxkVG9vTG9uZzogOSxcbiAgICBJbnZhbGlkRGF0ZTogMTAsXG4gICAgRmlsZW5hbWVUb29Mb25nOiAxMSxcbiAgICBTdHJlYW1GaW5pc2hpbmc6IDEyLFxuICAgIEludmFsaWRaaXBEYXRhOiAxMyxcbiAgICBVbmtub3duQ29tcHJlc3Npb25NZXRob2Q6IDE0XG59O1xuLy8gZXJyb3IgY29kZXNcbnZhciBlYyA9IFtcbiAgICAndW5leHBlY3RlZCBFT0YnLFxuICAgICdpbnZhbGlkIGJsb2NrIHR5cGUnLFxuICAgICdpbnZhbGlkIGxlbmd0aC9saXRlcmFsJyxcbiAgICAnaW52YWxpZCBkaXN0YW5jZScsXG4gICAgJ3N0cmVhbSBmaW5pc2hlZCcsXG4gICAgJ25vIHN0cmVhbSBoYW5kbGVyJyxcbiAgICAsXG4gICAgJ25vIGNhbGxiYWNrJyxcbiAgICAnaW52YWxpZCBVVEYtOCBkYXRhJyxcbiAgICAnZXh0cmEgZmllbGQgdG9vIGxvbmcnLFxuICAgICdkYXRlIG5vdCBpbiByYW5nZSAxOTgwLTIwOTknLFxuICAgICdmaWxlbmFtZSB0b28gbG9uZycsXG4gICAgJ3N0cmVhbSBmaW5pc2hpbmcnLFxuICAgICdpbnZhbGlkIHppcCBkYXRhJ1xuICAgIC8vIGRldGVybWluZWQgYnkgdW5rbm93biBjb21wcmVzc2lvbiBtZXRob2Rcbl07XG47XG52YXIgZXJyID0gZnVuY3Rpb24gKGluZCwgbXNnLCBudCkge1xuICAgIHZhciBlID0gbmV3IEVycm9yKG1zZyB8fCBlY1tpbmRdKTtcbiAgICBlLmNvZGUgPSBpbmQ7XG4gICAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKVxuICAgICAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZShlLCBlcnIpO1xuICAgIGlmICghbnQpXG4gICAgICAgIHRocm93IGU7XG4gICAgcmV0dXJuIGU7XG59O1xuLy8gZXhwYW5kcyByYXcgREVGTEFURSBkYXRhXG52YXIgaW5mbHQgPSBmdW5jdGlvbiAoZGF0LCBzdCwgYnVmLCBkaWN0KSB7XG4gICAgLy8gc291cmNlIGxlbmd0aCAgICAgICBkaWN0IGxlbmd0aFxuICAgIHZhciBzbCA9IGRhdC5sZW5ndGgsIGRsID0gZGljdCA/IGRpY3QubGVuZ3RoIDogMDtcbiAgICBpZiAoIXNsIHx8IHN0LmYgJiYgIXN0LmwpXG4gICAgICAgIHJldHVybiBidWYgfHwgbmV3IHU4KDApO1xuICAgIHZhciBub0J1ZiA9ICFidWY7XG4gICAgLy8gaGF2ZSB0byBlc3RpbWF0ZSBzaXplXG4gICAgdmFyIHJlc2l6ZSA9IG5vQnVmIHx8IHN0LmkgIT0gMjtcbiAgICAvLyBubyBzdGF0ZVxuICAgIHZhciBub1N0ID0gc3QuaTtcbiAgICAvLyBBc3N1bWVzIHJvdWdobHkgMzMlIGNvbXByZXNzaW9uIHJhdGlvIGF2ZXJhZ2VcbiAgICBpZiAobm9CdWYpXG4gICAgICAgIGJ1ZiA9IG5ldyB1OChzbCAqIDMpO1xuICAgIC8vIGVuc3VyZSBidWZmZXIgY2FuIGZpdCBhdCBsZWFzdCBsIGVsZW1lbnRzXG4gICAgdmFyIGNidWYgPSBmdW5jdGlvbiAobCkge1xuICAgICAgICB2YXIgYmwgPSBidWYubGVuZ3RoO1xuICAgICAgICAvLyBuZWVkIHRvIGluY3JlYXNlIHNpemUgdG8gZml0XG4gICAgICAgIGlmIChsID4gYmwpIHtcbiAgICAgICAgICAgIC8vIERvdWJsZSBvciBzZXQgdG8gbmVjZXNzYXJ5LCB3aGljaGV2ZXIgaXMgZ3JlYXRlclxuICAgICAgICAgICAgdmFyIG5idWYgPSBuZXcgdTgoTWF0aC5tYXgoYmwgKiAyLCBsKSk7XG4gICAgICAgICAgICBuYnVmLnNldChidWYpO1xuICAgICAgICAgICAgYnVmID0gbmJ1ZjtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gIGxhc3QgY2h1bmsgICAgICAgICBiaXRwb3MgICAgICAgICAgIGJ5dGVzXG4gICAgdmFyIGZpbmFsID0gc3QuZiB8fCAwLCBwb3MgPSBzdC5wIHx8IDAsIGJ0ID0gc3QuYiB8fCAwLCBsbSA9IHN0LmwsIGRtID0gc3QuZCwgbGJ0ID0gc3QubSwgZGJ0ID0gc3QubjtcbiAgICAvLyB0b3RhbCBiaXRzXG4gICAgdmFyIHRidHMgPSBzbCAqIDg7XG4gICAgZG8ge1xuICAgICAgICBpZiAoIWxtKSB7XG4gICAgICAgICAgICAvLyBCRklOQUwgLSB0aGlzIGlzIG9ubHkgMSB3aGVuIGxhc3QgY2h1bmsgaXMgbmV4dFxuICAgICAgICAgICAgZmluYWwgPSBiaXRzKGRhdCwgcG9zLCAxKTtcbiAgICAgICAgICAgIC8vIHR5cGU6IDAgPSBubyBjb21wcmVzc2lvbiwgMSA9IGZpeGVkIGh1ZmZtYW4sIDIgPSBkeW5hbWljIGh1ZmZtYW5cbiAgICAgICAgICAgIHZhciB0eXBlID0gYml0cyhkYXQsIHBvcyArIDEsIDMpO1xuICAgICAgICAgICAgcG9zICs9IDM7XG4gICAgICAgICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgICAgICAgICAvLyBnbyB0byBlbmQgb2YgYnl0ZSBib3VuZGFyeVxuICAgICAgICAgICAgICAgIHZhciBzID0gc2hmdChwb3MpICsgNCwgbCA9IGRhdFtzIC0gNF0gfCAoZGF0W3MgLSAzXSA8PCA4KSwgdCA9IHMgKyBsO1xuICAgICAgICAgICAgICAgIGlmICh0ID4gc2wpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vU3QpXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnIoMCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBlbnN1cmUgc2l6ZVxuICAgICAgICAgICAgICAgIGlmIChyZXNpemUpXG4gICAgICAgICAgICAgICAgICAgIGNidWYoYnQgKyBsKTtcbiAgICAgICAgICAgICAgICAvLyBDb3B5IG92ZXIgdW5jb21wcmVzc2VkIGRhdGFcbiAgICAgICAgICAgICAgICBidWYuc2V0KGRhdC5zdWJhcnJheShzLCB0KSwgYnQpO1xuICAgICAgICAgICAgICAgIC8vIEdldCBuZXcgYml0cG9zLCB1cGRhdGUgYnl0ZSBjb3VudFxuICAgICAgICAgICAgICAgIHN0LmIgPSBidCArPSBsLCBzdC5wID0gcG9zID0gdCAqIDgsIHN0LmYgPSBmaW5hbDtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGUgPT0gMSlcbiAgICAgICAgICAgICAgICBsbSA9IGZscm0sIGRtID0gZmRybSwgbGJ0ID0gOSwgZGJ0ID0gNTtcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGUgPT0gMikge1xuICAgICAgICAgICAgICAgIC8vICBsaXRlcmFsICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0aHNcbiAgICAgICAgICAgICAgICB2YXIgaExpdCA9IGJpdHMoZGF0LCBwb3MsIDMxKSArIDI1NywgaGNMZW4gPSBiaXRzKGRhdCwgcG9zICsgMTAsIDE1KSArIDQ7XG4gICAgICAgICAgICAgICAgdmFyIHRsID0gaExpdCArIGJpdHMoZGF0LCBwb3MgKyA1LCAzMSkgKyAxO1xuICAgICAgICAgICAgICAgIHBvcyArPSAxNDtcbiAgICAgICAgICAgICAgICAvLyBsZW5ndGgrZGlzdGFuY2UgdHJlZVxuICAgICAgICAgICAgICAgIHZhciBsZHQgPSBuZXcgdTgodGwpO1xuICAgICAgICAgICAgICAgIC8vIGNvZGUgbGVuZ3RoIHRyZWVcbiAgICAgICAgICAgICAgICB2YXIgY2x0ID0gbmV3IHU4KDE5KTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhjTGVuOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdXNlIGluZGV4IG1hcCB0byBnZXQgcmVhbCBjb2RlXG4gICAgICAgICAgICAgICAgICAgIGNsdFtjbGltW2ldXSA9IGJpdHMoZGF0LCBwb3MgKyBpICogMywgNyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBvcyArPSBoY0xlbiAqIDM7XG4gICAgICAgICAgICAgICAgLy8gY29kZSBsZW5ndGhzIGJpdHNcbiAgICAgICAgICAgICAgICB2YXIgY2xiID0gbWF4KGNsdCksIGNsYm1zayA9ICgxIDw8IGNsYikgLSAxO1xuICAgICAgICAgICAgICAgIC8vIGNvZGUgbGVuZ3RocyBtYXBcbiAgICAgICAgICAgICAgICB2YXIgY2xtID0gaE1hcChjbHQsIGNsYiwgMSk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0bDspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHIgPSBjbG1bYml0cyhkYXQsIHBvcywgY2xibXNrKV07XG4gICAgICAgICAgICAgICAgICAgIC8vIGJpdHMgcmVhZFxuICAgICAgICAgICAgICAgICAgICBwb3MgKz0gciAmIDE1O1xuICAgICAgICAgICAgICAgICAgICAvLyBzeW1ib2xcbiAgICAgICAgICAgICAgICAgICAgdmFyIHMgPSByID4+IDQ7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvZGUgbGVuZ3RoIHRvIGNvcHlcbiAgICAgICAgICAgICAgICAgICAgaWYgKHMgPCAxNikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGR0W2krK10gPSBzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gIGNvcHkgICBjb3VudFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGMgPSAwLCBuID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzID09IDE2KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4gPSAzICsgYml0cyhkYXQsIHBvcywgMyksIHBvcyArPSAyLCBjID0gbGR0W2kgLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHMgPT0gMTcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbiA9IDMgKyBiaXRzKGRhdCwgcG9zLCA3KSwgcG9zICs9IDM7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzID09IDE4KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG4gPSAxMSArIGJpdHMoZGF0LCBwb3MsIDEyNyksIHBvcyArPSA3O1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKG4tLSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZHRbaSsrXSA9IGM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gICAgbGVuZ3RoIHRyZWUgICAgICAgICAgICAgICAgIGRpc3RhbmNlIHRyZWVcbiAgICAgICAgICAgICAgICB2YXIgbHQgPSBsZHQuc3ViYXJyYXkoMCwgaExpdCksIGR0ID0gbGR0LnN1YmFycmF5KGhMaXQpO1xuICAgICAgICAgICAgICAgIC8vIG1heCBsZW5ndGggYml0c1xuICAgICAgICAgICAgICAgIGxidCA9IG1heChsdCk7XG4gICAgICAgICAgICAgICAgLy8gbWF4IGRpc3QgYml0c1xuICAgICAgICAgICAgICAgIGRidCA9IG1heChkdCk7XG4gICAgICAgICAgICAgICAgbG0gPSBoTWFwKGx0LCBsYnQsIDEpO1xuICAgICAgICAgICAgICAgIGRtID0gaE1hcChkdCwgZGJ0LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBlcnIoMSk7XG4gICAgICAgICAgICBpZiAocG9zID4gdGJ0cykge1xuICAgICAgICAgICAgICAgIGlmIChub1N0KVxuICAgICAgICAgICAgICAgICAgICBlcnIoMCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBidWZmZXIgY2FuIGhvbGQgdGhpcyArIHRoZSBsYXJnZXN0IHBvc3NpYmxlIGFkZGl0aW9uXG4gICAgICAgIC8vIE1heGltdW0gY2h1bmsgc2l6ZSAocHJhY3RpY2FsbHksIHRoZW9yZXRpY2FsbHkgaW5maW5pdGUpIGlzIDJeMTdcbiAgICAgICAgaWYgKHJlc2l6ZSlcbiAgICAgICAgICAgIGNidWYoYnQgKyAxMzEwNzIpO1xuICAgICAgICB2YXIgbG1zID0gKDEgPDwgbGJ0KSAtIDEsIGRtcyA9ICgxIDw8IGRidCkgLSAxO1xuICAgICAgICB2YXIgbHBvcyA9IHBvcztcbiAgICAgICAgZm9yICg7OyBscG9zID0gcG9zKSB7XG4gICAgICAgICAgICAvLyBiaXRzIHJlYWQsIGNvZGVcbiAgICAgICAgICAgIHZhciBjID0gbG1bYml0czE2KGRhdCwgcG9zKSAmIGxtc10sIHN5bSA9IGMgPj4gNDtcbiAgICAgICAgICAgIHBvcyArPSBjICYgMTU7XG4gICAgICAgICAgICBpZiAocG9zID4gdGJ0cykge1xuICAgICAgICAgICAgICAgIGlmIChub1N0KVxuICAgICAgICAgICAgICAgICAgICBlcnIoMCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWMpXG4gICAgICAgICAgICAgICAgZXJyKDIpO1xuICAgICAgICAgICAgaWYgKHN5bSA8IDI1NilcbiAgICAgICAgICAgICAgICBidWZbYnQrK10gPSBzeW07XG4gICAgICAgICAgICBlbHNlIGlmIChzeW0gPT0gMjU2KSB7XG4gICAgICAgICAgICAgICAgbHBvcyA9IHBvcywgbG0gPSBudWxsO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIGFkZCA9IHN5bSAtIDI1NDtcbiAgICAgICAgICAgICAgICAvLyBubyBleHRyYSBiaXRzIG5lZWRlZCBpZiBsZXNzXG4gICAgICAgICAgICAgICAgaWYgKHN5bSA+IDI2NCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBpbmRleFxuICAgICAgICAgICAgICAgICAgICB2YXIgaSA9IHN5bSAtIDI1NywgYiA9IGZsZWJbaV07XG4gICAgICAgICAgICAgICAgICAgIGFkZCA9IGJpdHMoZGF0LCBwb3MsICgxIDw8IGIpIC0gMSkgKyBmbFtpXTtcbiAgICAgICAgICAgICAgICAgICAgcG9zICs9IGI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGRpc3RcbiAgICAgICAgICAgICAgICB2YXIgZCA9IGRtW2JpdHMxNihkYXQsIHBvcykgJiBkbXNdLCBkc3ltID0gZCA+PiA0O1xuICAgICAgICAgICAgICAgIGlmICghZClcbiAgICAgICAgICAgICAgICAgICAgZXJyKDMpO1xuICAgICAgICAgICAgICAgIHBvcyArPSBkICYgMTU7XG4gICAgICAgICAgICAgICAgdmFyIGR0ID0gZmRbZHN5bV07XG4gICAgICAgICAgICAgICAgaWYgKGRzeW0gPiAzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiID0gZmRlYltkc3ltXTtcbiAgICAgICAgICAgICAgICAgICAgZHQgKz0gYml0czE2KGRhdCwgcG9zKSAmICgxIDw8IGIpIC0gMSwgcG9zICs9IGI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChwb3MgPiB0YnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub1N0KVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyKDApO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJlc2l6ZSlcbiAgICAgICAgICAgICAgICAgICAgY2J1ZihidCArIDEzMTA3Mik7XG4gICAgICAgICAgICAgICAgdmFyIGVuZCA9IGJ0ICsgYWRkO1xuICAgICAgICAgICAgICAgIGlmIChidCA8IGR0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzaGlmdCA9IGRsIC0gZHQsIGRlbmQgPSBNYXRoLm1pbihkdCwgZW5kKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNoaWZ0ICsgYnQgPCAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyKDMpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKDsgYnQgPCBkZW5kOyArK2J0KVxuICAgICAgICAgICAgICAgICAgICAgICAgYnVmW2J0XSA9IGRpY3Rbc2hpZnQgKyBidF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAoOyBidCA8IGVuZDsgKytidClcbiAgICAgICAgICAgICAgICAgICAgYnVmW2J0XSA9IGJ1ZltidCAtIGR0XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzdC5sID0gbG0sIHN0LnAgPSBscG9zLCBzdC5iID0gYnQsIHN0LmYgPSBmaW5hbDtcbiAgICAgICAgaWYgKGxtKVxuICAgICAgICAgICAgZmluYWwgPSAxLCBzdC5tID0gbGJ0LCBzdC5kID0gZG0sIHN0Lm4gPSBkYnQ7XG4gICAgfSB3aGlsZSAoIWZpbmFsKTtcbiAgICAvLyBkb24ndCByZWFsbG9jYXRlIGZvciBzdHJlYW1zIG9yIHVzZXIgYnVmZmVyc1xuICAgIHJldHVybiBidCAhPSBidWYubGVuZ3RoICYmIG5vQnVmID8gc2xjKGJ1ZiwgMCwgYnQpIDogYnVmLnN1YmFycmF5KDAsIGJ0KTtcbn07XG4vLyBzdGFydGluZyBhdCBwLCB3cml0ZSB0aGUgbWluaW11bSBudW1iZXIgb2YgYml0cyB0aGF0IGNhbiBob2xkIHYgdG8gZFxudmFyIHdiaXRzID0gZnVuY3Rpb24gKGQsIHAsIHYpIHtcbiAgICB2IDw8PSBwICYgNztcbiAgICB2YXIgbyA9IChwIC8gOCkgfCAwO1xuICAgIGRbb10gfD0gdjtcbiAgICBkW28gKyAxXSB8PSB2ID4+IDg7XG59O1xuLy8gc3RhcnRpbmcgYXQgcCwgd3JpdGUgdGhlIG1pbmltdW0gbnVtYmVyIG9mIGJpdHMgKD44KSB0aGF0IGNhbiBob2xkIHYgdG8gZFxudmFyIHdiaXRzMTYgPSBmdW5jdGlvbiAoZCwgcCwgdikge1xuICAgIHYgPDw9IHAgJiA3O1xuICAgIHZhciBvID0gKHAgLyA4KSB8IDA7XG4gICAgZFtvXSB8PSB2O1xuICAgIGRbbyArIDFdIHw9IHYgPj4gODtcbiAgICBkW28gKyAyXSB8PSB2ID4+IDE2O1xufTtcbi8vIGNyZWF0ZXMgY29kZSBsZW5ndGhzIGZyb20gYSBmcmVxdWVuY3kgdGFibGVcbnZhciBoVHJlZSA9IGZ1bmN0aW9uIChkLCBtYikge1xuICAgIC8vIE5lZWQgZXh0cmEgaW5mbyB0byBtYWtlIGEgdHJlZVxuICAgIHZhciB0ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChkW2ldKVxuICAgICAgICAgICAgdC5wdXNoKHsgczogaSwgZjogZFtpXSB9KTtcbiAgICB9XG4gICAgdmFyIHMgPSB0Lmxlbmd0aDtcbiAgICB2YXIgdDIgPSB0LnNsaWNlKCk7XG4gICAgaWYgKCFzKVxuICAgICAgICByZXR1cm4geyB0OiBldCwgbDogMCB9O1xuICAgIGlmIChzID09IDEpIHtcbiAgICAgICAgdmFyIHYgPSBuZXcgdTgodFswXS5zICsgMSk7XG4gICAgICAgIHZbdFswXS5zXSA9IDE7XG4gICAgICAgIHJldHVybiB7IHQ6IHYsIGw6IDEgfTtcbiAgICB9XG4gICAgdC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhLmYgLSBiLmY7IH0pO1xuICAgIC8vIGFmdGVyIGkyIHJlYWNoZXMgbGFzdCBpbmQsIHdpbGwgYmUgc3RvcHBlZFxuICAgIC8vIGZyZXEgbXVzdCBiZSBncmVhdGVyIHRoYW4gbGFyZ2VzdCBwb3NzaWJsZSBudW1iZXIgb2Ygc3ltYm9sc1xuICAgIHQucHVzaCh7IHM6IC0xLCBmOiAyNTAwMSB9KTtcbiAgICB2YXIgbCA9IHRbMF0sIHIgPSB0WzFdLCBpMCA9IDAsIGkxID0gMSwgaTIgPSAyO1xuICAgIHRbMF0gPSB7IHM6IC0xLCBmOiBsLmYgKyByLmYsIGw6IGwsIHI6IHIgfTtcbiAgICAvLyBlZmZpY2llbnQgYWxnb3JpdGhtIGZyb20gVVpJUC5qc1xuICAgIC8vIGkwIGlzIGxvb2tiZWhpbmQsIGkyIGlzIGxvb2thaGVhZCAtIGFmdGVyIHByb2Nlc3NpbmcgdHdvIGxvdy1mcmVxXG4gICAgLy8gc3ltYm9scyB0aGF0IGNvbWJpbmVkIGhhdmUgaGlnaCBmcmVxLCB3aWxsIHN0YXJ0IHByb2Nlc3NpbmcgaTIgKGhpZ2gtZnJlcSxcbiAgICAvLyBub24tY29tcG9zaXRlKSBzeW1ib2xzIGluc3RlYWRcbiAgICAvLyBzZWUgaHR0cHM6Ly9yZWRkaXQuY29tL3IvcGhvdG9wZWEvY29tbWVudHMvaWtla2h0L3V6aXBqc19xdWVzdGlvbnMvXG4gICAgd2hpbGUgKGkxICE9IHMgLSAxKSB7XG4gICAgICAgIGwgPSB0W3RbaTBdLmYgPCB0W2kyXS5mID8gaTArKyA6IGkyKytdO1xuICAgICAgICByID0gdFtpMCAhPSBpMSAmJiB0W2kwXS5mIDwgdFtpMl0uZiA/IGkwKysgOiBpMisrXTtcbiAgICAgICAgdFtpMSsrXSA9IHsgczogLTEsIGY6IGwuZiArIHIuZiwgbDogbCwgcjogciB9O1xuICAgIH1cbiAgICB2YXIgbWF4U3ltID0gdDJbMF0ucztcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IHM7ICsraSkge1xuICAgICAgICBpZiAodDJbaV0ucyA+IG1heFN5bSlcbiAgICAgICAgICAgIG1heFN5bSA9IHQyW2ldLnM7XG4gICAgfVxuICAgIC8vIGNvZGUgbGVuZ3Roc1xuICAgIHZhciB0ciA9IG5ldyB1MTYobWF4U3ltICsgMSk7XG4gICAgLy8gbWF4IGJpdHMgaW4gdHJlZVxuICAgIHZhciBtYnQgPSBsbih0W2kxIC0gMV0sIHRyLCAwKTtcbiAgICBpZiAobWJ0ID4gbWIpIHtcbiAgICAgICAgLy8gbW9yZSBhbGdvcml0aG1zIGZyb20gVVpJUC5qc1xuICAgICAgICAvLyBUT0RPOiBmaW5kIG91dCBob3cgdGhpcyBjb2RlIHdvcmtzIChkZWJ0KVxuICAgICAgICAvLyAgaW5kICAgIGRlYnRcbiAgICAgICAgdmFyIGkgPSAwLCBkdCA9IDA7XG4gICAgICAgIC8vICAgIGxlZnQgICAgICAgICAgICBjb3N0XG4gICAgICAgIHZhciBsZnQgPSBtYnQgLSBtYiwgY3N0ID0gMSA8PCBsZnQ7XG4gICAgICAgIHQyLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIHRyW2Iuc10gLSB0clthLnNdIHx8IGEuZiAtIGIuZjsgfSk7XG4gICAgICAgIGZvciAoOyBpIDwgczsgKytpKSB7XG4gICAgICAgICAgICB2YXIgaTJfMSA9IHQyW2ldLnM7XG4gICAgICAgICAgICBpZiAodHJbaTJfMV0gPiBtYikge1xuICAgICAgICAgICAgICAgIGR0ICs9IGNzdCAtICgxIDw8IChtYnQgLSB0cltpMl8xXSkpO1xuICAgICAgICAgICAgICAgIHRyW2kyXzFdID0gbWI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZHQgPj49IGxmdDtcbiAgICAgICAgd2hpbGUgKGR0ID4gMCkge1xuICAgICAgICAgICAgdmFyIGkyXzIgPSB0MltpXS5zO1xuICAgICAgICAgICAgaWYgKHRyW2kyXzJdIDwgbWIpXG4gICAgICAgICAgICAgICAgZHQgLT0gMSA8PCAobWIgLSB0cltpMl8yXSsrIC0gMSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgKytpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoOyBpID49IDAgJiYgZHQ7IC0taSkge1xuICAgICAgICAgICAgdmFyIGkyXzMgPSB0MltpXS5zO1xuICAgICAgICAgICAgaWYgKHRyW2kyXzNdID09IG1iKSB7XG4gICAgICAgICAgICAgICAgLS10cltpMl8zXTtcbiAgICAgICAgICAgICAgICArK2R0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG1idCA9IG1iO1xuICAgIH1cbiAgICByZXR1cm4geyB0OiBuZXcgdTgodHIpLCBsOiBtYnQgfTtcbn07XG4vLyBnZXQgdGhlIG1heCBsZW5ndGggYW5kIGFzc2lnbiBsZW5ndGggY29kZXNcbnZhciBsbiA9IGZ1bmN0aW9uIChuLCBsLCBkKSB7XG4gICAgcmV0dXJuIG4ucyA9PSAtMVxuICAgICAgICA/IE1hdGgubWF4KGxuKG4ubCwgbCwgZCArIDEpLCBsbihuLnIsIGwsIGQgKyAxKSlcbiAgICAgICAgOiAobFtuLnNdID0gZCk7XG59O1xuLy8gbGVuZ3RoIGNvZGVzIGdlbmVyYXRpb25cbnZhciBsYyA9IGZ1bmN0aW9uIChjKSB7XG4gICAgdmFyIHMgPSBjLmxlbmd0aDtcbiAgICAvLyBOb3RlIHRoYXQgdGhlIHNlbWljb2xvbiB3YXMgaW50ZW50aW9uYWxcbiAgICB3aGlsZSAocyAmJiAhY1stLXNdKVxuICAgICAgICA7XG4gICAgdmFyIGNsID0gbmV3IHUxNigrK3MpO1xuICAgIC8vICBpbmQgICAgICBudW0gICAgICAgICBzdHJlYWtcbiAgICB2YXIgY2xpID0gMCwgY2xuID0gY1swXSwgY2xzID0gMTtcbiAgICB2YXIgdyA9IGZ1bmN0aW9uICh2KSB7IGNsW2NsaSsrXSA9IHY7IH07XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gczsgKytpKSB7XG4gICAgICAgIGlmIChjW2ldID09IGNsbiAmJiBpICE9IHMpXG4gICAgICAgICAgICArK2NscztcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoIWNsbiAmJiBjbHMgPiAyKSB7XG4gICAgICAgICAgICAgICAgZm9yICg7IGNscyA+IDEzODsgY2xzIC09IDEzOClcbiAgICAgICAgICAgICAgICAgICAgdygzMjc1NCk7XG4gICAgICAgICAgICAgICAgaWYgKGNscyA+IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgdyhjbHMgPiAxMCA/ICgoY2xzIC0gMTEpIDw8IDUpIHwgMjg2OTAgOiAoKGNscyAtIDMpIDw8IDUpIHwgMTIzMDUpO1xuICAgICAgICAgICAgICAgICAgICBjbHMgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNscyA+IDMpIHtcbiAgICAgICAgICAgICAgICB3KGNsbiksIC0tY2xzO1xuICAgICAgICAgICAgICAgIGZvciAoOyBjbHMgPiA2OyBjbHMgLT0gNilcbiAgICAgICAgICAgICAgICAgICAgdyg4MzA0KTtcbiAgICAgICAgICAgICAgICBpZiAoY2xzID4gMilcbiAgICAgICAgICAgICAgICAgICAgdygoKGNscyAtIDMpIDw8IDUpIHwgODIwOCksIGNscyA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aGlsZSAoY2xzLS0pXG4gICAgICAgICAgICAgICAgdyhjbG4pO1xuICAgICAgICAgICAgY2xzID0gMTtcbiAgICAgICAgICAgIGNsbiA9IGNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgYzogY2wuc3ViYXJyYXkoMCwgY2xpKSwgbjogcyB9O1xufTtcbi8vIGNhbGN1bGF0ZSB0aGUgbGVuZ3RoIG9mIG91dHB1dCBmcm9tIHRyZWUsIGNvZGUgbGVuZ3Roc1xudmFyIGNsZW4gPSBmdW5jdGlvbiAoY2YsIGNsKSB7XG4gICAgdmFyIGwgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2wubGVuZ3RoOyArK2kpXG4gICAgICAgIGwgKz0gY2ZbaV0gKiBjbFtpXTtcbiAgICByZXR1cm4gbDtcbn07XG4vLyB3cml0ZXMgYSBmaXhlZCBibG9ja1xuLy8gcmV0dXJucyB0aGUgbmV3IGJpdCBwb3NcbnZhciB3ZmJsayA9IGZ1bmN0aW9uIChvdXQsIHBvcywgZGF0KSB7XG4gICAgLy8gbm8gbmVlZCB0byB3cml0ZSAwMCBhcyB0eXBlOiBUeXBlZEFycmF5IGRlZmF1bHRzIHRvIDBcbiAgICB2YXIgcyA9IGRhdC5sZW5ndGg7XG4gICAgdmFyIG8gPSBzaGZ0KHBvcyArIDIpO1xuICAgIG91dFtvXSA9IHMgJiAyNTU7XG4gICAgb3V0W28gKyAxXSA9IHMgPj4gODtcbiAgICBvdXRbbyArIDJdID0gb3V0W29dIF4gMjU1O1xuICAgIG91dFtvICsgM10gPSBvdXRbbyArIDFdIF4gMjU1O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgczsgKytpKVxuICAgICAgICBvdXRbbyArIGkgKyA0XSA9IGRhdFtpXTtcbiAgICByZXR1cm4gKG8gKyA0ICsgcykgKiA4O1xufTtcbi8vIHdyaXRlcyBhIGJsb2NrXG52YXIgd2JsayA9IGZ1bmN0aW9uIChkYXQsIG91dCwgZmluYWwsIHN5bXMsIGxmLCBkZiwgZWIsIGxpLCBicywgYmwsIHApIHtcbiAgICB3Yml0cyhvdXQsIHArKywgZmluYWwpO1xuICAgICsrbGZbMjU2XTtcbiAgICB2YXIgX2EgPSBoVHJlZShsZiwgMTUpLCBkbHQgPSBfYS50LCBtbGIgPSBfYS5sO1xuICAgIHZhciBfYiA9IGhUcmVlKGRmLCAxNSksIGRkdCA9IF9iLnQsIG1kYiA9IF9iLmw7XG4gICAgdmFyIF9jID0gbGMoZGx0KSwgbGNsdCA9IF9jLmMsIG5sYyA9IF9jLm47XG4gICAgdmFyIF9kID0gbGMoZGR0KSwgbGNkdCA9IF9kLmMsIG5kYyA9IF9kLm47XG4gICAgdmFyIGxjZnJlcSA9IG5ldyB1MTYoMTkpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGNsdC5sZW5ndGg7ICsraSlcbiAgICAgICAgKytsY2ZyZXFbbGNsdFtpXSAmIDMxXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxjZHQubGVuZ3RoOyArK2kpXG4gICAgICAgICsrbGNmcmVxW2xjZHRbaV0gJiAzMV07XG4gICAgdmFyIF9lID0gaFRyZWUobGNmcmVxLCA3KSwgbGN0ID0gX2UudCwgbWxjYiA9IF9lLmw7XG4gICAgdmFyIG5sY2MgPSAxOTtcbiAgICBmb3IgKDsgbmxjYyA+IDQgJiYgIWxjdFtjbGltW25sY2MgLSAxXV07IC0tbmxjYylcbiAgICAgICAgO1xuICAgIHZhciBmbGVuID0gKGJsICsgNSkgPDwgMztcbiAgICB2YXIgZnRsZW4gPSBjbGVuKGxmLCBmbHQpICsgY2xlbihkZiwgZmR0KSArIGViO1xuICAgIHZhciBkdGxlbiA9IGNsZW4obGYsIGRsdCkgKyBjbGVuKGRmLCBkZHQpICsgZWIgKyAxNCArIDMgKiBubGNjICsgY2xlbihsY2ZyZXEsIGxjdCkgKyAyICogbGNmcmVxWzE2XSArIDMgKiBsY2ZyZXFbMTddICsgNyAqIGxjZnJlcVsxOF07XG4gICAgaWYgKGJzID49IDAgJiYgZmxlbiA8PSBmdGxlbiAmJiBmbGVuIDw9IGR0bGVuKVxuICAgICAgICByZXR1cm4gd2ZibGsob3V0LCBwLCBkYXQuc3ViYXJyYXkoYnMsIGJzICsgYmwpKTtcbiAgICB2YXIgbG0sIGxsLCBkbSwgZGw7XG4gICAgd2JpdHMob3V0LCBwLCAxICsgKGR0bGVuIDwgZnRsZW4pKSwgcCArPSAyO1xuICAgIGlmIChkdGxlbiA8IGZ0bGVuKSB7XG4gICAgICAgIGxtID0gaE1hcChkbHQsIG1sYiwgMCksIGxsID0gZGx0LCBkbSA9IGhNYXAoZGR0LCBtZGIsIDApLCBkbCA9IGRkdDtcbiAgICAgICAgdmFyIGxsbSA9IGhNYXAobGN0LCBtbGNiLCAwKTtcbiAgICAgICAgd2JpdHMob3V0LCBwLCBubGMgLSAyNTcpO1xuICAgICAgICB3Yml0cyhvdXQsIHAgKyA1LCBuZGMgLSAxKTtcbiAgICAgICAgd2JpdHMob3V0LCBwICsgMTAsIG5sY2MgLSA0KTtcbiAgICAgICAgcCArPSAxNDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBubGNjOyArK2kpXG4gICAgICAgICAgICB3Yml0cyhvdXQsIHAgKyAzICogaSwgbGN0W2NsaW1baV1dKTtcbiAgICAgICAgcCArPSAzICogbmxjYztcbiAgICAgICAgdmFyIGxjdHMgPSBbbGNsdCwgbGNkdF07XG4gICAgICAgIGZvciAodmFyIGl0ID0gMDsgaXQgPCAyOyArK2l0KSB7XG4gICAgICAgICAgICB2YXIgY2xjdCA9IGxjdHNbaXRdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjbGN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxlbiA9IGNsY3RbaV0gJiAzMTtcbiAgICAgICAgICAgICAgICB3Yml0cyhvdXQsIHAsIGxsbVtsZW5dKSwgcCArPSBsY3RbbGVuXTtcbiAgICAgICAgICAgICAgICBpZiAobGVuID4gMTUpXG4gICAgICAgICAgICAgICAgICAgIHdiaXRzKG91dCwgcCwgKGNsY3RbaV0gPj4gNSkgJiAxMjcpLCBwICs9IGNsY3RbaV0gPj4gMTI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGxtID0gZmxtLCBsbCA9IGZsdCwgZG0gPSBmZG0sIGRsID0gZmR0O1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpOyArK2kpIHtcbiAgICAgICAgdmFyIHN5bSA9IHN5bXNbaV07XG4gICAgICAgIGlmIChzeW0gPiAyNTUpIHtcbiAgICAgICAgICAgIHZhciBsZW4gPSAoc3ltID4+IDE4KSAmIDMxO1xuICAgICAgICAgICAgd2JpdHMxNihvdXQsIHAsIGxtW2xlbiArIDI1N10pLCBwICs9IGxsW2xlbiArIDI1N107XG4gICAgICAgICAgICBpZiAobGVuID4gNylcbiAgICAgICAgICAgICAgICB3Yml0cyhvdXQsIHAsIChzeW0gPj4gMjMpICYgMzEpLCBwICs9IGZsZWJbbGVuXTtcbiAgICAgICAgICAgIHZhciBkc3QgPSBzeW0gJiAzMTtcbiAgICAgICAgICAgIHdiaXRzMTYob3V0LCBwLCBkbVtkc3RdKSwgcCArPSBkbFtkc3RdO1xuICAgICAgICAgICAgaWYgKGRzdCA+IDMpXG4gICAgICAgICAgICAgICAgd2JpdHMxNihvdXQsIHAsIChzeW0gPj4gNSkgJiA4MTkxKSwgcCArPSBmZGViW2RzdF07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB3Yml0czE2KG91dCwgcCwgbG1bc3ltXSksIHAgKz0gbGxbc3ltXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB3Yml0czE2KG91dCwgcCwgbG1bMjU2XSk7XG4gICAgcmV0dXJuIHAgKyBsbFsyNTZdO1xufTtcbi8vIGRlZmxhdGUgb3B0aW9ucyAobmljZSA8PCAxMykgfCBjaGFpblxudmFyIGRlbyA9IC8qI19fUFVSRV9fKi8gbmV3IGkzMihbNjU1NDAsIDEzMTA4MCwgMTMxMDg4LCAxMzExMDQsIDI2MjE3NiwgMTA0ODcwNCwgMTA0ODgzMiwgMjExNDU2MCwgMjExNzYzMl0pO1xuLy8gZW1wdHlcbnZhciBldCA9IC8qI19fUFVSRV9fKi8gbmV3IHU4KDApO1xuLy8gY29tcHJlc3NlcyBkYXRhIGludG8gYSByYXcgREVGTEFURSBidWZmZXJcbnZhciBkZmx0ID0gZnVuY3Rpb24gKGRhdCwgbHZsLCBwbHZsLCBwcmUsIHBvc3QsIHN0KSB7XG4gICAgdmFyIHMgPSBzdC56IHx8IGRhdC5sZW5ndGg7XG4gICAgdmFyIG8gPSBuZXcgdTgocHJlICsgcyArIDUgKiAoMSArIE1hdGguY2VpbChzIC8gNzAwMCkpICsgcG9zdCk7XG4gICAgLy8gd3JpdGluZyB0byB0aGlzIHdyaXRlcyB0byB0aGUgb3V0cHV0IGJ1ZmZlclxuICAgIHZhciB3ID0gby5zdWJhcnJheShwcmUsIG8ubGVuZ3RoIC0gcG9zdCk7XG4gICAgdmFyIGxzdCA9IHN0Lmw7XG4gICAgdmFyIHBvcyA9IChzdC5yIHx8IDApICYgNztcbiAgICBpZiAobHZsKSB7XG4gICAgICAgIGlmIChwb3MpXG4gICAgICAgICAgICB3WzBdID0gc3QuciA+PiAzO1xuICAgICAgICB2YXIgb3B0ID0gZGVvW2x2bCAtIDFdO1xuICAgICAgICB2YXIgbiA9IG9wdCA+PiAxMywgYyA9IG9wdCAmIDgxOTE7XG4gICAgICAgIHZhciBtc2tfMSA9ICgxIDw8IHBsdmwpIC0gMTtcbiAgICAgICAgLy8gICAgcHJldiAyLWJ5dGUgdmFsIG1hcCAgICBjdXJyIDItYnl0ZSB2YWwgbWFwXG4gICAgICAgIHZhciBwcmV2ID0gc3QucCB8fCBuZXcgdTE2KDMyNzY4KSwgaGVhZCA9IHN0LmggfHwgbmV3IHUxNihtc2tfMSArIDEpO1xuICAgICAgICB2YXIgYnMxXzEgPSBNYXRoLmNlaWwocGx2bCAvIDMpLCBiczJfMSA9IDIgKiBiczFfMTtcbiAgICAgICAgdmFyIGhzaCA9IGZ1bmN0aW9uIChpKSB7IHJldHVybiAoZGF0W2ldIF4gKGRhdFtpICsgMV0gPDwgYnMxXzEpIF4gKGRhdFtpICsgMl0gPDwgYnMyXzEpKSAmIG1za18xOyB9O1xuICAgICAgICAvLyAyNDU3NiBpcyBhbiBhcmJpdHJhcnkgbnVtYmVyIG9mIG1heGltdW0gc3ltYm9scyBwZXIgYmxvY2tcbiAgICAgICAgLy8gNDI0IGJ1ZmZlciBmb3IgbGFzdCBibG9ja1xuICAgICAgICB2YXIgc3ltcyA9IG5ldyBpMzIoMjUwMDApO1xuICAgICAgICAvLyBsZW5ndGgvbGl0ZXJhbCBmcmVxICAgZGlzdGFuY2UgZnJlcVxuICAgICAgICB2YXIgbGYgPSBuZXcgdTE2KDI4OCksIGRmID0gbmV3IHUxNigzMik7XG4gICAgICAgIC8vICBsL2xjbnQgIGV4Yml0cyAgaW5kZXggICAgICAgICAgbC9saW5kICB3YWl0ZHggICAgICAgICAgYmxrcG9zXG4gICAgICAgIHZhciBsY18xID0gMCwgZWIgPSAwLCBpID0gc3QuaSB8fCAwLCBsaSA9IDAsIHdpID0gc3QudyB8fCAwLCBicyA9IDA7XG4gICAgICAgIGZvciAoOyBpICsgMiA8IHM7ICsraSkge1xuICAgICAgICAgICAgLy8gaGFzaCB2YWx1ZVxuICAgICAgICAgICAgdmFyIGh2ID0gaHNoKGkpO1xuICAgICAgICAgICAgLy8gaW5kZXggbW9kIDMyNzY4ICAgIHByZXZpb3VzIGluZGV4IG1vZFxuICAgICAgICAgICAgdmFyIGltb2QgPSBpICYgMzI3NjcsIHBpbW9kID0gaGVhZFtodl07XG4gICAgICAgICAgICBwcmV2W2ltb2RdID0gcGltb2Q7XG4gICAgICAgICAgICBoZWFkW2h2XSA9IGltb2Q7XG4gICAgICAgICAgICAvLyBXZSBhbHdheXMgc2hvdWxkIG1vZGlmeSBoZWFkIGFuZCBwcmV2LCBidXQgb25seSBhZGQgc3ltYm9scyBpZlxuICAgICAgICAgICAgLy8gdGhpcyBkYXRhIGlzIG5vdCB5ZXQgcHJvY2Vzc2VkIChcIndhaXRcIiBmb3Igd2FpdCBpbmRleClcbiAgICAgICAgICAgIGlmICh3aSA8PSBpKSB7XG4gICAgICAgICAgICAgICAgLy8gYnl0ZXMgcmVtYWluaW5nXG4gICAgICAgICAgICAgICAgdmFyIHJlbSA9IHMgLSBpO1xuICAgICAgICAgICAgICAgIGlmICgobGNfMSA+IDcwMDAgfHwgbGkgPiAyNDU3NikgJiYgKHJlbSA+IDQyMyB8fCAhbHN0KSkge1xuICAgICAgICAgICAgICAgICAgICBwb3MgPSB3YmxrKGRhdCwgdywgMCwgc3ltcywgbGYsIGRmLCBlYiwgbGksIGJzLCBpIC0gYnMsIHBvcyk7XG4gICAgICAgICAgICAgICAgICAgIGxpID0gbGNfMSA9IGViID0gMCwgYnMgPSBpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDI4NjsgKytqKVxuICAgICAgICAgICAgICAgICAgICAgICAgbGZbal0gPSAwO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDMwOyArK2opXG4gICAgICAgICAgICAgICAgICAgICAgICBkZltqXSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vICBsZW4gICAgZGlzdCAgIGNoYWluXG4gICAgICAgICAgICAgICAgdmFyIGwgPSAyLCBkID0gMCwgY2hfMSA9IGMsIGRpZiA9IGltb2QgLSBwaW1vZCAmIDMyNzY3O1xuICAgICAgICAgICAgICAgIGlmIChyZW0gPiAyICYmIGh2ID09IGhzaChpIC0gZGlmKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWF4biA9IE1hdGgubWluKG4sIHJlbSkgLSAxO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWF4ZCA9IE1hdGgubWluKDMyNzY3LCBpKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gbWF4IHBvc3NpYmxlIGxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAvLyBub3QgY2FwcGVkIGF0IGRpZiBiZWNhdXNlIGRlY29tcHJlc3NvcnMgaW1wbGVtZW50IFwicm9sbGluZ1wiIGluZGV4IHBvcHVsYXRpb25cbiAgICAgICAgICAgICAgICAgICAgdmFyIG1sID0gTWF0aC5taW4oMjU4LCByZW0pO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoZGlmIDw9IG1heGQgJiYgLS1jaF8xICYmIGltb2QgIT0gcGltb2QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRbaSArIGxdID09IGRhdFtpICsgbCAtIGRpZl0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmwgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoOyBubCA8IG1sICYmIGRhdFtpICsgbmxdID09IGRhdFtpICsgbmwgLSBkaWZdOyArK25sKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5sID4gbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsID0gbmwsIGQgPSBkaWY7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJyZWFrIG91dCBlYXJseSB3aGVuIHdlIHJlYWNoIFwibmljZVwiICh3ZSBhcmUgc2F0aXNmaWVkIGVub3VnaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5sID4gbWF4bilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBub3csIGZpbmQgdGhlIHJhcmVzdCAyLWJ5dGUgc2VxdWVuY2Ugd2l0aGluIHRoaXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbGVuZ3RoIG9mIGxpdGVyYWxzIGFuZCBzZWFyY2ggZm9yIHRoYXQgaW5zdGVhZC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTXVjaCBmYXN0ZXIgdGhhbiBqdXN0IHVzaW5nIHRoZSBzdGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbW1kID0gTWF0aC5taW4oZGlmLCBubCAtIDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG1tZDsgKytqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGkgPSBpIC0gZGlmICsgaiAmIDMyNzY3O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHB0aSA9IHByZXZbdGldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNkID0gdGkgLSBwdGkgJiAzMjc2NztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjZCA+IG1kKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1kID0gY2QsIHBpbW9kID0gdGk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB0aGUgcHJldmlvdXMgbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIGltb2QgPSBwaW1vZCwgcGltb2QgPSBwcmV2W2ltb2RdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlmICs9IGltb2QgLSBwaW1vZCAmIDMyNzY3O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGQgd2lsbCBiZSBub256ZXJvIG9ubHkgd2hlbiBhIG1hdGNoIHdhcyBmb3VuZFxuICAgICAgICAgICAgICAgIGlmIChkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHN0b3JlIGJvdGggZGlzdCBhbmQgbGVuIGRhdGEgaW4gb25lIGludDMyXG4gICAgICAgICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0aGlzIGlzIHJlY29nbml6ZWQgYXMgYSBsZW4vZGlzdCB3aXRoIDI4dGggYml0ICgyXjI4KVxuICAgICAgICAgICAgICAgICAgICBzeW1zW2xpKytdID0gMjY4NDM1NDU2IHwgKHJldmZsW2xdIDw8IDE4KSB8IHJldmZkW2RdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGluID0gcmV2ZmxbbF0gJiAzMSwgZGluID0gcmV2ZmRbZF0gJiAzMTtcbiAgICAgICAgICAgICAgICAgICAgZWIgKz0gZmxlYltsaW5dICsgZmRlYltkaW5dO1xuICAgICAgICAgICAgICAgICAgICArK2xmWzI1NyArIGxpbl07XG4gICAgICAgICAgICAgICAgICAgICsrZGZbZGluXTtcbiAgICAgICAgICAgICAgICAgICAgd2kgPSBpICsgbDtcbiAgICAgICAgICAgICAgICAgICAgKytsY18xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3ltc1tsaSsrXSA9IGRhdFtpXTtcbiAgICAgICAgICAgICAgICAgICAgKytsZltkYXRbaV1dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSBNYXRoLm1heChpLCB3aSk7IGkgPCBzOyArK2kpIHtcbiAgICAgICAgICAgIHN5bXNbbGkrK10gPSBkYXRbaV07XG4gICAgICAgICAgICArK2xmW2RhdFtpXV07XG4gICAgICAgIH1cbiAgICAgICAgcG9zID0gd2JsayhkYXQsIHcsIGxzdCwgc3ltcywgbGYsIGRmLCBlYiwgbGksIGJzLCBpIC0gYnMsIHBvcyk7XG4gICAgICAgIGlmICghbHN0KSB7XG4gICAgICAgICAgICBzdC5yID0gKHBvcyAmIDcpIHwgd1socG9zIC8gOCkgfCAwXSA8PCAzO1xuICAgICAgICAgICAgLy8gc2hmdChwb3MpIG5vdyAxIGxlc3MgaWYgcG9zICYgNyAhPSAwXG4gICAgICAgICAgICBwb3MgLT0gNztcbiAgICAgICAgICAgIHN0LmggPSBoZWFkLCBzdC5wID0gcHJldiwgc3QuaSA9IGksIHN0LncgPSB3aTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IHN0LncgfHwgMDsgaSA8IHMgKyBsc3Q7IGkgKz0gNjU1MzUpIHtcbiAgICAgICAgICAgIC8vIGVuZFxuICAgICAgICAgICAgdmFyIGUgPSBpICsgNjU1MzU7XG4gICAgICAgICAgICBpZiAoZSA+PSBzKSB7XG4gICAgICAgICAgICAgICAgLy8gd3JpdGUgZmluYWwgYmxvY2tcbiAgICAgICAgICAgICAgICB3Wyhwb3MgLyA4KSB8IDBdID0gbHN0O1xuICAgICAgICAgICAgICAgIGUgPSBzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9zID0gd2ZibGsodywgcG9zICsgMSwgZGF0LnN1YmFycmF5KGksIGUpKTtcbiAgICAgICAgfVxuICAgICAgICBzdC5pID0gcztcbiAgICB9XG4gICAgcmV0dXJuIHNsYyhvLCAwLCBwcmUgKyBzaGZ0KHBvcykgKyBwb3N0KTtcbn07XG4vLyBDUkMzMiB0YWJsZVxudmFyIGNyY3QgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHQgPSBuZXcgSW50MzJBcnJheSgyNTYpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjU2OyArK2kpIHtcbiAgICAgICAgdmFyIGMgPSBpLCBrID0gOTtcbiAgICAgICAgd2hpbGUgKC0taylcbiAgICAgICAgICAgIGMgPSAoKGMgJiAxKSAmJiAtMzA2Njc0OTEyKSBeIChjID4+PiAxKTtcbiAgICAgICAgdFtpXSA9IGM7XG4gICAgfVxuICAgIHJldHVybiB0O1xufSkoKTtcbi8vIENSQzMyXG52YXIgY3JjID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBjID0gLTE7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcDogZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgIC8vIGNsb3N1cmVzIGhhdmUgYXdmdWwgcGVyZm9ybWFuY2VcbiAgICAgICAgICAgIHZhciBjciA9IGM7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGQubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgY3IgPSBjcmN0WyhjciAmIDI1NSkgXiBkW2ldXSBeIChjciA+Pj4gOCk7XG4gICAgICAgICAgICBjID0gY3I7XG4gICAgICAgIH0sXG4gICAgICAgIGQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIH5jOyB9XG4gICAgfTtcbn07XG4vLyBBZGxlcjMyXG52YXIgYWRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGEgPSAxLCBiID0gMDtcbiAgICByZXR1cm4ge1xuICAgICAgICBwOiBmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgLy8gY2xvc3VyZXMgaGF2ZSBhd2Z1bCBwZXJmb3JtYW5jZVxuICAgICAgICAgICAgdmFyIG4gPSBhLCBtID0gYjtcbiAgICAgICAgICAgIHZhciBsID0gZC5sZW5ndGggfCAwO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgIT0gbDspIHtcbiAgICAgICAgICAgICAgICB2YXIgZSA9IE1hdGgubWluKGkgKyAyNjU1LCBsKTtcbiAgICAgICAgICAgICAgICBmb3IgKDsgaSA8IGU7ICsraSlcbiAgICAgICAgICAgICAgICAgICAgbSArPSBuICs9IGRbaV07XG4gICAgICAgICAgICAgICAgbiA9IChuICYgNjU1MzUpICsgMTUgKiAobiA+PiAxNiksIG0gPSAobSAmIDY1NTM1KSArIDE1ICogKG0gPj4gMTYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYSA9IG4sIGIgPSBtO1xuICAgICAgICB9LFxuICAgICAgICBkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBhICU9IDY1NTIxLCBiICU9IDY1NTIxO1xuICAgICAgICAgICAgcmV0dXJuIChhICYgMjU1KSA8PCAyNCB8IChhICYgMHhGRjAwKSA8PCA4IHwgKGIgJiAyNTUpIDw8IDggfCAoYiA+PiA4KTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuO1xuLy8gZGVmbGF0ZSB3aXRoIG9wdHNcbnZhciBkb3B0ID0gZnVuY3Rpb24gKGRhdCwgb3B0LCBwcmUsIHBvc3QsIHN0KSB7XG4gICAgaWYgKCFzdCkge1xuICAgICAgICBzdCA9IHsgbDogMSB9O1xuICAgICAgICBpZiAob3B0LmRpY3Rpb25hcnkpIHtcbiAgICAgICAgICAgIHZhciBkaWN0ID0gb3B0LmRpY3Rpb25hcnkuc3ViYXJyYXkoLTMyNzY4KTtcbiAgICAgICAgICAgIHZhciBuZXdEYXQgPSBuZXcgdTgoZGljdC5sZW5ndGggKyBkYXQubGVuZ3RoKTtcbiAgICAgICAgICAgIG5ld0RhdC5zZXQoZGljdCk7XG4gICAgICAgICAgICBuZXdEYXQuc2V0KGRhdCwgZGljdC5sZW5ndGgpO1xuICAgICAgICAgICAgZGF0ID0gbmV3RGF0O1xuICAgICAgICAgICAgc3QudyA9IGRpY3QubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZmx0KGRhdCwgb3B0LmxldmVsID09IG51bGwgPyA2IDogb3B0LmxldmVsLCBvcHQubWVtID09IG51bGwgPyAoc3QubCA/IE1hdGguY2VpbChNYXRoLm1heCg4LCBNYXRoLm1pbigxMywgTWF0aC5sb2coZGF0Lmxlbmd0aCkpKSAqIDEuNSkgOiAyMCkgOiAoMTIgKyBvcHQubWVtKSwgcHJlLCBwb3N0LCBzdCk7XG59O1xuLy8gV2FsbWFydCBvYmplY3Qgc3ByZWFkXG52YXIgbXJnID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICB2YXIgbyA9IHt9O1xuICAgIGZvciAodmFyIGsgaW4gYSlcbiAgICAgICAgb1trXSA9IGFba107XG4gICAgZm9yICh2YXIgayBpbiBiKVxuICAgICAgICBvW2tdID0gYltrXTtcbiAgICByZXR1cm4gbztcbn07XG4vLyB3b3JrZXIgY2xvbmVcbi8vIFRoaXMgaXMgcG9zc2libHkgdGhlIGNyYXppZXN0IHBhcnQgb2YgdGhlIGVudGlyZSBjb2RlYmFzZSwgZGVzcGl0ZSBob3cgc2ltcGxlIGl0IG1heSBzZWVtLlxuLy8gVGhlIG9ubHkgcGFyYW1ldGVyIHRvIHRoaXMgZnVuY3Rpb24gaXMgYSBjbG9zdXJlIHRoYXQgcmV0dXJucyBhbiBhcnJheSBvZiB2YXJpYWJsZXMgb3V0c2lkZSBvZiB0aGUgZnVuY3Rpb24gc2NvcGUuXG4vLyBXZSdyZSBnb2luZyB0byB0cnkgdG8gZmlndXJlIG91dCB0aGUgdmFyaWFibGUgbmFtZXMgdXNlZCBpbiB0aGUgY2xvc3VyZSBhcyBzdHJpbmdzIGJlY2F1c2UgdGhhdCBpcyBjcnVjaWFsIGZvciB3b3JrZXJpemF0aW9uLlxuLy8gV2Ugd2lsbCByZXR1cm4gYW4gb2JqZWN0IG1hcHBpbmcgb2YgdHJ1ZSB2YXJpYWJsZSBuYW1lIHRvIHZhbHVlIChiYXNpY2FsbHksIHRoZSBjdXJyZW50IHNjb3BlIGFzIGEgSlMgb2JqZWN0KS5cbi8vIFRoZSByZWFzb24gd2UgY2FuJ3QganVzdCB1c2UgdGhlIG9yaWdpbmFsIHZhcmlhYmxlIG5hbWVzIGlzIG1pbmlmaWVycyBtYW5nbGluZyB0aGUgdG9wbGV2ZWwgc2NvcGUuXG4vLyBUaGlzIHRvb2sgbWUgdGhyZWUgd2Vla3MgdG8gZmlndXJlIG91dCBob3cgdG8gZG8uXG52YXIgd2NsbiA9IGZ1bmN0aW9uIChmbiwgZm5TdHIsIHRkKSB7XG4gICAgdmFyIGR0ID0gZm4oKTtcbiAgICB2YXIgc3QgPSBmbi50b1N0cmluZygpO1xuICAgIHZhciBrcyA9IHN0LnNsaWNlKHN0LmluZGV4T2YoJ1snKSArIDEsIHN0Lmxhc3RJbmRleE9mKCddJykpLnJlcGxhY2UoL1xccysvZywgJycpLnNwbGl0KCcsJyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkdC5sZW5ndGg7ICsraSkge1xuICAgICAgICB2YXIgdiA9IGR0W2ldLCBrID0ga3NbaV07XG4gICAgICAgIGlmICh0eXBlb2YgdiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBmblN0ciArPSAnOycgKyBrICsgJz0nO1xuICAgICAgICAgICAgdmFyIHN0XzEgPSB2LnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBpZiAodi5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgICAgICAvLyBmb3IgZ2xvYmFsIG9iamVjdHNcbiAgICAgICAgICAgICAgICBpZiAoc3RfMS5pbmRleE9mKCdbbmF0aXZlIGNvZGVdJykgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNwSW5kID0gc3RfMS5pbmRleE9mKCcgJywgOCkgKyAxO1xuICAgICAgICAgICAgICAgICAgICBmblN0ciArPSBzdF8xLnNsaWNlKHNwSW5kLCBzdF8xLmluZGV4T2YoJygnLCBzcEluZCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZm5TdHIgKz0gc3RfMTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgdCBpbiB2LnByb3RvdHlwZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZuU3RyICs9ICc7JyArIGsgKyAnLnByb3RvdHlwZS4nICsgdCArICc9JyArIHYucHJvdG90eXBlW3RdLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZuU3RyICs9IHN0XzE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGRba10gPSB2O1xuICAgIH1cbiAgICByZXR1cm4gZm5TdHI7XG59O1xudmFyIGNoID0gW107XG4vLyBjbG9uZSBidWZzXG52YXIgY2JmcyA9IGZ1bmN0aW9uICh2KSB7XG4gICAgdmFyIHRsID0gW107XG4gICAgZm9yICh2YXIgayBpbiB2KSB7XG4gICAgICAgIGlmICh2W2tdLmJ1ZmZlcikge1xuICAgICAgICAgICAgdGwucHVzaCgodltrXSA9IG5ldyB2W2tdLmNvbnN0cnVjdG9yKHZba10pKS5idWZmZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0bDtcbn07XG4vLyB1c2UgYSB3b3JrZXIgdG8gZXhlY3V0ZSBjb2RlXG52YXIgd3JrciA9IGZ1bmN0aW9uIChmbnMsIGluaXQsIGlkLCBjYikge1xuICAgIGlmICghY2hbaWRdKSB7XG4gICAgICAgIHZhciBmblN0ciA9ICcnLCB0ZF8xID0ge30sIG0gPSBmbnMubGVuZ3RoIC0gMTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtOyArK2kpXG4gICAgICAgICAgICBmblN0ciA9IHdjbG4oZm5zW2ldLCBmblN0ciwgdGRfMSk7XG4gICAgICAgIGNoW2lkXSA9IHsgYzogd2NsbihmbnNbbV0sIGZuU3RyLCB0ZF8xKSwgZTogdGRfMSB9O1xuICAgIH1cbiAgICB2YXIgdGQgPSBtcmcoe30sIGNoW2lkXS5lKTtcbiAgICByZXR1cm4gd2soY2hbaWRdLmMgKyAnO29ubWVzc2FnZT1mdW5jdGlvbihlKXtmb3IodmFyIGsgaW4gZS5kYXRhKXNlbGZba109ZS5kYXRhW2tdO29ubWVzc2FnZT0nICsgaW5pdC50b1N0cmluZygpICsgJ30nLCBpZCwgdGQsIGNiZnModGQpLCBjYik7XG59O1xuLy8gYmFzZSBhc3luYyBpbmZsYXRlIGZuXG52YXIgYkluZmx0ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gW3U4LCB1MTYsIGkzMiwgZmxlYiwgZmRlYiwgY2xpbSwgZmwsIGZkLCBmbHJtLCBmZHJtLCByZXYsIGVjLCBoTWFwLCBtYXgsIGJpdHMsIGJpdHMxNiwgc2hmdCwgc2xjLCBlcnIsIGluZmx0LCBpbmZsYXRlU3luYywgcGJmLCBnb3B0XTsgfTtcbnZhciBiRGZsdCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIFt1OCwgdTE2LCBpMzIsIGZsZWIsIGZkZWIsIGNsaW0sIHJldmZsLCByZXZmZCwgZmxtLCBmbHQsIGZkbSwgZmR0LCByZXYsIGRlbywgZXQsIGhNYXAsIHdiaXRzLCB3Yml0czE2LCBoVHJlZSwgbG4sIGxjLCBjbGVuLCB3ZmJsaywgd2Jsaywgc2hmdCwgc2xjLCBkZmx0LCBkb3B0LCBkZWZsYXRlU3luYywgcGJmXTsgfTtcbi8vIGd6aXAgZXh0cmFcbnZhciBnemUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbZ3poLCBnemhsLCB3Ynl0ZXMsIGNyYywgY3JjdF07IH07XG4vLyBndW56aXAgZXh0cmFcbnZhciBndXplID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gW2d6cywgZ3psXTsgfTtcbi8vIHpsaWIgZXh0cmFcbnZhciB6bGUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbemxoLCB3Ynl0ZXMsIGFkbGVyXTsgfTtcbi8vIHVuemxpYiBleHRyYVxudmFyIHp1bGUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBbemxzXTsgfTtcbi8vIHBvc3QgYnVmXG52YXIgcGJmID0gZnVuY3Rpb24gKG1zZykgeyByZXR1cm4gcG9zdE1lc3NhZ2UobXNnLCBbbXNnLmJ1ZmZlcl0pOyB9O1xuLy8gZ2V0IG9wdHNcbnZhciBnb3B0ID0gZnVuY3Rpb24gKG8pIHsgcmV0dXJuIG8gJiYge1xuICAgIG91dDogby5zaXplICYmIG5ldyB1OChvLnNpemUpLFxuICAgIGRpY3Rpb25hcnk6IG8uZGljdGlvbmFyeVxufTsgfTtcbi8vIGFzeW5jIGhlbHBlclxudmFyIGNiaWZ5ID0gZnVuY3Rpb24gKGRhdCwgb3B0cywgZm5zLCBpbml0LCBpZCwgY2IpIHtcbiAgICB2YXIgdyA9IHdya3IoZm5zLCBpbml0LCBpZCwgZnVuY3Rpb24gKGVyciwgZGF0KSB7XG4gICAgICAgIHcudGVybWluYXRlKCk7XG4gICAgICAgIGNiKGVyciwgZGF0KTtcbiAgICB9KTtcbiAgICB3LnBvc3RNZXNzYWdlKFtkYXQsIG9wdHNdLCBvcHRzLmNvbnN1bWUgPyBbZGF0LmJ1ZmZlcl0gOiBbXSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHsgdy50ZXJtaW5hdGUoKTsgfTtcbn07XG4vLyBhdXRvIHN0cmVhbVxudmFyIGFzdHJtID0gZnVuY3Rpb24gKHN0cm0pIHtcbiAgICBzdHJtLm9uZGF0YSA9IGZ1bmN0aW9uIChkYXQsIGZpbmFsKSB7IHJldHVybiBwb3N0TWVzc2FnZShbZGF0LCBmaW5hbF0sIFtkYXQuYnVmZmVyXSk7IH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldikge1xuICAgICAgICBpZiAoZXYuZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHN0cm0ucHVzaChldi5kYXRhWzBdLCBldi5kYXRhWzFdKTtcbiAgICAgICAgICAgIHBvc3RNZXNzYWdlKFtldi5kYXRhWzBdLmxlbmd0aF0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHN0cm0uZmx1c2goKTtcbiAgICB9O1xufTtcbi8vIGFzeW5jIHN0cmVhbSBhdHRhY2hcbnZhciBhc3RybWlmeSA9IGZ1bmN0aW9uIChmbnMsIHN0cm0sIG9wdHMsIGluaXQsIGlkLCBmbHVzaCwgZXh0KSB7XG4gICAgdmFyIHQ7XG4gICAgdmFyIHcgPSB3cmtyKGZucywgaW5pdCwgaWQsIGZ1bmN0aW9uIChlcnIsIGRhdCkge1xuICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgdy50ZXJtaW5hdGUoKSwgc3RybS5vbmRhdGEuY2FsbChzdHJtLCBlcnIpO1xuICAgICAgICBlbHNlIGlmICghQXJyYXkuaXNBcnJheShkYXQpKVxuICAgICAgICAgICAgZXh0KGRhdCk7XG4gICAgICAgIGVsc2UgaWYgKGRhdC5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgc3RybS5xdWV1ZWRTaXplIC09IGRhdFswXTtcbiAgICAgICAgICAgIGlmIChzdHJtLm9uZHJhaW4pXG4gICAgICAgICAgICAgICAgc3RybS5vbmRyYWluKGRhdFswXSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoZGF0WzFdKVxuICAgICAgICAgICAgICAgIHcudGVybWluYXRlKCk7XG4gICAgICAgICAgICBzdHJtLm9uZGF0YS5jYWxsKHN0cm0sIGVyciwgZGF0WzBdLCBkYXRbMV0pO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgdy5wb3N0TWVzc2FnZShvcHRzKTtcbiAgICBzdHJtLnF1ZXVlZFNpemUgPSAwO1xuICAgIHN0cm0ucHVzaCA9IGZ1bmN0aW9uIChkLCBmKSB7XG4gICAgICAgIGlmICghc3RybS5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIGlmICh0KVxuICAgICAgICAgICAgc3RybS5vbmRhdGEoZXJyKDQsIDAsIDEpLCBudWxsLCAhIWYpO1xuICAgICAgICBzdHJtLnF1ZXVlZFNpemUgKz0gZC5sZW5ndGg7XG4gICAgICAgIHcucG9zdE1lc3NhZ2UoW2QsIHQgPSBmXSwgW2QuYnVmZmVyXSk7XG4gICAgfTtcbiAgICBzdHJtLnRlcm1pbmF0ZSA9IGZ1bmN0aW9uICgpIHsgdy50ZXJtaW5hdGUoKTsgfTtcbiAgICBpZiAoZmx1c2gpIHtcbiAgICAgICAgc3RybS5mbHVzaCA9IGZ1bmN0aW9uICgpIHsgdy5wb3N0TWVzc2FnZShbXSk7IH07XG4gICAgfVxufTtcbi8vIHJlYWQgMiBieXRlc1xudmFyIGIyID0gZnVuY3Rpb24gKGQsIGIpIHsgcmV0dXJuIGRbYl0gfCAoZFtiICsgMV0gPDwgOCk7IH07XG4vLyByZWFkIDQgYnl0ZXNcbnZhciBiNCA9IGZ1bmN0aW9uIChkLCBiKSB7IHJldHVybiAoZFtiXSB8IChkW2IgKyAxXSA8PCA4KSB8IChkW2IgKyAyXSA8PCAxNikgfCAoZFtiICsgM10gPDwgMjQpKSA+Pj4gMDsgfTtcbnZhciBiOCA9IGZ1bmN0aW9uIChkLCBiKSB7IHJldHVybiBiNChkLCBiKSArIChiNChkLCBiICsgNCkgKiA0Mjk0OTY3Mjk2KTsgfTtcbi8vIHdyaXRlIGJ5dGVzXG52YXIgd2J5dGVzID0gZnVuY3Rpb24gKGQsIGIsIHYpIHtcbiAgICBmb3IgKDsgdjsgKytiKVxuICAgICAgICBkW2JdID0gdiwgdiA+Pj49IDg7XG59O1xuLy8gZ3ppcCBoZWFkZXJcbnZhciBnemggPSBmdW5jdGlvbiAoYywgbykge1xuICAgIHZhciBmbiA9IG8uZmlsZW5hbWU7XG4gICAgY1swXSA9IDMxLCBjWzFdID0gMTM5LCBjWzJdID0gOCwgY1s4XSA9IG8ubGV2ZWwgPCAyID8gNCA6IG8ubGV2ZWwgPT0gOSA/IDIgOiAwLCBjWzldID0gMzsgLy8gYXNzdW1lIFVuaXhcbiAgICBpZiAoby5tdGltZSAhPSAwKVxuICAgICAgICB3Ynl0ZXMoYywgNCwgTWF0aC5mbG9vcihuZXcgRGF0ZShvLm10aW1lIHx8IERhdGUubm93KCkpIC8gMTAwMCkpO1xuICAgIGlmIChmbikge1xuICAgICAgICBjWzNdID0gODtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gZm4ubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICBjW2kgKyAxMF0gPSBmbi5jaGFyQ29kZUF0KGkpO1xuICAgIH1cbn07XG4vLyBnemlwIGZvb3RlcjogLTggdG8gLTQgPSBDUkMsIC00IHRvIC0wIGlzIGxlbmd0aFxuLy8gZ3ppcCBzdGFydFxudmFyIGd6cyA9IGZ1bmN0aW9uIChkKSB7XG4gICAgaWYgKGRbMF0gIT0gMzEgfHwgZFsxXSAhPSAxMzkgfHwgZFsyXSAhPSA4KVxuICAgICAgICBlcnIoNiwgJ2ludmFsaWQgZ3ppcCBkYXRhJyk7XG4gICAgdmFyIGZsZyA9IGRbM107XG4gICAgdmFyIHN0ID0gMTA7XG4gICAgaWYgKGZsZyAmIDQpXG4gICAgICAgIHN0ICs9IChkWzEwXSB8IGRbMTFdIDw8IDgpICsgMjtcbiAgICBmb3IgKHZhciB6cyA9IChmbGcgPj4gMyAmIDEpICsgKGZsZyA+PiA0ICYgMSk7IHpzID4gMDsgenMgLT0gIWRbc3QrK10pXG4gICAgICAgIDtcbiAgICByZXR1cm4gc3QgKyAoZmxnICYgMik7XG59O1xuLy8gZ3ppcCBsZW5ndGhcbnZhciBnemwgPSBmdW5jdGlvbiAoZCkge1xuICAgIHZhciBsID0gZC5sZW5ndGg7XG4gICAgcmV0dXJuIChkW2wgLSA0XSB8IGRbbCAtIDNdIDw8IDggfCBkW2wgLSAyXSA8PCAxNiB8IGRbbCAtIDFdIDw8IDI0KSA+Pj4gMDtcbn07XG4vLyBnemlwIGhlYWRlciBsZW5ndGhcbnZhciBnemhsID0gZnVuY3Rpb24gKG8pIHsgcmV0dXJuIDEwICsgKG8uZmlsZW5hbWUgPyBvLmZpbGVuYW1lLmxlbmd0aCArIDEgOiAwKTsgfTtcbi8vIHpsaWIgaGVhZGVyXG52YXIgemxoID0gZnVuY3Rpb24gKGMsIG8pIHtcbiAgICB2YXIgbHYgPSBvLmxldmVsLCBmbCA9IGx2ID09IDAgPyAwIDogbHYgPCA2ID8gMSA6IGx2ID09IDkgPyAzIDogMjtcbiAgICBjWzBdID0gMTIwLCBjWzFdID0gKGZsIDw8IDYpIHwgKG8uZGljdGlvbmFyeSAmJiAzMik7XG4gICAgY1sxXSB8PSAzMSAtICgoY1swXSA8PCA4KSB8IGNbMV0pICUgMzE7XG4gICAgaWYgKG8uZGljdGlvbmFyeSkge1xuICAgICAgICB2YXIgaCA9IGFkbGVyKCk7XG4gICAgICAgIGgucChvLmRpY3Rpb25hcnkpO1xuICAgICAgICB3Ynl0ZXMoYywgMiwgaC5kKCkpO1xuICAgIH1cbn07XG4vLyB6bGliIHN0YXJ0XG52YXIgemxzID0gZnVuY3Rpb24gKGQsIGRpY3QpIHtcbiAgICBpZiAoKGRbMF0gJiAxNSkgIT0gOCB8fCAoZFswXSA+PiA0KSA+IDcgfHwgKChkWzBdIDw8IDggfCBkWzFdKSAlIDMxKSlcbiAgICAgICAgZXJyKDYsICdpbnZhbGlkIHpsaWIgZGF0YScpO1xuICAgIGlmICgoZFsxXSA+PiA1ICYgMSkgPT0gKyFkaWN0KVxuICAgICAgICBlcnIoNiwgJ2ludmFsaWQgemxpYiBkYXRhOiAnICsgKGRbMV0gJiAzMiA/ICduZWVkJyA6ICd1bmV4cGVjdGVkJykgKyAnIGRpY3Rpb25hcnknKTtcbiAgICByZXR1cm4gKGRbMV0gPj4gMyAmIDQpICsgMjtcbn07XG5mdW5jdGlvbiBTdHJtT3B0KG9wdHMsIGNiKSB7XG4gICAgaWYgKHR5cGVvZiBvcHRzID09ICdmdW5jdGlvbicpXG4gICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgIHRoaXMub25kYXRhID0gY2I7XG4gICAgcmV0dXJuIG9wdHM7XG59XG4vKipcbiAqIFN0cmVhbWluZyBERUZMQVRFIGNvbXByZXNzaW9uXG4gKi9cbnZhciBEZWZsYXRlID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIERlZmxhdGUob3B0cywgY2IpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRzID09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICAgICAgdGhpcy5vbmRhdGEgPSBjYjtcbiAgICAgICAgdGhpcy5vID0gb3B0cyB8fCB7fTtcbiAgICAgICAgdGhpcy5zID0geyBsOiAwLCBpOiAzMjc2OCwgdzogMzI3NjgsIHo6IDMyNzY4IH07XG4gICAgICAgIC8vIEJ1ZmZlciBsZW5ndGggbXVzdCBhbHdheXMgYmUgMCBtb2QgMzI3NjggZm9yIGluZGV4IGNhbGN1bGF0aW9ucyB0byBiZSBjb3JyZWN0IHdoZW4gbW9kaWZ5aW5nIGhlYWQgYW5kIHByZXZcbiAgICAgICAgLy8gOTgzMDQgPSAzMjc2OCAobG9va2JhY2spICsgNjU1MzYgKGNvbW1vbiBjaHVuayBzaXplKVxuICAgICAgICB0aGlzLmIgPSBuZXcgdTgoOTgzMDQpO1xuICAgICAgICBpZiAodGhpcy5vLmRpY3Rpb25hcnkpIHtcbiAgICAgICAgICAgIHZhciBkaWN0ID0gdGhpcy5vLmRpY3Rpb25hcnkuc3ViYXJyYXkoLTMyNzY4KTtcbiAgICAgICAgICAgIHRoaXMuYi5zZXQoZGljdCwgMzI3NjggLSBkaWN0Lmxlbmd0aCk7XG4gICAgICAgICAgICB0aGlzLnMuaSA9IDMyNzY4IC0gZGljdC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgRGVmbGF0ZS5wcm90b3R5cGUucCA9IGZ1bmN0aW9uIChjLCBmKSB7XG4gICAgICAgIHRoaXMub25kYXRhKGRvcHQoYywgdGhpcy5vLCAwLCAwLCB0aGlzLnMpLCBmKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGRlZmxhdGVkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIERlZmxhdGUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIGlmICghdGhpcy5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIGlmICh0aGlzLnMubClcbiAgICAgICAgICAgIGVycig0KTtcbiAgICAgICAgdmFyIGVuZExlbiA9IGNodW5rLmxlbmd0aCArIHRoaXMucy56O1xuICAgICAgICBpZiAoZW5kTGVuID4gdGhpcy5iLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGVuZExlbiA+IDIgKiB0aGlzLmIubGVuZ3RoIC0gMzI3NjgpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3QnVmID0gbmV3IHU4KGVuZExlbiAmIC0zMjc2OCk7XG4gICAgICAgICAgICAgICAgbmV3QnVmLnNldCh0aGlzLmIuc3ViYXJyYXkoMCwgdGhpcy5zLnopKTtcbiAgICAgICAgICAgICAgICB0aGlzLmIgPSBuZXdCdWY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc3BsaXQgPSB0aGlzLmIubGVuZ3RoIC0gdGhpcy5zLno7XG4gICAgICAgICAgICB0aGlzLmIuc2V0KGNodW5rLnN1YmFycmF5KDAsIHNwbGl0KSwgdGhpcy5zLnopO1xuICAgICAgICAgICAgdGhpcy5zLnogPSB0aGlzLmIubGVuZ3RoO1xuICAgICAgICAgICAgdGhpcy5wKHRoaXMuYiwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5iLnNldCh0aGlzLmIuc3ViYXJyYXkoLTMyNzY4KSk7XG4gICAgICAgICAgICB0aGlzLmIuc2V0KGNodW5rLnN1YmFycmF5KHNwbGl0KSwgMzI3NjgpO1xuICAgICAgICAgICAgdGhpcy5zLnogPSBjaHVuay5sZW5ndGggLSBzcGxpdCArIDMyNzY4O1xuICAgICAgICAgICAgdGhpcy5zLmkgPSAzMjc2NiwgdGhpcy5zLncgPSAzMjc2ODtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYi5zZXQoY2h1bmssIHRoaXMucy56KTtcbiAgICAgICAgICAgIHRoaXMucy56ICs9IGNodW5rLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnMubCA9IGZpbmFsICYgMTtcbiAgICAgICAgaWYgKHRoaXMucy56ID4gdGhpcy5zLncgKyA4MTkxIHx8IGZpbmFsKSB7XG4gICAgICAgICAgICB0aGlzLnAodGhpcy5iLCBmaW5hbCB8fCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLnMudyA9IHRoaXMucy5pLCB0aGlzLnMuaSAtPSAyO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBGbHVzaGVzIGJ1ZmZlcmVkIHVuY29tcHJlc3NlZCBkYXRhLiBVc2VmdWwgdG8gaW1tZWRpYXRlbHkgcmV0cmlldmUgdGhlXG4gICAgICogZGVmbGF0ZWQgb3V0cHV0IGZvciBzbWFsbCBpbnB1dHMuXG4gICAgICovXG4gICAgRGVmbGF0ZS5wcm90b3R5cGUuZmx1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghdGhpcy5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIGlmICh0aGlzLnMubClcbiAgICAgICAgICAgIGVycig0KTtcbiAgICAgICAgdGhpcy5wKHRoaXMuYiwgZmFsc2UpO1xuICAgICAgICB0aGlzLnMudyA9IHRoaXMucy5pLCB0aGlzLnMuaSAtPSAyO1xuICAgIH07XG4gICAgcmV0dXJuIERlZmxhdGU7XG59KCkpO1xuZXhwb3J0IHsgRGVmbGF0ZSB9O1xuLyoqXG4gKiBBc3luY2hyb25vdXMgc3RyZWFtaW5nIERFRkxBVEUgY29tcHJlc3Npb25cbiAqL1xudmFyIEFzeW5jRGVmbGF0ZSA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBc3luY0RlZmxhdGUob3B0cywgY2IpIHtcbiAgICAgICAgYXN0cm1pZnkoW1xuICAgICAgICAgICAgYkRmbHQsXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBbYXN0cm0sIERlZmxhdGVdOyB9XG4gICAgICAgIF0sIHRoaXMsIFN0cm1PcHQuY2FsbCh0aGlzLCBvcHRzLCBjYiksIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHN0cm0gPSBuZXcgRGVmbGF0ZShldi5kYXRhKTtcbiAgICAgICAgICAgIG9ubWVzc2FnZSA9IGFzdHJtKHN0cm0pO1xuICAgICAgICB9LCA2LCAxKTtcbiAgICB9XG4gICAgcmV0dXJuIEFzeW5jRGVmbGF0ZTtcbn0oKSk7XG5leHBvcnQgeyBBc3luY0RlZmxhdGUgfTtcbmV4cG9ydCBmdW5jdGlvbiBkZWZsYXRlKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICBlcnIoNyk7XG4gICAgcmV0dXJuIGNiaWZ5KGRhdGEsIG9wdHMsIFtcbiAgICAgICAgYkRmbHQsXG4gICAgXSwgZnVuY3Rpb24gKGV2KSB7IHJldHVybiBwYmYoZGVmbGF0ZVN5bmMoZXYuZGF0YVswXSwgZXYuZGF0YVsxXSkpOyB9LCAwLCBjYik7XG59XG4vKipcbiAqIENvbXByZXNzZXMgZGF0YSB3aXRoIERFRkxBVEUgd2l0aG91dCBhbnkgd3JhcHBlclxuICogQHBhcmFtIGRhdGEgVGhlIGRhdGEgdG8gY29tcHJlc3NcbiAqIEBwYXJhbSBvcHRzIFRoZSBjb21wcmVzc2lvbiBvcHRpb25zXG4gKiBAcmV0dXJucyBUaGUgZGVmbGF0ZWQgdmVyc2lvbiBvZiB0aGUgZGF0YVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVmbGF0ZVN5bmMoZGF0YSwgb3B0cykge1xuICAgIHJldHVybiBkb3B0KGRhdGEsIG9wdHMgfHwge30sIDAsIDApO1xufVxuLyoqXG4gKiBTdHJlYW1pbmcgREVGTEFURSBkZWNvbXByZXNzaW9uXG4gKi9cbnZhciBJbmZsYXRlID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEluZmxhdGUob3B0cywgY2IpIHtcbiAgICAgICAgLy8gbm8gU3RybU9wdCBoZXJlIHRvIGF2b2lkIGFkZGluZyB0byB3b3JrZXJpemVyXG4gICAgICAgIGlmICh0eXBlb2Ygb3B0cyA9PSAnZnVuY3Rpb24nKVxuICAgICAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgICAgIHRoaXMub25kYXRhID0gY2I7XG4gICAgICAgIHZhciBkaWN0ID0gb3B0cyAmJiBvcHRzLmRpY3Rpb25hcnkgJiYgb3B0cy5kaWN0aW9uYXJ5LnN1YmFycmF5KC0zMjc2OCk7XG4gICAgICAgIHRoaXMucyA9IHsgaTogMCwgYjogZGljdCA/IGRpY3QubGVuZ3RoIDogMCB9O1xuICAgICAgICB0aGlzLm8gPSBuZXcgdTgoMzI3NjgpO1xuICAgICAgICB0aGlzLnAgPSBuZXcgdTgoMCk7XG4gICAgICAgIGlmIChkaWN0KVxuICAgICAgICAgICAgdGhpcy5vLnNldChkaWN0KTtcbiAgICB9XG4gICAgSW5mbGF0ZS5wcm90b3R5cGUuZSA9IGZ1bmN0aW9uIChjKSB7XG4gICAgICAgIGlmICghdGhpcy5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIGlmICh0aGlzLmQpXG4gICAgICAgICAgICBlcnIoNCk7XG4gICAgICAgIGlmICghdGhpcy5wLmxlbmd0aClcbiAgICAgICAgICAgIHRoaXMucCA9IGM7XG4gICAgICAgIGVsc2UgaWYgKGMubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgbiA9IG5ldyB1OCh0aGlzLnAubGVuZ3RoICsgYy5sZW5ndGgpO1xuICAgICAgICAgICAgbi5zZXQodGhpcy5wKSwgbi5zZXQoYywgdGhpcy5wLmxlbmd0aCksIHRoaXMucCA9IG47XG4gICAgICAgIH1cbiAgICB9O1xuICAgIEluZmxhdGUucHJvdG90eXBlLmMgPSBmdW5jdGlvbiAoZmluYWwpIHtcbiAgICAgICAgdGhpcy5zLmkgPSArKHRoaXMuZCA9IGZpbmFsIHx8IGZhbHNlKTtcbiAgICAgICAgdmFyIGJ0cyA9IHRoaXMucy5iO1xuICAgICAgICB2YXIgZHQgPSBpbmZsdCh0aGlzLnAsIHRoaXMucywgdGhpcy5vKTtcbiAgICAgICAgdGhpcy5vbmRhdGEoc2xjKGR0LCBidHMsIHRoaXMucy5iKSwgdGhpcy5kKTtcbiAgICAgICAgdGhpcy5vID0gc2xjKGR0LCB0aGlzLnMuYiAtIDMyNzY4KSwgdGhpcy5zLmIgPSB0aGlzLm8ubGVuZ3RoO1xuICAgICAgICB0aGlzLnAgPSBzbGModGhpcy5wLCAodGhpcy5zLnAgLyA4KSB8IDApLCB0aGlzLnMucCAmPSA3O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgaW5mbGF0ZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBmaW5hbCBjaHVua1xuICAgICAqL1xuICAgIEluZmxhdGUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIHRoaXMuZShjaHVuayksIHRoaXMuYyhmaW5hbCk7XG4gICAgfTtcbiAgICByZXR1cm4gSW5mbGF0ZTtcbn0oKSk7XG5leHBvcnQgeyBJbmZsYXRlIH07XG4vKipcbiAqIEFzeW5jaHJvbm91cyBzdHJlYW1pbmcgREVGTEFURSBkZWNvbXByZXNzaW9uXG4gKi9cbnZhciBBc3luY0luZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQXN5bmNJbmZsYXRlKG9wdHMsIGNiKSB7XG4gICAgICAgIGFzdHJtaWZ5KFtcbiAgICAgICAgICAgIGJJbmZsdCxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFthc3RybSwgSW5mbGF0ZV07IH1cbiAgICAgICAgXSwgdGhpcywgU3RybU9wdC5jYWxsKHRoaXMsIG9wdHMsIGNiKSwgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc3RybSA9IG5ldyBJbmZsYXRlKGV2LmRhdGEpO1xuICAgICAgICAgICAgb25tZXNzYWdlID0gYXN0cm0oc3RybSk7XG4gICAgICAgIH0sIDcsIDApO1xuICAgIH1cbiAgICByZXR1cm4gQXN5bmNJbmZsYXRlO1xufSgpKTtcbmV4cG9ydCB7IEFzeW5jSW5mbGF0ZSB9O1xuZXhwb3J0IGZ1bmN0aW9uIGluZmxhdGUoZGF0YSwgb3B0cywgY2IpIHtcbiAgICBpZiAoIWNiKVxuICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICBpZiAodHlwZW9mIGNiICE9ICdmdW5jdGlvbicpXG4gICAgICAgIGVycig3KTtcbiAgICByZXR1cm4gY2JpZnkoZGF0YSwgb3B0cywgW1xuICAgICAgICBiSW5mbHRcbiAgICBdLCBmdW5jdGlvbiAoZXYpIHsgcmV0dXJuIHBiZihpbmZsYXRlU3luYyhldi5kYXRhWzBdLCBnb3B0KGV2LmRhdGFbMV0pKSk7IH0sIDEsIGNiKTtcbn1cbi8qKlxuICogRXhwYW5kcyBERUZMQVRFIGRhdGEgd2l0aCBubyB3cmFwcGVyXG4gKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSB0byBkZWNvbXByZXNzXG4gKiBAcGFyYW0gb3B0cyBUaGUgZGVjb21wcmVzc2lvbiBvcHRpb25zXG4gKiBAcmV0dXJucyBUaGUgZGVjb21wcmVzc2VkIHZlcnNpb24gb2YgdGhlIGRhdGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluZmxhdGVTeW5jKGRhdGEsIG9wdHMpIHtcbiAgICByZXR1cm4gaW5mbHQoZGF0YSwgeyBpOiAyIH0sIG9wdHMgJiYgb3B0cy5vdXQsIG9wdHMgJiYgb3B0cy5kaWN0aW9uYXJ5KTtcbn1cbi8vIGJlZm9yZSB5b3UgeWVsbCBhdCBtZSBmb3Igbm90IGp1c3QgdXNpbmcgZXh0ZW5kcywgbXkgcmVhc29uIGlzIHRoYXQgVFMgaW5oZXJpdGFuY2UgaXMgaGFyZCB0byB3b3JrZXJpemUuXG4vKipcbiAqIFN0cmVhbWluZyBHWklQIGNvbXByZXNzaW9uXG4gKi9cbnZhciBHemlwID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEd6aXAob3B0cywgY2IpIHtcbiAgICAgICAgdGhpcy5jID0gY3JjKCk7XG4gICAgICAgIHRoaXMubCA9IDA7XG4gICAgICAgIHRoaXMudiA9IDE7XG4gICAgICAgIERlZmxhdGUuY2FsbCh0aGlzLCBvcHRzLCBjYik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIEdaSVBwZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgR3ppcC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgdGhpcy5jLnAoY2h1bmspO1xuICAgICAgICB0aGlzLmwgKz0gY2h1bmsubGVuZ3RoO1xuICAgICAgICBEZWZsYXRlLnByb3RvdHlwZS5wdXNoLmNhbGwodGhpcywgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIEd6aXAucHJvdG90eXBlLnAgPSBmdW5jdGlvbiAoYywgZikge1xuICAgICAgICB2YXIgcmF3ID0gZG9wdChjLCB0aGlzLm8sIHRoaXMudiAmJiBnemhsKHRoaXMubyksIGYgJiYgOCwgdGhpcy5zKTtcbiAgICAgICAgaWYgKHRoaXMudilcbiAgICAgICAgICAgIGd6aChyYXcsIHRoaXMubyksIHRoaXMudiA9IDA7XG4gICAgICAgIGlmIChmKVxuICAgICAgICAgICAgd2J5dGVzKHJhdywgcmF3Lmxlbmd0aCAtIDgsIHRoaXMuYy5kKCkpLCB3Ynl0ZXMocmF3LCByYXcubGVuZ3RoIC0gNCwgdGhpcy5sKTtcbiAgICAgICAgdGhpcy5vbmRhdGEocmF3LCBmKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEZsdXNoZXMgYnVmZmVyZWQgdW5jb21wcmVzc2VkIGRhdGEuIFVzZWZ1bCB0byBpbW1lZGlhdGVseSByZXRyaWV2ZSB0aGVcbiAgICAgKiBHWklQcGVkIG91dHB1dCBmb3Igc21hbGwgaW5wdXRzLlxuICAgICAqL1xuICAgIEd6aXAucHJvdG90eXBlLmZsdXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBEZWZsYXRlLnByb3RvdHlwZS5mbHVzaC5jYWxsKHRoaXMpO1xuICAgIH07XG4gICAgcmV0dXJuIEd6aXA7XG59KCkpO1xuZXhwb3J0IHsgR3ppcCB9O1xuLyoqXG4gKiBBc3luY2hyb25vdXMgc3RyZWFtaW5nIEdaSVAgY29tcHJlc3Npb25cbiAqL1xudmFyIEFzeW5jR3ppcCA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBc3luY0d6aXAob3B0cywgY2IpIHtcbiAgICAgICAgYXN0cm1pZnkoW1xuICAgICAgICAgICAgYkRmbHQsXG4gICAgICAgICAgICBnemUsXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBbYXN0cm0sIERlZmxhdGUsIEd6aXBdOyB9XG4gICAgICAgIF0sIHRoaXMsIFN0cm1PcHQuY2FsbCh0aGlzLCBvcHRzLCBjYiksIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHN0cm0gPSBuZXcgR3ppcChldi5kYXRhKTtcbiAgICAgICAgICAgIG9ubWVzc2FnZSA9IGFzdHJtKHN0cm0pO1xuICAgICAgICB9LCA4LCAxKTtcbiAgICB9XG4gICAgcmV0dXJuIEFzeW5jR3ppcDtcbn0oKSk7XG5leHBvcnQgeyBBc3luY0d6aXAgfTtcbmV4cG9ydCBmdW5jdGlvbiBnemlwKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICBlcnIoNyk7XG4gICAgcmV0dXJuIGNiaWZ5KGRhdGEsIG9wdHMsIFtcbiAgICAgICAgYkRmbHQsXG4gICAgICAgIGd6ZSxcbiAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gW2d6aXBTeW5jXTsgfVxuICAgIF0sIGZ1bmN0aW9uIChldikgeyByZXR1cm4gcGJmKGd6aXBTeW5jKGV2LmRhdGFbMF0sIGV2LmRhdGFbMV0pKTsgfSwgMiwgY2IpO1xufVxuLyoqXG4gKiBDb21wcmVzc2VzIGRhdGEgd2l0aCBHWklQXG4gKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSB0byBjb21wcmVzc1xuICogQHBhcmFtIG9wdHMgVGhlIGNvbXByZXNzaW9uIG9wdGlvbnNcbiAqIEByZXR1cm5zIFRoZSBnemlwcGVkIHZlcnNpb24gb2YgdGhlIGRhdGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGd6aXBTeW5jKGRhdGEsIG9wdHMpIHtcbiAgICBpZiAoIW9wdHMpXG4gICAgICAgIG9wdHMgPSB7fTtcbiAgICB2YXIgYyA9IGNyYygpLCBsID0gZGF0YS5sZW5ndGg7XG4gICAgYy5wKGRhdGEpO1xuICAgIHZhciBkID0gZG9wdChkYXRhLCBvcHRzLCBnemhsKG9wdHMpLCA4KSwgcyA9IGQubGVuZ3RoO1xuICAgIHJldHVybiBnemgoZCwgb3B0cyksIHdieXRlcyhkLCBzIC0gOCwgYy5kKCkpLCB3Ynl0ZXMoZCwgcyAtIDQsIGwpLCBkO1xufVxuLyoqXG4gKiBTdHJlYW1pbmcgc2luZ2xlIG9yIG11bHRpLW1lbWJlciBHWklQIGRlY29tcHJlc3Npb25cbiAqL1xudmFyIEd1bnppcCA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBHdW56aXAob3B0cywgY2IpIHtcbiAgICAgICAgdGhpcy52ID0gMTtcbiAgICAgICAgdGhpcy5yID0gMDtcbiAgICAgICAgSW5mbGF0ZS5jYWxsKHRoaXMsIG9wdHMsIGNiKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgR1VOWklQcGVkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIEd1bnppcC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgSW5mbGF0ZS5wcm90b3R5cGUuZS5jYWxsKHRoaXMsIGNodW5rKTtcbiAgICAgICAgdGhpcy5yICs9IGNodW5rLmxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMudikge1xuICAgICAgICAgICAgdmFyIHAgPSB0aGlzLnAuc3ViYXJyYXkodGhpcy52IC0gMSk7XG4gICAgICAgICAgICB2YXIgcyA9IHAubGVuZ3RoID4gMyA/IGd6cyhwKSA6IDQ7XG4gICAgICAgICAgICBpZiAocyA+IHAubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFmaW5hbClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy52ID4gMSAmJiB0aGlzLm9ubWVtYmVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbm1lbWJlcih0aGlzLnIgLSBwLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnAgPSBwLnN1YmFycmF5KHMpLCB0aGlzLnYgPSAwO1xuICAgICAgICB9XG4gICAgICAgIC8vIG5lY2Vzc2FyeSB0byBwcmV2ZW50IFRTIGZyb20gdXNpbmcgdGhlIGNsb3N1cmUgdmFsdWVcbiAgICAgICAgLy8gVGhpcyBhbGxvd3MgZm9yIHdvcmtlcml6YXRpb24gdG8gZnVuY3Rpb24gY29ycmVjdGx5XG4gICAgICAgIEluZmxhdGUucHJvdG90eXBlLmMuY2FsbCh0aGlzLCBmaW5hbCk7XG4gICAgICAgIC8vIHByb2Nlc3MgY29uY2F0ZW5hdGVkIEdaSVBcbiAgICAgICAgaWYgKHRoaXMucy5mICYmICF0aGlzLnMubCAmJiAhZmluYWwpIHtcbiAgICAgICAgICAgIHRoaXMudiA9IHNoZnQodGhpcy5zLnApICsgOTtcbiAgICAgICAgICAgIHRoaXMucyA9IHsgaTogMCB9O1xuICAgICAgICAgICAgdGhpcy5vID0gbmV3IHU4KDApO1xuICAgICAgICAgICAgdGhpcy5wdXNoKG5ldyB1OCgwKSwgZmluYWwpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gR3VuemlwO1xufSgpKTtcbmV4cG9ydCB7IEd1bnppcCB9O1xuLyoqXG4gKiBBc3luY2hyb25vdXMgc3RyZWFtaW5nIHNpbmdsZSBvciBtdWx0aS1tZW1iZXIgR1pJUCBkZWNvbXByZXNzaW9uXG4gKi9cbnZhciBBc3luY0d1bnppcCA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBc3luY0d1bnppcChvcHRzLCBjYikge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBhc3RybWlmeShbXG4gICAgICAgICAgICBiSW5mbHQsXG4gICAgICAgICAgICBndXplLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gW2FzdHJtLCBJbmZsYXRlLCBHdW56aXBdOyB9XG4gICAgICAgIF0sIHRoaXMsIFN0cm1PcHQuY2FsbCh0aGlzLCBvcHRzLCBjYiksIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHN0cm0gPSBuZXcgR3VuemlwKGV2LmRhdGEpO1xuICAgICAgICAgICAgc3RybS5vbm1lbWJlciA9IGZ1bmN0aW9uIChvZmZzZXQpIHsgcmV0dXJuIHBvc3RNZXNzYWdlKG9mZnNldCk7IH07XG4gICAgICAgICAgICBvbm1lc3NhZ2UgPSBhc3RybShzdHJtKTtcbiAgICAgICAgfSwgOSwgMCwgZnVuY3Rpb24gKG9mZnNldCkgeyByZXR1cm4gX3RoaXMub25tZW1iZXIgJiYgX3RoaXMub25tZW1iZXIob2Zmc2V0KTsgfSk7XG4gICAgfVxuICAgIHJldHVybiBBc3luY0d1bnppcDtcbn0oKSk7XG5leHBvcnQgeyBBc3luY0d1bnppcCB9O1xuZXhwb3J0IGZ1bmN0aW9uIGd1bnppcChkYXRhLCBvcHRzLCBjYikge1xuICAgIGlmICghY2IpXG4gICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgIGlmICh0eXBlb2YgY2IgIT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgZXJyKDcpO1xuICAgIHJldHVybiBjYmlmeShkYXRhLCBvcHRzLCBbXG4gICAgICAgIGJJbmZsdCxcbiAgICAgICAgZ3V6ZSxcbiAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gW2d1bnppcFN5bmNdOyB9XG4gICAgXSwgZnVuY3Rpb24gKGV2KSB7IHJldHVybiBwYmYoZ3VuemlwU3luYyhldi5kYXRhWzBdLCBldi5kYXRhWzFdKSk7IH0sIDMsIGNiKTtcbn1cbi8qKlxuICogRXhwYW5kcyBHWklQIGRhdGFcbiAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIGRlY29tcHJlc3NcbiAqIEBwYXJhbSBvcHRzIFRoZSBkZWNvbXByZXNzaW9uIG9wdGlvbnNcbiAqIEByZXR1cm5zIFRoZSBkZWNvbXByZXNzZWQgdmVyc2lvbiBvZiB0aGUgZGF0YVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ3VuemlwU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgdmFyIHN0ID0gZ3pzKGRhdGEpO1xuICAgIGlmIChzdCArIDggPiBkYXRhLmxlbmd0aClcbiAgICAgICAgZXJyKDYsICdpbnZhbGlkIGd6aXAgZGF0YScpO1xuICAgIHJldHVybiBpbmZsdChkYXRhLnN1YmFycmF5KHN0LCAtOCksIHsgaTogMiB9LCBvcHRzICYmIG9wdHMub3V0IHx8IG5ldyB1OChnemwoZGF0YSkpLCBvcHRzICYmIG9wdHMuZGljdGlvbmFyeSk7XG59XG4vKipcbiAqIFN0cmVhbWluZyBabGliIGNvbXByZXNzaW9uXG4gKi9cbnZhciBabGliID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFpsaWIob3B0cywgY2IpIHtcbiAgICAgICAgdGhpcy5jID0gYWRsZXIoKTtcbiAgICAgICAgdGhpcy52ID0gMTtcbiAgICAgICAgRGVmbGF0ZS5jYWxsKHRoaXMsIG9wdHMsIGNiKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgemxpYmJlZFxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHVzaFxuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBabGliLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB0aGlzLmMucChjaHVuayk7XG4gICAgICAgIERlZmxhdGUucHJvdG90eXBlLnB1c2guY2FsbCh0aGlzLCBjaHVuaywgZmluYWwpO1xuICAgIH07XG4gICAgWmxpYi5wcm90b3R5cGUucCA9IGZ1bmN0aW9uIChjLCBmKSB7XG4gICAgICAgIHZhciByYXcgPSBkb3B0KGMsIHRoaXMubywgdGhpcy52ICYmICh0aGlzLm8uZGljdGlvbmFyeSA/IDYgOiAyKSwgZiAmJiA0LCB0aGlzLnMpO1xuICAgICAgICBpZiAodGhpcy52KVxuICAgICAgICAgICAgemxoKHJhdywgdGhpcy5vKSwgdGhpcy52ID0gMDtcbiAgICAgICAgaWYgKGYpXG4gICAgICAgICAgICB3Ynl0ZXMocmF3LCByYXcubGVuZ3RoIC0gNCwgdGhpcy5jLmQoKSk7XG4gICAgICAgIHRoaXMub25kYXRhKHJhdywgZik7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBGbHVzaGVzIGJ1ZmZlcmVkIHVuY29tcHJlc3NlZCBkYXRhLiBVc2VmdWwgdG8gaW1tZWRpYXRlbHkgcmV0cmlldmUgdGhlXG4gICAgICogemxpYmJlZCBvdXRwdXQgZm9yIHNtYWxsIGlucHV0cy5cbiAgICAgKi9cbiAgICBabGliLnByb3RvdHlwZS5mbHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgRGVmbGF0ZS5wcm90b3R5cGUuZmx1c2guY2FsbCh0aGlzKTtcbiAgICB9O1xuICAgIHJldHVybiBabGliO1xufSgpKTtcbmV4cG9ydCB7IFpsaWIgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBabGliIGNvbXByZXNzaW9uXG4gKi9cbnZhciBBc3luY1psaWIgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQXN5bmNabGliKG9wdHMsIGNiKSB7XG4gICAgICAgIGFzdHJtaWZ5KFtcbiAgICAgICAgICAgIGJEZmx0LFxuICAgICAgICAgICAgemxlLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gW2FzdHJtLCBEZWZsYXRlLCBabGliXTsgfVxuICAgICAgICBdLCB0aGlzLCBTdHJtT3B0LmNhbGwodGhpcywgb3B0cywgY2IpLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzdHJtID0gbmV3IFpsaWIoZXYuZGF0YSk7XG4gICAgICAgICAgICBvbm1lc3NhZ2UgPSBhc3RybShzdHJtKTtcbiAgICAgICAgfSwgMTAsIDEpO1xuICAgIH1cbiAgICByZXR1cm4gQXN5bmNabGliO1xufSgpKTtcbmV4cG9ydCB7IEFzeW5jWmxpYiB9O1xuZXhwb3J0IGZ1bmN0aW9uIHpsaWIoZGF0YSwgb3B0cywgY2IpIHtcbiAgICBpZiAoIWNiKVxuICAgICAgICBjYiA9IG9wdHMsIG9wdHMgPSB7fTtcbiAgICBpZiAodHlwZW9mIGNiICE9ICdmdW5jdGlvbicpXG4gICAgICAgIGVycig3KTtcbiAgICByZXR1cm4gY2JpZnkoZGF0YSwgb3B0cywgW1xuICAgICAgICBiRGZsdCxcbiAgICAgICAgemxlLFxuICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBbemxpYlN5bmNdOyB9XG4gICAgXSwgZnVuY3Rpb24gKGV2KSB7IHJldHVybiBwYmYoemxpYlN5bmMoZXYuZGF0YVswXSwgZXYuZGF0YVsxXSkpOyB9LCA0LCBjYik7XG59XG4vKipcbiAqIENvbXByZXNzIGRhdGEgd2l0aCBabGliXG4gKiBAcGFyYW0gZGF0YSBUaGUgZGF0YSB0byBjb21wcmVzc1xuICogQHBhcmFtIG9wdHMgVGhlIGNvbXByZXNzaW9uIG9wdGlvbnNcbiAqIEByZXR1cm5zIFRoZSB6bGliLWNvbXByZXNzZWQgdmVyc2lvbiBvZiB0aGUgZGF0YVxuICovXG5leHBvcnQgZnVuY3Rpb24gemxpYlN5bmMoZGF0YSwgb3B0cykge1xuICAgIGlmICghb3B0cylcbiAgICAgICAgb3B0cyA9IHt9O1xuICAgIHZhciBhID0gYWRsZXIoKTtcbiAgICBhLnAoZGF0YSk7XG4gICAgdmFyIGQgPSBkb3B0KGRhdGEsIG9wdHMsIG9wdHMuZGljdGlvbmFyeSA/IDYgOiAyLCA0KTtcbiAgICByZXR1cm4gemxoKGQsIG9wdHMpLCB3Ynl0ZXMoZCwgZC5sZW5ndGggLSA0LCBhLmQoKSksIGQ7XG59XG4vKipcbiAqIFN0cmVhbWluZyBabGliIGRlY29tcHJlc3Npb25cbiAqL1xudmFyIFVuemxpYiA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBVbnpsaWIob3B0cywgY2IpIHtcbiAgICAgICAgSW5mbGF0ZS5jYWxsKHRoaXMsIG9wdHMsIGNiKTtcbiAgICAgICAgdGhpcy52ID0gb3B0cyAmJiBvcHRzLmRpY3Rpb25hcnkgPyAyIDogMTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgdW56bGliYmVkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIFVuemxpYi5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgSW5mbGF0ZS5wcm90b3R5cGUuZS5jYWxsKHRoaXMsIGNodW5rKTtcbiAgICAgICAgaWYgKHRoaXMudikge1xuICAgICAgICAgICAgaWYgKHRoaXMucC5sZW5ndGggPCA2ICYmICFmaW5hbClcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB0aGlzLnAgPSB0aGlzLnAuc3ViYXJyYXkoemxzKHRoaXMucCwgdGhpcy52IC0gMSkpLCB0aGlzLnYgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaW5hbCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucC5sZW5ndGggPCA0KVxuICAgICAgICAgICAgICAgIGVycig2LCAnaW52YWxpZCB6bGliIGRhdGEnKTtcbiAgICAgICAgICAgIHRoaXMucCA9IHRoaXMucC5zdWJhcnJheSgwLCAtNCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gbmVjZXNzYXJ5IHRvIHByZXZlbnQgVFMgZnJvbSB1c2luZyB0aGUgY2xvc3VyZSB2YWx1ZVxuICAgICAgICAvLyBUaGlzIGFsbG93cyBmb3Igd29ya2VyaXphdGlvbiB0byBmdW5jdGlvbiBjb3JyZWN0bHlcbiAgICAgICAgSW5mbGF0ZS5wcm90b3R5cGUuYy5jYWxsKHRoaXMsIGZpbmFsKTtcbiAgICB9O1xuICAgIHJldHVybiBVbnpsaWI7XG59KCkpO1xuZXhwb3J0IHsgVW56bGliIH07XG4vKipcbiAqIEFzeW5jaHJvbm91cyBzdHJlYW1pbmcgWmxpYiBkZWNvbXByZXNzaW9uXG4gKi9cbnZhciBBc3luY1VuemxpYiA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBc3luY1VuemxpYihvcHRzLCBjYikge1xuICAgICAgICBhc3RybWlmeShbXG4gICAgICAgICAgICBiSW5mbHQsXG4gICAgICAgICAgICB6dWxlLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gW2FzdHJtLCBJbmZsYXRlLCBVbnpsaWJdOyB9XG4gICAgICAgIF0sIHRoaXMsIFN0cm1PcHQuY2FsbCh0aGlzLCBvcHRzLCBjYiksIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHN0cm0gPSBuZXcgVW56bGliKGV2LmRhdGEpO1xuICAgICAgICAgICAgb25tZXNzYWdlID0gYXN0cm0oc3RybSk7XG4gICAgICAgIH0sIDExLCAwKTtcbiAgICB9XG4gICAgcmV0dXJuIEFzeW5jVW56bGliO1xufSgpKTtcbmV4cG9ydCB7IEFzeW5jVW56bGliIH07XG5leHBvcnQgZnVuY3Rpb24gdW56bGliKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICBlcnIoNyk7XG4gICAgcmV0dXJuIGNiaWZ5KGRhdGEsIG9wdHMsIFtcbiAgICAgICAgYkluZmx0LFxuICAgICAgICB6dWxlLFxuICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBbdW56bGliU3luY107IH1cbiAgICBdLCBmdW5jdGlvbiAoZXYpIHsgcmV0dXJuIHBiZih1bnpsaWJTeW5jKGV2LmRhdGFbMF0sIGdvcHQoZXYuZGF0YVsxXSkpKTsgfSwgNSwgY2IpO1xufVxuLyoqXG4gKiBFeHBhbmRzIFpsaWIgZGF0YVxuICogQHBhcmFtIGRhdGEgVGhlIGRhdGEgdG8gZGVjb21wcmVzc1xuICogQHBhcmFtIG9wdHMgVGhlIGRlY29tcHJlc3Npb24gb3B0aW9uc1xuICogQHJldHVybnMgVGhlIGRlY29tcHJlc3NlZCB2ZXJzaW9uIG9mIHRoZSBkYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bnpsaWJTeW5jKGRhdGEsIG9wdHMpIHtcbiAgICByZXR1cm4gaW5mbHQoZGF0YS5zdWJhcnJheSh6bHMoZGF0YSwgb3B0cyAmJiBvcHRzLmRpY3Rpb25hcnkpLCAtNCksIHsgaTogMiB9LCBvcHRzICYmIG9wdHMub3V0LCBvcHRzICYmIG9wdHMuZGljdGlvbmFyeSk7XG59XG4vLyBEZWZhdWx0IGFsZ29yaXRobSBmb3IgY29tcHJlc3Npb24gKHVzZWQgYmVjYXVzZSBoYXZpbmcgYSBrbm93biBvdXRwdXQgc2l6ZSBhbGxvd3MgZmFzdGVyIGRlY29tcHJlc3Npb24pXG5leHBvcnQgeyBnemlwIGFzIGNvbXByZXNzLCBBc3luY0d6aXAgYXMgQXN5bmNDb21wcmVzcyB9O1xuZXhwb3J0IHsgZ3ppcFN5bmMgYXMgY29tcHJlc3NTeW5jLCBHemlwIGFzIENvbXByZXNzIH07XG4vKipcbiAqIFN0cmVhbWluZyBHWklQLCBabGliLCBvciByYXcgREVGTEFURSBkZWNvbXByZXNzaW9uXG4gKi9cbnZhciBEZWNvbXByZXNzID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIERlY29tcHJlc3Mob3B0cywgY2IpIHtcbiAgICAgICAgdGhpcy5vID0gU3RybU9wdC5jYWxsKHRoaXMsIG9wdHMsIGNiKSB8fCB7fTtcbiAgICAgICAgdGhpcy5HID0gR3VuemlwO1xuICAgICAgICB0aGlzLkkgPSBJbmZsYXRlO1xuICAgICAgICB0aGlzLlogPSBVbnpsaWI7XG4gICAgfVxuICAgIC8vIGluaXQgc3Vic3RyZWFtXG4gICAgLy8gb3ZlcnJpZGVuIGJ5IEFzeW5jRGVjb21wcmVzc1xuICAgIERlY29tcHJlc3MucHJvdG90eXBlLmkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMucy5vbmRhdGEgPSBmdW5jdGlvbiAoZGF0LCBmaW5hbCkge1xuICAgICAgICAgICAgX3RoaXMub25kYXRhKGRhdCwgZmluYWwpO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgZGVjb21wcmVzc2VkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIERlY29tcHJlc3MucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIGlmICghdGhpcy5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIGlmICghdGhpcy5zKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wICYmIHRoaXMucC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgbiA9IG5ldyB1OCh0aGlzLnAubGVuZ3RoICsgY2h1bmsubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBuLnNldCh0aGlzLnApLCBuLnNldChjaHVuaywgdGhpcy5wLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5wID0gY2h1bms7XG4gICAgICAgICAgICBpZiAodGhpcy5wLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnMgPSAodGhpcy5wWzBdID09IDMxICYmIHRoaXMucFsxXSA9PSAxMzkgJiYgdGhpcy5wWzJdID09IDgpXG4gICAgICAgICAgICAgICAgICAgID8gbmV3IHRoaXMuRyh0aGlzLm8pXG4gICAgICAgICAgICAgICAgICAgIDogKCh0aGlzLnBbMF0gJiAxNSkgIT0gOCB8fCAodGhpcy5wWzBdID4+IDQpID4gNyB8fCAoKHRoaXMucFswXSA8PCA4IHwgdGhpcy5wWzFdKSAlIDMxKSlcbiAgICAgICAgICAgICAgICAgICAgICAgID8gbmV3IHRoaXMuSSh0aGlzLm8pXG4gICAgICAgICAgICAgICAgICAgICAgICA6IG5ldyB0aGlzLloodGhpcy5vKTtcbiAgICAgICAgICAgICAgICB0aGlzLmkoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnMucHVzaCh0aGlzLnAsIGZpbmFsKTtcbiAgICAgICAgICAgICAgICB0aGlzLnAgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMucy5wdXNoKGNodW5rLCBmaW5hbCk7XG4gICAgfTtcbiAgICByZXR1cm4gRGVjb21wcmVzcztcbn0oKSk7XG5leHBvcnQgeyBEZWNvbXByZXNzIH07XG4vKipcbiAqIEFzeW5jaHJvbm91cyBzdHJlYW1pbmcgR1pJUCwgWmxpYiwgb3IgcmF3IERFRkxBVEUgZGVjb21wcmVzc2lvblxuICovXG52YXIgQXN5bmNEZWNvbXByZXNzID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFzeW5jRGVjb21wcmVzcyhvcHRzLCBjYikge1xuICAgICAgICBEZWNvbXByZXNzLmNhbGwodGhpcywgb3B0cywgY2IpO1xuICAgICAgICB0aGlzLnF1ZXVlZFNpemUgPSAwO1xuICAgICAgICB0aGlzLkcgPSBBc3luY0d1bnppcDtcbiAgICAgICAgdGhpcy5JID0gQXN5bmNJbmZsYXRlO1xuICAgICAgICB0aGlzLlogPSBBc3luY1VuemxpYjtcbiAgICB9XG4gICAgQXN5bmNEZWNvbXByZXNzLnByb3RvdHlwZS5pID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLnMub25kYXRhID0gZnVuY3Rpb24gKGVyciwgZGF0LCBmaW5hbCkge1xuICAgICAgICAgICAgX3RoaXMub25kYXRhKGVyciwgZGF0LCBmaW5hbCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucy5vbmRyYWluID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgICAgICAgICAgIF90aGlzLnF1ZXVlZFNpemUgLT0gc2l6ZTtcbiAgICAgICAgICAgIGlmIChfdGhpcy5vbmRyYWluKVxuICAgICAgICAgICAgICAgIF90aGlzLm9uZHJhaW4oc2l6ZSk7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQdXNoZXMgYSBjaHVuayB0byBiZSBkZWNvbXByZXNzZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgQXN5bmNEZWNvbXByZXNzLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKGNodW5rLCBmaW5hbCkge1xuICAgICAgICB0aGlzLnF1ZXVlZFNpemUgKz0gY2h1bmsubGVuZ3RoO1xuICAgICAgICBEZWNvbXByZXNzLnByb3RvdHlwZS5wdXNoLmNhbGwodGhpcywgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIHJldHVybiBBc3luY0RlY29tcHJlc3M7XG59KCkpO1xuZXhwb3J0IHsgQXN5bmNEZWNvbXByZXNzIH07XG5leHBvcnQgZnVuY3Rpb24gZGVjb21wcmVzcyhkYXRhLCBvcHRzLCBjYikge1xuICAgIGlmICghY2IpXG4gICAgICAgIGNiID0gb3B0cywgb3B0cyA9IHt9O1xuICAgIGlmICh0eXBlb2YgY2IgIT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgZXJyKDcpO1xuICAgIHJldHVybiAoZGF0YVswXSA9PSAzMSAmJiBkYXRhWzFdID09IDEzOSAmJiBkYXRhWzJdID09IDgpXG4gICAgICAgID8gZ3VuemlwKGRhdGEsIG9wdHMsIGNiKVxuICAgICAgICA6ICgoZGF0YVswXSAmIDE1KSAhPSA4IHx8IChkYXRhWzBdID4+IDQpID4gNyB8fCAoKGRhdGFbMF0gPDwgOCB8IGRhdGFbMV0pICUgMzEpKVxuICAgICAgICAgICAgPyBpbmZsYXRlKGRhdGEsIG9wdHMsIGNiKVxuICAgICAgICAgICAgOiB1bnpsaWIoZGF0YSwgb3B0cywgY2IpO1xufVxuLyoqXG4gKiBFeHBhbmRzIGNvbXByZXNzZWQgR1pJUCwgWmxpYiwgb3IgcmF3IERFRkxBVEUgZGF0YSwgYXV0b21hdGljYWxseSBkZXRlY3RpbmcgdGhlIGZvcm1hdFxuICogQHBhcmFtIGRhdGEgVGhlIGRhdGEgdG8gZGVjb21wcmVzc1xuICogQHBhcmFtIG9wdHMgVGhlIGRlY29tcHJlc3Npb24gb3B0aW9uc1xuICogQHJldHVybnMgVGhlIGRlY29tcHJlc3NlZCB2ZXJzaW9uIG9mIHRoZSBkYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWNvbXByZXNzU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgcmV0dXJuIChkYXRhWzBdID09IDMxICYmIGRhdGFbMV0gPT0gMTM5ICYmIGRhdGFbMl0gPT0gOClcbiAgICAgICAgPyBndW56aXBTeW5jKGRhdGEsIG9wdHMpXG4gICAgICAgIDogKChkYXRhWzBdICYgMTUpICE9IDggfHwgKGRhdGFbMF0gPj4gNCkgPiA3IHx8ICgoZGF0YVswXSA8PCA4IHwgZGF0YVsxXSkgJSAzMSkpXG4gICAgICAgICAgICA/IGluZmxhdGVTeW5jKGRhdGEsIG9wdHMpXG4gICAgICAgICAgICA6IHVuemxpYlN5bmMoZGF0YSwgb3B0cyk7XG59XG4vLyBmbGF0dGVuIGEgZGlyZWN0b3J5IHN0cnVjdHVyZVxudmFyIGZsdG4gPSBmdW5jdGlvbiAoZCwgcCwgdCwgbykge1xuICAgIGZvciAodmFyIGsgaW4gZCkge1xuICAgICAgICB2YXIgdmFsID0gZFtrXSwgbiA9IHAgKyBrLCBvcCA9IG87XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbCkpXG4gICAgICAgICAgICBvcCA9IG1yZyhvLCB2YWxbMV0pLCB2YWwgPSB2YWxbMF07XG4gICAgICAgIGlmICh2YWwgaW5zdGFuY2VvZiB1OClcbiAgICAgICAgICAgIHRbbl0gPSBbdmFsLCBvcF07XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdFtuICs9ICcvJ10gPSBbbmV3IHU4KDApLCBvcF07XG4gICAgICAgICAgICBmbHRuKHZhbCwgbiwgdCwgbyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuLy8gdGV4dCBlbmNvZGVyXG52YXIgdGUgPSB0eXBlb2YgVGV4dEVuY29kZXIgIT0gJ3VuZGVmaW5lZCcgJiYgLyojX19QVVJFX18qLyBuZXcgVGV4dEVuY29kZXIoKTtcbi8vIHRleHQgZGVjb2RlclxudmFyIHRkID0gdHlwZW9mIFRleHREZWNvZGVyICE9ICd1bmRlZmluZWQnICYmIC8qI19fUFVSRV9fKi8gbmV3IFRleHREZWNvZGVyKCk7XG4vLyB0ZXh0IGRlY29kZXIgc3RyZWFtXG52YXIgdGRzID0gMDtcbnRyeSB7XG4gICAgdGQuZGVjb2RlKGV0LCB7IHN0cmVhbTogdHJ1ZSB9KTtcbiAgICB0ZHMgPSAxO1xufVxuY2F0Y2ggKGUpIHsgfVxuLy8gZGVjb2RlIFVURjhcbnZhciBkdXRmOCA9IGZ1bmN0aW9uIChkKSB7XG4gICAgZm9yICh2YXIgciA9ICcnLCBpID0gMDs7KSB7XG4gICAgICAgIHZhciBjID0gZFtpKytdO1xuICAgICAgICB2YXIgZWIgPSAoYyA+IDEyNykgKyAoYyA+IDIyMykgKyAoYyA+IDIzOSk7XG4gICAgICAgIGlmIChpICsgZWIgPiBkLmxlbmd0aClcbiAgICAgICAgICAgIHJldHVybiB7IHM6IHIsIHI6IHNsYyhkLCBpIC0gMSkgfTtcbiAgICAgICAgaWYgKCFlYilcbiAgICAgICAgICAgIHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShjKTtcbiAgICAgICAgZWxzZSBpZiAoZWIgPT0gMykge1xuICAgICAgICAgICAgYyA9ICgoYyAmIDE1KSA8PCAxOCB8IChkW2krK10gJiA2MykgPDwgMTIgfCAoZFtpKytdICYgNjMpIDw8IDYgfCAoZFtpKytdICYgNjMpKSAtIDY1NTM2LFxuICAgICAgICAgICAgICAgIHIgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NiB8IChjID4+IDEwKSwgNTYzMjAgfCAoYyAmIDEwMjMpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChlYiAmIDEpXG4gICAgICAgICAgICByICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKGMgJiAzMSkgPDwgNiB8IChkW2krK10gJiA2MykpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICByICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoKGMgJiAxNSkgPDwgMTIgfCAoZFtpKytdICYgNjMpIDw8IDYgfCAoZFtpKytdICYgNjMpKTtcbiAgICB9XG59O1xuLyoqXG4gKiBTdHJlYW1pbmcgVVRGLTggZGVjb2RpbmdcbiAqL1xudmFyIERlY29kZVVURjggPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIFVURi04IGRlY29kaW5nIHN0cmVhbVxuICAgICAqIEBwYXJhbSBjYiBUaGUgY2FsbGJhY2sgdG8gY2FsbCB3aGVuZXZlciBkYXRhIGlzIGRlY29kZWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBEZWNvZGVVVEY4KGNiKSB7XG4gICAgICAgIHRoaXMub25kYXRhID0gY2I7XG4gICAgICAgIGlmICh0ZHMpXG4gICAgICAgICAgICB0aGlzLnQgPSBuZXcgVGV4dERlY29kZXIoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5wID0gZXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGRlY29kZWQgZnJvbSBVVEYtOCBiaW5hcnlcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgRGVjb2RlVVRGOC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9uZGF0YSlcbiAgICAgICAgICAgIGVycig1KTtcbiAgICAgICAgZmluYWwgPSAhIWZpbmFsO1xuICAgICAgICBpZiAodGhpcy50KSB7XG4gICAgICAgICAgICB0aGlzLm9uZGF0YSh0aGlzLnQuZGVjb2RlKGNodW5rLCB7IHN0cmVhbTogdHJ1ZSB9KSwgZmluYWwpO1xuICAgICAgICAgICAgaWYgKGZpbmFsKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudC5kZWNvZGUoKS5sZW5ndGgpXG4gICAgICAgICAgICAgICAgICAgIGVycig4KTtcbiAgICAgICAgICAgICAgICB0aGlzLnQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5wKVxuICAgICAgICAgICAgZXJyKDQpO1xuICAgICAgICB2YXIgZGF0ID0gbmV3IHU4KHRoaXMucC5sZW5ndGggKyBjaHVuay5sZW5ndGgpO1xuICAgICAgICBkYXQuc2V0KHRoaXMucCk7XG4gICAgICAgIGRhdC5zZXQoY2h1bmssIHRoaXMucC5sZW5ndGgpO1xuICAgICAgICB2YXIgX2EgPSBkdXRmOChkYXQpLCBzID0gX2EucywgciA9IF9hLnI7XG4gICAgICAgIGlmIChmaW5hbCkge1xuICAgICAgICAgICAgaWYgKHIubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGVycig4KTtcbiAgICAgICAgICAgIHRoaXMucCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5wID0gcjtcbiAgICAgICAgdGhpcy5vbmRhdGEocywgZmluYWwpO1xuICAgIH07XG4gICAgcmV0dXJuIERlY29kZVVURjg7XG59KCkpO1xuZXhwb3J0IHsgRGVjb2RlVVRGOCB9O1xuLyoqXG4gKiBTdHJlYW1pbmcgVVRGLTggZW5jb2RpbmdcbiAqL1xudmFyIEVuY29kZVVURjggPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIFVURi04IGRlY29kaW5nIHN0cmVhbVxuICAgICAqIEBwYXJhbSBjYiBUaGUgY2FsbGJhY2sgdG8gY2FsbCB3aGVuZXZlciBkYXRhIGlzIGVuY29kZWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBFbmNvZGVVVEY4KGNiKSB7XG4gICAgICAgIHRoaXMub25kYXRhID0gY2I7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGVuY29kZWQgdG8gVVRGLThcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIHN0cmluZyBkYXRhIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgRW5jb2RlVVRGOC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgaWYgKCF0aGlzLm9uZGF0YSlcbiAgICAgICAgICAgIGVycig1KTtcbiAgICAgICAgaWYgKHRoaXMuZClcbiAgICAgICAgICAgIGVycig0KTtcbiAgICAgICAgdGhpcy5vbmRhdGEoc3RyVG9VOChjaHVuayksIHRoaXMuZCA9IGZpbmFsIHx8IGZhbHNlKTtcbiAgICB9O1xuICAgIHJldHVybiBFbmNvZGVVVEY4O1xufSgpKTtcbmV4cG9ydCB7IEVuY29kZVVURjggfTtcbi8qKlxuICogQ29udmVydHMgYSBzdHJpbmcgaW50byBhIFVpbnQ4QXJyYXkgZm9yIHVzZSB3aXRoIGNvbXByZXNzaW9uL2RlY29tcHJlc3Npb24gbWV0aG9kc1xuICogQHBhcmFtIHN0ciBUaGUgc3RyaW5nIHRvIGVuY29kZVxuICogQHBhcmFtIGxhdGluMSBXaGV0aGVyIG9yIG5vdCB0byBpbnRlcnByZXQgdGhlIGRhdGEgYXMgTGF0aW4tMS4gVGhpcyBzaG91bGRcbiAqICAgICAgICAgICAgICAgbm90IG5lZWQgdG8gYmUgdHJ1ZSB1bmxlc3MgZGVjb2RpbmcgYSBiaW5hcnkgc3RyaW5nLlxuICogQHJldHVybnMgVGhlIHN0cmluZyBlbmNvZGVkIGluIFVURi04L0xhdGluLTEgYmluYXJ5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJUb1U4KHN0ciwgbGF0aW4xKSB7XG4gICAgaWYgKGxhdGluMSkge1xuICAgICAgICB2YXIgYXJfMSA9IG5ldyB1OChzdHIubGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICBhcl8xW2ldID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIHJldHVybiBhcl8xO1xuICAgIH1cbiAgICBpZiAodGUpXG4gICAgICAgIHJldHVybiB0ZS5lbmNvZGUoc3RyKTtcbiAgICB2YXIgbCA9IHN0ci5sZW5ndGg7XG4gICAgdmFyIGFyID0gbmV3IHU4KHN0ci5sZW5ndGggKyAoc3RyLmxlbmd0aCA+PiAxKSk7XG4gICAgdmFyIGFpID0gMDtcbiAgICB2YXIgdyA9IGZ1bmN0aW9uICh2KSB7IGFyW2FpKytdID0gdjsgfTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7ICsraSkge1xuICAgICAgICBpZiAoYWkgKyA1ID4gYXIubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgbiA9IG5ldyB1OChhaSArIDggKyAoKGwgLSBpKSA8PCAxKSk7XG4gICAgICAgICAgICBuLnNldChhcik7XG4gICAgICAgICAgICBhciA9IG47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGMgPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgICAgaWYgKGMgPCAxMjggfHwgbGF0aW4xKVxuICAgICAgICAgICAgdyhjKTtcbiAgICAgICAgZWxzZSBpZiAoYyA8IDIwNDgpXG4gICAgICAgICAgICB3KDE5MiB8IChjID4+IDYpKSwgdygxMjggfCAoYyAmIDYzKSk7XG4gICAgICAgIGVsc2UgaWYgKGMgPiA1NTI5NSAmJiBjIDwgNTczNDQpXG4gICAgICAgICAgICBjID0gNjU1MzYgKyAoYyAmIDEwMjMgPDwgMTApIHwgKHN0ci5jaGFyQ29kZUF0KCsraSkgJiAxMDIzKSxcbiAgICAgICAgICAgICAgICB3KDI0MCB8IChjID4+IDE4KSksIHcoMTI4IHwgKChjID4+IDEyKSAmIDYzKSksIHcoMTI4IHwgKChjID4+IDYpICYgNjMpKSwgdygxMjggfCAoYyAmIDYzKSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHcoMjI0IHwgKGMgPj4gMTIpKSwgdygxMjggfCAoKGMgPj4gNikgJiA2MykpLCB3KDEyOCB8IChjICYgNjMpKTtcbiAgICB9XG4gICAgcmV0dXJuIHNsYyhhciwgMCwgYWkpO1xufVxuLyoqXG4gKiBDb252ZXJ0cyBhIFVpbnQ4QXJyYXkgdG8gYSBzdHJpbmdcbiAqIEBwYXJhbSBkYXQgVGhlIGRhdGEgdG8gZGVjb2RlIHRvIHN0cmluZ1xuICogQHBhcmFtIGxhdGluMSBXaGV0aGVyIG9yIG5vdCB0byBpbnRlcnByZXQgdGhlIGRhdGEgYXMgTGF0aW4tMS4gVGhpcyBzaG91bGRcbiAqICAgICAgICAgICAgICAgbm90IG5lZWQgdG8gYmUgdHJ1ZSB1bmxlc3MgZW5jb2RpbmcgdG8gYmluYXJ5IHN0cmluZy5cbiAqIEByZXR1cm5zIFRoZSBvcmlnaW5hbCBVVEYtOC9MYXRpbi0xIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyRnJvbVU4KGRhdCwgbGF0aW4xKSB7XG4gICAgaWYgKGxhdGluMSkge1xuICAgICAgICB2YXIgciA9ICcnO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdC5sZW5ndGg7IGkgKz0gMTYzODQpXG4gICAgICAgICAgICByICs9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgZGF0LnN1YmFycmF5KGksIGkgKyAxNjM4NCkpO1xuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG4gICAgZWxzZSBpZiAodGQpIHtcbiAgICAgICAgcmV0dXJuIHRkLmRlY29kZShkYXQpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdmFyIF9hID0gZHV0ZjgoZGF0KSwgcyA9IF9hLnMsIHIgPSBfYS5yO1xuICAgICAgICBpZiAoci5sZW5ndGgpXG4gICAgICAgICAgICBlcnIoOCk7XG4gICAgICAgIHJldHVybiBzO1xuICAgIH1cbn1cbjtcbi8vIGRlZmxhdGUgYml0IGZsYWdcbnZhciBkYmYgPSBmdW5jdGlvbiAobCkgeyByZXR1cm4gbCA9PSAxID8gMyA6IGwgPCA2ID8gMiA6IGwgPT0gOSA/IDEgOiAwOyB9O1xuLy8gc2tpcCBsb2NhbCB6aXAgaGVhZGVyXG52YXIgc2x6aCA9IGZ1bmN0aW9uIChkLCBiKSB7IHJldHVybiBiICsgMzAgKyBiMihkLCBiICsgMjYpICsgYjIoZCwgYiArIDI4KTsgfTtcbi8vIHJlYWQgemlwIGhlYWRlclxudmFyIHpoID0gZnVuY3Rpb24gKGQsIGIsIHopIHtcbiAgICB2YXIgZm5sID0gYjIoZCwgYiArIDI4KSwgZm4gPSBzdHJGcm9tVTgoZC5zdWJhcnJheShiICsgNDYsIGIgKyA0NiArIGZubCksICEoYjIoZCwgYiArIDgpICYgMjA0OCkpLCBlcyA9IGIgKyA0NiArIGZubCwgYnMgPSBiNChkLCBiICsgMjApO1xuICAgIHZhciBfYSA9IHogJiYgYnMgPT0gNDI5NDk2NzI5NSA/IHo2NGUoZCwgZXMpIDogW2JzLCBiNChkLCBiICsgMjQpLCBiNChkLCBiICsgNDIpXSwgc2MgPSBfYVswXSwgc3UgPSBfYVsxXSwgb2ZmID0gX2FbMl07XG4gICAgcmV0dXJuIFtiMihkLCBiICsgMTApLCBzYywgc3UsIGZuLCBlcyArIGIyKGQsIGIgKyAzMCkgKyBiMihkLCBiICsgMzIpLCBvZmZdO1xufTtcbi8vIHJlYWQgemlwNjQgZXh0cmEgZmllbGRcbnZhciB6NjRlID0gZnVuY3Rpb24gKGQsIGIpIHtcbiAgICBmb3IgKDsgYjIoZCwgYikgIT0gMTsgYiArPSA0ICsgYjIoZCwgYiArIDIpKVxuICAgICAgICA7XG4gICAgcmV0dXJuIFtiOChkLCBiICsgMTIpLCBiOChkLCBiICsgNCksIGI4KGQsIGIgKyAyMCldO1xufTtcbi8vIGV4dHJhIGZpZWxkIGxlbmd0aFxudmFyIGV4ZmwgPSBmdW5jdGlvbiAoZXgpIHtcbiAgICB2YXIgbGUgPSAwO1xuICAgIGlmIChleCkge1xuICAgICAgICBmb3IgKHZhciBrIGluIGV4KSB7XG4gICAgICAgICAgICB2YXIgbCA9IGV4W2tdLmxlbmd0aDtcbiAgICAgICAgICAgIGlmIChsID4gNjU1MzUpXG4gICAgICAgICAgICAgICAgZXJyKDkpO1xuICAgICAgICAgICAgbGUgKz0gbCArIDQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGxlO1xufTtcbi8vIHdyaXRlIHppcCBoZWFkZXJcbnZhciB3emggPSBmdW5jdGlvbiAoZCwgYiwgZiwgZm4sIHUsIGMsIGNlLCBjbykge1xuICAgIHZhciBmbCA9IGZuLmxlbmd0aCwgZXggPSBmLmV4dHJhLCBjb2wgPSBjbyAmJiBjby5sZW5ndGg7XG4gICAgdmFyIGV4bCA9IGV4ZmwoZXgpO1xuICAgIHdieXRlcyhkLCBiLCBjZSAhPSBudWxsID8gMHgyMDE0QjUwIDogMHg0MDM0QjUwKSwgYiArPSA0O1xuICAgIGlmIChjZSAhPSBudWxsKVxuICAgICAgICBkW2IrK10gPSAyMCwgZFtiKytdID0gZi5vcztcbiAgICBkW2JdID0gMjAsIGIgKz0gMjsgLy8gc3BlYyBjb21wbGlhbmNlPyB3aGF0J3MgdGhhdD9cbiAgICBkW2IrK10gPSAoZi5mbGFnIDw8IDEpIHwgKGMgPCAwICYmIDgpLCBkW2IrK10gPSB1ICYmIDg7XG4gICAgZFtiKytdID0gZi5jb21wcmVzc2lvbiAmIDI1NSwgZFtiKytdID0gZi5jb21wcmVzc2lvbiA+PiA4O1xuICAgIHZhciBkdCA9IG5ldyBEYXRlKGYubXRpbWUgPT0gbnVsbCA/IERhdGUubm93KCkgOiBmLm10aW1lKSwgeSA9IGR0LmdldEZ1bGxZZWFyKCkgLSAxOTgwO1xuICAgIGlmICh5IDwgMCB8fCB5ID4gMTE5KVxuICAgICAgICBlcnIoMTApO1xuICAgIHdieXRlcyhkLCBiLCAoeSA8PCAyNSkgfCAoKGR0LmdldE1vbnRoKCkgKyAxKSA8PCAyMSkgfCAoZHQuZ2V0RGF0ZSgpIDw8IDE2KSB8IChkdC5nZXRIb3VycygpIDw8IDExKSB8IChkdC5nZXRNaW51dGVzKCkgPDwgNSkgfCAoZHQuZ2V0U2Vjb25kcygpID4+IDEpKSwgYiArPSA0O1xuICAgIGlmIChjICE9IC0xKSB7XG4gICAgICAgIHdieXRlcyhkLCBiLCBmLmNyYyk7XG4gICAgICAgIHdieXRlcyhkLCBiICsgNCwgYyA8IDAgPyAtYyAtIDIgOiBjKTtcbiAgICAgICAgd2J5dGVzKGQsIGIgKyA4LCBmLnNpemUpO1xuICAgIH1cbiAgICB3Ynl0ZXMoZCwgYiArIDEyLCBmbCk7XG4gICAgd2J5dGVzKGQsIGIgKyAxNCwgZXhsKSwgYiArPSAxNjtcbiAgICBpZiAoY2UgIT0gbnVsbCkge1xuICAgICAgICB3Ynl0ZXMoZCwgYiwgY29sKTtcbiAgICAgICAgd2J5dGVzKGQsIGIgKyA2LCBmLmF0dHJzKTtcbiAgICAgICAgd2J5dGVzKGQsIGIgKyAxMCwgY2UpLCBiICs9IDE0O1xuICAgIH1cbiAgICBkLnNldChmbiwgYik7XG4gICAgYiArPSBmbDtcbiAgICBpZiAoZXhsKSB7XG4gICAgICAgIGZvciAodmFyIGsgaW4gZXgpIHtcbiAgICAgICAgICAgIHZhciBleGYgPSBleFtrXSwgbCA9IGV4Zi5sZW5ndGg7XG4gICAgICAgICAgICB3Ynl0ZXMoZCwgYiwgK2spO1xuICAgICAgICAgICAgd2J5dGVzKGQsIGIgKyAyLCBsKTtcbiAgICAgICAgICAgIGQuc2V0KGV4ZiwgYiArIDQpLCBiICs9IDQgKyBsO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChjb2wpXG4gICAgICAgIGQuc2V0KGNvLCBiKSwgYiArPSBjb2w7XG4gICAgcmV0dXJuIGI7XG59O1xuLy8gd3JpdGUgemlwIGZvb3RlciAoZW5kIG9mIGNlbnRyYWwgZGlyZWN0b3J5KVxudmFyIHd6ZiA9IGZ1bmN0aW9uIChvLCBiLCBjLCBkLCBlKSB7XG4gICAgd2J5dGVzKG8sIGIsIDB4NjA1NEI1MCk7IC8vIHNraXAgZGlza1xuICAgIHdieXRlcyhvLCBiICsgOCwgYyk7XG4gICAgd2J5dGVzKG8sIGIgKyAxMCwgYyk7XG4gICAgd2J5dGVzKG8sIGIgKyAxMiwgZCk7XG4gICAgd2J5dGVzKG8sIGIgKyAxNiwgZSk7XG59O1xuLyoqXG4gKiBBIHBhc3MtdGhyb3VnaCBzdHJlYW0gdG8ga2VlcCBkYXRhIHVuY29tcHJlc3NlZCBpbiBhIFpJUCBhcmNoaXZlLlxuICovXG52YXIgWmlwUGFzc1Rocm91Z2ggPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHBhc3MtdGhyb3VnaCBzdHJlYW0gdGhhdCBjYW4gYmUgYWRkZWQgdG8gWklQIGFyY2hpdmVzXG4gICAgICogQHBhcmFtIGZpbGVuYW1lIFRoZSBmaWxlbmFtZSB0byBhc3NvY2lhdGUgd2l0aCB0aGlzIGRhdGEgc3RyZWFtXG4gICAgICovXG4gICAgZnVuY3Rpb24gWmlwUGFzc1Rocm91Z2goZmlsZW5hbWUpIHtcbiAgICAgICAgdGhpcy5maWxlbmFtZSA9IGZpbGVuYW1lO1xuICAgICAgICB0aGlzLmMgPSBjcmMoKTtcbiAgICAgICAgdGhpcy5zaXplID0gMDtcbiAgICAgICAgdGhpcy5jb21wcmVzc2lvbiA9IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFByb2Nlc3NlcyBhIGNodW5rIGFuZCBwdXNoZXMgdG8gdGhlIG91dHB1dCBzdHJlYW0uIFlvdSBjYW4gb3ZlcnJpZGUgdGhpc1xuICAgICAqIG1ldGhvZCBpbiBhIHN1YmNsYXNzIGZvciBjdXN0b20gYmVoYXZpb3IsIGJ1dCBieSBkZWZhdWx0IHRoaXMgcGFzc2VzXG4gICAgICogdGhlIGRhdGEgdGhyb3VnaC4gWW91IG11c3QgY2FsbCB0aGlzLm9uZGF0YShlcnIsIGNodW5rLCBmaW5hbCkgYXQgc29tZVxuICAgICAqIHBvaW50IGluIHRoaXMgbWV0aG9kLlxuICAgICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdG8gcHJvY2Vzc1xuICAgICAqIEBwYXJhbSBmaW5hbCBXaGV0aGVyIHRoaXMgaXMgdGhlIGxhc3QgY2h1bmtcbiAgICAgKi9cbiAgICBaaXBQYXNzVGhyb3VnaC5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgdGhpcy5vbmRhdGEobnVsbCwgY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGFkZGVkLiBJZiB5b3UgYXJlIHN1YmNsYXNzaW5nIHRoaXMgd2l0aCBhIGN1c3RvbVxuICAgICAqIGNvbXByZXNzaW9uIGFsZ29yaXRobSwgbm90ZSB0aGF0IHlvdSBtdXN0IHB1c2ggZGF0YSBmcm9tIHRoZSBzb3VyY2VcbiAgICAgKiBmaWxlIG9ubHksIHByZS1jb21wcmVzc2lvbi5cbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgWmlwUGFzc1Rocm91Z2gucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIGlmICghdGhpcy5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIHRoaXMuYy5wKGNodW5rKTtcbiAgICAgICAgdGhpcy5zaXplICs9IGNodW5rLmxlbmd0aDtcbiAgICAgICAgaWYgKGZpbmFsKVxuICAgICAgICAgICAgdGhpcy5jcmMgPSB0aGlzLmMuZCgpO1xuICAgICAgICB0aGlzLnByb2Nlc3MoY2h1bmssIGZpbmFsIHx8IGZhbHNlKTtcbiAgICB9O1xuICAgIHJldHVybiBaaXBQYXNzVGhyb3VnaDtcbn0oKSk7XG5leHBvcnQgeyBaaXBQYXNzVGhyb3VnaCB9O1xuLy8gSSBkb24ndCBleHRlbmQgYmVjYXVzZSBUeXBlU2NyaXB0IGV4dGVuc2lvbiBhZGRzIDFrQiBvZiBydW50aW1lIGJsb2F0XG4vKipcbiAqIFN0cmVhbWluZyBERUZMQVRFIGNvbXByZXNzaW9uIGZvciBaSVAgYXJjaGl2ZXMuIFByZWZlciB1c2luZyBBc3luY1ppcERlZmxhdGVcbiAqIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2VcbiAqL1xudmFyIFppcERlZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIERFRkxBVEUgc3RyZWFtIHRoYXQgY2FuIGJlIGFkZGVkIHRvIFpJUCBhcmNoaXZlc1xuICAgICAqIEBwYXJhbSBmaWxlbmFtZSBUaGUgZmlsZW5hbWUgdG8gYXNzb2NpYXRlIHdpdGggdGhpcyBkYXRhIHN0cmVhbVxuICAgICAqIEBwYXJhbSBvcHRzIFRoZSBjb21wcmVzc2lvbiBvcHRpb25zXG4gICAgICovXG4gICAgZnVuY3Rpb24gWmlwRGVmbGF0ZShmaWxlbmFtZSwgb3B0cykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBpZiAoIW9wdHMpXG4gICAgICAgICAgICBvcHRzID0ge307XG4gICAgICAgIFppcFBhc3NUaHJvdWdoLmNhbGwodGhpcywgZmlsZW5hbWUpO1xuICAgICAgICB0aGlzLmQgPSBuZXcgRGVmbGF0ZShvcHRzLCBmdW5jdGlvbiAoZGF0LCBmaW5hbCkge1xuICAgICAgICAgICAgX3RoaXMub25kYXRhKG51bGwsIGRhdCwgZmluYWwpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jb21wcmVzc2lvbiA9IDg7XG4gICAgICAgIHRoaXMuZmxhZyA9IGRiZihvcHRzLmxldmVsKTtcbiAgICB9XG4gICAgWmlwRGVmbGF0ZS5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuZC5wdXNoKGNodW5rLCBmaW5hbCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMub25kYXRhKGUsIG51bGwsIGZpbmFsKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgZGVmbGF0ZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgWmlwRGVmbGF0ZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgWmlwUGFzc1Rocm91Z2gucHJvdG90eXBlLnB1c2guY2FsbCh0aGlzLCBjaHVuaywgZmluYWwpO1xuICAgIH07XG4gICAgcmV0dXJuIFppcERlZmxhdGU7XG59KCkpO1xuZXhwb3J0IHsgWmlwRGVmbGF0ZSB9O1xuLyoqXG4gKiBBc3luY2hyb25vdXMgc3RyZWFtaW5nIERFRkxBVEUgY29tcHJlc3Npb24gZm9yIFpJUCBhcmNoaXZlc1xuICovXG52YXIgQXN5bmNaaXBEZWZsYXRlID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYXN5bmNocm9ub3VzIERFRkxBVEUgc3RyZWFtIHRoYXQgY2FuIGJlIGFkZGVkIHRvIFpJUCBhcmNoaXZlc1xuICAgICAqIEBwYXJhbSBmaWxlbmFtZSBUaGUgZmlsZW5hbWUgdG8gYXNzb2NpYXRlIHdpdGggdGhpcyBkYXRhIHN0cmVhbVxuICAgICAqIEBwYXJhbSBvcHRzIFRoZSBjb21wcmVzc2lvbiBvcHRpb25zXG4gICAgICovXG4gICAgZnVuY3Rpb24gQXN5bmNaaXBEZWZsYXRlKGZpbGVuYW1lLCBvcHRzKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGlmICghb3B0cylcbiAgICAgICAgICAgIG9wdHMgPSB7fTtcbiAgICAgICAgWmlwUGFzc1Rocm91Z2guY2FsbCh0aGlzLCBmaWxlbmFtZSk7XG4gICAgICAgIHRoaXMuZCA9IG5ldyBBc3luY0RlZmxhdGUob3B0cywgZnVuY3Rpb24gKGVyciwgZGF0LCBmaW5hbCkge1xuICAgICAgICAgICAgX3RoaXMub25kYXRhKGVyciwgZGF0LCBmaW5hbCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNvbXByZXNzaW9uID0gODtcbiAgICAgICAgdGhpcy5mbGFnID0gZGJmKG9wdHMubGV2ZWwpO1xuICAgICAgICB0aGlzLnRlcm1pbmF0ZSA9IHRoaXMuZC50ZXJtaW5hdGU7XG4gICAgfVxuICAgIEFzeW5jWmlwRGVmbGF0ZS5wcm90b3R5cGUucHJvY2VzcyA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgdGhpcy5kLnB1c2goY2h1bmssIGZpbmFsKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhIGNodW5rIHRvIGJlIGRlZmxhdGVkXG4gICAgICogQHBhcmFtIGNodW5rIFRoZSBjaHVuayB0byBwdXNoXG4gICAgICogQHBhcmFtIGZpbmFsIFdoZXRoZXIgdGhpcyBpcyB0aGUgbGFzdCBjaHVua1xuICAgICAqL1xuICAgIEFzeW5jWmlwRGVmbGF0ZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChjaHVuaywgZmluYWwpIHtcbiAgICAgICAgWmlwUGFzc1Rocm91Z2gucHJvdG90eXBlLnB1c2guY2FsbCh0aGlzLCBjaHVuaywgZmluYWwpO1xuICAgIH07XG4gICAgcmV0dXJuIEFzeW5jWmlwRGVmbGF0ZTtcbn0oKSk7XG5leHBvcnQgeyBBc3luY1ppcERlZmxhdGUgfTtcbi8vIFRPRE86IEJldHRlciB0cmVlIHNoYWtpbmdcbi8qKlxuICogQSB6aXBwYWJsZSBhcmNoaXZlIHRvIHdoaWNoIGZpbGVzIGNhbiBpbmNyZW1lbnRhbGx5IGJlIGFkZGVkXG4gKi9cbnZhciBaaXAgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBlbXB0eSBaSVAgYXJjaGl2ZSB0byB3aGljaCBmaWxlcyBjYW4gYmUgYWRkZWRcbiAgICAgKiBAcGFyYW0gY2IgVGhlIGNhbGxiYWNrIHRvIGNhbGwgd2hlbmV2ZXIgZGF0YSBmb3IgdGhlIGdlbmVyYXRlZCBaSVAgYXJjaGl2ZVxuICAgICAqICAgICAgICAgICBpcyBhdmFpbGFibGVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBaaXAoY2IpIHtcbiAgICAgICAgdGhpcy5vbmRhdGEgPSBjYjtcbiAgICAgICAgdGhpcy51ID0gW107XG4gICAgICAgIHRoaXMuZCA9IDE7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBmaWxlIHRvIHRoZSBaSVAgYXJjaGl2ZVxuICAgICAqIEBwYXJhbSBmaWxlIFRoZSBmaWxlIHN0cmVhbSB0byBhZGRcbiAgICAgKi9cbiAgICBaaXAucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGlmICghdGhpcy5vbmRhdGEpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIC8vIGZpbmlzaGluZyBvciBmaW5pc2hlZFxuICAgICAgICBpZiAodGhpcy5kICYgMilcbiAgICAgICAgICAgIHRoaXMub25kYXRhKGVycig0ICsgKHRoaXMuZCAmIDEpICogOCwgMCwgMSksIG51bGwsIGZhbHNlKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgZiA9IHN0clRvVTgoZmlsZS5maWxlbmFtZSksIGZsXzEgPSBmLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBjb20gPSBmaWxlLmNvbW1lbnQsIG8gPSBjb20gJiYgc3RyVG9VOChjb20pO1xuICAgICAgICAgICAgdmFyIHUgPSBmbF8xICE9IGZpbGUuZmlsZW5hbWUubGVuZ3RoIHx8IChvICYmIChjb20ubGVuZ3RoICE9IG8ubGVuZ3RoKSk7XG4gICAgICAgICAgICB2YXIgaGxfMSA9IGZsXzEgKyBleGZsKGZpbGUuZXh0cmEpICsgMzA7XG4gICAgICAgICAgICBpZiAoZmxfMSA+IDY1NTM1KVxuICAgICAgICAgICAgICAgIHRoaXMub25kYXRhKGVycigxMSwgMCwgMSksIG51bGwsIGZhbHNlKTtcbiAgICAgICAgICAgIHZhciBoZWFkZXIgPSBuZXcgdTgoaGxfMSk7XG4gICAgICAgICAgICB3emgoaGVhZGVyLCAwLCBmaWxlLCBmLCB1LCAtMSk7XG4gICAgICAgICAgICB2YXIgY2hrc18xID0gW2hlYWRlcl07XG4gICAgICAgICAgICB2YXIgcEFsbF8xID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgY2hrc18yID0gY2hrc18xOyBfaSA8IGNoa3NfMi5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoayA9IGNoa3NfMltfaV07XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLm9uZGF0YShudWxsLCBjaGssIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2hrc18xID0gW107XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHRyXzEgPSB0aGlzLmQ7XG4gICAgICAgICAgICB0aGlzLmQgPSAwO1xuICAgICAgICAgICAgdmFyIGluZF8xID0gdGhpcy51Lmxlbmd0aDtcbiAgICAgICAgICAgIHZhciB1Zl8xID0gbXJnKGZpbGUsIHtcbiAgICAgICAgICAgICAgICBmOiBmLFxuICAgICAgICAgICAgICAgIHU6IHUsXG4gICAgICAgICAgICAgICAgbzogbyxcbiAgICAgICAgICAgICAgICB0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWxlLnRlcm1pbmF0ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUudGVybWluYXRlKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICByOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHBBbGxfMSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHJfMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG54dCA9IF90aGlzLnVbaW5kXzEgKyAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChueHQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnh0LnIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5kID0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0cl8xID0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBjbF8xID0gMDtcbiAgICAgICAgICAgIGZpbGUub25kYXRhID0gZnVuY3Rpb24gKGVyciwgZGF0LCBmaW5hbCkge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMub25kYXRhKGVyciwgZGF0LCBmaW5hbCk7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnRlcm1pbmF0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2xfMSArPSBkYXQubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBjaGtzXzEucHVzaChkYXQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmluYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkZCA9IG5ldyB1OCgxNik7XG4gICAgICAgICAgICAgICAgICAgICAgICB3Ynl0ZXMoZGQsIDAsIDB4ODA3NEI1MCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3Ynl0ZXMoZGQsIDQsIGZpbGUuY3JjKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdieXRlcyhkZCwgOCwgY2xfMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3Ynl0ZXMoZGQsIDEyLCBmaWxlLnNpemUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hrc18xLnB1c2goZGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdWZfMS5jID0gY2xfMSwgdWZfMS5iID0gaGxfMSArIGNsXzEgKyAxNiwgdWZfMS5jcmMgPSBmaWxlLmNyYywgdWZfMS5zaXplID0gZmlsZS5zaXplO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRyXzEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdWZfMS5yKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cl8xID0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0cl8xKVxuICAgICAgICAgICAgICAgICAgICAgICAgcEFsbF8xKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMudS5wdXNoKHVmXzEpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBFbmRzIHRoZSBwcm9jZXNzIG9mIGFkZGluZyBmaWxlcyBhbmQgcHJlcGFyZXMgdG8gZW1pdCB0aGUgZmluYWwgY2h1bmtzLlxuICAgICAqIFRoaXMgKm11c3QqIGJlIGNhbGxlZCBhZnRlciBhZGRpbmcgYWxsIGRlc2lyZWQgZmlsZXMgZm9yIHRoZSByZXN1bHRpbmdcbiAgICAgKiBaSVAgZmlsZSB0byB3b3JrIHByb3Blcmx5LlxuICAgICAqL1xuICAgIFppcC5wcm90b3R5cGUuZW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBpZiAodGhpcy5kICYgMikge1xuICAgICAgICAgICAgdGhpcy5vbmRhdGEoZXJyKDQgKyAodGhpcy5kICYgMSkgKiA4LCAwLCAxKSwgbnVsbCwgdHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZClcbiAgICAgICAgICAgIHRoaXMuZSgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLnUucHVzaCh7XG4gICAgICAgICAgICAgICAgcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIShfdGhpcy5kICYgMSkpXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLnUuc3BsaWNlKC0xLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuZSgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdDogZnVuY3Rpb24gKCkgeyB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5kID0gMztcbiAgICB9O1xuICAgIFppcC5wcm90b3R5cGUuZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGJ0ID0gMCwgbCA9IDAsIHRsID0gMDtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMudTsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBmID0gX2FbX2ldO1xuICAgICAgICAgICAgdGwgKz0gNDYgKyBmLmYubGVuZ3RoICsgZXhmbChmLmV4dHJhKSArIChmLm8gPyBmLm8ubGVuZ3RoIDogMCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG91dCA9IG5ldyB1OCh0bCArIDIyKTtcbiAgICAgICAgZm9yICh2YXIgX2IgPSAwLCBfYyA9IHRoaXMudTsgX2IgPCBfYy5sZW5ndGg7IF9iKyspIHtcbiAgICAgICAgICAgIHZhciBmID0gX2NbX2JdO1xuICAgICAgICAgICAgd3poKG91dCwgYnQsIGYsIGYuZiwgZi51LCAtZi5jIC0gMiwgbCwgZi5vKTtcbiAgICAgICAgICAgIGJ0ICs9IDQ2ICsgZi5mLmxlbmd0aCArIGV4ZmwoZi5leHRyYSkgKyAoZi5vID8gZi5vLmxlbmd0aCA6IDApLCBsICs9IGYuYjtcbiAgICAgICAgfVxuICAgICAgICB3emYob3V0LCBidCwgdGhpcy51Lmxlbmd0aCwgdGwsIGwpO1xuICAgICAgICB0aGlzLm9uZGF0YShudWxsLCBvdXQsIHRydWUpO1xuICAgICAgICB0aGlzLmQgPSAyO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQSBtZXRob2QgdG8gdGVybWluYXRlIGFueSBpbnRlcm5hbCB3b3JrZXJzIHVzZWQgYnkgdGhlIHN0cmVhbS4gU3Vic2VxdWVudFxuICAgICAqIGNhbGxzIHRvIGFkZCgpIHdpbGwgZmFpbC5cbiAgICAgKi9cbiAgICBaaXAucHJvdG90eXBlLnRlcm1pbmF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMudTsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBmID0gX2FbX2ldO1xuICAgICAgICAgICAgZi50KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kID0gMjtcbiAgICB9O1xuICAgIHJldHVybiBaaXA7XG59KCkpO1xuZXhwb3J0IHsgWmlwIH07XG5leHBvcnQgZnVuY3Rpb24gemlwKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICBlcnIoNyk7XG4gICAgdmFyIHIgPSB7fTtcbiAgICBmbHRuKGRhdGEsICcnLCByLCBvcHRzKTtcbiAgICB2YXIgayA9IE9iamVjdC5rZXlzKHIpO1xuICAgIHZhciBsZnQgPSBrLmxlbmd0aCwgbyA9IDAsIHRvdCA9IDA7XG4gICAgdmFyIHNsZnQgPSBsZnQsIGZpbGVzID0gbmV3IEFycmF5KGxmdCk7XG4gICAgdmFyIHRlcm0gPSBbXTtcbiAgICB2YXIgdEFsbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZXJtLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgdGVybVtpXSgpO1xuICAgIH07XG4gICAgdmFyIGNiZCA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIG10KGZ1bmN0aW9uICgpIHsgY2IoYSwgYik7IH0pO1xuICAgIH07XG4gICAgbXQoZnVuY3Rpb24gKCkgeyBjYmQgPSBjYjsgfSk7XG4gICAgdmFyIGNiZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG91dCA9IG5ldyB1OCh0b3QgKyAyMiksIG9lID0gbywgY2RsID0gdG90IC0gbztcbiAgICAgICAgdG90ID0gMDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGZ0OyArK2kpIHtcbiAgICAgICAgICAgIHZhciBmID0gZmlsZXNbaV07XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHZhciBsID0gZi5jLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB3emgob3V0LCB0b3QsIGYsIGYuZiwgZi51LCBsKTtcbiAgICAgICAgICAgICAgICB2YXIgYmFkZCA9IDMwICsgZi5mLmxlbmd0aCArIGV4ZmwoZi5leHRyYSk7XG4gICAgICAgICAgICAgICAgdmFyIGxvYyA9IHRvdCArIGJhZGQ7XG4gICAgICAgICAgICAgICAgb3V0LnNldChmLmMsIGxvYyk7XG4gICAgICAgICAgICAgICAgd3poKG91dCwgbywgZiwgZi5mLCBmLnUsIGwsIHRvdCwgZi5tKSwgbyArPSAxNiArIGJhZGQgKyAoZi5tID8gZi5tLmxlbmd0aCA6IDApLCB0b3QgPSBsb2MgKyBsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2JkKGUsIG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHd6ZihvdXQsIG8sIGZpbGVzLmxlbmd0aCwgY2RsLCBvZSk7XG4gICAgICAgIGNiZChudWxsLCBvdXQpO1xuICAgIH07XG4gICAgaWYgKCFsZnQpXG4gICAgICAgIGNiZigpO1xuICAgIHZhciBfbG9vcF8xID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgdmFyIGZuID0ga1tpXTtcbiAgICAgICAgdmFyIF9hID0gcltmbl0sIGZpbGUgPSBfYVswXSwgcCA9IF9hWzFdO1xuICAgICAgICB2YXIgYyA9IGNyYygpLCBzaXplID0gZmlsZS5sZW5ndGg7XG4gICAgICAgIGMucChmaWxlKTtcbiAgICAgICAgdmFyIGYgPSBzdHJUb1U4KGZuKSwgcyA9IGYubGVuZ3RoO1xuICAgICAgICB2YXIgY29tID0gcC5jb21tZW50LCBtID0gY29tICYmIHN0clRvVTgoY29tKSwgbXMgPSBtICYmIG0ubGVuZ3RoO1xuICAgICAgICB2YXIgZXhsID0gZXhmbChwLmV4dHJhKTtcbiAgICAgICAgdmFyIGNvbXByZXNzaW9uID0gcC5sZXZlbCA9PSAwID8gMCA6IDg7XG4gICAgICAgIHZhciBjYmwgPSBmdW5jdGlvbiAoZSwgZCkge1xuICAgICAgICAgICAgaWYgKGUpIHtcbiAgICAgICAgICAgICAgICB0QWxsKCk7XG4gICAgICAgICAgICAgICAgY2JkKGUsIG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIGwgPSBkLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBmaWxlc1tpXSA9IG1yZyhwLCB7XG4gICAgICAgICAgICAgICAgICAgIHNpemU6IHNpemUsXG4gICAgICAgICAgICAgICAgICAgIGNyYzogYy5kKCksXG4gICAgICAgICAgICAgICAgICAgIGM6IGQsXG4gICAgICAgICAgICAgICAgICAgIGY6IGYsXG4gICAgICAgICAgICAgICAgICAgIG06IG0sXG4gICAgICAgICAgICAgICAgICAgIHU6IHMgIT0gZm4ubGVuZ3RoIHx8IChtICYmIChjb20ubGVuZ3RoICE9IG1zKSksXG4gICAgICAgICAgICAgICAgICAgIGNvbXByZXNzaW9uOiBjb21wcmVzc2lvblxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIG8gKz0gMzAgKyBzICsgZXhsICsgbDtcbiAgICAgICAgICAgICAgICB0b3QgKz0gNzYgKyAyICogKHMgKyBleGwpICsgKG1zIHx8IDApICsgbDtcbiAgICAgICAgICAgICAgICBpZiAoIS0tbGZ0KVxuICAgICAgICAgICAgICAgICAgICBjYmYoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHMgPiA2NTUzNSlcbiAgICAgICAgICAgIGNibChlcnIoMTEsIDAsIDEpLCBudWxsKTtcbiAgICAgICAgaWYgKCFjb21wcmVzc2lvbilcbiAgICAgICAgICAgIGNibChudWxsLCBmaWxlKTtcbiAgICAgICAgZWxzZSBpZiAoc2l6ZSA8IDE2MDAwMCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjYmwobnVsbCwgZGVmbGF0ZVN5bmMoZmlsZSwgcCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjYmwoZSwgbnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGVybS5wdXNoKGRlZmxhdGUoZmlsZSwgcCwgY2JsKSk7XG4gICAgfTtcbiAgICAvLyBDYW5ub3QgdXNlIGxmdCBiZWNhdXNlIGl0IGNhbiBkZWNyZWFzZVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xmdDsgKytpKSB7XG4gICAgICAgIF9sb29wXzEoaSk7XG4gICAgfVxuICAgIHJldHVybiB0QWxsO1xufVxuLyoqXG4gKiBTeW5jaHJvbm91c2x5IGNyZWF0ZXMgYSBaSVAgZmlsZS4gUHJlZmVyIHVzaW5nIGB6aXBgIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2VcbiAqIHdpdGggbW9yZSB0aGFuIG9uZSBmaWxlLlxuICogQHBhcmFtIGRhdGEgVGhlIGRpcmVjdG9yeSBzdHJ1Y3R1cmUgZm9yIHRoZSBaSVAgYXJjaGl2ZVxuICogQHBhcmFtIG9wdHMgVGhlIG1haW4gb3B0aW9ucywgbWVyZ2VkIHdpdGggcGVyLWZpbGUgb3B0aW9uc1xuICogQHJldHVybnMgVGhlIGdlbmVyYXRlZCBaSVAgYXJjaGl2ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gemlwU3luYyhkYXRhLCBvcHRzKSB7XG4gICAgaWYgKCFvcHRzKVxuICAgICAgICBvcHRzID0ge307XG4gICAgdmFyIHIgPSB7fTtcbiAgICB2YXIgZmlsZXMgPSBbXTtcbiAgICBmbHRuKGRhdGEsICcnLCByLCBvcHRzKTtcbiAgICB2YXIgbyA9IDA7XG4gICAgdmFyIHRvdCA9IDA7XG4gICAgZm9yICh2YXIgZm4gaW4gcikge1xuICAgICAgICB2YXIgX2EgPSByW2ZuXSwgZmlsZSA9IF9hWzBdLCBwID0gX2FbMV07XG4gICAgICAgIHZhciBjb21wcmVzc2lvbiA9IHAubGV2ZWwgPT0gMCA/IDAgOiA4O1xuICAgICAgICB2YXIgZiA9IHN0clRvVTgoZm4pLCBzID0gZi5sZW5ndGg7XG4gICAgICAgIHZhciBjb20gPSBwLmNvbW1lbnQsIG0gPSBjb20gJiYgc3RyVG9VOChjb20pLCBtcyA9IG0gJiYgbS5sZW5ndGg7XG4gICAgICAgIHZhciBleGwgPSBleGZsKHAuZXh0cmEpO1xuICAgICAgICBpZiAocyA+IDY1NTM1KVxuICAgICAgICAgICAgZXJyKDExKTtcbiAgICAgICAgdmFyIGQgPSBjb21wcmVzc2lvbiA/IGRlZmxhdGVTeW5jKGZpbGUsIHApIDogZmlsZSwgbCA9IGQubGVuZ3RoO1xuICAgICAgICB2YXIgYyA9IGNyYygpO1xuICAgICAgICBjLnAoZmlsZSk7XG4gICAgICAgIGZpbGVzLnB1c2gobXJnKHAsIHtcbiAgICAgICAgICAgIHNpemU6IGZpbGUubGVuZ3RoLFxuICAgICAgICAgICAgY3JjOiBjLmQoKSxcbiAgICAgICAgICAgIGM6IGQsXG4gICAgICAgICAgICBmOiBmLFxuICAgICAgICAgICAgbTogbSxcbiAgICAgICAgICAgIHU6IHMgIT0gZm4ubGVuZ3RoIHx8IChtICYmIChjb20ubGVuZ3RoICE9IG1zKSksXG4gICAgICAgICAgICBvOiBvLFxuICAgICAgICAgICAgY29tcHJlc3Npb246IGNvbXByZXNzaW9uXG4gICAgICAgIH0pKTtcbiAgICAgICAgbyArPSAzMCArIHMgKyBleGwgKyBsO1xuICAgICAgICB0b3QgKz0gNzYgKyAyICogKHMgKyBleGwpICsgKG1zIHx8IDApICsgbDtcbiAgICB9XG4gICAgdmFyIG91dCA9IG5ldyB1OCh0b3QgKyAyMiksIG9lID0gbywgY2RsID0gdG90IC0gbztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBmID0gZmlsZXNbaV07XG4gICAgICAgIHd6aChvdXQsIGYubywgZiwgZi5mLCBmLnUsIGYuYy5sZW5ndGgpO1xuICAgICAgICB2YXIgYmFkZCA9IDMwICsgZi5mLmxlbmd0aCArIGV4ZmwoZi5leHRyYSk7XG4gICAgICAgIG91dC5zZXQoZi5jLCBmLm8gKyBiYWRkKTtcbiAgICAgICAgd3poKG91dCwgbywgZiwgZi5mLCBmLnUsIGYuYy5sZW5ndGgsIGYubywgZi5tKSwgbyArPSAxNiArIGJhZGQgKyAoZi5tID8gZi5tLmxlbmd0aCA6IDApO1xuICAgIH1cbiAgICB3emYob3V0LCBvLCBmaWxlcy5sZW5ndGgsIGNkbCwgb2UpO1xuICAgIHJldHVybiBvdXQ7XG59XG4vKipcbiAqIFN0cmVhbWluZyBwYXNzLXRocm91Z2ggZGVjb21wcmVzc2lvbiBmb3IgWklQIGFyY2hpdmVzXG4gKi9cbnZhciBVbnppcFBhc3NUaHJvdWdoID0gLyojX19QVVJFX18qLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFVuemlwUGFzc1Rocm91Z2goKSB7XG4gICAgfVxuICAgIFVuemlwUGFzc1Rocm91Z2gucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoZGF0YSwgZmluYWwpIHtcbiAgICAgICAgdGhpcy5vbmRhdGEobnVsbCwgZGF0YSwgZmluYWwpO1xuICAgIH07XG4gICAgVW56aXBQYXNzVGhyb3VnaC5jb21wcmVzc2lvbiA9IDA7XG4gICAgcmV0dXJuIFVuemlwUGFzc1Rocm91Z2g7XG59KCkpO1xuZXhwb3J0IHsgVW56aXBQYXNzVGhyb3VnaCB9O1xuLyoqXG4gKiBTdHJlYW1pbmcgREVGTEFURSBkZWNvbXByZXNzaW9uIGZvciBaSVAgYXJjaGl2ZXMuIFByZWZlciBBc3luY1ppcEluZmxhdGUgZm9yXG4gKiBiZXR0ZXIgcGVyZm9ybWFuY2UuXG4gKi9cbnZhciBVbnppcEluZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIERFRkxBVEUgZGVjb21wcmVzc2lvbiB0aGF0IGNhbiBiZSB1c2VkIGluIFpJUCBhcmNoaXZlc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIFVuemlwSW5mbGF0ZSgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5pID0gbmV3IEluZmxhdGUoZnVuY3Rpb24gKGRhdCwgZmluYWwpIHtcbiAgICAgICAgICAgIF90aGlzLm9uZGF0YShudWxsLCBkYXQsIGZpbmFsKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIFVuemlwSW5mbGF0ZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChkYXRhLCBmaW5hbCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5pLnB1c2goZGF0YSwgZmluYWwpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLm9uZGF0YShlLCBudWxsLCBmaW5hbCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFVuemlwSW5mbGF0ZS5jb21wcmVzc2lvbiA9IDg7XG4gICAgcmV0dXJuIFVuemlwSW5mbGF0ZTtcbn0oKSk7XG5leHBvcnQgeyBVbnppcEluZmxhdGUgfTtcbi8qKlxuICogQXN5bmNocm9ub3VzIHN0cmVhbWluZyBERUZMQVRFIGRlY29tcHJlc3Npb24gZm9yIFpJUCBhcmNoaXZlc1xuICovXG52YXIgQXN5bmNVbnppcEluZmxhdGUgPSAvKiNfX1BVUkVfXyovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIERFRkxBVEUgZGVjb21wcmVzc2lvbiB0aGF0IGNhbiBiZSB1c2VkIGluIFpJUCBhcmNoaXZlc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIEFzeW5jVW56aXBJbmZsYXRlKF8sIHN6KSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGlmIChzeiA8IDMyMDAwMCkge1xuICAgICAgICAgICAgdGhpcy5pID0gbmV3IEluZmxhdGUoZnVuY3Rpb24gKGRhdCwgZmluYWwpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5vbmRhdGEobnVsbCwgZGF0LCBmaW5hbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaSA9IG5ldyBBc3luY0luZmxhdGUoZnVuY3Rpb24gKGVyciwgZGF0LCBmaW5hbCkge1xuICAgICAgICAgICAgICAgIF90aGlzLm9uZGF0YShlcnIsIGRhdCwgZmluYWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnRlcm1pbmF0ZSA9IHRoaXMuaS50ZXJtaW5hdGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgQXN5bmNVbnppcEluZmxhdGUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoZGF0YSwgZmluYWwpIHtcbiAgICAgICAgaWYgKHRoaXMuaS50ZXJtaW5hdGUpXG4gICAgICAgICAgICBkYXRhID0gc2xjKGRhdGEsIDApO1xuICAgICAgICB0aGlzLmkucHVzaChkYXRhLCBmaW5hbCk7XG4gICAgfTtcbiAgICBBc3luY1VuemlwSW5mbGF0ZS5jb21wcmVzc2lvbiA9IDg7XG4gICAgcmV0dXJuIEFzeW5jVW56aXBJbmZsYXRlO1xufSgpKTtcbmV4cG9ydCB7IEFzeW5jVW56aXBJbmZsYXRlIH07XG4vKipcbiAqIEEgWklQIGFyY2hpdmUgZGVjb21wcmVzc2lvbiBzdHJlYW0gdGhhdCBlbWl0cyBmaWxlcyBhcyB0aGV5IGFyZSBkaXNjb3ZlcmVkXG4gKi9cbnZhciBVbnppcCA9IC8qI19fUFVSRV9fKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgWklQIGRlY29tcHJlc3Npb24gc3RyZWFtXG4gICAgICogQHBhcmFtIGNiIFRoZSBjYWxsYmFjayB0byBjYWxsIHdoZW5ldmVyIGEgZmlsZSBpbiB0aGUgWklQIGFyY2hpdmUgaXMgZm91bmRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBVbnppcChjYikge1xuICAgICAgICB0aGlzLm9uZmlsZSA9IGNiO1xuICAgICAgICB0aGlzLmsgPSBbXTtcbiAgICAgICAgdGhpcy5vID0ge1xuICAgICAgICAgICAgMDogVW56aXBQYXNzVGhyb3VnaFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnAgPSBldDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgY2h1bmsgdG8gYmUgdW56aXBwZWRcbiAgICAgKiBAcGFyYW0gY2h1bmsgVGhlIGNodW5rIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gZmluYWwgV2hldGhlciB0aGlzIGlzIHRoZSBsYXN0IGNodW5rXG4gICAgICovXG4gICAgVW56aXAucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAoY2h1bmssIGZpbmFsKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGlmICghdGhpcy5vbmZpbGUpXG4gICAgICAgICAgICBlcnIoNSk7XG4gICAgICAgIGlmICghdGhpcy5wKVxuICAgICAgICAgICAgZXJyKDQpO1xuICAgICAgICBpZiAodGhpcy5jID4gMCkge1xuICAgICAgICAgICAgdmFyIGxlbiA9IE1hdGgubWluKHRoaXMuYywgY2h1bmsubGVuZ3RoKTtcbiAgICAgICAgICAgIHZhciB0b0FkZCA9IGNodW5rLnN1YmFycmF5KDAsIGxlbik7XG4gICAgICAgICAgICB0aGlzLmMgLT0gbGVuO1xuICAgICAgICAgICAgaWYgKHRoaXMuZClcbiAgICAgICAgICAgICAgICB0aGlzLmQucHVzaCh0b0FkZCwgIXRoaXMuYyk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5rWzBdLnB1c2godG9BZGQpO1xuICAgICAgICAgICAgY2h1bmsgPSBjaHVuay5zdWJhcnJheShsZW4pO1xuICAgICAgICAgICAgaWYgKGNodW5rLmxlbmd0aClcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wdXNoKGNodW5rLCBmaW5hbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgZiA9IDAsIGkgPSAwLCBpcyA9IHZvaWQgMCwgYnVmID0gdm9pZCAwO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnAubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGJ1ZiA9IGNodW5rO1xuICAgICAgICAgICAgZWxzZSBpZiAoIWNodW5rLmxlbmd0aClcbiAgICAgICAgICAgICAgICBidWYgPSB0aGlzLnA7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBidWYgPSBuZXcgdTgodGhpcy5wLmxlbmd0aCArIGNodW5rLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgYnVmLnNldCh0aGlzLnApLCBidWYuc2V0KGNodW5rLCB0aGlzLnAubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBsID0gYnVmLmxlbmd0aCwgb2MgPSB0aGlzLmMsIGFkZCA9IG9jICYmIHRoaXMuZDtcbiAgICAgICAgICAgIHZhciBfbG9vcF8yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgICAgICB2YXIgc2lnID0gYjQoYnVmLCBpKTtcbiAgICAgICAgICAgICAgICBpZiAoc2lnID09IDB4NDAzNEI1MCkge1xuICAgICAgICAgICAgICAgICAgICBmID0gMSwgaXMgPSBpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzXzEuZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHRoaXNfMS5jID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJmID0gYjIoYnVmLCBpICsgNiksIGNtcF8xID0gYjIoYnVmLCBpICsgOCksIHUgPSBiZiAmIDIwNDgsIGRkID0gYmYgJiA4LCBmbmwgPSBiMihidWYsIGkgKyAyNiksIGVzID0gYjIoYnVmLCBpICsgMjgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobCA+IGkgKyAzMCArIGZubCArIGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2hrc18zID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzXzEuay51bnNoaWZ0KGNoa3NfMyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmID0gMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzY18xID0gYjQoYnVmLCBpICsgMTgpLCBzdV8xID0gYjQoYnVmLCBpICsgMjIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZuXzEgPSBzdHJGcm9tVTgoYnVmLnN1YmFycmF5KGkgKyAzMCwgaSArPSAzMCArIGZubCksICF1KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzY18xID09IDQyOTQ5NjcyOTUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfYSA9IGRkID8gWy0yXSA6IHo2NGUoYnVmLCBpKSwgc2NfMSA9IF9hWzBdLCBzdV8xID0gX2FbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChkZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY18xID0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IGVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpc18xLmMgPSBzY18xO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRfMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmaWxlXzEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogZm5fMSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wcmVzc2lvbjogY21wXzEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFmaWxlXzEub25kYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyKDUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXNjXzEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlXzEub25kYXRhKG51bGwsIGV0LCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3RyID0gX3RoaXMub1tjbXBfMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWN0cilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlXzEub25kYXRhKGVycigxNCwgJ3Vua25vd24gY29tcHJlc3Npb24gdHlwZSAnICsgY21wXzEsIDEpLCBudWxsLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkXzEgPSBzY18xIDwgMCA/IG5ldyBjdHIoZm5fMSkgOiBuZXcgY3RyKGZuXzEsIHNjXzEsIHN1XzEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZF8xLm9uZGF0YSA9IGZ1bmN0aW9uIChlcnIsIGRhdCwgZmluYWwpIHsgZmlsZV8xLm9uZGF0YShlcnIsIGRhdCwgZmluYWwpOyB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBjaGtzXzQgPSBjaGtzXzM7IF9pIDwgY2hrc180Lmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkYXQgPSBjaGtzXzRbX2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRfMS5wdXNoKGRhdCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzLmtbMF0gPT0gY2hrc18zICYmIF90aGlzLmMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuZCA9IGRfMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkXzEucHVzaChldCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlcm1pbmF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZF8xICYmIGRfMS50ZXJtaW5hdGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkXzEudGVybWluYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzY18xID49IDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZV8xLnNpemUgPSBzY18xLCBmaWxlXzEub3JpZ2luYWxTaXplID0gc3VfMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNfMS5vbmZpbGUoZmlsZV8xKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJicmVha1wiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChvYykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2lnID09IDB4ODA3NEI1MCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXMgPSBpICs9IDEyICsgKG9jID09IC0yICYmIDgpLCBmID0gMywgdGhpc18xLmMgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiYnJlYWtcIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChzaWcgPT0gMHgyMDE0QjUwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpcyA9IGkgLT0gNCwgZiA9IDMsIHRoaXNfMS5jID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcImJyZWFrXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHRoaXNfMSA9IHRoaXM7XG4gICAgICAgICAgICBmb3IgKDsgaSA8IGwgLSA0OyArK2kpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGVfMSA9IF9sb29wXzIoKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGVfMSA9PT0gXCJicmVha1wiKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucCA9IGV0O1xuICAgICAgICAgICAgaWYgKG9jIDwgMCkge1xuICAgICAgICAgICAgICAgIHZhciBkYXQgPSBmID8gYnVmLnN1YmFycmF5KDAsIGlzIC0gMTIgLSAob2MgPT0gLTIgJiYgOCkgLSAoYjQoYnVmLCBpcyAtIDE2KSA9PSAweDgwNzRCNTAgJiYgNCkpIDogYnVmLnN1YmFycmF5KDAsIGkpO1xuICAgICAgICAgICAgICAgIGlmIChhZGQpXG4gICAgICAgICAgICAgICAgICAgIGFkZC5wdXNoKGRhdCwgISFmKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua1srKGYgPT0gMildLnB1c2goZGF0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmICYgMilcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wdXNoKGJ1Zi5zdWJhcnJheShpKSwgZmluYWwpO1xuICAgICAgICAgICAgdGhpcy5wID0gYnVmLnN1YmFycmF5KGkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmaW5hbCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuYylcbiAgICAgICAgICAgICAgICBlcnIoMTMpO1xuICAgICAgICAgICAgdGhpcy5wID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJzIGEgZGVjb2RlciB3aXRoIHRoZSBzdHJlYW0sIGFsbG93aW5nIGZvciBmaWxlcyBjb21wcmVzc2VkIHdpdGhcbiAgICAgKiB0aGUgY29tcHJlc3Npb24gdHlwZSBwcm92aWRlZCB0byBiZSBleHBhbmRlZCBjb3JyZWN0bHlcbiAgICAgKiBAcGFyYW0gZGVjb2RlciBUaGUgZGVjb2RlciBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIFVuemlwLnByb3RvdHlwZS5yZWdpc3RlciA9IGZ1bmN0aW9uIChkZWNvZGVyKSB7XG4gICAgICAgIHRoaXMub1tkZWNvZGVyLmNvbXByZXNzaW9uXSA9IGRlY29kZXI7XG4gICAgfTtcbiAgICByZXR1cm4gVW56aXA7XG59KCkpO1xuZXhwb3J0IHsgVW56aXAgfTtcbnZhciBtdCA9IHR5cGVvZiBxdWV1ZU1pY3JvdGFzayA9PSAnZnVuY3Rpb24nID8gcXVldWVNaWNyb3Rhc2sgOiB0eXBlb2Ygc2V0VGltZW91dCA9PSAnZnVuY3Rpb24nID8gc2V0VGltZW91dCA6IGZ1bmN0aW9uIChmbikgeyBmbigpOyB9O1xuZXhwb3J0IGZ1bmN0aW9uIHVuemlwKGRhdGEsIG9wdHMsIGNiKSB7XG4gICAgaWYgKCFjYilcbiAgICAgICAgY2IgPSBvcHRzLCBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZiBjYiAhPSAnZnVuY3Rpb24nKVxuICAgICAgICBlcnIoNyk7XG4gICAgdmFyIHRlcm0gPSBbXTtcbiAgICB2YXIgdEFsbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZXJtLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgdGVybVtpXSgpO1xuICAgIH07XG4gICAgdmFyIGZpbGVzID0ge307XG4gICAgdmFyIGNiZCA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIG10KGZ1bmN0aW9uICgpIHsgY2IoYSwgYik7IH0pO1xuICAgIH07XG4gICAgbXQoZnVuY3Rpb24gKCkgeyBjYmQgPSBjYjsgfSk7XG4gICAgdmFyIGUgPSBkYXRhLmxlbmd0aCAtIDIyO1xuICAgIGZvciAoOyBiNChkYXRhLCBlKSAhPSAweDYwNTRCNTA7IC0tZSkge1xuICAgICAgICBpZiAoIWUgfHwgZGF0YS5sZW5ndGggLSBlID4gNjU1NTgpIHtcbiAgICAgICAgICAgIGNiZChlcnIoMTMsIDAsIDEpLCBudWxsKTtcbiAgICAgICAgICAgIHJldHVybiB0QWxsO1xuICAgICAgICB9XG4gICAgfVxuICAgIDtcbiAgICB2YXIgbGZ0ID0gYjIoZGF0YSwgZSArIDgpO1xuICAgIGlmIChsZnQpIHtcbiAgICAgICAgdmFyIGMgPSBsZnQ7XG4gICAgICAgIHZhciBvID0gYjQoZGF0YSwgZSArIDE2KTtcbiAgICAgICAgdmFyIHogPSBvID09IDQyOTQ5NjcyOTUgfHwgYyA9PSA2NTUzNTtcbiAgICAgICAgaWYgKHopIHtcbiAgICAgICAgICAgIHZhciB6ZSA9IGI0KGRhdGEsIGUgLSAxMik7XG4gICAgICAgICAgICB6ID0gYjQoZGF0YSwgemUpID09IDB4NjA2NEI1MDtcbiAgICAgICAgICAgIGlmICh6KSB7XG4gICAgICAgICAgICAgICAgYyA9IGxmdCA9IGI0KGRhdGEsIHplICsgMzIpO1xuICAgICAgICAgICAgICAgIG8gPSBiNChkYXRhLCB6ZSArIDQ4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgZmx0ciA9IG9wdHMgJiYgb3B0cy5maWx0ZXI7XG4gICAgICAgIHZhciBfbG9vcF8zID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgIHZhciBfYSA9IHpoKGRhdGEsIG8sIHopLCBjXzEgPSBfYVswXSwgc2MgPSBfYVsxXSwgc3UgPSBfYVsyXSwgZm4gPSBfYVszXSwgbm8gPSBfYVs0XSwgb2ZmID0gX2FbNV0sIGIgPSBzbHpoKGRhdGEsIG9mZik7XG4gICAgICAgICAgICBvID0gbm87XG4gICAgICAgICAgICB2YXIgY2JsID0gZnVuY3Rpb24gKGUsIGQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZSkge1xuICAgICAgICAgICAgICAgICAgICB0QWxsKCk7XG4gICAgICAgICAgICAgICAgICAgIGNiZChlLCBudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkKVxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXNbZm5dID0gZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEtLWxmdClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiZChudWxsLCBmaWxlcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmICghZmx0ciB8fCBmbHRyKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBmbixcbiAgICAgICAgICAgICAgICBzaXplOiBzYyxcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFNpemU6IHN1LFxuICAgICAgICAgICAgICAgIGNvbXByZXNzaW9uOiBjXzFcbiAgICAgICAgICAgIH0pKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFjXzEpXG4gICAgICAgICAgICAgICAgICAgIGNibChudWxsLCBzbGMoZGF0YSwgYiwgYiArIHNjKSk7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY18xID09IDgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZmwgPSBkYXRhLnN1YmFycmF5KGIsIGIgKyBzYyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFN5bmNocm9ub3VzbHkgZGVjb21wcmVzcyB1bmRlciA1MTJLQiwgb3IgYmFyZWx5LWNvbXByZXNzZWQgZGF0YVxuICAgICAgICAgICAgICAgICAgICBpZiAoc3UgPCA1MjQyODggfHwgc2MgPiAwLjggKiBzdSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYmwobnVsbCwgaW5mbGF0ZVN5bmMoaW5mbCwgeyBvdXQ6IG5ldyB1OChzdSkgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYmwoZSwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGVybS5wdXNoKGluZmxhdGUoaW5mbCwgeyBzaXplOiBzdSB9LCBjYmwpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBjYmwoZXJyKDE0LCAndW5rbm93biBjb21wcmVzc2lvbiB0eXBlICcgKyBjXzEsIDEpLCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjYmwobnVsbCwgbnVsbCk7XG4gICAgICAgIH07XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYzsgKytpKSB7XG4gICAgICAgICAgICBfbG9vcF8zKGkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2VcbiAgICAgICAgY2JkKG51bGwsIHt9KTtcbiAgICByZXR1cm4gdEFsbDtcbn1cbi8qKlxuICogU3luY2hyb25vdXNseSBkZWNvbXByZXNzZXMgYSBaSVAgYXJjaGl2ZS4gUHJlZmVyIHVzaW5nIGB1bnppcGAgZm9yIGJldHRlclxuICogcGVyZm9ybWFuY2Ugd2l0aCBtb3JlIHRoYW4gb25lIGZpbGUuXG4gKiBAcGFyYW0gZGF0YSBUaGUgcmF3IGNvbXByZXNzZWQgWklQIGZpbGVcbiAqIEBwYXJhbSBvcHRzIFRoZSBaSVAgZXh0cmFjdGlvbiBvcHRpb25zXG4gKiBAcmV0dXJucyBUaGUgZGVjb21wcmVzc2VkIGZpbGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bnppcFN5bmMoZGF0YSwgb3B0cykge1xuICAgIHZhciBmaWxlcyA9IHt9O1xuICAgIHZhciBlID0gZGF0YS5sZW5ndGggLSAyMjtcbiAgICBmb3IgKDsgYjQoZGF0YSwgZSkgIT0gMHg2MDU0QjUwOyAtLWUpIHtcbiAgICAgICAgaWYgKCFlIHx8IGRhdGEubGVuZ3RoIC0gZSA+IDY1NTU4KVxuICAgICAgICAgICAgZXJyKDEzKTtcbiAgICB9XG4gICAgO1xuICAgIHZhciBjID0gYjIoZGF0YSwgZSArIDgpO1xuICAgIGlmICghYylcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIHZhciBvID0gYjQoZGF0YSwgZSArIDE2KTtcbiAgICB2YXIgeiA9IG8gPT0gNDI5NDk2NzI5NSB8fCBjID09IDY1NTM1O1xuICAgIGlmICh6KSB7XG4gICAgICAgIHZhciB6ZSA9IGI0KGRhdGEsIGUgLSAxMik7XG4gICAgICAgIHogPSBiNChkYXRhLCB6ZSkgPT0gMHg2MDY0QjUwO1xuICAgICAgICBpZiAoeikge1xuICAgICAgICAgICAgYyA9IGI0KGRhdGEsIHplICsgMzIpO1xuICAgICAgICAgICAgbyA9IGI0KGRhdGEsIHplICsgNDgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBmbHRyID0gb3B0cyAmJiBvcHRzLmZpbHRlcjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGM7ICsraSkge1xuICAgICAgICB2YXIgX2EgPSB6aChkYXRhLCBvLCB6KSwgY18yID0gX2FbMF0sIHNjID0gX2FbMV0sIHN1ID0gX2FbMl0sIGZuID0gX2FbM10sIG5vID0gX2FbNF0sIG9mZiA9IF9hWzVdLCBiID0gc2x6aChkYXRhLCBvZmYpO1xuICAgICAgICBvID0gbm87XG4gICAgICAgIGlmICghZmx0ciB8fCBmbHRyKHtcbiAgICAgICAgICAgIG5hbWU6IGZuLFxuICAgICAgICAgICAgc2l6ZTogc2MsXG4gICAgICAgICAgICBvcmlnaW5hbFNpemU6IHN1LFxuICAgICAgICAgICAgY29tcHJlc3Npb246IGNfMlxuICAgICAgICB9KSkge1xuICAgICAgICAgICAgaWYgKCFjXzIpXG4gICAgICAgICAgICAgICAgZmlsZXNbZm5dID0gc2xjKGRhdGEsIGIsIGIgKyBzYyk7XG4gICAgICAgICAgICBlbHNlIGlmIChjXzIgPT0gOClcbiAgICAgICAgICAgICAgICBmaWxlc1tmbl0gPSBpbmZsYXRlU3luYyhkYXRhLnN1YmFycmF5KGIsIGIgKyBzYyksIHsgb3V0OiBuZXcgdTgoc3UpIH0pO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGVycigxNCwgJ3Vua25vd24gY29tcHJlc3Npb24gdHlwZSAnICsgY18yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmlsZXM7XG59XG4iLCAiZXhwb3J0IG5hbWVzcGFjZSBTZXJ2aWNlV29ya2VyIHtcbiAgLy8gTWVzc2FnZXMgc2VuZCB0byB0aGUgc2VydmljZSB3b3JrZXJcbiAgZXhwb3J0IG5hbWVzcGFjZSBPdXRnb2luZyB7XG4gICAgZXhwb3J0IGludGVyZmFjZSBWYWxpZFBhdGhQcmVmaXhlc1BhY2tldCB7XG4gICAgICB0eXBlOiAnVmFsaWRQYXRoUHJlZml4ZXMnO1xuICAgICAgdmFsaWRQYXRoUHJlZml4ZXM6IHN0cmluZ1tdO1xuICAgIH1cblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgRGF0YVBhY2tldCB7XG4gICAgICB0eXBlOiAnRGF0YSc7XG4gICAgICBwYXRoOiBzdHJpbmc7XG4gICAgICBkYXRhOiBCb2R5SW5pdCB8IG51bGw7XG4gICAgfVxuXG4gICAgZXhwb3J0IHR5cGUgUGFja2V0ID0gVmFsaWRQYXRoUHJlZml4ZXNQYWNrZXQgfCBEYXRhUGFja2V0O1xuICB9XG4gIC8vIE1lc3NhZ2VzIGNvbWluZyBmcm9tIHRoZSBzZXJ2aWNlIHdvcmtlclxuICBleHBvcnQgbmFtZXNwYWNlIEluY29taW5nIHtcbiAgICBleHBvcnQgaW50ZXJmYWNlIFBhdGhQYWNrZXQge1xuICAgICAgdHlwZTogJ1BhdGgnO1xuICAgICAgcGF0aDogc3RyaW5nO1xuICAgIH1cbiAgICBleHBvcnQgaW50ZXJmYWNlIFZhbGlkUGF0aFByZWZpeGVzUmVxdWVzdFBhY2tldCB7XG4gICAgICB0eXBlOiAnVmFsaWRQYXRoUHJlZml4ZXNSZXF1ZXN0JztcbiAgICB9XG5cbiAgICBleHBvcnQgdHlwZSBQYWNrZXQgPSBQYXRoUGFja2V0IHwgVmFsaWRQYXRoUHJlZml4ZXNSZXF1ZXN0UGFja2V0O1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIEZldGNoSGFuZGxlciA9IChwYXRoOiBzdHJpbmcpID0+IFByb21pc2U8QXJyYXlCdWZmZXJMaWtlIHwgbnVsbD47XG5cbmxldCBmZXRjaEhhbmRsZXI6IEZldGNoSGFuZGxlciB8IHVuZGVmaW5lZDtcbmxldCB2YWxpZFBhdGhQcmVmaXhlczogc3RyaW5nW10gPSBbXTtcblxuZnVuY3Rpb24gc2VuZFNlcnZpY2VXb3JrZXJNZXNzYWdlKHBhY2tldDogU2VydmljZVdvcmtlci5PdXRnb2luZy5QYWNrZXQpOiB2b2lkIHtcbiAgY29uc3QgeyBjb250cm9sbGVyIH0gPSB3aW5kb3cubmF2aWdhdG9yLnNlcnZpY2VXb3JrZXI7XG4gIGNvbnRyb2xsZXI/LnBvc3RNZXNzYWdlKHBhY2tldCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRGZXRjaEhhbmRsZXIocGF0aFByZWZpeGVzOiBzdHJpbmdbXSwgaGFuZGxlcjogRmV0Y2hIYW5kbGVyKTogdm9pZCB7XG4gIGZldGNoSGFuZGxlciA9IGhhbmRsZXI7XG4gIHZhbGlkUGF0aFByZWZpeGVzID0gcGF0aFByZWZpeGVzLm1hcCgocGF0aCkgPT4gYC8ke3BhdGh9L2ApO1xuICBzZW5kU2VydmljZVdvcmtlck1lc3NhZ2UoeyB0eXBlOiAnVmFsaWRQYXRoUHJlZml4ZXMnLCB2YWxpZFBhdGhQcmVmaXhlcyB9KTtcbn1cblxuZnVuY3Rpb24gc2V0TWVzc2FnZUhhbmRsaW5nKCk6IHZvaWQge1xuICBuYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5vbm1lc3NhZ2UgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBwYWNrZXQ6IFNlcnZpY2VXb3JrZXIuSW5jb21pbmcuUGFja2V0ID0gZXZlbnQuZGF0YTtcbiAgICBsZXQgcmVzcG9uc2VQYWNrZXQ6IFNlcnZpY2VXb3JrZXIuT3V0Z29pbmcuUGFja2V0O1xuXG4gICAgaWYgKHBhY2tldC50eXBlID09PSAnUGF0aCcpIHtcbiAgICAgIGNvbnN0IHsgcGF0aCB9ID0gcGFja2V0O1xuICAgICAgcmVzcG9uc2VQYWNrZXQgPSB7XG4gICAgICAgIHR5cGU6ICdEYXRhJyxcbiAgICAgICAgcGF0aCxcbiAgICAgICAgZGF0YTpcbiAgICAgICAgICAoYXdhaXQgZmV0Y2hIYW5kbGVyPy4ocGF0aCkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYGVycm9yIHdoaWxlIGhhbmRpbmcgZmV0Y2ggb2YgJHtwYXRofTpgLCBlKTtcbiAgICAgICAgICB9KSkgPz8gbnVsbCxcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3BvbnNlUGFja2V0ID0geyB0eXBlOiAnVmFsaWRQYXRoUHJlZml4ZXMnLCB2YWxpZFBhdGhQcmVmaXhlcyB9O1xuICAgIH1cblxuICAgIHNlbmRTZXJ2aWNlV29ya2VyTWVzc2FnZShyZXNwb25zZVBhY2tldCk7XG4gIH07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkU2VydmljZVdvcmtlcigpOiBQcm9taXNlPFNlcnZpY2VXb3JrZXI+IHtcbiAgY29uc3QgY3VycmVudFJlZ2lzdHJhdGlvbiA9IGF3YWl0IHdpbmRvdy5uYXZpZ2F0b3Iuc2VydmljZVdvcmtlci5nZXRSZWdpc3RyYXRpb24oKTtcbiAgaWYgKGN1cnJlbnRSZWdpc3RyYXRpb24pIHtcbiAgICAvL0RvIG5vdCBhd2FpdCB1cGRhdGUgc2luY2UgdGhlIHdvcmtlciBvbmx5IHBlcmZvcm1zIGEgc2ltcGxlIHRhc2suIEV2ZW4gaWYgdGhlcmUgaXMgYSBidWdmaXggaXQgc2hvdWxkIGJlIGVub3VnaCB0byBub3QgY3Jhc2guXG4gICAgdm9pZCBjdXJyZW50UmVnaXN0cmF0aW9uLnVwZGF0ZSgpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IHBhdGggPSAnZGlzdC1jY21vZC1zZXJ2aWNlLXdvcmtlci5qcyc7XG4gICAgYXdhaXQgd2luZG93Lm5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLnJlZ2lzdGVyKHBhdGgsIHtcbiAgICAgIHVwZGF0ZVZpYUNhY2hlOiAnbm9uZScsXG4gICAgfSk7XG4gIH1cblxuICBjb25zdCB7IGNvbnRyb2xsZXIgfSA9IHdpbmRvdy5uYXZpZ2F0b3Iuc2VydmljZVdvcmtlcjtcbiAgaWYgKCFjb250cm9sbGVyIHx8IGNvbnRyb2xsZXIuc3RhdGUgIT09ICdhY3RpdmF0ZWQnKSB7XG4gICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gd2luZG93LmxvY2F0aW9uLnRvU3RyaW5nKCk7XG4gICAgaGlzdG9yeS5nbygwKTtcblxuICAgIHRocm93IG5ldyBFcnJvcignKFx1MjU2Rlx1MDBCMFx1MjVBMVx1MDBCMFx1RkYwOVx1MjU2Rlx1RkUzNSBcdTI1M0JcdTI1MDFcdTI1M0InKTtcbiAgfVxuXG4gIHNldE1lc3NhZ2VIYW5kbGluZygpO1xuICBzZW5kU2VydmljZVdvcmtlck1lc3NhZ2UoeyB0eXBlOiAnVmFsaWRQYXRoUHJlZml4ZXMnLCB2YWxpZFBhdGhQcmVmaXhlcyB9KTtcblxuICByZXR1cm4gY29udHJvbGxlcjtcbn1cbiIsICJpbXBvcnQgeyB0eXBlIFVuemlwcGVkLCB1bnppcFN5bmMgfSBmcm9tICdmZmxhdGUvYnJvd3Nlcic7XG5pbXBvcnQgeyBzZXRGZXRjaEhhbmRsZXIgfSBmcm9tICcuL3NlcnZpY2Utd29ya2VyLWJyaWRnZSc7XG5pbXBvcnQgKiBhcyBmaWxlcyBmcm9tICcuL2ZpbGVzJztcblxuY29uc3QgZmlsZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBVbnppcHBlZD4oKTtcblxuZnVuY3Rpb24gZmluZFByZWZpeChwYXRoOiBzdHJpbmcpOiBbc3RyaW5nLCBzdHJpbmddIHwgbnVsbCB7XG4gIGlmIChwYXRoLnN0YXJ0c1dpdGgoJy8nKSkgcGF0aCA9IHBhdGguc3Vic3RyaW5nKDEpO1xuICBjb25zdCBwcmVmaXggPSBbLi4uZmlsZU1hcC5rZXlzKCldLmZpbmQoKGRpcikgPT4gcGF0aC5zdGFydHNXaXRoKGRpcikpO1xuXG4gIGlmICghcHJlZml4KSByZXR1cm4gbnVsbDtcblxuICBwYXRoID0gcGF0aC5zdWJzdHJpbmcocHJlZml4Lmxlbmd0aCArIDEpO1xuICByZXR1cm4gW3BhdGgsIHByZWZpeF07XG59XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvcmVxdWlyZS1hd2FpdFxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzUmVhZGFibGUocGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHJldHVybiBCb29sZWFuKGZpbmRQcmVmaXgocGF0aCkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZFRleHQocGF0aDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG4gIGNvbnN0IGJ1ZiA9IGF3YWl0IHJlYWRGaWxlKHBhdGgpO1xuICBpZiAoIWJ1ZikgcmV0dXJuIG51bGw7XG5cbiAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigndXRmLTgnKS5kZWNvZGUoYnVmKTtcbn1cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9yZXF1aXJlLWF3YWl0XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZEZpbGUocGF0aDogc3RyaW5nKTogUHJvbWlzZTxBcnJheUJ1ZmZlciB8IG51bGw+IHtcbiAgY29uc3QgcHJlZml4T2JqID0gZmluZFByZWZpeChwYXRoKTtcbiAgaWYgKCFwcmVmaXhPYmopIHJldHVybiBudWxsO1xuICBjb25zdCBbcmVsYXRpdmVQYXRoLCBwcmVmaXhdID0gcHJlZml4T2JqO1xuXG4gIGNvbnN0IHVuemlwcGVkID0gZmlsZU1hcC5nZXQocHJlZml4KSE7XG5cbiAgY29uc3QgZGF0YSA9IHVuemlwcGVkW3JlbGF0aXZlUGF0aF07XG5cbiAgcmV0dXJuIGRhdGEuYnVmZmVyO1xufVxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3JlcXVpcmUtYXdhaXRcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaW5kUmVjdXJzaXZlbHkoZGlyOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZ1tdIHwgbnVsbD4ge1xuICBjb25zdCBwcmVmaXhPYmogPSBmaW5kUHJlZml4KGRpcik7XG4gIGlmICghcHJlZml4T2JqKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgW3JlbGF0aXZlUGF0aCwgcHJlZml4XSA9IHByZWZpeE9iajtcblxuICBjb25zdCB1bnppcHBlZCA9IGZpbGVNYXAuZ2V0KHByZWZpeCkhO1xuXG4gIGNvbnN0IGRpcnMgPSBPYmplY3Qua2V5cyh1bnppcHBlZClcbiAgICAuZmlsdGVyKChwYXRoKSA9PiAhcGF0aC5lbmRzV2l0aCgnLycpICYmIHBhdGguc3RhcnRzV2l0aChyZWxhdGl2ZVBhdGgpKVxuICAgIC5tYXAoKGRpcikgPT4gZGlyLnN1YnN0cmluZyhyZWxhdGl2ZVBhdGgubGVuZ3RoKSk7XG5cbiAgcmV0dXJuIGRpcnM7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkQ0NNb2RzKGNjbW9kczogc3RyaW5nW10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgY2Ntb2RBcnJheUJ1ZmZlcnMgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICBjY21vZHMubWFwKGFzeW5jIChtb2REaXIpID0+IHtcbiAgICAgIGNvbnN0IHVybCA9IGAuLyR7bW9kRGlyfWA7XG4gICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgZmlsZXMucmVhZEZpbGUodXJsKSk7XG4gICAgfSksXG4gICk7XG5cbiAgLy8gZnJvbSBteSBsaW1pdGVkIHRlc3RpbmcgdW56aXBTeW5jIGlzIGFib3V0IDUwbXMgZmFzdGVyICh1bnppcFN5bmMgdGFrZXMgMTUwbXMpXG4gIC8vIGNvbXBhcmVkIHRvIGFzeW5jaHJvbm91cyB1bnppcCBcdTAwQUZcXF8oXHUzMEM0KV8vXHUwMEFGXG4gIC8vIGNvbnNvbGUudGltZSgndW5jb21wcmVzcycpO1xuICBjb25zdCB1bmNvbXByZXNzZWQgPSBjY21vZEFycmF5QnVmZmVycy5tYXAoKGJ1ZikgPT4gdW56aXBTeW5jKGJ1ZikpO1xuICAvLyBjb25zb2xlLnRpbWVFbmQoJ3VuY29tcHJlc3MnKTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNjbW9kcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IG1vZERpciA9IGNjbW9kc1tpXTtcbiAgICBjb25zdCBidWYgPSB1bmNvbXByZXNzZWRbaV07XG4gICAgZmlsZU1hcC5zZXQobW9kRGlyLCBidWYpO1xuICB9XG5cbiAgc2V0RmV0Y2hIYW5kbGVyKGNjbW9kcywgcmVhZEZpbGUpO1xufVxuIiwgImltcG9ydCAqIGFzIGZpbGVzRGVza3RvcCBmcm9tICcuL2ZpbGVzLmRlc2t0b3AnO1xuaW1wb3J0ICogYXMgZmlsZXNCcm93c2VyIGZyb20gJy4vZmlsZXMuYnJvd3Nlcic7XG5pbXBvcnQgKiBhcyBmaWxlc0FuZHJvaWQgZnJvbSAnLi9maWxlcy5hbmRyb2lkJztcbmltcG9ydCAqIGFzIGZpbGVzQ0NNb2QgZnJvbSAnLi9maWxlcy5jY21vZCc7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tICdAY2Nsb2FkZXIzL2NvbW1vbi91dGlscyc7XG5cbmNvbnN0IG1vZHVsZXMgPSB7XG4gIFt1dGlscy5QbGF0Zm9ybVR5cGUuREVTS1RPUF06IGZpbGVzRGVza3RvcCxcbiAgW3V0aWxzLlBsYXRmb3JtVHlwZS5BTkRST0lEXTogZmlsZXNBbmRyb2lkLFxuICBbdXRpbHMuUGxhdGZvcm1UeXBlLkJST1dTRVJdOiBmaWxlc0Jyb3dzZXIsXG59O1xuY29uc3QgY3VycmVudE1vZHVsZSA9IG1vZHVsZXNbdXRpbHMuUExBVEZPUk1fVFlQRV07XG5cbmV4cG9ydCBjb25zdCB7IGdldE1vZFBhdGhzSW4sIGdldEluc3RhbGxlZEV4dGVuc2lvbnMgfSA9IGN1cnJlbnRNb2R1bGU7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpc1JlYWRhYmxlKHBhdGg6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICByZXR1cm4gKGF3YWl0IGZpbGVzQ0NNb2QuaXNSZWFkYWJsZShwYXRoKSkgfHwgY3VycmVudE1vZHVsZS5pc1JlYWRhYmxlKHBhdGgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVhZEZpbGUocGF0aDogc3RyaW5nKTogUHJvbWlzZTxBcnJheUJ1ZmZlcj4ge1xuICByZXR1cm4gKGF3YWl0IGZpbGVzQ0NNb2QucmVhZEZpbGUocGF0aCkpIHx8IGN1cnJlbnRNb2R1bGUucmVhZEZpbGUocGF0aCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkVGV4dChwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gKGF3YWl0IGZpbGVzQ0NNb2QubG9hZFRleHQocGF0aCkpIHx8IGN1cnJlbnRNb2R1bGUubG9hZFRleHQocGF0aCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaW5kUmVjdXJzaXZlbHkoZGlyOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZ1tdIHwgbnVsbD4ge1xuICByZXR1cm4gKFxuICAgIChhd2FpdCBmaWxlc0NDTW9kLmZpbmRSZWN1cnNpdmVseShkaXIpKSB8fFxuICAgICgnZmluZFJlY3Vyc2l2ZWx5JyBpbiBjdXJyZW50TW9kdWxlID8gY3VycmVudE1vZHVsZS5maW5kUmVjdXJzaXZlbHkoZGlyKSA6IG51bGwpXG4gICk7XG59XG4iLCAiaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnQGNjbG9hZGVyMy9jb21tb24vdXRpbHMnO1xuaW1wb3J0IHNlbXZlciBmcm9tICdAY2Nsb2FkZXIzL2NvbW1vbi92ZW5kb3ItbGlicy9zZW12ZXInO1xuaW1wb3J0ICogYXMgZmlsZXMgZnJvbSAnLi9maWxlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29uZmlnIHtcbiAgZ2FtZUFzc2V0c0Rpcjogc3RyaW5nO1xuICBtb2RzRGlyczogc3RyaW5nW107XG4gIHN0eWxlc2hlZXRVUkxzOiBzdHJpbmdbXTtcbiAgc2NyaXB0VVJMczogc3RyaW5nW107XG4gIGdhbWVTY3JpcHRVUkw6IHN0cmluZztcbiAgLy8gVE9ETyhsZXhpc290aGVyKTogRE9DVU1FTlQhISFcbiAgaW1wYWN0Q29uZmlnOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgb25HYW1lRE9NQ3JlYXRlZDogKCkgPT4gdXRpbHMuTWF5YmVQcm9taXNlPHZvaWQ+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbmZpZ01vZHVsZSB7XG4gIGRlZmF1bHQ6IChjb25maWc6IENvbmZpZywgY29udGV4dDogQ29uZmlnTW9kdWxlQ29udGV4dCkgPT4gdXRpbHMuTWF5YmVQcm9taXNlPHZvaWQ+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbmZpZ01vZHVsZUNvbnRleHQge1xuICBtb2Rsb2FkZXJWZXJzaW9uOiBzZW12ZXIuU2VtVmVyO1xufVxuXG5jb25zdCBDT05GSUdfU0NSSVBUX05BTUUgPSBgY2Nsb2FkZXItdXNlci1jb25maWcuanNgO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZChtb2Rsb2FkZXJWZXJzaW9uOiBzZW12ZXIuU2VtVmVyKTogUHJvbWlzZTxDb25maWc+IHtcbiAgbGV0IGNvbmZpZyA9IGNyZWF0ZURlZmF1bHRDb25maWcoKTtcbiAgbGV0IGN0eDogQ29uZmlnTW9kdWxlQ29udGV4dCA9IHsgbW9kbG9hZGVyVmVyc2lvbiB9O1xuXG4gIGxldCBjb25maWdTY3JpcHRQYXRoID0gQ09ORklHX1NDUklQVF9OQU1FO1xuXG4gIC8vIHRoZXJlIGlzIG5vIHdheSB0byBjaGVjayBpZiBhbiBlcnJvciB0aHJvd24gYnkgYGltcG9ydCgpYCB3YXMgYSBuZXR3b3JrXG4gIC8vIGVycm9yIChzdWNoIGFzIHRoZSA0MDQgc3RhdHVzIGNvZGUpIGFuZCBlcnJvciBtZXNzYWdlcyB0aHJvd24gYnkgaXRcbiAgLy8gYXJlbid0IHN0YW5kYXJkaXplZCwgc28gd2UgaGF2ZSB0byBjaGVjayBiZWZvcmVoYW5kIGlmIHRoZSBjb25maWcgbW9kdWxlXG4gIC8vIGV4aXN0cyBvciBub3RcbiAgaWYgKGF3YWl0IGZpbGVzLmlzUmVhZGFibGUoY29uZmlnU2NyaXB0UGF0aCkpIHtcbiAgICB0cnkge1xuICAgICAgbGV0IGNvbmZpZ01vZHVsZTogQ29uZmlnTW9kdWxlID0gYXdhaXQgaW1wb3J0KHV0aWxzLmN3ZEZpbGVQYXRoVG9VUkwoY29uZmlnU2NyaXB0UGF0aCkuaHJlZik7XG4gICAgICBhd2FpdCBjb25maWdNb2R1bGUuZGVmYXVsdChjb25maWcsIGN0eCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBpZiAodXRpbHMuZXJyb3JIYXNNZXNzYWdlKGVycikpIHtcbiAgICAgICAgZXJyLm1lc3NhZ2UgPSBgRXJyb3Igd2hpbGUgbG9hZGluZyAnJHtjb25maWdTY3JpcHRQYXRofSc6ICR7ZXJyLm1lc3NhZ2V9YDtcbiAgICAgIH1cbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gICAgY29uc29sZS5sb2coJ2xvYWRlZCB0aGUgdXNlciBjb25maWd1cmF0aW9uJyk7XG4gIH1cblxuICByZXR1cm4gY29uZmlnO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVEZWZhdWx0Q29uZmlnKCk6IENvbmZpZyB7XG4gIGxldCBnYW1lQXNzZXRzRGlyID0gdXRpbHMuUExBVEZPUk1fVFlQRSA9PT0gdXRpbHMuUGxhdGZvcm1UeXBlLkFORFJPSUQgPyAnLycgOiAnYXNzZXRzLyc7XG5cbiAgcmV0dXJuIHtcbiAgICBnYW1lQXNzZXRzRGlyLFxuICAgIG1vZHNEaXJzOiBbYCR7Z2FtZUFzc2V0c0Rpcn1tb2RzL2BdLFxuXG4gICAgLy8gbm8gc3R5bGVzaGVldHMgaGF2ZSBiZWVuIHJlbW92ZWRcbiAgICBzdHlsZXNoZWV0VVJMczogW1xuICAgICAgLy8gU2VlIG5vdGUgYWJvdXQgalF1ZXJ5IFVJIGJlbG93XG4gICAgICAnaW1wYWN0L3BhZ2UvY3NzL3VpLWRhcmtuZXNzL2pxdWVyeS11aS0xLjEwLjIuY3VzdG9tLm1pbi5jc3MnLFxuICAgICAgLy8gVGhlIGNvcmUgc3R5bGVzaGVldFxuICAgICAgJ2ltcGFjdC9wYWdlL2Nzcy9zdHlsZS5jc3MnLFxuICAgICAgLy8gRGVmaW5lcyBjdXJzb3IgaW1hZ2VzIGFuZCBzdHlsZXMgdXNlZCBieSBgZ2FtZS9wYWdlL2dhbWUtYmFzZS5qc2BcbiAgICAgICdnYW1lL3BhZ2UvZ2FtZS1iYXNlLmNzcycsXG4gICAgXSxcblxuICAgIC8vIG5vIHNjcmlwdHMgaGF2ZSBiZWVuIHJlbW92ZWRcbiAgICBzY3JpcHRVUkxzOiBbXG4gICAgICAvLyBVc2VkIGZvciBlbmNyeXB0aW5nL2RlY3J5cHRpbmcgc2F2ZSBzbG90cyBhbmQgc2V0dGluZ3MvZ2xvYmFscyBkYXRhXG4gICAgICAnaW1wYWN0L3BhZ2UvanMvYWVzLmpzJyxcbiAgICAgIC8vIEFkZHMgc2VlZGVkIFJORywgZXhhY3QgdmVyc2lvbiBvZiB0aGUgbGlicmFyeSBpcyB1bmtub3duLiBBcHBlYXJzIHRvIGJlXG4gICAgICAvLyB1c2VkIG9ubHkgZm9yIGdlbmVyYXRpbmcgcmFuZG9tIG5hbWVzIGZvciBydW5uZXIgTlBDcy5cbiAgICAgICdpbXBhY3QvcGFnZS9qcy9zZWVkcmFuZG9tLmpzJyxcbiAgICAgIC8vIFllcy4gQ3Jvc3NDb2RlIGFic29sdXRlbHkgY2FuJ3QgZnVuY3Rpb24gd2l0aG91dCBqUXVlcnlcbiAgICAgICdpbXBhY3QvcGFnZS9qcy9qcXVlcnktMS4xMS4xLm1pbi5qcycsXG4gICAgICAvLyBJdCBpcyB1bmtub3duIHdoZXRoZXIgalF1ZXJ5IFVJIGlzIHJlcXVpcmVkLCBhbiBhdWRpdCBvZiBnYW1lIGNvZGUgaXNcbiAgICAgIC8vIG5lY2Vzc2FyeS4gUG9zc2libHkgaXQgaXMgdXNlZCBieSBSRkcncyBpbnRlcm5hbCBicm93c2VyLWJhc2VkIGVkaXRvcnMuXG4gICAgICAnaW1wYWN0L3BhZ2UvanMvanF1ZXJ5LXVpLTEuMTAuMi5jdXN0b20ubWluLmpzJyxcbiAgICAgIC8vIEltcGxlbWVudHMgdGhlIGZvbGxvd2luZyBmdW5jdGlvbnM6XG4gICAgICAvLyAxLiBgU0hPV19HQU1FQ09ERWBcbiAgICAgIC8vICAgIHNob3dzIGEgZGlhbG9nIGZvciBlbnRlcmluZyBib251cyBjb2Rlc1xuICAgICAgLy8gMi4gYFNIT1dfVFdJVFRFUmBcbiAgICAgIC8vICAgIHNob3dzIGEgcG9wdXAgd2l0aCBsaW5rcyB0byBkZXZlbG9wZXJzJyB0d2l0dGVyIGFjY291bnRzXG4gICAgICAvLyAzLiBgU0hPV19TQ1JFRU5TSE9UYFxuICAgICAgLy8gICAgc2hvd3MgYSBwb3B1cCB3aGljaCBjb250YWlucyBhIHNjcmVlbnNob3Qgd2hlbiB5b3UgcHJlc3MgRjggaW4gdGhlXG4gICAgICAvLyAgICBicm93c2VyXG4gICAgICAvLyA0LiBgU0hPV19JTkRJRUdPR09gXG4gICAgICAvLyAgICBzaG93cyBwb3B1cCB3aXRoIGEgbGluayB0byB0aGUgSW5kaWVnb2dvIGNhbXBhaWduLCB1bnVzZWQgc2luY2UgYXRcbiAgICAgIC8vICAgIGxlYXN0IDIwMTZcbiAgICAgIC8vIDUuIGBHQU1FX0VSUk9SX0NBTExCQUNLYFxuICAgICAgLy8gICAgc2hvd3MgdGhlIFwiQ1JJVElDQUwgQlVHIVwiIHBvcHVwXG4gICAgICAvLyA2LiBgU0hPV19TQVZFX0RJQUxPR2BcbiAgICAgIC8vICAgIHNob3dzIGEgZGlhbG9nIGZvciBpbXBvcnRpbmcvZXhwb3J0aW5nIHNhdmUgc2xvdHMgd2hlbiB5b3UgcHJlc3MgRjEwXG4gICAgICAvLyBUbyBiZSBob25lc3QsIEkgaGF2ZSBubyBpZGVhIHdoeSB0aGVzZSBhcmVuJ3QgaW1wbGVtZW50ZWQgaW5cbiAgICAgIC8vIGBqcy9nYW1lLmNvbXBpbGVkLmpzYCwgc28gdGhpcyBzY3JpcHQgaXMgcmVxdWlyZWQuXG4gICAgICAnZ2FtZS9wYWdlL2dhbWUtYmFzZS5qcycsXG4gICAgICAvLyBUaGUgbW9zdCB1c2VsZXNzIHNjcmlwdCBpbiB0aGUgZW50aXJlIENyb3NzQ29kZSBhbmQgeWV0IGl0IGlzIHN0aWxsXG4gICAgICAvLyByZXF1aXJlZC4gSXQgZG9lcyB0aGUgZm9sbG93aW5nIHRoaW5nczpcbiAgICAgIC8vICAxLiBGaWxscyB0aGUgYGRpdiNvcHRpb25zLm9wdGlvbkxpc3RgIGVsZW1lbnQgd2l0aCBhIGJ1bmNoIG9mIHNsaWRlcnNcbiAgICAgIC8vICAgICAgYW5kIGJ1dHRvbnMuIFRoaXMgaXMgbm90IHJlcXVpcmVkIGFueW1vcmUgc2luY2UgdGhlIGdhbWUgZG9lc24ndFxuICAgICAgLy8gICAgICB1c2UgRE9NIGZvciBHVUkgYW5kIHRoZSBvcHRpb25zIG1lbnUgaXMgYWxyZWFkeSBpbXBsZW1lbnRlZCwgc2VlXG4gICAgICAvLyAgICAgYHNjLk9wdGlvbnNNZW51YCBhbmQgb3RoZXJzLiBJbiBmYWN0IHRoaXMgaXMgc28gdXNlbGVzcyB0aGF0IHRoZVxuICAgICAgLy8gICAgIGdhbWUgaGlkZXMgdGhpcyBvcHRpb24gbGlzdCBieSBhZGRpbmcgYSBgZGlzcGxheTogbm9uZWAgcnVsZSBpbiB0aGVcbiAgICAgIC8vICAgICBpbmxpbmUgc3R5bGVzLlxuICAgICAgLy8gIDIuIENyZWF0ZXMgYSBnbG9iYWwgYEJyb3dzZXJEZXRlY3RgIG9iamVjdCB3aGljaCBjb250YWlucywgb2J2aW91c2x5LFxuICAgICAgLy8gICAgIGJyb3dzZXIgZGV0ZWN0aW9uIGZ1bmN0aW9ucy4gVGhpcyBcImxpYnJhcnlcIiBpcyB1bnVzZWQgc2luY2UgSW1wYWN0XG4gICAgICAvLyAgICAgYWxyZWFkeSBjb250YWlucyBicm93c2VyIGRldGVjdGlvbiBmdW5jdGlvbmFsaXR5LlxuICAgICAgLy8gIDMuIExvYWRzIHNvbWUgb3B0aW9ucyAocGl4ZWwgc2l6ZSwgc2NhbGluZyBtb2RlLCBtdXNpYyBhbmQgc291bmRcbiAgICAgIC8vICAgICB2b2x1bWUpIGZyb20gYGxvY2FsU3RvcmFnZWAgd2hpY2ggYXJlIHNhdmVkIHNvbWV3aGVyZSBpblxuICAgICAgLy8gICAgIG9wdGlvbnMtcmVsYXRlZCBnYW1lIGNvZGUuIFRoaXMgaXMgbmVlZGVkIHNvIHRoYXQgd2hlbiB1c2VycyBjaGFuZ2VcbiAgICAgIC8vICAgICBkaXNwbGF5LXJlbGF0ZWQgb3B0aW9ucyB0aGVpciB2YWx1ZXMgYXJlIHVzZWQgZHVyaW5nIHZlcnkgZWFybHlcbiAgICAgIC8vICAgICBnYW1lIHdpbmRvdyBpbml0aWFsaXphdGlvbi5cbiAgICAgIC8vICA0LiBVcGRhdGVzIGNhbnZhcyBzaXplIG9uIHN0YXJ0IGFuZCB3aGVuIHRoZSB3aW5kb3cgaXMgcmVzaXplZC5cbiAgICAgIC8vIFRoaXMgc2NyaXB0IGNhbid0IGJlIGRpc2FibGVkIGV4YWN0bHkgYmVjYXVzZSBvZiB0aGUgbGFzdCB0d28gcG9pbnRzLlxuICAgICAgLy8gVE9ETzogaGF2aW5nIHRob3VnaHQgYWJvdXQgaXQsIHdlIG1pZ2h0IGFzIHdlbGwgcmVpbXBsZW1lbnQgcmVxdWlyZWRcbiAgICAgIC8vIHBhcnRzIG9mIGl0cyBmdW5jdGlvbmFsaXR5IG91cnNlbHZlcy5cbiAgICAgICdpbXBhY3QvcGFnZS9qcy9vcHRpb25zLmpzJyxcbiAgICBdLFxuXG4gICAgZ2FtZVNjcmlwdFVSTDogJ2pzL2dhbWUuY29tcGlsZWQuanMnLFxuXG4gICAgLy8gR2VuZXJhbCAoQ3ViaWMpIEltcGFjdCBjb25maWd1cmF0aW9uIGNvbnN0YW50cy4gSW50ZXJlc3RpbmcgZmFjdDogdGhlXG4gICAgLy8gb25seSB0d28gZGlmZmVyZW5jZXMgYmV0d2VlbiB0aGUgY29uZmlnIGZyb20gdjAuMS4wIGFuZCB2MS4yLjAtNSBpcyB0aGVcbiAgICAvLyByZW1vdmFsIG9mIGBJR19MQU5HYCBhbmQgdGhlIGFkZGl0aW9uIG9mIGBJR19HQU1FX0JFVEFgIHdoaWNoIGhhcyBiZWVuXG4gICAgLy8gdHVybmVkIG9uIGluIHRoZSBwcmUtMS4wIHZlcnNpb25zIChhdCBsZWFzdCBpbiB2MC43LjApLlxuICAgIC8vIFRPRE86IGFkZCBkZXNjcmlwdGlvbnMgb2YgZWFjaCBjb25zdGFudFxuICAgIGltcGFjdENvbmZpZzoge1xuICAgICAgSUdfR0FNRV9TQ0FMRTogMixcbiAgICAgIElHX0dBTUVfQ0FDSEU6IDAsXG4gICAgICBJR19ST09UOiAnJyxcbiAgICAgIElHX1dJRFRIOiA1NjgsXG4gICAgICBJR19IRUlHSFQ6IDMyMCxcbiAgICAgIElHX0hJREVfREVCVUc6IGZhbHNlLFxuICAgICAgSUdfU0NSRUVOX01PREVfT1ZFUlJJREU6IDIsXG4gICAgICBJR19XRUJfQVVESU9fQkdNOiBmYWxzZSxcbiAgICAgIElHX0ZPUkNFX0hUTUw1X0FVRElPOiBmYWxzZSxcbiAgICAgIExPQURfTEVWRUxfT05fR0FNRV9TVEFSVDogbnVsbCxcbiAgICAgIElHX0dBTUVfREVCVUc6IGZhbHNlLFxuICAgICAgSUdfR0FNRV9CRVRBOiBmYWxzZSxcbiAgICB9LFxuXG4gICAgb25HYW1lRE9NQ3JlYXRlZDogKCkgPT4ge30sXG4gIH07XG59XG4iLCAiaW1wb3J0IHtcbiAgRmlsZVBhdGgsXG4gIExlZ2FjeU1hbmlmZXN0LFxuICBMb2NhbGUsXG4gIExvY2FsaXplZFN0cmluZyxcbiAgTWFuaWZlc3QsXG4gIE1vZERlcGVuZGVuY2llcyxcbiAgTW9kRGVwZW5kZW5jeSxcbiAgTW9kRGVwZW5kZW5jeURldGFpbHMsXG4gIE1vZEljb25zLFxuICBQZXJzb24sXG4gIFBlcnNvbkRldGFpbHMsXG59IGZyb20gJ3VsdGltYXRlLWNyb3NzY29kZS10eXBlZGVmcy9maWxlLXR5cGVzL21vZC1tYW5pZmVzdCc7XG5cbmVudW0gVHlwZSB7XG4gIHN0cmluZyA9ICdzdHJpbmcnLFxuICBudW1iZXIgPSAnbnVtYmVyJyxcbiAgYm9vbGVhbiA9ICdib29sZWFuJyxcbiAgYXJyYXkgPSAnYXJyYXknLFxuICBvYmplY3QgPSAnb2JqZWN0JyxcbiAgbnVsbCA9ICdudWxsJyxcbiAgdW5rbm93biA9ICd1bmtub3duJyxcbn1cblxudHlwZSBUeXBlQXNzZXJ0aW9uUmVzdWx0ID1cbiAgfCB7IHN0YXR1czogJ29rJzsgdHlwZTogVHlwZSB9XG4gIHwgeyBzdGF0dXM6ICdvcHRpb25hbCcgfVxuICB8IHsgc3RhdHVzOiAnZmFpbGVkJyB9O1xuXG5mdW5jdGlvbiBnZXRUeXBlKHZhbHVlOiB1bmtub3duKTogVHlwZSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBlcWVxZXFcbiAgaWYgKHZhbHVlID09PSBudWxsKSByZXR1cm4gVHlwZS5udWxsO1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykgcmV0dXJuIFR5cGUuc3RyaW5nO1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykgcmV0dXJuIFR5cGUubnVtYmVyO1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHJldHVybiBUeXBlLmJvb2xlYW47XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkgcmV0dXJuIFR5cGUuYXJyYXk7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSByZXR1cm4gVHlwZS5vYmplY3Q7XG4gIHJldHVybiBUeXBlLnVua25vd247XG59XG5cbi8vIFRPRE86IGludmVzdGlnYXRlIHByb3RvdHlwZSBjaGFpbiBidWdzIHdoZW4gZXh0ZW5kaW5nIGBFcnJvcmAgaGVyZVxuZXhwb3J0IGNsYXNzIE1hbmlmZXN0VmFsaWRhdGlvbkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBwdWJsaWMgY29uc3RydWN0b3IocHVibGljIHByb2JsZW1zOiBzdHJpbmdbXSkge1xuICAgIHN1cGVyKGBcXG4ke3Byb2JsZW1zLm1hcCgocCkgPT4gYC0gJHtwfWApLmpvaW4oJ1xcbicpfWApO1xuICAgIHRoaXMubmFtZSA9IG5ldy50YXJnZXQubmFtZTtcbiAgfVxufVxuXG4vLyB0aGVzZSBwYXRocyBzZWVtIGxpa2UgYSB2YWxpZCB1c2UtY2FzZSBmb3IgbGlua2VkIGxpc3RzLiBkb24ndCBrbm93IHdoZXRoZXJcbi8vIHRoaXMgaXMgYSByZWFsIG9wdGltaXphdGlvbiBpbiBvdXIgY2FzZSwgYnV0IEkgc3VwcG9zZSB5b3UgY2FuIHRyeSB0b1xuLy8gaW1wbGVtZW50IHRoYXRcbnR5cGUgSnNvblBhdGggPSBBcnJheTxzdHJpbmcgfCBudW1iZXI+O1xuXG5mdW5jdGlvbiBqc29uUGF0aFRvU3RyaW5nKHBhdGg6IEpzb25QYXRoKTogc3RyaW5nIHtcbiAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSByZXR1cm4gJzxkb2N1bWVudD4nO1xuXG4gIGxldCBzdHIgPSAnJztcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQga2V5ID0gcGF0aFtpXTtcbiAgICBpZiAodHlwZW9mIGtleSA9PT0gJ251bWJlcicpIHtcbiAgICAgIHN0ciArPSBgWyR7a2V5fV1gO1xuICAgIH0gZWxzZSBpZiAoL15bYS16QS1aXyRdW2EtekEtWjAtOV8kXSokLy50ZXN0KGtleSkpIHtcbiAgICAgIGlmIChpID4gMCkgc3RyICs9ICcuJztcbiAgICAgIHN0ciArPSBrZXk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSBgWyR7SlNPTi5zdHJpbmdpZnkoa2V5KX1dYDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc3RyO1xufVxuXG4vKiBzZWUgaHR0cHM6Ly9naXRodWIuY29tL0NDRGlyZWN0TGluay9DQ0xvYWRlcjMvaXNzdWVzLzE4IGZvciBkZXRhaWxzICovXG5jb25zdCBjY21vZElkVmFsaWRhdGlvbkV4Y2VwdGlvbnM6IHN0cmluZ1tdID0gW1xuICAnQ3Jvc3NDb2RlIE1hcCBFZGl0b3InLFxuICBcIkF6dXJlJ3MgQWRqdXN0bWVudHNcIixcbiAgJ0Jva2kgQ29sb3JzJyxcbiAgJ0NDTG9hZGVyIGRpc3BsYXkgdmVyc2lvbicsXG4gICdDcm9zc0NvZGUgQyBFZGl0aW9uJyxcbiAgJ05ldyBnYW1lKysnLFxuXTtcblxuLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWZpbmVkICovXG5cbmV4cG9ydCBjbGFzcyBWYWxpZGF0b3Ige1xuICBwcml2YXRlIHByb2JsZW1zOiBzdHJpbmdbXSA9IFtdO1xuXG4gIHB1YmxpYyB2YWxpZGF0ZShkYXRhOiBNYW5pZmVzdCk6IHZvaWQge1xuICAgIHRoaXMucHJvYmxlbXMgPSBbXTtcblxuICAgIGlmICh0aGlzLmFzc2VydFR5cGUoW10sIGRhdGEsIFtUeXBlLm9iamVjdF0pLnN0YXR1cyA9PT0gJ29rJykge1xuICAgICAgaWYgKHRoaXMuYXNzZXJ0VHlwZShbJ2lkJ10sIGRhdGEuaWQsIFtUeXBlLnN0cmluZ10pLnN0YXR1cyA9PT0gJ29rJykge1xuICAgICAgICBpZiAoIS9eW2EtekEtWjAtOV8tXSskLy50ZXN0KGRhdGEuaWQpICYmICFjY21vZElkVmFsaWRhdGlvbkV4Y2VwdGlvbnMuaW5jbHVkZXMoZGF0YS5pZCkpIHtcbiAgICAgICAgICB0aGlzLnByb2JsZW1zLnB1c2goXG4gICAgICAgICAgICAnaWQgbXVzdCBjb25zaXN0IG9ubHkgb2Ygb25lIG9yIG1vcmUgYWxwaGFudW1iZXJpYyBjaGFyYWN0ZXJzLCBoeXBoZW5zIG9yIHVuZGVyc2NvcmVzJyxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXNzZXJ0VHlwZShbJ3ZlcnNpb24nXSwgZGF0YS52ZXJzaW9uLCBbVHlwZS5zdHJpbmddLCB0cnVlKTtcblxuICAgICAgdGhpcy5hc3NlcnRMb2NhbGl6ZWRTdHJpbmcoWyd0aXRsZSddLCBkYXRhLnRpdGxlLCB0cnVlKTtcbiAgICAgIHRoaXMuYXNzZXJ0TG9jYWxpemVkU3RyaW5nKFsnZGVzY3JpcHRpb24nXSwgZGF0YS5kZXNjcmlwdGlvbiwgdHJ1ZSk7XG4gICAgICB0aGlzLmFzc2VydFR5cGUoWydsaWNlbnNlJ10sIGRhdGEubGljZW5zZSwgW1R5cGUuc3RyaW5nXSwgdHJ1ZSk7XG4gICAgICB0aGlzLmFzc2VydExvY2FsaXplZFN0cmluZyhbJ2hvbWVwYWdlJ10sIGRhdGEuaG9tZXBhZ2UsIHRydWUpO1xuICAgICAgdGhpcy5hc3NlcnRLZXl3b3JkcyhbJ3RhZ3MnXSwgZGF0YS50YWdzKTtcbiAgICAgIHRoaXMuYXNzZXJ0TW9kSWNvbnMoWydpY29ucyddLCBkYXRhLmljb25zKTtcblxuICAgICAgdGhpcy5hc3NlcnRQZW9wbGUoWydhdXRob3JzJ10sIGRhdGEuYXV0aG9ycyk7XG5cbiAgICAgIHRoaXMuYXNzZXJ0RGVwZW5kZW5jaWVzKFsnZGVwZW5kZW5jaWVzJ10sIGRhdGEuZGVwZW5kZW5jaWVzLCBmYWxzZSk7XG5cbiAgICAgIHRoaXMuYXNzZXJ0QXNzZXRzKFsnYXNzZXRzJ10sIGRhdGEuYXNzZXRzKTtcbiAgICAgIHRoaXMuYXNzZXJ0VHlwZShbJ2Fzc2V0c0RpciddLCBkYXRhLmFzc2V0c0RpciwgW1R5cGUuc3RyaW5nXSwgdHJ1ZSk7XG4gICAgICB0aGlzLmFzc2VydFR5cGUoWydtb2RQcmVmaXgnXSwgZGF0YS5tb2RQcmVmaXgsIFtUeXBlLnN0cmluZ10sIHRydWUpO1xuXG4gICAgICB0aGlzLmFzc2VydFR5cGUoWydwbHVnaW4nXSwgZGF0YS5wbHVnaW4sIFtUeXBlLnN0cmluZ10sIHRydWUpO1xuICAgICAgdGhpcy5hc3NlcnRUeXBlKFsncHJlbG9hZCddLCBkYXRhLnByZWxvYWQsIFtUeXBlLnN0cmluZ10sIHRydWUpO1xuICAgICAgdGhpcy5hc3NlcnRUeXBlKFsncG9zdGxvYWQnXSwgZGF0YS5wb3N0bG9hZCwgW1R5cGUuc3RyaW5nXSwgdHJ1ZSk7XG4gICAgICB0aGlzLmFzc2VydFR5cGUoWydwcmVzdGFydCddLCBkYXRhLnByZXN0YXJ0LCBbVHlwZS5zdHJpbmddLCB0cnVlKTtcbiAgICAgIHRoaXMuYXNzZXJ0VHlwZShbJ3Bvc3RzdGFydCddLCBkYXRhLnBvc3RzdGFydCwgW1R5cGUuc3RyaW5nXSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucHJvYmxlbXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhyb3cgbmV3IE1hbmlmZXN0VmFsaWRhdGlvbkVycm9yKHRoaXMucHJvYmxlbXMpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyB2YWxpZGF0ZUxlZ2FjeShkYXRhOiBMZWdhY3lNYW5pZmVzdCk6IHZvaWQge1xuICAgIHRoaXMucHJvYmxlbXMgPSBbXTtcblxuICAgIGlmICh0aGlzLmFzc2VydFR5cGUoW10sIGRhdGEsIFtUeXBlLm9iamVjdF0pLnN0YXR1cyA9PT0gJ29rJykge1xuICAgICAgdGhpcy5hc3NlcnRUeXBlKFsnbmFtZSddLCBkYXRhLm5hbWUsIFtUeXBlLnN0cmluZ10pO1xuICAgICAgdGhpcy5hc3NlcnRUeXBlKFsndmVyc2lvbiddLCBkYXRhLnZlcnNpb24sIFtUeXBlLnN0cmluZ10sIHRydWUpO1xuXG4gICAgICB0aGlzLmFzc2VydFR5cGUoWydjY21vZEh1bWFuTmFtZSddLCBkYXRhLmNjbW9kSHVtYW5OYW1lLCBbVHlwZS5zdHJpbmddLCB0cnVlKTtcbiAgICAgIHRoaXMuYXNzZXJ0VHlwZShbJ2Rlc2NyaXB0aW9uJ10sIGRhdGEuZGVzY3JpcHRpb24sIFtUeXBlLnN0cmluZ10sIHRydWUpO1xuICAgICAgdGhpcy5hc3NlcnRUeXBlKFsnbGljZW5zZSddLCBkYXRhLmxpY2Vuc2UsIFtUeXBlLnN0cmluZ10sIHRydWUpO1xuICAgICAgdGhpcy5hc3NlcnRUeXBlKFsnaG9tZXBhZ2UnXSwgZGF0YS5ob21lcGFnZSwgW1R5cGUuc3RyaW5nXSwgdHJ1ZSk7XG4gICAgICB0aGlzLmFzc2VydE1vZEljb25zKFsnaWNvbnMnXSwgZGF0YS5pY29ucyk7XG5cbiAgICAgIGlmIChkYXRhLmNjbW9kRGVwZW5kZW5jaWVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5hc3NlcnREZXBlbmRlbmNpZXMoWydjY21vZERlcGVuZGVuY2llcyddLCBkYXRhLmNjbW9kRGVwZW5kZW5jaWVzLCB0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYXNzZXJ0RGVwZW5kZW5jaWVzKFsnZGVwZW5kZW5jaWVzJ10sIGRhdGEuZGVwZW5kZW5jaWVzLCB0cnVlKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5hc3NlcnRBc3NldHMoWydhc3NldHMnXSwgZGF0YS5hc3NldHMpO1xuXG4gICAgICB0aGlzLmFzc2VydFR5cGUoWydwbHVnaW4nXSwgZGF0YS5wbHVnaW4sIFtUeXBlLnN0cmluZ10sIHRydWUpO1xuICAgICAgdGhpcy5hc3NlcnRUeXBlKFsncHJlbG9hZCddLCBkYXRhLnByZWxvYWQsIFtUeXBlLnN0cmluZ10sIHRydWUpO1xuICAgICAgdGhpcy5hc3NlcnRUeXBlKFsncG9zdGxvYWQnXSwgZGF0YS5wb3N0bG9hZCwgW1R5cGUuc3RyaW5nXSwgdHJ1ZSk7XG4gICAgICB0aGlzLmFzc2VydFR5cGUoWydwcmVzdGFydCddLCBkYXRhLnByZXN0YXJ0LCBbVHlwZS5zdHJpbmddLCB0cnVlKTtcbiAgICAgIHRoaXMuYXNzZXJ0VHlwZShbJ21haW4nXSwgZGF0YS5tYWluLCBbVHlwZS5zdHJpbmddLCB0cnVlKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wcm9ibGVtcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aHJvdyBuZXcgTWFuaWZlc3RWYWxpZGF0aW9uRXJyb3IodGhpcy5wcm9ibGVtcyk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3NlcnRUeXBlKFxuICAgIHZhbHVlUGF0aDogSnNvblBhdGgsXG4gICAgdmFsdWU6IHVua25vd24sXG4gICAgZXhwZWN0ZWRUeXBlczogVHlwZVtdLFxuICAgIG9wdGlvbmFsID0gZmFsc2UsXG4gICk6IFR5cGVBc3NlcnRpb25SZXN1bHQge1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAob3B0aW9uYWwpIHtcbiAgICAgICAgcmV0dXJuIHsgc3RhdHVzOiAnb3B0aW9uYWwnIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnByb2JsZW1zLnB1c2goYCcke2pzb25QYXRoVG9TdHJpbmcodmFsdWVQYXRoKX0nIGlzIHJlcXVpcmVkYCk7XG4gICAgICAgIHJldHVybiB7IHN0YXR1czogJ2ZhaWxlZCcgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgYWN0dWFsVHlwZSA9IGdldFR5cGUodmFsdWUpO1xuICAgIGlmICghZXhwZWN0ZWRUeXBlcy5pbmNsdWRlcyhhY3R1YWxUeXBlKSkge1xuICAgICAgbGV0IHZhbHVlUGF0aFN0ciA9IGpzb25QYXRoVG9TdHJpbmcodmFsdWVQYXRoKTtcbiAgICAgIGxldCBleHBlY3RlZFR5cGVzU3RyID0gZXhwZWN0ZWRUeXBlcy5qb2luKCcgb3IgJyk7XG4gICAgICB0aGlzLnByb2JsZW1zLnB1c2goXG4gICAgICAgIGBleHBlY3RlZCB0eXBlIG9mICcke3ZhbHVlUGF0aFN0cn0nIHRvIGJlICcke2V4cGVjdGVkVHlwZXNTdHJ9JywgZ290ICcke2FjdHVhbFR5cGV9J2AsXG4gICAgICApO1xuICAgICAgcmV0dXJuIHsgc3RhdHVzOiAnZmFpbGVkJyB9O1xuICAgIH1cblxuICAgIHJldHVybiB7IHN0YXR1czogJ29rJywgdHlwZTogYWN0dWFsVHlwZSB9O1xuICB9XG5cbiAgcHJpdmF0ZSBhc3NlcnRMb2NhbGl6ZWRTdHJpbmcoXG4gICAgdmFsdWVQYXRoOiBKc29uUGF0aCxcbiAgICB2YWx1ZTogTG9jYWxpemVkU3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIG9wdGlvbmFsID0gZmFsc2UsXG4gICk6IHZvaWQge1xuICAgIGxldCBhc3NlcnRpb24gPSB0aGlzLmFzc2VydFR5cGUodmFsdWVQYXRoLCB2YWx1ZSwgW1R5cGUub2JqZWN0LCBUeXBlLnN0cmluZ10sIG9wdGlvbmFsKTtcbiAgICBpZiAoYXNzZXJ0aW9uLnN0YXR1cyAhPT0gJ29rJykgcmV0dXJuO1xuICAgIHZhbHVlID0gdmFsdWUhO1xuXG4gICAgaWYgKGFzc2VydGlvbi50eXBlID09PSBUeXBlLnN0cmluZykgcmV0dXJuO1xuICAgIGZvciAobGV0IFtrZXksIHZhbHVlMl0gb2YgT2JqZWN0LmVudHJpZXModmFsdWUgYXMgUmVjb3JkPExvY2FsZSwgc3RyaW5nPikpIHtcbiAgICAgIHRoaXMuYXNzZXJ0VHlwZShbLi4udmFsdWVQYXRoLCBrZXldLCB2YWx1ZTIsIFtUeXBlLnN0cmluZ10pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXNzZXJ0S2V5d29yZHModmFsdWVQYXRoOiBKc29uUGF0aCwgdmFsdWU6IExvY2FsaXplZFN0cmluZ1tdIHwgdW5kZWZpbmVkKTogdm9pZCB7XG4gICAgbGV0IGFzc2VydGlvbiA9IHRoaXMuYXNzZXJ0VHlwZSh2YWx1ZVBhdGgsIHZhbHVlLCBbVHlwZS5hcnJheV0sIHRydWUpO1xuICAgIGlmIChhc3NlcnRpb24uc3RhdHVzICE9PSAnb2snKSByZXR1cm47XG4gICAgdmFsdWUgPSB2YWx1ZSE7XG5cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdmFsdWUubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICBsZXQgdmFsdWUyID0gdmFsdWVbaW5kZXhdO1xuICAgICAgdGhpcy5hc3NlcnRMb2NhbGl6ZWRTdHJpbmcoWy4uLnZhbHVlUGF0aCwgaW5kZXhdLCB2YWx1ZTIpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXNzZXJ0UGVvcGxlKHZhbHVlUGF0aDogSnNvblBhdGgsIHZhbHVlOiBQZXJzb24gfCBQZXJzb25bXSB8IHVuZGVmaW5lZCk6IHZvaWQge1xuICAgIGxldCBhc3NlcnRpb24gPSB0aGlzLmFzc2VydFR5cGUodmFsdWVQYXRoLCB2YWx1ZSwgW1R5cGUuYXJyYXksIFR5cGUuc3RyaW5nXSwgdHJ1ZSk7XG4gICAgaWYgKGFzc2VydGlvbi5zdGF0dXMgIT09ICdvaycpIHJldHVybjtcbiAgICB2YWx1ZSA9IHZhbHVlITtcblxuICAgIGlmIChhc3NlcnRpb24udHlwZSA9PT0gVHlwZS5zdHJpbmcpIHJldHVybjtcblxuICAgIGNvbnN0IHBlb3BsZSA9IHZhbHVlIGFzIFBlcnNvbltdOyAvLyBzYWZlbHkgYXNzZXJ0XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHBlb3BsZS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGxldCB2YWx1ZTIgPSBwZW9wbGVbaW5kZXhdO1xuICAgICAgdGhpcy5hc3NlcnRQZXJzb24oWy4uLnZhbHVlUGF0aCwgaW5kZXhdLCB2YWx1ZTIpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXNzZXJ0UGVyc29uKHZhbHVlUGF0aDogSnNvblBhdGgsIHZhbHVlOiBQZXJzb24pOiB2b2lkIHtcbiAgICBsZXQgYXNzZXJ0aW9uID0gdGhpcy5hc3NlcnRUeXBlKHZhbHVlUGF0aCwgdmFsdWUsIFtUeXBlLm9iamVjdCwgVHlwZS5zdHJpbmddKTtcbiAgICBpZiAoYXNzZXJ0aW9uLnN0YXR1cyAhPT0gJ29rJykgcmV0dXJuO1xuXG4gICAgaWYgKGFzc2VydGlvbi50eXBlID09PSBUeXBlLnN0cmluZykgcmV0dXJuO1xuICAgIHZhbHVlID0gdmFsdWUgYXMgUGVyc29uRGV0YWlscztcblxuICAgIHRoaXMuYXNzZXJ0TG9jYWxpemVkU3RyaW5nKFsuLi52YWx1ZVBhdGgsICduYW1lJ10sIHZhbHVlLm5hbWUpO1xuICAgIHRoaXMuYXNzZXJ0TG9jYWxpemVkU3RyaW5nKFsuLi52YWx1ZVBhdGgsICdlbWFpbCddLCB2YWx1ZS5lbWFpbCwgdHJ1ZSk7XG4gICAgdGhpcy5hc3NlcnRMb2NhbGl6ZWRTdHJpbmcoWy4uLnZhbHVlUGF0aCwgJ3VybCddLCB2YWx1ZS51cmwsIHRydWUpO1xuICAgIHRoaXMuYXNzZXJ0TG9jYWxpemVkU3RyaW5nKFsuLi52YWx1ZVBhdGgsICdjb21tZW50J10sIHZhbHVlLmNvbW1lbnQsIHRydWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3NlcnREZXBlbmRlbmNpZXMoXG4gICAgdmFsdWVQYXRoOiBKc29uUGF0aCxcbiAgICB2YWx1ZTogTW9kRGVwZW5kZW5jaWVzIHwgdW5kZWZpbmVkLFxuICAgIGxlZ2FjeTogYm9vbGVhbixcbiAgKTogdm9pZCB7XG4gICAgbGV0IGFzc2VydGlvbiA9IHRoaXMuYXNzZXJ0VHlwZSh2YWx1ZVBhdGgsIHZhbHVlLCBbVHlwZS5vYmplY3RdLCB0cnVlKTtcbiAgICBpZiAoYXNzZXJ0aW9uLnN0YXR1cyAhPT0gJ29rJykgcmV0dXJuO1xuICAgIHZhbHVlID0gdmFsdWUhO1xuXG4gICAgZm9yIChsZXQgW2tleSwgdmFsdWUyXSBvZiBPYmplY3QuZW50cmllcyh2YWx1ZSkpIHtcbiAgICAgIGxldCB2YWx1ZVBhdGgyID0gWy4uLnZhbHVlUGF0aCwga2V5XTtcbiAgICAgIGlmIChsZWdhY3kpIHRoaXMuYXNzZXJ0VHlwZSh2YWx1ZVBhdGgyLCB2YWx1ZTIsIFtUeXBlLnN0cmluZ10pO1xuICAgICAgZWxzZSB0aGlzLmFzc2VydERlcGVuZGVuY3kodmFsdWVQYXRoMiwgdmFsdWUyKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzc2VydERlcGVuZGVuY3kodmFsdWVQYXRoOiBKc29uUGF0aCwgdmFsdWU6IE1vZERlcGVuZGVuY3kpOiB2b2lkIHtcbiAgICBsZXQgYXNzZXJ0aW9uID0gdGhpcy5hc3NlcnRUeXBlKHZhbHVlUGF0aCwgdmFsdWUsIFtUeXBlLm9iamVjdCwgVHlwZS5zdHJpbmddKTtcbiAgICBpZiAoYXNzZXJ0aW9uLnN0YXR1cyAhPT0gJ29rJykgcmV0dXJuO1xuXG4gICAgaWYgKGFzc2VydGlvbi50eXBlID09PSBUeXBlLnN0cmluZykgcmV0dXJuO1xuICAgIHZhbHVlID0gdmFsdWUgYXMgTW9kRGVwZW5kZW5jeURldGFpbHM7XG5cbiAgICB0aGlzLmFzc2VydFR5cGUoWy4uLnZhbHVlUGF0aCwgJ3ZlcnNpb24nXSwgdmFsdWUudmVyc2lvbiwgW1R5cGUuc3RyaW5nXSk7XG4gICAgdGhpcy5hc3NlcnRUeXBlKFsuLi52YWx1ZVBhdGgsICdvcHRpb25hbCddLCB2YWx1ZS5vcHRpb25hbCwgW1R5cGUuYm9vbGVhbl0sIHRydWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3NlcnRBc3NldHModmFsdWVQYXRoOiBKc29uUGF0aCwgdmFsdWU6IEZpbGVQYXRoW10gfCB1bmRlZmluZWQpOiB2b2lkIHtcbiAgICBsZXQgYXNzZXJ0aW9uID0gdGhpcy5hc3NlcnRUeXBlKHZhbHVlUGF0aCwgdmFsdWUsIFtUeXBlLmFycmF5XSwgdHJ1ZSk7XG4gICAgaWYgKGFzc2VydGlvbi5zdGF0dXMgIT09ICdvaycpIHJldHVybjtcbiAgICB2YWx1ZSA9IHZhbHVlITtcblxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCB2YWx1ZS5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGxldCB2YWx1ZTIgPSB2YWx1ZVtpbmRleF07XG4gICAgICB0aGlzLmFzc2VydFR5cGUoWy4uLnZhbHVlUGF0aCwgaW5kZXhdLCB2YWx1ZTIsIFtUeXBlLnN0cmluZ10pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXNzZXJ0TW9kSWNvbnModmFsdWVQYXRoOiBKc29uUGF0aCwgdmFsdWU6IE1vZEljb25zIHwgdW5kZWZpbmVkKTogdm9pZCB7XG4gICAgbGV0IGFzc2VydGlvbiA9IHRoaXMuYXNzZXJ0VHlwZSh2YWx1ZVBhdGgsIHZhbHVlLCBbVHlwZS5vYmplY3RdLCB0cnVlKTtcbiAgICBpZiAoYXNzZXJ0aW9uLnN0YXR1cyAhPT0gJ29rJykgcmV0dXJuO1xuICAgIHZhbHVlID0gdmFsdWUhO1xuXG4gICAgZm9yIChsZXQgW2tleSwgdmFsdWUyXSBvZiBPYmplY3QuZW50cmllcyh2YWx1ZSkpIHtcbiAgICAgIHRoaXMuYXNzZXJ0VHlwZShbLi4udmFsdWVQYXRoLCBrZXldLCB2YWx1ZTIsIFtUeXBlLnN0cmluZ10pO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udmVydEZyb21MZWdhY3koZGF0YTogTGVnYWN5TWFuaWZlc3QpOiBNYW5pZmVzdCB7XG4gIHJldHVybiB7XG4gICAgaWQ6IGRhdGEubmFtZSxcbiAgICB2ZXJzaW9uOiBkYXRhLnZlcnNpb24sXG4gICAgbGljZW5zZTogZGF0YS5saWNlbnNlLFxuXG4gICAgdGl0bGU6IGRhdGEuY2Ntb2RIdW1hbk5hbWUsXG4gICAgZGVzY3JpcHRpb246IGRhdGEuZGVzY3JpcHRpb24sXG4gICAgaG9tZXBhZ2U6IGRhdGEuaG9tZXBhZ2UsXG4gICAgaWNvbnM6IGRhdGEuaWNvbnMsXG5cbiAgICBkZXBlbmRlbmNpZXM6IGRhdGEuY2Ntb2REZXBlbmRlbmNpZXMgPz8gZGF0YS5kZXBlbmRlbmNpZXMsXG5cbiAgICBhc3NldHM6IGRhdGEuYXNzZXRzPy5tYXAoKHBhdGgpID0+IChwYXRoLnN0YXJ0c1dpdGgoJ2Fzc2V0cy8nKSA/IHBhdGguc2xpY2UoNykgOiBwYXRoKSksXG5cbiAgICBwbHVnaW46IGRhdGEucGx1Z2luLFxuICAgIHByZWxvYWQ6IGRhdGEucHJlbG9hZCxcbiAgICBwb3N0bG9hZDogZGF0YS5wb3N0bG9hZCxcbiAgICBwcmVzdGFydDogZGF0YS5wcmVzdGFydCxcbiAgICBwb3N0c3RhcnQ6IGRhdGEubWFpbixcbiAgfTtcbn1cbiIsICIvLyBAdHMtbm9jaGVja1xudmFyIF9fZ2V0T3duUHJvcE5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXM7XG52YXIgX19jb21tb25KUyA9IChjYiwgbW9kKSA9PiBmdW5jdGlvbiBfX3JlcXVpcmUoKSB7XG4gIHJldHVybiBtb2QgfHwgKDAsIGNiW19fZ2V0T3duUHJvcE5hbWVzKGNiKVswXV0pKChtb2QgPSB7IGV4cG9ydHM6IHt9IH0pLmV4cG9ydHMsIG1vZCksIG1vZC5leHBvcnRzO1xufTtcblxuLy8gbm9kZV9tb2R1bGVzLy5wbnBtL3NlbXZlckA2LjMuMC9ub2RlX21vZHVsZXMvc2VtdmVyL3NlbXZlci5qc1xudmFyIHJlcXVpcmVfc2VtdmVyID0gX19jb21tb25KUyh7XG4gIFwibm9kZV9tb2R1bGVzLy5wbnBtL3NlbXZlckA2LjMuMC9ub2RlX21vZHVsZXMvc2VtdmVyL3NlbXZlci5qc1wiKGV4cG9ydHMsIG1vZHVsZSkge1xuICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IFNlbVZlcjtcbiAgICB2YXIgZGVidWc7XG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmIHByb2Nlc3MuZW52ICYmIHByb2Nlc3MuZW52Lk5PREVfREVCVUcgJiYgL1xcYnNlbXZlclxcYi9pLnRlc3QocHJvY2Vzcy5lbnYuTk9ERV9ERUJVRykpIHtcbiAgICAgIGRlYnVnID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgICAgICAgYXJncy51bnNoaWZ0KFwiU0VNVkVSXCIpO1xuICAgICAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmdzKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnID0gZnVuY3Rpb24oKSB7XG4gICAgICB9O1xuICAgIH1cbiAgICBleHBvcnRzLlNFTVZFUl9TUEVDX1ZFUlNJT04gPSBcIjIuMC4wXCI7XG4gICAgdmFyIE1BWF9MRU5HVEggPSAyNTY7XG4gICAgdmFyIE1BWF9TQUZFX0lOVEVHRVIgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiB8fCAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIDkwMDcxOTkyNTQ3NDA5OTE7XG4gICAgdmFyIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggPSAxNjtcbiAgICB2YXIgcmUgPSBleHBvcnRzLnJlID0gW107XG4gICAgdmFyIHNyYyA9IGV4cG9ydHMuc3JjID0gW107XG4gICAgdmFyIHQgPSBleHBvcnRzLnRva2VucyA9IHt9O1xuICAgIHZhciBSID0gMDtcbiAgICBmdW5jdGlvbiB0b2sobikge1xuICAgICAgdFtuXSA9IFIrKztcbiAgICB9XG4gICAgdG9rKFwiTlVNRVJJQ0lERU5USUZJRVJcIik7XG4gICAgc3JjW3QuTlVNRVJJQ0lERU5USUZJRVJdID0gXCIwfFsxLTldXFxcXGQqXCI7XG4gICAgdG9rKFwiTlVNRVJJQ0lERU5USUZJRVJMT09TRVwiKTtcbiAgICBzcmNbdC5OVU1FUklDSURFTlRJRklFUkxPT1NFXSA9IFwiWzAtOV0rXCI7XG4gICAgdG9rKFwiTk9OTlVNRVJJQ0lERU5USUZJRVJcIik7XG4gICAgc3JjW3QuTk9OTlVNRVJJQ0lERU5USUZJRVJdID0gXCJcXFxcZCpbYS16QS1aLV1bYS16QS1aMC05LV0qXCI7XG4gICAgdG9rKFwiTUFJTlZFUlNJT05cIik7XG4gICAgc3JjW3QuTUFJTlZFUlNJT05dID0gXCIoXCIgKyBzcmNbdC5OVU1FUklDSURFTlRJRklFUl0gKyBcIilcXFxcLihcIiArIHNyY1t0Lk5VTUVSSUNJREVOVElGSUVSXSArIFwiKVxcXFwuKFwiICsgc3JjW3QuTlVNRVJJQ0lERU5USUZJRVJdICsgXCIpXCI7XG4gICAgdG9rKFwiTUFJTlZFUlNJT05MT09TRVwiKTtcbiAgICBzcmNbdC5NQUlOVkVSU0lPTkxPT1NFXSA9IFwiKFwiICsgc3JjW3QuTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gKyBcIilcXFxcLihcIiArIHNyY1t0Lk5VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgXCIpXFxcXC4oXCIgKyBzcmNbdC5OVU1FUklDSURFTlRJRklFUkxPT1NFXSArIFwiKVwiO1xuICAgIHRvayhcIlBSRVJFTEVBU0VJREVOVElGSUVSXCIpO1xuICAgIHNyY1t0LlBSRVJFTEVBU0VJREVOVElGSUVSXSA9IFwiKD86XCIgKyBzcmNbdC5OVU1FUklDSURFTlRJRklFUl0gKyBcInxcIiArIHNyY1t0Lk5PTk5VTUVSSUNJREVOVElGSUVSXSArIFwiKVwiO1xuICAgIHRvayhcIlBSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VcIik7XG4gICAgc3JjW3QuUFJFUkVMRUFTRUlERU5USUZJRVJMT09TRV0gPSBcIig/OlwiICsgc3JjW3QuTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gKyBcInxcIiArIHNyY1t0Lk5PTk5VTUVSSUNJREVOVElGSUVSXSArIFwiKVwiO1xuICAgIHRvayhcIlBSRVJFTEVBU0VcIik7XG4gICAgc3JjW3QuUFJFUkVMRUFTRV0gPSBcIig/Oi0oXCIgKyBzcmNbdC5QUkVSRUxFQVNFSURFTlRJRklFUl0gKyBcIig/OlxcXFwuXCIgKyBzcmNbdC5QUkVSRUxFQVNFSURFTlRJRklFUl0gKyBcIikqKSlcIjtcbiAgICB0b2soXCJQUkVSRUxFQVNFTE9PU0VcIik7XG4gICAgc3JjW3QuUFJFUkVMRUFTRUxPT1NFXSA9IFwiKD86LT8oXCIgKyBzcmNbdC5QUkVSRUxFQVNFSURFTlRJRklFUkxPT1NFXSArIFwiKD86XFxcXC5cIiArIHNyY1t0LlBSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VdICsgXCIpKikpXCI7XG4gICAgdG9rKFwiQlVJTERJREVOVElGSUVSXCIpO1xuICAgIHNyY1t0LkJVSUxESURFTlRJRklFUl0gPSBcIlswLTlBLVphLXotXStcIjtcbiAgICB0b2soXCJCVUlMRFwiKTtcbiAgICBzcmNbdC5CVUlMRF0gPSBcIig/OlxcXFwrKFwiICsgc3JjW3QuQlVJTERJREVOVElGSUVSXSArIFwiKD86XFxcXC5cIiArIHNyY1t0LkJVSUxESURFTlRJRklFUl0gKyBcIikqKSlcIjtcbiAgICB0b2soXCJGVUxMXCIpO1xuICAgIHRvayhcIkZVTExQTEFJTlwiKTtcbiAgICBzcmNbdC5GVUxMUExBSU5dID0gXCJ2P1wiICsgc3JjW3QuTUFJTlZFUlNJT05dICsgc3JjW3QuUFJFUkVMRUFTRV0gKyBcIj9cIiArIHNyY1t0LkJVSUxEXSArIFwiP1wiO1xuICAgIHNyY1t0LkZVTExdID0gXCJeXCIgKyBzcmNbdC5GVUxMUExBSU5dICsgXCIkXCI7XG4gICAgdG9rKFwiTE9PU0VQTEFJTlwiKTtcbiAgICBzcmNbdC5MT09TRVBMQUlOXSA9IFwiW3Y9XFxcXHNdKlwiICsgc3JjW3QuTUFJTlZFUlNJT05MT09TRV0gKyBzcmNbdC5QUkVSRUxFQVNFTE9PU0VdICsgXCI/XCIgKyBzcmNbdC5CVUlMRF0gKyBcIj9cIjtcbiAgICB0b2soXCJMT09TRVwiKTtcbiAgICBzcmNbdC5MT09TRV0gPSBcIl5cIiArIHNyY1t0LkxPT1NFUExBSU5dICsgXCIkXCI7XG4gICAgdG9rKFwiR1RMVFwiKTtcbiAgICBzcmNbdC5HVExUXSA9IFwiKCg/Ojx8Pik/PT8pXCI7XG4gICAgdG9rKFwiWFJBTkdFSURFTlRJRklFUkxPT1NFXCIpO1xuICAgIHNyY1t0LlhSQU5HRUlERU5USUZJRVJMT09TRV0gPSBzcmNbdC5OVU1FUklDSURFTlRJRklFUkxPT1NFXSArIFwifHh8WHxcXFxcKlwiO1xuICAgIHRvayhcIlhSQU5HRUlERU5USUZJRVJcIik7XG4gICAgc3JjW3QuWFJBTkdFSURFTlRJRklFUl0gPSBzcmNbdC5OVU1FUklDSURFTlRJRklFUl0gKyBcInx4fFh8XFxcXCpcIjtcbiAgICB0b2soXCJYUkFOR0VQTEFJTlwiKTtcbiAgICBzcmNbdC5YUkFOR0VQTEFJTl0gPSBcIlt2PVxcXFxzXSooXCIgKyBzcmNbdC5YUkFOR0VJREVOVElGSUVSXSArIFwiKSg/OlxcXFwuKFwiICsgc3JjW3QuWFJBTkdFSURFTlRJRklFUl0gKyBcIikoPzpcXFxcLihcIiArIHNyY1t0LlhSQU5HRUlERU5USUZJRVJdICsgXCIpKD86XCIgKyBzcmNbdC5QUkVSRUxFQVNFXSArIFwiKT9cIiArIHNyY1t0LkJVSUxEXSArIFwiPyk/KT9cIjtcbiAgICB0b2soXCJYUkFOR0VQTEFJTkxPT1NFXCIpO1xuICAgIHNyY1t0LlhSQU5HRVBMQUlOTE9PU0VdID0gXCJbdj1cXFxcc10qKFwiICsgc3JjW3QuWFJBTkdFSURFTlRJRklFUkxPT1NFXSArIFwiKSg/OlxcXFwuKFwiICsgc3JjW3QuWFJBTkdFSURFTlRJRklFUkxPT1NFXSArIFwiKSg/OlxcXFwuKFwiICsgc3JjW3QuWFJBTkdFSURFTlRJRklFUkxPT1NFXSArIFwiKSg/OlwiICsgc3JjW3QuUFJFUkVMRUFTRUxPT1NFXSArIFwiKT9cIiArIHNyY1t0LkJVSUxEXSArIFwiPyk/KT9cIjtcbiAgICB0b2soXCJYUkFOR0VcIik7XG4gICAgc3JjW3QuWFJBTkdFXSA9IFwiXlwiICsgc3JjW3QuR1RMVF0gKyBcIlxcXFxzKlwiICsgc3JjW3QuWFJBTkdFUExBSU5dICsgXCIkXCI7XG4gICAgdG9rKFwiWFJBTkdFTE9PU0VcIik7XG4gICAgc3JjW3QuWFJBTkdFTE9PU0VdID0gXCJeXCIgKyBzcmNbdC5HVExUXSArIFwiXFxcXHMqXCIgKyBzcmNbdC5YUkFOR0VQTEFJTkxPT1NFXSArIFwiJFwiO1xuICAgIHRvayhcIkNPRVJDRVwiKTtcbiAgICBzcmNbdC5DT0VSQ0VdID0gXCIoXnxbXlxcXFxkXSkoXFxcXGR7MSxcIiArIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggKyBcIn0pKD86XFxcXC4oXFxcXGR7MSxcIiArIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggKyBcIn0pKT8oPzpcXFxcLihcXFxcZHsxLFwiICsgTUFYX1NBRkVfQ09NUE9ORU5UX0xFTkdUSCArIFwifSkpPyg/OiR8W15cXFxcZF0pXCI7XG4gICAgdG9rKFwiQ09FUkNFUlRMXCIpO1xuICAgIHJlW3QuQ09FUkNFUlRMXSA9IG5ldyBSZWdFeHAoc3JjW3QuQ09FUkNFXSwgXCJnXCIpO1xuICAgIHRvayhcIkxPTkVUSUxERVwiKTtcbiAgICBzcmNbdC5MT05FVElMREVdID0gXCIoPzp+Pj8pXCI7XG4gICAgdG9rKFwiVElMREVUUklNXCIpO1xuICAgIHNyY1t0LlRJTERFVFJJTV0gPSBcIihcXFxccyopXCIgKyBzcmNbdC5MT05FVElMREVdICsgXCJcXFxccytcIjtcbiAgICByZVt0LlRJTERFVFJJTV0gPSBuZXcgUmVnRXhwKHNyY1t0LlRJTERFVFJJTV0sIFwiZ1wiKTtcbiAgICB2YXIgdGlsZGVUcmltUmVwbGFjZSA9IFwiJDF+XCI7XG4gICAgdG9rKFwiVElMREVcIik7XG4gICAgc3JjW3QuVElMREVdID0gXCJeXCIgKyBzcmNbdC5MT05FVElMREVdICsgc3JjW3QuWFJBTkdFUExBSU5dICsgXCIkXCI7XG4gICAgdG9rKFwiVElMREVMT09TRVwiKTtcbiAgICBzcmNbdC5USUxERUxPT1NFXSA9IFwiXlwiICsgc3JjW3QuTE9ORVRJTERFXSArIHNyY1t0LlhSQU5HRVBMQUlOTE9PU0VdICsgXCIkXCI7XG4gICAgdG9rKFwiTE9ORUNBUkVUXCIpO1xuICAgIHNyY1t0LkxPTkVDQVJFVF0gPSBcIig/OlxcXFxeKVwiO1xuICAgIHRvayhcIkNBUkVUVFJJTVwiKTtcbiAgICBzcmNbdC5DQVJFVFRSSU1dID0gXCIoXFxcXHMqKVwiICsgc3JjW3QuTE9ORUNBUkVUXSArIFwiXFxcXHMrXCI7XG4gICAgcmVbdC5DQVJFVFRSSU1dID0gbmV3IFJlZ0V4cChzcmNbdC5DQVJFVFRSSU1dLCBcImdcIik7XG4gICAgdmFyIGNhcmV0VHJpbVJlcGxhY2UgPSBcIiQxXlwiO1xuICAgIHRvayhcIkNBUkVUXCIpO1xuICAgIHNyY1t0LkNBUkVUXSA9IFwiXlwiICsgc3JjW3QuTE9ORUNBUkVUXSArIHNyY1t0LlhSQU5HRVBMQUlOXSArIFwiJFwiO1xuICAgIHRvayhcIkNBUkVUTE9PU0VcIik7XG4gICAgc3JjW3QuQ0FSRVRMT09TRV0gPSBcIl5cIiArIHNyY1t0LkxPTkVDQVJFVF0gKyBzcmNbdC5YUkFOR0VQTEFJTkxPT1NFXSArIFwiJFwiO1xuICAgIHRvayhcIkNPTVBBUkFUT1JMT09TRVwiKTtcbiAgICBzcmNbdC5DT01QQVJBVE9STE9PU0VdID0gXCJeXCIgKyBzcmNbdC5HVExUXSArIFwiXFxcXHMqKFwiICsgc3JjW3QuTE9PU0VQTEFJTl0gKyBcIikkfF4kXCI7XG4gICAgdG9rKFwiQ09NUEFSQVRPUlwiKTtcbiAgICBzcmNbdC5DT01QQVJBVE9SXSA9IFwiXlwiICsgc3JjW3QuR1RMVF0gKyBcIlxcXFxzKihcIiArIHNyY1t0LkZVTExQTEFJTl0gKyBcIikkfF4kXCI7XG4gICAgdG9rKFwiQ09NUEFSQVRPUlRSSU1cIik7XG4gICAgc3JjW3QuQ09NUEFSQVRPUlRSSU1dID0gXCIoXFxcXHMqKVwiICsgc3JjW3QuR1RMVF0gKyBcIlxcXFxzKihcIiArIHNyY1t0LkxPT1NFUExBSU5dICsgXCJ8XCIgKyBzcmNbdC5YUkFOR0VQTEFJTl0gKyBcIilcIjtcbiAgICByZVt0LkNPTVBBUkFUT1JUUklNXSA9IG5ldyBSZWdFeHAoc3JjW3QuQ09NUEFSQVRPUlRSSU1dLCBcImdcIik7XG4gICAgdmFyIGNvbXBhcmF0b3JUcmltUmVwbGFjZSA9IFwiJDEkMiQzXCI7XG4gICAgdG9rKFwiSFlQSEVOUkFOR0VcIik7XG4gICAgc3JjW3QuSFlQSEVOUkFOR0VdID0gXCJeXFxcXHMqKFwiICsgc3JjW3QuWFJBTkdFUExBSU5dICsgXCIpXFxcXHMrLVxcXFxzKyhcIiArIHNyY1t0LlhSQU5HRVBMQUlOXSArIFwiKVxcXFxzKiRcIjtcbiAgICB0b2soXCJIWVBIRU5SQU5HRUxPT1NFXCIpO1xuICAgIHNyY1t0LkhZUEhFTlJBTkdFTE9PU0VdID0gXCJeXFxcXHMqKFwiICsgc3JjW3QuWFJBTkdFUExBSU5MT09TRV0gKyBcIilcXFxccystXFxcXHMrKFwiICsgc3JjW3QuWFJBTkdFUExBSU5MT09TRV0gKyBcIilcXFxccyokXCI7XG4gICAgdG9rKFwiU1RBUlwiKTtcbiAgICBzcmNbdC5TVEFSXSA9IFwiKDx8Pik/PT9cXFxccypcXFxcKlwiO1xuICAgIGZvciAoaSA9IDA7IGkgPCBSOyBpKyspIHtcbiAgICAgIGRlYnVnKGksIHNyY1tpXSk7XG4gICAgICBpZiAoIXJlW2ldKSB7XG4gICAgICAgIHJlW2ldID0gbmV3IFJlZ0V4cChzcmNbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgICB2YXIgaTtcbiAgICBleHBvcnRzLnBhcnNlID0gcGFyc2U7XG4gICAgZnVuY3Rpb24gcGFyc2UodmVyc2lvbiwgb3B0aW9ucykge1xuICAgICAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgbG9vc2U6ICEhb3B0aW9ucyxcbiAgICAgICAgICBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICh2ZXJzaW9uIGluc3RhbmNlb2YgU2VtVmVyKSB7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB2ZXJzaW9uICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKHZlcnNpb24ubGVuZ3RoID4gTUFYX0xFTkdUSCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHZhciByID0gb3B0aW9ucy5sb29zZSA/IHJlW3QuTE9PU0VdIDogcmVbdC5GVUxMXTtcbiAgICAgIGlmICghci50ZXN0KHZlcnNpb24pKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIG5ldyBTZW1WZXIodmVyc2lvbiwgb3B0aW9ucyk7XG4gICAgICB9IGNhdGNoIChlcikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgZXhwb3J0cy52YWxpZCA9IHZhbGlkO1xuICAgIGZ1bmN0aW9uIHZhbGlkKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgICAgIHZhciB2ID0gcGFyc2UodmVyc2lvbiwgb3B0aW9ucyk7XG4gICAgICByZXR1cm4gdiA/IHYudmVyc2lvbiA6IG51bGw7XG4gICAgfVxuICAgIGV4cG9ydHMuY2xlYW4gPSBjbGVhbjtcbiAgICBmdW5jdGlvbiBjbGVhbih2ZXJzaW9uLCBvcHRpb25zKSB7XG4gICAgICB2YXIgcyA9IHBhcnNlKHZlcnNpb24udHJpbSgpLnJlcGxhY2UoL15bPXZdKy8sIFwiXCIpLCBvcHRpb25zKTtcbiAgICAgIHJldHVybiBzID8gcy52ZXJzaW9uIDogbnVsbDtcbiAgICB9XG4gICAgZXhwb3J0cy5TZW1WZXIgPSBTZW1WZXI7XG4gICAgZnVuY3Rpb24gU2VtVmVyKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgICAgIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICBvcHRpb25zID0ge1xuICAgICAgICAgIGxvb3NlOiAhIW9wdGlvbnMsXG4gICAgICAgICAgaW5jbHVkZVByZXJlbGVhc2U6IGZhbHNlXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAodmVyc2lvbiBpbnN0YW5jZW9mIFNlbVZlcikge1xuICAgICAgICBpZiAodmVyc2lvbi5sb29zZSA9PT0gb3B0aW9ucy5sb29zZSkge1xuICAgICAgICAgIHJldHVybiB2ZXJzaW9uO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZlcnNpb24gPSB2ZXJzaW9uLnZlcnNpb247XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZlcnNpb24gIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgVmVyc2lvbjogXCIgKyB2ZXJzaW9uKTtcbiAgICAgIH1cbiAgICAgIGlmICh2ZXJzaW9uLmxlbmd0aCA+IE1BWF9MRU5HVEgpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcInZlcnNpb24gaXMgbG9uZ2VyIHRoYW4gXCIgKyBNQVhfTEVOR1RIICsgXCIgY2hhcmFjdGVyc1wiKTtcbiAgICAgIH1cbiAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBTZW1WZXIpKSB7XG4gICAgICAgIHJldHVybiBuZXcgU2VtVmVyKHZlcnNpb24sIG9wdGlvbnMpO1xuICAgICAgfVxuICAgICAgZGVidWcoXCJTZW1WZXJcIiwgdmVyc2lvbiwgb3B0aW9ucyk7XG4gICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgdGhpcy5sb29zZSA9ICEhb3B0aW9ucy5sb29zZTtcbiAgICAgIHZhciBtID0gdmVyc2lvbi50cmltKCkubWF0Y2gob3B0aW9ucy5sb29zZSA/IHJlW3QuTE9PU0VdIDogcmVbdC5GVUxMXSk7XG4gICAgICBpZiAoIW0pIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgVmVyc2lvbjogXCIgKyB2ZXJzaW9uKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmF3ID0gdmVyc2lvbjtcbiAgICAgIHRoaXMubWFqb3IgPSArbVsxXTtcbiAgICAgIHRoaXMubWlub3IgPSArbVsyXTtcbiAgICAgIHRoaXMucGF0Y2ggPSArbVszXTtcbiAgICAgIGlmICh0aGlzLm1ham9yID4gTUFYX1NBRkVfSU5URUdFUiB8fCB0aGlzLm1ham9yIDwgMCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBtYWpvciB2ZXJzaW9uXCIpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMubWlub3IgPiBNQVhfU0FGRV9JTlRFR0VSIHx8IHRoaXMubWlub3IgPCAwKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIG1pbm9yIHZlcnNpb25cIik7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5wYXRjaCA+IE1BWF9TQUZFX0lOVEVHRVIgfHwgdGhpcy5wYXRjaCA8IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgcGF0Y2ggdmVyc2lvblwiKTtcbiAgICAgIH1cbiAgICAgIGlmICghbVs0XSkge1xuICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IG1bNF0uc3BsaXQoXCIuXCIpLm1hcChmdW5jdGlvbihpZCkge1xuICAgICAgICAgIGlmICgvXlswLTldKyQvLnRlc3QoaWQpKSB7XG4gICAgICAgICAgICB2YXIgbnVtID0gK2lkO1xuICAgICAgICAgICAgaWYgKG51bSA+PSAwICYmIG51bSA8IE1BWF9TQUZFX0lOVEVHRVIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG51bTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYnVpbGQgPSBtWzVdID8gbVs1XS5zcGxpdChcIi5cIikgOiBbXTtcbiAgICAgIHRoaXMuZm9ybWF0KCk7XG4gICAgfVxuICAgIFNlbVZlci5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnZlcnNpb24gPSB0aGlzLm1ham9yICsgXCIuXCIgKyB0aGlzLm1pbm9yICsgXCIuXCIgKyB0aGlzLnBhdGNoO1xuICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy52ZXJzaW9uICs9IFwiLVwiICsgdGhpcy5wcmVyZWxlYXNlLmpvaW4oXCIuXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMudmVyc2lvbjtcbiAgICB9O1xuICAgIFNlbVZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnZlcnNpb247XG4gICAgfTtcbiAgICBTZW1WZXIucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgZGVidWcoXCJTZW1WZXIuY29tcGFyZVwiLCB0aGlzLnZlcnNpb24sIHRoaXMub3B0aW9ucywgb3RoZXIpO1xuICAgICAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIpKSB7XG4gICAgICAgIG90aGVyID0gbmV3IFNlbVZlcihvdGhlciwgdGhpcy5vcHRpb25zKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmNvbXBhcmVNYWluKG90aGVyKSB8fCB0aGlzLmNvbXBhcmVQcmUob3RoZXIpO1xuICAgIH07XG4gICAgU2VtVmVyLnByb3RvdHlwZS5jb21wYXJlTWFpbiA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICBpZiAoIShvdGhlciBpbnN0YW5jZW9mIFNlbVZlcikpIHtcbiAgICAgICAgb3RoZXIgPSBuZXcgU2VtVmVyKG90aGVyLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbXBhcmVJZGVudGlmaWVycyh0aGlzLm1ham9yLCBvdGhlci5tYWpvcikgfHwgY29tcGFyZUlkZW50aWZpZXJzKHRoaXMubWlub3IsIG90aGVyLm1pbm9yKSB8fCBjb21wYXJlSWRlbnRpZmllcnModGhpcy5wYXRjaCwgb3RoZXIucGF0Y2gpO1xuICAgIH07XG4gICAgU2VtVmVyLnByb3RvdHlwZS5jb21wYXJlUHJlID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgIGlmICghKG90aGVyIGluc3RhbmNlb2YgU2VtVmVyKSkge1xuICAgICAgICBvdGhlciA9IG5ldyBTZW1WZXIob3RoZXIsIHRoaXMub3B0aW9ucyk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCAmJiAhb3RoZXIucHJlcmVsZWFzZS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfSBlbHNlIGlmICghdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCAmJiBvdGhlci5wcmVyZWxlYXNlLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gMTtcbiAgICAgIH0gZWxzZSBpZiAoIXRoaXMucHJlcmVsZWFzZS5sZW5ndGggJiYgIW90aGVyLnByZXJlbGVhc2UubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgICAgdmFyIGkyID0gMDtcbiAgICAgIGRvIHtcbiAgICAgICAgdmFyIGEgPSB0aGlzLnByZXJlbGVhc2VbaTJdO1xuICAgICAgICB2YXIgYiA9IG90aGVyLnByZXJlbGVhc2VbaTJdO1xuICAgICAgICBkZWJ1ZyhcInByZXJlbGVhc2UgY29tcGFyZVwiLCBpMiwgYSwgYik7XG4gICAgICAgIGlmIChhID09PSB2b2lkIDAgJiYgYiA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH0gZWxzZSBpZiAoYiA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH0gZWxzZSBpZiAoYSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9IGVsc2UgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gY29tcGFyZUlkZW50aWZpZXJzKGEsIGIpO1xuICAgICAgICB9XG4gICAgICB9IHdoaWxlICgrK2kyKTtcbiAgICB9O1xuICAgIFNlbVZlci5wcm90b3R5cGUuY29tcGFyZUJ1aWxkID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgIGlmICghKG90aGVyIGluc3RhbmNlb2YgU2VtVmVyKSkge1xuICAgICAgICBvdGhlciA9IG5ldyBTZW1WZXIob3RoZXIsIHRoaXMub3B0aW9ucyk7XG4gICAgICB9XG4gICAgICB2YXIgaTIgPSAwO1xuICAgICAgZG8ge1xuICAgICAgICB2YXIgYSA9IHRoaXMuYnVpbGRbaTJdO1xuICAgICAgICB2YXIgYiA9IG90aGVyLmJ1aWxkW2kyXTtcbiAgICAgICAgZGVidWcoXCJwcmVyZWxlYXNlIGNvbXBhcmVcIiwgaTIsIGEsIGIpO1xuICAgICAgICBpZiAoYSA9PT0gdm9pZCAwICYmIGIgPT09IHZvaWQgMCkge1xuICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9IGVsc2UgaWYgKGIgPT09IHZvaWQgMCkge1xuICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9IGVsc2UgaWYgKGEgPT09IHZvaWQgMCkge1xuICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfSBlbHNlIGlmIChhID09PSBiKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGNvbXBhcmVJZGVudGlmaWVycyhhLCBiKTtcbiAgICAgICAgfVxuICAgICAgfSB3aGlsZSAoKytpMik7XG4gICAgfTtcbiAgICBTZW1WZXIucHJvdG90eXBlLmluYyA9IGZ1bmN0aW9uKHJlbGVhc2UsIGlkZW50aWZpZXIpIHtcbiAgICAgIHN3aXRjaCAocmVsZWFzZSkge1xuICAgICAgICBjYXNlIFwicHJlbWFqb3JcIjpcbiAgICAgICAgICB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID0gMDtcbiAgICAgICAgICB0aGlzLnBhdGNoID0gMDtcbiAgICAgICAgICB0aGlzLm1pbm9yID0gMDtcbiAgICAgICAgICB0aGlzLm1ham9yKys7XG4gICAgICAgICAgdGhpcy5pbmMoXCJwcmVcIiwgaWRlbnRpZmllcik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJwcmVtaW5vclwiOlxuICAgICAgICAgIHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPSAwO1xuICAgICAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgICAgIHRoaXMubWlub3IrKztcbiAgICAgICAgICB0aGlzLmluYyhcInByZVwiLCBpZGVudGlmaWVyKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInByZXBhdGNoXCI6XG4gICAgICAgICAgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9IDA7XG4gICAgICAgICAgdGhpcy5pbmMoXCJwYXRjaFwiLCBpZGVudGlmaWVyKTtcbiAgICAgICAgICB0aGlzLmluYyhcInByZVwiLCBpZGVudGlmaWVyKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gSWYgdGhlIGlucHV0IGlzIGEgbm9uLXByZXJlbGVhc2UgdmVyc2lvbiwgdGhpcyBhY3RzIHRoZSBzYW1lIGFzXG4gICAgICAgIC8vIHByZXBhdGNoLlxuICAgICAgICBjYXNlIFwicHJlcmVsZWFzZVwiOlxuICAgICAgICAgIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmluYyhcInBhdGNoXCIsIGlkZW50aWZpZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmluYyhcInByZVwiLCBpZGVudGlmaWVyKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIm1ham9yXCI6XG4gICAgICAgICAgaWYgKHRoaXMubWlub3IgIT09IDAgfHwgdGhpcy5wYXRjaCAhPT0gMCB8fCB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLm1ham9yKys7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubWlub3IgPSAwO1xuICAgICAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibWlub3JcIjpcbiAgICAgICAgICBpZiAodGhpcy5wYXRjaCAhPT0gMCB8fCB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLm1pbm9yKys7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwicGF0Y2hcIjpcbiAgICAgICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5wYXRjaCsrO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gVGhpcyBwcm9iYWJseSBzaG91bGRuJ3QgYmUgdXNlZCBwdWJsaWNseS5cbiAgICAgICAgLy8gMS4wLjAgXCJwcmVcIiB3b3VsZCBiZWNvbWUgMS4wLjAtMCB3aGljaCBpcyB0aGUgd3JvbmcgZGlyZWN0aW9uLlxuICAgICAgICBjYXNlIFwicHJlXCI6XG4gICAgICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFswXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGkyID0gdGhpcy5wcmVyZWxlYXNlLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlICgtLWkyID49IDApIHtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnByZXJlbGVhc2VbaTJdID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVyZWxlYXNlW2kyXSsrO1xuICAgICAgICAgICAgICAgIGkyID0gLTI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpMiA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgdGhpcy5wcmVyZWxlYXNlLnB1c2goMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpZGVudGlmaWVyKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmVyZWxlYXNlWzBdID09PSBpZGVudGlmaWVyKSB7XG4gICAgICAgICAgICAgIGlmIChpc05hTih0aGlzLnByZXJlbGVhc2VbMV0pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW2lkZW50aWZpZXIsIDBdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbaWRlbnRpZmllciwgMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgaW5jcmVtZW50IGFyZ3VtZW50OiBcIiArIHJlbGVhc2UpO1xuICAgICAgfVxuICAgICAgdGhpcy5mb3JtYXQoKTtcbiAgICAgIHRoaXMucmF3ID0gdGhpcy52ZXJzaW9uO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBleHBvcnRzLmluYyA9IGluYztcbiAgICBmdW5jdGlvbiBpbmModmVyc2lvbiwgcmVsZWFzZSwgbG9vc2UsIGlkZW50aWZpZXIpIHtcbiAgICAgIGlmICh0eXBlb2YgbG9vc2UgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgaWRlbnRpZmllciA9IGxvb3NlO1xuICAgICAgICBsb29zZSA9IHZvaWQgMDtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBuZXcgU2VtVmVyKHZlcnNpb24sIGxvb3NlKS5pbmMocmVsZWFzZSwgaWRlbnRpZmllcikudmVyc2lvbjtcbiAgICAgIH0gY2F0Y2ggKGVyKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICBleHBvcnRzLmRpZmYgPSBkaWZmO1xuICAgIGZ1bmN0aW9uIGRpZmYodmVyc2lvbjEsIHZlcnNpb24yKSB7XG4gICAgICBpZiAoZXEodmVyc2lvbjEsIHZlcnNpb24yKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB2MSA9IHBhcnNlKHZlcnNpb24xKTtcbiAgICAgICAgdmFyIHYyID0gcGFyc2UodmVyc2lvbjIpO1xuICAgICAgICB2YXIgcHJlZml4ID0gXCJcIjtcbiAgICAgICAgaWYgKHYxLnByZXJlbGVhc2UubGVuZ3RoIHx8IHYyLnByZXJlbGVhc2UubGVuZ3RoKSB7XG4gICAgICAgICAgcHJlZml4ID0gXCJwcmVcIjtcbiAgICAgICAgICB2YXIgZGVmYXVsdFJlc3VsdCA9IFwicHJlcmVsZWFzZVwiO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGtleSBpbiB2MSkge1xuICAgICAgICAgIGlmIChrZXkgPT09IFwibWFqb3JcIiB8fCBrZXkgPT09IFwibWlub3JcIiB8fCBrZXkgPT09IFwicGF0Y2hcIikge1xuICAgICAgICAgICAgaWYgKHYxW2tleV0gIT09IHYyW2tleV0pIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArIGtleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlZmF1bHRSZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuICAgIGV4cG9ydHMuY29tcGFyZUlkZW50aWZpZXJzID0gY29tcGFyZUlkZW50aWZpZXJzO1xuICAgIHZhciBudW1lcmljID0gL15bMC05XSskLztcbiAgICBmdW5jdGlvbiBjb21wYXJlSWRlbnRpZmllcnMoYSwgYikge1xuICAgICAgdmFyIGFudW0gPSBudW1lcmljLnRlc3QoYSk7XG4gICAgICB2YXIgYm51bSA9IG51bWVyaWMudGVzdChiKTtcbiAgICAgIGlmIChhbnVtICYmIGJudW0pIHtcbiAgICAgICAgYSA9ICthO1xuICAgICAgICBiID0gK2I7XG4gICAgICB9XG4gICAgICByZXR1cm4gYSA9PT0gYiA/IDAgOiBhbnVtICYmICFibnVtID8gLTEgOiBibnVtICYmICFhbnVtID8gMSA6IGEgPCBiID8gLTEgOiAxO1xuICAgIH1cbiAgICBleHBvcnRzLnJjb21wYXJlSWRlbnRpZmllcnMgPSByY29tcGFyZUlkZW50aWZpZXJzO1xuICAgIGZ1bmN0aW9uIHJjb21wYXJlSWRlbnRpZmllcnMoYSwgYikge1xuICAgICAgcmV0dXJuIGNvbXBhcmVJZGVudGlmaWVycyhiLCBhKTtcbiAgICB9XG4gICAgZXhwb3J0cy5tYWpvciA9IG1ham9yO1xuICAgIGZ1bmN0aW9uIG1ham9yKGEsIGxvb3NlKSB7XG4gICAgICByZXR1cm4gbmV3IFNlbVZlcihhLCBsb29zZSkubWFqb3I7XG4gICAgfVxuICAgIGV4cG9ydHMubWlub3IgPSBtaW5vcjtcbiAgICBmdW5jdGlvbiBtaW5vcihhLCBsb29zZSkge1xuICAgICAgcmV0dXJuIG5ldyBTZW1WZXIoYSwgbG9vc2UpLm1pbm9yO1xuICAgIH1cbiAgICBleHBvcnRzLnBhdGNoID0gcGF0Y2g7XG4gICAgZnVuY3Rpb24gcGF0Y2goYSwgbG9vc2UpIHtcbiAgICAgIHJldHVybiBuZXcgU2VtVmVyKGEsIGxvb3NlKS5wYXRjaDtcbiAgICB9XG4gICAgZXhwb3J0cy5jb21wYXJlID0gY29tcGFyZTtcbiAgICBmdW5jdGlvbiBjb21wYXJlKGEsIGIsIGxvb3NlKSB7XG4gICAgICByZXR1cm4gbmV3IFNlbVZlcihhLCBsb29zZSkuY29tcGFyZShuZXcgU2VtVmVyKGIsIGxvb3NlKSk7XG4gICAgfVxuICAgIGV4cG9ydHMuY29tcGFyZUxvb3NlID0gY29tcGFyZUxvb3NlO1xuICAgIGZ1bmN0aW9uIGNvbXBhcmVMb29zZShhLCBiKSB7XG4gICAgICByZXR1cm4gY29tcGFyZShhLCBiLCB0cnVlKTtcbiAgICB9XG4gICAgZXhwb3J0cy5jb21wYXJlQnVpbGQgPSBjb21wYXJlQnVpbGQ7XG4gICAgZnVuY3Rpb24gY29tcGFyZUJ1aWxkKGEsIGIsIGxvb3NlKSB7XG4gICAgICB2YXIgdmVyc2lvbkEgPSBuZXcgU2VtVmVyKGEsIGxvb3NlKTtcbiAgICAgIHZhciB2ZXJzaW9uQiA9IG5ldyBTZW1WZXIoYiwgbG9vc2UpO1xuICAgICAgcmV0dXJuIHZlcnNpb25BLmNvbXBhcmUodmVyc2lvbkIpIHx8IHZlcnNpb25BLmNvbXBhcmVCdWlsZCh2ZXJzaW9uQik7XG4gICAgfVxuICAgIGV4cG9ydHMucmNvbXBhcmUgPSByY29tcGFyZTtcbiAgICBmdW5jdGlvbiByY29tcGFyZShhLCBiLCBsb29zZSkge1xuICAgICAgcmV0dXJuIGNvbXBhcmUoYiwgYSwgbG9vc2UpO1xuICAgIH1cbiAgICBleHBvcnRzLnNvcnQgPSBzb3J0O1xuICAgIGZ1bmN0aW9uIHNvcnQobGlzdCwgbG9vc2UpIHtcbiAgICAgIHJldHVybiBsaXN0LnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5jb21wYXJlQnVpbGQoYSwgYiwgbG9vc2UpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGV4cG9ydHMucnNvcnQgPSByc29ydDtcbiAgICBmdW5jdGlvbiByc29ydChsaXN0LCBsb29zZSkge1xuICAgICAgcmV0dXJuIGxpc3Quc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLmNvbXBhcmVCdWlsZChiLCBhLCBsb29zZSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZXhwb3J0cy5ndCA9IGd0O1xuICAgIGZ1bmN0aW9uIGd0KGEsIGIsIGxvb3NlKSB7XG4gICAgICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPiAwO1xuICAgIH1cbiAgICBleHBvcnRzLmx0ID0gbHQ7XG4gICAgZnVuY3Rpb24gbHQoYSwgYiwgbG9vc2UpIHtcbiAgICAgIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA8IDA7XG4gICAgfVxuICAgIGV4cG9ydHMuZXEgPSBlcTtcbiAgICBmdW5jdGlvbiBlcShhLCBiLCBsb29zZSkge1xuICAgICAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpID09PSAwO1xuICAgIH1cbiAgICBleHBvcnRzLm5lcSA9IG5lcTtcbiAgICBmdW5jdGlvbiBuZXEoYSwgYiwgbG9vc2UpIHtcbiAgICAgIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSAhPT0gMDtcbiAgICB9XG4gICAgZXhwb3J0cy5ndGUgPSBndGU7XG4gICAgZnVuY3Rpb24gZ3RlKGEsIGIsIGxvb3NlKSB7XG4gICAgICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPj0gMDtcbiAgICB9XG4gICAgZXhwb3J0cy5sdGUgPSBsdGU7XG4gICAgZnVuY3Rpb24gbHRlKGEsIGIsIGxvb3NlKSB7XG4gICAgICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPD0gMDtcbiAgICB9XG4gICAgZXhwb3J0cy5jbXAgPSBjbXA7XG4gICAgZnVuY3Rpb24gY21wKGEsIG9wLCBiLCBsb29zZSkge1xuICAgICAgc3dpdGNoIChvcCkge1xuICAgICAgICBjYXNlIFwiPT09XCI6XG4gICAgICAgICAgaWYgKHR5cGVvZiBhID09PSBcIm9iamVjdFwiKVxuICAgICAgICAgICAgYSA9IGEudmVyc2lvbjtcbiAgICAgICAgICBpZiAodHlwZW9mIGIgPT09IFwib2JqZWN0XCIpXG4gICAgICAgICAgICBiID0gYi52ZXJzaW9uO1xuICAgICAgICAgIHJldHVybiBhID09PSBiO1xuICAgICAgICBjYXNlIFwiIT09XCI6XG4gICAgICAgICAgaWYgKHR5cGVvZiBhID09PSBcIm9iamVjdFwiKVxuICAgICAgICAgICAgYSA9IGEudmVyc2lvbjtcbiAgICAgICAgICBpZiAodHlwZW9mIGIgPT09IFwib2JqZWN0XCIpXG4gICAgICAgICAgICBiID0gYi52ZXJzaW9uO1xuICAgICAgICAgIHJldHVybiBhICE9PSBiO1xuICAgICAgICBjYXNlIFwiXCI6XG4gICAgICAgIGNhc2UgXCI9XCI6XG4gICAgICAgIGNhc2UgXCI9PVwiOlxuICAgICAgICAgIHJldHVybiBlcShhLCBiLCBsb29zZSk7XG4gICAgICAgIGNhc2UgXCIhPVwiOlxuICAgICAgICAgIHJldHVybiBuZXEoYSwgYiwgbG9vc2UpO1xuICAgICAgICBjYXNlIFwiPlwiOlxuICAgICAgICAgIHJldHVybiBndChhLCBiLCBsb29zZSk7XG4gICAgICAgIGNhc2UgXCI+PVwiOlxuICAgICAgICAgIHJldHVybiBndGUoYSwgYiwgbG9vc2UpO1xuICAgICAgICBjYXNlIFwiPFwiOlxuICAgICAgICAgIHJldHVybiBsdChhLCBiLCBsb29zZSk7XG4gICAgICAgIGNhc2UgXCI8PVwiOlxuICAgICAgICAgIHJldHVybiBsdGUoYSwgYiwgbG9vc2UpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIG9wZXJhdG9yOiBcIiArIG9wKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZXhwb3J0cy5Db21wYXJhdG9yID0gQ29tcGFyYXRvcjtcbiAgICBmdW5jdGlvbiBDb21wYXJhdG9yKGNvbXAsIG9wdGlvbnMpIHtcbiAgICAgIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICBvcHRpb25zID0ge1xuICAgICAgICAgIGxvb3NlOiAhIW9wdGlvbnMsXG4gICAgICAgICAgaW5jbHVkZVByZXJlbGVhc2U6IGZhbHNlXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoY29tcCBpbnN0YW5jZW9mIENvbXBhcmF0b3IpIHtcbiAgICAgICAgaWYgKGNvbXAubG9vc2UgPT09ICEhb3B0aW9ucy5sb29zZSkge1xuICAgICAgICAgIHJldHVybiBjb21wO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbXAgPSBjb21wLnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQ29tcGFyYXRvcikpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb21wYXJhdG9yKGNvbXAsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgICAgZGVidWcoXCJjb21wYXJhdG9yXCIsIGNvbXAsIG9wdGlvbnMpO1xuICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgIHRoaXMubG9vc2UgPSAhIW9wdGlvbnMubG9vc2U7XG4gICAgICB0aGlzLnBhcnNlKGNvbXApO1xuICAgICAgaWYgKHRoaXMuc2VtdmVyID09PSBBTlkpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IFwiXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5vcGVyYXRvciArIHRoaXMuc2VtdmVyLnZlcnNpb247XG4gICAgICB9XG4gICAgICBkZWJ1ZyhcImNvbXBcIiwgdGhpcyk7XG4gICAgfVxuICAgIHZhciBBTlkgPSB7fTtcbiAgICBDb21wYXJhdG9yLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGNvbXApIHtcbiAgICAgIHZhciByID0gdGhpcy5vcHRpb25zLmxvb3NlID8gcmVbdC5DT01QQVJBVE9STE9PU0VdIDogcmVbdC5DT01QQVJBVE9SXTtcbiAgICAgIHZhciBtID0gY29tcC5tYXRjaChyKTtcbiAgICAgIGlmICghbSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBjb21wYXJhdG9yOiBcIiArIGNvbXApO1xuICAgICAgfVxuICAgICAgdGhpcy5vcGVyYXRvciA9IG1bMV0gIT09IHZvaWQgMCA/IG1bMV0gOiBcIlwiO1xuICAgICAgaWYgKHRoaXMub3BlcmF0b3IgPT09IFwiPVwiKSB7XG4gICAgICAgIHRoaXMub3BlcmF0b3IgPSBcIlwiO1xuICAgICAgfVxuICAgICAgaWYgKCFtWzJdKSB7XG4gICAgICAgIHRoaXMuc2VtdmVyID0gQU5ZO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZW12ZXIgPSBuZXcgU2VtVmVyKG1bMl0sIHRoaXMub3B0aW9ucy5sb29zZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBDb21wYXJhdG9yLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfTtcbiAgICBDb21wYXJhdG9yLnByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24odmVyc2lvbikge1xuICAgICAgZGVidWcoXCJDb21wYXJhdG9yLnRlc3RcIiwgdmVyc2lvbiwgdGhpcy5vcHRpb25zLmxvb3NlKTtcbiAgICAgIGlmICh0aGlzLnNlbXZlciA9PT0gQU5ZIHx8IHZlcnNpb24gPT09IEFOWSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgdmVyc2lvbiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZlcnNpb24gPSBuZXcgU2VtVmVyKHZlcnNpb24sIHRoaXMub3B0aW9ucyk7XG4gICAgICAgIH0gY2F0Y2ggKGVyKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY21wKHZlcnNpb24sIHRoaXMub3BlcmF0b3IsIHRoaXMuc2VtdmVyLCB0aGlzLm9wdGlvbnMpO1xuICAgIH07XG4gICAgQ29tcGFyYXRvci5wcm90b3R5cGUuaW50ZXJzZWN0cyA9IGZ1bmN0aW9uKGNvbXAsIG9wdGlvbnMpIHtcbiAgICAgIGlmICghKGNvbXAgaW5zdGFuY2VvZiBDb21wYXJhdG9yKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiYSBDb21wYXJhdG9yIGlzIHJlcXVpcmVkXCIpO1xuICAgICAgfVxuICAgICAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgbG9vc2U6ICEhb3B0aW9ucyxcbiAgICAgICAgICBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHZhciByYW5nZVRtcDtcbiAgICAgIGlmICh0aGlzLm9wZXJhdG9yID09PSBcIlwiKSB7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlID09PSBcIlwiKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmFuZ2VUbXAgPSBuZXcgUmFuZ2UoY29tcC52YWx1ZSwgb3B0aW9ucyk7XG4gICAgICAgIHJldHVybiBzYXRpc2ZpZXModGhpcy52YWx1ZSwgcmFuZ2VUbXAsIG9wdGlvbnMpO1xuICAgICAgfSBlbHNlIGlmIChjb21wLm9wZXJhdG9yID09PSBcIlwiKSB7XG4gICAgICAgIGlmIChjb21wLnZhbHVlID09PSBcIlwiKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmFuZ2VUbXAgPSBuZXcgUmFuZ2UodGhpcy52YWx1ZSwgb3B0aW9ucyk7XG4gICAgICAgIHJldHVybiBzYXRpc2ZpZXMoY29tcC5zZW12ZXIsIHJhbmdlVG1wLCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICAgIHZhciBzYW1lRGlyZWN0aW9uSW5jcmVhc2luZyA9ICh0aGlzLm9wZXJhdG9yID09PSBcIj49XCIgfHwgdGhpcy5vcGVyYXRvciA9PT0gXCI+XCIpICYmIChjb21wLm9wZXJhdG9yID09PSBcIj49XCIgfHwgY29tcC5vcGVyYXRvciA9PT0gXCI+XCIpO1xuICAgICAgdmFyIHNhbWVEaXJlY3Rpb25EZWNyZWFzaW5nID0gKHRoaXMub3BlcmF0b3IgPT09IFwiPD1cIiB8fCB0aGlzLm9wZXJhdG9yID09PSBcIjxcIikgJiYgKGNvbXAub3BlcmF0b3IgPT09IFwiPD1cIiB8fCBjb21wLm9wZXJhdG9yID09PSBcIjxcIik7XG4gICAgICB2YXIgc2FtZVNlbVZlciA9IHRoaXMuc2VtdmVyLnZlcnNpb24gPT09IGNvbXAuc2VtdmVyLnZlcnNpb247XG4gICAgICB2YXIgZGlmZmVyZW50RGlyZWN0aW9uc0luY2x1c2l2ZSA9ICh0aGlzLm9wZXJhdG9yID09PSBcIj49XCIgfHwgdGhpcy5vcGVyYXRvciA9PT0gXCI8PVwiKSAmJiAoY29tcC5vcGVyYXRvciA9PT0gXCI+PVwiIHx8IGNvbXAub3BlcmF0b3IgPT09IFwiPD1cIik7XG4gICAgICB2YXIgb3Bwb3NpdGVEaXJlY3Rpb25zTGVzc1RoYW4gPSBjbXAodGhpcy5zZW12ZXIsIFwiPFwiLCBjb21wLnNlbXZlciwgb3B0aW9ucykgJiYgKCh0aGlzLm9wZXJhdG9yID09PSBcIj49XCIgfHwgdGhpcy5vcGVyYXRvciA9PT0gXCI+XCIpICYmIChjb21wLm9wZXJhdG9yID09PSBcIjw9XCIgfHwgY29tcC5vcGVyYXRvciA9PT0gXCI8XCIpKTtcbiAgICAgIHZhciBvcHBvc2l0ZURpcmVjdGlvbnNHcmVhdGVyVGhhbiA9IGNtcCh0aGlzLnNlbXZlciwgXCI+XCIsIGNvbXAuc2VtdmVyLCBvcHRpb25zKSAmJiAoKHRoaXMub3BlcmF0b3IgPT09IFwiPD1cIiB8fCB0aGlzLm9wZXJhdG9yID09PSBcIjxcIikgJiYgKGNvbXAub3BlcmF0b3IgPT09IFwiPj1cIiB8fCBjb21wLm9wZXJhdG9yID09PSBcIj5cIikpO1xuICAgICAgcmV0dXJuIHNhbWVEaXJlY3Rpb25JbmNyZWFzaW5nIHx8IHNhbWVEaXJlY3Rpb25EZWNyZWFzaW5nIHx8IHNhbWVTZW1WZXIgJiYgZGlmZmVyZW50RGlyZWN0aW9uc0luY2x1c2l2ZSB8fCBvcHBvc2l0ZURpcmVjdGlvbnNMZXNzVGhhbiB8fCBvcHBvc2l0ZURpcmVjdGlvbnNHcmVhdGVyVGhhbjtcbiAgICB9O1xuICAgIGV4cG9ydHMuUmFuZ2UgPSBSYW5nZTtcbiAgICBmdW5jdGlvbiBSYW5nZShyYW5nZSwgb3B0aW9ucykge1xuICAgICAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgbG9vc2U6ICEhb3B0aW9ucyxcbiAgICAgICAgICBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChyYW5nZSBpbnN0YW5jZW9mIFJhbmdlKSB7XG4gICAgICAgIGlmIChyYW5nZS5sb29zZSA9PT0gISFvcHRpb25zLmxvb3NlICYmIHJhbmdlLmluY2x1ZGVQcmVyZWxlYXNlID09PSAhIW9wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2UpIHtcbiAgICAgICAgICByZXR1cm4gcmFuZ2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBSYW5nZShyYW5nZS5yYXcsIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocmFuZ2UgaW5zdGFuY2VvZiBDb21wYXJhdG9yKSB7XG4gICAgICAgIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UudmFsdWUsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJhbmdlKSkge1xuICAgICAgICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICB0aGlzLmxvb3NlID0gISFvcHRpb25zLmxvb3NlO1xuICAgICAgdGhpcy5pbmNsdWRlUHJlcmVsZWFzZSA9ICEhb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZTtcbiAgICAgIHRoaXMucmF3ID0gcmFuZ2U7XG4gICAgICB0aGlzLnNldCA9IHJhbmdlLnNwbGl0KC9cXHMqXFx8XFx8XFxzKi8pLm1hcChmdW5jdGlvbihyYW5nZTIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VSYW5nZShyYW5nZTIudHJpbSgpKTtcbiAgICAgIH0sIHRoaXMpLmZpbHRlcihmdW5jdGlvbihjKSB7XG4gICAgICAgIHJldHVybiBjLmxlbmd0aDtcbiAgICAgIH0pO1xuICAgICAgaWYgKCF0aGlzLnNldC5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgU2VtVmVyIFJhbmdlOiBcIiArIHJhbmdlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZm9ybWF0KCk7XG4gICAgfVxuICAgIFJhbmdlLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucmFuZ2UgPSB0aGlzLnNldC5tYXAoZnVuY3Rpb24oY29tcHMpIHtcbiAgICAgICAgcmV0dXJuIGNvbXBzLmpvaW4oXCIgXCIpLnRyaW0oKTtcbiAgICAgIH0pLmpvaW4oXCJ8fFwiKS50cmltKCk7XG4gICAgICByZXR1cm4gdGhpcy5yYW5nZTtcbiAgICB9O1xuICAgIFJhbmdlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMucmFuZ2U7XG4gICAgfTtcbiAgICBSYW5nZS5wcm90b3R5cGUucGFyc2VSYW5nZSA9IGZ1bmN0aW9uKHJhbmdlKSB7XG4gICAgICB2YXIgbG9vc2UgPSB0aGlzLm9wdGlvbnMubG9vc2U7XG4gICAgICByYW5nZSA9IHJhbmdlLnRyaW0oKTtcbiAgICAgIHZhciBociA9IGxvb3NlID8gcmVbdC5IWVBIRU5SQU5HRUxPT1NFXSA6IHJlW3QuSFlQSEVOUkFOR0VdO1xuICAgICAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKGhyLCBoeXBoZW5SZXBsYWNlKTtcbiAgICAgIGRlYnVnKFwiaHlwaGVuIHJlcGxhY2VcIiwgcmFuZ2UpO1xuICAgICAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKHJlW3QuQ09NUEFSQVRPUlRSSU1dLCBjb21wYXJhdG9yVHJpbVJlcGxhY2UpO1xuICAgICAgZGVidWcoXCJjb21wYXJhdG9yIHRyaW1cIiwgcmFuZ2UsIHJlW3QuQ09NUEFSQVRPUlRSSU1dKTtcbiAgICAgIHJhbmdlID0gcmFuZ2UucmVwbGFjZShyZVt0LlRJTERFVFJJTV0sIHRpbGRlVHJpbVJlcGxhY2UpO1xuICAgICAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKHJlW3QuQ0FSRVRUUklNXSwgY2FyZXRUcmltUmVwbGFjZSk7XG4gICAgICByYW5nZSA9IHJhbmdlLnNwbGl0KC9cXHMrLykuam9pbihcIiBcIik7XG4gICAgICB2YXIgY29tcFJlID0gbG9vc2UgPyByZVt0LkNPTVBBUkFUT1JMT09TRV0gOiByZVt0LkNPTVBBUkFUT1JdO1xuICAgICAgdmFyIHNldCA9IHJhbmdlLnNwbGl0KFwiIFwiKS5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgICAgICByZXR1cm4gcGFyc2VDb21wYXJhdG9yKGNvbXAsIHRoaXMub3B0aW9ucyk7XG4gICAgICB9LCB0aGlzKS5qb2luKFwiIFwiKS5zcGxpdCgvXFxzKy8pO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5sb29zZSkge1xuICAgICAgICBzZXQgPSBzZXQuZmlsdGVyKGZ1bmN0aW9uKGNvbXApIHtcbiAgICAgICAgICByZXR1cm4gISFjb21wLm1hdGNoKGNvbXBSZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgc2V0ID0gc2V0Lm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29tcGFyYXRvcihjb21wLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgfSwgdGhpcyk7XG4gICAgICByZXR1cm4gc2V0O1xuICAgIH07XG4gICAgUmFuZ2UucHJvdG90eXBlLmludGVyc2VjdHMgPSBmdW5jdGlvbihyYW5nZSwgb3B0aW9ucykge1xuICAgICAgaWYgKCEocmFuZ2UgaW5zdGFuY2VvZiBSYW5nZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImEgUmFuZ2UgaXMgcmVxdWlyZWRcIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5zZXQuc29tZShmdW5jdGlvbih0aGlzQ29tcGFyYXRvcnMpIHtcbiAgICAgICAgcmV0dXJuIGlzU2F0aXNmaWFibGUodGhpc0NvbXBhcmF0b3JzLCBvcHRpb25zKSAmJiByYW5nZS5zZXQuc29tZShmdW5jdGlvbihyYW5nZUNvbXBhcmF0b3JzKSB7XG4gICAgICAgICAgcmV0dXJuIGlzU2F0aXNmaWFibGUocmFuZ2VDb21wYXJhdG9ycywgb3B0aW9ucykgJiYgdGhpc0NvbXBhcmF0b3JzLmV2ZXJ5KGZ1bmN0aW9uKHRoaXNDb21wYXJhdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gcmFuZ2VDb21wYXJhdG9ycy5ldmVyeShmdW5jdGlvbihyYW5nZUNvbXBhcmF0b3IpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXNDb21wYXJhdG9yLmludGVyc2VjdHMocmFuZ2VDb21wYXJhdG9yLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgZnVuY3Rpb24gaXNTYXRpc2ZpYWJsZShjb21wYXJhdG9ycywgb3B0aW9ucykge1xuICAgICAgdmFyIHJlc3VsdCA9IHRydWU7XG4gICAgICB2YXIgcmVtYWluaW5nQ29tcGFyYXRvcnMgPSBjb21wYXJhdG9ycy5zbGljZSgpO1xuICAgICAgdmFyIHRlc3RDb21wYXJhdG9yID0gcmVtYWluaW5nQ29tcGFyYXRvcnMucG9wKCk7XG4gICAgICB3aGlsZSAocmVzdWx0ICYmIHJlbWFpbmluZ0NvbXBhcmF0b3JzLmxlbmd0aCkge1xuICAgICAgICByZXN1bHQgPSByZW1haW5pbmdDb21wYXJhdG9ycy5ldmVyeShmdW5jdGlvbihvdGhlckNvbXBhcmF0b3IpIHtcbiAgICAgICAgICByZXR1cm4gdGVzdENvbXBhcmF0b3IuaW50ZXJzZWN0cyhvdGhlckNvbXBhcmF0b3IsIG9wdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGVzdENvbXBhcmF0b3IgPSByZW1haW5pbmdDb21wYXJhdG9ycy5wb3AoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGV4cG9ydHMudG9Db21wYXJhdG9ycyA9IHRvQ29tcGFyYXRvcnM7XG4gICAgZnVuY3Rpb24gdG9Db21wYXJhdG9ycyhyYW5nZSwgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucykuc2V0Lm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgICAgIHJldHVybiBjb21wLm1hcChmdW5jdGlvbihjKSB7XG4gICAgICAgICAgcmV0dXJuIGMudmFsdWU7XG4gICAgICAgIH0pLmpvaW4oXCIgXCIpLnRyaW0oKS5zcGxpdChcIiBcIik7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcGFyc2VDb21wYXJhdG9yKGNvbXAsIG9wdGlvbnMpIHtcbiAgICAgIGRlYnVnKFwiY29tcFwiLCBjb21wLCBvcHRpb25zKTtcbiAgICAgIGNvbXAgPSByZXBsYWNlQ2FyZXRzKGNvbXAsIG9wdGlvbnMpO1xuICAgICAgZGVidWcoXCJjYXJldFwiLCBjb21wKTtcbiAgICAgIGNvbXAgPSByZXBsYWNlVGlsZGVzKGNvbXAsIG9wdGlvbnMpO1xuICAgICAgZGVidWcoXCJ0aWxkZXNcIiwgY29tcCk7XG4gICAgICBjb21wID0gcmVwbGFjZVhSYW5nZXMoY29tcCwgb3B0aW9ucyk7XG4gICAgICBkZWJ1ZyhcInhyYW5nZVwiLCBjb21wKTtcbiAgICAgIGNvbXAgPSByZXBsYWNlU3RhcnMoY29tcCwgb3B0aW9ucyk7XG4gICAgICBkZWJ1ZyhcInN0YXJzXCIsIGNvbXApO1xuICAgICAgcmV0dXJuIGNvbXA7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzWChpZCkge1xuICAgICAgcmV0dXJuICFpZCB8fCBpZC50b0xvd2VyQ2FzZSgpID09PSBcInhcIiB8fCBpZCA9PT0gXCIqXCI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlcGxhY2VUaWxkZXMoY29tcCwgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIGNvbXAudHJpbSgpLnNwbGl0KC9cXHMrLykubWFwKGZ1bmN0aW9uKGNvbXAyKSB7XG4gICAgICAgIHJldHVybiByZXBsYWNlVGlsZGUoY29tcDIsIG9wdGlvbnMpO1xuICAgICAgfSkuam9pbihcIiBcIik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlcGxhY2VUaWxkZShjb21wLCBvcHRpb25zKSB7XG4gICAgICB2YXIgciA9IG9wdGlvbnMubG9vc2UgPyByZVt0LlRJTERFTE9PU0VdIDogcmVbdC5USUxERV07XG4gICAgICByZXR1cm4gY29tcC5yZXBsYWNlKHIsIGZ1bmN0aW9uKF8sIE0sIG0sIHAsIHByKSB7XG4gICAgICAgIGRlYnVnKFwidGlsZGVcIiwgY29tcCwgXywgTSwgbSwgcCwgcHIpO1xuICAgICAgICB2YXIgcmV0O1xuICAgICAgICBpZiAoaXNYKE0pKSB7XG4gICAgICAgICAgcmV0ID0gXCJcIjtcbiAgICAgICAgfSBlbHNlIGlmIChpc1gobSkpIHtcbiAgICAgICAgICByZXQgPSBcIj49XCIgKyBNICsgXCIuMC4wIDxcIiArICgrTSArIDEpICsgXCIuMC4wXCI7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNYKHApKSB7XG4gICAgICAgICAgcmV0ID0gXCI+PVwiICsgTSArIFwiLlwiICsgbSArIFwiLjAgPFwiICsgTSArIFwiLlwiICsgKCttICsgMSkgKyBcIi4wXCI7XG4gICAgICAgIH0gZWxzZSBpZiAocHIpIHtcbiAgICAgICAgICBkZWJ1ZyhcInJlcGxhY2VUaWxkZSBwclwiLCBwcik7XG4gICAgICAgICAgcmV0ID0gXCI+PVwiICsgTSArIFwiLlwiICsgbSArIFwiLlwiICsgcCArIFwiLVwiICsgcHIgKyBcIiA8XCIgKyBNICsgXCIuXCIgKyAoK20gKyAxKSArIFwiLjBcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXQgPSBcIj49XCIgKyBNICsgXCIuXCIgKyBtICsgXCIuXCIgKyBwICsgXCIgPFwiICsgTSArIFwiLlwiICsgKCttICsgMSkgKyBcIi4wXCI7XG4gICAgICAgIH1cbiAgICAgICAgZGVidWcoXCJ0aWxkZSByZXR1cm5cIiwgcmV0KTtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZXBsYWNlQ2FyZXRzKGNvbXAsIG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBjb21wLnRyaW0oKS5zcGxpdCgvXFxzKy8pLm1hcChmdW5jdGlvbihjb21wMikge1xuICAgICAgICByZXR1cm4gcmVwbGFjZUNhcmV0KGNvbXAyLCBvcHRpb25zKTtcbiAgICAgIH0pLmpvaW4oXCIgXCIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZXBsYWNlQ2FyZXQoY29tcCwgb3B0aW9ucykge1xuICAgICAgZGVidWcoXCJjYXJldFwiLCBjb21wLCBvcHRpb25zKTtcbiAgICAgIHZhciByID0gb3B0aW9ucy5sb29zZSA/IHJlW3QuQ0FSRVRMT09TRV0gOiByZVt0LkNBUkVUXTtcbiAgICAgIHJldHVybiBjb21wLnJlcGxhY2UociwgZnVuY3Rpb24oXywgTSwgbSwgcCwgcHIpIHtcbiAgICAgICAgZGVidWcoXCJjYXJldFwiLCBjb21wLCBfLCBNLCBtLCBwLCBwcik7XG4gICAgICAgIHZhciByZXQ7XG4gICAgICAgIGlmIChpc1goTSkpIHtcbiAgICAgICAgICByZXQgPSBcIlwiO1xuICAgICAgICB9IGVsc2UgaWYgKGlzWChtKSkge1xuICAgICAgICAgIHJldCA9IFwiPj1cIiArIE0gKyBcIi4wLjAgPFwiICsgKCtNICsgMSkgKyBcIi4wLjBcIjtcbiAgICAgICAgfSBlbHNlIGlmIChpc1gocCkpIHtcbiAgICAgICAgICBpZiAoTSA9PT0gXCIwXCIpIHtcbiAgICAgICAgICAgIHJldCA9IFwiPj1cIiArIE0gKyBcIi5cIiArIG0gKyBcIi4wIDxcIiArIE0gKyBcIi5cIiArICgrbSArIDEpICsgXCIuMFwiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXQgPSBcIj49XCIgKyBNICsgXCIuXCIgKyBtICsgXCIuMCA8XCIgKyAoK00gKyAxKSArIFwiLjAuMFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChwcikge1xuICAgICAgICAgIGRlYnVnKFwicmVwbGFjZUNhcmV0IHByXCIsIHByKTtcbiAgICAgICAgICBpZiAoTSA9PT0gXCIwXCIpIHtcbiAgICAgICAgICAgIGlmIChtID09PSBcIjBcIikge1xuICAgICAgICAgICAgICByZXQgPSBcIj49XCIgKyBNICsgXCIuXCIgKyBtICsgXCIuXCIgKyBwICsgXCItXCIgKyBwciArIFwiIDxcIiArIE0gKyBcIi5cIiArIG0gKyBcIi5cIiArICgrcCArIDEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0ID0gXCI+PVwiICsgTSArIFwiLlwiICsgbSArIFwiLlwiICsgcCArIFwiLVwiICsgcHIgKyBcIiA8XCIgKyBNICsgXCIuXCIgKyAoK20gKyAxKSArIFwiLjBcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0ID0gXCI+PVwiICsgTSArIFwiLlwiICsgbSArIFwiLlwiICsgcCArIFwiLVwiICsgcHIgKyBcIiA8XCIgKyAoK00gKyAxKSArIFwiLjAuMFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWJ1ZyhcIm5vIHByXCIpO1xuICAgICAgICAgIGlmIChNID09PSBcIjBcIikge1xuICAgICAgICAgICAgaWYgKG0gPT09IFwiMFwiKSB7XG4gICAgICAgICAgICAgIHJldCA9IFwiPj1cIiArIE0gKyBcIi5cIiArIG0gKyBcIi5cIiArIHAgKyBcIiA8XCIgKyBNICsgXCIuXCIgKyBtICsgXCIuXCIgKyAoK3AgKyAxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldCA9IFwiPj1cIiArIE0gKyBcIi5cIiArIG0gKyBcIi5cIiArIHAgKyBcIiA8XCIgKyBNICsgXCIuXCIgKyAoK20gKyAxKSArIFwiLjBcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0ID0gXCI+PVwiICsgTSArIFwiLlwiICsgbSArIFwiLlwiICsgcCArIFwiIDxcIiArICgrTSArIDEpICsgXCIuMC4wXCI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGRlYnVnKFwiY2FyZXQgcmV0dXJuXCIsIHJldCk7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVwbGFjZVhSYW5nZXMoY29tcCwgb3B0aW9ucykge1xuICAgICAgZGVidWcoXCJyZXBsYWNlWFJhbmdlc1wiLCBjb21wLCBvcHRpb25zKTtcbiAgICAgIHJldHVybiBjb21wLnNwbGl0KC9cXHMrLykubWFwKGZ1bmN0aW9uKGNvbXAyKSB7XG4gICAgICAgIHJldHVybiByZXBsYWNlWFJhbmdlKGNvbXAyLCBvcHRpb25zKTtcbiAgICAgIH0pLmpvaW4oXCIgXCIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZXBsYWNlWFJhbmdlKGNvbXAsIG9wdGlvbnMpIHtcbiAgICAgIGNvbXAgPSBjb21wLnRyaW0oKTtcbiAgICAgIHZhciByID0gb3B0aW9ucy5sb29zZSA/IHJlW3QuWFJBTkdFTE9PU0VdIDogcmVbdC5YUkFOR0VdO1xuICAgICAgcmV0dXJuIGNvbXAucmVwbGFjZShyLCBmdW5jdGlvbihyZXQsIGd0bHQsIE0sIG0sIHAsIHByKSB7XG4gICAgICAgIGRlYnVnKFwieFJhbmdlXCIsIGNvbXAsIHJldCwgZ3RsdCwgTSwgbSwgcCwgcHIpO1xuICAgICAgICB2YXIgeE0gPSBpc1goTSk7XG4gICAgICAgIHZhciB4bSA9IHhNIHx8IGlzWChtKTtcbiAgICAgICAgdmFyIHhwID0geG0gfHwgaXNYKHApO1xuICAgICAgICB2YXIgYW55WCA9IHhwO1xuICAgICAgICBpZiAoZ3RsdCA9PT0gXCI9XCIgJiYgYW55WCkge1xuICAgICAgICAgIGd0bHQgPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIHByID0gb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZSA/IFwiLTBcIiA6IFwiXCI7XG4gICAgICAgIGlmICh4TSkge1xuICAgICAgICAgIGlmIChndGx0ID09PSBcIj5cIiB8fCBndGx0ID09PSBcIjxcIikge1xuICAgICAgICAgICAgcmV0ID0gXCI8MC4wLjAtMFwiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXQgPSBcIipcIjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZ3RsdCAmJiBhbnlYKSB7XG4gICAgICAgICAgaWYgKHhtKSB7XG4gICAgICAgICAgICBtID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcCA9IDA7XG4gICAgICAgICAgaWYgKGd0bHQgPT09IFwiPlwiKSB7XG4gICAgICAgICAgICBndGx0ID0gXCI+PVwiO1xuICAgICAgICAgICAgaWYgKHhtKSB7XG4gICAgICAgICAgICAgIE0gPSArTSArIDE7XG4gICAgICAgICAgICAgIG0gPSAwO1xuICAgICAgICAgICAgICBwID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG0gPSArbSArIDE7XG4gICAgICAgICAgICAgIHAgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoZ3RsdCA9PT0gXCI8PVwiKSB7XG4gICAgICAgICAgICBndGx0ID0gXCI8XCI7XG4gICAgICAgICAgICBpZiAoeG0pIHtcbiAgICAgICAgICAgICAgTSA9ICtNICsgMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG0gPSArbSArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldCA9IGd0bHQgKyBNICsgXCIuXCIgKyBtICsgXCIuXCIgKyBwICsgcHI7XG4gICAgICAgIH0gZWxzZSBpZiAoeG0pIHtcbiAgICAgICAgICByZXQgPSBcIj49XCIgKyBNICsgXCIuMC4wXCIgKyBwciArIFwiIDxcIiArICgrTSArIDEpICsgXCIuMC4wXCIgKyBwcjtcbiAgICAgICAgfSBlbHNlIGlmICh4cCkge1xuICAgICAgICAgIHJldCA9IFwiPj1cIiArIE0gKyBcIi5cIiArIG0gKyBcIi4wXCIgKyBwciArIFwiIDxcIiArIE0gKyBcIi5cIiArICgrbSArIDEpICsgXCIuMFwiICsgcHI7XG4gICAgICAgIH1cbiAgICAgICAgZGVidWcoXCJ4UmFuZ2UgcmV0dXJuXCIsIHJldCk7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVwbGFjZVN0YXJzKGNvbXAsIG9wdGlvbnMpIHtcbiAgICAgIGRlYnVnKFwicmVwbGFjZVN0YXJzXCIsIGNvbXAsIG9wdGlvbnMpO1xuICAgICAgcmV0dXJuIGNvbXAudHJpbSgpLnJlcGxhY2UocmVbdC5TVEFSXSwgXCJcIik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGh5cGhlblJlcGxhY2UoJDAsIGZyb20sIGZNLCBmbSwgZnAsIGZwciwgZmIsIHRvLCB0TSwgdG0sIHRwLCB0cHIsIHRiKSB7XG4gICAgICBpZiAoaXNYKGZNKSkge1xuICAgICAgICBmcm9tID0gXCJcIjtcbiAgICAgIH0gZWxzZSBpZiAoaXNYKGZtKSkge1xuICAgICAgICBmcm9tID0gXCI+PVwiICsgZk0gKyBcIi4wLjBcIjtcbiAgICAgIH0gZWxzZSBpZiAoaXNYKGZwKSkge1xuICAgICAgICBmcm9tID0gXCI+PVwiICsgZk0gKyBcIi5cIiArIGZtICsgXCIuMFwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnJvbSA9IFwiPj1cIiArIGZyb207XG4gICAgICB9XG4gICAgICBpZiAoaXNYKHRNKSkge1xuICAgICAgICB0byA9IFwiXCI7XG4gICAgICB9IGVsc2UgaWYgKGlzWCh0bSkpIHtcbiAgICAgICAgdG8gPSBcIjxcIiArICgrdE0gKyAxKSArIFwiLjAuMFwiO1xuICAgICAgfSBlbHNlIGlmIChpc1godHApKSB7XG4gICAgICAgIHRvID0gXCI8XCIgKyB0TSArIFwiLlwiICsgKCt0bSArIDEpICsgXCIuMFwiO1xuICAgICAgfSBlbHNlIGlmICh0cHIpIHtcbiAgICAgICAgdG8gPSBcIjw9XCIgKyB0TSArIFwiLlwiICsgdG0gKyBcIi5cIiArIHRwICsgXCItXCIgKyB0cHI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0byA9IFwiPD1cIiArIHRvO1xuICAgICAgfVxuICAgICAgcmV0dXJuIChmcm9tICsgXCIgXCIgKyB0bykudHJpbSgpO1xuICAgIH1cbiAgICBSYW5nZS5wcm90b3R5cGUudGVzdCA9IGZ1bmN0aW9uKHZlcnNpb24pIHtcbiAgICAgIGlmICghdmVyc2lvbikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHZlcnNpb24gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2ZXJzaW9uID0gbmV3IFNlbVZlcih2ZXJzaW9uLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICB9IGNhdGNoIChlcikge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZm9yICh2YXIgaTIgPSAwOyBpMiA8IHRoaXMuc2V0Lmxlbmd0aDsgaTIrKykge1xuICAgICAgICBpZiAodGVzdFNldCh0aGlzLnNldFtpMl0sIHZlcnNpb24sIHRoaXMub3B0aW9ucykpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gICAgZnVuY3Rpb24gdGVzdFNldChzZXQsIHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgICAgIGZvciAodmFyIGkyID0gMDsgaTIgPCBzZXQubGVuZ3RoOyBpMisrKSB7XG4gICAgICAgIGlmICghc2V0W2kyXS50ZXN0KHZlcnNpb24pKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodmVyc2lvbi5wcmVyZWxlYXNlLmxlbmd0aCAmJiAhb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZSkge1xuICAgICAgICBmb3IgKGkyID0gMDsgaTIgPCBzZXQubGVuZ3RoOyBpMisrKSB7XG4gICAgICAgICAgZGVidWcoc2V0W2kyXS5zZW12ZXIpO1xuICAgICAgICAgIGlmIChzZXRbaTJdLnNlbXZlciA9PT0gQU5ZKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHNldFtpMl0uc2VtdmVyLnByZXJlbGVhc2UubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdmFyIGFsbG93ZWQgPSBzZXRbaTJdLnNlbXZlcjtcbiAgICAgICAgICAgIGlmIChhbGxvd2VkLm1ham9yID09PSB2ZXJzaW9uLm1ham9yICYmIGFsbG93ZWQubWlub3IgPT09IHZlcnNpb24ubWlub3IgJiYgYWxsb3dlZC5wYXRjaCA9PT0gdmVyc2lvbi5wYXRjaCkge1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGV4cG9ydHMuc2F0aXNmaWVzID0gc2F0aXNmaWVzO1xuICAgIGZ1bmN0aW9uIHNhdGlzZmllcyh2ZXJzaW9uLCByYW5nZSwgb3B0aW9ucykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmFuZ2UgPSBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpO1xuICAgICAgfSBjYXRjaCAoZXIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJhbmdlLnRlc3QodmVyc2lvbik7XG4gICAgfVxuICAgIGV4cG9ydHMubWF4U2F0aXNmeWluZyA9IG1heFNhdGlzZnlpbmc7XG4gICAgZnVuY3Rpb24gbWF4U2F0aXNmeWluZyh2ZXJzaW9ucywgcmFuZ2UsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBtYXggPSBudWxsO1xuICAgICAgdmFyIG1heFNWID0gbnVsbDtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciByYW5nZU9iaiA9IG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucyk7XG4gICAgICB9IGNhdGNoIChlcikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHZlcnNpb25zLmZvckVhY2goZnVuY3Rpb24odikge1xuICAgICAgICBpZiAocmFuZ2VPYmoudGVzdCh2KSkge1xuICAgICAgICAgIGlmICghbWF4IHx8IG1heFNWLmNvbXBhcmUodikgPT09IC0xKSB7XG4gICAgICAgICAgICBtYXggPSB2O1xuICAgICAgICAgICAgbWF4U1YgPSBuZXcgU2VtVmVyKG1heCwgb3B0aW9ucyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBtYXg7XG4gICAgfVxuICAgIGV4cG9ydHMubWluU2F0aXNmeWluZyA9IG1pblNhdGlzZnlpbmc7XG4gICAgZnVuY3Rpb24gbWluU2F0aXNmeWluZyh2ZXJzaW9ucywgcmFuZ2UsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBtaW4gPSBudWxsO1xuICAgICAgdmFyIG1pblNWID0gbnVsbDtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciByYW5nZU9iaiA9IG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucyk7XG4gICAgICB9IGNhdGNoIChlcikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHZlcnNpb25zLmZvckVhY2goZnVuY3Rpb24odikge1xuICAgICAgICBpZiAocmFuZ2VPYmoudGVzdCh2KSkge1xuICAgICAgICAgIGlmICghbWluIHx8IG1pblNWLmNvbXBhcmUodikgPT09IDEpIHtcbiAgICAgICAgICAgIG1pbiA9IHY7XG4gICAgICAgICAgICBtaW5TViA9IG5ldyBTZW1WZXIobWluLCBvcHRpb25zKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG1pbjtcbiAgICB9XG4gICAgZXhwb3J0cy5taW5WZXJzaW9uID0gbWluVmVyc2lvbjtcbiAgICBmdW5jdGlvbiBtaW5WZXJzaW9uKHJhbmdlLCBsb29zZSkge1xuICAgICAgcmFuZ2UgPSBuZXcgUmFuZ2UocmFuZ2UsIGxvb3NlKTtcbiAgICAgIHZhciBtaW52ZXIgPSBuZXcgU2VtVmVyKFwiMC4wLjBcIik7XG4gICAgICBpZiAocmFuZ2UudGVzdChtaW52ZXIpKSB7XG4gICAgICAgIHJldHVybiBtaW52ZXI7XG4gICAgICB9XG4gICAgICBtaW52ZXIgPSBuZXcgU2VtVmVyKFwiMC4wLjAtMFwiKTtcbiAgICAgIGlmIChyYW5nZS50ZXN0KG1pbnZlcikpIHtcbiAgICAgICAgcmV0dXJuIG1pbnZlcjtcbiAgICAgIH1cbiAgICAgIG1pbnZlciA9IG51bGw7XG4gICAgICBmb3IgKHZhciBpMiA9IDA7IGkyIDwgcmFuZ2Uuc2V0Lmxlbmd0aDsgKytpMikge1xuICAgICAgICB2YXIgY29tcGFyYXRvcnMgPSByYW5nZS5zZXRbaTJdO1xuICAgICAgICBjb21wYXJhdG9ycy5mb3JFYWNoKGZ1bmN0aW9uKGNvbXBhcmF0b3IpIHtcbiAgICAgICAgICB2YXIgY29tcHZlciA9IG5ldyBTZW1WZXIoY29tcGFyYXRvci5zZW12ZXIudmVyc2lvbik7XG4gICAgICAgICAgc3dpdGNoIChjb21wYXJhdG9yLm9wZXJhdG9yKSB7XG4gICAgICAgICAgICBjYXNlIFwiPlwiOlxuICAgICAgICAgICAgICBpZiAoY29tcHZlci5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbXB2ZXIucGF0Y2grKztcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb21wdmVyLnByZXJlbGVhc2UucHVzaCgwKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb21wdmVyLnJhdyA9IGNvbXB2ZXIuZm9ybWF0KCk7XG4gICAgICAgICAgICAvKiBmYWxsdGhyb3VnaCAqL1xuICAgICAgICAgICAgY2FzZSBcIlwiOlxuICAgICAgICAgICAgY2FzZSBcIj49XCI6XG4gICAgICAgICAgICAgIGlmICghbWludmVyIHx8IGd0KG1pbnZlciwgY29tcHZlcikpIHtcbiAgICAgICAgICAgICAgICBtaW52ZXIgPSBjb21wdmVyO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIjxcIjpcbiAgICAgICAgICAgIGNhc2UgXCI8PVwiOlxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIG9wZXJhdGlvbjogXCIgKyBjb21wYXJhdG9yLm9wZXJhdG9yKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKG1pbnZlciAmJiByYW5nZS50ZXN0KG1pbnZlcikpIHtcbiAgICAgICAgcmV0dXJuIG1pbnZlcjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHBvcnRzLnZhbGlkUmFuZ2UgPSB2YWxpZFJhbmdlO1xuICAgIGZ1bmN0aW9uIHZhbGlkUmFuZ2UocmFuZ2UsIG9wdGlvbnMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpLnJhbmdlIHx8IFwiKlwiO1xuICAgICAgfSBjYXRjaCAoZXIpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIGV4cG9ydHMubHRyID0gbHRyO1xuICAgIGZ1bmN0aW9uIGx0cih2ZXJzaW9uLCByYW5nZSwgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIG91dHNpZGUodmVyc2lvbiwgcmFuZ2UsIFwiPFwiLCBvcHRpb25zKTtcbiAgICB9XG4gICAgZXhwb3J0cy5ndHIgPSBndHI7XG4gICAgZnVuY3Rpb24gZ3RyKHZlcnNpb24sIHJhbmdlLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gb3V0c2lkZSh2ZXJzaW9uLCByYW5nZSwgXCI+XCIsIG9wdGlvbnMpO1xuICAgIH1cbiAgICBleHBvcnRzLm91dHNpZGUgPSBvdXRzaWRlO1xuICAgIGZ1bmN0aW9uIG91dHNpZGUodmVyc2lvbiwgcmFuZ2UsIGhpbG8sIG9wdGlvbnMpIHtcbiAgICAgIHZlcnNpb24gPSBuZXcgU2VtVmVyKHZlcnNpb24sIG9wdGlvbnMpO1xuICAgICAgcmFuZ2UgPSBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpO1xuICAgICAgdmFyIGd0Zm4sIGx0ZWZuLCBsdGZuLCBjb21wLCBlY29tcDtcbiAgICAgIHN3aXRjaCAoaGlsbykge1xuICAgICAgICBjYXNlIFwiPlwiOlxuICAgICAgICAgIGd0Zm4gPSBndDtcbiAgICAgICAgICBsdGVmbiA9IGx0ZTtcbiAgICAgICAgICBsdGZuID0gbHQ7XG4gICAgICAgICAgY29tcCA9IFwiPlwiO1xuICAgICAgICAgIGVjb21wID0gXCI+PVwiO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiPFwiOlxuICAgICAgICAgIGd0Zm4gPSBsdDtcbiAgICAgICAgICBsdGVmbiA9IGd0ZTtcbiAgICAgICAgICBsdGZuID0gZ3Q7XG4gICAgICAgICAgY29tcCA9IFwiPFwiO1xuICAgICAgICAgIGVjb21wID0gXCI8PVwiO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ011c3QgcHJvdmlkZSBhIGhpbG8gdmFsIG9mIFwiPFwiIG9yIFwiPlwiJyk7XG4gICAgICB9XG4gICAgICBpZiAoc2F0aXNmaWVzKHZlcnNpb24sIHJhbmdlLCBvcHRpb25zKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpMiA9IDA7IGkyIDwgcmFuZ2Uuc2V0Lmxlbmd0aDsgKytpMikge1xuICAgICAgICB2YXIgY29tcGFyYXRvcnMgPSByYW5nZS5zZXRbaTJdO1xuICAgICAgICB2YXIgaGlnaCA9IG51bGw7XG4gICAgICAgIHZhciBsb3cgPSBudWxsO1xuICAgICAgICBjb21wYXJhdG9ycy5mb3JFYWNoKGZ1bmN0aW9uKGNvbXBhcmF0b3IpIHtcbiAgICAgICAgICBpZiAoY29tcGFyYXRvci5zZW12ZXIgPT09IEFOWSkge1xuICAgICAgICAgICAgY29tcGFyYXRvciA9IG5ldyBDb21wYXJhdG9yKFwiPj0wLjAuMFwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaGlnaCA9IGhpZ2ggfHwgY29tcGFyYXRvcjtcbiAgICAgICAgICBsb3cgPSBsb3cgfHwgY29tcGFyYXRvcjtcbiAgICAgICAgICBpZiAoZ3Rmbihjb21wYXJhdG9yLnNlbXZlciwgaGlnaC5zZW12ZXIsIG9wdGlvbnMpKSB7XG4gICAgICAgICAgICBoaWdoID0gY29tcGFyYXRvcjtcbiAgICAgICAgICB9IGVsc2UgaWYgKGx0Zm4oY29tcGFyYXRvci5zZW12ZXIsIGxvdy5zZW12ZXIsIG9wdGlvbnMpKSB7XG4gICAgICAgICAgICBsb3cgPSBjb21wYXJhdG9yO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChoaWdoLm9wZXJhdG9yID09PSBjb21wIHx8IGhpZ2gub3BlcmF0b3IgPT09IGVjb21wKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgoIWxvdy5vcGVyYXRvciB8fCBsb3cub3BlcmF0b3IgPT09IGNvbXApICYmIGx0ZWZuKHZlcnNpb24sIGxvdy5zZW12ZXIpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGxvdy5vcGVyYXRvciA9PT0gZWNvbXAgJiYgbHRmbih2ZXJzaW9uLCBsb3cuc2VtdmVyKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGV4cG9ydHMucHJlcmVsZWFzZSA9IHByZXJlbGVhc2U7XG4gICAgZnVuY3Rpb24gcHJlcmVsZWFzZSh2ZXJzaW9uLCBvcHRpb25zKSB7XG4gICAgICB2YXIgcGFyc2VkID0gcGFyc2UodmVyc2lvbiwgb3B0aW9ucyk7XG4gICAgICByZXR1cm4gcGFyc2VkICYmIHBhcnNlZC5wcmVyZWxlYXNlLmxlbmd0aCA/IHBhcnNlZC5wcmVyZWxlYXNlIDogbnVsbDtcbiAgICB9XG4gICAgZXhwb3J0cy5pbnRlcnNlY3RzID0gaW50ZXJzZWN0cztcbiAgICBmdW5jdGlvbiBpbnRlcnNlY3RzKHIxLCByMiwgb3B0aW9ucykge1xuICAgICAgcjEgPSBuZXcgUmFuZ2UocjEsIG9wdGlvbnMpO1xuICAgICAgcjIgPSBuZXcgUmFuZ2UocjIsIG9wdGlvbnMpO1xuICAgICAgcmV0dXJuIHIxLmludGVyc2VjdHMocjIpO1xuICAgIH1cbiAgICBleHBvcnRzLmNvZXJjZSA9IGNvZXJjZTtcbiAgICBmdW5jdGlvbiBjb2VyY2UodmVyc2lvbiwgb3B0aW9ucykge1xuICAgICAgaWYgKHZlcnNpb24gaW5zdGFuY2VvZiBTZW1WZXIpIHtcbiAgICAgICAgcmV0dXJuIHZlcnNpb247XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHZlcnNpb24gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgdmVyc2lvbiA9IFN0cmluZyh2ZXJzaW9uKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgdmVyc2lvbiAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgdmFyIG1hdGNoID0gbnVsbDtcbiAgICAgIGlmICghb3B0aW9ucy5ydGwpIHtcbiAgICAgICAgbWF0Y2ggPSB2ZXJzaW9uLm1hdGNoKHJlW3QuQ09FUkNFXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbmV4dDtcbiAgICAgICAgd2hpbGUgKChuZXh0ID0gcmVbdC5DT0VSQ0VSVExdLmV4ZWModmVyc2lvbikpICYmICghbWF0Y2ggfHwgbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGggIT09IHZlcnNpb24ubGVuZ3RoKSkge1xuICAgICAgICAgIGlmICghbWF0Y2ggfHwgbmV4dC5pbmRleCArIG5leHRbMF0ubGVuZ3RoICE9PSBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCkge1xuICAgICAgICAgICAgbWF0Y2ggPSBuZXh0O1xuICAgICAgICAgIH1cbiAgICAgICAgICByZVt0LkNPRVJDRVJUTF0ubGFzdEluZGV4ID0gbmV4dC5pbmRleCArIG5leHRbMV0ubGVuZ3RoICsgbmV4dFsyXS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmVbdC5DT0VSQ0VSVExdLmxhc3RJbmRleCA9IC0xO1xuICAgICAgfVxuICAgICAgaWYgKG1hdGNoID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBhcnNlKG1hdGNoWzJdICsgXCIuXCIgKyAobWF0Y2hbM10gfHwgXCIwXCIpICsgXCIuXCIgKyAobWF0Y2hbNF0gfHwgXCIwXCIpLCBvcHRpb25zKTtcbiAgICB9XG4gIH1cbn0pO1xuZXhwb3J0IGRlZmF1bHQgcmVxdWlyZV9zZW12ZXIoKTtcbiIsICJpbXBvcnQgc2VtdmVyIGZyb20gJ0BjY2xvYWRlcjMvY29tbW9uL3ZlbmRvci1saWJzL3NlbXZlcic7XG5pbXBvcnQgKiBhcyBwYXRocyBmcm9tICdAY2Nsb2FkZXIzL2NvbW1vbi9wYXRocyc7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tICdAY2Nsb2FkZXIzL2NvbW1vbi91dGlscyc7XG5pbXBvcnQgKiBhcyBmaWxlcyBmcm9tICcuL2ZpbGVzJztcbmltcG9ydCB7IE1hbmlmZXN0IH0gZnJvbSAndWx0aW1hdGUtY3Jvc3Njb2RlLXR5cGVkZWZzL2ZpbGUtdHlwZXMvbW9kLW1hbmlmZXN0JztcbmltcG9ydCB7XG4gIERlcGVuZGVuY3ksXG4gIExlZ2FjeVBsdWdpbkNsYXNzLFxuICBMb2FkaW5nU3RhZ2UsXG4gIE1vZElELFxuICBNb2QgYXMgTW9kUHVibGljLFxuICBQbHVnaW5DbGFzcyxcbn0gZnJvbSAndWx0aW1hdGUtY3Jvc3Njb2RlLXR5cGVkZWZzL21vZGxvYWRlci9tb2QnO1xuXG5leHBvcnQgY2xhc3MgTW9kIGltcGxlbWVudHMgTW9kUHVibGljIHtcbiAgcHVibGljIHJlYWRvbmx5IGlkOiBNb2RJRDtcbiAgcHVibGljIHJlYWRvbmx5IHZlcnNpb246IHNlbXZlci5TZW1WZXIgfCBudWxsID0gbnVsbDtcbiAgcHVibGljIHJlYWRvbmx5IGRlcGVuZGVuY2llczogUmVhZG9ubHlNYXA8TW9kSUQsIERlcGVuZGVuY3k+O1xuICBwdWJsaWMgcmVhZG9ubHkgYXNzZXRzRGlyZWN0b3J5OiBzdHJpbmc7XG4gIHB1YmxpYyBhc3NldHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgcHVibGljIHBsdWdpbkNsYXNzSW5zdGFuY2U6IFBsdWdpbkNsYXNzIHwgbnVsbCA9IG51bGw7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZWFkb25seSBiYXNlRGlyZWN0b3J5OiBzdHJpbmcsXG4gICAgcHVibGljIHJlYWRvbmx5IG1hbmlmZXN0OiBNYW5pZmVzdCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgbGVnYWN5TW9kZTogYm9vbGVhbixcbiAgKSB7XG4gICAgaWYgKCF0aGlzLmJhc2VEaXJlY3RvcnkuZW5kc1dpdGgoJy8nKSkgdGhpcy5iYXNlRGlyZWN0b3J5ICs9ICcvJztcblxuICAgIHRoaXMuaWQgPSB0aGlzLm1hbmlmZXN0LmlkO1xuXG4gICAgaWYgKHRoaXMubWFuaWZlc3QudmVyc2lvbiAhPSBudWxsKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLnZlcnNpb24gPSBuZXcgc2VtdmVyLlNlbVZlcih0aGlzLm1hbmlmZXN0LnZlcnNpb24sIHtcbiAgICAgICAgICBpbmNsdWRlUHJlcmVsZWFzZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgaWYgKHV0aWxzLmVycm9ySGFzTWVzc2FnZShlcnIpKSB7XG4gICAgICAgICAgLy8gVE9ETzogcHV0IGEgbGluayB0byBzZW12ZXIgZG9jcyBoZXJlXG4gICAgICAgICAgZXJyLm1lc3NhZ2UgPSBgbW9kIHZlcnNpb24gJyR7dGhpcy5tYW5pZmVzdC52ZXJzaW9ufScgaXMgbm90IGEgdmFsaWQgc2VtdmVyIHZlcnNpb246ICR7ZXJyLm1lc3NhZ2V9YDtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGRlcGVuZGVuY2llcyA9IG5ldyBNYXA8TW9kSUQsIERlcGVuZGVuY3k+KCk7XG5cbiAgICBpZiAodGhpcy5tYW5pZmVzdC5kZXBlbmRlbmNpZXMgIT0gbnVsbCkge1xuICAgICAgZm9yIChsZXQgW2RlcElkLCBkZXBdIG9mIE9iamVjdC5lbnRyaWVzKHRoaXMubWFuaWZlc3QuZGVwZW5kZW5jaWVzKSkge1xuICAgICAgICBpZiAodHlwZW9mIGRlcCA9PT0gJ3N0cmluZycpIGRlcCA9IHsgdmVyc2lvbjogZGVwIH07XG5cbiAgICAgICAgbGV0IGRlcFZlcnNpb25SYW5nZTogc2VtdmVyLlJhbmdlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGRlcFZlcnNpb25SYW5nZSA9IG5ldyBzZW12ZXIuUmFuZ2UoZGVwLnZlcnNpb24sIHtcbiAgICAgICAgICAgIGluY2x1ZGVQcmVyZWxlYXNlOiB0cnVlLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBpZiAodXRpbHMuZXJyb3JIYXNNZXNzYWdlKGVycikpIHtcbiAgICAgICAgICAgIGVyci5tZXNzYWdlID0gYGRlcGVuZGVuY3kgdmVyc2lvbiBjb25zdHJhaW50ICcke2RlcC52ZXJzaW9ufScgZm9yIG1vZCAnJHtkZXBJZH0nIGlzIG5vdCBhIHZhbGlkIHNlbXZlciByYW5nZTogJHtlcnIubWVzc2FnZX1gO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cblxuICAgICAgICBkZXBlbmRlbmNpZXMuc2V0KGRlcElkLCB7XG4gICAgICAgICAgdmVyc2lvbjogZGVwVmVyc2lvblJhbmdlLFxuICAgICAgICAgIG9wdGlvbmFsOiBkZXAub3B0aW9uYWwgPz8gZmFsc2UsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuZGVwZW5kZW5jaWVzID0gZGVwZW5kZW5jaWVzO1xuXG4gICAgdGhpcy5hc3NldHNEaXJlY3RvcnkgPSB0aGlzLnJlc29sdmVQYXRoKGAke3RoaXMubWFuaWZlc3QuYXNzZXRzRGlyID8/ICdhc3NldHMnfS9gKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBmaW5kQWxsQXNzZXRzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBhc3NldHM6IHN0cmluZ1tdID0gW107XG4gICAgaWYgKHRoaXMubWFuaWZlc3QuYXNzZXRzICE9IG51bGwpIHtcbiAgICAgIGFzc2V0cyA9IHRoaXMubWFuaWZlc3QuYXNzZXRzLm1hcCgocGF0aCkgPT4gcGF0aHMuamFpbFJlbGF0aXZlKHBhdGgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXNzZXRzID0gKGF3YWl0IGZpbGVzLmZpbmRSZWN1cnNpdmVseSh0aGlzLmFzc2V0c0RpcmVjdG9yeSkpID8/IFtdO1xuICAgIH1cbiAgICB0aGlzLmFzc2V0cyA9IG5ldyBTZXQoYXNzZXRzKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBpbml0Q2xhc3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHNjcmlwdCA9IHRoaXMubWFuaWZlc3QucGx1Z2luO1xuICAgIGlmIChzY3JpcHQgPT0gbnVsbCkgcmV0dXJuO1xuICAgIGxldCBzY3JpcHRGdWxsUGF0aCA9IHRoaXMucmVzb2x2ZVBhdGgoc2NyaXB0KTtcblxuICAgIGxldCBtb2R1bGU6IHsgZGVmYXVsdDogbmV3IChtb2Q6IE1vZFB1YmxpYykgPT4gUGx1Z2luQ2xhc3MgfTtcbiAgICB0cnkge1xuICAgICAgbW9kdWxlID0gYXdhaXQgaW1wb3J0KHV0aWxzLmN3ZEZpbGVQYXRoVG9VUkwoc2NyaXB0RnVsbFBhdGgpLmhyZWYpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKHV0aWxzLmVycm9ySGFzTWVzc2FnZShlcnIpKSB7XG4gICAgICAgIGVyci5tZXNzYWdlID0gYEVycm9yIHdoaWxlIGltcG9ydGluZyAnJHtzY3JpcHRGdWxsUGF0aH0nOiAke2Vyci5tZXNzYWdlfWA7XG4gICAgICB9XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuXG4gICAgaWYgKCF1dGlscy5oYXNLZXkobW9kdWxlLCAnZGVmYXVsdCcpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE1vZHVsZSAnJHtzY3JpcHRGdWxsUGF0aH0nIGhhcyBubyBkZWZhdWx0IGV4cG9ydGApO1xuICAgIH1cblxuICAgIGxldCBNb2RQbHVnaW5DbGFzcyA9IG1vZHVsZS5kZWZhdWx0O1xuICAgIHRoaXMucGx1Z2luQ2xhc3NJbnN0YW5jZSA9IG5ldyBNb2RQbHVnaW5DbGFzcyh0aGlzKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBleGVjdXRlU3RhZ2Uoc3RhZ2U6IExvYWRpbmdTdGFnZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCBwbHVnaW5DbHMgPSB0aGlzLnBsdWdpbkNsYXNzSW5zdGFuY2U7XG4gICAgaWYgKHBsdWdpbkNscyAhPSBudWxsKSB7XG4gICAgICBpZiAoIXRoaXMubGVnYWN5TW9kZSkge1xuICAgICAgICBpZiAoc3RhZ2UgaW4gcGx1Z2luQ2xzKSBhd2FpdCBwbHVnaW5DbHNbc3RhZ2VdISh0aGlzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBsZWdhY3lQbHVnaW5DbHMgPSBwbHVnaW5DbHMgYXMgTGVnYWN5UGx1Z2luQ2xhc3M7XG4gICAgICAgIGxldCBtZXRob2ROYW1lOiBrZXlvZiBMZWdhY3lQbHVnaW5DbGFzcyA9IHN0YWdlID09PSAncG9zdHN0YXJ0JyA/ICdtYWluJyA6IHN0YWdlO1xuICAgICAgICBpZiAobWV0aG9kTmFtZSBpbiBsZWdhY3lQbHVnaW5DbHMpIGF3YWl0IGxlZ2FjeVBsdWdpbkNsc1ttZXRob2ROYW1lXSEoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgc2NyaXB0ID0gdGhpcy5tYW5pZmVzdFtzdGFnZV07XG4gICAgaWYgKHNjcmlwdCA9PSBudWxsKSByZXR1cm47XG4gICAgbGV0IHNjcmlwdEZ1bGxQYXRoID0gdGhpcy5yZXNvbHZlUGF0aChzY3JpcHQpO1xuXG4gICAgYXdhaXQgaW1wb3J0KHV0aWxzLmN3ZEZpbGVQYXRoVG9VUkwoc2NyaXB0RnVsbFBhdGgpLmhyZWYpO1xuICB9XG5cbiAgcHVibGljIHJlc29sdmVQYXRoKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHBhdGhzLmpvaW4odGhpcy5iYXNlRGlyZWN0b3J5LCBwYXRocy5qYWlsUmVsYXRpdmUocGF0aCkpO1xuICB9XG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIGxvYWRTdHlsZXNoZWV0KFxuICB1cmw6IHN0cmluZyxcbiAgb3B0aW9ucz86IHsgdHlwZT86IHN0cmluZyB8IG51bGwgfSB8IG51bGwsXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyA/PyB7fTtcbiAgICBsZXQgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcbiAgICBsaW5rLnJlbCA9ICdzdHlsZXNoZWV0JztcbiAgICBsaW5rLmhyZWYgPSB1cmw7XG4gICAgaWYgKG9wdGlvbnMudHlwZSAhPSBudWxsKSBsaW5rLnR5cGUgPSBvcHRpb25zLnR5cGU7XG5cbiAgICBsaW5rLm9ubG9hZCA9ICgpID0+IHJlc29sdmUoKTtcbiAgICBsaW5rLm9uZXJyb3IgPSAoKSA9PiByZWplY3QobmV3IEVycm9yKGBGYWlsZWQgdG8gbG9hZCBzdHlsZXNoZWV0ICcke3VybH0nYCkpO1xuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobGluayk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZFNjcmlwdChcbiAgdXJsOiBzdHJpbmcsXG4gIG9wdGlvbnM/OiB7IHR5cGU/OiBzdHJpbmcgfCBudWxsOyBhc3luYz86IGJvb2xlYW4gfCBudWxsIH0gfCBudWxsLFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgPz8ge307XG4gICAgbGV0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgIHNjcmlwdC5zcmMgPSB1cmw7XG4gICAgaWYgKG9wdGlvbnMudHlwZSAhPSBudWxsKSBzY3JpcHQudHlwZSA9IG9wdGlvbnMudHlwZTtcbiAgICBpZiAob3B0aW9ucy5hc3luYyAhPSBudWxsKSBzY3JpcHQuYXN5bmMgPSBvcHRpb25zLmFzeW5jO1xuXG4gICAgc2NyaXB0Lm9ubG9hZCA9ICgpID0+IHJlc29sdmUoKTtcbiAgICBzY3JpcHQub25lcnJvciA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoYEZhaWxlZCB0byBsb2FkIHNjcmlwdCAnJHt1cmx9J2ApKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gIH0pO1xufVxuIiwgImltcG9ydCAqIGFzIHJlc291cmNlcyBmcm9tICdAY2Nsb2FkZXIzL2NvbW1vbi9yZXNvdXJjZXMnO1xuaW1wb3J0IHNlbXZlciBmcm9tICdAY2Nsb2FkZXIzL2NvbW1vbi92ZW5kb3ItbGlicy9zZW12ZXInO1xuaW1wb3J0ICogYXMgZmlsZXMgZnJvbSAnLi9maWxlcyc7XG5pbXBvcnQgeyBDaGFuZ2Vsb2dGaWxlRGF0YSB9IGZyb20gJ3VsdGltYXRlLWNyb3NzY29kZS10eXBlZGVmcy9maWxlLXR5cGVzL2NoYW5nZWxvZyc7XG5pbXBvcnQgeyBDb25maWcgfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgKiBhcyBwYXRocyBmcm9tICdAY2Nsb2FkZXIzL2NvbW1vbi9wYXRocyc7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tICdAY2Nsb2FkZXIzL2NvbW1vbi91dGlscyc7XG5cbmV4cG9ydCBjb25zdCBLTk9XTl9FWFRFTlNJT05fSURTOiBSZWFkb25seVNldDxzdHJpbmc+ID0gbmV3IFNldChbXG4gICdmaXNoLWdlYXInLFxuICAnZmx5aW5nLWhlZGdlaGFnJyxcbiAgJ21hbmxlYScsXG4gICduaW5qYS1za2luJyxcbiAgJ3Bvc3QtZ2FtZScsXG4gICdzY29ycGlvbi1yb2JvJyxcbiAgJ3Nub3dtYW4tdGFuaycsXG5dKTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRWZXJzaW9uKFxuICBjb25maWc6IENvbmZpZyxcbik6IFByb21pc2U8eyB2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyOyBob3RmaXg6IG51bWJlciB9PiB7XG4gIGxldCBjaGFuZ2Vsb2dUZXh0ID0gYXdhaXQgZmlsZXMubG9hZFRleHQoXG4gICAgcGF0aHMuamFpbFJlbGF0aXZlKHBhdGhzLmpvaW4oY29uZmlnLmdhbWVBc3NldHNEaXIsICdkYXRhL2NoYW5nZWxvZy5qc29uJykpLFxuICApO1xuICBsZXQgeyBjaGFuZ2Vsb2cgfSA9IEpTT04ucGFyc2UoY2hhbmdlbG9nVGV4dCkgYXMgQ2hhbmdlbG9nRmlsZURhdGE7XG4gIGxldCBsYXRlc3RFbnRyeSA9IGNoYW5nZWxvZ1swXTtcblxuICBsZXQgdmVyc2lvbiA9IG5ldyBzZW12ZXIuU2VtVmVyKGxhdGVzdEVudHJ5LnZlcnNpb24pO1xuXG4gIGxldCBob3RmaXggPSAwO1xuICBsZXQgY2hhbmdlcyA9IFtdO1xuICBpZiAobGF0ZXN0RW50cnkuY2hhbmdlcyAhPSBudWxsKSBjaGFuZ2VzLnB1c2goLi4ubGF0ZXN0RW50cnkuY2hhbmdlcyk7XG4gIGlmIChsYXRlc3RFbnRyeS5maXhlcyAhPSBudWxsKSBjaGFuZ2VzLnB1c2goLi4ubGF0ZXN0RW50cnkuZml4ZXMpO1xuICBmb3IgKGxldCBjaGFuZ2Ugb2YgY2hhbmdlcykge1xuICAgIGxldCBtYXRjaCA9IC9eXFxXKkhPVEZJWFxcKChcXGQrKVxcKS9pLmV4ZWMoY2hhbmdlKTtcbiAgICBpZiAobWF0Y2ggIT0gbnVsbCAmJiBtYXRjaC5sZW5ndGggPT09IDIpIHtcbiAgICAgIGhvdGZpeCA9IE1hdGgubWF4KGhvdGZpeCwgcGFyc2VJbnQobWF0Y2hbMV0sIDEwKSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHsgdmVyc2lvbiwgaG90Zml4IH07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBidWlsZE5lY2Vzc2FyeURPTShjb25maWc6IENvbmZpZyk6IFByb21pc2U8dm9pZD4ge1xuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKFxuICAgIHV0aWxzLmh0bWwoJ2Jhc2UnLCB7XG4gICAgICBhdHRyczoge1xuICAgICAgICBocmVmOiB1dGlscy5jd2RGaWxlUGF0aFRvVVJMKHBhdGhzLmpvaW4oY29uZmlnLmdhbWVBc3NldHNEaXIsICcvJyksIHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pXG4gICAgICAgICAgLmhyZWYsXG4gICAgICB9LFxuICAgIH0pLFxuICApO1xuXG4gIC8vIG1ldGEgdGFncyBoYXZlIGJlZW4gcmVtb3ZlZCwgdGhleSBhcHBlYXIgdG8gbm90IGFmZmVjdCBhbnl0aGluZ1xuXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoXG4gICAgdXRpbHMuaHRtbCgnZGl2Jywge1xuICAgICAgaWQ6ICdnYW1lJyxcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIHV0aWxzLmh0bWwoJ2NhbnZhcycsIHtcbiAgICAgICAgICBpZDogJ2NhbnZhcycsXG4gICAgICAgIH0pLFxuICAgICAgXSxcbiAgICB9KSxcbiAgKTtcblxuICAvLyBCeSBkZWZhdWx0IHRoZSBnYW1lJ3MgSFRNTCBwYWdlIGFsc28gY29udGFpbnMgYSBkaXYgZWxlbWVudCBmb3IgdGhlIFwib3B0aW9uXG4gIC8vIGxpc3RcIiBkZXNjcmliZWQgYWJvdmUsIGJ1dCBpdCBpcyB1c2VsZXNzIGFzIGRlc2NyaWJlZCBhYm92ZSwgc28gSSByZW1vdmVkXG4gIC8vIGl0LiBGb3J0dW5hdGVseSBqUXVlcnkgZnVuY3Rpb25zIGRvbid0IGNvbXBsYWluIHdoZW4gSSByZW1vdmUgaXQgYmVjYXVzZVxuICAvLyB0aGV5IG9wZXJhdGUgb24gYXJyYXlzIG9mIGVsZW1lbnRzIGFuZCBoYW5kbGUgZW1wdHkgYXJyYXlzIHBlcmZlY3RseSB3ZWxsLlxuXG4gIC8vIFRoZSBsYXN0IGlubGluZSBzY3JpcHQgaGFzIGJlZW4gcmVtb3ZlZCBiZWNhdXNlOlxuICAvLyAgYSkgaXQgY29udGFpbnMgYW4gYHVuY2F1Z2h0RXhjZXB0aW9uYCBoYW5kbGVyIHRoYXQgc2lsZW50bHkgaGlkZXMgYWxsXG4gIC8vICAgICBlcnJvcnMuIFBvc3NpYmx5IGEgYnVnLCB0aG91Z2ggaXQgaXMgdW5saWtlbHkgdGhhdCBpdCB3aWxsIGJlIGZpeGVkIHNvb25cbiAgLy8gICAgIGlmIGF0IGFsbDtcbiAgLy8gIGIpIHJlc3BvbnNpYmlsaXR5IG9mIGBkb1N0YXJ0Q3Jvc3NDb2RlUGx6YCBpcyBoYW5kbGVkIGJ5IHRoZSBtb2Rsb2FkZXJcbiAgLy8gICAgIGl0c2VsZi5cblxuICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG5cbiAgT2JqZWN0LmFzc2lnbih3aW5kb3csIGNvbmZpZy5pbXBhY3RDb25maWcpO1xuXG4gIGF3YWl0IGNvbmZpZy5vbkdhbWVET01DcmVhdGVkKCk7XG5cbiAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgIC4uLmNvbmZpZy5zdHlsZXNoZWV0VVJMcy5tYXAoKHVybCkgPT4gcmVzb3VyY2VzLmxvYWRTdHlsZXNoZWV0KHVybCkpLFxuICAgIC4uLmNvbmZpZy5zY3JpcHRVUkxzLm1hcCgodXJsKSA9PlxuICAgICAgLy8gYXN5bmMgaXMgdHVybmVkIG9mZiBzbyB0aGF0IHRoZXNlIHNjcmlwdHMgYXJlIGxvYWRlZCBpbiB0aGUgb3JkZXIgb2ZcbiAgICAgIC8vIGFkZGl0aW9uXG4gICAgICByZXNvdXJjZXMubG9hZFNjcmlwdCh1cmwsIHsgYXN5bmM6IGZhbHNlIH0pLFxuICAgICksXG4gIF0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZE1haW5TY3JpcHQoXG4gIGNvbmZpZzogQ29uZmlnLFxuICBldmVudFJlY2VpdmVyOiB7IG9uSW1wYWN0SW5pdCgpOiB2b2lkIH0sXG4pOiBQcm9taXNlPCgpID0+IHZvaWQ+IHtcbiAgbGV0IGRvbVJlYWR5Q2FsbGJhY2s6ICgpID0+IHZvaWQgPSBudWxsITtcbiAgY2FsbE9uSW1wYWN0SW5pdCgoKSA9PiB7XG4gICAgZG9tUmVhZHlDYWxsYmFjayA9IGlnLl9ET01SZWFkeTtcbiAgICBpZy5fRE9NUmVhZHkgPSAoKSA9PiB7fTtcbiAgICBldmVudFJlY2VpdmVyLm9uSW1wYWN0SW5pdCgpO1xuICB9KTtcblxuICAvLyBhc3luYyBpcyB0dXJuZWQgb2ZmIHNvIHRoYXQgdGhlIG1haW4gc2NyaXB0IGJsb2NrcyB0aGUgVUkgdGhyZWFkIHdoaWxlIGl0XG4gIC8vIGlzIGJlaW5nIGV4ZWN1dGVkXG4gIGF3YWl0IHJlc291cmNlcy5sb2FkU2NyaXB0KGNvbmZpZy5nYW1lU2NyaXB0VVJMLCB7IGFzeW5jOiBmYWxzZSB9KTtcblxuICBpZiAoIShkb21SZWFkeUNhbGxiYWNrICE9IG51bGwpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdBc3NlcnRpb24gZmFpbGVkOiBkb21SZWFkeUNhbGxiYWNrICE9IG51bGwnKTtcbiAgfVxuXG4gIHJldHVybiBkb21SZWFkeUNhbGxiYWNrO1xufVxuXG5mdW5jdGlvbiBjYWxsT25JbXBhY3RJbml0KGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aW5kb3csICdpZycsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcblxuICAgIGdldCgpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZmluZWRcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSxcblxuICAgIHNldCh2YWx1ZTogdHlwZW9mIGlnKSB7XG4gICAgICAvLyBUaGlzIGRlbGV0aW9uIGlzIG5lZWRlZCBpbiBvcmRlciB0byBmb3JjZSBhIHJlc2V0IG9mIHRoZSBwcm9wZXJ0eVxuICAgICAgLy8gZGVzY3JpcHRvciBvZiBgd2luZG93LmlnYC4gTm90IHN1cmUgaWYgaXQgY2FuIGJlIGhhbmRsZWQgbW9yZSBjbGVhbmx5LlxuICAgICAgZGVsZXRlICh3aW5kb3cgYXMgeyBpZz86IHR5cGVvZiBpZyB9KS5pZztcbiAgICAgIHdpbmRvdy5pZyA9IHZhbHVlO1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9LFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFN0YXJ0RnVuY3Rpb24oKTogUHJvbWlzZTwoKSA9PiB2b2lkPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIC8vIFRPRE86IHRoaXMgcmVwbGljYXRlcyB0aGUgYmVoYXZpb3IgZnJvbSB0aGUgb3JpZ2luYWwgSFRNTCBwYWdlLCBJIGhvcGUgd2VcbiAgICAvLyBjYW4gZmluZCBhIGJldHRlciBzb2x1dGlvbiB0byBjYXRjaCBgd2luZG93LnN0YXJ0Q3Jvc3NDb2RlYCBpbW1lZGlhdGVseS5cbiAgICAvLyBOb3RlIHRoYXQgbW9zdCBvZiB0aGUgdGltZSB0aGUgYHNldFRpbWVvdXRgIHdvbid0IGJlIGZpcmVkIHNpbmNlIGF0IHRoaXNcbiAgICAvLyB0aW1lIGBzdGFydENyb3NzQ29kZWAgaXMgbW9zdCBsaWtlbHkgYXZhaWxhYmxlIGJlY2F1c2Ugb2YgdGhlIGRlbGF5c1xuICAgIC8vIGNhdXNlZCBieSBtb2RzIGFuZCBldmVudCBsb29wIHRpY2tzIGNhdXNlZCBieSB1c2FnZXMgb2YgcHJvbWlzZXMgaW4gdGhlXG4gICAgLy8gbW9kbG9hZGVyLlxuICAgIChmdW5jdGlvbiB3YWl0Rm9yU3RhcnRGdW5jdGlvbigpIHtcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93LnN0YXJ0Q3Jvc3NDb2RlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJlc29sdmUod2luZG93LnN0YXJ0Q3Jvc3NDb2RlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCd3YWl0aW5nIGZvciBzdGFydENyb3NzQ29kZSgpLi4uJyk7XG4gICAgICAgIHNldFRpbWVvdXQod2FpdEZvclN0YXJ0RnVuY3Rpb24sIDEwMCk7XG4gICAgICB9XG4gICAgfSkoKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWxlZ2F0ZUFjdGl2YXRpb25GdW5jdGlvbigpOiBQcm9taXNlPCgpID0+IHZvaWQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgaWYgKGlnLnN5c3RlbS5kZWxlZ2F0ZSA9PSBudWxsKSB7XG4gICAgICBsZXQgcmVhbFNldERlbGVnYXRlID0gaWcuc3lzdGVtLnNldERlbGVnYXRlO1xuICAgICAgaWcuc3lzdGVtLnNldERlbGVnYXRlID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgaWcuc3lzdGVtLnNldERlbGVnYXRlID0gcmVhbFNldERlbGVnYXRlO1xuICAgICAgICByZXNvbHZlKCgpID0+IHJlYWxTZXREZWxlZ2F0ZS5hcHBseSh0aGlzLCBhcmdzKSk7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXNvbHZlKCgpID0+IHt9KTtcbiAgICB9XG4gIH0pO1xufVxuIiwgIi8vIEluc3BpcmVkIGJ5OlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2RtaXRtZWwvY3Jvc3Njb2RlLXJlYWRhYmxlLXNhdmVzL2Jsb2IvZWQyNWFiOGIwNjFmMGE3NWFjZjU0YmMyNDg1ZmVhZDQ3NTIzZmMyZS9zcmMvcG9zdGxvYWQudHMjTDc4LUwyODRcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9DQ0RpcmVjdExpbmsvY2Nib3QtYmFja3VwL2Jsb2IvZGRjNTQ3NTA4MWZjMjM2N2ZlYmE5MjlkYTkyNzBhODhhYmZjMWJjOS9zcmMvZHluYW1pYy1kYXRhLnRzI0wxOS1MMTQzXG5cbi8vIElmIGFuIHJ3bG9jay1iYXNlZCBpbXBsZW1lbnRhdGlvbiBpcyBldmVyIGRlc2lyZWQsIHNlZTpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9XaXpjb3JwL2xvY2tzL2Jsb2IvbWFzdGVyL2xpYi9SZWFkV3JpdGVMb2NrLmpzXG4vLyBodHRwczovL2dpdGh1Yi5jb20vNzExMDQvcndsb2NrL2Jsb2IvbWFzdGVyL3NyYy9sb2NrLmpzXG5cbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gJ0BjY2xvYWRlcjMvY29tbW9uL3V0aWxzJztcbmltcG9ydCB7IEZpbGVEYXRhIH0gZnJvbSAndWx0aW1hdGUtY3Jvc3Njb2RlLXR5cGVkZWZzL2ZpbGUtdHlwZXMvbW9kLWRhdGEtc3RvcmFnZSc7XG5pbXBvcnQgeyBNb2RFbnRyeSB9IGZyb20gJ3VsdGltYXRlLWNyb3NzY29kZS10eXBlZGVmcy9maWxlLXR5cGVzL21vZC1kYXRhLXN0b3JhZ2UvdjEnO1xuaW1wb3J0IHsgTW9kSUQgfSBmcm9tICd1bHRpbWF0ZS1jcm9zc2NvZGUtdHlwZWRlZnMvbW9kbG9hZGVyL21vZCc7XG5cbmNvbnN0IGZzID0gKHdpbmRvdy5yZXF1aXJlPy4oJ2ZzJykgYXMgdHlwZW9mIGltcG9ydCgnZnMnKSk/LnByb21pc2VzO1xuY29uc3QgcGF0aHNOYXRpdmUgPSB3aW5kb3cucmVxdWlyZT8uKCdwYXRoJykgYXMgdHlwZW9mIGltcG9ydCgncGF0aCcpO1xuXG5leHBvcnQgY29uc3QgRklMRV9OQU1FID0gJ2NjLW1vZC1zZXR0aW5ncy5qc29uJztcblxuZXhwb3J0IGNvbnN0IGZpbGVEaXI6IHN0cmluZyB8IG51bGwgPSAoZnVuY3Rpb24gZ2V0RmlsZVBhdGgoKSB7XG4gIC8vIE5PVEU6IEl0IGhhcyBiZWVuIG9ic2VydmVkIHRoYXQgdGhlIGN1cnJlbnQgaW1wbGVtZW50YXRpb24gdmVyeSByYXJlbHlcbiAgLy8gKGJ1dCBub3QgYXQgYSBuZWdsaWdpYmxlIHJhdGUpIGNvcnJ1cHRzIHRoZSBzZXR0aW5ncyBmaWxlIGJ5IGZpbGxpbmcgaXRcbiAgLy8gd2l0aCB6ZXJvZXMuIEZvciBzb21lIHJlYXNvbiBldmVuIHdyaXRpbmcgdG8gYSB0ZW1wb3JhcnkgZmlsZSBmaXJzdCBhbmRcbiAgLy8gdGhlbiByZW5hbWluZyBpdCB0byB0aGUgcmVhbCBmaWxlIGRvZXNuJ3QgaGVscCBlaXRoZXIsIHNvIGEgbW9yZSBhZHZhbmNlZFxuICAvLyBpbXBsZW1lbnRhdGlvbiwgc2ltaWxhciB0byB0aGUgb25lIGZyb20gdGhlIG9yaWdpbmFsIGdhbWUgZm9yIGV4YW1wbGUsIGlzXG4gIC8vIG5lY2Vzc2FyeS4gVW50aWwgdGhlbiB3cml0aW5nIG1vZCBzZXR0aW5ncyB0byB0aGUgZmlsZXN5c3RlbSBzZXBhcmF0ZWx5IGlzXG4gIC8vIGRpc2FibGVkLlxuICByZXR1cm4gbnVsbDtcblxuICBpZiAodHlwZW9mIG53ID09PSAndW5kZWZpbmVkJykgcmV0dXJuIG51bGw7XG5cbiAgLy8gdGFrZW4gZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZG1pdG1lbC9jcm9zc2NvZGUtcmVhZGFibGUtc2F2ZXMvYmxvYi9lZDI1YWI4YjA2MWYwYTc1YWNmNTRiYzI0ODVmZWFkNDc1MjNmYzJlL3NyYy9wb3N0bG9hZC50cyNMMjg5LUwyOThcbiAgbGV0IHNhdmVEaXJQYXRoID0gbncuQXBwLmRhdGFQYXRoO1xuXG4gIC8vIE9uIFdpbmRvd3MgYG53LkFwcC5kYXRhUGF0aGAgaXMgYCVMT0NBTEFQUERBVEElXFxDcm9zc0NvZGVcXFVzZXIgRGF0YVxcRGVmYXVsdGAsXG4gIC8vIHlldCB0aGUgZ2FtZSB3cml0ZXMgdGhlIHNhdmVnYW1lIHRvIGAlTE9DQUxBUFBEQVRBJVxcQ3Jvc3NDb2RlYCB3aGVuXG4gIC8vIHBvc3NpYmxlLCBzbyBJIHJlcHJvZHVjZSB0aGlzIGJlaGF2aW9yLiBOb3RpY2UgdGhhdCB0aGlzIGltcGxlbWVudGF0aW9uXG4gIC8vIElTIEJST0tFTiB3aGVuIGAlTE9DQUxBUFBEQVRBJWAgY29udGFpbnMgdGhlIGBcXFVzZXIgRGF0YVxcRGVmYXVsdGBcbiAgLy8gc3Vic3RyaW5nLCBidXQgZWgsIHdoYXRldmVyLCB0aGlzIGlzIHRoZSBleGFjdCBwaWVjZSBvZiBjb2RlIHRoZSBzdG9ja1xuICAvLyBnYW1lIHVzZXMuXG4gIGxldCB1c2VyRGF0YUluZGV4ID0gc2F2ZURpclBhdGguaW5kZXhPZignXFxcXFVzZXIgRGF0YVxcXFxEZWZhdWx0Jyk7XG4gIGlmICh1c2VyRGF0YUluZGV4ID49IDApIHNhdmVEaXJQYXRoID0gc2F2ZURpclBhdGguc2xpY2UoMCwgdXNlckRhdGFJbmRleCk7XG5cbiAgcmV0dXJuIHNhdmVEaXJQYXRoO1xufSkoKTtcblxuZXhwb3J0IGNvbnN0IGRhdGEgPSBuZXcgTWFwPE1vZElELCBNb2RFbnRyeT4oKTtcblxubGV0IHF1ZXVlZFdyaXRlc1Byb21pc2U6IFByb21pc2U8dm9pZD4gfCBudWxsID0gbnVsbDtcbmxldCBxdWV1ZWRXcml0ZXNGbGFnID0gZmFsc2U7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkSW1tZWRpYXRlbHkoKTogUHJvbWlzZTx2b2lkPiB7XG4gIGRhdGEuY2xlYXIoKTtcblxuICBpZiAoZmlsZURpciAhPSBudWxsKSB7XG4gICAgbGV0IHJhd0RhdGE6IEJ1ZmZlcjtcbiAgICB0cnkge1xuICAgICAgcmF3RGF0YSA9IGF3YWl0IGZzLnJlYWRGaWxlKHBhdGhzTmF0aXZlLmpvaW4oZmlsZURpciwgRklMRV9OQU1FKSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBpZiAodXRpbHMuZXJyb3JIYXNDb2RlKGVycikgJiYgZXJyLmNvZGUgPT09ICdFTk9FTlQnKSByZXR1cm47XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICAgIGRlc2VyaWFsaXplKHJhd0RhdGEpO1xuICB9IGVsc2Uge1xuICAgIHJlYWRGcm9tTG9jYWxTdG9yYWdlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyaXRlSW1tZWRpYXRlbHkoKTogUHJvbWlzZTx2b2lkPiB7XG4gIGlmIChmaWxlRGlyICE9IG51bGwpIHtcbiAgICBsZXQgcmF3RGF0YTogQnVmZmVyID0gc2VyaWFsaXplKCk7XG4gICAgbGV0IGZpbGVQYXRoID0gcGF0aHNOYXRpdmUuam9pbihmaWxlRGlyLCBGSUxFX05BTUUpO1xuICAgIGxldCB0bXBGaWxlUGF0aCA9IHBhdGhzTmF0aXZlLmpvaW4oZmlsZURpciwgYH4ke0ZJTEVfTkFNRX1gKTtcbiAgICBhd2FpdCBmcy53cml0ZUZpbGUodG1wRmlsZVBhdGgsIHJhd0RhdGEpO1xuICAgIGF3YWl0IGZzLnJlbmFtZSh0bXBGaWxlUGF0aCwgZmlsZVBhdGgpO1xuICB9IGVsc2Uge1xuICAgIHdyaXRlVG9Mb2NhbFN0b3JhZ2UoKTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JpdGUoKTogUHJvbWlzZTx2b2lkPiB7XG4gIGlmIChxdWV1ZWRXcml0ZXNQcm9taXNlID09IG51bGwpIHtcbiAgICBsZXQgcXVldWVkV3JpdGVzUmVzb2x2ZTogKCkgPT4gdm9pZCA9IG51bGwhO1xuICAgIHF1ZXVlZFdyaXRlc1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgcXVldWVkV3JpdGVzUmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgfSk7XG5cbiAgICBkbyB7XG4gICAgICBxdWV1ZWRXcml0ZXNGbGFnID0gZmFsc2U7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB3cml0ZUltbWVkaWF0ZWx5KCk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3Igd2hpbGUgd3JpdGluZyBtb2QgZGF0YSBhbmQgc2V0dGluZ3M6JywgZXJyKTtcbiAgICAgICAgLy8gVE9ETzogY2FuLCBhbmQsIG1vcmUgaW1wb3J0YW50bHksIHNob3VsZCwgdGhlIGVycm9yIGJlIHRocm93biBvdXQgb2ZcbiAgICAgICAgLy8gdGhpcyBmdW5jdGlvbj9cbiAgICAgIH1cbiAgICB9IHdoaWxlIChxdWV1ZWRXcml0ZXNGbGFnKTtcblxuICAgIHF1ZXVlZFdyaXRlc1Byb21pc2UgPSBudWxsO1xuICAgIHF1ZXVlZFdyaXRlc1Jlc29sdmUoKTtcbiAgfSBlbHNlIHtcbiAgICBxdWV1ZWRXcml0ZXNGbGFnID0gdHJ1ZTtcbiAgICBhd2FpdCBxdWV1ZWRXcml0ZXNQcm9taXNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRlc2VyaWFsaXplKHJhd0RhdGE6IEJ1ZmZlcik6IHZvaWQge1xuICBsZXQganNvbkRhdGEgPSBKU09OLnBhcnNlKHJhd0RhdGEudG9TdHJpbmcoJ3V0ZjgnKSkgYXMgRmlsZURhdGE7XG4gIGlmIChqc29uRGF0YS52ZXJzaW9uICE9PSAxKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBmb3JtYXQgdmVyc2lvbiAnJHtqc29uRGF0YS52ZXJzaW9ufSdgKTtcbiAgfVxuXG4gIGZvciAobGV0IFttb2RJRCwgbW9kRW50cnldIG9mIE9iamVjdC5lbnRyaWVzKGpzb25EYXRhLmRhdGEpKSB7XG4gICAgZGF0YS5zZXQobW9kSUQsIG1vZEVudHJ5KTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZWFkRnJvbUxvY2FsU3RvcmFnZSgpOiB2b2lkIHtcbiAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGxvY2FsU3RvcmFnZSkpIHtcbiAgICBsZXQgbWF0Y2ggPSAvXm1vZEVuYWJsZWQtKC4rKSQvLmV4ZWMoa2V5KTtcbiAgICBpZiAobWF0Y2ggIT0gbnVsbCAmJiBtYXRjaC5sZW5ndGggPT09IDIpIHtcbiAgICAgIGxldCBtb2RJRCA9IG1hdGNoWzFdO1xuICAgICAgZGF0YS5zZXQobW9kSUQsIHsgZW5hYmxlZDogdmFsdWUgIT09ICdmYWxzZScgfSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZSgpOiBCdWZmZXIge1xuICBsZXQganNvbkRhdGE6IEZpbGVEYXRhID0geyB2ZXJzaW9uOiAxLCBkYXRhOiB7fSB9O1xuICBmb3IgKGxldCBbbW9kSUQsIG1vZEVudHJ5XSBvZiBkYXRhKSB7XG4gICAganNvbkRhdGEuZGF0YVttb2RJRF0gPSBtb2RFbnRyeTtcbiAgfVxuXG4gIHJldHVybiBCdWZmZXIuZnJvbShKU09OLnN0cmluZ2lmeShqc29uRGF0YSksICd1dGY4Jyk7XG59XG5cbmZ1bmN0aW9uIHdyaXRlVG9Mb2NhbFN0b3JhZ2UoKTogdm9pZCB7XG4gIGZvciAobGV0IFttb2RJRCwgbW9kRW50cnldIG9mIGRhdGEpIHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShgbW9kRW5hYmxlZC0ke21vZElEfWAsIG1vZEVudHJ5LmVuYWJsZWQgPyAndHJ1ZScgOiAnZmFsc2UnKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNNb2RFbmFibGVkKGlkOiBNb2RJRCk6IGJvb2xlYW4ge1xuICByZXR1cm4gZGF0YS5nZXQoaWQpPy5lbmFibGVkID8/IHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRNb2RFbmFibGVkKGlkOiBNb2RJRCwgZW5hYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICB1dGlscy5tYXBHZXRPckluc2VydChkYXRhLCBpZCwgeyBlbmFibGVkIH0pLmVuYWJsZWQgPSBlbmFibGVkO1xufVxuXG5leHBvcnQgY29uc3QgbmFtZXNwYWNlOiB0eXBlb2YgbW9kbG9hZGVyLm1vZERhdGFTdG9yYWdlID0ge1xuICBGSUxFX05BTUUsXG4gIGZpbGVEaXIsXG4gIGRhdGEsXG4gIHJlYWRJbW1lZGlhdGVseSxcbiAgd3JpdGVJbW1lZGlhdGVseSxcbiAgd3JpdGUsXG4gIGlzTW9kRW5hYmxlZCxcbiAgc2V0TW9kRW5hYmxlZCxcbn07XG4iLCAiaW1wb3J0IHsgTW9kIH0gZnJvbSAnLi9tb2QnO1xuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnQGNjbG9hZGVyMy9jb21tb24vdXRpbHMnO1xuaW1wb3J0IHNlbXZlciBmcm9tICdAY2Nsb2FkZXIzL2NvbW1vbi92ZW5kb3ItbGlicy9zZW12ZXInO1xuaW1wb3J0ICogYXMgbW9kRGF0YVN0b3JhZ2UgZnJvbSAnLi9tb2QtZGF0YS1zdG9yYWdlJztcbmltcG9ydCB7IERlcGVuZGVuY3ksIE1vZElEIH0gZnJvbSAndWx0aW1hdGUtY3Jvc3Njb2RlLXR5cGVkZWZzL21vZGxvYWRlci9tb2QnO1xuaW1wb3J0IHsgS05PV05fRVhURU5TSU9OX0lEUyB9IGZyb20gJy4vZ2FtZSc7XG5cbnR5cGUgTW9kc01hcCA9IE1hcDxNb2RJRCwgTW9kPjtcbnR5cGUgUmVhZG9ubHlNb2RzTWFwID0gUmVhZG9ubHlNYXA8TW9kSUQsIE1vZD47XG50eXBlIFJlYWRvbmx5VmlydHVhbFBhY2thZ2VzTWFwID0gUmVhZG9ubHlNYXA8TW9kSUQsIHNlbXZlci5TZW1WZXI+O1xudHlwZSBSZWFkb25seUV4dGVuc2lvbnNNYXAgPSBSZWFkb25seU1hcDxNb2RJRCwgc2VtdmVyLlNlbVZlcj47XG5cbmV4cG9ydCBmdW5jdGlvbiBzb3J0TW9kc0luTG9hZE9yZGVyKHJ1bnRpbWVNb2Q6IE1vZCwgaW5zdGFsbGVkTW9kczogUmVhZG9ubHlNb2RzTWFwKTogTW9kc01hcCB7XG4gIC8vIG5vdGUgdGhhdCBtYXBzIHByZXNlcnZlIGluc2VydGlvbiBvcmRlciBhcyBkZWZpbmVkIGluIHRoZSBFQ01BU2NyaXB0IHNwZWNcbiAgbGV0IHNvcnRlZE1vZHMgPSBuZXcgTWFwPE1vZElELCBNb2Q+KCk7XG5cbiAgc29ydGVkTW9kcy5zZXQocnVudGltZU1vZC5pZCwgcnVudGltZU1vZCk7XG5cbiAgbGV0IHVuc29ydGVkTW9kc0xpc3Q6IE1vZFtdID0gW107XG4gIGZvciAobGV0IG1vZCBvZiBpbnN0YWxsZWRNb2RzLnZhbHVlcygpKSB7XG4gICAgaWYgKG1vZCAhPT0gcnVudGltZU1vZCkgdW5zb3J0ZWRNb2RzTGlzdC5wdXNoKG1vZCk7XG4gIH1cbiAgdW5zb3J0ZWRNb2RzTGlzdC5zb3J0KChtb2QxLCBtb2QyKSA9PiB1dGlscy5jb21wYXJlKG1vZDEuaWQsIG1vZDIuaWQpKTtcblxuICB3aGlsZSAodW5zb3J0ZWRNb2RzTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgLy8gZGVwZW5kZW5jeSBjeWNsZXMgY2FuIGJlIGRldGVjdGVkIGJ5IGNoZWNraW5nIGlmIHdlIHJlbW92ZWQgYW55XG4gICAgLy8gZGVwZW5kZW5jaWVzIGluIHRoaXMgaXRlcmF0aW9uLCBhbHRob3VnaCBzZWUgdGhlIGNvbW1lbnQgYmVsb3dcbiAgICBsZXQgZGVwZW5kZW5jeUN5Y2xlc0V4aXN0ID0gdHJ1ZTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdW5zb3J0ZWRNb2RzTGlzdC5sZW5ndGg7ICkge1xuICAgICAgbGV0IG1vZCA9IHVuc29ydGVkTW9kc0xpc3RbaV07XG4gICAgICBpZiAoIW1vZEhhc1Vuc29ydGVkSW5zdGFsbGVkRGVwZW5kZW5jaWVzKG1vZCwgc29ydGVkTW9kcywgaW5zdGFsbGVkTW9kcykpIHtcbiAgICAgICAgdW5zb3J0ZWRNb2RzTGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgICAgIHNvcnRlZE1vZHMuc2V0KG1vZC5pZCwgbW9kKTtcbiAgICAgICAgZGVwZW5kZW5jeUN5Y2xlc0V4aXN0ID0gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGRlcGVuZGVuY3lDeWNsZXNFeGlzdCkge1xuICAgICAgLy8gRGV0ZWN0aW9uIG9mICoqZXhhY3RseSoqIHdoaWNoIG1vZHMgY2F1c2VkIHRoaXMgaXNuJ3QgaW1wbGVtZW50ZWQgeWV0XG4gICAgICAvLyBiZWNhdXNlIDI3NjdtciBzYWlkIGl0IGlzbid0IHdvcnRoIHRoZSBlZmZvcnQgKHRvIHdoaWNoIEkgYWdyZWVkKSBmb3JcbiAgICAgIC8vIG5vdywgYnV0IGlmIHlvdSBrbm93IGhvdyB0byBkbyB0aGF0IC0gcGxlYXNlIGltcGxlbWVudC4gRm9yIGFueW9uZVxuICAgICAgLy8gaW50ZXJlc3RlZCBnb29nbGUgXCJjaXJjdWxhciBkZXBlbmRlbmN5IGRldGVjdGlvblwiIG9yIFwiZGV0ZWN0IGdyYXBoIGVkZ2VcbiAgICAgIC8vIGN5Y2xlc1wiIGFuZCB5b3UnbGwgbW9zdCBsaWtlbHkgZmluZCBzb21ldGhpbmcgdXNlZnVsIGZvciBvdXIgY2FzZS5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYERldGVjdGVkIGEgZGVwZW5kZW5jeSBjeWNsZSwgbW9zdCBsaWtlbHkgaW4gdGhlIGZvbGxvd2luZyBtb2RzOiAke3Vuc29ydGVkTW9kc0xpc3RcbiAgICAgICAgICAubWFwKChtb2QpID0+IG1vZC5pZClcbiAgICAgICAgICAuam9pbignLCAnKX1gLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc29ydGVkTW9kcztcbn1cblxuZnVuY3Rpb24gbW9kSGFzVW5zb3J0ZWRJbnN0YWxsZWREZXBlbmRlbmNpZXMoXG4gIG1vZDogTW9kLFxuICBzb3J0ZWRNb2RzOiBSZWFkb25seU1vZHNNYXAsXG4gIGluc3RhbGxlZE1vZHM6IFJlYWRvbmx5TW9kc01hcCxcbik6IGJvb2xlYW4ge1xuICBmb3IgKGxldCBkZXBJZCBvZiBtb2QuZGVwZW5kZW5jaWVzLmtleXMoKSkge1xuICAgIGlmICghc29ydGVkTW9kcy5oYXMoZGVwSWQpICYmIGluc3RhbGxlZE1vZHMuaGFzKGRlcElkKSkgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmVyaWZ5TW9kRGVwZW5kZW5jaWVzKFxuICBtb2Q6IE1vZCxcbiAgaW5zdGFsbGVkTW9kczogUmVhZG9ubHlNb2RzTWFwLFxuICB2aXJ0dWFsUGFja2FnZXM6IFJlYWRvbmx5VmlydHVhbFBhY2thZ2VzTWFwLFxuICBpbnN0YWxsZWRFeHRlbnNpb25zOiBSZWFkb25seUV4dGVuc2lvbnNNYXAsXG4gIGVuYWJsZWRFeHRlbnNpb25zOiBSZWFkb25seUV4dGVuc2lvbnNNYXAsXG4gIGxvYWRlZE1vZHM6IFJlYWRvbmx5TW9kc01hcCxcbik6IHN0cmluZ1tdIHtcbiAgbGV0IHByb2JsZW1zID0gW107XG5cbiAgZm9yIChsZXQgW2RlcElkLCBkZXBdIG9mIG1vZC5kZXBlbmRlbmNpZXMpIHtcbiAgICBpZiAoZGVwSWQgPT09IG1vZC5pZCkge1xuICAgICAgcHJvYmxlbXMucHVzaChcImEgbW9kIGNhbid0IGRlcGVuZCBvbiBpdHNlbGZcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBwcm9ibGVtID0gY2hlY2tEZXBlbmRlbmN5Q29uc3RyYWludChcbiAgICAgICAgZGVwSWQsXG4gICAgICAgIGRlcCxcbiAgICAgICAgaW5zdGFsbGVkTW9kcyxcbiAgICAgICAgdmlydHVhbFBhY2thZ2VzLFxuICAgICAgICBpbnN0YWxsZWRFeHRlbnNpb25zLFxuICAgICAgICBlbmFibGVkRXh0ZW5zaW9ucyxcbiAgICAgICAgbG9hZGVkTW9kcyxcbiAgICAgICk7XG4gICAgICBpZiAocHJvYmxlbSAhPSBudWxsKSBwcm9ibGVtcy5wdXNoKHByb2JsZW0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwcm9ibGVtcztcbn1cblxuZnVuY3Rpb24gY2hlY2tEZXBlbmRlbmN5Q29uc3RyYWludChcbiAgZGVwSWQ6IE1vZElELFxuICBkZXBDb25zdHJhaW50OiBEZXBlbmRlbmN5LFxuICBpbnN0YWxsZWRNb2RzOiBSZWFkb25seU1vZHNNYXAsXG4gIHZpcnR1YWxQYWNrYWdlczogUmVhZG9ubHlWaXJ0dWFsUGFja2FnZXNNYXAsXG4gIGluc3RhbGxlZEV4dGVuc2lvbnM6IFJlYWRvbmx5RXh0ZW5zaW9uc01hcCxcbiAgZW5hYmxlZEV4dGVuc2lvbnM6IFJlYWRvbmx5RXh0ZW5zaW9uc01hcCxcbiAgbG9hZGVkTW9kczogUmVhZG9ubHlNb2RzTWFwLFxuKTogc3RyaW5nIHwgbnVsbCB7XG4gIGxldCBkZXBUaXRsZSA9IGRlcElkO1xuICBsZXQgZGVwVmVyc2lvbjogc2VtdmVyLlNlbVZlciB8IG51bGwgPSBudWxsO1xuICBsZXQgZGVwSXNJbnN0YWxsZWQgPSBmYWxzZTtcbiAgbGV0IGRlcElzRW5hYmxlZCA9IGZhbHNlO1xuICBsZXQgZGVwSXNMb2FkZWQgPSBmYWxzZTtcblxuICBpZiAodmlydHVhbFBhY2thZ2VzLmhhcyhkZXBJZCkpIHtcbiAgICBkZXBWZXJzaW9uID0gdmlydHVhbFBhY2thZ2VzLmdldChkZXBJZCkhO1xuICAgIGRlcElzSW5zdGFsbGVkID0gdHJ1ZTtcbiAgICBkZXBJc0VuYWJsZWQgPSB0cnVlO1xuICAgIGRlcElzTG9hZGVkID0gdHJ1ZTtcbiAgfSBlbHNlIGlmIChpbnN0YWxsZWRFeHRlbnNpb25zLmhhcyhkZXBJZCkgfHwgS05PV05fRVhURU5TSU9OX0lEUy5oYXMoZGVwSWQpKSB7XG4gICAgZGVwVGl0bGUgPSBgZXh0ZW5zaW9uICcke2RlcElkfSdgO1xuICAgIGRlcElzSW5zdGFsbGVkID0gaW5zdGFsbGVkRXh0ZW5zaW9ucy5oYXMoZGVwSWQpO1xuICAgIGlmIChkZXBJc0luc3RhbGxlZCkge1xuICAgICAgZGVwVmVyc2lvbiA9IGluc3RhbGxlZEV4dGVuc2lvbnMuZ2V0KGRlcElkKSE7XG4gICAgICBkZXBJc0VuYWJsZWQgPSBlbmFibGVkRXh0ZW5zaW9ucy5oYXMoZGVwSWQpO1xuICAgICAgZGVwSXNMb2FkZWQgPSBkZXBJc0VuYWJsZWQ7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGRlcFRpdGxlID0gYG1vZCAnJHtkZXBJZH0nYDtcbiAgICBkZXBJc0luc3RhbGxlZCA9IGluc3RhbGxlZE1vZHMuaGFzKGRlcElkKTtcbiAgICBpZiAoZGVwSXNJbnN0YWxsZWQpIHtcbiAgICAgIGxldCBkZXBNb2QgPSBpbnN0YWxsZWRNb2RzLmdldChkZXBJZCkhO1xuICAgICAgZGVwVmVyc2lvbiA9IGRlcE1vZC52ZXJzaW9uO1xuICAgICAgZGVwSXNFbmFibGVkID0gbW9kRGF0YVN0b3JhZ2UuaXNNb2RFbmFibGVkKGRlcElkKTtcbiAgICAgIGRlcElzTG9hZGVkID0gbG9hZGVkTW9kcy5oYXMoZGVwSWQpO1xuICAgIH1cbiAgfVxuXG4gIGxldCB7IG9wdGlvbmFsIH0gPSBkZXBDb25zdHJhaW50O1xuICBpZiAoIWRlcElzSW5zdGFsbGVkKSB7XG4gICAgcmV0dXJuIG9wdGlvbmFsID8gbnVsbCA6IGAke2RlcFRpdGxlfSBpcyBub3QgaW5zdGFsbGVkYDtcbiAgfVxuICBpZiAoZGVwVmVyc2lvbiA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG9wdGlvbmFsID8gbnVsbCA6IGAke2RlcFRpdGxlfSBkb2Vzbid0IGhhdmUgYSB2ZXJzaW9uYDtcbiAgfVxuICBpZiAoIWRlcElzRW5hYmxlZCkge1xuICAgIHJldHVybiBvcHRpb25hbCA/IG51bGwgOiBgJHtkZXBUaXRsZX0gaXMgZGlzYWJsZWRgO1xuICB9XG4gIGlmICghZGVwSXNMb2FkZWQpIHtcbiAgICByZXR1cm4gb3B0aW9uYWwgPyBudWxsIDogYCR7ZGVwVGl0bGV9IGlzIG5vdCBsb2FkZWRgO1xuICB9XG4gIGlmICghZGVwQ29uc3RyYWludC52ZXJzaW9uLnRlc3QoZGVwVmVyc2lvbikpIHtcbiAgICByZXR1cm4gYHZlcnNpb24gb2YgJHtkZXBUaXRsZX0gKCR7ZGVwVmVyc2lvbn0pIGlzIG5vdCBpbiByYW5nZSAnJHtkZXBDb25zdHJhaW50LnZlcnNpb259J2A7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cbiIsICJpbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuL3V0aWxzJztcblxuY29uc3Qgbm9kZWpzVXRpbCA9IHdpbmRvdy5yZXF1aXJlPy4oJ3V0aWwnKSBhcyB0eXBlb2YgaW1wb3J0KCd1dGlsJyk7XG5cbmV4cG9ydCBlbnVtIExvZ0xldmVsIHtcbiAgTE9HID0gMixcbiAgV0FSTiA9IDEsXG4gIEVSUk9SID0gMCxcbn1cblxuZXhwb3J0IHR5cGUgTG9nTGV2ZWxOYW1lID0ga2V5b2YgdHlwZW9mIExvZ0xldmVsO1xuZXhwb3J0IHR5cGUgTG9nTGV2ZWxzRGljdDxUID0gYm9vbGVhbj4gPSBSZWNvcmQ8TG9nTGV2ZWxOYW1lLCBUPjtcblxuZXhwb3J0IGNvbnN0IExPR19MRVZFTF9OQU1FUzogcmVhZG9ubHkgTG9nTGV2ZWxOYW1lW10gPSBbJ0xPRycsICdXQVJOJywgJ0VSUk9SJ107XG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX0xPR19MRVZFTFM6IExvZ0xldmVsc0RpY3QgPSB7XG4gIExPRzogZmFsc2UsXG4gIFdBUk46IHRydWUsXG4gIEVSUk9SOiB0cnVlLFxufTtcblxuZnVuY3Rpb24gbG9nTGV2ZWxzVG9CaXRGbGFncyhsZXZlbHM6IExvZ0xldmVsc0RpY3QpOiBudW1iZXIge1xuICBsZXQgZmxhZ3MgPSAwO1xuICBmb3IgKGxldCBsZXZlbCBvZiBMT0dfTEVWRUxfTkFNRVMpIHtcbiAgICBsZXQgZW5hYmxlZCA9IGxldmVsc1tsZXZlbF07XG4gICAgZmxhZ3MgfD0gTnVtYmVyKGVuYWJsZWQpIDw8IExvZ0xldmVsW2xldmVsXTtcbiAgfVxuICByZXR1cm4gZmxhZ3M7XG59XG5cbmZ1bmN0aW9uIGxvZ0xldmVsc0Zyb21CaXRGbGFncyhmbGFnczogbnVtYmVyKTogTG9nTGV2ZWxzRGljdCB7XG4gIGxldCBsZXZlbHMgPSB7fSBhcyBMb2dMZXZlbHNEaWN0O1xuICBmb3IgKGxldCBsZXZlbCBvZiBMT0dfTEVWRUxfTkFNRVMpIHtcbiAgICBsZXQgYml0ID0gTG9nTGV2ZWxbbGV2ZWxdO1xuICAgIGxldmVsc1tsZXZlbF0gPSBCb29sZWFuKGZsYWdzICYgKDEgPDwgYml0KSk7XG4gIH1cbiAgcmV0dXJuIGxldmVscztcbn1cblxuZnVuY3Rpb24gZ2V0TG9nTGV2ZWxzKCk6IExvZ0xldmVsc0RpY3Qge1xuICBsZXQgZmxhZ3NTdHIgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbG9nRmxhZ3MnKTtcbiAgaWYgKGZsYWdzU3RyICE9IG51bGwpIHtcbiAgICBsZXQgZmxhZ3MgPSBwYXJzZUludChmbGFnc1N0ciwgMTApO1xuICAgIGlmIChOdW1iZXIuaXNTYWZlSW50ZWdlcihmbGFncykpIHtcbiAgICAgIHJldHVybiBsb2dMZXZlbHNGcm9tQml0RmxhZ3MoZmxhZ3MpO1xuICAgIH1cbiAgfVxuICByZXR1cm4geyAuLi5ERUZBVUxUX0xPR19MRVZFTFMgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldExvZ0xldmVscyhsZXZlbHM6IExvZ0xldmVsc0RpY3QpOiB2b2lkIHtcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2xvZ0ZsYWdzJywgU3RyaW5nKGxvZ0xldmVsc1RvQml0RmxhZ3MobGV2ZWxzKSkpO1xufVxuXG5jb25zdCBFVkVOVFNfQkxPQ0tFRF9CWV9DT05TT0xFID0gW1xuICAnbW91c2V3aGVlbCcsXG4gICdjb250ZXh0bWVudScsXG4gICdtb3VzZWRvd24nLFxuICAnbW91c2V1cCcsXG4gICdtb3VzZW1vdmUnLFxuICAndG91Y2hzdGFydCcsXG4gICd0b3VjaGVuZCcsXG4gICd0b3VjaG1vdmUnLFxuICAna2V5ZG93bicsXG4gICdrZXl1cCcsXG4gICdrZXlwcmVzcycsXG5dIGFzIGNvbnN0O1xuXG5jb25zdCBMT0dfTEVWRUxfQVBQRUFSRU5DRV9EVVJBVElPTlM6IExvZ0xldmVsc0RpY3Q8bnVtYmVyPiA9IHtcbiAgTE9HOiAyMDAwLFxuICBXQVJOOiA1MDAwLFxuICBFUlJPUjogMTUwMDAsXG59O1xuXG5sZXQgcm9vdEVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0KCk6IHZvaWQge1xuICBsZXQgbG9nTGV2ZWxzID0gZ2V0TG9nTGV2ZWxzKCk7XG5cbiAgcm9vdEVsZW1lbnQgPSB1dGlscy5odG1sKCdkaXYnLCB7XG4gICAgaWQ6ICdjY2xvYWRlci1jb25zb2xlJyxcbiAgICBjbGFzczogWydjY2xvYWRlci1vdmVybGF5JywgJ2NjbG9hZGVyLXZib3gnLCAnY2Nsb2FkZXItdnNjcm9sbCddLFxuICB9KTtcblxuICBmb3IgKGxldCBldmVudFR5cGUgb2YgRVZFTlRTX0JMT0NLRURfQllfQ09OU09MRSkge1xuICAgIHJvb3RFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCAoZXZlbnQpID0+IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpKTtcbiAgfVxuXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kKHJvb3RFbGVtZW50KTtcblxuICBmdW5jdGlvbiBob29rQ29uc29sZU1ldGhvZChuYW1lOiAnZXJyb3InIHwgJ3dhcm4nIHwgJ2xvZycgfCAnaW5mbycsIGxldmVsOiBMb2dMZXZlbCk6IHZvaWQge1xuICAgIGxldCBvbGQgPSBjb25zb2xlW25hbWVdIGFzICguLi5tZXNzYWdlOiB1bmtub3duW10pID0+IHZvaWQ7XG4gICAgY29uc29sZVtuYW1lXSA9IGZ1bmN0aW9uICguLi5tZXNzYWdlOiB1bmtub3duW10pOiB2b2lkIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tY29uZnVzaW5nLXZvaWQtZXhwcmVzc2lvblxuICAgICAgbGV0IHJlc3VsdCA9IG9sZC5hcHBseSh0aGlzLCBtZXNzYWdlKTtcbiAgICAgIGxvZyhsZXZlbCwgLi4ubWVzc2FnZSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH1cblxuICBpZiAobG9nTGV2ZWxzLkVSUk9SKSB7XG4gICAgaG9va0NvbnNvbGVNZXRob2QoJ2Vycm9yJywgTG9nTGV2ZWwuRVJST1IpO1xuICB9XG4gIGlmIChsb2dMZXZlbHMuV0FSTikge1xuICAgIGhvb2tDb25zb2xlTWV0aG9kKCd3YXJuJywgTG9nTGV2ZWwuV0FSTik7XG4gIH1cbiAgaWYgKGxvZ0xldmVscy5MT0cpIHtcbiAgICBob29rQ29uc29sZU1ldGhvZCgnbG9nJywgTG9nTGV2ZWwuTE9HKTtcbiAgICBob29rQ29uc29sZU1ldGhvZCgnaW5mbycsIExvZ0xldmVsLkxPRyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbG9nKGxldmVsOiBMb2dMZXZlbCwgLi4ubWVzc2FnZTogdW5rbm93bltdKTogdm9pZCB7XG4gIGxldCBsZXZlbE5hbWUgPSBMb2dMZXZlbFtsZXZlbF0gYXMgTG9nTGV2ZWxOYW1lO1xuXG4gIGxldCBlbCA9IHV0aWxzLmh0bWwoJ2RpdicsIHtcbiAgICBjbGFzczogWydjY2xvYWRlci1tZXNzYWdlJywgYGNjbG9hZGVyLSR7bGV2ZWxOYW1lfWBdLFxuICAgIGNoaWxkcmVuOiBbYFske0xvZ0xldmVsW2xldmVsXX1dICR7Zm9ybWF0TWVzc2FnZSguLi5tZXNzYWdlKX1gXSxcbiAgfSk7XG5cbiAgcm9vdEVsZW1lbnQuYXBwZW5kKGVsKTtcblxuICBsZXQgcmVtb3ZlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGVsLnJlbW92ZSgpO1xuICB9LCBMT0dfTEVWRUxfQVBQRUFSRU5DRV9EVVJBVElPTlNbbGV2ZWxOYW1lXSk7XG5cbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGVsLnJlbW92ZSgpO1xuICAgIGNsZWFyVGltZW91dChyZW1vdmVUaW1lb3V0KTtcbiAgfSk7XG5cbiAgcm9vdEVsZW1lbnQuc2Nyb2xsVG8oMCwgcm9vdEVsZW1lbnQuc2Nyb2xsSGVpZ2h0KTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0TWVzc2FnZSguLi5tZXNzYWdlOiB1bmtub3duW10pOiBzdHJpbmcge1xuICBpZiAobm9kZWpzVXRpbCAhPSBudWxsKSB7XG4gICAgbGV0IGZvcm1hdEZuID0gbm9kZWpzVXRpbC5mb3JtYXQgYXMgKC4uLmFyZ3M6IHVua25vd25bXSkgPT4gc3RyaW5nO1xuICAgIHJldHVybiBmb3JtYXRGbiguLi5tZXNzYWdlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbWVzc2FnZS5tYXAoKG0pID0+IFN0cmluZyhtKSkuam9pbignICcpO1xuICB9XG59XG4iLCAiaW1wb3J0ICogYXMgZmlsZXMgZnJvbSAnLi9maWxlcyc7XG5pbXBvcnQgKiBhcyBjb25maWdNIGZyb20gJy4vY29uZmlnJztcbmltcG9ydCAqIGFzIG1hbmlmZXN0TSBmcm9tICcuL21hbmlmZXN0JztcbmltcG9ydCB7IE1vZCB9IGZyb20gJy4vbW9kJztcbmltcG9ydCAqIGFzIGdhbWUgZnJvbSAnLi9nYW1lJztcbmltcG9ydCBzZW12ZXIgZnJvbSAnQGNjbG9hZGVyMy9jb21tb24vdmVuZG9yLWxpYnMvc2VtdmVyJztcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gJ0BjY2xvYWRlcjMvY29tbW9uL3V0aWxzJztcbmltcG9ydCAqIGFzIGRlcGVuZGVuY3lSZXNvbHZlciBmcm9tICcuL2RlcGVuZGVuY3ktcmVzb2x2ZXInO1xuaW1wb3J0ICogYXMgbW9kRGF0YVN0b3JhZ2UgZnJvbSAnLi9tb2QtZGF0YS1zdG9yYWdlJztcbmltcG9ydCB7IExlZ2FjeU1hbmlmZXN0LCBNYW5pZmVzdCB9IGZyb20gJ3VsdGltYXRlLWNyb3NzY29kZS10eXBlZGVmcy9maWxlLXR5cGVzL21vZC1tYW5pZmVzdCc7XG5pbXBvcnQgeyBMb2FkaW5nU3RhZ2UsIE1vZElEIH0gZnJvbSAndWx0aW1hdGUtY3Jvc3Njb2RlLXR5cGVkZWZzL21vZGxvYWRlci9tb2QnO1xuaW1wb3J0ICogYXMgY29uc29sZU0gZnJvbSAnQGNjbG9hZGVyMy9jb21tb24vY29uc29sZSc7XG5pbXBvcnQgeyBsb2FkU2VydmljZVdvcmtlciB9IGZyb20gJy4vc2VydmljZS13b3JrZXItYnJpZGdlJztcbmltcG9ydCB7IGxvYWRDQ01vZHMgfSBmcm9tICcuL2ZpbGVzLmNjbW9kJztcblxudHlwZSBNb2RzTWFwID0gTWFwPE1vZElELCBNb2Q+O1xudHlwZSBSZWFkb25seU1vZHNNYXAgPSBSZWFkb25seU1hcDxNb2RJRCwgTW9kPjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGJvb3QoKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnNvbGVNLmluamVjdCgpO1xuXG4gIGNvbnN0IHNlcnZpY2VXb3JrZXIgPSBhd2FpdCBsb2FkU2VydmljZVdvcmtlcigpO1xuXG4gIGxldCBtb2Rsb2FkZXJNZXRhZGF0YSA9IGF3YWl0IGxvYWRNb2Rsb2FkZXJNZXRhZGF0YSgpO1xuICBjb25zb2xlLmxvZyhgQ0NMb2FkZXIgJHttb2Rsb2FkZXJNZXRhZGF0YS52ZXJzaW9ufWApO1xuXG4gIGxldCBjb25maWcgPSBhd2FpdCBjb25maWdNLmxvYWQobW9kbG9hZGVyTWV0YWRhdGEudmVyc2lvbik7XG5cbiAgdHJ5IHtcbiAgICBhd2FpdCBtb2REYXRhU3RvcmFnZS5yZWFkSW1tZWRpYXRlbHkoKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKHV0aWxzLmVycm9ySGFzTWVzc2FnZShlcnIpKSB7XG4gICAgICBlcnIubWVzc2FnZSA9IGBGYWlsZWQgdG8gcmVhZCBtb2QgZGF0YSBzdG9yYWdlOiAke2Vyci5tZXNzYWdlfWA7XG4gICAgfVxuICAgIHRocm93IGVycjtcbiAgfVxuICBjb25zb2xlLmxvZyhgbG9hZGVkIG1vZCBkYXRhIHN0b3JhZ2UgYW5kIHNldHRpbmdzLCAke21vZERhdGFTdG9yYWdlLmRhdGEuc2l6ZX0gZW50cmllc2ApO1xuXG4gIGxldCB7IHZlcnNpb246IGdhbWVWZXJzaW9uLCBob3RmaXg6IGdhbWVWZXJzaW9uSG90Zml4IH0gPSBhd2FpdCBnYW1lLmxvYWRWZXJzaW9uKGNvbmZpZyk7XG4gIGNvbnNvbGUubG9nKGBjcm9zc2NvZGUgJHtnYW1lVmVyc2lvbn0tJHtnYW1lVmVyc2lvbkhvdGZpeH1gKTtcblxuICBsZXQgcnVudGltZU1vZEJhc2VEaXJlY3RvcnkgPSAnLi9jY2xvYWRlcjMvZGlzdC9ydW50aW1lJztcbiAgbGV0IHJ1bnRpbWVNb2Q6IE1vZCB8IG51bGw7XG4gIHRyeSB7XG4gICAgcnVudGltZU1vZCA9IGF3YWl0IGxvYWRNb2RNZXRhZGF0YShydW50aW1lTW9kQmFzZURpcmVjdG9yeSk7XG4gICAgaWYgKCEocnVudGltZU1vZCAhPSBudWxsKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBc3NlcnRpb24gZmFpbGVkOiBydW50aW1lTW9kICE9IG51bGwnKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmICh1dGlscy5lcnJvckhhc01lc3NhZ2UoZXJyKSkge1xuICAgICAgZXJyLm1lc3NhZ2UgPSBgRmFpbGVkIHRvIGxvYWQgbWV0YWRhdGEgb2YgdGhlIHJ1bnRpbWUgbW9kIGluICcke3J1bnRpbWVNb2RCYXNlRGlyZWN0b3J5fScsIHBsZWFzZSBjaGVjayBpZiB5b3UgaW5zdGFsbGVkIENDTG9hZGVyIGNvcnJlY3RseSEgJHtlcnIubWVzc2FnZX1gO1xuICAgIH1cbiAgICB0aHJvdyBlcnI7XG4gIH1cbiAgY29uc29sZS5sb2coYCR7cnVudGltZU1vZC5pZH0gJHtydW50aW1lTW9kLnZlcnNpb259YCk7XG5cbiAgbGV0IHZpcnR1YWxQYWNrYWdlcyA9IG5ldyBNYXA8TW9kSUQsIHNlbXZlci5TZW1WZXI+KClcbiAgICAuc2V0KCdjcm9zc2NvZGUnLCBnYW1lVmVyc2lvbilcbiAgICAuc2V0KCdjY2xvYWRlcicsIG1vZGxvYWRlck1ldGFkYXRhLnZlcnNpb24pXG4gICAgLy8gVGhlc2UgYXJlIGxlZ2FjeSBtb2RzIHRoYXQgYXJlIG5vdyBpbnRlZ3JhdGVkIHdpdGggdGhlIG1vZGxvYWRlclxuICAgIC5zZXQoJ1NpbXBsaWZ5JywgbmV3IHNlbXZlci5TZW1WZXIoJzIuMTQuMicpKVxuICAgIC5zZXQoJ2lucHV0LWFwaScsIG5ldyBzZW12ZXIuU2VtVmVyKCcxLjAuMicpKVxuICAgIC5zZXQoJ2V4dGVuc2lvbi1hc3NldC1wcmVsb2FkZXInLCBuZXcgc2VtdmVyLlNlbVZlcignMS4wLjAnKSlcbiAgICAuc2V0KCduYXgtbW9kdWxlLWNhY2hlJywgbmV3IHNlbXZlci5TZW1WZXIoJzEuMC4yJykpO1xuICBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgdmlydHVhbFBhY2thZ2VzLnNldCgnbncnLCBuZXcgc2VtdmVyLlNlbVZlcihwcm9jZXNzLnZlcnNpb25zLm53ISkpO1xuICB9XG5cbiAgbGV0IGluc3RhbGxlZEV4dGVuc2lvbnMgPSBuZXcgTWFwPE1vZElELCBzZW12ZXIuU2VtVmVyPigpO1xuICBsZXQgZW5hYmxlZEV4dGVuc2lvbnMgPSBuZXcgTWFwPE1vZElELCBzZW12ZXIuU2VtVmVyPigpO1xuICBhd2FpdCBmaW5kQWxsRXh0ZW5zaW9ucyhjb25maWcsIGluc3RhbGxlZEV4dGVuc2lvbnMsIGVuYWJsZWRFeHRlbnNpb25zLCBnYW1lVmVyc2lvbik7XG5cbiAgY29uc29sZS5sb2coXG4gICAgYGZvdW5kICR7aW5zdGFsbGVkRXh0ZW5zaW9ucy5zaXplfSBleHRlbnNpb25zOiAke0FycmF5LmZyb20oaW5zdGFsbGVkRXh0ZW5zaW9ucy5rZXlzKCkpXG4gICAgICAubWFwKChleHRJRCkgPT4ge1xuICAgICAgICBsZXQgc3RyID0gZXh0SUQ7XG4gICAgICAgIGlmICghZW5hYmxlZEV4dGVuc2lvbnMuaGFzKGV4dElEKSkgc3RyICs9ICcgKGRpc2FibGVkKSc7XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgICB9KVxuICAgICAgLmpvaW4oJywgJyl9YCxcbiAgKTtcblxuICBsZXQgaW5zdGFsbGVkTW9kcyA9IG5ldyBNYXA8TW9kSUQsIE1vZD4oKTtcbiAgaW5zdGFsbGVkTW9kcy5zZXQocnVudGltZU1vZC5pZCwgcnVudGltZU1vZCk7XG4gIGF3YWl0IGxvYWRBbGxNb2RNZXRhZGF0YShjb25maWcsIGluc3RhbGxlZE1vZHMpO1xuXG4gIGluc3RhbGxlZE1vZHMgPSBkZXBlbmRlbmN5UmVzb2x2ZXIuc29ydE1vZHNJbkxvYWRPcmRlcihydW50aW1lTW9kLCBpbnN0YWxsZWRNb2RzKTtcbiAgbGV0IGxvYWRlZE1vZHMgPSBuZXcgTWFwPE1vZElELCBNb2Q+KCk7XG4gIGxldCBsb2FkZWRNb2RzU2V0dXBQcm9taXNlczogQXJyYXk8UHJvbWlzZTx2b2lkPj4gPSBbXTtcblxuICBmb3IgKGxldCBbbW9kSUQsIG1vZF0gb2YgaW5zdGFsbGVkTW9kcykge1xuICAgIGlmIChtb2QgIT09IHJ1bnRpbWVNb2QgJiYgIW1vZERhdGFTdG9yYWdlLmlzTW9kRW5hYmxlZChtb2RJRCkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIGxldCBkZXBlbmRlbmN5UHJvYmxlbXMgPSBkZXBlbmRlbmN5UmVzb2x2ZXIudmVyaWZ5TW9kRGVwZW5kZW5jaWVzKFxuICAgICAgbW9kLFxuICAgICAgaW5zdGFsbGVkTW9kcyxcbiAgICAgIHZpcnR1YWxQYWNrYWdlcyxcbiAgICAgIGluc3RhbGxlZEV4dGVuc2lvbnMsXG4gICAgICBlbmFibGVkRXh0ZW5zaW9ucyxcbiAgICAgIGxvYWRlZE1vZHMsXG4gICAgKTtcbiAgICBpZiAoZGVwZW5kZW5jeVByb2JsZW1zLmxlbmd0aCA+IDApIHtcbiAgICAgIGZvciAobGV0IHByb2JsZW0gb2YgZGVwZW5kZW5jeVByb2JsZW1zKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgUHJvYmxlbSB3aXRoIHJlcXVpcmVtZW50cyBvZiBtb2QgJyR7bW9kSUR9JzogJHtwcm9ibGVtfWApO1xuICAgICAgfVxuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgbG9hZGVkTW9kcy5zZXQobW9kSUQsIG1vZCk7XG4gICAgbG9hZGVkTW9kc1NldHVwUHJvbWlzZXMucHVzaChcbiAgICAgIG1vZC5maW5kQWxsQXNzZXRzKCkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBBbiBlcnJvciBvY2N1cmVkIHdoaWxlIHNlYXJjaGluZyBhc3NldHMgb2YgbW9kICcke21vZElEfSc6YCwgZXJyKTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICBpZiAoIWxvYWRlZE1vZHMuaGFzKHJ1bnRpbWVNb2QuaWQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgbG9hZCB0aGUgcnVudGltZSBtb2QsIGdhbWUgaW5pdGlhbGl6YXRpb24gaXMgaW1wb3NzaWJsZSEnKTtcbiAgfVxuXG4gIGF3YWl0IFByb21pc2UuYWxsKGxvYWRlZE1vZHNTZXR1cFByb21pc2VzKTtcblxuICBjb25zb2xlLmxvZyhcbiAgICBgJHtsb2FkZWRNb2RzLnNpemV9IG1vZHMgd2lsbCBiZSBsb2FkZWQ6ICR7QXJyYXkuZnJvbShsb2FkZWRNb2RzLnZhbHVlcygpKVxuICAgICAgLm1hcCgobW9kKSA9PiB7XG4gICAgICAgIGxldCBzdHIgPSBtb2QuaWQ7XG4gICAgICAgIGlmIChtb2QudmVyc2lvbiAhPSBudWxsKSBzdHIgKz0gYCB2JHttb2QudmVyc2lvbn1gO1xuICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgfSlcbiAgICAgIC5qb2luKCcsICcpfWAsXG4gICk7XG5cbiAgd2luZG93Lm1vZGxvYWRlciA9IHtcbiAgICBuYW1lOiAnY2Nsb2FkZXInLFxuICAgIHZlcnNpb246IG1vZGxvYWRlck1ldGFkYXRhLnZlcnNpb24sXG4gICAgZ2FtZVZlcnNpb24sXG4gICAgZ2FtZVZlcnNpb25Ib3RmaXgsXG4gICAgaW5zdGFsbGVkTW9kcyxcbiAgICBjb25maWcsXG4gICAgbG9hZGVkTW9kcyxcbiAgICB2aXJ0dWFsUGFja2FnZXM6IG5ldyBNYXAoXG4gICAgICBbLi4udmlydHVhbFBhY2thZ2VzXS5maWx0ZXIoKFtrXSkgPT4gayAhPT0gJ2Nyb3NzY29kZScgJiYgayAhPT0gJ2NjbG9hZGVyJyAmJiBrICE9PSAnbncnKSxcbiAgICApLFxuICAgIG1vZERhdGFTdG9yYWdlOiBtb2REYXRhU3RvcmFnZS5uYW1lc3BhY2UsXG4gICAgTW9kOiB7fSxcbiAgICBfcnVudGltZU1vZDogcnVudGltZU1vZCxcbiAgICBzZXJ2aWNlV29ya2VyLFxuICB9IGFzIHR5cGVvZiBtb2Rsb2FkZXI7XG5cbiAgY29uc29sZS5sb2coJ2JlZ2lubmluZyB0aGUgZ2FtZSBib290IHNlcXVlbmNlLi4uJyk7XG4gIGF3YWl0IGdhbWUuYnVpbGROZWNlc3NhcnlET00oY29uZmlnKTtcblxuICBhd2FpdCBpbml0TW9kUGx1Z2luQ2xhc3Nlcyhsb2FkZWRNb2RzKTtcbiAgY29uc29sZS5sb2coJ21vZCBwbHVnaW4gY2xhc3NlcyBjcmVhdGVkIScpO1xuXG4gIGNvbnNvbGUubG9nKFwic3RhZ2UgJ3ByZWxvYWQnIHJlYWNoZWQhXCIpO1xuICBhd2FpdCBleGVjdXRlU3RhZ2UobG9hZGVkTW9kcywgJ3ByZWxvYWQnKTtcblxuICBjb25zb2xlLmxvZygncnVubmluZyB0aGUgbWFpbiBnYW1lIHNjcmlwdC4uLicpO1xuICBsZXQgZG9tUmVhZHlDYWxsYmFjayA9IGF3YWl0IGdhbWUubG9hZE1haW5TY3JpcHQoXG4gICAgY29uZmlnLFxuICAgIHJ1bnRpbWVNb2QucGx1Z2luQ2xhc3NJbnN0YW5jZSBhcyBpbXBvcnQoJ0BjY2xvYWRlcjMvcnVudGltZS9fbWFpbicpLmRlZmF1bHQsXG4gICk7XG5cbiAgY29uc29sZS5sb2coXCJzdGFnZSAncG9zdGxvYWQnIHJlYWNoZWQhXCIpO1xuICBhd2FpdCBleGVjdXRlU3RhZ2UobG9hZGVkTW9kcywgJ3Bvc3Rsb2FkJyk7XG4gIGRvbVJlYWR5Q2FsbGJhY2soKTtcblxuICBsZXQgc3RhcnRHYW1lRm4gPSBhd2FpdCBnYW1lLmdldFN0YXJ0RnVuY3Rpb24oKTtcbiAgY29uc29sZS5sb2coXCJzdGFnZSAncHJlc3RhcnQnIHJlYWNoZWQhXCIpO1xuICBpZiAodXRpbHMuUExBVEZPUk1fVFlQRSA9PT0gdXRpbHMuUGxhdGZvcm1UeXBlLkFORFJPSUQpIHtcbiAgICB0cnkge1xuICAgICAgQ3Jvc3NBbmRyb2lkLmV4ZWN1dGVQb3N0R2FtZUxvYWQoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYEZhaWxlZCB0byBhcHBseSBDcm9zc0FuZHJvaWQncyBidWlsdC1pbiBtb2RzOmAsIGVycik7XG4gICAgfVxuICB9XG4gIGF3YWl0IGV4ZWN1dGVTdGFnZShsb2FkZWRNb2RzLCAncHJlc3RhcnQnKTtcblxuICBjb25zb2xlLmxvZygncnVubmluZyBzdGFydENyb3NzQ29kZSgpLi4uJyk7XG4gIHN0YXJ0R2FtZUZuKCk7XG5cbiAgbGV0IGFjdGl2ZURlbGVnYXRlRm4gPSBhd2FpdCBnYW1lLmdldERlbGVnYXRlQWN0aXZhdGlvbkZ1bmN0aW9uKCk7XG4gIGNvbnNvbGUubG9nKFwic3RhZ2UgJ3Bvc3RzdGFydCcgcmVhY2hlZCFcIik7XG4gIGF3YWl0IGV4ZWN1dGVTdGFnZShsb2FkZWRNb2RzLCAncG9zdHN0YXJ0Jyk7XG5cbiAgLy8gTk9URTogTEVHQUNZIENDTE9BREVSMiBFVkVOVFxuICBkb2N1bWVudC5ib2R5LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdtb2RzTG9hZGVkJywgeyBidWJibGVzOiB0cnVlIH0pKTtcblxuICBhY3RpdmVEZWxlZ2F0ZUZuKCk7XG4gIGNvbnNvbGUubG9nKCdjcm9zc2NvZGUgd2l0aCBtb2RzIGlzIG5vdyBmdWxseSBsb2FkZWQhJyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRNb2Rsb2FkZXJNZXRhZGF0YSgpOiBQcm9taXNlPHsgdmVyc2lvbjogc2VtdmVyLlNlbVZlciB9PiB7XG4gIGxldCBmaWxlUGF0aCA9ICcuL2NjbG9hZGVyMy9tZXRhZGF0YS5qc29uJztcbiAgbGV0IGpzb25UZXh0ID0gYXdhaXQgZmlsZXMubG9hZFRleHQoZmlsZVBhdGgpO1xuICBsZXQgZGF0YSA9IEpTT04ucGFyc2UoanNvblRleHQpIGFzIHsgdmVyc2lvbjogc3RyaW5nIH07XG4gIHJldHVybiB7XG4gICAgdmVyc2lvbjogbmV3IHNlbXZlci5TZW1WZXIoZGF0YS52ZXJzaW9uLCB7XG4gICAgICBpbmNsdWRlUHJlcmVsZWFzZTogdHJ1ZSxcbiAgICB9KSxcbiAgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9hZEFsbE1vZE1ldGFkYXRhKGNvbmZpZzogY29uZmlnTS5Db25maWcsIGluc3RhbGxlZE1vZHM6IE1vZHNNYXApOiBQcm9taXNlPHZvaWQ+IHtcbiAgbGV0IGFsbE1vZHNMaXN0OiBBcnJheTx7IHBhcmVudERpcjogc3RyaW5nOyBkaXI6IHN0cmluZyB9PiA9IFtdO1xuICBsZXQgY2Ntb2RQYXRoczogc3RyaW5nW10gPSBbXTtcblxuICBmb3IgKGxldCBkaXIgb2YgY29uZmlnLm1vZHNEaXJzKSB7XG4gICAgbGV0IHN1YmRpcnNMaXN0OiBzdHJpbmdbXTtcbiAgICBsZXQgY2Ntb2RzOiBzdHJpbmdbXTtcbiAgICB0cnkge1xuICAgICAgKHsgbW9kRGlyZWN0b3JpZXM6IHN1YmRpcnNMaXN0LCBjY21vZHMgfSA9IGF3YWl0IGZpbGVzLmdldE1vZFBhdGhzSW4oZGlyLCBjb25maWcpKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUud2FybihgRmFpbGVkIHRvIGxvYWQgdGhlIGxpc3Qgb2YgbW9kcyBpbiAnJHtkaXJ9JzpgLCBlcnIpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGZvciAobGV0IHN1YmRpciBvZiBbLi4uc3ViZGlyc0xpc3QsIC4uLmNjbW9kc10pIHtcbiAgICAgIGFsbE1vZHNMaXN0LnB1c2goeyBwYXJlbnREaXI6IGRpciwgZGlyOiBzdWJkaXIgfSk7XG4gICAgfVxuICAgIGNjbW9kUGF0aHMucHVzaCguLi5jY21vZHMpO1xuICB9XG5cbiAgYXdhaXQgbG9hZENDTW9kcyhjY21vZFBhdGhzKTtcblxuICBsZXQgbW9kc0NvdW50UGVyRGlyID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcbiAgYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgYWxsTW9kc0xpc3QubWFwKGFzeW5jICh7IHBhcmVudERpciwgZGlyIH0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCBtb2QgPSBhd2FpdCBsb2FkTW9kTWV0YWRhdGEoZGlyKTtcbiAgICAgICAgaWYgKG1vZCA9PSBudWxsKSByZXR1cm47XG5cbiAgICAgICAgbGV0IG1vZFdpdGhTYW1lSWQgPSBpbnN0YWxsZWRNb2RzLmdldChtb2QuaWQpO1xuICAgICAgICBpZiAobW9kV2l0aFNhbWVJZCAhPSBudWxsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEEgbW9kIHdpdGggSUQgJyR7bW9kLmlkfScgaGFzIGFscmVhZHkgYmVlbiBsb2FkZWQgZnJvbSAnJHttb2RXaXRoU2FtZUlkLmJhc2VEaXJlY3Rvcnl9J2AsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGluc3RhbGxlZE1vZHMuc2V0KG1vZC5pZCwgbW9kKTtcbiAgICAgICAgbW9kc0NvdW50UGVyRGlyLnNldChwYXJlbnREaXIsIChtb2RzQ291bnRQZXJEaXIuZ2V0KHBhcmVudERpcikgPz8gMCkgKyAxKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBBbiBlcnJvciBvY2N1cmVkIHdoaWxlIGxvYWRpbmcgdGhlIG1ldGFkYXRhIG9mIGEgbW9kIGluICcke2Rpcn0nOmAsIGVycik7XG4gICAgICB9XG4gICAgfSksXG4gICk7XG5cbiAgZm9yIChsZXQgW2RpciwgY291bnRdIG9mIG1vZHNDb3VudFBlckRpcikge1xuICAgIGNvbnNvbGUubG9nKGBmb3VuZCAke2NvdW50fSBtb2RzIGluICcke2Rpcn0nYCk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZmluZEFsbEV4dGVuc2lvbnMoXG4gIGNvbmZpZzogY29uZmlnTS5Db25maWcsXG4gIGluc3RhbGxlZEV4dGVuc2lvbnM6IE1hcDxzdHJpbmcsIHNlbXZlci5TZW1WZXI+LFxuICBlbmFibGVkRXh0ZW5zaW9uczogTWFwPHN0cmluZywgc2VtdmVyLlNlbVZlcj4sXG4gIGRlZmF1bHRFeHRWZXJzaW9uOiBzZW12ZXIuU2VtVmVyLFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGxldCBleHRMaXN0OiBzdHJpbmdbXTtcbiAgdHJ5IHtcbiAgICBleHRMaXN0ID0gYXdhaXQgZmlsZXMuZ2V0SW5zdGFsbGVkRXh0ZW5zaW9ucyhjb25maWcpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLndhcm4oJ0ZhaWxlZCB0byBsb2FkIHRoZSBleHRlbnNpb25zIGxpc3Q6JywgZXJyKTtcbiAgICByZXR1cm47XG4gIH1cbiAgZm9yIChsZXQgZXh0SUQgb2YgZXh0TGlzdCkge1xuICAgIGxldCBleHRWZXJzaW9uID0gbmV3IHNlbXZlci5TZW1WZXIoZGVmYXVsdEV4dFZlcnNpb24sIGRlZmF1bHRFeHRWZXJzaW9uLm9wdGlvbnMpO1xuICAgIGlmIChleHRJRC5zdGFydHNXaXRoKCctJykpIHtcbiAgICAgIC8vIEV4dGVuc2lvbiBpcyBkaXNhYmxlZFxuICAgICAgZXh0SUQgPSBleHRJRC5zbGljZSgxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW5hYmxlZEV4dGVuc2lvbnMuc2V0KGV4dElELCBleHRWZXJzaW9uKTtcbiAgICB9XG4gICAgaW5zdGFsbGVkRXh0ZW5zaW9ucy5zZXQoZXh0SUQsIGV4dFZlcnNpb24pO1xuICB9XG59XG5cbmxldCBtYW5pZmVzdFZhbGlkYXRvciA9IG5ldyBtYW5pZmVzdE0uVmFsaWRhdG9yKCk7XG5cbmFzeW5jIGZ1bmN0aW9uIGxvYWRNb2RNZXRhZGF0YShiYXNlRGlyZWN0b3J5OiBzdHJpbmcpOiBQcm9taXNlPE1vZCB8IG51bGw+IHtcbiAgbGV0IG1hbmlmZXN0RmlsZTogc3RyaW5nO1xuICBsZXQgbWFuaWZlc3RUZXh0OiBzdHJpbmc7XG4gIGxldCBsZWdhY3lNb2RlID0gZmFsc2U7XG5cbiAgdHJ5IHtcbiAgICBtYW5pZmVzdEZpbGUgPSBgJHtiYXNlRGlyZWN0b3J5fS9jY21vZC5qc29uYDtcbiAgICBtYW5pZmVzdFRleHQgPSBhd2FpdCBmaWxlcy5sb2FkVGV4dChtYW5pZmVzdEZpbGUpO1xuICB9IGNhdGNoIChfZTEpIHtcbiAgICB0cnkge1xuICAgICAgbGVnYWN5TW9kZSA9IHRydWU7XG4gICAgICBtYW5pZmVzdEZpbGUgPSBgJHtiYXNlRGlyZWN0b3J5fS9wYWNrYWdlLmpzb25gO1xuICAgICAgbWFuaWZlc3RUZXh0ID0gYXdhaXQgZmlsZXMubG9hZFRleHQobWFuaWZlc3RGaWxlKTtcbiAgICB9IGNhdGNoIChfZTIpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGxldCBtYW5pZmVzdERhdGE6IE1hbmlmZXN0IHwgTGVnYWN5TWFuaWZlc3Q7XG4gIHRyeSB7XG4gICAgbWFuaWZlc3REYXRhID0gSlNPTi5wYXJzZShtYW5pZmVzdFRleHQpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAodXRpbHMuZXJyb3JIYXNNZXNzYWdlKGVycikpIHtcbiAgICAgIGVyci5tZXNzYWdlID0gYFN5bnRheCBlcnJvciBpbiBtb2QgbWFuaWZlc3QgaW4gJyR7bWFuaWZlc3RGaWxlfSc6ICR7ZXJyLm1lc3NhZ2V9YDtcbiAgICB9XG4gICAgdGhyb3cgZXJyO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBpZiAobGVnYWN5TW9kZSkge1xuICAgICAgbWFuaWZlc3REYXRhID0gbWFuaWZlc3REYXRhIGFzIExlZ2FjeU1hbmlmZXN0O1xuICAgICAgbWFuaWZlc3RWYWxpZGF0b3IudmFsaWRhdGVMZWdhY3kobWFuaWZlc3REYXRhKTtcbiAgICAgIG1hbmlmZXN0RGF0YSA9IG1hbmlmZXN0TS5jb252ZXJ0RnJvbUxlZ2FjeShtYW5pZmVzdERhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBtYW5pZmVzdERhdGEgPSBtYW5pZmVzdERhdGEgYXMgTWFuaWZlc3Q7XG4gICAgICBtYW5pZmVzdFZhbGlkYXRvci52YWxpZGF0ZShtYW5pZmVzdERhdGEpO1xuXG4gICAgICAvLyBOT1RFOiBEdXJpbmcgdGhlIG1pZ3JhdGlvbiBwZXJpb2Qgb2YgbGVnYWN5IG1vZHMgdG8gdGhlIG5ldyBmb3JtYXQsXG4gICAgICAvLyB0aGVpciBgcGFja2FnZS5qc29uYHMgd2VyZSBjb252ZXJ0ZWQgdG8gYGNjbW9kLmpzb25gLiBUaGUgcHJvYmxlbSBpc1xuICAgICAgLy8gdGhhdCBhcHBhcmVudGx5IG5vYm9keSBpbnZvbHZlZCBpbiB0aGlzIHByb2Nlc3MgKGV2ZW4gdGhlIG9uZXMgd2hvXG4gICAgICAvLyBpbXBsZW1lbnRlZCB0aGlzIGRldGFpbCkgZGlkbid0IHJlbWVtYmVyIHRoYXQgaW4gdGhlIG5ldyBmb3JtYXQsIHBhdGhzXG4gICAgICAvLyBhcmUgYXNzdW1lZCB0byBiZSB3aXRoaW4gYGFzc2V0cy9gLiBTbywgd2hhdCBoYXBwZW5lZD8gVGhlIGBhc3NldHNgXG4gICAgICAvLyBhcnJheSBmcm9tIGBwYWNrYWdlLmpzb25gIHdhcyBjb3BpZWQgMToxIHRvIGBjY21vZC5qc29uYCwgbWVhbmluZyB0aGF0XG4gICAgICAvLyB0aGVyZSBhcmUgbm93IGBjY21vZC5qc29uYHMgd2l0aCBwYXRocyBpbiBgYXNzZXRzYCB0aGF0IHN0YXJ0IHdpdGhcbiAgICAgIC8vIGBhc3NldHMvYC4gVGhpcyBpcyByZXNvbHZlZCBleGNsdXNpdmVseSBmb3IgbGVnYWN5IG1hbmlmZXN0c1xuICAgICAgLy8gKG9idmlvdXNseSkgYnkgdGhlIGBjb252ZXJ0RnJvbUxlZ2FjeWAgY2FsbCBpbiB0aGUgYGlmYCBibG9jayBhYm92ZSxcbiAgICAgIC8vIGJ1dCBub3QgZm9yIGBjY21vZC5qc29uYHMgdGhhdCB3ZXJlIGluY29ycmVjdGx5IG1pZ3JhdGVkLiBJbnN0ZWFkIG9mXG4gICAgICAvLyBnb2luZyB0aHJvdWdoIHRoZSBoYXNzbGUgb2YgZ2V0dGluZyB0aG9zZSBtb2RzIHVwZGF0ZWQgKmFnYWluKiwgSSdsbFxuICAgICAgLy8ganVzdCBmaXggaXQgb25jZSBhbmQgZm9yIGFsbC5cbiAgICAgIG1hbmlmZXN0RGF0YS5hc3NldHMgPSBtYW5pZmVzdERhdGEuYXNzZXRzPy5tYXAoKGUpID0+IGUucmVwbGFjZSgvXmFzc2V0c1xcLy8sICcnKSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAodXRpbHMuZXJyb3JIYXNNZXNzYWdlKGVycikpIHtcbiAgICAgIGVyci5tZXNzYWdlID0gYEludmFsaWQgbW9kIG1hbmlmZXN0IGluICcke21hbmlmZXN0RmlsZX0nOiAke2Vyci5tZXNzYWdlfWA7XG4gICAgICAvLyBUT0RPOiBwdXQgYSBsaW5rIHRvIHRoZSBkb2N1bWVudGF0aW9uIGhlcmVcbiAgICB9XG4gICAgdGhyb3cgZXJyO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBNb2QoYmFzZURpcmVjdG9yeSwgbWFuaWZlc3REYXRhLCBsZWdhY3lNb2RlKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaW5pdE1vZFBsdWdpbkNsYXNzZXMobW9kczogUmVhZG9ubHlNb2RzTWFwKTogUHJvbWlzZTx2b2lkPiB7XG4gIGZvciAobGV0IG1vZCBvZiBtb2RzLnZhbHVlcygpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IG1vZC5pbml0Q2xhc3MoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoYEZhaWxlZCB0byBpbml0aWFsaXplIGNsYXNzIG9mIG1vZCAnJHttb2QuaWR9JzpgLCBlcnIpO1xuICAgIH1cbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBleGVjdXRlU3RhZ2UobW9kczogUmVhZG9ubHlNb2RzTWFwLCBzdGFnZTogTG9hZGluZ1N0YWdlKTogUHJvbWlzZTx2b2lkPiB7XG4gIGZvciAobGV0IG1vZCBvZiBtb2RzLnZhbHVlcygpKSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IG1vZC5leGVjdXRlU3RhZ2Uoc3RhZ2UpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihgRmFpbGVkIHRvIGV4ZWN1dGUgJHtzdGFnZX0gb2YgbW9kICcke21vZC5pZH0nOmAsIGVycik7XG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0ICogYXMgbW9kbG9hZGVyIGZyb20gJy4vbW9kbG9hZGVyJztcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gJ0BjY2xvYWRlcjMvY29tbW9uL3V0aWxzJztcblxuYXN5bmMgZnVuY3Rpb24gbWFpbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgbGV0IG9ubG9hZFByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4gcmVzb2x2ZSgpKTtcbiAgfSk7XG5cbiAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJykge1xuICAgIGxldCB7IGVudiB9ID0gcHJvY2VzcztcblxuICAgIGlmIChlbnYuQ0NMT0FERVJfT1BFTl9ERVZUT09MUyAhPSBudWxsKSB7XG4gICAgICBkZWxldGUgZW52LkNDTE9BREVSX09QRU5fREVWVE9PTFM7XG4gICAgICBsZXQgd2luID0gbncuV2luZG93LmdldCgpO1xuICAgICAgYXdhaXQgdXRpbHMuc2hvd0RldlRvb2xzKCk7XG4gICAgICB3aW4uZm9jdXMoKTtcbiAgICAgIGF3YWl0IHV0aWxzLndhaXQoNTAwKTtcbiAgICB9XG5cbiAgICBsZXQgdXJsT3ZlcnJpZGUgPSBlbnYuQ0NMT0FERVJfT1ZFUlJJREVfTUFJTl9VUkw7XG4gICAgaWYgKHVybE92ZXJyaWRlICE9IG51bGwpIHtcbiAgICAgIGRlbGV0ZSBlbnYuQ0NMT0FERVJfT1ZFUlJJREVfTUFJTl9VUkw7XG4gICAgICB3aW5kb3cubG9jYXRpb24ucmVwbGFjZShuZXcgVVJMKHVybE92ZXJyaWRlLCB3aW5kb3cubG9jYXRpb24ub3JpZ2luKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgYXdhaXQgb25sb2FkUHJvbWlzZTtcbiAgYXdhaXQgbW9kbG9hZGVyLmJvb3QoKTtcbn1cblxubWFpbigpLmNhdGNoKChlcnIpID0+IHtcbiAgY29uc29sZS5lcnJvcihlcnIpO1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7QUNJQSxJQUFNLFdBQW1CLElBQUksV0FBVyxDQUFDO0FBQ3pDLElBQU0scUJBQTZCLElBQUksV0FBVyxDQUFDO0FBRW5ELFNBQVMsZUFBZSxPQUFnQixNQUFvQjtBQUMxRCxNQUFJLE9BQU8sVUFBVSxVQUFVO0FBQzdCLFVBQU0sSUFBSSxVQUFVLFlBQVksSUFBSSxpQkFBaUI7QUFBQSxFQUN2RDtBQUNGO0FBR0EsU0FBUyxnQkFBZ0IsTUFBYyxnQkFBaUM7QUFDdEUsTUFBSSxNQUFNO0FBQ1YsTUFBSSxvQkFBb0I7QUFDeEIsTUFBSSxZQUFZO0FBQ2hCLE1BQUksT0FBTztBQUNYLE1BQUksT0FBTztBQUNYLFdBQVMsSUFBSSxHQUFHLEtBQUssS0FBSyxRQUFRLEtBQUs7QUFDckMsUUFBSSxJQUFJLEtBQUssT0FBUSxRQUFPLEtBQUssV0FBVyxDQUFDO0FBQUEsYUFDcEMsU0FBUyxtQkFBb0I7QUFBQSxRQUNqQyxRQUFPO0FBRVosUUFBSSxTQUFTLG9CQUFvQjtBQUMvQixVQUFJLGNBQWMsSUFBSSxLQUFLLFNBQVMsR0FBRztBQUFBLE1BRXZDLFdBQVcsU0FBUyxHQUFHO0FBQ3JCLFlBQ0UsSUFBSSxTQUFTLEtBQ2Isc0JBQXNCLEtBQ3RCLElBQUksV0FBVyxJQUFJLFNBQVMsQ0FBQyxNQUFNLFlBQ25DLElBQUksV0FB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QUNYLGFBQU8sU0FBUyxRQUFRLElBQUksSUFBSSxhQUFhLE9BQU8sU0FBUyxNQUFNLENBQUM7QUFDcEU7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUVBLFFBQU07QUFDTixRQUFnQixLQUFLO0FBQ3ZCO0FBRUEsS0FBSyxFQUFFLE1BQU0sQ0FBQ00sU0FBUTtBQUNwQixVQUFRLE1BQU1BLElBQUc7QUFDbkIsQ0FBQzsiLAogICJuYW1lcyI6IFsid2luZG93IiwgImVyciIsICJfYSIsICJnZXRJbnN0YWxsZWRFeHRlbnNpb25zIiwgImdldE1vZFBhdGhzSW4iLCAiaXNSZWFkYWJsZSIsICJsb2FkVGV4dCIsICJyZWFkRmlsZSIsICJlcnIiLCAicmVhZEZpbGUiLCAibG9hZFRleHQiLCAiaXNSZWFkYWJsZSIsICJnZXRNb2RQYXRoc0luIiwgImdldEluc3RhbGxlZEV4dGVuc2lvbnMiLCAiX2EiLCAiZ2V0SW5zdGFsbGVkRXh0ZW5zaW9ucyIsICJnZXRNb2RQYXRoc0luIiwgImlzUmVhZGFibGUiLCAibG9hZFRleHQiLCAicmVhZEZpbGUiLCAiZ2V0TW9kUGF0aHNJbiIsICJlcnIiLCAiZ2V0SW5zdGFsbGVkRXh0ZW5zaW9ucyIsICJfYSIsICJsIiwgImRhdGEiLCAiX2EiLCAiX2EiLCAiZGF0YSIsICJfYSIsICJfYSIsICJpc1JlYWRhYmxlIiwgImxvYWRUZXh0IiwgInJlYWRGaWxlIiwgImRhdGEiLCAiZmluZFJlY3Vyc2l2ZWx5IiwgImRpciIsICJnZXRNb2RQYXRoc0luIiwgImdldEluc3RhbGxlZEV4dGVuc2lvbnMiLCAiaXNSZWFkYWJsZSIsICJyZWFkRmlsZSIsICJsb2FkVGV4dCIsICJmaW5kUmVjdXJzaXZlbHkiLCAiaXNSZWFkYWJsZSIsICJlcnIiLCAiZGF0YSIsICJfYSIsICJfYiIsICJjb21wYXJlIiwgIm1heCIsICJfYSIsICJfYiIsICJlcnIiLCAiZmluZFJlY3Vyc2l2ZWx5IiwgImxvYWRUZXh0IiwgIl9hIiwgIl9iIiwgImZzIiwgImVyciIsICJfYSIsICJMb2dMZXZlbCIsICJlcnIiLCAibG9hZFRleHQiLCAiZGF0YSIsICJnZXRNb2RQYXRoc0luIiwgIl9hIiwgImdldEluc3RhbGxlZEV4dGVuc2lvbnMiLCAiZXJyIl0KfQo=
