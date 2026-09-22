import { Box, BoxProps, Icon, cssClass } from "@adminjs/design-system";
import { styled } from "@adminjs/design-system/styled-components";
import React, { useEffect, useState, useSyncExternalStore } from "react";
import { useSelector } from "react-redux";
import { ReduxState } from "adminjs";
import SidebarResources from "../SidebarResources/SidebarResources.js";
import {
    getMobileOverlayOpen,
    getSidebarCollapsed,
    subscribeSidebar,
    toggleSidebar,
} from "./SidebarContext.js";

export const SIDEBAR_Z_INDEX = 50;

const SIDEBAR_WIDTH = 250;
const SIDEBAR_COLLAPSED_WIDTH = 60;
const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(
        () => typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT
    );
    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mq.addEventListener("change", handler);
        setIsMobile(mq.matches);
        return () => mq.removeEventListener("change", handler);
    }, []);
    return isMobile;
}

const StyledSidebar = styled(Box)<BoxProps & { $collapsed: boolean; $isMobile: boolean; $mobileOpen: boolean }>`
    top: 0;
    bottom: 0;
    left: 0;
    overflow-y: auto;
    overflow-x: hidden;
    width: ${({ $collapsed, $isMobile }) =>
        $isMobile ? `${SIDEBAR_WIDTH}px` : $collapsed ? `${SIDEBAR_COLLAPSED_WIDTH}px` : `${SIDEBAR_WIDTH}px`};
    border-right: ${({ theme }) => theme.borders.default};
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    z-index: ${({ $isMobile }) => ($isMobile ? "100" : String(SIDEBAR_Z_INDEX))};
    background: ${({ theme }) => theme.colors.sidebar};
    transition: ${({ $isMobile }) =>
        $isMobile ? "transform 0.25s ease-in-out" : "width 0.25s ease-in-out"};
    transform: ${({ $isMobile, $mobileOpen }) =>
        $isMobile ? ($mobileOpen ? "translateX(0)" : "translateX(-100%)") : "none"};
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
    const collapsed = useSyncExternalStore(subscribeSidebar, getSidebarCollapsed);
    const mobileOpen = useSyncExternalStore(subscribeSidebar, getMobileOverlayOpen);
    const isMobile = useIsMobile();

    return (
        <StyledSidebar
            $collapsed={collapsed}
            $isMobile={isMobile}
            $mobileOpen={mobileOpen}
            style={{ visibility: isVisible ? "visible" : "hidden" }}
            data-css="sidebar"
        >
            <Box style={{ height: "64px" }} />
            <Box
                flexGrow={1}
                className={cssClass("Resources")}
                data-css="sidebar-resources"
                style={{ overflow: collapsed && !isMobile ? "visible" : "auto" }}
            >
                <CustomSidebarResources
                    resources={resources}
                    $collapsed={collapsed && !isMobile}
                />
            </Box>
            <CollapseButton
                onClick={toggleSidebar}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                <Icon
                    icon={collapsed ? "ChevronRight" : "ChevronLeft"}
                    size={20}
                />
            </CollapseButton>
        </StyledSidebar>
    );
};

export default Sidebar;
