import { Request, Response } from "express";
import { Letters } from "../db/models/Letters.js";
import { TaggedLetters } from "../db/models/TaggedLetters.js";
import { LetterTypes } from "../db/models/LetterTypes.js";
import { Books } from "../db/models/Books.js";
import { Sequelize } from "sequelize";

export const getLetterTypes = async (req: Request, res: Response) => {
    const letterTypes = await LetterTypes.findAll({
        attributes: ["id", "type", "language"],
    });
    return res.status(200).send(letterTypes);
};

export const getLetters = async (req: Request, res: Response) => {
    const letters = await Letters.findAll({
        attributes: ["id", "letter", "language", "letter_type"],
    });
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
        res.status(500).json({ error: "Server error" });
    }
};

const updateTag = async (req: any, res: Response) => {
    try {
        const { id, book_id, letter_id, cropped_image, tagged_by } = req.body;
        const taggedLetter = await TaggedLetters.update(
            {
                book_id,
                letter_id,
                cropped_image,
                tagged_by,
            },
            { where: { id: id } }
        );

        if (taggedLetter) {
            const response = await TaggedLetters.findOne({
                where: { id: id },
                include: {
                    model: Letters,
                    as: "letter",
                    attributes: ["letter", "letter_type"],
                },
            });

            return res.status(200).json(response);
        }
    } catch (error) {
        return res.status(500).send("Error saving the tagged letter");
    }
};

const getTaggedLetterByUser = async (req: Request, res: Response) => {
    const user = req.query.user;

    try {
        const taggedLetters = await TaggedLetters.findAll({
            where: { tagged_by: Number(user) },
            include: [
                {
                    model: Letters,
                    as: "letter",
                    attributes: ["letter", "letter_type"],
                },
                {
                    model: Books,
                    as: "books",
                    attributes: ["name", "url"],
                },
            ],
            order: [["updated_at", "DESC"]],
        });
        res.json(taggedLetters);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

const calculateTagPercentage = async (req: Request, res: Response) => {
    const bookId = req.query.bookId;

    try {
        const bookLanguage = await Books.findOne({
            where: { id: Number(bookId) },
            attributes: ["language"],
        });

        const totalLettersQuery = await Letters.count({
            where: { language: bookLanguage?.dataValues.language },
        });

        const totalTagsQuery = await Letters.count({
            distinct: true,
            col: "id",
            include: {
                as: "taggedLetters",
                model: TaggedLetters,
                where: {
                    letter_id: Sequelize.col("Letters.id"),
                    book_id: bookId,
                    deleted_at: null,
                },
            },
            where: {
                language: bookLanguage?.dataValues.language,
            },
        });

        const tagPercentage = Math.round(
            (totalTagsQuery * 100.0) / Math.max(totalLettersQuery, 1)
        );

        return res.status(200).json(tagPercentage);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to calculate tag percentage" });
    }
};

export default {
    getLetterTypes,
    getLetters,
    saveTag,
    getTaggedLetter,
    deleteTaggedLetter,
    updateTag,
    getTaggedLetterByUser,
    calculateTagPercentage,
};
