import { Letters } from "../db/models/Letters.js";
import importExportFeature from "@adminjs/import-export";
import { Components, componentLoader } from "../../frontend/components.js";
import { menu } from "../../common/menu.js";
import LettersGroupedList from "../../frontend/components/Letters/LettersGroupedList.js";
import {
    ActionContext,
    ActionQueryParameters,
    ActionRequest,
    flat,
    SortSetter,
    Filter,
    populator,
} from "adminjs";
import {
    LetterDeleteBefore,
    LetterDeleteHandler,
    beforeLettersShowHook,
} from "../utils/LetterResourceUtils.js";
import csvParser from "csv-parser";
import fs from "fs";
import { LetterTypes } from "../db/models/LetterTypes.js";
import { Languages } from "../db/models/Languages.js";
import sequelize, { Op } from "sequelize";
import { canAccess } from "../utils/permissions.js";

const isAccessible = async (context: ActionContext, action: string) => {
    const { currentAdmin } = context;
    return canAccess(currentAdmin?.role, "letters", action);
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
                status: true,
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
        filterProperties: ["letter", "unicode", "language", "letter_type", "user_defined"],
        sort: {
            sortBy: "language",
            direction: "asc",
        },
        actions: {
            bulkDelete: { isAccessible: false },
            list: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "list"),
                handler: async (request, response, context) => {
                    const PER_PAGE_LIMIT = 500;
                    const { query } = request;
                    const {
                        sortBy,
                        direction,
                        filters = {},
                    } = flat.unflatten(query || {}) as ActionQueryParameters;
                    const { resource, _admin } = context;
                    let { page, perPage } = flat.unflatten(
                        query || {}
                    ) as ActionQueryParameters;

                    if (perPage) {
                        perPage =
                            +perPage > PER_PAGE_LIMIT
                                ? PER_PAGE_LIMIT
                                : +perPage;
                    } else {
                        perPage = _admin.options.settings?.defaultPerPage ?? 10;
                    }

                    page = Number(page) || 1;

                    const listProperties = resource
                        .decorate()
                        .getListProperties();
                    const firstProperty = listProperties.find((p) =>
                        p.isSortable()
                    );
                    let sort;
                    if (firstProperty) {
                        sort = SortSetter(
                            { sortBy, direction },
                            firstProperty.name(),
                            resource.decorate().options
                        );
                    }

                    const filter = await new Filter(filters, resource).populate(
                        context
                    );

                    const { currentAdmin } = context;
                    const records = await resource.find(
                        filter,
                        {
                            limit: perPage,
                            offset: (page - 1) * (perPage ? perPage : 10),
                            sort,
                        },
                        context
                    );
                    const populatedRecords = await populator(records, context);

                    context.records = populatedRecords;

                    let total;
                    const isEmpty =
                        filter.filters &&
                        Object.keys(filter.filters).length === 0;
                    if (isEmpty) {
                        total = await Letters.count({
                            where: {
                                letter_type: {
                                    [Op.in]: sequelize.literal(
                                        `(SELECT id FROM letter_types WHERE status = true)`
                                    ),
                                },
                            },
                        });
                    } else {
                        const whereClause: any = {};
                        if (filter.filters?.letter?.value) {
                            whereClause.letter = filter.filters.letter.value;
                        }

                        if (filter.filters?.unicode?.value) {
                            whereClause.unicode = {
                                [Op.like]: `%${filter.filters.unicode.value}%`,
                            };
                        }

                        if (filter.filters?.language?.value) {
                            whereClause.language =
                                filter.filters.language.value;
                        }

                        if (filter.filters?.user_defined?.value) {
                            whereClause.user_defined =
                                filter.filters.user_defined.value;
                        }

                        if (filter.filters?.letter_type?.value) {
                            whereClause.letter_type =
                                filter.filters.letter_type.value;
                        } else {
                            whereClause.letter_type = {
                                [Op.in]: sequelize.literal(
                                    `(SELECT id FROM letter_types WHERE status = true)`
                                ),
                            };
                        }

                        total = await Letters.count({ where: whereClause });
                    }

                    return {
                        meta: {
                            total,
                            perPage,
                            page,
                            direction: sort?.direction,
                            sortBy: sort?.sortBy,
                        },
                        records: populatedRecords.map((r) =>
                            r.toJSON(currentAdmin)
                        ),
                    };
                },
            },
            edit: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "edit"),
                component: Components.EditLetter,
            },
            show: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "show"),
                before: [beforeLettersShowHook],
            },
            delete: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "delete"),
                before: [LetterDeleteBefore],
                handler: [LetterDeleteHandler],
                confirm: {
                    message: "Are you sure you want to delete this letter? This action cannot be undone.",
                },
            },
            new: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "new"),
                component: Components.AddLetter,
            },
            import: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "import"),
                before: [importBefore],
                handler: [importHandler],
                component: Components.ImportComponentNew,
            },
            export: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "export"),
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
                reference: "letter_types",
                components: {
                    filter: Components.LetterTypeInFilter,
                },
            },
            user_defined: {
                availableValues: [
                    { value: "", label: "All", placeholder: true },
                    { value: "0", label: "System Defined" },
                    { value: "1", label: "User Defined" },
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
