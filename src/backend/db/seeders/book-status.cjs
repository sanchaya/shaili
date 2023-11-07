"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    return queryInterface.bulkInsert("book_status", [
      {
        id: 1,
        status: "New",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        status: "In Progress",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        status: "Needs Review",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        status: "Completed",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.bulkDelete("book_status", null, {});
  },
};
