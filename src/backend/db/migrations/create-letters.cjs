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
      language:{
        type: Sequelize.STRING,
        references: {
          model: "languages",
          key: "language_code",
        },
      },
      created_by: {
        type: new Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
      },
      updated_by: {
        type: new Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
      deleted_at: {
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
      is_user_defined: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_by: {
        type: new Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
      },
      updated_by: {
        type: new Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable("letters");
    await queryInterface.dropTable("letter_types");
  },
};
