"use strict";

// Fill the empty Compounds / Conjuncts letter categories for Indic-script languages,
// following the Kannada data: Compounds = consonant + vowel sign / anusvara / visarga /
// chandrabindu; Conjuncts = two-consonant clusters (C + virama + C). Only categories that
// are still empty are filled, and letters already present in the language are skipped.
// Also fixes two consonants seeded with the Kannada ಥ instead of their own script's letter.

const MARKER = new Date("2026-09-22T22:00:00Z"); // created_at of rows added here (used by down)

// Unicode block start per script; Indic blocks share one layout (ISCII order).
const SCRIPT_BLOCK = { Deva: 0x900, Beng: 0x980, Guru: 0xa00, Gujr: 0xa80, Orya: 0xb00, Taml: 0xb80, Telu: 0xc00, Mlym: 0xd00 };
const LANGUAGE_SCRIPT = {
    hin: "Deva", mar: "Deva", mai: "Deva", san: "Deva", nep: "Deva", kok: "Deva", doi: "Deva", brx: "Deva",
    ben: "Beng", asm: "Beng", mni: "Beng", pan: "Guru", guj: "Gujr", ori: "Orya", tam: "Taml", tel: "Telu", mal: "Mlym",
};
// Devanagari short e / short o signs exist only for transliterating Dravidian languages.
const SKIP_SIGNS = new Set([0x946, 0x94a]);

const isMark = (cp) => /^\p{M}$/u.test(String.fromCodePoint(cp));
const hex = (cp) => "U+" + cp.toString(16).toUpperCase().padStart(4, "0");

// Other signs written on a consonant: anusvara, visarga, chandrabindu by default;
// Gurmukhi uses bindi/tippi/addak, Tamil the pulli (dead consonant) instead.
const OTHER_SIGNS = { Guru: [0xa02, 0xa70, 0xa71], Taml: [0xbcd] };

const signsOf = (script, block) => {
    const vowelSigns = [];
    for (let o = 0x3e; o <= 0x4c; o++) if (isMark(block + o) && !SKIP_SIGNS.has(block + o)) vowelSigns.push(block + o);
    const others = OTHER_SIGNS[script] || [0x02, 0x03, 0x01].map((o) => block + o).filter(isMark);
    return [...vowelSigns, ...others].map((cp) => String.fromCodePoint(cp));
};

const conjunctsOf = (script, consonants, virama) => {
    const single = consonants.filter((c) => [...c].length === 1);
    if (script === "Taml") return ["ஸ்ரீ"]; // Tamil writes clusters with a visible pulli; க்ஷ is already a consonant
    const seconds = script === "Guru" ? ["ਰ", "ਹ", "ਵ", "ਯ"].filter((c) => single.includes(c)) : single; // Gurmukhi: subjoined forms only
    return single.flatMap((a) => seconds.map((b) => a + virama + b));
};

module.exports = {
    async up(queryInterface) {
        const q = (sql, replacements) =>
            queryInterface.sequelize.query(sql, { replacements, type: queryInterface.sequelize.QueryTypes.SELECT });

        await queryInterface.sequelize.query("UPDATE letters SET letter = 'థ', unicode = 'U+0C25' WHERE language = 'tel' AND letter = 'ಥ'");
        await queryInterface.sequelize.query("UPDATE letters SET letter = 'ਥ', unicode = 'U+0A25' WHERE language = 'pan' AND letter = 'ಥ'");

        const rows = [];
        for (const [language, script] of Object.entries(LANGUAGE_SCRIPT)) {
            const block = SCRIPT_BLOCK[script];
            const inScript = (s) => [...s].every((ch) => ch.codePointAt(0) >= block && ch.codePointAt(0) < block + 0x80);
            const types = Object.fromEntries(
                (await q("SELECT id, type FROM letter_types WHERE language = :language", { language })).map((t) => [t.type, t.id])
            );
            const letters = await q(
                "SELECT l.letter, t.type FROM letters l JOIN letter_types t ON t.id = l.letter_type WHERE l.language = :language",
                { language }
            );
            const existing = new Set(letters.map((l) => l.letter));
            const count = (type) => letters.filter((l) => l.type === type).length;
            const consonants = [...new Set(letters.filter((l) => l.type === "Consonants").map((l) => l.letter))].filter(inScript);

            const add = (type, letter) => {
                if (existing.has(letter)) return;
                existing.add(letter);
                rows.push({
                    letter,
                    unicode: hex(letter.codePointAt(0)),
                    language,
                    letter_type: types[type],
                    user_defined: false,
                    created_at: MARKER,
                    updated_at: MARKER,
                });
            };

            if (types.Compounds && !count("Compounds"))
                for (const c of consonants) for (const sign of signsOf(script, block)) add("Compounds", c + sign);
            if (types.Conjuncts && !count("Conjuncts"))
                for (const c of conjunctsOf(script, consonants, String.fromCodePoint(block + 0x4d))) add("Conjuncts", c);
        }

        for (let i = 0; i < rows.length; i += 1000) await queryInterface.bulkInsert("letters", rows.slice(i, i + 1000));
        console.log(`Added ${rows.length} compound/conjunct letters`);
    },

    async down(queryInterface) {
        // Only rows this migration added and nobody has tagged since.
        await queryInterface.sequelize.query(
            "DELETE FROM letters WHERE created_at = :marker AND id NOT IN (SELECT letter_id FROM tagged_letters)",
            { replacements: { marker: MARKER } }
        );
    },
};
