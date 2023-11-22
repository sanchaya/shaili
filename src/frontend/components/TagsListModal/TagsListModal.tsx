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
import { useCurrentAdmin } from "adminjs";
import TagModal from "../TagModal/TagModal.js";

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
    const { tags, removeTag } = useLetterTagContext();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(5);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [tag, setTag] = useState<string>("");
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
                setMessage("Tag deleted successfully");
                setMessageType("success");
            })
            .catch(() => {
                setMessage("Error deleting tag,try agin later");
                setMessageType("danger");
            });
    };

    return (
        <Modal {...modalProps}>
            {message && (
                <MessageBox
                    message={message}
                    variant={messageType}
                    onCloseClick={() => setMessage("")}
                />
            )}
            <Header.H3 textAlign="center" marginTop="default" marginBottom="xl">
                Tags for "{letter?.letter.letter}"
            </Header.H3>
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
                            <>
                                <TableRow>
                                    <TableCell style={{ textAlign: "center" }}>
                                        <img
                                            style={{
                                                height: "50px",
                                                width: "50px",
                                            }}
                                            src={taggedLetter.cropped_image}
                                            key={index}
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
                                                              taggedLetter.cropped_image
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
                                {tag && (
                                    <TagModal
                                        tag={taggedLetter.cropped_image}
                                        bookId={bookId}
                                        mode={"edit"}
                                        image={taggedLetter.cropped_image}
                                        letterId={taggedLetter.letter_id}
                                        tagId={taggedLetter.id}
                                        setTag={setTag}
                                        setShowTags={setShowTags}
                                    />
                                )}
                            </>
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
        </Modal>
    );
};

export default TagsListModal;
