import importExportFeature from "@adminjs/import-export";
import {
    ActionContext,
    ActionRequest,
    ActionResponse,
    BaseRecord,
    CurrentAdmin,
} from "adminjs";
import { Components, componentLoader } from "../../frontend/components.js";
import { Books } from "../db/models/Books.js";
import BookStatus from "../db/models/BookStatus.js";
import { menu } from "../../common/menu.js";
import {
    BookDeleteBefore,
    BookDeleteHandler,
    BookEditBefore,
} from "../utils/BookResourceUtils.js";
import csvParser from "csv-parser";
import fs from "fs";
import { Languages } from "../db/models/Languages.js";
import { Op } from "sequelize";
import { canAccess } from "../utils/permissions.js";

const isAccessible = async (context: ActionContext, action: string) => {
    const { currentAdmin } = context;
    return canAccess(currentAdmin?.role, "books", action);
};

const beforeBooksShowHook = (request, context) => {
    const { record } = context;
    const values = record.params;

    for (let key in values) {
        if (values[key] === "" || values[key] === null) {
            values[key] = "-";
        }
    }
    return context;
};

const properties = [
    "name",
    "language",
    "url",
    "identifier",
    "author_name",
    "publisher_name",
    "published_year",
    "publisher_city",
    "printer_location",
    "printer_name",
    "status",
];

const trimAndNullify = (value: string | undefined | null): string | null => {
    return value && value.trim() !== ""
        ? value.replace(/\s+/g, " ").trim()
        : null;
};

const importBefore = async (request: ActionRequest, context: ActionContext) => {
    const filePath = request.payload?.file.path;
    const result: Books[] = [];

    const parser = fs.createReadStream(filePath).pipe(csvParser());

    for await (const data of parser) {
        if (data.language && data.name && data.identifier && data.url) {
            data.published_year = trimAndNullify(data.published_year);
            data.publisher_city = trimAndNullify(data.publisher_city);
            data.publisher_name = trimAndNullify(data.publisher_name);
            data.author_name = trimAndNullify(data.author_name);
            data.printer_location = trimAndNullify(data.printer_location);
            data.printer_name = trimAndNullify(data.printer_name);
            const existsBooks = await Books.findOne({
                where: {
                    [Op.or]: [
                        { name: data.name },
                        { identifier: data.identifier },
                        { url: data.url },
                    ],
                },
            });

            if (!existsBooks) {
                const language = await Languages.findOne({
                    where: { language_code: data.language.toLowerCase() },
                });
                data.name = data.name.replace(/\s+/g, " ").trim();
                if (language) {
                    data.language = data.language.toLowerCase();
                    result.push(data);
                }
            }
        }
    }

    return { request, context, result };
};

const importHandler = async (props) => {
    const records = await Books.bulkCreate(props.result);
    const { context } = props;
    const { resource, h } = context;
    const createdRecords = records.map((record) => record.dataValues.name);

    if (records) {
        return {
            redirectUrl: h.resourceUrl({
                resourceId: resource._decorated?.id() || resource.id(),
            }),
            notice: {
                message:
                    createdRecords.length == 1
                        ? createdRecords.length + " Book added"
                        : createdRecords.length + " Books added",
                type: "success",
            },
            createdRecords: createdRecords.length,
        };
    }
};

// Helper to get status options
const getStatusOptions = async () => {
    const statuses = await BookStatus.findAll({ attributes: ["id", "status"] });
    const options = [
        { value: "", label: "Select a status", placeholder: true },
    ];
    for (const status of statuses) {
        options.push({ value: String(status.id), label: status.status, placeholder: false });
    }
    return options;
};

export const BookResource = {
    resource: Books,
    options: {
        navigation: menu.Books,
        editProperties: properties,
        listProperties: ["thumbnail", "name", "language", "author_name", "publisher_name", "published_year", "status"],
        showProperties: [...properties, "thumbnail"],
        filterProperties: properties,
        timestamps: true,
        sort: {
            sortBy: "language",
            direction: "asc",
        },
        properties: {
            thumbnail: {
                type: "string",
                isVisible: { list: true, show: false, edit: false, filter: false },
                components: {
                    list: Components.BookThumbnail,
                },
            },
            status: {
                position: 1,
                availableValues: [
                    { value: "", label: "Select a status", placeholder: true },
                ],
            },
            language: {
                reference: "languages",
            },
        },
        actions: {
            new: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "new"),
                before: [BookEditBefore],
            },
            edit: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "edit"),
                before: [BookEditBefore],
                isModal: true,
            },
            show: {
                before: [beforeBooksShowHook],
            },
            delete: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "delete"),
                before: [BookDeleteBefore],
                handler: [BookDeleteHandler],
                confirm: {
                    message: "Are you sure you want to delete this book? This action cannot be undone and will also delete all associated tags and comments.",
                },
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
            bulkDelete: {
                isAccessible: false,
            },
            list: {
                isAccessible: (_: any, __: any) => true,
                before: [async (request, context) => {
                    return request;
                }],
            },
            ViewBook: {
                actionType: "record",
                component: Components.ViewBook,
                icon: "Eye",
                handler: (
                    _request: ActionRequest,
                    _response: ActionResponse,
                    context: {
                        record: BaseRecord | undefined;
                        currentAdmin: CurrentAdmin;
                    }
                ) => {
                    const { record, currentAdmin } = context;
                    return {
                        record: record?.toJSON(currentAdmin),
                    };
                },
            },
        },
    },
    // Initialize status options after AdminJS is ready
    async afterInit() {
        const statusOptions = await getStatusOptions();
        this.options.properties.status.availableValues = statusOptions;
    }
};
