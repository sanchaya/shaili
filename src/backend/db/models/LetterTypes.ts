import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/config.js";
import Users from "./Users.js";
import { Languages } from "./Languages.js";

interface ILetterTypes {
    id: number;
    type: string;
    language: string;
    created_at: Date;
    updated_at: Date;
    created_by: number;
    updated_by: number;
}

export class LetterTypes extends Model<ILetterTypes> {
    declare id: number;
    declare type: string;
    declare language: string;
    declare created_by: number;
    declare updated_by: number;
    declare created_at: Date;
    declare updated_at: Date;

    static associate(models: any) {
        LetterTypes.belongsTo(Languages, {
            foreignKey: "language_code",
        });

        LetterTypes.belongsTo(models.Users, {
            foreignKey: "created_by",
        });

        LetterTypes.belongsTo(Users, {
            foreignKey: "updated_by",
        });
    }
}

LetterTypes.init(
    {
        type: {
            type: new DataTypes.STRING(128),
            allowNull: false,
        },
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        language: {
            type: new DataTypes.STRING(),
            allowNull: false,
            references: {
                model: "languages",
                key: "language_code",
            },
        },
        created_by: {
            type: new DataTypes.INTEGER(),
            references: {
                model: "users",
                key: "id",
            },
        },
        updated_by: {
            type: new DataTypes.INTEGER(),
            references: {
                model: "users",
                key: "id",
            },
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
        tableName: "letter_types",
        modelName: "LetterTypes",
        underscored: true,
    }
);
