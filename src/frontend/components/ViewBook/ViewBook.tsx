import React, { useEffect, useState } from "react";
import { styled } from "@adminjs/design-system/styled-components";
import { Input, Button, Icon } from "@adminjs/design-system";
import RightSideBar from "../RightSideBar/RightSideBar.js";
import axios from "axios";
import LetterTagProvider from "../../context/LetterTagContext.js";
import { BookImage } from "../BookImage/BookImage.js";
import TagModal from "../TagModal/TagModal.js";
import Select from "react-select";
import LettersProvider from "../../context/LettersContext.js";
import { BookProgressProvider } from "../../context/BookProgressContext.js";
import ProgressBar from "./ProgressBar.js";
import PdfGenerator from "../PDFGenerator/PdfGenerator.js";
import CommentsProvider from "../../context/CommentsContext.js";
import Comments from "../Comments/Comments.js";

const Content = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 20px;
    @media (max-width: 800px) {
        flex-flow: column wrap;
        width: 98%;
        margin: 0 auto;
    }
`;

const LeftSide = styled.div`
    width: 60%;
    @media (max-width: 800px) {
        width: 100%;
    }
`;

const RightSide = styled.div`
    display: flex;
    flex-direction: column;
    background: #fff;
    box-shadow: 0px 2px 2px 1px #ccc;
    width: 40%;
    @media (max-width: 800px) {
        width: 100%;
        margin: 20px auto 0 auto;
    }
`;
const NavigationArrows = styled.div`
    display: flex;
    flex: 2 1 0%;
    align-items: center;
    gap: 15px;
    width: 70%;
    justify-content: flex-end;
`;

const GoToPage = styled.form`
    display: flex;
    flex: 2 1 0%;
    align-items: center;
    gap: 15px;
    width: 70%;
    @media (max-width: 349px) {
        flex: 1.5 1 0%;
    }
`;

const NavWrap = styled.div`
    z-index: 45;
    position: relative;
    display: flex;
    gap: 20px;
    margin-bottom: 10px;
    @media (max-width: 500px) {
        gap: 10px;
        flex-wrap: wrap;
        margin: 10px auto;
    }
`;

const NavWrapLeft = styled.div`
    width: 60%;
    display: flex;
    @media (max-width: 500px) {
        width: 100%;
    }
`;

const NavWrapRight = styled.div`
    display: flex;
    width: 40%;
    align-items: center;
    justify-content: space-between;
    @media (max-width: 500px) {
        width: 100%;
    }
`;

const LanguageFilterLabel = styled.p`
    width: 30%;
`;
const LanguageFilterSelect = styled.div`
    width: 50%;
`;

const ImageWrap = styled.div`
    width: auto;
    position: relative;
    overflow: hidden;
    @media (max-width: 800px) {
        height: auto;
    }
`;

const GoToInput = styled(Input)`
    width: 200px;
    @media (max-width: 500px) {
        width: 100%;
    }
`;

const PagesWrap = styled.div`
    @media (max-width: 500px) {
        font-size: 11px;
    }
`;

const ProgressWrap = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 17px;
    @media (max-width: 500px) {
        justify-content: space-between;
    }
`;

const LanguageContainer = styled.div`
    display: flex;
    width: 85%;
    align-items: center;
    justify-content: flex-end;
`;

const BookMetadata = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    align-items: center;
    background: #fff;
    box-shadow: 0px 2px 2px 1px #ccc;
    padding: 16px 20px;
    margin-bottom: 12px;
`;

const BookTitle = styled.h2`
    font-size: 18px;
    font-weight: 600;
    color: #0c1e29;
    margin: 0;
    flex: 1 1 100%;
`;

const BookMetaItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const BookMetaLabel = styled.span`
    font-size: 11px;
    color: #898a9a;
    text-transform: uppercase;
    letter-spacing: 0.05em;
`;

const BookMetaValue = styled.span`
    font-size: 14px;
    color: #0c1e29;
    font-weight: 500;
