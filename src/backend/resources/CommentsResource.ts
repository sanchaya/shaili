import { ActionContext } from "adminjs";
import { menu } from "../../common/menu.js";
import { Comments } from "../db/models/Comments.js";
import { Components } from "../../frontend/components.js";

const isAccessible = (context: ActionContext, role: number) => {
    const { currentAdmin } = context;
    return role === currentAdmin?.role;
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
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
            },
            show: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
            },
            delete: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
            },
        },
    },
};
