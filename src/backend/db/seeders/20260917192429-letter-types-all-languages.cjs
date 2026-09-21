"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.query(`SET FOREIGN_KEY_CHECKS = 0`);

        try {
            const languages = [
                "hin", "ben", "tel", "mar", "tam", "urd", "guj", "kan", "mal", "ori",
                "pan", "asm", "mai", "san", "sat", "kas", "nep", "snd", "kok",
                "doi", "mni", "brx", "eng"
            ];

            const letterTypes = [
                { type: "Vowels", status: true },
                { type: "Consonants", status: true },
                { type: "Conjuncts", status: true },
                { type: "Numerals", status: true },
                { type: "Special Symbols", status: true },
                { type: "Custom Symbols", status: true },
                { type: "Compounds", status: true },
            ];

            const letterTypeRecords = [];
            for (const lang of languages) {
                for (const lt of letterTypes) {
                    letterTypeRecords.push({
                        type: lt.type,
                        language: lang,
                        status: lt.status,
                        created_by: 1,
                        updated_by: 1,
                        created_at: new Date(),
                        updated_at: new Date(),
                    });
                }
            }

            await queryInterface.bulkInsert("letter_types", letterTypeRecords);
            console.log(`Inserted ${letterTypeRecords.length} letter types for ${languages.length} languages`);
        } finally {
            await queryInterface.sequelize.query(`SET FOREIGN_KEY_CHECKS = 1`);
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.query(`SET FOREIGN_KEY_CHECKS = 0`);
        try {
            await queryInterface.bulkDelete("letter_types", {
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