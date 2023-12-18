import { Box, BoxProps, Icon, cssClass } from "@adminjs/design-system";
import { styled } from "@adminjs/design-system/styled-components";
import { LoggedIn, ReduxState, Version } from "adminjs";
import React from "react";
import { useSelector } from "react-redux";
import SidebarBranding from "../SidebarBranding/SidebarBranding.js";

const NavBar = styled(Box)<BoxProps>`
    height: ${({ theme }) => theme.sizes.navbarHeight};
    border-bottom: ${({ theme }) => theme.borders.default};
    background: ${({ theme }) => theme.colors.container};
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    align-items: center;
    z-index: 99;
`;

NavBar.defaultProps = {
    className: cssClass("NavBar"),
};

type Props = {
    toggleSidebar: () => void;
};

const TopBar: React.FC<Props> = (props) => {
    const { toggleSidebar } = props;
    const session = useSelector((state: ReduxState) => state.session);
    const paths = useSelector((state: ReduxState) => state.paths);
    const versions = useSelector((state: ReduxState) => state.versions);
    const branding = useSelector((state: ReduxState) => state.branding);

    return (
        <NavBar data-css="topbar">
            <Box
                py="lg"
                px={["default", "lg"]}
                onClick={toggleSidebar}
                display={["block", "block", "flex", "flex", "flex"]}
                style={{ cursor: "pointer", alignItems: "center", gap: "15px" }}
            >
                <Icon icon="Menu" size={24} />
                <Box display={["none", "none", "block", "block", "block"]}>
                    <SidebarBranding branding={branding} />
                </Box>
            </Box>
            <Version versions={versions} />
            {session && session.email ? (
                <LoggedIn session={session} paths={paths} />
            ) : (
                ""
            )}
        </NavBar>
    );
};

export default TopBar;
