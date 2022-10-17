"use strict";
// https://github.com/stereobooster/react-snap/blob/88ef70dd419158c18b9845034513dc84a3e100d9/index.js
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
exports.__esModule = true;
exports.fixParcelChunksIssue = exports.fixWebpackChunksIssue2 = exports.fixWebpackChunksIssue1 = exports.saveAsPng = exports.fixFormFields = exports.fixInsertRule = exports.removeBlobs = exports.preloadResources = void 0;
var fs_1 = require("fs");
var upath_1 = require("upath");
var defaultOptions = {
    //# stable configurations
    port: 45678,
    source: 'build',
    destination: null,
    concurrency: 4,
    include: ['/'],
    userAgent: 'ReactSnap',
    // 4 params below will be refactored to one: `puppeteer: {}`
    // https://github.com/stereobooster/react-snap/issues/120
    headless: true,
    puppeteer: {
        cache: true
    },
    puppeteerArgs: [],
    puppeteerExecutablePath: undefined,
    puppeteerIgnoreHTTPSErrors: false,
    publicPath: '/',
    minifyCss: {},
    minifyHtml: {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        decodeEntities: true,
        keepClosingSlash: true,
        sortAttributes: true,
        sortClassName: false
    },
    // mobile first approach
    viewport: {
        width: 480,
        height: 850
    },
    sourceMaps: true,
    //# workarounds
    // using CRA1 for compatibility with previous version will be changed to false in v2
    fixWebpackChunksIssue: 'CRA1',
    removeBlobs: true,
    fixInsertRule: true,
    skipThirdPartyRequests: false,
    cacheAjaxRequests: false,
    http2PushManifest: false,
    // may use some glob solution in the future, if required
    // works when http2PushManifest: true
    ignoreForPreload: ['service-worker.js'],
    //# unstable configurations
    preconnectThirdParty: true,
    // Experimental. This config stands for two strategies inline and critical.
    // TODO: inline strategy can contain errors, like, confuse relative urls
    inlineCss: false,
    //# feature creeps to generate screenshots
    saveAs: 'html',
    crawl: true,
    waitFor: false,
    externalServer: false,
    //# even more workarounds
    removeStyleTags: false,
    preloadImages: false,
    // add async true to script tags
    asyncScriptTags: false,
    //# another feature creep
    // tribute to Netflix Server Side Only React https://twitter.com/NetflixUIE/status/923374215041912833
    // but this will also remove code which registers service worker
    removeScriptTags: false
};
/**
 *
 * @param opt
 */
