"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Disable foreign key checks temporarily
        await queryInterface.sequelize.query(`SET FOREIGN_KEY_CHECKS = 0`);

        try {
            // Delete old duplicate entries first
            // Old Kannada entry (id 1, language_code: 'kan')
            await queryInterface.sequelize.query(`DELETE FROM languages WHERE language_code = 'kan' AND id = 1`);
            
            // Old English entry (id 2, language_code: 'eng') 
            await queryInterface.sequelize.query(`DELETE FROM languages WHERE language_code = 'eng' AND id = 2`);

            // Update all language_code to use 3-letter ISO 639-2/3 codes
            const updates = [
                { language_code: 'hin', alt_lang_code: 'hi' },    // Hindi
                { language_code: 'ben', alt_lang_code: 'bn' },    // Bengali
                { language_code: 'tel', alt_lang_code: 'te' },    // Telugu
                { language_code: 'mar', alt_lang_code: 'mr' },    // Marathi
                { language_code: 'tam', alt_lang_code: 'ta' },    // Tamil
                { language_code: 'urd', alt_lang_code: 'ur' },    // Urdu
                { language_code: 'guj', alt_lang_code: 'gu' },    // Gujarati
                { language_code: 'kan', alt_lang_code: 'kn' },    // Kannada
                { language_code: 'mal', alt_lang_code: 'ml' },    // Malayalam
                { language_code: 'ori', alt_lang_code: 'or' },    // Odia
                { language_code: 'pan', alt_lang_code: 'pa' },    // Punjabi
                { language_code: 'asm', alt_lang_code: 'as' },    // Assamese
                { language_code: 'mai', alt_lang_code: 'mai' },   // Maithili
                { language_code: 'san', alt_lang_code: 'sa' },    // Sanskrit
                { language_code: 'sat', alt_lang_code: 'sat' },   // Santali
                { language_code: 'kas', alt_lang_code: 'ks' },    // Kashmiri
                { language_code: 'nep', alt_lang_code: 'ne' },    // Nepali
                { language_code: 'snd', alt_lang_code: 'sd' },    // Sindhi
                { language_code: 'kok', alt_lang_code: 'kok' },   // Konkani
                { language_code: 'doi', alt_lang_code: 'doi' },   // Dogri
                { language_code: 'mni', alt_lang_code: 'mni' },   // Manipuri
                { language_code: 'brx', alt_lang_code: 'brx' },   // Bodo
                { language_code: 'eng', alt_lang_code: 'en' },    // English
            ];

            for (const update of updates) {
                await queryInterface.sequelize.query(
                    `UPDATE languages SET language_code = '${update.language_code}', alt_lang_code = '${update.alt_lang_code}' WHERE alt_lang_code = '${update.alt_lang_code}' OR language_code = '${update.alt_lang_code}' OR language_code = '${update.language_code}'`
                );
            }

            // Verify the updates
            const [results] = await queryInterface.sequelize.query(
                `SELECT language, language_code, alt_lang_code FROM languages ORDER BY language`
            );
            console.log('Updated languages:', results);
        } finally {
            // Re-enable foreign key checks
            await queryInterface.sequelize.query(`SET FOREIGN_KEY_CHECKS = 1`);
        }
    },

    async down(queryInterface, Sequelize) {
        // Revert is complex, just re-seed if needed
        console.log('Down migration - would need to re-run seeders');
    }
};