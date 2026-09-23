import { Books } from "../db/models/Books.js";
import { Languages } from "../db/models/Languages.js";
import { Op } from "sequelize";

interface IABookDoc {
    identifier: string;
    title: string;
    creator?: string | string[];
    date?: string;
    publisher?: string | string[];
    city?: string | string[];
    language?: string;
    mediatype?: string;
    collection?: string[];
}

interface IAResponse {
    response?: {
        docs: IABookDoc[];
        numFound: number;
    };
}

const LANGUAGE_MAP: Record<string, string> = {
    "hin": "Hindi",
    "ben": "Bengali",
    "tel": "Telugu",
    "mar": "Marathi",
    "tam": "Tamil",
    "urd": "Urdu",
    "guj": "Gujarati",
    "kan": "Kannada",
    "mal": "Malayalam",
    "ori": "Odia",
    "pan": "Punjabi",
    "asm": "Assamese",
    "mai": "Maithili",
    "san": "Sanskrit",
    "sat": "Santali",
    "kas": "Kashmiri",
    "nep": "Nepali",
    "snd": "Sindhi",
    "kok": "Konkani",
    "doi": "Dogri",
    "mni": "Manipuri",
    "brx": "Bodo",
    "eng": "English"
};

const BASE_URL = "https://archive.org/advancedsearch.php";
const FIELDS = "identifier,title,creator,date,publisher,city,language,mediatype,collection";

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizeField(field: string | string[] | undefined): string | null {
    if (!field) return null;
    if (Array.isArray(field)) return field.join(", ");
    return field;
}

function extractYear(date: string | undefined): string | null {
    if (!date) return null;
    const year = String(date).substring(0, 4);
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1800 || yearNum > 1989) return null;
    return year;
}

async function fetchWithRetry(url: string, retries = 3): Promise<IAResponse | null> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            await sleep(2000 * (i + 1));
        }
    }
    return null;
}

export async function fetchBooksForLanguage(
    langCode: string,
    langName: string,
    maxBooks = 100
): Promise<number> {
    const query = `language:${langName} AND mediatype:texts AND date:[1800 TO 1989]`;
    const url = `${BASE_URL}?q=${encodeURIComponent(query)}&fl[]=${FIELDS}&rows=${maxBooks}&page=1&output=json&sort[]=date+asc`;
    
    console.log(`[IA] Fetching ${langName} (${langCode})...`);
    
    const data = await fetchWithRetry(url);
    if (!data?.response?.docs?.length) {
        console.log(`[IA] No results for ${langName}`);
        return 0;
    }
    
    const docs = data.response.docs;
    console.log(`[IA] Found ${docs.length} books for ${langName}`);
    
    // Get existing identifiers in bulk
    const identifiers = docs.map(d => d.identifier).filter(Boolean);
    const existingBooks = await Books.findAll({
        where: { identifier: { [Op.in]: identifiers } },
        attributes: ['identifier']
    });
    const existingSet = new Set(existingBooks.map(b => b.identifier));
    
const booksToInsert: Array<{
        name: string;
        url: string;
        identifier: string;
        language: string;
        author_name: string | null;
        publisher_name: string | null;
        published_year: string;
        publisher_city: string | null;
        printer_name: null;
        printer_location: null;
        status: number;
        created_at: Date;
        updated_at: Date;
    }> = [];
    for (const doc of docs) {
        if (booksToInsert.length >= maxBooks) break;
        if (!doc.identifier || existingSet.has(doc.identifier)) continue;
        
        const year = extractYear(doc.date);
        if (!year) continue;
        
        booksToInsert.push({
            name: doc.title || "Unknown Title",
            url: `https://archive.org/details/${doc.identifier}`,
            identifier: doc.identifier,
            language: langCode,
            author_name: normalizeField(doc.creator),
            publisher_name: normalizeField(doc.publisher),
            published_year: year,
            publisher_city: normalizeField(doc.city),
            printer_name: null,
            printer_location: null,
            status: 1,
            created_at: new Date(),
            updated_at: new Date(),
        });
    }
    
    if (booksToInsert.length > 0) {
        await Books.bulkCreate(booksToInsert as any, { ignoreDuplicates: true });
        console.log(`[IA] Inserted ${booksToInsert.length} books for ${langName}`);
    }
    
    return booksToInsert.length;
}

export async function fetchAllLanguages(maxPerLanguage = 100, concurrency = 3): Promise<Record<string, number>> {
    const results: Record<string, number> = {};
    const entries = Object.entries(LANGUAGE_MAP);
    
    // Process in batches to avoid overwhelming the API
    for (let i = 0; i < entries.length; i += concurrency) {
        const batch = entries.slice(i, i + concurrency);
        const promises = batch.map(([langCode, langName]) => 
            fetchBooksForLanguage(langCode, langName, maxPerLanguage)
                .then(count => ({ langCode, count }))
                .catch(err => {
                    console.error(`[IA] Error for ${langName}:`, err.message);
                    return { langCode, count: 0 };
                })
        );
        
        const batchResults = await Promise.all(promises);
        for (const { langCode, count } of batchResults) {
            results[langCode] = count;
        }
        
        // Rate limit between batches
        if (i + concurrency < entries.length) {
            await sleep(3000);
        }
    }
    
    return results;
}

export async function searchIA(
    query: string,
    fields: string = FIELDS,
    rows: number = 50,
    page: number = 1,
    sort: string = "date asc"
): Promise<IAResponse | null> {
    const url = `${BASE_URL}?q=${encodeURIComponent(query)}&fl[]=${fields}&rows=${rows}&page=${page}&output=json&sort[]=${sort}`;
    return fetchWithRetry(url);
}

export function getLanguageName(code: string): string | undefined {
    return LANGUAGE_MAP[code];
}

export function getAllLanguageCodes(): string[] {
    return Object.keys(LANGUAGE_MAP);
}
// Accepts an archive.org URL (details/download/embed) or a bare identifier.
export function parseArchiveIdentifier(input: string): string | null {
    const value = input.trim();
    const id = value.match(/archive\.org\/(?:details|download|embed)\/([^/?#\s]+)/)?.[1] ?? value;
    return /^[A-Za-z0-9._-]+$/.test(id) ? id : null;
}

// One item's metadata from archive.org, shaped as Books fields for the new-book form.
export async function fetchArchiveBook(identifier: string) {
    const response = await fetch(`https://archive.org/metadata/${identifier}/metadata`, {
        signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`archive.org HTTP ${response.status}`);
    const meta = (await response.json()).result;
    if (!meta) return null;

    // IA's language is usually ISO 639-3 ("kan"), sometimes a name ("Kannada") or several values.
    const iaLanguages = [meta.language].flat().filter(Boolean).map((l: string) => l.toLowerCase());
    const language = iaLanguages.length
        ? await Languages.findOne({
              where: {
                  [Op.or]: ["language_code", "iso_639_1", "iso_639_2", "iso_639_3", "alt_lang_code", "language"].map(
                      (column) => ({ [column]: { [Op.in]: iaLanguages } })
                  ),
              },
          })
        : null;

    return {
        name: normalizeField(meta.title)?.slice(0, 128) ?? "",
        url: `https://archive.org/details/${identifier}`,
        identifier,
        language: language?.language_code ?? "",
        author_name: normalizeField(meta.creator) ?? "",
        publisher_name: normalizeField(meta.publisher) ?? "",
        published_year: String(meta.year ?? meta.date ?? "").match(/\d{4}/)?.[0] ?? "",
    };
}
