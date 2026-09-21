import { ActionContext } from "adminjs";
import BookStatus from "../db/models/BookStatus.js";
import { menu } from "../../common/menu.js";

const isAccessible = (context: ActionContext, role: number[]) => {
    const { currentAdmin } = context;
    return role.includes(currentAdmin?.role);
};

export const BookStatusResource = {
    resource: BookStatus,
    options: {
        navigation: menu.Books,
        editProperties: ["id", "status"],
        listProperties: ["id", "status"],
        showProperties: ["id", "status"],
        filterProperties: ["status"],
        actions: {
            new: { isAccessible: (context: ActionContext) => isAccessible(context, [1]) },
            edit: { isAccessible: (context: ActionContext) => isAccessible(context, [1]) },
            show: { isAccessible: (context: ActionContext) => isAccessible(context, [1]) },
            delete: { isAccessible: (context: ActionContext) => isAccessible(context, [1]) },
            list: { isAccessible: (context: ActionContext) => isAccessible(context, [1]) },
        },
    },
};