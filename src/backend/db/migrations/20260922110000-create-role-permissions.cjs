"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("role_permissions", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            role_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "user_roles",
                    key: "id",
                },
            },
            resource: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            action: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            allowed: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            created_at: {
                type: Sequelize.DATE,
            },
            updated_at: {
                type: Sequelize.DATE,
            },
        });

        await queryInterface.addIndex("role_permissions", ["role_id", "resource", "action"], {
            unique: true,
            name: "idx_role_permissions_unique",
        });

        // Seed default permissions matching current hardcoded rules
        const resources = [
            { name: "books", actions: ["list", "show", "edit", "delete", "new", "import", "export"] },
            { name: "letters", actions: ["list", "show", "edit", "delete", "new", "import", "export"] },
            { name: "languages", actions: ["list", "show", "edit", "delete", "new"] },
            { name: "letter_types", actions: ["list", "show", "edit", "delete", "new"] },
            { name: "book_status", actions: ["list", "show", "edit", "delete", "new"] },
            { name: "comments", actions: ["list", "show", "delete"] },
            { name: "users", actions: ["list", "show", "edit", "delete", "new"] },
            { name: "user_roles", actions: ["list", "show", "edit", "delete", "new"] },
        ];

        // Current permission matrix from hardcoded checks:
        // Admin (1): everything
        // Reviewer (2): books list/show/edit, comments list/show/delete
        // User (3): books list/show
        const permissionMatrix = {
            1: {}, // Admin gets all
            2: {
                books: ["list", "show", "edit"],
                comments: ["list", "show", "delete"],
            },
            3: {
                books: ["list", "show"],
            },
        };

        const records = [];
        const now = new Date();

        for (const [roleId, perms] of Object.entries(permissionMatrix)) {
            for (const res of resources) {
                const allowedActions = perms[res.name] || [];
                for (const action of res.actions) {
                    records.push({
                        role_id: Number(roleId),
                        resource: res.name,
                        action,
                        allowed: roleId === "1" ? true : allowedActions.includes(action),
                        created_at: now,
                        updated_at: now,
                    });
                }
            }
        }

        await queryInterface.bulkInsert("role_permissions", records);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("role_permissions");
    },
};
