import { Snapshot } from './snapshot';
import { ServerSnapshot, ServerSnapshotOptions } from './snapshot-server';
import noop from './utils/noop';

export const ReactPrerenderIt = {
  Snapshot,
  ServerSnapshot,
  noop
};
export default ReactPrerenderIt;
export { noop, Snapshot, ServerSnapshotOptions, ServerSnapshot };
