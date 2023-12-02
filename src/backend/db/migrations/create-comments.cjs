"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("comments", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            book: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "books",
                    key: "id",
                },
            },
            comment: {
                allowNull: false,
                type: Sequelize.TEXT("long"),
            },
            commented_by: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                default: Date.now,
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                default: Date.now,
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("comments");
    },
};
