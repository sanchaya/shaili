import { Box, BoxProps, cssClass } from "@adminjs/design-system";
import { styled } from "@adminjs/design-system/styled-components";
import React from "react";
import { useSelector } from "react-redux";

import { ReduxState } from "adminjs";
import SidebarResources from "../SidebarResources/SidebarResources.js";
import SidebarBranding from "../SidebarBranding/SidebarBranding.js";

export const SIDEBAR_Z_INDEX = 50;

type Props = {
  isVisible: boolean;
};

const StyledSidebar = styled(Box)<BoxProps>`
  top: 0;
  bottom: 0;
  overflow-y: auto;
  width: 250px;
  border-right: ${({ theme }) => theme.borders.default};
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  z-index: ${SIDEBAR_Z_INDEX};
  background: ${({ theme }) => theme.colors.sidebar};

  transition: left 0.25s ease-in-out;

  &.hidden {
    left: -${({ theme }) => theme.sizes.sidebarWidth};
  }
  &.visible {
    left: 0;
  }
`;

StyledSidebar.defaultProps = {
  position: ["absolute", "absolute", "absolute", "absolute", "initial"],
};

const CustomSidebarResources = styled(SidebarResources)`
  padding: 16px 0;
`;

const Sidebar: React.FC<Props> = (props) => {
  const { isVisible } = props;
  const branding = useSelector((state: ReduxState) => state.branding);
  const resources = useSelector((state: ReduxState) => state.resources);
  const pages = useSelector((state: ReduxState) => state.pages);

  return (
    <StyledSidebar
      className={isVisible ? "visible" : "hidden"}
      data-css="sidebar"
    >
      <SidebarBranding branding={branding} />
      <Box
        flexGrow={1}
        className={cssClass("Resources")}
        data-css="sidebar-resources"
      >
        <CustomSidebarResources
          resources={resources}
          style={{ padding: "20px" }}
        />
      </Box>
    </StyledSidebar>
  );
};

export default Sidebar;
