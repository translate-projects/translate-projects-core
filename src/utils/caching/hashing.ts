import * as fs from 'fs';
import {
  Cache,
  FileCache,
  ProjectCache,
  TypeSimpleJson,
  UpdateCacheParams,
} from '../../types';
import { generateHashText } from '../generate-hash-text';
import { loadCache, saveCache } from './cache';

/**
 * Processes a file and updates (or checks) its cache information.
 * @param filePath Absolute path of the file.
 * @param jsonData Json with Data to generate contentHash.
 * @returns Object with content hash, name hash, existence flag, version, sources, and translations.
 */
type ProcessFileHashCacheOptions = {
  filePath: string;
  jsonData?: TypeSimpleJson;
};
export async function processFileHashCache({
  filePath,
  jsonData,
}: ProcessFileHashCacheOptions): Promise<{
  contentHash: string;
  nameHash: string;
  exist: boolean;
  version: string;
  sources: Record<string, string>;
  translations: Record<string, { [key: string]: string }>;
}> {
  const cache: Cache = loadCache();
  const projectHash = await getProjectHashFromPath();

  if (!cache[projectHash]) {
    cache[projectHash] = {};
  }

  let nameFileHash: string;
  let contentHash: string;

  if (!jsonData) {
    nameFileHash = await generateHashText(filePath);
    const data = fs.readFileSync(filePath, 'utf-8');
    contentHash = await generateHashText(data);
  }

  if (jsonData) {
    nameFileHash = await generateHashText(filePath);
    contentHash = await generateHashText(JSON.stringify(jsonData));
  }

  const projectCache = cache[projectHash];

  if (
    projectCache[nameFileHash] &&
    projectCache[nameFileHash].contentHash === contentHash
  ) {
    return {
      contentHash,
      nameHash: nameFileHash,
      exist: true,
      version: projectCache[nameFileHash].version,
      sources: projectCache[nameFileHash].sources,
      translations: projectCache[nameFileHash].translations,
    };
  }

  const newVersion = new Date().toISOString();

  projectCache[nameFileHash] = {
    sources: {},
    translations: {},
    version: newVersion,
    contentHash,
  };

  saveCache(cache);

  return {
    contentHash,
    nameHash: nameFileHash,
    exist: false,
    version: newVersion,
    sources: projectCache[nameFileHash].sources,
    translations: projectCache[nameFileHash].translations,
  };
}

/**
 * Updates the file cache with new sources, translations, or version.
 * @param params Object containing fileHash, sources, translations, and version.
 */
export const updateFileCache = async (
  params: UpdateCacheParams
): Promise<void> => {
  const { fileHash, sources, translations, version } = params;
  const cache: Cache = loadCache();
  const projectHash = await getProjectHashFromPath();

  if (!cache[projectHash]) {
    cache[projectHash] = {};
  }

  if (!cache[projectHash][fileHash]) {
    cache[projectHash][fileHash] = {
      sources: {},
      translations: {},
      version: '',
    };
  }

  const fileCache: FileCache = cache[projectHash][fileHash];

  if (sources) {
    fileCache.sources = { ...fileCache.sources, ...sources };
  }

  if (translations) {
    for (const lang in translations) {
      fileCache.translations[lang] = {
        ...fileCache.translations[lang],
        ...translations[lang],
      };
    }
  }

  if (version) {
    fileCache.version = version;
  }

  saveCache(cache);
};

/**
 * Retrieves project information from the cache.
 * @param projectHash Project identifier.
 * @returns Project data or null if not found.
 */
export const getProjectInfo = (projectHash: string): ProjectCache | null => {
  const cache: Cache = loadCache();
  return cache[projectHash] || null;
};

/**
 * Generates a hash based on the project's root directory.
 * @returns Project hash.
 */
export const getProjectHashFromPath = async (): Promise<string> => {
  const projectDir = process.cwd();
  return generateHashText(projectDir);
};