var preloadResources = function (opt) {
    var _a = Object.assign(defaultOptions, opt), page = _a.page, basePath = _a.basePath, preloadImages = _a.preloadImages, cacheAjaxRequests = _a.cacheAjaxRequests, preconnectThirdParty = _a.preconnectThirdParty, http2PushManifest = _a.http2PushManifest, ignoreForPreload = _a.ignoreForPreload;
    var ajaxCache = {};
    var http2PushManifestItems = [];
    var uniqueResources = new Set();
    page.on('response', function (response) { return __awaiter(void 0, void 0, void 0, function () {
        var responseUrl, ct, route, json, fileName, fileName, urlObj, domain;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    responseUrl = response.url();
                    if (/^data:|blob:/i.test(responseUrl))
                        return [2 /*return*/];
                    ct = response.headers()['content-type'] || '';
                    route = responseUrl.replace(basePath, '');
                    if (!/^http:\/\/localhost/i.test(responseUrl)) return [3 /*break*/, 8];
                    if (uniqueResources.has(responseUrl))
                        return [2 /*return*/];
                    if (!(preloadImages && /\.(png|jpg|jpeg|webp|gif|svg)$/.test(responseUrl))) return [3 /*break*/, 4];
                    if (!http2PushManifest) return [3 /*break*/, 1];
                    http2PushManifestItems.push({
                        link: route,
                        as: 'image'
                    });
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, page.evaluate(function (route) {
                        var linkTag = document.createElement('link');
                        linkTag.setAttribute('rel', 'preload');
                        linkTag.setAttribute('as', 'image');
                        linkTag.setAttribute('href', route);
                        document.body.appendChild(linkTag);
                    }, route)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [3 /*break*/, 7];
                case 4:
                    if (!(cacheAjaxRequests && ct.includes('json'))) return [3 /*break*/, 6];
                    return [4 /*yield*/, response.json()];
                case 5:
                    json = _a.sent();
                    ajaxCache[route] = json;
                    return [3 /*break*/, 7];
                case 6:
                    if (http2PushManifest && /\.(js)$/.test(responseUrl)) {
                        fileName = new URL(responseUrl).pathname.split('/').pop();
                        if (!ignoreForPreload.includes(fileName)) {
                            http2PushManifestItems.push({
                                link: route,
                                as: 'script'
                            });
                        }
                    }
                    else if (http2PushManifest && /\.(css)$/.test(responseUrl)) {
                        fileName = new URL(responseUrl).pathname.split('/').pop();
                        if (!ignoreForPreload.includes(fileName)) {
                            http2PushManifestItems.push({
                                link: route,
                                as: 'style'
                            });
                        }
                    }
                    _a.label = 7;
                case 7:
                    uniqueResources.add(responseUrl);
                    return [3 /*break*/, 10];
                case 8:
                    if (!preconnectThirdParty) return [3 /*break*/, 10];
                    urlObj = new URL(responseUrl);
                    domain = "".concat(urlObj.protocol, "//").concat(urlObj.host);
                    if (uniqueResources.has(domain))
                        return [2 /*return*/];
                    uniqueResources.add(domain);
                    return [4 /*yield*/, page.evaluate(function (route) {
                            var linkTag = document.createElement('link');
                            linkTag.setAttribute('rel', 'preconnect');
                            linkTag.setAttribute('href', route);
                            document.head.appendChild(linkTag);
                        }, domain)];
                case 9:
                    _a.sent();
                    _a.label = 10;
                case 10: return [2 /*return*/];
            }
        });
    }); });
    return { ajaxCache: ajaxCache, http2PushManifestItems: http2PushManifestItems };
};
exports.preloadResources = preloadResources;
/**
 *
 * @param opt
 * @return Promise
 */
var removeBlobs = function (opt) { return __awaiter(void 0, void 0, void 0, function () {
    var page;
    return __generator(this, function (_a) {
        page = opt.page;
        return [2 /*return*/, page.evaluate(function () {
                var stylesheets = Array.from(document.querySelectorAll('link[rel=stylesheet]'));
                stylesheets.forEach(function (link) {
                    if (link.getAttribute('href') &&
                        link.getAttribute('href').startsWith('blob:')) {
                        link.parentNode && link.parentNode.removeChild(link);
                    }
                });
            })];
    });
}); };
exports.removeBlobs = removeBlobs;
var fixInsertRule = function (_a) {
    var page = _a.page;
    return page.evaluate(function () {
        Array.from(document.querySelectorAll('style')).forEach(function (style) {
            if (style.innerHTML === '') {
                style.innerHTML = Array.from(style.sheet.rules)
                    .map(function (rule) { return rule.cssText; })
                    .join('');
            }
        });
    });
};
exports.fixInsertRule = fixInsertRule;
/**
 * fix form fields
 * @param param0
 * @returns
 */
