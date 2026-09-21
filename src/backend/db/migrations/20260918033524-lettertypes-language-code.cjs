"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("letter_types", "language_code", {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: "",
            after: "type",
            comment: "Language code reference"
        });
        
        // Update existing records to copy language to language_code
        await queryInterface.sequelize.query(
            `UPDATE letter_types SET language_code = language`
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("letter_types", "language_code");
    }
};