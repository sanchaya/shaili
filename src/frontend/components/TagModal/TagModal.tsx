import { Modal, Header, Button } from "@adminjs/design-system";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { styled } from "@adminjs/design-system/styled-components";
import axios from "axios";
import { useCurrentAdmin, useNotice } from "adminjs";
import { useLetterTagContext } from "../../context/LetterTagContext.js";
import Creatable from "react-select/creatable";
import CreateLetter from "../CreateLetter/CreateLetter.js";

const LetterSelectWrap = styled.div`
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    gap: 25px;
    justify-content: center;
`;

interface ITagModalProps {
    setTag: Dispatch<SetStateAction<string>>;
    tag: string;
    bookId: number;
    mode: "add" | "edit";
    tagId?: number;
    image?: string;
    letterId?: number;
    setShowTags?: Dispatch<SetStateAction<boolean>>;
}

interface ISelectedLetter {
    value: number;
    label: string;
}

const TagModal: React.FC<ITagModalProps> = ({
    tag,
    setTag,
    bookId,
    tagId,
    mode,
    image,
    letterId,
    setShowTags,
}) => {
    const [letters, setLetters] = useState<ISelectedLetter[]>([]);
    const [letter, setLetter] = useState<ISelectedLetter | null>(null);
    const [createLetter, setCreateLetter] = useState<boolean>(false);
    const [newLetter, setNewLetter] = useState<string>("");
    const [currentAdmin] = useCurrentAdmin();
    const addNotice = useNotice();
    const { addTag, updateTag } = useLetterTagContext();
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;

    useEffect(() => {
        axios.get(`${BASE_URL}/get-letters`).then((response) => {
            let letters = response.data.map(
                (letter: { id: number; letter: string }) => ({
                    value: letter.id,
                    label: letter.letter,
                })
            );
            const sortedLetters = letters.sort(
                (a: { label: string }, b: { label: string }) =>
                    a.label > b.label ? 1 : -1
            );
            setLetters(sortedLetters);
            if (mode === "edit") {
                const selectedLetter = letters.find(
                    (option) => option.value === letterId
                );
                setLetter(selectedLetter);
            }
        });
    }, []);

    const saveTag = async () => {
        if (mode === "add") {
            const data = {
                book_id: bookId,
                letter_id: letter?.value,
                croppedImage: tag,
                tagged_by: Number(currentAdmin?.id),
            };

            addTag(data)
                .then(() => {
                    setTag("");
                    addNotice({
                        message: "Tag added successfully",
                        type: "success",
                    });
                })
                .catch((error) => {
                    setTag("");
                    addNotice({
                        message: "Error adding tag try again later",
                        type: "error",
                    });
                });
        } else {
            const data = {
                id: tagId!,
                book_id: bookId,
                letter_id: letter?.value,
                tagged_by: Number(currentAdmin?.id),
            };
            updateTag(data)
                .then(() => {
                    setTag("");
                    {
                        setShowTags && setShowTags(false);
                    }
                    addNotice({
                        message: "Tag updated successfully",
                        type: "success",
                    });
                })
                .catch((error) => {
                    setTag("");
                    {
                        setShowTags && setShowTags(false);
                    }
                    addNotice({
                        message: "Error updating tag try again later",
                        type: "error",
                    });
                });
        }
    };

    const handleCreate = (inputValue: string) => {
        setNewLetter(inputValue);
        setCreateLetter(true);
    };

    return (
        <>
            <Modal>
                {!createLetter ? (
                    <>
                        <Header.H3
                            textAlign="center"
                            marginTop="default"
                            marginBottom="xl"
                        >
                            {mode === "add" ? `Create ` : `Edit `}Tag
                        </Header.H3>
                        <LetterSelectWrap>
                            <div>
                                <img
                                    src={tag}
                                    alt=""
                                    height={60}
                                    width={60}
                                    style={{ borderRadius: "10px" }}
                                />
                            </div>
                            <div style={{ width: "90%" }}>
                                <Creatable
                                    value={letter}
                                    options={letters}
                                    isClearable={false}
                                    backspaceRemovesValue={true}
                                    onChange={(newValue) =>
                                        setLetter(newValue ?? null)
                                    }
                                    onCreateOption={handleCreate}
                                    placeholder="Select a Letter"
                                />
                            </div>
                        </LetterSelectWrap>
                        <div
                            style={{
                                display: "flex",
                                textAlign: "center",
                                justifyContent: "flex-end",
                                gap: "20px",
                                marginTop: "25px",
                            }}
                        >
                            <Button color="primary" onClick={() => setTag("")}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={saveTag}
                                disabled={!letter}
                            >
                                {mode === "add" ? `Save` : `Update`}
                            </Button>
                        </div>
                    </>
                ) : (
                    <CreateLetter
                        tagId={tagId}
                        mode={mode}
                        bookId={bookId}
                        tag={tag}
                        newLetter={newLetter}
                        setCreateLetter={setCreateLetter}
                        setTag={setTag}
                        setShowTags={setShowTags}
                    />
                )}
            </Modal>
        </>
    );
};

export default TagModal;
