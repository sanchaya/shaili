import { Request, Response } from "express";
import { Languages } from "../db/models/Languages.js";
import { Letters } from "../db/models/Letters.js";
import { Op } from "sequelize";

const getLanguages = async (req: Request, res: Response) => {
    const languages = await Languages.findAll({
        attributes: ["language_code", "language"],
    });
    return res.status(200).send(languages);
};

const addUserDefinedLetter = async (req: Request, res: Response) => {
    try {
        const { letter, language, letterType, createdBy } = req.body;
        const userDefinedLeter = await Letters.create({
            letter: letter,
            language: language,
            letter_type: letterType,
            user_defined: true,
            created_by: createdBy,
            updated_by: createdBy,
        });
        return res.status(200).send(userDefinedLeter);
    } catch (error) {
        return res.status(500).send("Something went wrong.Try again later.");
    }
};

const addLetter = async (req: any, res: Response) => {
    try {
        const {
            letter,
            unicode,
            letter_type,
            language,
            created_by,
            updated_by,
            user_defined,
        } = req.body;

        const isExists = await Letters.findOne({
            where: { letter: letter },
        });
        if (isExists) {
            return res.status(422).json("Letter already exists");
        }
        const isUnicodeExists = await Letters.findOne({
            where: { unicode: unicode },
        });
        if (isUnicodeExists) {
            return res.status(422).json("Unicode already exists");
        }
        const response = await Letters.create({
            letter,
            unicode,
            letter_type,
            language,
            created_by,
            updated_by,
            user_defined,
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).send("Something went wrong.Try again later.");
    }
};

const editLetter = async (req: any, res: Response) => {
    try {
        const {
            id,
            letter,
            unicode,
            letter_type,
            language,
            created_by,
            updated_by,
            user_defined,
        } = req.body;
        const isExists = await Letters.findOne({
            where: { letter: letter, id: { [Op.ne]: id } },
        });
        if (isExists) {
            return res.status(422).json("Letter already exists");
        }
        const isUnicodeExists = await Letters.findOne({
            where: { unicode: unicode },
        });
        if (isUnicodeExists) {
            return res.status(422).json("Unicode already exists");
        }
        const response = await Letters.update(
            {
                letter,
                unicode,
                letter_type,
                language,
                created_by,
                updated_by,
                user_defined,
            },
            { where: { id: id } }
        );

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).send("Something went wrong.Try again later.");
    }
};

export default {
    getLanguages,
    addUserDefinedLetter,
    addLetter,
    editLetter,
};
