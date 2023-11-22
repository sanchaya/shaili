import { Letters } from "../db/models/Letters.js";
import importExportFeature from "@adminjs/import-export";
import { Components, componentLoader } from "../../frontend/components.js";
import { menu } from "../../common/menu.js";
import { ActionContext } from "adminjs";
import { LetterTypes } from "../db/models/LetterTypes.js";
import { Languages } from "../db/models/Languages.js";

const isAccessible = (context: ActionContext, role: number) => {
    const { currentAdmin } = context;
    return role === currentAdmin?.role;
};

let types = await LetterTypes.findAll({ attributes: ["id", "type"] });
const availableLetterTypes = types.map((type) => ({
    value: type.id,
    label: type.type,
}));

export const LetterResource = {
    resource: Letters,
    options: {
        navigation: menu.Letters,
        editProperties: ["letter", "language", "letter_type"],
        listProperties: ["letter", "language", "letter_type", "user_defined"],
        filterProperties: ["letter", "language", "letter_type", "user_defined"],
        timestamps: true,
        actions: {
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
            bulkDelete: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
            },
        },
        properties: {
            language: {
                position: 1,
                availableValues: [
                    {
                        value: "",
                        label: "Select a Language",
                        placeholder: true,
                    },
                    ...(
                        await Languages.findAll({
                            attributes: ["language_code", "language"],
                        })
                    ).map((status) => ({
                        value: status.language_code,
                        label: status.language,
                    })),
                ],
            },
            letter_type: {
                availableValues: [
                    {
                        value: "",
                        label: "Select a Letter Type",
                        placeholder: true,
                    },
                    ...availableLetterTypes,
                ],
            },
        },
    },
    features: [
        importExportFeature({
            componentLoader,
        }),
    ],
};
