import { styled } from "@adminjs/design-system/styled-components";
import { Button, Link, Loader, Text } from "@adminjs/design-system";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCommentsContext } from "../../context/CommentsContext.js";
import { useCurrentAdmin, useNotice } from "adminjs";
import { formatDate } from "../../utils/helpers.js";
import DOMPurify from "dompurify";

const CommentsWrap = styled.div`
    width: 56.7%;
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
    const [editedCommentId, setEditedCommentId] = useState<number | null>(null);
    const [users, setUsers] = useState<IUser[]>();
    const [showAll, setShowAll] = useState<boolean>(false);
    const addNotice = useNotice();
    const { data, fetchComments, addComment, editComment } =
        useCommentsContext();
    const bookId = props.bookId;
    const [currentAdmin] = useCurrentAdmin();

    useEffect(() => {
        fetchComments(bookId);
        axios.get(`${BASE_URL}/get-users`).then((response) => {
            setUsers(response.data);
        });
    }, []);

    const handleAddComment = () => {
        if (comment) {
            const cleanComment = DOMPurify.sanitize(
                comment.trim().replace(/\s+/g, " ")
            );
            const data = {
                bookId: bookId,
                comment: cleanComment,
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

    const handleSaveComment = (noteId: number) => {
        if (editedComment) {
            const cleanEditedComment = DOMPurify.sanitize(
                editedComment.trim().replace(/\s+/g, " ")
            );
            editComment({
                id: noteId,
                bookId: bookId,
                comment: cleanEditedComment,
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

    return (
        <CommentsWrap>
            <Text
                style={{
                    fontSize: "28px",
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
                                            <textarea
                                                value={editedComment}
                                                onChange={(e) =>
                                                    setEditedComment(
                                                        e.target.value
                                                    )
                                                }
                                                style={{
                                                    height: "100px",
                                                    width: "100%",
                                                }}
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
                                                            comment.comment ||
                                                        !editedComment
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
                                                width: "100%",
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
                                            <p className="comment-container">
                                                {comment.comment}
                                            </p>
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
                <textarea
                    onChange={(e) => setComment(e.target.value)}
                    value={comment}
                    style={{ height: "100px" }}
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
        </CommentsWrap>
    );
};

export default Comments;
