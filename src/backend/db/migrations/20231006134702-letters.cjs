'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('letter', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      letter: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      letterType: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references:{
          model:'letterType',
          key:'id'
        }
      },
      createdBy: {
        type: new Sequelize.STRING(),
      },
      updatedBy: {
        type: new Sequelize.STRING(),
      },
      createdAt: {
        type: Sequelize.DATE,
      },
      updatedAt: {
        type: Sequelize.DATE,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('letter');
  }
};
