import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/config.js";
import { LetterTypes } from "./LetterTypes.js";

interface ILanguages {
    id: number;
    language: string;
    language_code: string;
    alt_lang_code: string;
    description: string;
    script: string;
    unicode_range: string;
    unicode_version: string;
    direction: string;
    sample_text: string;
    native_name: string;
    iso_639_1: string;
    iso_639_2: string;
    iso_639_3: string;
    speaker_count: number | null;
    official_status: string;
    font_recommendations: string;
    ipa_supported: boolean;
    ipa_sample: string;
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
    declare script: string;
    declare unicode_range: string;
    declare unicode_version: string;
    declare direction: string;
    declare sample_text: string;
    declare native_name: string;
    declare iso_639_1: string;
    declare iso_639_2: string;
    declare iso_639_3: string;
    declare speaker_count: number | null;
    declare official_status: string;
    declare font_recommendations: string;
    declare ipa_supported: boolean;
    declare ipa_sample: string;
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

        Languages.hasMany(models.LetterTypes, {
            foreignKey: "language",
            sourceKey: "language_code",
            as: "letterTypes"
        });

        Languages.hasMany(models.Books, {
            foreignKey: "language",
            sourceKey: "language_code",
            as: "books"
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
            type: DataTypes.STRING,
        },
        script: {
            type: DataTypes.STRING,
        },
        unicode_range: {
            type: DataTypes.STRING,
        },
        unicode_version: {
            type: DataTypes.STRING,
        },
        direction: {
            type: DataTypes.ENUM("ltr", "rtl", "ttb"),
            defaultValue: "ltr",
        },
        sample_text: {
            type: DataTypes.TEXT,
        },
        native_name: {
            type: DataTypes.STRING,
        },
        iso_639_1: {
            type: DataTypes.STRING(2),
        },
        iso_639_2: {
            type: DataTypes.STRING(3),
        },
        iso_639_3: {
            type: DataTypes.STRING(3),
        },
        speaker_count: {
            type: DataTypes.BIGINT,
        },
        official_status: {
            type: DataTypes.STRING,
        },
        font_recommendations: {
            type: DataTypes.TEXT,
        },
        ipa_supported: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        ipa_sample: {
            type: DataTypes.STRING,
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
        {
            type: "Vowels",
            language: language.language_code,
            status: true,
            created_by: language.created_by,
            updated_by: language.updated_by,
        },
        {
            type: "Consonants",
            language: language.language_code,
            status: true,
            created_by: language.created_by,
            updated_by: language.updated_by,
        },
        {
            type: "Conjuncts",
            language: language.language_code,
            status: true,
            created_by: language.created_by,
            updated_by: language.updated_by,
        },
        {
            type: "Numerals",
            language: language.language_code,
            status: true,
            created_by: language.created_by,
            updated_by: language.updated_by,
        },
        {
            type: "Special Symbols",
            language: language.language_code,
            status: true,
            created_by: language.created_by,
            updated_by: language.updated_by,
        },
        {
            type: "Custom Symbols",
            language: language.language_code,
            status: true,
            created_by: language.created_by,
            updated_by: language.updated_by,
        },
    ];
    await LetterTypes.bulkCreate(defaultData);
});
