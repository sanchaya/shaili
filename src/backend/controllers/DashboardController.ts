import { Request, Response } from "express";
import { Books } from "../db/models/Books.js";
import { TaggedLetters } from "../db/models/TaggedLetters.js";
import { Letters } from "../db/models/Letters.js";

const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await Books.findAll({
      attributes: ["id", "name", "status"],
    });
    return res.status(200).send(books);
  } catch (error) {
    return res.status(500).send("Something went wrong.Try again later.");
  }
};

const getDataForPdf = async (req: Request, res: Response) => {
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

export default {
  getBooks,
  getDataForPdf,
};
