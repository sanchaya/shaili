import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { styled } from "@adminjs/design-system/styled-components";
import axios from "axios";
import { formatDate } from "../../utils/helpers.js";
import { Button, Link, Loader, Text } from "@adminjs/design-system";
import { useCurrentAdmin, useNotice } from "adminjs";
import DOMPurify from "dompurify";
import { Comments } from "../../../backend/db/models/Comments.js";

const CompareCommentWrap = styled.div`
    background: #f8f9f9;
    border-radius: 3px;
    padding: 20px;
    margin-bottom: 10px;
`;

const CompareComment = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
`;

const CompareCommentContent = styled.div`
    font-size: 14px;
    font-weight: 300;
    font-style: italic;
`;

const CompareCommentMeta = styled.div`
    display: flex;
    gap: 10px;
    font-size: 12px;
    font-weight: 200;
`;

const NewCommentsWrap = styled.div`
    display: flex;
    flex-direction: column;
`;

const EditCommentWrap = styled.div`
    width: 100%;
`;

const CommentAction = styled.div`
    display: flex;
    gap: 5px;
    font-size: 10px;
`;

interface IUser {
    id: number;
    name: string;
}

interface ICompareCommentProps {
    bookId: number;
    comments: Comments[];
    setLocalComments: Dispatch<SetStateAction<Comments[] | undefined>>;
    users: IUser[];
}

const CompareComments = ({
    bookId,
    comments,
    setLocalComments,
    users,
}: ICompareCommentProps) => {
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;
    const [comment, setComment] = useState<string>();
    const [editedComment, setEditedComment] = useState<string>();
    const [editedCommentId, setEditedCommentId] = useState<number | null>(null);
    const [showAll, setShowAll] = useState<boolean>(false);
    const addNotice = useNotice();
    const [currentAdmin] = useCurrentAdmin();
    const [commentUpdated, setCommentUpdated] = useState<boolean>(false);
    const [loadingComments, setLoadingComments] = useState<boolean>(false);

    useEffect(() => {
        axios
            .get(`${BASE_URL}/get-comments?bookId=` + bookId)
            .then((response) => {
                setLocalComments(response.data);
                setCommentUpdated(false);
            })
            .finally(() => setLoadingComments(false));
    }, [commentUpdated]);

    const handleAddComment = async () => {
        if (comment) {
            const cleanComment = DOMPurify.sanitize(
                comment.trim().replace(/\s+/g, " ")
            );
            const data = {
                bookId: bookId,
                comment: cleanComment,
                commented_by: Number(currentAdmin?.id),
            };
            const response = await axios.post(`${BASE_URL}/add-comment`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.status == 200) {
                setLoadingComments(true);
                setCommentUpdated(true);
                setComment("");
                addNotice({
                    type: "success",
                    message: "Comment added successfully",
                });
            } else {
                addNotice({
                    message: "Error adding comment try again later",
                    type: "error",
                });
            }
        }
    };

    const handleSaveComment = async (noteId: number) => {
        if (editedComment) {
            const cleanEditedComment = DOMPurify.sanitize(
                editedComment.trim().replace(/\s+/g, " ")
            );
            const data = {
                id: noteId,
                bookId: bookId,
                comment: cleanEditedComment,
                commented_by: Number(currentAdmin?.id),
            };
            const response = await axios.post(
                `${BASE_URL}/edit-comment`,
                data,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.status == 200) {
                setLoadingComments(true);
                setCommentUpdated(true);
                setEditedCommentId(null);
                setEditedComment("");
                addNotice({
                    type: "success",
                    message: "Comment updated successfully",
                });
            } else {
                addNotice({
                    message: "Error editing comment try again later",
                    type: "error",
                });
            }
        }
    };

    const remainingCount = comments?.length - 4;

    const getUserName = (value: number) => {
        const user = users?.find((lang) => lang.id === value);
        return user ? user.name : "";
    };

    const handleLoadMore = () => {
        setShowAll((prevShowAll) => !prevShowAll);
    };

    return (
        <>
            <Text
                style={{
                    fontSize: "20px",
                    fontWeight: "400",
                    marginBottom: "10px",
                }}
            >
                Comments
            </Text>
            <CompareCommentWrap key={"existingComments"}>
                {loadingComments ? (
                    <Loader />
                ) : (
                    <>
                        {comments && comments.length !== 0 ? (
                            (showAll ? comments : comments.slice(0, 4)).map(
                                (comment, index) => (
                                    <React.Fragment key={index}>
                                        <CompareComment>
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
                                                                setEditedCommentId(
                                                                    null
                                                                )
                                                            }
                                                            style={{
                                                                marginRight:
                                                                    "5px",
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
                                                    <CompareCommentMeta>
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
                                                    </CompareCommentMeta>
                                                    <p className="comment-container">
                                                        {comment.comment}
                                                    </p>
                                                    <CommentAction>
                                                        {Number(
                                                            currentAdmin?.id
                                                        ) ===
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
                                        </CompareComment>
                                        <hr
                                            style={{
                                                borderTop:
                                                    "1px solid #00000021",
                                            }}
                                        />
                                    </React.Fragment>
                                )
                            )
                        ) : (
                            <CompareCommentContent
                                style={{ textAlign: "center" }}
                            >
                                No comments found
                            </CompareCommentContent>
                        )}
                        {!showAll && remainingCount > 0 && (
                            <div
                                style={{
                                    textAlign: "center",
                                    marginTop: "10px",
                                }}
                            >
                                <Link onClick={handleLoadMore}>
                                    See older ({remainingCount}) comments.
                                </Link>
                            </div>
                        )}
                        {showAll && (
                            <div
                                style={{
                                    textAlign: "center",
                                    marginTop: "10px",
                                }}
                            >
                                <Link onClick={handleLoadMore}>
                                    See recent comments only.
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </CompareCommentWrap>
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
        </>
    );
};

export default CompareComments;
