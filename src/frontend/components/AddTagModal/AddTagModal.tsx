import { Modal, Select, Header, Button } from "@adminjs/design-system";
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

interface IAddTagModalProps {
    setTag: Dispatch<SetStateAction<string>>;
    tag: string;
    bookId: number;
}

interface ISelectedLetter {
    value: number;
    label: string;
}

const AddTagModal: React.FC<IAddTagModalProps> = ({ tag, setTag, bookId }) => {
    const [letters, setLetters] = useState<ISelectedLetter[]>([]);
    const [letter, setLetter] = useState<ISelectedLetter | null>(null);
    const [createLetter, setCreateLetter] = useState<boolean>(false);
    const [newLetter, setNewLetter] = useState<string>("");
    const [currentAdmin] = useCurrentAdmin();
    const addNotice = useNotice();
    const { addTag } = useLetterTagContext();
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;

    useEffect(() => {
        axios.get(`${BASE_URL}/get-letters`).then((response) => {
            let letters = response.data.map(
                (letter: { id: number; letter: string }) => ({
                    value: letter.id,
                    label: letter.letter,
                })
            );
            setLetters(letters);
        });
    }, []);

    const saveTag = async () => {
        const data = {
            book_id: bookId,
            letter_id: letter?.value,
            cropped_image: tag,
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
                            Tag Letter
                        </Header.H3>
                        <LetterSelectWrap>
                            <div style={{ width: "10%" }}>
                                <img src={tag} alt="" height={50} width={50} />
                            </div>
                            <div style={{ width: "90%" }}>
                                <Creatable
                                    value={letter}
                                    options={letters}
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
                                Save
                            </Button>
                        </div>
                    </>
                ) : (
                    <CreateLetter
                        bookId={bookId}
                        tag={tag}
                        newLetter={newLetter}
                        setCreateLetter={setCreateLetter}
                        setTag={setTag}
                    />
                )}
            </Modal>
        </>
    );
};

export default AddTagModal;
