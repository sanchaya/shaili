import React, { useEffect, useState } from "react";
import { Box, Button, H3, Icon, Loader } from "@adminjs/design-system";
import { styled } from "@adminjs/design-system/styled-components";
import Select from "react-select";
import axios from "axios";
import CompareComments from "./CompareComments.js";
import { Comments } from "../../../backend/db/models/Comments.js";

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

const FiltersBar = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 12px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
`;

const FilterGroup = styled.div`
    flex: 1;
    min-width: 160px;
`;

const FilterLabel = styled.label`
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
`;

const FilterSelect = styled(Select)`
    font-size: 13px;
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
    font-weight: 400;
    color: #000;
    line-height: 1.2;
`;

const LetterType = styled.h3`
    font-size: 18px;
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
    color: #6b7280;
    padding: 40px 20px;
    font-size: 14px;
`;

const BookAdditionalDetails = styled.div`
    background: #f8f9f9;
    border-radius: 3px;
    padding: 12px;
    margin-bottom: 10px;
`;

const BookAdditionalDetail = styled.div`
    display: flex;
    gap: 10px;
    font-style: italic;
    font-size: 14px;
    line-height: 1.5;
`;

const CommentsContainer = styled.div`
    text-align: left;
    margin-top: 10px;
    padding: 10px;
    background-color: #fff;
    box-sizing: border-box;
    border: 1px solid rgb(204, 204, 204);
    overflow-y: auto;
    @media (max-width: 800px) {
        padding: 15px;
    }
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

interface IData {
    id: number;
    image: string;
    letter: string;
    type: string;
    language: string;
}

interface IBooks {
    id: number;
    name: string;
    status: number;
    language: string;
    printer_name: string;
    printer_location: string;
    published_year: string;
}

interface ILetterType {
    id: number;
    type: string;
    language: string;
}

interface TagData {
    letter: string;
    image: string;
}

interface IUser {
    id: number;
    name: string;
}

export interface LanguageData {
    [key: string]: {
        [key: string]: TagData[];
    };
}

interface CompareProps {
    languageCode?: string;
}

