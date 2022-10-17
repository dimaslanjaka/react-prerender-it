"use strict";
exports.__esModule = true;
exports.fixUrl = exports.isValidHttpUrl = void 0;
function isValidHttpUrl(string) {
    var url;
    try {
        url = new URL(string);
    }
    catch (_) {
        return false;
    }
    return url.protocol === 'http:' || url.protocol === 'https:';
}
exports.isValidHttpUrl = isValidHttpUrl;
function fixUrl(url) {
    var str;
    if (typeof url === 'string') {
        str = url;
    }
    else {
        str = url.toString();
    }
    return str.replace(/([^:]\/)\/+/g, '$1');
}
exports.fixUrl = fixUrl;
