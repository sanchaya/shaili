import { Request, Response } from "express";
import { Books } from "../db/models/Books.js";
import { TaggedLetters } from "../db/models/TaggedLetters.js";
import { Letters } from "../db/models/Letters.js";
import puppeteer from "puppeteer";
import edge from "../../common/EdgeConfig.js";
import { Languages } from "../db/models/Languages.js";
import { LetterTypes } from "../db/models/LetterTypes.js";

const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await Books.findAll({
      attributes: ["id", "name", "status","language"],
    });
    return res.status(200).send(books);
  } catch (error) {
    return res.status(500).send("Something went wrong.Try again later.");
  }
};

interface IData {
  id: number;
  image: string;
  letter: string;
  type: string;
  language: string;
}

const handleDownloadClick = (taggedLetters,letterType,language) => {
  const letterIdMap: Record<string, boolean> = {};

  const mergedData: IData[] = taggedLetters
    .map((item) => {
      if (!letterIdMap[item.letter_id]) {
        letterIdMap[item.letter_id] = true;
        const matchingItem = letterType?.find(
          (val) => val.id === Number(item.letter.letter_type)
        );
        const languageValue = language?.find(
          (record) => record.language_code === matchingItem?.language
        );
        return {
          id: item.id,
          image: item.cropped_image,
          letter: item.letter.letter,
          type: matchingItem ? matchingItem.type : "",
          language: languageValue ? languageValue.language : "",
        };
      }
      return null;
    })
    .filter((item): item is IData => item !== null);

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

    return(organizedData);
};

const createPdf = async (req: Request, res: Response) => {
  const bookId = req.query.bookId;

  const taggedLetters = await TaggedLetters.findAll({
    where: { book_id: Number(bookId) },
    attributes: ["id", "book_id", "cropped_image", "letter_id", "tagged_by"],
    include: [
      {
        model: Letters,
        as: "letter",
        attributes: ["letter", "letter_type"],
      },
    ],
    order: [["updated_at", "DESC"]],
  });

  const languages = await Languages.findAll({
    attributes: ["language_code", "language"],
  });

  const letterTypes = await LetterTypes.findAll({
    attributes: ["id", "type", "language"],
});

  const bookDetails = await Books.findOne({
    where: { id: Number(bookId) },
    attributes: ["id", "name", "publisher_name","published_year", "language"],
  });

  const languageValue = languages?.find(
    (record) => record.language_code === bookDetails?.dataValues.language
  );

  const data = handleDownloadClick(taggedLetters,letterTypes,languages);

  const templateData = {
    bookName: bookDetails?.dataValues.name,
    publisher: bookDetails?.dataValues.publisher_name,
    year: bookDetails?.dataValues.published_year,
    language: languageValue?.dataValues.language,
    data: data
  };

  const html = await edge.render("Templates::PDF", templateData);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(html);

  const pdf = await page.pdf({ format: "A4" });

  await browser.close();

  res.setHeader('Content-Disposition',`attachment; filename=PDF.pdf`);
  res.contentType("application/pdf");
  res.send(pdf);
};

export default {
  getBooks,
  createPdf,
};