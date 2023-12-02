import React, { FC } from "react";
import { Navigation } from "@adminjs/design-system";
import { ResourceJSON, useNavigationResources } from "adminjs";
import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";

export type SidebarResourceSectionProps = {
  resources: Array<ResourceJSON>;
};

const isSelected = (href, location) => {
  return location.pathname === href;
};

const CustomNavigation = styled(Navigation)`
  padding: 40px;
  width: 200px;
  @media (max-width: 500px) {
    width: 100%;
  }
`;

const SidebarResources: FC<SidebarResourceSectionProps> = ({ resources }) => {
  const elements = useNavigationResources(resources);
  const navigate = useNavigate();

  const dashboardMenu = {
    href: "/admin",
    icon: "Home",
    id: "dashboard",
    isSelected: isSelected("/admin", location),
    label: "Dashboard",
    onClick: (event) => {
      if ("/admin") {
        event.preventDefault();
        navigate("/admin");
      }
    },
  };
  
  const compareMenu = {
    href: "/admin/pages/compare",
    icon: "BookOpen",
    id: "comparison",
    isSelected: isSelected("/admin/pages/compare", location),
    label: "Book Comparison",
    onClick: (event) => {
      if ("/admin/pages/compare") {
        event.preventDefault();
        navigate("/admin/pages/compare");
      }
    },
  };

  return <CustomNavigation elements={[dashboardMenu, ...elements,compareMenu]} />;
};

export default SidebarResources;
