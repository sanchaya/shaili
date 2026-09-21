"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert("user_roles", [
            {
                id: 4,
                role: "QA",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: 5,
                role: "Developer",
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("user_roles", {
            id: [4, 5],
        });
    },
};
