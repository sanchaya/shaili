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
            letter_type,
            language,
            created_by,
            updated_by,
            user_defined,
        } = req.body;
        const response = await Letters.create({
            letter,
            letter_type,
            language,
            created_by,
            updated_by,
            user_defined,
        });

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).send("Error saving the tagged letter");
    }
};

const editLetter = async (req: any, res: Response) => {
    try {
        const {
            id,
            letter,
            letter_type,
            language,
            created_by,
            updated_by,
            user_defined,
        } = req.body;
        const response = await Letters.update(
            {
                letter,
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
        return res.status(500).send("Error saving the tagged letter");
    }
};

export default {
    getLanguages,
    addUserDefinedLetter,
    addLetter,
    editLetter,
};
