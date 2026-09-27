"use strict";

// The script a book is printed in. A language lists its scripts comma-separated in languages.script;
// existing books get the first (primary) one.
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("books", "script", { type: Sequelize.STRING, allowNull: true });
        await queryInterface.sequelize.query(
            "UPDATE books b JOIN languages l ON l.language_code = b.language SET b.script = TRIM(SUBSTRING_INDEX(l.script, ',', 1))"
        );
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("books", "script");
    },
};
