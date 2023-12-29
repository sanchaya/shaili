import UserRoles from "../db/models/UserRoles.js";

export const UserRolesResource = {
    resource: UserRoles,
    options: {
        actions: {
            list: {
                isAccessible: false,
            },
            edit: {
                isAccessible: false,
            },
            show: {
                isAccessible: false,
            },
            delete: {
                isAccessible: false,
            },
            new: {
                isAccessible: false,
            },
            bulkDelete: {
                isAccessible: false,
            },
        },
    },
};
