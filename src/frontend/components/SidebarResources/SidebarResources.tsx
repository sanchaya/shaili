import React, { FC, useState, useSyncExternalStore } from "react";
import { Navigation, Box, Icon } from "@adminjs/design-system";
import { ResourceJSON, useCurrentAdmin } from "adminjs";
import { useNavigate } from "react-router-dom";
import { styled } from "@adminjs/design-system/styled-components";
import { getSidebarCollapsed, subscribeSidebar } from "../Sidebar/SidebarContext.js";
import { usePermissions } from "../../hooks/usePermissions.js";
import { buildNavItems, isActive } from "../Sidebar/navItems.js";

export type SidebarResourceSectionProps = {
    resources: Array<ResourceJSON>;
    $collapsed?: boolean;
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

    const navItems = buildNavItems(resources, canAccess, currentAdmin?.role === 1);

    const toItem = (item): any => ({
        href: item.href,
        icon: item.icon,
        id: item.href,
        isSelected: isActive(item.href, location.pathname),
        label: item.label,
        onClick: (event) => {
            event.preventDefault();
            navigate(item.href);
        },
    });

    const manageItems = navItems.filter((i) => i.manage).map(toItem);
    // Collapsed rail can't show nested groups, so it lists everything flat.
    const mainItems: any[] = isCollapsed
        ? navItems.map(toItem)
        : navItems.filter((i) => !i.manage).map(toItem);

    if (!isCollapsed && manageItems.length) {
        mainItems.push({
            href: "#",
            icon: "Settings",
            id: "manage",
            isSelected: false,
            label: "Manage",
            elements: manageItems,
            isOpen: adminOpen || manageItems.some((i) => i.isSelected),
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
                        onClick={item.onClick}
                    >
                        <Icon icon={item.icon || "Circle"} size={20} />
                        <Tooltip className="tooltip">{item.label}</Tooltip>
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
