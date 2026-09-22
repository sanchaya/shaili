import { Request, Response } from "express";
import { BookPageRotations } from "../db/models/BookPageRotations.js";

// { [page]: rotation } for a book; key "0" is the whole-book default.
const getRotations = async (req: Request, res: Response) => {
    const rows = await BookPageRotations.findAll({
        where: { book_id: Number(req.query.bookId) },
        attributes: ["page", "rotation"],
    });
    res.json(Object.fromEntries(rows.map((r) => [r.page, r.rotation])));
};

// Body: { book_id, page, rotation }. page 0 sets the whole book and clears per-page overrides.
const setRotation = async (req: Request, res: Response) => {
    const book_id = Number(req.body.book_id);
    const page = Number(req.body.page);
    const rotation = Number(req.body.rotation);
    if (!Number.isInteger(book_id) || !Number.isInteger(page) || page < 0 || ![0, 90, 180, 270].includes(rotation)) {
        return res.status(400).json({ error: "book_id, page >= 0 and rotation of 0/90/180/270 required" });
    }
    try {
        if (page === 0) await BookPageRotations.destroy({ where: { book_id } });
        await BookPageRotations.upsert({ book_id, page, rotation });
        res.json({ page, rotation });
    } catch (error) {
        res.status(500).json({ error: "Failed to save rotation" });
    }
};

export default { getRotations, setRotation };
