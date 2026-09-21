import React, { useEffect, useState } from "react";
import { Box, Loader } from "@adminjs/design-system";
import axios from "axios";

interface LanguageCardData {
    language_code: string;
    language: string;
    native_name: string;
    script: string;
    books_count: number;
    letters_count: number;
    letter_types_count: number;
}

const RESOURCE_COUNT_KEY: Record<string, string> = {
    books: "books_count",
    letters: "letters_count",
    letter_types: "letter_types_count",
};

interface LanguageCardsProps {
    resourceId: string;
    onLanguageSelect?: (languageCode: string) => void;
}

const LanguageCards: React.FC<LanguageCardsProps> = ({ resourceId, onLanguageSelect }) => {
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;
    const [languages, setLanguages] = useState<LanguageCardData[]>([]);
    const [loading, setLoading] = useState(true);

    const countKey = RESOURCE_COUNT_KEY[resourceId] || "books_count";

    useEffect(() => {
        axios
            .get(`${BASE_URL}/dashboard-stats`)
            .then((response) => {
                setLanguages(response.data?.languages || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSelect = (languageCode: string) => {
        if (onLanguageSelect) {
            onLanguageSelect(languageCode);
        }
    };

    const withData = languages.filter((lang) => (lang[countKey] || 0) > 0);

    if (loading) {
        return (
            <Box variant="container" py="xl" style={{ textAlign: "center" }}>
                <Loader />
            </Box>
        );
    }

    return (
        <Box variant="container" py="xl">
            <div
                style={{
                    display: "grid",
                    gap: "16px",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                }}
            >
                {withData.length === 0 && (
                    <p style={{ color: "#898a9a" }}>No data available.</p>
                )}
                {withData.map((lang) => (
                    <div
                        key={lang.language_code}
                        onClick={() => handleSelect(lang.language_code)}
                        style={{
                            border: "1px solid #eee",
                            borderRadius: "12px",
                            padding: "18px",
                            background: "#fff",
                            textAlign: "center",
                            cursor: "pointer",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                            transition: "transform 0.2s, box-shadow 0.2s",
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = "translateY(-4px)";
                            e.currentTarget.style.boxShadow =
                                "0 6px 16px rgba(0,0,0,0.12)";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                                "0 1px 3px rgba(0,0,0,0.08)";
                        }}
                    >
                        <div
                            style={{
                                fontSize: "1.3rem",
                                fontWeight: "bold",
                                marginBottom: "6px",
                                color: "#0c1e29",
                            }}
                        >
                            {lang.native_name || lang.language}
                        </div>
                        <div
                            style={{
                                fontSize: "0.8rem",
                                color: "#666",
                                marginBottom: "8px",
                            }}
                        >
                            {lang.language}
                        </div>
                        <div
                            style={{
                                fontSize: "0.75rem",
                                color: "#888",
                                fontStyle: "italic",
                                marginBottom: "10px",
                            }}
                        >
                            {lang.script}
                        </div>
                        <div
                            style={{
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                color: "#3040d6",
                            }}
                        >
                            {lang[countKey]} record
                            {lang[countKey] === 1 ? "" : "s"}
                        </div>
                    </div>
                ))}
            </div>
        </Box>
    );
};

export default LanguageCards;