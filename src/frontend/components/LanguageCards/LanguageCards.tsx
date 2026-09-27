import React, { useEffect, useState } from "react";
import { Box, Loader } from "@adminjs/design-system";
import axios from "axios";

interface LanguageCardData {
    language_code: string;
    language: string;
    native_name: string;
    scripts: { name: string; books_count: number }[];
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
    // Script step: with a language set, show its scripts instead; one script or none → render children.
    language?: string;
    onScriptSelect?: (script: string) => void;
    children?: React.ReactNode;
    header?: React.ReactNode; // shown above the script cards
}

const LanguageCards: React.FC<LanguageCardsProps> = ({ resourceId, onLanguageSelect, language, onScriptSelect, children, header }) => {
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
    const scripts = languages.find((lang) => lang.language_code === language)?.scripts ?? [];

    if (loading) {
        return (
            <Box variant="container" py="xl" style={{ textAlign: "center" }}>
                <Loader />
            </Box>
        );
    }

    if (language && scripts.length <= 1) return <>{children}</>;

    const cards = language
        ? scripts.map((script) => ({
              key: script.name,
              title: script.name,
              subtitle: "Script",
              count: script.books_count,
              onClick: () => onScriptSelect?.(script.name),
          }))
        : withData.map((lang) => ({
              key: lang.language_code,
              title: lang.native_name || lang.language,
              subtitle: lang.language,
              count: lang[countKey] as number,
              onClick: () => handleSelect(lang.language_code),
          }));

    return (
        <Box variant="container" py="xl">
            {language && header}
            <div
                style={{
                    display: "grid",
                    gap: "16px",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                }}
            >
                {cards.length === 0 && (
                    <p style={{ color: "#898a9a" }}>No data available.</p>
                )}
                {cards.map((card) => (
                    <div
                        key={card.key}
                        onClick={card.onClick}
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
                            {card.title}
                        </div>
                        <div
                            style={{
                                fontSize: "0.8rem",
                                color: "#666",
                                marginBottom: "10px",
                            }}
                        >
                            {card.subtitle}
                        </div>
                        <div
                            style={{
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                color: "#3040d6",
                            }}
                        >
                            {card.count} record
                            {card.count === 1 ? "" : "s"}
                        </div>
                    </div>
                ))}
            </div>
        </Box>
    );
};

export default LanguageCards;