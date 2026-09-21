import React, { useEffect, useState } from "react";
import { styled } from "@adminjs/design-system/styled-components";
import axios from "axios";
import { useCurrentAdmin } from "adminjs";
import { useNavigate } from "react-router-dom";
import { Box, Loader, Badge, Text, Table, TableBody, TableCell, TableHead, TableRow } from "@adminjs/design-system";

const DashboardContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
`;

const DashboardItem = styled.div`
    flex: 1;
    min-width: 200px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`;

const StatValue = styled.div`
    font-size: 36px;
    font-weight: 700;
    color: #111827;
    line-height: 1.2;
`;

const StatLabel = styled.div`
    font-size: 14px;
    color: #6b7280;
    margin-top: 4px;
    font-weight: 500;
`;

const StatTrend = styled.div`
    font-size: 12px;
    color: #059669;
    margin-top: 8px;
`;

const Card = styled.div`
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
`;

const CardHeader = styled.div`
    padding: 16px 20px;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
    font-weight: 600;
    font-size: 16px;
`;

const CardBody = styled.div`
    padding: 0;
`;

const Flex = styled.div`
    display: flex;
    ${({ justify, align, gap, wrap }) => `
        ${justify ? `justify-content: ${justify};` : ''}
        ${align ? `align-items: ${align};` : ''}
        ${gap ? `gap: ${gap};` : ''}
        ${wrap ? `flex-wrap: wrap;` : ''}
    `}
