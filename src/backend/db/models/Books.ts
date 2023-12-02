import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/config.js";

interface IBook {
    id: number;
    name: string;
    url: string;
    identifier: string;
    language: string;
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
