/// <reference types="node" />
import { Page } from 'puppeteer';
/**
 *
 * @param opt
 */
export declare const preloadResources: (opt: {
    page: Page;
    basePath: string;
}) => {
    ajaxCache: {};
    http2PushManifestItems: any[];
};
interface ParamFix {
    page: Page;
}
/**
 *
 * @param opt
 * @return Promise
 */
export declare const removeBlobs: (opt: ParamFix) => Promise<void>;
export declare const fixInsertRule: ({ page }: ParamFix) => Promise<void>;
/**
 * fix form fields
 * @param param0
 * @returns
 */
export declare const fixFormFields: ({ page }: ParamFix) => Promise<void>;
export declare const captureHyperlinks: ({ page }: ParamFix) => Promise<string[]>;
interface ScreenshotParam {
    page: Page;
    filePath: string;
    route: string;
}
export declare const saveAsPng: ({ page, filePath, route }: ScreenshotParam) => Promise<string | Buffer>;
export interface FixChunksOptions {
    http2PushManifest?: boolean;
    inlineCss?: boolean;
    basePath: string;
    page: Page;
}
export declare const fixWebpackChunksIssue1: ({ page, basePath, http2PushManifest, inlineCss }: FixChunksOptions) => Promise<void>;
export declare const fixWebpackChunksIssue2: ({ page, basePath, http2PushManifest, inlineCss }: FixChunksOptions) => Promise<void>;
export declare const fixParcelChunksIssue: ({ page, basePath, http2PushManifest, inlineCss }: FixChunksOptions) => Promise<void>;
export {};
