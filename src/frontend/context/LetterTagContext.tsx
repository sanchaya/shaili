import React, { createContext, useContext, useReducer, useRef, ReactNode } from "react";
import { TaggedLetters } from "../../backend/db/models/TaggedLetters.js";
import axios from "axios";
import { useCurrentAdmin } from "adminjs";

interface ITags {
    taggedLetters: TaggedLetters[];
    recentLetters: TaggedLetters[];
}

export interface ITagBox {
    x: number;
    y: number;
    w: number;
    h: number;
}

// Where a specimen was cropped from (page is 1-based, box in page-image pixels).
export interface ITagSource {
    page: number;
    box: ITagBox;
}

interface IAddTag {
    book_id: number;
    letter_id: number | undefined;
    croppedImage: string;
    tagged_by: number | undefined;
    page?: number;
    box?: ITagBox;
}
interface IUpdateTag {
    id: number;
    book_id: number;
    letter_id: number | undefined;
    tagged_by: number | undefined;
}

type Action =
    | { type: "ADD_TAG"; payload: { tag: TaggedLetters; id: number } }
    | { type: "REMOVE_TAG"; payload: { id: number; letterId: number } }
    | { type: "UPDATE_TAG"; payload: { tag: TaggedLetters; id: number } }
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
            new Date(letter.updated_at) >= today &&
            Number(letter.tagged_by) == currentUserId
    );
};

const LetterTagContext = createContext<
    | {
          tags: ITags;
          dispatch: Dispatch;
          fetchTag: (bookId: number) => Promise<void>;
          addTag: (tag: IAddTag) => Promise<void>;
          removeTag: (letterId: number) => Promise<void>;
          updateTag: (tag: IUpdateTag) => Promise<void>;
          setCropSource: (source: ITagSource | null) => void;
          showSource?: (source: ITagSource) => void;
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
                action.payload.tag,
                ...tags.taggedLetters,
            ];

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
            const filteredRecentLetters = filterRecentLetters(
                filteredTaggedLetters,
                20,
                action.payload.id
            );

            return {
                taggedLetters: filteredTaggedLetters,
                recentLetters: filteredRecentLetters,
            };
        case "UPDATE_TAG":
            const updatedTaggedLetters = tags.taggedLetters.map((record) => {
                if (record.id === action.payload.tag.id) {
                    return action.payload.tag;
                } else {
                    return record;
                }
            });

            const updatedRecentLetters = filterRecentLetters(
                updatedTaggedLetters,
                20,
                action.payload.id
            );

            return {
                taggedLetters: updatedTaggedLetters,
                recentLetters: updatedRecentLetters,
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
    onShowSource?: (source: ITagSource) => void;
}

const LetterTagProvider = ({ children, onShowSource }: Props) => {
    // Set by the manual cropper; used by addTag unless the caller passes its own.
    const cropSource = useRef<ITagSource | null>(null);
    const setCropSource = (source: ITagSource | null) => {
        cropSource.current = source;
    };
    const [tags, dispatch] = useReducer(letterTagReducer, {
        taggedLetters: [],
        recentLetters: [],
    });
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;
    const [currentAdmin] = useCurrentAdmin();

    const fetchTag = async (bookId: number) => {
        const response = await axios.get(
            `${BASE_URL}/tagged-letter?bookId=` + bookId
        );
        if (response.data) {
            const recentTags = filterRecentLetters(
                response.data,
                20,
                Number(currentAdmin?.id)
            );

            dispatch({
                type: "FETCH_TAGS",
                payload: { allTags: response.data, recentTags: recentTags },
            });
        }
    };

    const addTag = async (tag: IAddTag) => {
        const response = await axios.post(`${BASE_URL}/save-tag`, { ...cropSource.current, ...tag }, {
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
    };

    const updateTag = async (tag: IUpdateTag) => {
        const response = await axios.post(`${BASE_URL}/update-tag`, tag, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response.status == 200) {
            dispatch({
                type: "UPDATE_TAG",
                payload: {
                    tag: response.data,
                    id: Number(currentAdmin?.id),
                },
            });
        }
    };

    const removeTag = async (letterId: number) => {
        const response = await axios.delete(
            `${BASE_URL}/delete-tag?id=` + letterId
        );
        if (response.status == 200) {
            dispatch({
                type: "REMOVE_TAG",
                payload: { id: Number(currentAdmin?.id), letterId },
            });
        }
    };

    return (
        <LetterTagContext.Provider
            value={{ tags, dispatch, fetchTag, addTag, updateTag, removeTag, setCropSource, showSource: onShowSource }}
        >
            {children}
        </LetterTagContext.Provider>
    );
};

export default LetterTagProvider;
