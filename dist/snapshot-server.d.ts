import 'core-js/actual/structured-clone';
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
export declare function ServerSnapshot(options: ServerSnapshotOptions): void;
