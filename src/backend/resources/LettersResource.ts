import { Letters } from "../db/models/Letters.js";
import importExportFeature from "@adminjs/import-export";
import { Components, componentLoader } from "../../frontend/components.js";
import { menu } from "../../common/menu.js";
import { ActionContext } from "adminjs";
import {
    LetterDeleteBefore,
    LetterDeleteHandler,
} from "../utils/LetterResourceUtils.js";

const isAccessible = (context: ActionContext, role: number) => {
    const { currentAdmin } = context;
    return role === currentAdmin?.role;
};

export const LetterResource = {
    resource: Letters,
    options: {
        navigation: menu.Letters,
        listProperties: ["letter", "language", "letter_type", "user_defined"],
        showProperties: [
            "letter",
            "language",
            "letter_type",
            "user_defined",
            "created_by",
            "updated_by",
        ],
        filterProperties: ["letter", "language", "letter_type", "user_defined"],
        actions: {
            bulkDelete: { isAccessible: false },
            list: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
            },
            edit: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
                component: Components.EditLetter,
            },
            show: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
            },
            delete: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
                before: [LetterDeleteBefore],
                handler: [LetterDeleteHandler],
            },
            new: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
                component: Components.AddLetter,
            },
            import: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
            },
            export: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
            },
        },
        properties: {
            language: {
                reference: "languages",
            },
        },
    },
    features: [
        importExportFeature({
            componentLoader,
        }),
    ],
};
