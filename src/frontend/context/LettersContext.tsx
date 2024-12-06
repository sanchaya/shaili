import React, { createContext, useContext, useReducer, ReactNode } from "react";
import axios from "axios";
import { Letters } from "../../backend/db/models/Letters.js";

interface IAddLetter {
    letter: string;
    language?: string;
    letterType?: number;
    createdBy: number;
}

type Action =
    | { type: "ADD_LETTER"; payload: { letter: Letters } }
    | {
          type: "FETCH_LETTERS";
          payload: { allLetters: Letters[] };
      };

type Dispatch = (action: Action) => void;

const LettersContext = createContext<
    | {
          letters: Letters[];
          dispatch: Dispatch;
          fetchLetters: () => Promise<void>;
          addLetter: (letter: IAddLetter) => Promise<number>;
      }
    | undefined
>(undefined);

const lettersReducer = (letters: Letters[], action: Action): Letters[] => {
    switch (action.type) {
        case "FETCH_LETTERS":
            return [...letters, ...action.payload.allLetters];
        case "ADD_LETTER":
            return [...letters, action.payload.letter];
        default:
            return letters;
    }
};

export const useLettersContext = () => {
    const context = useContext(LettersContext);
    if (context === undefined) {
        throw new Error(
            "useLettersContext must be used within a LettersProvider"
        );
    }
    return context;
};

interface Props {
    children: ReactNode;
}

const LettersProvider = ({ children }: Props) => {
    const [letters, dispatch] = useReducer(lettersReducer, []);
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;

    const fetchLetters = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/get-letters`);
            dispatch({
                type: "FETCH_LETTERS",
                payload: { allLetters: response.data },
            });
        } catch (error) {
            console.error("Error fetching letters:", error);
        }
    };

    const addLetter = async (letter: IAddLetter) => {
        const response = await axios.post(`${BASE_URL}/add-letter`, letter);
        if (response.status === 200) {
            dispatch({
                type: "ADD_LETTER",
                payload: {
                    letter: response.data,
                },
            });
        }
        return response.data.id;
    };

    return (
        <LettersContext.Provider
            value={{ letters, dispatch, fetchLetters, addLetter }}
        >
            {children}
        </LettersContext.Provider>
    );
};

export default LettersProvider;
