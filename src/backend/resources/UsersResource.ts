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
