"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn("tagged_letters", "cropped_image", {
            type: Sequelize.STRING,
        });
        await queryInterface.renameColumn(
            "tagged_letters",
            "cropped_image",
            "tag_path"
        );
        await queryInterface.removeColumn("tagged_letters", "deleted_at");
    },
};
