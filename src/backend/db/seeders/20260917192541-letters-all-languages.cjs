"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.query(`SET FOREIGN_KEY_CHECKS = 0`);

        try {
            // Get letter type IDs for each language
            const [letterTypeRows] = await queryInterface.sequelize.query(
                `SELECT id, type, language FROM letter_types WHERE language IN ('hin', 'ben', 'tel', 'mar', 'tam', 'urd', 'guj', 'kan', 'mal', 'ori', 'pan', 'asm', 'mai', 'san', 'sat', 'kas', 'nep', 'snd', 'kok', 'doi', 'mni', 'brx', 'eng')`
            );

            // Create a map of language -> type -> id
            const typeMap = {};
            for (const row of letterTypeRows) {
                if (!typeMap[row.language]) typeMap[row.language] = {};
                typeMap[row.language][row.type] = row.id;
            }

            // Define letters for each language
            const languageLetters = {
                // Devanagari languages (Hindi, Marathi, Sanskrit, Nepali, Maithili, Konkani, Dogri)
                devanagari: {
                    vowels: ["अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ॠ", "ऌ", "ॡ", "ए", "ऐ", "ओ", "औ", "अं", "अः"],
                    consonants: ["क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ", "ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न", "प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "श", "ष", "स", "ह", "क्ष", "त्र", "ज्ञ", "श्र"],
                    numerals: ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"],
                    special: ["।", "॥", "ँ", "ं", "ः", "ऽ", "ॐ", "ॐ", "॰"],
                },
                // Bengali script (Bengali, Assamese)
                bengali: {
                    vowels: ["অ", "আ", "ই", "ঈ", "উ", "ঊ", "ঋ", "এ", "ঐ", "ও", "ঔ", "অং", "অঃ"],
                    consonants: ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ", "ঞ", "ট", "ঠ", "ড", "ঢ", "ণ", "ত", "থ", "দ", "ধ", "ন", "প", "ফ", "ব", "ভ", "ম", "য", "র", "ল", "শ", "ষ", "স", "হ", "ড়", "ঢ়", "য়"],
                    numerals: ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"],
                    special: ["।", "॥", "ঁ", "ং", "ঃ", "ঽ", "ৎ", "ড়", "ঢ়", "য়"],
                },
                // Telugu
                telugu: {
                    vowels: ["అ", "ఆ", "ఇ", "ఈ", "ఉ", "ఊ", "ఋ", "ౠ", "ఌ", "ౡ", "ఎ", "ఏ", "ఐ", "ఒ", "ఓ", "ఔ", "అం", "అః"],
                    consonants: ["క", "ఖ", "గ", "ఘ", "ఙ", "చ", "ఛ", "జ", "ఝ", "ఞ", "ట", "ఠ", "డ", "ఢ", "ణ", "త", "ಥ", "ద", "ధ", "న", "ప", "ఫ", "బ", "భ", "మ", "య", "ర", "ల", "వ", "శ", "ష", "స", "హ", "ళ", "క్ష", "ఱ"],
                    numerals: ["౦", "౧", "౨", "౩", "౪", "౫", "౬", "౭", "౮", "౯"],
                    special: ["।", "॥", "ఁ", "ం", "ః", "ఽ", "ఁ", "఼"],
                },
                // Tamil
                tamil: {
                    vowels: ["அ", "ஆ", "இ", "ஈ", "உ", "ஊ", "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ", "ஃ"],
                    consonants: ["க", "ங", "ச", "ஞ", "ட", "ண", "த", "ந", "ப", "ம", "ய", "ர", "ல", "வ", "ழ", "ள", "ற", "ந", "ஜ", "ஷ", "ஸ", "ஹ", "க்ஷ"],
                    numerals: ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"],
                    special: ["।", "॥", "ௐ", "ௗ", "௳", "௴", "௵", "௶", "௷", "௸", "௹"],
                },
                // Urdu (Arabic script)
                urdu: {
                    vowels: ["ا", "آ", "ب", "پ", "ت", "ٹ", "ث", "ج", "چ", "ح", "خ", "د", "ڈ", "ذ", "ر", "ڑ", "ز", "ژ", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ک", "گ", "ل", "م", "ن", "ں", "و", "ہ", "ھ", "ء", "ی", "ے"],
                    consonants: ["ب", "پ", "ت", "ٹ", "ث", "ج", "چ", "ح", "خ", "د", "ڈ", "ذ", "ر", "ڑ", "ز", "ژ", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ک", "گ", "ل", "م", "ن", "ں", "و", "ہ", "ھ", "ی", "ے"],
                    numerals: ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"],
                    special: ["۔", "،", "؛", "؟", "٪", "؉", "؊", "؀", "؁", "؂", "؃", "؄", "؅", "؆", "؇", "؈", "؉", "؊"],
                },
                // Gujarati
                gujarati: {
                    vowels: ["અ", "આ", "ઇ", "ઈ", "ઉ", "ઊ", "ઋ", "એ", "ઐ", "ઓ", "ઔ", "અં", "અઃ"],
                    consonants: ["ક", "ખ", "ગ", "ઘ", "ઙ", "ચ", "છ", "જ", "ઝ", "ઞ", "ટ", "ઠ", "ડ", "ઢ", "ણ", "ત", "થ", "દ", "ધ", "ન", "પ", "ફ", "બ", "ભ", "મ", "ય", "ર", "લ", "વ", "શ", "ષ", "સ", "હ", "ળ", "ક્ષ", "જ્ઞ"],
                    numerals: ["૦", "૧", "૨", "૩", "૪", "૫", "૬", "૭", "૮", "૯"],
                    special: ["।", "॥", "ઁ", "ં", "ઃ", "઼"],
                },
                // Kannada
                kannada: {
                    vowels: ["ಅ", "ಆ", "ಇ", "ಈ", "ಉ", "ಊ", "ಋ", "ೠ", "ಌ", "ೡ", "ಎ", "ಏ", "ಐ", "ಒ", "ಓ", "ಔ", "ಅಂ", "ಅಃ"],
                    consonants: ["ಕ", "ಖ", "ಗ", "ಘ", "ಙ", "ಚ", "ಛ", "ಜ", "ಝ", "ಞ", "ಟ", "ಠ", "ಡ", "ಢ", "ಣ", "ತ", "ಥ", "ದ", "ಧ", "ನ", "ಪ", "ಫ", "ಬ", "ಭ", "ಮ", "ಯ", "ರ", "ಱ", "ಲ", "ಳ", "ವ", "ಶ", "ಷ", "ಸ", "ಹ", "಼"],
                    numerals: ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"],
                    special: ["।", "॥", "ಁ", "ಂ", "ಃ", "ಽ", "಼"],
                },
                // Malayalam
                malayalam: {
                    vowels: ["അ", "ആ", "ഇ", "ഈ", "ഉ", "ഊ", "ഋ", "ൠ", "ഌ", "ൡ", "എ", "ഏ", "ഐ", "ഒ", "ഓ", "ഔ", "അം", "അഃ"],
                    consonants: ["ക", "ഖ", "ഗ", "ഘ", "ങ", "ച", "ഛ", "ജ", "ഝ", "ഞ", "ട", "ഠ", "ഡ", "ഢ", "ണ", "ത", "ഥ", "ദ", "ധ", "ന", "പ", "ഫ", "ബ", "ഭ", "മ", "യ", "ര", "റ", "ല", "ള", "ഴ", "വ", "ശ", "ഷ", "സ", "ഹ", "ള", "ഴ", "റ"],
                    numerals: ["൦", "൧", "൨", "൩", "൪", "൫", "൬", "൭", "൮", "൯"],
                    special: ["।", "॥", "ഁ", "ം", "ഃ", "ഽ", "ൗ", "ൌ"],
                },
                // Odia
                odia: {
                    vowels: ["ଅ", "ଆ", "ଇ", "ଈ", "ଉ", "ଊ", "ଋ", "ୠ", "ଌ", "ୡ", "ଏ", "ଐ", "ଓ", "ଔ", "ଅଂ", "ଅଃ"],
                    consonants: ["କ", "ଖ", "ଗ", "ଘ", "ଙ", "ଚ", "ଛ", "ଜ", "ଝ", "ଞ", "ଟ", "ଠ", "ଡ", "ଢ", "ଣ", "ତ", "ଥ", "ଦ", "ଧ", "ନ", "ପ", "ଫ", "ବ", "ଭ", "ମ", "ଯ", "ର", "ଲ", "ଳ", "ଵ", "ଶ", "ଷ", "ସ", "ହ", "କ୍ଷ"],
                    numerals: ["୦", "୧", "୨", "୩", "୪", "୫", "୬", "୭", "୮", "୯"],
                    special: ["।", "॥", "ଁ", "ଂ", "ଃ", "ଽ", "଼"],
                },
                // Gurmukhi (Punjabi)
                gurmukhi: {
                    vowels: ["ਅ", "ਆ", "ਇ", "ਈ", "ਉ", "ਊ", "ਏ", "ਐ", "ਓ", "ਔ"],
                    consonants: ["ਕ", "ਖ", "ਗ", "ਘ", "ਙ", "ਚ", "ਛ", "ਜ", "ਝ", "ਞ", "ਟ", "ਠ", "ਡ", "ਢ", "ਣ", "ਤ", "ಥ", "ਦ", "ਧ", "ਨ", "ਪ", "ਫ", "ਬ", "ਭ", "ਮ", "ਯ", "ਰ", "ਲ", "ਲ਼", "ਵ", "ਸ਼", "ਸ", "ਹ", "ੜ"],
                    numerals: ["੦", "੧", "੨", "੩", "੪", "੫", "੬", "੭", "੮", "੯"],
                    special: ["।", "॥", "ਂ", "ਃ", "ਁ", "ੰ", "ੱ"],
                },
                // Latin (English)
                latin: {
                    vowels: ["A", "E", "I", "O", "U", "a", "e", "i", "o", "u"],
                    consonants: ["B", "C", "D", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "V", "W", "X", "Y", "Z", "b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z"],
                    numerals: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
                    special: [".", ",", "!", "?", ":", ";", "\"", "'", "(", ")", "[", "]", "{", "}", "@", "#", "$", "%", "^", "&", "*", "-", "_", "+", "=", "|", "\\", "/", "<", ">", "`", "~"],
                },
            };

            const letterRecords = [];
            const languageScriptMap = {
                "hin": "devanagari", "mar": "devanagari", "san": "devanagari", "nep": "devanagari",
                "mai": "devanagari", "kok": "devanagari", "doi": "devanagari",
                "ben": "bengali", "asm": "bengali",
                "tel": "telugu",
                "tam": "tamil",
                "urd": "urdu",
                "guj": "gujarati",
                "kan": "kannada",
                "mal": "malayalam",
                "ori": "odia",
                "pan": "gurmukhi",
                "sat": "latin", // Santali uses Ol Chiki - using latin as placeholder
                "kas": "urdu", // Kashmiri uses Perso-Arabic
                "snd": "urdu", // Sindhi uses Arabic
                "mni": "bengali", // Manipuri uses Bengali/Meetei Mayek
                "brx": "devanagari", // Bodo uses Devanagari
                "eng": "latin",
            };

            for (const [langCode, script] of Object.entries(languageScriptMap)) {
                const letters = languageLetters[script];
                if (!letters) {
                    console.log(`No letter data for script: ${script} (language: ${langCode})`);
                    continue;
                }

                const types = typeMap[langCode];
                if (!types) {
                    console.log(`No letter types found for language: ${langCode}`);
                    continue;
                }

                // Add vowels
                for (const letter of letters.vowels) {
                    letterRecords.push({
                        letter,
                        letter_type: types["Vowels"],
                        language: langCode,
                        created_at: new Date(),
                        updated_at: new Date(),
                    });
                }

                // Add consonants
                for (const letter of letters.consonants) {
                    letterRecords.push({
                        letter,
                        letter_type: types["Consonants"],
                        language: langCode,
                        created_at: new Date(),
                        updated_at: new Date(),
                    });
                }

                // Add numerals
                for (const letter of letters.numerals) {
                    letterRecords.push({
                        letter,
                        letter_type: types["Numerals"],
                        language: langCode,
                        created_at: new Date(),
                        updated_at: new Date(),
                    });
                }

                // Add special symbols
                for (const letter of letters.special) {
                    letterRecords.push({
                        letter,
                        letter_type: types["Special Symbols"],
                        language: langCode,
                        created_at: new Date(),
                        updated_at: new Date(),
                    });
                }
            }

            // Batch insert in chunks of 1000
            const chunkSize = 1000;
            for (let i = 0; i < letterRecords.length; i += chunkSize) {
                const chunk = letterRecords.slice(i, i + chunkSize);
                await queryInterface.bulkInsert("letters", chunk);
                console.log(`Inserted ${i + chunk.length} / ${letterRecords.length} letters`);
            }

            console.log(`Total letters inserted: ${letterRecords.length}`);
        } finally {
            await queryInterface.sequelize.query(`SET FOREIGN_KEY_CHECKS = 1`);
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query(`SET FOREIGN_KEY_CHECKS = 0`);
        try {
            await queryInterface.bulkDelete("letters", {
                language: [
                    "hin", "ben", "tel", "mar", "tam", "urd", "guj", "kan", "mal", "ori",
                    "pan", "asm", "mai", "san", "sat", "kas", "nep", "snd", "kok",
                    "doi", "mni", "brx", "eng"
                ]
            });
        } finally {
            await queryInterface.sequelize.query(`SET FOREIGN_KEY_CHECKS = 1`);
        }
    }
};