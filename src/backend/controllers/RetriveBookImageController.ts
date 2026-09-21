import { Request, Response } from "express";
import { getTotalPagesCached, fetchAndCachePage, prefetchPages, getBookMetadata } from "../services/BookCacheService.js";

export const getTotalPages = async (req: Request, res: Response) => {
    try {
        const bookIdentifier = req.query.identifier as string;
        if (!bookIdentifier) return res.status(400).send("Missing identifier");
        
        const totalPages = await getTotalPagesCached(bookIdentifier);
        res.status(200).send(String(totalPages));
    } catch (error) {
        res.status(500).send("Internal server error.");
    }
};

export const renderImage = async (req: Request, res: Response) => {
    try {
        const pageNum = parseInt(req.query.page as string);
        const bookIdentifier = req.query.identifier as string;
        
        if (!bookIdentifier || isNaN(pageNum)) {
            return res.status(400).send("Missing identifier or page");
        }
        
        const imagePath = await fetchAndCachePage(bookIdentifier, pageNum);
        
        if (imagePath) {
            res.header("Access-Control-Allow-Origin", "*");
            res.setHeader("Content-Type", "image/png");
            res.redirect(imagePath);
        } else {
            res.status(404).send("Image not found.");
        }
    } catch (error) {
        res.status(500).send("Internal server error.");
    }
};

export const prefetchBookPages = async (req: Request, res: Response) => {
    try {
        const { identifier, pages } = req.body;
        if (!identifier || !pages?.length) {
            return res.status(400).json({ error: "Missing identifier or pages" });
        }
        
        await prefetchPages(identifier, pages);
        res.json({ success: true, prefetched: pages.length });
    } catch (error) {
        res.status(500).json({ error: "Failed to prefetch pages" });
    }
};

export const getBookInfo = async (req: Request, res: Response) => {
    try {
        const { identifier } = req.query;
        if (!identifier) return res.status(400).json({ error: "Missing identifier" });
        
        const book = await getBookMetadata(identifier as string);
        if (!book) return res.status(404).json({ error: "Book not found" });
        
        const totalPages = await getTotalPagesCached(book.identifier);
        
        res.json({
            ...book.dataValues,
            totalPages
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to get book info" });
    }
};

export default {
    renderImage,
    getTotalPages,
    prefetchBookPages,
    getBookInfo
};
