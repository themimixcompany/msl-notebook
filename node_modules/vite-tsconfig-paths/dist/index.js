"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("./path");
const vite_1 = require("vite");
const tsconfig_paths_1 = require("tsconfig-paths");
const recrawl_sync_1 = require("recrawl-sync");
const globRex = require("globrex");
const config_1 = require("./config");
const debug = require('debug')('vite-tsconfig-paths');
exports.default = (opts = {}) => ({
    name: 'vite:tsconfig-paths',
    enforce: 'pre',
    configResolved({ root: viteRoot }) {
        const projects = findProjects(viteRoot, opts);
        const extensions = getFileExtensions(opts.extensions);
        debug('options:', { projects, extensions });
        let viteResolve;
        this.buildStart = function () {
            viteResolve = async (id, importer) => { var _a; return (_a = (await this.resolve(id, importer, { skipSelf: true }))) === null || _a === void 0 ? void 0 : _a.id; };
        };
        const resolvers = projects.map(createResolver).filter(Boolean);
        this.resolveId = async function (id, importer) {
            if (importer && !relativeImportRE.test(id) && !path_1.isAbsolute(id)) {
                for (const resolve of resolvers) {
                    const resolved = await resolve(id, importer);
                    if (resolved) {
                        return resolved;
                    }
                }
            }
        };
        function createResolver(root) {
            const configPath = root.endsWith('.json') ? root : null;
            if (configPath)
                root = path_1.dirname(root);
            root += '/';
            const config = config_1.loadConfig(configPath || root);
            if (!config) {
                debug(`[!] config not found: "${configPath || root}"`);
                return null;
            }
            const { baseUrl, paths } = config;
            if (!baseUrl) {
                debug(`[!] missing baseUrl: "${config.configPath}"`);
                return null;
            }
            debug('config loaded:', config);
            // Even if "paths" is undefined, the "baseUrl" is still
            // used to resolve bare imports.
            let resolveId = (id, importer) => viteResolve(path_1.join(baseUrl, id), importer);
            if (paths) {
                const matchPath = tsconfig_paths_1.createMatchPathAsync(baseUrl, paths, mainFields);
                const resolveWithBaseUrl = resolveId;
                const resolveWithPaths = (id, importer) => new Promise((done) => {
                    matchPath(id, void 0, void 0, extensions, (error, path) => {
                        if (path) {
                            path = vite_1.normalizePath(path);
                            done(viteResolve(path, importer));
                        }
                        else {
                            error && debug(error.message);
                            done(void 0);
                        }
                    });
                });
                resolveId = (id, importer) => resolveWithPaths(id, importer).then((resolved) => resolved || resolveWithBaseUrl(id, importer));
            }
            const isIncluded = getIncluder(config);
            let importerExtRE = /./;
            if (!opts.loose) {
                importerExtRE = config.allowJs
                    ? /\.(vue|svelte|mdx|mjs|[jt]sx?)$/
                    : /\.tsx?$/;
            }
            const resolved = new Map();
            return async (id, importer) => {
                importer = vite_1.normalizePath(importer);
                // Ignore importers with unsupported extensions.
                if (!importerExtRE.test(importer))
                    return;
                // Respect the include/exclude properties.
                if (!isIncluded(path_1.relative(root, importer)))
                    return;
                let path = resolved.get(id);
                if (!path) {
                    path = await resolveId(id, importer);
                    if (path) {
                        resolved.set(id, path);
                        debug(`resolved:`, {
                            id,
                            importer,
                            resolvedId: path,
                            configPath: config.configPath,
                        });
                    }
                }
                return path;
            };
        }
    },
});
const relativeImportRE = /^\.\.?(\/|$)/;
const mainFields = ['module', 'jsnext', 'jsnext:main', 'browser', 'main'];
const defaultInclude = ['**/*'];
const defaultExclude = ['node_modules', 'bower_components', 'jspm_packages'];
function compileGlob(glob) {
    if (!relativeImportRE.test(glob)) {
        glob = './' + glob;
    }
    if (!glob.endsWith('*') && !/\.[tj]sx?/.test(glob)) {
        glob += '/**';
    }
    return globRex(glob, {
        extended: true,
        globstar: true,
    }).regex;
}
/**
 * The returned function does not support absolute paths.
 * Be sure to call `path.relative` on your path first.
 */
function getIncluder({ include = defaultInclude, exclude = defaultExclude, outDir, }) {
    if (outDir) {
        exclude = exclude.concat(outDir);
    }
    if (include.length || exclude.length) {
        const included = include.map(compileGlob);
        const excluded = exclude.map(compileGlob);
        debug(`compiled globs:`, { included, excluded });
        return (path) => {
            if (!relativeImportRE.test(path)) {
                path = './' + path;
            }
            const test = (glob) => glob.test(path);
            return included.some(test) && !excluded.some(test);
        };
    }
    return () => true;
}
function findProjects(viteRoot, opts) {
    const root = opts.root
        ? path_1.resolve(viteRoot, vite_1.normalizePath(opts.root))
        : viteRoot;
    let { projects } = opts;
    if (!projects) {
        debug(`crawling "${root}"`);
        projects = recrawl_sync_1.crawl(root, {
            only: ['tsconfig.json'],
            skip: ['node_modules', '.git'],
        });
    }
    // Calculate the depth of each project path.
    const depthMap = {};
    projects = projects.map((projectPath) => {
        projectPath = path_1.resolve(root, vite_1.normalizePath(projectPath));
        depthMap[projectPath] =
            projectPath.split('/').length - (projectPath.endsWith('.json') ? 1 : 0);
        return projectPath;
    });
    // Ensure deeper projects take precedence.
    return projects.sort((a, b) => depthMap[b] - depthMap[a]);
}
function getFileExtensions(exts) {
    const requiredExts = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];
    return exts ? exts.concat(requiredExts) : requiredExts;
}
//# sourceMappingURL=index.js.map