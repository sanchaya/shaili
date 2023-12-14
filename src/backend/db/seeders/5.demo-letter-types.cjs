"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    return queryInterface.bulkInsert(
      "letter_types",
      [
        {
          type: "Vowels",
          language: "kn",
          created_by: 1,
          updated_by: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          type: "Consonants",
          language: "kn",
          created_by: 1,
          updated_by: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          type: "Numerals",
          language: "en",
          created_by: 1,
          updated_by: 1,
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
