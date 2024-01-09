"use strict";

const { DATE } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn("books", "deleted_at");
        await queryInterface.removeColumn("comments", "deleted_at");
    },
};
