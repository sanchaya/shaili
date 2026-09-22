import { Request, Response } from "express";
import { STORAGE_DIR } from "../utils/storage.js";
import { Letters } from "../db/models/Letters.js";
import { TaggedLetters } from "../db/models/TaggedLetters.js";
import { LetterTypes } from "../db/models/LetterTypes.js";
import { Books } from "../db/models/Books.js";
import { Op, QueryTypes, Sequelize } from "sequelize";
import { sequelize as db } from "../db/config/config.js";
import fs from "fs";
import path from "path";
import { mkdir } from "node:fs/promises";
import { Languages } from "../db/models/Languages.js";
import archiver from "archiver";
import sequelize from "sequelize";

interface MakeTagsZipResult {
    status: boolean;
    url?: string;
    error?: string;
}

export const getLetterTypes = async (req: Request, res: Response) => {
    const letterTypes = await LetterTypes.findAll({
        attributes: ["id", "type", "language"],
        where: { status: true },
    });
    return res.status(200).send(letterTypes);
};

export const getLetters = async (req: Request, res: Response) => {
    const letters = await Letters.findAll({
        attributes: ["id", "letter", "unicode", "language", "letter_type"],
        where: {
            letter_type: {
                [Op.in]: sequelize.literal(
                    `(SELECT id FROM letter_types WHERE status = true)`
                ),
            },
        },
    });
    return res.status(200).send(letters);
};

export const saveTag = async (req: any, res: Response) => {
    try {
        const { book_id, letter_id, tagged_by, croppedImage } = req.body;
        const bookData = await Books.findOne({
            where: { id: book_id },
        });
        const letterData = await Letters.findOne({
            where: { id: letter_id },
        });
        const tag_path = await storeTagImage(
            bookData,
            letterData,
            croppedImage
        );

        const taggedLetter = await TaggedLetters.create({
            book_id,
            letter_id,
            tagged_by,
            tag_path,
        });

        const bookCurrentStatus = await Books.findOne({
            where: { id: book_id },
            attributes: ["status"],
        });
        if (Number(bookCurrentStatus?.dataValues.status) == 1) {
            await Books.update(
                { status: 2 },
                {
                    where: {
                        id: book_id,
                    },
                }
            );
        }
        const response = await TaggedLetters.findOne({
            where: { id: taggedLetter.id },
            include: {
                model: Letters,
                as: "letter",
                attributes: ["letter", "letter_type"],
            },
        });
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).send("Error saving the tagged letter");
    }
};

