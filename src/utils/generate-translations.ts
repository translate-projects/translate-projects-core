import { JsonBase, TypeSimpleJson } from '../types/json';
import { TypeListLang } from '../types/langs';
import { TypeProject } from '../types/type-project';
import Api, { ApiResponse } from './api';
import { Logger } from './logger';
import { progressBar } from './progress-bar';

type TranslationApiConfig = {
  sourceLang: TypeListLang;
  data: TypeSimpleJson | JsonBase;
  apiKey?: string;
  typeProject: TypeProject;
  route_file?: string;
  cache_hash?: string;
};

export const syncResources = async ({
  sourceLang,
  data,
  apiKey,
  typeProject,
  route_file,
  cache_hash,
}: TranslationApiConfig): Promise<ApiResponse<TypeSimpleJson>> => {
  const api = new Api(apiKey);

  const response_sync = await api.syncSources({
    sourceLang,
    data,
    typeProject,
    route_file,
    cache_hash,
  });

  const data_sync = response_sync?.data;

  if (!data_sync?.task_id) {
    await Logger.error('Error syncing sources');
    return null;
  }

  await progressBar(data_sync.task_id);
};

type MakeTranslationsApiConfig = {
  apiKey: string;
  sourceLang: TypeListLang;
  targetLang: TypeListLang;
  route_file?: string;
  cache_hash?: string;
};

export const makeTranslations = async ({
  apiKey,
  sourceLang,
  targetLang,
  route_file,
  cache_hash,
}: MakeTranslationsApiConfig) => {
  const api = new Api(apiKey);

  const response_make = await api.makeTranslations({
    sourceLang,
    targetLang,
    route_file,
    cache_hash,
  });

  const data_make = response_make?.data;

  if (!data_make?.task_id) {
    await Logger.error('Error making translations');
    return null;
  }

  await progressBar(data_make.task_id);

  const result = await api.getTranslations({
    target_lang: targetLang,
  });

  if (!result.data) {
    await Logger.error('Error fetching translations');
    return null;
  }

  return result.data;
};

type GetTranslationsApiConfig = {
  apiKey: string;
  targetLang: TypeListLang;
};

export const getTranslations = async ({
  apiKey,
  targetLang,
}: GetTranslationsApiConfig): Promise<ApiResponse<TypeSimpleJson>> => {
  const api = new Api(apiKey);

  const result = await api.getTranslations({
    target_lang: targetLang,
  });

  if (!result.data) {
    await Logger.error('Error fetching translations');
    return null;
  }

  return result.data;
};

type ValidateChangesFilesApiConfig = {
  apiKey: string;
  data: any;
};

export const validateChangesFiles = async ({
  apiKey,
  data,
}: ValidateChangesFilesApiConfig): Promise<ApiResponse<TypeSimpleJson>> => {
  const api = new Api(apiKey);

  const response = await api.validateChangesFiles({
    data,
  });

  return response;
};
