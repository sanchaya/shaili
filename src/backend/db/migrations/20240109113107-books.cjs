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
        await queryInterface.createTable("book_status", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            created_at: {
                type: Sequelize.DATE,
            },
            updated_at: {
                type: Sequelize.DATE,
            },
        });
        await queryInterface.createTable("books", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING(128),
                allowNull: false,
            },
            url: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            identifier: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            language: {
                type: Sequelize.STRING,
                allowNull: false,
                references: {
                    model: "languages",
                    key: "language_code",
                },
            },
            author_name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            publisher_name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            published_year: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            publisher_city: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            printer_name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            printer_location: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            status: {
                type: Sequelize.INTEGER(),
                allowNull: false,
                defaultValue: 1,
                references: {
                    model: "book_status",
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
        await queryInterface.dropTable("books");
    },
};
