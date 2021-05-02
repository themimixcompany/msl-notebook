"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relative = exports.join = exports.isAbsolute = exports.resolve = void 0;
const os = require("os");
const path = require("path");
const vite_1 = require("vite");
const isWindows = os.platform() == 'win32';
exports.resolve = isWindows
    ? (...paths) => vite_1.normalizePath(path.win32.resolve(...paths))
    : path.posix.resolve;
exports.isAbsolute = isWindows
    ? path.win32.isAbsolute
    : path.posix.isAbsolute;
/** Only call this on normalized paths */
exports.join = path.posix.join;
/** Only call this on normalized paths */
exports.relative = path.posix.relative;
var path_1 = require("path");
Object.defineProperty(exports, "dirname", { enumerable: true, get: function () { return path_1.dirname; } });
//# sourceMappingURL=path.js.map