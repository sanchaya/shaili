"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert("user_roles", [
            {
                id: 6,
                role: "Font Designer",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: 7,
                role: "Font Developer",
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("user_roles", {
            id: [6, 7],
        });
    },
};
