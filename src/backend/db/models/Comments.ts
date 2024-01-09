import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/config.js";

interface IComment {
    id: number;
    book: number;
    comment: string;
    commented_by: number;
    created_at: Date;
    updated_at: Date;
}

type CommentModelCreationAttributes = Optional<
    IComment,
    "id" | "created_at" | "updated_at"
>;

export class Comments extends Model<IComment, CommentModelCreationAttributes> {
    declare id: number;
    declare book: number;
    declare comment: string;
    declare commented_by: number;
    declare created_at: Date;
    declare updated_at: Date;
}

Comments.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        book: {
            type: DataTypes.INTEGER(),
            allowNull: false,
            references: {
                model: "books",
                key: "id",
            },
        },
        comment: {
            type: DataTypes.TEXT("long"),
            allowNull: false,
        },
        commented_by: {
            type: DataTypes.INTEGER(),
            allowNull: false,
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
        underscored: true,
        timestamps: true,
        tableName: "comments",
        modelName: "Comments",
    }
);
