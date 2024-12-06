import Users from "../db/models/Users.js";
import { menu } from "../../common/menu.js";
import * as argon2 from "argon2";
import passwordsFeature from "@adminjs/passwords";
import { Components, componentLoader } from "../../frontend/components.js";
import { ActionContext, CurrentAdmin, ListActionResponse } from "adminjs";
import { UserEditHandler, hashPassword } from "../utils/UsersResourceUtils.js";

const isAccessible = (context: ActionContext, role: number) => {
    const { currentAdmin, record, action } = context;
    if (record?.params?.id === currentAdmin?.id && action.name === "edit") {
        return true;
    } else {
        return role === currentAdmin?.role;
    }
};

export const UsersResource = {
    resource: Users,
    features: [
        passwordsFeature({
            properties: {
                password: "newPassword",
                encryptedPassword: "password",
            },
            hash: argon2.hash,
            componentLoader,
        }),
    ],
    options: {
        navigation: menu.Users,
        listProperties: ["name", "email", "role"],
        filterProperties: ["name", "email", "role"],
        showProperties: ["name", "email", "role"],
        editProperties: ["name", "email", "role", "newPassword"],
        newProperties: ["name", "email", "role", "newPassword"],
        properties: {
            password: { isVisible: false },
            newPassword: { isRequired: true },
        },
        actions: {
            list: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
                after: async (
                    response: ListActionResponse,
                    context: { session: CurrentAdmin }
                ) => {
                    let foundIndex = -1;

                    response.records.forEach((record, index) => {
                        if (record.params.id === context.session.adminUser.id) {
                            foundIndex = index;
                        }
                    });

                    if (foundIndex !== -1) {
                        response.records.splice(foundIndex, 1);
                        response.meta.total--;
                    }
                    return response;
                },
            },
            edit: {
                component: Components.UserEditAction,
                isAccessible: (context) => {
                    const { record, currentAdmin } = context;
                    return (
                        record?.params?.id === currentAdmin.id ||
                        currentAdmin?.role === 1
                    );
                },
                before: hashPassword,
                handler: UserEditHandler,
            },
            show: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
            },
            delete: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
            },
            new: {
                isAccessible: (context: ActionContext) =>
                    isAccessible(context, 1),
                before: hashPassword,
            },
            bulkDelete: {
                isAccessible: false,
            },
        },
    },
};
