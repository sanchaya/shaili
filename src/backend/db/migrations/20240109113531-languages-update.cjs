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
        await queryInterface.addColumn("languages", "alt_lang_code", {
            type: Sequelize.STRING,
            after: "language_code",
        });
        await queryInterface.addColumn("languages", "description", {
            type: Sequelize.STRING,
            after: "alt_lang_code",
        });
    },
};
