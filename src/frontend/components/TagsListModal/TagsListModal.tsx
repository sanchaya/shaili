import React, { Dispatch, SetStateAction, useState } from "react";
import {
    Header,
    Icon,
    MessageBox,
    Modal,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "@adminjs/design-system";
import { TaggedLetters } from "../../../backend/db/models/TaggedLetters.js";
import { useLetterTagContext } from "../../context/LetterTagContext.js";
import { useCurrentAdmin, useNotice } from "adminjs";
import TagModal from "../TagModal/TagModal.js";
import { styled } from "@adminjs/design-system/styled-components";

const TagListModal = styled(Modal)`
    @media (max-width: 576px) {
        width: 96%;
    }
    @media (max-width: 400px) and (max-height: 720px) {
        height: 96%;
        overflow: scroll;
    }
    @media only screen and (max-height: 575.98px) and (orientation: landscape) {
        height: 96%;
        overflow: scroll;
    }
`;

interface ITagsListModalProps {
    selectedLetter?: number;
    setShowTags: Dispatch<SetStateAction<boolean>>;
    bookId: number;
}

const TagsListModal: React.FC<ITagsListModalProps> = ({
    selectedLetter,
    setShowTags,
    bookId,
}) => {
    const [currentAdmin] = useCurrentAdmin();
    const addNotice = useNotice();
    const { tags, removeTag } = useLetterTagContext();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(5);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [tag, setTag] = useState<string>("");
    const [tagId, setTagId] = useState<number>();
    const [newLetterId, setNewLetterId] = useState<number>();
    const modalProps = {
        onClose: () => setShowTags(false),
    };
    const handlePaginationChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const filteredTaggedLetters = tags.taggedLetters.filter(
        (taggedLetter) => taggedLetter.letter_id === selectedLetter
    );
    const letter = tags.taggedLetters.find(
        (tag) => tag.letter_id === selectedLetter
    );

    const paginatedData = filteredTaggedLetters.slice(startIndex, endIndex);

    const canDeleteOrEdit = (taggedBy: string | undefined): boolean => {
        if (!currentAdmin) {
            return false;
        }

        return (
            (currentAdmin.role === 3 && currentAdmin.id === taggedBy) ||
            currentAdmin.role === 1 ||
            currentAdmin.role === 2
        );
    };

    const removeSelectedTag = (tagId) => {
        removeTag(tagId)
            .then(() => {
                const isLastTag = paginatedData.length === 1;
                if (isLastTag) {
                    if (currentPage == 1) {
                        setShowTags(false);
                        addNotice({
                            message: "Tag deleted successfully",
                            type: "success",
                        });
                    } else {
                        setCurrentPage(currentPage - 1);
                        setMessage("Tag deleted successfully");
                        setMessageType("success");
                    }
                } else {
                    setMessage("Tag deleted successfully");
                    setMessageType("success");
                }
            })
            .catch(() => {
                setMessage("Error deleting tag,try agin later");
                setMessageType("danger");
            });
    };

    return (
        <TagListModal {...modalProps}>
            {message && (
                <MessageBox
                    message={message}
                    variant={messageType}
                    onCloseClick={() => setMessage("")}
                />
            )}
            <Header.H5 textAlign="center" marginTop="default" marginBottom="xl">
                Tags for "{letter?.letter.letter}"
            </Header.H5>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell style={{ textAlign: "center" }}>
                            <p>Tag</p>
                        </TableCell>
                        <TableCell style={{ textAlign: "center" }}>
                            <p>Action</p>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {paginatedData.map(
                        (taggedLetter: TaggedLetters, index: number) => (
                            <React.Fragment key={taggedLetter.id}>
                                <TableRow>
                                    <TableCell style={{ textAlign: "center" }}>
                                        <img
                                            style={{
                                                height: "60px",
                                                width: "60px",
                                                borderRadius: "10px",
                                            }}
                                            src={taggedLetter.tag_path}
                                        />
                                    </TableCell>
                                    <TableCell style={{ textAlign: "center" }}>
                                        <Icon
                                            icon="Edit"
                                            size="20"
                                            color={
                                                canDeleteOrEdit(
                                                    taggedLetter.tagged_by
                                                )
                                                    ? "#1F2B9B"
                                                    : "rgba(0, 0, 0, 0.2)"
                                            }
                                            onClick={
                                                canDeleteOrEdit(
                                                    taggedLetter.tagged_by
                                                )
                                                    ? () => {
                                                          setTag(
                                                              taggedLetter.tag_path
                                                          );
                                                          setTagId(
                                                              taggedLetter.id
                                                          );
                                                          setNewLetterId(
                                                              taggedLetter.letter_id
                                                          );
                                                      }
                                                    : undefined
                                            }
                                            style={{
                                                marginRight: "5px",
                                                cursor: canDeleteOrEdit(
                                                    taggedLetter.tagged_by
                                                )
                                                    ? "pointer"
                                                    : "default",
                                            }}
                                            title={
                                                !canDeleteOrEdit(
                                                    taggedLetter.tagged_by
                                                )
                                                    ? "You can edit yout tags only"
                                                    : ""
                                            }
                                        />
                                        <Icon
                                            icon="Trash2"
                                            size="20"
                                            color={
                                                canDeleteOrEdit(
                                                    taggedLetter.tagged_by
                                                )
                                                    ? "#1F2B9B"
                                                    : "rgba(0, 0, 0, 0.2)"
                                            }
                                            onClick={
                                                canDeleteOrEdit(
                                                    taggedLetter.tagged_by
                                                )
                                                    ? () =>
                                                          removeSelectedTag(
                                                              taggedLetter.id
                                                          )
                                                    : undefined
                                            }
                                            style={{
                                                cursor: canDeleteOrEdit(
                                                    taggedLetter.tagged_by
                                                )
                                                    ? "pointer"
                                                    : "default",
                                            }}
                                            title={
                                                !canDeleteOrEdit(
                                                    taggedLetter.tagged_by
                                                )
                                                    ? "You can delete yout tags only"
                                                    : ""
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        )
                    )}
                </TableBody>
            </Table>
            <div style={{ textAlign: "center", marginTop: "10px" }}>
                <Pagination
                    page={currentPage}
                    perPage={itemsPerPage}
                    total={filteredTaggedLetters.length}
                    onChange={handlePaginationChange}
                />
            </div>
            {tag && (
                <TagModal
                    tag={tag}
                    bookId={bookId}
                    mode={"edit"}
                    image={tag}
                    letterId={newLetterId}
                    tagId={tagId}
                    setTag={setTag}
                    setShowTags={setShowTags}
                />
            )}
        </TagListModal>
    );
};

export default TagsListModal;
