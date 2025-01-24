import fs from 'fs';

export const readJsonFile = (filePath: string) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonContent = JSON.parse(data);
        return jsonContent;
    } catch (error) {
        console.error(`Error reading JSON file: ${error}`);
        return null;
    }
}