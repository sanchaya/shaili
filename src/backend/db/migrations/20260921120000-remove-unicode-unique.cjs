"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Remove unique constraint from unicode column in letters table
        await queryInterface.changeColumn("letters", "unicode", {
            type: Sequelize.STRING,
            allowNull: true,
            unique: false,
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Restore unique constraint on unicode column
        await queryInterface.changeColumn("letters", "unicode", {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true,
        });
    },
};
