import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { TaggedLetters } from "../../backend/db/models/TaggedLetters.js";
import axios from "axios";
import { useCurrentAdmin } from "adminjs";

interface ITags {
    taggedLetters: TaggedLetters[];
    recentLetters: TaggedLetters[];
}

interface IAddTag {
    book_id: number;
    letter_id: number | undefined;
    cropped_image: string;
    tagged_by: number | undefined;
}

type Action =
    | { type: "ADD_TAG"; payload: { tag: TaggedLetters; id: number } }
    | { type: "REMOVE_TAG"; payload: { id: number; letterId: number } }
    | {
          type: "FETCH_TAGS";
          payload: { allTags: TaggedLetters[]; recentTags: TaggedLetters[] };
      };

type Dispatch = (action: Action) => void;

const filterRecentLetters = (
    taggedLetters: TaggedLetters[],
    days: number,
    currentUserId: number
) => {
    const today = new Date();
    today.setDate(today.getDate() - days);
    return taggedLetters.filter(
        (letter) =>
            new Date(letter.created_at) >= today &&
            Number(letter.tagged_by) == currentUserId
    );
};

const sortByCreatedAt = (
    a: { created_at: string | number | Date },
    b: { created_at: string | number | Date }
) => Number(new Date(b.created_at)) - Number(new Date(a.created_at));

const LetterTagContext = createContext<
    | {
          tags: ITags;
          dispatch: Dispatch;
          fetchTag: (bookId: number) => Promise<void>;
          addTag: (tag: IAddTag) => Promise<void>;
          removeTag: (letterId: number) => Promise<void>;
      }
    | undefined
>(undefined);

const letterTagReducer = (tags: ITags, action: Action): ITags => {
    switch (action.type) {
        case "FETCH_TAGS":
            return {
                ...tags,
                taggedLetters: action.payload.allTags,
                recentLetters: action.payload.recentTags,
            };
        case "ADD_TAG":
            const newTaggedLetters = [
                ...tags.taggedLetters,
                action.payload.tag,
            ];

            newTaggedLetters.sort(sortByCreatedAt);

            const newRecentLetters = filterRecentLetters(
                newTaggedLetters,
                20,
                action.payload.id
            );

            return {
                taggedLetters: newTaggedLetters,
                recentLetters: newRecentLetters,
            };
        case "REMOVE_TAG":
            const filteredTaggedLetters = tags.taggedLetters.filter(
                (letter) => letter.id !== action.payload.letterId
            );
            filteredTaggedLetters.sort(sortByCreatedAt);
            const filteredRecentLetters = filterRecentLetters(
                filteredTaggedLetters,
                20,
                action.payload.id
            );

            return {
                taggedLetters: filteredTaggedLetters,
                recentLetters: filteredRecentLetters,
            };
        default:
            return tags;
    }
};

export const useLetterTagContext = () => {
    const context = useContext(LetterTagContext);
    if (context === undefined) {
        throw new Error(
            "useLetterTagContext must be used within a LetterTagProvider"
        );
    }
    return context;
};

interface Props {
    children: ReactNode;
}

const LetterTagProvider = ({ children }: Props) => {
    const [tags, dispatch] = useReducer(letterTagReducer, {
        taggedLetters: [],
        recentLetters: [],
    });
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;
    const [currentAdmin] = useCurrentAdmin();

    const fetchTag = async (bookId: number) => {
        try {
            const response = await axios.get(
                `${BASE_URL}/tagged-letter?bookId=` + bookId
            );
            if (response.data) {
                const recentTags = filterRecentLetters(
                    response.data,
                    20,
                    Number(currentAdmin?.id)
                );
                const all = response.data.sort(sortByCreatedAt);
                const recent = recentTags.sort(sortByCreatedAt);

                dispatch({
                    type: "FETCH_TAGS",
                    payload: { allTags: all, recentTags: recent },
                });
            }
        } catch (error) {
            console.error("Error fetching tagged letters:", error);
        }
    };

    const addTag = async (tag: IAddTag) => {
        try {
            const response = await axios.post(`${BASE_URL}/save-tag`, tag, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.status == 200) {
                dispatch({
                    type: "ADD_TAG",
                    payload: {
                        tag: response.data,
                        id: Number(currentAdmin?.id),
                    },
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const removeTag = async (letterId: number) => {
        try {
            const response = await axios.delete(
                `${BASE_URL}/delete-tag?id=` + letterId
            );
            if (response.status == 200) {
                dispatch({
                    type: "REMOVE_TAG",
                    payload: { id: Number(currentAdmin?.id), letterId },
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <LetterTagContext.Provider
            value={{ tags, dispatch, fetchTag, addTag, removeTag }}
        >
            {children}
        </LetterTagContext.Provider>
    );
};

export default LetterTagProvider;
