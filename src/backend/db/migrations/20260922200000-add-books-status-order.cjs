"use strict";

// Default sort key for the books list: In Progress (status 2) first, then the rest.
// Computed by MySQL and deliberately not in the Sequelize model, so inserts never write it.
module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.query(
            "ALTER TABLE books ADD COLUMN status_order TINYINT AS (IF(status = 2, 0, 1)) VIRTUAL"
        );
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("books", "status_order");
    },
};
