import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Cache } from '../../types';

export const getCachePath = (): string => {
    const cacheDir = process.platform === 'win32'
        ? path.join(os.homedir(), 'AppData', 'Roaming', 'translate-projects-core')
        : path.join(os.homedir(), '.config', 'translate-projects-core');

    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }

    return path.join(cacheDir, 'cache.json');
};

export const loadCache = (): Cache => {
    const cachePath = getCachePath();
    if (fs.existsSync(cachePath)) {
        const cacheData = fs.readFileSync(cachePath, 'utf-8');
        return JSON.parse(cacheData) as Cache;
    }
    return {};
};

export const saveCache = (cache: Cache): void => {
    const cachePath = getCachePath();
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 4), 'utf-8');
};
