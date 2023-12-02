import React, { createContext, useContext, useReducer, ReactNode } from "react";
import axios from "axios";
import { Comments } from "../../backend/db/models/Comments.js";

interface IComments {
    comments: Comments[];
}

interface IAddComment {
    bookId: number;
    comment: string;
    commented_by: number;
}
interface IEditComment {
    id: number;
    bookId: number;
    comment: string;
    commented_by: number;
}

type Action =
    | { type: "ADD_COMMENT"; payload: { comment: Comments } }
    | { type: "REMOVE_COMMENT"; payload: { commentId: number } }
    | { type: "EDIT_COMMENT"; payload: { comment: Comments; id: number } }
    | {
          type: "FETCH_COMMENTS";
          payload: { allComments: Comments[] };
      };

type Dispatch = (action: Action) => void;

const sortByUpdatedAt = (
    a: { updated_at: string | number | Date },
    b: { updated_at: string | number | Date }
) => Number(new Date(b.updated_at)) - Number(new Date(a.updated_at));

const CommentsContext = createContext<
    | {
          data: IComments;
          dispatch: Dispatch;
          fetchComments: (bookId: number) => Promise<void>;
          addComment: (comment: IAddComment) => Promise<void>;
          removeComment: (commentId: number) => Promise<void>;
          editComment: (comment: IEditComment) => Promise<void>;
      }
    | undefined
>(undefined);

const commentsReducer = (data: IComments, action: Action): IComments => {
    switch (action.type) {
        case "FETCH_COMMENTS":
            return {
                ...data,
                comments: action.payload.allComments.sort(sortByUpdatedAt),
            };
        case "ADD_COMMENT":
            const comment = [...data.comments, action.payload.comment];
            return {
                comments: comment.sort(sortByUpdatedAt),
            };
        case "REMOVE_COMMENT":
            const filteredComments = data.comments.filter(
                (comment) => comment.id !== action.payload.commentId
            );
            return {
                comments: filteredComments.sort(sortByUpdatedAt),
            };
        case "EDIT_COMMENT":
            const updatedComment = data.comments.map((record) => {
                if (record.id === action.payload.comment.id) {
                    return action.payload.comment;
                } else {
                    return record;
                }
            });

            return {
                comments: updatedComment.sort(sortByUpdatedAt),
            };
        default:
            return data;
    }
};

export const useCommentsContext = () => {
    const context = useContext(CommentsContext);
    if (context === undefined) {
        throw new Error(
            "useCommentsContext must be used within a CommentsProvider"
        );
    }
    return context;
};

interface Props {
    children: ReactNode;
}

const CommentsProvider = ({ children }: Props) => {
    const [data, dispatch] = useReducer(commentsReducer, {
        comments: [],
    });
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;

    const fetchComments = async (bookId: number) => {
        const response = await axios.get(
            `${BASE_URL}/get-comments?bookId=` + bookId
        );
        console.log(response.data);
        if (response.data) {
            dispatch({
                type: "FETCH_COMMENTS",
                payload: { allComments: response.data },
            });
        }
    };

    const addComment = async (comment: IAddComment) => {
        const response = await axios.post(`${BASE_URL}/add-comment`, comment, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response.status == 200) {
            dispatch({
                type: "ADD_COMMENT",
                payload: {
                    comment: response.data,
                },
            });
        }
    };

    const editComment = async (comment: IEditComment) => {
        const response = await axios.post(`${BASE_URL}/edit-comment`, comment, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response.status == 200) {
            dispatch({
                type: "EDIT_COMMENT",
                payload: {
                    comment: response.data,
                    id: response.data.id,
                },
            });
        }
    };

    const removeComment = async (commentId: number) => {
        const response = await axios.delete(
            `${BASE_URL}/delete-comment?id=` + commentId
        );
        if (response.status == 200) {
            dispatch({
                type: "REMOVE_COMMENT",
                payload: { commentId },
            });
        }
    };

    return (
        <CommentsContext.Provider
            value={{
                data,
                dispatch,
                fetchComments,
                addComment,
                editComment,
                removeComment,
            }}
        >
            {children}
        </CommentsContext.Provider>
    );
};

export default CommentsProvider;
