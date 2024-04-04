import React, {
    Dispatch,
    SetStateAction,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    Box,
    Button,
    Drawer,
    DrawerContent,
    FormGroup,
    H3,
    Icon,
    Label,
} from "@adminjs/design-system";
import Select from "react-select";
import axios from "axios";
import { styled } from "@adminjs/design-system/styled-components";
import { IBookOptions, LanguageData } from "./Compare.js";
import { Comments } from "../../../backend/db/models/Comments.js";

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

export interface IBooks {
    id: number;
    name: string;
    status: number;
    language: string;
    printer_name: string;
    printer_location: string;
    published_year: string;
}

interface IFilterProps {
    setShowFilter: Dispatch<SetStateAction<boolean>>;
    setBookChoosed: Dispatch<SetStateAction<boolean>>;
    setCompareBookData: Dispatch<SetStateAction<LanguageData>>;
    compareBook: IBookOptions | null;
    setCompareBook: Dispatch<SetStateAction<IBookOptions | null>>;
    compareLoading: boolean;
    setCompareLoading: Dispatch<SetStateAction<boolean>>;
    printerLocation?: string;
    setPrinterLocation: Dispatch<SetStateAction<string | undefined>>;
    printerName?: string;
    setPrinterName: Dispatch<SetStateAction<string | undefined>>;
    publishedYear?: string;
    setPublishedYear: Dispatch<SetStateAction<string | undefined>>;
    setSelectedBookData: Dispatch<SetStateAction<IBooks[] | undefined>>;
    setLocalComments: Dispatch<SetStateAction<Comments[] | undefined>>;
}

const CustomSelect = styled(Select)`
    text-align: left;
`;

