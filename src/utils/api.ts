import { JsonBase, TypeListLang, TypeProject, TypeSimpleJson } from '../types';
import { Logger } from './logger';

const API_BASE_URL = 'https://translateprojects.dev';

export type ApiResponse<T> = {
  data?: T;
  status: string;
  message: string;
  error?: string;
  code?: number;
};

type TranslationParams = {
  source_lang: string;
  target_lang: string;
  route_file?: string;
  cache_hash?: string;
};

type TranslationApiConfig = {
  sourceLang: TypeListLang;
  targetLang: TypeListLang;
  route_file?: string;
  cache_hash?: string;
};

type GetTranslationParams = {
  target_lang: string;
};

type SyncSourcesParams = {
  sourceLang: TypeListLang;
  data: TypeSimpleJson | JsonBase;
  typeProject: TypeProject;
  route_file: string;
  cache_hash?: string;
};

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const result = await response.json();
    return result.message || 'Unknown error';
  } catch (e) {
    return 'Error on updating translation data';
  }
};

class Api {
  private baseUrl: string;
  private token: string | null;
  private headers: Record<string, string>;

  constructor(token: string | null = null) {
    this.baseUrl = API_BASE_URL.replace(/\/$/, '');
    this.token = token;
    this.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (this.token) {
      this.headers['Authorization'] = `Token ${this.token}`;
    }
  }

  private async makeRequest<T>(
    method: RequestMethod,
    endpoint: string,
    params: Record<string, any> = {},
    data: any = null,
    retries: number = 3
  ): Promise<ApiResponse<T> | null> {
    let url = new URL(`${this.baseUrl}${endpoint}`);
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key])
    );

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url.toString(), {
          method,
          headers: this.headers,
          body: data ? JSON.stringify(data) : null,
        });

        if (response.status === 200) {
          return (await response.json()) as ApiResponse<T>;
        } else if (response.status === 524 || response.status === 504) {
          await Logger.warning(
            `🛑 Warning: Timeout detected (attempt ${attempt + 1}/${retries}). Retrying...`
          );
          continue;
        } else {
          const errorMessage = await getErrorMessage(response);
          await Logger.error(
            `🛑 API Error (${response.status}): ${errorMessage}`
          );
          return null;
        }
      } catch (error) {
        await Logger.error(
          `Request failed: ${(error as Error).message} (attempt ${attempt + 1}/${retries})`
        );
      }
    }

    await Logger.error('Max retries reached. Request failed.');
    return null;
  }

  async makeTranslations(
    config: TranslationApiConfig
  ): Promise<ApiResponse<any> | null> {
    const params: TranslationParams = {
      source_lang: config.sourceLang,
      target_lang: config.targetLang,
    };
    if (config.route_file) params.route_file = config.route_file;
    if (config.cache_hash) params.cache_hash = config.cache_hash;

    return await this.makeRequest<any>('POST', '/v1/translations/', params);
  }

  async fetchTranslations(
    params: Record<string, any> = {}
  ): Promise<ApiResponse<any> | null> {
    return await this.makeRequest<any>('GET', '/v1/translations/list', params);
  }

  async syncSources(data: SyncSourcesParams): Promise<ApiResponse<any> | null> {
    const params: any = {
      source_lang: data?.sourceLang,
      route_file: data?.route_file,
      type_project: data?.typeProject,
    };

    if (data?.cache_hash) params.cache_hash = data?.cache_hash;

    return await this.makeRequest<any>(
      'POST',
      '/v1/translations/load-sources',
      params,
      data.data
    );
  }

  async getTranslations({
    target_lang,
  }: GetTranslationParams): Promise<ApiResponse<any> | null> {
    const params = {
      target_lang: target_lang,
    };
    return await this.makeRequest<any>(
      'GET',
      '/v1/translations/language-project',
      params
    );
  }

  async validateChangesFiles({ data }): Promise<ApiResponse<any> | null> {
    return await this.makeRequest<any>(
      'POST',
      '/v1/translations/validate-changes-files',
      {},
      data
    );
  }
}

export default Api;
