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
import { canAccess } from "../utils/permissions.js";

const isAccessible = async (context: ActionContext, action: string) => {
    const { currentAdmin } = context;
    return canAccess(currentAdmin?.role, "letter_types", action);
};

export const LetterTypesResource = {
    resource: LetterTypes,
    options: {
        navigation: menu.AdminTools,
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
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "list"),
            },
            edit: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "edit"),
                before: [LetterTypeEditBefore],
                handler: [LetterTypeEditHandler],
            },
            show: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "show"),
            },
            delete: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "delete"),
                before: [LetterTypeDeleteBefore],
                handler: [LetterTypeDeleteHandler],
            },
            new: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "new"),
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
