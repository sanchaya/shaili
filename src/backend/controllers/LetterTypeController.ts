import { LetterTypes } from "../db/models/LetterTypes.js";
import { Request, Response } from "express";

const updateLetterTypeStatus = async (req: Request, res: Response) => {
    const { letterTypeId, status } = req.body;
    try {
        const response = await LetterTypes.update(
            { status: status },
            { where: { id: letterTypeId } }
        );
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json("Something went wrong.Try again later.");
    }
};

export default {
    updateLetterTypeStatus,
};
