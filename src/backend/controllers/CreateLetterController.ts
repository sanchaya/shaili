import { Request, Response } from "express";
import { Languages } from "../db/models/Languages.js";
import { Letters } from "../db/models/Letters.js";

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
            is_user_defined: true,
            created_by: createdBy,
            updated_by: createdBy,
        });
        return res.status(200).send(userDefinedLeter);
    } catch (error) {
        return res.status(500).send("Something went wrong.Try again later.");
    }
};

export default {
    getLanguages,
    addUserDefinedLetter,
};
