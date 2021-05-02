export interface Config {
    configPath: string;
    include?: string[];
    exclude?: string[];
    allowJs?: boolean;
    baseUrl?: string;
    paths?: {
        [path: string]: string[];
    };
    outDir?: string;
}
export declare function loadConfig(cwd: string): Config | undefined;
