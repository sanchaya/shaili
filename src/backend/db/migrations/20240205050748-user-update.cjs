"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        await queryInterface.addColumn("users", "is_active", {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });

        // Add a new column 'email_verified_at'
        await queryInterface.addColumn("users", "email_verified_at", {
            type: Sequelize.DATE,
            allowNull: true,
        });

        // Add a new column 'email_verification_token'
        await queryInterface.addColumn("users", "email_verification_token", {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
    },
};