const getTaggedLetter = async (req: Request, res: Response) => {
    const bookId = req.query.bookId;

    try {
        const taggedLetters = await TaggedLetters.findAll({
            where: { book_id: Number(bookId) },
            include: {
                model: Letters,
                as: "letter",
                attributes: ["letter", "letter_type"],
                where: {
                    letter_type: {
                        [Op.in]: sequelize.literal(
                            `(SELECT id FROM letter_types WHERE status = true)`
                        ),
                    },
                },
            },
            order: [["updated_at", "DESC"]],
        });
        res.json(taggedLetters);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

// Owner, Reviewer or Admin (mirrors TagImage/TagsListModal)
const canModifyTag = (user: any, tag: any) =>
    !!user && (user.role === 1 || user.role === 2 || user.id == tag?.dataValues.tagged_by);

const deleteTaggedLetter = async (req: any, res: Response) => {
    const taggedLetterId = Number(req.query.id);

    try {
        const taggedLetter = await TaggedLetters.findOne({
            where: { id: taggedLetterId },
        });
        if (!taggedLetter) return res.status(404).json({ error: "Tag not found" });
        if (!canModifyTag(req.session?.adminUser, taggedLetter)) {
            return res.status(403).json({ error: "Not allowed" });
        }
        const tagPath = getTagsDirectory() + taggedLetter.dataValues.tag_path;
        if (fs.existsSync(tagPath)) {
            fs.unlinkSync(tagPath);
            const dir = path.dirname(tagPath);
            if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
        }
        await TaggedLetters.destroy({ where: { id: taggedLetterId } });
        res.status(200).json({ message: "Tagged letter deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

const updateTag = async (req: any, res: Response) => {
    try {
        const { id, book_id, letter_id, tagged_by } = req.body;
        if (!canModifyTag(req.session?.adminUser, await TaggedLetters.findOne({ where: { id } }))) {
            return res.status(403).json({ error: "Not allowed" });
        }

        const letterData = await Letters.findOne({
            where: { id: letter_id },
        });

        const tag_path = (await updateTagImage(id, letterData)) as string;

        if (tag_path) {
            const taggedLetter = await TaggedLetters.update(
                {
                    book_id,
                    letter_id,
                    tagged_by,
                    tag_path,
                },
                { where: { id: id } }
            );

            if (taggedLetter) {
                const response = await TaggedLetters.findOne({
                    where: { id: id },
                    include: {
                        model: Letters,
                        as: "letter",
                        attributes: ["letter", "letter_type"],
                    },
                });

                return res.status(200).json(response);
            }
        }
    } catch (error) {
        return res.status(500).send("Error saving the tagged letter");
    }
};

const getTaggedLetterByUser = async (req: Request, res: Response) => {
    const user = req.query.user;

    try {
        const taggedLetters = await TaggedLetters.findAll({
            where: { tagged_by: Number(user) },
            include: [
                {
                    model: Letters,
                    as: "letter",
                    attributes: ["letter", "letter_type"],
                    where: {
                        letter_type: {
                            [Op.in]: sequelize.literal(
                                `(SELECT id FROM letter_types WHERE status = true)`
                            ),
                        },
                    },
                },
                {
                    model: Books,
                    as: "books",
                    attributes: ["name", "url"],
                },
            ],
            order: [["updated_at", "DESC"]],
        });
        res.json(taggedLetters);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

// Only these letter types count towards progress
// (Conjuncts and Custom Symbols excluded - too many uncertain combinations).
const PROGRESS_LETTER_TYPES = ["Vowels", "Consonants", "Numerals", "Special Symbols", "Compounds"];

// Returns { [bookId]: percentage } for the given books in one query.
export const getTagPercentages = async (bookIds: number[]): Promise<Record<number, number>> => {
    if (!bookIds.length) return {};
    const rows: any[] = await db.query(
        `SELECT b.id,
            (SELECT COUNT(DISTINCT t.letter_id) FROM tagged_letters t
                JOIN letters l ON l.id = t.letter_id
                JOIN letter_types lt ON lt.id = l.letter_type
                WHERE t.book_id = b.id AND l.language = b.language
                AND lt.status = true AND lt.type IN (:types)) AS tagged,
            (SELECT COUNT(*) FROM letters l
                JOIN letter_types lt ON lt.id = l.letter_type
                WHERE l.language = b.language
                AND lt.status = true AND lt.type IN (:types)) AS total
        FROM books b WHERE b.id IN (:bookIds)`,
        { replacements: { types: PROGRESS_LETTER_TYPES, bookIds }, type: QueryTypes.SELECT }
    );
    return Object.fromEntries(
        rows.map((r) => [r.id, Math.round((Number(r.tagged) * 100) / Math.max(Number(r.total), 1))])
    );
};

const calculateTagPercentage = async (req: Request, res: Response) => {
    const bookId = Number(req.query.bookId);

    try {
        const percentages = await getTagPercentages([bookId]);
        return res.status(200).json(percentages[bookId] ?? 0);
    } catch (error) {
        res.status(500).json({ error: "Failed to calculate tag percentage" });
    }
};

const storeTagImage = async (bookData, letterData, croppedImage) => {
    const bookIdentifier = bookData.dataValues.identifier;
    const letter = letterData.dataValues.letter;
    const letterLanguageCode = letterData.dataValues.language;
    const tagsDirectory = getTagsDirectory();
    const base64Data = croppedImage.replace(/^data:image\/\w+;base64,/, "");
    const bufferData = Buffer.from(base64Data, "base64");
    const bookDirectory = tagsDirectory + "/tags/" + bookIdentifier;
    const letterLanguage = await Languages.findOne({
        where: { language_code: letterLanguageCode },
    });

    if (!fs.existsSync(bookDirectory)) {
        await mkdir(bookDirectory, { recursive: true });
    }

    const fileName =
        letter + "_" + letterLanguage?.dataValues.language + ".jpg";
    const filePathBase = bookDirectory + "/" + fileName;

    let counter = 1;
    let filePath = filePathBase;

    while (fs.existsSync(filePath)) {
        filePath = `${filePathBase.replace(".jpg", `(${counter}).jpg`)}`;
        counter++;
    }

    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, bufferData, (err) => {
            if (err) {
                reject("Error storing tag");
            } else {
                resolve(
                    "/tags/" + bookIdentifier + "/" + path.basename(filePath)
                );
            }
        });
    });
};

const updateTagImage = async (tagId, letterData) => {
    const tagsDirectory = getTagsDirectory();
    const oldTag = await TaggedLetters.findOne({
        where: { id: tagId },
    });
    const newLetter = letterData.dataValues.letter;
    const newLetterLanguageCode = letterData.dataValues.language;
    const letterLanguage = await Languages.findOne({
        where: { language_code: newLetterLanguageCode },
    });

    if (oldTag?.dataValues.letter_id != letterData.dataValues.id) {
        const oldTagPath = tagsDirectory + oldTag?.dataValues.tag_path;
        const newFileName =
            newLetter + "_" + letterLanguage?.dataValues.language + ".jpg";
        const oldDirectory = path.dirname(oldTagPath);
        let newFilePath = path.join(oldDirectory, newFileName);
        let counter = 1;

        while (fs.existsSync(newFilePath)) {
            newFilePath = path.join(
                oldDirectory,
                `${newLetter}_${letterLanguage?.dataValues.language}(${counter}).jpg`
            );
            counter++;
        }

        return new Promise((resolve, reject) => {
            fs.rename(oldTagPath, newFilePath, (err) => {
                if (err) {
                    reject("Error storing tag");
                } else {
                    const parsedPath = path.parse(newFilePath);
                    const tagPath =
                        "/" +
                        parsedPath.dir.split("/public/")[1] +
                        "/" +
                        parsedPath.base;
                    resolve(tagPath);
                }
            });
        });
    }
};

const getTagsDirectory = () => STORAGE_DIR;

const makeTagsZip = async (bookId): Promise<MakeTagsZipResult> => {
    const book = await Books.findOne({
        where: { id: bookId },
    });
    const bookIdentifier = book?.dataValues.identifier;
    const bookTags = await TaggedLetters.findAll({
        where: { book_id: bookId },
    });

    if (bookTags.length > 0) {
        const tagsDirectory = getTagsDirectory();
        const bookDirectory = `${tagsDirectory}/tags/${bookIdentifier}`;
        const filesInTagsDirectory = fs.existsSync(bookDirectory)
            ? fs.readdirSync(bookDirectory)
            : [];

        if (filesInTagsDirectory.length > 0) {
            const output = fs.createWriteStream(
                `${tagsDirectory}/${bookIdentifier}.zip`
            );
            const archive = archiver("zip", {
                zlib: { level: 9 },
            });

            archive.on("error", (err) => {
                throw err;
            });

            archive.pipe(output);

            archive.directory(
                `${tagsDirectory}/tags/${bookIdentifier}/`,
                false
            );
            return new Promise((resolve, reject) => {
                output.on("close", () => {
                    resolve({
                        status: true,
                        url: `${tagsDirectory}/${bookIdentifier}.zip`,
                    });
                });

                archive.finalize();
            });
        } else {
            return { status: false, error: "No files found" };
        }
    } else {
        return { status: false, error: "No tags found" };
    }
};

const downloadTags = async (req: Request, res: Response) => {
    const bookId = req.query.bookId;
    const result = await makeTagsZip(bookId);
    if (!result.status) {
        res.status(500).json(result);
    } else if (result.url) {
        const filename = path.basename(result.url);
        res.status(200).json({ status: "success", url: "/" + filename });
        const filePathToDelete = result.url;
        const delayInMilliseconds = 3 * 60 * 1000;
        deleteFileAfterDownload(filePathToDelete, delayInMilliseconds);
    }
};

const deleteFileAfterDownload = (
    filePath: string,
    delayInMilliseconds: number
) => {
    setTimeout(() => {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Error deleting file: ${err}`);
            }
        });
    }, delayInMilliseconds);
};

export default {
    getLetterTypes,
    getLetters,
    saveTag,
    getTaggedLetter,
    deleteTaggedLetter,
    updateTag,
    getTaggedLetterByUser,
    calculateTagPercentage,
    downloadTags,
    getTagsDirectory,
};
