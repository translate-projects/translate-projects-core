export interface FileCache {
    sources: Record<string, string>;
    translations: Record<string, { [key: string]: string }>;
    version: string;
    contentHash?: string;
}

export interface ProjectCache {
    [fileHash: string]: FileCache;
}

export interface Cache {
    [projectHash: string]: ProjectCache;
}

export interface UpdateCacheParams {
    projectHash?: string;
    fileHash: string;
    sources?: Record<string, string>;
    translations?: Partial<Record<string, Record<string, string>>>;
    version?: string;
    contentHash?: string;
}
