import React, { useEffect, useState } from "react";
import {
    Box,
    FormGroup,
    Label,
    Input,
    Button,
    Select,
} from "@adminjs/design-system";
import axios from "axios";
import { useCurrentAdmin, useNotice } from "adminjs";
import { useNavigate } from "react-router-dom";

interface ISelectOptions {
    value: string;
    label: string;
}

const EditLetter = (props) => {
    const { record } = props;
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;
    const [languageOptions, setLanguageOptions] = useState<ISelectOptions[]>();
    const [letterTypeOptions, setLetterTypeOptions] =
        useState<Record<string, { value: string; label: string }[]>>();
    const [language, setLanguage] = useState<{
        value: string;
        label: string;
    } | null>(null);
    const [letterType, setLetterType] = useState<{
        value: string;
        label: string;
    } | null>(null);
    const [currentAdmin] = useCurrentAdmin();
    const [lettername, setLettername] = useState(null);
    const addNotice = useNotice();
    const navigate = useNavigate();

    useEffect(() => {
        setLettername(record.params.letter);
        const fetchData = async () => {
            try {
                const [languagesResponse, letterTypesResponse] =
                    await Promise.all([
                        axios.get(`${BASE_URL}/get-languages`),
                        axios.get(`${BASE_URL}/get-lettertypes`),
                    ]);

                const languages = languagesResponse.data.map((language) => ({
                    value: language.language_code,
                    label: language.language,
                }));
                setLanguageOptions(languages);

                let letterTypes = {};
                letterTypesResponse.data.forEach((letterType) => {
                    const languageKey = letterType.language.toLowerCase();
                    letterTypes[languageKey] = letterTypes[languageKey] || [];
                    letterTypes[languageKey].push({
                        value: letterType.id.toString(),
                        label: letterType.type,
                    });
                });
                setLetterTypeOptions(letterTypes);

                const selectedLanguage = languages.find(
                    (option) => option.value === record.params?.language
                );
                if (selectedLanguage) {
                    setLanguage(selectedLanguage);
                } else {
                    console.warn("Language not found for record:", record);
                }

                if (record.params?.letter_type) {
                    const selectedLetterType = letterTypes[
                        record.params.language?.toLowerCase()
                    ]?.find(
                        (option) =>
                            option.value ===
                            record.params.letter_type.toString()
                    );

                    if (selectedLetterType) {
                        setLetterType(selectedLetterType);
                    } else {
                        console.warn(
                            "Letter type not found for record:",
                            record
                        );
                    }
                }
            } catch (error) {
                addNotice({
                    message: "Error fetching data",
                    type: "error",
                });
            }
        };

        fetchData();
    }, [record.params?.language, record.params?.letter_type]);

    const saveLetter = async () => {
        const data = {
            id: record.params.id,
            letter: lettername == "" ? record.params.letter : lettername,
            language: language?.value,
            letter_type: letterType?.value,
            created_by: Number(currentAdmin?.id),
            updated_by: Number(currentAdmin?.id),
            user_defined: false,
        };
        try {
            const response = await axios.post(`${BASE_URL}/edit-letter`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.status == 200) {
                addNotice({
                    message: "Letter updated successfully",
                    type: "success",
                });
                navigate("/admin/resources/letters/");
            }
        } catch (error) {
            addNotice({
                message: error.response.data,
                type: "error",
            });
        }
    };

    const handleLanguageChange = (newValue: any) => {
        setLanguage(newValue);
        setLetterType(null);
    };

    const handleLetternameChange = (event) => {
        setLettername(event.target.value);
    };

    return (
        <Box
            padding="20px"
            borderRadius="8px"
            boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
            backgroundColor="white"
        >
            <div>
                <Box>
                    <FormGroup>
                        <Label required>Letter</Label>
                        <Input
                            id="letter"
                            name="letter"
                            value={lettername ? lettername : ""}
                            onChange={handleLetternameChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label required>Language</Label>
                        <Select
                            value={language}
                            isClearable={false}
                            options={languageOptions}
                            onChange={handleLanguageChange}
                            placeholder="Select a language"
                        />
                    </FormGroup>
                    {letterTypeOptions && (
                        <FormGroup>
                            <Label required>Letter Type</Label>
                            <Select
                                isDisabled={!language}
                                isClearable={false}
                                value={letterType}
                                options={
                                    letterTypeOptions[language?.value || ""] ||
                                    []
                                }
                                onChange={(newValue) => setLetterType(newValue)}
                                placeholder={
                                    language
                                        ? "Select a letter type"
                                        : "Select a language first"
                                }
                            />
                        </FormGroup>
                    )}
                </Box>

                <Box mt="xl" style={{ textAlign: "center" }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={saveLetter}
                        disabled={!language || !letterType || !lettername}
                    >
                        Update
                    </Button>
                </Box>
            </div>
        </Box>
    );
};

export default EditLetter;
