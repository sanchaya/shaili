import express from "express";
import TaggedLetterController from "../controllers/TaggedLetterController.js";

const AdminRouter = express.Router();

AdminRouter.get(
  "/tagged-letter",
  TaggedLetterController.getTaggedLetter
);

export default AdminRouter;
