import React, { useEffect, useState } from "react";
import { styled } from "@adminjs/design-system/styled-components";
import { Input, Button, Icon } from "@adminjs/design-system";
import RightSideBar from "../RightSideBar/RightSideBar.js";
import axios from "axios";
import LetterTagProvider, { ITagBox, ITagSource } from "../../context/LetterTagContext.js";
import AutoTag from "../AutoTag/AutoTag.js";
import { BookImage } from "../BookImage/BookImage.js";
import TagModal from "../TagModal/TagModal.js";
import Select from "react-select";
import LettersProvider from "../../context/LettersContext.js";
import { BookProgressProvider } from "../../context/BookProgressContext.js";
import ProgressBar from "./ProgressBar.js";
import PdfGenerator from "../PDFGenerator/PdfGenerator.js";
import CommentsProvider from "../../context/CommentsContext.js";
import Comments from "../Comments/Comments.js";
import EditBookModal from "./EditBookModal.js";
import { useCurrentAdmin } from "adminjs";
import { usePermissions } from "../../hooks/usePermissions.js";

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

// Rotate an image clockwise by 90/180/270 degrees.
const rotateImage = (src: string, degrees: number) =>
    new Promise<string>((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            const sideways = degrees % 180 !== 0;
            const canvas = document.createElement("canvas");
            canvas.width = sideways ? image.height : image.width;
            canvas.height = sideways ? image.width : image.height;
            const ctx = canvas.getContext("2d")!;
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((degrees * Math.PI) / 180);
            ctx.drawImage(image, -image.width / 2, -image.height / 2);
            resolve(canvas.toDataURL("image/jpeg", 0.92));
        };
        image.onerror = reject;
        image.src = src;
    });

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
    const [autopilot, setAutopilot] = useState(false);
    // Page image as fetched, and saved rotations ({ [page]: degrees }, 0 = whole book).
    const [rawImg, setRawImg] = useState<{ page: number; data: string } | null>(null);
    const [rotations, setRotations] = useState<Record<number, number>>({});
    const [rotateAllPages, setRotateAllPages] = useState(false);
    const rotationOf = (page: number) => rotations[page] ?? rotations[0] ?? 0;
    const [highlight, setHighlight] = useState<ITagBox | null>(null);
    const [editing, setEditing] = useState(false);
    const languageName = (code: string | null) => languages?.find((l) => l.value === code)?.label ?? code;
    const [currentAdmin] = useCurrentAdmin();
    const { canAccess } = usePermissions(currentAdmin?.role || 0);

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
            .get(`${BASE_URL}/page-rotations`, { params: { bookId } })
            .then((response) => setRotations(response.data));
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
                    setRawImg({ page, data: reader.result as string });
                    setLoading(false);
                };
            });
    };

    // Show the page upright: everything downstream (cropper, Autopilot, saved boxes) uses the rotated image.
    useEffect(() => {
        if (!rawImg) return;
        let cancelled = false;
        const degrees = rotationOf(rawImg.page);
        (degrees ? rotateImage(rawImg.data, degrees) : Promise.resolve(rawImg.data)).then((data) => {
            if (!cancelled) setImg(data);
        });
        return () => {
            cancelled = true;
        };
    }, [rawImg, rotations]);

    const rotate = (delta: number) => {
        const rotation = (rotationOf(currentPage) + delta + 360) % 360;
        const page = rotateAllPages ? 0 : currentPage;
        axios.post(`${BASE_URL}/page-rotation`, { book_id: bookId, page, rotation }).then(() => {
            setHighlight(null);
            setRotations(page === 0 ? { 0: rotation } : { ...rotations, [page]: rotation });
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

    const showSource = ({ page, box }: ITagSource) => {
        setHighlight(box);
        if (page !== currentPage) {
            setImg("");
            setCurrentPage(page);
            loadImage(page);
        }
    };

    const handleNext = () => {
        setHighlight(null);
        if (currentPage < totalPages) {
            setImg("");
            setCurrentPage(currentPage + 1);
            loadImage(currentPage + 1);
        }
    };

    const handlePrev = () => {
        setHighlight(null);
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
        setHighlight(null);
        setImg("");
        setCurrentPage(goToPage);
        loadImage(goToPage);
    };

    const handleLanguageChange = (language: string) => {
        setSelectedLanguage(language);
    };

    return (
        <>
            {editing && (
                <EditBookModal
                    recordId={bookId}
                    onClose={() => setEditing(false)}
                    onSave={(saved) => {
                        setEditing(false);
                        // Page images are fetched by identifier, so a changed one needs a fresh load.
                        if (saved.params.identifier !== bookIdentifier) return window.location.reload();
                        setBookInfo(saved.params);
                        setSelectedLanguage(saved.params.language);
                    }}
                />
            )}
            <LetterTagProvider onShowSource={showSource}>
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
                            {canAccess("books", "edit") && (
                                <Button
                                    variant="outlined"
                                    size="sm"
                                    ml="lg"
                                    onClick={() => setEditing(true)}
                                >
                                    <Icon icon="Edit" />
                                    Edit metadata
                                </Button>
                            )}
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
                            <BookMetaValue>
                                {languageName(selectedLanguage)}
                            </BookMetaValue>
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
                            <Button
                                variant="outlined"
                                color="primary"
                                size="icon"
                                disabled={!img}
                                onClick={() => rotate(-90)}
                                title="Rotate page left"
                            >
                                ↺
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="icon"
                                disabled={!img}
                                onClick={() => rotate(90)}
                                title="Rotate page right"
                            >
                                ↻
                            </Button>
                            <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                                <input
                                    type="checkbox"
                                    checked={rotateAllPages}
                                    onChange={(e) => setRotateAllPages(e.target.checked)}
                                />
                                All pages
                            </label>
                            <Button
                                variant={autopilot ? "contained" : "outlined"}
                                color="primary"
                                disabled={!img}
                                onClick={() => setAutopilot(!autopilot)}
                                title="Find letters on this page and suggest tags for you to confirm"
                            >
                                Autopilot
                            </Button>
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
                                    page={currentPage}
                                    highlight={highlight}
                                    setCapturing={setCapturing}
                                    capturing={capturing}
                                    setTag={setTag}
                                />
                            </ImageWrap>
                        </LeftSide>
                        <RightSide>
                            {autopilot ? (
                                <AutoTag
                                    image={img}
                                    page={currentPage}
                                    bookId={bookId}
                                    language={language}
                                    onNextPage={handleNext}
                                    onClose={() => setAutopilot(false)}
                                    onRecrop={(box) => {
                                        setHighlight(box);
                                        setCapturing(true); // enables Save / Enter on the placed crop box
                                    }}
                                />
                            ) : (
                                <RightSideBar
                                    bookId={bookId}
                                    loading={loading}
                                    letterTypes={letterTypes}
                                    setLetterTypes={setLetterTypes}
                                    selectedLanguage={selectedLanguage}
                                />
                            )}
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