const Compare = ({ languageCode }: CompareProps) => {
    const BASE_URL = (window as any).AdminJS?.env?.BASE_URL || '';
    const [compareBookData, setCompareBookData] = useState<LanguageData>({});
    const [compareBook, setCompareBook] = useState<IBookOptions | null>(null);
    const [compareLoading, setCompareLoading] = useState(false);
    const [bookChoosed, setBookChoosed] = useState<boolean>(false);
    const [downloadLoading, setDownloadLoading] = useState<boolean>(false);
    const [selectedBookData, setSelectedBookData] = useState<IBooks[]>();
    const [comments, setLocalComments] = useState<Comments[] | undefined>();
    const [users, setUsers] = useState<IUser[]>([]);

    const [books, setBooks] = useState<IBooks[]>([]);
    const [letters, setLetters] = useState<any>();
    const [letterType, setLetterType] = useState<ILetterType[]>();
    const [bookOptions, setBookOptions] = useState<IBookOptions[]>([]);
    const [printerNameOptions, setPrinterNameOptions] = useState<IBookOptions[]>([]);
    const [printerLocationOptions, setPrinterLocationOptions] = useState<IBookOptions[]>([]);
    const [publishedYearOptions, setPublishedYearOptions] = useState<IBookOptions[]>([]);

    const [selectedPrinterName, setSelectedPrinterName] = useState<IBookOptions | null>(null);
    const [selectedPrinterLocation, setSelectedPrinterLocation] = useState<IBookOptions | null>(null);
    const [selectedPublishedYear, setSelectedPublishedYear] = useState<IBookOptions | null>(null);

    useEffect(() => {
        axios.get(`${BASE_URL}/get-users`).then((response) => setUsers(response.data));
        axios.get(`${BASE_URL}/get-lettertypes`).then((response) => setLetterType(response.data));
        axios.get(`${BASE_URL}/get-letters`).then((response) => setLetters(response.data));
    }, []);

    useEffect(() => {
        setSelectedPrinterName(null);
        setSelectedPrinterLocation(null);
        setSelectedPublishedYear(null);
        setCompareBook(null);
        setBookChoosed(false);
        setCompareBookData({});

        const url = languageCode
            ? `${BASE_URL}/get-books-with-tags?language=${languageCode}`
            : `${BASE_URL}/get-books-with-tags`;

        axios.get(url).then(async (response) => {
            const allBooks = response.data;
            setBooks(allBooks);

            setBookOptions(sortOptions(allBooks.map((b: IBooks) => ({ value: b.id, label: b.name }))));
            setPrinterNameOptions(await calcUnique(allBooks, "printer_name"));
            setPrinterLocationOptions(await calcUnique(allBooks, "printer_location"));
            setPublishedYearOptions(await calcUnique(allBooks, "published_year"));
        });
    }, [languageCode]);

    const sortOptions = (opts: IBookOptions[]) =>
        opts.sort((a, b) => String(a.label).toLowerCase().localeCompare(String(b.label).toLowerCase()));

    const calcUnique = async (data: IBooks[], key: keyof IBooks): Promise<IBookOptions[]> => {
        const map = new Map<string | number, IBookOptions>();
        data.filter((item) => item[key] !== null && item[key] !== "").forEach((item) => {
            const val = item[key];
            if (!map.has(val)) map.set(val, { value: val, label: val });
        });
        const arr = Array.from(map.values());
        if (key === "published_year") {
            arr.sort((a, b) => (b.label as number) - (a.label as number));
        } else {
            arr.sort((a, b) => String(a.label).toLowerCase().localeCompare(String(b.label).toLowerCase()));
        }
        return arr;
    };

    const applyFilters = (
        printerName: IBookOptions | null,
        printerLocation: IBookOptions | null,
        publishedYear: IBookOptions | null
    ) => {
        let filtered = books;
        if (printerName) filtered = filtered.filter((b) => b.printer_name === printerName.value);
        if (printerLocation) filtered = filtered.filter((b) => b.printer_location === printerLocation.value);
        if (publishedYear) filtered = filtered.filter((b) => b.published_year === publishedYear.value);

        setBookOptions(sortOptions(filtered.map((b) => ({ value: b.id, label: b.name }))));
        setCompareBook(null);
    };

    const handlePrinterNameChange = async (val: IBookOptions | null) => {
        setSelectedPrinterName(val);
        const loc = selectedPrinterLocation;
        const year = selectedPublishedYear;
        let filtered = books;
        if (val) filtered = filtered.filter((b) => b.printer_name === val.value);
        if (loc) filtered = filtered.filter((b) => b.printer_location === loc.value);
        if (year) filtered = filtered.filter((b) => b.published_year === year.value);
        setBookOptions(sortOptions(filtered.map((b) => ({ value: b.id, label: b.name }))));
        setPrinterLocationOptions(await calcUnique(filtered, "printer_location"));
        setPublishedYearOptions(await calcUnique(filtered, "published_year"));
        setCompareBook(null);
    };

    const handlePrinterLocationChange = async (val: IBookOptions | null) => {
        setSelectedPrinterLocation(val);
        const name = selectedPrinterName;
        const year = selectedPublishedYear;
        let filtered = books;
        if (name) filtered = filtered.filter((b) => b.printer_name === name.value);
        if (val) filtered = filtered.filter((b) => b.printer_location === val.value);
        if (year) filtered = filtered.filter((b) => b.published_year === year.value);
        setBookOptions(sortOptions(filtered.map((b) => ({ value: b.id, label: b.name }))));
        setPrinterNameOptions(await calcUnique(filtered, "printer_name"));
        setPublishedYearOptions(await calcUnique(filtered, "published_year"));
        setCompareBook(null);
    };

    const handlePublishedYearChange = async (val: IBookOptions | null) => {
        setSelectedPublishedYear(val);
        const name = selectedPrinterName;
        const loc = selectedPrinterLocation;
        let filtered = books;
        if (name) filtered = filtered.filter((b) => b.printer_name === name.value);
        if (loc) filtered = filtered.filter((b) => b.printer_location === loc.value);
        if (val) filtered = filtered.filter((b) => b.published_year === val.value);
        setBookOptions(sortOptions(filtered.map((b) => ({ value: b.id, label: b.name }))));
        setPrinterNameOptions(await calcUnique(filtered, "printer_name"));
        setPrinterLocationOptions(await calcUnique(filtered, "printer_location"));
        setCompareBook(null);
    };

    const getIdLanguage = (id: number) => {
        const selectedItem = books.find((item) => item.id === id);
        if (selectedItem) {
            const langCode = selectedItem.language;
            const langEntry = letterType?.find((lt) => lt.language === langCode);
            return langEntry ? langCode : null;
        }
        return null;
    };

    const fetchTag = async (record: IBookOptions) => {
        setCompareLoading(true);
        const primaryLanguage = getIdLanguage(Number(record.value));
        try {
            const response = await axios.get(`${BASE_URL}/tagged-letter?bookId=${record.value}`);
            const letterIdMap: Record<string, boolean> = {};
            let mergedData: IData[] = letters
                .map((letter: any) => {
                    const foundLetter = response.data.find((item: any) => item.letter_id === letter.id);
                    if (foundLetter && !letterIdMap[foundLetter.letter_id]) {
                        letterIdMap[foundLetter.letter_id] = true;
                        const matchingItem = letterType?.find((val) => val.id === Number(foundLetter.letter.letter_type));
                        return {
                            image: foundLetter.tag_path,
                            letter: foundLetter.letter.letter,
                            type: matchingItem ? matchingItem.type : "",
                            language: matchingItem ? matchingItem.language : "",
                        };
                    } else if (!letterIdMap[letter.id]) {
                        letterIdMap[letter.id] = true;
                        const matchingItem = letterType?.find((val) => val.id === Number(letter.letter_type));
                        if (matchingItem && primaryLanguage === matchingItem.language) {
                            return {
                                image: "-",
                                letter: letter.letter,
                                type: matchingItem.type,
                                language: matchingItem.language,
                            };
                        }
                    }
                    return null;
                })
                .filter((item): item is IData => item !== null);

            const organizedData: Record<string, Record<string, TagData[]>> = {};
            mergedData.forEach((item) => {
                if (!organizedData[item.language]) organizedData[item.language] = {};
                if (!organizedData[item.language][item.type]) organizedData[item.language][item.type] = [];
                organizedData[item.language][item.type].push({ letter: item.letter, image: item.image });
            });

            const sortedData: LanguageData = {};
            Object.keys(organizedData)
                .sort((a, b) => {
                    if (a === primaryLanguage) return -1;
                    if (b === primaryLanguage) return 1;
                    return a.localeCompare(b);
                })
                .forEach((lang) => { sortedData[lang] = organizedData[lang]; });

            const selectedBook = books.filter((book) => record.value === book.id);
            setSelectedBookData(selectedBook);
            setCompareBook(record);
            const commentsRes = await axios.get(`${BASE_URL}/get-comments?bookId=${record.value}`);
            setLocalComments(commentsRes.data);
            setCompareBookData(sortedData);
            setBookChoosed(true);
        } catch (error) {
            console.error("Error fetching tags:", error);
        } finally {
            setCompareLoading(false);
        }
    };

    const handleDownloadClick = () => {
        setDownloadLoading(true);
        axios
            .get(`${BASE_URL}/download-tags-zip?bookId=${compareBook?.value}`)
            .then((response) => {
                setDownloadLoading(false);
                if (response.data.status) window.open(response.data.url, "_self");
            })
            .catch(() => {
                setDownloadLoading(false);
                alert("Download failed");
            });
    };

    const isBookHasNoTags = Object.values(compareBookData).some((tags) =>
        Object.values(tags).some((letters) => letters.some((letter) => letter.image !== "-"))
    );

    return (
        <>
            <FiltersBar>
                <FilterGroup>
                    <FilterLabel>Published Year</FilterLabel>
                    <FilterSelect
                        isClearable
                        isDisabled={compareLoading}
                        value={selectedPublishedYear}
                        options={publishedYearOptions}
                        onChange={handlePublishedYearChange}
                        placeholder="All years"
                    />
                </FilterGroup>
                <FilterGroup>
                    <FilterLabel>Printer Location</FilterLabel>
                    <FilterSelect
                        isClearable
                        isDisabled={compareLoading}
                        value={selectedPrinterLocation}
                        options={printerLocationOptions}
                        onChange={handlePrinterLocationChange}
                        placeholder="All locations"
                    />
                </FilterGroup>
                <FilterGroup>
                    <FilterLabel>Printer Name</FilterLabel>
                    <FilterSelect
                        isClearable
                        isDisabled={compareLoading}
                        value={selectedPrinterName}
                        options={printerNameOptions}
                        onChange={handlePrinterNameChange}
                        placeholder="All printers"
                    />
                </FilterGroup>
                <FilterGroup>
                    <FilterLabel>Book</FilterLabel>
                    <FilterSelect
                        isClearable
                        isDisabled={compareLoading}
                        value={compareBook}
                        options={bookOptions}
                        onChange={(val) => {
                            if (val) fetchTag(val);
                            else {
                                setCompareBook(null);
                                setBookChoosed(false);
                                setCompareBookData({});
                                setSelectedBookData(undefined);
                                setLocalComments(undefined);
                            }
                        }}
                        placeholder="Select a book"
                    />
                </FilterGroup>
            </FiltersBar>

            {compareBook && selectedBookData && (
                <Box flex justifyContent="space-between" alignItems="center" style={{ padding: "8px 12px" }}>
                    <H3 style={{ margin: 0, fontSize: "16px" }}>{compareBook.label}</H3>
                    <ToolTipButton
                        type="button"
                        variant="outlined"
                        size="icon"
                        color="primary"
                        disabled={!isBookHasNoTags}
                        onClick={handleDownloadClick}
                    >
                        {isBookHasNoTags && (
                            <ToolTipText className="tooltiptext">Download tags as ZIP</ToolTipText>
                        )}
                        <Icon icon="Download" />
                    </ToolTipButton>
                </Box>
            )}

            {compareBook && selectedBookData && (
                <BookAdditionalDetails>
                    <BookAdditionalDetail>
                        <p>Published year :</p>
                        <p>{selectedBookData[0].published_year ?? "-"}</p>
                    </BookAdditionalDetail>
                    <BookAdditionalDetail>
                        <p>Printer name :</p>
                        <p>{selectedBookData[0].printer_name ?? "-"}</p>
                    </BookAdditionalDetail>
                    <BookAdditionalDetail>
                        <p>Printer location :</p>
                        <p>{selectedBookData[0].printer_location ?? "-"}</p>
                    </BookAdditionalDetail>
                </BookAdditionalDetails>
            )}

            <div className="tagsContainerWrap">
                <Container className="tagsContainer">
                    {compareLoading ? (
                        <Loader />
                    ) : bookChoosed && compareBook ? (
                        Object.keys(compareBookData).length > 0 ? (
                            Object.entries(compareBookData).map(([language, tags]) => (
                                <div key={language}>
                                    <Language>Language: {language}</Language>
                                    {Object.entries(tags as { [key: string]: TagData[] }).map(([letterType, consonants]) => (
                                        <LetterTypeDiv key={letterType}>
                                            <LetterType>{letterType}</LetterType>
                                            <Letters>
                                                {consonants
                                                    .sort((a, b) => a.letter.localeCompare(b.letter))
                                                    .map((consonant, innerIndex) => (
                                                        <LetterDiv key={innerIndex}>
                                                            <Letter>{consonant.letter}</Letter>
                                                            {consonant.image === "-" ? (
                                                                <EmptyTag>{consonant.image}</EmptyTag>
                                                            ) : (
                                                                <LetterImage src={consonant.image} alt={`Image for ${consonant.letter}`} />
                                                            )}
                                                        </LetterDiv>
                                                    ))}
                                            </Letters>
                                        </LetterTypeDiv>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <NotFoundDiv>No tags available for this book.</NotFoundDiv>
                        )
                    ) : (
                        <NotFoundDiv>Select a book to compare tags</NotFoundDiv>
                    )}
                </Container>
            </div>

            {compareBook && comments && selectedBookData && (
                <CommentsContainer>
                    <CompareComments
                        users={users}
                        comments={comments}
                        bookId={selectedBookData[0].id}
                        setLocalComments={setLocalComments}
                    />
                </CommentsContainer>
            )}
        </>
    );
};

export default Compare;
