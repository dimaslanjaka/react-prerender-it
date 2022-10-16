"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.ServerSnapshot = exports.Snapshot = exports.noop = exports.ReactPrerenderIt = void 0;
var snapshot_1 = require("./snapshot");
exports.Snapshot = snapshot_1.Snapshot;
var snapshot_server_1 = require("./snapshot-server");
exports.ServerSnapshot = snapshot_server_1.ServerSnapshot;
var noop_1 = __importDefault(require("./utils/noop"));
exports.noop = noop_1["default"];
exports.ReactPrerenderIt = {
    Snapshot: snapshot_1.Snapshot,
    ServerSnapshot: snapshot_server_1.ServerSnapshot,
    noop: noop_1["default"]
};
exports["default"] = exports.ReactPrerenderIt;
