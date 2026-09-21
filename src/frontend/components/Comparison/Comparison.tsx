import React, { useEffect, useState } from "react";
import { Box, H2, Loader } from "@adminjs/design-system";
import { styled } from "@adminjs/design-system/styled-components";
import Select from "react-select";
import axios from "axios";
import Compare, { IBookOptions } from "./Compare.js";

const Container = styled(Box)`
    background-color: rgb(248, 249, 249);
`;

const TopBar = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
    flex-wrap: wrap;
`;

const TopBarLabel = styled.label`
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    white-space: nowrap;
`;

const LanguageSelect = styled(Select)`
    min-width: 220px;
`;

const CompareContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
`;

const CompareItem = styled.div`
    width: calc(50% - 8px);
    background-color: #f0f0f0;
    text-align: center;
    box-sizing: border-box;
    border: 1px solid #ccc;
    @media (max-width: 800px) {
        width: 100%;
    }
`;

const ToggleWrapper = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 13px;
    color: #374151;
    white-space: nowrap;
    margin-left: auto;
`;

const ToggleInput = styled.input`
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: #3b82f6;
`;

interface ILanguage {
    id: number;
    language: string;
    language_code: string;
}

const Comparison = () => {
    const BASE_URL = (window as any).AdminJS?.env?.BASE_URL || '';
    const [languages, setLanguages] = useState<ILanguage[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<IBookOptions | null>(null);
    const [loading, setLoading] = useState(true);
    const [hideUntagged, setHideUntagged] = useState(false);

    useEffect(() => {
        axios.get(`${BASE_URL}/get-languages`).then((response) => {
            const withBooks = response.data.filter((lang: ILanguage) =>
                ["hin", "kan", "ben", "tam", "tel", "mar", "guj", "mal", "ory", "pan", "asm", "eng"].includes(lang.language_code)
            );
            setLanguages(response.data);
            setLoading(false);
        });
    }, []);

    const languageOptions: IBookOptions[] = languages.map((lang) => ({
        value: lang.language_code,
        label: lang.language,
    }));

    return (
        <Container variant="container">
            <TopBar>
                <TopBarLabel>Compare letter extraction across books</TopBarLabel>
                <LanguageSelect
                    isClearable
                    value={selectedLanguage}
                    options={languageOptions}
                    onChange={(val) => setSelectedLanguage(val)}
                    placeholder="Select a language to compare..."
                />
                <ToggleWrapper>
                    <ToggleInput
                        type="checkbox"
                        checked={hideUntagged}
                        onChange={(e) => setHideUntagged(e.target.checked)}
                    />
                    Hide untagged characters
                </ToggleWrapper>
            </TopBar>
            <CompareContainer>
                <CompareItem style={{ position: "relative" }}>
                    <Compare languageCode={selectedLanguage?.value as string | undefined} />
                </CompareItem>
                <CompareItem style={{ position: "relative" }}>
                    <Compare languageCode={selectedLanguage?.value as string | undefined} />
                </CompareItem>
            </CompareContainer>
        </Container>
    );
};

export default Comparison;
