import { ActionContext } from "adminjs";
import { menu } from "../../common/menu.js";
import { Comments } from "../db/models/Comments.js";
import { Components } from "../../frontend/components.js";
import { canAccess } from "../utils/permissions.js";

const isAccessible = async (context: ActionContext, action: string) => {
    const { currentAdmin } = context;
    return canAccess(currentAdmin?.role, "comments", action);
};

export const CommentsResource = {
    resource: Comments,
    options: {
        sort: {
            sortBy: "created_at",
            direction: "desc",
        },
        navigation: menu.Comments,
        listProperties: ["book", "commented_by", "comment"],
        filterProperties: ["book", "commented_by", "comment"],
        showProperties: ["book", "commented_by", "comment", "created_at"],
        properties: {
            comment: {
                components: {
                    list: Components.SingleCommentInList,
                    show: Components.SingleCommentInList,
                },
            },
        },
        actions: {
            new: { isAccessible: false },
            edit: { isAccessible: false },
            bulkDelete: { isAccessible: false },
            list: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "list"),
            },
            show: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "show"),
            },
            delete: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "delete"),
            },
        },
    },
};
