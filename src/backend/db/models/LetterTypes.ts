import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/config.js";
import Users from "./Users.js";
import { Languages } from "./Languages.js";

interface ILetterTypes {
    id: number;
    type: string;
    language: string;
    created_by: number;
    updated_by: number;
}

type LetterTypeCreationAttributes = Optional<ILetterTypes, "id">;

export class LetterTypes extends Model<
    ILetterTypes,
    LetterTypeCreationAttributes
> {
    declare id: number;
    declare type: string;
    declare language: string;
    declare created_by: number;
    declare updated_by: number;

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
    },
    {
        sequelize,
        tableName: "letter_types",
        modelName: "LetterTypes",
        underscored: true,
        timestamps: true,
    }
);
