import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/config.js";
import * as argon2 from "argon2";

interface IUserAttributes {
    id: number;
    name: string;
    role: number;
    email: string;
    password: string;
    email_verification_token: string | null;
    email_verified_at: Date;
    is_active: boolean;
    is_google_sign_on: boolean;
}

type UserCreationAttributes = Optional<
    IUserAttributes,
    "id" | "email_verified_at" | "is_active" | "password" | "is_google_sign_on"
>;

class Users extends Model<IUserAttributes, UserCreationAttributes> {
    declare id: number;
    declare name: string;
    declare role: number;
    declare email: string;
    declare password: string;
    declare email_verification_token: string | null;
    declare email_verified_at: Date;
    declare is_active: boolean;
    declare is_google_sign_on: boolean;

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
            references: {
                model: "user_roles",
                key: "id",
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email_verification_token: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email_verified_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        is_google_sign_on: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
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
