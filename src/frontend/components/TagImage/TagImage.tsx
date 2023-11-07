import { useState } from "react";
import { styled } from "@adminjs/design-system/styled-components";
import { Icon, Modal, ModalProps } from "@adminjs/design-system";
import React from "react";
import { useLetterTagContext } from "../../context/LetterTagContext.js";
import { useCurrentAdmin } from "adminjs";

const SingleTag = styled.img`
    height: 80px;
    width: 80px;
    border-radius: 5px;
    box-shadow: 0px 0px 3px 0px rgba(102, 102, 102, 0.75);
`;

const TagsInnerWrap = styled.div`
    position: relative;
    height: 80px;
`;

const DeleteIcon = styled.div`
    position: absolute;
    top: 0px;
    right: 0px;
    color: rgb(255, 255, 255);
    cursor: pointer;
    font-size: 18px;
    z-index: 999;
`;

const LetterWrap = styled.div`
    pointer-events: none;
    position: absolute;
    font-size: 27px;
    background: rgb(0, 0, 0, 0.5);
    color: #fff;
    height: 100%;
    width: 100%;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const TagImage = ({ image, letter, tagId, taggedBy }) => {
    const [currentAdmin] = useCurrentAdmin();
    const [showLetter, setShowLetter] = useState(false);
    const [show, setShow] = useState(false);
    const { removeTag } = useLetterTagContext();
    const removeSelectedTag = () => {
        removeTag(tagId).then(() => {
            setShow(false);
        });
    };
    const modalProps: ModalProps = {
        label: "Confirm",
        title: "Do you really want to remove this tag?",
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
                            size={20}
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
                <SingleTag
                    src={image}
                    onMouseEnter={() => setShowLetter(true)}
                    onMouseLeave={() => setShowLetter(false)}
                />
            </TagsInnerWrap>
            {show && <Modal {...modalProps} />}
        </>
    );
};

export default TagImage;
