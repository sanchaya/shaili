"use strict";

const { STRING } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("languages", "alt_lang_code",{
            type:Sequelize.STRING,
            after:"language_code"
        });
        await queryInterface.addColumn("languages", "description",{
            type:Sequelize.STRING,
            after:"alt_lang_code"
        });
    },
};
