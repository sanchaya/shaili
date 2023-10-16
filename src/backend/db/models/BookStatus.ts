import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/config.ts";

interface IBookStatusAttributes {
  id: number;
  status: string;
}

type BookStatusModelCreationAttributes = Optional<IBookStatusAttributes, "id">;

class BookStatus extends Model<
  IBookStatusAttributes,
  BookStatusModelCreationAttributes
> {
  declare id: number;
  declare status: string;
}

BookStatus.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    underscored: true,
    modelName: "BookStatus",
    tableName: "book_status",
    timestamps: true,
  }
);

export default BookStatus;
