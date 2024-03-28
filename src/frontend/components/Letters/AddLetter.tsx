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
    value: number;
    label: string;
}

const AddLetter = () => {
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
    const [lettername, setLettername] = useState("");
    const [unicode, setUniCode] = useState("");
    const navigate = useNavigate();
    const addNotice = useNotice();

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
            getLetterTypes();
        });
    }, []);

    const getLetterTypes = () => {
        axios.get(`${BASE_URL}/get-lettertypes`).then((response) => {
            let letterTypes: Record<
                string,
                { value: string; label: string }[]
            > = {};
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

    const handleLanguageChange = (newValue: any) => {
        setLanguage(newValue);
        setLetterType(null);
    };
    const saveLetter = async () => {
        const data = {
            letter: lettername,
            unicode: unicode ?? "",
            language: language?.value,
            letter_type: letterType?.value,
            created_by: Number(currentAdmin?.id),
            updated_by: Number(currentAdmin?.id),
            user_defined: false,
        };

        try {
            const response = await axios.post(`${BASE_URL}/new-letter`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.status == 200) {
                addNotice({
                    message: "Letter added successfully",
                    type: "success",
                });
                navigate("/admin/resources/letters");
            }
        } catch (error) {
            addNotice({
                message: error.response.data,
                type: "error",
            });
        }
    };

    const handleLetternameChange = (event) => {
        setLettername(event.target.value);
    };

    const handleUniCodeChange = (event) => {
        setUniCode(event.target.value);
    };

    return (
        <Box
            padding="20px"
            borderRadius="8px"
            boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
            backgroundColor="white"
        >
            <Box>
                <FormGroup>
                    <Label required>Letter</Label>
                    <Input
                        id="letter"
                        name="letter"
                        value={lettername}
                        onChange={handleLetternameChange}
                        required
                    ></Input>
                </FormGroup>
                <FormGroup>
                    <Label>Unicode</Label>
                    <Input
                        id="unicode"
                        name="unicode"
                        value={unicode}
                        onChange={handleUniCodeChange}
                        maxLength={5}
                    ></Input>
                </FormGroup>
                <FormGroup>
                    <Label required>Language</Label>
                    <Select
                        value={language}
                        options={languageOptions}
                        isClearable={false}
                        onChange={handleLanguageChange}
                        placeholder="Select a language"
                        required
                    />
                </FormGroup>
                {letterTypeOptions && (
                    <FormGroup>
                        <Label required>Letter Type</Label>
                        <Select
                            isDisabled={!language}
                            value={letterType}
                            isClearable={false}
                            options={
                                letterTypeOptions[language?.value || ""] || []
                            }
                            onChange={(newValue) => setLetterType(newValue)}
                            placeholder={
                                language
                                    ? "Select a letter type"
                                    : "Select a language first"
                            }
                            required
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
                    Save
                </Button>
            </Box>
        </Box>
    );
};

export default AddLetter;
