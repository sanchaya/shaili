import React, { useState } from "react";
import { Box, Button, H3, Icon, Loader } from "@adminjs/design-system";
import { styled } from "@adminjs/design-system/styled-components";
import FilterDrawer from "./FilterDrawer.js";
import axios from "axios";

const CompareItem = styled.div`
    width: calc(50% - 15px);
    background-color: #f0f0f0;
    text-align: center;
    box-sizing: border-box;
    border: 1px solid #ccc;
    padding: 20px;
    @media (max-width: 800px) {
        padding: 8px;
    }
`;

const Container = styled.div`
    text-align: left;
    padding: 10px;
    height: 70vh;
    background-color: #fff;
    box-sizing: border-box;
    border: 1px solid rgb(204, 204, 204);
    overflow-y: auto;
    @media (max-width: 800px) {
        padding: 15px;
    }
`;

const Letters = styled.ul`
    display: flex;
    flex-wrap: wrap;
    padding: 10px;
    @media (max-width: 800px) {
        justify-content: center;
    }
`;

const LetterDiv = styled.li`
    border: 1px solid #bcbec0;
    padding: 5px;
`;

const LetterImage = styled.img`
    width: 60px;
    height: 60px;
    border-radius: 5px;
`;

const EmptyTag = styled.div`
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 35px;
`;

const Language = styled.h2`
    font-size: 20px;
    font-weight: 500;
    color: #000;
    line-height: 1.2;
`;

const LetterType = styled.h3`
    font-size: 20px;
    font-weight: 400;
    color: #000;
    line-height: 1.2;
    @media (max-width: 800px) {
        font-size: 16px;
    }
`;

const Letter = styled.p`
    text-align: center;
    font-size: 18px;
    font-weight: 300;
    color: #000;
    line-height: 1.2;
    padding: 3px;
    @media (max-width: 800px) {
        font-size: 14px;
    }
`;

const LetterTypeDiv = styled.div`
    padding: 10px;
    @media (max-width: 800px) {
        padding: 10px 0;
    }
`;

const NotFoundDiv = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ToolTipButton = styled(Button)`
    margin-right: 5px;
    position: relative;
    &:hover .tooltiptext {
        visibility: visible;
        opacity: 1;
    }
`;

const ToolTipText = styled.span`
    visibility: hidden;
    width: 120px;
    background-color: #0000009e;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;
    position: absolute;
    z-index: 1;
    width: 120px;
    bottom: 125%;
    left: 50%;
    margin-left: -60px;
    font-size: 12px;
    color: #fff;
    &:after {
        content: " ";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #0000009e transparent transparent transparent;
    }
`;

export interface IBookOptions {
    value: number | string;
    label: string | number;
}

interface TagData {
    letter: string;
    image: string;
}

export interface LanguageData {
    [key: string]: {
        [key: string]: TagData[];
    };
}

