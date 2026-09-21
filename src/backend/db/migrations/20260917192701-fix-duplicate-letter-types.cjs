"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.query(`SET FOREIGN_KEY_CHECKS = 0`);

        try {
            // Find and delete duplicate letter types (keep the one with lowest id)
            await queryInterface.sequelize.query(`
                DELETE lt1 FROM letter_types lt1
                INNER JOIN letter_types lt2
                WHERE lt1.id > lt2.id
                AND lt1.type = lt2.type
                AND lt1.language = lt2.language
            `);

            // Verify
            const [results] = await queryInterface.sequelize.query(`
                SELECT language, type, COUNT(*) as count FROM letter_types 
                GROUP BY language, type HAVING count > 1
            `);
            console.log('Remaining duplicates:', results);
        } finally {
            await queryInterface.sequelize.query(`SET FOREIGN_KEY_CHECKS = 1`);
        }
    },

    async down(queryInterface, Sequelize) {
        console.log('Down migration not implemented');
    }
};