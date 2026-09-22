import React, { useEffect, useState } from "react";
import { styled } from "@adminjs/design-system/styled-components";
import axios from "axios";
import { Text, Table, TableBody, TableCell, TableHead, TableRow } from "@adminjs/design-system";

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

const Flex = styled.div<{$gap?: string}>`
    display: flex;
    ${({ $gap }) => ($gap ? `gap: ${$gap};` : "")}
    flex-wrap: wrap;
`;

const RESOURCES = ["books", "letters", "languages", "letter_types", "book_status", "comments", "users"];
const ACTIONS = ["list", "show", "new", "edit", "delete", "import", "export"];

const PermissionMatrix = () => {
    const [roles, setRoles] = useState<any[]>([]);
    const [perms, setPerms] = useState<Set<string>>(new Set());
    const [roleId, setRoleId] = useState<number | null>(null);
    const key = (r: number, res: string, a: string) => `${r}:${res}:${a}`;

    useEffect(() => {
        axios.get(`${BASE_URL}/role-permissions-matrix`).then(({ data }) => {
            const nonAdmin = data.roles.filter((r) => r.id !== 1);
            setRoles(nonAdmin);
            setRoleId(nonAdmin[0]?.id ?? null);
            setPerms(new Set(data.permissions.filter((p) => p.allowed).map((p) => key(p.role_id, p.resource, p.action))));
        });
    }, []);

    const toggle = async (resource: string, action: string) => {
        const k = key(roleId!, resource, action);
        const allowed = !perms.has(k);
        await axios.post(`${BASE_URL}/role-permissions-matrix`, { role_id: roleId, resource, action, allowed });
        setPerms((prev) => {
            const next = new Set(prev);
            allowed ? next.add(k) : next.delete(k);
            return next;
        });
    };

    return (
        <Card>
            <CardHeader>Role Permissions</CardHeader>
            <CardBody>
                <Flex $gap="12px" style={{ alignItems: "center", marginBottom: "16px" }}>
                    <label htmlFor="perm-role">Role</label>
                    <select id="perm-role" value={roleId ?? ""} onChange={(e) => setRoleId(Number(e.target.value))}>
                        {roles.map((r) => <option key={r.id} value={r.id}>{r.role}</option>)}
                    </select>
                    <Text style={{ color: "#6b7280", fontSize: "13px" }}>Admin always has full access. Changes apply on the user's next page load.</Text>
                </Flex>
                <div style={{ overflowX: "auto" }}>
                    <Table style={{ width: "100%" }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Resource</TableCell>
                                {ACTIONS.map((a) => <TableCell key={a} style={{ textAlign: "center" }}>{a}</TableCell>)}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {RESOURCES.map((res) => (
                                <TableRow key={res}>
                                    <TableCell>{res.replace("_", " ")}</TableCell>
                                    {ACTIONS.map((a) => (
                                        <TableCell key={a} style={{ textAlign: "center" }}>
                                            <input
                                                type="checkbox"
                                                aria-label={`${res} ${a}`}
                                                disabled={!roleId}
                                                checked={perms.has(key(roleId!, res, a))}
                                                onChange={() => toggle(res, a)}
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardBody>
        </Card>
    );
};

export default PermissionMatrix;
