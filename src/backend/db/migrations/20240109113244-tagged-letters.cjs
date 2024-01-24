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
        await queryInterface.createTable("tagged_letters", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            book_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "books",
                    key: "id",
                },
            },
            letter_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "letters",
                    key: "id",
                },
            },
            tagged_by: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            cropped_image: {
                type: Sequelize.TEXT("long"),
                allowNull: false,
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
        await queryInterface.dropTable("tagged_letters");
    },
};
