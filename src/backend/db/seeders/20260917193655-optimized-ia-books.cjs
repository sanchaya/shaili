"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const fetch = (await import('node-fetch')).default;
        
        const LANGUAGE_MAP = {
            "hin": "Hindi", "ben": "Bengali", "tel": "Telugu", "mar": "Marathi",
            "tam": "Tamil", "urd": "Urdu", "guj": "Gujarati", "kan": "Kannada",
            "mal": "Malayalam", "ori": "Odia", "pan": "Punjabi", "asm": "Assamese",
            "mai": "Maithili", "san": "Sanskrit", "sat": "Santali", "kas": "Kashmiri",
            "nep": "Nepali", "snd": "Sindhi", "kok": "Konkani", "doi": "Dogri",
            "mni": "Manipuri", "brx": "Bodo", "eng": "English"
        };

        const BASE_URL = "https://archive.org/advancedsearch.php";
        const FIELDS = "identifier,title,creator,date,publisher,city,language,mediatype,collection";
        const MAX_PER_LANG = 50;
        const CONCURRENCY = 3;

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

        async function fetchWithRetry(url: string, retries = 3): Promise<any> {
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

        async function fetchBooksForLanguage(langCode: string, langName: string): Promise<number> {
            const query = `language:${langName} AND mediatype:texts AND date:[1800 TO 1989]`;
            const url = `${BASE_URL}?q=${encodeURIComponent(query)}&fl[]=${FIELDS}&rows=${MAX_PER_LANG}&page=1&output=json&sort[]=date+asc`;
            
            console.log(`[Seeder] Fetching ${langName} (${langCode})...`);
            
            const data = await fetchWithRetry(url);
            if (!data?.response?.docs?.length) {
                console.log(`[Seeder] No results for ${langName}`);
                return 0;
            }
            
            const docs = data.response.docs;
            console.log(`[Seeder] Found ${docs.length} books for ${langName}`);
            
            // Get existing identifiers in bulk
            const identifiers = docs.map((d: any) => d.identifier).filter(Boolean);
            const [existingBooks] = await queryInterface.sequelize.query(
                `SELECT identifier FROM books WHERE identifier IN (?)`,
                { replacements: [identifiers] }
            );
            const existingSet = new Set(existingBooks.map((b: any) => b.identifier));
            
            const booksToInsert = [];
            for (const doc of docs) {
                if (booksToInsert.length >= MAX_PER_LANG) break;
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
                await queryInterface.bulkInsert("books", booksToInsert, { ignoreDuplicates: true });
                console.log(`[Seeder] Inserted ${booksToInsert.length} books for ${langName}`);
            }
            
            return booksToInsert.length;
        }

        // Process in batches with concurrency control
        const entries = Object.entries(LANGUAGE_MAP);
        const results: Record<string, number> = {};
        
        for (let i = 0; i < entries.length; i += CONCURRENCY) {
            const batch = entries.slice(i, i + CONCURRENCY);
            const promises = batch.map(([langCode, langName]) => 
                fetchBooksForLanguage(langCode, langName)
                    .then(count => ({ langCode, count }))
                    .catch(err => {
                        console.error(`[Seeder] Error for ${langName}:`, err.message);
                        return { langCode, count: 0 };
                    })
            );
            
            const batchResults = await Promise.all(promises);
            for (const { langCode, count } of batchResults) {
                results[langCode] = count;
            }
            
            if (i + CONCURRENCY < entries.length) {
                await sleep(3000);
            }
        }
        
        console.log("[Seeder] Summary:", results);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query(`SET FOREIGN_KEY_CHECKS = 0`);
        try {
            await queryInterface.bulkDelete("books", {
                language: Object.keys({
                    "hin": true, "ben": true, "tel": true, "mar": true, "tam": true,
                    "urd": true, "guj": true, "kan": true, "mal": true, "ori": true,
                    "pan": true, "asm": true, "mai": true, "san": true, "sat": true,
                    "kas": true, "nep": true, "snd": true, "kok": true, "doi": true,
                    "mni": true, "brx": true, "eng": true
                })
            });
        } finally {
            await queryInterface.sequelize.query(`SET FOREIGN_KEY_CHECKS = 1`);
        }
    }
};