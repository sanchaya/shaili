import React, { useEffect, useState } from "react";
import { styled } from "@adminjs/design-system/styled-components";
import axios from "axios";
import { useCurrentAdmin } from "adminjs";
import { useNavigate } from "react-router-dom";
import { Box, Loader } from "@adminjs/design-system";

const DashboardContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
`;

const DashboardItem = styled.div`
    width: calc(33.33% - 10px);
    background-color: #f0f0f0;
    margin-bottom: 10px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    flex-direction: column;
    padding: 20px;
    @media (max-width: 577px) {
        width: 100%;
    }
`;

const HeaderItem = styled.div`
    text-align: center;
    padding: 30px;
`;

const CardTitle = styled.h2`
    text-align: center;
    font-size: 24px;
    font-weight: 500;
    line-height: 1.2;
`;

const Count = styled.span`
    text-align: center;
    font-size: 60px;
    font-weight: 700;
    line-height: 1.2;
`;

interface IBooks {
    id: number;
    name: string;
    status: number;
}

const Dashboard = () => {
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;
    const [totalBooks, setTotalBooks] = useState<IBooks[]>();
    const [taggedLetters, setTaggedLetters] = useState([]);
    const [currentAdmin] = useCurrentAdmin();
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        axios.get(`${BASE_URL}/get-books`).then((response) => {
            setTotalBooks(response.data);
        });
        axios
            .get(
                `${BASE_URL}/get-tagged-letters?user=` +
                    Number(currentAdmin?.id)
            )
            .then((response) => {
                setTaggedLetters(response.data);
                setLoading(false);
            });
    }, []);

    const uniqueRecords = Array.from(
        new Set(taggedLetters.map((record: any) => record.book_id))
    )
        .map((bookId) =>
            taggedLetters.find((record: any) => record.book_id === bookId)
        )
        .slice(0, 3);

    return (
        <Box style={{ width: "96%", margin: "0 auto" }}>
            <HeaderItem>
                <p style={{ fontSize: "40px" }}>Dashboard</p>
            </HeaderItem>
            <DashboardContainer>
                <DashboardItem>
                    <CardTitle>Total Number of books</CardTitle>
                    <Count>{loading ? <Loader /> : totalBooks?.length}</Count>
                </DashboardItem>
                <DashboardItem>
                    <CardTitle>Number of books in progress</CardTitle>
                    <Count>
                        {loading ? (
                            <Loader />
                        ) : (
                            totalBooks?.filter((item) => item.status === 2)
                                .length
                        )}
                    </Count>
                </DashboardItem>
                <DashboardItem>
                    <CardTitle>Completed Books</CardTitle>
                    <Count>
                        {loading ? (
                            <Loader />
                        ) : (
                            totalBooks?.filter((item) => item.status === 4)
                                .length
                        )}
                    </Count>
                </DashboardItem>
            </DashboardContainer>
            <Box>
                <Box
                    width={["100%", 1 / 2]}
                    backgroundColor="#fff"
                    borderRadius="10px"
                >
                    <h3
                        style={{
                            fontSize: "20px",
                            padding: "25px",
                            borderBottom: "1px solid rgb(238, 238, 239)",
                        }}
                    >
                        {" "}
                        Recently Viewed Books{" "}
                    </h3>
                    <Box padding="25px" paddingTop="20px">
                        {!loading ? (
                            <ul>
                                {uniqueRecords.length <= 0 && (
                                    <li style={{ textAlign: "center" }}>
                                        <span
                                            style={{
                                                color: "blue",
                                                cursor: "pointer",
                                            }}
                                            onClick={() =>
                                                navigate(
                                                    `/admin/resources/books/`,
                                                    {}
                                                )
                                            }
                                        >
                                            Click here to view books...
                                        </span>
                                    </li>
                                )}
                                {uniqueRecords.map((record: any) => (
                                    <li
                                        key={record.id!}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <p
                                            style={{
                                                fontSize: "16px",
                                                fontWeight: "300",
                                                lineHeight: "1.7",
                                            }}
                                        >
                                            {record.books.name}
                                        </p>
                                        <span
                                            style={{
                                                color: "blue",
                                                cursor: "pointer",
                                            }}
                                            onClick={() =>
                                                navigate(
                                                    `/admin/resources/books/records/${record.book_id}/ViewBook`,
                                                    {}
                                                )
                                            }
                                        >
                                            Click here to continue...
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <Loader />
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Dashboard;
