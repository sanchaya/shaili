"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("languages", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            language: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            language_code: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                primaryKey: true,
            },
            created_by: {
                type: Sequelize.INTEGER,
                references: {
                    model: "users",
                    key: "id",
                },
            },
            updated_by: {
                type: Sequelize.INTEGER,
                references: {
                    model: "users",
                    key: "id",
                },
            },
            created_at: {
                type: Sequelize.DATE,
            },
            updated_at: {
                type: Sequelize.DATE,
            },
        });
    },

    async down(queryInterface, _Sequelize) {
        await queryInterface.dropTable("languages");
    },
};
