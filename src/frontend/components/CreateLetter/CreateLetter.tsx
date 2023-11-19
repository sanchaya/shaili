import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Select from "react-select";
import { styled } from "styled-components";
import { Button, Header } from "@adminjs/design-system";
import axios from "axios";
import { useCurrentAdmin, useNotice } from "adminjs";
import { useLetterTagContext } from "../../context/LetterTagContext.js";

interface ICreateLetter {
    tag: string;
    bookId: number;
    newLetter: string;
    setCreateLetter: Dispatch<SetStateAction<boolean>>;
    setTag: Dispatch<SetStateAction<string>>;
}

interface ISelectOptions {
    value: string;
    label: string;
}

const LetterSelectWrap = styled.div`
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    gap: 25px;
    justify-content: center;
`;

const CreateLetter: React.FC<ICreateLetter> = ({
    tag,
    bookId,
    newLetter,
    setCreateLetter,
    setTag,
}) => {
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;
    const addNotice = useNotice();
    const { addTag } = useLetterTagContext();
    const [currentAdmin] = useCurrentAdmin();
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

    useEffect(() => {
        axios.get(`${BASE_URL}/get-languages`).then((response) => {
            let languages = response.data.map(
                (language: { language_code: string; language: string }) => ({
                    value: language.language_code,
                    label: language.language,
                })
            );
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
            setLetterTypeOptions(letterTypes);
        });
    };

    const handleLanguageChange = (newValue: any) => {
        setLanguage(newValue);
        setLetterType(null);
    };

    const saveLetter = async () => {
        const data = {
            letter: newLetter,
            language: language?.value,
            letterType: letterType?.value,
            createdBy: Number(currentAdmin?.id),
        };
        try {
            const response = await axios.post(`${BASE_URL}/add-letter`, data);
            if (response.status === 200) {
                saveTag(response.data.id);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const saveTag = async (letterId: number) => {
        const data = {
            book_id: bookId,
            letter_id: letterId,
            cropped_image: tag,
            tagged_by: Number(currentAdmin?.id),
        };

        addTag(data)
            .then(() => {
                setTag("");
                addNotice({
                    message: "Tag added successfully",
                    type: "success",
                });
            })
            .catch((error) => {
                setTag("");
                addNotice({
                    message: "Error adding tag try again later",
                    type: "error",
                });
            });
    };

    return (
        <>
            <Header.H3 textAlign="center" marginTop="default" marginBottom="xl">
                Create Letter - "{newLetter}"
            </Header.H3>
            <LetterSelectWrap>
                <div style={{ width: "100%" }}>
                    <Select
                        value={language}
                        options={languageOptions}
                        onChange={handleLanguageChange}
                        placeholder="Select a language"
                    />
                </div>
                {letterTypeOptions && (
                    <div style={{ width: "100%" }}>
                        <Select
                            isDisabled={!language}
                            value={letterType}
                            options={
                                letterTypeOptions[language?.value || ""] || []
                            }
                            onChange={(newValue) => setLetterType(newValue)}
                            placeholder={
                                language
                                    ? "Select a tetter type"
                                    : "Select a language first"
                            }
                        />
                    </div>
                )}
            </LetterSelectWrap>
            <div
                style={{
                    display: "flex",
                    textAlign: "center",
                    justifyContent: "flex-end",
                    gap: "20px",
                    marginTop: "25px",
                }}
            >
                <Button color="primary" onClick={() => setCreateLetter(false)}>
                    Go back
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={saveLetter}
                    disabled={!letterType}
                >
                    Create and Tag
                </Button>
            </div>
        </>
    );
};

export default CreateLetter;
