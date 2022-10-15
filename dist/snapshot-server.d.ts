/// <reference types="node" />
import Bluebird from 'bluebird';
import 'core-js/actual/structured-clone';
import { Snapshot } from './snapshot';
export interface ServerSnapshotOptions {
    /** React Generated Dir */
    source: string;
    /**
     * Add paths to server-static
     */
    registerStatic: string[];
    /**
     * Destination folder save
     */
    dest: string;
    /**
     * Routes to crawl
     */
    routes: string[];
    /**
     * Auto detect internal links and crawl them
     */
    autoRoutes: boolean;
}
export declare function ServerSnapshot(options: ServerSnapshotOptions): Bluebird<{
    server: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
    snap: Snapshot;
}>;
