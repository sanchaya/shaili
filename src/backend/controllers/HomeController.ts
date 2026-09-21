import { Request, Response } from "express";
import { Op } from "sequelize";
import edge from "../../common/EdgeConfig.js";
import { Books } from "../db/models/Books.js";
import { Letters } from "../db/models/Letters.js";
import { LetterTypes } from "../db/models/LetterTypes.js";
import { Languages } from "../db/models/Languages.js";
import { TaggedLetters } from "../db/models/TaggedLetters.js";

const INVALID_YEARS = new Set(["", "NA", "NULL", "null"]);

const renderHome = async (req: Request, res: Response) => {
    try {
        const [bookCount, letterCount, letterTypeCount, languageCount, taggedCount, languages] =
            await Promise.all([
                Books.count(),
                Letters.count(),
                LetterTypes.count({ where: { status: true } }),
                Languages.count(),
                TaggedLetters.count(),
                Languages.findAll({ attributes: ["language_code", "language"] }),
            ]);

        const languageMap: Record<string, string> = {};
        languages.forEach((lang: any) => {
            languageMap[lang.language_code] = lang.language;
        });

        const activeLetterTypes = await LetterTypes.findAll({
            where: { status: true },
            order: [["id", "ASC"]],
        });

        const letterTypeShowcase = await Promise.all(
            activeLetterTypes.map(async (letterType: any) => {
                const [letters, count] = await Promise.all([
                    Letters.findAll({
                        where: { letter_type: letterType.id },
                        attributes: ["letter"],
                        limit: 14,
                        order: [["id", "ASC"]],
                    }),
                    Letters.count({
                        where: { letter_type: letterType.id },
                    }),
                ]);
                return {
                    type: letterType.type,
                    language: letterType.language,
                    languageName: languageMap[letterType.language] || letterType.language,
                    count,
                    letters: letters.map((letter: any) => letter.letter),
                };
            })
        );

        const books = await Books.findAll({
            attributes: [
                "id",
                "name",
                "language",
                "published_year",
                "publisher_name",
                "printer_name",
                "printer_location",
            ],
            order: [["published_year", "ASC"]],
            limit: 120,
        });

        const seenBooks = new Set<string>();

        // Normalize a book name for comparison: lowercase, strip punctuation, collapse spaces
        const normalizeName = (name: string): string =>
            String(name)
                .toLowerCase()
                .replace(/[^a-z0-9\u0C80-\u0CFF\u0980-\u09FF\u0B80-\u0BFF\u0B00-\u0B7F\s]/g, "")
                .replace(/\s+/g, " ")
                .trim();

        // Character bigram set for similarity comparison
        const bigrams = (str: string): Set<string> => {
            const grams = new Set<string>();
            for (let i = 0; i < str.length - 1; i++) {
                grams.add(str.slice(i, i + 2));
            }
            return grams;
        };

        // Jaccard-like similarity (shared bigrams / smaller set) to catch OCR/typo variants
        const similar = (a: string, b: string): boolean => {
            const ga = bigrams(a);
            const gb = bigrams(b);
            if (ga.size === 0 || gb.size === 0) return a === b;
            let shared = 0;
            ga.forEach((g) => {
                if (gb.has(g)) shared++;
            });
            return shared / Math.min(ga.size, gb.size) >= 0.72;
        };

        const isDuplicate = (name: string): boolean => {
            const norm = normalizeName(name);
            for (const existing of seenBooks) {
                if (similar(existing, norm)) return true;
            }
            seenBooks.add(norm);
            return false;
        };

        const featuredBooks = books
            .filter((book: any) => !INVALID_YEARS.has(String(book.published_year)))
            .filter((book: any) => {
                const name = String(book.name || "").trim();
                if (!name) return false;
                // Skip obvious placeholder / non-archive seed data
                if (name.toLowerCase().startsWith("the lightning thief")) return false;
                return !isDuplicate(name);
            })
            .slice(0, 6)
            .map((book: any) => ({
                ...book.get(),
                languageName: languageMap[book.language] || book.language,
            }));

        const oldestYear = featuredBooks.length
            ? featuredBooks[0].published_year
            : null;

        const html = await edge.render("Pages::Home", {
            stats: {
                books: bookCount,
                letters: letterCount,
                letterTypes: letterTypeCount,
                languages: languageCount,
                tagged: taggedCount,
            },
            letterTypes: letterTypeShowcase,
            featuredBooks,
            oldestYear,
        });

        res.send(html);
    } catch (error) {
        console.error("Failed to render home page", error);
        res.status(500).send("Something went wrong. Try again later.");
    }
};

export default { renderHome };