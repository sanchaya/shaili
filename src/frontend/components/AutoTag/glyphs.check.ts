// Self-check for glyph segmentation: node dist/frontend/components/AutoTag/glyphs.check.js
import assert from "node:assert";
import { cropRegion, findGlyphs, groupByShape, insideBox, lineScript, otsu, scriptOf, shapeOf, taggedLetters } from "./glyphs.js";

const W = 200, H = 60;
const page = new Uint8Array(W * H).fill(255);
const ink = (x0: number, y0: number, x1: number, y1: number, hole = false) => {
    for (let y = y0; y <= y1; y++)
        for (let x = x0; x <= x1; x++)
            if (!hole || x < x0 + 3 || x > x1 - 3 || y < y0 + 3 || y > y1 - 3) page[y * W + x] = 0;
};
ink(10, 20, 29, 39, true); // "o"
ink(50, 20, 69, 39, true); // same "o"
ink(90, 20, 97, 39); // bar
ink(120, 20, 139, 39, true); // "o" ...
ink(125, 12, 134, 15); // ... with a mark above it: must merge into one glyph
ink(0, 55, 199, 57); // page rule: must be dropped

const th = otsu(page);
const boxes = findGlyphs(page, W, H, th);
assert.deepStrictEqual(
    boxes.map((b) => [b.x0, b.y0, b.x1, b.y1]),
    [[10, 20, 29, 39], [50, 20, 69, 39], [90, 20, 97, 39], [120, 12, 139, 39]]
);
const groups = groupByShape(boxes.map((b) => shapeOf(page, W, b, th)));
assert.deepStrictEqual(groups[0], [0, 1], "identical glyphs share a group");
assert.strictEqual(groups.length, 3);
assert.strictEqual(scriptOf("History"), "Latn");
assert.strictEqual(scriptOf("ಶಿಂಧುದೇಶ."), "Knda");
assert.strictEqual(scriptOf("ಸಮಾಚಾರ a"), "Knda", "majority wins");
assert.strictEqual(scriptOf("१८४५ नमस्ते"), "Deva");
assert.strictEqual(scriptOf("12, --"), null);
// Lines from a real 1845 Kannada page OCR'd with kan+eng.
const line = (s: string) => s.split(" ").map((w) => ({ text: w.split(":")[0], confidence: Number(w.split(":")[1]) }));
assert.strictEqual(lineScript(line("History:96 of:97 the:97 Church:96")), "Latn");
assert.strictEqual(lineScript(line("Scinde.:67")), "Latn");
assert.strictEqual(lineScript(line("BEET:30 B90XF05:0 BeBus:0 ಸಂಜ:50 20H:63 Ro:0 ಹಡೆಗನಂನೇರಿ:40")), null, "junk Latin, low confidence");
assert.strictEqual(lineScript(line("Rep:79 ಅರ್ಥ-ನಾತೆ:50 ಜೀಜ:40 ನಾಳ:40 cod:14 Rem:26")), null, "no majority");
assert.strictEqual(lineScript(line("ಶಿಂಧುದೇಶ.:80 ಸಮಾಚಾರ:75")), "Knda");
// Crop regions: square, even margin centred, uneven sides shift towards the padded side.
const letter = { x0: 100, y0: 100, x1: 120, y1: 120 };
assert.deepStrictEqual(cropRegion(letter, 0), { x: 98, y: 98, w: 24, h: 24 });
// bottom: 1 adds a letter-height below: square grows to 44 and reaches y=142 (subscript at 120-140)
assert.deepStrictEqual(cropRegion(letter, 0, { top: 0, right: 0, bottom: 1, left: 0 }), { x: 88, y: 98, w: 44, h: 44 });

// Tagged letters: a loose crop around "o" #1 also contains its neighbour's centre, but only #1 is tagged.
const row = [letter, { x0: 125, y0: 100, x1: 145, y1: 120 }];
assert.deepStrictEqual([...taggedLetters(row, [cropRegion(letter, 1.5)])], [0]);
// A hand-drawn box takes every fragment inside it (letter + separately detected vowel sign).
assert.deepStrictEqual([...insideBox(row, { x: 95, y: 95, w: 55, h: 30 })], [0, 1]);
console.log("glyphs.check ok");
