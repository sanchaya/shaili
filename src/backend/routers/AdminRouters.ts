import express from "express";
import TaggedLetterController from "../controllers/TaggedLetterController.js";
import RetriveBookImageController from "../controllers/RetriveBookImageController.js";
import CreateLetterController from "../controllers/CreateLetterController.js";
import DashboardController from "../controllers/DashboardController.js";
import CommentsController from "../controllers/CommentsController.js";
import PdfController from "../controllers/PdfController.js";
import LetterTypeController from "../controllers/LetterTypeController.js";
import ProfileController from "../controllers/ProfileController.js";
import { fetchBooksForLanguage, fetchAllLanguages, getAllLanguageCodes } from "../services/InternetArchiveService.js";
import { searchBooks, getBooksByLanguage, getBooksForTagging } from "../services/BookCacheService.js";
import { addJob, getJob, getAllJobs, getQueueStats } from "../services/JobQueue.js";

const AdminRouter = express.Router();

AdminRouter.get("/total-pages", RetriveBookImageController.getTotalPages);
AdminRouter.get("/fetch-page", RetriveBookImageController.renderImage);
AdminRouter.post("/prefetch-pages", RetriveBookImageController.prefetchBookPages);
AdminRouter.get("/book-info", RetriveBookImageController.getBookInfo);
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
AdminRouter.get("/get-books-with-tags", DashboardController.getBooksWithTags);
AdminRouter.get("/get-tagged-letters", TaggedLetterController.getTaggedLetterByUser);
AdminRouter.get("/get-tagged-percentage", TaggedLetterController.calculateTagPercentage);
AdminRouter.get("/pdf-generator", PdfController.createPdf);
AdminRouter.get("/get-comments", CommentsController.getComments);
AdminRouter.post("/add-comment", CommentsController.addComment);
AdminRouter.get("/get-users", CommentsController.getUsers);
AdminRouter.post("/edit-comment", CommentsController.editComment);
AdminRouter.get("/download-tags-zip", TaggedLetterController.downloadTags);
AdminRouter.post("/update-letter-type-status", LetterTypeController.updateLetterTypeStatus);
AdminRouter.get("/dashboard-stats", DashboardController.getDashboardStats);

// Profile management endpoints
AdminRouter.get("/profile", ProfileController.getProfile);
AdminRouter.put("/profile", ProfileController.updateProfile);
AdminRouter.post("/profile/avatar", ProfileController.uploadAvatar);

// Book search and optimized fetching
AdminRouter.get("/search-books", async (req, res) => {
    try {
        const { q, language, limit } = req.query;
        const books = await searchBooks(q as string, language as string, parseInt(limit as string) || 20);
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.get("/books-by-language", async (req, res) => {
    try {
        const { language, limit, offset } = req.query;
        if (!language) return res.status(400).json({ error: "language required" });
        const books = await getBooksByLanguage(language as string, parseInt(limit as string) || 50, parseInt(offset as string) || 0);
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.get("/books-for-tagging", async (req, res) => {
    try {
        const { language, status } = req.query;
        if (!language) return res.status(400).json({ error: "language required" });
        const books = await getBooksForTagging(language as string, status ? parseInt(status as string) : undefined);
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Internet Archive book fetching endpoints (using job queue)
AdminRouter.get("/ia-languages", async (req, res) => {
    try {
        const codes = getAllLanguageCodes();
        res.json({ languages: codes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.post("/ia-fetch-language", async (req, res) => {
    try {
        const { langCode, maxBooks = 50 } = req.body;
        if (!langCode) {
            return res.status(400).json({ error: "langCode is required" });
        }
        
        const jobId = addJob("fetch-books", { langCode, maxBooks });
        
        res.json({ 
            message: `Fetch queued for ${langCode}`, 
            status: "queued",
            jobId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.post("/ia-fetch-all", async (req, res) => {
    try {
        const { maxPerLanguage = 50, concurrency = 3 } = req.body;
        
        const jobId = addJob("fetch-all-languages", { maxPerLanguage, concurrency });
        
        res.json({ 
            message: "Fetch queued for all languages", 
            status: "queued",
            jobId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.get("/ia-status/:langCode", async (req, res) => {
    try {
        const { langCode } = req.params;
        const { Books } = await import("../db/models/Books.js");
        
        const count = await Books.count({ where: { language: langCode } });
        const latest = await Books.findOne({
            where: { language: langCode },
            order: [["created_at", "DESC"]],
            attributes: ["identifier", "name", "created_at"]
        });
        
        res.json({ 
            language: langCode, 
            bookCount: count,
            latestBook: latest
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Job Queue endpoints
AdminRouter.post("/jobs/fetch-books", async (req, res) => {
    try {
        const { langCode, maxBooks = 100 } = req.body;
        if (!langCode) return res.status(400).json({ error: "langCode required" });
        
        const jobId = addJob("fetch-books", { langCode, maxBooks });
        res.json({ jobId, status: "queued" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.post("/jobs/fetch-all-languages", async (req, res) => {
    try {
        const { maxPerLanguage = 50, concurrency = 3 } = req.body;
        const jobId = addJob("fetch-all-languages", { maxPerLanguage, concurrency });
        res.json({ jobId, status: "queued" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.get("/jobs/stats", async (req, res) => {
    try {
        const stats = getQueueStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.get("/jobs", async (req, res) => {
    try {
        const jobs = getAllJobs();
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.get("/jobs/:jobId", async (req, res) => {
    try {
        const job = getJob(req.params.jobId);
        if (!job) return res.status(404).json({ error: "Job not found" });
        res.json(job);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default AdminRouter;
