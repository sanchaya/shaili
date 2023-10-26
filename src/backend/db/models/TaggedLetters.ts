import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/config.ts";
import { Letters } from "./Letters.ts";

interface ITaggedLetters {
  id: number;
  book_id: number;
  letter_id: number;
  cropped_image:string;
  tagged_by: string;
  created_at:Date;
  updated_at:Date;
}

export class TaggedLetters extends Model<ITaggedLetters> {
    declare id: number;
    declare book_id: number;
    declare letter_id: number;
    declare cropped_image: string;
    declare tagged_by: string;
    declare letter: Letters;
    declare created_at:Date;
    declare updated_at:Date;
}

TaggedLetters.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    book_id: {
      type: new DataTypes.INTEGER,
      allowNull: false,
    },
    letter_id: {
      type: new DataTypes.INTEGER,
      allowNull: false,
    },
    cropped_image: {
      type: new DataTypes.STRING(),
      allowNull: false,
    },
    tagged_by: {
      type: new DataTypes.STRING(),
      allowNull: false,
    },
    created_at: {
      type: new DataTypes.DATE(),
    },
    updated_at: {
      type: new DataTypes.DATE(),
    },
  },
  {
    sequelize,
    underscored:true,
    tableName: "tagged_letters",
    modelName: "TaggedLetters",
  }
);

TaggedLetters.belongsTo(Letters, {
  foreignKey: 'letter_id', 
  as: 'letter', 
});


Letters.hasMany(TaggedLetters, {
  foreignKey: 'letter_id',
  as: 'taggedLetters',
});
