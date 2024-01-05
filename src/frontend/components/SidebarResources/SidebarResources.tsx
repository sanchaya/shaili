import React, { FC } from "react";
import { Navigation } from "@adminjs/design-system";
import { ResourceJSON, useCurrentAdmin, useNavigationResources } from "adminjs";
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
    const [currentAdmin] = useCurrentAdmin();

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
    const isAdminOrReviewer =
        currentAdmin?.role === 1 || currentAdmin?.role === 2;

    return (
        <>
            {isAdminOrReviewer ? (
                <CustomNavigation
                    elements={[dashboardMenu, ...elements, compareMenu]}
                />
            ) : (
                <CustomNavigation elements={[dashboardMenu, ...elements]} />
            )}
        </>
    );
};

export default SidebarResources;
