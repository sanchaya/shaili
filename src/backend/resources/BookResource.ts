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
