import fs from 'fs';
import { Logger } from './logger';

export const readJsonFile = (filePath: string) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonContent = JSON.parse(data);
        return jsonContent;
    } catch (error) {
        Logger.error(`Error reading JSON file: ${error}`);
        return null;
    }
}