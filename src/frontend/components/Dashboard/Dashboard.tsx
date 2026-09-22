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

const Flex = styled.div<{$justify?: string; $align?: string; $gap?: string; $wrap?: boolean}>`
    display: flex;
    ${({ $justify, $align, $gap, $wrap }) => `
        ${$justify ? `justify-content: ${$justify};` : ''}
        ${$align ? `align-items: ${$align};` : ''}
        ${$gap ? `gap: ${$gap};` : ''}
        ${$wrap ? `flex-wrap: wrap;` : ''}
    `}
`;

interface IDashboardStats {
    summary: {
        total_languages: number;
        total_letter_types: number;
        total_letters: number;
        total_books: number;
    };
    books_by_status: Array<{ status_id: number; status: string; count: number }>;
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

interface IUserStats {
    total: number;
    active: number;
    pending: number;
    roleBreakdown: Array<{ id: number; role: string; count: number }>;
}

interface IPendingUser {
    id: number;
    name: string;
    email: string;
    role: number;
    created_at: string;
    user_role?: { role: string };
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
    const [userStats, setUserStats] = useState<IUserStats | null>(null);
    const [pendingUsers, setPendingUsers] = useState<IPendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAllLangs, setShowAllLangs] = useState(false);
    const [backfilling, setBackfilling] = useState(false);
    const [backfillResult, setBackfillResult] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const [statsRes, userStatsRes, pendingRes] = await Promise.all([
                    axios.get(`${BASE_URL}/dashboard-stats`),
                    axios.get(`${BASE_URL}/user-stats`),
                    axios.get(`${BASE_URL}/pending-users`),
                ]);
                setStats(statsRes.data);
                setUserStats(userStatsRes.data);
                setPendingUsers(pendingRes.data);
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

    const langNameMap = Object.fromEntries(
        stats.languages.map((l) => [l.language_code, l.language])
    );