`;
interface IViewBookProps {
    record: {
        params: {
            id: number;
            url: string;
            identifier: string;
            language: string;
            name: string;
            publisher_name: string;
            published_year: string;
        };
    };
}

interface ILetterTypes {
    id: number;
    title: string;
    expanded: boolean;
    letterType: number;
}

const ViewBook: React.FC<IViewBookProps> = ({ record }) => {
    const language = record.params.language;
    const bookUrl = record.params.url;
    const bookIdentifier = record.params.identifier;
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;
    const bookId = record.params.id;
    const [loading, setLoading] = useState(true);
    const [capturing, setCapturing] = useState(false);
    const [img, setImg] = useState<string>("");
    const [tag, setTag] = useState<string>("");
    const [totalPages, setTotalPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [goToPage, setGoToPage] = useState<number>(1);
    const [letterTypes, setLetterTypes] = useState<ILetterTypes[]>([]);
    const [languages, setLanguages] = useState<any>(null);
    const [selectedLanguage, setSelectedLanguage] = useState(language);
    const [bookInfo, setBookInfo] = useState<any>(null);

    useEffect(() => {
        axios
            .get(`${BASE_URL}/total-pages`, {
                params: { identifier: bookIdentifier },
            })
            .then((response) => {
                setTotalPages(response.data + 1);
                loadImage(currentPage);
            });
        getLetterTypes();
        axios
            .get(`${BASE_URL}/book-info`, {
                params: { identifier: bookIdentifier },
            })
            .then((response) => {
                setBookInfo(response.data);
            })
            .catch((error) => {
                console.error("Error fetching book info:", error);
            });
    }, []);

    const loadImage = (page: number) => {
        axios
            .get(`${BASE_URL}/fetch-page`, {
                responseType: "blob",
                params: { page: page - 1, identifier: bookIdentifier },
            })
            .then(function (response) {
                var reader = new window.FileReader();
                reader.readAsDataURL(response.data);
                reader.onload = function () {
                    var imageDataUrl = reader.result;
                    setImg(imageDataUrl as string);
                    setLoading(false);
                };
            });
    };

    const getLetterTypes = () => {
        axios.get(`${BASE_URL}/get-lettertypes`).then((response) => {
            const letterTypesRes = response.data.reduce((acc, item) => {
                const { id, type, language } = item;
                if (!acc[language]) {
                    acc[language] = [];
                }
                acc[language].push({
                    id,
                    title: type,
                    expanded: false,
                    letterType: id,
                    language: language,
                });
                return acc;
            }, {});
            setLetterTypes(letterTypesRes);
        });
        axios.get(`${BASE_URL}/get-languages`).then((response) => {
            let languages = response.data.map(
                (language: { language_code: string; language: string }) => ({
                    value: language.language_code,
                    label: language.language,
                })
            );
            languages.sort((a: { label: string }, b: { label: string }) =>
                a.label > b.label ? 1 : -1
            );
            setLanguages(languages);
        });
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setImg("");
            setCurrentPage(currentPage + 1);
            loadImage(currentPage + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 0) {
            setImg("");
            setCurrentPage(currentPage - 1);
            loadImage(currentPage - 1);
        }
    };

    const handleGoToChange = (page: number) => {
        setGoToPage(page);
    };

    const handleGoToPage = (event) => {
        event.preventDefault();
        setImg("");
        setCurrentPage(goToPage);
        loadImage(goToPage);
    };

    const handleLanguageChange = (language: string) => {
        setSelectedLanguage(language);
    };

    return (
        <>
            <LetterTagProvider>
                <LettersProvider>
                    <ProgressWrap>
                        <p>% Completed</p>
                        <BookProgressProvider bookId={bookId}>
                            <ProgressBar />
                        </BookProgressProvider>
                    </ProgressWrap>
                    <BookMetadata>
                        <BookTitle>
                            {bookInfo?.name || record.params.name}
                        </BookTitle>
                        {bookInfo?.author_name && (
                            <BookMetaItem>
                                <BookMetaLabel>Author</BookMetaLabel>
                                <BookMetaValue>
                                    {bookInfo.author_name}
                                </BookMetaValue>
                            </BookMetaItem>
                        )}
                        <BookMetaItem>
                            <BookMetaLabel>Language</BookMetaLabel>
                            <BookMetaValue>{selectedLanguage}</BookMetaValue>
                        </BookMetaItem>
                        {(bookInfo?.publisher_name || record.params.publisher_name) && (
                            <BookMetaItem>
                                <BookMetaLabel>Publisher</BookMetaLabel>
                                <BookMetaValue>
                                    {bookInfo?.publisher_name ||
                                        record.params.publisher_name}
                                </BookMetaValue>
                            </BookMetaItem>
                        )}
                        {bookInfo?.publisher_city && (
                            <BookMetaItem>
                                <BookMetaLabel>Publisher City</BookMetaLabel>
                                <BookMetaValue>
                                    {bookInfo.publisher_city}
                                </BookMetaValue>
                            </BookMetaItem>
                        )}
                        {(bookInfo?.published_year || record.params.published_year) && (
                            <BookMetaItem>
                                <BookMetaLabel>Published Year</BookMetaLabel>
                                <BookMetaValue>
                                    {bookInfo?.published_year ||
                                        record.params.published_year}
                                </BookMetaValue>
                            </BookMetaItem>
                        )}
                        {bookInfo?.printer_name && (
                            <BookMetaItem>
                                <BookMetaLabel>Printer</BookMetaLabel>
                                <BookMetaValue>
                                    {bookInfo.printer_name}
                                </BookMetaValue>
                            </BookMetaItem>
                        )}
                        {bookInfo?.printer_location && (
                            <BookMetaItem>
                                <BookMetaLabel>Printer Location</BookMetaLabel>
                                <BookMetaValue>
                                    {bookInfo.printer_location}
                                </BookMetaValue>
                            </BookMetaItem>
                        )}
                        <BookMetaItem>
                            <BookMetaLabel>Identifier</BookMetaLabel>
                            <BookMetaValue>{bookIdentifier}</BookMetaValue>
                        </BookMetaItem>
                        <BookMetaItem>
                            <BookMetaLabel>Total Pages</BookMetaLabel>
                            <BookMetaValue>{totalPages}</BookMetaValue>
                        </BookMetaItem>
                    </BookMetadata>
                    <NavWrap>
                        <NavWrapLeft>
                            <GoToPage className="goToInput">
                                <GoToInput
                                    max={totalPages}
                                    min={1}
                                    type="number"
                                    placeholder="Go to page number..."
                                    onChange={(e: {
                                        target: { value: number };
                                    }) =>
                                        handleGoToChange(Number(e.target.value))
                                    }
                                />
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={handleGoToPage}
                                    size="icon"
                                    disabled={
                                        goToPage > totalPages ||
                                        goToPage <= 0 ||
                                        goToPage === currentPage ||
                                        !img
                                    }
                                    title={!img ? "Loading..." : ""}
                                >
                                    Go
                                </Button>
                            </GoToPage>
                            <NavigationArrows>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={handlePrev}
                                    size="icon"
                                    disabled={currentPage === 1 || !img}
                                    title={!img ? "Loading..." : ""}
                                >
                                    <Icon
                                        icon="ChevronLeft"
                                        style={{
                                            height: "100%",
                                            width: "100%",
                                        }}
                                    />
                                </Button>
                                {totalPages ? (
                                    <PagesWrap>
                                        Page {currentPage} of {totalPages}
                                    </PagesWrap>
                                ) : (
                                    <Icon icon="Loader" spin />
                                )}

                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={handleNext}
                                    size="icon"
                                    disabled={
                                        currentPage === totalPages || !img
                                    }
                                    title={!img ? "Loading..." : ""}
                                >
                                    <Icon
                                        icon="ChevronRight"
                                        style={{
                                            height: "100%",
                                            width: "100%",
                                        }}
                                    />
                                </Button>
                            </NavigationArrows>
                        </NavWrapLeft>
                        <NavWrapRight>
                            <PdfGenerator
                                bookId={bookId}
                                loading={loading}
                                bookName={record.params.name}
                            />
                            <LanguageContainer>
                                {languages && (
                                    <>
                                        <LanguageFilterLabel>
                                            Language
                                        </LanguageFilterLabel>
                                        <LanguageFilterSelect>
                                            <Select
                                                isDisabled={!img}
                                                value={languages.find(
                                                    (lang) =>
                                                        lang.value ===
                                                        selectedLanguage
                                                )}
                                                options={[
                                                    {
                                                        value: "all",
                                                        label: "All",
                                                    },
                                                    ...languages,
                                                ]}
                                                onChange={(e) => {
                                                    if (e && e.value) {
                                                        handleLanguageChange(
                                                            e.value
                                                        );
                                                    }
                                                }}
                                            />
                                        </LanguageFilterSelect>
                                    </>
                                )}
                            </LanguageContainer>
                        </NavWrapRight>
                    </NavWrap>
                    <Content>
                        <LeftSide>
                            <ImageWrap>
                                <BookImage
                                    image={img}
                                    setCapturing={setCapturing}
                                    capturing={capturing}
                                    setTag={setTag}
                                />
                            </ImageWrap>
                        </LeftSide>
                        <RightSide>
                            <RightSideBar
                                bookId={bookId}
                                loading={loading}
                                letterTypes={letterTypes}
                                setLetterTypes={setLetterTypes}
                                selectedLanguage={selectedLanguage}
                            />
                        </RightSide>
                    </Content>
                    {tag && (
                        <TagModal
                            setTag={setTag}
                            tag={tag}
                            bookId={bookId}
                            mode={"add"}
                        />
                    )}
                </LettersProvider>
            </LetterTagProvider>
            <CommentsProvider>
                <Comments loading={loading} bookId={bookId} />
            </CommentsProvider>
        </>
    );
};

export default ViewBook;
