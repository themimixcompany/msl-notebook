export declare const resolve: (...pathSegments: string[]) => string;
export declare const isAbsolute: (p: string) => boolean;
/** Only call this on normalized paths */
export declare const join: (...paths: string[]) => string;
/** Only call this on normalized paths */
export declare const relative: (from: string, to: string) => string;
export { dirname } from 'path';
