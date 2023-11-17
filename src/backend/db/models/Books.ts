import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/config.js";

interface IBook {
  id: number;
  name: string;
  language: string;
  publisher_name: string;
  published_year: string;
  url: string;
  status: number;
}

export class Books extends Model<IBook> {
  declare id: number;
  declare name: string;
  declare language: string;
  declare publisher_name: string;
  declare published_year: string;
  declare url: string;
  declare status: number;

  static associate(models: any) {
    Books.belongsTo(models.BookStatus, {
      foreignKey: "status",
    });
    Books.belongsTo(models.Languages, {
      foreignKey: "language",
    });
  }
}

Books.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    language: {
      type: new DataTypes.STRING(),
    },
    publisher_name: {
      type: new DataTypes.STRING(),
      allowNull: false,
    },
    published_year: {
      type: new DataTypes.STRING(),
      allowNull: false,
    },
    url: {
      type: new DataTypes.STRING(),
      allowNull: false,
    },
    status: {
      type: new DataTypes.INTEGER(),
      allowNull: true,
    },
  },
  {
    sequelize,
    underscored: true,
    tableName: "books",
    modelName: "books",
  }
);
