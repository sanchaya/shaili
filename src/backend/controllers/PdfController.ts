import { Request, Response } from "express";
import { Books } from "../db/models/Books.js";
import { TaggedLetters } from "../db/models/TaggedLetters.js";
import { Letters } from "../db/models/Letters.js";
import puppeteer from "puppeteer";
import edge from "../../common/EdgeConfig.js";
import { Languages } from "../db/models/Languages.js";
import { LetterTypes } from "../db/models/LetterTypes.js";
import fs from "fs";
import path from "path";
import * as url from "url";
import sequelize, { Op } from "sequelize";

interface IData {
    id: number;
    image: string;
    letter: string;
    type: string;
    language: string;
}

const fetchTagData = async (
    bookId,
    letterType,
    languages,
    bookLanguage,
    letters
) => {
    const letterIdMap: Record<string, boolean> = {};

    const mergedData: IData[] = (
        await Promise.all(
            letters.map(async (letter) => {
                const tag = await TaggedLetters.findOne({
                    where: { letter_id: letter.id, book_id: bookId },
                    include: [
                        {
                            model: Letters,
                            as: "letter",
                            attributes: ["letter", "letter_type"],
                        },
                    ],
                    order: [["updated_at", "DESC"]],
                });

                if (tag && !letterIdMap[tag.dataValues.letter_id]) {
                    letterIdMap[tag.dataValues.letter_id] = true;

                    const matchingItem = letterType?.find(
                        (val) =>
                            val.id ===
                            Number(tag.dataValues.letter.dataValues.letter_type)
                    );

                    const languageValue = languages?.find(
                        (record) =>
                            record.language_code === matchingItem?.language
                    );
                    const __dirname = url.fileURLToPath(
                        new URL(".", import.meta.url)
                    );
                    const currentDirectory = path.dirname(__dirname);
                    const tagsDirectory = path.resolve(
                        currentDirectory,
                        "../public/"
                    );
                    const tagString = fs
                        .readFileSync(
                            tagsDirectory + "/" + tag.dataValues.tag_path
                        )
                        .toString("base64");

                    return {
                        image: "data:image/jpg;base64," + tagString,
                        letter: tag.dataValues.letter.dataValues.letter,
                        type: matchingItem ? matchingItem.type : "",
                        language: languageValue ? languageValue.language : "",
                    };
                } else if (!letterIdMap[letter.id]) {
                    letterIdMap[letter.id] = true;

                    const matchingItem = letterType?.find(
                        (val) => val.id === Number(letter.letter_type)
                    );

                    const languageValue = languages?.find(
                        (record) =>
                            record.language_code === matchingItem?.language
                    );
                    if (bookLanguage === languageValue?.language) {
                        return {
                            image: "-",
                            letter: letter.letter,
                            type: matchingItem ? matchingItem.type : "",
                            language: languageValue
                                ? languageValue.language
                                : "",
                        };
                    }
                }

                return null;
            })
        )
    ).filter((item): item is IData => item !== null);

    const organizedData: Record<
        string,
        Record<string, { letter: string; image: string }[]>
    > = {};

    mergedData.forEach((item) => {
        if (!organizedData[item.language]) {
            organizedData[item.language] = {};
        }

        if (!organizedData[item.language][item.type]) {
            organizedData[item.language][item.type] = [];
        }

        organizedData[item.language][item.type].push({
            letter: item.letter,
            image: item.image,
        });
    });

    const sortedData: Record<
        string,
        Record<string, { letter: string; image: string }[]>
    > = {};

    const sortedLanguages = Object.keys(organizedData).sort((a, b) => {
        if (a === bookLanguage) return -1;
        if (b === bookLanguage) return 1;
        return a.localeCompare(b);
    });

    sortedLanguages.forEach((language) => {
        sortedData[language] = organizedData[language];
    });

    return sortedData;
};

const createPdf = async (req: Request, res: Response) => {
    const bookId = req.query.bookId;

    const letters = await Letters.findAll({
        attributes: ["id", "letter", "language", "letter_type"],
        where: {
            letter_type: {
                [Op.in]: sequelize.literal(
                    `(SELECT id FROM letter_types WHERE status = true)`
                ),
            },
        },
    });

    const languages = await Languages.findAll({
        attributes: ["language_code", "language"],
    });

    const letterTypes = await LetterTypes.findAll({
        attributes: ["id", "type", "language"],
        where: { status: true },
    });

    const bookDetails = await Books.findOne({
        where: { id: Number(bookId) },
        attributes: [
            "id",
            "name",
            "publisher_name",
            "published_year",
            "language",
        ],
    });

    const languageValue = languages?.find(
        (record) => record.language_code === bookDetails?.dataValues.language
    );

    const data = await fetchTagData(
        bookId,
        letterTypes,
        languages,
        languageValue?.dataValues.language,
        letters
    );

    const templateData = {
        bookName: bookDetails?.dataValues.name,
        publisher: bookDetails?.dataValues.publisher_name,
        year: bookDetails?.dataValues.published_year,
        language: languageValue?.dataValues.language,
        data: data,
    };

    const html = await edge.render("Templates::PDF", templateData);
    const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.setContent(html);

    const pdf = await page.pdf({
        format: "A4",
        margin: { top: 40, left: 40, right: 40, bottom: 40 },
    });

    await browser.close();

    res.setHeader("Content-Disposition", `attachment; filename=PDF.pdf`);
    res.contentType("application/pdf");
    res.send(pdf);
};

export default {
    createPdf,
};
