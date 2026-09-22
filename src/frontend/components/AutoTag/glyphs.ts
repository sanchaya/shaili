// Pure glyph segmentation + shape matching used by Autopilot (no DOM access).
// Works on a grayscale buffer (0 = black, 255 = white), row-major, width W.

export interface Box {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
}

export interface Shape {
    vec: Uint8Array; // N*N ink mask of the glyph, centred in a square
    ratio: number; // width / height
}

const N = 20;

export const otsu = (gray: Uint8Array | Uint8ClampedArray): number => {
    const hist = new Array(256).fill(0);
    for (let i = 0; i < gray.length; i++) hist[gray[i]]++;
    let sum = 0;
    for (let i = 0; i < 256; i++) sum += i * hist[i];
    let sB = 0, wB = 0, best = 0, th = 128;
    for (let t = 0; t < 256; t++) {
        wB += hist[t];
        if (!wB) continue;
        const wF = gray.length - wB;
        if (!wF) break;
        sB += t * hist[t];
        const mB = sB / wB, mF = (sum - sB) / wF;
        const v = wB * wF * (mB - mF) ** 2;
        if (v > best) {
            best = v;
            th = t;
        }
    }
    return th + 1; // callers treat gray < th as ink; Otsu's t belongs to the dark class
};

// Connected components of ink pixels, filtered to text-sized blobs, with
// vertically stacked parts (vowel signs, subscripts) merged into one akshara.
export const findGlyphs = (gray: Uint8Array | Uint8ClampedArray, W: number, H: number, th: number): Box[] => {
    const label = new Uint8Array(W * H);
    const blobs: (Box & { n: number })[] = [];
    const stack: number[] = [];
    for (let i = 0; i < W * H; i++) {
        if (label[i] || gray[i] >= th) continue;
        const b = { x0: W, y0: H, x1: -1, y1: -1, n: 0 };
        label[i] = 1;
        stack.push(i);
        while (stack.length) {
            const p = stack.pop()!, x = p % W, y = (p / W) | 0;
            b.n++;
            if (x < b.x0) b.x0 = x;
            if (x > b.x1) b.x1 = x;
            if (y < b.y0) b.y0 = y;
            if (y > b.y1) b.y1 = y;
            for (let dy = -1; dy <= 1; dy++)
                for (let dx = -1; dx <= 1; dx++) {
                    const nx = x + dx, ny = y + dy;
                    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
                    const q = ny * W + nx;
                    if (!label[q] && gray[q] < th) {
                        label[q] = 1;
                        stack.push(q);
                    }
                }
        }
        if (b.n >= 8) blobs.push(b);
    }
    if (!blobs.length) return [];

    // Typical glyph height; drops specks, page borders and rules.
    const heights = blobs.map((b) => b.y1 - b.y0 + 1).sort((a, b) => a - b);
    const med = heights[heights.length >> 1];
    const boxes: Box[] = blobs.filter((b) => {
        const w = b.x1 - b.x0 + 1, h = b.y1 - b.y0 + 1;
        return h <= med * 3 && w <= med * 4 && (h >= med * 0.3 || w >= med * 0.3) && w <= h * 5;
    });

    // Sweep by x: a box can only merge with neighbours that overlap it horizontally.
    boxes.sort((a, b) => a.x0 - b.x0);
    for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length && boxes[j].x0 <= boxes[i].x1; j++) {
            const a = boxes[i], c = boxes[j];
            const overlap = Math.min(a.x1, c.x1) - Math.max(a.x0, c.x0);
            const gap = Math.max(a.y0, c.y0) - Math.min(a.y1, c.y1);
            if (overlap > 0.5 * Math.min(a.x1 - a.x0, c.x1 - c.x0) && gap < med * 0.4) {
                boxes[i] = {
                    x0: a.x0,
                    y0: Math.min(a.y0, c.y0),
                    x1: Math.max(a.x1, c.x1),
                    y1: Math.max(a.y1, c.y1),
                };
                boxes.splice(j, 1);
                j = i; // box i grew: rescan its neighbours
            }
        }
    }
    // Reading order: by line, then left to right.
    return boxes.sort((a, b) => Math.round(a.y0 / med) - Math.round(b.y0 / med) || a.x0 - b.x0);
};