`;

interface IDashboardStats {
    summary: {
        total_languages: number;
        total_letter_types: number;
        total_letters: number;
        total_books: number;
    };
    books_by_status: Array<{ status: string; count: number }>;
    books_by_language: Array<{ language: string; count: number }>;
    recent_books: Array<{ id: number; name: string; language: string; status: number; created_at: string }>;
    languages: Array<{
        language_code: string;
        language: string;
        native_name: string;
        script: string;
        letter_types_count: number;
        letters_count: number;
        books_count: number;
    }>;
}

interface IBook {
    id: number;
    name: string;
    status: number;
    language: string;
    created_at: string;
}

const Dashboard = () => {
    const BASE_URL = (window as any).AdminJS?.env?.BASE_URL || '';
    const [stats, setStats] = useState<IDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BASE_URL}/dashboard-stats`);
                setStats(response.data);
            } catch (err) {
                setError('Failed to load dashboard statistics');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [BASE_URL]);

    if (loading) {
        return (
            <Box style={{ padding: '40px', textAlign: 'center' }}>
                <Loader />
                <Text mt="md" color="secondary">Loading dashboard...</Text>
            </Box>
        );
    }

    if (error) {
        return (
            <Box style={{ padding: '40px', textAlign: 'center' }}>
                <Text color="error">{error}</Text>
            </Box>
        );
    }

    if (!stats) {
        return <Box>No data available</Box>;
    }

    const formatNumber = (num: number) => num.toLocaleString();

    return (
        <Box style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
            <Flex justify="space-between" align="center" style={{ marginBottom: '32px' }}>
                <Text weight="bold" style={{ fontSize: '24px' }}>Dashboard</Text>
                <Text size="sm" color="secondary">
                    Last updated: {new Date().toLocaleString()}
                </Text>
            </Flex>

            {/* Summary Cards */}
            <DashboardContainer style={{ marginBottom: '32px' }}>
                <DashboardItem>
                    <StatValue>{formatNumber(stats.summary.total_languages)}</StatValue>
                    <StatLabel>Languages</StatLabel>
                    <StatTrend>{stats.languages.filter(l => l.letter_types_count > 0).length} with letter types</StatTrend>
                </DashboardItem>
                <DashboardItem>
                    <StatValue>{formatNumber(stats.summary.total_letter_types)}</StatValue>
                    <StatLabel>Letter Types</StatLabel>
                    <StatTrend>Avg {Math.round(stats.summary.total_letter_types / stats.summary.total_languages)} per language</StatTrend>
                </DashboardItem>
                <DashboardItem>
                    <StatValue>{formatNumber(stats.summary.total_letters)}</StatValue>
                    <StatLabel>Total Letters</StatLabel>
                    <StatTrend>Across all languages</StatTrend>
                </DashboardItem>
                <DashboardItem>
                    <StatValue>{formatNumber(stats.summary.total_books)}</StatValue>
                    <StatLabel>Total Books</StatLabel>
                    <StatTrend>{stats.books_by_status.reduce((a, b) => a + b.count, 0)} indexed</StatTrend>
                </DashboardItem>
            </DashboardContainer>

            <Flex gap="xl" style={{ marginBottom: '32px' }} wrap>
                {/* Books by Status */}
                <Card style={{ flex: 1, minWidth: '300px' }}>
                    <CardHeader>Books by Status</CardHeader>
                    <CardBody>
                        <Table style={{ width: '100%' }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Status</TableCell>
                                    <TableCell style={{ textAlign: 'right' }}>Count</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stats.books_by_status.map((item, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>
                                            <Badge variant="info" style={{ marginRight: '8px' }}>{item.status}</Badge>
                                        </TableCell>
                                        <TableCell style={{ textAlign: 'right', fontWeight: 600 }}>
                                            {formatNumber(item.count)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell style={{ fontWeight: 600 }}>Total</TableCell>
                                    <TableCell style={{ textAlign: 'right', fontWeight: 700 }}>
                                        {formatNumber(stats.books_by_status.reduce((a, b) => a + b.count, 0))}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>

                {/* Top Languages by Books */}
                <Card style={{ flex: 1, minWidth: '300px' }}>
                    <CardHeader>Top Languages by Books</CardHeader>
                    <CardBody>
                        <Table style={{ width: '100%' }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Language</TableCell>
                                    <TableCell style={{ textAlign: 'right' }}>Books</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stats.books_by_language.slice(0, 8).map((item, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>
                                            <Flex align="center" gap="sm">
                                                <Badge variant="primary">{item.language}</Badge>
                                            </Flex>
                                        </TableCell>
                                        <TableCell style={{ textAlign: 'right', fontWeight: 600 }}>
                                            {formatNumber(item.count)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </Flex>

            <Flex gap="xl" wrap>
                {/* Recently Added Books */}
                <Card style={{ flex: 1, minWidth: '400px', flexGrow: 1 }}>
                    <CardHeader>Recently Added Books</CardHeader>
                    <CardBody>
                        <Table style={{ width: '100%' }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Language</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell style={{ width: '150px' }}>Added</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stats.recent_books.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                                            <Text color="secondary">No books added yet</Text>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    stats.recent_books.map((book, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>
                                                <Flex align="center" gap="sm">
                                                    <Text weight="medium" style={{ maxWidth: '250px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                        {book.name}
                                                    </Text>
                                                    <Badge variant="secondary" style={{ cursor: 'pointer', fontSize: '12px' }} onClick={() => navigate(`/admin/resources/books/records/${book.id}/ViewBook`)}>
                                                        View
                                                    </Badge>
                                                </Flex>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="primary">{book.language}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="info">{book.status}</Badge>
                                            </TableCell>
                                            <TableCell style={{ color: '#6b7280', fontSize: '12px' }}>
                                                {new Date(book.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>

                {/* Languages Overview */}
                <Card style={{ flex: 1, minWidth: '400px', flexGrow: 1 }}>
                    <CardHeader>Languages Overview</CardHeader>
                    <CardBody style={{ maxHeight: '400px', overflow: 'auto' }}>
                        <Table style={{ width: '100%' }}>
                            <TableHead>
                                <TableRow style={{ position: 'sticky', top: 0, background: '#fff' }}>
                                    <TableCell>Language</TableCell>
                                    <TableCell>Script</TableCell>
                                    <TableCell style={{ textAlign: 'right' }}>Letter Types</TableCell>
                                    <TableCell style={{ textAlign: 'right' }}>Letters</TableCell>
                                    <TableCell style={{ textAlign: 'right' }}>Books</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stats.languages
                                    .filter(l => l.letter_types_count > 0 || l.letters_count > 0 || l.books_count > 0)
                                    .sort((a, b) => b.books_count - a.books_count)
                                    .slice(0, 15)
                                    .map((lang, idx) => (
                                        <TableRow key={idx} onClick={() => navigate(`/admin/resources/languages/records/${lang.language_code}`)} style={{ cursor: 'pointer' }}>
                                            <TableCell>
                                                <Flex align="center" gap="sm">
                                                    <Text weight="medium">{lang.language}</Text>
                                                    <Text size="xs" color="secondary">({lang.language_code})</Text>
                                                </Flex>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" style={{ fontSize: '12px' }}>{lang.script || '-'}</Badge>
                                            </TableCell>
                                            <TableCell style={{ textAlign: 'right', fontWeight: 500 }}>
                                                {formatNumber(lang.letter_types_count)}
                                            </TableCell>
                                            <TableCell style={{ textAlign: 'right', fontWeight: 500 }}>
                                                {formatNumber(lang.letters_count)}
                                            </TableCell>
                                            <TableCell style={{ textAlign: 'right', fontWeight: 500 }}>
                                                {formatNumber(lang.books_count)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </Flex>

            {/* Contributing Section */}
            <Card style={{ marginTop: '32px' }}>
                <CardHeader style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    Contribute to Type Extract
                </CardHeader>
                <CardBody>
                    <Box style={{ padding: '24px' }}>
                        <Flex justify="space-between" align="center" wrap gap="lg">
                            <div>
                                <Text weight="bold" style={{ fontSize: '16px', marginBottom: '8px' }}>
                                    Help us improve Indian language text extraction
                                </Text>
                                <Text size="sm" color="secondary" style={{ maxWidth: '600px' }}>
                                    Type Extract is an open-source project. We welcome contributions of all kinds -
                                    bug fixes, new features, documentation, and more. Check out our GitHub repository
                                    to get started.
                                </Text>
                            </div>
                            <a
                                href="https://github.com/ravenanhq/type-extract"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 24px',
                                    background: '#24292e',
                                    color: 'white',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <svg height="20" width="20" viewBox="0 0 16 16" fill="white">
                                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                                </svg>
                                View on GitHub
                            </a>
                        </Flex>
                    </Box>
                </CardBody>
            </Card>
        </Box>
    );
};

export default Dashboard;
