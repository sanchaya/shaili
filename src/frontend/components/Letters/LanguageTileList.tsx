import React from "react";
import { Box } from "@adminjs/design-system";

interface LanguageTile {
    value: string;
    label: string;
    native_name: string;
    script: string;
    letter_count: number;
    books_count: number;
}

const LanguageTileList = ({
    languages,
    onTileClick
}: {
    languages: LanguageTile[];
    onTileClick: (languageCode: string, languageName: string) => void;
}) => {
    return (
        <Box padding="20px">
            <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                {languages.map((lang) => (
                    <div
                        key={lang.value}
                        style={{
                            border: "1px solid #eee",
                            borderRadius: "8px",
                            padding: "16px",
                            background: "#fff",
                            textAlign: "center",
                            cursor: "pointer",
                        }}
                        onClick={() => onTileClick(lang.value, lang.native_name)}
                    >
                        <div style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "8px" }}>{lang.native_name}</div>
                        <div style={{ fontSize: "0.875rem", color: "#666", marginBottom: "4px" }}>{lang.script}</div>
                        <div style={{ fontSize: "0.75rem", color: "#888", marginBottom: "4px" }}>Letters: {lang.letter_count}</div>
                        <div style={{ fontSize: "0.75rem", color: "#888" }}>Books: {lang.books_count}</div>
                    </div>
                ))}
            </div>
        </Box>
    );
};

export default LanguageTileList;