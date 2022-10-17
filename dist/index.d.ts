import { Snapshot } from './snapshot';
import { ServerSnapshot, ServerSnapshotOptions } from './snapshot-server';
import noop from './utils/noop';
export declare const ReactPrerenderIt: {
    Snapshot: typeof Snapshot;
    ServerSnapshot: typeof ServerSnapshot;
    noop: typeof noop;
};
export default ReactPrerenderIt;
export { noop, Snapshot, ServerSnapshotOptions, ServerSnapshot };
