import { TypeSimpleJson } from '../types';
import { generateHashText } from './generate-hash-text';

export const assignHashKeysJson = async (jsonFlatten: any) => {
  const result: TypeSimpleJson = {};
  for (const key in jsonFlatten) {
    const text = jsonFlatten[key].trim();
    // generate key based on text
    let currentKey = await generateHashText(key);

    if (await generateHashText(text) !== currentKey) {
      // if key is not the same as text, add text to key
      currentKey = key;
    }
    result[currentKey] = text;
  }

  return result;
};
