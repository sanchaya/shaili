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
} from "../utils/BookResourceUtils.js";
import csvParser from "csv-parser";
import fs from "fs";
import { Languages } from "../db/models/Languages.js";

const isAccessible = (context: ActionContext, role: number[]) => {
    const { currentAdmin } = context;
    return role.includes(currentAdmin?.role);
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

const importBefore = async (request: ActionRequest, context: ActionContext) => {
    const filePath = request.payload?.file.path;
    const result: Books[] = [];

    const parser = fs.createReadStream(filePath).pipe(csvParser());

    for await (const data of parser) {
        if (data.language && data.name && data.identifier && data.url) {
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

export const BookResource = {
    resource: Books,
    options: {
        navigation: menu.Books,
        editProperties: properties,
        listProperties: ["name", "language", "url", "status"],
        showProperties: properties,
        filterProperties: properties,
        timestamps: true,
        properties: {
            status: {
                position: 1,
                availableValues: [
                    { value: "", label: "Select a status", placeholder: true },
                    ...(
                        await BookStatus.findAll({
                            attributes: ["id", "status"],
                        })
                    ).map((status) => ({
                        value: status.id,
                        label: status.status,
                    })),
                ],
            },
        },
        actions: {
            new: { isAccessible: false },
            edit: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, [1, 2]),
            },
            show: {
                before: [beforeBooksShowHook],
            },
            delete: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, [1]),
                before: [BookDeleteBefore],
                handler: [BookDeleteHandler],
            },
            import: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, [1]),
                before: [importBefore],
                handler: [importHandler],
                component: Components.ImportComponentNew,
            },
            export: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, [1]),
            },
            bulkDelete: {
                isAccessible: false,
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
    features: [importExportFeature({ componentLoader })],
};
