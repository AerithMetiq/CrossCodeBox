var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// packages/common/src/paths.ts
var paths_exports = {};
__export(paths_exports, {
  basename: () => basename,
  dirname: () => dirname,
  extname: () => extname,
  isAbsolute: () => isAbsolute,
  jailRelative: () => jailRelative,
  join: () => join,
  normalize: () => normalize,
  relative: () => relative,
  resolve: () => resolve,
  stripRoot: () => stripRoot
});
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
function resolve(...args) {
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    let path = i >= 0 ? args[i] : process.cwd();
    validateString(path, "path");
    if (path.length === 0) continue;
    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute) return `/${resolvedPath}`;
  return resolvedPath.length > 0 ? resolvedPath : ".";
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
function isAbsolute(path) {
  validateString(path, "path");
  return path.length > 0 && path.charCodeAt(0) === CHAR_FORWARD_SLASH;
}
function stripRoot(path) {
  validateString(path, "path");
  while (path.length > 0 && path.charCodeAt(0) === CHAR_FORWARD_SLASH) {
    path = path.slice(1);
  }
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
function relative(from, to) {
  validateString(from, "from");
  validateString(to, "to");
  if (from === to) return "";
  from = resolve(from);
  to = resolve(to);
  if (from === to) return "";
  let fromStart = 1;
  let fromEnd = from.length;
  let fromLen = fromEnd - fromStart;
  let toStart = 1;
  let toLen = to.length - toStart;
  let length = fromLen < toLen ? fromLen : toLen;
  let lastCommonSep = -1;
  let i = 0;
  for (; i < length; i++) {
    let fromCode = from.charCodeAt(fromStart + i);
    if (fromCode !== to.charCodeAt(toStart + i)) break;
    else if (fromCode === CHAR_FORWARD_SLASH) lastCommonSep = i;
  }
  if (i === length) {
    if (toLen > length) {
      if (to.charCodeAt(toStart + i) === CHAR_FORWARD_SLASH) {
        return to.slice(toStart + i + 1);
      }
      if (i === 0) {
        return to.slice(toStart + i);
      }
    } else if (fromLen > length) {
      if (from.charCodeAt(fromStart + i) === CHAR_FORWARD_SLASH) {
        lastCommonSep = i;
      } else if (i === 0) {
        lastCommonSep = 0;
      }
    }
  }
  let out = "";
  for (i = fromStart + lastCommonSep + 1; i <= fromEnd; i++) {
    if (i === fromEnd || from.charCodeAt(i) === CHAR_FORWARD_SLASH) {
      out += out.length === 0 ? ".." : "/..";
    }
  }
  return `${out}${to.slice(toStart + lastCommonSep)}`;
}
function dirname(path) {
  validateString(path, "path");
  if (path.length === 0) return ".";
  let hasRoot = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
  let end = -1;
  let matchedSlash = true;
  for (let i = path.length - 1; i >= 1; --i) {
    if (path.charCodeAt(i) === CHAR_FORWARD_SLASH) {
      if (!matchedSlash) {
        end = i;
        break;
      }
    } else {
      matchedSlash = false;
    }
  }
  if (end === -1) return hasRoot ? "/" : ".";
  if (hasRoot && end === 1) return "//";
  return path.slice(0, end);
}
function basename(path, ext) {
  if (ext != null) validateString(ext, "ext");
  validateString(path, "path");
  let start = 0;
  let end = -1;
  let matchedSlash = true;
  if (ext != null && ext.length > 0 && ext.length <= path.length) {
    if (ext === path) return "";
    let extIdx = ext.length - 1;
    let firstNonSlashEnd = -1;
    for (let i = path.length - 1; i >= 0; --i) {
      let code = path.charCodeAt(i);
      if (code === CHAR_FORWARD_SLASH) {
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else {
        if (firstNonSlashEnd === -1) {
          matchedSlash = false;
          firstNonSlashEnd = i + 1;
        }
        if (extIdx >= 0) {
          if (code === ext.charCodeAt(extIdx)) {
            if (--extIdx === -1) {
              end = i;
            }
          } else {
            extIdx = -1;
            end = firstNonSlashEnd;
          }
        }
      }
    }
    if (start === end) end = firstNonSlashEnd;
    else if (end === -1) end = path.length;
    return path.slice(start, end);
  }
  for (let i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === CHAR_FORWARD_SLASH) {
      if (!matchedSlash) {
        start = i + 1;
        break;
      }
    } else if (end === -1) {
      matchedSlash = false;
      end = i + 1;
    }
  }
  if (end === -1) return "";
  return path.slice(start, end);
}
function extname(path) {
  validateString(path, "path");
  let startDot = -1;
  let startPart = 0;
  let end = -1;
  let matchedSlash = true;
  let preDotState = 0;
  for (let i = path.length - 1; i >= 0; --i) {
    let code = path.charCodeAt(i);
    if (code === CHAR_FORWARD_SLASH) {
      if (!matchedSlash) {
        startPart = i + 1;
        break;
      }
      continue;
    }
    if (end === -1) {
      matchedSlash = false;
      end = i + 1;
    }
    if (code === CHAR_DOT) {
      if (startDot === -1) startDot = i;
      else if (preDotState !== 1) preDotState = 1;
    } else if (startDot !== -1) {
      preDotState = -1;
    }
  }
  if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
  preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
  preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return "";
  }
  return path.slice(startDot, end);
}
var CHAR_DOT, CHAR_FORWARD_SLASH;
var init_paths = __esm({
  "packages/common/src/paths.ts"() {
    "use strict";
    CHAR_DOT = ".".charCodeAt(0);
    CHAR_FORWARD_SLASH = "/".charCodeAt(0);
  }
});

// packages/common/src/utils.ts
function showDevTools(window2 = nw.Window.get()) {
  return new Promise(
    (resolve2) => (
      // eslint-disable-next-line no-undefined
      window2.showDevTools(void 0, () => resolve2())
    )
  );
}
function showBackgroundPageDevTools() {
  return new Promise(
    (resolve2) => chrome.developerPrivate.openDevTools(
      {
        renderViewId: -1,
        renderProcessId: -1,
        extensionId: chrome.runtime.id
      },
      () => resolve2()
    )
  );
}
function wait(ms) {
  return new Promise((resolve2) => setTimeout(resolve2, ms));
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
function wrapPromiseResult(promise) {
  return promise.then(
    (value) => ({ type: "resolved", value }),
    (reason) => ({ type: "rejected", reason })
  );
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
function cwdFilePathFromURL(url) {
  return stripRoot(decodeURIComponent(url.pathname));
}
var PlatformType, PLATFORM_TYPE, stdlibNamespace;
var init_utils = __esm({
  "packages/common/src/utils.ts"() {
    "use strict";
    init_paths();
    PlatformType = /* @__PURE__ */ ((PlatformType2) => {
      PlatformType2["DESKTOP"] = "DESKTOP";
      PlatformType2["ANDROID"] = "ANDROID";
      PlatformType2["BROWSER"] = "BROWSER";
      return PlatformType2;
    })(PlatformType || {});
    PLATFORM_TYPE = (() => {
      if (typeof nw !== "undefined") {
        return "DESKTOP" /* DESKTOP */;
      }
      let params = new URLSearchParams(window.location.search);
      if (params.has("crossandroid")) {
        return "ANDROID" /* ANDROID */;
      }
      return "BROWSER" /* BROWSER */;
    })();
    stdlibNamespace = {
      PlatformType,
      PLATFORM_TYPE,
      showDevTools,
      showBackgroundPageDevTools,
      wait,
      compare,
      wrapPromiseResult,
      hasKey,
      mapGetOrInsert
    };
  }
});

// packages/common/src/vendor-libs/semver.ts
var __getOwnPropNames2, __commonJS, require_semver, semver_default;
var init_semver = __esm({
  "packages/common/src/vendor-libs/semver.ts"() {
    "use strict";
    __getOwnPropNames2 = Object.getOwnPropertyNames;
    __commonJS = (cb, mod) => function __require2() {
      return mod || (0, cb[__getOwnPropNames2(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    };
    require_semver = __commonJS({
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
        function parse(version2, options) {
          if (!options || typeof options !== "object") {
            options = {
              loose: !!options,
              includePrerelease: false
            };
          }
          if (version2 instanceof SemVer) {
            return version2;
          }
          if (typeof version2 !== "string") {
            return null;
          }
          if (version2.length > MAX_LENGTH) {
            return null;
          }
          var r = options.loose ? re[t.LOOSE] : re[t.FULL];
          if (!r.test(version2)) {
            return null;
          }
          try {
            return new SemVer(version2, options);
          } catch (er) {
            return null;
          }
        }
        exports.valid = valid;
        function valid(version2, options) {
          var v = parse(version2, options);
          return v ? v.version : null;
        }
        exports.clean = clean;
        function clean(version2, options) {
          var s = parse(version2.trim().replace(/^[=v]+/, ""), options);
          return s ? s.version : null;
        }
        exports.SemVer = SemVer;
        function SemVer(version2, options) {
          if (!options || typeof options !== "object") {
            options = {
              loose: !!options,
              includePrerelease: false
            };
          }
          if (version2 instanceof SemVer) {
            if (version2.loose === options.loose) {
              return version2;
            } else {
              version2 = version2.version;
            }
          } else if (typeof version2 !== "string") {
            throw new TypeError("Invalid Version: " + version2);
          }
          if (version2.length > MAX_LENGTH) {
            throw new TypeError("version is longer than " + MAX_LENGTH + " characters");
          }
          if (!(this instanceof SemVer)) {
            return new SemVer(version2, options);
          }
          debug("SemVer", version2, options);
          this.options = options;
          this.loose = !!options.loose;
          var m = version2.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
          if (!m) {
            throw new TypeError("Invalid Version: " + version2);
          }
          this.raw = version2;
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
        function inc(version2, release, loose, identifier) {
          if (typeof loose === "string") {
            identifier = loose;
            loose = void 0;
          }
          try {
            return new SemVer(version2, loose).inc(release, identifier).version;
          } catch (er) {
            return null;
          }
        }
        exports.diff = diff3;
        function diff3(version1, version2) {
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
        exports.patch = patch3;
        function patch3(a, loose) {
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
        Comparator.prototype.test = function(version2) {
          debug("Comparator.test", version2, this.options.loose);
          if (this.semver === ANY || version2 === ANY) {
            return true;
          }
          if (typeof version2 === "string") {
            try {
              version2 = new SemVer(version2, this.options);
            } catch (er) {
              return false;
            }
          }
          return cmp(version2, this.operator, this.semver, this.options);
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
        Range.prototype.test = function(version2) {
          if (!version2) {
            return false;
          }
          if (typeof version2 === "string") {
            try {
              version2 = new SemVer(version2, this.options);
            } catch (er) {
              return false;
            }
          }
          for (var i2 = 0; i2 < this.set.length; i2++) {
            if (testSet(this.set[i2], version2, this.options)) {
              return true;
            }
          }
          return false;
        };
        function testSet(set, version2, options) {
          for (var i2 = 0; i2 < set.length; i2++) {
            if (!set[i2].test(version2)) {
              return false;
            }
          }
          if (version2.prerelease.length && !options.includePrerelease) {
            for (i2 = 0; i2 < set.length; i2++) {
              debug(set[i2].semver);
              if (set[i2].semver === ANY) {
                continue;
              }
              if (set[i2].semver.prerelease.length > 0) {
                var allowed = set[i2].semver;
                if (allowed.major === version2.major && allowed.minor === version2.minor && allowed.patch === version2.patch) {
                  return true;
                }
              }
            }
            return false;
          }
          return true;
        }
        exports.satisfies = satisfies;
        function satisfies(version2, range, options) {
          try {
            range = new Range(range, options);
          } catch (er) {
            return false;
          }
          return range.test(version2);
        }
        exports.maxSatisfying = maxSatisfying;
        function maxSatisfying(versions, range, options) {
          var max = null;
          var maxSV = null;
          try {
            var rangeObj = new Range(range, options);
          } catch (er) {
            return null;
          }
          versions.forEach(function(v) {
            if (rangeObj.test(v)) {
              if (!max || maxSV.compare(v) === -1) {
                max = v;
                maxSV = new SemVer(max, options);
              }
            }
          });
          return max;
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
        function ltr(version2, range, options) {
          return outside(version2, range, "<", options);
        }
        exports.gtr = gtr;
        function gtr(version2, range, options) {
          return outside(version2, range, ">", options);
        }
        exports.outside = outside;
        function outside(version2, range, hilo, options) {
          version2 = new SemVer(version2, options);
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
          if (satisfies(version2, range, options)) {
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
            if ((!low.operator || low.operator === comp) && ltefn(version2, low.semver)) {
              return false;
            } else if (low.operator === ecomp && ltfn(version2, low.semver)) {
              return false;
            }
          }
          return true;
        }
        exports.prerelease = prerelease;
        function prerelease(version2, options) {
          var parsed = parse(version2, options);
          return parsed && parsed.prerelease.length ? parsed.prerelease : null;
        }
        exports.intersects = intersects;
        function intersects(r1, r2, options) {
          r1 = new Range(r1, options);
          r2 = new Range(r2, options);
          return r1.intersects(r2);
        }
        exports.coerce = coerce;
        function coerce(version2, options) {
          if (version2 instanceof SemVer) {
            return version2;
          }
          if (typeof version2 === "number") {
            version2 = String(version2);
          }
          if (typeof version2 !== "string") {
            return null;
          }
          options = options || {};
          var match = null;
          if (!options.rtl) {
            match = version2.match(re[t.COERCE]);
          } else {
            var next;
            while ((next = re[t.COERCERTL].exec(version2)) && (!match || match.index + match[0].length !== version2.length)) {
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
    semver_default = require_semver();
  }
});

// packages/common/src/vendor-libs/patch-steps-lib/src/patchsteps-utils.ts
function photomerge(a, b) {
  if (Array.isArray(b)) {
    for (let i = 0; i < b.length; i++)
      a.push(photocopy(b[i]));
  } else if (b instanceof Object) {
    for (let k in b)
      a[photocopy(k)] = photocopy(b[k]);
  } else {
    throw new Error("We can't do that! ...Who'd clean up the mess?");
  }
  return a;
}
function photocopy(o) {
  if (o) {
    if (o.constructor === Array)
      return photomerge([], o);
    if (o.constructor === Object)
      return photomerge({}, o);
  }
  return o;
}
var init_patchsteps_utils = __esm({
  "packages/common/src/vendor-libs/patch-steps-lib/src/patchsteps-utils.ts"() {
    "use strict";
  }
});

// packages/common/src/vendor-libs/patch-steps-lib/src/types.ts
function unsafeAssert(val) {
}
var init_types = __esm({
  "packages/common/src/vendor-libs/patch-steps-lib/src/types.ts"() {
    "use strict";
  }
});

// packages/common/src/vendor-libs/patch-steps-lib/src/patchsteps-stepmachine.ts
var StepMachine;
var init_patchsteps_stepmachine = __esm({
  "packages/common/src/vendor-libs/patch-steps-lib/src/patchsteps-stepmachine.ts"() {
    "use strict";
    StepMachine = class {
      constructor(steps) {
        this.steps = steps;
        this.si = 0;
        this.finished = false;
      }
      *run() {
        while (this.si < this.steps.length) {
          yield [this.si, this.steps[this.si]];
          if (this.finished) {
            break;
          }
          this.si++;
        }
      }
      addSteps(newSteps) {
        if (Array.isArray(newSteps)) {
          this.steps = this.steps.concat(newSteps);
        } else {
          this.steps.push(newSteps);
        }
      }
      exit() {
        this.finished = true;
      }
      gotoLabel(labelName) {
        const labelIndex = this.findLabelIndex(labelName);
        if (labelIndex == -1) {
          return false;
        }
        this.setStepIndex(labelIndex);
        return true;
      }
      setStepIndex(newStepIndex) {
        if (newStepIndex < 0 || this.steps.length <= newStepIndex) {
          return false;
        }
        this.si = newStepIndex;
        return true;
      }
      getCurrentStep() {
        return this.steps[this.si];
      }
      getStepIndex() {
        return this.si;
      }
      findLabelIndex(labelName) {
        let stepIndex = -1;
        for (const [index, step] of this.steps.entries()) {
          if (step["type"] !== "LABEL") {
            continue;
          }
          if (step["name"] == labelName) {
            stepIndex = index;
            break;
          }
        }
        return stepIndex;
      }
    };
  }
});

// packages/common/src/vendor-libs/patch-steps-lib/src/patchsteps-patch.ts
async function patch(a, steps, loader, debugState) {
  if (!debugState) {
    debugState = new DebugState();
    debugState.addFile(null);
  }
  if (steps.constructor === Object) {
    unsafeAssert(steps);
    unsafeAssert(a);
    for (let k in steps) {
      if (a[k] === void 0) {
        a[k] = steps[k];
      } else if (steps[k] && steps[k].constructor === Object) {
        await patch(a[k], steps[k], loader, debugState);
      } else {
        a[k] = steps[k];
      }
    }
    return;
  }
  unsafeAssert(steps);
  const state = {
    currentValue: a,
    stack: [],
    stepMachine: new StepMachine(steps),
    cloneMap: /* @__PURE__ */ new Map(),
    loader,
    debugState,
    debug: false,
    memory: {},
    functionName: "",
    stepReferenceIndex: 0
  };
  for (const [absoluteStepIndex, step] of state.stepMachine.run()) {
    try {
      const stepIndex = absoluteStepIndex - state.stepReferenceIndex;
      debugState.addStep(stepIndex, "", state.functionName);
      await applyStep(step, state);
      debugState.removeLastStep();
    } catch (e) {
      debugState.print();
      if (e !== debugState) {
        console.error(e);
      }
      return;
    }
  }
}
async function applyStep(step, state) {
  await state.debugState.beforeStep();
  if (callables.has(step["type"])) {
    let sstep = step;
    let callableId = sstep["type"];
    let callableStep = photocopy(sstep);
    delete callableStep["type"];
    sstep = {
      type: "CALL",
      id: callableId,
      args: callableStep
    };
    state.debugState.getLastStep().name = callableId;
    await appliers["CALL"].call(sstep, state);
  } else {
    state.debugState.getLastStep().name = step["type"];
    if (!appliers[step["type"]]) {
      state.debugState.getLastStep().name = "";
      state.debugState.throwError("TypeError", `${step["type"]} is not a valid type.`);
    }
    await appliers[step["type"]].call(step, state);
  }
  await state.debugState.afterStep();
}
function replaceObjectProperty(object, key, keyword, value) {
  let oldValue = object[key];
  if (!Array.isArray(keyword) && typeof keyword === "object") {
    for (const property in keyword) {
      if (keyword[property]) {
        object[key] = oldValue.replace(
          new RegExp(keyword[property], "g"),
          value[property] || ""
        );
        oldValue = object[key];
      }
    }
  } else {
    object[key] = oldValue.replace(
      new RegExp(keyword, "g"),
      value
    );
  }
}
function valueInsertion(obj, keyword, value) {
  if (Array.isArray(obj)) {
    for (let index = 0; index < obj.length; index++) {
      const child = obj[index];
      if (typeof child === "string") {
        replaceObjectProperty(obj, index, keyword, value);
      } else if (typeof child === "object") {
        valueInsertion(child, keyword, value);
      }
    }
  } else if (typeof obj === "object") {
    unsafeAssert(obj);
    for (let key in obj) {
      if (!obj[key]) continue;
      if (typeof obj[key] === "string") {
        replaceObjectProperty(obj, key, keyword, value);
      } else {
        valueInsertion(obj[key], keyword, value);
      }
    }
  }
}
function parsePath(url, fromGame) {
  try {
    const decomposedUrl = new URL(url);
    const protocol = decomposedUrl.protocol;
    const subUrl = decomposedUrl.pathname;
    let urlFromGame;
    if (protocol === "mod:") {
      urlFromGame = false;
    } else if (protocol === "game:") {
      urlFromGame = true;
    } else {
      urlFromGame = protocol.substring(0, protocol.length - 1);
    }
    return [urlFromGame, subUrl];
  } catch (e) {
    return [fromGame, url];
  }
}
var DebugState, callables, appliers;
var init_patchsteps_patch = __esm({
  "packages/common/src/vendor-libs/patch-steps-lib/src/patchsteps-patch.ts"() {
    "use strict";
    init_patchsteps_utils();
    init_types();
    init_patchsteps_stepmachine();
    DebugState = class {
      // The constructor. The default state of a DebugState is invalid; a file must be added (even if null) to make it valid.
      constructor() {
        this.fileStack = [];
        this.currentFile = null;
      }
      /**
       * Translates a ParsedPath into a string.
       * Overridable.
       */
      translateParsedPath(parsedPath) {
        if (parsedPath === null) return "(unknown file)";
        let protocol = parsedPath[0].toString();
        if (parsedPath[0] === true) {
          protocol = "game";
        } else if (parsedPath[0] === false) {
          protocol = "mod";
        }
        return protocol + ":" + parsedPath[1];
      }
      /**
       * Enters a file by parsedPath. Do not override.
       * @final
       */
      addFile(parsedPath) {
        const path = this.translateParsedPath(parsedPath);
        const fileInfo = {
          path,
          stack: []
        };
        this.currentFile = fileInfo;
        this.fileStack.push(fileInfo);
      }
      /**
       * Removes a pushed file.
       * @final
       */
      removeLastFile() {
        const lastFile = this.fileStack.pop();
        this.currentFile = this.fileStack[this.fileStack.length - 1];
        return lastFile;
      }
      /**
       * Enters a step. Note that calls to this *surround* applyStep as the index is not available to it.
       * @final
       */
      addStep(index, name = "", functionName = "") {
        this.currentFile.stack.push({
          type: "Step",
          index,
          name,
          functionName
        });
      }
      /**
       * Leaves a step.
       * @final
       */
      removeLastStep() {
        const stack = this.currentFile.stack;
        let currentStep = null;
        for (let index = stack.length - 1; index >= 0; index--) {
          const entry = stack[index];
          if (entry.type === "Step") {
            currentStep = entry;
            stack.splice(index, 1);
            index = -1;
          }
        }
        return currentStep;
      }
      /**
       * Gets the last (i.e. current) step.
       * @final
       */
      getLastStep() {
        const stack = this.currentFile.stack;
        let currentStep = null;
        for (let index = stack.length - 1; index >= 0; index--) {
          const entry = stack[index];
          if (entry.type === "Step") {
            currentStep = entry;
            index = -1;
          }
        }
        return currentStep;
      }
      /**
       * Throws this instance as an error.
       * @final
       */
      throwError(type, message) {
        this.currentFile.stack.push({
          type: "Error",
          errorType: type,
          errorMessage: message
        });
        throw this;
      }
      /**
       * Prints information about a specific file on the stack.
       * Overridable.
       */
      printFileInfo(file) {
        console.log(`File %c${file.path}`, "red");
        let message = "";
        const stack = file.stack;
        for (let i = stack.length - 1; i >= 0; i--) {
          const step = stack[i];
          switch (step.type) {
            case "Error":
              message += `${step.errorType}: ${step.errorMessage}
`;
              break;
            case "Step":
              message += "			at ";
              if (step.name) {
                message += `${step.name} `;
              }
              if (step.functionName) {
                message += `(step ${step.functionName}:${step.index})
`;
              } else {
                message += `(step ${step.index})
`;
              }
              break;
            default:
              break;
          }
        }
        console.log(message);
      }
      /**
       * Prints information about the whole stack.
       * @final
       */
      print() {
        for (let fileIndex = 0; fileIndex < this.fileStack.length; fileIndex++) {
          this.printFileInfo(this.fileStack[fileIndex]);
        }
      }
      /**
       * Run at the start of applyStep; after the step has been entered formally, but before executing it.
       * Overridable.
       */
      async beforeStep() {
      }
      /**
       * Run at the end of applyStep; after executing the step, but before leaving it formally.
       * Overridable.
       */
      async afterStep() {
      }
    };
    callables = /* @__PURE__ */ new Map();
    appliers = {};
    appliers["FOR_IN"] = async function(state) {
      const body = this["body"];
      const values = this["values"];
      const keyword = this["keyword"];
      if (!Array.isArray(body)) {
        state.debugState.throwError("ValueError", "body must be an array.");
      }
      if (!values) {
        state.debugState.throwError("ValueError", "values must be set.");
      }
      if (!keyword) {
        state.debugState.throwError("ValueError", "keyword must be set.");
      }
      for (let i = 0; i < values.length; i++) {
        const cloneBody = photocopy(body);
        const value = values[i];
        valueInsertion(cloneBody, keyword, value);
        state.debugState.addStep(i, "VALUE_INDEX");
        for (let index = 0; index < cloneBody.length; index++) {
          const statement = cloneBody[index];
          const type = statement["type"];
          state.debugState.addStep(index, type);
          await applyStep(statement, state);
          state.debugState.removeLastStep();
        }
        state.debugState.removeLastStep();
      }
    };
    appliers["COPY"] = async function(state) {
      if (!("alias" in this)) {
        state.debugState.throwError("ValueError", "alias must be set.");
      }
      const value = photocopy(state.currentValue);
      state.cloneMap.set(this["alias"], value);
    };
    appliers["PASTE"] = async function(state) {
      if (!("alias" in this)) {
        state.debugState.throwError("ValueError", "alias must be set.");
      }
      const value = photocopy(state.cloneMap.get(this["alias"]));
      if (Array.isArray(state.currentValue)) {
        const obj = {
          type: "ADD_ARRAY_ELEMENT",
          content: value,
          ...typeof this["index"] === "number" && !isNaN(this["index"]) ? { index: this["index"] } : {}
        };
        await applyStep(obj, state);
      } else if (typeof state.currentValue === "object") {
        await applyStep(
          {
            type: "SET_KEY",
            index: this["index"],
            content: value
          },
          state
        );
      } else {
        state.debugState.throwError("TypeError", `Type ${typeof state.currentValue} is not supported.`);
      }
    };
    appliers["COMMENT"] = async function(state) {
      if (state.debug) {
        console.log(this["value"]);
      }
    };
    appliers["ENTER"] = async function(state) {
      if (!("index" in this)) {
        state.debugState.throwError("Error", "index must be set.");
      }
      const path = Array.isArray(this["index"]) ? this["index"] : [this["index"]];
      for (let i = 0; i < path.length; i++) {
        const idx = path[i];
        unsafeAssert(state.currentValue);
        state.stack.push(state.currentValue);
        if (state.currentValue[idx] === void 0) {
          const subArr = path.slice(0, i + 1);
          state.debugState.throwError(
            "Error",
            `index sequence ${subArr.join(",")} leads to an undefined state.`
          );
        }
        state.currentValue = state.currentValue[idx];
      }
    };
    appliers["EXIT"] = async function(state) {
      let count = 1;
      if (this["count"] !== void 0) count = this["count"];
      for (let i = 0; i < count; i++) {
        if (state.stack.length === 0) {
          state.debugState.throwError("Error", `EXIT #${count + 1} leads to an undefined state.`);
        }
        state.currentValue = state.stack.pop();
      }
    };
    appliers["SET_KEY"] = async function(state) {
      if (!("index" in this)) {
        state.debugState.throwError("Error", "index must be set.");
      }
      unsafeAssert(state.currentValue);
      if ("content" in this) {
        state.currentValue[this["index"]] = photocopy(this["content"]);
      } else {
        delete state.currentValue[this["index"]];
      }
    };
    appliers["REMOVE_ARRAY_ELEMENT"] = async function(state) {
      unsafeAssert(state.currentValue);
      state.currentValue.splice(this["index"], 1);
    };
    appliers["ADD_ARRAY_ELEMENT"] = async function(state) {
      unsafeAssert(state.currentValue);
      if (this["index"] !== void 0) {
        state.currentValue.splice(this["index"], 0, photocopy(this["content"]));
      } else {
        state.currentValue.push(photocopy(this["content"]));
      }
    };
    appliers["IMPORT"] = async function(state) {
      if (!("src" in this)) {
        state.debugState.throwError("ValueError", "src must be set.");
      }
      const srcPath = parsePath(this["src"], true);
      let obj = await state.loader.apply(state, srcPath);
      if (this["path"] !== void 0) {
        if (!Array.isArray(this["path"])) {
          state.debugState.throwError("ValueError", "path must be an array.");
        }
        for (let i = 0; i < this["path"].length; i++)
          obj = obj[this["path"][i]];
      }
      if (this["index"] !== void 0) {
        unsafeAssert(state.currentValue);
        state.currentValue[this["index"]] = photocopy(obj);
      } else {
        photomerge(state.currentValue, obj);
      }
    };
    appliers["INCLUDE"] = async function(state) {
      if (!("src" in this)) {
        state.debugState.throwError("ValueError", "src must be set.");
      }
      const srcPath = parsePath(this["src"], false);
      const data = await state.loader.apply(state, srcPath);
      state.debugState.addFile(srcPath);
      await patch(state.currentValue, data, state.loader, state.debugState);
      state.debugState.removeLastFile();
    };
    appliers["INIT_KEY"] = async function(state) {
      if (!("index" in this)) {
        state.debugState.throwError("ValueError", "index must be set.");
      }
      unsafeAssert(state.currentValue);
      if (!(this["index"] in state.currentValue))
        state.currentValue[this["index"]] = photocopy(this["content"]);
    };
    appliers["DEBUG"] = async function(state) {
      state.debug = !!this["value"];
    };
    appliers["MERGE_CONTENT"] = async function(state) {
      if (!("content" in this)) {
        state.debugState.throwError("ValueError", "content must be set");
      }
      photomerge(state.currentValue, this["content"]);
    };
  }
});

// packages/common/src/vendor-libs/patch-steps-lib/src/patchsteps-callable.ts
var patchsteps_callable_exports = {};
__export(patchsteps_callable_exports, {
  register: () => register
});
function register(id, callable) {
  if (id.length === 0) {
    throw Error("Id must not be empty.");
  }
  if (typeof callable !== "function") {
    throw Error("Callable must be a function.");
  }
  if (callables.has(id)) {
    throw Error(`Callable ${id} is already registered.`);
  }
  callables.set(id, callable);
}
var init_patchsteps_callable = __esm({
  "packages/common/src/vendor-libs/patch-steps-lib/src/patchsteps-callable.ts"() {
    "use strict";
    init_patchsteps_patch();
    appliers["CALL"] = async function(state) {
      const id = this["id"];
      const args = this["args"];
      if (!id) {
        state.debugState.throwError("ValueError", "Id must be set.");
      }
      if (!callables.has(id)) {
        state.debugState.throwError("ValueError", `${id} is not a valid callable.`);
      }
      const callable = callables.get(id);
      try {
        await callable(state, args);
      } catch (e) {
        if (e !== state.debugState) {
          console.error(e);
          state.debugState.throwError("ValueError", `Callable ${id} did not properly throw an error.`);
        }
        throw e;
      }
    };
  }
});

// packages/common/src/vendor-libs/patch-steps-lib/src/patchsteps-diff.ts
function diffHeuristic(a, b, settings) {
  if (a === null && b === null || a === void 0 && b === void 0) return 0;
  if (a === null || b === null || a === void 0 || b === void 0) return 1;
  if (a.constructor !== b.constructor) return 1;
  if (Array.isArray(a) && Array.isArray(b)) {
    let array = diffArrayHeuristic(a, b, settings);
    if (array.length == 0) return 0;
    let changes = 0;
    let ai = 0;
    let bi = 0;
    for (let i = 0; i < array.length; i++) {
      if (array[i] == "POPA") {
        changes++;
        ai++;
      } else if (array[i] == "INSERT") {
        bi++;
      } else if (array[i] == "PATCH") {
        changes += diffHeuristic(a[ai], b[bi], settings);
        ai++;
        bi++;
      }
    }
    return changes / array.length;
  } else if (a.constructor === Object && b.constructor === Object) {
    unsafeAssert(a);
    unsafeAssert(b);
    let total = [];
    for (let k in a) total.push(k);
    for (let k in b) if (!(k in a)) total.push(k);
    let change = 0;
    for (let i = 0; i < total.length; i++) {
      if (total[i] in a && !(total[i] in b)) {
        change += settings.diffAddNewKey;
      } else if (total[i] in b && !(total[i] in a)) {
        change += settings.diffAddDelKey;
      } else {
        change += diffHeuristic(
          a[total[i]],
          b[total[i]],
          settings
        ) * settings.diffMulSameKey;
      }
    }
    if (total.length != 0) return change / total.length;
    return 0;
  } else {
    return a == b ? 0 : 1;
  }
}
function diffArrayHeuristic(a, b, settings) {
  const lookahead = settings.arrayLookahead;
  let sublog = [];
  let ia = 0;
  for (let i = 0; i < b.length; i++) {
    let validDif = 2;
    let validSrc = null;
    for (let j = ia; j < Math.min(ia + lookahead, a.length); j++) {
      let dif = diffHeuristic(a[j], b[i], settings);
      if (dif < validDif) {
        validDif = dif;
        validSrc = j;
      }
    }
    if (validDif > settings.arrayTrulyDifferentThreshold) validSrc = null;
    if (validSrc != null) {
      while (ia < validSrc) {
        sublog.push("POPA");
        ia++;
      }
      sublog.push("PATCH");
      ia++;
    } else {
      if (ia == a.length) {
        sublog.push("INSERT");
      } else {
        sublog.push("PATCH");
        ia++;
      }
    }
  }
  while (ia < a.length) {
    sublog.push("POPA");
    ia++;
  }
  return sublog;
}
function diff(a, b, settings) {
  let trueSettings = photocopy(defaultSettings);
  if (settings !== void 0) photomerge(trueSettings, settings);
  if (trueSettings.comment !== void 0) trueSettings.commentValue = trueSettings.comment;
  let result = trueSettings.diffCore(a, b, trueSettings);
  if (!result) return null;
  if (trueSettings.optimize) {
    for (let i = 1; i < result.length; i++) {
      let here = result[i];
      let prev = result[i - 1];
      let optimizedOut = false;
      if (here["type"] == "EXIT") {
        if (prev["type"] == "EXIT") {
          if (!("count" in here)) here["count"] = 1;
          if (!("count" in prev)) prev["count"] = 1;
          unsafeAssert(prev);
          prev["count"] += here["count"];
          if ("comment" in here) prev["comment"] = here["comment"];
          optimizedOut = true;
        }
      } else if (here["type"] == "ENTER") {
        if (prev["type"] == "ENTER") {
          if (!Array.isArray(prev["index"])) prev["index"] = [prev["index"]];
          if (!Array.isArray(here["index"])) here["index"] = [here["index"]];
          prev["index"] = prev["index"].concat(here["index"]);
          optimizedOut = true;
        }
      }
      if (optimizedOut) {
        result.splice(i, 1);
        i--;
      }
    }
  }
  return result;
}
function diffApplyComment(step, settings) {
  if (settings.commentValue !== void 0) step.comment = settings.commentValue;
  return step;
}
function diffEnterLevel(a, b, index, settings) {
  settings.path.push(index);
  if (settings.comment !== void 0)
    settings.commentValue = settings.comment + "." + settings.path.join(".");
  let log = settings.diffCore(a, b, settings);
  settings.path.pop();
  return log;
}
function diffInterior(a, b, settings) {
  if (a === null && b === null || a === void 0 && b === void 0) return [];
  if (a === null || b === null || a === void 0 || b === void 0) return null;
  if (a.constructor !== b.constructor) return null;
  let log = [];
  if (Array.isArray(a) && Array.isArray(b)) {
    let array = diffArrayHeuristic(a, b, settings);
    let ai = 0;
    let bi = 0;
    for (let i = 0; i < array.length; i++) {
      if (array[i] == "POPA") {
        log.push(
          diffApplyComment(
            { type: "REMOVE_ARRAY_ELEMENT", index: bi },
            settings
          )
        );
        ai++;
      } else if (array[i] == "INSERT") {
        let insertion = diffApplyComment(
          {
            type: "ADD_ARRAY_ELEMENT",
            index: bi,
            content: photocopy(b[bi])
          },
          settings
        );
        let j;
        for (j = i + 1; j < array.length; j++)
          if (array[j] != "INSERT" && array[j] != "POPA") break;
        if (j == array.length) delete insertion["index"];
        log.push(insertion);
        bi++;
      } else if (array[i] == "PATCH") {
        let xd = diffEnterLevel(a[ai], b[bi], bi, settings);
        if (xd != null) {
          if (xd.length != 0) {
            log.push({ type: "ENTER", index: bi });
            log = log.concat(xd);
            log.push({ type: "EXIT" });
          }
        } else {
          log.push(
            diffApplyComment(
              { type: "SET_KEY", index: bi, content: photocopy(b[bi]) },
              settings
            )
          );
        }
        ai++;
        bi++;
      }
    }
  } else if (a.constructor === Object && b.constructor === Object) {
    unsafeAssert(a);
    unsafeAssert(b);
    for (let k in a) {
      if (k in b) {
        unsafeAssert(a);
        unsafeAssert(b);
        if (diffHeuristic(a[k], b[k], settings) >= settings.trulyDifferentThreshold) {
          log.push(
            diffApplyComment(
              { type: "SET_KEY", index: k, content: photocopy(b[k]) },
              settings
            )
          );
        } else {
          let xd = diffEnterLevel(a[k], b[k], k, settings);
          if (xd != null) {
            if (xd.length != 0) {
              log.push({ type: "ENTER", index: k });
              log = log.concat(xd);
              log.push({ type: "EXIT" });
            }
          } else {
            log.push(
              diffApplyComment(
                { type: "SET_KEY", index: k, content: photocopy(b[k]) },
                settings
              )
            );
          }
        }
      } else {
        log.push(diffApplyComment({ type: "SET_KEY", index: k }, settings));
      }
    }
    for (let k in b)
      if (!(k in a))
        log.push(
          diffApplyComment(
            {
              type: "SET_KEY",
              index: k,
              content: photocopy(b[k])
            },
            settings
          )
        );
  } else if (a != b) {
    return null;
  }
  return log;
}
var defaultSettings;
var init_patchsteps_diff = __esm({
  "packages/common/src/vendor-libs/patch-steps-lib/src/patchsteps-diff.ts"() {
    "use strict";
    init_patchsteps_utils();
    init_types();
    defaultSettings = {
      // A set of heuristic scoring numbers.
      arrayTrulyDifferentThreshold: 0.5,
      trulyDifferentThreshold: 0.5,
      arrayLookahead: 8,
      diffAddNewKey: 0,
      diffAddDelKey: 1,
      diffMulSameKey: 0.75,
      // The "diff core function". Takes (a, b, settings). Returns null for invalid, or a Patch Steps patch otherwise. Given valid JSON in (no arrays as keys, for example), all step arrays & objects must be unique and they cannot be self-referential.
      // Replacing this, combined with correct usage of the 'path' setting, allows you to add your own heuristics.
      diffCore: diffInterior,
      // If all steps should be commented with the path, a string should be placed here for a prefix.
      comment: void 0,
      // The current value of comment.
      commentValue: void 0,
      // The index path in the original object (A) leading to the object being diffed.
      path: [],
      // If the diff should be optimized to reduce the instruction count.
      optimize: true
    };
  }
});

// packages/common/src/vendor-libs/patch-steps-lib/src/patchsteps.ts
var version, photomerge2, photocopy2, diff2, diffEnterLevel2, diffApplyComment2, defaultSettings2, patch2, appliers2, DebugState2, callables2;
var init_patchsteps = __esm({
  "packages/common/src/vendor-libs/patch-steps-lib/src/patchsteps.ts"() {
    "use strict";
    init_patchsteps_utils();
    init_patchsteps_patch();
    init_patchsteps_callable();
    init_patchsteps_diff();
    version = "1.1.3";
    photomerge2 = photomerge;
    photocopy2 = photocopy;
    diff2 = diff;
    diffEnterLevel2 = diffEnterLevel;
    diffApplyComment2 = diffApplyComment;
    defaultSettings2 = defaultSettings;
    patch2 = patch;
    appliers2 = appliers;
    DebugState2 = DebugState;
    callables2 = callables;
  }
});

// packages/common/src/vendor-libs/patch-steps.ts
var patch_steps_exports = {};
__export(patch_steps_exports, {
  DebugState: () => DebugState2,
  appliers: () => appliers2,
  callable: () => patchsteps_callable_exports,
  callables: () => callables2,
  defaultSettings: () => defaultSettings2,
  diff: () => diff2,
  diffApplyComment: () => diffApplyComment2,
  diffEnterLevel: () => diffEnterLevel2,
  patch: () => patch2,
  photocopy: () => photocopy2,
  photomerge: () => photomerge2,
  version: () => version
});
var init_patch_steps = __esm({
  "packages/common/src/vendor-libs/patch-steps.ts"() {
    "use strict";
    init_patchsteps();
  }
});

// packages/runtime/src/patch-list.ts
var PatchList, ResourcePatchList, namespace;
var init_patch_list = __esm({
  "packages/runtime/src/patch-list.ts"() {
    "use strict";
    init_utils();
    PatchList = class {
      constructor() {
        this.patternPatchers = [];
        this.specificPatchers = /* @__PURE__ */ new Map();
      }
      forPath(path) {
        let patchers = [];
        for (let i = 0, len = this.patternPatchers.length; i < len; i++) {
          let [pattern, patcher] = this.patternPatchers[i];
          if (pattern.test(path)) patchers.push(patcher);
        }
        let specificForThisPath = this.specificPatchers.get(path);
        if (specificForThisPath != null) patchers.push(...specificForThisPath);
        return patchers;
      }
      add(path, patcher) {
        if (typeof path === "string") {
          let list = mapGetOrInsert(this.specificPatchers, path, []);
          list.push(patcher);
        } else {
          this.patternPatchers.push([path, patcher]);
        }
      }
    };
    ResourcePatchList = class extends PatchList {
      add(path, patcher) {
        if (typeof patcher === "function") patcher = { patcher };
        super.add(path, patcher);
      }
    };
    namespace = { PatchList, ResourcePatchList };
  }
});

// packages/common/src/vendor-libs/strip-json-comments.ts
function stripJsonComments(jsonString, { whitespace = true, trailingCommas = false } = {}) {
  if (typeof jsonString !== "string") {
    throw new TypeError(`Expected argument \`jsonString\` to be a \`string\`, got \`${typeof jsonString}\``);
  }
  const strip = whitespace ? stripWithWhitespace : stripWithoutWhitespace;
  let isInsideString = false;
  let isInsideComment = false;
  let offset = 0;
  let buffer = "";
  let result = "";
  let commaIndex = -1;
  for (let index = 0; index < jsonString.length; index++) {
    const currentCharacter = jsonString[index];
    const nextCharacter = jsonString[index + 1];
    if (!isInsideComment && currentCharacter === '"') {
      const escaped = isEscaped(jsonString, index);
      if (!escaped) {
        isInsideString = !isInsideString;
      }
    }
    if (isInsideString) {
      continue;
    }
    if (!isInsideComment && currentCharacter + nextCharacter === "//") {
      buffer += jsonString.slice(offset, index);
      offset = index;
      isInsideComment = singleComment;
      index++;
    } else if (isInsideComment === singleComment && currentCharacter + nextCharacter === "\r\n") {
      index++;
      isInsideComment = false;
      buffer += strip(jsonString, offset, index);
      offset = index;
      continue;
    } else if (isInsideComment === singleComment && currentCharacter === "\n") {
      isInsideComment = false;
      buffer += strip(jsonString, offset, index);
      offset = index;
    } else if (!isInsideComment && currentCharacter + nextCharacter === "/*") {
      buffer += jsonString.slice(offset, index);
      offset = index;
      isInsideComment = multiComment;
      index++;
      continue;
    } else if (isInsideComment === multiComment && currentCharacter + nextCharacter === "*/") {
      index++;
      isInsideComment = false;
      buffer += strip(jsonString, offset, index + 1);
      offset = index + 1;
      continue;
    } else if (trailingCommas && !isInsideComment) {
      if (commaIndex !== -1) {
        if (currentCharacter === "}" || currentCharacter === "]") {
          buffer += jsonString.slice(offset, index);
          result += strip(buffer, 0, 1) + buffer.slice(1);
          buffer = "";
          offset = index;
          commaIndex = -1;
        } else if (currentCharacter !== " " && currentCharacter !== "	" && currentCharacter !== "\r" && currentCharacter !== "\n") {
          buffer += jsonString.slice(offset, index);
          offset = index;
          commaIndex = -1;
        }
      } else if (currentCharacter === ",") {
        result += buffer + jsonString.slice(offset, index);
        buffer = "";
        offset = index;
        commaIndex = index;
      }
    }
  }
  return result + buffer + (isInsideComment ? strip(jsonString.slice(offset)) : jsonString.slice(offset));
}
var singleComment, multiComment, stripWithoutWhitespace, stripWithWhitespace, isEscaped;
var init_strip_json_comments = __esm({
  "packages/common/src/vendor-libs/strip-json-comments.ts"() {
    "use strict";
    singleComment = Symbol("singleComment");
    multiComment = Symbol("multiComment");
    stripWithoutWhitespace = () => "";
    stripWithWhitespace = (string, start, end) => string.slice(start, end).replace(/[^ \t\r\n]/g, " ");
    isEscaped = (jsonString, quotePosition) => {
      let index = quotePosition - 1;
      let backslashCount = 0;
      while (jsonString[index] === "\\") {
        index -= 1;
        backslashCount += 1;
      }
      return Boolean(backslashCount % 2);
    };
  }
});

// packages/common/src/resources.ts
function loadStylesheet(url, options) {
  return new Promise((resolve2, reject) => {
    options = options != null ? options : {};
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    if (options.type != null) link.type = options.type;
    link.onload = () => resolve2();
    link.onerror = () => reject(new Error(`Failed to load stylesheet '${url}'`));
    document.head.appendChild(link);
  });
}
function loadScript(url, options) {
  return new Promise((resolve2, reject) => {
    options = options != null ? options : {};
    let script = document.createElement("script");
    script.src = url;
    if (options.type != null) script.type = options.type;
    if (options.async != null) script.async = options.async;
    script.onload = () => resolve2();
    script.onerror = () => reject(new Error(`Failed to load script '${url}'`));
    document.body.appendChild(script);
  });
}
var init_resources = __esm({
  "packages/common/src/resources.ts"() {
    "use strict";
  }
});

// packages/runtime/src/resources-plain.ts
async function loadText(url) {
  let res;
  try {
    res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.text();
  } catch (err) {
    if (errorHasMessage(err)) {
      err.message = `Failed to load text file '${url}': ${err.message}`;
    }
    throw err;
  }
}
async function loadJSON(url) {
  let text = await loadText(url);
  try {
    return JSON.parse(stripJsonComments(text, { trailingCommas: true }));
  } catch (err) {
    if (errorHasMessage(err)) {
      err.message = `Failed to parse JSON file '${url}': ${err.message}`;
    }
    throw err;
  }
}
function loadImage(url) {
  return new Promise((resolve2, reject) => {
    let img = new Image();
    img.src = url;
    img.onload = () => resolve2(img);
    img.onerror = () => reject(new Error(`Failed to load image '${url}'`));
  });
}
var namespace4;
var init_resources_plain = __esm({
  "packages/runtime/src/resources-plain.ts"() {
    "use strict";
    init_utils();
    init_strip_json_comments();
    init_resources();
    namespace4 = {
      loadText,
      loadJSON,
      loadImage,
      loadScript,
      loadStylesheet
    };
  }
});

// packages/runtime/src/resources.ts
function registerPatchstepsPatch(mod, patchFileRelativePath, patchedAssetPath) {
  jsonPatches.add(patchedAssetPath, {
    dependencies: () => {
      return loadJSON(
        wrapPathIntoURL(`${mod.assetsDirectory}${patchFileRelativePath}`).href
      );
    },
    patcher: async (data, patchData) => {
      let debugState = new PatchstepsCustomDebugState(mod);
      debugState.addFile([
        /* fromGame */
        false,
        patchFileRelativePath
      ]);
      await patch2(data, patchData, patchstepsResourceLoader, debugState);
      return data;
    }
  });
  function patchstepsResourceLoader(fromGame, url) {
    return fromGame === false ? loadJSON(wrapPathIntoURL(mod.resolvePath(url)).href) : loadJSON2(url);
  }
}
async function loadText2(path, options) {
  var _a3;
  options = options != null ? options : {};
  let { resolvedPath, requestedAsset } = resolvePathAdvanced(path, options);
  if (((_a3 = options.allowGenerators) != null ? _a3 : true) && requestedAsset != null) {
    let generators = textGenerators.forPath(requestedAsset);
    if (generators.length > 0) {
      let ctx = { resolvedPath, requestedAsset, options };
      return runResourceGenerator("text file", path, generators, ctx);
    }
  }
  return loadText(wrapPathIntoURL(resolvedPath).href);
}
async function loadJSON2(path, options) {
  var _a3;
  options = options != null ? options : {};
  let { resolvedPath, requestedAsset } = resolvePathAdvanced(path, options);
  let data = null;
  let shouldFetchRealData = true;
  if (((_a3 = options.allowGenerators) != null ? _a3 : true) && requestedAsset != null) {
    let generators = jsonGenerators.forPath(requestedAsset);
    if (generators.length > 0) {
      let ctx = { resolvedPath, requestedAsset, options };
      data = await runResourceGenerator("JSON file", path, generators, ctx);
      shouldFetchRealData = false;
    }
  }
  if (shouldFetchRealData) {
    data = await loadJSON(wrapPathIntoURL(resolvedPath).href);
  }
  if (requestedAsset != null) {
    let patchers = jsonPatches.forPath(requestedAsset);
    if (patchers.length > 0) {
      let ctx = { resolvedPath, requestedAsset, options };
      data = await runResourcePatches("JSON file", path, data, patchers, ctx);
    }
  }
  return data;
}
async function loadImage2(path, options) {
  var _a3;
  options = options != null ? options : {};
  let { resolvedPath, requestedAsset } = resolvePathAdvanced(path, options);
  let data = null;
  let shouldFetchRealData = true;
  if (((_a3 = options.allowGenerators) != null ? _a3 : true) && requestedAsset != null) {
    let generators = imageGenerators.forPath(requestedAsset);
    if (generators.length > 0) {
      let ctx = { resolvedPath, requestedAsset, options };
      data = await runResourceGenerator("image", path, generators, ctx);
      shouldFetchRealData = false;
    }
  }
  if (shouldFetchRealData) {
    const url = `/${resolvedPath}`;
    data = await loadImage(url);
  }
  if (requestedAsset != null) {
    let patchers = imagePatches.forPath(requestedAsset);
    if (patchers.length > 0) {
      if (!(data instanceof HTMLCanvasElement)) {
        data = imageToCanvas(data);
      }
      let ctx = { resolvedPath, requestedAsset, options };
      data = await runResourcePatches("image", path, data, patchers, ctx);
    }
  }
  switch (options.returnCanvas) {
    case "always":
      if (!(data instanceof HTMLCanvasElement)) data = imageToCanvas(data);
      break;
    case "never":
      if (data instanceof HTMLCanvasElement) data = await canvasToImage(data);
      break;
    case "if-patched":
      break;
  }
  return data;
  function imageToCanvas(image) {
    let canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    return canvas;
  }
  function canvasToImage(canvas) {
    return loadImage(canvas.toDataURL("image/png"));
  }
}
async function runResourceGenerator(kind, path, matchingGenerators, context) {
  try {
    if (matchingGenerators.length === 1) {
      let generator = matchingGenerators[0];
      return generator(context);
    } else if (matchingGenerators.length > 1) {
      throw new Error(
        `Conflict between ${matchingGenerators.length} matching generators for '${path}' found`
      );
    } else {
      throw new Error("unreachable");
    }
  } catch (err) {
    if (errorHasMessage(err)) {
      err.message = `Failed to generate ${kind} '${path}': ${err.message}`;
    }
    throw err;
  }
}
async function runResourcePatches(kind, path, data, patchers, context) {
  try {
    let allDependencies = await Promise.all(
      patchers.map(
        (patcher) => patcher.dependencies != null ? patcher.dependencies(context) : void 0
      )
    );
    for (let i = 0; i < patchers.length; i++) {
      let patcher = patchers[i];
      let deps = allDependencies[i];
      let newData = await patcher.patcher(data, deps, context);
      if (newData !== void 0) data = newData;
    }
    return data;
  } catch (err) {
    if (errorHasMessage(err)) {
      err.message = `Failed to patch ${kind} '${path}': ${err.message}`;
    }
    throw err;
  }
}
function resolvePath(uri, options) {
  return resolvePathAdvanced(uri, options).resolvedPath;
}
function resolvePathToURL(path, options) {
  return wrapPathIntoURL(resolvePath(path, options)).href;
}
function resolvePathAdvanced(uri, options) {
  var _a3, _b;
  options = options != null ? options : {};
  let resolvedPath;
  let requestedAsset = null;
  let modResourcePath = applyModURLProtocol(uri);
  if (modResourcePath != null) {
    resolvedPath = modResourcePath;
  } else {
    let normalizedPath = normalize(uri);
    if (isAbsolute(normalizedPath)) {
      resolvedPath = stripRoot(normalizedPath);
    } else {
      let gameAssetsPath = stripRoot(getGameAssetsURL().pathname);
      resolvedPath = jailRelative(join(gameAssetsPath, normalizedPath));
      if (((_a3 = options.allowPatching) != null ? _a3 : true) && resolvedPath.startsWith(gameAssetsPath)) {
        requestedAsset = resolvedPath.slice(gameAssetsPath.length);
        if ((_b = options.allowAssetOverrides) != null ? _b : true) {
          let overridePath = assetOverridesTable.get(requestedAsset);
          if (overridePath != null) {
            resolvedPath = overridePath;
          }
        }
      }
    }
  }
  return { resolvedPath, requestedAsset };
}
function wrapPathIntoURL(path) {
  let url = cwdFilePathToURL(path, getGameAssetsURL().href);
  url.href += getCacheSuffix();
  return url;
}
function getGameAssetsURL() {
  let str;
  if (typeof ig !== "undefined") {
    str = ig.root;
  } else if (window.IG_ROOT != null) {
    str = window.IG_ROOT;
  } else {
    str = "";
  }
  return new URL(str, document.baseURI);
}
function getCacheSuffix() {
  if (typeof ig !== "undefined") {
    return ig.getCacheSuffix();
  } else if (window.IG_GAME_CACHE != null && window.IG_GAME_CACHE) {
    return `?nocache=${window.IG_GAME_CACHE}`;
  } else {
    return "";
  }
}
function applyModURLProtocol(fullURI) {
  if (!fullURI.startsWith(MOD_PROTOCOL_PREFIX)) return null;
  try {
    let uri = fullURI.slice(MOD_PROTOCOL_PREFIX.length);
    if (uri.length === 0) {
      throw new Error("the URI is empty");
    }
    let modIDSeparatorIndex = uri.indexOf("/");
    if (modIDSeparatorIndex < 0) {
      throw new Error("'/' after the mod ID is missing");
    }
    let modID = uri.slice(0, modIDSeparatorIndex);
    if (modID.length === 0) {
      throw new Error("the mod ID is empty");
    }
    let filePath = uri.slice(modIDSeparatorIndex + 1);
    if (filePath.length === 0) {
      throw new Error("the file path is empty");
    }
    let mod = modloader.loadedMods.get(modID);
    if (mod == null) {
      throw new Error(`mod '${modID}' not found`);
    }
    return mod.resolvePath(filePath);
  } catch (err) {
    if (errorHasMessage(err)) {
      err.message = `Invalid '${MOD_PROTOCOL_PREFIX}' URL '${fullURI}': ${err.message}`;
    }
    throw err;
  }
}
var MOD_PROTOCOL, MOD_PROTOCOL_PREFIX, assetOverridesTable, textGenerators, jsonPatches, jsonGenerators, imagePatches, imageGenerators, PatchstepsCustomDebugState, namespace5;
var init_resources2 = __esm({
  "packages/runtime/src/resources.ts"() {
    "use strict";
    init_resources_plain();
    init_patch_steps();
    init_utils();
    init_patch_list();
    init_paths();
    MOD_PROTOCOL = "mod:";
    MOD_PROTOCOL_PREFIX = `${MOD_PROTOCOL}//`;
    assetOverridesTable = /* @__PURE__ */ new Map();
    textGenerators = new PatchList();
    jsonPatches = new ResourcePatchList();
    jsonGenerators = new PatchList();
    imagePatches = new ResourcePatchList();
    imageGenerators = new PatchList();
    {
      let assetOverridesFromMods = /* @__PURE__ */ new Map();
      for (let mod of modloader.loadedMods.values()) {
        for (let asset of mod.assets) {
          if (asset.endsWith(".json.patch") || asset.endsWith(".patch.json")) {
            let patchedAsset = `${asset.slice(0, -".json.patch".length)}.json`;
            registerPatchstepsPatch(mod, asset, patchedAsset);
            continue;
          }
          let modsWithThisAsset = mapGetOrInsert(assetOverridesFromMods, asset, []);
          modsWithThisAsset.push(mod);
        }
      }
      for (let [asset, modsWithThisAsset] of assetOverridesFromMods) {
        if (modsWithThisAsset.length > 1) {
          console.warn(
            `Conflict between overrides for '${asset}' found in mods '${modsWithThisAsset.map((mod) => mod.id).join("', '")}'. Using the override from mod '${modsWithThisAsset[0].id}'`
          );
        }
        let overridePath = `${modsWithThisAsset[0].assetsDirectory}${asset}`;
        assetOverridesTable.set(asset, overridePath);
      }
    }
    PatchstepsCustomDebugState = class extends DebugState2 {
      constructor(currentMod) {
        super();
        this.currentMod = currentMod;
      }
      translateParsedPath(parsedPath) {
        if (parsedPath != null) {
          let [protocol, path] = parsedPath;
          switch (protocol) {
            case true:
            case "game":
              return resolvePath(path);
            case false:
            case "mod":
              return this.currentMod.resolvePath(path);
          }
        }
        return super.translateParsedPath(parsedPath);
      }
    };
    namespace5 = {
      plain: namespace4,
      assetOverridesTable,
      textGenerators,
      jsonPatches,
      jsonGenerators,
      imagePatches,
      imageGenerators,
      loadText: loadText2,
      loadJSON: loadJSON2,
      loadImage: loadImage2,
      resolvePath,
      resolvePathToURL,
      resolvePathAdvanced,
      wrapPathIntoURL,
      getGameAssetsURL,
      getCacheSuffix
    };
  }
});

// packages/runtime/src/fixes/ccloader2-polyfill.ts
var ccloader2_polyfill_exports = {};
var Plugin, _simplify, cc, simplify;
var init_ccloader2_polyfill = __esm({
  "packages/runtime/src/fixes/ccloader2-polyfill.ts"() {
    "use strict";
    init_semver();
    Plugin = class Plugin2 {
      preload() {
      }
      postload() {
      }
      prestart() {
      }
      main() {
      }
    };
    _simplify = {
      version: "2.14.2",
      updateHandlers: [],
      registerUpdate(handler) {
        if (handler && typeof handler === "function") {
          this.updateHandlers.push(handler);
        }
      },
      // technically never called by us, but let's keep it in just to be sure.
      fireUpdate() {
        for (const handler of this.updateHandlers) {
          handler();
        }
      },
      getMod(name) {
        const mod = modloader.loadedMods.get(name);
        if (!mod) return;
        return {
          baseDirectory: mod.baseDirectory,
          name: mod.id,
          displayName: mod.manifest.title || mod.id
        };
      },
      // seriously? :harold:
      jumpHigh() {
        ig.game.playerEntity.doJump(185, 16, 100);
      }
    };
    cc = window;
    simplify = new Proxy(_simplify, {
      get(target, p) {
        const prop = target[p];
        p = String(p);
        if (!prop) {
          console.warn(new Error(`Couldn't find '${p}' in Simplify compat layer. Please report!`));
          return;
        }
        console.debug(new Error(`Simplify property '${p}' requested. This is deprecated.`));
        return prop;
      }
    });
    Object.assign(window, {
      cc,
      simplify,
      Plugin,
      semver: semver_default,
      versions: [
        ...Array.from(modloader.installedMods.values()).flatMap((mod) => {
          if (!mod.version) {
            console.debug(
              `${mod.id} was found to have no version defined during construction of window.versions`
            );
            return [];
          }
          return [[mod.id, mod.version.toString()]];
        }),
        ...Array.from(modloader.virtualPackages).map(([id, ver]) => [id, ver.toString()])
      ].reduce((acc, [id, ver]) => {
        acc[id] = ver;
        return acc;
      }, {}),
      activeMods: [...modloader.loadedMods.values()],
      inactiveMods: [...modloader.installedMods.values()].filter(
        (mod) => !modloader.modDataStorage.isModEnabled(mod.id)
      )
    });
    document.body.addEventListener("modsLoaded", () => {
      document.body.dispatchEvent(new Event("simplifyInitialized", { bubbles: true }));
    });
  }
});

// packages/runtime/src/fixes/pattern-fix.ts
function _getTmpContext(width, height) {
  if (!_canvas) {
    _canvas = document.createElement("canvas");
  }
  _canvas.width = width;
  _canvas.height = height;
  const context = _canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Something went wrong getting the context");
  context == null ? void 0 : context.clearRect(0, 0, width, height);
  return context;
}
var _canvas;
var init_pattern_fix = __esm({
  "packages/runtime/src/fixes/pattern-fix.ts"() {
    "use strict";
    ig.ImagePattern.inject({
      initBuffer() {
        const { scale } = ig.system;
        this.sourceX = this.sourceX ? this.sourceX * scale : 0;
        this.sourceY = this.sourceY ? this.sourceY * scale : 0;
        this.width = (this.width ? this.width : this.sourceImage.width) * scale;
        this.height = (this.height ? this.height : this.sourceImage.height) * scale;
        const opt = ig.ImagePattern.OPT;
        const widthFactor = Math.ceil(
          (this.optMode === opt.NONE || this.optMode === opt.REPEAT_Y ? 1 : 256) / this.width
        );
        const heightFactor = Math.ceil(
          (this.optMode === opt.NONE || this.optMode === opt.REPEAT_X ? 1 : 256) / this.height
        );
        const scaledWidth = widthFactor * this.width;
        const scaledHeight = heightFactor * this.height;
        const context = _getTmpContext(
          scaledWidth,
          this.optMode === opt.REPEAT_X_OR_Y ? this.height : scaledHeight
        );
        for (let y = 0; y < (this.optMode === opt.REPEAT_X_OR_Y ? 1 : heightFactor); ++y) {
          for (let x = 0; x < widthFactor; x++) {
            context.drawImage(
              this.sourceImage.data,
              this.sourceX,
              this.sourceY,
              this.width,
              this.height,
              x * this.width,
              y * this.height,
              this.width,
              this.height
            );
            ig.Image.drawCount++;
          }
        }
        this.image1 = document.createElement("img");
        this.image1.src = context.canvas.toDataURL();
        if (this.optMode === opt.REPEAT_X_OR_Y) {
          const context2 = _getTmpContext(this.width, scaledHeight);
          for (let y = 0; y < heightFactor; ++y) {
            context.drawImage(
              this.sourceImage.data,
              this.sourceX,
              this.sourceY,
              this.width,
              this.height,
              0,
              y * this.height,
              this.width,
              this.height
            );
            ig.Image.drawCount++;
          }
          this.image2 = document.createElement("img");
          this.image2.src = context2.canvas.toDataURL();
        }
        this.totalWidth = scaledWidth;
        this.totalHeight = scaledHeight;
      },
      clearCached() {
        if (this.image1) {
          this.image1 = null;
        }
        if (this.image2) {
          this.image2 = null;
        }
      }
    });
    ig.ImagePattern.OPT = {
      NONE: 0,
      REPEAT_X: 1,
      REPEAT_Y: 2,
      REPEAT_X_OR_Y: 3,
      REPEAT_X_AND_Y: 4
    };
  }
});

// packages/runtime/src/fixes/missing-option-fix.ts
var init_missing_option_fix = __esm({
  "packages/runtime/src/fixes/missing-option-fix.ts"() {
    "use strict";
    ig.module("ccloader-runtime.stdlib.missing-option-fix").requires("game.feature.model.options-model", "game.feature.menu.gui.options.options-types").defines(() => {
      sc.OptionModel.inject({
        onStorageGlobalLoad(globals) {
          this.parent(globals);
          for (const key in sc.OPTIONS_DEFINITION) {
            const option = sc.OPTIONS_DEFINITION[key];
            if (option.type !== "BUTTON_GROUP") continue;
            const currentValue = this.get(key);
            if (!Object.values(option.data).includes(currentValue)) {
              this.set(key, option.init);
            }
          }
          if (this.hasChanged) {
            this.persistOptions();
          }
        }
      });
    });
  }
});

// packages/runtime/src/_prestart.ts
var prestart_exports = {};
var init_prestart = __esm({
  "packages/runtime/src/_prestart.ts"() {
    "use strict";
    init_pattern_fix();
    init_missing_option_fix();
  }
});

// packages/runtime/src/font.ts
var init_font = __esm({
  "packages/runtime/src/font.ts"() {
    "use strict";
    ig.module("ccloader-runtime.stdlib.font").requires("impact.base.font", "game.feature.font.font-system").defines(() => {
      function setSimpleMapping(multiFont, iconSetIndex, simpleMapping) {
        let regularMapping = {};
        for (let [iconName, index] of Object.entries(simpleMapping)) {
          regularMapping[iconName] = [iconSetIndex, index];
        }
        multiFont.setMapping(regularMapping);
      }
      ig.MultiFont.inject({
        pushIconSet(font, mapping) {
          let iconSetIndex = this.iconSets.length;
          let result = this.parent(font);
          if (mapping != null) setSimpleMapping(this, iconSetIndex, mapping);
          return result;
        },
        setIconSet(font, index, mapping) {
          let result = this.parent(font, index);
          if (mapping != null) setSimpleMapping(this, index, mapping);
          return result;
        }
      });
    });
  }
});

// packages/runtime/src/fixes/font-race-condition-fix.ts
var init_font_race_condition_fix = __esm({
  "packages/runtime/src/fixes/font-race-condition-fix.ts"() {
    "use strict";
    ig.module("ccloader-runtime.stdlib.font-race-condition-fix").requires("impact.base.font", "game.feature.font.font-system").defines(() => {
      ig.Lang.inject({
        onload(...args) {
          const backup = this._doCallback;
          this._doCallback = () => {
          };
          this.parent(...args);
          this._doCallback = backup;
          this._doCallback();
        }
      });
    });
  }
});

// packages/runtime/src/options.ts
var init_options = __esm({
  "packages/runtime/src/options.ts"() {
    "use strict";
    ig.module("ccloader-runtime.stdlib.options.gui").requires("game.feature.menu.gui.options.options-types").defines(() => {
      sc.OptionInfoBox.inject({
        init(...args) {
          this.parent(...args);
          let [option] = args;
          if (option.marginBottom != null) {
            this.hook.size.y += option.marginBottom;
          }
        }
      });
      sc.OptionRow.inject({
        init(...args) {
          this.parent(...args);
          this.lineGui = this.hook.children[1].gui;
          this.slopeGui = this.hook.children[2].gui;
          if (this.option.type === "CHECKBOX" && this.option.checkboxRightAlign) {
            let checkbox = this.typeGui;
            checkbox.button.hook.align.x = ig.GUI_ALIGN.X_RIGHT;
            let additionalWidth = checkbox.hook.size.x - checkbox.button.hook.size.x;
            this.lineGui.hook.size.x += additionalWidth;
            this.slopeGui.hook.pos.x += additionalWidth;
          }
        }
      });
    });
  }
});

// packages/runtime/src/input.ts
var init_input = __esm({
  "packages/runtime/src/input.ts"() {
    "use strict";
    ig.module("ccloader-runtime.stdlib.input").requires("game.feature.model.options-model").defines(() => {
      delete sc.KEY_BLACK_LIST[ig.KEY.CTRL];
      sc.KeyBinder.inject({
        // the loop which populates `KEY_OPTION_MAP` was moved directly here
        initBindings() {
          for (let optionId in sc.OPTIONS_DEFINITION) {
            let optionDef = sc.OPTIONS_DEFINITION[optionId];
            if (optionDef.type !== "CONTROLS" || !optionId.startsWith("keys-")) {
              continue;
            }
            let action = optionId.slice(5);
            let { key1, key2 } = sc.options.values[optionId];
            if (key1 != null) {
              ig.input.bind(key1, action);
              sc.fontsystem.changeKeyCodeIcon(action, key1);
            }
            if (key2 != null) {
              ig.input.bind(key2, action);
            }
          }
          this.updateGamepadIcons();
        },
        changeBinding(optionId, key, isAlternative, unbind) {
          let optionValue = sc.options.values[optionId];
          sc.options.hasChanged = true;
          let oldKey = isAlternative ? optionValue.key2 : optionValue.key1;
          if (ig.input.bindings[oldKey] != null) ig.input.unbind(oldKey);
          if (isAlternative && unbind) {
            optionValue.key2 = void 0;
            return;
          }
          let action = optionId.slice(5);
          let conflictingAction = ig.input.bindings[key];
          ig.input.bind(key, action);
          sc.fontsystem.changeKeyCodeIcon(action, key);
          if (conflictingAction != null) {
            let conflictingOption = sc.options.values[`keys-${conflictingAction}`];
            if (conflictingOption.key1 === key) {
              conflictingOption.key1 = oldKey;
            } else if (conflictingOption.key2 === key) {
              conflictingOption.key2 = oldKey;
            } else {
              console.error("input-api: unable to find the conflicting key binding. report ASAP!");
            }
            ig.input.bind(oldKey, conflictingAction);
            sc.fontsystem.changeKeyCodeIcon(conflictingAction, oldKey);
            sc.options.dispatchKeySwappedEvent();
          }
          if (isAlternative) optionValue.key2 = key;
          else optionValue.key1 = key;
        }
      });
    });
  }
});

// packages/runtime/src/ui/utils.ts
function getLocalizedString(str) {
  var _a3;
  if (str == null || typeof str === "string") return str;
  return (_a3 = str[ig.currentLang]) != null ? _a3 : str.en_US;
}
function getModTitle(mod) {
  var _a3;
  return (_a3 = getLocalizedString(mod.manifest.title)) != null ? _a3 : mod.id;
}
function addEnumMember(enumObj, name) {
  let number = Object.keys(enumObj).length;
  enumObj[name] = number;
  return number;
}
var init_utils2 = __esm({
  "packages/runtime/src/ui/utils.ts"() {
    "use strict";
    init_utils();
  }
});

// packages/common/src/console.ts
function logLevelsToBitFlags(levels) {
  let flags = 0;
  for (let level of LOG_LEVEL_NAMES) {
    let enabled = levels[level];
    flags |= Number(enabled) << LogLevel[level];
  }
  return flags;
}
function setLogLevels(levels) {
  localStorage.setItem("logFlags", String(logLevelsToBitFlags(levels)));
}
var _a, nodejsUtil, LogLevel, LOG_LEVEL_NAMES, DEFAULT_LOG_LEVELS;
var init_console = __esm({
  "packages/common/src/console.ts"() {
    "use strict";
    init_utils();
    nodejsUtil = (_a = window.require) == null ? void 0 : _a.call(window, "util");
    LogLevel = /* @__PURE__ */ ((LogLevel2) => {
      LogLevel2[LogLevel2["LOG"] = 2] = "LOG";
      LogLevel2[LogLevel2["WARN"] = 1] = "WARN";
      LogLevel2[LogLevel2["ERROR"] = 0] = "ERROR";
      return LogLevel2;
    })(LogLevel || {});
    LOG_LEVEL_NAMES = ["LOG", "WARN", "ERROR"];
    DEFAULT_LOG_LEVELS = {
      LOG: false,
      WARN: true,
      ERROR: true
    };
  }
});

// packages/runtime/src/ui/options.ts
var LOG_LEVEL_OPTION_IDS, MOD_ENABLED_OPTION_ID_PREFIX, INSTALLED_MODS;
var init_options2 = __esm({
  "packages/runtime/src/ui/options.ts"() {
    "use strict";
    init_utils2();
    init_console();
    init_resources2();
    LOG_LEVEL_OPTION_IDS = {
      LOG: "logLevel-log",
      WARN: "logLevel-warn",
      ERROR: "logLevel-error"
    };
    MOD_ENABLED_OPTION_ID_PREFIX = "modEnabled-";
    INSTALLED_MODS = Array.from(modloader.installedMods.values()).filter((mod) => mod !== modloader._runtimeMod).sort((mod1, mod2) => compare(mod1.id, mod2.id));
    jsonPatches.add("data/lang/sc/gui.en_US.json", (data) => {
      let { options } = data.labels;
      for (let mod of INSTALLED_MODS) {
        options[`modEnabled-${mod.id}`] = {
          name: getModTitle(mod) || " ",
          description: getLocalizedString(mod.manifest.description) || " "
        };
      }
    });
    ig.module("ccloader-runtime.ui.options").requires(
      "impact.base.font",
      "game.feature.font.font-system",
      "game.feature.model.options-model",
      "game.feature.menu.gui.options.options-list",
      "game.feature.menu.gui.options.options-types"
    ).defines(() => {
      addEnumMember(sc.OPTION_CATEGORY, "MODS");
      for (let [index, level] of LOG_LEVEL_NAMES.entries()) {
        let def = {
          type: "CHECKBOX",
          cat: sc.OPTION_CATEGORY.GENERAL,
          init: DEFAULT_LOG_LEVELS[level],
          restart: true
        };
        if (index === 0) {
          def.hasDivider = true;
          def.header = "logLevel";
        }
        sc.OPTIONS_DEFINITION[LOG_LEVEL_OPTION_IDS[level]] = def;
      }
      sc.OPTIONS_DEFINITION["mods-description"] = {
        type: "INFO",
        cat: sc.OPTION_CATEGORY.MODS,
        data: "options.mods-description.description",
        marginBottom: 10
      };
      for (let mod of INSTALLED_MODS) {
        let definition = {
          type: "CHECKBOX",
          cat: sc.OPTION_CATEGORY.MODS,
          init: true,
          restart: true,
          checkboxRightAlign: true,
          mod
        };
        sc.OPTIONS_DEFINITION[`${MOD_ENABLED_OPTION_ID_PREFIX}${mod.id}`] = definition;
      }
      const MODS_TAB_ID = "mods";
      sc.fontsystem.font.pushIconSet(
        new ig.Font("mod://ccloader-runtime/media/icons.png", 16, ig.MultiFont.ICON_START),
        { [MODS_TAB_ID]: 0 }
      );
      sc.OptionsTabBox.prototype.tabs[MODS_TAB_ID] = null;
      sc.OptionsTabBox.inject({
        init(...args) {
          this.parent(...args);
          let btn = this._createTabButton(MODS_TAB_ID, this.tabArray.length, sc.OPTION_CATEGORY.MODS);
          this.tabs[MODS_TAB_ID] = btn;
          this._rearrangeTabs();
        }
      });
      const { modDataStorage } = modloader;
      sc.OptionModel.inject({
        onStorageGlobalLoad(globalsData, ...args) {
          let { options } = globalsData;
          if (options == null) {
            options = {};
            globalsData.options = options;
          }
          for (let key of Object.keys(options)) {
            if (key.startsWith(MOD_ENABLED_OPTION_ID_PREFIX)) {
              delete options[key];
            }
          }
          for (let { id } of INSTALLED_MODS) {
            options[`${MOD_ENABLED_OPTION_ID_PREFIX}${id}`] = modDataStorage.isModEnabled(id);
          }
          return this.parent(globalsData, ...args);
        },
        onStorageGlobalSave(globalsData, ...args) {
          let result = this.parent(globalsData, ...args);
          let { options } = globalsData;
          let logLevels = {};
          for (let level of LOG_LEVEL_NAMES) {
            logLevels[level] = options[LOG_LEVEL_OPTION_IDS[level]];
          }
          setLogLevels(logLevels);
          for (let { id } of INSTALLED_MODS) {
            let optionID = `${MOD_ENABLED_OPTION_ID_PREFIX}${id}`;
            modDataStorage.setModEnabled(id, Boolean(options[optionID]));
            delete options[optionID];
          }
          modDataStorage.write().catch((err) => {
            console.error("Failed to write mod data and settings:", err);
          });
          return result;
        }
      });
      const MOD_ICON_GUI_SIZE = 24;
      sc.OptionRow.inject({
        modIconGfx: null,
        modIconFallbackGfx: new ig.Image("media/gui/menu.png"),
        modIconPosX: 0,
        modIconPosY: 0,
        modVersionGui: null,
        init(...args) {
          var _a3;
          this.parent(...args);
          if (this.option.mod != null) {
            let { mod } = this.option;
            let currentScale = ig.system.scale * ig.system.contextScale;
            for (let iconScale = currentScale; iconScale > 0; iconScale--) {
              let iconSize = iconScale * MOD_ICON_GUI_SIZE;
              if (currentScale % iconScale !== 0) continue;
              let iconPath = (_a3 = mod.manifest.icons) == null ? void 0 : _a3[iconSize];
              if (iconPath == null) continue;
              this.modIconGfx = new ig.Image(`/${mod.resolvePath(iconPath)}`);
              break;
            }
            this.modIconPosX = this.nameGui.hook.pos.x;
            this.modIconPosY = this.lineGui.hook.pos.y + 2;
            this.nameGui.hook.pos.x += this.modIconPosX + MOD_ICON_GUI_SIZE;
            let modVersionStr = mod.version != null ? mod.version.toString() : "";
            if (/^[^v]/i.test(modVersionStr)) {
              modVersionStr = `v${modVersionStr}`;
            }
            this.modVersionGui = new sc.TextGui(modVersionStr, { font: sc.fontsystem.tinyFont });
            this.modVersionGui.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_BOTTOM);
            this.modVersionGui.setPos(
              this.lineGui.hook.size.x - this.modVersionGui.hook.size.x + 1,
              this.lineGui.hook.pos.y + 1
            );
            this.addChildGui(this.modVersionGui);
          }
        },
        updateDrawables(renderer) {
          var _a3;
          this.parent(renderer);
          if (this.option.mod != null) {
            let iconGfx;
            let srcX = 0;
            let srcY = 0;
            let sizeX = 0;
            let sizeY = 0;
            let scaleX = 1;
            let scaleY = 1;
            if ((_a3 = this.modIconGfx) == null ? void 0 : _a3.loaded) {
              iconGfx = this.modIconGfx;
              sizeX = iconGfx.width;
              sizeY = iconGfx.height;
              scaleX = MOD_ICON_GUI_SIZE / iconGfx.width;
              scaleY = MOD_ICON_GUI_SIZE / iconGfx.height;
            } else {
              iconGfx = this.modIconFallbackGfx;
              srcX = 536;
              srcY = 160;
              sizeX = 23;
              sizeY = 23;
            }
            let iconX = this.modIconPosX / scaleX;
            let iconY = (this.hook.size.y - MOD_ICON_GUI_SIZE - this.modIconPosY) / scaleY;
            renderer.addTransform().setScale(scaleX, scaleY);
            renderer.addGfx(iconGfx, iconX, iconY, srcX, srcY, sizeX, sizeY);
            renderer.undoTransform();
          }
        }
      });
    });
  }
});

// packages/runtime/src/ui/version-display.ts
var init_version_display = __esm({
  "packages/runtime/src/ui/version-display.ts"() {
    "use strict";
    ig.module("ccloader-runtime.ui.version-display").requires(
      "game.feature.gui.base.text",
      "game.feature.gui.screen.title-screen",
      "game.feature.gui.screen.pause-screen"
    ).defines(() => {
      function attachCCLoaderVersionText(versionGui) {
        const ccloaderVersionGui = new sc.TextGui(`CCLoader v${modloader.version}`, {
          font: sc.fontsystem.tinyFont
        });
        ccloaderVersionGui.setAlign(versionGui.hook.align.x, versionGui.hook.align.y);
        ccloaderVersionGui.setPos(0, versionGui.hook.size.y);
        versionGui.addChildGui(ccloaderVersionGui);
        return ccloaderVersionGui;
      }
      sc.TitleScreenGui.inject({
        ccloaderVersionGui: null,
        init(...args) {
          this.parent(...args);
          this.ccloaderVersionGui = attachCCLoaderVersionText(this.versionGui);
        }
      });
      sc.PauseScreenGui.inject({
        ccloaderVersionGui: null,
        init(...args) {
          this.parent(...args);
          this.ccloaderVersionGui = attachCCLoaderVersionText(this.versionGui);
        }
      });
    });
  }
});

// packages/core/src/files.desktop.ts
var files_desktop_exports = {};
__export(files_desktop_exports, {
  findRecursively: () => findRecursively,
  getInstalledExtensions: () => getInstalledExtensions,
  getModPathsIn: () => getModPathsIn,
  isReadable: () => isReadable,
  loadText: () => loadText3,
  readFile: () => readFile
});
async function readFile(path) {
  return fs.promises.readFile(path);
}
async function loadText3(path) {
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
  } catch (err) {
    if (errorHasCode(err) && err.code === "ENOENT") return;
    throw err;
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
  } catch (err) {
    if (errorHasCode(err) && err.code === "ENOENT") {
      await fs.promises.mkdir(dir);
      allContents = await fs.promises.readdir(dir);
    }
    throw err;
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
  var _a3;
  let igRoot = (_a3 = config.impactConfig.IG_ROOT) != null ? _a3 : "";
  let igDebug = Boolean(config.impactConfig.IG_GAME_DEBUG);
  let extensionsDir = `${igRoot}${igDebug ? "data" : "assets"}/extension`;
  let allContents;
  try {
    allContents = await fs.promises.readdir(extensionsDir);
  } catch (err) {
    if (errorHasCode(err) && err.code === "ENOENT") return [];
    throw err;
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
var _a2, fs;
var init_files_desktop = __esm({
  "packages/core/src/files.desktop.ts"() {
    "use strict";
    init_utils();
    fs = (_a2 = window.require) == null ? void 0 : _a2.call(window, "fs");
  }
});

// packages/core/src/files.browser.ts
var files_browser_exports = {};
__export(files_browser_exports, {
  getInstalledExtensions: () => getInstalledExtensions2,
  getModPathsIn: () => getModPathsIn2,
  isReadable: () => isReadable2,
  loadText: () => loadText4,
  readFile: () => readFile2
});
async function request(path) {
  try {
    let res = await fetch(cwdFilePathToURL(path).href);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res;
  } catch (err) {
    if (errorHasMessage(err)) {
      err.message = `Failed to load file '${path}': ${err.message}`;
    }
    throw err;
  }
}
async function readFile2(path) {
  return (await request(path)).arrayBuffer();
}
async function loadText4(path) {
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
  let indexJsonText = await loadText4(indexPath);
  let index;
  try {
    index = JSON.parse(indexJsonText);
  } catch (err) {
    if (errorHasMessage(err)) {
      err.message = `Syntax error in mods directory index in '${indexPath}': ${err.message}`;
    }
    throw err;
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
  var _a3;
  let igRoot = (_a3 = config.impactConfig.IG_ROOT) != null ? _a3 : "";
  let igDebug = Boolean(config.impactConfig.IG_GAME_DEBUG);
  let extensionsApiUrl = `${igRoot}page/api/get-extension-list.php?debug=${igDebug ? 1 : 0}`;
  try {
    let res = await fetch(extensionsApiUrl);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return JSON.parse(await res.text());
  } catch (err) {
    if (errorHasMessage(err)) {
      err.message = `Failed to send request to '${extensionsApiUrl}': ${err.message}`;
    }
    return [];
  }
}
var init_files_browser = __esm({
  "packages/core/src/files.browser.ts"() {
    "use strict";
    init_utils();
    init_paths();
  }
});

// packages/core/src/files.android.ts
var files_android_exports = {};
__export(files_android_exports, {
  getInstalledExtensions: () => getInstalledExtensions3,
  getModPathsIn: () => getModPathsIn3,
  isReadable: () => isReadable2,
  loadText: () => loadText4,
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
    } catch (err) {
      console.error("Failed to get the list of mods from CrossAndroid:", err);
    }
  }
  return getModPathsIn2(dir, config);
}
async function getInstalledExtensions3(config) {
  try {
    return JSON.parse(CrossAndroidExtensionListProvider.getExtensionListAsJson());
  } catch (err) {
    console.error("Failed to get the list of extensions from CrossAndroid:", err);
  }
  return getInstalledExtensions2(config);
}
var init_files_android = __esm({
  "packages/core/src/files.android.ts"() {
    "use strict";
    init_files_browser();
    init_files_browser();
  }
});

// packages/core/src/service-worker-bridge.ts
var init_service_worker_bridge = __esm({
  "packages/core/src/service-worker-bridge.ts"() {
    "use strict";
  }
});

// packages/core/src/files.ccmod.ts
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
async function loadText5(path) {
  const buf = await readFile4(path);
  if (!buf) return null;
  return new TextDecoder("utf-8").decode(buf);
}
async function readFile4(path) {
  const prefixObj = findPrefix(path);
  if (!prefixObj) return null;
  const [relativePath, prefix] = prefixObj;
  const unzipped = fileMap.get(prefix);
  const data = unzipped[relativePath];
  return data.buffer;
}
var fileMap;
var init_files_ccmod = __esm({
  "packages/core/src/files.ccmod.ts"() {
    "use strict";
    init_service_worker_bridge();
    init_files();
    fileMap = /* @__PURE__ */ new Map();
  }
});

// packages/core/src/files.ts
async function isReadable4(path) {
  return await isReadable3(path) || currentModule.isReadable(path);
}
async function loadText6(path) {
  return await loadText5(path) || currentModule.loadText(path);
}
var modules, currentModule, getModPathsIn4, getInstalledExtensions4;
var init_files = __esm({
  "packages/core/src/files.ts"() {
    "use strict";
    init_files_desktop();
    init_files_browser();
    init_files_android();
    init_files_ccmod();
    init_utils();
    modules = {
      ["DESKTOP" /* DESKTOP */]: files_desktop_exports,
      ["ANDROID" /* ANDROID */]: files_android_exports,
      ["BROWSER" /* BROWSER */]: files_browser_exports
    };
    currentModule = modules[PLATFORM_TYPE];
    ({ getModPathsIn: getModPathsIn4, getInstalledExtensions: getInstalledExtensions4 } = currentModule);
  }
});

// packages/runtime/src/fixes/extension-preloader.ts
async function preloadExtensions() {
  const extensionFolder = join(modloader.config.gameAssetsDir, "extension");
  const exts = await getInstalledExtensions4(modloader.config);
  for (const extensionName of exts) {
    const filepath = join(extensionFolder, extensionName);
    const isReadable5 = await isReadable4(`${filepath}/${extensionName}.json`);
    if (isReadable5) {
      const text = await loadText6(`${filepath}/${extensionName}.json`);
      const data = JSON.parse(text);
      if (!data.files) break;
      for (const extFile of data.files) {
        ig.fileForwarding[extFile] = `extension/${extensionName}/${extFile}`;
      }
    }
  }
}
var init_extension_preloader = __esm({
  "packages/runtime/src/fixes/extension-preloader.ts"() {
    "use strict";
    init_files();
    init_files();
    init_paths();
    void preloadExtensions();
  }
});

// packages/runtime/src/_postload.ts
var postload_exports = {};
var init_postload = __esm({
  "packages/runtime/src/_postload.ts"() {
    "use strict";
    init_font();
    init_font_race_condition_fix();
    init_options();
    init_input();
    init_options2();
    init_version_display();
    init_extension_preloader();
  }
});

// packages/runtime/src/_main.ts
init_paths();
init_utils();

// packages/common/src/require.ts
init_utils();
var requireFixed = null;
if (typeof window.require === "function") {
  let getRequireSearchPaths = function(caller) {
    let callerPath = resolveCallSiteFilePath(caller);
    if (callerPath == null) return [];
    let cwd = process.cwd();
    if (!callerPath.startsWith(cwd)) return [];
    let searchPaths = [];
    let currentDirectory;
    let currentPath = callerPath;
    do {
      currentDirectory = paths.dirname(currentPath);
      searchPaths.push(paths.join(currentDirectory, "node_modules/"));
      currentPath = currentDirectory;
    } while (currentDirectory !== cwd);
    searchPaths.pop();
    return searchPaths;
  }, resolveCallSiteFilePath = function(caller) {
    let fileNameStr = caller.getFileName();
    if (fileNameStr == null) return null;
    let url = null;
    try {
      url = new URL(fileNameStr);
    } catch (e) {
    }
    if (url != null) return paths.resolve(cwdFilePathFromURL(url));
    if (!paths.isAbsolute(fileNameStr)) return null;
    return paths.resolve(fileNameStr);
  }, getCaller = function() {
    let stack;
    let err = new Error();
    let originalPrepareStackTrace = Error.prepareStackTrace;
    try {
      Error.prepareStackTrace = function(_err, stack2) {
        return stack2;
      };
      stack = err.stack;
    } finally {
      Error.prepareStackTrace = originalPrepareStackTrace;
    }
    return stack[2];
  };
  getRequireSearchPaths2 = getRequireSearchPaths, resolveCallSiteFilePath2 = resolveCallSiteFilePath, getCaller2 = getCaller;
  const paths = window.require("path");
  requireFixed = (id) => {
    try {
      return __require(id);
    } catch (_err) {
      let caller = getCaller();
      let searchPaths = getRequireSearchPaths(caller);
      let pathToId = __require.resolve(id, { paths: searchPaths });
      return __require(pathToId);
    }
  };
  Object.assign(requireFixed, __require);
  requireFixed.prototype = { constructor: requireFixed };
}
var getRequireSearchPaths2;
var resolveCallSiteFilePath2;
var getCaller2;
var require_default = requireFixed;

// packages/runtime/src/_main.ts
init_semver();
init_patch_steps();
init_patch_list();

// packages/runtime/src/impact-init-hooks.ts
var callbacks = [];
function add(callback) {
  callbacks.push(callback);
}
var namespace2 = { callbacks, add };

// packages/runtime/src/impact-module-hooks.ts
init_patch_list();
var patchList = new PatchList();
function add2(moduleName, callback) {
  patchList.add(moduleName, callback);
}
add(() => {
  let originalDefines = ig.defines;
  ig.defines = function(body) {
    let { name } = ig._current;
    if (name == null) return originalDefines.call(this, body);
    return originalDefines.call(this, function(...args) {
      body.apply(this, args);
      for (let callback of patchList.forPath(name)) callback(name);
    });
  };
});
var namespace3 = { patchList, add: add2 };

// packages/runtime/src/_main.ts
init_resources2();

// packages/runtime/src/module-cache.ts
var oldLoadScript;
var prefixes = /* @__PURE__ */ new Map();
function registerModPrefix(prefix, path) {
  prefixes.set(prefix, path);
}
add(() => {
  oldLoadScript = ig._loadScript;
  function _loadScript(moduleName, requirer) {
    if (moduleName.includes(".")) {
      const root = moduleName.split(".")[0];
      let path = prefixes.get(root);
      if (path) {
        ig.lib = path;
      }
    }
    oldLoadScript(moduleName, requirer);
    ig.lib = "";
  }
  ig._loadScript = _loadScript;
});
var namespace6 = {
  prefixes,
  registerModPrefix
};

// packages/runtime/src/error-screen.ts
var originalErrorCallback = window.GAME_ERROR_CALLBACK;
if (originalErrorCallback != null) {
  const MODLOADER_NAME = modloader.name;
  const MODLOADER_VERSION = modloader.version.toString();
  const RUNTIME_MOD_ID = modloader._runtimeMod.id;
  const RUNTIME_MOD_VERSION = modloader._runtimeMod.version.toString();
  window.GAME_ERROR_CALLBACK = function(error, info, gameInfo, ...args) {
    info[`${MODLOADER_NAME} version`] = MODLOADER_VERSION;
    info[`${RUNTIME_MOD_ID} version`] = RUNTIME_MOD_VERSION;
    let result = originalErrorCallback.call(this, error, info, gameInfo, ...args);
    if (typeof nw !== "undefined" && typeof chrome !== "undefined") {
      for (let container of document.getElementsByClassName("errorMessage")) {
        for (let button of container.getElementsByTagName("a")) {
          if (button.href === "javascript:window.location.reload()") {
            button.href = "javascript:chrome.runtime.reload()";
          }
        }
      }
    }
    return result;
  };
}

// packages/runtime/src/resources-injections.ts
init_resources2();
init_utils();
add(() => {
  $.ajaxSetup({
    beforeSend(_jqXhr, settings) {
      if (settings.dataType !== "json" || settings.type !== "GET") {
        return true;
      }
      let { url } = settings;
      if (typeof url !== "string") {
        return true;
      }
      if (!url.startsWith(MOD_PROTOCOL_PREFIX)) {
        let gameAssetsURL = getGameAssetsURL().href;
        let parsedURL = new URL(url, document.baseURI).href;
        if (!parsedURL.startsWith(gameAssetsURL)) {
          return true;
        }
        if (parsedURL.startsWith(`${gameAssetsURL}page/api/get-extension-list.php`)) {
          return true;
        }
      }
      if (ig.root.length > 0 && url.startsWith(ig.root)) {
        url = url.slice(ig.root.length);
      }
      let cacheSuffix = getCacheSuffix();
      if (cacheSuffix.length > 0 && url.endsWith(cacheSuffix)) {
        url = url.slice(0, -cacheSuffix.length);
      }
      let { context, success, error, complete } = settings;
      delete settings.success;
      delete settings.error;
      delete settings.complete;
      loadJSON2(url, { callerThisValue: context }).then(
        (data) => {
          if (success != null) {
            success.call(context, data, "hijacked", null);
          }
        },
        (err) => {
          console.error(err);
          if (error != null) {
            error.call(context, null, "hijacked", err);
          }
        }
      ).finally(() => {
        if (complete != null) {
          complete.call(context, null, "hijacked");
        }
      });
      return false;
    }
  });
});
add2("impact.base.image", () => {
  ig.Image.inject({
    loadInternal(path) {
      path = path.trimEnd();
      path = applyImpactFileForwarding(path);
      loadImage2(path, { callerThisValue: this }).then(
        (img) => {
          this.data = img;
          this.onload();
        },
        (err) => {
          console.error(err);
          this.onerror();
        }
      );
    },
    // the default implementation appends a query with the current date in
    // milliseconds instead of using `ig.getCacheSuffix()` because reloading was
    // implemented for images before a more general reload system,
    // `ig.Loadable#reload` existed, so let's fix this by calling the default
    // implementation
    debugReload: true,
    reload() {
      if ("reload" in ig.Loadable.prototype) {
        ig.Loadable.prototype.reload.call(this);
      } else {
        this.load();
      }
    }
  });
});
add2("impact.base.sound", () => {
  function loadAudio(...args) {
    let path = args[0];
    let resolvedPath = path;
    let lastDotIndex = resolvedPath.lastIndexOf(".");
    if (lastDotIndex >= 0) {
      resolvedPath = resolvedPath.slice(0, lastDotIndex);
    }
    resolvedPath += `.${ig.soundManager.format.ext}`;
    resolvedPath = applyImpactFileForwarding(resolvedPath);
    let resolvedURL = resolvePathToURL(resolvedPath);
    let originalGetFilePath = ig.getFilePath;
    try {
      ig.getFilePath = (_path) => resolvedURL;
      return this.parent(...args);
    } finally {
      ig.getFilePath = originalGetFilePath;
    }
  }
  ig.SoundManager.inject({
    loadWebAudio: loadAudio,
    load: loadAudio
  });
});
function applyImpactFileForwarding(path) {
  let table = ig.fileForwarding;
  let tableKey = `${ig.root}${path}`;
  if (hasKey(table, tableKey)) {
    path = table[tableKey];
    path = path.slice(ig.root.length);
  }
  return path;
}

// packages/runtime/src/lang-file-patcher.ts
init_resources2();
add2("game.config", () => {
  const BUILTIN_LOCALES = Object.keys(ig.LANG_DETAILS);
  const DEFAULT_LOCALE = "en_US";
  function getLangFilePath(feature, locale) {
    return feature.toPath("data/lang/", `.${locale}.json`);
  }
  ig.Lang.inject({
    // There isn't really a future-proof way to know the values in `ig.langFileList`
    // during `postload`, plus mods could add something to this array during
    // `prestart`, so instead this module's patchers are inserted just before
    // the usage site of `ig.langFileList`, which is `ig.Lang#loadInternal`.
    // This unfortunately means that we can't make any guarantees about the
    // execution time of the registered patchers, though in practice they will
    // be executed very late sometime after `startCrossCode`.
    loadInternal(...args) {
      for (let locale of BUILTIN_LOCALES) {
        if (locale === DEFAULT_LOCALE) continue;
        for (let feature of ig.langFileList) {
          jsonPatches.add(getLangFilePath(feature, locale), {
            dependencies: () => loadJSON2(getLangFilePath(feature, DEFAULT_LOCALE)),
            patcher: (data, defaultLocaleData) => ig.merge(
              /* original */
              defaultLocaleData,
              /* new */
              data,
              /* noArrayMerge */
              true
            )
          });
        }
      }
      return this.parent(...args);
    }
  });
});

// packages/runtime/src/greenworks-fix.ts
init_resources2();
if (typeof window.require !== "undefined") {
  const pathsNative = window.require("path");
  const GAME_ASSETS_FS_PATH = pathsNative.join(
    process.cwd(),
    getGameAssetsURL().pathname
  );
  add2("impact.feature.greenworks.greenworks", () => {
    ig.Greenworks.inject({
      init(...args) {
        let originalRequire = __require;
        try {
          __require = function(path, ...args2) {
            path = originalRequire.resolve(path, { paths: [GAME_ASSETS_FS_PATH] });
            return originalRequire.call(this, path, ...args2);
          };
          return this.parent(...args);
        } finally {
          __require = originalRequire;
        }
      }
    });
  });
}

// packages/runtime/src/_main.ts
var RuntimeModMainClass = class {
  constructor(mod) {
    if (window.ccmod == null) window.ccmod = {};
    Object.assign(window.ccmod, {
      implementor: modloader.name,
      implementation: mod.id,
      paths: paths_exports,
      utils: stdlibNamespace,
      require: require_default,
      semver: semver_default,
      // @ts-expect-error genuinely no idea what's going on here.
      patchStepsLib: patch_steps_exports,
      patchList: namespace,
      impactInitHooks: namespace2,
      impactModuleHooks: namespace3,
      moduleCache: namespace6,
      resources: namespace5
    });
    Promise.resolve().then(() => init_ccloader2_polyfill());
  }
  onImpactInit() {
    for (let [_, mod] of modloader.loadedMods)
      if (mod.manifest.modPrefix)
        namespace6.registerModPrefix(mod.manifest.modPrefix, mod.baseDirectory.substring(7));
    for (let cb of namespace2.callbacks) cb();
  }
  async prestart() {
    await Promise.resolve().then(() => (init_prestart(), prestart_exports));
  }
  async postload() {
    await Promise.resolve().then(() => (init_postload(), postload_exports));
  }
};
export {
  RuntimeModMainClass as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicGFja2FnZXMvY29tbW9uL3NyYy9wYXRocy50cyIsICJwYWNrYWdlcy9jb21tb24vc3JjL3V0aWxzLnRzIiwgInBhY2thZ2VzL2NvbW1vbi9zcmMvdmVuZG9yLWxpYnMvc2VtdmVyLnRzIiwgInBhY2thZ2VzL2NvbW1vbi9zcmMvdmVuZG9yLWxpYnMvcGF0Y2gtc3RlcHMtbGliL3NyYy9wYXRjaHN0ZXBzLXV0aWxzLnRzIiwgInBhY2thZ2VzL2NvbW1vbi9zcmMvdmVuZG9yLWxpYnMvcGF0Y2gtc3RlcHMtbGliL3NyYy90eXBlcy50cyIsICJwYWNrYWdlcy9jb21tb24vc3JjL3ZlbmRvci1saWJzL3BhdGNoLXN0ZXBzLWxpYi9zcmMvcGF0Y2hzdGVwcy1zdGVwbWFjaGluZS50cyIsICJwYWNrYWdlcy9jb21tb24vc3JjL3ZlbmRvci1saWJzL3BhdGNoLXN0ZXBzLWxpYi9zcmMvcGF0Y2hzdGVwcy1wYXRjaC50cyIsICJwYWNrYWdlcy9jb21tb24vc3JjL3ZlbmRvci1saWJzL3BhdGNoLXN0ZXBzLWxpYi9zcmMvcGF0Y2hzdGVwcy1jYWxsYWJsZS50cyIsICJwYWNrYWdlcy9jb21tb24vc3JjL3ZlbmRvci1saWJzL3BhdGNoLXN0ZXBzLWxpYi9zcmMvcGF0Y2hzdGVwcy1kaWZmLnRzIiwgInBhY2thZ2VzL2NvbW1vbi9zcmMvdmVuZG9yLWxpYnMvcGF0Y2gtc3RlcHMtbGliL3NyYy9wYXRjaHN0ZXBzLnRzIiwgInBhY2thZ2VzL2NvbW1vbi9zcmMvdmVuZG9yLWxpYnMvcGF0Y2gtc3RlcHMudHMiLCAicGFja2FnZXMvcnVudGltZS9zcmMvcGF0Y2gtbGlzdC50cyIsICJwYWNrYWdlcy9jb21tb24vc3JjL3ZlbmRvci1saWJzL3N0cmlwLWpzb24tY29tbWVudHMudHMiLCAicGFja2FnZXMvY29tbW9uL3NyYy9yZXNvdXJjZXMudHMiLCAicGFja2FnZXMvcnVudGltZS9zcmMvcmVzb3VyY2VzLXBsYWluLnRzIiwgInBhY2thZ2VzL3J1bnRpbWUvc3JjL3Jlc291cmNlcy50cyIsICJwYWNrYWdlcy9ydW50aW1lL3NyYy9maXhlcy9jY2xvYWRlcjItcG9seWZpbGwudHMiLCAicGFja2FnZXMvcnVudGltZS9zcmMvZml4ZXMvcGF0dGVybi1maXgudHMiLCAicGFja2FnZXMvcnVudGltZS9zcmMvZml4ZXMvbWlzc2luZy1vcHRpb24tZml4LnRzIiwgInBhY2thZ2VzL3J1bnRpbWUvc3JjL19wcmVzdGFydC50cyIsICJwYWNrYWdlcy9ydW50aW1lL3NyYy9mb250LnRzIiwgInBhY2thZ2VzL3J1bnRpbWUvc3JjL2ZpeGVzL2ZvbnQtcmFjZS1jb25kaXRpb24tZml4LnRzIiwgInBhY2thZ2VzL3J1bnRpbWUvc3JjL29wdGlvbnMudHMiLCAicGFja2FnZXMvcnVudGltZS9zcmMvaW5wdXQudHMiLCAicGFja2FnZXMvcnVudGltZS9zcmMvdWkvdXRpbHMudHMiLCAicGFja2FnZXMvY29tbW9uL3NyYy9jb25zb2xlLnRzIiwgInBhY2thZ2VzL3J1bnRpbWUvc3JjL3VpL29wdGlvbnMudHMiLCAicGFja2FnZXMvcnVudGltZS9zcmMvdWkvdmVyc2lvbi1kaXNwbGF5LnRzIiwgInBhY2thZ2VzL2NvcmUvc3JjL2ZpbGVzLmRlc2t0b3AudHMiLCAicGFja2FnZXMvY29yZS9zcmMvZmlsZXMuYnJvd3Nlci50cyIsICJwYWNrYWdlcy9jb3JlL3NyYy9maWxlcy5hbmRyb2lkLnRzIiwgInBhY2thZ2VzL2NvcmUvc3JjL3NlcnZpY2Utd29ya2VyLWJyaWRnZS50cyIsICJwYWNrYWdlcy9jb3JlL3NyYy9maWxlcy5jY21vZC50cyIsICJwYWNrYWdlcy9jb3JlL3NyYy9maWxlcy50cyIsICJwYWNrYWdlcy9ydW50aW1lL3NyYy9maXhlcy9leHRlbnNpb24tcHJlbG9hZGVyLnRzIiwgInBhY2thZ2VzL3J1bnRpbWUvc3JjL19wb3N0bG9hZC50cyIsICJwYWNrYWdlcy9ydW50aW1lL3NyYy9fbWFpbi50cyIsICJwYWNrYWdlcy9jb21tb24vc3JjL3JlcXVpcmUudHMiLCAicGFja2FnZXMvcnVudGltZS9zcmMvaW1wYWN0LWluaXQtaG9va3MudHMiLCAicGFja2FnZXMvcnVudGltZS9zcmMvaW1wYWN0LW1vZHVsZS1ob29rcy50cyIsICJwYWNrYWdlcy9ydW50aW1lL3NyYy9tb2R1bGUtY2FjaGUudHMiLCAicGFja2FnZXMvcnVudGltZS9zcmMvZXJyb3Itc2NyZWVuLnRzIiwgInBhY2thZ2VzL3J1bnRpbWUvc3JjL3Jlc291cmNlcy1pbmplY3Rpb25zLnRzIiwgInBhY2thZ2VzL3J1bnRpbWUvc3JjL2xhbmctZmlsZS1wYXRjaGVyLnRzIiwgInBhY2thZ2VzL3J1bnRpbWUvc3JjL2dyZWVud29ya3MtZml4LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBQT1NJWC1vbmx5IGltcGxlbWVudGF0aW9uIG9mIHRoZSBgcGF0aGAgbW9kdWxlLCBwb3J0ZWQgZnJvbVxuLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvNjgwZmI4ZmM2MmY2YzE3MTYwYjM3MjdiYTc0MDBjZTI4ZjhkMjJkNS9saWIvcGF0aC5qc1xuLy8gd2l0aCBzbWFsbCBzdHlsaXN0aWMgYWRqdXN0ZW1lbnRzLlxuXG5jb25zdCBDSEFSX0RPVDogbnVtYmVyID0gJy4nLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBDSEFSX0ZPUldBUkRfU0xBU0g6IG51bWJlciA9ICcvJy5jaGFyQ29kZUF0KDApO1xuXG5mdW5jdGlvbiB2YWxpZGF0ZVN0cmluZyh2YWx1ZTogdW5rbm93biwgbmFtZTogc3RyaW5nKTogdm9pZCB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgZXhwZWN0ZWQgJHtuYW1lfSB0byBiZSBhIHN0cmluZ2ApO1xuICB9XG59XG5cbi8vIFJlc29sdmVzIC4gYW5kIC4uIGVsZW1lbnRzIGluIGEgcGF0aCB3aXRoIGRpcmVjdG9yeSBuYW1lc1xuZnVuY3Rpb24gbm9ybWFsaXplU3RyaW5nKHBhdGg6IHN0cmluZywgYWxsb3dBYm92ZVJvb3Q6IGJvb2xlYW4pOiBzdHJpbmcge1xuICBsZXQgcmVzID0gJyc7XG4gIGxldCBsYXN0U2VnbWVudExlbmd0aCA9IDA7XG4gIGxldCBsYXN0U2xhc2ggPSAtMTtcbiAgbGV0IGRvdHMgPSAwO1xuICBsZXQgY29kZSA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDw9IHBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoaSA8IHBhdGgubGVuZ3RoKSBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xuICAgIGVsc2UgaWYgKGNvZGUgPT09IENIQVJfRk9SV0FSRF9TTEFTSCkgYnJlYWs7XG4gICAgZWxzZSBjb2RlID0gQ0hBUl9GT1JXQVJEX1NMQVNIO1xuXG4gICAgaWYgKGNvZGUgPT09IENIQVJfRk9SV0FSRF9TTEFTSCkge1xuICAgICAgaWYgKGxhc3RTbGFzaCA9PT0gaSAtIDEgfHwgZG90cyA9PT0gMSkge1xuICAgICAgICAvLyBOT09QXG4gICAgICB9IGVsc2UgaWYgKGRvdHMgPT09IDIpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIHJlcy5sZW5ndGggPCAyIHx8XG4gICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggIT09IDIgfHxcbiAgICAgICAgICByZXMuY2hhckNvZGVBdChyZXMubGVuZ3RoIC0gMSkgIT09IENIQVJfRE9UIHx8XG4gICAgICAgICAgcmVzLmNoYXJDb2RlQXQocmVzLmxlbmd0aCAtIDIpICE9PSBDSEFSX0RPVFxuICAgICAgICApIHtcbiAgICAgICAgICBpZiAocmVzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIGxldCBsYXN0U2xhc2hJbmRleCA9IHJlcy5sYXN0SW5kZXhPZignLycpO1xuICAgICAgICAgICAgaWYgKGxhc3RTbGFzaEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICByZXMgPSAnJztcbiAgICAgICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzID0gcmVzLnNsaWNlKDAsIGxhc3RTbGFzaEluZGV4KTtcbiAgICAgICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSByZXMubGVuZ3RoIC0gMSAtIHJlcy5sYXN0SW5kZXhPZignLycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFzdFNsYXNoID0gaTtcbiAgICAgICAgICAgIGRvdHMgPSAwO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfSBlbHNlIGlmIChyZXMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICByZXMgPSAnJztcbiAgICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gMDtcbiAgICAgICAgICAgIGxhc3RTbGFzaCA9IGk7XG4gICAgICAgICAgICBkb3RzID0gMDtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoYWxsb3dBYm92ZVJvb3QpIHtcbiAgICAgICAgICByZXMgKz0gcmVzLmxlbmd0aCA+IDAgPyBgLy4uYCA6ICcuLic7XG4gICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSAyO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocmVzLmxlbmd0aCA+IDApIHJlcyArPSBgLyR7cGF0aC5zbGljZShsYXN0U2xhc2ggKyAxLCBpKX1gO1xuICAgICAgICBlbHNlIHJlcyA9IHBhdGguc2xpY2UobGFzdFNsYXNoICsgMSwgaSk7XG4gICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gaSAtIGxhc3RTbGFzaCAtIDE7XG4gICAgICB9XG4gICAgICBsYXN0U2xhc2ggPSBpO1xuICAgICAgZG90cyA9IDA7XG4gICAgfSBlbHNlIGlmIChjb2RlID09PSBDSEFSX0RPVCAmJiBkb3RzICE9PSAtMSkge1xuICAgICAgZG90cysrO1xuICAgIH0gZWxzZSB7XG4gICAgICBkb3RzID0gLTE7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlKC4uLmFyZ3M6IHN0cmluZ1tdKTogc3RyaW5nIHtcbiAgbGV0IHJlc29sdmVkUGF0aCA9ICcnO1xuICBsZXQgcmVzb2x2ZWRBYnNvbHV0ZSA9IGZhbHNlO1xuXG4gIGZvciAobGV0IGkgPSBhcmdzLmxlbmd0aCAtIDE7IGkgPj0gLTEgJiYgIXJlc29sdmVkQWJzb2x1dGU7IGktLSkge1xuICAgIGxldCBwYXRoID0gaSA+PSAwID8gYXJnc1tpXSA6IHByb2Nlc3MuY3dkKCk7XG5cbiAgICB2YWxpZGF0ZVN0cmluZyhwYXRoLCAncGF0aCcpO1xuXG4gICAgLy8gU2tpcCBlbXB0eSBlbnRyaWVzXG4gICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSBjb250aW51ZTtcblxuICAgIHJlc29sdmVkUGF0aCA9IGAke3BhdGh9LyR7cmVzb2x2ZWRQYXRofWA7XG4gICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IHBhdGguY2hhckNvZGVBdCgwKSA9PT0gQ0hBUl9GT1JXQVJEX1NMQVNIO1xuICB9XG5cbiAgLy8gQXQgdGhpcyBwb2ludCB0aGUgcGF0aCBzaG91bGQgYmUgcmVzb2x2ZWQgdG8gYSBmdWxsIGFic29sdXRlIHBhdGgsIGJ1dFxuICAvLyBoYW5kbGUgcmVsYXRpdmUgcGF0aHMgdG8gYmUgc2FmZSAobWlnaHQgaGFwcGVuIHdoZW4gcHJvY2Vzcy5jd2QoKSBmYWlscylcblxuICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgcmVzb2x2ZWRQYXRoID0gbm9ybWFsaXplU3RyaW5nKHJlc29sdmVkUGF0aCwgIXJlc29sdmVkQWJzb2x1dGUpO1xuXG4gIGlmIChyZXNvbHZlZEFic29sdXRlKSByZXR1cm4gYC8ke3Jlc29sdmVkUGF0aH1gO1xuXG4gIHJldHVybiByZXNvbHZlZFBhdGgubGVuZ3RoID4gMCA/IHJlc29sdmVkUGF0aCA6ICcuJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZShwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICB2YWxpZGF0ZVN0cmluZyhwYXRoLCAncGF0aCcpO1xuXG4gIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcuJztcblxuICBsZXQgaGFzUm9vdCA9IHBhdGguY2hhckNvZGVBdCgwKSA9PT0gQ0hBUl9GT1JXQVJEX1NMQVNIO1xuICBsZXQgdHJhaWxpbmdTZXBhcmF0b3IgPSBwYXRoLmNoYXJDb2RlQXQocGF0aC5sZW5ndGggLSAxKSA9PT0gQ0hBUl9GT1JXQVJEX1NMQVNIO1xuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICBwYXRoID0gbm9ybWFsaXplU3RyaW5nKHBhdGgsICFoYXNSb290KTtcblxuICBpZiAocGF0aC5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaGFzUm9vdCkgcmV0dXJuICcvJztcbiAgICByZXR1cm4gdHJhaWxpbmdTZXBhcmF0b3IgPyAnLi8nIDogJy4nO1xuICB9XG4gIGlmICh0cmFpbGluZ1NlcGFyYXRvcikgcGF0aCArPSAnLyc7XG5cbiAgcmV0dXJuIGhhc1Jvb3QgPyBgLyR7cGF0aH1gIDogcGF0aDtcbn1cblxuLy8gZXF1aXZhbGVudCB0byBzdHJpcFJvb3Qoam9pbignLycsIHBhdGgpKVxuZXhwb3J0IGZ1bmN0aW9uIGphaWxSZWxhdGl2ZShwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICB2YWxpZGF0ZVN0cmluZyhwYXRoLCAncGF0aCcpO1xuXG4gIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcuJztcblxuICBsZXQgdHJhaWxpbmdTZXBhcmF0b3IgPSBwYXRoLmNoYXJDb2RlQXQocGF0aC5sZW5ndGggLSAxKSA9PT0gQ0hBUl9GT1JXQVJEX1NMQVNIO1xuXG4gIHBhdGggPSBub3JtYWxpemVTdHJpbmcocGF0aCwgZmFsc2UpO1xuXG4gIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkgcGF0aCA9ICcuJztcbiAgaWYgKHRyYWlsaW5nU2VwYXJhdG9yKSBwYXRoICs9ICcvJztcbiAgcmV0dXJuIHBhdGg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Fic29sdXRlKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICB2YWxpZGF0ZVN0cmluZyhwYXRoLCAncGF0aCcpO1xuICByZXR1cm4gcGF0aC5sZW5ndGggPiAwICYmIHBhdGguY2hhckNvZGVBdCgwKSA9PT0gQ0hBUl9GT1JXQVJEX1NMQVNIO1xufVxuXG4vLyBlcXVpdmFsZW50IHRvIHJlbGF0aXZlKCcvJywgcGF0aClcbmV4cG9ydCBmdW5jdGlvbiBzdHJpcFJvb3QocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVTdHJpbmcocGF0aCwgJ3BhdGgnKTtcbiAgd2hpbGUgKHBhdGgubGVuZ3RoID4gMCAmJiBwYXRoLmNoYXJDb2RlQXQoMCkgPT09IENIQVJfRk9SV0FSRF9TTEFTSCkge1xuICAgIHBhdGggPSBwYXRoLnNsaWNlKDEpO1xuICB9XG4gIHJldHVybiBwYXRoO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gam9pbiguLi5hcmdzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkgcmV0dXJuICcuJztcbiAgbGV0IGpvaW5lZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBhcmcgPSBhcmdzW2ldO1xuICAgIHZhbGlkYXRlU3RyaW5nKGFyZywgJ3BhdGgnKTtcbiAgICBpZiAoYXJnLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmIChqb2luZWQgPT0gbnVsbCkgam9pbmVkID0gYXJnO1xuICAgICAgZWxzZSBqb2luZWQgKz0gYC8ke2FyZ31gO1xuICAgIH1cbiAgfVxuICBpZiAoam9pbmVkID09IG51bGwpIHJldHVybiAnLic7XG4gIHJldHVybiBub3JtYWxpemUoam9pbmVkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbGF0aXZlKGZyb206IHN0cmluZywgdG86IHN0cmluZyk6IHN0cmluZyB7XG4gIHZhbGlkYXRlU3RyaW5nKGZyb20sICdmcm9tJyk7XG4gIHZhbGlkYXRlU3RyaW5nKHRvLCAndG8nKTtcblxuICBpZiAoZnJvbSA9PT0gdG8pIHJldHVybiAnJztcblxuICAvLyBUcmltIGxlYWRpbmcgZm9yd2FyZCBzbGFzaGVzLlxuICBmcm9tID0gcmVzb2x2ZShmcm9tKTtcbiAgdG8gPSByZXNvbHZlKHRvKTtcblxuICBpZiAoZnJvbSA9PT0gdG8pIHJldHVybiAnJztcblxuICBsZXQgZnJvbVN0YXJ0ID0gMTtcbiAgbGV0IGZyb21FbmQgPSBmcm9tLmxlbmd0aDtcbiAgbGV0IGZyb21MZW4gPSBmcm9tRW5kIC0gZnJvbVN0YXJ0O1xuICBsZXQgdG9TdGFydCA9IDE7XG4gIGxldCB0b0xlbiA9IHRvLmxlbmd0aCAtIHRvU3RhcnQ7XG5cbiAgLy8gQ29tcGFyZSBwYXRocyB0byBmaW5kIHRoZSBsb25nZXN0IGNvbW1vbiBwYXRoIGZyb20gcm9vdFxuICBsZXQgbGVuZ3RoID0gZnJvbUxlbiA8IHRvTGVuID8gZnJvbUxlbiA6IHRvTGVuO1xuICBsZXQgbGFzdENvbW1vblNlcCA9IC0xO1xuICBsZXQgaSA9IDA7XG4gIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgZnJvbUNvZGUgPSBmcm9tLmNoYXJDb2RlQXQoZnJvbVN0YXJ0ICsgaSk7XG4gICAgaWYgKGZyb21Db2RlICE9PSB0by5jaGFyQ29kZUF0KHRvU3RhcnQgKyBpKSkgYnJlYWs7XG4gICAgZWxzZSBpZiAoZnJvbUNvZGUgPT09IENIQVJfRk9SV0FSRF9TTEFTSCkgbGFzdENvbW1vblNlcCA9IGk7XG4gIH1cbiAgaWYgKGkgPT09IGxlbmd0aCkge1xuICAgIGlmICh0b0xlbiA+IGxlbmd0aCkge1xuICAgICAgaWYgKHRvLmNoYXJDb2RlQXQodG9TdGFydCArIGkpID09PSBDSEFSX0ZPUldBUkRfU0xBU0gpIHtcbiAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYGZyb21gIGlzIHRoZSBleGFjdCBiYXNlIHBhdGggZm9yIGB0b2AuXG4gICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvZm9vL2Jhcic7IHRvPScvZm9vL2Jhci9iYXonXG4gICAgICAgIHJldHVybiB0by5zbGljZSh0b1N0YXJ0ICsgaSArIDEpO1xuICAgICAgfVxuICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYGZyb21gIGlzIHRoZSByb290XG4gICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvJzsgdG89Jy9mb28nXG4gICAgICAgIHJldHVybiB0by5zbGljZSh0b1N0YXJ0ICsgaSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChmcm9tTGVuID4gbGVuZ3RoKSB7XG4gICAgICBpZiAoZnJvbS5jaGFyQ29kZUF0KGZyb21TdGFydCArIGkpID09PSBDSEFSX0ZPUldBUkRfU0xBU0gpIHtcbiAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYHRvYCBpcyB0aGUgZXhhY3QgYmFzZSBwYXRoIGZvciBgZnJvbWAuXG4gICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvZm9vL2Jhci9iYXonOyB0bz0nL2Zvby9iYXInXG4gICAgICAgIGxhc3RDb21tb25TZXAgPSBpO1xuICAgICAgfSBlbHNlIGlmIChpID09PSAwKSB7XG4gICAgICAgIC8vIFdlIGdldCBoZXJlIGlmIGB0b2AgaXMgdGhlIHJvb3QuXG4gICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvZm9vL2Jhcic7IHRvPScvJ1xuICAgICAgICBsYXN0Q29tbW9uU2VwID0gMDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBsZXQgb3V0ID0gJyc7XG4gIC8vIEdlbmVyYXRlIHRoZSByZWxhdGl2ZSBwYXRoIGJhc2VkIG9uIHRoZSBwYXRoIGRpZmZlcmVuY2UgYmV0d2VlbiBgdG9gXG4gIC8vIGFuZCBgZnJvbWAuXG4gIGZvciAoaSA9IGZyb21TdGFydCArIGxhc3RDb21tb25TZXAgKyAxOyBpIDw9IGZyb21FbmQ7IGkrKykge1xuICAgIGlmIChpID09PSBmcm9tRW5kIHx8IGZyb20uY2hhckNvZGVBdChpKSA9PT0gQ0hBUl9GT1JXQVJEX1NMQVNIKSB7XG4gICAgICBvdXQgKz0gb3V0Lmxlbmd0aCA9PT0gMCA/ICcuLicgOiAnLy4uJztcbiAgICB9XG4gIH1cblxuICAvLyBMYXN0bHksIGFwcGVuZCB0aGUgcmVzdCBvZiB0aGUgZGVzdGluYXRpb24gKGB0b2ApIHBhdGggdGhhdCBjb21lcyBhZnRlclxuICAvLyB0aGUgY29tbW9uIHBhdGggcGFydHMuXG4gIHJldHVybiBgJHtvdXR9JHt0by5zbGljZSh0b1N0YXJ0ICsgbGFzdENvbW1vblNlcCl9YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpcm5hbWUocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVTdHJpbmcocGF0aCwgJ3BhdGgnKTtcbiAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSByZXR1cm4gJy4nO1xuICBsZXQgaGFzUm9vdCA9IHBhdGguY2hhckNvZGVBdCgwKSA9PT0gQ0hBUl9GT1JXQVJEX1NMQVNIO1xuICBsZXQgZW5kID0gLTE7XG4gIGxldCBtYXRjaGVkU2xhc2ggPSB0cnVlO1xuICBmb3IgKGxldCBpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDE7IC0taSkge1xuICAgIGlmIChwYXRoLmNoYXJDb2RlQXQoaSkgPT09IENIQVJfRk9SV0FSRF9TTEFTSCkge1xuICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcbiAgICAgICAgZW5kID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yXG4gICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBpZiAoZW5kID09PSAtMSkgcmV0dXJuIGhhc1Jvb3QgPyAnLycgOiAnLic7XG4gIGlmIChoYXNSb290ICYmIGVuZCA9PT0gMSkgcmV0dXJuICcvLyc7XG4gIHJldHVybiBwYXRoLnNsaWNlKDAsIGVuZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNlbmFtZShwYXRoOiBzdHJpbmcsIGV4dD86IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmIChleHQgIT0gbnVsbCkgdmFsaWRhdGVTdHJpbmcoZXh0LCAnZXh0Jyk7XG4gIHZhbGlkYXRlU3RyaW5nKHBhdGgsICdwYXRoJyk7XG5cbiAgbGV0IHN0YXJ0ID0gMDtcbiAgbGV0IGVuZCA9IC0xO1xuICBsZXQgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcblxuICBpZiAoZXh0ICE9IG51bGwgJiYgZXh0Lmxlbmd0aCA+IDAgJiYgZXh0Lmxlbmd0aCA8PSBwYXRoLmxlbmd0aCkge1xuICAgIGlmIChleHQgPT09IHBhdGgpIHJldHVybiAnJztcbiAgICBsZXQgZXh0SWR4ID0gZXh0Lmxlbmd0aCAtIDE7XG4gICAgbGV0IGZpcnN0Tm9uU2xhc2hFbmQgPSAtMTtcbiAgICBmb3IgKGxldCBpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgbGV0IGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XG4gICAgICBpZiAoY29kZSA9PT0gQ0hBUl9GT1JXQVJEX1NMQVNIKSB7XG4gICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBwYXRoIHNlcGFyYXRvciB0aGF0IHdhcyBub3QgcGFydCBvZiBhIHNldCBvZiBwYXRoXG4gICAgICAgIC8vIHNlcGFyYXRvcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nLCBzdG9wIG5vd1xuICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xuICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChmaXJzdE5vblNsYXNoRW5kID09PSAtMSkge1xuICAgICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yLCByZW1lbWJlciB0aGlzIGluZGV4IGluIGNhc2VcbiAgICAgICAgICAvLyB3ZSBuZWVkIGl0IGlmIHRoZSBleHRlbnNpb24gZW5kcyB1cCBub3QgbWF0Y2hpbmdcbiAgICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcbiAgICAgICAgICBmaXJzdE5vblNsYXNoRW5kID0gaSArIDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV4dElkeCA+PSAwKSB7XG4gICAgICAgICAgLy8gVHJ5IHRvIG1hdGNoIHRoZSBleHBsaWNpdCBleHRlbnNpb25cbiAgICAgICAgICBpZiAoY29kZSA9PT0gZXh0LmNoYXJDb2RlQXQoZXh0SWR4KSkge1xuICAgICAgICAgICAgaWYgKC0tZXh0SWR4ID09PSAtMSkge1xuICAgICAgICAgICAgICAvLyBXZSBtYXRjaGVkIHRoZSBleHRlbnNpb24sIHNvIG1hcmsgdGhpcyBhcyB0aGUgZW5kIG9mIG91ciBwYXRoXG4gICAgICAgICAgICAgIC8vIGNvbXBvbmVudFxuICAgICAgICAgICAgICBlbmQgPSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBFeHRlbnNpb24gZG9lcyBub3QgbWF0Y2gsIHNvIG91ciByZXN1bHQgaXMgdGhlIGVudGlyZSBwYXRoXG4gICAgICAgICAgICAvLyBjb21wb25lbnRcbiAgICAgICAgICAgIGV4dElkeCA9IC0xO1xuICAgICAgICAgICAgZW5kID0gZmlyc3ROb25TbGFzaEVuZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3RhcnQgPT09IGVuZCkgZW5kID0gZmlyc3ROb25TbGFzaEVuZDtcbiAgICBlbHNlIGlmIChlbmQgPT09IC0xKSBlbmQgPSBwYXRoLmxlbmd0aDtcbiAgICByZXR1cm4gcGF0aC5zbGljZShzdGFydCwgZW5kKTtcbiAgfVxuICBmb3IgKGxldCBpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgIGlmIChwYXRoLmNoYXJDb2RlQXQoaSkgPT09IENIQVJfRk9SV0FSRF9TTEFTSCkge1xuICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHBhdGggc2VwYXJhdG9yIHRoYXQgd2FzIG5vdCBwYXJ0IG9mIGEgc2V0IG9mIHBhdGhcbiAgICAgIC8vIHNlcGFyYXRvcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nLCBzdG9wIG5vd1xuICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcbiAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChlbmQgPT09IC0xKSB7XG4gICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyXG4gICAgICAvLyBwYXRoIGNvbXBvbmVudFxuICAgICAgbWF0Y2hlZFNsYXNoID0gZmFsc2U7XG4gICAgICBlbmQgPSBpICsgMTtcbiAgICB9XG4gIH1cblxuICBpZiAoZW5kID09PSAtMSkgcmV0dXJuICcnO1xuICByZXR1cm4gcGF0aC5zbGljZShzdGFydCwgZW5kKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dG5hbWUocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgdmFsaWRhdGVTdHJpbmcocGF0aCwgJ3BhdGgnKTtcbiAgbGV0IHN0YXJ0RG90ID0gLTE7XG4gIGxldCBzdGFydFBhcnQgPSAwO1xuICBsZXQgZW5kID0gLTE7XG4gIGxldCBtYXRjaGVkU2xhc2ggPSB0cnVlO1xuICAvLyBUcmFjayB0aGUgc3RhdGUgb2YgY2hhcmFjdGVycyAoaWYgYW55KSB3ZSBzZWUgYmVmb3JlIG91ciBmaXJzdCBkb3QgYW5kXG4gIC8vIGFmdGVyIGFueSBwYXRoIHNlcGFyYXRvciB3ZSBmaW5kXG4gIGxldCBwcmVEb3RTdGF0ZSA9IDA7XG4gIGZvciAobGV0IGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgbGV0IGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XG4gICAgaWYgKGNvZGUgPT09IENIQVJfRk9SV0FSRF9TTEFTSCkge1xuICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHBhdGggc2VwYXJhdG9yIHRoYXQgd2FzIG5vdCBwYXJ0IG9mIGEgc2V0IG9mIHBhdGhcbiAgICAgIC8vIHNlcGFyYXRvcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nLCBzdG9wIG5vd1xuICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcbiAgICAgICAgc3RhcnRQYXJ0ID0gaSArIDE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChlbmQgPT09IC0xKSB7XG4gICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyXG4gICAgICAvLyBleHRlbnNpb25cbiAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xuICAgICAgZW5kID0gaSArIDE7XG4gICAgfVxuICAgIGlmIChjb2RlID09PSBDSEFSX0RPVCkge1xuICAgICAgLy8gSWYgdGhpcyBpcyBvdXIgZmlyc3QgZG90LCBtYXJrIGl0IGFzIHRoZSBzdGFydCBvZiBvdXIgZXh0ZW5zaW9uXG4gICAgICBpZiAoc3RhcnREb3QgPT09IC0xKSBzdGFydERvdCA9IGk7XG4gICAgICBlbHNlIGlmIChwcmVEb3RTdGF0ZSAhPT0gMSkgcHJlRG90U3RhdGUgPSAxO1xuICAgIH0gZWxzZSBpZiAoc3RhcnREb3QgIT09IC0xKSB7XG4gICAgICAvLyBXZSBzYXcgYSBub24tZG90IGFuZCBub24tcGF0aCBzZXBhcmF0b3IgYmVmb3JlIG91ciBkb3QsIHNvIHdlIHNob3VsZFxuICAgICAgLy8gaGF2ZSBhIGdvb2QgY2hhbmNlIGF0IGhhdmluZyBhIG5vbi1lbXB0eSBleHRlbnNpb25cbiAgICAgIHByZURvdFN0YXRlID0gLTE7XG4gICAgfVxuICB9XG5cbiAgaWYgKFxuICAgIHN0YXJ0RG90ID09PSAtMSB8fFxuICAgIGVuZCA9PT0gLTEgfHxcbiAgICAvLyBXZSBzYXcgYSBub24tZG90IGNoYXJhY3RlciBpbW1lZGlhdGVseSBiZWZvcmUgdGhlIGRvdFxuICAgIHByZURvdFN0YXRlID09PSAwIHx8XG4gICAgLy8gVGhlIChyaWdodC1tb3N0KSB0cmltbWVkIHBhdGggY29tcG9uZW50IGlzIGV4YWN0bHkgJy4uJ1xuICAgIChwcmVEb3RTdGF0ZSA9PT0gMSAmJiBzdGFydERvdCA9PT0gZW5kIC0gMSAmJiBzdGFydERvdCA9PT0gc3RhcnRQYXJ0ICsgMSlcbiAgKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIHJldHVybiBwYXRoLnNsaWNlKHN0YXJ0RG90LCBlbmQpO1xufVxuIiwgImltcG9ydCB0eXBlIHtcbiAgTWF5YmVQcm9taXNlLFxuICBQcm9taXNlUmVzdWx0LFxufSBmcm9tICd1bHRpbWF0ZS1jcm9zc2NvZGUtdHlwZWRlZnMvbW9kbG9hZGVyLXN0ZGxpYi91dGlscyc7XG5pbXBvcnQgKiBhcyBwYXRocyBmcm9tICcuL3BhdGhzJztcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXZhciwgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuZGVjbGFyZSB2YXIgY2hyb21lOiBhbnk7XG5cbmV4cG9ydCB7IE1heWJlUHJvbWlzZSB9O1xuXG5leHBvcnQgZW51bSBQbGF0Zm9ybVR5cGUge1xuICBERVNLVE9QID0gJ0RFU0tUT1AnLFxuICBBTkRST0lEID0gJ0FORFJPSUQnLFxuICBCUk9XU0VSID0gJ0JST1dTRVInLFxufVxuXG5leHBvcnQgY29uc3QgUExBVEZPUk1fVFlQRTogUGxhdGZvcm1UeXBlID0gKCgpID0+IHtcbiAgaWYgKHR5cGVvZiBudyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gUGxhdGZvcm1UeXBlLkRFU0tUT1A7XG4gIH1cbiAgbGV0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG4gIGlmIChwYXJhbXMuaGFzKCdjcm9zc2FuZHJvaWQnKSkge1xuICAgIHJldHVybiBQbGF0Zm9ybVR5cGUuQU5EUk9JRDtcbiAgfVxuICByZXR1cm4gUGxhdGZvcm1UeXBlLkJST1dTRVI7XG59KSgpO1xuXG5leHBvcnQgZnVuY3Rpb24gc2hvd0RldlRvb2xzKHdpbmRvdzogbncuV2luZG93ID0gbncuV2luZG93LmdldCgpKTogUHJvbWlzZTx2b2lkPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZpbmVkXG4gICAgd2luZG93LnNob3dEZXZUb29scyh1bmRlZmluZWQsICgpID0+IHJlc29sdmUoKSksXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93QmFja2dyb3VuZFBhZ2VEZXZUb29scygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PlxuICAgIGNocm9tZS5kZXZlbG9wZXJQcml2YXRlLm9wZW5EZXZUb29scyhcbiAgICAgIHtcbiAgICAgICAgcmVuZGVyVmlld0lkOiAtMSxcbiAgICAgICAgcmVuZGVyUHJvY2Vzc0lkOiAtMSxcbiAgICAgICAgZXh0ZW5zaW9uSWQ6IGNocm9tZS5ydW50aW1lLmlkLFxuICAgICAgfSxcbiAgICAgICgpID0+IHJlc29sdmUoKSxcbiAgICApLFxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd2FpdChtczogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcGFyZTxUPihhOiBULCBiOiBUKTogbnVtYmVyIHtcbiAgcmV0dXJuIGEgPiBiID8gMSA6IGEgPCBiID8gLTEgOiAwO1xufVxuXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55ICovXG5cbi8vIFRPRE86IG1lbnRpb24gc29tZXdoZXJlIGluIGRvY3MgdGhhdCBtb2RpZmljYXRpb24gb2YgYFR5cGVFcnJvcmAncyBgbWVzc2FnZWBcbi8vIGRvZXNuJ3Qgd29yay5cbmV4cG9ydCBmdW5jdGlvbiBlcnJvckhhc01lc3NhZ2UoZXJyb3I6IGFueSk6IGVycm9yIGlzIHsgbWVzc2FnZTogc3RyaW5nIH0ge1xuICByZXR1cm4gdHlwZW9mIGVycm9yLm1lc3NhZ2UgPT09ICdzdHJpbmcnO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JIYXNDb2RlKGVycm9yOiBhbnkpOiBlcnJvciBpcyB7IGNvZGU6IHN0cmluZyB9IHtcbiAgcmV0dXJuIHR5cGVvZiBlcnJvci5jb2RlID09PSAnc3RyaW5nJztcbn1cblxuLyogZXNsaW50LWVuYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55ICovXG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwUHJvbWlzZVJlc3VsdDxUPihwcm9taXNlOiBQcm9taXNlPFQ+KTogUHJvbWlzZTxQcm9taXNlUmVzdWx0PFQ+PiB7XG4gIHJldHVybiBwcm9taXNlLnRoZW4oXG4gICAgKHZhbHVlKSA9PiAoeyB0eXBlOiAncmVzb2x2ZWQnLCB2YWx1ZSB9KSxcbiAgICAocmVhc29uKSA9PiAoeyB0eXBlOiAncmVqZWN0ZWQnLCByZWFzb24gfSksXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNLZXkob2JqOiB1bmtub3duLCBrZXk6IFByb3BlcnR5S2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFwR2V0T3JJbnNlcnQ8SywgVj4obWFwOiBNYXA8SywgVj4sIGtleTogSywgZGVmYXVsdFZhbHVlOiBWKTogViB7XG4gIGlmIChtYXAuaGFzKGtleSkpIHtcbiAgICByZXR1cm4gbWFwLmdldChrZXkpITtcbiAgfSBlbHNlIHtcbiAgICBtYXAuc2V0KGtleSwgZGVmYXVsdFZhbHVlKTtcbiAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjd2RGaWxlUGF0aFRvVVJMKHBhdGg6IHN0cmluZywgYmFzZTogc3RyaW5nID0gZG9jdW1lbnQuYmFzZVVSSSk6IFVSTCB7XG4gIGxldCB1cmwgPSBuZXcgVVJMKGJhc2UpO1xuICAvLyBJbXBsaWNpdGx5IHBlcmNlbnQtZW5jb2RlcyBhbmQgZG9lc24ndCB0cmltIHBhdGggb24gdGhlIGVuZHMuXG4gIHVybC5wYXRobmFtZSA9IHBhdGg7XG4gIHVybC5zZWFyY2ggPSAnJztcbiAgdXJsLmhhc2ggPSAnJztcbiAgcmV0dXJuIHVybDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGN3ZEZpbGVQYXRoRnJvbVVSTCh1cmw6IFVSTCk6IHN0cmluZyB7XG4gIC8vIFdoeSB1c2UgZGVjb2RlVVJJQ29tcG9uZW50IGhlcmUgaW5zdGVhZCBvZiBkZWNvZGVVUkksIHlvdSBtaWdodCBhc2s/IFlvdVxuICAvLyBzZWUsIHRoZSBjcnVjaWFsIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgdHdvIGlzIHRoYXQgZGVjb2RlVVJJQ29tcG9uZW50XG4gIC8vIGRlY29kZXMgZXZlcnkgcGVyY2VudC1lbmNvZGVkIGNoYXJhY3RlciB3aXRob3V0IGV4Y2VwdGlvbnMsIHdoaWxlXG4gIC8vIGRlY29kZVVSSSwgYXMgdGhlIEVTMjYyIHNwZWNpZmljYXRpb24gc2F5cywgZG9lcyBub3QgZGVjb2RlIFwiZXNjYXBlXG4gIC8vIHNlcXVlbmNlcyB0aGF0IGNvdWxkIG5vdCBoYXZlIGJlZW4gaW50cm9kdWNlZCBieSBlbmNvZGVVUklcIiwgd2hpY2gsIGluXG4gIC8vIHByYWN0aWNlLCBtZWFucyB0aGF0IGl0IGRvZXNuJ3QgZGVjb2RlIHBlcmNlbnQtZW5jb2RpbmdzIG9mIHRoZXNlXG4gIC8vIGNoYXJhY3RlcnM6IDsvPzpAJj0rJCwjIC4gTm93LCBob3cgaXMgdGhpcyBiZWhhdmlvciB1c2VmdWwgaW4gcHJhY3RpY2U/XG4gIC8vIFBlcmhhcHMgdGhlIGludGVuZGVkIHVzZWNhc2UgaXMgdG8gbWFrZSBVUkxzIGxvb2sgbmljZXIgYnkgZGVjb2Rpbmcgc3R1ZmZcbiAgLy8gbGlrZSBVbmljb2RlIGNoYXJhY3RlcnMsIHlldCBwcmVzZXJ2aW5nIHRoZSB2YWxpZGl0eSBhbmQgbWVhbmluZyBvZiB0aGVcbiAgLy8gb3JpZ2luYWwgVVJMLiBCdXQgaXQgbWF5IGxlYWQgdG8gb2JzY3VyZSBidWdzIGluIGhhbmRsaW5nIGZpbGUgcGF0aHNcbiAgLy8gYmVjYXVzZSwgYWxiZWl0IHNlbGRvbSB1c2VkLCBhbGwgb2YgdGhlIG1lbnRpb25lZCBjaGFyYWN0ZXJzLCB3aXRoIHRoZVxuICAvLyBleGNlcHRpb24gb2Ygc2xhc2gsIGFyZSB2YWxpZCBpbiBmaWxlbmFtZXMgb24gVU5JWCwgYW5kLCBleGNlcHQgY29sb24gYW5kXG4gIC8vIHF1ZXN0aW9uIG1hcmssIHRoZSByZXN0IGlzIGFsc28gdmFsaWQgb24gV2luZG93cywgYW5kIHNvIHRob3NlIGNoYXJhY3RlcnNcbiAgLy8gd2lsbCBiZSBrZXB0IHVuZGVjb2RlZC4gSGVyZSBhcmUgc29tZSBzcGVjaWZpY2F0aW9uIGxpbmtzOlxuICAvLyA8aHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvbXVsdGlwYWdlL2dsb2JhbC1vYmplY3QuaHRtbCNzZWMtZGVjb2RldXJpLWVuY29kZWR1cmk+XG4gIC8vIDxodHRwczovL3RjMzkuZXMvZWNtYTI2Mi9tdWx0aXBhZ2UvZ2xvYmFsLW9iamVjdC5odG1sI3NlYy1kZWNvZGV1cmljb21wb25lbnQtZW5jb2RlZHVyaWNvbXBvbmVudD5cbiAgcmV0dXJuIHBhdGhzLnN0cmlwUm9vdChkZWNvZGVVUklDb21wb25lbnQodXJsLnBhdGhuYW1lKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBodG1sPEsgZXh0ZW5kcyBrZXlvZiBIVE1MRWxlbWVudFRhZ05hbWVNYXA+KFxuICB0YWdOYW1lOiBLLFxuICBvcHRpb25zOiB7XG4gICAgYXR0cnM/OiB7IFthdHRyOiBzdHJpbmddOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkIH0gfCBudWxsO1xuICAgIGlkPzogc3RyaW5nIHwgbnVsbDtcbiAgICBjbGFzcz86IHN0cmluZ1tdIHwgbnVsbDtcbiAgICBzdHlsZT86IHtcbiAgICAgIFtQIGluIGtleW9mIENTU1N0eWxlRGVjbGFyYXRpb25dPzogRXh0cmFjdDxDU1NTdHlsZURlY2xhcmF0aW9uW1BdLCBzdHJpbmcgfCBudW1iZXI+IHwgbnVsbDtcbiAgICB9O1xuICAgIGNoaWxkcmVuPzogQXJyYXk8c3RyaW5nIHwgTm9kZT4gfCBudWxsO1xuICB9LFxuKTogSFRNTEVsZW1lbnRUYWdOYW1lTWFwW0tdIHtcbiAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuXG4gIGlmIChvcHRpb25zLmF0dHJzICE9IG51bGwpIHtcbiAgICBmb3IgKGxldCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXMob3B0aW9ucy5hdHRycykpIHtcbiAgICAgIGlmICh2ICE9IG51bGwpIHtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoaywgdik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKG9wdGlvbnMuaWQgIT0gbnVsbCkge1xuICAgIGVsZW1lbnQuaWQgPSBvcHRpb25zLmlkO1xuICB9XG4gIGlmIChvcHRpb25zLmNsYXNzICE9IG51bGwpIHtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoLi4ub3B0aW9ucy5jbGFzcyk7XG4gIH1cblxuICBpZiAob3B0aW9ucy5zdHlsZSAhPSBudWxsKSB7XG4gICAgZm9yIChsZXQgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKG9wdGlvbnMuc3R5bGUpKSB7XG4gICAgICBpZiAodiAhPSBudWxsKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgIChlbGVtZW50LnN0eWxlIGFzIGFueSlba10gPSB2O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChvcHRpb25zLmNoaWxkcmVuICE9IG51bGwpIHtcbiAgICBlbGVtZW50LmFwcGVuZCguLi5vcHRpb25zLmNoaWxkcmVuKTtcbiAgfVxuXG4gIHJldHVybiBlbGVtZW50O1xufVxuXG5leHBvcnQgY29uc3Qgc3RkbGliTmFtZXNwYWNlID0ge1xuICBQbGF0Zm9ybVR5cGUsXG4gIFBMQVRGT1JNX1RZUEUsXG4gIHNob3dEZXZUb29scyxcbiAgc2hvd0JhY2tncm91bmRQYWdlRGV2VG9vbHMsXG4gIHdhaXQsXG4gIGNvbXBhcmUsXG4gIHdyYXBQcm9taXNlUmVzdWx0LFxuICBoYXNLZXksXG4gIG1hcEdldE9ySW5zZXJ0LFxufTtcbiIsICIvLyBAdHMtbm9jaGVja1xudmFyIF9fZ2V0T3duUHJvcE5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXM7XG52YXIgX19jb21tb25KUyA9IChjYiwgbW9kKSA9PiBmdW5jdGlvbiBfX3JlcXVpcmUoKSB7XG4gIHJldHVybiBtb2QgfHwgKDAsIGNiW19fZ2V0T3duUHJvcE5hbWVzKGNiKVswXV0pKChtb2QgPSB7IGV4cG9ydHM6IHt9IH0pLmV4cG9ydHMsIG1vZCksIG1vZC5leHBvcnRzO1xufTtcblxuLy8gbm9kZV9tb2R1bGVzLy5wbnBtL3NlbXZlckA2LjMuMC9ub2RlX21vZHVsZXMvc2VtdmVyL3NlbXZlci5qc1xudmFyIHJlcXVpcmVfc2VtdmVyID0gX19jb21tb25KUyh7XG4gIFwibm9kZV9tb2R1bGVzLy5wbnBtL3NlbXZlckA2LjMuMC9ub2RlX21vZHVsZXMvc2VtdmVyL3NlbXZlci5qc1wiKGV4cG9ydHMsIG1vZHVsZSkge1xuICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IFNlbVZlcjtcbiAgICB2YXIgZGVidWc7XG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmIHByb2Nlc3MuZW52ICYmIHByb2Nlc3MuZW52Lk5PREVfREVCVUcgJiYgL1xcYnNlbXZlclxcYi9pLnRlc3QocHJvY2Vzcy5lbnYuTk9ERV9ERUJVRykpIHtcbiAgICAgIGRlYnVnID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgICAgICAgYXJncy51bnNoaWZ0KFwiU0VNVkVSXCIpO1xuICAgICAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmdzKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnID0gZnVuY3Rpb24oKSB7XG4gICAgICB9O1xuICAgIH1cbiAgICBleHBvcnRzLlNFTVZFUl9TUEVDX1ZFUlNJT04gPSBcIjIuMC4wXCI7XG4gICAgdmFyIE1BWF9MRU5HVEggPSAyNTY7XG4gICAgdmFyIE1BWF9TQUZFX0lOVEVHRVIgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiB8fCAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIDkwMDcxOTkyNTQ3NDA5OTE7XG4gICAgdmFyIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggPSAxNjtcbiAgICB2YXIgcmUgPSBleHBvcnRzLnJlID0gW107XG4gICAgdmFyIHNyYyA9IGV4cG9ydHMuc3JjID0gW107XG4gICAgdmFyIHQgPSBleHBvcnRzLnRva2VucyA9IHt9O1xuICAgIHZhciBSID0gMDtcbiAgICBmdW5jdGlvbiB0b2sobikge1xuICAgICAgdFtuXSA9IFIrKztcbiAgICB9XG4gICAgdG9rKFwiTlVNRVJJQ0lERU5USUZJRVJcIik7XG4gICAgc3JjW3QuTlVNRVJJQ0lERU5USUZJRVJdID0gXCIwfFsxLTldXFxcXGQqXCI7XG4gICAgdG9rKFwiTlVNRVJJQ0lERU5USUZJRVJMT09TRVwiKTtcbiAgICBzcmNbdC5OVU1FUklDSURFTlRJRklFUkxPT1NFXSA9IFwiWzAtOV0rXCI7XG4gICAgdG9rKFwiTk9OTlVNRVJJQ0lERU5USUZJRVJcIik7XG4gICAgc3JjW3QuTk9OTlVNRVJJQ0lERU5USUZJRVJdID0gXCJcXFxcZCpbYS16QS1aLV1bYS16QS1aMC05LV0qXCI7XG4gICAgdG9rKFwiTUFJTlZFUlNJT05cIik7XG4gICAgc3JjW3QuTUFJTlZFUlNJT05dID0gXCIoXCIgKyBzcmNbdC5OVU1FUklDSURFTlRJRklFUl0gKyBcIilcXFxcLihcIiArIHNyY1t0Lk5VTUVSSUNJREVOVElGSUVSXSArIFwiKVxcXFwuKFwiICsgc3JjW3QuTlVNRVJJQ0lERU5USUZJRVJdICsgXCIpXCI7XG4gICAgdG9rKFwiTUFJTlZFUlNJT05MT09TRVwiKTtcbiAgICBzcmNbdC5NQUlOVkVSU0lPTkxPT1NFXSA9IFwiKFwiICsgc3JjW3QuTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gKyBcIilcXFxcLihcIiArIHNyY1t0Lk5VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgXCIpXFxcXC4oXCIgKyBzcmNbdC5OVU1FUklDSURFTlRJRklFUkxPT1NFXSArIFwiKVwiO1xuICAgIHRvayhcIlBSRVJFTEVBU0VJREVOVElGSUVSXCIpO1xuICAgIHNyY1t0LlBSRVJFTEVBU0VJREVOVElGSUVSXSA9IFwiKD86XCIgKyBzcmNbdC5OVU1FUklDSURFTlRJRklFUl0gKyBcInxcIiArIHNyY1t0Lk5PTk5VTUVSSUNJREVOVElGSUVSXSArIFwiKVwiO1xuICAgIHRvayhcIlBSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VcIik7XG4gICAgc3JjW3QuUFJFUkVMRUFTRUlERU5USUZJRVJMT09TRV0gPSBcIig/OlwiICsgc3JjW3QuTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gKyBcInxcIiArIHNyY1t0Lk5PTk5VTUVSSUNJREVOVElGSUVSXSArIFwiKVwiO1xuICAgIHRvayhcIlBSRVJFTEVBU0VcIik7XG4gICAgc3JjW3QuUFJFUkVMRUFTRV0gPSBcIig/Oi0oXCIgKyBzcmNbdC5QUkVSRUxFQVNFSURFTlRJRklFUl0gKyBcIig/OlxcXFwuXCIgKyBzcmNbdC5QUkVSRUxFQVNFSURFTlRJRklFUl0gKyBcIikqKSlcIjtcbiAgICB0b2soXCJQUkVSRUxFQVNFTE9PU0VcIik7XG4gICAgc3JjW3QuUFJFUkVMRUFTRUxPT1NFXSA9IFwiKD86LT8oXCIgKyBzcmNbdC5QUkVSRUxFQVNFSURFTlRJRklFUkxPT1NFXSArIFwiKD86XFxcXC5cIiArIHNyY1t0LlBSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VdICsgXCIpKikpXCI7XG4gICAgdG9rKFwiQlVJTERJREVOVElGSUVSXCIpO1xuICAgIHNyY1t0LkJVSUxESURFTlRJRklFUl0gPSBcIlswLTlBLVphLXotXStcIjtcbiAgICB0b2soXCJCVUlMRFwiKTtcbiAgICBzcmNbdC5CVUlMRF0gPSBcIig/OlxcXFwrKFwiICsgc3JjW3QuQlVJTERJREVOVElGSUVSXSArIFwiKD86XFxcXC5cIiArIHNyY1t0LkJVSUxESURFTlRJRklFUl0gKyBcIikqKSlcIjtcbiAgICB0b2soXCJGVUxMXCIpO1xuICAgIHRvayhcIkZVTExQTEFJTlwiKTtcbiAgICBzcmNbdC5GVUxMUExBSU5dID0gXCJ2P1wiICsgc3JjW3QuTUFJTlZFUlNJT05dICsgc3JjW3QuUFJFUkVMRUFTRV0gKyBcIj9cIiArIHNyY1t0LkJVSUxEXSArIFwiP1wiO1xuICAgIHNyY1t0LkZVTExdID0gXCJeXCIgKyBzcmNbdC5GVUxMUExBSU5dICsgXCIkXCI7XG4gICAgdG9rKFwiTE9PU0VQTEFJTlwiKTtcbiAgICBzcmNbdC5MT09TRVBMQUlOXSA9IFwiW3Y9XFxcXHNdKlwiICsgc3JjW3QuTUFJTlZFUlNJT05MT09TRV0gKyBzcmNbdC5QUkVSRUxFQVNFTE9PU0VdICsgXCI/XCIgKyBzcmNbdC5CVUlMRF0gKyBcIj9cIjtcbiAgICB0b2soXCJMT09TRVwiKTtcbiAgICBzcmNbdC5MT09TRV0gPSBcIl5cIiArIHNyY1t0LkxPT1NFUExBSU5dICsgXCIkXCI7XG4gICAgdG9rKFwiR1RMVFwiKTtcbiAgICBzcmNbdC5HVExUXSA9IFwiKCg/Ojx8Pik/PT8pXCI7XG4gICAgdG9rKFwiWFJBTkdFSURFTlRJRklFUkxPT1NFXCIpO1xuICAgIHNyY1t0LlhSQU5HRUlERU5USUZJRVJMT09TRV0gPSBzcmNbdC5OVU1FUklDSURFTlRJRklFUkxPT1NFXSArIFwifHh8WHxcXFxcKlwiO1xuICAgIHRvayhcIlhSQU5HRUlERU5USUZJRVJcIik7XG4gICAgc3JjW3QuWFJBTkdFSURFTlRJRklFUl0gPSBzcmNbdC5OVU1FUklDSURFTlRJRklFUl0gKyBcInx4fFh8XFxcXCpcIjtcbiAgICB0b2soXCJYUkFOR0VQTEFJTlwiKTtcbiAgICBzcmNbdC5YUkFOR0VQTEFJTl0gPSBcIlt2PVxcXFxzXSooXCIgKyBzcmNbdC5YUkFOR0VJREVOVElGSUVSXSArIFwiKSg/OlxcXFwuKFwiICsgc3JjW3QuWFJBTkdFSURFTlRJRklFUl0gKyBcIikoPzpcXFxcLihcIiArIHNyY1t0LlhSQU5HRUlERU5USUZJRVJdICsgXCIpKD86XCIgKyBzcmNbdC5QUkVSRUxFQVNFXSArIFwiKT9cIiArIHNyY1t0LkJVSUxEXSArIFwiPyk/KT9cIjtcbiAgICB0b2soXCJYUkFOR0VQTEFJTkxPT1NFXCIpO1xuICAgIHNyY1t0LlhSQU5HRVBMQUlOTE9PU0VdID0gXCJbdj1cXFxcc10qKFwiICsgc3JjW3QuWFJBTkdFSURFTlRJRklFUkxPT1NFXSArIFwiKSg/OlxcXFwuKFwiICsgc3JjW3QuWFJBTkdFSURFTlRJRklFUkxPT1NFXSArIFwiKSg/OlxcXFwuKFwiICsgc3JjW3QuWFJBTkdFSURFTlRJRklFUkxPT1NFXSArIFwiKSg/OlwiICsgc3JjW3QuUFJFUkVMRUFTRUxPT1NFXSArIFwiKT9cIiArIHNyY1t0LkJVSUxEXSArIFwiPyk/KT9cIjtcbiAgICB0b2soXCJYUkFOR0VcIik7XG4gICAgc3JjW3QuWFJBTkdFXSA9IFwiXlwiICsgc3JjW3QuR1RMVF0gKyBcIlxcXFxzKlwiICsgc3JjW3QuWFJBTkdFUExBSU5dICsgXCIkXCI7XG4gICAgdG9rKFwiWFJBTkdFTE9PU0VcIik7XG4gICAgc3JjW3QuWFJBTkdFTE9PU0VdID0gXCJeXCIgKyBzcmNbdC5HVExUXSArIFwiXFxcXHMqXCIgKyBzcmNbdC5YUkFOR0VQTEFJTkxPT1NFXSArIFwiJFwiO1xuICAgIHRvayhcIkNPRVJDRVwiKTtcbiAgICBzcmNbdC5DT0VSQ0VdID0gXCIoXnxbXlxcXFxkXSkoXFxcXGR7MSxcIiArIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggKyBcIn0pKD86XFxcXC4oXFxcXGR7MSxcIiArIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggKyBcIn0pKT8oPzpcXFxcLihcXFxcZHsxLFwiICsgTUFYX1NBRkVfQ09NUE9ORU5UX0xFTkdUSCArIFwifSkpPyg/OiR8W15cXFxcZF0pXCI7XG4gICAgdG9rKFwiQ09FUkNFUlRMXCIpO1xuICAgIHJlW3QuQ09FUkNFUlRMXSA9IG5ldyBSZWdFeHAoc3JjW3QuQ09FUkNFXSwgXCJnXCIpO1xuICAgIHRvayhcIkxPTkVUSUxERVwiKTtcbiAgICBzcmNbdC5MT05FVElMREVdID0gXCIoPzp+Pj8pXCI7XG4gICAgdG9rKFwiVElMREVUUklNXCIpO1xuICAgIHNyY1t0LlRJTERFVFJJTV0gPSBcIihcXFxccyopXCIgKyBzcmNbdC5MT05FVElMREVdICsgXCJcXFxccytcIjtcbiAgICByZVt0LlRJTERFVFJJTV0gPSBuZXcgUmVnRXhwKHNyY1t0LlRJTERFVFJJTV0sIFwiZ1wiKTtcbiAgICB2YXIgdGlsZGVUcmltUmVwbGFjZSA9IFwiJDF+XCI7XG4gICAgdG9rKFwiVElMREVcIik7XG4gICAgc3JjW3QuVElMREVdID0gXCJeXCIgKyBzcmNbdC5MT05FVElMREVdICsgc3JjW3QuWFJBTkdFUExBSU5dICsgXCIkXCI7XG4gICAgdG9rKFwiVElMREVMT09TRVwiKTtcbiAgICBzcmNbdC5USUxERUxPT1NFXSA9IFwiXlwiICsgc3JjW3QuTE9ORVRJTERFXSArIHNyY1t0LlhSQU5HRVBMQUlOTE9PU0VdICsgXCIkXCI7XG4gICAgdG9rKFwiTE9ORUNBUkVUXCIpO1xuICAgIHNyY1t0LkxPTkVDQVJFVF0gPSBcIig/OlxcXFxeKVwiO1xuICAgIHRvayhcIkNBUkVUVFJJTVwiKTtcbiAgICBzcmNbdC5DQVJFVFRSSU1dID0gXCIoXFxcXHMqKVwiICsgc3JjW3QuTE9ORUNBUkVUXSArIFwiXFxcXHMrXCI7XG4gICAgcmVbdC5DQVJFVFRSSU1dID0gbmV3IFJlZ0V4cChzcmNbdC5DQVJFVFRSSU1dLCBcImdcIik7XG4gICAgdmFyIGNhcmV0VHJpbVJlcGxhY2UgPSBcIiQxXlwiO1xuICAgIHRvayhcIkNBUkVUXCIpO1xuICAgIHNyY1t0LkNBUkVUXSA9IFwiXlwiICsgc3JjW3QuTE9ORUNBUkVUXSArIHNyY1t0LlhSQU5HRVBMQUlOXSArIFwiJFwiO1xuICAgIHRvayhcIkNBUkVUTE9PU0VcIik7XG4gICAgc3JjW3QuQ0FSRVRMT09TRV0gPSBcIl5cIiArIHNyY1t0LkxPTkVDQVJFVF0gKyBzcmNbdC5YUkFOR0VQTEFJTkxPT1NFXSArIFwiJFwiO1xuICAgIHRvayhcIkNPTVBBUkFUT1JMT09TRVwiKTtcbiAgICBzcmNbdC5DT01QQVJBVE9STE9PU0VdID0gXCJeXCIgKyBzcmNbdC5HVExUXSArIFwiXFxcXHMqKFwiICsgc3JjW3QuTE9PU0VQTEFJTl0gKyBcIikkfF4kXCI7XG4gICAgdG9rKFwiQ09NUEFSQVRPUlwiKTtcbiAgICBzcmNbdC5DT01QQVJBVE9SXSA9IFwiXlwiICsgc3JjW3QuR1RMVF0gKyBcIlxcXFxzKihcIiArIHNyY1t0LkZVTExQTEFJTl0gKyBcIikkfF4kXCI7XG4gICAgdG9rKFwiQ09NUEFSQVRPUlRSSU1cIik7XG4gICAgc3JjW3QuQ09NUEFSQVRPUlRSSU1dID0gXCIoXFxcXHMqKVwiICsgc3JjW3QuR1RMVF0gKyBcIlxcXFxzKihcIiArIHNyY1t0LkxPT1NFUExBSU5dICsgXCJ8XCIgKyBzcmNbdC5YUkFOR0VQTEFJTl0gKyBcIilcIjtcbiAgICByZVt0LkNPTVBBUkFUT1JUUklNXSA9IG5ldyBSZWdFeHAoc3JjW3QuQ09NUEFSQVRPUlRSSU1dLCBcImdcIik7XG4gICAgdmFyIGNvbXBhcmF0b3JUcmltUmVwbGFjZSA9IFwiJDEkMiQzXCI7XG4gICAgdG9rKFwiSFlQSEVOUkFOR0VcIik7XG4gICAgc3JjW3QuSFlQSEVOUkFOR0VdID0gXCJeXFxcXHMqKFwiICsgc3JjW3QuWFJBTkdFUExBSU5dICsgXCIpXFxcXHMrLVxcXFxzKyhcIiArIHNyY1t0LlhSQU5HRVBMQUlOXSArIFwiKVxcXFxzKiRcIjtcbiAgICB0b2soXCJIWVBIRU5SQU5HRUxPT1NFXCIpO1xuICAgIHNyY1t0LkhZUEhFTlJBTkdFTE9PU0VdID0gXCJeXFxcXHMqKFwiICsgc3JjW3QuWFJBTkdFUExBSU5MT09TRV0gKyBcIilcXFxccystXFxcXHMrKFwiICsgc3JjW3QuWFJBTkdFUExBSU5MT09TRV0gKyBcIilcXFxccyokXCI7XG4gICAgdG9rKFwiU1RBUlwiKTtcbiAgICBzcmNbdC5TVEFSXSA9IFwiKDx8Pik/PT9cXFxccypcXFxcKlwiO1xuICAgIGZvciAoaSA9IDA7IGkgPCBSOyBpKyspIHtcbiAgICAgIGRlYnVnKGksIHNyY1tpXSk7XG4gICAgICBpZiAoIXJlW2ldKSB7XG4gICAgICAgIHJlW2ldID0gbmV3IFJlZ0V4cChzcmNbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgICB2YXIgaTtcbiAgICBleHBvcnRzLnBhcnNlID0gcGFyc2U7XG4gICAgZnVuY3Rpb24gcGFyc2UodmVyc2lvbiwgb3B0aW9ucykge1xuICAgICAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgbG9vc2U6ICEhb3B0aW9ucyxcbiAgICAgICAgICBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICh2ZXJzaW9uIGluc3RhbmNlb2YgU2VtVmVyKSB7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB2ZXJzaW9uICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKHZlcnNpb24ubGVuZ3RoID4gTUFYX0xFTkdUSCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHZhciByID0gb3B0aW9ucy5sb29zZSA/IHJlW3QuTE9PU0VdIDogcmVbdC5GVUxMXTtcbiAgICAgIGlmICghci50ZXN0KHZlcnNpb24pKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIG5ldyBTZW1WZXIodmVyc2lvbiwgb3B0aW9ucyk7XG4gICAgICB9IGNhdGNoIChlcikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgZXhwb3J0cy52YWxpZCA9IHZhbGlkO1xuICAgIGZ1bmN0aW9uIHZhbGlkKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgICAgIHZhciB2ID0gcGFyc2UodmVyc2lvbiwgb3B0aW9ucyk7XG4gICAgICByZXR1cm4gdiA/IHYudmVyc2lvbiA6IG51bGw7XG4gICAgfVxuICAgIGV4cG9ydHMuY2xlYW4gPSBjbGVhbjtcbiAgICBmdW5jdGlvbiBjbGVhbih2ZXJzaW9uLCBvcHRpb25zKSB7XG4gICAgICB2YXIgcyA9IHBhcnNlKHZlcnNpb24udHJpbSgpLnJlcGxhY2UoL15bPXZdKy8sIFwiXCIpLCBvcHRpb25zKTtcbiAgICAgIHJldHVybiBzID8gcy52ZXJzaW9uIDogbnVsbDtcbiAgICB9XG4gICAgZXhwb3J0cy5TZW1WZXIgPSBTZW1WZXI7XG4gICAgZnVuY3Rpb24gU2VtVmVyKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgICAgIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICBvcHRpb25zID0ge1xuICAgICAgICAgIGxvb3NlOiAhIW9wdGlvbnMsXG4gICAgICAgICAgaW5jbHVkZVByZXJlbGVhc2U6IGZhbHNlXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAodmVyc2lvbiBpbnN0YW5jZW9mIFNlbVZlcikge1xuICAgICAgICBpZiAodmVyc2lvbi5sb29zZSA9PT0gb3B0aW9ucy5sb29zZSkge1xuICAgICAgICAgIHJldHVybiB2ZXJzaW9uO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZlcnNpb24gPSB2ZXJzaW9uLnZlcnNpb247XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZlcnNpb24gIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgVmVyc2lvbjogXCIgKyB2ZXJzaW9uKTtcbiAgICAgIH1cbiAgICAgIGlmICh2ZXJzaW9uLmxlbmd0aCA+IE1BWF9MRU5HVEgpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcInZlcnNpb24gaXMgbG9uZ2VyIHRoYW4gXCIgKyBNQVhfTEVOR1RIICsgXCIgY2hhcmFjdGVyc1wiKTtcbiAgICAgIH1cbiAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBTZW1WZXIpKSB7XG4gICAgICAgIHJldHVybiBuZXcgU2VtVmVyKHZlcnNpb24sIG9wdGlvbnMpO1xuICAgICAgfVxuICAgICAgZGVidWcoXCJTZW1WZXJcIiwgdmVyc2lvbiwgb3B0aW9ucyk7XG4gICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgdGhpcy5sb29zZSA9ICEhb3B0aW9ucy5sb29zZTtcbiAgICAgIHZhciBtID0gdmVyc2lvbi50cmltKCkubWF0Y2gob3B0aW9ucy5sb29zZSA/IHJlW3QuTE9PU0VdIDogcmVbdC5GVUxMXSk7XG4gICAgICBpZiAoIW0pIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgVmVyc2lvbjogXCIgKyB2ZXJzaW9uKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmF3ID0gdmVyc2lvbjtcbiAgICAgIHRoaXMubWFqb3IgPSArbVsxXTtcbiAgICAgIHRoaXMubWlub3IgPSArbVsyXTtcbiAgICAgIHRoaXMucGF0Y2ggPSArbVszXTtcbiAgICAgIGlmICh0aGlzLm1ham9yID4gTUFYX1NBRkVfSU5URUdFUiB8fCB0aGlzLm1ham9yIDwgMCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBtYWpvciB2ZXJzaW9uXCIpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMubWlub3IgPiBNQVhfU0FGRV9JTlRFR0VSIHx8IHRoaXMubWlub3IgPCAwKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIG1pbm9yIHZlcnNpb25cIik7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5wYXRjaCA+IE1BWF9TQUZFX0lOVEVHRVIgfHwgdGhpcy5wYXRjaCA8IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgcGF0Y2ggdmVyc2lvblwiKTtcbiAgICAgIH1cbiAgICAgIGlmICghbVs0XSkge1xuICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IG1bNF0uc3BsaXQoXCIuXCIpLm1hcChmdW5jdGlvbihpZCkge1xuICAgICAgICAgIGlmICgvXlswLTldKyQvLnRlc3QoaWQpKSB7XG4gICAgICAgICAgICB2YXIgbnVtID0gK2lkO1xuICAgICAgICAgICAgaWYgKG51bSA+PSAwICYmIG51bSA8IE1BWF9TQUZFX0lOVEVHRVIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG51bTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuYnVpbGQgPSBtWzVdID8gbVs1XS5zcGxpdChcIi5cIikgOiBbXTtcbiAgICAgIHRoaXMuZm9ybWF0KCk7XG4gICAgfVxuICAgIFNlbVZlci5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnZlcnNpb24gPSB0aGlzLm1ham9yICsgXCIuXCIgKyB0aGlzLm1pbm9yICsgXCIuXCIgKyB0aGlzLnBhdGNoO1xuICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy52ZXJzaW9uICs9IFwiLVwiICsgdGhpcy5wcmVyZWxlYXNlLmpvaW4oXCIuXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMudmVyc2lvbjtcbiAgICB9O1xuICAgIFNlbVZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnZlcnNpb247XG4gICAgfTtcbiAgICBTZW1WZXIucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbihvdGhlcikge1xuICAgICAgZGVidWcoXCJTZW1WZXIuY29tcGFyZVwiLCB0aGlzLnZlcnNpb24sIHRoaXMub3B0aW9ucywgb3RoZXIpO1xuICAgICAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIpKSB7XG4gICAgICAgIG90aGVyID0gbmV3IFNlbVZlcihvdGhlciwgdGhpcy5vcHRpb25zKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmNvbXBhcmVNYWluKG90aGVyKSB8fCB0aGlzLmNvbXBhcmVQcmUob3RoZXIpO1xuICAgIH07XG4gICAgU2VtVmVyLnByb3RvdHlwZS5jb21wYXJlTWFpbiA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICBpZiAoIShvdGhlciBpbnN0YW5jZW9mIFNlbVZlcikpIHtcbiAgICAgICAgb3RoZXIgPSBuZXcgU2VtVmVyKG90aGVyLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbXBhcmVJZGVudGlmaWVycyh0aGlzLm1ham9yLCBvdGhlci5tYWpvcikgfHwgY29tcGFyZUlkZW50aWZpZXJzKHRoaXMubWlub3IsIG90aGVyLm1pbm9yKSB8fCBjb21wYXJlSWRlbnRpZmllcnModGhpcy5wYXRjaCwgb3RoZXIucGF0Y2gpO1xuICAgIH07XG4gICAgU2VtVmVyLnByb3RvdHlwZS5jb21wYXJlUHJlID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgIGlmICghKG90aGVyIGluc3RhbmNlb2YgU2VtVmVyKSkge1xuICAgICAgICBvdGhlciA9IG5ldyBTZW1WZXIob3RoZXIsIHRoaXMub3B0aW9ucyk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCAmJiAhb3RoZXIucHJlcmVsZWFzZS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfSBlbHNlIGlmICghdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCAmJiBvdGhlci5wcmVyZWxlYXNlLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gMTtcbiAgICAgIH0gZWxzZSBpZiAoIXRoaXMucHJlcmVsZWFzZS5sZW5ndGggJiYgIW90aGVyLnByZXJlbGVhc2UubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgICAgdmFyIGkyID0gMDtcbiAgICAgIGRvIHtcbiAgICAgICAgdmFyIGEgPSB0aGlzLnByZXJlbGVhc2VbaTJdO1xuICAgICAgICB2YXIgYiA9IG90aGVyLnByZXJlbGVhc2VbaTJdO1xuICAgICAgICBkZWJ1ZyhcInByZXJlbGVhc2UgY29tcGFyZVwiLCBpMiwgYSwgYik7XG4gICAgICAgIGlmIChhID09PSB2b2lkIDAgJiYgYiA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH0gZWxzZSBpZiAoYiA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH0gZWxzZSBpZiAoYSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9IGVsc2UgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gY29tcGFyZUlkZW50aWZpZXJzKGEsIGIpO1xuICAgICAgICB9XG4gICAgICB9IHdoaWxlICgrK2kyKTtcbiAgICB9O1xuICAgIFNlbVZlci5wcm90b3R5cGUuY29tcGFyZUJ1aWxkID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICAgIGlmICghKG90aGVyIGluc3RhbmNlb2YgU2VtVmVyKSkge1xuICAgICAgICBvdGhlciA9IG5ldyBTZW1WZXIob3RoZXIsIHRoaXMub3B0aW9ucyk7XG4gICAgICB9XG4gICAgICB2YXIgaTIgPSAwO1xuICAgICAgZG8ge1xuICAgICAgICB2YXIgYSA9IHRoaXMuYnVpbGRbaTJdO1xuICAgICAgICB2YXIgYiA9IG90aGVyLmJ1aWxkW2kyXTtcbiAgICAgICAgZGVidWcoXCJwcmVyZWxlYXNlIGNvbXBhcmVcIiwgaTIsIGEsIGIpO1xuICAgICAgICBpZiAoYSA9PT0gdm9pZCAwICYmIGIgPT09IHZvaWQgMCkge1xuICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9IGVsc2UgaWYgKGIgPT09IHZvaWQgMCkge1xuICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9IGVsc2UgaWYgKGEgPT09IHZvaWQgMCkge1xuICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfSBlbHNlIGlmIChhID09PSBiKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGNvbXBhcmVJZGVudGlmaWVycyhhLCBiKTtcbiAgICAgICAgfVxuICAgICAgfSB3aGlsZSAoKytpMik7XG4gICAgfTtcbiAgICBTZW1WZXIucHJvdG90eXBlLmluYyA9IGZ1bmN0aW9uKHJlbGVhc2UsIGlkZW50aWZpZXIpIHtcbiAgICAgIHN3aXRjaCAocmVsZWFzZSkge1xuICAgICAgICBjYXNlIFwicHJlbWFqb3JcIjpcbiAgICAgICAgICB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID0gMDtcbiAgICAgICAgICB0aGlzLnBhdGNoID0gMDtcbiAgICAgICAgICB0aGlzLm1pbm9yID0gMDtcbiAgICAgICAgICB0aGlzLm1ham9yKys7XG4gICAgICAgICAgdGhpcy5pbmMoXCJwcmVcIiwgaWRlbnRpZmllcik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJwcmVtaW5vclwiOlxuICAgICAgICAgIHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPSAwO1xuICAgICAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgICAgIHRoaXMubWlub3IrKztcbiAgICAgICAgICB0aGlzLmluYyhcInByZVwiLCBpZGVudGlmaWVyKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInByZXBhdGNoXCI6XG4gICAgICAgICAgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9IDA7XG4gICAgICAgICAgdGhpcy5pbmMoXCJwYXRjaFwiLCBpZGVudGlmaWVyKTtcbiAgICAgICAgICB0aGlzLmluYyhcInByZVwiLCBpZGVudGlmaWVyKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gSWYgdGhlIGlucHV0IGlzIGEgbm9uLXByZXJlbGVhc2UgdmVyc2lvbiwgdGhpcyBhY3RzIHRoZSBzYW1lIGFzXG4gICAgICAgIC8vIHByZXBhdGNoLlxuICAgICAgICBjYXNlIFwicHJlcmVsZWFzZVwiOlxuICAgICAgICAgIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmluYyhcInBhdGNoXCIsIGlkZW50aWZpZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmluYyhcInByZVwiLCBpZGVudGlmaWVyKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIm1ham9yXCI6XG4gICAgICAgICAgaWYgKHRoaXMubWlub3IgIT09IDAgfHwgdGhpcy5wYXRjaCAhPT0gMCB8fCB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLm1ham9yKys7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubWlub3IgPSAwO1xuICAgICAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibWlub3JcIjpcbiAgICAgICAgICBpZiAodGhpcy5wYXRjaCAhPT0gMCB8fCB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLm1pbm9yKys7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwicGF0Y2hcIjpcbiAgICAgICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5wYXRjaCsrO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gVGhpcyBwcm9iYWJseSBzaG91bGRuJ3QgYmUgdXNlZCBwdWJsaWNseS5cbiAgICAgICAgLy8gMS4wLjAgXCJwcmVcIiB3b3VsZCBiZWNvbWUgMS4wLjAtMCB3aGljaCBpcyB0aGUgd3JvbmcgZGlyZWN0aW9uLlxuICAgICAgICBjYXNlIFwicHJlXCI6XG4gICAgICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFswXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGkyID0gdGhpcy5wcmVyZWxlYXNlLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlICgtLWkyID49IDApIHtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnByZXJlbGVhc2VbaTJdID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVyZWxlYXNlW2kyXSsrO1xuICAgICAgICAgICAgICAgIGkyID0gLTI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpMiA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgdGhpcy5wcmVyZWxlYXNlLnB1c2goMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpZGVudGlmaWVyKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmVyZWxlYXNlWzBdID09PSBpZGVudGlmaWVyKSB7XG4gICAgICAgICAgICAgIGlmIChpc05hTih0aGlzLnByZXJlbGVhc2VbMV0pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW2lkZW50aWZpZXIsIDBdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbaWRlbnRpZmllciwgMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgaW5jcmVtZW50IGFyZ3VtZW50OiBcIiArIHJlbGVhc2UpO1xuICAgICAgfVxuICAgICAgdGhpcy5mb3JtYXQoKTtcbiAgICAgIHRoaXMucmF3ID0gdGhpcy52ZXJzaW9uO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICBleHBvcnRzLmluYyA9IGluYztcbiAgICBmdW5jdGlvbiBpbmModmVyc2lvbiwgcmVsZWFzZSwgbG9vc2UsIGlkZW50aWZpZXIpIHtcbiAgICAgIGlmICh0eXBlb2YgbG9vc2UgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgaWRlbnRpZmllciA9IGxvb3NlO1xuICAgICAgICBsb29zZSA9IHZvaWQgMDtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBuZXcgU2VtVmVyKHZlcnNpb24sIGxvb3NlKS5pbmMocmVsZWFzZSwgaWRlbnRpZmllcikudmVyc2lvbjtcbiAgICAgIH0gY2F0Y2ggKGVyKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICBleHBvcnRzLmRpZmYgPSBkaWZmO1xuICAgIGZ1bmN0aW9uIGRpZmYodmVyc2lvbjEsIHZlcnNpb24yKSB7XG4gICAgICBpZiAoZXEodmVyc2lvbjEsIHZlcnNpb24yKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB2MSA9IHBhcnNlKHZlcnNpb24xKTtcbiAgICAgICAgdmFyIHYyID0gcGFyc2UodmVyc2lvbjIpO1xuICAgICAgICB2YXIgcHJlZml4ID0gXCJcIjtcbiAgICAgICAgaWYgKHYxLnByZXJlbGVhc2UubGVuZ3RoIHx8IHYyLnByZXJlbGVhc2UubGVuZ3RoKSB7XG4gICAgICAgICAgcHJlZml4ID0gXCJwcmVcIjtcbiAgICAgICAgICB2YXIgZGVmYXVsdFJlc3VsdCA9IFwicHJlcmVsZWFzZVwiO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGtleSBpbiB2MSkge1xuICAgICAgICAgIGlmIChrZXkgPT09IFwibWFqb3JcIiB8fCBrZXkgPT09IFwibWlub3JcIiB8fCBrZXkgPT09IFwicGF0Y2hcIikge1xuICAgICAgICAgICAgaWYgKHYxW2tleV0gIT09IHYyW2tleV0pIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArIGtleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlZmF1bHRSZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuICAgIGV4cG9ydHMuY29tcGFyZUlkZW50aWZpZXJzID0gY29tcGFyZUlkZW50aWZpZXJzO1xuICAgIHZhciBudW1lcmljID0gL15bMC05XSskLztcbiAgICBmdW5jdGlvbiBjb21wYXJlSWRlbnRpZmllcnMoYSwgYikge1xuICAgICAgdmFyIGFudW0gPSBudW1lcmljLnRlc3QoYSk7XG4gICAgICB2YXIgYm51bSA9IG51bWVyaWMudGVzdChiKTtcbiAgICAgIGlmIChhbnVtICYmIGJudW0pIHtcbiAgICAgICAgYSA9ICthO1xuICAgICAgICBiID0gK2I7XG4gICAgICB9XG4gICAgICByZXR1cm4gYSA9PT0gYiA/IDAgOiBhbnVtICYmICFibnVtID8gLTEgOiBibnVtICYmICFhbnVtID8gMSA6IGEgPCBiID8gLTEgOiAxO1xuICAgIH1cbiAgICBleHBvcnRzLnJjb21wYXJlSWRlbnRpZmllcnMgPSByY29tcGFyZUlkZW50aWZpZXJzO1xuICAgIGZ1bmN0aW9uIHJjb21wYXJlSWRlbnRpZmllcnMoYSwgYikge1xuICAgICAgcmV0dXJuIGNvbXBhcmVJZGVudGlmaWVycyhiLCBhKTtcbiAgICB9XG4gICAgZXhwb3J0cy5tYWpvciA9IG1ham9yO1xuICAgIGZ1bmN0aW9uIG1ham9yKGEsIGxvb3NlKSB7XG4gICAgICByZXR1cm4gbmV3IFNlbVZlcihhLCBsb29zZSkubWFqb3I7XG4gICAgfVxuICAgIGV4cG9ydHMubWlub3IgPSBtaW5vcjtcbiAgICBmdW5jdGlvbiBtaW5vcihhLCBsb29zZSkge1xuICAgICAgcmV0dXJuIG5ldyBTZW1WZXIoYSwgbG9vc2UpLm1pbm9yO1xuICAgIH1cbiAgICBleHBvcnRzLnBhdGNoID0gcGF0Y2g7XG4gICAgZnVuY3Rpb24gcGF0Y2goYSwgbG9vc2UpIHtcbiAgICAgIHJldHVybiBuZXcgU2VtVmVyKGEsIGxvb3NlKS5wYXRjaDtcbiAgICB9XG4gICAgZXhwb3J0cy5jb21wYXJlID0gY29tcGFyZTtcbiAgICBmdW5jdGlvbiBjb21wYXJlKGEsIGIsIGxvb3NlKSB7XG4gICAgICByZXR1cm4gbmV3IFNlbVZlcihhLCBsb29zZSkuY29tcGFyZShuZXcgU2VtVmVyKGIsIGxvb3NlKSk7XG4gICAgfVxuICAgIGV4cG9ydHMuY29tcGFyZUxvb3NlID0gY29tcGFyZUxvb3NlO1xuICAgIGZ1bmN0aW9uIGNvbXBhcmVMb29zZShhLCBiKSB7XG4gICAgICByZXR1cm4gY29tcGFyZShhLCBiLCB0cnVlKTtcbiAgICB9XG4gICAgZXhwb3J0cy5jb21wYXJlQnVpbGQgPSBjb21wYXJlQnVpbGQ7XG4gICAgZnVuY3Rpb24gY29tcGFyZUJ1aWxkKGEsIGIsIGxvb3NlKSB7XG4gICAgICB2YXIgdmVyc2lvbkEgPSBuZXcgU2VtVmVyKGEsIGxvb3NlKTtcbiAgICAgIHZhciB2ZXJzaW9uQiA9IG5ldyBTZW1WZXIoYiwgbG9vc2UpO1xuICAgICAgcmV0dXJuIHZlcnNpb25BLmNvbXBhcmUodmVyc2lvbkIpIHx8IHZlcnNpb25BLmNvbXBhcmVCdWlsZCh2ZXJzaW9uQik7XG4gICAgfVxuICAgIGV4cG9ydHMucmNvbXBhcmUgPSByY29tcGFyZTtcbiAgICBmdW5jdGlvbiByY29tcGFyZShhLCBiLCBsb29zZSkge1xuICAgICAgcmV0dXJuIGNvbXBhcmUoYiwgYSwgbG9vc2UpO1xuICAgIH1cbiAgICBleHBvcnRzLnNvcnQgPSBzb3J0O1xuICAgIGZ1bmN0aW9uIHNvcnQobGlzdCwgbG9vc2UpIHtcbiAgICAgIHJldHVybiBsaXN0LnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICByZXR1cm4gZXhwb3J0cy5jb21wYXJlQnVpbGQoYSwgYiwgbG9vc2UpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGV4cG9ydHMucnNvcnQgPSByc29ydDtcbiAgICBmdW5jdGlvbiByc29ydChsaXN0LCBsb29zZSkge1xuICAgICAgcmV0dXJuIGxpc3Quc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLmNvbXBhcmVCdWlsZChiLCBhLCBsb29zZSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZXhwb3J0cy5ndCA9IGd0O1xuICAgIGZ1bmN0aW9uIGd0KGEsIGIsIGxvb3NlKSB7XG4gICAgICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPiAwO1xuICAgIH1cbiAgICBleHBvcnRzLmx0ID0gbHQ7XG4gICAgZnVuY3Rpb24gbHQoYSwgYiwgbG9vc2UpIHtcbiAgICAgIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA8IDA7XG4gICAgfVxuICAgIGV4cG9ydHMuZXEgPSBlcTtcbiAgICBmdW5jdGlvbiBlcShhLCBiLCBsb29zZSkge1xuICAgICAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpID09PSAwO1xuICAgIH1cbiAgICBleHBvcnRzLm5lcSA9IG5lcTtcbiAgICBmdW5jdGlvbiBuZXEoYSwgYiwgbG9vc2UpIHtcbiAgICAgIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSAhPT0gMDtcbiAgICB9XG4gICAgZXhwb3J0cy5ndGUgPSBndGU7XG4gICAgZnVuY3Rpb24gZ3RlKGEsIGIsIGxvb3NlKSB7XG4gICAgICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPj0gMDtcbiAgICB9XG4gICAgZXhwb3J0cy5sdGUgPSBsdGU7XG4gICAgZnVuY3Rpb24gbHRlKGEsIGIsIGxvb3NlKSB7XG4gICAgICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPD0gMDtcbiAgICB9XG4gICAgZXhwb3J0cy5jbXAgPSBjbXA7XG4gICAgZnVuY3Rpb24gY21wKGEsIG9wLCBiLCBsb29zZSkge1xuICAgICAgc3dpdGNoIChvcCkge1xuICAgICAgICBjYXNlIFwiPT09XCI6XG4gICAgICAgICAgaWYgKHR5cGVvZiBhID09PSBcIm9iamVjdFwiKVxuICAgICAgICAgICAgYSA9IGEudmVyc2lvbjtcbiAgICAgICAgICBpZiAodHlwZW9mIGIgPT09IFwib2JqZWN0XCIpXG4gICAgICAgICAgICBiID0gYi52ZXJzaW9uO1xuICAgICAgICAgIHJldHVybiBhID09PSBiO1xuICAgICAgICBjYXNlIFwiIT09XCI6XG4gICAgICAgICAgaWYgKHR5cGVvZiBhID09PSBcIm9iamVjdFwiKVxuICAgICAgICAgICAgYSA9IGEudmVyc2lvbjtcbiAgICAgICAgICBpZiAodHlwZW9mIGIgPT09IFwib2JqZWN0XCIpXG4gICAgICAgICAgICBiID0gYi52ZXJzaW9uO1xuICAgICAgICAgIHJldHVybiBhICE9PSBiO1xuICAgICAgICBjYXNlIFwiXCI6XG4gICAgICAgIGNhc2UgXCI9XCI6XG4gICAgICAgIGNhc2UgXCI9PVwiOlxuICAgICAgICAgIHJldHVybiBlcShhLCBiLCBsb29zZSk7XG4gICAgICAgIGNhc2UgXCIhPVwiOlxuICAgICAgICAgIHJldHVybiBuZXEoYSwgYiwgbG9vc2UpO1xuICAgICAgICBjYXNlIFwiPlwiOlxuICAgICAgICAgIHJldHVybiBndChhLCBiLCBsb29zZSk7XG4gICAgICAgIGNhc2UgXCI+PVwiOlxuICAgICAgICAgIHJldHVybiBndGUoYSwgYiwgbG9vc2UpO1xuICAgICAgICBjYXNlIFwiPFwiOlxuICAgICAgICAgIHJldHVybiBsdChhLCBiLCBsb29zZSk7XG4gICAgICAgIGNhc2UgXCI8PVwiOlxuICAgICAgICAgIHJldHVybiBsdGUoYSwgYiwgbG9vc2UpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIG9wZXJhdG9yOiBcIiArIG9wKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZXhwb3J0cy5Db21wYXJhdG9yID0gQ29tcGFyYXRvcjtcbiAgICBmdW5jdGlvbiBDb21wYXJhdG9yKGNvbXAsIG9wdGlvbnMpIHtcbiAgICAgIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICBvcHRpb25zID0ge1xuICAgICAgICAgIGxvb3NlOiAhIW9wdGlvbnMsXG4gICAgICAgICAgaW5jbHVkZVByZXJlbGVhc2U6IGZhbHNlXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAoY29tcCBpbnN0YW5jZW9mIENvbXBhcmF0b3IpIHtcbiAgICAgICAgaWYgKGNvbXAubG9vc2UgPT09ICEhb3B0aW9ucy5sb29zZSkge1xuICAgICAgICAgIHJldHVybiBjb21wO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbXAgPSBjb21wLnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQ29tcGFyYXRvcikpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb21wYXJhdG9yKGNvbXAsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgICAgZGVidWcoXCJjb21wYXJhdG9yXCIsIGNvbXAsIG9wdGlvbnMpO1xuICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgIHRoaXMubG9vc2UgPSAhIW9wdGlvbnMubG9vc2U7XG4gICAgICB0aGlzLnBhcnNlKGNvbXApO1xuICAgICAgaWYgKHRoaXMuc2VtdmVyID09PSBBTlkpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IFwiXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5vcGVyYXRvciArIHRoaXMuc2VtdmVyLnZlcnNpb247XG4gICAgICB9XG4gICAgICBkZWJ1ZyhcImNvbXBcIiwgdGhpcyk7XG4gICAgfVxuICAgIHZhciBBTlkgPSB7fTtcbiAgICBDb21wYXJhdG9yLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGNvbXApIHtcbiAgICAgIHZhciByID0gdGhpcy5vcHRpb25zLmxvb3NlID8gcmVbdC5DT01QQVJBVE9STE9PU0VdIDogcmVbdC5DT01QQVJBVE9SXTtcbiAgICAgIHZhciBtID0gY29tcC5tYXRjaChyKTtcbiAgICAgIGlmICghbSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBjb21wYXJhdG9yOiBcIiArIGNvbXApO1xuICAgICAgfVxuICAgICAgdGhpcy5vcGVyYXRvciA9IG1bMV0gIT09IHZvaWQgMCA/IG1bMV0gOiBcIlwiO1xuICAgICAgaWYgKHRoaXMub3BlcmF0b3IgPT09IFwiPVwiKSB7XG4gICAgICAgIHRoaXMub3BlcmF0b3IgPSBcIlwiO1xuICAgICAgfVxuICAgICAgaWYgKCFtWzJdKSB7XG4gICAgICAgIHRoaXMuc2VtdmVyID0gQU5ZO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZW12ZXIgPSBuZXcgU2VtVmVyKG1bMl0sIHRoaXMub3B0aW9ucy5sb29zZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBDb21wYXJhdG9yLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfTtcbiAgICBDb21wYXJhdG9yLnByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24odmVyc2lvbikge1xuICAgICAgZGVidWcoXCJDb21wYXJhdG9yLnRlc3RcIiwgdmVyc2lvbiwgdGhpcy5vcHRpb25zLmxvb3NlKTtcbiAgICAgIGlmICh0aGlzLnNlbXZlciA9PT0gQU5ZIHx8IHZlcnNpb24gPT09IEFOWSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgdmVyc2lvbiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZlcnNpb24gPSBuZXcgU2VtVmVyKHZlcnNpb24sIHRoaXMub3B0aW9ucyk7XG4gICAgICAgIH0gY2F0Y2ggKGVyKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY21wKHZlcnNpb24sIHRoaXMub3BlcmF0b3IsIHRoaXMuc2VtdmVyLCB0aGlzLm9wdGlvbnMpO1xuICAgIH07XG4gICAgQ29tcGFyYXRvci5wcm90b3R5cGUuaW50ZXJzZWN0cyA9IGZ1bmN0aW9uKGNvbXAsIG9wdGlvbnMpIHtcbiAgICAgIGlmICghKGNvbXAgaW5zdGFuY2VvZiBDb21wYXJhdG9yKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiYSBDb21wYXJhdG9yIGlzIHJlcXVpcmVkXCIpO1xuICAgICAgfVxuICAgICAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgbG9vc2U6ICEhb3B0aW9ucyxcbiAgICAgICAgICBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHZhciByYW5nZVRtcDtcbiAgICAgIGlmICh0aGlzLm9wZXJhdG9yID09PSBcIlwiKSB7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlID09PSBcIlwiKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmFuZ2VUbXAgPSBuZXcgUmFuZ2UoY29tcC52YWx1ZSwgb3B0aW9ucyk7XG4gICAgICAgIHJldHVybiBzYXRpc2ZpZXModGhpcy52YWx1ZSwgcmFuZ2VUbXAsIG9wdGlvbnMpO1xuICAgICAgfSBlbHNlIGlmIChjb21wLm9wZXJhdG9yID09PSBcIlwiKSB7XG4gICAgICAgIGlmIChjb21wLnZhbHVlID09PSBcIlwiKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmFuZ2VUbXAgPSBuZXcgUmFuZ2UodGhpcy52YWx1ZSwgb3B0aW9ucyk7XG4gICAgICAgIHJldHVybiBzYXRpc2ZpZXMoY29tcC5zZW12ZXIsIHJhbmdlVG1wLCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICAgIHZhciBzYW1lRGlyZWN0aW9uSW5jcmVhc2luZyA9ICh0aGlzLm9wZXJhdG9yID09PSBcIj49XCIgfHwgdGhpcy5vcGVyYXRvciA9PT0gXCI+XCIpICYmIChjb21wLm9wZXJhdG9yID09PSBcIj49XCIgfHwgY29tcC5vcGVyYXRvciA9PT0gXCI+XCIpO1xuICAgICAgdmFyIHNhbWVEaXJlY3Rpb25EZWNyZWFzaW5nID0gKHRoaXMub3BlcmF0b3IgPT09IFwiPD1cIiB8fCB0aGlzLm9wZXJhdG9yID09PSBcIjxcIikgJiYgKGNvbXAub3BlcmF0b3IgPT09IFwiPD1cIiB8fCBjb21wLm9wZXJhdG9yID09PSBcIjxcIik7XG4gICAgICB2YXIgc2FtZVNlbVZlciA9IHRoaXMuc2VtdmVyLnZlcnNpb24gPT09IGNvbXAuc2VtdmVyLnZlcnNpb247XG4gICAgICB2YXIgZGlmZmVyZW50RGlyZWN0aW9uc0luY2x1c2l2ZSA9ICh0aGlzLm9wZXJhdG9yID09PSBcIj49XCIgfHwgdGhpcy5vcGVyYXRvciA9PT0gXCI8PVwiKSAmJiAoY29tcC5vcGVyYXRvciA9PT0gXCI+PVwiIHx8IGNvbXAub3BlcmF0b3IgPT09IFwiPD1cIik7XG4gICAgICB2YXIgb3Bwb3NpdGVEaXJlY3Rpb25zTGVzc1RoYW4gPSBjbXAodGhpcy5zZW12ZXIsIFwiPFwiLCBjb21wLnNlbXZlciwgb3B0aW9ucykgJiYgKCh0aGlzLm9wZXJhdG9yID09PSBcIj49XCIgfHwgdGhpcy5vcGVyYXRvciA9PT0gXCI+XCIpICYmIChjb21wLm9wZXJhdG9yID09PSBcIjw9XCIgfHwgY29tcC5vcGVyYXRvciA9PT0gXCI8XCIpKTtcbiAgICAgIHZhciBvcHBvc2l0ZURpcmVjdGlvbnNHcmVhdGVyVGhhbiA9IGNtcCh0aGlzLnNlbXZlciwgXCI+XCIsIGNvbXAuc2VtdmVyLCBvcHRpb25zKSAmJiAoKHRoaXMub3BlcmF0b3IgPT09IFwiPD1cIiB8fCB0aGlzLm9wZXJhdG9yID09PSBcIjxcIikgJiYgKGNvbXAub3BlcmF0b3IgPT09IFwiPj1cIiB8fCBjb21wLm9wZXJhdG9yID09PSBcIj5cIikpO1xuICAgICAgcmV0dXJuIHNhbWVEaXJlY3Rpb25JbmNyZWFzaW5nIHx8IHNhbWVEaXJlY3Rpb25EZWNyZWFzaW5nIHx8IHNhbWVTZW1WZXIgJiYgZGlmZmVyZW50RGlyZWN0aW9uc0luY2x1c2l2ZSB8fCBvcHBvc2l0ZURpcmVjdGlvbnNMZXNzVGhhbiB8fCBvcHBvc2l0ZURpcmVjdGlvbnNHcmVhdGVyVGhhbjtcbiAgICB9O1xuICAgIGV4cG9ydHMuUmFuZ2UgPSBSYW5nZTtcbiAgICBmdW5jdGlvbiBSYW5nZShyYW5nZSwgb3B0aW9ucykge1xuICAgICAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgbG9vc2U6ICEhb3B0aW9ucyxcbiAgICAgICAgICBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2VcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChyYW5nZSBpbnN0YW5jZW9mIFJhbmdlKSB7XG4gICAgICAgIGlmIChyYW5nZS5sb29zZSA9PT0gISFvcHRpb25zLmxvb3NlICYmIHJhbmdlLmluY2x1ZGVQcmVyZWxlYXNlID09PSAhIW9wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2UpIHtcbiAgICAgICAgICByZXR1cm4gcmFuZ2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBSYW5nZShyYW5nZS5yYXcsIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocmFuZ2UgaW5zdGFuY2VvZiBDb21wYXJhdG9yKSB7XG4gICAgICAgIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UudmFsdWUsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJhbmdlKSkge1xuICAgICAgICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICB0aGlzLmxvb3NlID0gISFvcHRpb25zLmxvb3NlO1xuICAgICAgdGhpcy5pbmNsdWRlUHJlcmVsZWFzZSA9ICEhb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZTtcbiAgICAgIHRoaXMucmF3ID0gcmFuZ2U7XG4gICAgICB0aGlzLnNldCA9IHJhbmdlLnNwbGl0KC9cXHMqXFx8XFx8XFxzKi8pLm1hcChmdW5jdGlvbihyYW5nZTIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VSYW5nZShyYW5nZTIudHJpbSgpKTtcbiAgICAgIH0sIHRoaXMpLmZpbHRlcihmdW5jdGlvbihjKSB7XG4gICAgICAgIHJldHVybiBjLmxlbmd0aDtcbiAgICAgIH0pO1xuICAgICAgaWYgKCF0aGlzLnNldC5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgU2VtVmVyIFJhbmdlOiBcIiArIHJhbmdlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZm9ybWF0KCk7XG4gICAgfVxuICAgIFJhbmdlLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucmFuZ2UgPSB0aGlzLnNldC5tYXAoZnVuY3Rpb24oY29tcHMpIHtcbiAgICAgICAgcmV0dXJuIGNvbXBzLmpvaW4oXCIgXCIpLnRyaW0oKTtcbiAgICAgIH0pLmpvaW4oXCJ8fFwiKS50cmltKCk7XG4gICAgICByZXR1cm4gdGhpcy5yYW5nZTtcbiAgICB9O1xuICAgIFJhbmdlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMucmFuZ2U7XG4gICAgfTtcbiAgICBSYW5nZS5wcm90b3R5cGUucGFyc2VSYW5nZSA9IGZ1bmN0aW9uKHJhbmdlKSB7XG4gICAgICB2YXIgbG9vc2UgPSB0aGlzLm9wdGlvbnMubG9vc2U7XG4gICAgICByYW5nZSA9IHJhbmdlLnRyaW0oKTtcbiAgICAgIHZhciBociA9IGxvb3NlID8gcmVbdC5IWVBIRU5SQU5HRUxPT1NFXSA6IHJlW3QuSFlQSEVOUkFOR0VdO1xuICAgICAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKGhyLCBoeXBoZW5SZXBsYWNlKTtcbiAgICAgIGRlYnVnKFwiaHlwaGVuIHJlcGxhY2VcIiwgcmFuZ2UpO1xuICAgICAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKHJlW3QuQ09NUEFSQVRPUlRSSU1dLCBjb21wYXJhdG9yVHJpbVJlcGxhY2UpO1xuICAgICAgZGVidWcoXCJjb21wYXJhdG9yIHRyaW1cIiwgcmFuZ2UsIHJlW3QuQ09NUEFSQVRPUlRSSU1dKTtcbiAgICAgIHJhbmdlID0gcmFuZ2UucmVwbGFjZShyZVt0LlRJTERFVFJJTV0sIHRpbGRlVHJpbVJlcGxhY2UpO1xuICAgICAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKHJlW3QuQ0FSRVRUUklNXSwgY2FyZXRUcmltUmVwbGFjZSk7XG4gICAgICByYW5nZSA9IHJhbmdlLnNwbGl0KC9cXHMrLykuam9pbihcIiBcIik7XG4gICAgICB2YXIgY29tcFJlID0gbG9vc2UgPyByZVt0LkNPTVBBUkFUT1JMT09TRV0gOiByZVt0LkNPTVBBUkFUT1JdO1xuICAgICAgdmFyIHNldCA9IHJhbmdlLnNwbGl0KFwiIFwiKS5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgICAgICByZXR1cm4gcGFyc2VDb21wYXJhdG9yKGNvbXAsIHRoaXMub3B0aW9ucyk7XG4gICAgICB9LCB0aGlzKS5qb2luKFwiIFwiKS5zcGxpdCgvXFxzKy8pO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5sb29zZSkge1xuICAgICAgICBzZXQgPSBzZXQuZmlsdGVyKGZ1bmN0aW9uKGNvbXApIHtcbiAgICAgICAgICByZXR1cm4gISFjb21wLm1hdGNoKGNvbXBSZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgc2V0ID0gc2V0Lm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29tcGFyYXRvcihjb21wLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgfSwgdGhpcyk7XG4gICAgICByZXR1cm4gc2V0O1xuICAgIH07XG4gICAgUmFuZ2UucHJvdG90eXBlLmludGVyc2VjdHMgPSBmdW5jdGlvbihyYW5nZSwgb3B0aW9ucykge1xuICAgICAgaWYgKCEocmFuZ2UgaW5zdGFuY2VvZiBSYW5nZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImEgUmFuZ2UgaXMgcmVxdWlyZWRcIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5zZXQuc29tZShmdW5jdGlvbih0aGlzQ29tcGFyYXRvcnMpIHtcbiAgICAgICAgcmV0dXJuIGlzU2F0aXNmaWFibGUodGhpc0NvbXBhcmF0b3JzLCBvcHRpb25zKSAmJiByYW5nZS5zZXQuc29tZShmdW5jdGlvbihyYW5nZUNvbXBhcmF0b3JzKSB7XG4gICAgICAgICAgcmV0dXJuIGlzU2F0aXNmaWFibGUocmFuZ2VDb21wYXJhdG9ycywgb3B0aW9ucykgJiYgdGhpc0NvbXBhcmF0b3JzLmV2ZXJ5KGZ1bmN0aW9uKHRoaXNDb21wYXJhdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gcmFuZ2VDb21wYXJhdG9ycy5ldmVyeShmdW5jdGlvbihyYW5nZUNvbXBhcmF0b3IpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXNDb21wYXJhdG9yLmludGVyc2VjdHMocmFuZ2VDb21wYXJhdG9yLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgZnVuY3Rpb24gaXNTYXRpc2ZpYWJsZShjb21wYXJhdG9ycywgb3B0aW9ucykge1xuICAgICAgdmFyIHJlc3VsdCA9IHRydWU7XG4gICAgICB2YXIgcmVtYWluaW5nQ29tcGFyYXRvcnMgPSBjb21wYXJhdG9ycy5zbGljZSgpO1xuICAgICAgdmFyIHRlc3RDb21wYXJhdG9yID0gcmVtYWluaW5nQ29tcGFyYXRvcnMucG9wKCk7XG4gICAgICB3aGlsZSAocmVzdWx0ICYmIHJlbWFpbmluZ0NvbXBhcmF0b3JzLmxlbmd0aCkge1xuICAgICAgICByZXN1bHQgPSByZW1haW5pbmdDb21wYXJhdG9ycy5ldmVyeShmdW5jdGlvbihvdGhlckNvbXBhcmF0b3IpIHtcbiAgICAgICAgICByZXR1cm4gdGVzdENvbXBhcmF0b3IuaW50ZXJzZWN0cyhvdGhlckNvbXBhcmF0b3IsIG9wdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGVzdENvbXBhcmF0b3IgPSByZW1haW5pbmdDb21wYXJhdG9ycy5wb3AoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIGV4cG9ydHMudG9Db21wYXJhdG9ycyA9IHRvQ29tcGFyYXRvcnM7XG4gICAgZnVuY3Rpb24gdG9Db21wYXJhdG9ycyhyYW5nZSwgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucykuc2V0Lm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgICAgIHJldHVybiBjb21wLm1hcChmdW5jdGlvbihjKSB7XG4gICAgICAgICAgcmV0dXJuIGMudmFsdWU7XG4gICAgICAgIH0pLmpvaW4oXCIgXCIpLnRyaW0oKS5zcGxpdChcIiBcIik7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcGFyc2VDb21wYXJhdG9yKGNvbXAsIG9wdGlvbnMpIHtcbiAgICAgIGRlYnVnKFwiY29tcFwiLCBjb21wLCBvcHRpb25zKTtcbiAgICAgIGNvbXAgPSByZXBsYWNlQ2FyZXRzKGNvbXAsIG9wdGlvbnMpO1xuICAgICAgZGVidWcoXCJjYXJldFwiLCBjb21wKTtcbiAgICAgIGNvbXAgPSByZXBsYWNlVGlsZGVzKGNvbXAsIG9wdGlvbnMpO1xuICAgICAgZGVidWcoXCJ0aWxkZXNcIiwgY29tcCk7XG4gICAgICBjb21wID0gcmVwbGFjZVhSYW5nZXMoY29tcCwgb3B0aW9ucyk7XG4gICAgICBkZWJ1ZyhcInhyYW5nZVwiLCBjb21wKTtcbiAgICAgIGNvbXAgPSByZXBsYWNlU3RhcnMoY29tcCwgb3B0aW9ucyk7XG4gICAgICBkZWJ1ZyhcInN0YXJzXCIsIGNvbXApO1xuICAgICAgcmV0dXJuIGNvbXA7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzWChpZCkge1xuICAgICAgcmV0dXJuICFpZCB8fCBpZC50b0xvd2VyQ2FzZSgpID09PSBcInhcIiB8fCBpZCA9PT0gXCIqXCI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlcGxhY2VUaWxkZXMoY29tcCwgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIGNvbXAudHJpbSgpLnNwbGl0KC9cXHMrLykubWFwKGZ1bmN0aW9uKGNvbXAyKSB7XG4gICAgICAgIHJldHVybiByZXBsYWNlVGlsZGUoY29tcDIsIG9wdGlvbnMpO1xuICAgICAgfSkuam9pbihcIiBcIik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlcGxhY2VUaWxkZShjb21wLCBvcHRpb25zKSB7XG4gICAgICB2YXIgciA9IG9wdGlvbnMubG9vc2UgPyByZVt0LlRJTERFTE9PU0VdIDogcmVbdC5USUxERV07XG4gICAgICByZXR1cm4gY29tcC5yZXBsYWNlKHIsIGZ1bmN0aW9uKF8sIE0sIG0sIHAsIHByKSB7XG4gICAgICAgIGRlYnVnKFwidGlsZGVcIiwgY29tcCwgXywgTSwgbSwgcCwgcHIpO1xuICAgICAgICB2YXIgcmV0O1xuICAgICAgICBpZiAoaXNYKE0pKSB7XG4gICAgICAgICAgcmV0ID0gXCJcIjtcbiAgICAgICAgfSBlbHNlIGlmIChpc1gobSkpIHtcbiAgICAgICAgICByZXQgPSBcIj49XCIgKyBNICsgXCIuMC4wIDxcIiArICgrTSArIDEpICsgXCIuMC4wXCI7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNYKHApKSB7XG4gICAgICAgICAgcmV0ID0gXCI+PVwiICsgTSArIFwiLlwiICsgbSArIFwiLjAgPFwiICsgTSArIFwiLlwiICsgKCttICsgMSkgKyBcIi4wXCI7XG4gICAgICAgIH0gZWxzZSBpZiAocHIpIHtcbiAgICAgICAgICBkZWJ1ZyhcInJlcGxhY2VUaWxkZSBwclwiLCBwcik7XG4gICAgICAgICAgcmV0ID0gXCI+PVwiICsgTSArIFwiLlwiICsgbSArIFwiLlwiICsgcCArIFwiLVwiICsgcHIgKyBcIiA8XCIgKyBNICsgXCIuXCIgKyAoK20gKyAxKSArIFwiLjBcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXQgPSBcIj49XCIgKyBNICsgXCIuXCIgKyBtICsgXCIuXCIgKyBwICsgXCIgPFwiICsgTSArIFwiLlwiICsgKCttICsgMSkgKyBcIi4wXCI7XG4gICAgICAgIH1cbiAgICAgICAgZGVidWcoXCJ0aWxkZSByZXR1cm5cIiwgcmV0KTtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZXBsYWNlQ2FyZXRzKGNvbXAsIG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBjb21wLnRyaW0oKS5zcGxpdCgvXFxzKy8pLm1hcChmdW5jdGlvbihjb21wMikge1xuICAgICAgICByZXR1cm4gcmVwbGFjZUNhcmV0KGNvbXAyLCBvcHRpb25zKTtcbiAgICAgIH0pLmpvaW4oXCIgXCIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZXBsYWNlQ2FyZXQoY29tcCwgb3B0aW9ucykge1xuICAgICAgZGVidWcoXCJjYXJldFwiLCBjb21wLCBvcHRpb25zKTtcbiAgICAgIHZhciByID0gb3B0aW9ucy5sb29zZSA/IHJlW3QuQ0FSRVRMT09TRV0gOiByZVt0LkNBUkVUXTtcbiAgICAgIHJldHVybiBjb21wLnJlcGxhY2UociwgZnVuY3Rpb24oXywgTSwgbSwgcCwgcHIpIHtcbiAgICAgICAgZGVidWcoXCJjYXJldFwiLCBjb21wLCBfLCBNLCBtLCBwLCBwcik7XG4gICAgICAgIHZhciByZXQ7XG4gICAgICAgIGlmIChpc1goTSkpIHtcbiAgICAgICAgICByZXQgPSBcIlwiO1xuICAgICAgICB9IGVsc2UgaWYgKGlzWChtKSkge1xuICAgICAgICAgIHJldCA9IFwiPj1cIiArIE0gKyBcIi4wLjAgPFwiICsgKCtNICsgMSkgKyBcIi4wLjBcIjtcbiAgICAgICAgfSBlbHNlIGlmIChpc1gocCkpIHtcbiAgICAgICAgICBpZiAoTSA9PT0gXCIwXCIpIHtcbiAgICAgICAgICAgIHJldCA9IFwiPj1cIiArIE0gKyBcIi5cIiArIG0gKyBcIi4wIDxcIiArIE0gKyBcIi5cIiArICgrbSArIDEpICsgXCIuMFwiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXQgPSBcIj49XCIgKyBNICsgXCIuXCIgKyBtICsgXCIuMCA8XCIgKyAoK00gKyAxKSArIFwiLjAuMFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChwcikge1xuICAgICAgICAgIGRlYnVnKFwicmVwbGFjZUNhcmV0IHByXCIsIHByKTtcbiAgICAgICAgICBpZiAoTSA9PT0gXCIwXCIpIHtcbiAgICAgICAgICAgIGlmIChtID09PSBcIjBcIikge1xuICAgICAgICAgICAgICByZXQgPSBcIj49XCIgKyBNICsgXCIuXCIgKyBtICsgXCIuXCIgKyBwICsgXCItXCIgKyBwciArIFwiIDxcIiArIE0gKyBcIi5cIiArIG0gKyBcIi5cIiArICgrcCArIDEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0ID0gXCI+PVwiICsgTSArIFwiLlwiICsgbSArIFwiLlwiICsgcCArIFwiLVwiICsgcHIgKyBcIiA8XCIgKyBNICsgXCIuXCIgKyAoK20gKyAxKSArIFwiLjBcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0ID0gXCI+PVwiICsgTSArIFwiLlwiICsgbSArIFwiLlwiICsgcCArIFwiLVwiICsgcHIgKyBcIiA8XCIgKyAoK00gKyAxKSArIFwiLjAuMFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWJ1ZyhcIm5vIHByXCIpO1xuICAgICAgICAgIGlmIChNID09PSBcIjBcIikge1xuICAgICAgICAgICAgaWYgKG0gPT09IFwiMFwiKSB7XG4gICAgICAgICAgICAgIHJldCA9IFwiPj1cIiArIE0gKyBcIi5cIiArIG0gKyBcIi5cIiArIHAgKyBcIiA8XCIgKyBNICsgXCIuXCIgKyBtICsgXCIuXCIgKyAoK3AgKyAxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldCA9IFwiPj1cIiArIE0gKyBcIi5cIiArIG0gKyBcIi5cIiArIHAgKyBcIiA8XCIgKyBNICsgXCIuXCIgKyAoK20gKyAxKSArIFwiLjBcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0ID0gXCI+PVwiICsgTSArIFwiLlwiICsgbSArIFwiLlwiICsgcCArIFwiIDxcIiArICgrTSArIDEpICsgXCIuMC4wXCI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGRlYnVnKFwiY2FyZXQgcmV0dXJuXCIsIHJldCk7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVwbGFjZVhSYW5nZXMoY29tcCwgb3B0aW9ucykge1xuICAgICAgZGVidWcoXCJyZXBsYWNlWFJhbmdlc1wiLCBjb21wLCBvcHRpb25zKTtcbiAgICAgIHJldHVybiBjb21wLnNwbGl0KC9cXHMrLykubWFwKGZ1bmN0aW9uKGNvbXAyKSB7XG4gICAgICAgIHJldHVybiByZXBsYWNlWFJhbmdlKGNvbXAyLCBvcHRpb25zKTtcbiAgICAgIH0pLmpvaW4oXCIgXCIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZXBsYWNlWFJhbmdlKGNvbXAsIG9wdGlvbnMpIHtcbiAgICAgIGNvbXAgPSBjb21wLnRyaW0oKTtcbiAgICAgIHZhciByID0gb3B0aW9ucy5sb29zZSA/IHJlW3QuWFJBTkdFTE9PU0VdIDogcmVbdC5YUkFOR0VdO1xuICAgICAgcmV0dXJuIGNvbXAucmVwbGFjZShyLCBmdW5jdGlvbihyZXQsIGd0bHQsIE0sIG0sIHAsIHByKSB7XG4gICAgICAgIGRlYnVnKFwieFJhbmdlXCIsIGNvbXAsIHJldCwgZ3RsdCwgTSwgbSwgcCwgcHIpO1xuICAgICAgICB2YXIgeE0gPSBpc1goTSk7XG4gICAgICAgIHZhciB4bSA9IHhNIHx8IGlzWChtKTtcbiAgICAgICAgdmFyIHhwID0geG0gfHwgaXNYKHApO1xuICAgICAgICB2YXIgYW55WCA9IHhwO1xuICAgICAgICBpZiAoZ3RsdCA9PT0gXCI9XCIgJiYgYW55WCkge1xuICAgICAgICAgIGd0bHQgPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIHByID0gb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZSA/IFwiLTBcIiA6IFwiXCI7XG4gICAgICAgIGlmICh4TSkge1xuICAgICAgICAgIGlmIChndGx0ID09PSBcIj5cIiB8fCBndGx0ID09PSBcIjxcIikge1xuICAgICAgICAgICAgcmV0ID0gXCI8MC4wLjAtMFwiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXQgPSBcIipcIjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZ3RsdCAmJiBhbnlYKSB7XG4gICAgICAgICAgaWYgKHhtKSB7XG4gICAgICAgICAgICBtID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcCA9IDA7XG4gICAgICAgICAgaWYgKGd0bHQgPT09IFwiPlwiKSB7XG4gICAgICAgICAgICBndGx0ID0gXCI+PVwiO1xuICAgICAgICAgICAgaWYgKHhtKSB7XG4gICAgICAgICAgICAgIE0gPSArTSArIDE7XG4gICAgICAgICAgICAgIG0gPSAwO1xuICAgICAgICAgICAgICBwID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG0gPSArbSArIDE7XG4gICAgICAgICAgICAgIHAgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoZ3RsdCA9PT0gXCI8PVwiKSB7XG4gICAgICAgICAgICBndGx0ID0gXCI8XCI7XG4gICAgICAgICAgICBpZiAoeG0pIHtcbiAgICAgICAgICAgICAgTSA9ICtNICsgMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG0gPSArbSArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldCA9IGd0bHQgKyBNICsgXCIuXCIgKyBtICsgXCIuXCIgKyBwICsgcHI7XG4gICAgICAgIH0gZWxzZSBpZiAoeG0pIHtcbiAgICAgICAgICByZXQgPSBcIj49XCIgKyBNICsgXCIuMC4wXCIgKyBwciArIFwiIDxcIiArICgrTSArIDEpICsgXCIuMC4wXCIgKyBwcjtcbiAgICAgICAgfSBlbHNlIGlmICh4cCkge1xuICAgICAgICAgIHJldCA9IFwiPj1cIiArIE0gKyBcIi5cIiArIG0gKyBcIi4wXCIgKyBwciArIFwiIDxcIiArIE0gKyBcIi5cIiArICgrbSArIDEpICsgXCIuMFwiICsgcHI7XG4gICAgICAgIH1cbiAgICAgICAgZGVidWcoXCJ4UmFuZ2UgcmV0dXJuXCIsIHJldCk7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVwbGFjZVN0YXJzKGNvbXAsIG9wdGlvbnMpIHtcbiAgICAgIGRlYnVnKFwicmVwbGFjZVN0YXJzXCIsIGNvbXAsIG9wdGlvbnMpO1xuICAgICAgcmV0dXJuIGNvbXAudHJpbSgpLnJlcGxhY2UocmVbdC5TVEFSXSwgXCJcIik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGh5cGhlblJlcGxhY2UoJDAsIGZyb20sIGZNLCBmbSwgZnAsIGZwciwgZmIsIHRvLCB0TSwgdG0sIHRwLCB0cHIsIHRiKSB7XG4gICAgICBpZiAoaXNYKGZNKSkge1xuICAgICAgICBmcm9tID0gXCJcIjtcbiAgICAgIH0gZWxzZSBpZiAoaXNYKGZtKSkge1xuICAgICAgICBmcm9tID0gXCI+PVwiICsgZk0gKyBcIi4wLjBcIjtcbiAgICAgIH0gZWxzZSBpZiAoaXNYKGZwKSkge1xuICAgICAgICBmcm9tID0gXCI+PVwiICsgZk0gKyBcIi5cIiArIGZtICsgXCIuMFwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnJvbSA9IFwiPj1cIiArIGZyb207XG4gICAgICB9XG4gICAgICBpZiAoaXNYKHRNKSkge1xuICAgICAgICB0byA9IFwiXCI7XG4gICAgICB9IGVsc2UgaWYgKGlzWCh0bSkpIHtcbiAgICAgICAgdG8gPSBcIjxcIiArICgrdE0gKyAxKSArIFwiLjAuMFwiO1xuICAgICAgfSBlbHNlIGlmIChpc1godHApKSB7XG4gICAgICAgIHRvID0gXCI8XCIgKyB0TSArIFwiLlwiICsgKCt0bSArIDEpICsgXCIuMFwiO1xuICAgICAgfSBlbHNlIGlmICh0cHIpIHtcbiAgICAgICAgdG8gPSBcIjw9XCIgKyB0TSArIFwiLlwiICsgdG0gKyBcIi5cIiArIHRwICsgXCItXCIgKyB0cHI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0byA9IFwiPD1cIiArIHRvO1xuICAgICAgfVxuICAgICAgcmV0dXJuIChmcm9tICsgXCIgXCIgKyB0bykudHJpbSgpO1xuICAgIH1cbiAgICBSYW5nZS5wcm90b3R5cGUudGVzdCA9IGZ1bmN0aW9uKHZlcnNpb24pIHtcbiAgICAgIGlmICghdmVyc2lvbikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHZlcnNpb24gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2ZXJzaW9uID0gbmV3IFNlbVZlcih2ZXJzaW9uLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgICB9IGNhdGNoIChlcikge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZm9yICh2YXIgaTIgPSAwOyBpMiA8IHRoaXMuc2V0Lmxlbmd0aDsgaTIrKykge1xuICAgICAgICBpZiAodGVzdFNldCh0aGlzLnNldFtpMl0sIHZlcnNpb24sIHRoaXMub3B0aW9ucykpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gICAgZnVuY3Rpb24gdGVzdFNldChzZXQsIHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgICAgIGZvciAodmFyIGkyID0gMDsgaTIgPCBzZXQubGVuZ3RoOyBpMisrKSB7XG4gICAgICAgIGlmICghc2V0W2kyXS50ZXN0KHZlcnNpb24pKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodmVyc2lvbi5wcmVyZWxlYXNlLmxlbmd0aCAmJiAhb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZSkge1xuICAgICAgICBmb3IgKGkyID0gMDsgaTIgPCBzZXQubGVuZ3RoOyBpMisrKSB7XG4gICAgICAgICAgZGVidWcoc2V0W2kyXS5zZW12ZXIpO1xuICAgICAgICAgIGlmIChzZXRbaTJdLnNlbXZlciA9PT0gQU5ZKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHNldFtpMl0uc2VtdmVyLnByZXJlbGVhc2UubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdmFyIGFsbG93ZWQgPSBzZXRbaTJdLnNlbXZlcjtcbiAgICAgICAgICAgIGlmIChhbGxvd2VkLm1ham9yID09PSB2ZXJzaW9uLm1ham9yICYmIGFsbG93ZWQubWlub3IgPT09IHZlcnNpb24ubWlub3IgJiYgYWxsb3dlZC5wYXRjaCA9PT0gdmVyc2lvbi5wYXRjaCkge1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGV4cG9ydHMuc2F0aXNmaWVzID0gc2F0aXNmaWVzO1xuICAgIGZ1bmN0aW9uIHNhdGlzZmllcyh2ZXJzaW9uLCByYW5nZSwgb3B0aW9ucykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmFuZ2UgPSBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpO1xuICAgICAgfSBjYXRjaCAoZXIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJhbmdlLnRlc3QodmVyc2lvbik7XG4gICAgfVxuICAgIGV4cG9ydHMubWF4U2F0aXNmeWluZyA9IG1heFNhdGlzZnlpbmc7XG4gICAgZnVuY3Rpb24gbWF4U2F0aXNmeWluZyh2ZXJzaW9ucywgcmFuZ2UsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBtYXggPSBudWxsO1xuICAgICAgdmFyIG1heFNWID0gbnVsbDtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciByYW5nZU9iaiA9IG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucyk7XG4gICAgICB9IGNhdGNoIChlcikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHZlcnNpb25zLmZvckVhY2goZnVuY3Rpb24odikge1xuICAgICAgICBpZiAocmFuZ2VPYmoudGVzdCh2KSkge1xuICAgICAgICAgIGlmICghbWF4IHx8IG1heFNWLmNvbXBhcmUodikgPT09IC0xKSB7XG4gICAgICAgICAgICBtYXggPSB2O1xuICAgICAgICAgICAgbWF4U1YgPSBuZXcgU2VtVmVyKG1heCwgb3B0aW9ucyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBtYXg7XG4gICAgfVxuICAgIGV4cG9ydHMubWluU2F0aXNmeWluZyA9IG1pblNhdGlzZnlpbmc7XG4gICAgZnVuY3Rpb24gbWluU2F0aXNmeWluZyh2ZXJzaW9ucywgcmFuZ2UsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBtaW4gPSBudWxsO1xuICAgICAgdmFyIG1pblNWID0gbnVsbDtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciByYW5nZU9iaiA9IG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucyk7XG4gICAgICB9IGNhdGNoIChlcikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHZlcnNpb25zLmZvckVhY2goZnVuY3Rpb24odikge1xuICAgICAgICBpZiAocmFuZ2VPYmoudGVzdCh2KSkge1xuICAgICAgICAgIGlmICghbWluIHx8IG1pblNWLmNvbXBhcmUodikgPT09IDEpIHtcbiAgICAgICAgICAgIG1pbiA9IHY7XG4gICAgICAgICAgICBtaW5TViA9IG5ldyBTZW1WZXIobWluLCBvcHRpb25zKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG1pbjtcbiAgICB9XG4gICAgZXhwb3J0cy5taW5WZXJzaW9uID0gbWluVmVyc2lvbjtcbiAgICBmdW5jdGlvbiBtaW5WZXJzaW9uKHJhbmdlLCBsb29zZSkge1xuICAgICAgcmFuZ2UgPSBuZXcgUmFuZ2UocmFuZ2UsIGxvb3NlKTtcbiAgICAgIHZhciBtaW52ZXIgPSBuZXcgU2VtVmVyKFwiMC4wLjBcIik7XG4gICAgICBpZiAocmFuZ2UudGVzdChtaW52ZXIpKSB7XG4gICAgICAgIHJldHVybiBtaW52ZXI7XG4gICAgICB9XG4gICAgICBtaW52ZXIgPSBuZXcgU2VtVmVyKFwiMC4wLjAtMFwiKTtcbiAgICAgIGlmIChyYW5nZS50ZXN0KG1pbnZlcikpIHtcbiAgICAgICAgcmV0dXJuIG1pbnZlcjtcbiAgICAgIH1cbiAgICAgIG1pbnZlciA9IG51bGw7XG4gICAgICBmb3IgKHZhciBpMiA9IDA7IGkyIDwgcmFuZ2Uuc2V0Lmxlbmd0aDsgKytpMikge1xuICAgICAgICB2YXIgY29tcGFyYXRvcnMgPSByYW5nZS5zZXRbaTJdO1xuICAgICAgICBjb21wYXJhdG9ycy5mb3JFYWNoKGZ1bmN0aW9uKGNvbXBhcmF0b3IpIHtcbiAgICAgICAgICB2YXIgY29tcHZlciA9IG5ldyBTZW1WZXIoY29tcGFyYXRvci5zZW12ZXIudmVyc2lvbik7XG4gICAgICAgICAgc3dpdGNoIChjb21wYXJhdG9yLm9wZXJhdG9yKSB7XG4gICAgICAgICAgICBjYXNlIFwiPlwiOlxuICAgICAgICAgICAgICBpZiAoY29tcHZlci5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbXB2ZXIucGF0Y2grKztcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb21wdmVyLnByZXJlbGVhc2UucHVzaCgwKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb21wdmVyLnJhdyA9IGNvbXB2ZXIuZm9ybWF0KCk7XG4gICAgICAgICAgICAvKiBmYWxsdGhyb3VnaCAqL1xuICAgICAgICAgICAgY2FzZSBcIlwiOlxuICAgICAgICAgICAgY2FzZSBcIj49XCI6XG4gICAgICAgICAgICAgIGlmICghbWludmVyIHx8IGd0KG1pbnZlciwgY29tcHZlcikpIHtcbiAgICAgICAgICAgICAgICBtaW52ZXIgPSBjb21wdmVyO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcIjxcIjpcbiAgICAgICAgICAgIGNhc2UgXCI8PVwiOlxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIG9wZXJhdGlvbjogXCIgKyBjb21wYXJhdG9yLm9wZXJhdG9yKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKG1pbnZlciAmJiByYW5nZS50ZXN0KG1pbnZlcikpIHtcbiAgICAgICAgcmV0dXJuIG1pbnZlcjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBleHBvcnRzLnZhbGlkUmFuZ2UgPSB2YWxpZFJhbmdlO1xuICAgIGZ1bmN0aW9uIHZhbGlkUmFuZ2UocmFuZ2UsIG9wdGlvbnMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpLnJhbmdlIHx8IFwiKlwiO1xuICAgICAgfSBjYXRjaCAoZXIpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIGV4cG9ydHMubHRyID0gbHRyO1xuICAgIGZ1bmN0aW9uIGx0cih2ZXJzaW9uLCByYW5nZSwgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIG91dHNpZGUodmVyc2lvbiwgcmFuZ2UsIFwiPFwiLCBvcHRpb25zKTtcbiAgICB9XG4gICAgZXhwb3J0cy5ndHIgPSBndHI7XG4gICAgZnVuY3Rpb24gZ3RyKHZlcnNpb24sIHJhbmdlLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gb3V0c2lkZSh2ZXJzaW9uLCByYW5nZSwgXCI+XCIsIG9wdGlvbnMpO1xuICAgIH1cbiAgICBleHBvcnRzLm91dHNpZGUgPSBvdXRzaWRlO1xuICAgIGZ1bmN0aW9uIG91dHNpZGUodmVyc2lvbiwgcmFuZ2UsIGhpbG8sIG9wdGlvbnMpIHtcbiAgICAgIHZlcnNpb24gPSBuZXcgU2VtVmVyKHZlcnNpb24sIG9wdGlvbnMpO1xuICAgICAgcmFuZ2UgPSBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpO1xuICAgICAgdmFyIGd0Zm4sIGx0ZWZuLCBsdGZuLCBjb21wLCBlY29tcDtcbiAgICAgIHN3aXRjaCAoaGlsbykge1xuICAgICAgICBjYXNlIFwiPlwiOlxuICAgICAgICAgIGd0Zm4gPSBndDtcbiAgICAgICAgICBsdGVmbiA9IGx0ZTtcbiAgICAgICAgICBsdGZuID0gbHQ7XG4gICAgICAgICAgY29tcCA9IFwiPlwiO1xuICAgICAgICAgIGVjb21wID0gXCI+PVwiO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiPFwiOlxuICAgICAgICAgIGd0Zm4gPSBsdDtcbiAgICAgICAgICBsdGVmbiA9IGd0ZTtcbiAgICAgICAgICBsdGZuID0gZ3Q7XG4gICAgICAgICAgY29tcCA9IFwiPFwiO1xuICAgICAgICAgIGVjb21wID0gXCI8PVwiO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ011c3QgcHJvdmlkZSBhIGhpbG8gdmFsIG9mIFwiPFwiIG9yIFwiPlwiJyk7XG4gICAgICB9XG4gICAgICBpZiAoc2F0aXNmaWVzKHZlcnNpb24sIHJhbmdlLCBvcHRpb25zKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpMiA9IDA7IGkyIDwgcmFuZ2Uuc2V0Lmxlbmd0aDsgKytpMikge1xuICAgICAgICB2YXIgY29tcGFyYXRvcnMgPSByYW5nZS5zZXRbaTJdO1xuICAgICAgICB2YXIgaGlnaCA9IG51bGw7XG4gICAgICAgIHZhciBsb3cgPSBudWxsO1xuICAgICAgICBjb21wYXJhdG9ycy5mb3JFYWNoKGZ1bmN0aW9uKGNvbXBhcmF0b3IpIHtcbiAgICAgICAgICBpZiAoY29tcGFyYXRvci5zZW12ZXIgPT09IEFOWSkge1xuICAgICAgICAgICAgY29tcGFyYXRvciA9IG5ldyBDb21wYXJhdG9yKFwiPj0wLjAuMFwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaGlnaCA9IGhpZ2ggfHwgY29tcGFyYXRvcjtcbiAgICAgICAgICBsb3cgPSBsb3cgfHwgY29tcGFyYXRvcjtcbiAgICAgICAgICBpZiAoZ3Rmbihjb21wYXJhdG9yLnNlbXZlciwgaGlnaC5zZW12ZXIsIG9wdGlvbnMpKSB7XG4gICAgICAgICAgICBoaWdoID0gY29tcGFyYXRvcjtcbiAgICAgICAgICB9IGVsc2UgaWYgKGx0Zm4oY29tcGFyYXRvci5zZW12ZXIsIGxvdy5zZW12ZXIsIG9wdGlvbnMpKSB7XG4gICAgICAgICAgICBsb3cgPSBjb21wYXJhdG9yO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChoaWdoLm9wZXJhdG9yID09PSBjb21wIHx8IGhpZ2gub3BlcmF0b3IgPT09IGVjb21wKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgoIWxvdy5vcGVyYXRvciB8fCBsb3cub3BlcmF0b3IgPT09IGNvbXApICYmIGx0ZWZuKHZlcnNpb24sIGxvdy5zZW12ZXIpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGxvdy5vcGVyYXRvciA9PT0gZWNvbXAgJiYgbHRmbih2ZXJzaW9uLCBsb3cuc2VtdmVyKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGV4cG9ydHMucHJlcmVsZWFzZSA9IHByZXJlbGVhc2U7XG4gICAgZnVuY3Rpb24gcHJlcmVsZWFzZSh2ZXJzaW9uLCBvcHRpb25zKSB7XG4gICAgICB2YXIgcGFyc2VkID0gcGFyc2UodmVyc2lvbiwgb3B0aW9ucyk7XG4gICAgICByZXR1cm4gcGFyc2VkICYmIHBhcnNlZC5wcmVyZWxlYXNlLmxlbmd0aCA/IHBhcnNlZC5wcmVyZWxlYXNlIDogbnVsbDtcbiAgICB9XG4gICAgZXhwb3J0cy5pbnRlcnNlY3RzID0gaW50ZXJzZWN0cztcbiAgICBmdW5jdGlvbiBpbnRlcnNlY3RzKHIxLCByMiwgb3B0aW9ucykge1xuICAgICAgcjEgPSBuZXcgUmFuZ2UocjEsIG9wdGlvbnMpO1xuICAgICAgcjIgPSBuZXcgUmFuZ2UocjIsIG9wdGlvbnMpO1xuICAgICAgcmV0dXJuIHIxLmludGVyc2VjdHMocjIpO1xuICAgIH1cbiAgICBleHBvcnRzLmNvZXJjZSA9IGNvZXJjZTtcbiAgICBmdW5jdGlvbiBjb2VyY2UodmVyc2lvbiwgb3B0aW9ucykge1xuICAgICAgaWYgKHZlcnNpb24gaW5zdGFuY2VvZiBTZW1WZXIpIHtcbiAgICAgICAgcmV0dXJuIHZlcnNpb247XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHZlcnNpb24gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgdmVyc2lvbiA9IFN0cmluZyh2ZXJzaW9uKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgdmVyc2lvbiAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgdmFyIG1hdGNoID0gbnVsbDtcbiAgICAgIGlmICghb3B0aW9ucy5ydGwpIHtcbiAgICAgICAgbWF0Y2ggPSB2ZXJzaW9uLm1hdGNoKHJlW3QuQ09FUkNFXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbmV4dDtcbiAgICAgICAgd2hpbGUgKChuZXh0ID0gcmVbdC5DT0VSQ0VSVExdLmV4ZWModmVyc2lvbikpICYmICghbWF0Y2ggfHwgbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGggIT09IHZlcnNpb24ubGVuZ3RoKSkge1xuICAgICAgICAgIGlmICghbWF0Y2ggfHwgbmV4dC5pbmRleCArIG5leHRbMF0ubGVuZ3RoICE9PSBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCkge1xuICAgICAgICAgICAgbWF0Y2ggPSBuZXh0O1xuICAgICAgICAgIH1cbiAgICAgICAgICByZVt0LkNPRVJDRVJUTF0ubGFzdEluZGV4ID0gbmV4dC5pbmRleCArIG5leHRbMV0ubGVuZ3RoICsgbmV4dFsyXS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgcmVbdC5DT0VSQ0VSVExdLmxhc3RJbmRleCA9IC0xO1xuICAgICAgfVxuICAgICAgaWYgKG1hdGNoID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBhcnNlKG1hdGNoWzJdICsgXCIuXCIgKyAobWF0Y2hbM10gfHwgXCIwXCIpICsgXCIuXCIgKyAobWF0Y2hbNF0gfHwgXCIwXCIpLCBvcHRpb25zKTtcbiAgICB9XG4gIH1cbn0pO1xuZXhwb3J0IGRlZmF1bHQgcmVxdWlyZV9zZW12ZXIoKTtcbiIsICIvKlxuICogcGF0Y2gtc3RlcHMtbGliIC0gTGlicmFyeSBmb3IgdGhlIFBhdGNoIFN0ZXBzIHNwZWMuXG4gKlxuICogV3JpdHRlbiBzdGFydGluZyBpbiAyMDE5LlxuICpcbiAqIFRvIHRoZSBleHRlbnQgcG9zc2libGUgdW5kZXIgbGF3LCB0aGUgYXV0aG9yKHMpIGhhdmUgZGVkaWNhdGVkIGFsbCBjb3B5cmlnaHQgYW5kIHJlbGF0ZWQgYW5kIG5laWdoYm9yaW5nIHJpZ2h0cyB0byB0aGlzIHNvZnR3YXJlIHRvIHRoZSBwdWJsaWMgZG9tYWluIHdvcmxkd2lkZS4gVGhpcyBzb2Z0d2FyZSBpcyBkaXN0cmlidXRlZCB3aXRob3V0IGFueSB3YXJyYW50eS5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIENDMCBQdWJsaWMgRG9tYWluIERlZGljYXRpb24gYWxvbmcgd2l0aCB0aGlzIHNvZnR3YXJlLiBJZiBub3QsIHNlZSA8aHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvcHVibGljZG9tYWluL3plcm8vMS4wLz4uXG4gKi9cblxuLyoqXG4gKiBBIGdlbmVyaWMgbWVyZ2UgZnVuY3Rpb24uXG4gKiBOT1RFOiBUaGlzIHNob3VsZCBtYXRjaCBQYXRjaCBTdGVwcyBzcGVjaWZpY2F0aW9uLCBzcGVjaWZpY2FsbHkgaG93IElNUE9SVCBtZXJnaW5nIHdvcmtzLlxuICogQHBhcmFtIGEgVGhlIHZhbHVlIHRvIG1lcmdlIGludG8uXG4gKiBAcGFyYW0gYiBUaGUgdmFsdWUgdG8gbWVyZ2UgZnJvbS5cbiAqIEByZXR1cm5zIGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBob3RvbWVyZ2U8QSwgQj4oYTogQSwgYjogQik6IEEgJiBCIHtcbiAgIGlmIChBcnJheS5pc0FycmF5KGIpKSB7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBiLmxlbmd0aDsgaSsrKVxuICAgICAgICAgIChhIGFzIGFueVtdKS5wdXNoKHBob3RvY29weShiW2ldKSk7XG4gICB9IGVsc2UgaWYgKGIgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgZm9yIChsZXQgayBpbiBiKVxuICAgICAgICAgKGEgYXMgUmVjb3JkPHN0cmluZywgYW55PilbcGhvdG9jb3B5KGspXSA9IHBob3RvY29weSgoYiBhcyBSZWNvcmQ8c3RyaW5nLCBhbnk+KVtrXSk7XG4gICB9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIldlIGNhbid0IGRvIHRoYXQhIC4uLldobydkIGNsZWFuIHVwIHRoZSBtZXNzP1wiKTtcblx0fVxuXHRyZXR1cm4gYSBhcyBBICYgQjtcbn1cblxuLyoqXG4gKiBBIGdlbmVyaWMgY29weSBmdW5jdGlvbi5cbiAqIEBwYXJhbSBvIFRoZSB2YWx1ZSB0byBjb3B5LlxuICogQHJldHVybnMgY29waWVkIHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwaG90b2NvcHk8Tz4obzogTyk6IE8ge1xuXHRpZiAobykge1xuXHRcdGlmIChvLmNvbnN0cnVjdG9yID09PSBBcnJheSlcblx0XHRcdHJldHVybiBwaG90b21lcmdlKFtdLCBvKTtcblx0XHRpZiAoby5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KVxuXHRcdFx0cmV0dXJuIHBob3RvbWVyZ2Uoe30sIG8pO1xuXHR9XG5cdHJldHVybiBvO1xufVxuIiwgImltcG9ydCB7IERlYnVnU3RhdGUgfSBmcm9tICcuL3BhdGNoc3RlcHMtcGF0Y2gnO1xuXG5leHBvcnQgdHlwZSBJbmRleCA9IHN0cmluZyB8IG51bWJlcjtcblxuZXhwb3J0IGludGVyZmFjZSBCYXNlUGF0Y2hTdGVwIHtcbiAgY29tbWVudD86IHN0cmluZztcbn1cblxuZXhwb3J0IG5hbWVzcGFjZSBQYXRjaFN0ZXAge1xuICBleHBvcnQgaW50ZXJmYWNlIEVOVEVSIGV4dGVuZHMgQmFzZVBhdGNoU3RlcCB7XG4gICAgdHlwZTogJ0VOVEVSJztcbiAgICBpbmRleDogSW5kZXggfCBJbmRleFtdO1xuICB9XG5cbiAgZXhwb3J0IGludGVyZmFjZSBFWElUIGV4dGVuZHMgQmFzZVBhdGNoU3RlcCB7XG4gICAgdHlwZTogJ0VYSVQnO1xuICAgIGNvdW50PzogbnVtYmVyO1xuICB9XG5cbiAgZXhwb3J0IGludGVyZmFjZSBTRVRfS0VZIGV4dGVuZHMgQmFzZVBhdGNoU3RlcCB7XG4gICAgdHlwZTogJ1NFVF9LRVknO1xuICAgIGluZGV4OiBJbmRleDtcbiAgICBjb250ZW50PzogdW5rbm93bjtcbiAgfVxuXG4gIGV4cG9ydCBpbnRlcmZhY2UgSU5JVF9LRVkgZXh0ZW5kcyBCYXNlUGF0Y2hTdGVwIHtcbiAgICB0eXBlOiAnSU5JVF9LRVknO1xuICAgIGluZGV4OiBJbmRleDtcbiAgICBjb250ZW50OiB1bmtub3duO1xuICB9XG5cbiAgZXhwb3J0IGludGVyZmFjZSBSRU1PVkVfQVJSQVlfRUxFTUVOVCBleHRlbmRzIEJhc2VQYXRjaFN0ZXAge1xuICAgIHR5cGU6ICdSRU1PVkVfQVJSQVlfRUxFTUVOVCc7XG4gICAgaW5kZXg6IG51bWJlcjtcbiAgfVxuXG4gIGV4cG9ydCBpbnRlcmZhY2UgQUREX0FSUkFZX0VMRU1FTlQgZXh0ZW5kcyBCYXNlUGF0Y2hTdGVwIHtcbiAgICB0eXBlOiAnQUREX0FSUkFZX0VMRU1FTlQnO1xuICAgIGluZGV4PzogbnVtYmVyO1xuICAgIGNvbnRlbnQ6IHVua25vd247XG4gIH1cblxuICBleHBvcnQgaW50ZXJmYWNlIElNUE9SVCBleHRlbmRzIEJhc2VQYXRjaFN0ZXAge1xuICAgIHR5cGU6ICdJTVBPUlQnO1xuICAgIHNyYzogc3RyaW5nO1xuICAgIHBhdGg/OiBJbmRleFtdO1xuICAgIGluZGV4PzogSW5kZXg7XG4gIH1cblxuICBleHBvcnQgaW50ZXJmYWNlIElOQ0xVREUgZXh0ZW5kcyBCYXNlUGF0Y2hTdGVwIHtcbiAgICB0eXBlOiAnSU5DTFVERSc7XG4gICAgc3JjOiBzdHJpbmc7XG4gIH1cblxuICBleHBvcnQgaW50ZXJmYWNlIEZPUl9JTiBleHRlbmRzIEJhc2VQYXRjaFN0ZXAge1xuICAgIHR5cGU6ICdGT1JfSU4nO1xuICAgIHZhbHVlczogdW5rbm93bltdIHwgQXJyYXk8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+O1xuICAgIGtleXdvcmQ6IHN0cmluZyB8IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gICAgYm9keTogQW55UGF0Y2hTdGVwW107XG4gIH1cblxuICBleHBvcnQgaW50ZXJmYWNlIENPUFkgZXh0ZW5kcyBCYXNlUGF0Y2hTdGVwIHtcbiAgICB0eXBlOiAnQ09QWSc7XG4gICAgYWxpYXM6IHN0cmluZztcbiAgfVxuXG4gIGV4cG9ydCBpbnRlcmZhY2UgUEFTVEUgZXh0ZW5kcyBCYXNlUGF0Y2hTdGVwIHtcbiAgICB0eXBlOiAnUEFTVEUnO1xuICAgIGFsaWFzOiBzdHJpbmc7XG4gICAgaW5kZXg/OiBJbmRleDtcbiAgfVxuXG4gIGV4cG9ydCBpbnRlcmZhY2UgQ09NTUVOVCBleHRlbmRzIEJhc2VQYXRjaFN0ZXAge1xuICAgIHR5cGU6ICdDT01NRU5UJztcbiAgICB2YWx1ZTogdW5rbm93bjtcbiAgfVxuXG4gIGV4cG9ydCBpbnRlcmZhY2UgREVCVUcgZXh0ZW5kcyBCYXNlUGF0Y2hTdGVwIHtcbiAgICB0eXBlOiAnREVCVUcnO1xuICAgIHZhbHVlOiBib29sZWFuO1xuICB9XG5cbiAgZXhwb3J0IGludGVyZmFjZSBNRVJHRV9DT05URU5UIGV4dGVuZHMgQmFzZVBhdGNoU3RlcCB7XG4gICAgdHlwZTogJ01FUkdFX0NPTlRFTlQnO1xuICAgIGNvbnRlbnQ6IHVua25vd247XG4gIH1cblxuICBleHBvcnQgaW50ZXJmYWNlIENBTEwgZXh0ZW5kcyBCYXNlUGF0Y2hTdGVwIHtcbiAgICB0eXBlOiAnQ0FMTCc7XG4gICAgaWQ6IHN0cmluZztcbiAgICBhcmdzOiB1bmtub3duO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGF0Y2hTdGVwc1JlZ2lzdHJ5IHtcbiAgRU5URVI6IFBhdGNoU3RlcC5FTlRFUjtcbiAgRVhJVDogUGF0Y2hTdGVwLkVYSVQ7XG4gIFNFVF9LRVk6IFBhdGNoU3RlcC5TRVRfS0VZO1xuICBJTklUX0tFWTogUGF0Y2hTdGVwLklOSVRfS0VZO1xuICBSRU1PVkVfQVJSQVlfRUxFTUVOVDogUGF0Y2hTdGVwLlJFTU9WRV9BUlJBWV9FTEVNRU5UO1xuICBBRERfQVJSQVlfRUxFTUVOVDogUGF0Y2hTdGVwLkFERF9BUlJBWV9FTEVNRU5UO1xuICBJTVBPUlQ6IFBhdGNoU3RlcC5JTVBPUlQ7XG4gIElOQ0xVREU6IFBhdGNoU3RlcC5JTkNMVURFO1xuICBGT1JfSU46IFBhdGNoU3RlcC5GT1JfSU47XG4gIENPUFk6IFBhdGNoU3RlcC5DT1BZO1xuICBQQVNURTogUGF0Y2hTdGVwLlBBU1RFO1xuICBDT01NRU5UOiBQYXRjaFN0ZXAuQ09NTUVOVDtcbiAgREVCVUc6IFBhdGNoU3RlcC5ERUJVRztcbiAgTUVSR0VfQ09OVEVOVDogUGF0Y2hTdGVwLk1FUkdFX0NPTlRFTlQ7XG4gIENBTEw6IFBhdGNoU3RlcC5DQUxMO1xufVxuXG5leHBvcnQgdHlwZSBBbnlQYXRjaFN0ZXAgPSBFeHRyYWN0PFBhdGNoU3RlcHNSZWdpc3RyeVtrZXlvZiBQYXRjaFN0ZXBzUmVnaXN0cnldLCBCYXNlUGF0Y2hTdGVwPjtcbmV4cG9ydCB0eXBlIFBhdGNoRmlsZSA9IEFueVBhdGNoU3RlcFtdIHwgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbmV4cG9ydCB0eXBlIFBhcnNlZFBhdGggPSBudWxsIHwgW2Zyb21HYW1lOiB0cnVlIHwgZmFsc2UgfCBzdHJpbmcsIHVybDogc3RyaW5nXTtcblxuaW50ZXJmYWNlIFN0YXRlIHt9XG5cbi8vIFRoZSBmb2xsb3dpbmcgYXJlIGRlZmluaXRpb25zIHVzZWQgZm9yIHJlZmVyZW5jZSBpbiBEZWJ1Z1N0YXRlLlxuLypcbiAqIFBhcnNlZFBhdGggaXMgYWN0dWFsbHkgYW55IHR5cGUgdGhhdCB0cmFuc2xhdGVQYXJzZWRQYXRoIGNhbiB1bmRlcnN0YW5kLlxuICogQW5kIHRyYW5zbGF0ZVBhcnNlZFBhdGggY2FuIGJlIG92ZXJyaWRkZW4gYnkgdGhlIHVzZXIuXG4gKiBCdXQgdGhlIHR5cGVzIGRlY2xhcmVkIGhlcmUgYXJlIHRob3NlIHRoYXQgd2lsbCBiZSByZWNlaXZlZCBubyBtYXR0ZXIgd2hhdC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBGaWxlSW5mbyB7XG4gIHBhdGg6IHN0cmluZztcbiAgc3RhY2s6IFN0YWNrRW50cnlbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdGFja0VudHJ5RXJyb3Ige1xuICB0eXBlOiAnRXJyb3InO1xuICBlcnJvclR5cGU6IHN0cmluZztcbiAgZXJyb3JNZXNzYWdlOiBzdHJpbmc7XG59XG5leHBvcnQgaW50ZXJmYWNlIFN0YWNrRW50cnlTdGVwIHtcbiAgdHlwZTogJ1N0ZXAnO1xuICBpbmRleDogSW5kZXg7XG4gIG5hbWU6IHN0cmluZztcbn1cbmV4cG9ydCB0eXBlIFN0YWNrRW50cnkgPSBTdGFja0VudHJ5U3RlcCB8IFN0YWNrRW50cnlFcnJvcjtcblxuZXhwb3J0IHR5cGUgTG9hZGVyID0gKGZyb21HYW1lOiBib29sZWFuIHwgc3RyaW5nLCBwYXRoOiBzdHJpbmcpID0+IFByb21pc2U8dW5rbm93bj47XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBwbGllclN0YXRlIHtcbiAgY3VycmVudFZhbHVlOiB1bmtub3duO1xuICBzdGFjazogU3RhY2tFbnRyeVtdO1xuICBjbG9uZU1hcDogTWFwPHN0cmluZywgdW5rbm93bj47XG4gIGxvYWRlcjogTG9hZGVyO1xuICBkZWJ1Z1N0YXRlOiBEZWJ1Z1N0YXRlO1xuICBkZWJ1ZzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IHR5cGUgQXBwbGllcjxUIGV4dGVuZHMgQmFzZVBhdGNoU3RlcD4gPSAodGhpczogVCwgc3RhdGU6IEFwcGxpZXJTdGF0ZSkgPT4gUHJvbWlzZTx2b2lkPjtcbmV4cG9ydCB0eXBlIEFwcGxpZXJzID0ge1xuICBbSyBpbiBrZXlvZiBQYXRjaFN0ZXBzUmVnaXN0cnldOiBBcHBsaWVyPFBhdGNoU3RlcHNSZWdpc3RyeVtLXT47XG59O1xuXG5leHBvcnQgdHlwZSBEaWZmQ29yZSA9IChhOiB1bmtub3duLCBiOiB1bmtub3duLCBzZXR0aW5nczogRGlmZlNldHRpbmdzKSA9PiBBbnlQYXRjaFN0ZXBbXSB8IG51bGw7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlmZlNldHRpbmdzIHtcbiAgYXJyYXlUcnVseURpZmZlcmVudFRocmVzaG9sZDogbnVtYmVyO1xuICB0cnVseURpZmZlcmVudFRocmVzaG9sZDogbnVtYmVyO1xuICBhcnJheUxvb2thaGVhZDogbnVtYmVyO1xuICBkaWZmQWRkTmV3S2V5OiBudW1iZXI7XG4gIGRpZmZBZGREZWxLZXk6IG51bWJlcjtcbiAgZGlmZk11bFNhbWVLZXk6IG51bWJlcjtcblxuICBkaWZmQ29yZTogRGlmZkNvcmU7XG4gIGNvbW1lbnQ/OiBzdHJpbmc7XG4gIGNvbW1lbnRWYWx1ZT86IHN0cmluZztcbiAgcGF0aDogSW5kZXhbXTtcbiAgb3B0aW1pemU6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnNhZmVBc3NlcnQ8VD4odmFsOiBhbnkpOiBhc3NlcnRzIHZhbCBpcyBUIHt9XG4iLCAiLy8gaW1wb3J0IHtBbnlQYXRjaFN0ZXB9IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQgeyBBbnlQYXRjaFN0ZXAgfSBmcm9tICd1bHRpbWF0ZS1jcm9zc2NvZGUtdHlwZWRlZnMvcGF0Y2gtc3RlcHMtbGliJztcblxuZXhwb3J0IGNsYXNzIFN0ZXBNYWNoaW5lIHtcbiAgc3RlcHM6IEFueVBhdGNoU3RlcFtdO1xuICBzaTogbnVtYmVyO1xuICBmaW5pc2hlZDogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihzdGVwczogQW55UGF0Y2hTdGVwW10pIHtcbiAgICB0aGlzLnN0ZXBzID0gc3RlcHM7XG4gICAgdGhpcy5zaSA9IDA7XG4gICAgdGhpcy5maW5pc2hlZCA9IGZhbHNlO1xuICB9XG5cbiAgKnJ1bigpOiBHZW5lcmF0b3I8W251bWJlciwgQW55UGF0Y2hTdGVwXSwgdm9pZD4ge1xuICAgIHdoaWxlICh0aGlzLnNpIDwgdGhpcy5zdGVwcy5sZW5ndGgpIHtcbiAgICAgIHlpZWxkIFt0aGlzLnNpLCB0aGlzLnN0ZXBzW3RoaXMuc2ldXTtcbiAgICAgIGlmICh0aGlzLmZpbmlzaGVkKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgdGhpcy5zaSsrO1xuICAgIH1cbiAgfVxuXG4gIGFkZFN0ZXBzKG5ld1N0ZXBzOiBBbnlQYXRjaFN0ZXBbXSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KG5ld1N0ZXBzKSkge1xuICAgICAgdGhpcy5zdGVwcyA9IHRoaXMuc3RlcHMuY29uY2F0KG5ld1N0ZXBzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdGVwcy5wdXNoKG5ld1N0ZXBzKTtcbiAgICB9XG4gIH1cblxuICBleGl0KCkge1xuICAgIHRoaXMuZmluaXNoZWQgPSB0cnVlO1xuICB9XG5cbiAgZ290b0xhYmVsKGxhYmVsTmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgbGFiZWxJbmRleCA9IHRoaXMuZmluZExhYmVsSW5kZXgobGFiZWxOYW1lKTtcbiAgICBpZiAobGFiZWxJbmRleCA9PSAtMSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLnNldFN0ZXBJbmRleChsYWJlbEluZGV4KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHNldFN0ZXBJbmRleChuZXdTdGVwSW5kZXg6IG51bWJlcikge1xuICAgIGlmIChuZXdTdGVwSW5kZXggPCAwIHx8IHRoaXMuc3RlcHMubGVuZ3RoIDw9IG5ld1N0ZXBJbmRleCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLnNpID0gbmV3U3RlcEluZGV4O1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZ2V0Q3VycmVudFN0ZXAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RlcHNbdGhpcy5zaV07XG4gIH1cblxuICBnZXRTdGVwSW5kZXgoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2k7XG4gIH1cblxuICBmaW5kTGFiZWxJbmRleChsYWJlbE5hbWU6IHN0cmluZykge1xuICAgIGxldCBzdGVwSW5kZXggPSAtMTtcblxuICAgIGZvciAoY29uc3QgW2luZGV4LCBzdGVwXSBvZiB0aGlzLnN0ZXBzLmVudHJpZXMoKSkge1xuICAgICAgaWYgKHN0ZXBbJ3R5cGUnXSAhPT0gJ0xBQkVMJykge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmIChzdGVwWyduYW1lJ10gPT0gbGFiZWxOYW1lKSB7XG4gICAgICAgIHN0ZXBJbmRleCA9IGluZGV4O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3RlcEluZGV4O1xuICB9XG59XG4iLCAiLypcbiAqIHBhdGNoLXN0ZXBzLWxpYiAtIExpYnJhcnkgZm9yIHRoZSBQYXRjaCBTdGVwcyBzcGVjLlxuICpcbiAqIFdyaXR0ZW4gc3RhcnRpbmcgaW4gMjAxOS5cbiAqXG4gKiBDcmVkaXRzOlxuICogIE1haW4gY29kZSBieSAyMGtkY1xuICogIFVSTC1zdHlsZSBmaWxlIHBhdGhzLCBGT1JfSU4sIENPUFksIFBBU1RFLCBlcnJvciB0cmFja2luZywgYnVnaHVudGluZyBieSBhYzJwaWNcbiAqICBFdmVuIG1vcmUgYnVnaHVudGluZyBieSBhYzJwaWNcbiAqXG4gKiBUbyB0aGUgZXh0ZW50IHBvc3NpYmxlIHVuZGVyIGxhdywgdGhlIGF1dGhvcihzKSBoYXZlIGRlZGljYXRlZCBhbGwgY29weXJpZ2h0IGFuZCByZWxhdGVkIGFuZCBuZWlnaGJvcmluZyByaWdodHMgdG8gdGhpcyBzb2Z0d2FyZSB0byB0aGUgcHVibGljIGRvbWFpbiB3b3JsZHdpZGUuIFRoaXMgc29mdHdhcmUgaXMgZGlzdHJpYnV0ZWQgd2l0aG91dCBhbnkgd2FycmFudHkuXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBDQzAgUHVibGljIERvbWFpbiBEZWRpY2F0aW9uIGFsb25nIHdpdGggdGhpcyBzb2Z0d2FyZS4gSWYgbm90LCBzZWUgPGh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL3B1YmxpY2RvbWFpbi96ZXJvLzEuMC8+LlxuICovXG5cbmltcG9ydCB7IHBob3RvY29weSwgcGhvdG9tZXJnZSB9IGZyb20gJy4vcGF0Y2hzdGVwcy11dGlscyc7XG5pbXBvcnQge1xuICBBbnlQYXRjaFN0ZXAsXG4gIEZpbGVJbmZvLFxuICBJbmRleCxcbiAgTG9hZGVyLFxuICBQYXJzZWRQYXRoLFxuICBQYXRjaEZpbGUsXG4gIFBhdGNoU3RlcCxcbiAgU3RhY2tFbnRyeSxcbn0gZnJvbSAndWx0aW1hdGUtY3Jvc3Njb2RlLXR5cGVkZWZzL3BhdGNoLXN0ZXBzLWxpYic7XG5pbXBvcnQgeyBBcHBsaWVyLCBBcHBsaWVycywgQXBwbGllclN0YXRlLCB1bnNhZmVBc3NlcnQgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IFN0ZXBNYWNoaW5lIH0gZnJvbSAnLi9wYXRjaHN0ZXBzLXN0ZXBtYWNoaW5lJztcblxuLy8gRXJyb3IgaGFuZGxpbmcgZm9yIGFwcGxpZXJzLlxuLy8gWW91IGFyZSBleHBlY3RlZCB0byBzdWJjbGFzcyB0aGlzIGNsYXNzIGlmIHlvdSB3YW50IGFkZGl0aW9uYWwgZnVuY3Rpb25hbGl0eS5cbmV4cG9ydCBjbGFzcyBEZWJ1Z1N0YXRlIHtcbiAgZmlsZVN0YWNrOiBGaWxlSW5mb1tdO1xuICBjdXJyZW50RmlsZTogRmlsZUluZm8gfCBudWxsO1xuXG4gIC8vIFRoZSBjb25zdHJ1Y3Rvci4gVGhlIGRlZmF1bHQgc3RhdGUgb2YgYSBEZWJ1Z1N0YXRlIGlzIGludmFsaWQ7IGEgZmlsZSBtdXN0IGJlIGFkZGVkIChldmVuIGlmIG51bGwpIHRvIG1ha2UgaXQgdmFsaWQuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZmlsZVN0YWNrID0gW107XG4gICAgdGhpcy5jdXJyZW50RmlsZSA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNsYXRlcyBhIFBhcnNlZFBhdGggaW50byBhIHN0cmluZy5cbiAgICogT3ZlcnJpZGFibGUuXG4gICAqL1xuICB0cmFuc2xhdGVQYXJzZWRQYXRoKHBhcnNlZFBhdGg6IFBhcnNlZFBhdGggfCBudWxsKTogc3RyaW5nIHtcbiAgICBpZiAocGFyc2VkUGF0aCA9PT0gbnVsbCkgcmV0dXJuICcodW5rbm93biBmaWxlKSc7XG4gICAgLy8gQnkgZGVmYXVsdCwgd2Uga25vdyBub3RoaW5nLlxuICAgIC8vIHNlZTogcGFyc2VQYXRoLCBsb2FkZXIncyBkZWZpbml0aW9uXG4gICAgbGV0IHByb3RvY29sID0gcGFyc2VkUGF0aFswXS50b1N0cmluZygpO1xuICAgIGlmIChwYXJzZWRQYXRoWzBdID09PSB0cnVlKSB7XG4gICAgICBwcm90b2NvbCA9ICdnYW1lJztcbiAgICB9IGVsc2UgaWYgKHBhcnNlZFBhdGhbMF0gPT09IGZhbHNlKSB7XG4gICAgICBwcm90b2NvbCA9ICdtb2QnO1xuICAgIH1cbiAgICByZXR1cm4gcHJvdG9jb2wgKyAnOicgKyBwYXJzZWRQYXRoWzFdO1xuICB9XG5cbiAgLyoqXG4gICAqIEVudGVycyBhIGZpbGUgYnkgcGFyc2VkUGF0aC4gRG8gbm90IG92ZXJyaWRlLlxuICAgKiBAZmluYWxcbiAgICovXG4gIGFkZEZpbGUocGFyc2VkUGF0aDogUGFyc2VkUGF0aCk6IHZvaWQge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnRyYW5zbGF0ZVBhcnNlZFBhdGgocGFyc2VkUGF0aCk7XG4gICAgY29uc3QgZmlsZUluZm8gPSB7XG4gICAgICBwYXRoLFxuICAgICAgc3RhY2s6IFtdLFxuICAgIH07XG4gICAgdGhpcy5jdXJyZW50RmlsZSA9IGZpbGVJbmZvO1xuICAgIHRoaXMuZmlsZVN0YWNrLnB1c2goZmlsZUluZm8pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBwdXNoZWQgZmlsZS5cbiAgICogQGZpbmFsXG4gICAqL1xuICByZW1vdmVMYXN0RmlsZSgpOiBGaWxlSW5mbyB7XG4gICAgY29uc3QgbGFzdEZpbGUgPSB0aGlzLmZpbGVTdGFjay5wb3AoKTtcbiAgICB0aGlzLmN1cnJlbnRGaWxlID0gdGhpcy5maWxlU3RhY2tbdGhpcy5maWxlU3RhY2subGVuZ3RoIC0gMV07XG4gICAgcmV0dXJuIGxhc3RGaWxlITtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbnRlcnMgYSBzdGVwLiBOb3RlIHRoYXQgY2FsbHMgdG8gdGhpcyAqc3Vycm91bmQqIGFwcGx5U3RlcCBhcyB0aGUgaW5kZXggaXMgbm90IGF2YWlsYWJsZSB0byBpdC5cbiAgICogQGZpbmFsXG4gICAqL1xuICBhZGRTdGVwKGluZGV4OiBJbmRleCwgbmFtZSA9ICcnLCBmdW5jdGlvbk5hbWUgPSAnJyk6IHZvaWQge1xuICAgIHRoaXMuY3VycmVudEZpbGUhLnN0YWNrLnB1c2goe1xuICAgICAgdHlwZTogJ1N0ZXAnLFxuICAgICAgaW5kZXgsXG4gICAgICBuYW1lLFxuICAgICAgZnVuY3Rpb25OYW1lLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIExlYXZlcyBhIHN0ZXAuXG4gICAqIEBmaW5hbFxuICAgKi9cbiAgcmVtb3ZlTGFzdFN0ZXAoKTogU3RhY2tFbnRyeS5TdGVwIHtcbiAgICBjb25zdCBzdGFjayA9IHRoaXMuY3VycmVudEZpbGUhLnN0YWNrO1xuICAgIGxldCBjdXJyZW50U3RlcDogU3RhY2tFbnRyeS5TdGVwIHwgbnVsbCA9IG51bGw7XG4gICAgZm9yIChsZXQgaW5kZXggPSBzdGFjay5sZW5ndGggLSAxOyBpbmRleCA+PSAwOyBpbmRleC0tKSB7XG4gICAgICBjb25zdCBlbnRyeSA9IHN0YWNrW2luZGV4XTtcbiAgICAgIGlmIChlbnRyeS50eXBlID09PSAnU3RlcCcpIHtcbiAgICAgICAgY3VycmVudFN0ZXAgPSBlbnRyeTtcbiAgICAgICAgc3RhY2suc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgaW5kZXggPSAtMTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGN1cnJlbnRTdGVwITtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBsYXN0IChpLmUuIGN1cnJlbnQpIHN0ZXAuXG4gICAqIEBmaW5hbFxuICAgKi9cbiAgZ2V0TGFzdFN0ZXAoKTogU3RhY2tFbnRyeS5TdGVwIHtcbiAgICBjb25zdCBzdGFjayA9IHRoaXMuY3VycmVudEZpbGUhLnN0YWNrO1xuICAgIGxldCBjdXJyZW50U3RlcDogU3RhY2tFbnRyeS5TdGVwIHwgbnVsbCA9IG51bGw7XG4gICAgZm9yIChsZXQgaW5kZXggPSBzdGFjay5sZW5ndGggLSAxOyBpbmRleCA+PSAwOyBpbmRleC0tKSB7XG4gICAgICBjb25zdCBlbnRyeSA9IHN0YWNrW2luZGV4XTtcbiAgICAgIGlmIChlbnRyeS50eXBlID09PSAnU3RlcCcpIHtcbiAgICAgICAgY3VycmVudFN0ZXAgPSBlbnRyeTtcbiAgICAgICAgaW5kZXggPSAtMTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGN1cnJlbnRTdGVwITtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaHJvd3MgdGhpcyBpbnN0YW5jZSBhcyBhbiBlcnJvci5cbiAgICogQGZpbmFsXG4gICAqL1xuICB0aHJvd0Vycm9yKHR5cGU6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5jdXJyZW50RmlsZSEuc3RhY2sucHVzaCh7XG4gICAgICB0eXBlOiAnRXJyb3InLFxuICAgICAgZXJyb3JUeXBlOiB0eXBlLFxuICAgICAgZXJyb3JNZXNzYWdlOiBtZXNzYWdlLFxuICAgIH0pO1xuICAgIHRocm93IHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUHJpbnRzIGluZm9ybWF0aW9uIGFib3V0IGEgc3BlY2lmaWMgZmlsZSBvbiB0aGUgc3RhY2suXG4gICAqIE92ZXJyaWRhYmxlLlxuICAgKi9cbiAgcHJpbnRGaWxlSW5mbyhmaWxlOiBGaWxlSW5mbyk6IHZvaWQge1xuICAgIGNvbnNvbGUubG9nKGBGaWxlICVjJHtmaWxlLnBhdGh9YCwgJ3JlZCcpO1xuICAgIGxldCBtZXNzYWdlID0gJyc7XG4gICAgY29uc3Qgc3RhY2sgPSBmaWxlLnN0YWNrO1xuICAgIGZvciAobGV0IGkgPSBzdGFjay5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgY29uc3Qgc3RlcCA9IHN0YWNrW2ldO1xuICAgICAgc3dpdGNoIChzdGVwLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnRXJyb3InOlxuICAgICAgICAgIG1lc3NhZ2UgKz0gYCR7c3RlcC5lcnJvclR5cGV9OiAke3N0ZXAuZXJyb3JNZXNzYWdlfVxcbmA7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ1N0ZXAnOlxuICAgICAgICAgIG1lc3NhZ2UgKz0gJ1xcdFxcdFxcdGF0ICc7XG5cbiAgICAgICAgICBpZiAoc3RlcC5uYW1lKSB7XG4gICAgICAgICAgICBtZXNzYWdlICs9IGAke3N0ZXAubmFtZX0gYDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHN0ZXAuZnVuY3Rpb25OYW1lKSB7XG4gICAgICAgICAgICBtZXNzYWdlICs9IGAoc3RlcCAke3N0ZXAuZnVuY3Rpb25OYW1lfToke3N0ZXAuaW5kZXh9KVxcbmA7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1lc3NhZ2UgKz0gYChzdGVwICR7c3RlcC5pbmRleH0pXFxuYDtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByaW50cyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgd2hvbGUgc3RhY2suXG4gICAqIEBmaW5hbFxuICAgKi9cbiAgcHJpbnQoKTogdm9pZCB7XG4gICAgZm9yIChsZXQgZmlsZUluZGV4ID0gMDsgZmlsZUluZGV4IDwgdGhpcy5maWxlU3RhY2subGVuZ3RoOyBmaWxlSW5kZXgrKykge1xuICAgICAgdGhpcy5wcmludEZpbGVJbmZvKHRoaXMuZmlsZVN0YWNrW2ZpbGVJbmRleF0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4gYXQgdGhlIHN0YXJ0IG9mIGFwcGx5U3RlcDsgYWZ0ZXIgdGhlIHN0ZXAgaGFzIGJlZW4gZW50ZXJlZCBmb3JtYWxseSwgYnV0IGJlZm9yZSBleGVjdXRpbmcgaXQuXG4gICAqIE92ZXJyaWRhYmxlLlxuICAgKi9cbiAgYXN5bmMgYmVmb3JlU3RlcCgpOiBQcm9taXNlPHZvaWQ+IHt9XG5cbiAgLyoqXG4gICAqIFJ1biBhdCB0aGUgZW5kIG9mIGFwcGx5U3RlcDsgYWZ0ZXIgZXhlY3V0aW5nIHRoZSBzdGVwLCBidXQgYmVmb3JlIGxlYXZpbmcgaXQgZm9ybWFsbHkuXG4gICAqIE92ZXJyaWRhYmxlLlxuICAgKi9cbiAgYXN5bmMgYWZ0ZXJTdGVwKCk6IFByb21pc2U8dm9pZD4ge31cbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdGF0ZSB7XG4gIGN1cnJlbnRWYWx1ZTogdW5rbm93bjtcbiAgc3RhY2s6IHVua25vd25bXTtcbiAgZGVidWdTdGF0ZTogRGVidWdTdGF0ZTtcbiAgZGVidWc6IGJvb2xlYW47XG59XG5cbi8qKlxuICogQSB1c2VyIGRlZmluZWQgc3RlcCB0aGF0IGlzIGRpc3Rpbmd1aXNoYWJsZSBmcm9tIGJ1aWx0aW4gUGF0Y2hTdGVwcy5cbiAqIEVycm9ycyB0aGF0IG9jY3VyIGluIGNhbGxhYmxlcyBhcmUgbm90IGhhbmRsZWQgYnkgdGhlIFBhdGNoU3RlcHMgaW50ZXJwcmV0ZXIuXG4gKi9cbmV4cG9ydCB0eXBlIENhbGxhYmxlID0gKHN0YXRlOiBTdGF0ZSwgYXJnczogdW5rbm93bikgPT4gUHJvbWlzZTx2b2lkPjtcblxuZXhwb3J0IGNvbnN0IGNhbGxhYmxlcyA9IG5ldyBNYXA8c3RyaW5nLCBDYWxsYWJsZT4oKTtcblxuLy8gQ3VzdG9tIGV4dGVuc2lvbnMgYXJlIHJlZ2lzdGVyZWQgaGVyZS5cbi8vIFRoZWlyICd0aGlzJyBpcyB0aGUgU3RlcCwgdGhleSBhcmUgcGFzc2VkIHRoZSBzdGF0ZSwgYW5kIHRoZXkgYXJlIGV4cGVjdGVkIHRvIHJldHVybiBhIFByb21pc2UuXG4vLyBJbiBwcmFjdGljZSB0aGlzIGlzIGRvbmUgd2l0aCBhc3luYyBvbGQtc3R5bGUgZnVuY3Rpb25zLlxuZXhwb3J0IGNvbnN0IGFwcGxpZXJzID0ge30gYXMgQXBwbGllcnM7XG5cbi8qXG4gKiBAcGFyYW0gYSBUaGUgb2JqZWN0IHRvIG1vZGlmeVxuICogQHBhcmFtIHN0ZXBzIFRoZSBwYXRjaCwgZnJlc2ggZnJvbSB0aGUgSlNPTi4gQ2FuIGJlIGluIGxlZ2FjeSBvciBQYXRjaCBTdGVwcyBmb3JtYXQuXG4gKiBAcGFyYW0gbG9hZGVyIFRoZSBsb2FkaW5nIGZ1bmN0aW9uLlxuICogIE5PVEUhIElGIENIQU5HSU5HIFRISVMsIEtFRVAgSU4gTUlORCBERUJVR1NUQVRFIHRyYW5zbGF0ZVBhdGggR0VUUyBBUkdVTUVOVFMgQVJSQVkgT0YgVEhJUy5cbiAqICBBTFNPIEtFRVAgSU4gTUlORCBUSEUgcGFyc2VQYXRoIEZVTkNUSU9OIVxuICogIEZvciBmcm9tR2FtZTogZmFsc2UgdGhpcyBnZXRzIGEgZmlsZSBzdHJhaWdodCBmcm9tIHRoZSBtb2QsIHN1Y2ggYXMgXCJwYWNrYWdlLmpzb25cIi5cbiAqICBGb3IgZnJvbUdhbWU6IHRydWUgdGhpcyBnZXRzIGEgZmlsZSBmcm9tIHRoZSBnYW1lLCB3aGljaCBpcyBwYXRjaGVkIGJ5IHRoZSBob3N0IGlmIHJlbGV2YW50LlxuICogIElmIHRoZSBQYXRjaFN0ZXBzIGZpbGUgcGFzc2VzIGEgcHJvdG9jb2wgdGhhdCBpcyBub3QgdW5kZXJzdG9vZCwgdGhlbiwgYW5kIG9ubHkgdGhlbiwgd2lsbCBhIHN0cmluZyBiZSBwYXNzZWQgKHdpdGhvdXQgdGhlIFwiOlwiIGF0IHRoZSBlbmQpXG4gKiAgSW4gdGhpcyBjYXNlLCBmcm9tR2FtZSBpcyBzZXQgdG8gdGhhdCBzdHJpbmcsIGluc3RlYWQuXG4gKiBAcGFyYW0gZGVidWdTdGF0ZSBUaGUgRGVidWdTdGF0ZSBzdGFjayB0cmFjZXIuXG4gKiAgSWYgbm90IGdpdmVuLCB3aWxsIGJlIGNyZWF0ZWQuIFlvdSBuZWVkIHRvIHBhc3MgeW91ciBvd24gaW5zdGFuY2Ugb2YgdGhpcyB0byBoYXZlIHByb3BlciBmaWxlbmFtZSB0cmFja2luZy5cbiAqIEByZXR1cm4gQSBQcm9taXNlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwYXRjaChhOiB1bmtub3duLCBzdGVwczogUGF0Y2hGaWxlLCBsb2FkZXI6IExvYWRlciwgZGVidWdTdGF0ZT86IERlYnVnU3RhdGUpIHtcbiAgaWYgKCFkZWJ1Z1N0YXRlKSB7XG4gICAgZGVidWdTdGF0ZSA9IG5ldyBEZWJ1Z1N0YXRlKCk7XG4gICAgZGVidWdTdGF0ZS5hZGRGaWxlKG51bGwpO1xuICB9XG4gIGlmIChzdGVwcy5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgdW5zYWZlQXNzZXJ0PFJlY29yZDxzdHJpbmcsIE9iamVjdCAmIFJlY29yZDxzdHJpbmcsIHVua25vd24+Pj4oc3RlcHMpO1xuICAgIHVuc2FmZUFzc2VydDxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4oYSk7XG5cbiAgICAvLyBTdGFuZGFyZGl6ZWQgTW9kcyBzcGVjaWZpY2F0aW9uXG4gICAgZm9yIChsZXQgayBpbiBzdGVwcykge1xuICAgICAgLy8gU3dpdGNoZWQgYmFjayB0byBhIGxpdGVyYWwgdHJhbnNsYXRpb24gaW4gMS4wLjIgdG8gbWFrZSBpdCBtYWtlIHNlbnNlIHdpdGggc3BlYywgaXQncyBtb3JlIGF3a3dhcmQgYnV0IHNpbXBsZXIuXG4gICAgICAvLyBhYzJwaWMgdGhvdWdodCB1cCB0aGUgXCJjaGVjayBmb3IgdHJ1dGh5XCIgcmVnYXJkaW5nIHN0ZXBzW2tdLmNvbnN0cnVjdG9yXG4gICAgICBpZiAoYVtrXSA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGFba10gPSBzdGVwc1trXTsgLy8gMS5cbiAgICAgIH0gZWxzZSBpZiAoc3RlcHNba10gJiYgc3RlcHNba10uY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICAvLyBzdGVwc1trXSBpcyBPYmplY3QsIHNvIHRoaXMgd29uJ3QgZXNjYXBlIHRoZSBTdGFuZGFyZGl6ZWQgTW9kcyB2ZXJzaW9uIG9mIHBhdGNoaW5nXG4gICAgICAgIGF3YWl0IHBhdGNoKGFba10sIHN0ZXBzW2tdLCBsb2FkZXIsIGRlYnVnU3RhdGUpOyAvLyAyLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYVtrXSA9IHN0ZXBzW2tdOyAvLyAzLlxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm47XG4gIH1cbiAgdW5zYWZlQXNzZXJ0PEFueVBhdGNoU3RlcFtdPihzdGVwcyk7XG4gIGNvbnN0IHN0YXRlID0ge1xuICAgIGN1cnJlbnRWYWx1ZTogYSxcbiAgICBzdGFjazogW10sXG4gICAgc3RlcE1hY2hpbmU6IG5ldyBTdGVwTWFjaGluZShzdGVwcyksXG4gICAgY2xvbmVNYXA6IG5ldyBNYXAoKSxcbiAgICBsb2FkZXI6IGxvYWRlcixcbiAgICBkZWJ1Z1N0YXRlOiBkZWJ1Z1N0YXRlLFxuICAgIGRlYnVnOiBmYWxzZSxcbiAgICBtZW1vcnk6IHt9LFxuICAgIGZ1bmN0aW9uTmFtZTogJycsXG4gICAgc3RlcFJlZmVyZW5jZUluZGV4OiAwLFxuICB9O1xuICBmb3IgKGNvbnN0IFthYnNvbHV0ZVN0ZXBJbmRleCwgc3RlcF0gb2Ygc3RhdGUuc3RlcE1hY2hpbmUucnVuKCkpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc3RlcEluZGV4ID0gYWJzb2x1dGVTdGVwSW5kZXggLSBzdGF0ZS5zdGVwUmVmZXJlbmNlSW5kZXg7XG4gICAgICBkZWJ1Z1N0YXRlLmFkZFN0ZXAoc3RlcEluZGV4LCAnJywgc3RhdGUuZnVuY3Rpb25OYW1lKTtcbiAgICAgIGF3YWl0IGFwcGx5U3RlcChzdGVwLCBzdGF0ZSk7XG4gICAgICBkZWJ1Z1N0YXRlLnJlbW92ZUxhc3RTdGVwKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZGVidWdTdGF0ZS5wcmludCgpO1xuICAgICAgaWYgKGUgIT09IGRlYnVnU3RhdGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gYXBwbHlTdGVwKHN0ZXA6IEFueVBhdGNoU3RlcCwgc3RhdGU6IEFwcGxpZXJTdGF0ZSkge1xuICBhd2FpdCBzdGF0ZS5kZWJ1Z1N0YXRlLmJlZm9yZVN0ZXAoKTtcbiAgaWYgKGNhbGxhYmxlcy5oYXMoc3RlcFsndHlwZSddKSkge1xuICAgIGxldCBzc3RlcCA9IHN0ZXAgYXMgUGF0Y2hTdGVwLkNBTEw7XG4gICAgLy8gTGV0IHVzZXJzIGNhbGwgaXQgbGlrZSBhIG5hdGl2ZSBwYXRjaHN0ZXBcbiAgICBsZXQgY2FsbGFibGVJZCA9IHNzdGVwWyd0eXBlJ107XG4gICAgbGV0IGNhbGxhYmxlU3RlcCA9IHBob3RvY29weShzc3RlcCk7XG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRoaXMgaXMgYSBCUyByZXF1aXJlbWVudFxuICAgIGRlbGV0ZSBjYWxsYWJsZVN0ZXBbJ3R5cGUnXTtcbiAgICBzc3RlcCA9IHtcbiAgICAgIHR5cGU6ICdDQUxMJyxcbiAgICAgIGlkOiBjYWxsYWJsZUlkLFxuICAgICAgYXJnczogY2FsbGFibGVTdGVwLFxuICAgIH07XG4gICAgc3RhdGUuZGVidWdTdGF0ZS5nZXRMYXN0U3RlcCgpLm5hbWUgPSBjYWxsYWJsZUlkO1xuICAgIC8vIFByZXZlbnQgdXNlciBmcm9tIGJyZWFraW5nIGV2ZXJ5dGhpbmcgYnkgY3JlYXRpbmcgYSBcIkNBTExcIiBjYWxsYWJsZVxuICAgIGF3YWl0IGFwcGxpZXJzWydDQUxMJ10uY2FsbChzc3RlcCwgc3RhdGUpO1xuICB9IGVsc2Uge1xuICAgIHN0YXRlLmRlYnVnU3RhdGUuZ2V0TGFzdFN0ZXAoKS5uYW1lID0gc3RlcFsndHlwZSddO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3Igbm90IHN1cmUgaG93IHRvIHJlZmluZSB0aGUgQW55UGF0Y2hTdGVwIHR5cGUgc28gaXQgYWNjZXB0cyBzdHJpbmdzXG4gICAgaWYgKCFhcHBsaWVyc1tzdGVwWyd0eXBlJ11dKSB7XG4gICAgICBzdGF0ZS5kZWJ1Z1N0YXRlLmdldExhc3RTdGVwKCkubmFtZSA9ICcnO1xuICAgICAgc3RhdGUuZGVidWdTdGF0ZS50aHJvd0Vycm9yKCdUeXBlRXJyb3InLCBgJHtzdGVwWyd0eXBlJ119IGlzIG5vdCBhIHZhbGlkIHR5cGUuYCk7XG4gICAgfVxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3Igbm90IHN1cmUgaG93IHRvIHJlZmluZSB0aGUgQW55UGF0Y2hTdGVwIHR5cGUgc28gaXQgYWNjZXB0cyBzdHJpbmdzXG4gICAgYXdhaXQgKGFwcGxpZXJzW3N0ZXBbJ3R5cGUnXV0gYXMgQXBwbGllcjxhbnk+KS5jYWxsKHN0ZXAsIHN0YXRlKTtcbiAgfVxuICBhd2FpdCBzdGF0ZS5kZWJ1Z1N0YXRlLmFmdGVyU3RlcCgpO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlT2JqZWN0UHJvcGVydHk8TyBleHRlbmRzIE9iamVjdD4oXG4gIG9iamVjdDogTyxcbiAga2V5OiBrZXlvZiBPLFxuICBrZXl3b3JkOiBzdHJpbmcgfCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+LFxuICB2YWx1ZTogc3RyaW5nIHwgeyBbcmVwbGFjZW1lbnRJZDogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIH0sXG4pIHtcbiAgbGV0IG9sZFZhbHVlID0gb2JqZWN0W2tleV0gYXMgc3RyaW5nO1xuICAvLyBJdCdzIG1vcmUgY29tcGxleCB0aGFuIHdlIHRob3VnaHQuXG4gIGlmICghQXJyYXkuaXNBcnJheShrZXl3b3JkKSAmJiB0eXBlb2Yga2V5d29yZCA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyBnbyB0aHJvdWdoIGVhY2ggYW5kIGNoZWNrIGlmIGl0IG1hdGNoZXMgYW55d2hlcmUuXG4gICAgZm9yIChjb25zdCBwcm9wZXJ0eSBpbiBrZXl3b3JkKSB7XG4gICAgICBpZiAoa2V5d29yZFtwcm9wZXJ0eV0pIHtcbiAgICAgICAgb2JqZWN0W2tleV0gPSBvbGRWYWx1ZS5yZXBsYWNlKFxuICAgICAgICAgIG5ldyBSZWdFeHAoa2V5d29yZFtwcm9wZXJ0eV0sICdnJyksXG4gICAgICAgICAgKCh2YWx1ZSBhcyB7IFtyZXBsYWNlbWVudElkOiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfSlbcHJvcGVydHldIGFzIHN0cmluZykgfHwgJycsXG4gICAgICAgICkgYXMgT1trZXlvZiBPXTtcbiAgICAgICAgb2xkVmFsdWUgPSBvYmplY3Rba2V5XSBhcyBzdHJpbmc7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFtrZXldID0gb2xkVmFsdWUucmVwbGFjZShcbiAgICAgIG5ldyBSZWdFeHAoa2V5d29yZCBhcyBzdHJpbmcsICdnJyksXG4gICAgICB2YWx1ZSBhcyBzdHJpbmcsXG4gICAgKSBhcyBPW2tleW9mIE9dO1xuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIG9iaiBUaGUgb2JqZWN0IHRvIHNlYXJjaCBhbmQgcmVwbGFjZSB0aGUgdmFsdWVzIG9mXG4gKiBAcGFyYW0ga2V5d29yZCBUaGUgZXhwcmVzc2lvbiB0byBtYXRjaCBhZ2FpbnN0XG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRoZSByZXBsYWNlIHRoZSBtYXRjaFxuICogKi9cbmZ1bmN0aW9uIHZhbHVlSW5zZXJ0aW9uKFxuICBvYmo6IHVua25vd24sXG4gIGtleXdvcmQ6IHN0cmluZyB8IFJlY29yZDxzdHJpbmcsIHN0cmluZz4sXG4gIHZhbHVlOiBzdHJpbmcgfCB7IFtyZXBsYWNlbWVudElkOiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfSxcbikge1xuICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IG9iai5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGNoaWxkID0gb2JqW2luZGV4XTtcbiAgICAgIGlmICh0eXBlb2YgY2hpbGQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJlcGxhY2VPYmplY3RQcm9wZXJ0eShvYmosIGluZGV4LCBrZXl3b3JkLCB2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjaGlsZCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgdmFsdWVJbnNlcnRpb24oY2hpbGQsIGtleXdvcmQsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpIHtcbiAgICB1bnNhZmVBc3NlcnQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KG9iaik7XG4gICAgZm9yIChsZXQga2V5IGluIG9iaikge1xuICAgICAgaWYgKCFvYmpba2V5XSkgY29udGludWU7XG4gICAgICBpZiAodHlwZW9mIG9ialtrZXldID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXBsYWNlT2JqZWN0UHJvcGVydHkob2JqIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz4sIGtleSwga2V5d29yZCwgdmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWVJbnNlcnRpb24ob2JqW2tleV0sIGtleXdvcmQsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLy8gLS0gU3RlcCBFeGVjdXRpb24gLS1cblxuYXBwbGllcnNbJ0ZPUl9JTiddID0gYXN5bmMgZnVuY3Rpb24gKHN0YXRlKSB7XG4gIGNvbnN0IGJvZHkgPSB0aGlzWydib2R5J107XG4gIGNvbnN0IHZhbHVlcyA9IHRoaXNbJ3ZhbHVlcyddO1xuICBjb25zdCBrZXl3b3JkID0gdGhpc1sna2V5d29yZCddO1xuXG4gIGlmICghQXJyYXkuaXNBcnJheShib2R5KSkge1xuICAgIHN0YXRlLmRlYnVnU3RhdGUudGhyb3dFcnJvcignVmFsdWVFcnJvcicsICdib2R5IG11c3QgYmUgYW4gYXJyYXkuJyk7XG4gIH1cblxuICBpZiAoIXZhbHVlcykge1xuICAgIHN0YXRlLmRlYnVnU3RhdGUudGhyb3dFcnJvcignVmFsdWVFcnJvcicsICd2YWx1ZXMgbXVzdCBiZSBzZXQuJyk7XG4gIH1cblxuICBpZiAoIWtleXdvcmQpIHtcbiAgICBzdGF0ZS5kZWJ1Z1N0YXRlLnRocm93RXJyb3IoJ1ZhbHVlRXJyb3InLCAna2V5d29yZCBtdXN0IGJlIHNldC4nKTtcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgY2xvbmVCb2R5ID0gcGhvdG9jb3B5KGJvZHkpO1xuICAgIGNvbnN0IHZhbHVlID0gdmFsdWVzW2ldO1xuICAgIHZhbHVlSW5zZXJ0aW9uKGNsb25lQm9keSwga2V5d29yZCwgdmFsdWUgYXMgeyBbcmVwbGFjZW1lbnRJZDogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIH0pO1xuICAgIHN0YXRlLmRlYnVnU3RhdGUuYWRkU3RlcChpLCAnVkFMVUVfSU5ERVgnKTtcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgY2xvbmVCb2R5Lmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgY29uc3Qgc3RhdGVtZW50ID0gY2xvbmVCb2R5W2luZGV4XTtcbiAgICAgIGNvbnN0IHR5cGUgPSBzdGF0ZW1lbnRbJ3R5cGUnXTtcbiAgICAgIHN0YXRlLmRlYnVnU3RhdGUuYWRkU3RlcChpbmRleCwgdHlwZSk7XG4gICAgICBhd2FpdCBhcHBseVN0ZXAoc3RhdGVtZW50LCBzdGF0ZSk7XG4gICAgICBzdGF0ZS5kZWJ1Z1N0YXRlLnJlbW92ZUxhc3RTdGVwKCk7XG4gICAgfVxuICAgIHN0YXRlLmRlYnVnU3RhdGUucmVtb3ZlTGFzdFN0ZXAoKTtcbiAgfVxufTtcblxuLy8gY29weSB0aGUgdmFsdWUgd2l0aCBuYW1lXG5hcHBsaWVyc1snQ09QWSddID0gYXN5bmMgZnVuY3Rpb24gKHN0YXRlKSB7XG4gIGlmICghKCdhbGlhcycgaW4gdGhpcykpIHtcbiAgICBzdGF0ZS5kZWJ1Z1N0YXRlLnRocm93RXJyb3IoJ1ZhbHVlRXJyb3InLCAnYWxpYXMgbXVzdCBiZSBzZXQuJyk7XG4gIH1cbiAgY29uc3QgdmFsdWUgPSBwaG90b2NvcHkoc3RhdGUuY3VycmVudFZhbHVlKTtcbiAgc3RhdGUuY2xvbmVNYXAuc2V0KHRoaXNbJ2FsaWFzJ10sIHZhbHVlKTtcbn07XG5cbi8vIHBhc3RlXG5hcHBsaWVyc1snUEFTVEUnXSA9IGFzeW5jIGZ1bmN0aW9uIChzdGF0ZSkge1xuICBpZiAoISgnYWxpYXMnIGluIHRoaXMpKSB7XG4gICAgc3RhdGUuZGVidWdTdGF0ZS50aHJvd0Vycm9yKCdWYWx1ZUVycm9yJywgJ2FsaWFzIG11c3QgYmUgc2V0LicpO1xuICB9XG4gIC8vIEFkZCBpbnRvIHNwZWMgbGF0ZXI/XG4gIC8vaWYgKCFzdGF0ZS5jbG9uZU1hcC5oYXModGhpc1tcImFsaWFzXCJdKSkge1xuICAvL1x0c3RhdGUuZGVidWdTdGF0ZS50aHJvd0Vycm9yKCdWYWx1ZUVycm9yJywgJ3RoZSBhbGlhcyBpcyBub3QgYXZhaWxhYmxlJyk7XG4gIC8vfVxuICBjb25zdCB2YWx1ZSA9IHBob3RvY29weShzdGF0ZS5jbG9uZU1hcC5nZXQodGhpc1snYWxpYXMnXSkpO1xuICBpZiAoQXJyYXkuaXNBcnJheShzdGF0ZS5jdXJyZW50VmFsdWUpKSB7XG4gICAgY29uc3Qgb2JqID0ge1xuICAgICAgdHlwZTogJ0FERF9BUlJBWV9FTEVNRU5UJyxcbiAgICAgIGNvbnRlbnQ6IHZhbHVlLFxuICAgICAgLi4uKHR5cGVvZiB0aGlzWydpbmRleCddID09PSAnbnVtYmVyJyAmJiAhaXNOYU4odGhpc1snaW5kZXgnXSlcbiAgICAgICAgPyB7IGluZGV4OiB0aGlzWydpbmRleCddIH1cbiAgICAgICAgOiB7fSksXG4gICAgfTtcbiAgICBhd2FpdCBhcHBseVN0ZXAob2JqIGFzIFBhdGNoU3RlcC5BRERfQVJSQVlfRUxFTUVOVCwgc3RhdGUpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBzdGF0ZS5jdXJyZW50VmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgYXdhaXQgYXBwbHlTdGVwKFxuICAgICAge1xuICAgICAgICB0eXBlOiAnU0VUX0tFWScsXG4gICAgICAgIGluZGV4OiB0aGlzWydpbmRleCddISxcbiAgICAgICAgY29udGVudDogdmFsdWUsXG4gICAgICB9LFxuICAgICAgc3RhdGUsXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICBzdGF0ZS5kZWJ1Z1N0YXRlLnRocm93RXJyb3IoJ1R5cGVFcnJvcicsIGBUeXBlICR7dHlwZW9mIHN0YXRlLmN1cnJlbnRWYWx1ZX0gaXMgbm90IHN1cHBvcnRlZC5gKTtcbiAgfVxufTtcblxuYXBwbGllcnNbJ0NPTU1FTlQnXSA9IGFzeW5jIGZ1bmN0aW9uIChzdGF0ZSkge1xuICBpZiAoc3RhdGUuZGVidWcpIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzWyd2YWx1ZSddKTtcbiAgfVxufTtcblxuYXBwbGllcnNbJ0VOVEVSJ10gPSBhc3luYyBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgaWYgKCEoJ2luZGV4JyBpbiB0aGlzKSkge1xuICAgIHN0YXRlLmRlYnVnU3RhdGUudGhyb3dFcnJvcignRXJyb3InLCAnaW5kZXggbXVzdCBiZSBzZXQuJyk7XG4gIH1cblxuICBjb25zdCBwYXRoID0gQXJyYXkuaXNBcnJheSh0aGlzWydpbmRleCddKSA/IHRoaXNbJ2luZGV4J10gOiBbdGhpc1snaW5kZXgnXV07XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcGF0aC5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGlkeCA9IHBhdGhbaV07XG4gICAgdW5zYWZlQXNzZXJ0PFN0YWNrRW50cnk+KHN0YXRlLmN1cnJlbnRWYWx1ZSk7XG4gICAgc3RhdGUuc3RhY2sucHVzaChzdGF0ZS5jdXJyZW50VmFsdWUpO1xuICAgIGlmIChzdGF0ZS5jdXJyZW50VmFsdWVbaWR4IGFzIGtleW9mIFN0YWNrRW50cnldID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IHN1YkFyciA9IHBhdGguc2xpY2UoMCwgaSArIDEpO1xuICAgICAgc3RhdGUuZGVidWdTdGF0ZS50aHJvd0Vycm9yKFxuICAgICAgICAnRXJyb3InLFxuICAgICAgICBgaW5kZXggc2VxdWVuY2UgJHtzdWJBcnIuam9pbignLCcpfSBsZWFkcyB0byBhbiB1bmRlZmluZWQgc3RhdGUuYCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgc3RhdGUuY3VycmVudFZhbHVlID0gc3RhdGUuY3VycmVudFZhbHVlW2lkeCBhcyBrZXlvZiBTdGFja0VudHJ5XTtcbiAgfVxufTtcblxuYXBwbGllcnNbJ0VYSVQnXSA9IGFzeW5jIGZ1bmN0aW9uIChzdGF0ZSkge1xuICBsZXQgY291bnQgPSAxO1xuICBpZiAodGhpc1snY291bnQnXSAhPT0gdW5kZWZpbmVkKSBjb3VudCA9IHRoaXNbJ2NvdW50J107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgIGlmIChzdGF0ZS5zdGFjay5sZW5ndGggPT09IDApIHtcbiAgICAgIHN0YXRlLmRlYnVnU3RhdGUudGhyb3dFcnJvcignRXJyb3InLCBgRVhJVCAjJHtjb3VudCArIDF9IGxlYWRzIHRvIGFuIHVuZGVmaW5lZCBzdGF0ZS5gKTtcbiAgICB9XG4gICAgc3RhdGUuY3VycmVudFZhbHVlID0gc3RhdGUuc3RhY2sucG9wKCk7XG4gIH1cbn07XG5cbmFwcGxpZXJzWydTRVRfS0VZJ10gPSBhc3luYyBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgaWYgKCEoJ2luZGV4JyBpbiB0aGlzKSkge1xuICAgIHN0YXRlLmRlYnVnU3RhdGUudGhyb3dFcnJvcignRXJyb3InLCAnaW5kZXggbXVzdCBiZSBzZXQuJyk7XG4gIH1cblxuICB1bnNhZmVBc3NlcnQ8UmVjb3JkPG51bWJlciB8IHN0cmluZywgdW5rbm93bj4+KHN0YXRlLmN1cnJlbnRWYWx1ZSk7XG5cbiAgaWYgKCdjb250ZW50JyBpbiB0aGlzKSB7XG4gICAgc3RhdGUuY3VycmVudFZhbHVlW3RoaXNbJ2luZGV4J11dID0gcGhvdG9jb3B5KHRoaXNbJ2NvbnRlbnQnXSk7XG4gIH0gZWxzZSB7XG4gICAgZGVsZXRlIHN0YXRlLmN1cnJlbnRWYWx1ZVt0aGlzWydpbmRleCddXTtcbiAgfVxufTtcblxuYXBwbGllcnNbJ1JFTU9WRV9BUlJBWV9FTEVNRU5UJ10gPSBhc3luYyBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgdW5zYWZlQXNzZXJ0PHVua25vd25bXT4oc3RhdGUuY3VycmVudFZhbHVlKTtcbiAgc3RhdGUuY3VycmVudFZhbHVlLnNwbGljZSh0aGlzWydpbmRleCddLCAxKTtcbn07XG5cbmFwcGxpZXJzWydBRERfQVJSQVlfRUxFTUVOVCddID0gYXN5bmMgZnVuY3Rpb24gKHN0YXRlKSB7XG4gIHVuc2FmZUFzc2VydDx1bmtub3duW10+KHN0YXRlLmN1cnJlbnRWYWx1ZSk7XG5cbiAgaWYgKHRoaXNbJ2luZGV4J10gIT09IHVuZGVmaW5lZCkge1xuICAgIHN0YXRlLmN1cnJlbnRWYWx1ZS5zcGxpY2UodGhpc1snaW5kZXgnXSwgMCwgcGhvdG9jb3B5KHRoaXNbJ2NvbnRlbnQnXSkpO1xuICB9IGVsc2Uge1xuICAgIHN0YXRlLmN1cnJlbnRWYWx1ZS5wdXNoKHBob3RvY29weSh0aGlzWydjb250ZW50J10pKTtcbiAgfVxufTtcblxuLy8gUmVpbnRyb2R1Y2VkIGJ1dCBzaW1wbGlmaWVkIHZlcnNpb24gb2YgRW1pbGV5YWgncyByZXNvbHZlVXJsXG5mdW5jdGlvbiBwYXJzZVBhdGgodXJsOiBzdHJpbmcsIGZyb21HYW1lOiBib29sZWFuKTogW2Jvb2xlYW4gfCBzdHJpbmcsIHN0cmluZ10ge1xuICB0cnkge1xuICAgIGNvbnN0IGRlY29tcG9zZWRVcmwgPSBuZXcgVVJMKHVybCk7XG4gICAgY29uc3QgcHJvdG9jb2wgPSBkZWNvbXBvc2VkVXJsLnByb3RvY29sO1xuXG4gICAgY29uc3Qgc3ViVXJsID0gZGVjb21wb3NlZFVybC5wYXRobmFtZTtcblxuICAgIGxldCB1cmxGcm9tR2FtZTtcbiAgICBpZiAocHJvdG9jb2wgPT09ICdtb2Q6Jykge1xuICAgICAgdXJsRnJvbUdhbWUgPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKHByb3RvY29sID09PSAnZ2FtZTonKSB7XG4gICAgICB1cmxGcm9tR2FtZSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVybEZyb21HYW1lID0gcHJvdG9jb2wuc3Vic3RyaW5nKDAsIHByb3RvY29sLmxlbmd0aCAtIDEpO1xuICAgIH1cbiAgICByZXR1cm4gW3VybEZyb21HYW1lLCBzdWJVcmxdO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIFtmcm9tR2FtZSwgdXJsXTtcbiAgfVxufVxuXG5hcHBsaWVyc1snSU1QT1JUJ10gPSBhc3luYyBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgaWYgKCEoJ3NyYycgaW4gdGhpcykpIHtcbiAgICBzdGF0ZS5kZWJ1Z1N0YXRlLnRocm93RXJyb3IoJ1ZhbHVlRXJyb3InLCAnc3JjIG11c3QgYmUgc2V0LicpO1xuICB9XG5cbiAgY29uc3Qgc3JjUGF0aCA9IHBhcnNlUGF0aCh0aGlzWydzcmMnXSwgdHJ1ZSk7XG4gIGxldCBvYmogPSBhd2FpdCBzdGF0ZS5sb2FkZXIuYXBwbHkoc3RhdGUsIHNyY1BhdGgpO1xuXG4gIGlmICh0aGlzWydwYXRoJ10gIT09IHVuZGVmaW5lZCkge1xuICAgIGlmICghQXJyYXkuaXNBcnJheSh0aGlzWydwYXRoJ10pKSB7XG4gICAgICBzdGF0ZS5kZWJ1Z1N0YXRlLnRocm93RXJyb3IoJ1ZhbHVlRXJyb3InLCAncGF0aCBtdXN0IGJlIGFuIGFycmF5LicpO1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXNbJ3BhdGgnXS5sZW5ndGg7IGkrKylcbiAgICAgIG9iaiA9IChvYmogYXMgUmVjb3JkPHN0cmluZyB8IG51bWJlciwgdW5rbm93bj4pW3RoaXNbJ3BhdGgnXVtpXV07XG4gIH1cblxuICBpZiAodGhpc1snaW5kZXgnXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdW5zYWZlQXNzZXJ0PFJlY29yZDxzdHJpbmcgfCBudW1iZXIsIHVua25vd24+PihzdGF0ZS5jdXJyZW50VmFsdWUpO1xuICAgIHN0YXRlLmN1cnJlbnRWYWx1ZSFbdGhpc1snaW5kZXgnXV0gPSBwaG90b2NvcHkob2JqKTtcbiAgfSBlbHNlIHtcbiAgICBwaG90b21lcmdlKHN0YXRlLmN1cnJlbnRWYWx1ZSwgb2JqKTtcbiAgfVxufTtcblxuYXBwbGllcnNbJ0lOQ0xVREUnXSA9IGFzeW5jIGZ1bmN0aW9uIChzdGF0ZSkge1xuICBpZiAoISgnc3JjJyBpbiB0aGlzKSkge1xuICAgIHN0YXRlLmRlYnVnU3RhdGUudGhyb3dFcnJvcignVmFsdWVFcnJvcicsICdzcmMgbXVzdCBiZSBzZXQuJyk7XG4gIH1cblxuICBjb25zdCBzcmNQYXRoID0gcGFyc2VQYXRoKHRoaXNbJ3NyYyddLCBmYWxzZSk7XG4gIGNvbnN0IGRhdGEgPSBhd2FpdCBzdGF0ZS5sb2FkZXIuYXBwbHkoc3RhdGUsIHNyY1BhdGgpO1xuXG4gIHN0YXRlLmRlYnVnU3RhdGUuYWRkRmlsZShzcmNQYXRoKTtcbiAgYXdhaXQgcGF0Y2goc3RhdGUuY3VycmVudFZhbHVlLCBkYXRhIGFzIFBhdGNoRmlsZSwgc3RhdGUubG9hZGVyLCBzdGF0ZS5kZWJ1Z1N0YXRlKTtcbiAgc3RhdGUuZGVidWdTdGF0ZS5yZW1vdmVMYXN0RmlsZSgpO1xufTtcblxuYXBwbGllcnNbJ0lOSVRfS0VZJ10gPSBhc3luYyBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgaWYgKCEoJ2luZGV4JyBpbiB0aGlzKSkge1xuICAgIHN0YXRlLmRlYnVnU3RhdGUudGhyb3dFcnJvcignVmFsdWVFcnJvcicsICdpbmRleCBtdXN0IGJlIHNldC4nKTtcbiAgfVxuXG4gIHVuc2FmZUFzc2VydDxSZWNvcmQ8c3RyaW5nIHwgbnVtYmVyLCB1bmtub3duPj4oc3RhdGUuY3VycmVudFZhbHVlKTtcblxuICBpZiAoISh0aGlzWydpbmRleCddIGluIHN0YXRlLmN1cnJlbnRWYWx1ZSkpXG4gICAgc3RhdGUuY3VycmVudFZhbHVlW3RoaXNbJ2luZGV4J11dID0gcGhvdG9jb3B5KHRoaXNbJ2NvbnRlbnQnXSk7XG59O1xuXG5hcHBsaWVyc1snREVCVUcnXSA9IGFzeW5jIGZ1bmN0aW9uIChzdGF0ZSkge1xuICBzdGF0ZS5kZWJ1ZyA9ICEhdGhpc1sndmFsdWUnXTtcbn07XG5cbi8vIGNvbWJpbmUgdGhlIHZhbHVlcyBvZiBhbiBvYmplY3QvYXJyYXkgd2l0aCBhbm90aGVyIG9iamVjdC9hcnJheS4gc2ltaWxhciB0byBub24tcGF0Y2hzdGVwIHBhdGNoaW5nLlxuYXBwbGllcnNbJ01FUkdFX0NPTlRFTlQnXSA9IGFzeW5jIGZ1bmN0aW9uIChzdGF0ZSkge1xuICBpZiAoISgnY29udGVudCcgaW4gdGhpcykpIHtcbiAgICBzdGF0ZS5kZWJ1Z1N0YXRlLnRocm93RXJyb3IoJ1ZhbHVlRXJyb3InLCAnY29udGVudCBtdXN0IGJlIHNldCcpO1xuICB9XG5cbiAgcGhvdG9tZXJnZShzdGF0ZS5jdXJyZW50VmFsdWUsIHRoaXNbJ2NvbnRlbnQnXSk7XG59O1xuIiwgImltcG9ydCB7IGFwcGxpZXJzLCBDYWxsYWJsZSwgY2FsbGFibGVzLCBTdGF0ZSB9IGZyb20gJy4vcGF0Y2hzdGVwcy1wYXRjaCc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlcihpZDogc3RyaW5nLCBjYWxsYWJsZTogQ2FsbGFibGUpIHtcbiAgaWYgKGlkLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IEVycm9yKCdJZCBtdXN0IG5vdCBiZSBlbXB0eS4nKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgY2FsbGFibGUgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBFcnJvcignQ2FsbGFibGUgbXVzdCBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG4gIGlmIChjYWxsYWJsZXMuaGFzKGlkKSkge1xuICAgIHRocm93IEVycm9yKGBDYWxsYWJsZSAke2lkfSBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQuYCk7XG4gIH1cbiAgY2FsbGFibGVzLnNldChpZCwgY2FsbGFibGUpO1xufVxuXG5hcHBsaWVyc1snQ0FMTCddID0gYXN5bmMgZnVuY3Rpb24gKHN0YXRlOiBTdGF0ZSkge1xuICBjb25zdCBpZCA9IHRoaXNbJ2lkJ107XG4gIGNvbnN0IGFyZ3MgPSB0aGlzWydhcmdzJ107XG5cbiAgLy8gQW55IGZhbHNleSB2YWx1ZXMgYXJlIGludmFsaWRcbiAgaWYgKCFpZCkge1xuICAgIHN0YXRlLmRlYnVnU3RhdGUudGhyb3dFcnJvcignVmFsdWVFcnJvcicsICdJZCBtdXN0IGJlIHNldC4nKTtcbiAgfVxuXG4gIGlmICghY2FsbGFibGVzLmhhcyhpZCkpIHtcbiAgICBzdGF0ZS5kZWJ1Z1N0YXRlLnRocm93RXJyb3IoJ1ZhbHVlRXJyb3InLCBgJHtpZH0gaXMgbm90IGEgdmFsaWQgY2FsbGFibGUuYCk7XG4gIH1cblxuICBjb25zdCBjYWxsYWJsZTogQ2FsbGFibGUgfCB1bmRlZmluZWQgPSBjYWxsYWJsZXMuZ2V0KGlkKTtcblxuICB0cnkge1xuICAgIGF3YWl0IGNhbGxhYmxlIShzdGF0ZSwgYXJncyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoZSAhPT0gc3RhdGUuZGVidWdTdGF0ZSkge1xuICAgICAgLy8gU28gdGhleSBrbm93IHdoYXQgaGFwcGVuZWRcbiAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICBzdGF0ZS5kZWJ1Z1N0YXRlLnRocm93RXJyb3IoJ1ZhbHVlRXJyb3InLCBgQ2FsbGFibGUgJHtpZH0gZGlkIG5vdCBwcm9wZXJseSB0aHJvdyBhbiBlcnJvci5gKTtcbiAgICB9XG4gICAgLy8gVGhleSBwcm9wZXJseSB0aHJldyB0aGUgZXJyb3JcbiAgICB0aHJvdyBlO1xuICB9XG59O1xuIiwgIi8qXG4gKiBwYXRjaC1zdGVwcy1saWIgLSBMaWJyYXJ5IGZvciB0aGUgUGF0Y2ggU3RlcHMgc3BlYy5cbiAqXG4gKiBXcml0dGVuIHN0YXJ0aW5nIGluIDIwMTkuXG5cbiAqIENyZWRpdHM6XG4gKiAgTWFpbiBjb2RlIGJ5IDIwa2RjXG4gKiAgVVJMLXN0eWxlIGZpbGUgcGF0aHMsIEZPUl9JTiwgQ09QWSwgUEFTVEUsIGVycm9yIHRyYWNraW5nLCBidWdodW50aW5nIGJ5IGFjMnBpY1xuICogIEV2ZW4gbW9yZSBidWdodW50aW5nIGJ5IGFjMnBpY1xuICpcbiAqIFRvIHRoZSBleHRlbnQgcG9zc2libGUgdW5kZXIgbGF3LCB0aGUgYXV0aG9yKHMpIGhhdmUgZGVkaWNhdGVkIGFsbCBjb3B5cmlnaHQgYW5kIHJlbGF0ZWQgYW5kIG5laWdoYm9yaW5nIHJpZ2h0cyB0byB0aGlzIHNvZnR3YXJlIHRvIHRoZSBwdWJsaWMgZG9tYWluIHdvcmxkd2lkZS4gVGhpcyBzb2Z0d2FyZSBpcyBkaXN0cmlidXRlZCB3aXRob3V0IGFueSB3YXJyYW50eS5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIENDMCBQdWJsaWMgRG9tYWluIERlZGljYXRpb24gYWxvbmcgd2l0aCB0aGlzIHNvZnR3YXJlLiBJZiBub3QsIHNlZSA8aHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvcHVibGljZG9tYWluL3plcm8vMS4wLz4uXG4gKi9cblxuaW1wb3J0IHsgcGhvdG9jb3B5LCBwaG90b21lcmdlIH0gZnJvbSAnLi9wYXRjaHN0ZXBzLXV0aWxzJztcbmltcG9ydCB7IEFueVBhdGNoU3RlcCwgQmFzZVBhdGNoU3RlcCwgRGlmZlNldHRpbmdzLCBJbmRleCwgUGF0Y2hTdGVwLCB1bnNhZmVBc3NlcnQgfSBmcm9tICcuL3R5cGVzJztcblxuLyoqXG4gKiBBIGRpZmZlcmVuY2UgaGV1cmlzdGljLlxuICogQHBhcmFtIGEgVGhlIGZpcnN0IHZhbHVlIHRvIGNoZWNrLlxuICogQHBhcmFtIGIgVGhlIHNlY29uZCB2YWx1ZSB0byBjaGVjay5cbiAqIEBwYXJhbSBzZXR0aW5ncyBUaGUgaW52b2x2ZWQgY29udHJvbCBzZXR0aW5ncy5cbiAqIEByZXR1cm5zIEEgZGlmZmVyZW5jZSB2YWx1ZSBmcm9tIDAgKHNhbWUpIHRvIDEgKGRpZmZlcmVudCkuXG4gKi9cbmZ1bmN0aW9uIGRpZmZIZXVyaXN0aWMoYTogdW5rbm93biwgYjogdW5rbm93biwgc2V0dGluZ3M6IERpZmZTZXR0aW5ncyk6IG51bWJlciB7XG4gIGlmICgoYSA9PT0gbnVsbCAmJiBiID09PSBudWxsKSB8fCAoYSA9PT0gdW5kZWZpbmVkICYmIGIgPT09IHVuZGVmaW5lZCkpIHJldHVybiAwO1xuICBpZiAoYSA9PT0gbnVsbCB8fCBiID09PSBudWxsIHx8IGEgPT09IHVuZGVmaW5lZCB8fCBiID09PSB1bmRlZmluZWQpIHJldHVybiAxO1xuICBpZiAoYS5jb25zdHJ1Y3RvciAhPT0gYi5jb25zdHJ1Y3RvcikgcmV0dXJuIDE7XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkoYSkgJiYgQXJyYXkuaXNBcnJheShiKSkge1xuICAgIGxldCBhcnJheSA9IGRpZmZBcnJheUhldXJpc3RpYyhhLCBiLCBzZXR0aW5ncyk7XG4gICAgaWYgKGFycmF5Lmxlbmd0aCA9PSAwKSByZXR1cm4gMDtcbiAgICBsZXQgY2hhbmdlcyA9IDA7XG4gICAgbGV0IGFpID0gMDtcbiAgICBsZXQgYmkgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChhcnJheVtpXSA9PSAnUE9QQScpIHtcbiAgICAgICAgY2hhbmdlcysrO1xuICAgICAgICBhaSsrO1xuICAgICAgfSBlbHNlIGlmIChhcnJheVtpXSA9PSAnSU5TRVJUJykge1xuICAgICAgICAvLyBEb2Vzbid0IGNvdW50XG4gICAgICAgIGJpKys7XG4gICAgICB9IGVsc2UgaWYgKGFycmF5W2ldID09ICdQQVRDSCcpIHtcbiAgICAgICAgY2hhbmdlcyArPSBkaWZmSGV1cmlzdGljKGFbYWldLCBiW2JpXSwgc2V0dGluZ3MpO1xuICAgICAgICBhaSsrO1xuICAgICAgICBiaSsrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2hhbmdlcyAvIGFycmF5Lmxlbmd0aDtcbiAgfSBlbHNlIGlmIChhLmNvbnN0cnVjdG9yID09PSBPYmplY3QgJiYgYi5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgdW5zYWZlQXNzZXJ0PFJlY29yZDxzdHJpbmcsIHVua25vd24+PihhKTtcbiAgICB1bnNhZmVBc3NlcnQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KGIpO1xuICAgIGxldCB0b3RhbDogc3RyaW5nW10gPSBbXTtcbiAgICBmb3IgKGxldCBrIGluIGEpIHRvdGFsLnB1c2goayk7XG4gICAgZm9yIChsZXQgayBpbiBiKSBpZiAoIShrIGluIGEpKSB0b3RhbC5wdXNoKGspO1xuICAgIGxldCBjaGFuZ2UgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG90YWwubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0b3RhbFtpXSBpbiBhICYmICEodG90YWxbaV0gaW4gYikpIHtcbiAgICAgICAgY2hhbmdlICs9IHNldHRpbmdzLmRpZmZBZGROZXdLZXk7XG4gICAgICB9IGVsc2UgaWYgKHRvdGFsW2ldIGluIGIgJiYgISh0b3RhbFtpXSBpbiBhKSkge1xuICAgICAgICBjaGFuZ2UgKz0gc2V0dGluZ3MuZGlmZkFkZERlbEtleTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNoYW5nZSArPVxuICAgICAgICAgIGRpZmZIZXVyaXN0aWMoXG4gICAgICAgICAgICAoYSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilbdG90YWxbaV1dLFxuICAgICAgICAgICAgKGIgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pW3RvdGFsW2ldXSxcbiAgICAgICAgICAgIHNldHRpbmdzLFxuICAgICAgICAgICkgKiBzZXR0aW5ncy5kaWZmTXVsU2FtZUtleTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRvdGFsLmxlbmd0aCAhPSAwKSByZXR1cm4gY2hhbmdlIC8gdG90YWwubGVuZ3RoO1xuICAgIHJldHVybiAwO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBhID09IGIgPyAwIDogMTtcbiAgfVxufVxuXG4vKlxuICogVGhpcyBpcyB0aGUgYXJyYXkgaGV1cmlzdGljLiBJdCdzIHJlYWQgYnkgdGhlIG1haW4gaGV1cmlzdGljIGFuZCB0aGUgZGlmZiBoZXVyaXN0aWMuXG4gKiBUaGUgcmVzdWx0cyBhcmUgYSBzZXJpZXMgb2Ygb3BlcmF0aW9ucyBvbiBhbiBhYnN0cmFjdCBtYWNoaW5lIGJ1aWxkaW5nIHRoZSBuZXcgYXJyYXkuXG4gKiBUaGVzZSByZXN1bHRzIGFyZSBndWFyYW50ZWVkIHRvIHByb2R1Y2UgY29ycmVjdCByZXN1bHRzLCBidXQgYXJlbid0IGd1YXJhbnRlZWQgdG8gcHJvZHVjZSBvcHRpbWFsIHJlc3VsdHMuXG4gKiBUaGUgYWJzdHJhY3QgbWFjaGluZSBoYXMgdHdvIGlucHV0IHN0YWNrcyAoZm9yIGEvYiksIGZpcnN0IGVsZW1lbnQgYXQgdGhlIHRvcC5cbiAqIFRoZSBvcGVyYXRpb25zIGFyZTpcbiAqIFwiUE9QQVwiOiBQb3BzIGFuIGVsZW1lbnQgZnJvbSBBLCBkaXNjYXJkaW5nIGl0LlxuICogXCJJTlNFUlRcIjogUG9wcyBhbiBlbGVtZW50IGZyb20gQiwgY29weWluZyBhbmQgaW5zZXJ0aW5nIGl0IHZlcmJhdGltLlxuICogXCJQQVRDSFwiOiBQb3BzIGFuIGVsZW1lbnQgZnJvbSBib3RoIEEgJiBCLCBjcmVhdGluZyBhIHBhdGNoIGZyb20gQSB0byBCLlxuICogVmFsaWQgb3V0cHV0IGZyb20gdGhpcyBtdXN0IGFsd2F5cyBleGhhdXN0IHRoZSBBIGFuZCBCIHN0YWNrcyBhbmQgbXVzdCBub3Qgc3RhY2sgdW5kZXJmbG93LlxuICogUHJvZ3JhbXMgdGhhdCBmb2xsb3cgdGhhdCB3aWxsIGFsd2F5cyBnZW5lcmF0ZSB2YWxpZCBvdXRwdXQsIGFzIHRoZSBvbmx5IHdheSB0byBleGhhdXN0IHRoZSBCIHN0YWNrXG4gKiAgaXMgdG8gdXNlIElOU0VSVCBhbmQgUEFUQ0gsIGJvdGggb2Ygd2hpY2ggb3V0cHV0IHRvIHRoZSByZXN1bHRpbmcgYXJyYXkuXG4gKlxuICogVGhlIGFjdHVhbCBpbXBsZW1lbnRhdGlvbiBpcyBkaWZmZXJlbnQgdG8gdGhpcyBkZXNjcmlwdGlvbiwgYnV0IGZvbGxvd3MgdGhlIHNhbWUgcnVsZXMuXG4gKiBTdGFjayBBIGFuZCB0aGUgb3V0cHV0IGFyZSB0aGUgc2FtZS5cbiAqL1xuZnVuY3Rpb24gZGlmZkFycmF5SGV1cmlzdGljKGE6IHVua25vd25bXSwgYjogdW5rbm93bltdLCBzZXR0aW5nczogRGlmZlNldHRpbmdzKSB7XG4gIGNvbnN0IGxvb2thaGVhZCA9IHNldHRpbmdzLmFycmF5TG9va2FoZWFkO1xuICBsZXQgc3VibG9nOiBzdHJpbmdbXSA9IFtdO1xuICBsZXQgaWEgPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGIubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgdmFsaWREaWYgPSAyO1xuICAgIGxldCB2YWxpZFNyYzogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG4gICAgZm9yIChsZXQgaiA9IGlhOyBqIDwgTWF0aC5taW4oaWEgKyBsb29rYWhlYWQsIGEubGVuZ3RoKTsgaisrKSB7XG4gICAgICBsZXQgZGlmID0gZGlmZkhldXJpc3RpYyhhW2pdLCBiW2ldLCBzZXR0aW5ncyk7XG4gICAgICBpZiAoZGlmIDwgdmFsaWREaWYpIHtcbiAgICAgICAgdmFsaWREaWYgPSBkaWY7XG4gICAgICAgIHZhbGlkU3JjID0gajtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHZhbGlkRGlmID4gc2V0dGluZ3MuYXJyYXlUcnVseURpZmZlcmVudFRocmVzaG9sZCkgdmFsaWRTcmMgPSBudWxsO1xuICAgIGlmICh2YWxpZFNyYyAhPSBudWxsKSB7XG4gICAgICB3aGlsZSAoaWEgPCB2YWxpZFNyYykge1xuICAgICAgICBzdWJsb2cucHVzaCgnUE9QQScpO1xuICAgICAgICBpYSsrO1xuICAgICAgfVxuICAgICAgc3VibG9nLnB1c2goJ1BBVENIJyk7XG4gICAgICBpYSsrO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaWEgPT0gYS5sZW5ndGgpIHtcbiAgICAgICAgc3VibG9nLnB1c2goJ0lOU0VSVCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3VibG9nLnB1c2goJ1BBVENIJyk7XG4gICAgICAgIGlhKys7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHdoaWxlIChpYSA8IGEubGVuZ3RoKSB7XG4gICAgc3VibG9nLnB1c2goJ1BPUEEnKTtcbiAgICBpYSsrO1xuICB9XG4gIHJldHVybiBzdWJsb2c7XG59XG5cbi8qKlxuICogRGlmZnMgdHdvIG9iamVjdHMuIFRoaXMgaXMgYWN0dWFsbHkgYW4gb3V0ZXIgd3JhcHBlciwgd2hpY2ggcHJvdmlkZXMgZGVmYXVsdCBzZXR0aW5ncyBhbG9uZyB3aXRoIG9wdGltaXphdGlvbi5cbiAqXG4gKiBAcGFyYW0gYSBUaGUgb3JpZ2luYWwgdmFsdWVcbiAqIEBwYXJhbSBiIFRoZSB0YXJnZXQgdmFsdWVcbiAqIEBwYXJhbSBzZXR0aW5ncyBPcHRpb25hbCBidW5jaCBvZiBzZXR0aW5ncy4gTWF5IGluY2x1ZGUgXCJjb21tZW50XCIuXG4gKiBAcmV0dXJuIE51bGwgaWYgdW5wYXRjaGFibGUgKHRoaXMnbGwgbmV2ZXIgb2NjdXIgZm9yIHR3byBPYmplY3RzIG9yIHR3byBBcnJheXMpLCBBcnJheSBvZiBKU09OLXJlYWR5IFBhdGNoIFN0ZXBzIG90aGVyd2lzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlmZihhOiB1bmtub3duLCBiOiB1bmtub3duLCBzZXR0aW5nczogUGFydGlhbDxEaWZmU2V0dGluZ3M+KSB7XG4gIGxldCB0cnVlU2V0dGluZ3MgPSBwaG90b2NvcHkoZGVmYXVsdFNldHRpbmdzKTtcbiAgaWYgKHNldHRpbmdzICE9PSB2b2lkIDApIHBob3RvbWVyZ2UodHJ1ZVNldHRpbmdzLCBzZXR0aW5ncyk7XG4gIGlmICh0cnVlU2V0dGluZ3MuY29tbWVudCAhPT0gdm9pZCAwKSB0cnVlU2V0dGluZ3MuY29tbWVudFZhbHVlID0gdHJ1ZVNldHRpbmdzLmNvbW1lbnQ7XG5cbiAgbGV0IHJlc3VsdCA9IHRydWVTZXR0aW5ncy5kaWZmQ29yZShhLCBiLCB0cnVlU2V0dGluZ3MpO1xuICBpZiAoIXJlc3VsdCkgcmV0dXJuIG51bGw7XG4gIGlmICh0cnVlU2V0dGluZ3Mub3B0aW1pemUpIHtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IHJlc3VsdC5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IGhlcmUgPSByZXN1bHRbaV07XG4gICAgICBsZXQgcHJldjogQW55UGF0Y2hTdGVwID0gcmVzdWx0W2kgLSAxXTtcbiAgICAgIGxldCBvcHRpbWl6ZWRPdXQgPSBmYWxzZTtcbiAgICAgIGlmIChoZXJlWyd0eXBlJ10gPT0gJ0VYSVQnKSB7XG4gICAgICAgIGlmIChwcmV2Wyd0eXBlJ10gPT0gJ0VYSVQnKSB7XG4gICAgICAgICAgLy8gQ3J1c2ggRVhJVHNcbiAgICAgICAgICBpZiAoISgnY291bnQnIGluIGhlcmUpKSBoZXJlWydjb3VudCddID0gMTtcbiAgICAgICAgICBpZiAoISgnY291bnQnIGluIHByZXYpKSBwcmV2Wydjb3VudCddID0gMTtcbiAgICAgICAgICB1bnNhZmVBc3NlcnQ8UGF0Y2hTdGVwLkVYSVQgJiB7IGNvdW50OiBudW1iZXIgfT4ocHJldik7XG4gICAgICAgICAgcHJldlsnY291bnQnXSArPSBoZXJlWydjb3VudCddITtcbiAgICAgICAgICAvLyBDb3B5IGNvbW1lbnRzIGJhY2t3YXJkcyB0byB0cnkgYW5kIHByZXNlcnZlIHRoZSB1bm9wdGltaXplZCBhdXRvY29tbWVudGVyIHNlbWFudGljc1xuICAgICAgICAgIGlmICgnY29tbWVudCcgaW4gaGVyZSkgcHJldlsnY29tbWVudCddID0gaGVyZVsnY29tbWVudCddO1xuICAgICAgICAgIG9wdGltaXplZE91dCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoaGVyZVsndHlwZSddID09ICdFTlRFUicpIHtcbiAgICAgICAgaWYgKHByZXZbJ3R5cGUnXSA9PSAnRU5URVInKSB7XG4gICAgICAgICAgLy8gQ3J1c2ggRU5URVJzXG4gICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHByZXZbJ2luZGV4J10pKSBwcmV2WydpbmRleCddID0gW3ByZXZbJ2luZGV4J11dO1xuICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShoZXJlWydpbmRleCddKSkgaGVyZVsnaW5kZXgnXSA9IFtoZXJlWydpbmRleCddXTtcbiAgICAgICAgICBwcmV2WydpbmRleCddID0gcHJldlsnaW5kZXgnXS5jb25jYXQoaGVyZVsnaW5kZXgnXSk7XG4gICAgICAgICAgb3B0aW1pemVkT3V0ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG9wdGltaXplZE91dCkge1xuICAgICAgICByZXN1bHQuc3BsaWNlKGksIDEpO1xuICAgICAgICBpLS07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQWRkcyBhIGNvbW1lbnQgdG8gdGhlIHN0ZXAgaWYgdGhlcmUgaXMgYSBjb21tZW50IGluIHNldHRpbmdzLmNvbW1lbnRWYWx1ZS5cbiAqIEBwYXJhbSBzdGVwIFRoZSBzdGVwIHRvIGFkZCB0by5cbiAqIEBwYXJhbSBzZXR0aW5ncyBUaGUgc2V0dGluZ3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaWZmQXBwbHlDb21tZW50PFQgZXh0ZW5kcyBCYXNlUGF0Y2hTdGVwPihzdGVwOiBULCBzZXR0aW5nczogRGlmZlNldHRpbmdzKSB7XG4gIGlmIChzZXR0aW5ncy5jb21tZW50VmFsdWUgIT09IHZvaWQgMCkgc3RlcC5jb21tZW50ID0gc2V0dGluZ3MuY29tbWVudFZhbHVlO1xuICByZXR1cm4gc3RlcDtcbn1cblxuLyoqXG4gKiBIYW5kbGVzIHRoZSBib29ra2VlcGluZyBpbiBzZXR0aW5ncyBuZWNlc3Nhcnkgd2hlbiBlbnRlcmluZyBhIGxldmVsIG9mIHRoZSBkaWZmLlxuICogQHBhcmFtIGEgVGhlIG9yaWdpbmFsIHZhbHVlXG4gKiBAcGFyYW0gYiBUaGUgdGFyZ2V0IHZhbHVlXG4gKiBAcGFyYW0gaW5kZXggVGhlIGluZGV4LlxuICogQHBhcmFtIHNldHRpbmdzIFNldHRpbmdzLlxuICogQHJldHVybiBTZWUgZGlmZiBmb3IgbW9yZSBkZXRhaWxzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaWZmRW50ZXJMZXZlbChcbiAgYTogdW5rbm93bixcbiAgYjogdW5rbm93bixcbiAgaW5kZXg6IEluZGV4LFxuICBzZXR0aW5nczogRGlmZlNldHRpbmdzLFxuKTogQW55UGF0Y2hTdGVwW10gfCBudWxsIHtcbiAgc2V0dGluZ3MucGF0aC5wdXNoKGluZGV4KTtcbiAgaWYgKHNldHRpbmdzLmNvbW1lbnQgIT09IHZvaWQgMClcbiAgICBzZXR0aW5ncy5jb21tZW50VmFsdWUgPSBzZXR0aW5ncy5jb21tZW50ICsgJy4nICsgc2V0dGluZ3MucGF0aC5qb2luKCcuJyk7XG4gIGxldCBsb2cgPSBzZXR0aW5ncy5kaWZmQ29yZShhLCBiLCBzZXR0aW5ncyk7XG4gIHNldHRpbmdzLnBhdGgucG9wKCk7XG4gIHJldHVybiBsb2c7XG59XG5cbi8vIFRoaXMgaXMgdGhlIGRlZmF1bHQgZGlmZkNvcmUuXG5mdW5jdGlvbiBkaWZmSW50ZXJpb3IoYTogdW5rbm93biwgYjogdW5rbm93biwgc2V0dGluZ3M6IERpZmZTZXR0aW5ncykge1xuICBpZiAoKGEgPT09IG51bGwgJiYgYiA9PT0gbnVsbCkgfHwgKGEgPT09IHVuZGVmaW5lZCAmJiBiID09PSB1bmRlZmluZWQpKSByZXR1cm4gW107XG4gIGlmIChhID09PSBudWxsIHx8IGIgPT09IG51bGwgfHwgYSA9PT0gdW5kZWZpbmVkIHx8IGIgPT09IHVuZGVmaW5lZCkgcmV0dXJuIG51bGw7XG4gIGlmIChhLmNvbnN0cnVjdG9yICE9PSBiLmNvbnN0cnVjdG9yKSByZXR1cm4gbnVsbDtcbiAgbGV0IGxvZzogQW55UGF0Y2hTdGVwW10gPSBbXTtcblxuICBpZiAoQXJyYXkuaXNBcnJheShhKSAmJiBBcnJheS5pc0FycmF5KGIpKSB7XG4gICAgbGV0IGFycmF5ID0gZGlmZkFycmF5SGV1cmlzdGljKGEsIGIsIHNldHRpbmdzKTtcbiAgICBsZXQgYWkgPSAwO1xuICAgIGxldCBiaSA9IDA7XG4gICAgLy8gQWR2YW5jaW5nIGFpL2JpIHBvcHMgZnJvbSB0aGUgcmVzcGVjdGl2ZSBzdGFjay5cbiAgICAvLyBTaW5jZSBvdXRwdXR0aW5nIGFuIGVsZW1lbnQgYWx3YXlzIGludm9sdmVzIHBvcHBpbmcgZnJvbSBCLFxuICAgIC8vICBhbmQgdmljZSB2ZXJzYSwgdGhlICdiJyBzdGFjayBwb3NpdGlvbiBpcyBhbHNvIHRoZSBsaXZlIGFycmF5IHBvc2l0aW9uLlxuICAgIC8vIEF0IHBhdGNoIHRpbWUsIGFbYWkgKyB4XSBmb3IgYXJiaXRyYXJ5ICd4JyBpcyBpbiB0aGUgbGl2ZSBhcnJheSBhdCBbYmkgKyB4XVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChhcnJheVtpXSA9PSAnUE9QQScpIHtcbiAgICAgICAgbG9nLnB1c2goXG4gICAgICAgICAgZGlmZkFwcGx5Q29tbWVudChcbiAgICAgICAgICAgIHsgdHlwZTogJ1JFTU9WRV9BUlJBWV9FTEVNRU5UJywgaW5kZXg6IGJpIH0gYXMgUGF0Y2hTdGVwLlJFTU9WRV9BUlJBWV9FTEVNRU5ULFxuICAgICAgICAgICAgc2V0dGluZ3MsXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgICAgYWkrKztcbiAgICAgIH0gZWxzZSBpZiAoYXJyYXlbaV0gPT0gJ0lOU0VSVCcpIHtcbiAgICAgICAgbGV0IGluc2VydGlvbiA9IGRpZmZBcHBseUNvbW1lbnQoXG4gICAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogJ0FERF9BUlJBWV9FTEVNRU5UJyxcbiAgICAgICAgICAgIGluZGV4OiBiaSxcbiAgICAgICAgICAgIGNvbnRlbnQ6IHBob3RvY29weShiW2JpXSksXG4gICAgICAgICAgfSBhcyBQYXRjaFN0ZXAuQUREX0FSUkFZX0VMRU1FTlQsXG4gICAgICAgICAgc2V0dGluZ3MsXG4gICAgICAgICk7XG4gICAgICAgIC8vIElzIHRoaXMgYSBzZXQgb2YgZWxlbWVudHMgYmVpbmcgaW5zZXJ0ZWQgYXQgdGhlIGVuZD9cbiAgICAgICAgbGV0IGo7XG4gICAgICAgIGZvciAoaiA9IGkgKyAxOyBqIDwgYXJyYXkubGVuZ3RoOyBqKyspXG4gICAgICAgICAgaWYgKGFycmF5W2pdICE9ICdJTlNFUlQnICYmIGFycmF5W2pdICE9ICdQT1BBJykgYnJlYWs7XG4gICAgICAgIC8vIElmIGl0IGlzIGEgc2V0IG9mIGVsZW1lbnRzIGJlaW5nIGluc2VydGVkIGF0IHRoZSBlbmQsIHRoZXkgYXJlIGFwcGVuZGVkXG4gICAgICAgIGlmIChqID09IGFycmF5Lmxlbmd0aCkgZGVsZXRlIGluc2VydGlvblsnaW5kZXgnXTtcbiAgICAgICAgbG9nLnB1c2goaW5zZXJ0aW9uKTtcbiAgICAgICAgYmkrKztcbiAgICAgIH0gZWxzZSBpZiAoYXJyYXlbaV0gPT0gJ1BBVENIJykge1xuICAgICAgICBsZXQgeGQgPSBkaWZmRW50ZXJMZXZlbChhW2FpXSwgYltiaV0sIGJpLCBzZXR0aW5ncyk7XG4gICAgICAgIGlmICh4ZCAhPSBudWxsKSB7XG4gICAgICAgICAgaWYgKHhkLmxlbmd0aCAhPSAwKSB7XG4gICAgICAgICAgICBsb2cucHVzaCh7IHR5cGU6ICdFTlRFUicsIGluZGV4OiBiaSB9KTtcbiAgICAgICAgICAgIGxvZyA9IGxvZy5jb25jYXQoeGQpO1xuICAgICAgICAgICAgbG9nLnB1c2goeyB0eXBlOiAnRVhJVCcgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvZy5wdXNoKFxuICAgICAgICAgICAgZGlmZkFwcGx5Q29tbWVudChcbiAgICAgICAgICAgICAgeyB0eXBlOiAnU0VUX0tFWScsIGluZGV4OiBiaSwgY29udGVudDogcGhvdG9jb3B5KGJbYmldKSB9IGFzIFBhdGNoU3RlcC5TRVRfS0VZLFxuICAgICAgICAgICAgICBzZXR0aW5ncyxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBhaSsrO1xuICAgICAgICBiaSsrO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmIChhLmNvbnN0cnVjdG9yID09PSBPYmplY3QgJiYgYi5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG4gICAgdW5zYWZlQXNzZXJ0PFJlY29yZDxzdHJpbmcsIHVua25vd24+PihhKTtcbiAgICB1bnNhZmVBc3NlcnQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KGIpO1xuICAgIGZvciAobGV0IGsgaW4gYSkge1xuICAgICAgaWYgKGsgaW4gYikge1xuICAgICAgICB1bnNhZmVBc3NlcnQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KGEpO1xuICAgICAgICB1bnNhZmVBc3NlcnQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KGIpO1xuXG4gICAgICAgIGlmIChkaWZmSGV1cmlzdGljKGFba10sIGJba10sIHNldHRpbmdzKSA+PSBzZXR0aW5ncy50cnVseURpZmZlcmVudFRocmVzaG9sZCkge1xuICAgICAgICAgIGxvZy5wdXNoKFxuICAgICAgICAgICAgZGlmZkFwcGx5Q29tbWVudChcbiAgICAgICAgICAgICAgeyB0eXBlOiAnU0VUX0tFWScsIGluZGV4OiBrLCBjb250ZW50OiBwaG90b2NvcHkoYltrXSkgfSBhcyBQYXRjaFN0ZXAuU0VUX0tFWSxcbiAgICAgICAgICAgICAgc2V0dGluZ3MsXG4gICAgICAgICAgICApLFxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGV0IHhkID0gZGlmZkVudGVyTGV2ZWwoYVtrXSwgYltrXSwgaywgc2V0dGluZ3MpO1xuICAgICAgICAgIGlmICh4ZCAhPSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoeGQubGVuZ3RoICE9IDApIHtcbiAgICAgICAgICAgICAgbG9nLnB1c2goeyB0eXBlOiAnRU5URVInLCBpbmRleDogayB9KTtcbiAgICAgICAgICAgICAgbG9nID0gbG9nLmNvbmNhdCh4ZCk7XG4gICAgICAgICAgICAgIGxvZy5wdXNoKHsgdHlwZTogJ0VYSVQnIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzaG91bGQgaXQgaGFwcGVuPyBwcm9iYWJseSBub3QuIHdpbGwgaXQgaGFwcGVuPyBtYXliZVxuICAgICAgICAgICAgbG9nLnB1c2goXG4gICAgICAgICAgICAgIGRpZmZBcHBseUNvbW1lbnQoXG4gICAgICAgICAgICAgICAgeyB0eXBlOiAnU0VUX0tFWScsIGluZGV4OiBrLCBjb250ZW50OiBwaG90b2NvcHkoYltrXSkgfSBhcyBQYXRjaFN0ZXAuU0VUX0tFWSxcbiAgICAgICAgICAgICAgICBzZXR0aW5ncyxcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2cucHVzaChkaWZmQXBwbHlDb21tZW50KHsgdHlwZTogJ1NFVF9LRVknLCBpbmRleDogayB9IGFzIFBhdGNoU3RlcC5TRVRfS0VZLCBzZXR0aW5ncykpO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGxldCBrIGluIGIpXG4gICAgICBpZiAoIShrIGluIGEpKVxuICAgICAgICBsb2cucHVzaChcbiAgICAgICAgICBkaWZmQXBwbHlDb21tZW50KFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0eXBlOiAnU0VUX0tFWScsXG4gICAgICAgICAgICAgIGluZGV4OiBrLFxuICAgICAgICAgICAgICBjb250ZW50OiBwaG90b2NvcHkoKGIgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pW2tdKSxcbiAgICAgICAgICAgIH0gYXMgUGF0Y2hTdGVwLlNFVF9LRVksXG4gICAgICAgICAgICBzZXR0aW5ncyxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICB9IGVsc2UgaWYgKGEgIT0gYikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBsb2c7XG59XG5cbi8qKlxuICogQSBzZXQgb2YgZGVmYXVsdCBzZXR0aW5ncyB0byBkaWZmLlxuICovXG5leHBvcnQgY29uc3QgZGVmYXVsdFNldHRpbmdzID0ge1xuICAvLyBBIHNldCBvZiBoZXVyaXN0aWMgc2NvcmluZyBudW1iZXJzLlxuICBhcnJheVRydWx5RGlmZmVyZW50VGhyZXNob2xkOiAwLjUsXG4gIHRydWx5RGlmZmVyZW50VGhyZXNob2xkOiAwLjUsXG4gIGFycmF5TG9va2FoZWFkOiA4LFxuICBkaWZmQWRkTmV3S2V5OiAwLFxuICBkaWZmQWRkRGVsS2V5OiAxLFxuICBkaWZmTXVsU2FtZUtleTogMC43NSxcblxuICAvLyBUaGUgXCJkaWZmIGNvcmUgZnVuY3Rpb25cIi4gVGFrZXMgKGEsIGIsIHNldHRpbmdzKS4gUmV0dXJucyBudWxsIGZvciBpbnZhbGlkLCBvciBhIFBhdGNoIFN0ZXBzIHBhdGNoIG90aGVyd2lzZS4gR2l2ZW4gdmFsaWQgSlNPTiBpbiAobm8gYXJyYXlzIGFzIGtleXMsIGZvciBleGFtcGxlKSwgYWxsIHN0ZXAgYXJyYXlzICYgb2JqZWN0cyBtdXN0IGJlIHVuaXF1ZSBhbmQgdGhleSBjYW5ub3QgYmUgc2VsZi1yZWZlcmVudGlhbC5cbiAgLy8gUmVwbGFjaW5nIHRoaXMsIGNvbWJpbmVkIHdpdGggY29ycmVjdCB1c2FnZSBvZiB0aGUgJ3BhdGgnIHNldHRpbmcsIGFsbG93cyB5b3UgdG8gYWRkIHlvdXIgb3duIGhldXJpc3RpY3MuXG4gIGRpZmZDb3JlOiBkaWZmSW50ZXJpb3IsXG4gIC8vIElmIGFsbCBzdGVwcyBzaG91bGQgYmUgY29tbWVudGVkIHdpdGggdGhlIHBhdGgsIGEgc3RyaW5nIHNob3VsZCBiZSBwbGFjZWQgaGVyZSBmb3IgYSBwcmVmaXguXG4gIGNvbW1lbnQ6IHVuZGVmaW5lZCxcbiAgLy8gVGhlIGN1cnJlbnQgdmFsdWUgb2YgY29tbWVudC5cbiAgY29tbWVudFZhbHVlOiB1bmRlZmluZWQsXG4gIC8vIFRoZSBpbmRleCBwYXRoIGluIHRoZSBvcmlnaW5hbCBvYmplY3QgKEEpIGxlYWRpbmcgdG8gdGhlIG9iamVjdCBiZWluZyBkaWZmZWQuXG4gIHBhdGg6IFtdLFxuICAvLyBJZiB0aGUgZGlmZiBzaG91bGQgYmUgb3B0aW1pemVkIHRvIHJlZHVjZSB0aGUgaW5zdHJ1Y3Rpb24gY291bnQuXG4gIG9wdGltaXplOiB0cnVlLFxufTtcbiIsICIvKlxuICogcGF0Y2gtc3RlcHMtbGliIC0gTGlicmFyeSBmb3IgdGhlIFBhdGNoIFN0ZXBzIHNwZWMuXG4gKlxuICogV3JpdHRlbiBzdGFydGluZyBpbiAyMDE5LlxuICpcbiAqIFRvIHRoZSBleHRlbnQgcG9zc2libGUgdW5kZXIgbGF3LCB0aGUgYXV0aG9yKHMpIGhhdmUgZGVkaWNhdGVkIGFsbCBjb3B5cmlnaHQgYW5kIHJlbGF0ZWQgYW5kIG5laWdoYm9yaW5nIHJpZ2h0cyB0byB0aGlzIHNvZnR3YXJlIHRvIHRoZSBwdWJsaWMgZG9tYWluIHdvcmxkd2lkZS4gVGhpcyBzb2Z0d2FyZSBpcyBkaXN0cmlidXRlZCB3aXRob3V0IGFueSB3YXJyYW50eS5cbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIENDMCBQdWJsaWMgRG9tYWluIERlZGljYXRpb24gYWxvbmcgd2l0aCB0aGlzIHNvZnR3YXJlLiBJZiBub3QsIHNlZSA8aHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvcHVibGljZG9tYWluL3plcm8vMS4wLz4uXG4gKi9cblxuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi9wYXRjaHN0ZXBzLXV0aWxzJztcbmltcG9ydCAqIGFzIHBhdGNoZXIgZnJvbSAnLi9wYXRjaHN0ZXBzLXBhdGNoJztcbmltcG9ydCAqIGFzIGNhbGxhYmxlIGZyb20gJy4vcGF0Y2hzdGVwcy1jYWxsYWJsZSc7XG5pbXBvcnQgKiBhcyBkaWZmZXIgZnJvbSAnLi9wYXRjaHN0ZXBzLWRpZmYnO1xuXG5leHBvcnQgY29uc3QgdmVyc2lvbiA9ICcxLjEuMyc7XG5cbmV4cG9ydCBjb25zdCBwaG90b21lcmdlID0gdXRpbHMucGhvdG9tZXJnZTtcbmV4cG9ydCBjb25zdCBwaG90b2NvcHkgPSB1dGlscy5waG90b2NvcHk7XG5cbmV4cG9ydCBjb25zdCBkaWZmID0gZGlmZmVyLmRpZmY7XG5leHBvcnQgY29uc3QgZGlmZkVudGVyTGV2ZWwgPSBkaWZmZXIuZGlmZkVudGVyTGV2ZWw7XG5leHBvcnQgY29uc3QgZGlmZkFwcGx5Q29tbWVudCA9IGRpZmZlci5kaWZmQXBwbHlDb21tZW50O1xuZXhwb3J0IGNvbnN0IGRlZmF1bHRTZXR0aW5ncyA9IGRpZmZlci5kZWZhdWx0U2V0dGluZ3M7XG5cbmV4cG9ydCBjb25zdCBwYXRjaCA9IHBhdGNoZXIucGF0Y2g7XG5leHBvcnQgY29uc3QgYXBwbGllcnMgPSBwYXRjaGVyLmFwcGxpZXJzO1xuZXhwb3J0IGNvbnN0IERlYnVnU3RhdGUgPSBwYXRjaGVyLkRlYnVnU3RhdGU7XG5leHBvcnQgY29uc3QgY2FsbGFibGVzID0gcGF0Y2hlci5jYWxsYWJsZXM7XG5leHBvcnQgeyBjYWxsYWJsZSB9O1xuIiwgImV4cG9ydCAqIGZyb20gJy4vcGF0Y2gtc3RlcHMtbGliL3NyYy9wYXRjaHN0ZXBzLmpzJztcbiIsICJpbXBvcnQgKiBhcyB1dGlscyBmcm9tICdAY2Nsb2FkZXIzL2NvbW1vbi91dGlscyc7XG5pbXBvcnQge1xuICBQYXRjaExpc3QgYXMgUGF0Y2hMaXN0UHVibGljLFxuICBSZXNvdXJjZVBhdGNoTGlzdCBhcyBSZXNvdXJjZVBhdGNoTGlzdFB1YmxpYyxcbiAgUmVzb3VyY2VQYXRjaGVyU2ltcGxlLFxuICBSZXNvdXJjZVBhdGNoZXJXaXRoRGVwcyxcbn0gZnJvbSAndWx0aW1hdGUtY3Jvc3Njb2RlLXR5cGVkZWZzL21vZGxvYWRlci1zdGRsaWIvcGF0Y2gtbGlzdCc7XG5cbmV4cG9ydCBjbGFzcyBQYXRjaExpc3Q8UD4gaW1wbGVtZW50cyBQYXRjaExpc3RQdWJsaWM8UD4ge1xuICBwdWJsaWMgcGF0dGVyblBhdGNoZXJzOiBBcnJheTxbUmVnRXhwLCBQXT4gPSBbXTtcbiAgcHVibGljIHNwZWNpZmljUGF0Y2hlcnMgPSBuZXcgTWFwPHN0cmluZywgUFtdPigpO1xuXG4gIHB1YmxpYyBmb3JQYXRoKHBhdGg6IHN0cmluZyk6IFBbXSB7XG4gICAgbGV0IHBhdGNoZXJzID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gdGhpcy5wYXR0ZXJuUGF0Y2hlcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGxldCBbcGF0dGVybiwgcGF0Y2hlcl0gPSB0aGlzLnBhdHRlcm5QYXRjaGVyc1tpXTtcbiAgICAgIGlmIChwYXR0ZXJuLnRlc3QocGF0aCkpIHBhdGNoZXJzLnB1c2gocGF0Y2hlcik7XG4gICAgfVxuXG4gICAgbGV0IHNwZWNpZmljRm9yVGhpc1BhdGggPSB0aGlzLnNwZWNpZmljUGF0Y2hlcnMuZ2V0KHBhdGgpO1xuICAgIGlmIChzcGVjaWZpY0ZvclRoaXNQYXRoICE9IG51bGwpIHBhdGNoZXJzLnB1c2goLi4uc3BlY2lmaWNGb3JUaGlzUGF0aCk7XG5cbiAgICByZXR1cm4gcGF0Y2hlcnM7XG4gIH1cblxuICBwdWJsaWMgYWRkKHBhdGg6IHN0cmluZyB8IFJlZ0V4cCwgcGF0Y2hlcjogUCk6IHZvaWQge1xuICAgIGlmICh0eXBlb2YgcGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGxldCBsaXN0ID0gdXRpbHMubWFwR2V0T3JJbnNlcnQodGhpcy5zcGVjaWZpY1BhdGNoZXJzLCBwYXRoLCBbXSk7XG4gICAgICBsaXN0LnB1c2gocGF0Y2hlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucGF0dGVyblBhdGNoZXJzLnB1c2goW3BhdGgsIHBhdGNoZXJdKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJlc291cmNlUGF0Y2hMaXN0PERhdGEsIEN0eD5cbiAgZXh0ZW5kcyBQYXRjaExpc3Q8UmVzb3VyY2VQYXRjaGVyV2l0aERlcHM8RGF0YSwgdW5rbm93biwgQ3R4Pj5cbiAgaW1wbGVtZW50cyBSZXNvdXJjZVBhdGNoTGlzdFB1YmxpYzxEYXRhLCBDdHg+XG57XG4gIHB1YmxpYyBhZGQ8RGF0YTIgZXh0ZW5kcyBEYXRhID0gRGF0YSwgRGVwcyA9IG5ldmVyPihcbiAgICBwYXRoOiBzdHJpbmcgfCBSZWdFeHAsXG4gICAgcGF0Y2hlcjogUmVzb3VyY2VQYXRjaGVyU2ltcGxlPERhdGEyLCBEZXBzLCBDdHg+IHwgUmVzb3VyY2VQYXRjaGVyV2l0aERlcHM8RGF0YTIsIERlcHMsIEN0eD4sXG4gICk6IHZvaWQge1xuICAgIGlmICh0eXBlb2YgcGF0Y2hlciA9PT0gJ2Z1bmN0aW9uJykgcGF0Y2hlciA9IHsgcGF0Y2hlciB9O1xuICAgIHN1cGVyLmFkZChwYXRoLCBwYXRjaGVyIGFzIHVua25vd24gYXMgUmVzb3VyY2VQYXRjaGVyV2l0aERlcHM8RGF0YSwgdW5rbm93biwgQ3R4Pik7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IG5hbWVzcGFjZTogdHlwZW9mIGNjbW9kLnBhdGNoTGlzdCA9IHsgUGF0Y2hMaXN0LCBSZXNvdXJjZVBhdGNoTGlzdCB9O1xuIiwgIi8vIEB0cy1ub2NoZWNrXG4vLyBub2RlX21vZHVsZXMvLnBucG0vc3RyaXAtanNvbi1jb21tZW50c0A1LjAuMi9ub2RlX21vZHVsZXMvc3RyaXAtanNvbi1jb21tZW50cy9pbmRleC5qc1xudmFyIHNpbmdsZUNvbW1lbnQgPSBTeW1ib2woXCJzaW5nbGVDb21tZW50XCIpO1xudmFyIG11bHRpQ29tbWVudCA9IFN5bWJvbChcIm11bHRpQ29tbWVudFwiKTtcbnZhciBzdHJpcFdpdGhvdXRXaGl0ZXNwYWNlID0gKCkgPT4gXCJcIjtcbnZhciBzdHJpcFdpdGhXaGl0ZXNwYWNlID0gKHN0cmluZywgc3RhcnQsIGVuZCkgPT4gc3RyaW5nLnNsaWNlKHN0YXJ0LCBlbmQpLnJlcGxhY2UoL1teIFxcdFxcclxcbl0vZywgXCIgXCIpO1xudmFyIGlzRXNjYXBlZCA9IChqc29uU3RyaW5nLCBxdW90ZVBvc2l0aW9uKSA9PiB7XG4gIGxldCBpbmRleCA9IHF1b3RlUG9zaXRpb24gLSAxO1xuICBsZXQgYmFja3NsYXNoQ291bnQgPSAwO1xuICB3aGlsZSAoanNvblN0cmluZ1tpbmRleF0gPT09IFwiXFxcXFwiKSB7XG4gICAgaW5kZXggLT0gMTtcbiAgICBiYWNrc2xhc2hDb3VudCArPSAxO1xuICB9XG4gIHJldHVybiBCb29sZWFuKGJhY2tzbGFzaENvdW50ICUgMik7XG59O1xuZnVuY3Rpb24gc3RyaXBKc29uQ29tbWVudHMoanNvblN0cmluZywgeyB3aGl0ZXNwYWNlID0gdHJ1ZSwgdHJhaWxpbmdDb21tYXMgPSBmYWxzZSB9ID0ge30pIHtcbiAgaWYgKHR5cGVvZiBqc29uU3RyaW5nICE9PSBcInN0cmluZ1wiKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgYXJndW1lbnQgXFxganNvblN0cmluZ1xcYCB0byBiZSBhIFxcYHN0cmluZ1xcYCwgZ290IFxcYCR7dHlwZW9mIGpzb25TdHJpbmd9XFxgYCk7XG4gIH1cbiAgY29uc3Qgc3RyaXAgPSB3aGl0ZXNwYWNlID8gc3RyaXBXaXRoV2hpdGVzcGFjZSA6IHN0cmlwV2l0aG91dFdoaXRlc3BhY2U7XG4gIGxldCBpc0luc2lkZVN0cmluZyA9IGZhbHNlO1xuICBsZXQgaXNJbnNpZGVDb21tZW50ID0gZmFsc2U7XG4gIGxldCBvZmZzZXQgPSAwO1xuICBsZXQgYnVmZmVyID0gXCJcIjtcbiAgbGV0IHJlc3VsdCA9IFwiXCI7XG4gIGxldCBjb21tYUluZGV4ID0gLTE7XG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBqc29uU3RyaW5nLmxlbmd0aDsgaW5kZXgrKykge1xuICAgIGNvbnN0IGN1cnJlbnRDaGFyYWN0ZXIgPSBqc29uU3RyaW5nW2luZGV4XTtcbiAgICBjb25zdCBuZXh0Q2hhcmFjdGVyID0ganNvblN0cmluZ1tpbmRleCArIDFdO1xuICAgIGlmICghaXNJbnNpZGVDb21tZW50ICYmIGN1cnJlbnRDaGFyYWN0ZXIgPT09ICdcIicpIHtcbiAgICAgIGNvbnN0IGVzY2FwZWQgPSBpc0VzY2FwZWQoanNvblN0cmluZywgaW5kZXgpO1xuICAgICAgaWYgKCFlc2NhcGVkKSB7XG4gICAgICAgIGlzSW5zaWRlU3RyaW5nID0gIWlzSW5zaWRlU3RyaW5nO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNJbnNpZGVTdHJpbmcpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBpZiAoIWlzSW5zaWRlQ29tbWVudCAmJiBjdXJyZW50Q2hhcmFjdGVyICsgbmV4dENoYXJhY3RlciA9PT0gXCIvL1wiKSB7XG4gICAgICBidWZmZXIgKz0ganNvblN0cmluZy5zbGljZShvZmZzZXQsIGluZGV4KTtcbiAgICAgIG9mZnNldCA9IGluZGV4O1xuICAgICAgaXNJbnNpZGVDb21tZW50ID0gc2luZ2xlQ29tbWVudDtcbiAgICAgIGluZGV4Kys7XG4gICAgfSBlbHNlIGlmIChpc0luc2lkZUNvbW1lbnQgPT09IHNpbmdsZUNvbW1lbnQgJiYgY3VycmVudENoYXJhY3RlciArIG5leHRDaGFyYWN0ZXIgPT09IFwiXFxyXFxuXCIpIHtcbiAgICAgIGluZGV4Kys7XG4gICAgICBpc0luc2lkZUNvbW1lbnQgPSBmYWxzZTtcbiAgICAgIGJ1ZmZlciArPSBzdHJpcChqc29uU3RyaW5nLCBvZmZzZXQsIGluZGV4KTtcbiAgICAgIG9mZnNldCA9IGluZGV4O1xuICAgICAgY29udGludWU7XG4gICAgfSBlbHNlIGlmIChpc0luc2lkZUNvbW1lbnQgPT09IHNpbmdsZUNvbW1lbnQgJiYgY3VycmVudENoYXJhY3RlciA9PT0gXCJcXG5cIikge1xuICAgICAgaXNJbnNpZGVDb21tZW50ID0gZmFsc2U7XG4gICAgICBidWZmZXIgKz0gc3RyaXAoanNvblN0cmluZywgb2Zmc2V0LCBpbmRleCk7XG4gICAgICBvZmZzZXQgPSBpbmRleDtcbiAgICB9IGVsc2UgaWYgKCFpc0luc2lkZUNvbW1lbnQgJiYgY3VycmVudENoYXJhY3RlciArIG5leHRDaGFyYWN0ZXIgPT09IFwiLypcIikge1xuICAgICAgYnVmZmVyICs9IGpzb25TdHJpbmcuc2xpY2Uob2Zmc2V0LCBpbmRleCk7XG4gICAgICBvZmZzZXQgPSBpbmRleDtcbiAgICAgIGlzSW5zaWRlQ29tbWVudCA9IG11bHRpQ29tbWVudDtcbiAgICAgIGluZGV4Kys7XG4gICAgICBjb250aW51ZTtcbiAgICB9IGVsc2UgaWYgKGlzSW5zaWRlQ29tbWVudCA9PT0gbXVsdGlDb21tZW50ICYmIGN1cnJlbnRDaGFyYWN0ZXIgKyBuZXh0Q2hhcmFjdGVyID09PSBcIiovXCIpIHtcbiAgICAgIGluZGV4Kys7XG4gICAgICBpc0luc2lkZUNvbW1lbnQgPSBmYWxzZTtcbiAgICAgIGJ1ZmZlciArPSBzdHJpcChqc29uU3RyaW5nLCBvZmZzZXQsIGluZGV4ICsgMSk7XG4gICAgICBvZmZzZXQgPSBpbmRleCArIDE7XG4gICAgICBjb250aW51ZTtcbiAgICB9IGVsc2UgaWYgKHRyYWlsaW5nQ29tbWFzICYmICFpc0luc2lkZUNvbW1lbnQpIHtcbiAgICAgIGlmIChjb21tYUluZGV4ICE9PSAtMSkge1xuICAgICAgICBpZiAoY3VycmVudENoYXJhY3RlciA9PT0gXCJ9XCIgfHwgY3VycmVudENoYXJhY3RlciA9PT0gXCJdXCIpIHtcbiAgICAgICAgICBidWZmZXIgKz0ganNvblN0cmluZy5zbGljZShvZmZzZXQsIGluZGV4KTtcbiAgICAgICAgICByZXN1bHQgKz0gc3RyaXAoYnVmZmVyLCAwLCAxKSArIGJ1ZmZlci5zbGljZSgxKTtcbiAgICAgICAgICBidWZmZXIgPSBcIlwiO1xuICAgICAgICAgIG9mZnNldCA9IGluZGV4O1xuICAgICAgICAgIGNvbW1hSW5kZXggPSAtMTtcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50Q2hhcmFjdGVyICE9PSBcIiBcIiAmJiBjdXJyZW50Q2hhcmFjdGVyICE9PSBcIlx0XCIgJiYgY3VycmVudENoYXJhY3RlciAhPT0gXCJcXHJcIiAmJiBjdXJyZW50Q2hhcmFjdGVyICE9PSBcIlxcblwiKSB7XG4gICAgICAgICAgYnVmZmVyICs9IGpzb25TdHJpbmcuc2xpY2Uob2Zmc2V0LCBpbmRleCk7XG4gICAgICAgICAgb2Zmc2V0ID0gaW5kZXg7XG4gICAgICAgICAgY29tbWFJbmRleCA9IC0xO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGN1cnJlbnRDaGFyYWN0ZXIgPT09IFwiLFwiKSB7XG4gICAgICAgIHJlc3VsdCArPSBidWZmZXIgKyBqc29uU3RyaW5nLnNsaWNlKG9mZnNldCwgaW5kZXgpO1xuICAgICAgICBidWZmZXIgPSBcIlwiO1xuICAgICAgICBvZmZzZXQgPSBpbmRleDtcbiAgICAgICAgY29tbWFJbmRleCA9IGluZGV4O1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0ICsgYnVmZmVyICsgKGlzSW5zaWRlQ29tbWVudCA/IHN0cmlwKGpzb25TdHJpbmcuc2xpY2Uob2Zmc2V0KSkgOiBqc29uU3RyaW5nLnNsaWNlKG9mZnNldCkpO1xufVxuZXhwb3J0IHtcbiAgc3RyaXBKc29uQ29tbWVudHMgYXMgZGVmYXVsdFxufTtcbiIsICJleHBvcnQgZnVuY3Rpb24gbG9hZFN0eWxlc2hlZXQoXG4gIHVybDogc3RyaW5nLFxuICBvcHRpb25zPzogeyB0eXBlPzogc3RyaW5nIHwgbnVsbCB9IHwgbnVsbCxcbik6IFByb21pc2U8dm9pZD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zID8/IHt9O1xuICAgIGxldCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuICAgIGxpbmsucmVsID0gJ3N0eWxlc2hlZXQnO1xuICAgIGxpbmsuaHJlZiA9IHVybDtcbiAgICBpZiAob3B0aW9ucy50eXBlICE9IG51bGwpIGxpbmsudHlwZSA9IG9wdGlvbnMudHlwZTtcblxuICAgIGxpbmsub25sb2FkID0gKCkgPT4gcmVzb2x2ZSgpO1xuICAgIGxpbmsub25lcnJvciA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoYEZhaWxlZCB0byBsb2FkIHN0eWxlc2hlZXQgJyR7dXJsfSdgKSk7XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkU2NyaXB0KFxuICB1cmw6IHN0cmluZyxcbiAgb3B0aW9ucz86IHsgdHlwZT86IHN0cmluZyB8IG51bGw7IGFzeW5jPzogYm9vbGVhbiB8IG51bGwgfSB8IG51bGwsXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyA/PyB7fTtcbiAgICBsZXQgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgc2NyaXB0LnNyYyA9IHVybDtcbiAgICBpZiAob3B0aW9ucy50eXBlICE9IG51bGwpIHNjcmlwdC50eXBlID0gb3B0aW9ucy50eXBlO1xuICAgIGlmIChvcHRpb25zLmFzeW5jICE9IG51bGwpIHNjcmlwdC5hc3luYyA9IG9wdGlvbnMuYXN5bmM7XG5cbiAgICBzY3JpcHQub25sb2FkID0gKCkgPT4gcmVzb2x2ZSgpO1xuICAgIHNjcmlwdC5vbmVycm9yID0gKCkgPT4gcmVqZWN0KG5ldyBFcnJvcihgRmFpbGVkIHRvIGxvYWQgc2NyaXB0ICcke3VybH0nYCkpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgfSk7XG59XG4iLCAiaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnQGNjbG9hZGVyMy9jb21tb24vdXRpbHMnO1xuaW1wb3J0IHN0cmlwSnNvbkNvbW1lbnRzIGZyb20gJ0BjY2xvYWRlcjMvY29tbW9uL3ZlbmRvci1saWJzL3N0cmlwLWpzb24tY29tbWVudHMnO1xuaW1wb3J0IHsgbG9hZFNjcmlwdCwgbG9hZFN0eWxlc2hlZXQgfSBmcm9tICdAY2Nsb2FkZXIzL2NvbW1vbi9yZXNvdXJjZXMnO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZFRleHQodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICBsZXQgcmVzOiBSZXNwb25zZTtcbiAgdHJ5IHtcbiAgICByZXMgPSBhd2FpdCBmZXRjaCh1cmwpO1xuICAgIGlmICghcmVzLm9rKSB0aHJvdyBuZXcgRXJyb3IoYCR7cmVzLnN0YXR1c30gJHtyZXMuc3RhdHVzVGV4dH1gKTtcbiAgICByZXR1cm4gYXdhaXQgcmVzLnRleHQoKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKHV0aWxzLmVycm9ySGFzTWVzc2FnZShlcnIpKSB7XG4gICAgICBlcnIubWVzc2FnZSA9IGBGYWlsZWQgdG8gbG9hZCB0ZXh0IGZpbGUgJyR7dXJsfSc6ICR7ZXJyLm1lc3NhZ2V9YDtcbiAgICB9XG4gICAgdGhyb3cgZXJyO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkSlNPTjxUID0gdW5rbm93bj4odXJsOiBzdHJpbmcpOiBQcm9taXNlPFQ+IHtcbiAgbGV0IHRleHQgPSBhd2FpdCBsb2FkVGV4dCh1cmwpO1xuICB0cnkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKHN0cmlwSnNvbkNvbW1lbnRzKHRleHQsIHsgdHJhaWxpbmdDb21tYXM6IHRydWUgfSkpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAodXRpbHMuZXJyb3JIYXNNZXNzYWdlKGVycikpIHtcbiAgICAgIGVyci5tZXNzYWdlID0gYEZhaWxlZCB0byBwYXJzZSBKU09OIGZpbGUgJyR7dXJsfSc6ICR7ZXJyLm1lc3NhZ2V9YDtcbiAgICB9XG4gICAgdGhyb3cgZXJyO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkSW1hZ2UodXJsOiBzdHJpbmcpOiBQcm9taXNlPEhUTUxJbWFnZUVsZW1lbnQ+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgaW1nLnNyYyA9IHVybDtcbiAgICBpbWcub25sb2FkID0gKCkgPT4gcmVzb2x2ZShpbWcpO1xuICAgIGltZy5vbmVycm9yID0gKCkgPT4gcmVqZWN0KG5ldyBFcnJvcihgRmFpbGVkIHRvIGxvYWQgaW1hZ2UgJyR7dXJsfSdgKSk7XG4gIH0pO1xufVxuXG5leHBvcnQgY29uc3QgbmFtZXNwYWNlOiB0eXBlb2YgY2Ntb2QucmVzb3VyY2VzLnBsYWluID0ge1xuICBsb2FkVGV4dCxcbiAgbG9hZEpTT04sXG4gIGxvYWRJbWFnZSxcbiAgbG9hZFNjcmlwdCxcbiAgbG9hZFN0eWxlc2hlZXQsXG59O1xuIiwgImltcG9ydCAqIGFzIHJlc291cmNlc1BsYWluIGZyb20gJy4vcmVzb3VyY2VzLXBsYWluJztcbmltcG9ydCAqIGFzIHBhdGNoc3RlcHMgZnJvbSAnQGNjbG9hZGVyMy9jb21tb24vdmVuZG9yLWxpYnMvcGF0Y2gtc3RlcHMnO1xuaW1wb3J0IHR5cGUgeyBQYXJzZWRQYXRoLCBQYXRjaEZpbGUgfSBmcm9tICd1bHRpbWF0ZS1jcm9zc2NvZGUtdHlwZWRlZnMvcGF0Y2gtc3RlcHMtbGliJztcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gJ0BjY2xvYWRlcjMvY29tbW9uL3V0aWxzJztcbmltcG9ydCB7IFBhdGNoTGlzdCwgUmVzb3VyY2VQYXRjaExpc3QgfSBmcm9tICcuL3BhdGNoLWxpc3QnO1xuaW1wb3J0ICogYXMgcGF0aHMgZnJvbSAnQGNjbG9hZGVyMy9jb21tb24vcGF0aHMnO1xuaW1wb3J0ICogYXMgdHlwZXMgZnJvbSAndWx0aW1hdGUtY3Jvc3Njb2RlLXR5cGVkZWZzL21vZGxvYWRlci1zdGRsaWIvcmVzb3VyY2VzJztcbmltcG9ydCB7XG4gIFJlc291cmNlR2VuZXJhdG9yLFxuICBSZXNvdXJjZVBhdGNoZXJXaXRoRGVwcyxcbn0gZnJvbSAndWx0aW1hdGUtY3Jvc3Njb2RlLXR5cGVkZWZzL21vZGxvYWRlci1zdGRsaWIvcGF0Y2gtbGlzdCc7XG5cbmV4cG9ydCBjb25zdCBNT0RfUFJPVE9DT0wgPSAnbW9kOic7XG5leHBvcnQgY29uc3QgTU9EX1BST1RPQ09MX1BSRUZJWCA9IGAke01PRF9QUk9UT0NPTH0vL2A7XG5cbmV4cG9ydCBjb25zdCBhc3NldE92ZXJyaWRlc1RhYmxlID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbmV4cG9ydCBjb25zdCB0ZXh0R2VuZXJhdG9ycyA9IG5ldyBQYXRjaExpc3Q8XG4gIFJlc291cmNlR2VuZXJhdG9yPHN0cmluZywgdHlwZXMuVGV4dEdlbmVyYXRvckNvbnRleHQ+XG4+KCk7XG5leHBvcnQgY29uc3QganNvblBhdGNoZXMgPSBuZXcgUmVzb3VyY2VQYXRjaExpc3Q8dW5rbm93biwgdHlwZXMuSlNPTlBhdGNoZXJDb250ZXh0PigpO1xuZXhwb3J0IGNvbnN0IGpzb25HZW5lcmF0b3JzID0gbmV3IFBhdGNoTGlzdDxcbiAgUmVzb3VyY2VHZW5lcmF0b3I8dW5rbm93biwgdHlwZXMuSlNPTkdlbmVyYXRvckNvbnRleHQ+XG4+KCk7XG5leHBvcnQgY29uc3QgaW1hZ2VQYXRjaGVzID0gbmV3IFJlc291cmNlUGF0Y2hMaXN0PEhUTUxDYW52YXNFbGVtZW50LCB0eXBlcy5JbWFnZVBhdGNoZXJDb250ZXh0PigpO1xuZXhwb3J0IGNvbnN0IGltYWdlR2VuZXJhdG9ycyA9IG5ldyBQYXRjaExpc3Q8XG4gIFJlc291cmNlR2VuZXJhdG9yPEhUTUxJbWFnZUVsZW1lbnQgfCBIVE1MQ2FudmFzRWxlbWVudCwgdHlwZXMuSW1hZ2VHZW5lcmF0b3JDb250ZXh0PlxuPigpO1xuXG57XG4gIGxldCBhc3NldE92ZXJyaWRlc0Zyb21Nb2RzID0gbmV3IE1hcDxzdHJpbmcsIG1vZGxvYWRlci5Nb2RbXT4oKTtcblxuICBmb3IgKGxldCBtb2Qgb2YgbW9kbG9hZGVyLmxvYWRlZE1vZHMudmFsdWVzKCkpIHtcbiAgICBmb3IgKGxldCBhc3NldCBvZiBtb2QuYXNzZXRzKSB7XG4gICAgICBpZiAoYXNzZXQuZW5kc1dpdGgoJy5qc29uLnBhdGNoJykgfHwgYXNzZXQuZW5kc1dpdGgoJy5wYXRjaC5qc29uJykpIHtcbiAgICAgICAgbGV0IHBhdGNoZWRBc3NldCA9IGAke2Fzc2V0LnNsaWNlKDAsIC0nLmpzb24ucGF0Y2gnLmxlbmd0aCl9Lmpzb25gO1xuICAgICAgICByZWdpc3RlclBhdGNoc3RlcHNQYXRjaChtb2QsIGFzc2V0LCBwYXRjaGVkQXNzZXQpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgbGV0IG1vZHNXaXRoVGhpc0Fzc2V0ID0gdXRpbHMubWFwR2V0T3JJbnNlcnQoYXNzZXRPdmVycmlkZXNGcm9tTW9kcywgYXNzZXQsIFtdKTtcbiAgICAgIG1vZHNXaXRoVGhpc0Fzc2V0LnB1c2gobW9kKTtcbiAgICB9XG4gIH1cblxuICBmb3IgKGxldCBbYXNzZXQsIG1vZHNXaXRoVGhpc0Fzc2V0XSBvZiBhc3NldE92ZXJyaWRlc0Zyb21Nb2RzKSB7XG4gICAgaWYgKG1vZHNXaXRoVGhpc0Fzc2V0Lmxlbmd0aCA+IDEpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgYENvbmZsaWN0IGJldHdlZW4gb3ZlcnJpZGVzIGZvciAnJHthc3NldH0nIGZvdW5kIGluIG1vZHMgJyR7bW9kc1dpdGhUaGlzQXNzZXRcbiAgICAgICAgICAubWFwKChtb2QpID0+IG1vZC5pZClcbiAgICAgICAgICAuam9pbihcIicsICdcIil9Jy4gVXNpbmcgdGhlIG92ZXJyaWRlIGZyb20gbW9kICcke21vZHNXaXRoVGhpc0Fzc2V0WzBdLmlkfSdgLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBsZXQgb3ZlcnJpZGVQYXRoID0gYCR7bW9kc1dpdGhUaGlzQXNzZXRbMF0uYXNzZXRzRGlyZWN0b3J5fSR7YXNzZXR9YDtcbiAgICBhc3NldE92ZXJyaWRlc1RhYmxlLnNldChhc3NldCwgb3ZlcnJpZGVQYXRoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZWdpc3RlclBhdGNoc3RlcHNQYXRjaChcbiAgbW9kOiBtb2Rsb2FkZXIuTW9kLFxuICBwYXRjaEZpbGVSZWxhdGl2ZVBhdGg6IHN0cmluZyxcbiAgcGF0Y2hlZEFzc2V0UGF0aDogc3RyaW5nLFxuKTogdm9pZCB7XG4gIGpzb25QYXRjaGVzLmFkZChwYXRjaGVkQXNzZXRQYXRoLCB7XG4gICAgZGVwZW5kZW5jaWVzOiAoKSA9PiB7XG4gICAgICByZXR1cm4gcmVzb3VyY2VzUGxhaW4ubG9hZEpTT048UGF0Y2hGaWxlPihcbiAgICAgICAgd3JhcFBhdGhJbnRvVVJMKGAke21vZC5hc3NldHNEaXJlY3Rvcnl9JHtwYXRjaEZpbGVSZWxhdGl2ZVBhdGh9YCkuaHJlZixcbiAgICAgICk7XG4gICAgfSxcblxuICAgIHBhdGNoZXI6IGFzeW5jIChkYXRhLCBwYXRjaERhdGEpID0+IHtcbiAgICAgIGxldCBkZWJ1Z1N0YXRlID0gbmV3IFBhdGNoc3RlcHNDdXN0b21EZWJ1Z1N0YXRlKG1vZCk7XG4gICAgICBkZWJ1Z1N0YXRlLmFkZEZpbGUoWy8qIGZyb21HYW1lICovIGZhbHNlLCBwYXRjaEZpbGVSZWxhdGl2ZVBhdGhdKTtcbiAgICAgIGF3YWl0IHBhdGNoc3RlcHMucGF0Y2goZGF0YSwgcGF0Y2hEYXRhLCBwYXRjaHN0ZXBzUmVzb3VyY2VMb2FkZXIsIGRlYnVnU3RhdGUpO1xuXG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9LFxuICB9KTtcblxuICBmdW5jdGlvbiBwYXRjaHN0ZXBzUmVzb3VyY2VMb2FkZXIoZnJvbUdhbWU6IHN0cmluZyB8IGJvb2xlYW4sIHVybDogc3RyaW5nKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgcmV0dXJuIGZyb21HYW1lID09PSBmYWxzZVxuICAgICAgPyByZXNvdXJjZXNQbGFpbi5sb2FkSlNPTih3cmFwUGF0aEludG9VUkwobW9kLnJlc29sdmVQYXRoKHVybCkpLmhyZWYpXG4gICAgICA6IGxvYWRKU09OKHVybCk7XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRUZXh0KFxuICBwYXRoOiBzdHJpbmcsXG4gIG9wdGlvbnM/OiB0eXBlcy5Mb2FkVGV4dE9wdGlvbnMgfCBudWxsLFxuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgPz8ge307XG5cbiAgbGV0IHsgcmVzb2x2ZWRQYXRoLCByZXF1ZXN0ZWRBc3NldCB9ID0gcmVzb2x2ZVBhdGhBZHZhbmNlZChwYXRoLCBvcHRpb25zKTtcblxuICBpZiAoKG9wdGlvbnMuYWxsb3dHZW5lcmF0b3JzID8/IHRydWUpICYmIHJlcXVlc3RlZEFzc2V0ICE9IG51bGwpIHtcbiAgICBsZXQgZ2VuZXJhdG9ycyA9IHRleHRHZW5lcmF0b3JzLmZvclBhdGgocmVxdWVzdGVkQXNzZXQpO1xuICAgIGlmIChnZW5lcmF0b3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIGxldCBjdHg6IHR5cGVzLlRleHRHZW5lcmF0b3JDb250ZXh0ID0geyByZXNvbHZlZFBhdGgsIHJlcXVlc3RlZEFzc2V0LCBvcHRpb25zIH07XG4gICAgICByZXR1cm4gcnVuUmVzb3VyY2VHZW5lcmF0b3IoJ3RleHQgZmlsZScsIHBhdGgsIGdlbmVyYXRvcnMsIGN0eCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc291cmNlc1BsYWluLmxvYWRUZXh0KHdyYXBQYXRoSW50b1VSTChyZXNvbHZlZFBhdGgpLmhyZWYpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZEpTT048VCA9IHVua25vd24+KFxuICBwYXRoOiBzdHJpbmcsXG4gIG9wdGlvbnM/OiB0eXBlcy5Mb2FkSlNPTk9wdGlvbnMgfCBudWxsLFxuKTogUHJvbWlzZTxUPiB7XG4gIG9wdGlvbnMgPSBvcHRpb25zID8/IHt9O1xuXG4gIGxldCB7IHJlc29sdmVkUGF0aCwgcmVxdWVzdGVkQXNzZXQgfSA9IHJlc29sdmVQYXRoQWR2YW5jZWQocGF0aCwgb3B0aW9ucyk7XG4gIGxldCBkYXRhOiB1bmtub3duID0gbnVsbCE7XG4gIGxldCBzaG91bGRGZXRjaFJlYWxEYXRhID0gdHJ1ZTtcblxuICBpZiAoKG9wdGlvbnMuYWxsb3dHZW5lcmF0b3JzID8/IHRydWUpICYmIHJlcXVlc3RlZEFzc2V0ICE9IG51bGwpIHtcbiAgICBsZXQgZ2VuZXJhdG9ycyA9IGpzb25HZW5lcmF0b3JzLmZvclBhdGgocmVxdWVzdGVkQXNzZXQpO1xuICAgIGlmIChnZW5lcmF0b3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIGxldCBjdHg6IHR5cGVzLkpTT05HZW5lcmF0b3JDb250ZXh0ID0geyByZXNvbHZlZFBhdGgsIHJlcXVlc3RlZEFzc2V0LCBvcHRpb25zIH07XG4gICAgICBkYXRhID0gYXdhaXQgcnVuUmVzb3VyY2VHZW5lcmF0b3IoJ0pTT04gZmlsZScsIHBhdGgsIGdlbmVyYXRvcnMsIGN0eCk7XG4gICAgICBzaG91bGRGZXRjaFJlYWxEYXRhID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgaWYgKHNob3VsZEZldGNoUmVhbERhdGEpIHtcbiAgICBkYXRhID0gYXdhaXQgcmVzb3VyY2VzUGxhaW4ubG9hZEpTT04od3JhcFBhdGhJbnRvVVJMKHJlc29sdmVkUGF0aCkuaHJlZik7XG4gIH1cblxuICBpZiAocmVxdWVzdGVkQXNzZXQgIT0gbnVsbCkge1xuICAgIGxldCBwYXRjaGVycyA9IGpzb25QYXRjaGVzLmZvclBhdGgocmVxdWVzdGVkQXNzZXQpO1xuICAgIGlmIChwYXRjaGVycy5sZW5ndGggPiAwKSB7XG4gICAgICBsZXQgY3R4OiB0eXBlcy5KU09OUGF0Y2hlckNvbnRleHQgPSB7IHJlc29sdmVkUGF0aCwgcmVxdWVzdGVkQXNzZXQsIG9wdGlvbnMgfTtcbiAgICAgIGRhdGEgPSBhd2FpdCBydW5SZXNvdXJjZVBhdGNoZXMoJ0pTT04gZmlsZScsIHBhdGgsIGRhdGEsIHBhdGNoZXJzLCBjdHgpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkYXRhIGFzIFQ7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkSW1hZ2UoXG4gIHBhdGg6IHN0cmluZyxcbiAgb3B0aW9ucz86IHR5cGVzLkxvYWRJbWFnZU9wdGlvbnMgfCBudWxsLFxuKTogUHJvbWlzZTxIVE1MSW1hZ2VFbGVtZW50IHwgSFRNTENhbnZhc0VsZW1lbnQ+IHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgPz8ge307XG5cbiAgbGV0IHsgcmVzb2x2ZWRQYXRoLCByZXF1ZXN0ZWRBc3NldCB9ID0gcmVzb2x2ZVBhdGhBZHZhbmNlZChwYXRoLCBvcHRpb25zKTtcbiAgbGV0IGRhdGE6IEhUTUxJbWFnZUVsZW1lbnQgfCBIVE1MQ2FudmFzRWxlbWVudCA9IG51bGwhO1xuICBsZXQgc2hvdWxkRmV0Y2hSZWFsRGF0YSA9IHRydWU7XG5cbiAgaWYgKChvcHRpb25zLmFsbG93R2VuZXJhdG9ycyA/PyB0cnVlKSAmJiByZXF1ZXN0ZWRBc3NldCAhPSBudWxsKSB7XG4gICAgbGV0IGdlbmVyYXRvcnMgPSBpbWFnZUdlbmVyYXRvcnMuZm9yUGF0aChyZXF1ZXN0ZWRBc3NldCk7XG4gICAgaWYgKGdlbmVyYXRvcnMubGVuZ3RoID4gMCkge1xuICAgICAgbGV0IGN0eDogdHlwZXMuSW1hZ2VHZW5lcmF0b3JDb250ZXh0ID0geyByZXNvbHZlZFBhdGgsIHJlcXVlc3RlZEFzc2V0LCBvcHRpb25zIH07XG4gICAgICBkYXRhID0gYXdhaXQgcnVuUmVzb3VyY2VHZW5lcmF0b3IoJ2ltYWdlJywgcGF0aCwgZ2VuZXJhdG9ycywgY3R4KTtcbiAgICAgIHNob3VsZEZldGNoUmVhbERhdGEgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBpZiAoc2hvdWxkRmV0Y2hSZWFsRGF0YSkge1xuICAgIGNvbnN0IHVybCA9IGAvJHtyZXNvbHZlZFBhdGh9YDtcbiAgICBkYXRhID0gYXdhaXQgcmVzb3VyY2VzUGxhaW4ubG9hZEltYWdlKHVybCk7XG4gIH1cblxuICBpZiAocmVxdWVzdGVkQXNzZXQgIT0gbnVsbCkge1xuICAgIGxldCBwYXRjaGVycyA9IGltYWdlUGF0Y2hlcy5mb3JQYXRoKHJlcXVlc3RlZEFzc2V0KTtcbiAgICBpZiAocGF0Y2hlcnMubGVuZ3RoID4gMCkge1xuICAgICAgaWYgKCEoZGF0YSBpbnN0YW5jZW9mIEhUTUxDYW52YXNFbGVtZW50KSkge1xuICAgICAgICBkYXRhID0gaW1hZ2VUb0NhbnZhcyhkYXRhKTtcbiAgICAgIH1cbiAgICAgIGxldCBjdHg6IHR5cGVzLkltYWdlUGF0Y2hlckNvbnRleHQgPSB7IHJlc29sdmVkUGF0aCwgcmVxdWVzdGVkQXNzZXQsIG9wdGlvbnMgfTtcbiAgICAgIGRhdGEgPSBhd2FpdCBydW5SZXNvdXJjZVBhdGNoZXMoJ2ltYWdlJywgcGF0aCwgZGF0YSwgcGF0Y2hlcnMsIGN0eCk7XG4gICAgfVxuICB9XG5cbiAgc3dpdGNoIChvcHRpb25zLnJldHVybkNhbnZhcykge1xuICAgIGNhc2UgJ2Fsd2F5cyc6XG4gICAgICBpZiAoIShkYXRhIGluc3RhbmNlb2YgSFRNTENhbnZhc0VsZW1lbnQpKSBkYXRhID0gaW1hZ2VUb0NhbnZhcyhkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ25ldmVyJzpcbiAgICAgIGlmIChkYXRhIGluc3RhbmNlb2YgSFRNTENhbnZhc0VsZW1lbnQpIGRhdGEgPSBhd2FpdCBjYW52YXNUb0ltYWdlKGRhdGEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnaWYtcGF0Y2hlZCc6XG4gICAgICBicmVhaztcbiAgfVxuXG4gIHJldHVybiBkYXRhO1xuXG4gIGZ1bmN0aW9uIGltYWdlVG9DYW52YXMoaW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQpOiBIVE1MQ2FudmFzRWxlbWVudCB7XG4gICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIGNhbnZhcy53aWR0aCA9IGltYWdlLndpZHRoO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XG4gICAgbGV0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpITtcbiAgICBjdHguZHJhd0ltYWdlKGltYWdlLCAwLCAwKTtcbiAgICByZXR1cm4gY2FudmFzO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FudmFzVG9JbWFnZShjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KTogUHJvbWlzZTxIVE1MSW1hZ2VFbGVtZW50PiB7XG4gICAgcmV0dXJuIHJlc291cmNlc1BsYWluLmxvYWRJbWFnZShjYW52YXMudG9EYXRhVVJMKCdpbWFnZS9wbmcnKSk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gcnVuUmVzb3VyY2VHZW5lcmF0b3I8RGF0YSwgQ3R4PihcbiAga2luZDogc3RyaW5nLFxuICBwYXRoOiBzdHJpbmcsXG4gIG1hdGNoaW5nR2VuZXJhdG9yczogQXJyYXk8UmVzb3VyY2VHZW5lcmF0b3I8RGF0YSwgQ3R4Pj4sXG4gIGNvbnRleHQ6IEN0eCxcbik6IFByb21pc2U8RGF0YT4ge1xuICB0cnkge1xuICAgIGlmIChtYXRjaGluZ0dlbmVyYXRvcnMubGVuZ3RoID09PSAxKSB7XG4gICAgICBsZXQgZ2VuZXJhdG9yID0gbWF0Y2hpbmdHZW5lcmF0b3JzWzBdO1xuICAgICAgcmV0dXJuIGdlbmVyYXRvcihjb250ZXh0KTtcbiAgICB9IGVsc2UgaWYgKG1hdGNoaW5nR2VuZXJhdG9ycy5sZW5ndGggPiAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBDb25mbGljdCBiZXR3ZWVuICR7bWF0Y2hpbmdHZW5lcmF0b3JzLmxlbmd0aH0gbWF0Y2hpbmcgZ2VuZXJhdG9ycyBmb3IgJyR7cGF0aH0nIGZvdW5kYCxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigndW5yZWFjaGFibGUnKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmICh1dGlscy5lcnJvckhhc01lc3NhZ2UoZXJyKSkge1xuICAgICAgZXJyLm1lc3NhZ2UgPSBgRmFpbGVkIHRvIGdlbmVyYXRlICR7a2luZH0gJyR7cGF0aH0nOiAke2Vyci5tZXNzYWdlfWA7XG4gICAgfVxuICAgIHRocm93IGVycjtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBydW5SZXNvdXJjZVBhdGNoZXM8RGF0YSwgQ3R4PihcbiAga2luZDogc3RyaW5nLFxuICBwYXRoOiBzdHJpbmcsXG4gIGRhdGE6IERhdGEsXG4gIHBhdGNoZXJzOiBBcnJheTxSZXNvdXJjZVBhdGNoZXJXaXRoRGVwczxEYXRhLCB1bmtub3duLCBDdHg+PixcbiAgY29udGV4dDogQ3R4LFxuKTogUHJvbWlzZTxEYXRhPiB7XG4gIHRyeSB7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWZpbmVkICovXG5cbiAgICBsZXQgYWxsRGVwZW5kZW5jaWVzOiB1bmtub3duW10gPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgIHBhdGNoZXJzLm1hcCgocGF0Y2hlcikgPT5cbiAgICAgICAgcGF0Y2hlci5kZXBlbmRlbmNpZXMgIT0gbnVsbCA/IHBhdGNoZXIuZGVwZW5kZW5jaWVzKGNvbnRleHQpIDogdW5kZWZpbmVkLFxuICAgICAgKSxcbiAgICApO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRjaGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IHBhdGNoZXIgPSBwYXRjaGVyc1tpXTtcbiAgICAgIGxldCBkZXBzID0gYWxsRGVwZW5kZW5jaWVzW2ldO1xuICAgICAgbGV0IG5ld0RhdGEgPSBhd2FpdCBwYXRjaGVyLnBhdGNoZXIoZGF0YSwgZGVwcywgY29udGV4dCk7XG4gICAgICBpZiAobmV3RGF0YSAhPT0gdW5kZWZpbmVkKSBkYXRhID0gbmV3RGF0YTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YTtcblxuICAgIC8qIGVzbGludC1lbmFibGUgbm8tdW5kZWZpbmVkICovXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmICh1dGlscy5lcnJvckhhc01lc3NhZ2UoZXJyKSkge1xuICAgICAgZXJyLm1lc3NhZ2UgPSBgRmFpbGVkIHRvIHBhdGNoICR7a2luZH0gJyR7cGF0aH0nOiAke2Vyci5tZXNzYWdlfWA7XG4gICAgfVxuICAgIHRocm93IGVycjtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVBhdGgodXJpOiBzdHJpbmcsIG9wdGlvbnM/OiB0eXBlcy5SZXNvbHZlUGF0aE9wdGlvbnMgfCBudWxsKTogc3RyaW5nIHtcbiAgcmV0dXJuIHJlc29sdmVQYXRoQWR2YW5jZWQodXJpLCBvcHRpb25zKS5yZXNvbHZlZFBhdGg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlUGF0aFRvVVJMKHBhdGg6IHN0cmluZywgb3B0aW9ucz86IHR5cGVzLlJlc29sdmVQYXRoT3B0aW9ucyB8IG51bGwpOiBzdHJpbmcge1xuICByZXR1cm4gd3JhcFBhdGhJbnRvVVJMKHJlc29sdmVQYXRoKHBhdGgsIG9wdGlvbnMpKS5ocmVmO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZVBhdGhBZHZhbmNlZChcbiAgdXJpOiBzdHJpbmcsXG4gIG9wdGlvbnM/OiB0eXBlcy5SZXNvbHZlUGF0aE9wdGlvbnMgfCBudWxsLFxuKTogdHlwZXMuUmVzb2x2ZVBhdGhBZHZhbmNlZFJlc3VsdCB7XG4gIG9wdGlvbnMgPSBvcHRpb25zID8/IHt9O1xuXG4gIGxldCByZXNvbHZlZFBhdGg6IHN0cmluZztcbiAgbGV0IHJlcXVlc3RlZEFzc2V0OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICBsZXQgbW9kUmVzb3VyY2VQYXRoID0gYXBwbHlNb2RVUkxQcm90b2NvbCh1cmkpO1xuICBpZiAobW9kUmVzb3VyY2VQYXRoICE9IG51bGwpIHtcbiAgICByZXNvbHZlZFBhdGggPSBtb2RSZXNvdXJjZVBhdGg7XG4gIH0gZWxzZSB7XG4gICAgbGV0IG5vcm1hbGl6ZWRQYXRoID0gcGF0aHMubm9ybWFsaXplKHVyaSk7XG5cbiAgICBpZiAocGF0aHMuaXNBYnNvbHV0ZShub3JtYWxpemVkUGF0aCkpIHtcbiAgICAgIC8vIGBqYWlsUmVsYXRpdmVgIGNvdWxkJ3ZlIGJlZW4gcGVyZm9ybWVkIGluc3RlYWQsIGJ1dCBpdCBoYXMgdGhlIHNhbWVcbiAgICAgIC8vIGVmZmVjdCBhcyBgc3RyaXBSb290YCBvbiBhYnNvbHV0ZSBwYXRocyBoZXJlIGJlY2F1c2UgdGhlIHBhdGggaGFzXG4gICAgICAvLyBhbHJlYWR5IGJlZW4gbm9ybWFsaXplZCwgdGhlcmVmb3JlIHRoZSBtb3JlIHRpbWUtZXhwZW5zaXZlIGZ1bmN0aW9uIGNhblxuICAgICAgLy8gYmUgYXZvaWRlZFxuICAgICAgcmVzb2x2ZWRQYXRoID0gcGF0aHMuc3RyaXBSb290KG5vcm1hbGl6ZWRQYXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGdhbWVBc3NldHNQYXRoID0gcGF0aHMuc3RyaXBSb290KGdldEdhbWVBc3NldHNVUkwoKS5wYXRobmFtZSk7XG4gICAgICByZXNvbHZlZFBhdGggPSBwYXRocy5qYWlsUmVsYXRpdmUocGF0aHMuam9pbihnYW1lQXNzZXRzUGF0aCwgbm9ybWFsaXplZFBhdGgpKTtcblxuICAgICAgaWYgKChvcHRpb25zLmFsbG93UGF0Y2hpbmcgPz8gdHJ1ZSkgJiYgcmVzb2x2ZWRQYXRoLnN0YXJ0c1dpdGgoZ2FtZUFzc2V0c1BhdGgpKSB7XG4gICAgICAgIHJlcXVlc3RlZEFzc2V0ID0gcmVzb2x2ZWRQYXRoLnNsaWNlKGdhbWVBc3NldHNQYXRoLmxlbmd0aCk7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMuYWxsb3dBc3NldE92ZXJyaWRlcyA/PyB0cnVlKSB7XG4gICAgICAgICAgbGV0IG92ZXJyaWRlUGF0aCA9IGFzc2V0T3ZlcnJpZGVzVGFibGUuZ2V0KHJlcXVlc3RlZEFzc2V0KTtcbiAgICAgICAgICBpZiAob3ZlcnJpZGVQYXRoICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJlc29sdmVkUGF0aCA9IG92ZXJyaWRlUGF0aDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4geyByZXNvbHZlZFBhdGgsIHJlcXVlc3RlZEFzc2V0IH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwUGF0aEludG9VUkwocGF0aDogc3RyaW5nKTogVVJMIHtcbiAgbGV0IHVybCA9IHV0aWxzLmN3ZEZpbGVQYXRoVG9VUkwocGF0aCwgZ2V0R2FtZUFzc2V0c1VSTCgpLmhyZWYpO1xuICB1cmwuaHJlZiArPSBnZXRDYWNoZVN1ZmZpeCgpO1xuICByZXR1cm4gdXJsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0R2FtZUFzc2V0c1VSTCgpOiBVUkwge1xuICBsZXQgc3RyOiBzdHJpbmc7XG4gIGlmICh0eXBlb2YgaWcgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgc3RyID0gaWcucm9vdDtcbiAgfSBlbHNlIGlmICh3aW5kb3cuSUdfUk9PVCAhPSBudWxsKSB7XG4gICAgc3RyID0gd2luZG93LklHX1JPT1Q7XG4gIH0gZWxzZSB7XG4gICAgc3RyID0gJyc7XG4gIH1cbiAgcmV0dXJuIG5ldyBVUkwoc3RyLCBkb2N1bWVudC5iYXNlVVJJKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENhY2hlU3VmZml4KCk6IHN0cmluZyB7XG4gIGlmICh0eXBlb2YgaWcgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGlnLmdldENhY2hlU3VmZml4KCk7XG4gIH0gZWxzZSBpZiAod2luZG93LklHX0dBTUVfQ0FDSEUgIT0gbnVsbCAmJiB3aW5kb3cuSUdfR0FNRV9DQUNIRSkge1xuICAgIHJldHVybiBgP25vY2FjaGU9JHt3aW5kb3cuSUdfR0FNRV9DQUNIRX1gO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBseU1vZFVSTFByb3RvY29sKGZ1bGxVUkk6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICBpZiAoIWZ1bGxVUkkuc3RhcnRzV2l0aChNT0RfUFJPVE9DT0xfUFJFRklYKSkgcmV0dXJuIG51bGw7XG5cbiAgdHJ5IHtcbiAgICBsZXQgdXJpID0gZnVsbFVSSS5zbGljZShNT0RfUFJPVE9DT0xfUFJFRklYLmxlbmd0aCk7XG4gICAgaWYgKHVyaS5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigndGhlIFVSSSBpcyBlbXB0eScpO1xuICAgIH1cblxuICAgIGxldCBtb2RJRFNlcGFyYXRvckluZGV4ID0gdXJpLmluZGV4T2YoJy8nKTtcbiAgICBpZiAobW9kSURTZXBhcmF0b3JJbmRleCA8IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIicvJyBhZnRlciB0aGUgbW9kIElEIGlzIG1pc3NpbmdcIik7XG4gICAgfVxuXG4gICAgbGV0IG1vZElEID0gdXJpLnNsaWNlKDAsIG1vZElEU2VwYXJhdG9ySW5kZXgpO1xuICAgIGlmIChtb2RJRC5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigndGhlIG1vZCBJRCBpcyBlbXB0eScpO1xuICAgIH1cblxuICAgIGxldCBmaWxlUGF0aCA9IHVyaS5zbGljZShtb2RJRFNlcGFyYXRvckluZGV4ICsgMSk7XG4gICAgaWYgKGZpbGVQYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCd0aGUgZmlsZSBwYXRoIGlzIGVtcHR5Jyk7XG4gICAgfVxuXG4gICAgbGV0IG1vZCA9IG1vZGxvYWRlci5sb2FkZWRNb2RzLmdldChtb2RJRCk7XG4gICAgaWYgKG1vZCA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYG1vZCAnJHttb2RJRH0nIG5vdCBmb3VuZGApO1xuICAgIH1cblxuICAgIHJldHVybiBtb2QucmVzb2x2ZVBhdGgoZmlsZVBhdGgpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAodXRpbHMuZXJyb3JIYXNNZXNzYWdlKGVycikpIHtcbiAgICAgIGVyci5tZXNzYWdlID0gYEludmFsaWQgJyR7TU9EX1BST1RPQ09MX1BSRUZJWH0nIFVSTCAnJHtmdWxsVVJJfSc6ICR7ZXJyLm1lc3NhZ2V9YDtcbiAgICB9XG4gICAgdGhyb3cgZXJyO1xuICB9XG59XG5cbmNsYXNzIFBhdGNoc3RlcHNDdXN0b21EZWJ1Z1N0YXRlIGV4dGVuZHMgcGF0Y2hzdGVwcy5EZWJ1Z1N0YXRlIHtcbiAgcHVibGljIGNvbnN0cnVjdG9yKHByaXZhdGUgY3VycmVudE1vZDogbW9kbG9hZGVyLk1vZCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBwdWJsaWMgdHJhbnNsYXRlUGFyc2VkUGF0aChwYXJzZWRQYXRoOiBQYXJzZWRQYXRoKTogc3RyaW5nIHtcbiAgICBpZiAocGFyc2VkUGF0aCAhPSBudWxsKSB7XG4gICAgICBsZXQgW3Byb3RvY29sLCBwYXRoXSA9IHBhcnNlZFBhdGg7XG5cbiAgICAgIC8vIG5vdGUgdGhhdCBzd2l0Y2gtY2FzZSBwZXJmb3JtcyBzdHJpY3QsIGkuZS4gYD09PWAsIGNvbXBhcmlzb25zXG4gICAgICBzd2l0Y2ggKHByb3RvY29sKSB7XG4gICAgICAgIGNhc2UgdHJ1ZTpcbiAgICAgICAgY2FzZSAnZ2FtZSc6XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmVQYXRoKHBhdGgpO1xuXG4gICAgICAgIGNhc2UgZmFsc2U6XG4gICAgICAgIGNhc2UgJ21vZCc6XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudE1vZC5yZXNvbHZlUGF0aChwYXRoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBmYWxsYmFjayB0byB0aGUgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBvbiB1bmtub3duIHBhdGhzIGFuZCBwcm90b2NvbHNcbiAgICByZXR1cm4gc3VwZXIudHJhbnNsYXRlUGFyc2VkUGF0aChwYXJzZWRQYXRoKTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgbmFtZXNwYWNlOiB0eXBlb2YgY2Ntb2QucmVzb3VyY2VzID0ge1xuICBwbGFpbjogcmVzb3VyY2VzUGxhaW4ubmFtZXNwYWNlLFxuICBhc3NldE92ZXJyaWRlc1RhYmxlLFxuICB0ZXh0R2VuZXJhdG9ycyxcbiAganNvblBhdGNoZXMsXG4gIGpzb25HZW5lcmF0b3JzLFxuICBpbWFnZVBhdGNoZXMsXG4gIGltYWdlR2VuZXJhdG9ycyxcbiAgbG9hZFRleHQsXG4gIGxvYWRKU09OLFxuICBsb2FkSW1hZ2UsXG4gIHJlc29sdmVQYXRoLFxuICByZXNvbHZlUGF0aFRvVVJMLFxuICByZXNvbHZlUGF0aEFkdmFuY2VkLFxuICB3cmFwUGF0aEludG9VUkwsXG4gIGdldEdhbWVBc3NldHNVUkwsXG4gIGdldENhY2hlU3VmZml4LFxufTtcbiIsICIvKiBlc2xpbnQtZGlzYWJsZSBjb25zaXN0ZW50LXJldHVybiAqL1xuLy8gVGhpcyBtYXkgYmUgb25lIG9mIHRoZSB3b3JzdCBwaWVjZXMgb2YgdGhpcyBjb2RlYmFzZS4gUGxlYXNlIGRvbid0IGp1ZGdlIHRvbyBoZWF2aWx5IVxuXG5pbXBvcnQgc2VtdmVyIGZyb20gJ0BjY2xvYWRlcjMvY29tbW9uL3ZlbmRvci1saWJzL3NlbXZlcic7XG5pbXBvcnQgdHlwZSB7IExvY2FsaXplZFN0cmluZyB9IGZyb20gJ3VsdGltYXRlLWNyb3NzY29kZS10eXBlZGVmcy9maWxlLXR5cGVzL21vZC1tYW5pZmVzdCc7XG5cbmludGVyZmFjZSBMZWdhY3lNb2Qge1xuICBiYXNlRGlyZWN0b3J5OiBzdHJpbmc7XG4gIG5hbWU6IExvY2FsaXplZFN0cmluZztcbiAgZGlzcGxheU5hbWU6IExvY2FsaXplZFN0cmluZztcbn1cblxuY29uc3QgUGx1Z2luID0gY2xhc3MgUGx1Z2luIHtcbiAgcHVibGljIHByZWxvYWQoKTogdm9pZCB7fVxuICBwdWJsaWMgcG9zdGxvYWQoKTogdm9pZCB7fVxuICBwdWJsaWMgcHJlc3RhcnQoKTogdm9pZCB7fVxuICBwdWJsaWMgbWFpbigpOiB2b2lkIHt9XG59O1xuXG4vLyBUaGUgZGUtZmFjdG8gU2ltcGxpZnkgQ29tcGF0IExheWVyXG4vLyA8aHR0cHM6Ly9naXRodWIuY29tL0NDRGlyZWN0TGluay9DQ0xvYWRlci9ibG9iLzBiMjM1MTI1NDNiZjg1ZWYyMTc1N2IzNjQ5MmY5OTFjMDNhMTZlZjcvYXNzZXRzL21vZHMvc2ltcGxpZnkvbW9kLmpzPlxuY29uc3QgX3NpbXBsaWZ5ID0ge1xuICB2ZXJzaW9uOiAnMi4xNC4yJyxcbiAgdXBkYXRlSGFuZGxlcnM6IFtdIGFzIEFycmF5PCgpID0+IHZvaWQ+LFxuXG4gIHJlZ2lzdGVyVXBkYXRlKGhhbmRsZXI/OiAoKSA9PiB2b2lkKSB7XG4gICAgaWYgKGhhbmRsZXIgJiYgdHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMudXBkYXRlSGFuZGxlcnMucHVzaChoYW5kbGVyKTtcbiAgICB9XG4gIH0sXG4gIC8vIHRlY2huaWNhbGx5IG5ldmVyIGNhbGxlZCBieSB1cywgYnV0IGxldCdzIGtlZXAgaXQgaW4ganVzdCB0byBiZSBzdXJlLlxuICBmaXJlVXBkYXRlKCkge1xuICAgIGZvciAoY29uc3QgaGFuZGxlciBvZiB0aGlzLnVwZGF0ZUhhbmRsZXJzKSB7XG4gICAgICBoYW5kbGVyKCk7XG4gICAgfVxuICB9LFxuXG4gIGdldE1vZChuYW1lOiBzdHJpbmcpOiBMZWdhY3lNb2QgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IG1vZCA9IG1vZGxvYWRlci5sb2FkZWRNb2RzLmdldChuYW1lKTtcbiAgICBpZiAoIW1vZCkgcmV0dXJuO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGJhc2VEaXJlY3Rvcnk6IG1vZC5iYXNlRGlyZWN0b3J5LFxuICAgICAgbmFtZTogbW9kLmlkLFxuICAgICAgZGlzcGxheU5hbWU6IG1vZC5tYW5pZmVzdC50aXRsZSB8fCBtb2QuaWQsXG4gICAgfTtcbiAgfSxcblxuICAvLyBzZXJpb3VzbHk/IDpoYXJvbGQ6XG4gIGp1bXBIaWdoKCkge1xuICAgIGlnLmdhbWUucGxheWVyRW50aXR5LmRvSnVtcCgxODUsIDE2LCAxMDApO1xuICB9LFxufTtcblxuLy8gRm9yIHNvbWUgcmVhc29uIHRoaXMgd2FzIGp1c3QgYW4gYWxpYXMgdG8gYHdpbmRvd2A/Pz8/XG5jb25zdCBjYyA9IHdpbmRvdztcbmNvbnN0IHNpbXBsaWZ5ID0gbmV3IFByb3h5KF9zaW1wbGlmeSwge1xuICBnZXQodGFyZ2V0LCBwKSB7XG4gICAgLy8gVGhpcyBpcyBob25lc3RseSBqdXN0IHZpbGVcbiAgICBjb25zdCBwcm9wID0gdGFyZ2V0W3AgYXMga2V5b2YgdHlwZW9mIF9zaW1wbGlmeV07XG4gICAgcCA9IFN0cmluZyhwKTtcblxuICAgIC8vIFNob3VsZCBpdCBldmVyIG9jY3VyIHRoYXQgSSd2ZSBmb3Jnb3R0ZW4gc29tZXRoaW5nIGluIHRoZSBjb21wYXQgbGF5ZXIsIGxldCB0aGUgdXNlciBrbm93LlxuICAgIGlmICghcHJvcCkge1xuICAgICAgY29uc29sZS53YXJuKG5ldyBFcnJvcihgQ291bGRuJ3QgZmluZCAnJHtwfScgaW4gU2ltcGxpZnkgY29tcGF0IGxheWVyLiBQbGVhc2UgcmVwb3J0IWApKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zb2xlLmRlYnVnKG5ldyBFcnJvcihgU2ltcGxpZnkgcHJvcGVydHkgJyR7cH0nIHJlcXVlc3RlZC4gVGhpcyBpcyBkZXByZWNhdGVkLmApKTtcbiAgICByZXR1cm4gcHJvcDtcbiAgfSxcbn0pO1xuXG5PYmplY3QuYXNzaWduKHdpbmRvdywge1xuICBjYyxcbiAgc2ltcGxpZnksXG4gIFBsdWdpbixcbiAgc2VtdmVyLFxuICB2ZXJzaW9uczogW1xuICAgIC4uLkFycmF5LmZyb20obW9kbG9hZGVyLmluc3RhbGxlZE1vZHMudmFsdWVzKCkpLmZsYXRNYXAoKG1vZCkgPT4ge1xuICAgICAgaWYgKCFtb2QudmVyc2lvbikge1xuICAgICAgICBjb25zb2xlLmRlYnVnKFxuICAgICAgICAgIGAke21vZC5pZH0gd2FzIGZvdW5kIHRvIGhhdmUgbm8gdmVyc2lvbiBkZWZpbmVkIGR1cmluZyBjb25zdHJ1Y3Rpb24gb2Ygd2luZG93LnZlcnNpb25zYCxcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFtbbW9kLmlkLCBtb2QudmVyc2lvbi50b1N0cmluZygpXSBhcyBjb25zdF07XG4gICAgfSksXG4gICAgLi4uQXJyYXkuZnJvbShtb2Rsb2FkZXIudmlydHVhbFBhY2thZ2VzKS5tYXAoKFtpZCwgdmVyXSkgPT4gW2lkLCB2ZXIudG9TdHJpbmcoKV0gYXMgY29uc3QpLFxuICBdLnJlZHVjZTxSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+PigoYWNjLCBbaWQsIHZlcl0pID0+IHtcbiAgICBhY2NbaWRdID0gdmVyO1xuICAgIHJldHVybiBhY2M7XG4gIH0sIHt9KSxcbiAgYWN0aXZlTW9kczogWy4uLm1vZGxvYWRlci5sb2FkZWRNb2RzLnZhbHVlcygpXSxcbiAgaW5hY3RpdmVNb2RzOiBbLi4ubW9kbG9hZGVyLmluc3RhbGxlZE1vZHMudmFsdWVzKCldLmZpbHRlcihcbiAgICAobW9kKSA9PiAhbW9kbG9hZGVyLm1vZERhdGFTdG9yYWdlLmlzTW9kRW5hYmxlZChtb2QuaWQpLFxuICApLFxufSk7XG5cbi8vIEZvciBzb21lIHJlYXNvbiB0aGVzZSB3ZXJlIGRpc3RpbmN0IGV2ZW50cyBkZXNwaXRlIHRoZSBmYWN0IHRoYXQgdGhleSBmaXJlXG4vLyByaWdodCBhZnRlciBlYWNob3RoZXIuIEFmdGVyIHRoZSBgbWFpbmAgc3RhZ2UgcmFuLCBgbW9kc0xvYWRlZGAgd2FzXG4vLyBkaXNwYXRjaGVkLCB3aGlsZSBTaW1wbGlmeSB3YXMgYWxyZWFkeSBsaXN0ZW5pbmcgZm9yIGl0LCBjYXVzaW5nIGl0IHRvXG4vLyB0cmlnZ2VyIGltbWVkaWF0ZWx5LiBTdHJhbmdlIGRlY2lzaW9uIHRvIGV2ZW4gaW5jbHVkZSBgc2ltcGxpZnlJbml0aWFsaXplZGAuXG5kb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ21vZHNMb2FkZWQnLCAoKSA9PiB7XG4gIGRvY3VtZW50LmJvZHkuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ3NpbXBsaWZ5SW5pdGlhbGl6ZWQnLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xufSk7XG4iLCAibGV0IF9jYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xuXG5mdW5jdGlvbiBfZ2V0VG1wQ29udGV4dCh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB7XG4gIGlmICghX2NhbnZhcykge1xuICAgIF9jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgfVxuICBfY2FudmFzLndpZHRoID0gd2lkdGg7XG4gIF9jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gIGNvbnN0IGNvbnRleHQgPSBfY2FudmFzLmdldENvbnRleHQoJzJkJywgeyB3aWxsUmVhZEZyZXF1ZW50bHk6IHRydWUgfSk7XG4gIGlmICghY29udGV4dCkgdGhyb3cgbmV3IEVycm9yKCdTb21ldGhpbmcgd2VudCB3cm9uZyBnZXR0aW5nIHRoZSBjb250ZXh0Jyk7XG4gIGNvbnRleHQ/LmNsZWFyUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgcmV0dXJuIGNvbnRleHQ7XG59XG5cbmlnLkltYWdlUGF0dGVybi5pbmplY3Qoe1xuICBpbml0QnVmZmVyKCkge1xuICAgIGNvbnN0IHsgc2NhbGUgfSA9IGlnLnN5c3RlbTtcbiAgICB0aGlzLnNvdXJjZVggPSB0aGlzLnNvdXJjZVggPyB0aGlzLnNvdXJjZVggKiBzY2FsZSA6IDA7XG4gICAgdGhpcy5zb3VyY2VZID0gdGhpcy5zb3VyY2VZID8gdGhpcy5zb3VyY2VZICogc2NhbGUgOiAwO1xuICAgIHRoaXMud2lkdGggPSAodGhpcy53aWR0aCA/IHRoaXMud2lkdGggOiB0aGlzLnNvdXJjZUltYWdlLndpZHRoKSAqIHNjYWxlO1xuICAgIHRoaXMuaGVpZ2h0ID0gKHRoaXMuaGVpZ2h0ID8gdGhpcy5oZWlnaHQgOiB0aGlzLnNvdXJjZUltYWdlLmhlaWdodCkgKiBzY2FsZTtcbiAgICBjb25zdCBvcHQgPSBpZy5JbWFnZVBhdHRlcm4uT1BUO1xuICAgIGNvbnN0IHdpZHRoRmFjdG9yID0gTWF0aC5jZWlsKFxuICAgICAgKHRoaXMub3B0TW9kZSA9PT0gb3B0Lk5PTkUgfHwgdGhpcy5vcHRNb2RlID09PSBvcHQuUkVQRUFUX1kgPyAxIDogMjU2KSAvIHRoaXMud2lkdGgsXG4gICAgKTtcbiAgICBjb25zdCBoZWlnaHRGYWN0b3IgPSBNYXRoLmNlaWwoXG4gICAgICAodGhpcy5vcHRNb2RlID09PSBvcHQuTk9ORSB8fCB0aGlzLm9wdE1vZGUgPT09IG9wdC5SRVBFQVRfWCA/IDEgOiAyNTYpIC8gdGhpcy5oZWlnaHQsXG4gICAgKTtcbiAgICBjb25zdCBzY2FsZWRXaWR0aCA9IHdpZHRoRmFjdG9yICogdGhpcy53aWR0aDtcbiAgICBjb25zdCBzY2FsZWRIZWlnaHQgPSBoZWlnaHRGYWN0b3IgKiB0aGlzLmhlaWdodDtcbiAgICBjb25zdCBjb250ZXh0ID0gX2dldFRtcENvbnRleHQoXG4gICAgICBzY2FsZWRXaWR0aCxcbiAgICAgIHRoaXMub3B0TW9kZSA9PT0gb3B0LlJFUEVBVF9YX09SX1kgPyB0aGlzLmhlaWdodCA6IHNjYWxlZEhlaWdodCxcbiAgICApO1xuICAgIGZvciAobGV0IHkgPSAwOyB5IDwgKHRoaXMub3B0TW9kZSA9PT0gb3B0LlJFUEVBVF9YX09SX1kgPyAxIDogaGVpZ2h0RmFjdG9yKTsgKyt5KSB7XG4gICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHdpZHRoRmFjdG9yOyB4KyspIHtcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UoXG4gICAgICAgICAgdGhpcy5zb3VyY2VJbWFnZS5kYXRhLFxuICAgICAgICAgIHRoaXMuc291cmNlWCxcbiAgICAgICAgICB0aGlzLnNvdXJjZVksXG4gICAgICAgICAgdGhpcy53aWR0aCxcbiAgICAgICAgICB0aGlzLmhlaWdodCxcbiAgICAgICAgICB4ICogdGhpcy53aWR0aCxcbiAgICAgICAgICB5ICogdGhpcy5oZWlnaHQsXG4gICAgICAgICAgdGhpcy53aWR0aCxcbiAgICAgICAgICB0aGlzLmhlaWdodCxcbiAgICAgICAgKTtcbiAgICAgICAgaWcuSW1hZ2UuZHJhd0NvdW50Kys7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuaW1hZ2UxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgdGhpcy5pbWFnZTEuc3JjID0gY29udGV4dC5jYW52YXMudG9EYXRhVVJMKCk7XG5cbiAgICBpZiAodGhpcy5vcHRNb2RlID09PSBvcHQuUkVQRUFUX1hfT1JfWSkge1xuICAgICAgY29uc3QgY29udGV4dDIgPSBfZ2V0VG1wQ29udGV4dCh0aGlzLndpZHRoLCBzY2FsZWRIZWlnaHQpO1xuICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBoZWlnaHRGYWN0b3I7ICsreSkge1xuICAgICAgICBjb250ZXh0LmRyYXdJbWFnZShcbiAgICAgICAgICB0aGlzLnNvdXJjZUltYWdlLmRhdGEsXG4gICAgICAgICAgdGhpcy5zb3VyY2VYLFxuICAgICAgICAgIHRoaXMuc291cmNlWSxcbiAgICAgICAgICB0aGlzLndpZHRoLFxuICAgICAgICAgIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgIDAsXG4gICAgICAgICAgeSAqIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgIHRoaXMud2lkdGgsXG4gICAgICAgICAgdGhpcy5oZWlnaHQsXG4gICAgICAgICk7XG4gICAgICAgIGlnLkltYWdlLmRyYXdDb3VudCsrO1xuICAgICAgfVxuICAgICAgdGhpcy5pbWFnZTIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICAgIHRoaXMuaW1hZ2UyLnNyYyA9IGNvbnRleHQyLmNhbnZhcy50b0RhdGFVUkwoKTtcbiAgICB9XG4gICAgdGhpcy50b3RhbFdpZHRoID0gc2NhbGVkV2lkdGg7XG4gICAgdGhpcy50b3RhbEhlaWdodCA9IHNjYWxlZEhlaWdodDtcbiAgfSxcblxuICBjbGVhckNhY2hlZCgpIHtcbiAgICBpZiAodGhpcy5pbWFnZTEpIHtcbiAgICAgIHRoaXMuaW1hZ2UxID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuaW1hZ2UyKSB7XG4gICAgICB0aGlzLmltYWdlMiA9IG51bGw7XG4gICAgfVxuICB9LFxufSk7XG5cbmlnLkltYWdlUGF0dGVybi5PUFQgPSB7XG4gIE5PTkU6IDAsXG4gIFJFUEVBVF9YOiAxLFxuICBSRVBFQVRfWTogMixcbiAgUkVQRUFUX1hfT1JfWTogMyxcbiAgUkVQRUFUX1hfQU5EX1k6IDQsXG59O1xuIiwgImlnLm1vZHVsZSgnY2Nsb2FkZXItcnVudGltZS5zdGRsaWIubWlzc2luZy1vcHRpb24tZml4JylcbiAgLnJlcXVpcmVzKCdnYW1lLmZlYXR1cmUubW9kZWwub3B0aW9ucy1tb2RlbCcsICdnYW1lLmZlYXR1cmUubWVudS5ndWkub3B0aW9ucy5vcHRpb25zLXR5cGVzJylcbiAgLmRlZmluZXMoKCkgPT4ge1xuICAgIC8vIEknbSBub3QgcGFydGljdWxhcmx5IHN1cmUgd2hhdCB0aGUgZnVsbCBleHRlbnQgb2Ygb2NjdXJyZW5jZXMgb2YgdGhpcyBidWdcbiAgICAvLyBhcmUsIGJ1dCB0aGVyZSBpcyBvbmUgY2FzZSBJIGFtIGFic29sdXRlbHkgY2VydGFpbiBvZi5cbiAgICAvLyBJZiBhIG1vZCBhZGRzIGFuIG9wdGlvbiB0byBhbiBleGlzdGluZyB2YW5pbGxhIGJ1dHRvbiBncm91cCAoZS5nLiB0aGVcbiAgICAvLyBQaXhlbCBTaXplIG9wdGlvbiksIGFuZCBhIHVzZXIgc2VsZWN0cyB0aGlzIG9wdGlvbiwgdGhlaXIgc2V0dGluZ3MgYXJlXG4gICAgLy8gdXBkYXRlZCB0byByZWZsZWN0IHRoaXMuIChlLmcuIGBwaXhlbC1zaXplYCBpcyBzZXQgdG8gYDVgKVxuICAgIC8vIEhvd2V2ZXIsIGlmIHRoZSBtb2QgaXMgbGF0ZXIgdW5pbnN0YWxsZWQsIHRoZSBzZXR0aW5nIG9idmlvdXNseSBkb2VzIG5vdFxuICAgIC8vIGNoYW5nZSwgc28gd2hlbmV2ZXIgb3BlbmluZyB0aGUgbWVudSBjb250YWluaW5nIHRoaXMgb3B0aW9uIHRoZSBnYW1lIG5vd1xuICAgIC8vIHRyaWVzIHRvIGZldGNoIHRoZSB2YWx1ZSBmb3IgYSBmaWZ0aCBidXR0b24sIGdldHMgYHVuZGVmaW5lZGAgZnJvbVxuICAgIC8vIGB0aGlzLmJ1dHRvbnNbLi4uXWAsIGFuZCBwYXNzZXMgaXQgdG8gYGlnLkJ1dHRvbkdyb3VwI3NldFByZXNzZWRGb2N1c0d1aWBcbiAgICAvLyB3aGljaCB0cmllcyBjYWxsaW5nIGEgbWV0aG9kIGRpcmVjdGx5IG9uIHRoZSBwYXNzZWQgb2JqZWN0LiBUaGlzIGNyYXNoZXNcbiAgICAvLyB0aGUgZ2FtZS5cbiAgICAvLyBTbywgbGV0J3MgdGFrZSB0aGUgbGliZXJ0eSBvZiByZXNldHRpbmcgYnJva2VuIG9wdGlvbnMgZm9yIHRoZSB1c2VyXG4gICAgLy8gc2hvdWxkIHRoaXMgZXZlciBvY2N1ci5cbiAgICBzYy5PcHRpb25Nb2RlbC5pbmplY3Qoe1xuICAgICAgb25TdG9yYWdlR2xvYmFsTG9hZChnbG9iYWxzKSB7XG4gICAgICAgIHRoaXMucGFyZW50KGdsb2JhbHMpO1xuXG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIHNjLk9QVElPTlNfREVGSU5JVElPTikge1xuICAgICAgICAgIGNvbnN0IG9wdGlvbiA9IHNjLk9QVElPTlNfREVGSU5JVElPTltrZXldO1xuICAgICAgICAgIGlmIChvcHRpb24udHlwZSAhPT0gJ0JVVFRPTl9HUk9VUCcpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgY29uc3QgY3VycmVudFZhbHVlID0gdGhpcy5nZXQoa2V5KSBhcyBudW1iZXI7XG4gICAgICAgICAgaWYgKCFPYmplY3QudmFsdWVzKG9wdGlvbi5kYXRhKS5pbmNsdWRlcyhjdXJyZW50VmFsdWUpKSB7XG4gICAgICAgICAgICB0aGlzLnNldChrZXksIG9wdGlvbi5pbml0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5oYXNDaGFuZ2VkKSB7XG4gICAgICAgICAgdGhpcy5wZXJzaXN0T3B0aW9ucygpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pO1xuICB9KTtcbiIsICJpbXBvcnQgJy4vZml4ZXMvcGF0dGVybi1maXgnO1xuaW1wb3J0ICcuL2ZpeGVzL21pc3Npbmctb3B0aW9uLWZpeCc7XG4iLCAiaWcubW9kdWxlKCdjY2xvYWRlci1ydW50aW1lLnN0ZGxpYi5mb250JylcbiAgLnJlcXVpcmVzKCdpbXBhY3QuYmFzZS5mb250JywgJ2dhbWUuZmVhdHVyZS5mb250LmZvbnQtc3lzdGVtJylcbiAgLmRlZmluZXMoKCkgPT4ge1xuICAgIGZ1bmN0aW9uIHNldFNpbXBsZU1hcHBpbmcoXG4gICAgICBtdWx0aUZvbnQ6IGlnLk11bHRpRm9udCxcbiAgICAgIGljb25TZXRJbmRleDogbnVtYmVyLFxuICAgICAgc2ltcGxlTWFwcGluZzogaWcuTXVsdGlGb250Lk1hcHBpbmdTaW1wbGUsXG4gICAgKTogdm9pZCB7XG4gICAgICBsZXQgcmVndWxhck1hcHBpbmc6IGlnLk11bHRpRm9udC5NYXBwaW5nID0ge307XG4gICAgICBmb3IgKGxldCBbaWNvbk5hbWUsIGluZGV4XSBvZiBPYmplY3QuZW50cmllcyhzaW1wbGVNYXBwaW5nKSkge1xuICAgICAgICByZWd1bGFyTWFwcGluZ1tpY29uTmFtZV0gPSBbaWNvblNldEluZGV4LCBpbmRleF07XG4gICAgICB9XG4gICAgICBtdWx0aUZvbnQuc2V0TWFwcGluZyhyZWd1bGFyTWFwcGluZyk7XG4gICAgfVxuXG4gICAgaWcuTXVsdGlGb250LmluamVjdCh7XG4gICAgICBwdXNoSWNvblNldChmb250LCBtYXBwaW5nPzogaWcuTXVsdGlGb250Lk1hcHBpbmdTaW1wbGUgfCBudWxsKSB7XG4gICAgICAgIGxldCBpY29uU2V0SW5kZXggPSB0aGlzLmljb25TZXRzLmxlbmd0aDtcbiAgICAgICAgbGV0IHJlc3VsdCA9IHRoaXMucGFyZW50KGZvbnQpO1xuICAgICAgICBpZiAobWFwcGluZyAhPSBudWxsKSBzZXRTaW1wbGVNYXBwaW5nKHRoaXMsIGljb25TZXRJbmRleCwgbWFwcGluZyk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9LFxuXG4gICAgICBzZXRJY29uU2V0KGZvbnQsIGluZGV4LCBtYXBwaW5nPzogaWcuTXVsdGlGb250Lk1hcHBpbmdTaW1wbGUgfCBudWxsKSB7XG4gICAgICAgIGxldCByZXN1bHQgPSB0aGlzLnBhcmVudChmb250LCBpbmRleCk7XG4gICAgICAgIGlmIChtYXBwaW5nICE9IG51bGwpIHNldFNpbXBsZU1hcHBpbmcodGhpcywgaW5kZXgsIG1hcHBpbmcpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSxcbiAgICB9KTtcbiAgfSk7XG4iLCAiaWcubW9kdWxlKCdjY2xvYWRlci1ydW50aW1lLnN0ZGxpYi5mb250LXJhY2UtY29uZGl0aW9uLWZpeCcpXG4gIC5yZXF1aXJlcygnaW1wYWN0LmJhc2UuZm9udCcsICdnYW1lLmZlYXR1cmUuZm9udC5mb250LXN5c3RlbScpXG4gIC5kZWZpbmVzKCgpID0+IHtcbiAgICAvLyB0aGlzLl9kb0NhbGxiYWNrKCkgKHRoYXQgY2FsbHMgdGhpcy5sb2FkaW5nRmluaXNoZWQodHJ1ZSkpIGlzIGNhbGxlZFxuICAgIC8vIGJlZm9yZSB0aGUgbGFiZWxzIGFyZSBhcHBsaWVkIHRvIGlnLmxhbmcubGFiZWxzLCBzbyB2ZXJ5IHJhcmVseVxuICAgIC8vIChmb3Igc29tZSByZWFzb24gSSd2ZSBvbmx5IGVuY291cm5ldGVkIHRoaXMgaXNzdWUgaW4gYnJvd3NlcnMsXG4gICAgLy8gaXQgbWF5IGhhcHBlbiBpbiBud2pzLCBidXQgSSdtIG5vdCBzdXJlKSBndWkgY29kZSBpcyBleGVjdXRlZCBiZWZvcmVcbiAgICAvLyB0aGUgbGFiZWxzIGFyZSBhcHBsaWVkLCByZXN1bHRpbmcgaW4gJ1VOS05PV04gTEFCRUwnXG4gICAgLy8gKG9uIHRoZSB0aXRsZSBzY3JlZW4sIGZvciBleGFtcGxlKVxuICAgIGlnLkxhbmcuaW5qZWN0KHtcbiAgICAgIG9ubG9hZCguLi5hcmdzKSB7XG4gICAgICAgIGNvbnN0IGJhY2t1cCA9IHRoaXMuX2RvQ2FsbGJhY2s7XG4gICAgICAgIHRoaXMuX2RvQ2FsbGJhY2sgPSAoKSA9PiB7fTtcbiAgICAgICAgdGhpcy5wYXJlbnQoLi4uYXJncyk7XG5cbiAgICAgICAgdGhpcy5fZG9DYWxsYmFjayA9IGJhY2t1cDtcblxuICAgICAgICB0aGlzLl9kb0NhbGxiYWNrKCk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9KTtcbiIsICJpZy5tb2R1bGUoJ2NjbG9hZGVyLXJ1bnRpbWUuc3RkbGliLm9wdGlvbnMuZ3VpJylcbiAgLnJlcXVpcmVzKCdnYW1lLmZlYXR1cmUubWVudS5ndWkub3B0aW9ucy5vcHRpb25zLXR5cGVzJylcbiAgLmRlZmluZXMoKCkgPT4ge1xuICAgIHNjLk9wdGlvbkluZm9Cb3guaW5qZWN0KHtcbiAgICAgIGluaXQoLi4uYXJncykge1xuICAgICAgICB0aGlzLnBhcmVudCguLi5hcmdzKTtcbiAgICAgICAgbGV0IFtvcHRpb25dID0gYXJncztcbiAgICAgICAgaWYgKG9wdGlvbi5tYXJnaW5Cb3R0b20gIT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuaG9vay5zaXplLnkgKz0gb3B0aW9uLm1hcmdpbkJvdHRvbTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIHNjLk9wdGlvblJvdy5pbmplY3Qoe1xuICAgICAgaW5pdCguLi5hcmdzKSB7XG4gICAgICAgIHRoaXMucGFyZW50KC4uLmFyZ3MpO1xuXG4gICAgICAgIHRoaXMubGluZUd1aSA9IHRoaXMuaG9vay5jaGlsZHJlblsxXS5ndWkgYXMgaWcuQ29sb3JHdWk7XG4gICAgICAgIHRoaXMuc2xvcGVHdWkgPSB0aGlzLmhvb2suY2hpbGRyZW5bMl0uZ3VpIGFzIGlnLkltYWdlR3VpO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbi50eXBlID09PSAnQ0hFQ0tCT1gnICYmIHRoaXMub3B0aW9uLmNoZWNrYm94UmlnaHRBbGlnbikge1xuICAgICAgICAgIGxldCBjaGVja2JveCA9IHRoaXMudHlwZUd1aSBhcyBzYy5PUFRJT05fR1VJU19ERUZTLkNIRUNLQk9YO1xuICAgICAgICAgIGNoZWNrYm94LmJ1dHRvbi5ob29rLmFsaWduLnggPSBpZy5HVUlfQUxJR04uWF9SSUdIVDtcbiAgICAgICAgICBsZXQgYWRkaXRpb25hbFdpZHRoID0gY2hlY2tib3guaG9vay5zaXplLnggLSBjaGVja2JveC5idXR0b24uaG9vay5zaXplLng7XG4gICAgICAgICAgdGhpcy5saW5lR3VpLmhvb2suc2l6ZS54ICs9IGFkZGl0aW9uYWxXaWR0aDtcbiAgICAgICAgICB0aGlzLnNsb3BlR3VpLmhvb2sucG9zLnggKz0gYWRkaXRpb25hbFdpZHRoO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pO1xuICB9KTtcbiIsICIvLyBUaGlzIG1vZHVsZSBpcyBiYXNlZCBvbiB0aGUgd29yayBkb25lIGJ5IDIwa2RjIGluIGhpcyBSYXB0dXJlVUkgbW9kOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tLzIwa2RjL2RlY3Jvc3NmdXNjYXRvci9ibG9iL2I1YzQyNTBhYWRlNWJmOGQ0MWIxMmVjN2MzNDZkNDliYTEwN2IyYTkvbW9kcy9yYXB0dXJldWkva2V5YmluZGluZy5qc1xuLy8gVGhpcyBleGFjdCBjb2RlIGFsb25nIHdpdGggdGhlIG5vdGVzIHdhcyBpbXBvcnRlZCBmcm9tIHRoZSBgaW5wdXQtYXBpYCBtb2QsXG4vLyB3aGljaCBzaGFsbCBiZSBkZXByZWNhdGVkIGZyb20gbm93IG9uLlxuLy9cbi8vIFRoaXMgbW9kdWxlIGlzIG5lZWRlZCBiYXNpY2FsbHkgYmVjYXVzZSB0aGUgZGV2ZWxvcGVycyB1c2UgYSBsb2NhbCB2YXJpYWJsZVxuLy8gKG5hbWVkIGBLRVlfT1BUSU9OX01BUGAgaW4gMC43LjApIHdoaWNoIGNvbnRhaW5zIGFuIG9iamVjdCB0aGF0IG1hcHMgc3RyaW5nc1xuLy8gKG9idGFpbmVkIGZyb20gdGhlIGtleXMgb2YgdGhlIGBzYy5PUFRJT05TX0RFRklOSVRJT05gKSB3aXRob3V0IHRoZSBga2V5cy1gXG4vLyBwcmVmaXggdG8gdGhlIHNhbWUgc3RyaW5ncyB3aXRoIHRoZSBzYWlkIHByZWZpeC4gV2h5IHdvdWxkIHRoZXkgZG8gdGhhdD9cbi8vIEhlbGwgaWYgSSBrbm93ISBDb3VsZCB0aGV5IGltcGxlbWVudCBrZXkgcmViaW5kaW5nIHdpdGhvdXQgdGhpcyBjb252ZXJzaW9uXG4vLyB0YWJsZT8gQWJzb2x1dGVseS4gSW4gZmFjdCwgdGhpcyBpcyBwcmVjaXNlbHkgd2hhdCBJJ3ZlIGRvbmUgaGVyZS4gSSBjb3BpZWRcbi8vIHRoZSBvcmlnaW5hbCBpbXBsZW1lbnRhdGlvbnMsIGJ1dCByZW1vdmVkIHJlZmVyZW5jZXMgdG8gYEtFWV9PUFRJT05fTUFQYCBhbmRcbi8vIHJld3JvdGUgdGhlIGZ1bmN0aW9ucyBhY2NvcmRpbmdseS5cbi8vXG4vLyBVbmZvcnR1bmF0ZWx5IHRoZXJlIGlzIG5vIHdheSB0byBjdW5uaW5nbHkgaW5qZWN0IHNvbWV0aGluZyB0byBsZWFrIGFcbi8vIHJlZmVyZW5jZSB0byB0aGF0IHZhcmlhYmxlLCBzbyBJIGhhZCB0byBjb3B5IGNPcFlySWdIdEVkIGNvZGUsIHdoaWNoIGlzXG4vLyBkZWZpbml0ZWx5IG5vdCB0aGUgYmVzdCBzb2x1dGlvbiwgYnV0IGNvbXBhcmVkIHRvIGFub3RoZXIgdmFyaWFudCBpdCBnaXZlc1xuLy8gbXVjaCBtb3JlIGZsZXhpYmlsaXR5LiBUaGUgb3RoZXIgd2F5IHRvIGFjY29tcGxpc2ggcmViaW5kaW5nIG9mIG1vZGRlZCBpbnB1dFxuLy8ga2V5cyBpcyB0byBkZWZpbmUgYSBzZXR0ZXIgZm9yIGBPUFRJT05TX0RFRklOSVRJT05gIHNvbWV0aW1lIGluIHBvc3Rsb2FkXG4vLyBiZWNhdXNlIHRoZSBtb2R1bGUgYGdhbWUuZmVhdHVyZS5tb2RlbC5vcHRpb25zLW1vZGVsYCwgd2hpY2ggcG9wdWxhdGVzXG4vLyBgS0VZX09QVElPTl9NQVBgIGFuZCBjb250YWlucyBkZWZpbml0aW9ucyBvZiAodW5zdXJwcmlzaW5nbHkpXG4vLyBgc2MuT3B0aW9uTW9kZWxgLCBgc2MuS2V5QmluZGVyYCBhbmQgc28gb24sIHRyYW5zaXRpdmVseSBkZXBlbmRzIG9uXG4vLyBgZG9tLnJlYWR5YCwgdGhlcmVmb3JlIGJ5IHRoZSB0aW1lIG9mIGBwb3N0bG9hZGAgaXQgd291bGRuJ3QgaGF2ZSBiZWVuXG4vLyBleGVjdXRlZC4gVGhpcyBjYW4gYmUgZG9uZSB3aXRoIHRoZSBmb2xsb3dpbmcgc25pcHBldDpcbi8vXG4vLyBgYGBqYXZhc2NyaXB0XG4vLyBPYmplY3QuZGVmaW5lUHJvcGVydHkoc2MsICdPUFRJT05TX0RFRklOSVRJT04nLCB7XG4vLyAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbi8vICAgZ2V0KCkge1xuLy8gICAgIHJldHVybiB1bmRlZmluZWQ7XG4vLyAgIH0sXG4vLyAgIHNldCh2YWx1ZSkge1xuLy8gICAgIGFkZEN1c3RvbU9wdGlvbnNUbyhzYy5PUFRJT05TX0RFRklOSVRJT04pO1xuLy8gICAgIGRlbGV0ZSBzYy5PUFRJT05TX0RFRklOSVRJT047XG4vLyAgICAgc2MuT1BUSU9OU19ERUZJTklUSU9OID0gdmFsdWU7XG4vLyAgIH0sXG4vLyB9KTtcbi8vIGBgYFxuLy9cbi8vIFRoaXMgaXMgYSB2aWFibGUgYXBwcm9hY2gsIGhvd2V2ZXIsIDIwa2RjIGV4cHJlc3NlZCBjb25jZXJucyBhYm91dCB0aGlzXG4vLyBraWxsaW5nIEpJVCBhbmQgYXMgSSBzYWlkIGFib3ZlIEkgdHJhZGVkIHRoZSBmbGV4aWJpbGl0eSBmb3Igbm90IGNvcHlpbmdcbi8vIG9yaWdpbmFsIGNvZGUsIHNvIHRoZXJlLlxuLy9cbi8vIEFub3RoZXIgcG9pbnQgSSdkIGxpa2UgdG8gYnJpbmcgdXAgaXMgdGhhdCB0aGUgb3JpZ2luYWwgaW1wbGVtZW50YXRpb24gaXNcbi8vIGJyb2tlbiBhbmQgY29udGFpbnMgYnVncy4gRm9yIGV4YW1wbGUsIGl0IGlzIHBvc3NpYmxlIHRvIHVuYmluZCBwcmltYXJ5IGtleXNcbi8vIChjb250cmFyeSB0byB3aGF0IFVJIGluIGBzYy5LZXlCaW5kZXJHdWlgIGltcGxpZXMpOiBpZiB5b3Ugd2FudCB0byB1bmJpbmRcbi8vIGtleSBLMSBvZiBhY3Rpb24gQTEsIHlvdSBzaW1wbHkgaGF2ZSB0byB1bmJpbmQgYWx0ZXJuYXRpdmUga2V5IEsyIG9mIHRoZVxuLy8gYWN0aW9uIEEyIGFuZCBiaW5kIEsxIHRvIHRoYXQuIF9JIGNvdWxkIGZpeCB0aGF0Xy4gQnV0LCB0aGlzIGlzIGEgc3RhbmRhcmRcbi8vIGxpYnJhcnksIHNvIGZpeGluZyB0aGF0IGZlbHQgaW50cnVzaXZlIGluIHRoaXMgY29udGV4dC4gU28sIGFwYXJ0IGZyb21cbi8vIG5lY2Vzc2FyeSBlZGl0cywgdmVyeSBtaW5vciByZWZhY3RvcnMgYW5kIGNvZGUgZGVkdXBsaWNhdGlvbnMgSSBkaWRuJ3QgY2hhbmdlXG4vLyBhbnl0aGluZyBzaWduaWZpY2FudC5cblxuaWcubW9kdWxlKCdjY2xvYWRlci1ydW50aW1lLnN0ZGxpYi5pbnB1dCcpXG4gIC5yZXF1aXJlcygnZ2FtZS5mZWF0dXJlLm1vZGVsLm9wdGlvbnMtbW9kZWwnKVxuICAuZGVmaW5lcygoKSA9PiB7XG4gICAgLy8gYHNjLktFWV9CTEFDS19MSVNUYCBjb250YWlucyBrZXlzIHdoaWNoIGNhbm5vdCBiZSBib3VuZCB1c2luZyBncmFwaGljYWxcbiAgICAvLyBpbnRlcmZhY2UgKGkuZS4gYHNjLktleUJpbmRlckd1aWApLiBSZWFsbHkgaXQgY29udGFpbnMgZnVuY3Rpb25hbCBrZXlzXG4gICAgLy8gRjEtRjEyIGFuZCB0aGUgY29udHJvbCBrZXkuIFRoZSByZWFzb24gZm9yIGJsYWNrbGlzdGluZyBmdW5jdGlvbmFsIGtleXNcbiAgICAvLyBpcyBleHBsYWluYWJsZSAtIHRoZXkgYXJlIGFscmVhZHkgaW50ZXJuYWxseSB1c2VkIGZvciB0aGUgZm9sbG93aW5nXG4gICAgLy8gYWN0aW9uczpcbiAgICAvL1xuICAgIC8vIC0gPEY3PiAgb3BlbmluZyB0aGUgdHlwbyBlZGl0b3JcbiAgICAvLyAtIDxGOD4gIHRha2luZyBzY3JlZW5zaG90cyAod2hpY2ggY2FuJ3QgYmUgc2F2ZWQsIHRyb2xvbG8pXG4gICAgLy8gLSA8RjEwPiBpbXBvcnRpbmcvZXhwb3J0aW5nIHNhdmVzdHJpbmdzXG4gICAgLy8gLSA8RjExPiBzd2l0Y2hpbmcgdG8gdGhlIGZ1bGxzY3JlZW4gbW9kZVxuICAgIC8vXG4gICAgLy8gVW5mb3J0dW5hdGVseSBpdCBpcyBub3QgY2xlYXIgdG8gbWUgd2hhdCBkaWQgY29udHJvbCBmb3JnZXQgdGhlcmUuIFRoZVxuICAgIC8vIGpldHBhY2sgbW9kIG1hZGUgdXNlIG9mIGl0IHNpbmNlIHRoZSBiZWdpbm5pbmcgb2YgdGltZSwgc28gSSByZW1vdmUgaXRcbiAgICAvLyBmcm9tIHRoZSBibGFja2xpc3QgaGVyZS5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWR5bmFtaWMtZGVsZXRlLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5uZWNlc3NhcnktdHlwZS1hc3NlcnRpb25cbiAgICBkZWxldGUgKHNjLktFWV9CTEFDS19MSVNUIGFzIFBhcnRpYWw8dHlwZW9mIHNjLktFWV9CTEFDS19MSVNUPilbaWcuS0VZLkNUUkxdO1xuXG4gICAgc2MuS2V5QmluZGVyLmluamVjdCh7XG4gICAgICAvLyB0aGUgbG9vcCB3aGljaCBwb3B1bGF0ZXMgYEtFWV9PUFRJT05fTUFQYCB3YXMgbW92ZWQgZGlyZWN0bHkgaGVyZVxuICAgICAgaW5pdEJpbmRpbmdzKCkge1xuICAgICAgICBmb3IgKGxldCBvcHRpb25JZCBpbiBzYy5PUFRJT05TX0RFRklOSVRJT04pIHtcbiAgICAgICAgICBsZXQgb3B0aW9uRGVmID0gc2MuT1BUSU9OU19ERUZJTklUSU9OW29wdGlvbklkXTtcbiAgICAgICAgICBpZiAob3B0aW9uRGVmLnR5cGUgIT09ICdDT05UUk9MUycgfHwgIW9wdGlvbklkLnN0YXJ0c1dpdGgoJ2tleXMtJykpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCBhY3Rpb24gPSBvcHRpb25JZC5zbGljZSg1KSBhcyBpZy5JbnB1dC5Lbm93bkFjdGlvbjtcbiAgICAgICAgICBsZXQgeyBrZXkxLCBrZXkyIH0gPSBzYy5vcHRpb25zLnZhbHVlc1tvcHRpb25JZF0gYXMgc2MuT3B0aW9uRGVmaW5pdGlvbi5DT05UUk9MU1snaW5pdCddO1xuICAgICAgICAgIGlmIChrZXkxICE9IG51bGwpIHtcbiAgICAgICAgICAgIGlnLmlucHV0LmJpbmQoa2V5MSwgYWN0aW9uKTtcbiAgICAgICAgICAgIHNjLmZvbnRzeXN0ZW0uY2hhbmdlS2V5Q29kZUljb24oYWN0aW9uLCBrZXkxKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGtleTIgIT0gbnVsbCkge1xuICAgICAgICAgICAgaWcuaW5wdXQuYmluZChrZXkyLCBhY3Rpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudXBkYXRlR2FtZXBhZEljb25zKCk7XG4gICAgICB9LFxuXG4gICAgICBjaGFuZ2VCaW5kaW5nKG9wdGlvbklkLCBrZXksIGlzQWx0ZXJuYXRpdmUsIHVuYmluZCkge1xuICAgICAgICBsZXQgb3B0aW9uVmFsdWUgPSBzYy5vcHRpb25zLnZhbHVlc1tvcHRpb25JZF0gYXMgc2MuT3B0aW9uRGVmaW5pdGlvbi5DT05UUk9MU1snaW5pdCddO1xuICAgICAgICBzYy5vcHRpb25zLmhhc0NoYW5nZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIHRoaXMgYXNzaWdubWVudCBhY2Nlc3NlZCBgS0VZX09QVElPTl9NQVBgIHRvIGdldCB0aGUgb3B0aW9uIHZhbHVlXG4gICAgICAgIC8vIGluc3RlYWQgb2YgZGlyZWN0bHkgcmV1c2luZyBhIHZhcmlhYmxlIGRpcmVjdGx5XG4gICAgICAgIGxldCBvbGRLZXkgPSBpc0FsdGVybmF0aXZlID8gb3B0aW9uVmFsdWUua2V5MiEgOiBvcHRpb25WYWx1ZS5rZXkxO1xuICAgICAgICAvLyB0aGlzIGNvbmRpdGlvbiBzZWVtcyB0byBoYW5kbGUgc2l0dWF0aW9ucyB3aGVuIGBvbGRLZXlgIGlzXG4gICAgICAgIC8vIGB1bmRlZmluZWRgIG9yIGBudWxsYCBjb3JyZWN0bHkgYXMgd2VsbFxuICAgICAgICBpZiAoaWcuaW5wdXQuYmluZGluZ3Nbb2xkS2V5XSAhPSBudWxsKSBpZy5pbnB1dC51bmJpbmQob2xkS2V5KTtcblxuICAgICAgICBpZiAoaXNBbHRlcm5hdGl2ZSAmJiB1bmJpbmQpIHtcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZpbmVkXG4gICAgICAgICAgb3B0aW9uVmFsdWUua2V5MiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYWN0aW9uID0gb3B0aW9uSWQuc2xpY2UoNSkgYXMgaWcuSW5wdXQuS25vd25BY3Rpb247XG4gICAgICAgIGxldCBjb25mbGljdGluZ0FjdGlvbiA9IGlnLmlucHV0LmJpbmRpbmdzW2tleV07XG5cbiAgICAgICAgaWcuaW5wdXQuYmluZChrZXksIGFjdGlvbik7XG4gICAgICAgIHNjLmZvbnRzeXN0ZW0uY2hhbmdlS2V5Q29kZUljb24oYWN0aW9uLCBrZXkpO1xuXG4gICAgICAgIGlmIChjb25mbGljdGluZ0FjdGlvbiAhPSBudWxsKSB7XG4gICAgICAgICAgLy8gdGhpcyBhc3NpZ25tZW50IHVzZWQgdG8gYWNjZXNzIGBLRVlfT1BUSU9OX01BUGAgdG8gZ2V0IHRoZSBvcHRpb25cbiAgICAgICAgICAvLyBJRCBvZiB0aGUgY29uZmxpY3RpbmcgYWN0aW9uXG4gICAgICAgICAgbGV0IGNvbmZsaWN0aW5nT3B0aW9uID0gc2Mub3B0aW9ucy52YWx1ZXNbXG4gICAgICAgICAgICBga2V5cy0ke2NvbmZsaWN0aW5nQWN0aW9ufWBcbiAgICAgICAgICBdIGFzIHNjLk9wdGlvbkRlZmluaXRpb24uQ09OVFJPTFNbJ2luaXQnXTtcblxuICAgICAgICAgIGlmIChjb25mbGljdGluZ09wdGlvbi5rZXkxID09PSBrZXkpIHtcbiAgICAgICAgICAgIGNvbmZsaWN0aW5nT3B0aW9uLmtleTEgPSBvbGRLZXk7XG4gICAgICAgICAgfSBlbHNlIGlmIChjb25mbGljdGluZ09wdGlvbi5rZXkyID09PSBrZXkpIHtcbiAgICAgICAgICAgIGNvbmZsaWN0aW5nT3B0aW9uLmtleTIgPSBvbGRLZXk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHRoaXMgZXJyb3IgbWVzc2FnZSBpc24ndCBwcmVzZW50IGluIHRoZSBvcmlnaW5hbCBjb2RlLCBJIGdvdCB0aGlzXG4gICAgICAgICAgICAvLyBpZGVhIGZyb20gMjBrZGMncyBpbXBsZW1lbnRhdGlvblxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignaW5wdXQtYXBpOiB1bmFibGUgdG8gZmluZCB0aGUgY29uZmxpY3Rpbmcga2V5IGJpbmRpbmcuIHJlcG9ydCBBU0FQIScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlnLmlucHV0LmJpbmQob2xkS2V5LCBjb25mbGljdGluZ0FjdGlvbik7XG4gICAgICAgICAgc2MuZm9udHN5c3RlbS5jaGFuZ2VLZXlDb2RlSWNvbihjb25mbGljdGluZ0FjdGlvbiwgb2xkS2V5KTtcbiAgICAgICAgICBzYy5vcHRpb25zLmRpc3BhdGNoS2V5U3dhcHBlZEV2ZW50KCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNBbHRlcm5hdGl2ZSkgb3B0aW9uVmFsdWUua2V5MiA9IGtleTtcbiAgICAgICAgZWxzZSBvcHRpb25WYWx1ZS5rZXkxID0ga2V5O1xuICAgICAgfSxcbiAgICB9KTtcbiAgfSk7XG4iLCAiaW1wb3J0IHsgTG9jYWxpemVkU3RyaW5nIH0gZnJvbSAndWx0aW1hdGUtY3Jvc3Njb2RlLXR5cGVkZWZzL2ZpbGUtdHlwZXMvbW9kLW1hbmlmZXN0JztcblxuZXhwb3J0ICogZnJvbSAnQGNjbG9hZGVyMy9jb21tb24vdXRpbHMnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxpemVkU3RyaW5nKFxuICBzdHI6IExvY2FsaXplZFN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQsXG4pOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkIHtcbiAgaWYgKHN0ciA9PSBudWxsIHx8IHR5cGVvZiBzdHIgPT09ICdzdHJpbmcnKSByZXR1cm4gc3RyO1xuICByZXR1cm4gc3RyW2lnLmN1cnJlbnRMYW5nXSA/PyBzdHIuZW5fVVM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRNb2RUaXRsZShtb2Q6IG1vZGxvYWRlci5Nb2QpOiBzdHJpbmcge1xuICByZXR1cm4gZ2V0TG9jYWxpemVkU3RyaW5nKG1vZC5tYW5pZmVzdC50aXRsZSkgPz8gbW9kLmlkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkRW51bU1lbWJlcjxOIGV4dGVuZHMgc3RyaW5nPihlbnVtT2JqOiB7IFtrIGluIE5dOiBudW1iZXIgfSwgbmFtZTogTik6IG51bWJlciB7XG4gIGxldCBudW1iZXIgPSBPYmplY3Qua2V5cyhlbnVtT2JqKS5sZW5ndGg7XG4gIGVudW1PYmpbbmFtZV0gPSBudW1iZXI7XG4gIHJldHVybiBudW1iZXI7XG59XG4iLCAiaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi91dGlscyc7XG5cbmNvbnN0IG5vZGVqc1V0aWwgPSB3aW5kb3cucmVxdWlyZT8uKCd1dGlsJykgYXMgdHlwZW9mIGltcG9ydCgndXRpbCcpO1xuXG5leHBvcnQgZW51bSBMb2dMZXZlbCB7XG4gIExPRyA9IDIsXG4gIFdBUk4gPSAxLFxuICBFUlJPUiA9IDAsXG59XG5cbmV4cG9ydCB0eXBlIExvZ0xldmVsTmFtZSA9IGtleW9mIHR5cGVvZiBMb2dMZXZlbDtcbmV4cG9ydCB0eXBlIExvZ0xldmVsc0RpY3Q8VCA9IGJvb2xlYW4+ID0gUmVjb3JkPExvZ0xldmVsTmFtZSwgVD47XG5cbmV4cG9ydCBjb25zdCBMT0dfTEVWRUxfTkFNRVM6IHJlYWRvbmx5IExvZ0xldmVsTmFtZVtdID0gWydMT0cnLCAnV0FSTicsICdFUlJPUiddO1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9MT0dfTEVWRUxTOiBMb2dMZXZlbHNEaWN0ID0ge1xuICBMT0c6IGZhbHNlLFxuICBXQVJOOiB0cnVlLFxuICBFUlJPUjogdHJ1ZSxcbn07XG5cbmZ1bmN0aW9uIGxvZ0xldmVsc1RvQml0RmxhZ3MobGV2ZWxzOiBMb2dMZXZlbHNEaWN0KTogbnVtYmVyIHtcbiAgbGV0IGZsYWdzID0gMDtcbiAgZm9yIChsZXQgbGV2ZWwgb2YgTE9HX0xFVkVMX05BTUVTKSB7XG4gICAgbGV0IGVuYWJsZWQgPSBsZXZlbHNbbGV2ZWxdO1xuICAgIGZsYWdzIHw9IE51bWJlcihlbmFibGVkKSA8PCBMb2dMZXZlbFtsZXZlbF07XG4gIH1cbiAgcmV0dXJuIGZsYWdzO1xufVxuXG5mdW5jdGlvbiBsb2dMZXZlbHNGcm9tQml0RmxhZ3MoZmxhZ3M6IG51bWJlcik6IExvZ0xldmVsc0RpY3Qge1xuICBsZXQgbGV2ZWxzID0ge30gYXMgTG9nTGV2ZWxzRGljdDtcbiAgZm9yIChsZXQgbGV2ZWwgb2YgTE9HX0xFVkVMX05BTUVTKSB7XG4gICAgbGV0IGJpdCA9IExvZ0xldmVsW2xldmVsXTtcbiAgICBsZXZlbHNbbGV2ZWxdID0gQm9vbGVhbihmbGFncyAmICgxIDw8IGJpdCkpO1xuICB9XG4gIHJldHVybiBsZXZlbHM7XG59XG5cbmZ1bmN0aW9uIGdldExvZ0xldmVscygpOiBMb2dMZXZlbHNEaWN0IHtcbiAgbGV0IGZsYWdzU3RyID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2xvZ0ZsYWdzJyk7XG4gIGlmIChmbGFnc1N0ciAhPSBudWxsKSB7XG4gICAgbGV0IGZsYWdzID0gcGFyc2VJbnQoZmxhZ3NTdHIsIDEwKTtcbiAgICBpZiAoTnVtYmVyLmlzU2FmZUludGVnZXIoZmxhZ3MpKSB7XG4gICAgICByZXR1cm4gbG9nTGV2ZWxzRnJvbUJpdEZsYWdzKGZsYWdzKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHsgLi4uREVGQVVMVF9MT0dfTEVWRUxTIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRMb2dMZXZlbHMobGV2ZWxzOiBMb2dMZXZlbHNEaWN0KTogdm9pZCB7XG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdsb2dGbGFncycsIFN0cmluZyhsb2dMZXZlbHNUb0JpdEZsYWdzKGxldmVscykpKTtcbn1cblxuY29uc3QgRVZFTlRTX0JMT0NLRURfQllfQ09OU09MRSA9IFtcbiAgJ21vdXNld2hlZWwnLFxuICAnY29udGV4dG1lbnUnLFxuICAnbW91c2Vkb3duJyxcbiAgJ21vdXNldXAnLFxuICAnbW91c2Vtb3ZlJyxcbiAgJ3RvdWNoc3RhcnQnLFxuICAndG91Y2hlbmQnLFxuICAndG91Y2htb3ZlJyxcbiAgJ2tleWRvd24nLFxuICAna2V5dXAnLFxuICAna2V5cHJlc3MnLFxuXSBhcyBjb25zdDtcblxuY29uc3QgTE9HX0xFVkVMX0FQUEVBUkVOQ0VfRFVSQVRJT05TOiBMb2dMZXZlbHNEaWN0PG51bWJlcj4gPSB7XG4gIExPRzogMjAwMCxcbiAgV0FSTjogNTAwMCxcbiAgRVJST1I6IDE1MDAwLFxufTtcblxubGV0IHJvb3RFbGVtZW50OiBIVE1MRWxlbWVudDtcblxuZXhwb3J0IGZ1bmN0aW9uIGluamVjdCgpOiB2b2lkIHtcbiAgbGV0IGxvZ0xldmVscyA9IGdldExvZ0xldmVscygpO1xuXG4gIHJvb3RFbGVtZW50ID0gdXRpbHMuaHRtbCgnZGl2Jywge1xuICAgIGlkOiAnY2Nsb2FkZXItY29uc29sZScsXG4gICAgY2xhc3M6IFsnY2Nsb2FkZXItb3ZlcmxheScsICdjY2xvYWRlci12Ym94JywgJ2NjbG9hZGVyLXZzY3JvbGwnXSxcbiAgfSk7XG5cbiAgZm9yIChsZXQgZXZlbnRUeXBlIG9mIEVWRU5UU19CTE9DS0VEX0JZX0NPTlNPTEUpIHtcbiAgICByb290RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgKGV2ZW50KSA9PiBldmVudC5zdG9wUHJvcGFnYXRpb24oKSk7XG4gIH1cblxuICBkb2N1bWVudC5ib2R5LmFwcGVuZChyb290RWxlbWVudCk7XG5cbiAgZnVuY3Rpb24gaG9va0NvbnNvbGVNZXRob2QobmFtZTogJ2Vycm9yJyB8ICd3YXJuJyB8ICdsb2cnIHwgJ2luZm8nLCBsZXZlbDogTG9nTGV2ZWwpOiB2b2lkIHtcbiAgICBsZXQgb2xkID0gY29uc29sZVtuYW1lXSBhcyAoLi4ubWVzc2FnZTogdW5rbm93bltdKSA9PiB2b2lkO1xuICAgIGNvbnNvbGVbbmFtZV0gPSBmdW5jdGlvbiAoLi4ubWVzc2FnZTogdW5rbm93bltdKTogdm9pZCB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWNvbmZ1c2luZy12b2lkLWV4cHJlc3Npb25cbiAgICAgIGxldCByZXN1bHQgPSBvbGQuYXBwbHkodGhpcywgbWVzc2FnZSk7XG4gICAgICBsb2cobGV2ZWwsIC4uLm1lc3NhZ2UpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9XG5cbiAgaWYgKGxvZ0xldmVscy5FUlJPUikge1xuICAgIGhvb2tDb25zb2xlTWV0aG9kKCdlcnJvcicsIExvZ0xldmVsLkVSUk9SKTtcbiAgfVxuICBpZiAobG9nTGV2ZWxzLldBUk4pIHtcbiAgICBob29rQ29uc29sZU1ldGhvZCgnd2FybicsIExvZ0xldmVsLldBUk4pO1xuICB9XG4gIGlmIChsb2dMZXZlbHMuTE9HKSB7XG4gICAgaG9va0NvbnNvbGVNZXRob2QoJ2xvZycsIExvZ0xldmVsLkxPRyk7XG4gICAgaG9va0NvbnNvbGVNZXRob2QoJ2luZm8nLCBMb2dMZXZlbC5MT0cpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGxvZyhsZXZlbDogTG9nTGV2ZWwsIC4uLm1lc3NhZ2U6IHVua25vd25bXSk6IHZvaWQge1xuICBsZXQgbGV2ZWxOYW1lID0gTG9nTGV2ZWxbbGV2ZWxdIGFzIExvZ0xldmVsTmFtZTtcblxuICBsZXQgZWwgPSB1dGlscy5odG1sKCdkaXYnLCB7XG4gICAgY2xhc3M6IFsnY2Nsb2FkZXItbWVzc2FnZScsIGBjY2xvYWRlci0ke2xldmVsTmFtZX1gXSxcbiAgICBjaGlsZHJlbjogW2BbJHtMb2dMZXZlbFtsZXZlbF19XSAke2Zvcm1hdE1lc3NhZ2UoLi4ubWVzc2FnZSl9YF0sXG4gIH0pO1xuXG4gIHJvb3RFbGVtZW50LmFwcGVuZChlbCk7XG5cbiAgbGV0IHJlbW92ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBlbC5yZW1vdmUoKTtcbiAgfSwgTE9HX0xFVkVMX0FQUEVBUkVOQ0VfRFVSQVRJT05TW2xldmVsTmFtZV0pO1xuXG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBlbC5yZW1vdmUoKTtcbiAgICBjbGVhclRpbWVvdXQocmVtb3ZlVGltZW91dCk7XG4gIH0pO1xuXG4gIHJvb3RFbGVtZW50LnNjcm9sbFRvKDAsIHJvb3RFbGVtZW50LnNjcm9sbEhlaWdodCk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdE1lc3NhZ2UoLi4ubWVzc2FnZTogdW5rbm93bltdKTogc3RyaW5nIHtcbiAgaWYgKG5vZGVqc1V0aWwgIT0gbnVsbCkge1xuICAgIGxldCBmb3JtYXRGbiA9IG5vZGVqc1V0aWwuZm9ybWF0IGFzICguLi5hcmdzOiB1bmtub3duW10pID0+IHN0cmluZztcbiAgICByZXR1cm4gZm9ybWF0Rm4oLi4ubWVzc2FnZSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG1lc3NhZ2UubWFwKChtKSA9PiBTdHJpbmcobSkpLmpvaW4oJyAnKTtcbiAgfVxufVxuIiwgIi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1keW5hbWljLWRlbGV0ZSAqL1xuXG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuL3V0aWxzJztcbmltcG9ydCAqIGFzIGNvbnNvbGVNIGZyb20gJ0BjY2xvYWRlcjMvY29tbW9uL2NvbnNvbGUnO1xuaW1wb3J0ICogYXMgcmVzb3VyY2VzIGZyb20gJy4uL3Jlc291cmNlcyc7XG5cbmNvbnN0IExPR19MRVZFTF9PUFRJT05fSURTOiBjb25zb2xlTS5Mb2dMZXZlbHNEaWN0PHN0cmluZz4gPSB7XG4gIExPRzogJ2xvZ0xldmVsLWxvZycsXG4gIFdBUk46ICdsb2dMZXZlbC13YXJuJyxcbiAgRVJST1I6ICdsb2dMZXZlbC1lcnJvcicsXG59O1xuXG5jb25zdCBNT0RfRU5BQkxFRF9PUFRJT05fSURfUFJFRklYID0gJ21vZEVuYWJsZWQtJztcblxuY29uc3QgSU5TVEFMTEVEX01PRFM6IG1vZGxvYWRlci5Nb2RbXSA9IEFycmF5LmZyb20obW9kbG9hZGVyLmluc3RhbGxlZE1vZHMudmFsdWVzKCkpXG4gIC5maWx0ZXIoKG1vZCkgPT4gbW9kICE9PSBtb2Rsb2FkZXIuX3J1bnRpbWVNb2QpXG4gIC8vIFRPRE86IHNvcnQgdGhpcyBiYXNlZCBvbiB0aGUgbG9jYWxpemVkIHRpdGxlLCBzZWVcbiAgLy8gPGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzIxNDA2MjcvaG93LXRvLWRvLWNhc2UtaW5zZW5zaXRpdmUtc3RyaW5nLWNvbXBhcmlzb24+XG4gIC5zb3J0KChtb2QxLCBtb2QyKSA9PiB1dGlscy5jb21wYXJlKG1vZDEuaWQsIG1vZDIuaWQpKTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbnJlc291cmNlcy5qc29uUGF0Y2hlcy5hZGQoJ2RhdGEvbGFuZy9zYy9ndWkuZW5fVVMuanNvbicsIChkYXRhOiBhbnkpID0+IHtcbiAgbGV0IHsgb3B0aW9ucyB9ID0gZGF0YS5sYWJlbHM7XG4gIGZvciAobGV0IG1vZCBvZiBJTlNUQUxMRURfTU9EUykge1xuICAgIG9wdGlvbnNbYG1vZEVuYWJsZWQtJHttb2QuaWR9YF0gPSB7XG4gICAgICBuYW1lOiB1dGlscy5nZXRNb2RUaXRsZShtb2QpIHx8ICcgJyxcbiAgICAgIGRlc2NyaXB0aW9uOiB1dGlscy5nZXRMb2NhbGl6ZWRTdHJpbmcobW9kLm1hbmlmZXN0LmRlc2NyaXB0aW9uKSB8fCAnICcsXG4gICAgfTtcbiAgfVxufSk7XG5cbmlnLm1vZHVsZSgnY2Nsb2FkZXItcnVudGltZS51aS5vcHRpb25zJylcbiAgLnJlcXVpcmVzKFxuICAgICdpbXBhY3QuYmFzZS5mb250JyxcbiAgICAnZ2FtZS5mZWF0dXJlLmZvbnQuZm9udC1zeXN0ZW0nLFxuICAgICdnYW1lLmZlYXR1cmUubW9kZWwub3B0aW9ucy1tb2RlbCcsXG4gICAgJ2dhbWUuZmVhdHVyZS5tZW51Lmd1aS5vcHRpb25zLm9wdGlvbnMtbGlzdCcsXG4gICAgJ2dhbWUuZmVhdHVyZS5tZW51Lmd1aS5vcHRpb25zLm9wdGlvbnMtdHlwZXMnLFxuICApXG4gIC5kZWZpbmVzKCgpID0+IHtcbiAgICB1dGlscy5hZGRFbnVtTWVtYmVyKHNjLk9QVElPTl9DQVRFR09SWSwgJ01PRFMnKTtcblxuICAgIGZvciAobGV0IFtpbmRleCwgbGV2ZWxdIG9mIGNvbnNvbGVNLkxPR19MRVZFTF9OQU1FUy5lbnRyaWVzKCkpIHtcbiAgICAgIGxldCBkZWY6IHNjLk9wdGlvbkRlZmluaXRpb24gPSB7XG4gICAgICAgIHR5cGU6ICdDSEVDS0JPWCcsXG4gICAgICAgIGNhdDogc2MuT1BUSU9OX0NBVEVHT1JZLkdFTkVSQUwsXG4gICAgICAgIGluaXQ6IGNvbnNvbGVNLkRFRkFVTFRfTE9HX0xFVkVMU1tsZXZlbF0sXG4gICAgICAgIHJlc3RhcnQ6IHRydWUsXG4gICAgICB9O1xuICAgICAgaWYgKGluZGV4ID09PSAwKSB7XG4gICAgICAgIGRlZi5oYXNEaXZpZGVyID0gdHJ1ZTtcbiAgICAgICAgZGVmLmhlYWRlciA9ICdsb2dMZXZlbCc7XG4gICAgICB9XG4gICAgICBzYy5PUFRJT05TX0RFRklOSVRJT05bTE9HX0xFVkVMX09QVElPTl9JRFNbbGV2ZWxdXSA9IGRlZjtcbiAgICB9XG5cbiAgICBzYy5PUFRJT05TX0RFRklOSVRJT05bJ21vZHMtZGVzY3JpcHRpb24nXSA9IHtcbiAgICAgIHR5cGU6ICdJTkZPJyxcbiAgICAgIGNhdDogc2MuT1BUSU9OX0NBVEVHT1JZLk1PRFMsXG4gICAgICBkYXRhOiAnb3B0aW9ucy5tb2RzLWRlc2NyaXB0aW9uLmRlc2NyaXB0aW9uJyxcbiAgICAgIG1hcmdpbkJvdHRvbTogMTAsXG4gICAgfTtcblxuICAgIGZvciAobGV0IG1vZCBvZiBJTlNUQUxMRURfTU9EUykge1xuICAgICAgbGV0IGRlZmluaXRpb246IHNjLk9wdGlvbkRlZmluaXRpb25Db21tb24gJiBzYy5PcHRpb25EZWZpbml0aW9uLkNIRUNLQk9YID0ge1xuICAgICAgICB0eXBlOiAnQ0hFQ0tCT1gnLFxuICAgICAgICBjYXQ6IHNjLk9QVElPTl9DQVRFR09SWS5NT0RTLFxuICAgICAgICBpbml0OiB0cnVlLFxuICAgICAgICByZXN0YXJ0OiB0cnVlLFxuICAgICAgICBjaGVja2JveFJpZ2h0QWxpZ246IHRydWUsXG4gICAgICAgIG1vZCxcbiAgICAgIH07XG5cbiAgICAgIHNjLk9QVElPTlNfREVGSU5JVElPTltgJHtNT0RfRU5BQkxFRF9PUFRJT05fSURfUFJFRklYfSR7bW9kLmlkfWBdID0gZGVmaW5pdGlvbjtcbiAgICB9XG5cbiAgICBjb25zdCBNT0RTX1RBQl9JRCA9ICdtb2RzJyBhcyBjb25zdDtcbiAgICBzYy5mb250c3lzdGVtLmZvbnQucHVzaEljb25TZXQoXG4gICAgICBuZXcgaWcuRm9udCgnbW9kOi8vY2Nsb2FkZXItcnVudGltZS9tZWRpYS9pY29ucy5wbmcnLCAxNiwgaWcuTXVsdGlGb250LklDT05fU1RBUlQpLFxuICAgICAgeyBbTU9EU19UQUJfSURdOiAwIH0sXG4gICAgKTtcbiAgICBzYy5PcHRpb25zVGFiQm94LnByb3RvdHlwZS50YWJzW01PRFNfVEFCX0lEXSA9IG51bGwhO1xuICAgIHNjLk9wdGlvbnNUYWJCb3guaW5qZWN0KHtcbiAgICAgIGluaXQoLi4uYXJncykge1xuICAgICAgICB0aGlzLnBhcmVudCguLi5hcmdzKTtcbiAgICAgICAgbGV0IGJ0biA9IHRoaXMuX2NyZWF0ZVRhYkJ1dHRvbihNT0RTX1RBQl9JRCwgdGhpcy50YWJBcnJheS5sZW5ndGgsIHNjLk9QVElPTl9DQVRFR09SWS5NT0RTKTtcbiAgICAgICAgdGhpcy50YWJzW01PRFNfVEFCX0lEXSA9IGJ0bjtcbiAgICAgICAgdGhpcy5fcmVhcnJhbmdlVGFicygpO1xuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHsgbW9kRGF0YVN0b3JhZ2UgfSA9IG1vZGxvYWRlcjtcblxuICAgIHNjLk9wdGlvbk1vZGVsLmluamVjdCh7XG4gICAgICBvblN0b3JhZ2VHbG9iYWxMb2FkKGdsb2JhbHNEYXRhLCAuLi5hcmdzKSB7XG4gICAgICAgIGxldCB7IG9wdGlvbnMgfSA9IGdsb2JhbHNEYXRhO1xuICAgICAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICAgICAgb3B0aW9ucyA9IHt9IGFzIGlnLlN0b3JhZ2UuR2xvYmFsc0RhdGEuT3B0aW9ucztcbiAgICAgICAgICBnbG9iYWxzRGF0YS5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cyhvcHRpb25zKSkge1xuICAgICAgICAgIGlmIChrZXkuc3RhcnRzV2l0aChNT0RfRU5BQkxFRF9PUFRJT05fSURfUFJFRklYKSkge1xuICAgICAgICAgICAgZGVsZXRlIG9wdGlvbnNba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCB7IGlkIH0gb2YgSU5TVEFMTEVEX01PRFMpIHtcbiAgICAgICAgICBvcHRpb25zW2Ake01PRF9FTkFCTEVEX09QVElPTl9JRF9QUkVGSVh9JHtpZH1gXSA9IG1vZERhdGFTdG9yYWdlLmlzTW9kRW5hYmxlZChpZCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnQoZ2xvYmFsc0RhdGEsIC4uLmFyZ3MpO1xuICAgICAgfSxcblxuICAgICAgb25TdG9yYWdlR2xvYmFsU2F2ZShnbG9iYWxzRGF0YSwgLi4uYXJncykge1xuICAgICAgICBsZXQgcmVzdWx0ID0gdGhpcy5wYXJlbnQoZ2xvYmFsc0RhdGEsIC4uLmFyZ3MpO1xuXG4gICAgICAgIGxldCB7IG9wdGlvbnMgfSA9IGdsb2JhbHNEYXRhO1xuXG4gICAgICAgIGxldCBsb2dMZXZlbHMgPSB7fSBhcyBjb25zb2xlTS5Mb2dMZXZlbHNEaWN0O1xuICAgICAgICBmb3IgKGxldCBsZXZlbCBvZiBjb25zb2xlTS5MT0dfTEVWRUxfTkFNRVMpIHtcbiAgICAgICAgICBsb2dMZXZlbHNbbGV2ZWxdID0gb3B0aW9uc1tMT0dfTEVWRUxfT1BUSU9OX0lEU1tsZXZlbF1dIGFzIGJvb2xlYW47XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZU0uc2V0TG9nTGV2ZWxzKGxvZ0xldmVscyk7XG5cbiAgICAgICAgZm9yIChsZXQgeyBpZCB9IG9mIElOU1RBTExFRF9NT0RTKSB7XG4gICAgICAgICAgbGV0IG9wdGlvbklEID0gYCR7TU9EX0VOQUJMRURfT1BUSU9OX0lEX1BSRUZJWH0ke2lkfWA7XG4gICAgICAgICAgbW9kRGF0YVN0b3JhZ2Uuc2V0TW9kRW5hYmxlZChpZCwgQm9vbGVhbihvcHRpb25zW29wdGlvbklEXSkpO1xuICAgICAgICAgIGRlbGV0ZSBvcHRpb25zW29wdGlvbklEXTtcbiAgICAgICAgfVxuICAgICAgICBtb2REYXRhU3RvcmFnZS53cml0ZSgpLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gd3JpdGUgbW9kIGRhdGEgYW5kIHNldHRpbmdzOicsIGVycik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgTU9EX0lDT05fR1VJX1NJWkUgPSAyNDtcblxuICAgIHNjLk9wdGlvblJvdy5pbmplY3Qoe1xuICAgICAgbW9kSWNvbkdmeDogbnVsbCxcbiAgICAgIG1vZEljb25GYWxsYmFja0dmeDogbmV3IGlnLkltYWdlKCdtZWRpYS9ndWkvbWVudS5wbmcnKSxcbiAgICAgIG1vZEljb25Qb3NYOiAwLFxuICAgICAgbW9kSWNvblBvc1k6IDAsXG4gICAgICBtb2RWZXJzaW9uR3VpOiBudWxsLFxuXG4gICAgICBpbml0KC4uLmFyZ3MpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQoLi4uYXJncyk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9uLm1vZCAhPSBudWxsKSB7XG4gICAgICAgICAgbGV0IHsgbW9kIH0gPSB0aGlzLm9wdGlvbjtcblxuICAgICAgICAgIGxldCBjdXJyZW50U2NhbGUgPSBpZy5zeXN0ZW0uc2NhbGUgKiBpZy5zeXN0ZW0uY29udGV4dFNjYWxlO1xuICAgICAgICAgIC8vIFRoZSBsb29wIHdpbGwgc2VsZWN0IHRoZSBjcmlzcGVzdCBpY29uIGZvciB0aGUgY3VycmVudCBwaXhlbCBzaXplLFxuICAgICAgICAgIC8vIGl0IGtpbmQgb2YgZG9lcyBtaXBtYXAgc2VsZWN0aW9uLiBXZSBkb24ndCBwaWNrIHRoZSBsYXJnZXN0IGljb25cbiAgICAgICAgICAvLyByZXNvbHV0aW9uIGF2YWlsYWJsZSBiZWNhdXNlIHdlIGRvbid0IGdldCBtb3JlIHBpeGVscyBvbiB0aGVcbiAgICAgICAgICAvLyBjYW52YXMgdGhhbiB0aGUgaW50ZXJuYWwgcmVzb2x1dGlvbiB0aW1lcyB0aGUgY3VycmVudCBwaXhlbCBzaXplLlxuICAgICAgICAgIGZvciAobGV0IGljb25TY2FsZSA9IGN1cnJlbnRTY2FsZTsgaWNvblNjYWxlID4gMDsgaWNvblNjYWxlLS0pIHtcbiAgICAgICAgICAgIGxldCBpY29uU2l6ZSA9IGljb25TY2FsZSAqIE1PRF9JQ09OX0dVSV9TSVpFO1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRTY2FsZSAlIGljb25TY2FsZSAhPT0gMCkgY29udGludWU7XG4gICAgICAgICAgICBsZXQgaWNvblBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZCA9IG1vZC5tYW5pZmVzdC5pY29ucz8uW2ljb25TaXplXTtcbiAgICAgICAgICAgIGlmIChpY29uUGF0aCA9PSBudWxsKSBjb250aW51ZTtcbiAgICAgICAgICAgIHRoaXMubW9kSWNvbkdmeCA9IG5ldyBpZy5JbWFnZShgLyR7bW9kLnJlc29sdmVQYXRoKGljb25QYXRoKX1gKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMubW9kSWNvblBvc1ggPSB0aGlzLm5hbWVHdWkuaG9vay5wb3MueDtcbiAgICAgICAgICB0aGlzLm1vZEljb25Qb3NZID0gdGhpcy5saW5lR3VpLmhvb2sucG9zLnkgKyAyO1xuICAgICAgICAgIHRoaXMubmFtZUd1aS5ob29rLnBvcy54ICs9IHRoaXMubW9kSWNvblBvc1ggKyBNT0RfSUNPTl9HVUlfU0laRTtcblxuICAgICAgICAgIGxldCBtb2RWZXJzaW9uU3RyID0gbW9kLnZlcnNpb24gIT0gbnVsbCA/IG1vZC52ZXJzaW9uLnRvU3RyaW5nKCkgOiAnJztcbiAgICAgICAgICBpZiAoL15bXnZdL2kudGVzdChtb2RWZXJzaW9uU3RyKSkge1xuICAgICAgICAgICAgbW9kVmVyc2lvblN0ciA9IGB2JHttb2RWZXJzaW9uU3RyfWA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubW9kVmVyc2lvbkd1aSA9IG5ldyBzYy5UZXh0R3VpKG1vZFZlcnNpb25TdHIsIHsgZm9udDogc2MuZm9udHN5c3RlbS50aW55Rm9udCB9KTtcbiAgICAgICAgICB0aGlzLm1vZFZlcnNpb25HdWkuc2V0QWxpZ24oaWcuR1VJX0FMSUdOLlhfTEVGVCwgaWcuR1VJX0FMSUdOLllfQk9UVE9NKTtcbiAgICAgICAgICB0aGlzLm1vZFZlcnNpb25HdWkuc2V0UG9zKFxuICAgICAgICAgICAgdGhpcy5saW5lR3VpLmhvb2suc2l6ZS54IC0gdGhpcy5tb2RWZXJzaW9uR3VpLmhvb2suc2l6ZS54ICsgMSxcbiAgICAgICAgICAgIHRoaXMubGluZUd1aS5ob29rLnBvcy55ICsgMSxcbiAgICAgICAgICApO1xuICAgICAgICAgIHRoaXMuYWRkQ2hpbGRHdWkodGhpcy5tb2RWZXJzaW9uR3VpKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgdXBkYXRlRHJhd2FibGVzKHJlbmRlcmVyKSB7XG4gICAgICAgIHRoaXMucGFyZW50KHJlbmRlcmVyKTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9uLm1vZCAhPSBudWxsKSB7XG4gICAgICAgICAgbGV0IGljb25HZng6IGlnLkltYWdlO1xuICAgICAgICAgIGxldCBzcmNYID0gMDtcbiAgICAgICAgICBsZXQgc3JjWSA9IDA7XG4gICAgICAgICAgbGV0IHNpemVYID0gMDtcbiAgICAgICAgICBsZXQgc2l6ZVkgPSAwO1xuICAgICAgICAgIGxldCBzY2FsZVggPSAxO1xuICAgICAgICAgIGxldCBzY2FsZVkgPSAxO1xuICAgICAgICAgIGlmICh0aGlzLm1vZEljb25HZng/LmxvYWRlZCkge1xuICAgICAgICAgICAgaWNvbkdmeCA9IHRoaXMubW9kSWNvbkdmeDtcbiAgICAgICAgICAgIHNpemVYID0gaWNvbkdmeC53aWR0aDtcbiAgICAgICAgICAgIHNpemVZID0gaWNvbkdmeC5oZWlnaHQ7XG4gICAgICAgICAgICBzY2FsZVggPSBNT0RfSUNPTl9HVUlfU0laRSAvIGljb25HZngud2lkdGg7XG4gICAgICAgICAgICBzY2FsZVkgPSBNT0RfSUNPTl9HVUlfU0laRSAvIGljb25HZnguaGVpZ2h0O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpY29uR2Z4ID0gdGhpcy5tb2RJY29uRmFsbGJhY2tHZng7XG4gICAgICAgICAgICAvLyBDb29yZGluYXRlcyB3ZXJlIHRha2VuIGZyb20gYHNjLlF1aWNrTWVudUFuYWx5c2lzQ3Vyc29yI3VwZGF0ZURyYXdhYmxlc2BcbiAgICAgICAgICAgIHNyY1ggPSA1MzY7XG4gICAgICAgICAgICBzcmNZID0gMTYwO1xuICAgICAgICAgICAgc2l6ZVggPSAyMztcbiAgICAgICAgICAgIHNpemVZID0gMjM7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIFByZXRlbmQgdGhhdCB0aGUgaWNvbiBpcyBhIGNoaWxkIEdVSSBlbGVtZW50IHdpdGggWF9MRUZUIGFuZFxuICAgICAgICAgIC8vIFlfQk9UVE9NIGFsaWdubWVudHMuXG4gICAgICAgICAgbGV0IGljb25YID0gdGhpcy5tb2RJY29uUG9zWCAvIHNjYWxlWDtcbiAgICAgICAgICBsZXQgaWNvblkgPSAodGhpcy5ob29rLnNpemUueSAtIE1PRF9JQ09OX0dVSV9TSVpFIC0gdGhpcy5tb2RJY29uUG9zWSkgLyBzY2FsZVk7XG4gICAgICAgICAgcmVuZGVyZXIuYWRkVHJhbnNmb3JtKCkuc2V0U2NhbGUoc2NhbGVYLCBzY2FsZVkpO1xuICAgICAgICAgIHJlbmRlcmVyLmFkZEdmeChpY29uR2Z4LCBpY29uWCwgaWNvblksIHNyY1gsIHNyY1ksIHNpemVYLCBzaXplWSk7XG4gICAgICAgICAgcmVuZGVyZXIudW5kb1RyYW5zZm9ybSgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pO1xuICB9KTtcbiIsICJpZy5tb2R1bGUoJ2NjbG9hZGVyLXJ1bnRpbWUudWkudmVyc2lvbi1kaXNwbGF5JylcbiAgLnJlcXVpcmVzKFxuICAgICdnYW1lLmZlYXR1cmUuZ3VpLmJhc2UudGV4dCcsXG4gICAgJ2dhbWUuZmVhdHVyZS5ndWkuc2NyZWVuLnRpdGxlLXNjcmVlbicsXG4gICAgJ2dhbWUuZmVhdHVyZS5ndWkuc2NyZWVuLnBhdXNlLXNjcmVlbicsXG4gIClcbiAgLmRlZmluZXMoKCkgPT4ge1xuICAgIGZ1bmN0aW9uIGF0dGFjaENDTG9hZGVyVmVyc2lvblRleHQodmVyc2lvbkd1aTogc2MuVGV4dEd1aSk6IHNjLlRleHRHdWkge1xuICAgICAgY29uc3QgY2Nsb2FkZXJWZXJzaW9uR3VpID0gbmV3IHNjLlRleHRHdWkoYENDTG9hZGVyIHYke21vZGxvYWRlci52ZXJzaW9ufWAsIHtcbiAgICAgICAgZm9udDogc2MuZm9udHN5c3RlbS50aW55Rm9udCxcbiAgICAgIH0pO1xuICAgICAgY2Nsb2FkZXJWZXJzaW9uR3VpLnNldEFsaWduKHZlcnNpb25HdWkuaG9vay5hbGlnbi54LCB2ZXJzaW9uR3VpLmhvb2suYWxpZ24ueSk7XG4gICAgICBjY2xvYWRlclZlcnNpb25HdWkuc2V0UG9zKDAsIHZlcnNpb25HdWkuaG9vay5zaXplLnkpO1xuICAgICAgdmVyc2lvbkd1aS5hZGRDaGlsZEd1aShjY2xvYWRlclZlcnNpb25HdWkpO1xuICAgICAgcmV0dXJuIGNjbG9hZGVyVmVyc2lvbkd1aTtcbiAgICB9XG5cbiAgICBzYy5UaXRsZVNjcmVlbkd1aS5pbmplY3Qoe1xuICAgICAgY2Nsb2FkZXJWZXJzaW9uR3VpOiBudWxsLFxuXG4gICAgICBpbml0KC4uLmFyZ3MpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQoLi4uYXJncyk7XG4gICAgICAgIHRoaXMuY2Nsb2FkZXJWZXJzaW9uR3VpID0gYXR0YWNoQ0NMb2FkZXJWZXJzaW9uVGV4dCh0aGlzLnZlcnNpb25HdWkpO1xuICAgICAgfSxcbiAgICB9KTtcblxuICAgIHNjLlBhdXNlU2NyZWVuR3VpLmluamVjdCh7XG4gICAgICBjY2xvYWRlclZlcnNpb25HdWk6IG51bGwsXG5cbiAgICAgIGluaXQoLi4uYXJncykge1xuICAgICAgICB0aGlzLnBhcmVudCguLi5hcmdzKTtcbiAgICAgICAgdGhpcy5jY2xvYWRlclZlcnNpb25HdWkgPSBhdHRhY2hDQ0xvYWRlclZlcnNpb25UZXh0KHRoaXMudmVyc2lvbkd1aSk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9KTtcbiIsICJpbXBvcnQgKiBhcyB1dGlscyBmcm9tICdAY2Nsb2FkZXIzL2NvbW1vbi91dGlscyc7XG5pbXBvcnQgeyBDb25maWcgfSBmcm9tICcuL2NvbmZpZyc7XG5cbmNvbnN0IGZzOiB0eXBlb2YgaW1wb3J0KCdmcycpID0gd2luZG93LnJlcXVpcmU/LignZnMnKTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRGaWxlKHBhdGg6IHN0cmluZyk6IFByb21pc2U8QnVmZmVyPiB7XG4gIHJldHVybiBmcy5wcm9taXNlcy5yZWFkRmlsZShwYXRoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRUZXh0KHBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBmcy5wcm9taXNlcy5yZWFkRmlsZShwYXRoLCAndXRmOCcpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNSZWFkYWJsZShwYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgdHJ5IHtcbiAgICBhd2FpdCBmcy5wcm9taXNlcy5hY2Nlc3MocGF0aCwgZnMuY29uc3RhbnRzLlJfT0spO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChfZXJyKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaW5kUmVjdXJzaXZlbHkoZGlyOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gIGlmIChkaXIuZW5kc1dpdGgoJy8nKSkgZGlyID0gZGlyLnNsaWNlKDAsIC0xKTtcblxuICBsZXQgZmlsZUxpc3Q6IHN0cmluZ1tdID0gW107XG4gIGF3YWl0IGZpbmRSZWN1cnNpdmVseUludGVybmFsKGRpciwgJycsIGZpbGVMaXN0KTtcbiAgcmV0dXJuIGZpbGVMaXN0O1xufVxuXG5hc3luYyBmdW5jdGlvbiBmaW5kUmVjdXJzaXZlbHlJbnRlcm5hbChcbiAgY3VycmVudERpcjogc3RyaW5nLFxuICByZWxhdGl2ZVByZWZpeDogc3RyaW5nLFxuICBmaWxlTGlzdDogc3RyaW5nW10sXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgbGV0IGNvbnRlbnRzOiBzdHJpbmdbXTtcbiAgdHJ5IHtcbiAgICBjb250ZW50cyA9IGF3YWl0IGZzLnByb21pc2VzLnJlYWRkaXIoY3VycmVudERpcik7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmICh1dGlscy5lcnJvckhhc0NvZGUoZXJyKSAmJiBlcnIuY29kZSA9PT0gJ0VOT0VOVCcpIHJldHVybjtcbiAgICB0aHJvdyBlcnI7XG4gIH1cblxuICBhd2FpdCBQcm9taXNlLmFsbChcbiAgICBjb250ZW50cy5tYXAoYXN5bmMgKG5hbWUpID0+IHtcbiAgICAgIGxldCBmdWxsUGF0aCA9IGAke2N1cnJlbnREaXJ9LyR7bmFtZX1gO1xuICAgICAgbGV0IHN0YXQgPSBhd2FpdCBmcy5wcm9taXNlcy5zdGF0KGZ1bGxQYXRoKTtcbiAgICAgIGlmIChzdGF0LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgYXdhaXQgZmluZFJlY3Vyc2l2ZWx5SW50ZXJuYWwoZnVsbFBhdGgsIGAke3JlbGF0aXZlUHJlZml4fSR7bmFtZX0vYCwgZmlsZUxpc3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmlsZUxpc3QucHVzaChgJHtyZWxhdGl2ZVByZWZpeH0ke25hbWV9YCk7XG4gICAgICB9XG4gICAgfSksXG4gICk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRNb2RQYXRoc0luKFxuICBkaXI6IHN0cmluZyxcbiAgX2NvbmZpZzogQ29uZmlnLFxuKTogUHJvbWlzZTx7IG1vZERpcmVjdG9yaWVzOiBzdHJpbmdbXTsgY2Ntb2RzOiBzdHJpbmdbXSB9PiB7XG4gIGlmIChkaXIuZW5kc1dpdGgoJy8nKSkgZGlyID0gZGlyLnNsaWNlKDAsIC0xKTtcblxuICBsZXQgYWxsQ29udGVudHM6IHN0cmluZ1tdO1xuICB0cnkge1xuICAgIGFsbENvbnRlbnRzID0gYXdhaXQgZnMucHJvbWlzZXMucmVhZGRpcihkaXIpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAodXRpbHMuZXJyb3JIYXNDb2RlKGVycikgJiYgZXJyLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICBhd2FpdCBmcy5wcm9taXNlcy5ta2RpcihkaXIpO1xuICAgICAgYWxsQ29udGVudHMgPSBhd2FpdCBmcy5wcm9taXNlcy5yZWFkZGlyKGRpcik7XG4gICAgfVxuICAgIHRocm93IGVycjtcbiAgfVxuXG4gIGNvbnN0IG1vZERpcmVjdG9yaWVzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBjY21vZHM6IHN0cmluZ1tdID0gW107XG4gIGF3YWl0IFByb21pc2UuYWxsKFxuICAgIGFsbENvbnRlbnRzLm1hcChhc3luYyAobmFtZSkgPT4ge1xuICAgICAgbGV0IGZ1bGxQYXRoID0gYCR7ZGlyfS8ke25hbWV9YDtcbiAgICAgIC8vIHRoZSBgd2l0aEZpbGVUeXBlc2Agb3B0aW9uIG9mIGByZWFkZGlyYCBjYW4ndCBiZSB1c2VkIGhlcmUgYmVjYXVzZSBpdFxuICAgICAgLy8gZG9lc24ndCBkZXJlZmVyZW5jZSBzeW1ib2xpYyBsaW5rcyBzaW1pbGFybHkgdG8gYHN0YXRgXG4gICAgICBsZXQgc3RhdCA9IGF3YWl0IGZzLnByb21pc2VzLnN0YXQoZnVsbFBhdGgpO1xuICAgICAgaWYgKHN0YXQuaXNEaXJlY3RvcnkoKSkgbW9kRGlyZWN0b3JpZXMucHVzaChmdWxsUGF0aCk7XG4gICAgICBlbHNlIGlmIChzdGF0LmlzRmlsZSgpICYmIG5hbWUuZW5kc1dpdGgoJy5jY21vZCcpKSB7XG4gICAgICAgIGNjbW9kcy5wdXNoKGZ1bGxQYXRoKTtcbiAgICAgIH1cbiAgICB9KSxcbiAgKTtcbiAgcmV0dXJuIHsgbW9kRGlyZWN0b3JpZXMsIGNjbW9kcyB9O1xufVxuXG4vLyBSZXBsaWNhdGVzIHRoZSBiZWhhdmlvciBvZiBgaWcuRXh0ZW5zaW9uTGlzdCNsb2FkRXh0ZW5zaW9uc05XSlNgLlxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEluc3RhbGxlZEV4dGVuc2lvbnMoY29uZmlnOiBDb25maWcpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gIGxldCBpZ1Jvb3QgPSAoY29uZmlnLmltcGFjdENvbmZpZy5JR19ST09UIGFzIHN0cmluZykgPz8gJyc7XG4gIGxldCBpZ0RlYnVnID0gQm9vbGVhbihjb25maWcuaW1wYWN0Q29uZmlnLklHX0dBTUVfREVCVUcpO1xuICBsZXQgZXh0ZW5zaW9uc0RpciA9IGAke2lnUm9vdH0ke2lnRGVidWcgPyAnZGF0YScgOiAnYXNzZXRzJ30vZXh0ZW5zaW9uYDtcblxuICBsZXQgYWxsQ29udGVudHM6IHN0cmluZ1tdO1xuICB0cnkge1xuICAgIGFsbENvbnRlbnRzID0gYXdhaXQgZnMucHJvbWlzZXMucmVhZGRpcihleHRlbnNpb25zRGlyKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgLy8gT2xkZXIgdmVyc2lvbnMgb2YgdGhlIGdhbWUgc2ltcGx5IGRvbid0IGhhdmUgdGhlIHN1cHBvcnQgZm9yIGV4dGVuc2lvbnMuXG4gICAgaWYgKHV0aWxzLmVycm9ySGFzQ29kZShlcnIpICYmIGVyci5jb2RlID09PSAnRU5PRU5UJykgcmV0dXJuIFtdO1xuICAgIHRocm93IGVycjtcbiAgfVxuXG4gIGxldCBleHRlbnNpb25JZHM6IHN0cmluZ1tdID0gW107XG4gIGF3YWl0IFByb21pc2UuYWxsKFxuICAgIGFsbENvbnRlbnRzLm1hcChhc3luYyAobmFtZSkgPT4ge1xuICAgICAgLy8gTm8gaWRlYSB3aHkgdGhpcyBpcyBjaGVja2VkIGJ5IHRoZSBnYW1lLlxuICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgnLicpKSByZXR1cm47XG5cbiAgICAgIGlmIChpZ0RlYnVnKSB7XG4gICAgICAgIC8vIFRoZSBkZWJ1ZyBtb2RlIGlzIGludGVyZXN0aW5nOiBpdCBzZWVtcyB0aGF0IHdoZW4gaXQgaXMgZW5hYmxlZCxcbiAgICAgICAgLy8gb25seSBleHRlbnNpb24gbWFuaWZlc3RzIGFyZSBsb2FkZWQgZnJvbSBgZGF0YS9leHRlbnNpb24vYCwgd2hpbGVcbiAgICAgICAgLy8gdGhlIGZpbGVzIG9mIHRoZSBleHRlbnNpb25zIHJlc2lkZSBpbnNpZGUgZ2FtZSdzIG5vcm1hbCBkaXJlY3RvcnlcbiAgICAgICAgLy8gc3RydWN0dXJlLiBTbywgZXh0ZW5zaW9uIGRpcmVjdG9yaWVzIHdpdGggYXNzZXRzIGFyZSBjcmVhdGVkIG9ubHlcbiAgICAgICAgLy8gd2hlbiB0aGUgZ2FtZSBpcyBjb21waWxlZCBmb3IgcmVsZWFzZS5cbiAgICAgICAgaWYgKG5hbWUuZW5kc1dpdGgoJy5qc29uJykpIHtcbiAgICAgICAgICBleHRlbnNpb25JZHMucHVzaChuYW1lLnNsaWNlKDAsIC01KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICAvLyBUaGUgZ2FtZSBhbHNvIGNoZWNrcyBpZiB0aGUgY29udGFpbmluZyBkaXJlY3RvcnkgZXhpc3RzIGJlZm9yZVxuICAgICAgICAvLyBjaGVja2luZyBpZiB0aGVyZSBpcyBhIGZpbGUgaW5zaWRlLCBidXQgaXQgaXMgcmVkdW5kYW50LlxuICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy5hY2Nlc3MoYCR7ZXh0ZW5zaW9uc0Rpcn0vJHtuYW1lfS8ke25hbWV9Lmpzb25gKTtcbiAgICAgIH0gY2F0Y2ggKF9lcnIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZXh0ZW5zaW9uSWRzLnB1c2gobmFtZSk7XG4gICAgfSksXG4gICk7XG4gIHJldHVybiBleHRlbnNpb25JZHM7XG59XG4iLCAiaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnQGNjbG9hZGVyMy9jb21tb24vdXRpbHMnO1xuaW1wb3J0ICogYXMgcGF0aHMgZnJvbSAnQGNjbG9hZGVyMy9jb21tb24vcGF0aHMnO1xuaW1wb3J0IHsgQ29uZmlnIH0gZnJvbSAnLi9jb25maWcnO1xuXG5hc3luYyBmdW5jdGlvbiByZXF1ZXN0KHBhdGg6IHN0cmluZyk6IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgdHJ5IHtcbiAgICBsZXQgcmVzID0gYXdhaXQgZmV0Y2godXRpbHMuY3dkRmlsZVBhdGhUb1VSTChwYXRoKS5ocmVmKTtcbiAgICBpZiAoIXJlcy5vaykgdGhyb3cgbmV3IEVycm9yKGAke3Jlcy5zdGF0dXN9ICR7cmVzLnN0YXR1c1RleHR9YCk7XG4gICAgcmV0dXJuIHJlcztcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKHV0aWxzLmVycm9ySGFzTWVzc2FnZShlcnIpKSB7XG4gICAgICBlcnIubWVzc2FnZSA9IGBGYWlsZWQgdG8gbG9hZCBmaWxlICcke3BhdGh9JzogJHtlcnIubWVzc2FnZX1gO1xuICAgIH1cbiAgICB0aHJvdyBlcnI7XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRGaWxlKHBhdGg6IHN0cmluZyk6IFByb21pc2U8QXJyYXlCdWZmZXI+IHtcbiAgcmV0dXJuIChhd2FpdCByZXF1ZXN0KHBhdGgpKS5hcnJheUJ1ZmZlcigpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZFRleHQocGF0aDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgcmV0dXJuIChhd2FpdCByZXF1ZXN0KHBhdGgpKS50ZXh0KCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpc1JlYWRhYmxlKHBhdGg6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICB0cnkge1xuICAgIGxldCByZXMgPSBhd2FpdCBmZXRjaCh1dGlscy5jd2RGaWxlUGF0aFRvVVJMKHBhdGgpLmhyZWYsIHsgbWV0aG9kOiAnSEVBRCcgfSk7XG4gICAgcmV0dXJuIHJlcy5vaztcbiAgfSBjYXRjaCAoX2Vycikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0TW9kUGF0aHNJbihcbiAgZGlyOiBzdHJpbmcsXG4gIF9jb25maWc6IENvbmZpZyxcbik6IFByb21pc2U8eyBtb2REaXJlY3Rvcmllczogc3RyaW5nW107IGNjbW9kczogc3RyaW5nW10gfT4ge1xuICBpZiAoZGlyLmVuZHNXaXRoKCcvJykpIGRpciA9IGRpci5zbGljZSgwLCAtMSk7XG5cbiAgbGV0IGluZGV4UGF0aCA9IGAke2Rpcn0vaW5kZXguanNvbmA7XG4gIGxldCBpbmRleEpzb25UZXh0ID0gYXdhaXQgbG9hZFRleHQoaW5kZXhQYXRoKTtcbiAgbGV0IGluZGV4OiBzdHJpbmdbXTtcblxuICB0cnkge1xuICAgIGluZGV4ID0gSlNPTi5wYXJzZShpbmRleEpzb25UZXh0KTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKHV0aWxzLmVycm9ySGFzTWVzc2FnZShlcnIpKSB7XG4gICAgICBlcnIubWVzc2FnZSA9IGBTeW50YXggZXJyb3IgaW4gbW9kcyBkaXJlY3RvcnkgaW5kZXggaW4gJyR7aW5kZXhQYXRofSc6ICR7ZXJyLm1lc3NhZ2V9YDtcbiAgICB9XG4gICAgdGhyb3cgZXJyO1xuICB9XG5cbiAgY29uc3QgbW9kUGF0aHMgPSBpbmRleC5tYXAoKG1vZERpclBhdGgpID0+IHBhdGhzLmpvaW4oZGlyLCBwYXRocy5qYWlsUmVsYXRpdmUobW9kRGlyUGF0aCkpKTtcbiAgY29uc3QgbW9kRGlyZWN0b3JpZXM6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IGNjbW9kczogc3RyaW5nW10gPSBbXTtcbiAgZm9yIChjb25zdCBwYXRoIG9mIG1vZFBhdGhzKSB7XG4gICAgaWYgKHBhdGguZW5kc1dpdGgoJy5jY21vZCcpKSB7XG4gICAgICBjY21vZHMucHVzaChwYXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbW9kRGlyZWN0b3JpZXMucHVzaChwYXRoKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4geyBtb2REaXJlY3RvcmllcywgY2Ntb2RzIH07XG59XG5cbi8vIFJlcGxpY2F0ZXMgdGhlIGJlaGF2aW9yIG9mIGBpZy5FeHRlbnNpb25MaXN0I2xvYWRFeHRlbnNpb25zUEhQYC5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRJbnN0YWxsZWRFeHRlbnNpb25zKGNvbmZpZzogQ29uZmlnKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICBsZXQgaWdSb290ID0gKGNvbmZpZy5pbXBhY3RDb25maWcuSUdfUk9PVCBhcyBzdHJpbmcpID8/ICcnO1xuICBsZXQgaWdEZWJ1ZyA9IEJvb2xlYW4oY29uZmlnLmltcGFjdENvbmZpZy5JR19HQU1FX0RFQlVHKTtcbiAgbGV0IGV4dGVuc2lvbnNBcGlVcmwgPSBgJHtpZ1Jvb3R9cGFnZS9hcGkvZ2V0LWV4dGVuc2lvbi1saXN0LnBocD9kZWJ1Zz0ke2lnRGVidWcgPyAxIDogMH1gO1xuICB0cnkge1xuICAgIGxldCByZXMgPSBhd2FpdCBmZXRjaChleHRlbnNpb25zQXBpVXJsKTtcbiAgICBpZiAoIXJlcy5vaykgdGhyb3cgbmV3IEVycm9yKGAke3Jlcy5zdGF0dXN9ICR7cmVzLnN0YXR1c1RleHR9YCk7XG4gICAgLy8gU2hvdWxkIHRoZSByZXNwb25zZSBiZSB2YWxpZGF0ZWQ/XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoYXdhaXQgcmVzLnRleHQoKSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmICh1dGlscy5lcnJvckhhc01lc3NhZ2UoZXJyKSkge1xuICAgICAgZXJyLm1lc3NhZ2UgPSBgRmFpbGVkIHRvIHNlbmQgcmVxdWVzdCB0byAnJHtleHRlbnNpb25zQXBpVXJsfSc6ICR7ZXJyLm1lc3NhZ2V9YDtcbiAgICB9XG4gICAgLy8gdGhyb3cgZXJyO1xuICAgIHJldHVybiBbXTtcbiAgfVxufVxuIiwgImltcG9ydCAqIGFzIGZpbGVzQnJvd3NlciBmcm9tICcuL2ZpbGVzLmJyb3dzZXInO1xuaW1wb3J0IHsgQ29uZmlnIH0gZnJvbSAnLi9jb25maWcnO1xuXG5leHBvcnQgeyBpc1JlYWRhYmxlLCByZWFkRmlsZSwgbG9hZFRleHQgfSBmcm9tICcuL2ZpbGVzLmJyb3dzZXInO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0TW9kUGF0aHNJbihcbiAgZGlyOiBzdHJpbmcsXG4gIGNvbmZpZzogQ29uZmlnLFxuKTogUHJvbWlzZTx7IG1vZERpcmVjdG9yaWVzOiBzdHJpbmdbXTsgY2Ntb2RzOiBzdHJpbmdbXSB9PiB7XG4gIGlmIChkaXIgPT09IGAke2NvbmZpZy5nYW1lQXNzZXRzRGlyfW1vZHMvYCkge1xuICAgIHRyeSB7XG4gICAgICBsZXQgbW9kc0RpckVudHJpZXMgPSBKU09OLnBhcnNlKENyb3NzQW5kcm9pZE1vZExpc3RQcm92aWRlci5nZXRNb2RMaXN0QXNKc29uKCkpIGFzIHN0cmluZ1tdO1xuICAgICAgbGV0IG1vZFN1YmRpcnM6IHN0cmluZ1tdID0gW107XG4gICAgICBmb3IgKGxldCBtb2REaXJOYW1lIG9mIG1vZHNEaXJFbnRyaWVzKSB7XG4gICAgICAgIGlmIChtb2REaXJOYW1lLmVuZHNXaXRoKCcvJykpIHtcbiAgICAgICAgICBtb2RTdWJkaXJzLnB1c2goYCR7ZGlyfS8ke21vZERpck5hbWUuc2xpY2UoMCwgLTEpfWApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4geyBtb2REaXJlY3RvcmllczogbW9kU3ViZGlycywgY2Ntb2RzOiBbXSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGdldCB0aGUgbGlzdCBvZiBtb2RzIGZyb20gQ3Jvc3NBbmRyb2lkOicsIGVycik7XG4gICAgfVxuICB9XG4gIHJldHVybiBmaWxlc0Jyb3dzZXIuZ2V0TW9kUGF0aHNJbihkaXIsIGNvbmZpZyk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRJbnN0YWxsZWRFeHRlbnNpb25zKGNvbmZpZzogQ29uZmlnKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICB0cnkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKENyb3NzQW5kcm9pZEV4dGVuc2lvbkxpc3RQcm92aWRlci5nZXRFeHRlbnNpb25MaXN0QXNKc29uKCkpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gZ2V0IHRoZSBsaXN0IG9mIGV4dGVuc2lvbnMgZnJvbSBDcm9zc0FuZHJvaWQ6JywgZXJyKTtcbiAgfVxuICByZXR1cm4gZmlsZXNCcm93c2VyLmdldEluc3RhbGxlZEV4dGVuc2lvbnMoY29uZmlnKTtcbn1cbiIsICJleHBvcnQgbmFtZXNwYWNlIFNlcnZpY2VXb3JrZXIge1xuICAvLyBNZXNzYWdlcyBzZW5kIHRvIHRoZSBzZXJ2aWNlIHdvcmtlclxuICBleHBvcnQgbmFtZXNwYWNlIE91dGdvaW5nIHtcbiAgICBleHBvcnQgaW50ZXJmYWNlIFZhbGlkUGF0aFByZWZpeGVzUGFja2V0IHtcbiAgICAgIHR5cGU6ICdWYWxpZFBhdGhQcmVmaXhlcyc7XG4gICAgICB2YWxpZFBhdGhQcmVmaXhlczogc3RyaW5nW107XG4gICAgfVxuXG4gICAgZXhwb3J0IGludGVyZmFjZSBEYXRhUGFja2V0IHtcbiAgICAgIHR5cGU6ICdEYXRhJztcbiAgICAgIHBhdGg6IHN0cmluZztcbiAgICAgIGRhdGE6IEJvZHlJbml0IHwgbnVsbDtcbiAgICB9XG5cbiAgICBleHBvcnQgdHlwZSBQYWNrZXQgPSBWYWxpZFBhdGhQcmVmaXhlc1BhY2tldCB8IERhdGFQYWNrZXQ7XG4gIH1cbiAgLy8gTWVzc2FnZXMgY29taW5nIGZyb20gdGhlIHNlcnZpY2Ugd29ya2VyXG4gIGV4cG9ydCBuYW1lc3BhY2UgSW5jb21pbmcge1xuICAgIGV4cG9ydCBpbnRlcmZhY2UgUGF0aFBhY2tldCB7XG4gICAgICB0eXBlOiAnUGF0aCc7XG4gICAgICBwYXRoOiBzdHJpbmc7XG4gICAgfVxuICAgIGV4cG9ydCBpbnRlcmZhY2UgVmFsaWRQYXRoUHJlZml4ZXNSZXF1ZXN0UGFja2V0IHtcbiAgICAgIHR5cGU6ICdWYWxpZFBhdGhQcmVmaXhlc1JlcXVlc3QnO1xuICAgIH1cblxuICAgIGV4cG9ydCB0eXBlIFBhY2tldCA9IFBhdGhQYWNrZXQgfCBWYWxpZFBhdGhQcmVmaXhlc1JlcXVlc3RQYWNrZXQ7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgRmV0Y2hIYW5kbGVyID0gKHBhdGg6IHN0cmluZykgPT4gUHJvbWlzZTxBcnJheUJ1ZmZlckxpa2UgfCBudWxsPjtcblxubGV0IGZldGNoSGFuZGxlcjogRmV0Y2hIYW5kbGVyIHwgdW5kZWZpbmVkO1xubGV0IHZhbGlkUGF0aFByZWZpeGVzOiBzdHJpbmdbXSA9IFtdO1xuXG5mdW5jdGlvbiBzZW5kU2VydmljZVdvcmtlck1lc3NhZ2UocGFja2V0OiBTZXJ2aWNlV29ya2VyLk91dGdvaW5nLlBhY2tldCk6IHZvaWQge1xuICBjb25zdCB7IGNvbnRyb2xsZXIgfSA9IHdpbmRvdy5uYXZpZ2F0b3Iuc2VydmljZVdvcmtlcjtcbiAgY29udHJvbGxlcj8ucG9zdE1lc3NhZ2UocGFja2V0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEZldGNoSGFuZGxlcihwYXRoUHJlZml4ZXM6IHN0cmluZ1tdLCBoYW5kbGVyOiBGZXRjaEhhbmRsZXIpOiB2b2lkIHtcbiAgZmV0Y2hIYW5kbGVyID0gaGFuZGxlcjtcbiAgdmFsaWRQYXRoUHJlZml4ZXMgPSBwYXRoUHJlZml4ZXMubWFwKChwYXRoKSA9PiBgLyR7cGF0aH0vYCk7XG4gIHNlbmRTZXJ2aWNlV29ya2VyTWVzc2FnZSh7IHR5cGU6ICdWYWxpZFBhdGhQcmVmaXhlcycsIHZhbGlkUGF0aFByZWZpeGVzIH0pO1xufVxuXG5mdW5jdGlvbiBzZXRNZXNzYWdlSGFuZGxpbmcoKTogdm9pZCB7XG4gIG5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLm9ubWVzc2FnZSA9IGFzeW5jIChldmVudCkgPT4ge1xuICAgIGNvbnN0IHBhY2tldDogU2VydmljZVdvcmtlci5JbmNvbWluZy5QYWNrZXQgPSBldmVudC5kYXRhO1xuICAgIGxldCByZXNwb25zZVBhY2tldDogU2VydmljZVdvcmtlci5PdXRnb2luZy5QYWNrZXQ7XG5cbiAgICBpZiAocGFja2V0LnR5cGUgPT09ICdQYXRoJykge1xuICAgICAgY29uc3QgeyBwYXRoIH0gPSBwYWNrZXQ7XG4gICAgICByZXNwb25zZVBhY2tldCA9IHtcbiAgICAgICAgdHlwZTogJ0RhdGEnLFxuICAgICAgICBwYXRoLFxuICAgICAgICBkYXRhOlxuICAgICAgICAgIChhd2FpdCBmZXRjaEhhbmRsZXI/LihwYXRoKS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgZXJyb3Igd2hpbGUgaGFuZGluZyBmZXRjaCBvZiAke3BhdGh9OmAsIGUpO1xuICAgICAgICAgIH0pKSA/PyBudWxsLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzcG9uc2VQYWNrZXQgPSB7IHR5cGU6ICdWYWxpZFBhdGhQcmVmaXhlcycsIHZhbGlkUGF0aFByZWZpeGVzIH07XG4gICAgfVxuXG4gICAgc2VuZFNlcnZpY2VXb3JrZXJNZXNzYWdlKHJlc3BvbnNlUGFja2V0KTtcbiAgfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRTZXJ2aWNlV29ya2VyKCk6IFByb21pc2U8U2VydmljZVdvcmtlcj4ge1xuICBjb25zdCBjdXJyZW50UmVnaXN0cmF0aW9uID0gYXdhaXQgd2luZG93Lm5hdmlnYXRvci5zZXJ2aWNlV29ya2VyLmdldFJlZ2lzdHJhdGlvbigpO1xuICBpZiAoY3VycmVudFJlZ2lzdHJhdGlvbikge1xuICAgIC8vRG8gbm90IGF3YWl0IHVwZGF0ZSBzaW5jZSB0aGUgd29ya2VyIG9ubHkgcGVyZm9ybXMgYSBzaW1wbGUgdGFzay4gRXZlbiBpZiB0aGVyZSBpcyBhIGJ1Z2ZpeCBpdCBzaG91bGQgYmUgZW5vdWdoIHRvIG5vdCBjcmFzaC5cbiAgICB2b2lkIGN1cnJlbnRSZWdpc3RyYXRpb24udXBkYXRlKCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgcGF0aCA9ICdkaXN0LWNjbW9kLXNlcnZpY2Utd29ya2VyLmpzJztcbiAgICBhd2FpdCB3aW5kb3cubmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIocGF0aCwge1xuICAgICAgdXBkYXRlVmlhQ2FjaGU6ICdub25lJyxcbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN0IHsgY29udHJvbGxlciB9ID0gd2luZG93Lm5hdmlnYXRvci5zZXJ2aWNlV29ya2VyO1xuICBpZiAoIWNvbnRyb2xsZXIgfHwgY29udHJvbGxlci5zdGF0ZSAhPT0gJ2FjdGl2YXRlZCcpIHtcbiAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB3aW5kb3cubG9jYXRpb24udG9TdHJpbmcoKTtcbiAgICBoaXN0b3J5LmdvKDApO1xuXG4gICAgdGhyb3cgbmV3IEVycm9yKCcoXHUyNTZGXHUwMEIwXHUyNUExXHUwMEIwXHVGRjA5XHUyNTZGXHVGRTM1IFx1MjUzQlx1MjUwMVx1MjUzQicpO1xuICB9XG5cbiAgc2V0TWVzc2FnZUhhbmRsaW5nKCk7XG4gIHNlbmRTZXJ2aWNlV29ya2VyTWVzc2FnZSh7IHR5cGU6ICdWYWxpZFBhdGhQcmVmaXhlcycsIHZhbGlkUGF0aFByZWZpeGVzIH0pO1xuXG4gIHJldHVybiBjb250cm9sbGVyO1xufVxuIiwgImltcG9ydCB7IHR5cGUgVW56aXBwZWQsIHVuemlwU3luYyB9IGZyb20gJ2ZmbGF0ZS9icm93c2VyJztcbmltcG9ydCB7IHNldEZldGNoSGFuZGxlciB9IGZyb20gJy4vc2VydmljZS13b3JrZXItYnJpZGdlJztcbmltcG9ydCAqIGFzIGZpbGVzIGZyb20gJy4vZmlsZXMnO1xuXG5jb25zdCBmaWxlTWFwID0gbmV3IE1hcDxzdHJpbmcsIFVuemlwcGVkPigpO1xuXG5mdW5jdGlvbiBmaW5kUHJlZml4KHBhdGg6IHN0cmluZyk6IFtzdHJpbmcsIHN0cmluZ10gfCBudWxsIHtcbiAgaWYgKHBhdGguc3RhcnRzV2l0aCgnLycpKSBwYXRoID0gcGF0aC5zdWJzdHJpbmcoMSk7XG4gIGNvbnN0IHByZWZpeCA9IFsuLi5maWxlTWFwLmtleXMoKV0uZmluZCgoZGlyKSA9PiBwYXRoLnN0YXJ0c1dpdGgoZGlyKSk7XG5cbiAgaWYgKCFwcmVmaXgpIHJldHVybiBudWxsO1xuXG4gIHBhdGggPSBwYXRoLnN1YnN0cmluZyhwcmVmaXgubGVuZ3RoICsgMSk7XG4gIHJldHVybiBbcGF0aCwgcHJlZml4XTtcbn1cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9yZXF1aXJlLWF3YWl0XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNSZWFkYWJsZShwYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgcmV0dXJuIEJvb2xlYW4oZmluZFByZWZpeChwYXRoKSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkVGV4dChwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgY29uc3QgYnVmID0gYXdhaXQgcmVhZEZpbGUocGF0aCk7XG4gIGlmICghYnVmKSByZXR1cm4gbnVsbDtcblxuICByZXR1cm4gbmV3IFRleHREZWNvZGVyKCd1dGYtOCcpLmRlY29kZShidWYpO1xufVxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3JlcXVpcmUtYXdhaXRcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkRmlsZShwYXRoOiBzdHJpbmcpOiBQcm9taXNlPEFycmF5QnVmZmVyIHwgbnVsbD4ge1xuICBjb25zdCBwcmVmaXhPYmogPSBmaW5kUHJlZml4KHBhdGgpO1xuICBpZiAoIXByZWZpeE9iaikgcmV0dXJuIG51bGw7XG4gIGNvbnN0IFtyZWxhdGl2ZVBhdGgsIHByZWZpeF0gPSBwcmVmaXhPYmo7XG5cbiAgY29uc3QgdW56aXBwZWQgPSBmaWxlTWFwLmdldChwcmVmaXgpITtcblxuICBjb25zdCBkYXRhID0gdW56aXBwZWRbcmVsYXRpdmVQYXRoXTtcblxuICByZXR1cm4gZGF0YS5idWZmZXI7XG59XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvcmVxdWlyZS1hd2FpdFxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZpbmRSZWN1cnNpdmVseShkaXI6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10gfCBudWxsPiB7XG4gIGNvbnN0IHByZWZpeE9iaiA9IGZpbmRQcmVmaXgoZGlyKTtcbiAgaWYgKCFwcmVmaXhPYmopIHJldHVybiBudWxsO1xuICBjb25zdCBbcmVsYXRpdmVQYXRoLCBwcmVmaXhdID0gcHJlZml4T2JqO1xuXG4gIGNvbnN0IHVuemlwcGVkID0gZmlsZU1hcC5nZXQocHJlZml4KSE7XG5cbiAgY29uc3QgZGlycyA9IE9iamVjdC5rZXlzKHVuemlwcGVkKVxuICAgIC5maWx0ZXIoKHBhdGgpID0+ICFwYXRoLmVuZHNXaXRoKCcvJykgJiYgcGF0aC5zdGFydHNXaXRoKHJlbGF0aXZlUGF0aCkpXG4gICAgLm1hcCgoZGlyKSA9PiBkaXIuc3Vic3RyaW5nKHJlbGF0aXZlUGF0aC5sZW5ndGgpKTtcblxuICByZXR1cm4gZGlycztcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRDQ01vZHMoY2Ntb2RzOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBjY21vZEFycmF5QnVmZmVycyA9IGF3YWl0IFByb21pc2UuYWxsKFxuICAgIGNjbW9kcy5tYXAoYXN5bmMgKG1vZERpcikgPT4ge1xuICAgICAgY29uc3QgdXJsID0gYC4vJHttb2REaXJ9YDtcbiAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCBmaWxlcy5yZWFkRmlsZSh1cmwpKTtcbiAgICB9KSxcbiAgKTtcblxuICAvLyBmcm9tIG15IGxpbWl0ZWQgdGVzdGluZyB1bnppcFN5bmMgaXMgYWJvdXQgNTBtcyBmYXN0ZXIgKHVuemlwU3luYyB0YWtlcyAxNTBtcylcbiAgLy8gY29tcGFyZWQgdG8gYXN5bmNocm9ub3VzIHVuemlwIFx1MDBBRlxcXyhcdTMwQzQpXy9cdTAwQUZcbiAgLy8gY29uc29sZS50aW1lKCd1bmNvbXByZXNzJyk7XG4gIGNvbnN0IHVuY29tcHJlc3NlZCA9IGNjbW9kQXJyYXlCdWZmZXJzLm1hcCgoYnVmKSA9PiB1bnppcFN5bmMoYnVmKSk7XG4gIC8vIGNvbnNvbGUudGltZUVuZCgndW5jb21wcmVzcycpO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY2Ntb2RzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgbW9kRGlyID0gY2Ntb2RzW2ldO1xuICAgIGNvbnN0IGJ1ZiA9IHVuY29tcHJlc3NlZFtpXTtcbiAgICBmaWxlTWFwLnNldChtb2REaXIsIGJ1Zik7XG4gIH1cblxuICBzZXRGZXRjaEhhbmRsZXIoY2Ntb2RzLCByZWFkRmlsZSk7XG59XG4iLCAiaW1wb3J0ICogYXMgZmlsZXNEZXNrdG9wIGZyb20gJy4vZmlsZXMuZGVza3RvcCc7XG5pbXBvcnQgKiBhcyBmaWxlc0Jyb3dzZXIgZnJvbSAnLi9maWxlcy5icm93c2VyJztcbmltcG9ydCAqIGFzIGZpbGVzQW5kcm9pZCBmcm9tICcuL2ZpbGVzLmFuZHJvaWQnO1xuaW1wb3J0ICogYXMgZmlsZXNDQ01vZCBmcm9tICcuL2ZpbGVzLmNjbW9kJztcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gJ0BjY2xvYWRlcjMvY29tbW9uL3V0aWxzJztcblxuY29uc3QgbW9kdWxlcyA9IHtcbiAgW3V0aWxzLlBsYXRmb3JtVHlwZS5ERVNLVE9QXTogZmlsZXNEZXNrdG9wLFxuICBbdXRpbHMuUGxhdGZvcm1UeXBlLkFORFJPSURdOiBmaWxlc0FuZHJvaWQsXG4gIFt1dGlscy5QbGF0Zm9ybVR5cGUuQlJPV1NFUl06IGZpbGVzQnJvd3Nlcixcbn07XG5jb25zdCBjdXJyZW50TW9kdWxlID0gbW9kdWxlc1t1dGlscy5QTEFURk9STV9UWVBFXTtcblxuZXhwb3J0IGNvbnN0IHsgZ2V0TW9kUGF0aHNJbiwgZ2V0SW5zdGFsbGVkRXh0ZW5zaW9ucyB9ID0gY3VycmVudE1vZHVsZTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzUmVhZGFibGUocGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHJldHVybiAoYXdhaXQgZmlsZXNDQ01vZC5pc1JlYWRhYmxlKHBhdGgpKSB8fCBjdXJyZW50TW9kdWxlLmlzUmVhZGFibGUocGF0aCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkRmlsZShwYXRoOiBzdHJpbmcpOiBQcm9taXNlPEFycmF5QnVmZmVyPiB7XG4gIHJldHVybiAoYXdhaXQgZmlsZXNDQ01vZC5yZWFkRmlsZShwYXRoKSkgfHwgY3VycmVudE1vZHVsZS5yZWFkRmlsZShwYXRoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRUZXh0KHBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiAoYXdhaXQgZmlsZXNDQ01vZC5sb2FkVGV4dChwYXRoKSkgfHwgY3VycmVudE1vZHVsZS5sb2FkVGV4dChwYXRoKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZpbmRSZWN1cnNpdmVseShkaXI6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10gfCBudWxsPiB7XG4gIHJldHVybiAoXG4gICAgKGF3YWl0IGZpbGVzQ0NNb2QuZmluZFJlY3Vyc2l2ZWx5KGRpcikpIHx8XG4gICAgKCdmaW5kUmVjdXJzaXZlbHknIGluIGN1cnJlbnRNb2R1bGUgPyBjdXJyZW50TW9kdWxlLmZpbmRSZWN1cnNpdmVseShkaXIpIDogbnVsbClcbiAgKTtcbn1cbiIsICIvLyBUaGlzIG1vZHVsZSBpcyBiYXNlZCBvbiB0aGUgd29yayBkb25lIGJ5IEVMMjAyMDIgaW4gaGlzIGV4dGVuc2lvbiBhc3NldCBwcmVsb2FkZXIgbW9kOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL0VMMjAyMDIvY3Jvc3Njb2RlLWV4dGVuc2lvbi1hc3NldC1wcmVsb2FkZXIvYmxvYi9tYXN0ZXIvcG9zdGxvYWQuanNcbi8vIEZpeGVzIGZpbGVzIGZyb20gZXh0ZW5zaW9ucyBwb3RlbnRpYWxseSBub3QgYmVpbmcgbG9hZGVkIGR1cmluZyB0aGUgZ2FtZSdzIGxvYWRpbmdcblxuaW1wb3J0ICogYXMgZmlsZXMgZnJvbSAnQGNjbG9hZGVyMy9jb3JlL2ZpbGVzJztcbmltcG9ydCB7IGdldEluc3RhbGxlZEV4dGVuc2lvbnMgfSBmcm9tICdAY2Nsb2FkZXIzL2NvcmUvZmlsZXMnO1xuaW1wb3J0ICogYXMgcGF0aHMgZnJvbSAnQGNjbG9hZGVyMy9jb21tb24vcGF0aHMnO1xuaW1wb3J0ICogYXMgY29uZmlnTSBmcm9tICdAY2Nsb2FkZXIzL2NvcmUvY29uZmlnJztcblxuZGVjbGFyZSBnbG9iYWwge1xuICBuYW1lc3BhY2UgbW9kbG9hZGVyIHtcbiAgICBjb25zdCBjb25maWc6IGNvbmZpZ00uQ29uZmlnO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHByZWxvYWRFeHRlbnNpb25zKCk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBleHRlbnNpb25Gb2xkZXIgPSBwYXRocy5qb2luKG1vZGxvYWRlci5jb25maWcuZ2FtZUFzc2V0c0RpciwgJ2V4dGVuc2lvbicpO1xuICBjb25zdCBleHRzID0gYXdhaXQgZ2V0SW5zdGFsbGVkRXh0ZW5zaW9ucyhtb2Rsb2FkZXIuY29uZmlnKTtcbiAgZm9yIChjb25zdCBleHRlbnNpb25OYW1lIG9mIGV4dHMpIHtcbiAgICBjb25zdCBmaWxlcGF0aCA9IHBhdGhzLmpvaW4oZXh0ZW5zaW9uRm9sZGVyLCBleHRlbnNpb25OYW1lKTtcbiAgICBjb25zdCBpc1JlYWRhYmxlID0gYXdhaXQgZmlsZXMuaXNSZWFkYWJsZShgJHtmaWxlcGF0aH0vJHtleHRlbnNpb25OYW1lfS5qc29uYCk7XG4gICAgaWYgKGlzUmVhZGFibGUpIHtcbiAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCBmaWxlcy5sb2FkVGV4dChgJHtmaWxlcGF0aH0vJHtleHRlbnNpb25OYW1lfS5qc29uYCk7XG4gICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZSh0ZXh0KTtcblxuICAgICAgaWYgKCFkYXRhLmZpbGVzKSBicmVhaztcblxuICAgICAgZm9yIChjb25zdCBleHRGaWxlIG9mIGRhdGEuZmlsZXMpIHtcbiAgICAgICAgaWcuZmlsZUZvcndhcmRpbmdbZXh0RmlsZV0gPSBgZXh0ZW5zaW9uLyR7ZXh0ZW5zaW9uTmFtZX0vJHtleHRGaWxlfWA7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG52b2lkIHByZWxvYWRFeHRlbnNpb25zKCk7XG4iLCAiaW1wb3J0ICcuL2ZvbnQnO1xuaW1wb3J0ICcuL2ZpeGVzL2ZvbnQtcmFjZS1jb25kaXRpb24tZml4JztcbmltcG9ydCAnLi9vcHRpb25zJztcbmltcG9ydCAnLi9pbnB1dCc7XG5cbmltcG9ydCAnLi91aS9vcHRpb25zJztcbmltcG9ydCAnLi91aS92ZXJzaW9uLWRpc3BsYXknO1xuaW1wb3J0ICcuL2ZpeGVzL2V4dGVuc2lvbi1wcmVsb2FkZXInO1xuIiwgImltcG9ydCAqIGFzIHBhdGhzIGZyb20gJ0BjY2xvYWRlcjMvY29tbW9uL3BhdGhzJztcbmltcG9ydCB7IHN0ZGxpYk5hbWVzcGFjZSBhcyB1dGlscyB9IGZyb20gJ0BjY2xvYWRlcjMvY29tbW9uL3V0aWxzJztcbmltcG9ydCByZXF1aXJlRml4ZWQgZnJvbSAnQGNjbG9hZGVyMy9jb21tb24vcmVxdWlyZSc7XG5pbXBvcnQgc2VtdmVyIGZyb20gJ0BjY2xvYWRlcjMvY29tbW9uL3ZlbmRvci1saWJzL3NlbXZlcic7XG5pbXBvcnQgKiBhcyBwYXRjaFN0ZXBzTGliIGZyb20gJ0BjY2xvYWRlcjMvY29tbW9uL3ZlbmRvci1saWJzL3BhdGNoLXN0ZXBzJztcblxuaW1wb3J0IHsgbmFtZXNwYWNlIGFzIHBhdGNoTGlzdCB9IGZyb20gJy4vcGF0Y2gtbGlzdCc7XG5pbXBvcnQgeyBuYW1lc3BhY2UgYXMgaW1wYWN0SW5pdEhvb2tzIH0gZnJvbSAnLi9pbXBhY3QtaW5pdC1ob29rcyc7XG5pbXBvcnQgeyBuYW1lc3BhY2UgYXMgaW1wYWN0TW9kdWxlSG9va3MgfSBmcm9tICcuL2ltcGFjdC1tb2R1bGUtaG9va3MnO1xuaW1wb3J0IHsgbmFtZXNwYWNlIGFzIHJlc291cmNlcyB9IGZyb20gJy4vcmVzb3VyY2VzJztcbmltcG9ydCB7IG5hbWVzcGFjZSBhcyBtb2R1bGVDYWNoZSB9IGZyb20gJy4vbW9kdWxlLWNhY2hlJztcblxuaW1wb3J0ICcuL2Vycm9yLXNjcmVlbic7XG5pbXBvcnQgJy4vcmVzb3VyY2VzLWluamVjdGlvbnMnO1xuaW1wb3J0ICcuL2xhbmctZmlsZS1wYXRjaGVyJztcbmltcG9ydCAnLi9ncmVlbndvcmtzLWZpeCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJ1bnRpbWVNb2RNYWluQ2xhc3MgaW1wbGVtZW50cyBtb2Rsb2FkZXIuTW9kLlBsdWdpbkNsYXNzIHtcbiAgcHVibGljIGNvbnN0cnVjdG9yKG1vZDogbW9kbG9hZGVyLk1vZCkge1xuICAgIGlmICh3aW5kb3cuY2Ntb2QgPT0gbnVsbCkgd2luZG93LmNjbW9kID0ge30gYXMgdHlwZW9mIGNjbW9kO1xuICAgIE9iamVjdC5hc3NpZ248dHlwZW9mIGNjbW9kLCBQYXJ0aWFsPHR5cGVvZiBjY21vZD4+KHdpbmRvdy5jY21vZCwge1xuICAgICAgaW1wbGVtZW50b3I6IG1vZGxvYWRlci5uYW1lLFxuICAgICAgaW1wbGVtZW50YXRpb246IG1vZC5pZCxcbiAgICAgIHBhdGhzLFxuICAgICAgdXRpbHMsXG4gICAgICByZXF1aXJlOiByZXF1aXJlRml4ZWQsXG4gICAgICBzZW12ZXIsXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGdlbnVpbmVseSBubyBpZGVhIHdoYXQncyBnb2luZyBvbiBoZXJlLlxuICAgICAgcGF0Y2hTdGVwc0xpYixcbiAgICAgIHBhdGNoTGlzdCxcbiAgICAgIGltcGFjdEluaXRIb29rcyxcbiAgICAgIGltcGFjdE1vZHVsZUhvb2tzLFxuICAgICAgbW9kdWxlQ2FjaGUsXG4gICAgICByZXNvdXJjZXMsXG4gICAgfSk7XG5cbiAgICAvLyBUaGVyZSdzIHByb2JhYmx5IGFuIGlzc3VlIHdpdGggdGhpcyBiZWluZyBhIG5vbi1hd2FpdGVkIGltcG9ydC5cbiAgICBpbXBvcnQoJy4vZml4ZXMvY2Nsb2FkZXIyLXBvbHlmaWxsLmpzJyk7XG4gIH1cblxuICBwdWJsaWMgb25JbXBhY3RJbml0KCk6IHZvaWQge1xuICAgIGZvciAobGV0IFtfLCBtb2RdIG9mIG1vZGxvYWRlci5sb2FkZWRNb2RzKVxuICAgICAgaWYgKG1vZC5tYW5pZmVzdC5tb2RQcmVmaXgpXG4gICAgICAgIG1vZHVsZUNhY2hlLnJlZ2lzdGVyTW9kUHJlZml4KG1vZC5tYW5pZmVzdC5tb2RQcmVmaXgsIG1vZC5iYXNlRGlyZWN0b3J5LnN1YnN0cmluZyg3KSk7XG4gICAgZm9yIChsZXQgY2Igb2YgaW1wYWN0SW5pdEhvb2tzLmNhbGxiYWNrcykgY2IoKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBwcmVzdGFydCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCBpbXBvcnQoJy4vX3ByZXN0YXJ0LmpzJyk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcG9zdGxvYWQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgaW1wb3J0KCcuL19wb3N0bG9hZC5qcycpO1xuICB9XG59XG4iLCAiLy8gVGhpcyBjb2RlIGlzIGJhc2VkIG9uIHRoZSBgbW9kLXJlcXVpcmUtZml4YCBtb2Q6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vQ0NEaXJlY3RMaW5rL0NDZGlzY29yZC9ibG9iLzhjNWRjZTk2NTNiMTcwZWNiNGQ0YTFiYTViMTcwNjI5NTM5YzI2NDQvbW9kLXJlcXVpcmUtZml4L3ByZWxvYWQuanNcblxuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi91dGlscyc7XG5cbmxldCByZXF1aXJlRml4ZWQ6IE5vZGVSZXF1aXJlID0gbnVsbCE7XG5cbmlmICh0eXBlb2Ygd2luZG93LnJlcXVpcmUgPT09ICdmdW5jdGlvbicpIHtcbiAgY29uc3QgcGF0aHMgPSB3aW5kb3cucmVxdWlyZSgncGF0aCcpIGFzIHR5cGVvZiBpbXBvcnQoJ3BhdGgnKTtcblxuICByZXF1aXJlRml4ZWQgPSAoKGlkKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiByZXF1aXJlKGlkKTtcbiAgICB9IGNhdGNoIChfZXJyKSB7XG4gICAgICBsZXQgY2FsbGVyID0gZ2V0Q2FsbGVyKCk7XG4gICAgICBsZXQgc2VhcmNoUGF0aHMgPSBnZXRSZXF1aXJlU2VhcmNoUGF0aHMoY2FsbGVyKTtcbiAgICAgIC8vIHRoaXMgd2lsbCB0aHJvdyBhbiBlcnJvciBpZiBpdCBjb3VsZCBub3QgZmluZCBpdFxuICAgICAgbGV0IHBhdGhUb0lkID0gcmVxdWlyZS5yZXNvbHZlKGlkLCB7IHBhdGhzOiBzZWFyY2hQYXRocyB9KTtcblxuICAgICAgcmV0dXJuIHJlcXVpcmUocGF0aFRvSWQpO1xuICAgIH1cbiAgfSkgYXMgTm9kZVJlcXVpcmU7XG5cbiAgT2JqZWN0LmFzc2lnbjxOb2RlUmVxdWlyZSwgTm9kZVJlcXVpcmU+KHJlcXVpcmVGaXhlZCwgcmVxdWlyZSk7XG5cbiAgcmVxdWlyZUZpeGVkLnByb3RvdHlwZSA9IHsgY29uc3RydWN0b3I6IHJlcXVpcmVGaXhlZCB9O1xuXG4gIGZ1bmN0aW9uIGdldFJlcXVpcmVTZWFyY2hQYXRocyhjYWxsZXI6IE5vZGVKUy5DYWxsU2l0ZSk6IHN0cmluZ1tdIHtcbiAgICBsZXQgY2FsbGVyUGF0aCA9IHJlc29sdmVDYWxsU2l0ZUZpbGVQYXRoKGNhbGxlcik7XG4gICAgaWYgKGNhbGxlclBhdGggPT0gbnVsbCkgcmV0dXJuIFtdO1xuXG4gICAgbGV0IGN3ZCA9IHByb2Nlc3MuY3dkKCk7XG5cbiAgICAvLyBqdXN0IHRvIGF2b2lkIGFuIGluZmluaXRlIGxvb3BcbiAgICBpZiAoIWNhbGxlclBhdGguc3RhcnRzV2l0aChjd2QpKSByZXR1cm4gW107XG5cbiAgICBsZXQgc2VhcmNoUGF0aHMgPSBbXTtcbiAgICBsZXQgY3VycmVudERpcmVjdG9yeTtcbiAgICBsZXQgY3VycmVudFBhdGggPSBjYWxsZXJQYXRoO1xuICAgIGRvIHtcbiAgICAgIGN1cnJlbnREaXJlY3RvcnkgPSBwYXRocy5kaXJuYW1lKGN1cnJlbnRQYXRoKTtcbiAgICAgIHNlYXJjaFBhdGhzLnB1c2gocGF0aHMuam9pbihjdXJyZW50RGlyZWN0b3J5LCAnbm9kZV9tb2R1bGVzLycpKTtcblxuICAgICAgY3VycmVudFBhdGggPSBjdXJyZW50RGlyZWN0b3J5O1xuICAgIH0gd2hpbGUgKGN1cnJlbnREaXJlY3RvcnkgIT09IGN3ZCk7XG4gICAgLy8gdGhlIGxhc3QgcHVzaGVkIGVudHJ5IHdvdWxkIGJlIGEgZHVwbGljYXRlXG4gICAgc2VhcmNoUGF0aHMucG9wKCk7XG5cbiAgICByZXR1cm4gc2VhcmNoUGF0aHM7XG4gIH1cblxuICBmdW5jdGlvbiByZXNvbHZlQ2FsbFNpdGVGaWxlUGF0aChjYWxsZXI6IE5vZGVKUy5DYWxsU2l0ZSk6IHN0cmluZyB8IG51bGwge1xuICAgIGxldCBmaWxlTmFtZVN0ciA9IGNhbGxlci5nZXRGaWxlTmFtZSgpO1xuICAgIGlmIChmaWxlTmFtZVN0ciA9PSBudWxsKSByZXR1cm4gbnVsbDtcblxuICAgIGxldCB1cmw6IFVSTCB8IG51bGwgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICB1cmwgPSBuZXcgVVJMKGZpbGVOYW1lU3RyKTtcbiAgICB9IGNhdGNoIHt9XG4gICAgLy8gdGhlIGNhbCBzaXRlIGlzIGEgc2NyaXB0IHJ1bm5pbmcgaW4gdGhlIGJyb3dzZXIgY29udGV4dFxuICAgIGlmICh1cmwgIT0gbnVsbCkgcmV0dXJuIHBhdGhzLnJlc29sdmUodXRpbHMuY3dkRmlsZVBhdGhGcm9tVVJMKHVybCkpO1xuXG4gICAgLy8gdGhlIGNhbGwgc2l0ZSBpcyBhIGJ1aWx0LWluIG1vZHVsZVxuICAgIGlmICghcGF0aHMuaXNBYnNvbHV0ZShmaWxlTmFtZVN0cikpIHJldHVybiBudWxsO1xuXG4gICAgLy8gdGhlIGNhbGwgc2l0ZSBpcyBhIHNjcmlwdCBmcm9tIHRoZSBub2RlLmpzIGNvbnRleHRcbiAgICByZXR1cm4gcGF0aHMucmVzb2x2ZShmaWxlTmFtZVN0cik7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRDYWxsZXIoKTogTm9kZUpTLkNhbGxTaXRlIHtcbiAgICBsZXQgc3RhY2s6IE5vZGVKUy5DYWxsU2l0ZVtdO1xuXG4gICAgLy8gaHR0cHM6Ly92OC5kZXYvZG9jcy9zdGFjay10cmFjZS1hcGlcbiAgICAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTMyMjc4MDgvMTIwMDUyMjhcbiAgICBsZXQgZXJyID0gbmV3IEVycm9yKCk7XG4gICAgbGV0IG9yaWdpbmFsUHJlcGFyZVN0YWNrVHJhY2UgPSBFcnJvci5wcmVwYXJlU3RhY2tUcmFjZTtcbiAgICB0cnkge1xuICAgICAgRXJyb3IucHJlcGFyZVN0YWNrVHJhY2UgPSBmdW5jdGlvbiAoX2Vyciwgc3RhY2syKSB7XG4gICAgICAgIHJldHVybiBzdGFjazI7XG4gICAgICB9O1xuICAgICAgc3RhY2sgPSBlcnIuc3RhY2sgYXMgdW5rbm93biBhcyBOb2RlSlMuQ2FsbFNpdGVbXTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgRXJyb3IucHJlcGFyZVN0YWNrVHJhY2UgPSBvcmlnaW5hbFByZXBhcmVTdGFja1RyYWNlO1xuICAgIH1cblxuICAgIC8vIGlnbm9yZSB0aGUgY2FsbCBzaXRlIG9mIHRoaXMgZnVuY3Rpb24gKGZyb20gd2hpY2ggdGhlIG1vY2sgZXJyb3IgaGFzXG4gICAgLy8gb3JpZ2luYXRlZCkgYW5kIHRoZSBvbmUgb2Ygb3VyIGNhbGxlclxuICAgIHJldHVybiBzdGFja1syXTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCByZXF1aXJlRml4ZWQ7XG4iLCAiaW1wb3J0IHsgSW1wYWN0SW5pdEhvb2sgfSBmcm9tICd1bHRpbWF0ZS1jcm9zc2NvZGUtdHlwZWRlZnMvbW9kbG9hZGVyLXN0ZGxpYi9pbXBhY3QtaW5pdC1ob29rcyc7XG5cbmV4cG9ydCBjb25zdCBjYWxsYmFja3M6IEltcGFjdEluaXRIb29rW10gPSBbXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGFkZChjYWxsYmFjazogSW1wYWN0SW5pdEhvb2spOiB2b2lkIHtcbiAgY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xufVxuXG5leHBvcnQgY29uc3QgbmFtZXNwYWNlOiB0eXBlb2YgY2Ntb2QuaW1wYWN0SW5pdEhvb2tzID0geyBjYWxsYmFja3MsIGFkZCB9O1xuIiwgIi8vIGJhc2VkIG9uIGh0dHBzOi8vZ2l0aHViLmNvbS9DQ0RpcmVjdExpbmsvRGV2TW9kTG9hZGVyL2Jsb2IvN2RkM2M0ZWJlZTRiNTE2YjIwMTIwNWQwYmIxYzI0OTEzMzM1YjlmMS9qcy9nYW1lL2lnLWludGVyY2VwdG9yLmpzXG5cbmltcG9ydCAqIGFzIGltcGFjdEluaXRIb29rcyBmcm9tICcuL2ltcGFjdC1pbml0LWhvb2tzJztcbmltcG9ydCB7IEltcGFjdE1vZHVsZUhvb2sgfSBmcm9tICd1bHRpbWF0ZS1jcm9zc2NvZGUtdHlwZWRlZnMvbW9kbG9hZGVyLXN0ZGxpYi9pbXBhY3QtbW9kdWxlLWhvb2tzJztcbmltcG9ydCB7IFBhdGNoTGlzdCB9IGZyb20gJy4vcGF0Y2gtbGlzdCc7XG5cbmV4cG9ydCBjb25zdCBwYXRjaExpc3QgPSBuZXcgUGF0Y2hMaXN0PEltcGFjdE1vZHVsZUhvb2s+KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGQobW9kdWxlTmFtZTogc3RyaW5nIHwgUmVnRXhwLCBjYWxsYmFjazogSW1wYWN0TW9kdWxlSG9vayk6IHZvaWQge1xuICBwYXRjaExpc3QuYWRkKG1vZHVsZU5hbWUsIGNhbGxiYWNrKTtcbn1cblxuaW1wYWN0SW5pdEhvb2tzLmFkZCgoKSA9PiB7XG4gIGxldCBvcmlnaW5hbERlZmluZXMgPSBpZy5kZWZpbmVzO1xuICBpZy5kZWZpbmVzID0gZnVuY3Rpb24gKGJvZHkpIHtcbiAgICBsZXQgeyBuYW1lIH06IGlnLk1vZHVsZSA9IGlnLl9jdXJyZW50O1xuICAgIGlmIChuYW1lID09IG51bGwpIHJldHVybiBvcmlnaW5hbERlZmluZXMuY2FsbCh0aGlzLCBib2R5KTtcblxuICAgIHJldHVybiBvcmlnaW5hbERlZmluZXMuY2FsbCh0aGlzLCBmdW5jdGlvbiAodGhpczogdW5rbm93biwgLi4uYXJnczogW10pIHtcbiAgICAgIGJvZHkuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICBmb3IgKGxldCBjYWxsYmFjayBvZiBwYXRjaExpc3QuZm9yUGF0aChuYW1lKSkgY2FsbGJhY2sobmFtZSk7XG4gICAgfSk7XG4gIH07XG59KTtcblxuZXhwb3J0IGNvbnN0IG5hbWVzcGFjZTogdHlwZW9mIGNjbW9kLmltcGFjdE1vZHVsZUhvb2tzID0geyBwYXRjaExpc3QsIGFkZCB9O1xuIiwgImltcG9ydCAqIGFzIGltcGFjdEluaXRIb29rcyBmcm9tICcuL2ltcGFjdC1pbml0LWhvb2tzJztcblxubGV0IG9sZExvYWRTY3JpcHQ6IHR5cGVvZiBpZy5fbG9hZFNjcmlwdCB8IHVuZGVmaW5lZDtcbmV4cG9ydCBjb25zdCBwcmVmaXhlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KCk7XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyTW9kUHJlZml4KHByZWZpeDogc3RyaW5nLCBwYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgcHJlZml4ZXMuc2V0KHByZWZpeCwgcGF0aCk7XG59XG5cbmltcGFjdEluaXRIb29rcy5hZGQoKCkgPT4ge1xuICBvbGRMb2FkU2NyaXB0ID0gaWcuX2xvYWRTY3JpcHQ7XG5cbiAgZnVuY3Rpb24gX2xvYWRTY3JpcHQobW9kdWxlTmFtZTogc3RyaW5nLCByZXF1aXJlcj86IHN0cmluZyk6IHZvaWQge1xuICAgIGlmIChtb2R1bGVOYW1lLmluY2x1ZGVzKCcuJykpIHtcbiAgICAgIGNvbnN0IHJvb3QgPSBtb2R1bGVOYW1lLnNwbGl0KCcuJylbMF07XG4gICAgICBsZXQgcGF0aCA9IHByZWZpeGVzLmdldChyb290KTtcbiAgICAgIGlmIChwYXRoKSB7XG4gICAgICAgIGlnLmxpYiA9IHBhdGg7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb2xkTG9hZFNjcmlwdCEobW9kdWxlTmFtZSwgcmVxdWlyZXIpO1xuXG4gICAgaWcubGliID0gJyc7XG4gIH1cblxuICBpZy5fbG9hZFNjcmlwdCA9IF9sb2FkU2NyaXB0O1xufSk7XG5cbmV4cG9ydCBjb25zdCBuYW1lc3BhY2U6IHR5cGVvZiBjY21vZC5tb2R1bGVDYWNoZSA9IHtcbiAgcHJlZml4ZXMsXG4gIHJlZ2lzdGVyTW9kUHJlZml4LFxufTtcbiIsICIvLyBpbnNwaXJlZCBieSBodHRwczovL2dpdGh1Yi5jb20vMjBrZGMvZGVjcm9zc2Z1c2NhdG9yL2Jsb2IvYjVjNDI1MGFhZGU1YmY4ZDQxYjEyZWM3YzM0NmQ0OWJhMTA3YjJhOS9tb2RzL3JhcHR1cmV1aS9kZWNvbnRhbWluYW50LmpzXG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgbmFtZXNwYWNlIG1vZGxvYWRlciB7XG4gICAgY29uc3QgX3J1bnRpbWVNb2Q6IE1vZDtcbiAgfVxufVxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdmFyLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG5kZWNsYXJlIHZhciBjaHJvbWU6IGFueTtcblxubGV0IG9yaWdpbmFsRXJyb3JDYWxsYmFjayA9IHdpbmRvdy5HQU1FX0VSUk9SX0NBTExCQUNLO1xuaWYgKG9yaWdpbmFsRXJyb3JDYWxsYmFjayAhPSBudWxsKSB7XG4gIGNvbnN0IE1PRExPQURFUl9OQU1FID0gbW9kbG9hZGVyLm5hbWU7XG4gIGNvbnN0IE1PRExPQURFUl9WRVJTSU9OID0gbW9kbG9hZGVyLnZlcnNpb24udG9TdHJpbmcoKTtcbiAgY29uc3QgUlVOVElNRV9NT0RfSUQgPSBtb2Rsb2FkZXIuX3J1bnRpbWVNb2QuaWQ7XG4gIGNvbnN0IFJVTlRJTUVfTU9EX1ZFUlNJT04gPSBtb2Rsb2FkZXIuX3J1bnRpbWVNb2QudmVyc2lvbiEudG9TdHJpbmcoKTtcblxuICB3aW5kb3cuR0FNRV9FUlJPUl9DQUxMQkFDSyA9IGZ1bmN0aW9uIChlcnJvciwgaW5mbywgZ2FtZUluZm8sIC4uLmFyZ3MpIHtcbiAgICBpbmZvW2Ake01PRExPQURFUl9OQU1FfSB2ZXJzaW9uYF0gPSBNT0RMT0FERVJfVkVSU0lPTjtcbiAgICBpbmZvW2Ake1JVTlRJTUVfTU9EX0lEfSB2ZXJzaW9uYF0gPSBSVU5USU1FX01PRF9WRVJTSU9OO1xuICAgIGxldCByZXN1bHQgPSBvcmlnaW5hbEVycm9yQ2FsbGJhY2suY2FsbCh0aGlzLCBlcnJvciwgaW5mbywgZ2FtZUluZm8sIC4uLmFyZ3MpO1xuXG4gICAgaWYgKHR5cGVvZiBudyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGZvciAobGV0IGNvbnRhaW5lciBvZiBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdlcnJvck1lc3NhZ2UnKSkge1xuICAgICAgICBmb3IgKGxldCBidXR0b24gb2YgY29udGFpbmVyLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdhJykpIHtcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tc2NyaXB0LXVybFxuICAgICAgICAgIGlmIChidXR0b24uaHJlZiA9PT0gJ2phdmFzY3JpcHQ6d2luZG93LmxvY2F0aW9uLnJlbG9hZCgpJykge1xuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNjcmlwdC11cmxcbiAgICAgICAgICAgIGJ1dHRvbi5ocmVmID0gJ2phdmFzY3JpcHQ6Y2hyb21lLnJ1bnRpbWUucmVsb2FkKCknO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG4iLCAiaW1wb3J0ICogYXMgcmVzb3VyY2VzIGZyb20gJy4vcmVzb3VyY2VzJztcbmltcG9ydCAqIGFzIGltcGFjdEluaXRIb29rcyBmcm9tICcuL2ltcGFjdC1pbml0LWhvb2tzJztcbmltcG9ydCAqIGFzIGltcGFjdE1vZHVsZUhvb2tzIGZyb20gJy4vaW1wYWN0LW1vZHVsZS1ob29rcyc7XG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tICdAY2Nsb2FkZXIzL2NvbW1vbi91dGlscyc7XG5cbmltcGFjdEluaXRIb29rcy5hZGQoKCkgPT4ge1xuICAkLmFqYXhTZXR1cCh7XG4gICAgYmVmb3JlU2VuZChfanFYaHI6IEpRdWVyeVhIUiwgc2V0dGluZ3M6IEpRdWVyeUFqYXhTZXR0aW5ncyk6IGJvb2xlYW4ge1xuICAgICAgaWYgKHNldHRpbmdzLmRhdGFUeXBlICE9PSAnanNvbicgfHwgc2V0dGluZ3MudHlwZSAhPT0gJ0dFVCcpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIGxldCB7IHVybCB9ID0gc2V0dGluZ3M7XG4gICAgICBpZiAodHlwZW9mIHVybCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmICghdXJsLnN0YXJ0c1dpdGgocmVzb3VyY2VzLk1PRF9QUk9UT0NPTF9QUkVGSVgpKSB7XG4gICAgICAgIGxldCBnYW1lQXNzZXRzVVJMID0gcmVzb3VyY2VzLmdldEdhbWVBc3NldHNVUkwoKS5ocmVmO1xuXG4gICAgICAgIGxldCBwYXJzZWRVUkwgPSBuZXcgVVJMKHVybCwgZG9jdW1lbnQuYmFzZVVSSSkuaHJlZjtcbiAgICAgICAgaWYgKCFwYXJzZWRVUkwuc3RhcnRzV2l0aChnYW1lQXNzZXRzVVJMKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgb25seSByZXF1ZXN0IHRvIGEgbG9jYWwgUEhQIHNjcmlwdCBpbiB0aGUgZW50aXJlIGdhbWUsXG4gICAgICAgIC8vIHRoYXQgaXMsIGEgc2NyaXB0IGxvY2F0ZWQgaW5zaWRlIHRoZSBhc3NldHMgZGlyZWN0b3J5LiBIb3dldmVyLCBpdCBpc1xuICAgICAgICAvLyBub3QgcGF0Y2hlZCBub3Qgb25seSBiZWNhdXNlIGl0cyBhIFBIUCBzY3JpcHQuIFNlZSwgYGlnLkV4dGVuc2lvbkxpc3RgXG4gICAgICAgIC8vIGhhcyBhIGJ1ZzogaXQgY2FsbHMgdGhpcyBQSFAgc2NyaXB0IHdoaWNoLCBvZiBjb3Vyc2UsIGRvZXNuJ3Qgd29yayBpblxuICAgICAgICAvLyB0aGUgcHJvZHVjdGlvbiB2ZXJzaW9uLCB3aGVuIHRoZSBnYW1lIGlzIHJ1bm5pbmcgaW4gdGhlIGJyb3dzZXIgKGluXG4gICAgICAgIC8vIG53LmpzIGl0IGp1c3QgdXNlcyBgZnMucmVhZGRpcmApLiBUaGUgZnVuY3Rpb24gd2hpY2ggdHJpZ2dlcnMgdGhlXG4gICAgICAgIC8vIG5ldHdvcmsgcmVxdWVzdCAoYGlnLkV4dGVuc2lvbkxpc3Qjb25FeHRlbnNpb25MaXN0TG9hZGVkYCkgYXNzaWduc1xuICAgICAgICAvLyB0aGUgc2FtZSBoYW5kbGVyIGZvciBib3RoIHN1Y2Nlc3NlcyBhbmQgZXJyb3JzLiBPbiBzdWNjZXNzIG5vdGhpbmdcbiAgICAgICAgLy8gZXh0cmFvcmRpbmFyeSB3b3VsZCBoYXZlIGhhcHBlbmVkOiB0aGUgaGFuZGxlciB3b3VsZCBzaW1wbHkgcmVjZWl2ZSBhXG4gICAgICAgIC8vIEpTT04gcmVzcG9uc2UgY29udGFpbmluZyB0aGUgbGlzdCBvZiBleHRlbnNpb25zIGFuZCBtb3ZlIG9uLiBIb3dldmVyOlxuICAgICAgICAvLyB0aGUgZmlyc3QgYXJndW1lbnQgb2YgYW4gZXJyb3IgaGFuZGxlciBmb3IgYCQuYWpheGAgaXMgdGhlIGBKUXVlcnlYSFJgXG4gICAgICAgIC8vIGluc3RhbmNlICh1bmxpa2UgZm9yIHN1Y2Nlc3Mgd2hlcmUgaXQgaXMgdGhlIHJlY2VpdmVkIGRhdGEpLCBidXQgdGhlXG4gICAgICAgIC8vIGdhbWUgZG9lc24ndCBjcmFzaCB1bmRlciBub3JtYWwgY29uZGl0aW9ucyBhcyBpdCB1c2VzIGEgcGxhaW4gb2xkXG4gICAgICAgIC8vIFwiZm9yIGlcIiBsb29wIHRvIGl0ZXJhdGUgdGhlIHJlY2VpdmVkIGxpc3Q6IGBsaXN0Lmxlbmd0aGAgcmV0dXJuc1xuICAgICAgICAvLyBgdW5kZWZpbmVkYCB3aGVuIHRoZSBganFYSFJgIGluc3RhbmNlIGlzIHJlY2VpdmVkLCBzbyBub3RoaW5nIGlzXG4gICAgICAgIC8vIGl0ZXJhdGVkIGFuZCBub3RoaW5nIGNyYXNoZXMuIEluIG91ciBjYXNlIHRob3VnaCBJIGhhdmUgdG8gaWdub3JlXG4gICAgICAgIC8vIHRoaXMgc3BlY2lmaWMgcmVxdWVzdCBhbmQganVzdCBsZXQgSlF1ZXJ5IGhhbmRsZSBpdCBiZWNhdXNlIG9mIHRoZVxuICAgICAgICAvLyByZXR1cm5lZCBgbnVsbGBzIGluIHRoZSByZXF1ZXN0IGhpamFja2luZyBjb2RlIGJlbG93LlxuICAgICAgICBpZiAocGFyc2VkVVJMLnN0YXJ0c1dpdGgoYCR7Z2FtZUFzc2V0c1VSTH1wYWdlL2FwaS9nZXQtZXh0ZW5zaW9uLWxpc3QucGhwYCkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoaWcucm9vdC5sZW5ndGggPiAwICYmIHVybC5zdGFydHNXaXRoKGlnLnJvb3QpKSB7XG4gICAgICAgIHVybCA9IHVybC5zbGljZShpZy5yb290Lmxlbmd0aCk7XG4gICAgICB9XG5cbiAgICAgIGxldCBjYWNoZVN1ZmZpeCA9IHJlc291cmNlcy5nZXRDYWNoZVN1ZmZpeCgpO1xuICAgICAgaWYgKGNhY2hlU3VmZml4Lmxlbmd0aCA+IDAgJiYgdXJsLmVuZHNXaXRoKGNhY2hlU3VmZml4KSkge1xuICAgICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgLWNhY2hlU3VmZml4Lmxlbmd0aCk7XG4gICAgICB9XG5cbiAgICAgIGxldCB7IGNvbnRleHQsIHN1Y2Nlc3MsIGVycm9yLCBjb21wbGV0ZSB9ID0gc2V0dGluZ3M7XG4gICAgICBkZWxldGUgc2V0dGluZ3Muc3VjY2VzcztcbiAgICAgIGRlbGV0ZSBzZXR0aW5ncy5lcnJvcjtcbiAgICAgIGRlbGV0ZSBzZXR0aW5ncy5jb21wbGV0ZTtcbiAgICAgIHJlc291cmNlc1xuICAgICAgICAubG9hZEpTT04odXJsLCB7IGNhbGxlclRoaXNWYWx1ZTogY29udGV4dCB9KVxuICAgICAgICAudGhlbihcbiAgICAgICAgICAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKHN1Y2Nlc3MgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAvLyBBYm91dCByZXR1cm5pbmcgYG51bGxgIGluc3RlYWQgb2YgdGhlIGluc3RhbmNlIG9mIGBKUXVlcnlYSFJgOlxuICAgICAgICAgICAgICAvLyBpdCBzaG91bGQgYmUgb2J2aW91cyB0aGF0IHdoaWxlIEkgdGVjaG5pY2FsbHkgY2FuIHBhc3MgdGhlXG4gICAgICAgICAgICAgIC8vIGBKUXVlcnlYSFJgIG9iamVjdCByZWNlaXZlZCBieSB0aGUgb3ZlcmFsbCBgYmVmb3JlU2VuZGAgZnVuY3Rpb24sXG4gICAgICAgICAgICAgIC8vIGl0IHdpbGwgYmUgaW52YWxpZCBiZWNhdXNlIGl0IGhhcyBiZWVuIGhpamFja2VkIGFuZCBhYm9ydGVkLlxuICAgICAgICAgICAgICAvLyBgbnVsbGAgaXMgcmV0dXJuZWQgaW5zdGVhZCBoZXJlIGFuZCBmb3Igb3RoZXIgaGFuZGxlcnMgYmVjYXVzZVxuICAgICAgICAgICAgICAvLyBuZWl0aGVyIG1vZHMgbm9yIHRoZSBnYW1lIHJlbHkgb24gYW55IGFyZ3VtZW50cyBiZXNpZGVzIHRoZVxuICAgICAgICAgICAgICAvLyByZWNlaXZlZCBKU09OIGRhdGEsIGFuZCB0aGlzIHNob3VsZCBkaXNjb3VyYWdlIGZ1dHVyZSB1c2VzIG9mXG4gICAgICAgICAgICAgIC8vIGAkLmFqYXhgIGZvciBmZXRjaGluZyBhc3NldHMgZnJvbSBtb2RzLlxuICAgICAgICAgICAgICBzdWNjZXNzLmNhbGwoY29udGV4dCwgZGF0YSwgJ2hpamFja2VkJywgbnVsbCEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgKGVycikgPT4ge1xuICAgICAgICAgICAgLy8gZXJyb3JzIGFyZW4ndCByZWFsbHkgaGFuZGxlZCBieSB0aGUgZ2FtZSB0aG91Z2gsIHNvIGxldCdzIGxvZyBpdFxuICAgICAgICAgICAgLy8gaGVyZSBhcyB3ZWxsXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICBpZiAoZXJyb3IgIT0gbnVsbCkge1xuICAgICAgICAgICAgICBlcnJvci5jYWxsKGNvbnRleHQsIG51bGwhLCAnaGlqYWNrZWQnLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgIClcbiAgICAgICAgLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgIGlmIChjb21wbGV0ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb21wbGV0ZS5jYWxsKGNvbnRleHQsIG51bGwhLCAnaGlqYWNrZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcbiAgfSk7XG59KTtcblxuaW1wYWN0TW9kdWxlSG9va3MuYWRkKCdpbXBhY3QuYmFzZS5pbWFnZScsICgpID0+IHtcbiAgaWcuSW1hZ2UuaW5qZWN0KHtcbiAgICBsb2FkSW50ZXJuYWwocGF0aCkge1xuICAgICAgLy8gU29tZSBpbWFnZSBwYXRocyBpbmNsdWRlIHRyYWlsaW5nIHdoaXRlc3BhY2Ugd2hpY2ggdGhlIGRldnMgZGlkbid0XG4gICAgICAvLyBub3RpY2UgYmVjYXVzZSBKUyBhdXRvbWF0aWNhbGx5IHRyaW1zIHdoaXRlc3BhY2UgKG5vdGU6IGVuY29kZWRcbiAgICAgIC8vIHdoaXRlc3BhY2UsIGkuZS4gYCUyMGAtbGlrZSBlbnRpdGllcywgYXJlIGxlZnQgdW50b3VjaGVkKSBpbiBVUkxzLiBJJ21cbiAgICAgIC8vIGFzc3VtaW5nIHRoYXQgdGhlcmUgYXJlIG5vIHN1Y2ggSlNPTiBwYXRocyBiZWNhdXNlIEpRdWVyeSBhdXRvbWF0aWNhbGx5XG4gICAgICAvLyBlbmNvZGVzIFVSSXMgYmVmb3JlIHJlcXVlc3RpbmcgYW5kIHRoZXJlIGFyZSBubyBpbnN0YW5jZXMgb2YgbGVhZGluZ1xuICAgICAgLy8gd2hpdGVzcGFjZSBiZWNhdXNlIGBpZy5yb290YCBpcyBub3QgZW1wdHkgaW4gdGhlIGRldmVsb3BtZW50IHZlcnNpb24uXG4gICAgICBwYXRoID0gcGF0aC50cmltRW5kKCk7XG4gICAgICAvLyBOT1RFOiBTdHJpY3RseSBzcGVha2luZywgSW1wYWN0J3MgZmlsZSBmb3J3YXJkaW5nIG11c3QgYmUgYXBwbGllZFxuICAgICAgLy8gZmlyc3QsIGJlZm9yZSB0cmltbWluZywgYXMgaW4gdGhlIGdhbWUsIGJ1dCBJJ20gbm90IHN1cmUgaWYgdGhpcyB3aWxsXG4gICAgICAvLyBicmVhayBhbnl0aGluZyBiZWNhdXNlIHRoZSBjdXJyZW50IGJlaGF2aW9yIGNlcnRhaW5seSBoYXZlbid0IHNvIGZhcixcbiAgICAgIC8vIHNvIFRPRE86IHRlc3QgdGhpcyBhbmQgcmVzdG9yZSB0aGUgY29ycmVjdCBvcmRlci5cbiAgICAgIHBhdGggPSBhcHBseUltcGFjdEZpbGVGb3J3YXJkaW5nKHBhdGgpO1xuICAgICAgcmVzb3VyY2VzLmxvYWRJbWFnZShwYXRoLCB7IGNhbGxlclRoaXNWYWx1ZTogdGhpcyB9KS50aGVuKFxuICAgICAgICAoaW1nKSA9PiB7XG4gICAgICAgICAgdGhpcy5kYXRhID0gaW1nO1xuICAgICAgICAgIHRoaXMub25sb2FkKCk7XG4gICAgICAgIH0sXG4gICAgICAgIChlcnIpID0+IHtcbiAgICAgICAgICAvLyBlcnJvcnMgYXJlbid0IGRpc3BsYXllZCBieSBgaWcuSW1hZ2VgXG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgIHRoaXMub25lcnJvcigpO1xuICAgICAgICB9LFxuICAgICAgKTtcbiAgICB9LFxuXG4gICAgLy8gdGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gYXBwZW5kcyBhIHF1ZXJ5IHdpdGggdGhlIGN1cnJlbnQgZGF0ZSBpblxuICAgIC8vIG1pbGxpc2Vjb25kcyBpbnN0ZWFkIG9mIHVzaW5nIGBpZy5nZXRDYWNoZVN1ZmZpeCgpYCBiZWNhdXNlIHJlbG9hZGluZyB3YXNcbiAgICAvLyBpbXBsZW1lbnRlZCBmb3IgaW1hZ2VzIGJlZm9yZSBhIG1vcmUgZ2VuZXJhbCByZWxvYWQgc3lzdGVtLFxuICAgIC8vIGBpZy5Mb2FkYWJsZSNyZWxvYWRgIGV4aXN0ZWQsIHNvIGxldCdzIGZpeCB0aGlzIGJ5IGNhbGxpbmcgdGhlIGRlZmF1bHRcbiAgICAvLyBpbXBsZW1lbnRhdGlvblxuICAgIGRlYnVnUmVsb2FkOiB0cnVlLFxuICAgIHJlbG9hZCgpIHtcbiAgICAgIGlmICgncmVsb2FkJyBpbiBpZy5Mb2FkYWJsZS5wcm90b3R5cGUpIHtcbiAgICAgICAgLy8gSSBraW5kYSBnYXZlIHVwIGZpeGluZyB0aGUgYEltcGFjdENsYXNzYCBoZXJlXG4gICAgICAgIGlnLkxvYWRhYmxlLnByb3RvdHlwZS5yZWxvYWQuY2FsbCh0aGlzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGRvdWJ0IHRoYXQgc29tZW9uZSB3aWxsIGV2ZXIgbmVlZCB0aGUgc2VtYW50aWNzIG9mIHRoZSBkZWZhdWx0XG4gICAgICAgIC8vIGBpZy5Mb2FkYWJsZSNyZWxvYWRgIGltcGxlbWVudGF0aW9uIGluIHByZS0xLjEuMCB2ZXJzaW9ucyB3aGljaCBoYXZlXG4gICAgICAgIC8vIGJlZW4gYWJhbmRvbmVkIGJ5IGV2ZXJ5b25lIGV4Y2VwdCBzcGVlZHJ1bm5lcnNcbiAgICAgICAgdGhpcy5sb2FkKCk7XG4gICAgICB9XG4gICAgfSxcbiAgfSk7XG59KTtcblxuaW1wYWN0TW9kdWxlSG9va3MuYWRkKCdpbXBhY3QuYmFzZS5zb3VuZCcsICgpID0+IHtcbiAgZnVuY3Rpb24gbG9hZEF1ZGlvPFxuICAgIFJldCxcbiAgICBBcmdzIGV4dGVuZHMgW3N0cmluZywgLi4udW5rbm93bltdXSxcbiAgICBUaGlzIGV4dGVuZHMgeyBwYXJlbnQodGhpczogVGhpcywgLi4uYXJnczogQXJncyk6IFJldCB9LFxuICA+KHRoaXM6IFRoaXMsIC4uLmFyZ3M6IEFyZ3MpOiBSZXQge1xuICAgIGxldCBwYXRoID0gYXJnc1swXTtcblxuICAgIGxldCByZXNvbHZlZFBhdGggPSBwYXRoO1xuICAgIGxldCBsYXN0RG90SW5kZXggPSByZXNvbHZlZFBhdGgubGFzdEluZGV4T2YoJy4nKTtcbiAgICBpZiAobGFzdERvdEluZGV4ID49IDApIHtcbiAgICAgIHJlc29sdmVkUGF0aCA9IHJlc29sdmVkUGF0aC5zbGljZSgwLCBsYXN0RG90SW5kZXgpO1xuICAgIH1cbiAgICByZXNvbHZlZFBhdGggKz0gYC4ke2lnLnNvdW5kTWFuYWdlci5mb3JtYXQuZXh0fWA7XG4gICAgcmVzb2x2ZWRQYXRoID0gYXBwbHlJbXBhY3RGaWxlRm9yd2FyZGluZyhyZXNvbHZlZFBhdGgpO1xuICAgIGxldCByZXNvbHZlZFVSTCA9IHJlc291cmNlcy5yZXNvbHZlUGF0aFRvVVJMKHJlc29sdmVkUGF0aCk7XG5cbiAgICBsZXQgb3JpZ2luYWxHZXRGaWxlUGF0aCA9IGlnLmdldEZpbGVQYXRoO1xuICAgIHRyeSB7XG4gICAgICBpZy5nZXRGaWxlUGF0aCA9IChfcGF0aCkgPT4gcmVzb2x2ZWRVUkw7XG4gICAgICByZXR1cm4gdGhpcy5wYXJlbnQoLi4uYXJncyk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlnLmdldEZpbGVQYXRoID0gb3JpZ2luYWxHZXRGaWxlUGF0aDtcbiAgICB9XG4gIH1cblxuICBpZy5Tb3VuZE1hbmFnZXIuaW5qZWN0KHtcbiAgICBsb2FkV2ViQXVkaW86IGxvYWRBdWRpbyxcbiAgICBsb2FkOiBsb2FkQXVkaW8sXG4gIH0pO1xufSk7XG5cbmZ1bmN0aW9uIGFwcGx5SW1wYWN0RmlsZUZvcndhcmRpbmcocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IHRhYmxlID0gaWcuZmlsZUZvcndhcmRpbmc7XG4gIGxldCB0YWJsZUtleSA9IGAke2lnLnJvb3R9JHtwYXRofWA7XG4gIGlmICh1dGlscy5oYXNLZXkodGFibGUsIHRhYmxlS2V5KSkge1xuICAgIHBhdGggPSB0YWJsZVt0YWJsZUtleV07XG4gICAgcGF0aCA9IHBhdGguc2xpY2UoaWcucm9vdC5sZW5ndGgpO1xuICB9XG4gIHJldHVybiBwYXRoO1xufVxuIiwgIi8vIFRoaXMgbW9kdWxlIGZpeGVzIGEgY29tbW9uIHByb2JsZW0gd2l0aCBhZGRpbmcgbmV3IHN0cmluZ3MgdG8gc28tY2FsbGVkIExhbmdcbi8vIEZpbGVzIChmaWxlcyBpbiB0aGUgZGlyZWN0b3J5IGBkYXRhL2xhbmcvYCkuIFlvdSBzZWUsIHVuZGVyIG5vcm1hbCBjaXJjdW1zdGFuY2VzXG4vLyB3aGVuIHVzaW5nIExhbmcgTGFiZWxzIChpbiwgZS5nLiBtYXAgZmlsZXMpIHRoZSBgZW5fVVNgIGxvY2FsZSBpcyBjb25zaWRlcmVkXG4vLyB0aGUgZGVmYXVsdCwgc28gd2hlbiB0aGUgTGFiZWwgZG9lc24ndCBjb250YWluIGEgdmFsdWUgZm9yIHRoZSBjdXJyZW50IGxvY2FsZVxuLy8gdGhlIG9uZSBmb3IgYGVuX1VTYCB3aWxsIGJlIGxvYWRlZCBhcyBhIGZhbGxiYWNrLiBUaGlzIGFsbG93cyBhIG1vZCBhdXRob3IgdG9cbi8vIG5vdCBkdXBsaWNhdGUgdGV4dCBmb3IgdW50cmFuc2xhdGVkIGxvY2FsZXMgYW5kIGFjdHMgYXMgYSBmdXR1cmUtcHJvb2Zpbmdcbi8vIG1lYXN1cmUgaW4gY2FzZSBtb3JlIGxvY2FsZXMgYXJlIGFkZGVkIHRvIHRoZSBiYXNlIGdhbWUgKHRoaXMgaGFzIGhhcHBlbmVkIGF0XG4vLyBsZWFzdCBvbmNlOiBgemhfVFdgIHdhcyBhZGRlZCBpbiAxLjMuMCkuXG4vL1xuLy8gVW5mb3J0dW5hdGVseSB0aGVyZSBpcyBubyBmYWxsYmFjayBmZWF0dXJlIGZvciBMYW5nIEZpbGVzLiBMYW5nIEZpbGVzIGZvciBhbGxcbi8vIGxvY2FsZXMgaW4gdGhlIGJhc2UgZ2FtZSBoYXZlIHRoZSBzYW1lIHN0cnVjdHVyZSBhbmQgY29udGFpbiB0aGUgZXhhY3Qgc2FtZVxuLy8gbnVtYmVyIG9mIHN0cmluZ3MsICoqb25seSB0aGUgTGFuZyBGaWxlcyBvZiB0aGUgY3VycmVudCBsb2NhbGUgYXJlIGxvYWRlZCoqLlxuLy8gVGhpcyBtZWFucyB0aGF0IHBhdGNoaW5nIHRoZSBgZW5fVVNgIGZpbGVzIGRvZXNuJ3QgcHJvdmlkZSBhIGZhbGxiYWNrIGZvclxuLy8gb3RoZXIgbG9jYWxlcy4gQW5kIHRvIGJlIGhvbmVzdCwgdGhpcyBpcyBhIHByZXR0eSBjb252ZW5pZW50IHVzZSBmb3Igb2xkLXNjaG9vbFxuLy8gXCJvYmplY3QgbWVyZ2luZ1wiIHBhdGNoZXM6IExhbmcgRmlsZXMgYXJlIGxhcmdlbHkgY29tcHJpc2VkIG9mIGRpY3Rpb25hcmllc1xuLy8gYW5kIG1vc3Qgb2YgdGhlIHRpbWUgb25seSBhZGRpbmcgc3R1ZmYgaXMgbmVjZXNzYXJ5LCBub3QgY2hhbmdpbmcgb3IgZGVsZXRpbmdcbi8vIGV4aXN0aW5nIGNvbnRlbnRzLiBJbiB0aGUgcGFzdCB0aGUgb25seSBmdXR1cmUtcHJvb2Ygd2F5IHRvIGFjY29tcGxpc2ggdGhpc1xuLy8gd2FzIGJ5IGFkZGluZyB2YWx1ZXMgdG8gdGhlIGBpZy5sYW5nLmxhYmVsc2Agb2JqZWN0IGVpdGhlciBpbiBgcG9zdHN0YXJ0YCBvclxuLy8gYnkgaW5qZWN0aW5nIGNvZGUgaW50byB0aGUgYGlnLkxhbmdgIGNvbnN0cnVjdG9yLlxuLy9cbi8vIFRoaXMgbWV0aG9kIHdhcyBhYnVzZWQgaW4gU2ltcGxpZnkvQ0NMb2FkZXIyIGFuZCBzb21lIG90aGVyIG1vZHMuIEl0IGhhZCB0aHJlZVxuLy8gcHJvYmxlbXMgdGhvdWdoOlxuLy9cbi8vIDEuIEl0IGFsbG93ZWQgYWRkaW5nIHRyYW5zbGF0aW9ucyBvbmx5IGZvciBhIHNpbmdsZSBsb2NhbGUuIE9mIGNvdXJzZSwgeW91XG4vLyAgICBjYW4gdXNlIG9iamVjdHMgb2YgXCJsYW5ndWFnZSB0byB0ZXh0XCIgcGFpcnMgKGVzc2VudGlhbGx5IExhbmcgTGFiZWxzKSBhbmRcbi8vICAgIHNlbGVjdCB0aGUgY29ycmVjdCB0cmFuc2xhdGlvbiBiYXNlZCBvbiBgaWcuY3VycmVudExhbmdgLCBidXQgdGhhdCB3b3VsZFxuLy8gICAgYmUgYSBwYXJ0aWFsIHJlaW1wbGVtZW50YXRpb24gb2YgTGFuZyBGaWxlcy4gT2YgY291cnNlLCBub2JvZHkgcmVhbGx5XG4vLyAgICBjYXJlZCBhYm91dCB0aGlzIHBvaW50IHRob3VnaCwgc2luY2UgdGhlIG1vZGRpbmcgY29tbXVuaXR5IGlzIGxhcmdlbHlcbi8vICAgIGludGVybmF0aW9uYWwgYW5kIHRoZSBsaW5ndWEgZnJhbmNhIHdhcyBFbmdsaXNoLlxuLy9cbi8vIDIuIEl0IHJlbGllZCBlaXRoZXIgb24gYHBvc3RzdGFydGAgb3IgYGlnLkxhbmdgIGluamVjdGlvbnMsIGJvdGggb2Ygd2hpY2ggYXJlXG4vLyAgICBwcm9ibGVtYXRpYy4gYHBvc3RzdGFydGAgKG9yIGBtYWluYCBhcyBpdCB3YXMgcHJldmlvdXNseSBjYWxsZWQpIGhhcyBiZWVuXG4vLyAgICBmcm93bmVkIHVwb24gYnkgdGhlIG1vZGxvYWRlciBkZXZlbG9wZXJzLCBDQ0luamVjdG9yIGRpZG4ndCBoYXZlIGl0IGF0IGFsbFxuLy8gICAgZm9yIGV4YW1wbGUuIEFuZCBudW1lcm91cyBpbmplY3Rpb25zIGludG8gYSBtZXRob2Qgb3IgY29uc3RydWN0b3Igb2YgYVxuLy8gICAgc2luZ2xlIGNsYXNzIGNhbiBtYWtlIGRlYnVnZ2luZyBvZiB0aGUgc2FpZCBjb2RlIHVucGxlYXNhbnQgZHVlIHRvIGEgZGVlcFxuLy8gICAgY2FsbCBzdGFjaywgdGhvdWdoIHRoaXMgaXNuJ3QgYSBtYWpvciBpc3N1ZS5cbi8vXG4vLyAzLiBNb3N0IG5vdGFibHksIHRoZSBhZGRlZCB2YWx1ZXMgd2VyZSBpbmFjY2Vzc2libGUgaW4gTG9jYWxpemUgTWVcbi8vICAgICg8aHR0cHM6Ly9naXRodWIuY29tL0wtU2hlcnJ5L0xvY2FsaXplLW1lPiksIGFuZCBzbyBpdCB3YXMgZGlmZmljdWx0IHRvXG4vLyAgICBsb2NhbGl6ZSBzdHJpbmdzIGluamVjdGVkIGludG8gTGFuZyBGaWxlcyBmcm9tIHRyYW5zbGF0aW9uIG1vZHMuIE5vdyB0aGF0XG4vLyAgICBJIG1lbnRpb24gTG9jYWxpemUgTWUsIGl0IHNob3VsZCBhbHNvIGJlIHNhaWQgdGhhdCBtb2RkZWQgbG9jYWxlcyBkb24ndFxuLy8gICAgc3VmZmVyIGZyb20gdGhpcyBcImZhbGxiYWNrXCIgcHJvYmxlbTogTG9jYWxpemUgTWUgYnkgZGVzaWduIHdpbGwgc2ltcGx5XG4vLyAgICBza2lwIHVudHJhbnNsYXRlZCBzdHJpbmdzIG9yLCBtb3JlIHByZWNpc2VseSwgcnVuIHRoZW0gdGhyb3VnaCBgbWlzc2luZ19jYmAsXG4vLyAgICBidXQgdGhlIHZhbHVlcyB3aWxsIHN0aWxsIGJlIHJlYWRhYmxlIGZyb20gYGlnLmxhbmcubGFiZWxzYCBpbiB0aGUgZ2FtZVxuLy8gICAgbmV2ZXJ0aGVsZXNzLlxuLy9cbi8vIEFuZCBzbywgdGhlIGNob3NlbiBzb2x1dGlvbiB3YXMgdG8gbG9hZCBMYW5nIEZpbGVzIG9mIHRoZSBidWlsdC1pbiBsb2NhbGVzXG4vLyBhbmQgbWVyZ2UgdGhlbSBvdmVyIGBlbl9VU2Agb25lcywgdGh1cyBlZmZlY3RpdmVseSBtYWtpbmcgYGVuX1VTYCB2YWx1ZXMgdGhlXG4vLyBmYWxsYmFjayBvbmVzLiBUaGlzIG1ha2VzIHRoZSBmaXggZnV0dXJlLXByb29mLCBhbGxvd3MgY29udmVuaWVudCBwYXRjaGluZ1xuLy8gd2l0aCBvYmplY3QgbWVyZ2luZyBhcyBkZXNjcmliZWQgYWJvdmUgYW5kLCBtb3N0IGltcG9ydGFudGx5LCBhbGxvd3Mgc2VhbWxlc3Ncbi8vIGxvY2FsaXphdGlvbiBvZiBtb2RkZWQgc3RyaW5ncyBpbnNlcnRlZCBpbnRvIExhbmcgRmlsZXMuIExhbmcgRmlsZXMgb2YgTW9kZGVkXG4vLyBsb2NhbGVzIGFyZW4ndCB0b3VjaGVkIGJlY2F1c2UgdGhleSBkb24ndCByZWFsbHkgZXhpc3QgaW4gdGhlIGZpcnN0IHBsYWNlOlxuLy8gTG9jYWxpemUgTWUgcmV3cml0ZXMgdGhlIFVSTCB0byBwb2ludCB0byBhIGJ1aWx0LWluIEZpbGUgYW5kIGFwcGxpZXNcbi8vIHRyYW5zbGF0aW9uIHBhY2tzIGFmdGVyd2FyZHMgLSBzbyB0aGUgbWVyZ2Ugd291bGQgaGF2ZSBiZWVuIHBlcmZvcm1lZCB0d2ljZS5cbi8vXG4vLyBOT1RFOiBNb2RzIGNhbid0IHJlbHkgb24gdGhlIGZhbGxiYWNrIHZhbHVlcyBiZWluZyBhdmFpbGFibGUgd2hlbiBwYXRjaGVzIGFyZVxuLy8gYXBwbGllZC4gIFNlZSBiZWxvdyBmb3IgYW4gZXhwbGFuYXRpb24uXG5cbmltcG9ydCAqIGFzIGltcGFjdE1vZHVsZUhvb2tzIGZyb20gJy4vaW1wYWN0LW1vZHVsZS1ob29rcyc7XG5pbXBvcnQgKiBhcyByZXNvdXJjZXMgZnJvbSAnLi9yZXNvdXJjZXMnO1xuXG4vLyBJZGVhbGx5IHRoaXMgY29kZSBoYXMgdG8gcnVuIGFzIGVhcmx5IGFzIHBvc3NpYmxlLCBzbyB0aGF0IGFuIGFjY3VyYXRlIGxpc3Qgb2Zcbi8vIGJ1aWx0LWluIGxvY2FsZXMgY2FuIGJlIG9idGFpbmVkLiBJbiBwcmFjdGljZSBcImFzIGVhcmx5IGFzIHBvc3NpYmxlXCIgbWVhbnNcbi8vIFwiYmVmb3JlIExvY2FsaXplIE1lIG9yIGFueSBvdGhlciBtb2Qgd2hpY2ggYWRkcyBlbnRyaWVzIHRvIGBpZy5MQU5HX0RFVEFJTFNgXCIuXG5pbXBhY3RNb2R1bGVIb29rcy5hZGQoJ2dhbWUuY29uZmlnJywgKCkgPT4ge1xuICAvLyBgaWcuU1VQUE9SVEVEX0xBTkdgIGlzIGFub3RoZXIgcG9zc2libGUgc291cmNlIG9mIGxvY2FsZXMsIGJ1dCBpdCBhcHBlYXJzXG4gIC8vIHRvIGJlIHVudXNlZCBpbiB0aGUgZ2FtZSBjb2RlLCBzbyBpdCBpcyBwb3NzaWJsZSBmb3IgZGV2ZWxvcGVycyB0byBzaW1wbHlcbiAgLy8gZm9yZ2V0IHRvIHVwZGF0ZSBpdC4gIE9uIHRoZSBvdGhlciBoYW5kLCBpdCBtYXkgYmUgdXNlZCBpbiB0aGVpciBlZGl0b3JzLlxuICBjb25zdCBCVUlMVElOX0xPQ0FMRVMgPSBPYmplY3Qua2V5cyhpZy5MQU5HX0RFVEFJTFMpO1xuICBjb25zdCBERUZBVUxUX0xPQ0FMRSA9ICdlbl9VUyc7XG5cbiAgLy8gU2VlIGBpZy5MYW5nI2xvYWRJbnRlcm5hbGAgaW4gdGhlIGdhbWUgY29kZVxuICBmdW5jdGlvbiBnZXRMYW5nRmlsZVBhdGgoZmVhdHVyZTogc3RyaW5nLCBsb2NhbGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGZlYXR1cmUudG9QYXRoKCdkYXRhL2xhbmcvJywgYC4ke2xvY2FsZX0uanNvbmApO1xuICB9XG5cbiAgaWcuTGFuZy5pbmplY3Qoe1xuICAgIC8vIFRoZXJlIGlzbid0IHJlYWxseSBhIGZ1dHVyZS1wcm9vZiB3YXkgdG8ga25vdyB0aGUgdmFsdWVzIGluIGBpZy5sYW5nRmlsZUxpc3RgXG4gICAgLy8gZHVyaW5nIGBwb3N0bG9hZGAsIHBsdXMgbW9kcyBjb3VsZCBhZGQgc29tZXRoaW5nIHRvIHRoaXMgYXJyYXkgZHVyaW5nXG4gICAgLy8gYHByZXN0YXJ0YCwgc28gaW5zdGVhZCB0aGlzIG1vZHVsZSdzIHBhdGNoZXJzIGFyZSBpbnNlcnRlZCBqdXN0IGJlZm9yZVxuICAgIC8vIHRoZSB1c2FnZSBzaXRlIG9mIGBpZy5sYW5nRmlsZUxpc3RgLCB3aGljaCBpcyBgaWcuTGFuZyNsb2FkSW50ZXJuYWxgLlxuICAgIC8vIFRoaXMgdW5mb3J0dW5hdGVseSBtZWFucyB0aGF0IHdlIGNhbid0IG1ha2UgYW55IGd1YXJhbnRlZXMgYWJvdXQgdGhlXG4gICAgLy8gZXhlY3V0aW9uIHRpbWUgb2YgdGhlIHJlZ2lzdGVyZWQgcGF0Y2hlcnMsIHRob3VnaCBpbiBwcmFjdGljZSB0aGV5IHdpbGxcbiAgICAvLyBiZSBleGVjdXRlZCB2ZXJ5IGxhdGUgc29tZXRpbWUgYWZ0ZXIgYHN0YXJ0Q3Jvc3NDb2RlYC5cbiAgICBsb2FkSW50ZXJuYWwoLi4uYXJncykge1xuICAgICAgZm9yIChsZXQgbG9jYWxlIG9mIEJVSUxUSU5fTE9DQUxFUykge1xuICAgICAgICBpZiAobG9jYWxlID09PSBERUZBVUxUX0xPQ0FMRSkgY29udGludWU7XG5cbiAgICAgICAgZm9yIChsZXQgZmVhdHVyZSBvZiBpZy5sYW5nRmlsZUxpc3QpIHtcbiAgICAgICAgICByZXNvdXJjZXMuanNvblBhdGNoZXMuYWRkKGdldExhbmdGaWxlUGF0aChmZWF0dXJlLCBsb2NhbGUpLCB7XG4gICAgICAgICAgICBkZXBlbmRlbmNpZXM6ICgpID0+IHJlc291cmNlcy5sb2FkSlNPTihnZXRMYW5nRmlsZVBhdGgoZmVhdHVyZSwgREVGQVVMVF9MT0NBTEUpKSxcbiAgICAgICAgICAgIHBhdGNoZXI6IChkYXRhLCBkZWZhdWx0TG9jYWxlRGF0YSkgPT5cbiAgICAgICAgICAgICAgaWcubWVyZ2UoLyogb3JpZ2luYWwgKi8gZGVmYXVsdExvY2FsZURhdGEsIC8qIG5ldyAqLyBkYXRhLCAvKiBub0FycmF5TWVyZ2UgKi8gdHJ1ZSksXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucGFyZW50KC4uLmFyZ3MpO1xuICAgIH0sXG4gIH0pO1xufSk7XG4iLCAiLyogZXNsaW50LWRpc2FibGUgbm8tZ2xvYmFsLWFzc2lnbiAqL1xuXG5pbXBvcnQgKiBhcyBpbXBhY3RNb2R1bGVIb29rcyBmcm9tICcuL2ltcGFjdC1tb2R1bGUtaG9va3MnO1xuaW1wb3J0ICogYXMgcmVzb3VyY2VzIGZyb20gJy4vcmVzb3VyY2VzJztcblxuaWYgKHR5cGVvZiB3aW5kb3cucmVxdWlyZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgY29uc3QgcGF0aHNOYXRpdmUgPSB3aW5kb3cucmVxdWlyZSgncGF0aCcpIGFzIHR5cGVvZiBpbXBvcnQoJ3BhdGgnKTtcblxuICBjb25zdCBHQU1FX0FTU0VUU19GU19QQVRIID0gcGF0aHNOYXRpdmUuam9pbihcbiAgICBwcm9jZXNzLmN3ZCgpLFxuICAgIHJlc291cmNlcy5nZXRHYW1lQXNzZXRzVVJMKCkucGF0aG5hbWUsXG4gICk7XG5cbiAgLy8gYGlnLkdyZWVud29ya3NgIHdhcyBhZGRlZCBvbmx5IGluIHYxLjAuMiwgYnV0IHRoaXMgZG9lc24ndCBtYXR0ZXIgYXMgdGhlXG4gIC8vIG1vZHVsZSBob29rIHNpbXBseSB3b24ndCBiZSBmaXJlZCBpZiB0aGUgcmVzcGVjdGl2ZSBtb2R1bGUgaXNuJ3QgY3JlYXRlZFxuICBpbXBhY3RNb2R1bGVIb29rcy5hZGQoJ2ltcGFjdC5mZWF0dXJlLmdyZWVud29ya3MuZ3JlZW53b3JrcycsICgpID0+IHtcbiAgICBpZy5HcmVlbndvcmtzLmluamVjdCh7XG4gICAgICBpbml0KC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gVW5mb3J0dW5hdGVseSwgZHVlIHRvIGhvdyBgcmVxdWlyZSgpYCBiZWhhdmVzIGluIG53LmpzLCB0aGUgZGVmYXVsdFxuICAgICAgICAvLyBpbXBsZW1lbnRhdGlvbiBoYXMgdG8gc3BlY2lmeSBwYXRocyBvZiBgcmVxdWlyZSgpYGQgbW9kdWxlcyBhc1xuICAgICAgICAvLyByZWxhdGl2ZSB0byB0aGUgYGFzc2V0c2AgZGlyZWN0b3J5LiBPbiB0aGUgb3RoZXIgaGFuZCB0aGlzIGlzbid0IGhhcmRcbiAgICAgICAgLy8gdG8gZml4IC0gd2UganVzdCBoYXZlIHRvIGluamVjdCB0aGUgYWJzb2x1dGUgcGF0aCBvZiB0aGUgYXNzZXRzXG4gICAgICAgIC8vIGRpcmVjdG9yeSBpbnRvIHRoZSBzZWFyY2ggcGF0aHMgb2YgYHJlcXVpcmUoKWAuXG5cbiAgICAgICAgbGV0IG9yaWdpbmFsUmVxdWlyZTogdHlwZW9mIHJlcXVpcmUgPSByZXF1aXJlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIG5vdGUsIGhvd2V2ZXIsIHRoYXQgc3VjaCByZXBsYWNlbWVudCBvZiBgcmVxdWlyZSgpYCB3aWxsIG1vc3RcbiAgICAgICAgICAvLyBsaWtlbHkgYnJlYWsgYW55IG1vZCBjb2RlIHVzaW5nIHNvbWUgYXJjYW5lIHNlbWFudGljcyBvZiBgcmVxdWlyZSgpYFxuICAgICAgICAgIC8vIG9yIGFueSBvZiBpdHMgcHJvcGVydGllcyAoZS5nLiBgcmVxdWlyZS5yZXNvbHZlYCwgYHJlcXVpcmUuY2FjaGVgKVxuICAgICAgICAgIC8vIGluc2lkZSBvZiBhbiBpbmplY3Rpb24gaW50byBgaWcuR3JlZW53b3Jrc2AsIHRob3VnaCB0aGF0J3MgaGFyZGx5XG4gICAgICAgICAgLy8gYW4gaXNzdWUgaW4gbXkgb3BpbmlvblxuICAgICAgICAgIHJlcXVpcmUgPSBmdW5jdGlvbiAodGhpczogdW5rbm93biwgcGF0aDogc3RyaW5nLCAuLi5hcmdzMikge1xuICAgICAgICAgICAgcGF0aCA9IG9yaWdpbmFsUmVxdWlyZS5yZXNvbHZlKHBhdGgsIHsgcGF0aHM6IFtHQU1FX0FTU0VUU19GU19QQVRIXSB9KTtcbiAgICAgICAgICAgIHJldHVybiBvcmlnaW5hbFJlcXVpcmUuY2FsbCh0aGlzLCBwYXRoLCAuLi5hcmdzMik7XG4gICAgICAgICAgfSBhcyB0eXBlb2YgcmVxdWlyZTtcblxuICAgICAgICAgIHJldHVybiB0aGlzLnBhcmVudCguLi5hcmdzKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICByZXF1aXJlID0gb3JpZ2luYWxSZXF1aXJlO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pO1xuICB9KTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFPQSxTQUFTLGVBQWUsT0FBZ0IsTUFBb0I7QUFDMUQsTUFBSSxPQUFPLFVBQVUsVUFBVTtBQUM3QixVQUFNLElBQUksVUFBVSxZQUFZLElBQUksaUJBQWlCO0FBQUEsRUFDdkQ7QUFDRjtBQUdBLFNBQVMsZ0JBQWdCLE1BQWMsZ0JBQWlDO0FBQ3RFLE1BQUksTUFBTTtBQUNWLE1BQUksb0JBQW9CO0FBQ3hCLE1BQUksWUFBWTtBQUNoQixNQUFJLE9BQU87QUFDWCxNQUFJLE9BQU87QUFDWCxXQUFTLElBQUksR0FBRyxLQUFLLEtBQUssUUFBUSxLQUFLO0FBQ3JDLFFBQUksSUFBSSxLQUFLLE9BQVEsUUFBTyxLQUFLLFdBQVcsQ0FBQztBQUFBLGFBQ3BDLFNBQVMsbUJBQW9CO0FBQUEsUUFDakMsUUFBTztBQUVaLFFBQUksU0FBUyxvQkFBb0I7QUFDL0IsVUFBSSxjQUFjLElBQUksS0FBSyxTQUFTLEdBQUc7QUFBQSxNQUV2QyxXQUFXLFNBQVMsR0FBRztBQUNyQixZQUNFLElBQUksU0FBUyxLQUNiLHNCQUFzQixLQUN0QixJQUFJLFdBQVcsSUFBSSxTQUFTLENBQUMsTUFBTSxZQUNuQyxJQUFJLFdBQVcsSUFBSSxTQUFTLENBQUMsTUFBTSxVQUNuQztBQUNBLGNBQUksSUFBSSxTQUFTLEdBQUc7QUFDbEIsZ0JB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TUFDL0QsYUFBYSxVQUFVO0FBQUEsTUFDdkIsZ0JBQWdCLElBQUk7QUFBQSxNQUNwQjtBQUFBLE1BQ0E7QUFBQSxNQUNBLFNBQVM7QUFBQSxNQUNUO0FBQUE7QUFBQSxNQUVBO0FBQUEsTUFDQTtBQUFBLE1BQ0EsaUJBQUFDO0FBQUEsTUFDQSxtQkFBQUE7QUFBQSxNQUNBLGFBQUFBO0FBQUEsTUFDQSxXQUFBQTtBQUFBLElBQ0YsQ0FBQztBQUdEO0FBQUEsRUFDRjtBQUFBLEVBRU8sZUFBcUI7QUFDMUIsYUFBUyxDQUFDLEdBQUcsR0FBRyxLQUFLLFVBQVU7QUFDN0IsVUFBSSxJQUFJLFNBQVM7QUFDZixRQUFBQSxXQUFZLGtCQUFrQixJQUFJLFNBQVMsV0FBVyxJQUFJLGNBQWMsVUFBVSxDQUFDLENBQUM7QUFDeEYsYUFBUyxNQUFNQSxXQUFnQixVQUFXLElBQUc7QUFBQSxFQUMvQztBQUFBLEVBRUEsTUFBYSxXQUEwQjtBQUNyQyxVQUFNO0FBQUEsRUFDUjtBQUFBLEVBRUEsTUFBYSxXQUEwQjtBQUNyQyxVQUFNO0FBQUEsRUFDUjtBQUNGOyIsCiAgIm5hbWVzIjogWyJ3aW5kb3ciLCAicmVzb2x2ZSIsICJQbGF0Zm9ybVR5cGUiLCAiX19nZXRPd25Qcm9wTmFtZXMiLCAiX19yZXF1aXJlIiwgInZlcnNpb24iLCAiZGlmZiIsICJwYXRjaCIsICJjb21wYXJlIiwgInBob3RvbWVyZ2UiLCAicGhvdG9jb3B5IiwgImRpZmYiLCAiZGlmZkVudGVyTGV2ZWwiLCAiZGlmZkFwcGx5Q29tbWVudCIsICJkZWZhdWx0U2V0dGluZ3MiLCAicGF0Y2giLCAiYXBwbGllcnMiLCAiRGVidWdTdGF0ZSIsICJjYWxsYWJsZXMiLCAiRGVidWdTdGF0ZSIsICJhcHBsaWVycyIsICJjYWxsYWJsZXMiLCAiZGVmYXVsdFNldHRpbmdzIiwgImRpZmYiLCAiZGlmZkFwcGx5Q29tbWVudCIsICJkaWZmRW50ZXJMZXZlbCIsICJwYXRjaCIsICJwaG90b2NvcHkiLCAicGhvdG9tZXJnZSIsICJyZXNvbHZlIiwgInJlc29sdmUiLCAibmFtZXNwYWNlIiwgInBhdGNoIiwgImxvYWRKU09OIiwgImxvYWRUZXh0IiwgIl9hIiwgImxvYWRJbWFnZSIsICJuYW1lc3BhY2UiLCAiaW5pdF9yZXNvdXJjZXMiLCAiRGVidWdTdGF0ZSIsICJQbHVnaW4iLCAiX2EiLCAiaW5pdF91dGlscyIsICJMb2dMZXZlbCIsICJpbml0X29wdGlvbnMiLCAiaW5pdF91dGlscyIsICJpbml0X3Jlc291cmNlcyIsICJfYSIsICJsb2FkVGV4dCIsICJfYSIsICJnZXRJbnN0YWxsZWRFeHRlbnNpb25zIiwgImdldE1vZFBhdGhzSW4iLCAiaXNSZWFkYWJsZSIsICJsb2FkVGV4dCIsICJyZWFkRmlsZSIsICJfYSIsICJnZXRJbnN0YWxsZWRFeHRlbnNpb25zIiwgImdldE1vZFBhdGhzSW4iLCAiaXNSZWFkYWJsZSIsICJsb2FkVGV4dCIsICJyZWFkRmlsZSIsICJpc1JlYWRhYmxlIiwgImxvYWRUZXh0IiwgInJlYWRGaWxlIiwgImlzUmVhZGFibGUiLCAibG9hZFRleHQiLCAiZ2V0TW9kUGF0aHNJbiIsICJnZXRJbnN0YWxsZWRFeHRlbnNpb25zIiwgImdldEluc3RhbGxlZEV4dGVuc2lvbnMiLCAiaXNSZWFkYWJsZSIsICJsb2FkVGV4dCIsICJpbml0X29wdGlvbnMiLCAiZ2V0UmVxdWlyZVNlYXJjaFBhdGhzIiwgInJlc29sdmVDYWxsU2l0ZUZpbGVQYXRoIiwgImdldENhbGxlciIsICJuYW1lc3BhY2UiLCAiYWRkIiwgIm5hbWVzcGFjZSIsICJpbml0X3Jlc291cmNlcyIsICJuYW1lc3BhY2UiLCAiaW5pdF9yZXNvdXJjZXMiLCAibG9hZEpTT04iLCAiYWRkIiwgImxvYWRJbWFnZSIsICJpbml0X3Jlc291cmNlcyIsICJhZGQiLCAibG9hZEpTT04iLCAiaW5pdF9yZXNvdXJjZXMiLCAiYWRkIiwgIm5hbWVzcGFjZSJdCn0K
