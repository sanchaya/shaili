"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const fetch = (await import('node-fetch')).default;
        
        // Map our language codes to Internet Archive language codes
        const languageMap = {
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

        const baseUrl = "https://archive.org/advancedsearch.php";
        const fields = "identifier,title,creator,date,publisher,city,language,mediatype,collection";
        
        for (const [langCode, langName] of Object.entries(languageMap)) {
            console.log(`\nFetching books for ${langName} (${langCode})...`);
            
            try {
                // Search for books in this language, published before 1990
                // Prefer 1800s by sorting by date ascending
                const query = `language:${langName} AND mediatype:texts AND date:[1800 TO 1989]`;
                const url = `${baseUrl}?q=${encodeURIComponent(query)}&fl[]=${fields}&rows=100&page=1&output=json&sort[]=date+asc`;
                
                console.log(`Querying: ${url}`);
                
                const response = await fetch(url);
                const data = await response.json();
                
                if (!data.response || !data.response.docs) {
                    console.log(`No results for ${langName}`);
                    continue;
                }
                
                const docs = data.response.docs;
                console.log(`Found ${docs.length} books for ${langName}`);
                
                // Filter and prepare books for insertion
                const books = [];
                for (const doc of docs) {
                    if (books.length >= 100) break;
                    
                    // Skip if already exists
                    const [existing] = await queryInterface.sequelize.query(
                        `SELECT id FROM books WHERE identifier = ?`,
                        { replacements: [doc.identifier] }
                    );
                    if (existing.length > 0) continue;
                    
                    const year = doc.date ? String(doc.date).substring(0, 4) : null;
                    const yearNum = year ? parseInt(year) : null;
                    
                    // Skip if year is invalid or after 1989
                    if (yearNum && yearNum > 1989) continue;
                    if (yearNum && yearNum < 1800) continue;
                    
                    books.push({
                        name: doc.title || "Unknown Title",
                        url: `https://archive.org/details/${doc.identifier}`,
                        identifier: doc.identifier,
                        language: langCode,
                        author_name: Array.isArray(doc.creator) ? doc.creator.join(", ") : (doc.creator || null),
                        publisher_name: Array.isArray(doc.publisher) ? doc.publisher.join(", ") : (doc.publisher || null),
                        published_year: year,
                        publisher_city: Array.isArray(doc.city) ? doc.city.join(", ") : (doc.city || null),
                        printer_name: null,
                        printer_location: null,
                        status: 1, // New
                        created_at: new Date(),
                        updated_at: new Date(),
                    });
                }
                
                if (books.length > 0) {
                    await queryInterface.bulkInsert("books", books);
                    console.log(`Inserted ${books.length} books for ${langName}`);
                } else {
                    console.log(`No new books to insert for ${langName}`);
                }
                
                // Rate limiting - be nice to the API
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`Error fetching books for ${langName}:`, error.message);
            }
        }
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