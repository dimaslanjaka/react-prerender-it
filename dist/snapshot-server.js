"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.ServerSnapshot = void 0;
require("core-js/actual/structured-clone");
var debug_1 = __importDefault(require("debug"));
var express_1 = __importDefault(require("express"));
var fs_1 = require("fs");
var upath_1 = require("upath");
var snapshot_1 = require("./snapshot");
var array_1 = require("./utils/array");
var string_1 = require("./utils/string");
var url_1 = require("./utils/url");
var pathname = new URL(snapshot_1.pkgJson.homepage).pathname;
var debug = function (suffix) { return (0, debug_1["default"])('prerender-it-' + suffix); };
var _debugExpress = debug('express');
var _debugreact = debug('react');
var _debugasset = debug('asset');
var _debugsnap = debug('snap');
function ServerSnapshot(options) {
    var _this = this;
    var defaults = {
        source: (0, upath_1.join)(process.cwd(), 'build'),
        dest: (0, upath_1.join)(process.cwd(), 'tmp'),
        registerStatic: [],
        routes: [],
        autoRoutes: false,
        callback: null
    };
    // assign options with the default options
    options = Object.assign(defaults, options);
    var source = options.source, destDir = options.dest, routes = options.routes;
    _debugsnap('serving from', source);
    var index = (0, upath_1.join)(source, 'index.html');
    var index200 = (0, upath_1.join)(source, '200.html');
    var index404 = (0, upath_1.join)(source, '404.html');
    if (!(0, fs_1.existsSync)(index))
        throw new Error('index.html not exist in build');
    if (!(0, fs_1.existsSync)(index200))
        (0, fs_1.copyFileSync)(index, index200);
    if (!(0, fs_1.existsSync)(index404))
        (0, fs_1.copyFileSync)(index, index404);
    var app = (0, express_1["default"])();
    app.use(express_1["default"].static(source));
    app.use(pathname, express_1["default"].static(source));
    if (Array.isArray(options.registerStatic)) {
        options.registerStatic.forEach(function (path) {
            _debugasset((0, snapshot_1.workspace)(path));
            app.use(express_1["default"].static(path));
            app.use(pathname, express_1["default"].static(path));
        });
    }
    // render root dir
    app.get(pathname, function (_, res) {
        _debugExpress('render', (0, snapshot_1.workspace)(index200));
        return res.sendFile(index200);
    });
    app.get(/(.*).(woff|ttf|woff2|css|js|svg|jpeg|jpg|png|gif|ico|json)/i, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var currentPath, paths;
        return __generator(this, function (_a) {
            currentPath = decodeURIComponent(req.path.replace(pathname, '/'));
            paths = [
                //path.join(blogDir, currentPath),
                (0, upath_1.join)(source, currentPath)
            ].filter(function (str) { return (0, fs_1.existsSync)(str); });
            if (paths.length === 1)
                return [2 /*return*/, res.sendFile(paths[0])];
            _debugasset(currentPath, paths);
            return [2 /*return*/, res.sendFile(index200)];
        });
    }); });
    var snap = new snapshot_1.Snapshot();
    var scraped = new Set();
    var navigateScrape = function (url) {
        return new Promise(function (resolveScrape) {
            if (scraped.has(url))
                return resolveScrape(null);
            scraped.add(url);
            snap
                .scrape(url)
                .then(function (html) {
                if (html) {
                    var currentPathname = new URL(url).pathname;
                    if (!snapshot_1.Snapshot.isPathHasExt(currentPathname)) {
                        currentPathname += '/index.html';
                    }
                    var regex = new RegExp((0, string_1.escapeRegex)(pathname), 'gi');
                    currentPathname = (0, url_1.fixUrl)(currentPathname.replace(regex, '/'))
                        // remove double slash
                        .replace(/\/+/, '/');
                    var saveto = (0, upath_1.join)(destDir, currentPathname);
                    (0, snapshot_1.save)(saveto, html).then(function (path) {
                        debug('save')((0, snapshot_1.workspace)(path));
                    });
                }
            })["catch"](console.trace)["finally"](function () {
                resolveScrape(null);
            });
        });
    };
    app.use(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            _debugreact(req.path, (0, snapshot_1.workspace)(index200));
            navigateScrape('http://localhost:4000' + req.path);
            return [2 /*return*/, res.sendFile(index200)];
        });
    }); });
    var doCallback = function (resolved) {
        if (typeof options.callback === 'function')
            options.callback(resolved);
    };
    var run = function () { return __awaiter(_this, void 0, void 0, function () {
        function gracefulShutdown(signal) {
            if (signal)
                console.log("\nReceived signal ".concat(signal));
            console.log('Gracefully closing http server');
            // closeAllConnections() is only available from Node v18.02
            if (server.closeAllConnections)
                server.closeAllConnections();
            else
                setTimeout(function () { return process.exit(0); }, 5000);
            try {
                server.close(function (err) {
                    if (err) {
                        console.error('There was an error', err);
                        process.exit(1);
                    }
                    else {
                        console.log('http server closed successfully. Exiting!');
                        process.exit(0);
                    }
                });
            }
            catch (err) {
                console.error('There was an error', err);
                setTimeout(function () { return process.exit(1); }, 500);
            }
        }
        var server, baseUrl, crawlRoutes, i, route, url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    server = app.listen(4000, function () {
                        _debugExpress('listening http://localhost:4000');
                    });
                    process.on('SIGINT', gracefulShutdown);
                    process.on('SIGTERM', gracefulShutdown);
                    baseUrl = (0, url_1.fixUrl)('http://localhost:4000/' + pathname);
                    return [4 /*yield*/, navigateScrape(baseUrl)];
                case 1:
                    _a.sent();
                    crawlRoutes = routes || [];
                    if (options.autoRoutes) {
                        // auto crawl internal links merge
                        crawlRoutes = (0, array_1.array_unique)(crawlRoutes
                            .concat(Array.from(snap.links.values()))
                            // trim all links
                            .map(function (path) { return path.trim(); })
                            // filter undefined and null
                            .filter(function (path) {
                            return typeof path == 'string' &&
                                path.length > 0 &&
                                path !== 'undefined' &&
                                path !== 'null';
                        }));
                    }
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < crawlRoutes.length)) return [3 /*break*/, 5];
                    route = crawlRoutes[i];
                    if (typeof route !== 'string')
                        return [3 /*break*/, 4];
                    url = (0, url_1.fixUrl)('http://localhost:4000/' + route);
                    _debugsnap(url);
                    return [4 /*yield*/, navigateScrape(url)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5:
                    gracefulShutdown(null);
                    return [2 /*return*/, { server: server, snap: snap }];
            }
        });
    }); };
    run()
        // callback when success
        .then(doCallback)["catch"](console.trace)["finally"](function () {
        doCallback(null);
    });
}
exports.ServerSnapshot = ServerSnapshot;
