"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("users", "avatar_url", {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.addColumn("users", "bio", {
            type: Sequelize.TEXT,
            allowNull: true,
        });

        await queryInterface.addColumn("users", "phone", {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.addColumn("users", "organization", {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.addColumn("users", "location", {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.addColumn("users", "website", {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.addColumn("users", "github_url", {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.addColumn("users", "linkedin_url", {
            type: Sequelize.STRING,
            allowNull: true,
        });

        await queryInterface.addColumn("users", "preferred_language", {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: "eng",
        });

        await queryInterface.addColumn("users", "timezone", {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: "Asia/Kolkata",
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("users", "avatar_url");
        await queryInterface.removeColumn("users", "bio");
        await queryInterface.removeColumn("users", "phone");
        await queryInterface.removeColumn("users", "organization");
        await queryInterface.removeColumn("users", "location");
        await queryInterface.removeColumn("users", "website");
        await queryInterface.removeColumn("users", "github_url");
        await queryInterface.removeColumn("users", "linkedin_url");
        await queryInterface.removeColumn("users", "preferred_language");
        await queryInterface.removeColumn("users", "timezone");
    },
};
