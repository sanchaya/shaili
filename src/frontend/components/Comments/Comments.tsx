import { styled } from "@adminjs/design-system/styled-components";
import {
    Button,
    Link,
    Loader,
    Modal,
    ModalProps,
    Text,
    TextArea,
} from "@adminjs/design-system";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCommentsContext } from "../../context/CommentsContext.js";
import { useCurrentAdmin, useNotice } from "adminjs";

const CommentsWrap = styled.div`
    width: 57.5%;
    margin-top: 20px;
    padding: 30px 15px;
    background: rgb(255, 255, 255);
    box-shadow: rgb(204, 204, 204) 0px 2px 2px 1px;
    border-radius: 5px;
    @media (max-width: 800px) {
        width: auto;
    }
`;

const CommentWrap = styled.div`
    background: #f8f9f9;
    border-radius: 3px;
    padding: 20px;
    margin-bottom: 10px;
`;

const Comment = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
`;

const CommentContent = styled.div`
    font-size: 14px;
    font-weight: 300;
    font-style: italic;
`;

const CommentMeta = styled.div`
    display: flex;
    gap: 10px;
    font-size: 12px;
    font-weight: 200;
`;

const CommentAction = styled.div`
    display: flex;
    gap: 5px;
    font-size: 10px;
`;

const NewCommentsWrap = styled.div`
    display: flex;
    flex-direction: column;
`;

const CustomCommentsWrap = styled(TextArea)`
    width: 100%;
    height: 100px;
`;

const EditCommentWrap = styled.div`
    width: 100%;
