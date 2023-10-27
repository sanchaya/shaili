"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    return queryInterface.bulkInsert(
      "letter_types",
      [
        {
          type: "Vowels",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          type: "Consonants",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          type: "Numerals",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.bulkDelete("letter_types", null, {});
  },
};
