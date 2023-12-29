import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/config.js";

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
        role: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
    },
    {
        sequelize,
        underscored: true,
        modelName: "UserRoles",
        tableName: "user_roles",
        timestamps: true,
    }
);

export default UserRoles;
