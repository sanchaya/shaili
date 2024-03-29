import { Letters } from "../db/models/Letters.js";
import importExportFeature from "@adminjs/import-export";
import { Components, componentLoader } from "../../frontend/components.js";
import { menu } from "../../common/menu.js";
import { ActionContext, ActionRequest } from "adminjs";
import {
    LetterDeleteBefore,
    LetterDeleteHandler,
    beforeLettersShowHook,
} from "../utils/LetterResourceUtils.js";
import csvParser from "csv-parser";
import fs from "fs";
import { LetterTypes } from "../db/models/LetterTypes.js";
import { Languages } from "../db/models/Languages.js";

const isAccessible = (context: ActionContext, role: number) => {
    const { currentAdmin } = context;
    return role === currentAdmin?.role;
};

const getLetterTypeId = async (lettertype, language, currentAdmin) => {
    const letterType = await LetterTypes.findOne({
        where: { type: lettertype, language: language },
    });

    if (letterType) {
        return letterType?.dataValues.id;
    } else {
        const language_record = await Languages.findOne({
            where: { language_code: language },
        });

        if (language_record) {
            const newLetterType = await LetterTypes.create({
                type: lettertype,
                language: language,
                created_by: currentAdmin.id,
                updated_by: currentAdmin.id,
            });

            return newLetterType.dataValues.id;
        }
        return null;
    }
};

const importBefore = async (request: ActionRequest, context: ActionContext) => {
    const filePath = request.payload?.file.path;
    const result: Letters[] = [];
    const { currentAdmin } = context;

    const getLetterTypeIdAsync = async (
        letterType: string,
        language: string
    ) => {
        return await getLetterTypeId(letterType, language, currentAdmin);
    };

    const parser = fs.createReadStream(filePath).pipe(csvParser());

    for await (const data of parser) {
        if (data.letter && data.letter_type && data.language) {
            data.letter = data.letter.replace(/\s+/g, " ").trim();
            data.letter_type = data.letter_type.replace(/\s+/g, " ").trim();
            data.language = data.language
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim();
            const letter = await Letters.findOne({
                where: { letter: data.letter },
            });

            if (!letter) {
                const letterType = await getLetterTypeIdAsync(
                    data.letter_type,
                    data.language
                );

                if (letterType !== null) {
                    data.letter_type = letterType;
                    data.created_by = currentAdmin?.id;
                    data.updated_by = currentAdmin?.id;
                    data.unicode = data.unicode ? data.unicode : null;
                    data.user_defined = 0;
                    result.push(data);
                }
            }
        }
    }

    return { request, context, result };
};

const importHandler = async (props) => {
    try {
        const records = await Letters.bulkCreate(props.result);
        const { context } = props;
        const { resource, h } = context;
        const createdRecords = records.map(
            (record) => record.dataValues.letter
        );
        if (records) {
            return {
                redirectUrl: h.resourceUrl({
                    resourceId: resource._decorated?.id() || resource.id(),
                }),
                notice: {
                    message:
                        createdRecords.length == 1
                            ? createdRecords.length + " Letter added"
                            : createdRecords.length + " Letters added",
                    type: "success",
                },
                createdRecords: createdRecords.length,
            };
        }
    } catch (error) {
        return {
            notice: {
                message: "Something went wrong try again later.",
                type: "error",
            },
        };
    }
};

export const LetterResource = {
    resource: Letters,
    options: {
        navigation: menu.Letters,
        listProperties: [
            "letter",
            "unicode",
            "language",
            "letter_type",
            "user_defined",
        ],
        showProperties: [
            "letter",
            "unicode",
            "language",
            "letter_type",
            "user_defined",
            "created_by",
            "updated_by",
        ],
        filterProperties: ["letter", "unicode", "letter_type", "user_defined"],
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
                before: [beforeLettersShowHook],
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
                before: [importBefore],
                handler: [importHandler],
                component: Components.ImportComponentNew,
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
            unicode: {
                components: {
                    list: Components.LettersInList,
                },
            },
            letter_type: {
                components: {
                    filter: Components.LetterTypeInFilter,
                },
            },
        },
    },
    features: [
        importExportFeature({
            componentLoader,
        }),
    ],
};
