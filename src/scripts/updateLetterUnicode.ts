import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE!,
    process.env.MYSQL_USER!,
    process.env.MYSQL_PASS!,
    {
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT || "3306"),
        dialect: "mysql",
        logging: false,
    }
);

const getUnicodeValue = (char: string): string => {
    if (!char || char.length === 0) return "";
    const codePoint = char.codePointAt(0);
    if (!codePoint) return "";
    return "U+" + codePoint.toString(16).toUpperCase().padStart(4, "0");
};

const updateUnicode = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connected to database");

        // Use raw SQL to update all letters at once (bypasses model validation)
        const [letters]: any[] = await sequelize.query(
            "SELECT id, letter, unicode FROM letters"
        );

        console.log(`Found ${letters.length} letters total`);

        let updated = 0;
        let alreadyCorrect = 0;

        // Build batch update queries
        const updates: Promise<any>[] = [];

        for (const letter of letters) {
            const unicodeValue = getUnicodeValue(letter.letter);
            if (!unicodeValue) continue;

            if (letter.unicode === unicodeValue) {
                alreadyCorrect++;
                continue;
            }

            updates.push(
                sequelize.query(
                    "UPDATE letters SET unicode = :unicode WHERE id = :id",
                    {
                        replacements: { unicode: unicodeValue, id: letter.id },
                    }
                )
            );
            updated++;
        }

        // Execute all updates
        await Promise.all(updates);

        console.log(`\nDone!`);
        console.log(`  Updated: ${updated}`);
        console.log(`  Already correct: ${alreadyCorrect}`);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await sequelize.close();
    }
};

updateUnicode();
