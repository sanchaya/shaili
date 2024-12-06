import React, { useEffect, useState } from "react";
import { styled } from "@adminjs/design-system/styled-components";
import TagImage from "../TagImage/TagImage.js";
import { Tabs, Tab, Icon, Loader, Link } from "@adminjs/design-system";
import { TaggedLetters } from "../../../backend/db/models/TaggedLetters.js";
import { useLetterTagContext } from "../../context/LetterTagContext.js";
import axios from "axios";
import TagsListModal from "../TagsListModal/TagsListModal.js";
import { useLettersContext } from "../../context/LettersContext.js";

const TagsWrap = styled.div`
    padding: 1em;
    display: flex;
    flex-wrap: wrap;
    gap: 30px 24.4px;
`;

const AllTagsWrap = styled.div`
    display: flex;
    flex-direction: column;
`;

const AccordionItem = styled.div`
    display: flex;
    cursor: pointer;
    padding: 10px;
    border-bottom: 1px solid #ccc;
    align-items: center;
    justify-content: space-between;
`;

const AccordionArrow = styled.div`
    font-size: 24px;
    line-height: 1;
`;

const AccordionContent = styled.div`
    display: block;
    &.inactive {
        display: none;
    }
`;

const StyledDiv = styled.div`
    display: flex;
    flex-direction: column;
    width: 60px;
    height: 100%;
    align-items: center;
    gap: 5px;
`;

const NoTagDiv = styled.div`
    display: flex;
    align-items: stretch;
    align-content: center;
    flex-wrap: wrap;
    height: 60px;
`;

interface ISelectOptions {
    value: string;
    label: string;
}

interface ILettersData {
    id: number;
    language: string;
    letter: string;
    letter_type: string;
}

