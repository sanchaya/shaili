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
        await queryInterface.changeColumn("tagged_letters", "cropped_image", {
            type: Sequelize.STRING,
        });
        await queryInterface.renameColumn(
            "tagged_letters",
            "cropped_image",
            "tag_path"
        );
    },
};
