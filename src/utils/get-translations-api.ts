import { JsonBase, TypeSimpleJson } from "../types/json"
import { TypeListLang } from "../types/langs"
import { TypeProject } from "../types/type-project"

type TranslationApiConfig = {
    sourceLang: TypeListLang
    targetLang: TypeListLang
    data: TypeSimpleJson | JsonBase,
    apiKey?: string
    typeProject: TypeProject
    route_file?: string
}
export async function getTranslationsApi({ sourceLang, targetLang, data, apiKey, typeProject, route_file }: TranslationApiConfig): Promise<TypeSimpleJson> {

    let url_api = `https://translateprojects.neiderruiz.com/api/general_translations/?source_lang=${sourceLang}&target_lang=${targetLang}`;

    if (typeProject) {
        url_api += `&type_project=${typeProject}`
    }

    if (route_file) {
        url_api += `&route_file=${route_file}`
    }

    const response = await fetch(url_api, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': apiKey ? `Token ${apiKey}` : ''
        },
        body: JSON.stringify(data)
    });

    if (response.status == 524) {
        console.log(' Performing translations... 🌍')
        return await getTranslationsApi({ sourceLang, targetLang, data, apiKey, typeProject, route_file })
    }

    if (response.status != 200 && response.status != 524) {
        throw new Error(`🛑 ${response.status} - Error getting translations: ${response.statusText} 🛑`);
    }

    return await response.json();
}

