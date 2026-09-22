"use strict";

// Clockwise rotation (0/90/180/270) for pages scanned sideways or upside down.
// page 0 = default for every page of the book; a row for a page overrides it.
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("book_page_rotations", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            book_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "books", key: "id" },
                onDelete: "CASCADE",
            },
            page: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            rotation: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            created_at: { type: Sequelize.DATE },
            updated_at: { type: Sequelize.DATE },
        });
        await queryInterface.addIndex("book_page_rotations", ["book_id", "page"], { unique: true });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("book_page_rotations");
    },
};
