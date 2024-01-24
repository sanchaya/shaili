import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/config.js";
import * as argon2 from "argon2";

interface IUserAttributes {
  id: number;
  name: string;
  role: number;
  email: string;
  password: string;
}

type UserCreationAttributes = Optional<IUserAttributes, "id">;

class Users extends Model<IUserAttributes, UserCreationAttributes> {
  declare id: number;
  declare name: string;
  declare role: number;
  declare email: string;
  declare password: string;

  public async comparePassword(password: string, inputPassword: string) {
    const isMatch = await argon2.verify(password, inputPassword);
    return isMatch;
  }

  static associate(models: any) {
    Users.belongsTo(models.UserRoles, {
      foreignKey: "role",
    });
  }
}

Users.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model:"user_roles",
        key:"id"
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    underscored: true,
    modelName: "Users",
    tableName: "users",
    timestamps: true,
  }
);

export default Users;
