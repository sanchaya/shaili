import { Box, BoxProps, Icon, cssClass } from "@adminjs/design-system";
import { styled } from "@adminjs/design-system/styled-components";
import { LoggedIn, ReduxState, Version } from "adminjs";
import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useCurrentAdmin } from "adminjs";
import {
    getSidebarCollapsed,
    subscribeSidebar,
    toggleSidebar,
} from "../Sidebar/SidebarContext.js";
import { usePermissions } from "../../hooks/usePermissions.js";
import { buildNavItems, isActive } from "../Sidebar/navItems.js";

const NavBar = styled(Box)<BoxProps & { $collapsed: boolean }>`
    height: ${({ theme }) => theme.sizes.navbarHeight};
    border-bottom: ${({ theme }) => theme.borders.default};
    background: ${({ theme }) => theme.colors.container};
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    align-items: center;
    z-index: 99;
    margin-left: ${({ $collapsed }) => ($collapsed ? "60px" : "250px")};
    transition: margin-left 0.25s ease-in-out;
`;

NavBar.defaultProps = {
    className: cssClass("NavBar"),
};

const HamburgerButton = styled(Box)<{ $collapsed: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    width: ${({ $collapsed }) => ($collapsed ? "60px" : "250px")};
    height: ${({ theme }) => theme.sizes.navbarHeight};
    display: flex;
    align-items: center;
    z-index: 101;
    cursor: pointer;
    transition: width 0.25s ease-in-out;
    background: ${({ theme }) => theme.colors.container};
    border-right: ${({ theme }) => theme.borders.default};

    &:hover {
        background: transparent;
    }
`;

const HamburgerIcon = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 100%;
    flex-shrink: 0;
    border-right: ${({ theme }) => theme.borders.default};
`;

const LogoArea = styled(Box)`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    white-space: nowrap;

    & img {
        max-height: 32px;
        width: auto;
    }
`;

const BrandName = styled(Box)`
    font-family: "Baloo Kannada", sans-serif;
    font-size: 12px;
    color: #4a4a68;
    text-align: center;
    line-height: 1.2;
    margin-top: 2px;
`;

const MenuContainer = styled(Box)`
    position: fixed;
    top: 0;
    left: 0;
    z-index: 200;
`;

const DropdownMenu = styled(Box)<{ $visible: boolean }>`
    display: ${({ $visible }) => ($visible ? "block" : "none")};
    position: absolute;
    top: ${({ theme }) => theme.sizes.navbarHeight};
    left: 0;
    width: 260px;
    max-height: calc(100vh - ${({ theme }) => theme.sizes.navbarHeight});
    overflow-y: auto;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-top: none;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    z-index: 200;
    padding: 8px 0;
`;

const MenuItem = styled(Box)<{ $active?: boolean }>`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 14px;
    color: ${({ $active }) => ($active ? "#4361ee" : "#1a1a2e")};
    font-weight: ${({ $active }) => ($active ? "600" : "400")};
    background: ${({ $active }) => ($active ? "rgba(67, 97, 238, 0.08)" : "transparent")};
    transition: background 0.15s;

    &:hover {
        background: rgba(67, 97, 238, 0.08);
    }
`;

const MenuIcon = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    flex-shrink: 0;
    color: #4a4a68;
`;

const MenuDivider = styled(Box)`
    height: 1px;
    background: #e0e0e0;
    margin: 4px 0;
`;

const TopBar: React.FC = () => {
    const session = useSelector((state: ReduxState) => state.session);
    const versions = useSelector((state: ReduxState) => state.versions);
    const branding = useSelector((state: ReduxState) => state.branding);
    const resources = useSelector((state: ReduxState) => state.resources);
    const collapsed = useSyncExternalStore(subscribeSidebar, getSidebarCollapsed);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const [currentAdmin] = useCurrentAdmin();
    const menuRef = useRef<HTMLDivElement>(null);
    const { canAccess } = usePermissions(currentAdmin?.role || 0);


    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    const handleHamburgerClick = useCallback(() => {
        setMenuOpen((prev) => !prev);
    }, []);

    const handleMenuNavigate = useCallback((href: string, e: React.MouseEvent) => {
        e.preventDefault();
        setMenuOpen(false);
        navigate(href);
    }, [navigate]);

    const menuItems = buildNavItems(resources, canAccess, currentAdmin?.role === 1).map((item, i, all) => ({
        ...item,
        dividerAfter: !item.manage && all[i + 1]?.manage,
    }));

    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

    return (
        <>
            <MenuContainer ref={menuRef as any}>
                <HamburgerButton
                    $collapsed={collapsed}
                    onClick={handleHamburgerClick}
                    title="Menu"
                >
                    <HamburgerIcon>
                        <Icon icon="Menu" size={24} />
                    </HamburgerIcon>
                </HamburgerButton>
                <DropdownMenu $visible={menuOpen}>
                    {menuItems.map((item) => (
                        <React.Fragment key={item.href}>
                            <MenuItem
                                $active={isActive(item.href, currentPath)}
                                onMouseDown={(e: any) => handleMenuNavigate(item.href, e)}
                            >
                                <MenuIcon>
                                    <Icon icon={item.icon} size={18} />
                                </MenuIcon>
                                <span>{item.label}</span>
                            </MenuItem>
                            {item.dividerAfter && <MenuDivider />}
                        </React.Fragment>
                    ))}
                </DropdownMenu>
            </MenuContainer>
            <NavBar $collapsed={collapsed} data-css="topbar">
                <Box flex={1} />
                <LogoArea>
                    {branding.logo ? (
                        <img src={branding.logo} alt={branding.companyName} />
                    ) : (
                        <Box style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a2e" }}>
                            {branding.companyName}
                        </Box>
                    )}
                    <BrandName>ಶೈಲಿ ಸಂಚಯ</BrandName>
                </LogoArea>
                <Box flex={1} />
                <Version versions={versions} />
                {session && session.email ? (
                    <LoggedIn session={session} paths={{ logoutPath: "/admin/logout" }} />
                ) : (
                    ""
                )}
            </NavBar>
        </>
    );
};

export default TopBar;