// Tight box around all ink (used to strip padding from saved tag images).
export const inkBox = (gray: Uint8Array | Uint8ClampedArray, W: number, H: number, th: number): Box | null => {
    let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++)
            if (gray[y * W + x] < th) {
                if (x < x0) x0 = x;
                if (x > x1) x1 = x;
                if (y < y0) y0 = y;
                if (y > y1) y1 = y;
            }
    return x1 < 0 ? null : { x0, y0, x1, y1 };
};

// Average the glyph into an N×N grid (square, centred) and threshold it.
export const shapeOf = (gray: Uint8Array | Uint8ClampedArray, W: number, box: Box, th: number): Shape => {
    const w = box.x1 - box.x0 + 1, h = box.y1 - box.y0 + 1, s = Math.max(w, h);
    const ox = box.x0 - (s - w) / 2, oy = box.y0 - (s - h) / 2;
    const vec = new Uint8Array(N * N);
    for (let r = 0; r < N; r++)
        for (let c = 0; c < N; c++) {
            let sum = 0, n = 0;
            for (let y = Math.floor(oy + (r * s) / N); y < oy + ((r + 1) * s) / N; y++)
                for (let x = Math.floor(ox + (c * s) / N); x < ox + ((c + 1) * s) / N; x++) {
                    const inside = x >= box.x0 && x <= box.x1 && y >= box.y0 && y <= box.y1;
                    sum += inside ? gray[y * W + x] : 255;
                    n++;
                }
            vec[r * N + c] = n && sum / n < th ? 1 : 0;
        }
    return { vec, ratio: w / h };
};

// 0 = identical, 1 = unrelated (Jaccard distance of ink masks).
export const shapeDistance = (a: Shape, b: Shape): number => {
    if (Math.abs(a.ratio - b.ratio) > 0.35) return 1;
    let diff = 0, union = 0;
    for (let i = 0; i < a.vec.length; i++) {
        if (a.vec[i] !== b.vec[i]) diff++;
        if (a.vec[i] || b.vec[i]) union++;
    }
    return union ? diff / union : 1;
};

export const SAME_SHAPE = 0.33;

// Greedy grouping: each shape joins the first group whose seed it resembles.
export const groupByShape = (shapes: Shape[]): number[][] => {
    const groups: number[][] = [];
    shapes.forEach((s, i) => {
        const g = groups.find((g) => shapeDistance(shapes[g[0]], s) < SAME_SHAPE);
        g ? g.push(i) : groups.push([i]);
    });
    return groups.sort((a, b) => b.length - a.length);
};

// Unicode block of each script used by the supported languages.
const SCRIPT_RANGES: [string, number, number][] = [
    ["Latn", 0x41, 0x7a],
    ["Arab", 0x600, 0x6ff],
    ["Deva", 0x900, 0x97f],
    ["Beng", 0x980, 0x9ff],
    ["Guru", 0xa00, 0xa7f],
    ["Gujr", 0xa80, 0xaff],
    ["Orya", 0xb00, 0xb7f],
    ["Taml", 0xb80, 0xbff],
    ["Telu", 0xc00, 0xc7f],
    ["Knda", 0xc80, 0xcff],
    ["Mlym", 0xd00, 0xd7f],
    ["Olck", 0x1c50, 0x1c7f],
];

