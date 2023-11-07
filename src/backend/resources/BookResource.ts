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

const isAccessible = (context: ActionContext, role: number[]) => {
    const { currentAdmin } = context;
    return role.includes(currentAdmin?.role);
};

export const BookResource = {
    resource: Books,
    options: {
        navigation: menu.Books,
        editProperties: [
            "name",
            "publisher_name",
            "published_year",
            "url",
            "status",
        ],
        listProperties: ["name", "publisher_name", "published_year", "status"],
        showProperties: ["name", "publisher_name", "published_year", "status"],
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
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, [1]),
            },
            delete: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, [1]),
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
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, [1]),
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
