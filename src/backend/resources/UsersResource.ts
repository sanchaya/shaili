import Users from "../db/models/Users.js";
import { menu } from "../../common/menu.js";
import * as argon2 from "argon2";
import passwordsFeature from "@adminjs/passwords";
import { Components, componentLoader } from "../../frontend/components.js";
import { ActionContext } from "adminjs";
import { ForeignKeyConstraintError } from "sequelize";
import { UserEditHandler, hashPassword } from "../utils/UsersResourceUtils.js";
import { canAccess } from "../utils/permissions.js";

const isAccessible = async (context: ActionContext, action: string) => {
    const { currentAdmin, record } = context;
    if (record?.params?.id === currentAdmin?.id && action === "edit") {
        return true;
    }
    return canAccess(currentAdmin?.role, "users", action);
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
        navigation: menu.AdminTools,
        listProperties: ["name", "email", "role", "organization", "location"],
        filterProperties: ["name", "email", "role", "organization", "location"],
        showProperties: [
            "name",
            "email",
            "role",
            "bio",
            "phone",
            "organization",
            "location",
            "website",
            "github_url",
            "linkedin_url",
            "preferred_language",
            "timezone",
            "is_google_sign_on",
            "is_active",
        ],
        editProperties: [
            "name",
            "email",
            "role",
            "newPassword",
            "bio",
            "phone",
            "organization",
            "location",
            "website",
            "github_url",
            "linkedin_url",
            "preferred_language",
            "timezone",
        ],
        newProperties: ["name", "email", "role", "newPassword"],
        properties: {
            password: { isVisible: false },
            newPassword: { isRequired: true },
            bio: {
                type: "textarea",
                props: {
                    rows: 3,
                },
            },
            avatar_url: {
                isVisible: { show: true, edit: false, list: false, filter: false },
            },
            preferred_language: {
                availableValues: [
                    { value: "eng", label: "English" },
                    { value: "hin", label: "Hindi" },
                    { value: "ben", label: "Bengali" },
                    { value: "tel", label: "Telugu" },
                    { value: "mar", label: "Marathi" },
                    { value: "tam", label: "Tamil" },
                    { value: "urd", label: "Urdu" },
                    { value: "guj", label: "Gujarati" },
                    { value: "kan", label: "Kannada" },
                    { value: "mal", label: "Malayalam" },
                    { value: "ori", label: "Odia" },
                    { value: "pan", label: "Punjabi" },
                    { value: "asm", label: "Assamese" },
                    { value: "san", label: "Sanskrit" },
                ],
            },
            timezone: {
                availableValues: [
                    { value: "Asia/Kolkata", label: "India (IST)" },
                    { value: "America/New_York", label: "Eastern Time (ET)" },
                    { value: "America/Chicago", label: "Central Time (CT)" },
                    { value: "America/Denver", label: "Mountain Time (MT)" },
                    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
                    { value: "Europe/London", label: "London (GMT)" },
                    { value: "Europe/Berlin", label: "Berlin (CET)" },
                    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
                    { value: "Asia/Shanghai", label: "Shanghai (CST)" },
                    { value: "Asia/Dubai", label: "Dubai (GST)" },
                    { value: "Australia/Sydney", label: "Sydney (AEST)" },
                ],
            },
        },
        actions: {
            list: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "list"),
            },
            edit: {
                component: Components.UserEditAction,
                isAccessible: async (context) => {
                    const { record, currentAdmin } = context;
                    if (record?.params?.id === currentAdmin?.id) return true;
                    return isAccessible(context, "edit");
                },
                before: hashPassword,
                handler: UserEditHandler,
            },
            show: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "show"),
            },
            delete: {
                // Listing now includes yourself; don't let anyone delete their own account.
                isAccessible: async (context: ActionContext) =>
                    context.record?.params?.id !== context.currentAdmin?.id &&
                    isAccessible(context, "delete"),
                // letters/letter_types/languages/comments keep FKs to their author, so MySQL refuses the delete.
                handler: async (request, response, context: ActionContext) => {
                    const { record, resource, h, currentAdmin } = context;
                    const resourceUrl = h.resourceUrl({ resourceId: resource._decorated?.id() || resource.id() });
                    try {
                        await resource.delete(request.params.recordId);
                    } catch (error) {
                        if (!(error instanceof ForeignKeyConstraintError)) throw error;
                        return {
                            record: record!.toJSON(currentAdmin),
                            redirectUrl: resourceUrl,
                            notice: {
                                message: "This user has letters, languages or comments linked to them and can't be deleted.",
                                type: "error",
                            },
                        };
                    }
                    return {
                        record: record!.toJSON(currentAdmin),
                        redirectUrl: resourceUrl,
                        notice: { message: "successfullyDeleted", type: "success" },
                    };
                },
            },
            new: {
                isAccessible: async (context: ActionContext) =>
                    isAccessible(context, "new"),
                before: hashPassword,
            },
            bulkDelete: {
                isAccessible: false,
            },
        },
    },
};
