import { DataTypes, Model } from "sequelize";

import { sequelize } from "../config/config.ts";
import { LetterTypes } from "./LetterTypes.ts";
import Users from "./Users.ts";

interface ILetters {
  id: number;
  letter: string;
  letter_type: string;
  created_by: string;
  updated_by: string;
}

export class Letters extends Model<ILetters> {
  declare id: number;
  declare letter: string;
  declare letter_type: string;
  declare created_by: string;
  declare updated_by: string;

  static associate(models: any) {
    Letters.belongsTo(LetterTypes, {
      foreignKey: "letter_type",
    });
    Letters.belongsTo(models.Users, {
      foreignKey: "created_by",
    });

    Letters.belongsTo(models.Users, {
      foreignKey: "created_by",
    });
  }
}

Letters.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    letter: {
      type: new DataTypes.STRING(),
      allowNull: false,
    },
    letter_type: {
      type: new DataTypes.INTEGER(),
      allowNull: false,
    },
    created_by: {
      type: new DataTypes.STRING(),
    },
    updated_by: {
      type: new DataTypes.STRING(),
    },
  },
  {
    sequelize,
    tableName: "letters",
    modelName: "Letters",
    underscored: true,
    timestamps: true,
  }
);

Letters.beforeCreate(async (letters, options) => {
  const currentUser = await Users.findOne({ where: {} });

  if (currentUser) {
    letters.created_by = currentUser.name;
    letters.updated_by = currentUser.name;
  }
});

Letters.beforeUpdate(async (letters, options) => {
  const currentUser = await Users.findOne({ where: {} });

  if (currentUser) {
    letters.updated_by = currentUser.name;
  }
});
