import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

interface BookProgressContextValue {
    processPercentage: number;
    fetchData: () => Promise<void>;
}

const BookProgressContext = createContext<BookProgressContextValue>({
    processPercentage: 0,
    fetchData: async () => {},
});

export const useBookProgressContext = () => {
    const context = useContext(BookProgressContext);
    if (context === undefined) {
        throw new Error(
            "useBookProgressContext must be used within a BookProgressProvider"
        );
    }
    return context;
};

const BookProgressProvider = ({ children, bookId }) => {
    const [processPercentage, setProcessPercentage] = useState(0);
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;

    const fetchData = async () => {
        try {
            const response = await axios.get(
                `${BASE_URL}/get-tagged-percentage`,
                {
                    params: { bookId: bookId },
                }
            );
            setProcessPercentage(response.data);
        } catch (error) {
            console.error("Error fetching tagged percentage:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const contextValue: BookProgressContextValue = {
        processPercentage,
        fetchData,
    };

    return (
        <BookProgressContext.Provider value={contextValue}>
            {children}
        </BookProgressContext.Provider>
    );
};

export { BookProgressProvider, BookProgressContext };
