import { menu } from "../../common/menu.js";
import { ActionContext } from "adminjs";
import { LetterTypes } from "../db/models/LetterTypes.js";

const isAccessible = (context: ActionContext, role: number) => {
    const { currentAdmin } = context;
    return role === currentAdmin?.role;
};

export const LetterTypesResource = {
    resource: LetterTypes,
    options: {
        navigation: menu.LettersType,
        editProperties: ["type", "language"],
        listProperties: ["type", "language"],
        showProperties: ["type", "language"],
        filterProperties: ["type", "language"],
        timestamps: true,
        actions: {
            bulkDelete: { isAccessible: false },
            list: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
            },
            edit: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
            },
            show: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
            },
            delete: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
            },
            new: {
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
};
