"use strict";
const argon2 = require("argon2");

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
        const hashedPassword = await argon2.hash("Test@123");
        await queryInterface.bulkInsert("users", [
            {
                name: "Admin",
                role: "1",
                email: "admin@gmail.com",
                password: hashedPassword,
                is_active: 1,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "Reviewer",
                role: "2",
                email: "reviewer@gmail.com",
                password: hashedPassword,
                is_active: 1,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                name: "User",
                role: "3",
                email: "user@gmail.com",
                password: hashedPassword,
                is_active: 1,
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
        await queryInterface.bulkDelete("users", null, {});
    },
};
