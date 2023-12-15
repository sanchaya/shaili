"use strict";

const { DATE } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn("letters", "deleted_at");
        await queryInterface.removeColumn("letter_types", "deleted_at");
        await queryInterface.addColumn("books", "deleted_at", DATE);
        await queryInterface.addColumn("comments", "deleted_at", DATE);
    },
};
