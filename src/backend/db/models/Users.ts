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
    avatar_url: string | null;
    bio: string | null;
    phone: string | null;
    organization: string | null;
    location: string | null;
    website: string | null;
    github_url: string | null;
    linkedin_url: string | null;
    preferred_language: string | null;
    timezone: string | null;
}

type UserCreationAttributes = Optional<
    IUserAttributes,
    | "id"
    | "email_verified_at"
    | "is_active"
    | "password"
    | "is_google_sign_on"
    | "avatar_url"
    | "bio"
    | "phone"
    | "organization"
    | "location"
    | "website"
    | "github_url"
    | "linkedin_url"
    | "preferred_language"
    | "timezone"
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
    declare avatar_url: string | null;
    declare bio: string | null;
    declare phone: string | null;
    declare organization: string | null;
    declare location: string | null;
    declare website: string | null;
    declare github_url: string | null;
    declare linkedin_url: string | null;
    declare preferred_language: string | null;
    declare timezone: string | null;

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
        avatar_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        organization: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        website: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        github_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        linkedin_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        preferred_language: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "eng",
        },
        timezone: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "Asia/Kolkata",
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
