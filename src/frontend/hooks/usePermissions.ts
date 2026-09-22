import { useState, useEffect, useCallback } from "react";

interface PermissionMap {
    [resource: string]: Set<string>;
}

let cachedPermissions: PermissionMap | null = null;
let cacheRoleId: number | null = null;

export const usePermissions = (roleId: number) => {
    const [permissions, setPermissions] = useState<PermissionMap>(
        cachedPermissions && cacheRoleId === roleId ? cachedPermissions : {}
    );

    useEffect(() => {
        if (cachedPermissions && cacheRoleId === roleId) {
            setPermissions(cachedPermissions);
            return;
        }

        const BASE_URL = (window as any).AdminJS.env.BASE_URL;
        fetch(`${BASE_URL}/get-permissions`, {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                const map: PermissionMap = {};
                if (Array.isArray(data)) {
                    data.forEach((p: any) => {
                        if (p.allowed) {
                            if (!map[p.resource]) map[p.resource] = new Set();
                            map[p.resource].add(p.action);
                        }
                    });
                }
                cachedPermissions = map;
                cacheRoleId = roleId;
                setPermissions(map);
            })
            .catch(() => {});
    }, [roleId]);

    const canAccess = useCallback(
        (resource: string, action: string): boolean => {
            if (roleId === 1) return true;
            return permissions[resource]?.has(action) ?? false;
        },
        [permissions, roleId]
    );

    return { permissions, canAccess };
};

export const clearPermissionsCache = () => {
    cachedPermissions = null;
    cacheRoleId = null;
};
