"use strict";
exports.__esModule = true;
exports.ServerSnapshot = exports.Snapshot = exports.ReactPrerenderIt = void 0;
var snapshot_1 = require("./snapshot");
exports.Snapshot = snapshot_1.Snapshot;
var snapshot_server_1 = require("./snapshot-server");
exports.ServerSnapshot = snapshot_server_1.ServerSnapshot;
exports.ReactPrerenderIt = {
    Snapshot: snapshot_1.Snapshot,
    ServerSnapshot: snapshot_server_1.ServerSnapshot
};
exports["default"] = exports.ReactPrerenderIt;
