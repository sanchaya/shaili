import React, { useEffect, useState } from "react";
import { Loader, Select } from "@adminjs/design-system";
import axios from "axios";
import { styled } from "@adminjs/design-system/styled-components";

const CompareItem = styled.div`
    width: calc(50% - 15px);
    background-color: #f0f0f0;
    margin-bottom: 10px;
    text-align: center;
    box-sizing: border-box;
    border: 1px solid #ccc;
    margin-right: 10px;
    padding: 20px;
    @media (max-width: 800px) {
        padding: 8px;
    }
`;

const FilterDiv = styled.div`
    display: flex;
    flex-direction: column;
`;

const SelectDiv = styled.div`
    width: 100%;
    margin: auto auto 10px;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    @media (max-width: 800px) {
        flex-direction: column;
        gap: 10px;
    }
`;

const CustomSelect = styled.div`
    width: 60%;
    @media (max-width: 800px) {
        width: 100%;
    }
`;

const Container = styled.div`
    text-align: left;
    padding: 30px;
    height: 70vh;
    background-color: #fff;
    margin-bottom: 10px;
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
`;

const Language = styled.h2`
    font-size: 20px;
    font-weight: 700;
    color: #000;
    line-height: 1.2;
`;

const LetterType = styled.h3`
    font-size: 20px;
    font-weight: 500;
    color: #000;
    line-height: 1.2;
    @media (max-width: 800px) {
        font-size: 16px;
    }
`;

const Letter = styled.p`
    text-align: center;
    font-size: 18px;
    font-weight: 400;
    color: #000;
    line-height: 1.2;
    padding: 3px;
    @media (max-width: 800px) {
        font-size: 14px;
    }
`;

const LetterTypeDiv = styled.div`
    padding: 20px;
    @media (max-width: 800px) {
        padding: 15px 0;
    }
`;

const NotFoundDiv = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

interface IBookOptions {
    value: number;
    label: string;
}

interface IData {
    id: number;
    image: string;
    letter: string;
    type: string;
    language: string;
}

interface ILetterType {
    id: number;
    type: string;
    language: string;
}

interface ILanguage {
    id: number;
    language: string;
    language_code: string;
}

interface Consonant {
    letter: string;
    image: string;
}

interface LanguageData {
    [key: string]: {
        [key: string]: Consonant[];
    };
}

interface IBooks {
    id: number;
    name: string;
    status: number;
    language: string;
    printer_name: string;
    printer_location: string;
}

