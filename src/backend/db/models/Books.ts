import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/config.js";
import { Languages } from "./Languages.js";

interface IBook {
    id: number;
    name: string;
    url: string;
    identifier: string;
    language: string;
    script: string | null;
    author_name: string;
    publisher_name: string;
    published_year: string;
    publisher_city: string;
    printer_name: string;
    printer_location: string;
    status: number;
}

type BookCreationAttributes = Optional<
    IBook,
    | "id"
    | "script"
    | "author_name"
    | "publisher_name"
    | "published_year"
    | "publisher_city"
    | "printer_name"
    | "printer_location"
    | "status"
>;

export class Books extends Model<IBook, BookCreationAttributes> {
    declare id: number;
    declare name: string;
    declare url: string;
    declare identifier: string;
    declare language: string;
    declare script: string | null;
    declare publisher_name: string;
    declare published_year: string;
    declare publisher_city: string;
    declare printer_name: string;
    declare printer_location: string;
    declare status: number;

    static associate(models: any) {
        Books.belongsTo(models.BookStatus, {
            foreignKey: "status",
        });
        Books.belongsTo(models.Languages, {
            foreignKey: "language",
        });
    }
}

Books.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: new DataTypes.STRING(128),
            allowNull: false,
        },
        url: {
            type: new DataTypes.STRING(),
            allowNull: false,
        },
        identifier: {
            type: new DataTypes.STRING(),
            allowNull: false,
        },
        language: {
            type: new DataTypes.STRING(),
            allowNull: false,
            references: {
                model: "languages",
                key: "language_code",
            },
        },
        script: {
            type: new DataTypes.STRING(),
            allowNull: true,
        },
        author_name: {
            type: new DataTypes.STRING(),
            allowNull: true,
        },
        publisher_name: {
            type: new DataTypes.STRING(),
            allowNull: true,
        },
        published_year: {
            type: new DataTypes.STRING(),
            allowNull: true,
        },
        publisher_city: {
            type: new DataTypes.STRING(),
            allowNull: true,
        },
        printer_name: {
            type: new DataTypes.STRING(),
            allowNull: true,
        },
        printer_location: {
            type: new DataTypes.STRING(),
            allowNull: true,
        },
        status: {
            type: new DataTypes.INTEGER(),
            allowNull: false,
            defaultValue: 1,
        },
    },
    {
        sequelize,
        timestamps: true,
        underscored: true,
        tableName: "books",
        modelName: "books",
    }
);

// A book without a script gets its language's primary (first listed) script.
const primaryScript = async (language: string) =>
    (await Languages.findOne({ where: { language_code: language }, attributes: ["script"] }))?.script?.split(",")[0].trim() ?? null;

Books.addHook("beforeSave", async (book: Books) => {
    if (!book.script && book.language) book.script = await primaryScript(book.language);
});
Books.addHook("beforeBulkCreate", async (books: Books[]) => {
    for (const book of books) if (!book.script && book.language) book.script = await primaryScript(book.language);
});
