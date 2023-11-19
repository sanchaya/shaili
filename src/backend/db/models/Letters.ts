import { DataTypes, Model, Optional } from "sequelize";

import { sequelize } from "../config/config.js";
import { LetterTypes } from "./LetterTypes.js";
import Users from "./Users.js";
import { Languages } from "./Languages.js";

interface ILetters {
    id: number;
    letter: string;
    language: string;
    letter_type: string;
    is_user_defined: boolean;
    created_by: number;
    updated_by: number;
}

type LettersCreationAttributes = Optional<ILetters, "id">;

export class Letters extends Model<ILetters, LettersCreationAttributes> {
    declare id: number;
    declare letter: string;
    declare language: string;
    declare letter_type: string;
    declare is_user_defined: boolean;
    declare created_by: number;
    declare updated_by: number;

    static associate(models: any) {
        Letters.belongsTo(Languages, {
            foreignKey: "language_code",
        });

        Letters.belongsTo(LetterTypes, {
            foreignKey: "letter_type",
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
        language: {
            type: new DataTypes.STRING(),
            allowNull: false,
        },
        letter_type: {
            type: new DataTypes.INTEGER(),
            allowNull: false,
        },
        is_user_defined: {
            type: new DataTypes.BOOLEAN(),
            defaultValue: false,
        },
        created_by: {
            type: new DataTypes.INTEGER(),
        },
        updated_by: {
            type: new DataTypes.INTEGER(),
        },
    },
    {
        sequelize,
        tableName: "letters",
        modelName: "Letters",
        underscored: true,
        timestamps: true,
        paranoid: true,
    }
);

Letters.beforeCreate(async (letters, options) => {
    const currentUser = await Users.findOne({ where: {} });

    if (currentUser) {
        letters.created_by = currentUser.id;
        letters.updated_by = currentUser.id;
    }
});

Letters.beforeUpdate(async (letters, options) => {
    const currentUser = await Users.findOne({ where: {} });

    if (currentUser) {
        letters.updated_by = currentUser.id;
    }
});
