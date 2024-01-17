"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add seed commands here.
         *
         * Example:
         * await queryInterface.bulkInsert('People', [{
         *   name: 'John Doe',
         *   isBetaMember: false
         * }], {});
         */
        await queryInterface.bulkInsert("user_roles", [
            {
                id: 1,
                role: "Admin",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: 2,
                role: "Reviewer",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: 3,
                role: "User",
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
        await queryInterface.bulkDelete("user_roles", null, {});
    },
};
