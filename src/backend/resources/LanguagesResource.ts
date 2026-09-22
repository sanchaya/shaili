import { menu } from "../../common/menu.js";
import { ActionContext } from "adminjs";
import { Languages } from "../db/models/Languages.js";
import {
    LanguageCreateBefore,
    LanguageCreateHandler,
    LanguageDeleteBefore,
    LanguageDeleteHandler,
    LanguageEditBefore,
    LanguageEditHandler,
} from "../utils/LanguageResourceUtils.js";
import { Components } from "../../frontend/components.js";
import { canAccess } from "../utils/permissions.js";

const isAccessible = async (context: ActionContext, action: string) => {
    const { currentAdmin } = context;
    return canAccess(currentAdmin?.role, "languages", action);
};

const beforeLanguagesShowHook = (request, context) => {
    const { record } = context;
    const values = record.params;

    for (let key in values) {
        if (values[key] === "" || values[key] === null) {
            values[key] = "-";
        }
    }
    return context;
};

const afterLanguagesListHook = (response) => {
    response.records.forEach((record) => {
        record.params.alt_lang_code = record.params.alt_lang_code || "-";
        record.params.description = record.params.description || "-";
    });
    return response;
};

export const LanguagesResource = {
    resource: Languages,
    options: {
        navigation: menu.Languages,
        editProperties: [
            "language",
            "language_code",
            "alt_lang_code",
            "description",
            "script",
            "unicode_range",
            "unicode_version",
            "direction",
            "sample_text",
            "native_name",
            "iso_639_1",
            "iso_639_2",
            "iso_639_3",
            "speaker_count",
            "official_status",
            "font_recommendations",
            "ipa_supported",
            "ipa_sample",
        ],
        listProperties: [
            "language",
            "language_code",
            "script",
            "native_name",
            "iso_639_1",
            "official_status",
            "ipa_supported",
            "ipa_sample",
        ],
        showProperties: [
            "language",
            "language_code",
            "alt_lang_code",
            "description",
            "script",
            "unicode_range",
            "unicode_version",
            "direction",
            "sample_text",
            "native_name",
            "iso_639_1",
            "iso_639_2",
            "iso_639_3",
            "speaker_count",
            "official_status",
            "font_recommendations",
            "ipa_supported",
            "ipa_sample",
        ],
        filterProperties: ["language", "language_code", "alt_lang_code", "script", "iso_639_1", "official_status"],
        actions: {
            bulkDelete: { isAccessible: false },
            list: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "list"),
                after: [afterLanguagesListHook],
            },
            new: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "new"),
                before: [LanguageCreateBefore],
                handler: [LanguageCreateHandler],
            },
            edit: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "edit"),
                before: [LanguageEditBefore],
                handler: [LanguageEditHandler],
            },
            delete: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "delete"),
                before: [LanguageDeleteBefore],
                handler: [LanguageDeleteHandler],
            },
            show: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "show"),
                before: [beforeLanguagesShowHook],
                component: Components.LanguageShow,
            },
        },
    },
};
