"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Books indexes - check if they exist first
        try { await queryInterface.addIndex("books", ["language", "status"], { name: "idx_books_lang_status" }); } catch {}
        try { await queryInterface.addIndex("books", ["language", "published_year"], { name: "idx_books_lang_year" }); } catch {}
        try { await queryInterface.addIndex("books", ["identifier"], { unique: true, name: "idx_books_identifier" }); } catch {}
        try { await queryInterface.addIndex("books", ["status"], { name: "idx_books_status" }); } catch {}
        try { await queryInterface.addIndex("books", ["created_at"], { name: "idx_books_created" }); } catch {}

        // Letters indexes
        try { await queryInterface.addIndex("letters", ["language", "letter_type"], { name: "idx_letters_lang_type" }); } catch {}
        try { await queryInterface.addIndex("letters", ["language"], { name: "idx_letters_language" }); } catch {}
        try { await queryInterface.addIndex("letters", ["letter_type"], { name: "idx_letters_type" }); } catch {}

        // LetterTypes indexes
        try { await queryInterface.addIndex("letter_types", ["language", "status"], { name: "idx_lettertypes_lang_status" }); } catch {}

        // TaggedLetters indexes
        try { await queryInterface.addIndex("tagged_letters", ["book_id", "tagged_by"], { name: "idx_tagged_book_user" }); } catch {}
        try { await queryInterface.addIndex("tagged_letters", ["letter_id"], { name: "idx_tagged_letter" }); } catch {}
        try { await queryInterface.addIndex("tagged_letters", ["tagged_by"], { name: "idx_tagged_user" }); } catch {}

        // Languages indexes
        try { await queryInterface.addIndex("languages", ["language_code"], { unique: true, name: "idx_lang_code" }); } catch {}
        try { await queryInterface.addIndex("languages", ["script"], { name: "idx_lang_script" }); } catch {}
        try { await queryInterface.addIndex("languages", ["iso_639_1"], { name: "idx_lang_iso1" }); } catch {}
        try { await queryInterface.addIndex("languages", ["official_status"], { name: "idx_lang_official" }); } catch {}
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex("books", "idx_books_lang_status");
        await queryInterface.removeIndex("books", "idx_books_lang_year");
        await queryInterface.removeIndex("books", "idx_books_identifier");
        await queryInterface.removeIndex("books", "idx_books_status");
        await queryInterface.removeIndex("books", "idx_books_created");
        await queryInterface.removeIndex("letters", "idx_letters_lang_type");
        await queryInterface.removeIndex("letters", "idx_letters_language");
        await queryInterface.removeIndex("letters", "idx_letters_type");
        await queryInterface.removeIndex("letter_types", "idx_lettertypes_lang_status");
        await queryInterface.removeIndex("tagged_letters", "idx_tagged_book_user");
        await queryInterface.removeIndex("tagged_letters", "idx_tagged_letter");
        await queryInterface.removeIndex("tagged_letters", "idx_tagged_user");
        await queryInterface.removeIndex("languages", "idx_lang_code");
        await queryInterface.removeIndex("languages", "idx_lang_script");
        await queryInterface.removeIndex("languages", "idx_lang_iso1");
        await queryInterface.removeIndex("languages", "idx_lang_official");
    }
};