import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/config.js";
import { Letters } from "./Letters.js";
import { Books } from "./Books.js";

interface ITaggedLetters {
    [x: string]: any;
    id: number;
    book_id: number;
    letter_id: number;
    tag_path: string;
    tagged_by: string;
    created_at: Date;
    updated_at: Date;
}

type TaggedLetterModelCreationAttributes = Optional<
    ITaggedLetters,
    "id" | "created_at" | "updated_at"
>;

export class TaggedLetters extends Model<
    ITaggedLetters,
    TaggedLetterModelCreationAttributes
> {
    declare id: number;
    declare book_id: number;
    declare letter_id: number;
    declare tag_path: string;
    declare tagged_by: string;
    declare letter: Letters;
    declare created_at: Date;
    declare updated_at: Date;
}

TaggedLetters.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        book_id: {
            type: DataTypes.INTEGER(),
            allowNull: false,
        },
        letter_id: {
            type: DataTypes.INTEGER(),
            allowNull: false,
        },
        tag_path: {
            type: DataTypes.STRING(),
            allowNull: false,
        },
        tagged_by: {
            type: DataTypes.INTEGER(),
            allowNull: false,
        },
        created_at: {
            type: DataTypes.DATE(),
        },
        updated_at: {
            type: DataTypes.DATE(),
        },
    },
    {
        sequelize,
        underscored: true,
        tableName: "tagged_letters",
        modelName: "TaggedLetters",
    }
);

TaggedLetters.belongsTo(Letters, {
    foreignKey: "letter_id",
    as: "letter",
});

TaggedLetters.belongsTo(Books, {
    foreignKey: "book_id",
    as: "books",
});

Letters.hasMany(TaggedLetters, {
    foreignKey: "letter_id",
    as: "taggedLetters",
});
