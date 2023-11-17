import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/config.js";
import Users from "./Users.js";
interface ILanguages {
  id: number;
  language: string;
  language_code: string;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
}

export class Languages extends Model<ILanguages> {
  declare id: number;
  declare language: string;
  declare language_code: string;
  declare created_by: number;
  declare updated_by: number;
  declare created_at: Date;
  declare updated_at: Date;

  static associate(models: any) {
    Languages.belongsTo(models.Users, {
      foreignKey: "created_by",
    });

    Languages.belongsTo(models.Users, {
      foreignKey: "updated_by",
    });
  }
}

Languages.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    language: {
      type: new DataTypes.STRING(),
      allowNull: false,
    },
    language_code: {
      type: new DataTypes.STRING(),
      allowNull: false,
    },
    created_by: {
      type: new DataTypes.INTEGER(),
    },
    updated_by: {
      type: new DataTypes.INTEGER(),
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
    tableName: "languages",
    modelName: "Languages",
    underscored: true,
    paranoid: true,
  }
);

Languages.beforeCreate(async (Languages, options) => {
  const currentUser = await Users.findOne({ where: {} });

  if (currentUser) {
    Languages.created_by = currentUser.id;
    Languages.updated_by = currentUser.id;
  }
});

Languages.beforeUpdate(async (Languages, options) => {
  const currentUser = await Users.findOne({ where: {} });

  if (currentUser) {
    Languages.updated_by = currentUser.id;
  }
});