const FilterDrawer = ({
    setShowFilter,
    setBookChoosed,
    setCompareBookData,
    compareBook,
    setCompareBook,
    compareLoading,
    setCompareLoading,
    printerLocation,
    setPrinterLocation,
    printerName,
    setPrinterName,
    publishedYear,
    setPublishedYear,
    setSelectedBookData,
    setLocalComments,
}: IFilterProps) => {
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;
    const [letters, setLetters] = useState<any>();
    const [books, setBooks] = useState<IBooks[]>();
    const [bookOptions, setBookOptions] = useState<IBookOptions[]>();
    const [filteredBooksData, setFilteredBooksData] = useState<IBooks[]>();
    const [printerNameOptions, setPrinterNameOptions] =
        useState<IBookOptions[]>();
    const [printerLocationOptions, setPrinterLocationOptions] =
        useState<IBookOptions[]>();
    const [publisedYearOptions, setPublishedYearOptions] =
        useState<IBookOptions[]>();
    const [languageOptions, setLanguageOptions] = useState<ILanguage[]>();
    const [letterType, setLetterType] = useState<ILetterType[]>();
    const selectInputRef = useRef();

    const calculateUniqueValues = async (
        data: IBooks[],
        key: keyof IBooks
    ): Promise<IBookOptions[]> => {
        const sortedData = data.slice().sort((a, b) => {
            if (typeof a[key] === "number") {
                return (a[key] as number) - (b[key] as number);
            } else if (typeof a[key] === "string") {
                return (a[key] as string).localeCompare(b[key] as string);
            }
            return 0;
        });
        console.log(sortedData);
        const uniqueValues: Map<string | number, IBookOptions> = new Map();

        sortedData
            .filter((item) => item[key] !== null)
            .forEach((item) => {
                const value = item[key];
                if (!uniqueValues.has(value) && value != "") {
                    uniqueValues.set(value, {
                        value: value,
                        label: value,
                    });
                }
            });
        const uniqueSortedArray = Array.from(uniqueValues.values()).sort(
            (a: { label: string | number }, b: { label: string | number }) =>
                a.label > b.label ? 1 : -1
        );

        return uniqueSortedArray;
    };

    useEffect(() => {
        axios.get(`${BASE_URL}/get-lettertypes`).then((response) => {
            setLetterType(response.data);
        });
        axios.get(`${BASE_URL}/get-languages`).then((response) => {
            setLanguageOptions(response.data);
        });
        axios.get(`${BASE_URL}/get-letters`).then((response) => {
            setLetters(response.data);
        });
        axios.get(`${BASE_URL}/get-books`).then(async (response) => {
            setBooks(response.data);
            setFilteredBooksData(response.data);

            let Books = response.data.map(
                (book: { id: number; name: string }) => ({
                    value: book.id,
                    label: book.name,
                })
            );

            const PublishedYear = await calculateUniqueValues(
                response.data,
                "published_year"
            );
            const PrinterName = await calculateUniqueValues(
                response.data,
                "printer_name"
            );
            const PrinterLocation = await calculateUniqueValues(
                response.data,
                "printer_location"
            );

            setBookOptions(Books);

            setPrinterNameOptions(PrinterName as IBookOptions[]);
            setPrinterLocationOptions(PrinterLocation as IBookOptions[]);
            setPublishedYearOptions(PublishedYear as IBookOptions[]);
        });

        if (
            printerLocation != undefined ||
            printerName != undefined ||
            publishedYear != undefined
        ) {
            setPrinterLocation(undefined);
            setPrinterName(undefined);
            setPublishedYear(undefined);
        }
    }, []);

    const handleLocationChange = async (selectedLocation) => {
        if (publishedYear == undefined && printerName === undefined) {
            const PrinterName = await calculateUniqueValues(
                books!.filter(
                    (book) => book.printer_location === selectedLocation.value
                ),
                "printer_name"
            );
            setPrinterNameOptions(PrinterName as IBookOptions[]);

            const PublishedYear = await calculateUniqueValues(
                books!.filter(
                    (book) => book.printer_location === selectedLocation.value
                ),
                "published_year"
            );
            setPublishedYearOptions(PublishedYear as IBookOptions[]);

            const filterData = books!.filter(
                (book) => book.printer_location === selectedLocation.value
            );
            setFilteredBooksData(filterData);
        } else {
            const PrinterName = await calculateUniqueValues(
                filteredBooksData!.filter(
                    (book) => book.printer_location === selectedLocation.value
                ),
                "printer_name"
            );
            setPrinterNameOptions(PrinterName as IBookOptions[]);

            const PublishedYear = await calculateUniqueValues(
                filteredBooksData!.filter(
                    (book) => book.printer_location === selectedLocation.value
                ),
                "published_year"
            );
            setPublishedYearOptions(PublishedYear as IBookOptions[]);

            const filterData = filteredBooksData!.filter(
                (book) => book.printer_location === selectedLocation.value
            );
            setFilteredBooksData(filterData);
        }

        setPrinterLocation(selectedLocation);
        updateBookOptions(selectedLocation, printerName, publishedYear);
    };

    const handleNameChange = async (selectedName) => {
        if (printerLocation == undefined && publishedYear === undefined) {
            const PrinterLocation = await calculateUniqueValues(
                books!.filter(
                    (book) => book.printer_name === selectedName.value
                ),
                "printer_location"
            );
            setPrinterLocationOptions(PrinterLocation as IBookOptions[]);

            const PublishedYear = await calculateUniqueValues(
                books!.filter(
                    (book) => book.printer_name === selectedName.value
                ),
                "published_year"
            );
            setPublishedYearOptions(PublishedYear as IBookOptions[]);

            const filterData = books!.filter(
                (book) => book.printer_name === selectedName.value
            );
            setFilteredBooksData(filterData);
        } else {
            const PrinterLocation = await calculateUniqueValues(
                filteredBooksData!.filter(
                    (book) => book.printer_name === selectedName.value
                ),
                "printer_location"
            );
            setPrinterLocationOptions(PrinterLocation as IBookOptions[]);

            const PublishedYear = await calculateUniqueValues(
                filteredBooksData!.filter(
                    (book) => book.printer_name === selectedName.value
                ),
                "published_year"
            );
            setPublishedYearOptions(PublishedYear as IBookOptions[]);

            const filterData = filteredBooksData!.filter(
                (book) => book.printer_name === selectedName.value
            );
            setFilteredBooksData(filterData);
        }

        setPrinterName(selectedName);
        updateBookOptions(printerLocation, selectedName, publishedYear);
    };

    const handleYearChange = async (selectedYear) => {
        if (printerLocation == undefined && printerName === undefined) {
            const PrinterName = await calculateUniqueValues(
                books!.filter(
                    (book) => book.published_year === selectedYear.value
                ),
                "printer_name"
            );
            setPrinterNameOptions(PrinterName as IBookOptions[]);

            const PrinterLocation = await calculateUniqueValues(
                books!.filter(
                    (book) => book.published_year === selectedYear.value
                ),
                "printer_location"
            );
            setPrinterLocationOptions(PrinterLocation as IBookOptions[]);

            const filterData = books!.filter(
                (book) => book.published_year === selectedYear.value
            );
            setFilteredBooksData(filterData);
        } else {
            const PrinterName = await calculateUniqueValues(
                filteredBooksData!.filter(
                    (book) => book.published_year === selectedYear.value
                ),
                "printer_name"
            );
            setPrinterNameOptions(PrinterName as IBookOptions[]);

            const PrinterLocation = await calculateUniqueValues(
                filteredBooksData!.filter(
                    (book) => book.published_year === selectedYear.value
                ),
                "printer_location"
            );
            setPrinterLocationOptions(PrinterLocation as IBookOptions[]);

            const filterData = filteredBooksData!.filter(
                (book) => book.published_year === selectedYear.value
            );
            setFilteredBooksData(filterData);
        }

        setPublishedYear(selectedYear);
        updateBookOptions(printerLocation, printerName, selectedYear);
    };

    const updateBookOptions = (
        selectedLocation,
        selectedName,
        selectedPublishedYear
    ) => {
        let filteredBooks = books;

        if (selectedLocation && selectedName && selectedPublishedYear) {
            filteredBooks = books?.filter(
                (book) =>
                    book.printer_location === selectedLocation.value &&
                    book.printer_name === selectedName.value &&
                    book.published_year === selectedPublishedYear.value
            );
        } else if (selectedLocation && selectedPublishedYear) {
            filteredBooks = books?.filter(
                (book) =>
                    book.printer_location === selectedLocation.value &&
                    book.published_year === selectedPublishedYear.value
            );
        } else if (selectedName && selectedPublishedYear) {
            filteredBooks = books?.filter(
                (book) =>
                    book.printer_name === selectedName.value &&
                    book.published_year === selectedPublishedYear.value
            );
        } else if (selectedPublishedYear) {
            filteredBooks = books?.filter(
                (book) => book.published_year === selectedPublishedYear.value
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

        const mappedBooks = filteredBooks
            ?.map((book) => ({
                value: book.id,
                label: book.name,
            }))
            .sort((a: { label: string }, b: { label: string }) =>
                a.label > b.label ? 1 : -1
            );
        const isBookAvailable = mappedBooks?.find(
            (item) => item.value === compareBook?.value
        );
        {
            !isBookAvailable && setCompareBook(null);
        }
        setBookOptions(mappedBooks);
    };

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
        const primaryLanguage = getIdLanguage(Number(record.value));
        try {
            const response = await axios.get(
                `${BASE_URL}/tagged-letter?bookId=` + record.value
            );
            const letterIdMap: Record<string, boolean> = {};
            let mergedData: IData[] = letters
                .map((letter) => {
                    const foundLetter = response.data.find(
                        (item) => item.letter_id === letter.id
                    );

                    if (foundLetter && !letterIdMap[foundLetter.letter_id]) {
                        letterIdMap[foundLetter.letter_id] = true;

                        const matchingItem = letterType?.find(
                            (val) =>
                                val.id ===
                                Number(foundLetter.letter.letter_type)
                        );

                        const language = languageOptions?.find(
                            (record) =>
                                record.language_code === matchingItem?.language
                        );
                        return {
                            image: foundLetter.tag_path,
                            letter: foundLetter.letter.letter,
                            type: matchingItem ? matchingItem.type : "",
                            language: language ? language.language : "",
                        };
                    } else if (!letterIdMap[letter.id]) {
                        letterIdMap[letter.id] = true;
                        const matchingItem = letterType?.find(
                            (val) => val.id === Number(letter.letter_type)
                        );

                        const language = languageOptions?.find(
                            (record) =>
                                record.language_code === matchingItem?.language
                        );
                        if (primaryLanguage === language?.language) {
                            return {
                                image: "-",
                                letter: letter.letter,
                                type: matchingItem ? matchingItem.type : "",
                                language: language ? language.language : "",
                            };
                        }
                    }

                    return null;
                })
                .filter((item): item is IData => item !== null);

            mergedData = mergedData.sort((a, b) => {
                if (a.language === b.language) {
                    if (a.type === b.type) {
                        return a.letter.localeCompare(b.letter);
                    }
                    return a.type.localeCompare(b.type);
                }
                return a.language.localeCompare(b.language);
            });
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

            const sortedLanguages = Object.keys(organizedData).sort((a, b) => {
                if (a === primaryLanguage) return -1;
                if (b === primaryLanguage) return 1;
                return a.localeCompare(b);
            });

            sortedLanguages.forEach((language) => {
                sortedData[language] = organizedData[language];
            });

            if (mode === "compare") {
                const selectedBook = books?.filter((book) => {
                    return record?.value === book.id;
                });
                setSelectedBookData(selectedBook);
                setCompareBook(record);
                const response = await axios.get(
                    (`${BASE_URL}/get-comments?bookId=` +
                        record.value) as string
                );
                setLocalComments(response.data);
                setCompareBookData(sortedData);
                setPrinterLocation(undefined);
                setPrinterName(undefined);
                setPublishedYear(undefined);
            }
            setCompareLoading(false);
        } catch (error) {
            console.error("Error fetching tagged percentage:", error);
        }
    };

    const CloseDrawer = () => {
        setPrinterLocation(undefined);
        setPrinterName(undefined);
        setPublishedYear(undefined);
        setShowFilter(false);
    };
    return (
        <Drawer variant="filter" style={{ position: "absolute", zIndex: "48" }}>
            <DrawerContent>
                <Box flex justifyContent="space-between">
                    <H3 style={{ fontSize: "26px" }}>Choose a book</H3>
                    <Button
                        type="button"
                        variant="light"
                        size="icon"
                        rounded
                        color="text"
                        onClick={() => CloseDrawer()}
                    >
                        <Icon icon="X" />
                    </Button>
                </Box>
                <Box my="x3">
                    <FormGroup>
                        <Label style={{ textAlign: "left" }}>
                            Published year
                        </Label>
                        <CustomSelect
                            isDisabled={compareLoading}
                            isClearable={false}
                            value={publishedYear}
                            options={publisedYearOptions}
                            onChange={(newValue) => {
                                handleYearChange(newValue);
                            }}
                            placeholder="Select a publised year"
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label style={{ textAlign: "left" }}>
                            Printer location
                        </Label>
                        <CustomSelect
                            isDisabled={compareLoading}
                            isClearable={false}
                            value={printerLocation}
                            options={printerLocationOptions}
                            onChange={(newValue) =>
                                handleLocationChange(newValue)
                            }
                            placeholder="Select a printer location"
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label style={{ textAlign: "left" }}>
                            Printer Name
                        </Label>
                        <CustomSelect
                            ref={selectInputRef}
                            isDisabled={compareLoading}
                            isClearable={false}
                            value={printerName}
                            options={printerNameOptions}
                            onChange={(newValue) => handleNameChange(newValue)}
                            placeholder="Select a printer name"
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label style={{ textAlign: "left" }}>Book</Label>
                        <CustomSelect
                            isDisabled={compareLoading}
                            isClearable={false}
                            value={compareBook}
                            options={bookOptions}
                            onChange={(newValue) => {
                                setShowFilter(false);
                                setCompareLoading(true);
                                setCompareBook(newValue);
                                fetchTag(newValue, "compare");
                                setBookChoosed(true);
                            }}
                            placeholder="Select a book"
                        />
                    </FormGroup>
                </Box>
            </DrawerContent>
        </Drawer>
    );
};

export default FilterDrawer;
