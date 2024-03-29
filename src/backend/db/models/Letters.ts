import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/config.js";
import { LetterTypes } from "./LetterTypes.js";
import Users from "./Users.js";
import { Languages } from "./Languages.js";

interface ILetters {
    id: number;
    letter: string;
    unicode: string;
    letter_type: string;
    language: string;
    user_defined: boolean;
    created_by: number;
    updated_by: number;
}

type LettersCreationAttributes = Optional<ILetters, "id" | "unicode">;

export class Letters extends Model<ILetters, LettersCreationAttributes> {
    declare id: number;
    declare letter: string;
    declare unicode: string;
    declare letter_type: string;
    declare language: string;
    declare user_defined: boolean;
    declare created_by: number;
    declare updated_by: number;

    static associate() {
        Letters.belongsTo(LetterTypes, {
            foreignKey: "letter_type",
        });
        Letters.belongsTo(Languages, {
            foreignKey: "language",
        });
        Letters.belongsTo(Users, {
            foreignKey: "created_by",
        });
        Letters.belongsTo(Users, {
            foreignKey: "updated_by",
        });
    }
}

Letters.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        letter: {
            type: new DataTypes.STRING(),
            allowNull: false,
        },
        unicode: {
            type: new DataTypes.STRING(),
            allowNull: true,
            unique: true,
        },
        letter_type: {
            type: new DataTypes.INTEGER(),
            allowNull: false,
            references: {
                model: "letter_types",
                key: "type",
            },
        },
        language: {
            type: new DataTypes.STRING(),
            references: {
                model: "languages",
                key: "language_code",
            },
        },
        user_defined: {
            type: new DataTypes.BOOLEAN(),
            defaultValue: false,
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
        tableName: "letters",
        modelName: "Letters",
        underscored: true,
        timestamps: true,
    }
);
