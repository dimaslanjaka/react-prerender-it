"use strict";
exports.__esModule = true;
exports.catchMsg = exports.noop = void 0;
/**
 * No operations on catch
 * @param _args
 */
function noop() {
    var _args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        _args[_i] = arguments[_i];
    }
    //
}
exports.noop = noop;
function catchMsg(e) {
    if (e.message)
        console.log(e.message);
}
exports.catchMsg = catchMsg;
exports["default"] = noop;