const Compare = () => {
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;
    const [compareBookData, setCompareBookData] = useState<LanguageData>({});
    const [compareBook, setCompareBook] = useState<IBookOptions | null>(null);
    const [compareLoading, setCompareLoading] = useState(false);
    const [showFilter, setShowFilter] = useState<boolean>(false);
    const [printerName, setPrinterName] = useState<string>();
    const [printerLocation, setPrinterLocation] = useState<string>();
    const [publishedYear, setPublishedYear] = useState<string>();
    const [bookChoosed, setBookChoosed] = useState<boolean>(false);
    const [downloadLoading, setDownloadLoading] = useState<boolean>(false);

    const handleDownloadClick = () => {
        setDownloadLoading(true);
        axios
            .get(`${BASE_URL}/download-tags-zip?bookId=` + compareBook?.value)
            .then((response) => {
                if (response.data.status) {
                    setDownloadLoading(false);
                    const url = response.data.url;
                    window.open(url, "_self");
                }
            })
            .catch((error) => {
                setDownloadLoading(false);
                alert("There is no tags in this book to download now.");
            });
    };
    const isBookHasNoTags =
        Object.keys(compareBookData).length === 0 &&
        compareBookData.constructor === Object;

    return (
        <CompareItem style={{ position: "relative" }}>
            <Box
                flex
                justifyContent="space-between"
                style={{ margin: "10px auto" }}
            >
                <H3 style={{ margin: 0 }}>
                    {compareBook
                        ? "Selected book :" + compareBook.label
                        : "Select a book"}
                </H3>
                <div>
                    <ToolTipButton
                        type="button"
                        variant="outlined"
                        size="icon"
                        color="primary"
                        disabled={!isBookHasNoTags ? false : true}
                        style={{
                            cursor: downloadLoading
                                ? "progress"
                                : isBookHasNoTags
                                ? "default"
                                : "pointer",
                        }}
                        onClick={handleDownloadClick}
                    >
                        {!isBookHasNoTags && (
                            <ToolTipText className="tooltiptext">
                                Click to download tags as Zip
                            </ToolTipText>
                        )}
                        <Icon icon="Download" />
                    </ToolTipButton>
                    <Button
                        type="button"
                        variant="outlined"
                        size="icon"
                        color="primary"
                        onClick={() => {
                            setShowFilter((prevShowFilter) => !prevShowFilter);
                        }}
                    >
                        <Icon icon="Filter" />
                    </Button>
                </div>
            </Box>
            <div className="tagsContainerWrap">
            <Container className="tagsContainer">
                {bookChoosed && compareBook ? (
                    compareLoading == true ? (
                        <Loader />
                    ) : Object.keys(compareBookData).length > 0 ? (
                        Object.entries(compareBookData).map(
                            ([language, tags]) => (
                                <div key={language}>
                                    <Language>Language: {language}</Language>
                                    {Object.entries(
                                        tags as {
                                            [key: string]: TagData[];
                                        }
                                    ).map(([letterType, consonants]) => (
                                        <LetterTypeDiv key={letterType}>
                                            <LetterType>
                                                {letterType}
                                            </LetterType>
                                            <Letters>
                                                {consonants.map(
                                                    (consonant, innerIndex) => (
                                                        <LetterDiv
                                                            key={innerIndex}
                                                        >
                                                            <Letter>
                                                                {
                                                                    consonant.letter
                                                                }
                                                            </Letter>
                                                            {consonant.image ===
                                                            "-" ? (
                                                                <EmptyTag>
                                                                    {
                                                                        consonant.image
                                                                    }
                                                                </EmptyTag>
                                                            ) : (
                                                                <LetterImage
                                                                    src={
                                                                        consonant.image
                                                                    }
                                                                    alt={`Image for ${consonant.letter}`}
                                                                />
                                                            )}
                                                        </LetterDiv>
                                                    )
                                                )}
                                            </Letters>
                                        </LetterTypeDiv>
                                    ))}
                                </div>
                            )
                        )
                    ) : (
                        <NotFoundDiv>No Tags available.</NotFoundDiv>
                    )
                ) : (
                    <NotFoundDiv>
                        Choose publishedyear/ printername/ printerlocation/ book
                        to compare tags
                    </NotFoundDiv>
                )}
            </Container>
            </div>
            {showFilter && (
                <FilterDrawer
                    setShowFilter={setShowFilter}
                    setCompareBookData={setCompareBookData}
                    compareBook={compareBook}
                    setCompareBook={setCompareBook}
                    compareLoading={compareLoading}
                    setCompareLoading={setCompareLoading}
                    printerName={printerName}
                    setPrinterName={setPrinterName}
                    printerLocation={printerLocation}
                    setPrinterLocation={setPrinterLocation}
                    publishedYear={publishedYear}
                    setPublishedYear={setPublishedYear}
                    setBookChoosed={setBookChoosed}
                />
            )}
        </CompareItem>
    );
};

export default Compare;
