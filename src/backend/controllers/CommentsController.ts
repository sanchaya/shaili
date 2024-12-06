import { Request, Response } from "express";
import { Comments } from "../db/models/Comments.js";
import Users from "../db/models/Users.js";

export const getUsers = async (req: Request, res: Response) => {
    const users = await Users.findAll({
        attributes: ["id", "name"],
    });
    return res.status(200).send(users);
};

const getComments = async (req: Request, res: Response) => {
    try {
        const bookId = req.query.bookId;
        const comments = await Comments.findAll({
            where: { book: Number(bookId) },
            order: [["updated_at", "DESC"]],
        });
        return res.status(200).send(comments);
    } catch (error) {
        return res.status(500).send("Something went wrong. Try again later.");
    }
};

const addComment = async (req: Request, res: Response) => {
    try {
        const { bookId, comment, commented_by } = req.body;
        const newComment = await Comments.create({
            book: bookId,
            comment: comment,
            commented_by: commented_by,
        });
        const response = await Comments.findOne({
            where: { id: newComment.id },
        });
        return res.status(200).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).send("Something went wrong.Try again later.");
    }
};

const editComment = async (req: Request, res: Response) => {
    const { id, bookId, comment, commented_by } = req.body;

    try {
        const commentData = await Comments.update(
            {
                book: bookId,
                comment: comment,
                commented_by,
            },
            { where: { id: id } }
        );
        if (commentData) {
            const response = await Comments.findOne({
                where: { id: id },
            });

            return res.status(200).json(response);
        }
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

export default {
    getUsers,
    getComments,
    addComment,
    editComment,
};
