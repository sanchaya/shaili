"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    return queryInterface.bulkInsert("user_roles", [
      {
        id: "1",
        role: "Admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        role: "Reviewer",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "3",
        role: "User",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.bulkDelete("user_roles", null, {});
  },
};
