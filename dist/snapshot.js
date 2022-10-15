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
exports.workspace = exports.save = exports.Snapshot = exports.pkgJson = void 0;
/* eslint-disable @typescript-eslint/no-this-alias */
var bluebird_1 = __importDefault(require("bluebird"));
var fs_1 = require("fs");
var jsdom_1 = require("jsdom");
var prettier_1 = __importDefault(require("prettier"));
var puppeteer_1 = require("puppeteer");
var upath_1 = require("upath");
var _prettierrc_1 = __importDefault(require("./.prettierrc"));
var puppeteer_2 = require("./puppeteer");
var array_1 = require("./utils/array");
var env_1 = require("./utils/env");
var noop_1 = require("./utils/noop");
var tempPkg = (0, upath_1.join)(__dirname, 'temp-package.json');
if (!(0, fs_1.existsSync)(tempPkg))
    save(tempPkg, '{}');
var pkg = JSON.parse((0, fs_1.readFileSync)((0, upath_1.join)(process.cwd(), 'package.json'), 'utf-8'));
save(tempPkg, JSON.stringify(pkg));
exports.pkgJson = pkg;
var Snapshot = /** @class */ (function () {
    function Snapshot() {
        this.links = new Set();
        this.scraping = false;
    }
    Snapshot.prototype.scrape = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var browser, page, content, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.scraping)
                            return [2 /*return*/, null];
                        this.scraping = true;
                        return [4 /*yield*/, (0, puppeteer_1.launch)({
                                headless: true,
                                timeout: 3 * 60 * 1000,
                                args: puppeteer_2.defaultArg
                            })];
                    case 1:
                        browser = _a.sent();
                        return [4 /*yield*/, browser.newPage()];
                    case 2:
                        page = _a.sent();
                        page.on('pageerror', noop_1.catchMsg);
                        return [4 /*yield*/, page.goto(url, { waitUntil: 'networkidle0', timeout: 3 * 60 * 1000 })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, page.waitForNetworkIdle()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, page.content()];
                    case 5:
                        content = _a.sent();
                        return [4 /*yield*/, browser.close()];
                    case 6:
                        _a.sent();
                        this.scraping = false;
                        return [4 /*yield*/, this.removeUnwantedHtml(content)];
                    case 7:
                        result = _a.sent();
                        return [4 /*yield*/, this.removeDuplicateScript(result)];
                    case 8:
                        result = _a.sent();
                        return [4 /*yield*/, this.fixAdsenseFromHtml(result)];
                    case 9:
                        result = _a.sent();
                        return [4 /*yield*/, this.fixSeoFromHtml(result)];
                    case 10:
                        result = _a.sent();
                        return [4 /*yield*/, this.setIdentifierFromHtml(result)];
                    case 11:
                        result = _a.sent();
                        if (env_1.isDev) {
                            return [2 /*return*/, prettier_1["default"].format(result, Object.assign(_prettierrc_1["default"], { parser: 'html' }))];
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Snapshot.prototype.removeUnwantedHtml = function (html) {
        return __awaiter(this, void 0, void 0, function () {
            var dom, window, document, selectors, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dom = new jsdom_1.JSDOM(html);
                        window = dom.window;
                        document = dom.window.document;
                        selectors = [
                            "script[src*='adsid/integrator.js']",
                            "script[src*='partner.googleadservices.com']",
                            "script[src*='show_ads_impl.js']",
                            "link[href*='adsid/integrator.js']",
                            "meta[http-equiv='origin-trial']",
                            "iframe[src*='googleads.g.doubleclick.net']",
                            "iframe[src='https://www.google.com/recaptcha/api2/aframe']",
                            '.adsbygoogle-noablate',
                            'script[src="https://www.googletagmanager.com/gtag/js"]',
                            'iframe[src*="tpc.googlesyndication.com"]'
                            //'script[src*="main."]',
                        ];
                        selectors
                            .map(function (selector) { return Array.from(document.querySelectorAll(selector)); })
                            .forEach(function (arr) { return arr.map(function (el) { return el.remove(); }); });
                        return [4 /*yield*/, this.serializeHtml(dom)["finally"](function () {
                                window.close();
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Snapshot.prototype.removeDuplicateScript = function (html) {
        return __awaiter(this, void 0, void 0, function () {
            var dom, window, document, scripts, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dom = new jsdom_1.JSDOM(html);
                        window = dom.window;
                        document = dom.window.document;
                        scripts = [];
                        document.querySelectorAll('script').forEach(function (el) {
                            if (scripts.includes(el.src)) {
                                el.remove();
                            }
                            else {
                                scripts.push(el.src);
                            }
                        });
                        return [4 /*yield*/, this.serializeHtml(dom)["finally"](function () {
                                window.close();
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Snapshot.prototype.fixAdsenseFromHtml = function (html) {
        return __awaiter(this, void 0, void 0, function () {
            var dom, window, document, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dom = new jsdom_1.JSDOM(html);
                        window = dom.window;
                        document = dom.window.document;
                        // remove inner html ins
                        Array.from(document.querySelectorAll('ins.adsbygoogle')).forEach(function (el) {
                            el.innerHTML = '';
                            el.removeAttribute('data-ad-status');
                            el.removeAttribute('data-adtest');
                            el.removeAttribute('data-adsbygoogle-status');
                        });
                        return [4 /*yield*/, this.serializeHtml(dom)["finally"](function () {
                                window.close();
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Snapshot.prototype.fixSeoFromHtml = function (html) {
        return __awaiter(this, void 0, void 0, function () {
            var dom, window, document, anchors, internal_links, hostname, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dom = new jsdom_1.JSDOM(html);
                        window = dom.window;
                        document = dom.window.document;
                        anchors = Array.from(document.querySelectorAll('a'));
                        internal_links = (0, array_1.array_unique)(anchors
                            .filter(function (a) {
                            return a.href.startsWith('/') &&
                                !/.(jpeg|jpg|gif|svg|ico|png)$/i.test(a.href);
                        })
                            .map(function (a) { return a.href; })
                            .filter(function (href) {
                            return typeof href === 'string' &&
                                href.startsWith('/') &&
                                !/.(jpeg|jpg|gif|svg|ico|png)$/i.test(href) &&
                                href.length > 0;
                        })).filter(function (str) {
                            return typeof str === 'string' &&
                                str.length > 0 &&
                                !str.startsWith('/undefined');
                        });
                        internal_links.forEach(function (item) {
                            if (item.trim().length > 0)
                                _this.links.add(item);
                        });
                        hostname = new URL(pkg.homepage).host;
                        anchors
                            .filter(function (a) { return /^https?:\/\//.test(a.href) && !a.href.includes(hostname); })
                            .forEach(function (a) {
                            a.rel = 'nofollow noopener noreferer';
                            a.target = '_blank';
                        });
                        return [4 /*yield*/, this.serializeHtml(dom)["finally"](function () {
                                window.close();
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Snapshot.prototype.setIdentifierFromHtml = function (html) {
        return __awaiter(this, void 0, void 0, function () {
            var dom, window, document, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!html)
                            throw new Error('html empty');
                        dom = new jsdom_1.JSDOM(html);
                        window = dom.window;
                        document = dom.window.document;
                        // set identifier
                        Array.from(document.querySelectorAll('body,html,header,footer')).forEach(function (el) { return el.setAttribute('react-static', 'true'); });
                        return [4 /*yield*/, this.serializeHtml(dom)["finally"](function () {
                                window.close();
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Snapshot.prototype.serializeHtml = function (dom) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    return [2 /*return*/, dom.serialize()];
                }
                catch (_b) {
                    return [2 /*return*/, document.documentElement.outerHTML];
                }
                return [2 /*return*/];
            });
        });
    };
    Snapshot.isPathNonHtml = function (str) {
        return /.(png|jpe?g|ico|txt|gif|svg|mp4)$/.test(str);
    };
    Snapshot.isPathHasExt = function (str) {
        if (str.endsWith('/'))
            return false;
        return /\.\w+$/.test(str);
    };
    return Snapshot;
}());
exports.Snapshot = Snapshot;
function save(file, content) {
    return new bluebird_1["default"](function (resolve) {
        if (!(0, fs_1.existsSync)((0, upath_1.dirname)(file)))
            (0, fs_1.mkdirSync)((0, upath_1.dirname)(file), { recursive: true });
        (0, fs_1.writeFileSync)(file, content);
        resolve(file);
    });
}
exports.save = save;
/**
 * Remove cwd
 * @param str
 * @returns
 */
function workspace(str) {
    return (0, upath_1.toUnix)(str).replace((0, upath_1.toUnix)(process.cwd()), '');
}
exports.workspace = workspace;
