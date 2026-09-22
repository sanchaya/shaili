import RolePermissions from "../db/models/RolePermissions.js";
import UserRoles from "../db/models/UserRoles.js";
import { clearPermissionCache } from "../utils/permissions.js";

export const RolePermissionsResource = {
    resource: RolePermissions,
    options: {
        navigation: { name: "Admin Tools", icon: "Settings" },
        properties: {
            id: {
                isVisible: { list: true, show: true, edit: false, filter: false },
            },
            role_id: {
                isVisible: { list: true, show: true, edit: true, filter: true },
                isRequired: true,
                reference: "user_roles",
            },
            resource: {
                isVisible: { list: true, show: true, edit: true, filter: true },
                isRequired: true,
                availableValues: [
                    { value: "books", label: "Books" },
                    { value: "letters", label: "Letters" },
                    { value: "languages", label: "Languages" },
                    { value: "letter_types", label: "Letter Types" },
                    { value: "book_status", label: "Book Status" },
                    { value: "comments", label: "Comments" },
                    { value: "users", label: "Users" },
                    { value: "user_roles", label: "User Roles" },
                ],
            },
            action: {
                isVisible: { list: true, show: true, edit: true, filter: true },
                isRequired: true,
                availableValues: [
                    { value: "list", label: "List (View)" },
                    { value: "show", label: "Show (View Details)" },
                    { value: "edit", label: "Edit" },
                    { value: "delete", label: "Delete" },
                    { value: "new", label: "Create" },
                    { value: "import", label: "Import" },
                    { value: "export", label: "Export" },
                ],
            },
            allowed: {
                isVisible: { list: true, show: true, edit: true, filter: true },
                isRequired: true,
                availableValues: [
                    { value: "true", label: "Yes" },
                    { value: "false", label: "No" },
                ],
            },
            created_at: {
                isVisible: { list: false, show: true, edit: false, filter: false },
            },
            updated_at: {
                isVisible: { list: false, show: true, edit: false, filter: false },
            },
        },
        actions: {
            list: {
                isAccessible: ({ currentAdmin }) => currentAdmin?.role === 1,
            },
            edit: {
                isAccessible: ({ currentAdmin }) => currentAdmin?.role === 1,
                after: async (_request, _response, context) => {
                    clearPermissionCache();
                    return context;
                },
            },
            show: {
                isAccessible: ({ currentAdmin }) => currentAdmin?.role === 1,
            },
            delete: {
                isAccessible: ({ currentAdmin }) => currentAdmin?.role === 1,
                after: async (_request, _response, context) => {
                    clearPermissionCache();
                    return context;
                },
            },
            new: {
                isAccessible: ({ currentAdmin }) => currentAdmin?.role === 1,
                after: async (_request, _response, context) => {
                    clearPermissionCache();
                    return context;
                },
            },
            bulkDelete: {
                isAccessible: false,
            },
        },
    },
};
