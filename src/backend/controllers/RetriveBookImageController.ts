import { Request, Response } from "express";
import axios from "axios";
import xml2js from "xml2js";

export const getTotalPages = async (req: Request, res: Response) => {
    try {
        const bookIdentifier = req.query.identifier;
        const scanDataUrl = `https://archive.org/download/${bookIdentifier}_scandata.xml`;
        const bookData = await axios.get(scanDataUrl);
        xml2js.parseString(
            bookData.data,
            (
                err,
                result: { book: { bookData: { leafCount: number[] }[] } }
            ) => {
                if (err) {
                    return res.status(500).send("Internal server error.");
                }
                const TotalPages = result.book.bookData[0].leafCount[0];
                res.status(200).send(TotalPages);
            }
        );
    } catch (error) {
        res.status(500).send("Internal server error.");
    }
};

export const renderImage = async (req: Request, res: Response) => {
    try {
        const pageNum = req.query.page;
        const bookIdentifier = req.query.identifier;
        const imageUrl = `https://archive.org/download/${bookIdentifier}/page/n${pageNum}`;
        const response = await axios.get(imageUrl, {
            responseType: "arraybuffer",
        });
        if (response.data) {
            res.header("Access-Control-Allow-Origin", "*");
            res.setHeader("Content-Type", "image/png");
            res.send(response.data);
        } else {
            res.status(404).send("Image not found.");
        }
    } catch (error) {
        res.status(500).send("Internal server error.");
    }
};

export default {
    renderImage,
    getTotalPages,
};
