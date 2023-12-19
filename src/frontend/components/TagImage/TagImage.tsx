import { useState } from "react";
import { styled } from "@adminjs/design-system/styled-components";
import { Icon, Modal, ModalProps, Link } from "@adminjs/design-system";
import React from "react";
import { useLetterTagContext } from "../../context/LetterTagContext.js";
import { useCurrentAdmin, useNotice } from "adminjs";
import TagModal from "../TagModal/TagModal.js";

const SingleTag = styled.img`
    height: 60px;
    width: 60px;
    border-radius: 10px;
    box-shadow: 0px 0px 3px 0px rgba(102, 102, 102, 0.75);
`;

const TagsInnerWrap = styled.div`
    position: relative;
    height: 60px;
`;

const DeleteIcon = styled.div`
    position: absolute;
    top: 0px;
    right: 0px;
    color: rgb(255, 255, 255);
    cursor: pointer;
    font-size: 18px;
    z-index: 10;
`;

const LetterWrap = styled.div`
    pointer-events: none;
    position: absolute;
    font-size: 16px;
    background: rgb(0, 0, 0, 0.5);
    color: #fff;
    height: 100%;
    width: 100%;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const TagImage = ({ image, letter, letterId, bookId, tagId, taggedBy }) => {
    const [currentAdmin] = useCurrentAdmin();
    const [showLetter, setShowLetter] = useState(false);
    const [show, setShow] = useState(false);
    const { removeTag } = useLetterTagContext();
    const addNotice = useNotice();
    const [tag, setTag] = useState<string>("");
    const removeSelectedTag = () => {
        removeTag(tagId)
            .then(() => {
                setShow(false);
                addNotice({
                    message: "Tag deleted successfully",
                    type: "success",
                });
            })
            .catch(() => {
                setShow(false);
                addNotice({
                    message: "Error deleting tag,try agin later",
                    type: "success",
                });
            });
    };
    const modalProps: ModalProps = {
        label: "Confirm",
        title: "Are you sure you want to delete this tag?",
        variant: "danger",
        buttons: [
            { label: "Cancel", onClick: () => setShow(false) },
            {
                label: "Delete",
                variant: "danger",
                onClick: removeSelectedTag,
            },
        ],
        onClose: () => setShow(false),
    };
    const canDeleteTag =
        (currentAdmin?.role === 3 && currentAdmin?.id === taggedBy) ||
        currentAdmin?.role === 1 ||
        currentAdmin?.role === 2;
    return (
        <>
            <TagsInnerWrap>
                {canDeleteTag && (
                    <DeleteIcon>
                        <Icon
                            icon="XCircle"
                            size={16}
                            style={{
                                lineHeight: "0px",
                            }}
                            onClick={() => setShow(true)}
                        />
                    </DeleteIcon>
                )}
                {showLetter && (
                    <LetterWrap>
                        <span>{letter}</span>
                    </LetterWrap>
                )}
                <Link onClick={() => setTag(image)}>
                    <SingleTag
                        src={image}
                        onMouseEnter={() => setShowLetter(true)}
                        onMouseLeave={() => setShowLetter(false)}
                    />
                </Link>
            </TagsInnerWrap>
            {show && <Modal {...modalProps} />}
            {tag && (
                <TagModal
                    setTag={setTag}
                    tag={tag}
                    bookId={bookId}
                    mode={"edit"}
                    image={image}
                    letterId={letterId}
                    tagId={tagId}
                />
            )}
        </>
    );
};

export default TagImage;
