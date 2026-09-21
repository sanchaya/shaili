import { Books } from "../db/models/Books.js";
import { Op } from "sequelize";
import axios from "axios";
import xml2js from "xml2js";
import fs from "fs";
import path from "path";
import * as url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const CACHE_DIR = path.resolve(__dirname, "../../public/book-cache");

if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

interface BookPageCache {
    identifier: string;
    totalPages: number;
    pages: Record<number, string>;
    lastFetched: Date;
}

export async function getBookFromCache(identifier: string): Promise<BookPageCache | null> {
    const cacheFile = path.join(CACHE_DIR, `${identifier}.json`);
    if (fs.existsSync(cacheFile)) {
        const data = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
        return data as BookPageCache;
    }
    return null;
}

export async function saveBookToCache(cache: BookPageCache): Promise<void> {
    const cacheFile = path.join(CACHE_DIR, `${cache.identifier}.json`);
    fs.writeFileSync(cacheFile, JSON.stringify(cache));
}

export async function getCachedPage(identifier: string, pageNum: number): Promise<string | null> {
    const cache = await getBookFromCache(identifier);
    if (cache?.pages[pageNum]) {
        return cache.pages[pageNum];
    }
    return null;
}

export async function cachePageImage(identifier: string, pageNum: number, imageBuffer: Buffer): Promise<string> {
    const cache = await getBookFromCache(identifier) || { identifier, totalPages: 0, pages: {}, lastFetched: new Date() };
    
    const pageDir = path.join(CACHE_DIR, identifier);
    if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir, { recursive: true });
    }
    
    const fileName = `page-${pageNum}.png`;
    const filePath = path.join(pageDir, fileName);
    fs.writeFileSync(filePath, imageBuffer);
    
    cache.pages[pageNum] = `/book-cache/${identifier}/${fileName}`;
    cache.lastFetched = new Date();
    cache.totalPages = Math.max(cache.totalPages, pageNum);
    
    await saveBookToCache(cache);
    return cache.pages[pageNum];
}

export async function getTotalPagesCached(identifier: string): Promise<number> {
    const cache = await getBookFromCache(identifier);
    if (cache?.totalPages) return cache.totalPages;
    
    try {
        // Use the archive.org metadata API which reliably provides the page count
        const metadataUrl = `https://archive.org/metadata/${identifier}`;
        const response = await axios.get(metadataUrl, { timeout: 10000 });
        const imagecount = response.data?.metadata?.imagecount;
        const totalPages = imagecount ? Number(imagecount) : 0;
        
        if (totalPages) {
            const newCache = await getBookFromCache(identifier) || { identifier, totalPages: 0, pages: {}, lastFetched: new Date() };
            newCache.totalPages = totalPages;
            newCache.lastFetched = new Date();
            await saveBookToCache(newCache);
        }
        return totalPages;
    } catch {
        return 0;
    }
}

export async function fetchAndCachePage(identifier: string, pageNum: number): Promise<string | null> {
    const cached = await getCachedPage(identifier, pageNum);
    if (cached) return cached;
    
    try {
        const imageUrl = `https://archive.org/download/${identifier}/page/n${pageNum}`;
        const response = await axios.get(imageUrl, { 
            responseType: "arraybuffer",
            timeout: 15000 
        });
        
        if (response.data) {
            return await cachePageImage(identifier, pageNum, Buffer.from(response.data));
        }
    } catch (error) {
        console.error(`Failed to fetch page ${pageNum} for ${identifier}:`, error);
    }
    return null;
}

export async function prefetchPages(identifier: string, pageNumbers: number[]): Promise<void> {
    const promises = pageNumbers.map(page => fetchAndCachePage(identifier, page));
    await Promise.allSettled(promises);
}

export async function getBookMetadata(identifier: string) {
    const book = await Books.findOne({ 
        where: { identifier },
        attributes: ["id", "name", "identifier", "language", "published_year", "publisher_name", "url"]
    });
    return book;
}

export async function searchBooks(query: string, language?: string, limit = 20) {
    const where: any = {
        [Op.or]: [
            { name: { [Op.like]: `%${query}%` } },
            { identifier: { [Op.like]: `%${query}%` } }
        ]
    };
    if (language) where.language = language;
    
    return Books.findAll({
        where,
        attributes: ["id", "name", "identifier", "language", "published_year", "publisher_name", "url"],
        limit,
        order: [["created_at", "DESC"]]
    });
}

export async function getBooksByLanguage(language: string, limit = 50, offset = 0) {
    return Books.findAll({
        where: { language },
        attributes: ["id", "name", "identifier", "language", "published_year", "publisher_name", "url", "status"],
        limit,
        offset,
        order: [["published_year", "ASC"]]
    });
}

export async function getBooksForTagging(language: string, status?: number) {
    const where: any = { language };
    if (status) where.status = status;
    
    return Books.findAll({
        where,
        attributes: ["id", "name", "identifier", "language", "published_year", "publisher_name", "url", "status"],
        order: [["published_year", "ASC"], ["created_at", "DESC"]]
    });
}