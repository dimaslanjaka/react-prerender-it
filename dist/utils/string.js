"use strict";
exports.__esModule = true;
exports.capitalizer = exports.escapeRegex = void 0;
/**
 * escape regex string
 * @param string
 * @returns
 */
function escapeRegex(string, method) {
    if (method === void 0) { method = '1'; }
    if (method === '1' || !method)
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Escape characters with special meaning either inside or outside character sets.
    // Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
    if (method === '2')
        return string.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
}
exports.escapeRegex = escapeRegex;
/**
 * capitalize string first letter of each word which mixed with symbols
 * @param str
 * @param moreSymbols add more symbols
 * @returns
 */
function capitalizer(str, moreSymbols) {
    if (moreSymbols === void 0) { moreSymbols = []; }
    var symbols = ['-', ' '];
    if (Array.isArray(moreSymbols)) {
        // concatenate more symbols
        symbols = symbols.concat(moreSymbols).filter(function (x, i, a) {
            return a.indexOf(x) === i;
        });
    }
    symbols.forEach(function (symbol) {
        str = str
            .split(symbol)
            .map(function (str) { return str.charAt(0).toUpperCase() + str.slice(1); })
            .join(symbol);
    });
    return str;
}
exports.capitalizer = capitalizer;