`;

interface IUser {
    id: number;
    name: string;
}

const Comments = (props: { bookId: number; loading: boolean }) => {
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;
    const [comment, setComment] = useState<string>();
    const [editedComment, setEditedComment] = useState<string>();
    const [commentId, setCommentId] = useState<number>();
    const [editedCommentId, setEditedCommentId] = useState<number | null>(null);
    const [users, setUsers] = useState<IUser[]>();
    const [show, setShow] = useState<boolean>(false);
    const [showAll, setShowAll] = useState<boolean>(false);
    const addNotice = useNotice();
    const { data, fetchComments, addComment, removeComment, editComment } =
        useCommentsContext();
    const bookId = props.bookId;
    const [currentAdmin] = useCurrentAdmin();
    useEffect(() => {
        fetchComments(bookId);
        axios.get(`${BASE_URL}/get-users`).then((response) => {
            setUsers(response.data);
        });
    }, []);

    const formatDate = (timestamp: string) => {
        const dateTime = new Date(timestamp);
        let formattedDate = dateTime.toLocaleString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
        });
        return formattedDate;
    };

    const handleAddComment = () => {
        if (comment) {
            const data = {
                bookId: bookId,
                comment: comment.trim().replace(/\s+/g, " "),
                commented_by: Number(currentAdmin?.id),
            };
            addComment(data)
                .then(() => {
                    setComment("");
                    addNotice({
                        type: "success",
                        message: "Comment added successfully",
                    });
                })
                .catch((error) => {
                    addNotice({
                        message: "Error adding comment try again later",
                        type: "error",
                    });
                });
        }
    };

    const handleDeleteComment = () => {
        if (commentId) {
            removeComment(commentId)
                .then(() => {
                    setShow(false);
                    addNotice({
                        type: "success",
                        message: "Comment deleted successfully",
                    });
                })
                .catch((error) => {
                    setShow(false);
                    addNotice({
                        message: "Error deleting comment try again later",
                        type: "error",
                    });
                });
        }
    };

    const handleSaveComment = (noteId: number) => {
        if (editedComment) {
            editComment({
                id: noteId,
                bookId: bookId,
                comment: editedComment.trim().replace(/\s+/g, " "),
                commented_by: Number(currentAdmin?.id),
            })
                .then(() => {
                    setEditedCommentId(null);
                    setEditedComment("");
                    addNotice({
                        type: "success",
                        message: "Comment updated successfully",
                    });
                })
                .catch((error) => {
                    setShow(false);
                    addNotice({
                        message: "Error editing comment try again later",
                        type: "error",
                    });
                });
        }
    };

    const getUserName = (value: number) => {
        const user = users?.find((lang) => lang.id === value);
        return user ? user.name : "";
    };

    const remainingCount = data?.comments.length - 4;

    const handleLoadMore = () => {
        setShowAll((prevShowAll) => !prevShowAll);
    };

    const modalProps: ModalProps = {
        label: "Confirm",
        title: "Are you sure you want to delete this comment?",
        variant: "danger",
        buttons: [
            { label: "Cancel", onClick: () => setShow(false) },
            {
                label: "Delete",
                variant: "danger",
                onClick: handleDeleteComment,
            },
        ],
        onClose: () => setShow(false),
    };

    return (
        <CommentsWrap>
            <Text
                style={{
                    fontSize: "26px",
                    fontWeight: "400",
                    marginBottom: "10px",
                }}
            >
                Comments
            </Text>
            {props.loading ? (
                <Loader />
            ) : (
                <CommentWrap key={"existingComments"}>
                    {data && data.comments.length !== 0 ? (
                        (showAll
                            ? data.comments
                            : data.comments.slice(0, 4)
                        ).map((comment) => (
                            <>
                                <Comment key={comment.id}>
                                    {editedCommentId === comment.id ? (
                                        <EditCommentWrap>
                                            <CustomCommentsWrap
                                                value={editedComment}
                                                onChange={(e) =>
                                                    setEditedComment(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <div
                                                style={{
                                                    textAlign: "end",
                                                    margin: "17px auto 10px auto",
                                                }}
                                            >
                                                <Button
                                                    color="primary"
                                                    onClick={() =>
                                                        setEditedCommentId(null)
                                                    }
                                                    style={{
                                                        marginRight: "5px",
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() =>
                                                        handleSaveComment(
                                                            comment.id
                                                        )
                                                    }
                                                    disabled={
                                                        editedComment ==
                                                        comment.comment
                                                    }
                                                >
                                                    Update
                                                </Button>
                                            </div>
                                        </EditCommentWrap>
                                    ) : (
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "10px",
                                                width: "80%",
                                            }}
                                        >
                                            <CommentMeta>
                                                <p>
                                                    {getUserName(
                                                        comment.commented_by
                                                    )}
                                                </p>
                                                <p>
                                                    {formatDate(
                                                        String(
                                                            comment.updated_at
                                                        )
                                                    )}
                                                </p>
                                            </CommentMeta>
                                            <CommentContent>
                                                <p>{comment.comment}</p>
                                            </CommentContent>
                                            <CommentAction>
                                                {Number(currentAdmin?.id) ===
                                                    comment.commented_by && (
                                                    <>
                                                        <Link
                                                            onClick={() => {
                                                                setEditedCommentId(
                                                                    comment.id
                                                                );
                                                                setEditedComment(
                                                                    comment.comment
                                                                );
                                                            }}
                                                        >
                                                            Edit
                                                        </Link>{" "}
                                                        |{" "}
                                                        <Link
                                                            onClick={() => {
                                                                setCommentId(
                                                                    comment.id
                                                                );
                                                                setShow(true);
                                                            }}
                                                        >
                                                            Delete
                                                        </Link>
                                                    </>
                                                )}
                                            </CommentAction>
                                        </div>
                                    )}
                                </Comment>
                                <hr
                                    style={{
                                        borderTop: "1px solid #00000021",
                                    }}
                                />
                            </>
                        ))
                    ) : (
                        <CommentContent style={{ textAlign: "center" }}>
                            No comments found
                        </CommentContent>
                    )}
                    {!showAll && remainingCount > 0 && (
                        <div style={{ textAlign: "center", marginTop: "10px" }}>
                            <Link onClick={handleLoadMore}>
                                See older ({remainingCount}) comments.
                            </Link>
                        </div>
                    )}
                    {showAll && (
                        <div style={{ textAlign: "center", marginTop: "10px" }}>
                            <Link onClick={handleLoadMore}>
                                See recent comments only.
                            </Link>
                        </div>
                    )}
                </CommentWrap>
            )}

            <NewCommentsWrap key={"newComment"}>
                <Text
                    style={{
                        fontSize: "18px",
                        fontWeight: "400",
                        marginBottom: "5px",
                    }}
                >
                    Add your comment
                </Text>
                <CustomCommentsWrap
                    disabled={props.loading}
                    placeholder="Enter your comment here"
                    value={comment}
                    onChange={(e: {
                        target: {
                            value: React.SetStateAction<string | undefined>;
                        };
                    }) => setComment(e.target.value)}
                />
                <Button
                    variant={"contained"}
                    style={{ alignSelf: "flex-end", marginTop: "10px" }}
                    onClick={handleAddComment}
                    disabled={!comment}
                >
                    Add Comment
                </Button>
            </NewCommentsWrap>
            {show && <Modal {...modalProps} />}
        </CommentsWrap>
    );
};

export default Comments;
