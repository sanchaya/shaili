import express from "express";
import TaggedLetterController from "../controllers/TaggedLetterController.js";
import RetriveBookImageController from "../controllers/RetriveBookImageController.js";

const AdminRouter = express.Router();

AdminRouter.get("/total-pages", RetriveBookImageController.getTotalPages);
AdminRouter.get("/fetch-page", RetriveBookImageController.renderImage);
AdminRouter.get("/tagged-letter", TaggedLetterController.getTaggedLetter);
AdminRouter.get("/get-letters", TaggedLetterController.getLetters);
AdminRouter.get("/get-lettertypes", TaggedLetterController.getLetterTypes);
AdminRouter.post("/save-tag", TaggedLetterController.saveTag);
AdminRouter.delete("/delete-tag", TaggedLetterController.deleteTaggedLetter);

export default AdminRouter;
