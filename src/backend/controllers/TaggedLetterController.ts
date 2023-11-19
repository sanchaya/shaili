import { Request, Response } from "express";
import { Letters } from "../db/models/Letters.js";
import { TaggedLetters } from "../db/models/TaggedLetters.js";
import { LetterTypes } from "../db/models/LetterTypes.js";
import { Books } from "../db/models/Books.js";

export const getLetterTypes = async (req: Request, res: Response) => {
    const letterTypes = await LetterTypes.findAll({
        attributes: ["id", "type", "language"],
    });
    return res.status(200).send(letterTypes);
};

export const getLetters = async (req: Request, res: Response) => {
    const letters = await Letters.findAll({ attributes: ["id", "letter"] });
    return res.status(200).send(letters);
};

export const saveTag = async (req: any, res: Response) => {
    try {
        const { book_id, letter_id, cropped_image, tagged_by } = req.body;
        const taggedLetter = await TaggedLetters.create({
            book_id,
            letter_id,
            cropped_image,
            tagged_by,
        });
        const bookCurrentStatus = await Books.findOne({
            where: { id: book_id },
            attributes: ["status"],
        });
        if (Number(bookCurrentStatus?.dataValues.status) == 1) {
            await Books.update(
                { status: 2 },
                {
                    where: {
                        id: book_id,
                    },
                }
            );
        }
        const response = await TaggedLetters.findOne({
            where: { id: taggedLetter.id },
            include: {
                model: Letters,
                as: "letter",
                attributes: ["letter", "letter_type"],
            },
        });
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).send("Error saving the tagged letter");
    }
};
const getTaggedLetter = async (req: Request, res: Response) => {
    const bookId = req.query.bookId;

    try {
        const taggedLetters = await TaggedLetters.findAll({
            where: { book_id: Number(bookId) },
            include: {
                model: Letters,
                as: "letter",
                attributes: ["letter", "letter_type"],
            },
        });
        res.json(taggedLetters);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

const deleteTaggedLetter = async (req: Request, res: Response) => {
    const taggedLetterId = Number(req.query.id);

    try {
        const taggedLetters = TaggedLetters.destroy({
            where: { id: taggedLetterId },
        });
        res.status(200).json({ message: "Tagged letter deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export default {
    getLetterTypes,
    getLetters,
    saveTag,
    getTaggedLetter,
    deleteTaggedLetter,
};
