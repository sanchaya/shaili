import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/config.ts";

interface ILetterType {
  id: number;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

export class LetterType extends Model<ILetterType> {
  declare id: number;
  declare type: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

LetterType.init(
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
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    tableName: "letterType",
    modelName: "letterType",
  }
);
