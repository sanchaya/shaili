import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/config.js";

interface IBook {
  id: number;
  name: string;
  publisherName: string;
  publishedYear: string;
  url: string;
}

export class Books extends Model<IBook> {
  static addProperty(arg0: { name: string; isSortable: boolean; position: number; isTitle: boolean; type: string; label: string; availableValues: never[]; custom: { myCustomAction: (record: any) => string; }; }) {
    throw new Error('Method not implemented.');
  }
  declare id: number;
  declare name: string;
  declare publisherName: string;
  declare publishedYear: string;
  declare url: string;
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
    publisherName: {
      type: new DataTypes.STRING(),
      allowNull: false,
    },
    publishedYear: {
        type: new DataTypes.STRING() ,
        allowNull: false,
      },
      url:{
        type: new DataTypes.STRING(),
        allowNull:false,
      },
  },
  {
    sequelize,
    tableName: "books",
    modelName: "books",
  }
);
