"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    return queryInterface.bulkInsert("user_roles", [
      {
        id: 1,
        role: "Admin",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        role: "Reviewer",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        role: "User",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.bulkDelete("user_roles", null, {});
  },
};
