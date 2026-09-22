import { Box, BoxProps, Icon, cssClass } from "@adminjs/design-system";
import { styled } from "@adminjs/design-system/styled-components";
import { LoggedIn, ReduxState, Version } from "adminjs";
import React from "react";
import { useSelector } from "react-redux";
import SidebarBranding from "../SidebarBranding/SidebarBranding.js";
import { SidebarContext } from "../Sidebar/SidebarContext.js";

const NavBar = styled(Box)<BoxProps & { $sidebarCollapsed: boolean }>`
    height: ${({ theme }) => theme.sizes.navbarHeight};
    border-bottom: ${({ theme }) => theme.borders.default};
    background: ${({ theme }) => theme.colors.container};
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    align-items: center;
    z-index: 99;
    margin-left: ${({ $sidebarCollapsed }) => ($sidebarCollapsed ? "60px" : "250px")};
    transition: margin-left 0.25s ease-in-out;
`;

const LogoBox = styled(Box)<BoxProps>`
    padding: 0px 8px 0px 8px;
    display: flex;
    align-items: center;
    gap: 15px;
    cursor: pointer;
`;

NavBar.defaultProps = {
    className: cssClass("NavBar"),
};

const TopBar: React.FC = () => {
    const session = useSelector((state: ReduxState) => state.session);
    const versions = useSelector((state: ReduxState) => state.versions);
    const branding = useSelector((state: ReduxState) => state.branding);
    const { collapsed, toggleCollapse } = React.useContext(SidebarContext);

    return (
        <NavBar $sidebarCollapsed={collapsed} data-css="topbar">
            <LogoBox
                py="lg"
                px={["default", "lg"]}
                onClick={toggleCollapse}
                display={["block", "block", "flex", "flex", "flex"]}
            >
                <Icon icon="Menu" size={24} />
                <Box display={collapsed ? "none" : ["none", "none", "block", "block", "block"]}>
                    <SidebarBranding branding={branding} />
                </Box>
            </LogoBox>
            <Version versions={versions} />
            {session && session.email ? (
                <LoggedIn session={session} paths={{ logoutPath: "/admin/logout" }} />
            ) : (
                ""
            )}
        </NavBar>
    );
};

export default TopBar;
