import { Request, Response } from "express";
import { Books } from "../db/models/Books.js";

const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await Books.findAll({
      attributes: ["id", "name", "status","language","printer_name","printer_location"],
    });
    return res.status(200).send(books);
  } catch (error) {
    return res.status(500).send("Something went wrong.Try again later.");
  }
};

export default {
  getBooks
};