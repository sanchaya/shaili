import { Books } from "../db/models/Books.js";
import { Languages } from "../db/models/Languages.js";
import { Op } from "sequelize";

interface Job {
    id: string;
    type: "fetch-books" | "fetch-all-languages";
    payload: any;
    status: "pending" | "running" | "completed" | "failed";
    progress: number;
    total: number;
    result?: any;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
}

const jobQueue: Map<string, Job> = new Map();
let isProcessing = false;

function generateJobId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function addJob(type: Job["type"], payload: any): string {
    const jobId = generateJobId();
    const job: Job = {
        id: jobId,
        type,
        payload,
        status: "pending",
        progress: 0,
        total: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    jobQueue.set(jobId, job);
    processQueue();
    return jobId;
}

export function getJob(jobId: string): Job | undefined {
    return jobQueue.get(jobId);
}

export function getAllJobs(): Job[] {
    return Array.from(jobQueue.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

async function processQueue() {
    if (isProcessing) return;
    
    const pendingJob = Array.from(jobQueue.values()).find(j => j.status === "pending");
    if (!pendingJob) return;
    
    isProcessing = true;
    
    try {
        await runJob(pendingJob);
    } catch (error) {
        console.error(`Job ${pendingJob.id} failed:`, error);
        pendingJob.status = "failed";
        pendingJob.error = error instanceof Error ? error.message : "Unknown error";
        pendingJob.updatedAt = new Date();
    } finally {
        isProcessing = false;
        processQueue();
    }
}

async function runJob(job: Job) {
    job.status = "running";
    job.updatedAt = new Date();
    
    if (job.type === "fetch-books") {
        await runFetchBooksJob(job);
    } else if (job.type === "fetch-all-languages") {
        await runFetchAllLanguagesJob(job);
    }
    
    job.status = "completed";
    job.updatedAt = new Date();
}

async function runFetchBooksJob(job: Job) {
    const { langCode, maxBooks = 100 } = job.payload;
    const langName = getLanguageName(langCode);
    if (!langName) throw new Error(`Unknown language code: ${langCode}`);
    
    const { fetchBooksForLanguage } = await import("./InternetArchiveService.js");
    const count = await fetchBooksForLanguage(langCode, langName, maxBooks);
    job.result = { count };
    job.progress = count;
    job.total = maxBooks;
}

async function runFetchAllLanguagesJob(job: Job) {
    const { maxPerLanguage = 50, concurrency = 3 } = job.payload;
    
    const { fetchAllLanguages, getAllLanguageCodes } = await import("./InternetArchiveService.js");
    const codes = getAllLanguageCodes();
    job.total = codes.length * maxPerLanguage;
    
    const results = await fetchAllLanguages(maxPerLanguage, concurrency);
    job.result = results;
    job.progress = Object.values(results).reduce((a, b) => a + b, 0);
}

const LANGUAGE_MAP: Record<string, string> = {
    "hin": "Hindi", "ben": "Bengali", "tel": "Telugu", "mar": "Marathi",
    "tam": "Tamil", "urd": "Urdu", "guj": "Gujarati", "kan": "Kannada",
    "mal": "Malayalam", "ori": "Odia", "pan": "Punjabi", "asm": "Assamese",
    "mai": "Maithili", "san": "Sanskrit", "sat": "Santali", "kas": "Kashmiri",
    "nep": "Nepali", "snd": "Sindhi", "kok": "Konkani", "doi": "Dogri",
    "mni": "Manipuri", "brx": "Bodo", "eng": "English"
};

function getLanguageName(code: string): string | undefined {
    return LANGUAGE_MAP[code];
}

export function getQueueStats() {
    const jobs = Array.from(jobQueue.values());
    return {
        pending: jobs.filter(j => j.status === "pending").length,
        running: jobs.filter(j => j.status === "running").length,
        completed: jobs.filter(j => j.status === "completed").length,
        failed: jobs.filter(j => j.status === "failed").length,
        total: jobs.length
    };
}