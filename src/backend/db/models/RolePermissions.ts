import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/config.js";

interface IRolePermissionAttributes {
    id: number;
    role_id: number;
    resource: string;
    action: string;
    allowed: boolean;
}

type RolePermissionCreationAttributes = Optional<IRolePermissionAttributes, "id">;

class RolePermissions extends Model<
    IRolePermissionAttributes,
    RolePermissionCreationAttributes
> {
    declare id: number;
    declare role_id: number;
    declare resource: string;
    declare action: string;
    declare allowed: boolean;
}

RolePermissions.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "user_roles",
                key: "id",
            },
        },
        resource: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        allowed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        sequelize,
        underscored: true,
        modelName: "RolePermissions",
        tableName: "role_permissions",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["role_id", "resource", "action"],
            },
        ],
    }
);

export default RolePermissions;
