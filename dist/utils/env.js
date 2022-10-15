"use strict";
exports.__esModule = true;
exports.isDev = void 0;
exports.isDev = (function () {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        return true;
    }
    else {
        return false;
    }
})();
