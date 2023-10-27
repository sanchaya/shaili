import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/config.ts";

interface IPasswordResetTokenAttributes {
  id: number;
  email: number;
  token: string;
}

type PasswordResetTokenModelCreationAttributes = Optional<
  IPasswordResetTokenAttributes,
  "id"
>;

class PasswordResetTokens extends Model<
  IPasswordResetTokenAttributes,
  PasswordResetTokenModelCreationAttributes
> {
  declare id: number;
  declare email: string;
  declare token: string;
}

PasswordResetTokens.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    underscored: true,
    modelName: "PasswordResetTokens",
    tableName: "password_reset_tokens",
    timestamps: true,
  }
);

export default PasswordResetTokens;
