import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/config.js";

interface IBookPageRotation {
    id: number;
    book_id: number;
    page: number; // 0 = whole-book default
    rotation: number; // clockwise degrees: 0, 90, 180, 270
}

export class BookPageRotations extends Model<IBookPageRotation, Optional<IBookPageRotation, "id">> {
    declare id: number;
    declare book_id: number;
    declare page: number;
    declare rotation: number;
}

BookPageRotations.init(
    {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        book_id: { type: DataTypes.INTEGER, allowNull: false },
        page: { type: DataTypes.INTEGER, allowNull: false },
        rotation: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    {
        sequelize,
        underscored: true,
        tableName: "book_page_rotations",
        modelName: "BookPageRotations",
    }
);
