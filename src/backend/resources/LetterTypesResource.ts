import { menu } from "../../common/menu.js";
import { ActionContext } from "adminjs";
import { LetterTypes } from "../db/models/LetterTypes.js";
import {
    LetterTypeCreateBefore,
    LetterTypeCreateHandler,
    LetterTypeDeleteBefore,
    LetterTypeDeleteHandler,
    LetterTypeEditBefore,
    LetterTypeEditHandler,
} from "../utils/LetterTypesResourceUtils.js";
import { Components } from "../../frontend/components.js";

const isAccessible = (context: ActionContext, role: number) => {
    const { currentAdmin } = context;
    return role === currentAdmin?.role;
};

export const LetterTypesResource = {
    resource: LetterTypes,
    options: {
        navigation: menu.LettersType,
        editProperties: ["type", "language"],
        listProperties: ["type", "language", "status"],
        showProperties: ["type", "language", "created_by", "updated_by"],
        filterProperties: ["type", "language", "status"],
        timestamps: true,
        sort: {
            sortBy: "language",
        },
        actions: {
            bulkDelete: { isAccessible: false },
            list: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
            },
            edit: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
                before: [LetterTypeEditBefore],
                handler: [LetterTypeEditHandler],
            },
            show: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
            },
            delete: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
                before: [LetterTypeDeleteBefore],
                handler: [LetterTypeDeleteHandler],
            },
            new: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
                before: [LetterTypeCreateBefore],
                handler: [LetterTypeCreateHandler],
            },
        },
        properties: {
            language: {
                reference: "languages",
            },
            status: {
                components: {
                    list: Components.LetterTypeStatus,
                },
                availableValues: [
                    { value: "", label: "All", placeholder: true },
                    { value: "true", label: "Active" },
                    { value: "false", label: "Inactive" },
                ],
            },
        },
    },
};