var fixFormFields = function (_a) {
    var page = _a.page;
    return page.evaluate(function () {
        Array.from(document.querySelectorAll('[type=radio]')).forEach(function (element) {
            if (element.checked) {
                element.setAttribute('checked', 'checked');
            }
            else {
                element.removeAttribute('checked');
            }
        });
        Array.from(document.querySelectorAll('[type=checkbox]')).forEach(function (element) {
            if (element.checked) {
                element.setAttribute('checked', 'checked');
            }
            else {
                element.removeAttribute('checked');
            }
        });
        Array.from(document.querySelectorAll('option')).forEach(function (element) {
            if (element.selected) {
                element.setAttribute('selected', 'selected');
            }
            else {
                element.removeAttribute('selected');
            }
        });
    });
};
exports.fixFormFields = fixFormFields;
var saveAsPng = function (_a) {
    var page = _a.page, filePath = _a.filePath, route = _a.route;
    if (!(0, fs_1.existsSync)((0, upath_1.dirname)(filePath)))
        (0, fs_1.mkdirSync)((0, upath_1.dirname)(filePath));
    var screenshotPath;
    if (route.endsWith('.html')) {
        screenshotPath = filePath.replace(/\.html$/, '.png');
    }
    else if (route === '/') {
        screenshotPath = "".concat(filePath, "index.png");
    }
    else {
        screenshotPath = "".concat(filePath.replace(/\/$/, ''), ".png");
    }
    return page.screenshot({ path: screenshotPath });
};
exports.saveAsPng = saveAsPng;
var fixWebpackChunksIssue1 = function (_a) {
    var page = _a.page, basePath = _a.basePath, _b = _a.http2PushManifest, http2PushManifest = _b === void 0 ? false : _b, _c = _a.inlineCss, inlineCss = _c === void 0 ? false : _c;
    return page.evaluate(function (basePath, http2PushManifest, inlineCss) {
        var localScripts = Array.from(document.scripts).filter(function (x) { return x.src && x.src.startsWith(basePath); });
        // CRA v1|v2.alpha
        var mainRegexp = /main\.[\w]{8}.js|main\.[\w]{8}\.chunk\.js/;
        var mainScript = localScripts.find(function (x) { return mainRegexp.test(x.src); });
        var firstStyle = document.querySelector('style');
        if (!mainScript)
            return;
        var chunkRegexp = /(\w+)\.[\w]{8}(\.chunk)?\.js/g;
        var chunkScripts = localScripts.filter(function (x) {
            var matched = chunkRegexp.exec(x.src);
            // we need to reset state of RegExp https://stackoverflow.com/a/11477448
            chunkRegexp.lastIndex = 0;
            return matched && matched[1] !== 'main' && matched[1] !== 'vendors';
        });
        var mainScripts = localScripts.filter(function (x) {
            var matched = chunkRegexp.exec(x.src);
            // we need to reset state of RegExp https://stackoverflow.com/a/11477448
            chunkRegexp.lastIndex = 0;
            return matched && (matched[1] === 'main' || matched[1] === 'vendors');
        });
        var createLink = function (x) {
            if (http2PushManifest)
                return;
            var linkTag = document.createElement('link');
            linkTag.setAttribute('rel', 'preload');
            linkTag.setAttribute('as', 'script');
            linkTag.setAttribute('href', x.src.replace(basePath, ''));
            if (inlineCss) {
                firstStyle.parentNode.insertBefore(linkTag, firstStyle);
            }
            else {
                document.head.appendChild(linkTag);
            }
        };
        mainScripts.map(function (x) { return createLink(x); });
        for (var i = chunkScripts.length - 1; i >= 0; --i) {
            var x = chunkScripts[i];
            if (x.parentElement && mainScript.parentNode) {
                x.parentElement.removeChild(x);
                createLink(x);
            }
        }
    }, basePath, http2PushManifest, inlineCss);
};
exports.fixWebpackChunksIssue1 = fixWebpackChunksIssue1;
var fixWebpackChunksIssue2 = function (_a) {
    var page = _a.page, basePath = _a.basePath, _b = _a.http2PushManifest, http2PushManifest = _b === void 0 ? false : _b, _c = _a.inlineCss, inlineCss = _c === void 0 ? false : _c;
    return page.evaluate(function (basePath, http2PushManifest, inlineCss) {
        var localScripts = Array.from(document.scripts).filter(function (x) { return x.src && x.src.startsWith(basePath); });
        // CRA v2
        var mainRegexp = /main\.[\w]{8}\.chunk\.js/;
        var mainScript = localScripts.find(function (x) { return mainRegexp.test(x.src); });
        var firstStyle = document.querySelector('style');
        if (!mainScript)
            return;
        var chunkRegexp = /(\w+)\.[\w]{8}\.chunk\.js/g;
        var headScripts = Array.from(document.querySelectorAll('head script'))
            .filter(function (x) {
            return x.hasAttribute('src') && x.getAttribute('src').startsWith(basePath);
        })
            .filter(function (x) {
            var matched = chunkRegexp.exec(x.getAttribute('src'));
            // we need to reset state of RegExp https://stackoverflow.com/a/11477448
            chunkRegexp.lastIndex = 0;
            return matched;
        });
        var chunkScripts = localScripts.filter(function (x) {
            var matched = chunkRegexp.exec(x.src);
            // we need to reset state of RegExp https://stackoverflow.com/a/11477448
            chunkRegexp.lastIndex = 0;
            return matched;
        });
        var createLink = function (x) {
            if (http2PushManifest)
                return;
            var linkTag = document.createElement('link');
            linkTag.setAttribute('rel', 'preload');
            linkTag.setAttribute('as', 'script');
            linkTag.setAttribute('href', x.getAttribute('src').replace(basePath, ''));
            if (inlineCss) {
                firstStyle.parentNode.insertBefore(linkTag, firstStyle);
            }
            else {
                document.head.appendChild(linkTag);
            }
        };
        for (var i = headScripts.length; i <= chunkScripts.length - 1; i++) {
            var x = chunkScripts[i];
            if (x.parentElement && mainScript.parentNode) {
                createLink(x);
            }
        }
        for (var i = headScripts.length - 1; i >= 0; --i) {
            var x = headScripts[i];
            if (x.parentElement && mainScript.parentNode) {
                x.parentElement.removeChild(x);
                createLink(x);
            }
        }
    }, basePath, http2PushManifest, inlineCss);
};
exports.fixWebpackChunksIssue2 = fixWebpackChunksIssue2;
var fixParcelChunksIssue = function (_a) {
    var page = _a.page, basePath = _a.basePath, _b = _a.http2PushManifest, http2PushManifest = _b === void 0 ? false : _b, _c = _a.inlineCss, inlineCss = _c === void 0 ? false : _c;
    return page.evaluate(function (basePath, http2PushManifest, inlineCss) {
        var localScripts = Array.from(document.scripts).filter(function (x) { return x.src && x.src.startsWith(basePath); });
        var mainRegexp = /main\.[\w]{8}\.js/;
        var mainScript = localScripts.find(function (x) { return mainRegexp.test(x.src); });
        var firstStyle = document.querySelector('style');
        if (!mainScript)
            return;
        var chunkRegexp = /(\w+)\.[\w]{8}\.js/g;
        var chunkScripts = localScripts.filter(function (x) {
            var matched = chunkRegexp.exec(x.src);
            // we need to reset state of RegExp https://stackoverflow.com/a/11477448
            chunkRegexp.lastIndex = 0;
            return matched && matched[1] !== 'main';
        });
        var createLink = function (x) {
            if (http2PushManifest)
                return;
            var linkTag = document.createElement('link');
            linkTag.setAttribute('rel', 'preload');
            linkTag.setAttribute('as', 'script');
            linkTag.setAttribute('href', x.src.replace("".concat(basePath, "/"), ''));
            if (inlineCss) {
                firstStyle.parentNode.insertBefore(linkTag, firstStyle);
            }
            else {
                document.head.appendChild(linkTag);
            }
        };
        for (var i = 0; i <= chunkScripts.length - 1; i++) {
            var x = chunkScripts[i];
            if (x.parentElement && mainScript.parentNode) {
                x.parentElement.removeChild(x);
                createLink(x);
            }
        }
    }, basePath, http2PushManifest, inlineCss);
};
exports.fixParcelChunksIssue = fixParcelChunksIssue;
