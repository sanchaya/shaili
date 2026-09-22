import RolePermissions from "../db/models/RolePermissions.js";

const permissionCache = new Map<number, Map<string, Set<string>>>();
let cacheTimestamp = 0;
const CACHE_TTL = 30000; // 30 seconds

export const loadPermissions = async (roleId: number): Promise<Map<string, Set<string>>> => {
    const now = Date.now();
    if (permissionCache.has(roleId) && now - cacheTimestamp < CACHE_TTL) {
        return permissionCache.get(roleId)!;
    }

    const permissions = await RolePermissions.findAll({
        where: { role_id: roleId, allowed: true },
        raw: true,
    });

    const resourceActions = new Map<string, Set<string>>();
    for (const perm of permissions) {
        if (!resourceActions.has(perm.resource)) {
            resourceActions.set(perm.resource, new Set());
        }
        resourceActions.get(perm.resource)!.add(perm.action);
    }

    permissionCache.set(roleId, resourceActions);
    cacheTimestamp = now;
    return resourceActions;
};

export const canAccess = async (
    roleId: number,
    resource: string,
    action: string
): Promise<boolean> => {
    // Admin bypasses all permission checks
    if (roleId === 1) return true;

    const resourceActions = await loadPermissions(roleId);
    const actions = resourceActions.get(resource);
    return actions?.has(action) ?? false;
};

export const canAccessSync = (
    cachedPermissions: Map<string, Set<string>>,
    resource: string,
    action: string
): boolean => {
    const actions = cachedPermissions.get(resource);
    return actions?.has(action) ?? false;
};

export const clearPermissionCache = (roleId?: number) => {
    if (roleId) {
        permissionCache.delete(roleId);
    } else {
        permissionCache.clear();
    }
    cacheTimestamp = 0;
};
