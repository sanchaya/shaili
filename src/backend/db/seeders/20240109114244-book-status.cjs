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
        await queryInterface.bulkInsert("book_status", [
            {
                id: 1,
                status: "New",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: 2,
                status: "In Progress",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: 3,
                status: "Needs Review",
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: 4,
                status: "Completed",
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
        await queryInterface.bulkDelete("book_status", null, {});
    },
};
