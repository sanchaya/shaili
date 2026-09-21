"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("languages", "ipa_supported", {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
            after: "font_recommendations",
            comment: "Whether IPA transcription is supported for this language"
        });
        await queryInterface.addColumn("languages", "ipa_sample", {
            type: Sequelize.STRING,
            after: "ipa_supported",
            comment: "IPA transcription of sample_text"
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("languages", "ipa_sample");
        await queryInterface.removeColumn("languages", "ipa_supported");
    }
};