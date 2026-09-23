import express from "express";
import TaggedLetterController from "../controllers/TaggedLetterController.js";
import RetriveBookImageController from "../controllers/RetriveBookImageController.js";
import CreateLetterController from "../controllers/CreateLetterController.js";
import DashboardController from "../controllers/DashboardController.js";
import CommentsController from "../controllers/CommentsController.js";
import PdfController from "../controllers/PdfController.js";
import LetterTypeController from "../controllers/LetterTypeController.js";
import ProfileController from "../controllers/ProfileController.js";
import PageRotationController from "../controllers/PageRotationController.js";
import { fetchBooksForLanguage, fetchAllLanguages, getAllLanguageCodes, parseArchiveIdentifier, fetchArchiveBook } from "../services/InternetArchiveService.js";
import { Books } from "../db/models/Books.js";
import { searchBooks, getBooksByLanguage, getBooksForTagging } from "../services/BookCacheService.js";
import { addJob, getJob, getAllJobs, getQueueStats } from "../services/JobQueue.js";
import { Letters } from "../db/models/Letters.js";
import Users from "../db/models/Users.js";
import UserRoles from "../db/models/UserRoles.js";
import RolePermissions from "../db/models/RolePermissions.js";
import { clearPermissionCache } from "../utils/permissions.js";

const AdminRouter = express.Router();

// Guarded per route: this router shares /admin with AdminJS, so a blanket use() would block /admin/login.
const requireLogin = (req: any, res: any, next: any) =>
    req.session?.adminUser ? next() : res.status(401).json({ error: "Not authenticated" });
const requireAdmin = (req: any, res: any, next: any) =>
    req.session?.adminUser?.role === 1 ? next() : res.status(403).json({ error: "Admin only" });

AdminRouter.get("/total-pages", requireLogin, RetriveBookImageController.getTotalPages);
AdminRouter.get("/fetch-page", requireLogin, RetriveBookImageController.renderImage);
AdminRouter.post("/prefetch-pages", requireLogin, RetriveBookImageController.prefetchBookPages);
AdminRouter.get("/book-info", requireLogin, RetriveBookImageController.getBookInfo);
AdminRouter.get("/archive-metadata", requireLogin, async (req, res) => {
    const identifier = parseArchiveIdentifier(String(req.query.url ?? ""));
    if (!identifier) return res.status(400).json({ error: "Not an archive.org book URL" });
    const existing = await Books.findOne({ where: { identifier }, attributes: ["id", "name"] });
    if (existing) return res.status(409).json({ error: `Already added as "${existing.name}"`, id: existing.id });
    try {
        const book = await fetchArchiveBook(identifier);
        return book ? res.json(book) : res.status(404).json({ error: "No such item on archive.org" });
    } catch {
        return res.status(502).json({ error: "Could not reach archive.org, try again" });
    }
});
AdminRouter.get("/page-rotations", requireLogin, PageRotationController.getRotations);
AdminRouter.post("/page-rotation", requireLogin, PageRotationController.setRotation);
AdminRouter.get("/tagged-letter", requireLogin, TaggedLetterController.getTaggedLetter);
AdminRouter.get("/get-letters", requireLogin, TaggedLetterController.getLetters);
AdminRouter.get("/get-lettertypes", requireLogin, TaggedLetterController.getLetterTypes);
AdminRouter.post("/save-tag", requireLogin, TaggedLetterController.saveTag);
AdminRouter.delete("/delete-tag", requireLogin, TaggedLetterController.deleteTaggedLetter);
AdminRouter.post("/update-tag", requireLogin, TaggedLetterController.updateTag);
AdminRouter.get("/get-languages", requireLogin, CreateLetterController.getLanguages);
AdminRouter.post("/add-letter", requireLogin, CreateLetterController.addUserDefinedLetter);
AdminRouter.post("/new-letter", requireLogin, CreateLetterController.addLetter);
AdminRouter.post("/edit-letter", requireLogin, CreateLetterController.editLetter);
AdminRouter.get("/get-books", requireLogin, DashboardController.getBooks);
AdminRouter.get("/get-books-with-tags", requireLogin, DashboardController.getBooksWithTags);
AdminRouter.get("/get-tagged-letters", requireLogin, TaggedLetterController.getTaggedLetterByUser);
AdminRouter.get("/get-tagged-percentage", requireLogin, TaggedLetterController.calculateTagPercentage);
AdminRouter.get("/pdf-generator", requireLogin, PdfController.createPdf);
AdminRouter.get("/get-comments", requireLogin, CommentsController.getComments);
AdminRouter.post("/add-comment", requireLogin, CommentsController.addComment);
AdminRouter.get("/get-users", requireLogin, CommentsController.getUsers);
AdminRouter.post("/edit-comment", requireLogin, CommentsController.editComment);
AdminRouter.get("/download-tags-zip", requireLogin, TaggedLetterController.downloadTags);
AdminRouter.post("/update-letter-type-status", requireLogin, LetterTypeController.updateLetterTypeStatus);
AdminRouter.get("/dashboard-stats", requireLogin, DashboardController.getDashboardStats);

// Profile management endpoints
AdminRouter.get("/profile", requireLogin, ProfileController.getProfile);
AdminRouter.put("/profile", requireLogin, ProfileController.updateProfile);
AdminRouter.post("/profile/avatar", requireLogin, ProfileController.uploadAvatar);

