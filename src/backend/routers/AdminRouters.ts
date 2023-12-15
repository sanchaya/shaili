import express from "express";
import TaggedLetterController from "../controllers/TaggedLetterController.js";
import RetriveBookImageController from "../controllers/RetriveBookImageController.js";
import CreateLetterController from "../controllers/CreateLetterController.js";
import DashboardController from "../controllers/DashboardController.js";
import CommentsController from "../controllers/CommentsController.js";
import PdfController from "../controllers/PdfController.js";

const AdminRouter = express.Router();

AdminRouter.get("/total-pages", RetriveBookImageController.getTotalPages);
AdminRouter.get("/fetch-page", RetriveBookImageController.renderImage);
AdminRouter.get("/tagged-letter", TaggedLetterController.getTaggedLetter);
AdminRouter.get("/get-letters", TaggedLetterController.getLetters);
AdminRouter.get("/get-lettertypes", TaggedLetterController.getLetterTypes);
AdminRouter.post("/save-tag", TaggedLetterController.saveTag);
AdminRouter.delete("/delete-tag", TaggedLetterController.deleteTaggedLetter);
AdminRouter.post("/update-tag", TaggedLetterController.updateTag);
AdminRouter.get("/get-languages", CreateLetterController.getLanguages);
AdminRouter.post("/add-letter", CreateLetterController.addUserDefinedLetter);
AdminRouter.post("/new-letter", CreateLetterController.addLetter);
AdminRouter.post("/edit-letter", CreateLetterController.editLetter);
AdminRouter.get("/get-books", DashboardController.getBooks);
AdminRouter.get("/get-tagged-letters",TaggedLetterController.getTaggedLetterByUser);
AdminRouter.get("/get-tagged-percentage",TaggedLetterController.calculateTagPercentage);
AdminRouter.get("/pdf-generator", PdfController.createPdf);
AdminRouter.get("/get-comments", CommentsController.getComments);
AdminRouter.post("/add-comment", CommentsController.addComment);
AdminRouter.get("/get-users", CommentsController.getUsers);
AdminRouter.post("/edit-comment", CommentsController.editComment);

export default AdminRouter;
