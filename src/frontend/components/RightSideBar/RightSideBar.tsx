import React, { useEffect, useState } from "react";
import { styled } from "@adminjs/design-system/styled-components";
import TagImage from "../TagImage/TagImage.js";
import { Tabs, Tab, Icon, Loader } from "@adminjs/design-system";
import { TaggedLetters } from "../../../backend/db/models/TaggedLetters.js";
import { useLetterTagContext } from "../../context/LetterTagContext.js";

const TagsWrap = styled.div`
    padding: 1em;
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
`;

const AllTagsWrap = styled.div`
    display: flex;
    flex-direction: column;
`;

const AccordionItem = styled.div`
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    padding: 10px;
    border-bottom: 1px solid #ccc;
    align-items: center;
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

const RightSideBar = ({ bookId, loading, letterTypes, setLetterTypes }) => {
    const { tags, fetchTag } = useLetterTagContext();
    const [selectedTab, setSelectedTab] = useState("recent");

    const handleAccordionClick = (accordionId: number) => {
        const updatedAccordionStates = letterTypes.map(
            (state: { id: number; expanded: boolean }) =>
                state.id === accordionId
                    ? { ...state, expanded: !state.expanded }
                    : state
        );
        setLetterTypes(updatedAccordionStates);
    };

    useEffect(() => {
        fetchTag(bookId);
    }, [bookId]);

    return (
        <Tabs currentTab={selectedTab} onChange={setSelectedTab}>
            <Tab id="recent" label="Recent">
                {loading ? (
                    <Loader />
                ) : tags.recentLetters.length != 0 ? (
                    <TagsWrap>
                        {tags.recentLetters.map(
                            (
                                recentTaggedLetter: TaggedLetters,
                                index: number
                            ) => (
                                <TagImage
                                    taggedBy={recentTaggedLetter.tagged_by}
                                    key={index}
                                    tagId={recentTaggedLetter.id}
                                    image={recentTaggedLetter.cropped_image}
                                    letter={recentTaggedLetter.letter.letter}
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
            <Tab id="all" label="All">
                {loading ? (
                    <Loader />
                ) : (
                    <AllTagsWrap>
                        {letterTypes.map((accordion: any) => (
                            <div key={accordion.id}>
                                <AccordionItem
                                    onClick={() =>
                                        handleAccordionClick(accordion.id)
                                    }
                                >
                                    <span>{accordion.title}</span>
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
                                    {tags.taggedLetters.filter(
                                        (taggedLetter: TaggedLetters) =>
                                            taggedLetter.letter.letter_type ===
                                            accordion.letterType
                                    ).length === 0 ? (
                                        <p
                                            style={{
                                                background: "#eee",
                                                padding: "20px",
                                            }}
                                        >
                                            No data available
                                        </p>
                                    ) : (
                                        <TagsWrap>
                                            {tags.taggedLetters
                                                .filter(
                                                    (
                                                        taggedLetter: TaggedLetters
                                                    ) =>
                                                        taggedLetter.letter
                                                            .letter_type ===
                                                        accordion.letterType
                                                )
                                                .map(
                                                    (
                                                        taggedLetter: TaggedLetters,
                                                        index: number
                                                    ) => (
                                                        <TagImage
                                                            taggedBy={
                                                                taggedLetter.tagged_by
                                                            }
                                                            key={index}
                                                            tagId={
                                                                taggedLetter.id
                                                            }
                                                            image={
                                                                taggedLetter.cropped_image
                                                            }
                                                            letter={
                                                                taggedLetter
                                                                    .letter
                                                                    .letter
                                                            }
                                                        />
                                                    )
                                                )}
                                        </TagsWrap>
                                    )}
                                </AccordionContent>
                            </div>
                        ))}
                    </AllTagsWrap>
                )}
            </Tab>
        </Tabs>
    );
};

export default RightSideBar;
