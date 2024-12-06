import React, { useEffect, useState } from "react";
import { FormGroup, Label, Select } from "@adminjs/design-system";
import axios from "axios";
import { FilterPropertyProps } from "adminjs";

interface ISelectOptions {
    value: number | string;
    label: string;
}

const LetterTypeInFilter: React.FC<FilterPropertyProps> = (props) => {
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;
    const [languageOptions, setLanguageOptions] = useState<ISelectOptions[]>();
    const [letterTypeOptions, setLetterTypeOptions] =
        useState<Record<string, ISelectOptions[]>>();
    const [selectedLanguage, setSelectedLanguage] =
        useState<ISelectOptions | null>(null);
    const [selectedLetterType, setSelectedLetterType] =
        useState<ISelectOptions | null>(null);
    const { onChange, filter } = props;

    const getLetterTypes = () => {
        axios.get(`${BASE_URL}/get-lettertypes`).then((response) => {
            let letterTypes: Record<string, ISelectOptions[]> = {};
            response.data.forEach(
                (letterType: {
                    id: number;
                    type: string;
                    language: string;
                }) => {
                    const languageKey = letterType.language.toLowerCase();
                    if (!letterTypes[languageKey]) {
                        letterTypes[languageKey] = [];
                    }

                    letterTypes[languageKey].push({
                        value: letterType.id.toString(),
                        label: letterType.type,
                    });
                }
            );
            Object.keys(letterTypes).forEach((key) => {
                letterTypes[key].sort((a, b) => a.label.localeCompare(b.label));
            });
            setLetterTypeOptions(letterTypes);
        });
    };

    useEffect(() => {
        axios.get(`${BASE_URL}/get-languages`).then((response) => {
            let languages = response.data.map(
                (language: { language_code: string; language: string }) => ({
                    value: language.language_code,
                    label: language.language,
                })
            );
            languages.sort((a, b) => a.label.localeCompare(b.label));
            setLanguageOptions(languages);
        });
    }, []);

    useEffect(() => {
        getLetterTypes();
    }, [selectedLanguage]);

    useEffect(() => {
        if (filter.language && languageOptions) {
            const selectedLanguageOption = languageOptions.find(
                (option) => option.value === filter.language
            );
            if (selectedLanguageOption) {
                setSelectedLanguage(selectedLanguageOption);
            }
        }

        if (filter.letter_type && letterTypeOptions) {
            const selectedLetterTypeOption = letterTypeOptions[
                filter.language
            ].find((option) => option.value === filter.letter_type);
            if (selectedLetterTypeOption) {
                setSelectedLetterType(selectedLetterTypeOption);
            }
        }
    }, [
        filter.language,
        filter.letter_type,
        languageOptions,
        letterTypeOptions,
    ]);

    return (
        <>
            <FormGroup>
                <Label>Language</Label>
                <Select
                    value={selectedLanguage}
                    options={languageOptions}
                    isClearable={false}
                    onChange={(selectedOption) => {
                        setSelectedLanguage(selectedOption);
                        onChange("language", selectedOption.value);
                    }}
                    placeholder="Select a language"
                />
            </FormGroup>
            {letterTypeOptions && (
                <FormGroup>
                    <Label>Letter Type</Label>
                    <Select
                        isDisabled={!selectedLanguage}
                        value={selectedLetterType}
                        isClearable={false}
                        options={
                            letterTypeOptions[selectedLanguage?.value || ""] ||
                            []
                        }
                        onChange={(selectedOption) => {
                            setSelectedLetterType(selectedOption);
                            onChange("letter_type", selectedOption.value);
                        }}
                        placeholder={
                            selectedLanguage
                                ? "Select a letter type"
                                : "Select a language first"
                        }
                    />
                </FormGroup>
            )}
        </>
    );
};

export default LetterTypeInFilter;
