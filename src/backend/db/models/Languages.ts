import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/config.js";
import { LetterTypes } from "./LetterTypes.js";
import Users from "./Users.js";
interface ILanguages {
    id: number;
    language: string;
    language_code: string;
    alt_lang_code: string;
    description: string;
    created_at: Date;
    updated_at: Date;
    created_by: number;
    updated_by: number;
}

export class Languages extends Model<ILanguages> {
    declare id: number;
    declare language: string;
    declare language_code: string;
    declare alt_lang_code: string;
    declare description: string;
    declare created_by: number;
    declare updated_by: number;
    declare created_at: Date;
    declare updated_at: Date;

    static associate(models: any) {
        Languages.belongsTo(models.Users, {
            foreignKey: "created_by",
        });

        Languages.belongsTo(models.Users, {
            foreignKey: "updated_by",
        });
    }
}

Languages.init(
    {
        language: {
            type: new DataTypes.STRING(),
            allowNull: false,
        },
        language_code: {
            type: new DataTypes.STRING(),
            allowNull: false,
            unique: true,
            primaryKey: true,
        },
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
        },
        alt_lang_code: {
            type: DataTypes.STRING,
        },
        description: {
            type: DataTypes.STRING
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
        tableName: "languages",
        modelName: "Languages",
        underscored: true,
    }
);

Languages.afterCreate(async (language) => {
    const defaultData = [
      { type: "Vowels", language: language.language_code, created_by: language.created_by, updated_by: language.updated_by},
      { type: "Consonants", language: language.language_code, created_by: language.created_by, updated_by: language.updated_by },
      { type: "Conjuncts", language: language.language_code, created_by: language.created_by, updated_by: language.updated_by },
      { type: "Numerals", language: language.language_code, created_by: language.created_by, updated_by: language.updated_by },
      { type: "Special Symbols", language: language.language_code, created_by: language.created_by, updated_by: language.updated_by },
      { type: "Custom Symbols", language: language.language_code, created_by: language.created_by, updated_by: language.updated_by },
    ];
    await LetterTypes.bulkCreate(defaultData);
});
