"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = void 0;
const tsconfig_loader_1 = require("tsconfig-paths/lib/tsconfig-loader");
const vite_1 = require("vite");
const path_1 = require("path");
const fs_1 = require("fs");
function loadConfig(cwd) {
    const configPath = resolveConfigPath(cwd);
    if (configPath) {
        const config = tsconfig_loader_1.loadTsconfig(configPath);
        const { compilerOptions: { allowJs, checkJs, baseUrl, paths, outDir } = {}, } = config;
        return {
            configPath: vite_1.normalizePath(configPath),
            include: config.include,
            exclude: config.exclude,
            allowJs: allowJs || checkJs,
            baseUrl: baseUrl && vite_1.normalizePath(path_1.resolve(configPath, '..', baseUrl)),
            paths,
            outDir,
        };
    }
}
exports.loadConfig = loadConfig;
// Adapted from https://github.com/dividab/tsconfig-paths/blob/0b259d4cf6cffbc03ad362cfc6bb129d040375b7/src/tsconfig-loader.ts#L65
function resolveConfigPath(cwd) {
    if (fs_1.statSync(cwd).isFile()) {
        return cwd;
    }
    const configPath = tsconfig_loader_1.walkForTsConfig(cwd);
    if (configPath) {
        return configPath;
    }
}
//# sourceMappingURL=config.js.map