export const LANGUAGE_SCRIPT: Record<string, string> = {
    eng: "Latn", hin: "Deva", mar: "Deva", mai: "Deva", san: "Deva", nep: "Deva", kok: "Deva", doi: "Deva",
    brx: "Deva", ben: "Beng", asm: "Beng", mni: "Beng", pan: "Guru", guj: "Gujr", ori: "Orya", tam: "Taml",
    tel: "Telu", kan: "Knda", mal: "Mlym", urd: "Arab", snd: "Arab", kas: "Arab", sat: "Olck",
};

// Majority script of a piece of OCR text (digits/punctuation ignored).
export const scriptOf = (text: string): string | null => {
    const counts: Record<string, number> = {};
    for (const ch of text) {
        const c = ch.codePointAt(0)!;
        if (c >= 0x5b && c <= 0x60) continue; // [\]^_` sit inside the Latin range
        const hit = SCRIPT_RANGES.find(([, lo, hi]) => c >= lo && c <= hi);
        if (hit) counts[hit[0]] = (counts[hit[0]] || 0) + 1;
    }
    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return best ? best[0] : null;
};

// Script of an OCR'd line, or null when unsure. Decided per line, not per word:
// old Indic type misread by a Latin model yields confident-looking junk words,
// but real foreign-language text comes as whole lines (headings, captions).
export const lineScript = (words: { text: string; confidence: number }[]): string | null => {
    const scripted = words.map((w) => ({ ...w, script: scriptOf(w.text) })).filter((w) => w.script);
    const counts: Record<string, number> = {};
    for (const w of scripted) counts[w.script!] = (counts[w.script!] || 0) + 1;
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (!top || top[1] < 0.6 * scripted.length) return null;
    const mine = scripted.filter((w) => w.script === top[0]);
    const conf = mine.reduce((s, w) => s + w.confidence, 0) / mine.length;
    return conf >= 60 ? top[0] : null;
};

export interface Sides {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export const NO_SIDES: Sides = { top: 0, right: 0, bottom: 0, left: 0 };

// Square crop region around a letter. `sides` extend it unevenly (fraction of the
// letter's size per side, e.g. bottom: 0.5 to take in a subscript); `margin` pads all round.
export const cropRegion = (b: Box, margin: number, sides: Sides = NO_SIDES) => {
    const size = Math.max(b.x1 - b.x0, b.y1 - b.y0);
    const x0 = b.x0 - sides.left * size, x1 = b.x1 + sides.right * size;
    const y0 = b.y0 - sides.top * size, y1 = b.y1 + sides.bottom * size;
    const s = Math.max(4, Math.round(Math.max(x1 - x0, y1 - y0) * (1 + margin)) + 4);
    return { x: Math.round((x0 + x1 - s) / 2), y: Math.round((y0 + y1 - s) / 2), w: s, h: s };
};

const centreIn = (b: Box, t: { x: number; y: number; w: number; h: number }) => {
    const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
    return cx >= t.x && cx <= t.x + t.w && cy >= t.y && cy <= t.y + t.h;
};

// Letters covered by a hand-drawn box: every fragment whose centre lies inside it.
export const insideBox = (boxes: Box[], t: { x: number; y: number; w: number; h: number }): Set<number> =>
    new Set(boxes.map((b, i) => (centreIn(b, t) ? i : -1)).filter((i) => i >= 0));

// Letters already tagged: each saved tag marks the one letter nearest its centre
// (loose crops contain neighbours too, so "centre inside" alone over-matches).
export const taggedLetters = (boxes: Box[], tags: { x: number; y: number; w: number; h: number }[]): Set<number> => {
    const hit = new Set<number>();
    for (const t of tags) {
        const tx = t.x + t.w / 2, ty = t.y + t.h / 2;
        let best = -1, bestD = Infinity;
        boxes.forEach((b, i) => {
            if (!centreIn(b, t)) return;
            const d = ((b.x0 + b.x1) / 2 - tx) ** 2 + ((b.y0 + b.y1) / 2 - ty) ** 2;
            if (d < bestD) {
                bestD = d;
                best = i;
            }
        });
        if (best >= 0) hit.add(best);
    }
    return hit;
};
