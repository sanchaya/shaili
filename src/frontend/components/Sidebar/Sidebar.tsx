import { Box, BoxProps, Icon, cssClass } from "@adminjs/design-system";
import { styled } from "@adminjs/design-system/styled-components";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { ReduxState } from "adminjs";
import SidebarResources from "../SidebarResources/SidebarResources.js";
import { SidebarContext } from "./SidebarContext.js";

export const SIDEBAR_Z_INDEX = 50;

const SIDEBAR_WIDTH = 250;
const SIDEBAR_COLLAPSED_WIDTH = 60;

const StyledSidebar = styled(Box)<BoxProps & { $collapsed: boolean }>`
    top: 0;
    bottom: 0;
    overflow-y: auto;
    overflow-x: hidden;
    width: ${({ $collapsed }) => ($collapsed ? `${SIDEBAR_COLLAPSED_WIDTH}px` : `${SIDEBAR_WIDTH}px`)};
    border-right: ${({ theme }) => theme.borders.default};
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    z-index: ${SIDEBAR_Z_INDEX};
    background: ${({ theme }) => theme.colors.sidebar};
    transition: width 0.25s ease-in-out;
`;

StyledSidebar.defaultProps = {
    position: ["absolute", "absolute", "absolute", "absolute", "absolute"],
};

const CustomSidebarResources = styled(SidebarResources)<{ $collapsed: boolean }>`
    padding: 16px 0;
`;

const CollapseButton = styled(Box)`
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 0;
    border-top: ${({ theme }) => theme.borders.default};
    transition: background 0.15s;

    &:hover {
        background: rgba(0, 0, 0, 0.05);
    }
`;

const Sidebar: React.FC<{ isVisible: boolean }> = (props) => {
    const { isVisible } = props;
    const resources = useSelector((state: ReduxState) => state.resources);

    const [collapsed, setCollapsed] = useState(() => {
        try {
            return localStorage.getItem("sidebar-collapsed") === "true";
        } catch {
            return false;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("sidebar-collapsed", String(collapsed));
        } catch {}
    }, [collapsed]);

    const toggleCollapse = () => setCollapsed((prev) => !prev);

    return (
        <SidebarContext.Provider value={{ collapsed, toggleCollapse }}>
            <StyledSidebar
                $collapsed={collapsed}
                style={{ visibility: isVisible ? "visible" : "hidden" }}
                data-css="sidebar"
            >
                <Box style={{ height: "64px" }} />
                <Box
                    flexGrow={1}
                    className={cssClass("Resources")}
                    data-css="sidebar-resources"
                    style={{ overflow: collapsed ? "visible" : "auto" }}
                >
                    <CustomSidebarResources
                        resources={resources}
                        $collapsed={collapsed}
                    />
                </Box>
                <CollapseButton
                    onClick={toggleCollapse}
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <Icon
                        icon={collapsed ? "ChevronRight" : "ChevronLeft"}
                        size={20}
                    />
                </CollapseButton>
            </StyledSidebar>
        </SidebarContext.Provider>
    );
};

export default Sidebar;
