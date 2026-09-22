import React, { useEffect, useRef, useState } from "react";
import { Button, Icon, Loader } from "@adminjs/design-system";
import Select from "react-select";
import axios from "axios";
import { useCurrentAdmin, useNotice } from "adminjs";
import { ITagBox, useLetterTagContext } from "../../context/LetterTagContext.js";
import {
    Box, LANGUAGE_SCRIPT, NO_SIDES, Shape, Sides, cropRegion, findGlyphs, groupByShape, inkBox, insideBox,
    lineScript, otsu, shapeDistance, shapeOf, taggedLetters,
} from "./glyphs.js";

// Book language -> Tesseract model (same-script fallbacks for unsupported ones).
const OCR_LANG: Record<string, string> = {
    hin: "hin", ben: "ben", tel: "tel", mar: "mar", tam: "tam", urd: "urd", guj: "guj", kan: "kan",
    mal: "mal", ori: "ori", pan: "pan", asm: "asm", san: "san", nep: "nep", snd: "snd", eng: "eng",
    mai: "hin", doi: "hin", brx: "hin", kok: "mar",
};
const TESSERACT_URL = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
const MAX_REFERENCES = 400;
const PAGE_SIZE = 20; // groups shown (and OCR'd) at a time
const BOOK_MATCH = 0.3; // max shape distance to reuse a letter tagged earlier in this book

interface LetterOption {
    value: number;
    label: string;
    language: string;
}

interface LanguageOption {
    value: string;
    label: string;
}

interface Crop {
    src: string;
    box: ITagBox; // square region saved as the specimen, in page pixels
    glyph: Box; // detected letter outline the crop is built around
}

const DEFAULT_MARGIN = 0.3; // crop side = letter size × (1 + margin)

interface Group {
    id: number;
    language: string;
    crops: Crop[];
    ocrTried: boolean;
    checked: boolean[];
    letter: LetterOption | null;
    source: "book" | "ocr" | null;
    margin: number;
    sides: Sides;
}

const SIDE_CONTROLS: [keyof Sides, string][] = [
    ["top", "↑ Top"],
    ["bottom", "↓ Bottom"],
    ["left", "← Left"],
    ["right", "→ Right"],
];

const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });

const grayOf = (img: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const rgba = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const gray = new Uint8ClampedArray(canvas.width * canvas.height);
    for (let i = 0; i < gray.length; i++)
        gray[i] = (rgba[i * 4] * 299 + rgba[i * 4 + 1] * 587 + rgba[i * 4 + 2] * 114) / 1000;
    return { gray, W: canvas.width, H: canvas.height };
};

// Square crop with a margin, like the manual cropper (aspectRatio 1) produces.
const cropOf = (img: HTMLImageElement, b: Box, margin = DEFAULT_MARGIN, sides = NO_SIDES): Crop => {
    const { x, y, w: s } = cropRegion(b, margin, sides);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = s;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, x, y, s, s, 0, 0, s, s);
    return { src: canvas.toDataURL(), box: { x, y, w: s, h: s }, glyph: b };
};

// One worker per model set + page segmentation mode, created on first use.
const tesseractWorkers: Record<string, Promise<any>> = {};
let tesseractScript: Promise<void> | null = null;
const ocrWorker = (models: string, psm: "3" | "8") => {
    const key = `${models}|${psm}`;
    if (!tesseractWorkers[key]) {
        if (!tesseractScript)
            tesseractScript = new Promise<void>((resolve, reject) => {
                const script = document.createElement("script");
                script.src = TESSERACT_URL;
                script.onload = () => resolve();
                script.onerror = reject;
                document.head.appendChild(script);
            });
        tesseractWorkers[key] = tesseractScript.then(async () => {
            const worker = await (window as any).Tesseract.createWorker(models);
            await worker.setParameters({ tessedit_pageseg_mode: psm }); // 3 = full page, 8 = single word
            return worker;
        });
    }
    return tesseractWorkers[key];
};

// Text lines on the page with their script, for telling English (etc.) apart from the book's language.
const readLines = async (image: string, models: string) => {
    const worker = await ocrWorker(models, "3");
    const { data } = await worker.recognize(image, {}, { blocks: true });
    return (data.blocks || [])
        .flatMap((b: any) => b.paragraphs.flatMap((p: any) => p.lines))
        .map((l: any) => ({ bbox: l.bbox as Box, script: lineScript(l.words) }))
        .filter((l: any) => l.script);
};

interface AutoTagProps {
    image: string;
    page: number;
    bookId: number;
    language: string;
    onNextPage: () => void;
    onClose: () => void;
    onRecrop: (box: ITagBox) => void; // open a specimen in the main cropper
}

