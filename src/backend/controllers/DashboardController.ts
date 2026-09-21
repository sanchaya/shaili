import { Request, Response } from "express";
import { Op } from "sequelize";
import { Books } from "../db/models/Books.js";
import { Languages } from "../db/models/Languages.js";
import { LetterTypes } from "../db/models/LetterTypes.js";
import { Letters } from "../db/models/Letters.js";
import BookStatus from "../db/models/BookStatus.js";
import { sequelize } from "../db/config/config.js";

const getBooks = async (req: Request, res: Response) => {
    try {
        const books = await Books.findAll({
            attributes: [
                "id",
                "name",
                "status",
                "language",
                "printer_name",
                "printer_location",
                "published_year",
            ],
        });
        return res.status(200).send(books);
    } catch (error) {
        return res.status(500).send("Something went wrong.Try again later.");
    }
};

const getBooksWithTags = async (req: Request, res: Response) => {
    try {
        const { language } = req.query;
        const where: any = {
            id: {
                [Op.in]: sequelize.literal(
                    `(SELECT DISTINCT book_id FROM tagged_letters)`
                ),
            },
            status: { [Op.in]: [2, 4] }, // In Progress or Completed
        };
        if (language) {
            where.language = language;
        }
        const books = await Books.findAll({
            attributes: [
                "id",
                "name",
                "status",
                "language",
                "printer_name",
                "printer_location",
                "published_year",
            ],
            where,
            order: [["name", "ASC"]],
        });
        return res.status(200).send(books);
    } catch (error) {
        return res.status(500).send("Something went wrong.Try again later.");
    }
};

const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const [
            totalLanguages,
            totalLetterTypes,
            totalLetters,
            totalBooks,
            booksByStatus,
            booksByLanguage,
            recentBooks,
            languagesWithStats
        ] = await Promise.all([
            Languages.count(),
            LetterTypes.count(),
            Letters.count(),
            Books.count(),
            Books.findAll({
                attributes: ['status', [sequelize.fn('COUNT', '*'), 'count']],
                group: ['status'],
                raw: true
            }),
            Books.findAll({
                attributes: ['language', [sequelize.fn('COUNT', '*'), 'count']],
                group: ['language'],
                raw: true,
                order: [[sequelize.fn('COUNT', '*'), 'DESC']],
                limit: 10
            }),
            Books.findAll({
                attributes: ['id', 'name', 'language', 'status', 'created_at'],
                order: [['created_at', 'DESC']],
                limit: 5
            }),
            Languages.findAll({
                attributes: ['language_code', 'language', 'native_name', 'script'],
                include: [
                    { model: LetterTypes, as: 'letterTypes', attributes: ['id'], required: false },
                    { model: Books, as: 'books', attributes: ['id'], required: false }
                ]
            })
        ]);

        const statusMap = await BookStatus.findAll({ attributes: ['id', 'status'] });
        const statusNames = Object.fromEntries(statusMap.map(s => [s.id, s.status]));

        const booksByStatusFormatted = booksByStatus.map((b: any) => ({
            status_id: b.status,
            status: statusNames[b.status] || `Status ${b.status}`,
            count: parseInt(b.count)
        }));

        const languagesWithCounts = languagesWithStats.map((l: any) => ({
            language_code: l.language_code,
            language: l.language,
            native_name: l.native_name,
            script: l.script,
            letter_types_count: l.letterTypes?.length || 0,
            letters_count: 0,
            books_count: l.books?.length || 0
        }));

        // Get letters count per language
        const lettersByLanguage = await Letters.findAll({
            attributes: ['language', [sequelize.fn('COUNT', '*'), 'count']],
            group: ['language'],
            raw: true
        });
        const lettersMap = Object.fromEntries(lettersByLanguage.map((l: any) => [l.language, parseInt(l.count)]));
        languagesWithCounts.forEach(l => {
            l.letters_count = lettersMap[l.language_code] || 0;
        });

        return res.status(200).send({
            summary: {
                total_languages: totalLanguages,
                total_letter_types: totalLetterTypes,
                total_letters: totalLetters,
                total_books: totalBooks
            },
            books_by_status: booksByStatusFormatted,
            books_by_language: booksByLanguage,
            recent_books: recentBooks,
            languages: languagesWithCounts
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return res.status(500).send("Something went wrong.Try again later.");
    }
};

export default {
    getBooks,
    getBooksWithTags,
    getDashboardStats,
};
