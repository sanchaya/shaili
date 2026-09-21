import React, { useEffect, useState } from "react";
import axios from "axios";
import { styled } from "styled-components";
import { Button, Header, Icon, InfoBox, Loader, Modal, ModalProps } from "@adminjs/design-system";
import { useNavigate, useParams } from "react-router-dom";
import { useCurrentAdmin, useNotice } from "adminjs";
import EditLetterModal from "../Letters/EditLetterModal.js";

interface ILanguageShowProps {
    record: {
        params: {
            language: string;
            language_code: string;
        };
    };
}

interface ILetter {
    id: number;
    letter: string;
    unicode: string | null;
    language: string;
    letter_type: number;
}

interface ILetterType {
    id: number;
    language: string;
    type: number;
}

const LetterDiv = styled.div`
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
    background: #fff;
    transition: 0.3s;
    min-width: 75px;
    min-height: 75px;
    font-size: 20px;
    text-align: center;
    border-radius: 10px;
    display: inline-block;
    line-height: 75px;
    &:hover {
        box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
    }
`;

const LanguageShow: React.FC<ILanguageShowProps> = ({ record }) => {
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;
    const [letters, setLetters] = useState<ILetter[] | undefined>();
    const [letterTypes, setLetterTypes] = useState<ILetterType[] | undefined>();
    const [groupedLetters, setGroupedLetters] = useState<{
        [key: number]: ILetterType[];
    }>({});

    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();
    const [currentAdmin] = useCurrentAdmin();
    const addNotice = useNotice();
    const language = record.params.language;
    const languageCode = record.params.language_code;
    useEffect(() => {
        axios.get(`${BASE_URL}/get-lettertypes`).then((response) => {
            const filteredLettertypes = response.data
                .filter(
                    (lettertype: ILetterType) =>
                        lettertype.language === languageCode
                )
                .sort((a: { type: string }, b: { type: string }) =>
                    a.type > b.type ? 1 : -1
                );
            setLetterTypes(filteredLettertypes);
        });
        axios.get(`${BASE_URL}/get-letters`).then((response) => {
            const filteredLetters = response.data
                .filter((letter: any) => letter.language === languageCode)
                .sort((a: { letter: string }, b: { letter: string }) =>
                    a.letter > b.letter ? 1 : -1
                );
            if (filteredLetters.length <= 0) setLoading(false);
            setLetters(filteredLetters);
        });
    }, []);

    useEffect(() => {
        const getLetterTypeName = (letterTypeId) => {
            if (letterTypes) {
                const letterTypeName = letterTypes.find(
                    (type: ILetterType) => type.id === letterTypeId
                );
                return letterTypeName?.type;
            }
        };

        const order = [
            "Vowels",
            "Consonants",
            "Numerals",
            "Consonants",
            "Compounds",
            "Conjuncts",
            "Special Symbols",
            "Custom Symbols",
        ];

        const groupedLetters: { [key: string]: ILetterType[] } = {};

        if (letters && letters.length) {
            letters.forEach((letter: any) => {
                letter.letter_type = getLetterTypeName(letter.letter_type);
                if (!groupedLetters[letter.letter_type]) {
                    groupedLetters[letter.letter_type] = [];
                }
                groupedLetters[letter.letter_type].push(letter);
            });

            const orderedGroupedLetters: { [key: string]: ILetterType[] } = {};

            order.forEach((type) => {
                if (groupedLetters[type]) {
                    orderedGroupedLetters[type] = groupedLetters[type];
                    delete groupedLetters[type];
                }
            });

            for (const remainingType in groupedLetters) {
                orderedGroupedLetters[remainingType] =
                    groupedLetters[remainingType];
            }

            setGroupedLetters(orderedGroupedLetters);
            setLoading(false);
        }
    }, [letters, letterTypes]);

    const [modalOpen, setModalOpen] = useState<ILetter | null>(null);

    const openModal = (letter: ILetter) => {
        setModalOpen(letter);
    };

    const closeModal = () => {
        setModalOpen(null);
    };

    const saveLetter = async (letter: ILetter) => {
        const data = {
            id: letter.id,
            letter: letter.letter,
            unicode: letter.unicode,
            language: language,
            letter_type: letter.letter_type,
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
                closeModal();
            }
        } catch (error) {
            addNotice({
                message: error.response?.data || "Error updating letter",
                type: "error",
            });
        }
    };

    const handleCreateClick = () => {
        navigate("/admin/resources/letters/actions/new");
    };

    return (
        <>
            <div className="language-show">
                <Header.H3>Language : {record.params.language}</Header.H3>
                {loading ? (
                    <Loader />
                ) : letters && letters?.length > 0 ? (
                    Object.keys(groupedLetters).map((type: string) => (
                        <div key={type}>
                            <Header.H4 className="letterTypeHeader">
                                {type}
                            </Header.H4>
                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "10px",
                                }}
                            >
                                {groupedLetters[type].map((letter: any) => (
                                    <LetterDiv
                                        key={letter.id}
                                        onClick={() => openModal(letter)}
                                    >
                                        {letter.letter}
                                    </LetterDiv>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <InfoBox
                        title={
                            "There are no letters in the language " + language
                        }
                        illustration="NotFound"
                    >
                        <Button
                            variant="contained"
                            mt="lg"
                            onClick={handleCreateClick}
                        >
                            <Icon icon="Plus" />
                            Create Letter
                        </Button>
                    </InfoBox>
                )}
                {modalOpen && (
                    <EditLetterModal
                        record={{ params: { ...modalOpen, language_code: languageCode } }}
                        onClose={closeModal}
                        onSave={() => saveLetter(modalOpen)}
                    />
                )}
            </div>
        </>
    );
};

export default LanguageShow;
