import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/config.ts";

interface IUserRoleAttributes {
  id: number;
  role: number;
}

type UserRoleModelCreationAttributes = Optional<IUserRoleAttributes, "id">;

class UserRoles extends Model<
  IUserRoleAttributes,
  UserRoleModelCreationAttributes
> {
  declare id: number;
  declare role: string;
}

UserRoles.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "UserRoles",
    tableName: "user_roles",
    timestamps: true,
  }
);

export default UserRoles;
