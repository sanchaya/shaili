'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('tagged_letters', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      book_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
          model:'books',
          key:'id'
        }
      },
      letter_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
          model:'letter',
          key:'id'
        }
      },
      tagged_by: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cropped_image: {
        type: Sequelize.BLOB,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('tagged_letters');
  }
};
