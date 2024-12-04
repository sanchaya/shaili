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

    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
        await queryInterface.dropTable("languages");
    },
};
