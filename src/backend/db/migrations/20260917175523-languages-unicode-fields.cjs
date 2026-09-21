"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("languages", "script", {
            type: Sequelize.STRING,
            after: "alt_lang_code",
            comment: "Writing script used (e.g., Devanagari, Bengali, Tamil)"
        });
        await queryInterface.addColumn("languages", "unicode_range", {
            type: Sequelize.STRING,
            after: "script",
            comment: "Unicode code point range (e.g., U+0900–U+097F)"
        });
        await queryInterface.addColumn("languages", "unicode_version", {
            type: Sequelize.STRING,
            after: "unicode_range",
            comment: "Unicode version when script was added (e.g., 1.0)"
        });
        await queryInterface.addColumn("languages", "direction", {
            type: Sequelize.ENUM("ltr", "rtl", "ttb"),
            defaultValue: "ltr",
            after: "unicode_version",
            comment: "Writing direction (ltr=left-to-right, rtl=right-to-left, ttb=top-to-bottom)"
        });
        await queryInterface.addColumn("languages", "sample_text", {
            type: Sequelize.TEXT,
            after: "direction",
            comment: "Sample text in the language for display/testing"
        });
        await queryInterface.addColumn("languages", "native_name", {
            type: Sequelize.STRING,
            after: "sample_text",
            comment: "Native name of the language in its own script"
        });
        await queryInterface.addColumn("languages", "iso_639_1", {
            type: Sequelize.STRING(2),
            after: "native_name",
            comment: "ISO 639-1 two-letter code"
        });
        await queryInterface.addColumn("languages", "iso_639_2", {
            type: Sequelize.STRING(3),
            after: "iso_639_1",
            comment: "ISO 639-2 three-letter code (bibliographic)"
        });
        await queryInterface.addColumn("languages", "iso_639_3", {
            type: Sequelize.STRING(3),
            after: "iso_639_2",
            comment: "ISO 639-3 three-letter code"
        });
        await queryInterface.addColumn("languages", "speaker_count", {
            type: Sequelize.BIGINT,
            after: "iso_639_3",
            comment: "Approximate number of speakers"
        });
        await queryInterface.addColumn("languages", "official_status", {
            type: Sequelize.STRING,
            after: "speaker_count",
            comment: "Official status (e.g., Scheduled, Classical, Official in state)"
        });
        await queryInterface.addColumn("languages", "font_recommendations", {
            type: Sequelize.TEXT,
            after: "official_status",
            comment: "Recommended fonts for this language (JSON array)"
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("languages", "font_recommendations");
        await queryInterface.removeColumn("languages", "official_status");
        await queryInterface.removeColumn("languages", "speaker_count");
        await queryInterface.removeColumn("languages", "iso_639_3");
        await queryInterface.removeColumn("languages", "iso_639_2");
        await queryInterface.removeColumn("languages", "iso_639_1");
        await queryInterface.removeColumn("languages", "native_name");
        await queryInterface.removeColumn("languages", "sample_text");
        await queryInterface.removeColumn("languages", "direction");
        await queryInterface.removeColumn("languages", "unicode_version");
        await queryInterface.removeColumn("languages", "unicode_range");
        await queryInterface.removeColumn("languages", "script");
    }
};