"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    return queryInterface.bulkInsert(
      "languages",
      [
        {
          language: "Kannada",
          id: "1",
          language_code: "kn",
          created_by: 1,
          updated_by: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          language: "English",
          id: "2",
          language_code: "en",
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
    await queryInterface.bulkDelete("languages", null, {});
  },
};