// Book search and optimized fetching
AdminRouter.get("/search-books", requireLogin, async (req, res) => {
    try {
        const { q, language, limit } = req.query;
        const books = await searchBooks(q as string, language as string, parseInt(limit as string) || 20);
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.get("/books-by-language", requireLogin, async (req, res) => {
    try {
        const { language, limit, offset } = req.query;
        if (!language) return res.status(400).json({ error: "language required" });
        const books = await getBooksByLanguage(language as string, parseInt(limit as string) || 50, parseInt(offset as string) || 0);
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.get("/books-for-tagging", requireLogin, async (req, res) => {
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
AdminRouter.get("/ia-languages", requireAdmin, async (req, res) => {
    try {
        const codes = getAllLanguageCodes();
        res.json({ languages: codes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.post("/ia-fetch-language", requireAdmin, async (req, res) => {
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

AdminRouter.post("/ia-fetch-all", requireAdmin, async (req, res) => {
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

AdminRouter.get("/ia-status/:langCode", requireAdmin, async (req, res) => {
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
AdminRouter.post("/jobs/fetch-books", requireAdmin, async (req, res) => {
    try {
        const { langCode, maxBooks = 100 } = req.body;
        if (!langCode) return res.status(400).json({ error: "langCode required" });
        
        const jobId = addJob("fetch-books", { langCode, maxBooks });
        res.json({ jobId, status: "queued" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.post("/jobs/fetch-all-languages", requireAdmin, async (req, res) => {
    try {
        const { maxPerLanguage = 50, concurrency = 3 } = req.body;
        const jobId = addJob("fetch-all-languages", { maxPerLanguage, concurrency });
        res.json({ jobId, status: "queued" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.get("/jobs/stats", requireAdmin, async (req, res) => {
    try {
        const stats = getQueueStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.get("/jobs", requireAdmin, async (req, res) => {
    try {
        const jobs = getAllJobs();
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.get("/jobs/:jobId", requireAdmin, async (req, res) => {
    try {
        const job = getJob(req.params.jobId);
        if (!job) return res.status(404).json({ error: "Job not found" });
        res.json(job);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.post("/backfill-unicode", requireAdmin, async (req, res) => {
    try {
        const letters = await Letters.findAll({
            attributes: ["id", "letter", "unicode"],
        });

        const getUnicodeValue = (char: string): string => {
            if (!char || char.length === 0) return "";
            const codePoint = char.codePointAt(0);
            if (!codePoint) return "";
            return "U+" + codePoint.toString(16).toUpperCase().padStart(4, "0");
        };

        let updated = 0;
        let skipped = 0;

        for (const letter of letters) {
            const unicodeValue = getUnicodeValue(letter.letter);
            if (!unicodeValue || letter.unicode === unicodeValue) {
                skipped++;
                continue;
            }
            await Letters.update(
                { unicode: unicodeValue },
                { where: { id: letter.id } }
            );
            updated++;
        }

        res.json({ updated, skipped, total: letters.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User management endpoints
AdminRouter.get("/pending-users", requireAdmin, async (req, res) => {
    try {
        const users = await Users.findAll({
            where: { is_active: false },
            attributes: ["id", "name", "email", "role", "created_at"],
            include: [{ model: UserRoles, attributes: ["role"] }],
            order: [["created_at", "DESC"]],
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.post("/approve-user", requireAdmin, async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: "userId required" });
        await Users.update({ is_active: true }, { where: { id: userId } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.post("/reject-user", requireAdmin, async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: "userId required" });
        await Users.destroy({ where: { id: userId } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.get("/user-stats", requireAdmin, async (req, res) => {
    try {
        const total = await Users.count();
        const active = await Users.count({ where: { is_active: true } });
        const pending = await Users.count({ where: { is_active: false } });
        const roles = await UserRoles.findAll({ attributes: ["id", "role"] });
        const roleBreakdown = await Promise.all(
            roles.map(async (r) => ({
                id: r.id,
                role: r.role,
                count: await Users.count({ where: { role: r.id } }),
            }))
        );
        res.json({ total, active, pending, roleBreakdown });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.get("/get-permissions", async (req: any, res) => {
    try {
        const roleId = req.session?.adminUser?.role;
        if (!roleId) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        if (roleId === 1) {
            return res.json([]);
        }
        const permissions = await RolePermissions.findAll({
            where: { role_id: roleId, allowed: true },
            raw: true,
        });
        res.json(permissions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.get("/role-permissions-matrix", requireAdmin, async (_req, res) => {
    try {
        const roles = await UserRoles.findAll({ attributes: ["id", "role"], order: [["id", "ASC"]], raw: true });
        const permissions = await RolePermissions.findAll({ attributes: ["role_id", "resource", "action", "allowed"], raw: true });
        res.json({ roles, permissions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

AdminRouter.post("/role-permissions-matrix", requireAdmin, async (req, res) => {
    try {
        const { role_id, resource, action, allowed } = req.body;
        if (!role_id || !resource || !action) return res.status(400).json({ error: "role_id, resource, action required" });
        const [perm, created] = await RolePermissions.findOrCreate({
            where: { role_id, resource, action },
            defaults: { role_id, resource, action, allowed: !!allowed } as any,
        });
        if (!created) await perm.update({ allowed: !!allowed });
        clearPermissionCache(role_id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default AdminRouter;
