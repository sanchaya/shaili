import React, { FC, useState, useSyncExternalStore } from "react";
import { Navigation, Box, Icon } from "@adminjs/design-system";
import { ResourceJSON, useCurrentAdmin } from "adminjs";
import { useNavigate } from "react-router-dom";
import { styled } from "@adminjs/design-system/styled-components";
import { getSidebarCollapsed, subscribeSidebar } from "../Sidebar/SidebarContext.js";
import { usePermissions } from "../../hooks/usePermissions.js";

export type SidebarResourceSectionProps = {
    resources: Array<ResourceJSON>;
    $collapsed?: boolean;
};

const isSelected = (href, location) => {
    return location.pathname === href;
};

const CustomNavigation = styled(Navigation)<{ $collapsed?: boolean }>`
    padding: ${({ $collapsed }) => ($collapsed ? "40px 0" : "40px")};
    width: 100%;
`;

const TooltipWrapper = styled(Box)`
    position: relative;

    &:hover .tooltip {
        display: block;
    }
`;

const Tooltip = styled(Box)`
    display: none;
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: 8px;
    background: #1f2937;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 100;
    pointer-events: none;
`;

const SidebarResources: FC<SidebarResourceSectionProps> = ({ resources, $collapsed }) => {
    const navigate = useNavigate();
    const [currentAdmin] = useCurrentAdmin();
    const [adminOpen, setAdminOpen] = useState(false);
    const contextCollapsed = useSyncExternalStore(subscribeSidebar, getSidebarCollapsed);
    const isCollapsed = $collapsed ?? contextCollapsed;
    const { canAccess } = usePermissions(currentAdmin?.role || 0);

    const isAdmin = currentAdmin?.role === 1;

    const makeItem = (href: string, icon: string, label: string, id: string): any => ({
        href,
        icon,
        id,
        isSelected: isSelected(href, location),
        label: isCollapsed ? "" : label,
        onClick: (event) => {
            event.preventDefault();
            navigate(href);
        },
    });

    const resourceMap = {};
    resources.forEach((r) => {
        resourceMap[r.name] = r;
    });

    const booksResource = resourceMap["books"];
    const lettersResource = resourceMap["letters"];
    const languagesResource = resourceMap["languages"];
    const commentsResource = resourceMap["comments"];
    const usersResource = resourceMap["users"];
    const userRolesResource = resourceMap["user_roles"];
    const letterTypesResource = resourceMap["letter_types"];
    const bookStatusResource = resourceMap["book_status"];

    const makeResourceItem = (r: any): any => ({
        href: `/admin/resources/${r.name}`,
        icon: "Circle",
        id: r.name,
        isSelected: isSelected(`/admin/resources/${r.name}`, location),
        label: isCollapsed ? "" : r.name?.charAt(0).toUpperCase() + r.name?.slice(1),
        onClick: (event) => {
            event.preventDefault();
            navigate(`/admin/resources/${r.name}`);
        },
    });

    const mainItems: any[] = [
        makeItem("/admin", "Home", "Dashboard", "dashboard"),
    ];

    if (booksResource && canAccess("books", "list")) mainItems.push(makeResourceItem(booksResource));
    if (lettersResource && canAccess("letters", "list")) mainItems.push(makeResourceItem(lettersResource));
    if (languagesResource && canAccess("languages", "list")) mainItems.push(makeResourceItem(languagesResource));
    if (commentsResource && canAccess("comments", "list")) mainItems.push(makeResourceItem(commentsResource));

    mainItems.push(makeItem("/admin/pages/compare", "BookOpen", "Book Comparison", "comparison"));

    if (isAdmin) {
        const adminSubItems: any[] = [];
        if (usersResource && canAccess("users", "list")) adminSubItems.push(makeResourceItem(usersResource));
        if (userRolesResource && canAccess("user_roles", "list")) adminSubItems.push(makeResourceItem(userRolesResource));
        if (resourceMap["role_permissions"] && canAccess("role_permissions", "list")) adminSubItems.push(makeResourceItem(resourceMap["role_permissions"]));
        if (letterTypesResource && canAccess("letter_types", "list")) adminSubItems.push(makeResourceItem(letterTypesResource));
        if (bookStatusResource && canAccess("book_status", "list")) adminSubItems.push(makeResourceItem(bookStatusResource));
        adminSubItems.push(makeItem("/admin/pages/admin", "Settings", "Admin Tools Page", "admin-tools-page"));

        mainItems.push({
            href: "#",
            icon: "Settings",
            id: "admin-tools",
            isSelected: false,
            label: isCollapsed ? "" : "Admin Tools",
            elements: adminSubItems,
            isOpen: adminOpen,
            onClick: (event) => {
                event.preventDefault();
                setAdminOpen((prev) => !prev);
            },
        });
    }

    if (isCollapsed) {
        return (
            <Box style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "8px 0" }}>
                {mainItems.map((item) => (
                    <TooltipWrapper key={item.id} style={{ position: "relative", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", cursor: "pointer", background: item.isSelected ? "rgba(0,0,0,0.05)" : "transparent" }}
                        onClick={(e) => {
                            e.preventDefault();
                            if (item.elements) {
                                setAdminOpen((prev) => !prev);
                            } else if (item.onClick) {
                                item.onClick(e);
                            }
                        }}
                    >
                        <Icon icon={item.icon || "Circle"} size={20} />
                        <Tooltip className="tooltip">{item.label || item.id}</Tooltip>
                    </TooltipWrapper>
                ))}
            </Box>
        );
    }

    return (
        <CustomNavigation $collapsed={isCollapsed} elements={mainItems} />
    );
};

export default SidebarResources;