const AutoTag: React.FC<AutoTagProps> = ({ image, page, bookId, language, onNextPage, onClose, onRecrop }) => {
    const pageImage = useRef<HTMLImageElement | null>(null);
    // Id of the newest tag when a hand recrop was opened; the next tag after it is that recrop.
    const recropAfter = useRef<number | null>(null);
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;
    const [currentAdmin] = useCurrentAdmin();
    const addNotice = useNotice();
    const { tags, fetchTag, addTag } = useLetterTagContext();
    const [letters, setLetters] = useState<LetterOption[]>([]);
    const [languages, setLanguages] = useState<LanguageOption[]>([]);
    // Languages to recognise on the page: the book's own plus English by default.
    const [detect, setDetect] = useState<string[]>(Array.from(new Set([language, "eng"])));
    const [groups, setGroups] = useState<Group[]>([]);
    const [status, setStatus] = useState("");
    const [saving, setSaving] = useState<number | null>(null);
    const [tagsLoaded, setTagsLoaded] = useState(false);
    const [visible, setVisible] = useState(PAGE_SIZE);

    useEffect(() => {
        fetchTag(bookId).finally(() => setTagsLoaded(true));
        axios.get(`${BASE_URL}/get-letters`).then((response) => {
            setLetters(
                response.data
                    .map((l) => ({ value: l.id, label: l.letter, language: l.language }))
                    .sort((a, b) => (a.label > b.label ? 1 : -1))
            );
        });
        axios.get(`${BASE_URL}/get-languages`).then((response) => {
            setLanguages(response.data.map((l) => ({ value: l.language_code, label: l.language })));
        });
    }, [bookId]);

    const languageName = (code: string) => languages.find((l) => l.value === code)?.label || code;

    // Specimens already tagged in this book are the best reference for its typeface.
    const loadReferences = async () => {
        const refs: { shape: Shape; letterId: number }[] = [];
        await Promise.all(
            tags.taggedLetters.slice(0, MAX_REFERENCES).map(async (t: any) => {
                try {
                    const { gray, W, H } = grayOf(await loadImage(t.tag_path));
                    const th = otsu(gray);
                    const box = inkBox(gray, W, H, th);
                    if (box) refs.push({ shape: shapeOf(gray, W, box, th), letterId: t.letter_id });
                } catch {
                    // missing image file: skip that reference
                }
            })
        );
        return refs;
    };

    useEffect(() => {
        if (!image || !letters.length || !tagsLoaded) return;
        let cancelled = false;
        (async () => {
            setGroups([]);
            setStatus("Finding letters on this page…");
            const img = await loadImage(image);
            pageImage.current = img;
            const { gray, W, H } = grayOf(img);
            const th = otsu(gray);
            const taggedHere = tags.taggedLetters
                .filter((t: any) => t.page === page && t.box_w)
                .map((t: any) => ({ x: t.box_x, y: t.box_y, w: t.box_w, h: t.box_h }));
            const all = findGlyphs(gray, W, H, th);
            const done = taggedLetters(all, taggedHere);
            const boxes = all.filter((_, i) => !done.has(i));

            // Language of each letter = script of the OCR line it sits in (book language if unsure).
            const boxLanguage = boxes.map(() => language);
            const models = Array.from(new Set(detect.map((l) => OCR_LANG[l]).filter(Boolean))).join("+");
            if (models && detect.length > 1) {
                setStatus("Reading the page to tell languages apart…");
                try {
                    const lines = await readLines(image, models);
                    boxes.forEach((b, i) => {
                        const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
                        const line = lines.find((l) => cx >= l.bbox.x0 && cx <= l.bbox.x1 && cy >= l.bbox.y0 && cy <= l.bbox.y1);
                        const match = line && detect.find((l) => LANGUAGE_SCRIPT[l] === line.script);
                        if (match) boxLanguage[i] = match;
                    });
                } catch {
                    // OCR unavailable: everything stays in the book's language
                }
            }
            if (cancelled) return;

            setStatus("Grouping similar letters…");
            const shapes = boxes.map((b) => shapeOf(gray, W, b, th));
            const refs = await loadReferences();
            const byId = new Map(letters.map((l) => [l.value, l]));
            const result: Group[] = [];
            for (const lang of new Set(boxLanguage)) {
                const idx = boxes.map((_, i) => i).filter((i) => boxLanguage[i] === lang);
                for (const members of groupByShape(idx.map((i) => shapes[i]))) {
                    const seed = shapes[idx[members[0]]];
                    // Suggest the closest specimen already tagged in this book, in the same language.
                    let best = { d: BOOK_MATCH, letter: null as LetterOption | null };
                    for (const r of refs) {
                        const l = byId.get(r.letterId);
                        if (!l || l.language !== lang) continue;
                        const d = shapeDistance(seed, r.shape);
                        if (d < best.d) best = { d, letter: l };
                    }
                    result.push({
                        id: result.length,
                        language: lang,
                        crops: members.map((m) => cropOf(img, boxes[idx[m]])),
                        checked: members.map(() => true),
                        letter: best.letter,
                        source: best.letter ? "book" : null,
                        margin: DEFAULT_MARGIN,
                        sides: NO_SIDES,
                        ocrTried: !!best.letter,
                    });
                }
            }
            result.sort((a, b) => b.crops.length - a.crops.length);
            if (cancelled) return;
            setVisible(PAGE_SIZE);
            setGroups(result);
            const skipped = all.length - boxes.length;
            const perLanguage = Array.from(new Set(boxLanguage))
                .map((l) => `${boxLanguage.filter((x) => x === l).length} ${languageName(l)}`)
                .join(", ");
            setStatus(
                `${boxes.length} letters found (${perLanguage}) in ${result.length} groups` +
                    (skipped ? `, ${skipped} already tagged were skipped` : "") +
                    ". Nothing is saved until you confirm."
            );
        })();
        return () => {
            cancelled = true;
        };
    }, [image, letters, tagsLoaded, detect]);

    // OCR guess for visible groups that have no match in this book yet.
    useEffect(() => {
        const next = groups.slice(0, visible).find((g) => !g.ocrTried);
        if (!next) return;
        let cancelled = false;
        (async () => {
            let change: Partial<Group> = { ocrTried: true };
            try {
                const model = OCR_LANG[next.language];
                if (model) {
                    const worker = await ocrWorker(model, "8");
                    const img = await loadImage(next.crops[0].src);
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width * 2;
                    canvas.height = img.height * 2;
                    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const { data } = await worker.recognize(canvas);
                    const text = data.text.trim();
                    const guess = letters.find((l) => l.language === next.language && l.label === text);
                    if (guess) change = { ocrTried: true, letter: guess, source: "ocr" };
                }
            } catch {
                // OCR unavailable (offline / blocked CDN): shape grouping still works
            }
            if (!cancelled) update(next.id, change);
        })();
        return () => {
            cancelled = true;
        };
    }, [groups, visible]);

    // A hand recrop was saved: drop every detected piece inside the box that was drawn
    // (the letter plus any vowel sign / subscript that was detected as a separate letter).
    useEffect(() => {
        const newest: any = tags.taggedLetters[0];
        if (recropAfter.current === null || !newest || newest.id === recropAfter.current) return;
        recropAfter.current = null;
        if (newest.page !== page || !newest.box_w) return;
        const drawn = { x: newest.box_x, y: newest.box_y, w: newest.box_w, h: newest.box_h };
        setGroups((gs) =>
            gs
                .map((g) => {
                    const covered = insideBox(g.crops.map((c) => c.glyph), drawn);
                    return {
                        ...g,
                        crops: g.crops.filter((_, k) => !covered.has(k)),
                        checked: g.checked.filter((_, k) => !covered.has(k)),
                    };
                })
                .filter((g) => g.crops.length)
        );
    }, [tags.taggedLetters]);

    const recrop = (g: Group, k: number) => {
        recropAfter.current = (tags.taggedLetters[0] as any)?.id ?? 0;
        onRecrop(g.crops[k].box);
    };

    // Rebuild a group's crops after its padding changed.
    const reframe = (g: Group, margin: number, sides: Sides) =>
        update(g.id, { margin, sides, crops: g.crops.map((c) => cropOf(pageImage.current!, c.glyph, margin, sides)) });

    const update = (id: number, change: Partial<Group>) =>
        setGroups((gs) => gs.map((g) => (g.id === id ? { ...g, ...change } : g)));

    const remove = (id: number) => setGroups((gs) => gs.filter((g) => g.id !== id));

    const confirm = async (g: Group) => {
        const crops = g.crops.filter((_, k) => g.checked[k]);
        setSaving(g.id);
        let saved = 0;
        for (const crop of crops) {
            try {
                await addTag({
                    book_id: bookId,
                    letter_id: g.letter!.value,
                    croppedImage: crop.src,
                    tagged_by: Number(currentAdmin?.id),
                    page,
                    box: crop.box,
                });
                saved++;
            } catch {
                // counted as failed below
            }
        }
        setSaving(null);
        addNotice({
            message: `${saved} of ${crops.length} tagged as ${g.letter!.label}`,
            type: saved === crops.length ? "success" : "error",
        });
        if (saved) remove(g.id);
    };

    return (
        <div style={{ padding: "16px", overflowY: "auto", maxHeight: "900px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                <strong>Autopilot · OCR assistant</strong>
                <div style={{ display: "flex", gap: "8px" }}>
                    <Button size="sm" variant="outlined" onClick={onNextPage}>
                        Next page
                    </Button>
                    <Button size="sm" variant="text" onClick={onClose}>
                        Exit
                    </Button>
                </div>
            </div>
            <div style={{ marginTop: "12px", fontSize: "13px" }}>
                Languages on this page
                <Select
                    isMulti
                    value={languages.filter((l) => detect.includes(l.value))}
                    options={languages.filter((l) => OCR_LANG[l.value] || l.value === language)}
                    onChange={(selected) => {
                        const codes = selected.map((s) => s.value);
                        setDetect(codes.includes(language) ? codes : [language, ...codes]);
                    }}
                />
            </div>
            <p style={{ color: "#666", fontSize: "13px", margin: "8px 0 16px" }}>
                {status} Click a specimen to leave it out; double-click it to redraw its outline by hand (pieces inside the new box are removed from the list).
            </p>
            {!groups.length && <Loader />}
            {groups.slice(0, visible).map((g) => {
                const count = g.checked.filter(Boolean).length;
                return (
                    <div key={g.id} style={{ border: "1px solid #eee", borderRadius: "8px", padding: "10px", marginBottom: "12px" }}>
                        {g.language !== language && (
                            <div style={{ fontSize: "11px", color: "#3040d6", marginBottom: "4px" }}>
                                {languageName(g.language)}
                            </div>
                        )}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxHeight: "140px", overflowY: "auto" }}>
                            {g.crops.map((crop, k) => (
                                <img
                                    key={k}
                                    src={crop.src}
                                    width={40}
                                    height={40}
                                    title={`${g.checked[k] ? "Click to leave out" : "Click to include"}, double-click to redraw its outline`}
                                    onClick={() => update(g.id, { checked: g.checked.map((c, j) => (j === k ? !c : c)) })}
                                    onDoubleClick={() => recrop(g, k)}
                                    style={{
                                        cursor: "pointer",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                        opacity: g.checked[k] ? 1 : 0.25,
                                    }}
                                />
                            ))}
                        </div>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", marginTop: "6px" }}>
                            Crop
                            <input
                                type="range"
                                min={-0.1}
                                max={1.5}
                                step={0.05}
                                value={g.margin}
                                style={{ flex: 1 }}
                                title="Tighter ← → looser, on all sides"
                                onChange={(e) => reframe(g, Number(e.target.value), g.sides)}
                            />
                            <span style={{ width: "40px", textAlign: "right" }}>{Math.round(g.margin * 100)}%</span>
                        </label>
                        <details style={{ fontSize: "12px", marginTop: "4px" }}>
                            <summary style={{ cursor: "pointer" }}>Adjust sides (subscripts, vowel signs)</summary>
                            {SIDE_CONTROLS.map(([side, label]) => (
                                <label key={side} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ width: "70px" }}>{label}</span>
                                    <input
                                        type="range"
                                        min={0}
                                        max={1}
                                        step={0.05}
                                        value={g.sides[side]}
                                        style={{ flex: 1 }}
                                        onChange={(e) => reframe(g, g.margin, { ...g.sides, [side]: Number(e.target.value) })}
                                    />
                                    <span style={{ width: "40px", textAlign: "right" }}>{Math.round(g.sides[side] * 100)}%</span>
                                </label>
                            ))}
                        </details>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "8px" }}>
                            <div style={{ flex: 1 }}>
                                <Select
                                    value={g.letter}
                                    options={letters.filter((l) => l.language === g.language)}
                                    placeholder={`Choose ${languageName(g.language)} letter`}
                                    onChange={(letter) => update(g.id, { letter, source: null })}
                                />
                            </div>
                            {g.source && (
                                <span style={{ fontSize: "11px", color: g.source === "book" ? "#0a7d33" : "#b26a00" }}>
                                    {g.source === "book" ? "matches this book" : "OCR guess"}
                                </span>
                            )}
                            <Button
                                size="sm"
                                variant="contained"
                                disabled={!g.letter || !count || saving !== null}
                                onClick={() => confirm(g)}
                            >
                                {saving === g.id ? <Icon icon="Loader" spin /> : `Tag ${count}`}
                            </Button>
                            <Button size="sm" variant="text" onClick={() => remove(g.id)} disabled={saving !== null}>
                                Skip
                            </Button>
                        </div>
                    </div>
                );
            })}
            {groups.length > visible && (
                <Button variant="outlined" onClick={() => setVisible(visible + PAGE_SIZE)}>
                    Show more ({groups.length - visible} groups left, mostly one-off shapes)
                </Button>
            )}
        </div>
    );
};

export default AutoTag;
