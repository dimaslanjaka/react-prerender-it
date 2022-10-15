import 'core-js/actual/structured-clone';
import express from 'express';
import { Snapshot } from './snapshot';
export interface ServerSnapshotOptions {
    /** React Generated Dir */
    source: string;
    /**
     * Add paths to server-static
     */
    registerStatic?: string[];
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
    autoRoutes?: boolean;
    callback?: (resolved: {
        server: ReturnType<ReturnType<typeof express>['listen']>;
        snap: Snapshot;
    }) => any;
}
export declare function ServerSnapshot(options: ServerSnapshotOptions): void;
