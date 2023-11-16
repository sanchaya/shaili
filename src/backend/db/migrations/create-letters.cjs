"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("letter_types", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    });
    await queryInterface.createTable("letters", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      letter: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      letter_type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "letter_types",
          key: "id",
        },
      },
      created_by: {
        type: new Sequelize.STRING(),
      },
      updated_by: {
        type: new Sequelize.STRING(),
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable("letters");
    await queryInterface.dropTable("letter_types");
  },
};
