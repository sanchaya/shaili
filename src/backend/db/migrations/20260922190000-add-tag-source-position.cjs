"use strict";

// Where each tagged specimen was cropped from: page number (1-based, as shown
// in the book viewer) and box in page-image pixels. Null for older tags.
const COLUMNS = ["page", "box_x", "box_y", "box_w", "box_h"];

module.exports = {
    async up(queryInterface, Sequelize) {
        for (const column of COLUMNS) {
            await queryInterface.addColumn("tagged_letters", column, {
                type: Sequelize.INTEGER,
                allowNull: true,
            });
        }
        await queryInterface.addIndex("tagged_letters", ["book_id", "page"]);
    },

    async down(queryInterface) {
        await queryInterface.removeIndex("tagged_letters", ["book_id", "page"]);
        for (const column of COLUMNS) {
            await queryInterface.removeColumn("tagged_letters", column);
        }
    },
};
