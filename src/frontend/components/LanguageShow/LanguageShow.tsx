import React, { useEffect, useState } from "react";
import axios from "axios";
import { styled } from "styled-components";
import { Button, Icon, InfoBox, Loader } from "@adminjs/design-system";
import { useNavigate } from "react-router-dom";

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

const LetterType = styled.h2`
    font-size: 25px;
    margin-top: 25px;
    margin-bottom: 25px;
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

    const handleCreateClick = () => {
        navigate("/admin/resources/letters/actions/new");
    };

    return (
        <div>
            {loading ? (
                <Loader />
            ) : letters && letters?.length > 0 ? (
                Object.keys(groupedLetters).map((type: string) => (
                    <div key={type}>
                        <LetterType>{type}</LetterType>
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "10px",
                            }}
                        >
                            {groupedLetters[type].map((letter: any) => (
                                <LetterDiv key={letter.id}>
                                    {letter.letter}
                                </LetterDiv>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <InfoBox
                    title={"There are no letters in the language " + language}
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
        </div>
    );
};

export default LanguageShow;
