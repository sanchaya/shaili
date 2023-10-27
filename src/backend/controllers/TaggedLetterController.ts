import { Request, Response } from "express";
import { Letters } from "../db/models/Letters.js";
import { TaggedLetters } from "../db/models/TaggedLetters.js";

const getTaggedLetter = async (req: Request, res: Response) => {
  const bookId = req.query.bookId; 
   
    try {
        const taggedLetters = await TaggedLetters.findAll({
          where: { book_id:  bookId as string},
          include: 
            {
              model: Letters,
              as: 'letter', 
              attributes: ['letter','letter_type']
            },
          
          });
      
          res.json(taggedLetters);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  export default {
    getTaggedLetter
  };