    return (
        <Box style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
            <Flex $justify="space-between" $align="center" style={{ marginBottom: '32px' }}>
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

            <Flex $gap="xl" style={{ marginBottom: '32px' }} $wrap>
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
                                    <TableRow key={idx} onClick={() => navigate(`/admin/resources/books?filters.status=${item.status_id}`)} style={{ cursor: 'pointer' }}>
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
                                {stats.books_by_language.slice(0, showAllLangs ? 10 : 3).map((item, idx) => (
                                    <TableRow key={idx} onClick={() => navigate(`/admin/resources/books?filters.language=${item.language}`)} style={{ cursor: 'pointer' }}>
                                        <TableCell>
                                            <Flex $align="center" $gap="sm">
                                                <Badge variant="secondary">{langNameMap[item.language] || item.language}</Badge>
                                            </Flex>
                                        </TableCell>
                                        <TableCell style={{ textAlign: 'right', fontWeight: 600 }}>
                                            {formatNumber(item.count)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {stats.books_by_language.length > 3 && (
                            <Box style={{ padding: '8px 12px', textAlign: 'center' }}>
                                <Text
                                    size="sm"
                                    style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 500 }}
                                    onClick={() => setShowAllLangs(!showAllLangs)}
                                >
                                    {showAllLangs ? 'Show less' : `Show all (${stats.books_by_language.length})`}
                                </Text>
                            </Box>
                        )}
                    </CardBody>
                </Card>
            </Flex>

            <Flex $gap="xl" $wrap>
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
                                                <Flex $align="center" $gap="sm">
                                                    <Text weight="medium" style={{ maxWidth: '250px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                        {book.name}
                                                    </Text>
                                                    <Badge variant="secondary" style={{ cursor: 'pointer', fontSize: '12px' }} onClick={() => navigate(`/admin/resources/books/records/${book.id}/ViewBook`)}>
                                                        View
                                                    </Badge>
                                                </Flex>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{book.language}</Badge>
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
                                        <TableRow key={idx} onClick={() => navigate(`/admin/resources/letters?filters.language=${lang.language_code}`)} style={{ cursor: 'pointer' }}>
                                            <TableCell>
                                                <Flex $align="center" $gap="sm">
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

            {/* Admin Tools */}
            <Card style={{ marginTop: '32px' }}>
                <CardHeader>Admin Tools</CardHeader>
                <CardBody>
                    <Box style={{ padding: '24px' }}>
                        {/* Backfill Unicode */}
                        <Flex $align="center" $gap="lg" $wrap style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
                            <div>
                                <Text weight="bold" style={{ fontSize: '14px', marginBottom: '4px' }}>
                                    Backfill Unicode Code Points
                                </Text>
                                <Text size="sm" color="secondary">
                                    Updates the unicode value for all letters based on their character.
                                </Text>
                            </div>
                            <button
                                disabled={backfilling}
                                onClick={async () => {
                                    setBackfilling(true);
                                    setBackfillResult(null);
                                    try {
                                        const res = await axios.post(`${BASE_URL}/backfill-unicode`);
                                        setBackfillResult(`Updated ${res.data.updated} letters (${res.data.skipped} already correct, ${res.data.total} total)`);
                                    } catch (err) {
                                        setBackfillResult('Failed to backfill unicode values');
                                    } finally {
                                        setBackfilling(false);
                                    }
                                }}
                                style={{
                                    padding: '10px 20px',
                                    background: backfilling ? '#9ca3af' : '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: backfilling ? 'not-allowed' : 'pointer',
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {backfilling ? 'Running...' : 'Backfill Unicode'}
                            </button>
                            {backfillResult && (
                                <Text size="sm" style={{ color: backfillResult.startsWith('Failed') ? '#ef4444' : '#059669' }}>
                                    {backfillResult}
                                </Text>
                            )}
                        </Flex>

                        {/* User Management */}
                        <div>
                            <Text weight="bold" style={{ fontSize: '16px', marginBottom: '16px' }}>
                                User Management
                            </Text>

                            {userStats && (
                                <Flex $gap="lg" $wrap style={{ marginBottom: '20px' }}>
                                    <div style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: '8px', minWidth: '120px' }}>
                                        <Text size="sm" color="secondary">Total Users</Text>
                                        <Text weight="bold" style={{ fontSize: '24px' }}>{userStats.total}</Text>
                                    </div>
                                    <div style={{ padding: '12px 16px', background: '#f0fdf4', borderRadius: '8px', minWidth: '120px' }}>
                                        <Text size="sm" color="secondary">Active</Text>
                                        <Text weight="bold" style={{ fontSize: '24px', color: '#059669' }}>{userStats.active}</Text>
                                    </div>
                                    <div style={{ padding: '12px 16px', background: '#fef3c7', borderRadius: '8px', minWidth: '120px' }}>
                                        <Text size="sm" color="secondary">Pending Approval</Text>
                                        <Text weight="bold" style={{ fontSize: '24px', color: '#d97706' }}>{userStats.pending}</Text>
                                    </div>
                                    {userStats.roleBreakdown.map((r) => (
                                        <div key={r.id} style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: '8px', minWidth: '120px' }}>
                                            <Text size="sm" color="secondary">{r.role}</Text>
                                            <Text weight="bold" style={{ fontSize: '24px' }}>{r.count}</Text>
                                        </div>
                                    ))}
                                </Flex>
                            )}

                            {pendingUsers.length > 0 && (
                                <div>
                                    <Text weight="bold" style={{ fontSize: '14px', marginBottom: '12px', color: '#d97706' }}>
                                        Pending Signup Requests ({pendingUsers.length})
                                    </Text>
                                    <Table style={{ width: '100%' }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Email</TableCell>
                                                <TableCell>Role</TableCell>
                                                <TableCell>Requested</TableCell>
                                                <TableCell style={{ textAlign: 'right' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {pendingUsers.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell><Text weight="medium">{user.name}</Text></TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell><Badge variant="secondary">{user.user_role?.role || 'Unknown'}</Badge></TableCell>
                                                    <TableCell style={{ fontSize: '12px', color: '#6b7280' }}>
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell style={{ textAlign: 'right' }}>
                                                        <Flex $gap="sm" $justify="end">
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        await axios.post(`${BASE_URL}/approve-user`, { userId: user.id });
                                                                        setPendingUsers(pendingUsers.filter(u => u.id !== user.id));
                                                                        if (userStats) setUserStats({ ...userStats, pending: userStats.pending - 1, active: userStats.active + 1 });
                                                                    } catch (err) {
                                                                        console.error(err);
                                                                    }
                                                                }}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    background: '#059669',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '12px',
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (!confirm(`Reject ${user.name}? This will delete their account.`)) return;
                                                                    try {
                                                                        await axios.post(`${BASE_URL}/reject-user`, { userId: user.id });
                                                                        setPendingUsers(pendingUsers.filter(u => u.id !== user.id));
                                                                        if (userStats) setUserStats({ ...userStats, pending: userStats.pending - 1, total: userStats.total - 1 });
                                                                    } catch (err) {
                                                                        console.error(err);
                                                                    }
                                                                }}
                                                                style={{
                                                                    padding: '6px 12px',
                                                                    background: '#ef4444',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    fontSize: '12px',
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                Reject
                                                            </button>
                                                        </Flex>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {pendingUsers.length === 0 && (
                                <Text size="sm" color="secondary" style={{ padding: '12px 0' }}>
                                    No pending signup requests.
                                </Text>
                            )}

                            <Box style={{ marginTop: '16px' }}>
                                <Text
                                    size="sm"
                                    style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 500 }}
                                    onClick={() => navigate('/admin/resources/users')}
                                >
                                    Manage all users →
                                </Text>
                            </Box>
                        </div>
                    </Box>
                </CardBody>
            </Card>

            {/* Contributing Section */}
            <Card style={{ marginTop: '32px' }}>
                <CardHeader style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    Contribute to Type Extract
                </CardHeader>
                <CardBody>
                    <Box style={{ padding: '24px' }}>
                        <Flex $justify="space-between" $align="center" $wrap $gap="lg">
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
                                href="https://github.com/sanchaya/shaili"
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
