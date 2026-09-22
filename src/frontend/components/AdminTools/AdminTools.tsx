import React, { useEffect, useState } from "react";
import { styled } from "@adminjs/design-system/styled-components";
import axios from "axios";
import PermissionMatrix from "../PermissionMatrix/PermissionMatrix.js";
import {
    Box,
    Badge,
    Text,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
} from "@adminjs/design-system";

const BASE_URL = "/admin";

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
    padding: 20px;
`;

const StatCard = styled.div`
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    min-width: 120px;
    text-align: center;
`;

const Flex = styled.div<{$gap?: string}>`
    display: flex;
    ${({ $gap }) => ($gap ? `gap: ${$gap};` : "")}
    flex-wrap: wrap;
`;

const AdminTools = () => {
    const [userStats, setUserStats] = useState<any>(null);
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [backfillLoading, setBackfillLoading] = useState(false);
    const [backfillResult, setBackfillResult] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const [statsRes, pendingRes] = await Promise.all([
                axios.get(`${BASE_URL}/user-stats`),
                axios.get(`${BASE_URL}/pending-users`),
            ]);
            setUserStats(statsRes.data);
            setPendingUsers(pendingRes.data);
        } catch (err) {
            console.error("Failed to fetch admin data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleBackfillUnicode = async () => {
        setBackfillLoading(true);
        setBackfillResult(null);
        try {
            const res = await axios.post(`${BASE_URL}/backfill-unicode`);
            setBackfillResult(`Updated ${res.data.updated} letters (${res.data.skipped} already correct, ${res.data.total} total)`);
        } catch (err: any) {
            setBackfillResult(err.response?.data?.error || "Backfill failed");
        } finally {
            setBackfillLoading(false);
        }
    };

    const handleApprove = async (userId: number) => {
        try {
            await axios.post(`${BASE_URL}/approve-user`, { userId });
            setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
            fetchData();
        } catch (err) {
            console.error("Failed to approve user", err);
        }
    };

    const handleReject = async (userId: number) => {
        try {
            await axios.post(`${BASE_URL}/reject-user`, { userId });
            setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
        } catch (err) {
            console.error("Failed to reject user", err);
        }
    };

    if (loading) {
        return (
            <Box style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                <Text>Loading...</Text>
            </Box>
        );
    }

    return (
        <Box style={{ padding: "24px", maxWidth: "1200px" }}>
            <Text style={{ fontSize: "24px", fontWeight: 700, marginBottom: "24px" }}>Admin Tools</Text>

            <Flex $gap="24px" style={{ flexDirection: "column" }}>
                {/* Backfill Unicode */}
                <Card>
                    <CardHeader>Unicode Maintenance</CardHeader>
                    <CardBody>
                        <Flex $gap="12px" style={{ alignItems: "center" }}>
                            <Button
                                onClick={handleBackfillUnicode}
                                disabled={backfillLoading}
                                variant="primary"
                            >
                                {backfillLoading ? "Running..." : "Backfill Unicode"}
                            </Button>
                            {backfillResult && (
                                <Text>{backfillResult}</Text>
                            )}
                        </Flex>
                    </CardBody>
                </Card>

                {/* User Management */}
                <Card>
                    <CardHeader>User Management</CardHeader>
                    <CardBody>
                        {userStats && (
                            <Flex $gap="16px" style={{ marginBottom: "24px" }}>
                                <StatCard>
                                    <Text style={{ fontSize: "12px", color: "#6b7280" }}>Total Users</Text>
                                    <Text style={{ fontSize: "28px", fontWeight: 700 }}>{userStats.total}</Text>
                                </StatCard>
                                <StatCard>
                                    <Text style={{ fontSize: "12px", color: "#6b7280" }}>Active</Text>
                                    <Text style={{ fontSize: "28px", fontWeight: 700, color: "#16a34a" }}>{userStats.active}</Text>
                                </StatCard>
                                <StatCard>
                                    <Text style={{ fontSize: "12px", color: "#6b7280" }}>Pending</Text>
                                    <Text style={{ fontSize: "28px", fontWeight: 700, color: "#ca8a04" }}>{userStats.pending}</Text>
                                </StatCard>
                            </Flex>
                        )}

                        <Text style={{ fontWeight: 600, fontSize: "15px", marginBottom: "12px" }}>
                            Pending Signup Requests ({pendingUsers.length})
                        </Text>
                        {pendingUsers.length === 0 ? (
                            <Text style={{ color: "#6b7280" }}>No pending signup requests</Text>
                        ) : (
                            <Table style={{ width: "100%" }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Role</TableCell>
                                        <TableCell>Registered</TableCell>
                                        <TableCell style={{ textAlign: "right" }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pendingUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.name || "-"}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge>{user.user_role?.role || user.role}</Badge>
                                            </TableCell>
                                            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell style={{ textAlign: "right" }}>
                                                <Flex $gap="8px" style={{ justifyContent: "flex-end" }}>
                                                    <Button
                                                        onClick={() => handleApprove(user.id)}
                                                        variant="primary"
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleReject(user.id)}
                                                        variant="danger"
                                                    >
                                                        Reject
                                                    </Button>
                                                </Flex>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardBody>
                </Card>
                <PermissionMatrix />
            </Flex>
        </Box>
    );
};

export default AdminTools;