const Compare = () => {
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;
    const [books, setBooks] = useState<IBooks[]>();
    const [bookOptions, setBookOptions] = useState<IBookOptions[]>();
    const [printerNameOptions, setPrinterNameOptions] =
        useState<IBookOptions[]>();
    const [printerLocationOptions, setPrinterLocationOptions] =
        useState<IBookOptions[]>();
    const [printerName, setPrinterName] = useState<string>();
    const [printerLocation, setPrinterLocation] = useState<string>();
    const [compareBookData, setCompareBookData] = useState<LanguageData>({});
    const [languageOptions, setLanguageOptions] = useState<ILanguage[]>();
    const [letterType, setLetterType] = useState<ILetterType[]>();
    const [compareBook, setCompareBook] = useState<IBookOptions | null>();
    const [compareLoading, setCompareLoading] = useState(false);

    useEffect(() => {
        axios.get(`${BASE_URL}/get-lettertypes`).then((response) => {
            setLetterType(response.data);
        });
        axios.get(`${BASE_URL}/get-languages`).then((response) => {
            setLanguageOptions(response.data);
        });
        axios.get(`${BASE_URL}/get-books`).then((response) => {
            setBooks(response.data);
            let Books = response.data.map(
                (book: { id: number; name: string }) => ({
                    value: book.id,
                    label: book.name,
                })
            );

            let PrinterName = response.data
                .filter(
                    (book: { printer_name: string }) => book.printer_name != ""
                )
                .map((book: { printer_name: string }) => ({
                    value: book.printer_name,
                    label: book.printer_name,
                }));
            PrinterName = Array.from(
                new Set(PrinterName.map((a) => a.value))
            ).map((value) => {
                return PrinterName.find((a) => a.value === value);
            });

            let PrinterLocation = response.data
                .filter(
                    (book: { printer_location: string }) =>
                        book.printer_location != ""
                )
                .map((book: { printer_location: string }) => ({
                    value: book.printer_location,
                    label: book.printer_location,
                }));
            PrinterLocation = Array.from(
                new Set(PrinterLocation.map((a) => a.value))
            ).map((value) => {
                return PrinterLocation.find((a) => a.value === value);
            });

            setBookOptions(Books);
            setPrinterNameOptions(PrinterName);
            setPrinterLocationOptions(PrinterLocation);
        });
    }, []);

    const getIdLanguage = (id: number) => {
        const selectedItem = books?.find((item) => item.id === id);

        if (selectedItem) {
            const languageInfo = languageOptions?.find(
                (item) => item.language_code === selectedItem.language
            );

            if (languageInfo) {
                return languageInfo.language;
            }
        }

        return null;
    };

    const fetchTag = async (record: IBookOptions, mode: string) => {
        setCompareLoading(true);
        try {
            const response = await axios.get(
                `${BASE_URL}/tagged-letter?bookId=` + record.value
            );
            const letterIdMap: Record<string, boolean> = {};

            const mergedData: IData[] = response.data
                .map((item) => {
                    if (!letterIdMap[item.letter_id]) {
                        letterIdMap[item.letter_id] = true;

                        const matchingItem = letterType?.find(
                            (val) => val.id === Number(item.letter.letter_type)
                        );

                        const language = languageOptions?.find(
                            (record) =>
                                record.language_code === matchingItem?.language
                        );

                        return {
                            id: item.id,
                            image: item.cropped_image,
                            letter: item.letter.letter,
                            type: matchingItem ? matchingItem.type : "",
                            language: language ? language.language : "",
                        };
                    }
                    return null;
                })
                .filter((item): item is IData => item !== null);

            const organizedData: Record<
                string,
                Record<string, { letter: string; image: string }[]>
            > = {};

            if (mergedData) {
                mergedData.forEach((item) => {
                    if (!organizedData[item.language]) {
                        organizedData[item.language] = {};
                    }

                    if (!organizedData[item.language][item.type]) {
                        organizedData[item.language][item.type] = [];
                    }

                    organizedData[item.language][item.type].push({
                        letter: item.letter,
                        image: item.image,
                    });
                });
            }

            const sortedData: LanguageData = {};
            const language = getIdLanguage(record.value);

            Object.keys(organizedData)
                .sort((a, b) =>
                    a === language
                        ? -1
                        : b === language
                        ? 1
                        : a.localeCompare(b)
                )
                .forEach((language) => {
                    sortedData[language] = organizedData[language];
                });

            setCompareBook(record);
            setCompareBookData(sortedData);
            setCompareLoading(false);
        } catch (error) {
            console.error("Error fetching tagged percentage:", error);
        }
    };

    const handleLocationChange = (selectedLocation) => {
        setPrinterLocation(selectedLocation);
        updateBookOptions(selectedLocation, printerName);
    };

    const handleNameChange = (selectedName) => {
        setPrinterName(selectedName);
        updateBookOptions(printerLocation, selectedName);
    };

    const updateBookOptions = (selectedLocation, selectedName) => {
        let filteredBooks = books;

        if (selectedLocation && selectedName) {
            filteredBooks = books?.filter(
                (book) =>
                    book.printer_location === selectedLocation.value &&
                    book.printer_name === selectedName.value
            );
        } else if (selectedLocation) {
            filteredBooks = books?.filter(
                (book) => book.printer_location === selectedLocation.value
            );
        } else if (selectedName) {
            filteredBooks = books?.filter(
                (book) => book.printer_name === selectedName.value
            );
        }

        const mappedBooks = filteredBooks?.map((book) => ({
            value: book.id,
            label: book.name,
        }));
        const isBookAvailable = mappedBooks?.find(
            (item) => item.value === compareBook?.value
        );
        {
            !isBookAvailable && setCompareBook(null);
        }
        setBookOptions(mappedBooks);
    };
    return (
        <CompareItem>
            <FilterDiv>
                <SelectDiv>
                    <label style={{ width: "40%", textAlign: "left" }}>
                        Select a printer location
                    </label>
                    <CustomSelect>
                        <Select
                            isDisabled={compareLoading}
                            isClearable={true}
                            value={printerLocation}
                            options={printerLocationOptions}
                            onChange={(newValue) =>
                                handleLocationChange(newValue)
                            }
                            placeholder="Select a printer location"
                        />
                    </CustomSelect>
                </SelectDiv>
                <SelectDiv>
                    <label style={{ width: "40%", textAlign: "left" }}>
                        Select a printer name
                    </label>
                    <CustomSelect>
                        <Select
                            isDisabled={compareLoading}
                            isClearable={true}
                            value={printerName}
                            options={printerNameOptions}
                            onChange={(newValue) => handleNameChange(newValue)}
                            placeholder="Select a printer name"
                        />
                    </CustomSelect>
                </SelectDiv>
                <SelectDiv>
                    <label style={{ width: "40%", textAlign: "left" }}>
                        Select a Book
                    </label>
                    <CustomSelect>
                        <Select
                            isDisabled={compareLoading}
                            isClearable={false}
                            value={compareBook}
                            options={bookOptions}
                            onChange={(newValue) =>
                                fetchTag(newValue, "compare")
                            }
                            placeholder="Select a book"
                        />
                    </CustomSelect>
                </SelectDiv>
            </FilterDiv>
            <Container>
                {compareBook != undefined ? (
                    compareLoading == true ? (
                        <Loader />
                    ) : Object.keys(compareBookData).length > 0 ? (
                        Object.entries(compareBookData).map(
                            ([language, consonantGroups]) => (
                                <div key={language}>
                                    <Language>Language: {language}</Language>
                                    {Object.entries(
                                        consonantGroups as {
                                            [key: string]: Consonant[];
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
                                                            <LetterImage
                                                                src={
                                                                    consonant.image
                                                                }
                                                                alt={`Image for ${consonant.letter}`}
                                                            />
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
                        Choose printername/ printerlocation/ book to compare
                        tags
                    </NotFoundDiv>
                )}
            </Container>
        </CompareItem>
    );
};

export default Compare;
