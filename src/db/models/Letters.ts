import { DataTypes, Model } from "sequelize";

import { sequelize } from "../config/config.js";
import { LetterType } from "./LetterType.js";
import { Users } from "./Users.js";

interface ILetters {
  id: number;
  letter: string;
  letterType: string;
  createdBy: string;
  updatedBy: string;
}

export class Letters extends Model<ILetters> {
  declare id: number;
  declare letter: string;
  declare letterType: string;
  declare createdBy: string;
  declare updatedBy: string;

  static associate(models: any) {
    Letters.belongsTo(LetterType, {
      foreignKey: "letterType",
    });
    Letters.belongsTo(models.Users, {
      foreignKey: "createdBy",
    });

    Letters.belongsTo(models.Users, {
      foreignKey: "createdBy",
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
    letterType: {
      type: new DataTypes.INTEGER(),
      allowNull: false,
     
    },
    createdBy: {
      type: new DataTypes.STRING(),
    },
    updatedBy: {
      type: new DataTypes.STRING(),
    },
  },
  {
    sequelize,
    tableName: "letter",
    modelName: "letter",
    timestamps : true
  }
);

Letters.beforeCreate(async (letter, options) => {
 
  const currentUser = await Users.findOne({ where: { } });

  if (currentUser) {
    letter.createdBy = currentUser.name;
    letter.updatedBy = currentUser.name;
  }

});

Letters.beforeUpdate(async (letter, options) => {
  
  const currentUser = await Users.findOne({ where: { } });

  if (currentUser) {
    letter.updatedBy = currentUser.name;
  }
 
});
