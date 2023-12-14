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

const isAccessible = (context: ActionContext, role: number) => {
    const { currentAdmin } = context;
    return role === currentAdmin?.role;
};

export const LanguagesResource = {
    resource: Languages,
    options: {
        navigation: menu.Languages,
        editProperties: ["language", "language_code"],
        listProperties: ["language", "language_code"],
        showProperties: ["language", "language_code"],
        filterProperties: ["language", "language_code"],
        actions: {
            bulkDelete: { isAccessible: false },
            list: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
            },
            new: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
                before: [LanguageCreateBefore],
                handler: [LanguageCreateHandler],
            },
            edit: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
                before: [LanguageEditBefore],
                handler: [LanguageEditHandler],
            },
            delete: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
                before: [LanguageDeleteBefore],
                handler: [LanguageDeleteHandler],
            },
            show: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
            },
        },
    },
};
