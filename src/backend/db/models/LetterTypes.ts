import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/config.js";

interface ILetterTypes {
  id: number;
  type: string;
  created_at: Date;
  updated_at: Date;
}

export class LetterTypes extends Model<ILetterTypes> {
  declare id: number;
  declare type: string;
  declare created_at: Date;
  declare updated_at: Date;
}

LetterTypes.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
    },
    updated_at: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    tableName: "letter_types",
    modelName: "LetterTypes",
    underscored: true,
  }
);
