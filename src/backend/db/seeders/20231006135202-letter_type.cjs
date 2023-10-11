'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, _Sequelize) {
    return queryInterface.bulkInsert('letterType', [
      {
        type: "Vowels",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: "Consonants",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: "Numerals",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
   
  }
};
