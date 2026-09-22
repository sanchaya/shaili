// Single source of truth for Sidebar + TopBar menus.
export type NavItem = { icon: string; label: string; href: string; manage?: boolean };

const WORK: Array<[string | null, string, string, string]> = [
    [null, "Home", "Dashboard", "/admin"],
    ["books", "Book", "Books", "/admin/resources/books"],
    [null, "BookOpen", "Book Comparison", "/admin/pages/compare"],
    ["letters", "Feather", "Letters", "/admin/resources/letters"],
    ["languages", "Globe", "Languages", "/admin/resources/languages"],
    ["comments", "MessageSquare", "Comments", "/admin/resources/comments"],
];

const MANAGE: Array<[string, string, string]> = [
    ["users", "Users", "Users"],
    ["letter_types", "Type", "Letter Types"],
    ["book_status", "CheckCircle", "Book Status"],
    ["user_roles", "Shield", "User Roles"],
    ["role_permissions", "Key", "Role Permissions"],
];

export const buildNavItems = (
    resources: Array<{ name: string }>,
    canAccess: (resource: string, action: string) => boolean,
    isAdmin: boolean
): NavItem[] => {
    const has = (r: string) => resources.some((x) => x.name === r) && canAccess(r, "list");
    const items: NavItem[] = WORK.filter(([r]) => !r || has(r)).map(([, icon, label, href]) => ({ icon, label, href }));
    MANAGE.filter(([r]) => has(r)).forEach(([r, icon, label]) =>
        items.push({ icon, label, href: `/admin/resources/${r}`, manage: true })
    );
    if (isAdmin) items.push({ icon: "Settings", label: "Admin Tools", href: "/admin/pages/admin", manage: true });
    return items;
};

// Dashboard is exact-match; everything else highlights on sub-pages too (e.g. a book's ViewBook page).
export const isActive = (href: string, pathname: string) =>
    href === "/admin" ? pathname === href || pathname === "/admin/" : pathname.startsWith(href);
