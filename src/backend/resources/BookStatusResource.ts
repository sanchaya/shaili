import { ActionContext } from "adminjs";
import BookStatus from "../db/models/BookStatus.js";
import { menu } from "../../common/menu.js";
import { canAccess } from "../utils/permissions.js";

const isAccessible = async (context: ActionContext, action: string) => {
    const { currentAdmin } = context;
    return canAccess(currentAdmin?.role, "book_status", action);
};

export const BookStatusResource = {
    resource: BookStatus,
    options: {
        navigation: menu.AdminTools,
        titleProperty: "status",
        properties: { status: { isTitle: true } },
        editProperties: ["id", "status"],
        listProperties: ["id", "status"],
        showProperties: ["id", "status"],
        filterProperties: ["status"],
        actions: {
            new: { isAccessible: async (context: ActionContext) => isAccessible(context, "new") },
            edit: { isAccessible: async (context: ActionContext) => isAccessible(context, "edit") },
            show: { isAccessible: async (context: ActionContext) => isAccessible(context, "show") },
            delete: { isAccessible: async (context: ActionContext) => isAccessible(context, "delete") },
            list: { isAccessible: async (context: ActionContext) => isAccessible(context, "list") },
        },
    },
};