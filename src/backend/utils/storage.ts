import path from "path";
import { fileURLToPath } from "url";

// User uploads (tag crops, avatars) live outside dist/ so rebuilds can't wipe them.
// Resolves to <project>/storage from both src/ and dist/.
export const STORAGE_DIR =
    process.env.STORAGE_DIR ||
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..", "storage");