const RightSideBar = ({
    bookId,
    loading,
    letterTypes,
    setLetterTypes,
    selectedLanguage,
}) => {
    const { tags, fetchTag } = useLetterTagContext();
    const { letters, fetchLetters } = useLettersContext();
    const [selectedTab, setSelectedTab] = useState("all");
    const [showTags, setShowTags] = useState<boolean>(false);
    const [selectedLetter, setSelectedLetter] = useState<number>();
    const [languages, setLanguages] = useState<ISelectOptions[] | null>(null);
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;

    const handleAccordionClick = (accordionId: number, language: string) => {
        const updatedAccordionStates = { ...letterTypes };
        Object.keys(updatedAccordionStates).forEach((key) => {
            updatedAccordionStates[key] = updatedAccordionStates[key].map(
                (state: { id: number; expanded: boolean; language: string }) =>
                    state.id === accordionId && state.language === language
                        ? { ...state, expanded: !state.expanded }
                        : { ...state, expanded: false }
            );
        });
        setLetterTypes(updatedAccordionStates);
    };

    useEffect(() => {
        fetchTag(bookId);
        fetchLetters();
        axios.get(`${BASE_URL}/get-languages`).then((response) => {
            let languages = response.data.map(
                (language: { language_code: string; language: string }) => ({
                    value: language.language_code,
                    label: language.language,
                })
            );
            setLanguages(languages);
        });
    }, [bookId]);

    const handleLetterClick = (letter: number) => {
        setSelectedLetter(letter);
        setShowTags(true);
    };

    const getLanguageLabel = (value: string) => {
        const foundLanguage = languages?.find((lang) => lang.value === value);
        return foundLanguage ? foundLanguage.label : "";
    };

    return (
        <div>
            <Tabs currentTab={selectedTab} onChange={setSelectedTab}>
                <Tab id="all" label="All">
                    {loading ? (
                        <Loader />
                    ) : (
                        <AllTagsWrap>
                            {!letterTypes[selectedLanguage] &&
                            selectedLanguage != "all" ? (
                                <p
                                    style={{
                                        background: "#eee",
                                        padding: "20px",
                                    }}
                                >
                                    No letter types available for{" "}
                                    {getLanguageLabel(selectedLanguage)}
                                </p>
                            ) : (
                                ""
                            )}
                            {Object.keys(letterTypes)
                                .sort()
                                .filter((language) =>
                                    selectedLanguage === "all"
                                        ? true
                                        : language === selectedLanguage
                                )
                                .map((language) =>
                                    letterTypes[language].map(
                                        (accordion: any) => (
                                            <div key={accordion.id}>
                                                <AccordionItem
                                                    onClick={() =>
                                                        handleAccordionClick(
                                                            accordion.id,
                                                            accordion.language
                                                        )
                                                    }
                                                >
                                                    <span>
                                                        {accordion.title}
                                                        {selectedLanguage ===
                                                            "all" &&
                                                            " - " +
                                                                getLanguageLabel(
                                                                    language
                                                                )}
                                                    </span>
                                                    <AccordionArrow>
                                                        {accordion.expanded ? (
                                                            <Icon icon="Minus" />
                                                        ) : (
                                                            <Icon icon="Plus" />
                                                        )}
                                                    </AccordionArrow>
                                                </AccordionItem>
                                                <AccordionContent
                                                    className={
                                                        accordion.expanded
                                                            ? "active"
                                                            : "inactive"
                                                    }
                                                >
                                                    {letters.filter(
                                                        (
                                                            letter: ILettersData
                                                        ) => {
                                                            return (
                                                                letter.letter_type ===
                                                                    accordion.letterType &&
                                                                letter.language ===
                                                                    accordion.language
                                                            );
                                                        }
                                                    ).length === 0 ? (
                                                        <p
                                                            style={{
                                                                background:
                                                                    "#eee",
                                                                padding: "20px",
                                                            }}
                                                        >
                                                            No data available
                                                        </p>
                                                    ) : (
                                                        <TagsWrap>
                                                            {letters
                                                                .filter(
                                                                    (
                                                                        letter: ILettersData
                                                                    ) => {
                                                                        return (
                                                                            letter.letter_type ===
                                                                                accordion.letterType &&
                                                                            letter.language ===
                                                                                accordion.language
                                                                        );
                                                                    }
                                                                )
                                                                .sort(
                                                                    (
                                                                        a: ILettersData,
                                                                        b: ILettersData
                                                                    ) => {
                                                                        return a.letter.localeCompare(
                                                                            b.letter
                                                                        );
                                                                    }
                                                                )
                                                                .map(
                                                                    (
                                                                        letter: ILettersData,
                                                                        index: number
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                index
                                                                            }
                                                                        >
                                                                            {tags.taggedLetters.some(
                                                                                (
                                                                                    taggedLetter: any
                                                                                ) =>
                                                                                    taggedLetter.letter_id ===
                                                                                    letter.id
                                                                            ) ? (
                                                                                <>
                                                                                    <Link
                                                                                        style={{
                                                                                            display:
                                                                                                "flex",
                                                                                            flexDirection:
                                                                                                "column",
                                                                                            alignItems:
                                                                                                "center",
                                                                                            gap: "8px",
                                                                                        }}
                                                                                        size="lg"
                                                                                        key={
                                                                                            letter.id
                                                                                        }
                                                                                        onClick={() =>
                                                                                            handleLetterClick(
                                                                                                letter.id
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <img
                                                                                            width={
                                                                                                "60px"
                                                                                            }
                                                                                            height={
                                                                                                "60px"
                                                                                            }
                                                                                            style={{
                                                                                                borderRadius:
                                                                                                    "10px",
                                                                                            }}
                                                                                            src={
                                                                                                tags.taggedLetters.find(
                                                                                                    (
                                                                                                        taggedLetter: any
                                                                                                    ) =>
                                                                                                        taggedLetter.letter_id ===
                                                                                                        letter.id
                                                                                                )
                                                                                                    ?.tag_path
                                                                                            }
                                                                                        />
                                                                                        {
                                                                                            letter.letter
                                                                                        }
                                                                                    </Link>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <StyledDiv
                                                                                        key={
                                                                                            letter.id
                                                                                        }
                                                                                    >
                                                                                        <NoTagDiv>
                                                                                            <span
                                                                                                style={{
                                                                                                    fontSize:
                                                                                                        "24px",
                                                                                                }}
                                                                                            >
                                                                                                -
                                                                                            </span>
                                                                                        </NoTagDiv>
                                                                                        <span>
                                                                                            {
                                                                                                letter.letter
                                                                                            }
                                                                                        </span>
                                                                                    </StyledDiv>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                )}
                                                        </TagsWrap>
                                                    )}
                                                </AccordionContent>
                                            </div>
                                        )
                                    )
                                )}
                        </AllTagsWrap>
                    )}
                </Tab>
                <Tab id="recent" label="Recent">
                    {loading ? (
                        <Loader />
                    ) : tags.recentLetters.length != 0 ? (
                        <TagsWrap>
                            {tags.recentLetters
                                .slice()
                                .sort(
                                    (a, b) =>
                                        new Date(b.updated_at).getTime() -
                                        new Date(a.updated_at).getTime()
                                )
                                .map(
                                    (
                                        recentTaggedLetter: TaggedLetters,
                                        index: number
                                    ) => (
                                        <TagImage
                                            taggedBy={
                                                recentTaggedLetter.tagged_by
                                            }
                                            key={index}
                                            bookId={bookId}
                                            tagId={recentTaggedLetter.id}
                                            image={recentTaggedLetter.tag_path}
                                            letter={
                                                recentTaggedLetter.letter.letter
                                            }
                                            letterId={
                                                recentTaggedLetter.letter_id
                                            }
                                        />
                                    )
                                )}
                        </TagsWrap>
                    ) : (
                        <p style={{ padding: "20px" }}>
                            Your recently tagged letters will be shown here
                        </p>
                    )}
                </Tab>
            </Tabs>
            {showTags && (
                <TagsListModal
                    setShowTags={setShowTags}
                    selectedLetter={selectedLetter}
                    bookId={bookId}
                />
            )}
        </div>
    );
};

export default RightSideBar;
