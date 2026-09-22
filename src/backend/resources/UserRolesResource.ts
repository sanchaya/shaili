import UserRoles from "../db/models/UserRoles.js";

export const UserRolesResource = {
    resource: UserRoles,
    options: {
        navigation: { name: "Admin Tools", icon: "Settings" },
        properties: {
            id: {
                isVisible: { list: true, show: true, edit: false, filter: true },
            },
            role: {
                isVisible: { list: true, show: true, edit: true, filter: true },
                isRequired: true,
            },
            created_at: {
                isVisible: { list: true, show: true, edit: false, filter: false },
            },
            updated_at: {
                isVisible: { list: true, show: true, edit: false, filter: false },
            },
        },
        actions: {
            list: {
                isAccessible: ({ currentAdmin }) => currentAdmin?.role === 1,
            },
            edit: {
                isAccessible: ({ currentAdmin }) => currentAdmin?.role === 1,
            },
            show: {
                isAccessible: ({ currentAdmin }) => currentAdmin?.role === 1,
            },
            delete: {
                isAccessible: ({ currentAdmin }) => currentAdmin?.role === 1,
                confirm: {
                    message: "Are you sure you want to delete this role? Users with this role will need to be reassigned.",
                },
            },
            new: {
                isAccessible: ({ currentAdmin }) => currentAdmin?.role === 1,
            },
            bulkDelete: {
                isAccessible: false,
            },
        },
    },
};
