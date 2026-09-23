import React from "react";
import { Box } from "@adminjs/design-system";
import { BreadcrumbLink, OriginalBreadcrumbs, ViewHelpers } from "adminjs";
import { useLocation } from "react-router-dom";

// A book's page: Dashboard / Books / <Language> Books / View. Every other page keeps AdminJS's default.
const Breadcrumbs = (props) => {
    const { resource, record, actionName } = props;
    const location = useLocation();
    if (resource.id !== "books" || actionName !== "ViewBook" || !record) {
        return <OriginalBreadcrumbs {...props} />;
    }

    const code = record.params.language;
    const name = record.populated?.language?.params?.language ?? code;
    // Return to the exact list we came from (page/sort) when it was this language's list.
    const from = (location.state as { from?: string } | null)?.from;
    const languageList = new URLSearchParams(from?.split("?")[1]).get("filters.language") === code
        ? from
        : `${resource.href}?filters.language=${code}`;

    return (
        <Box flexGrow={1}>
            <BreadcrumbLink to={new ViewHelpers().dashboardUrl()}>Dashboard</BreadcrumbLink>
            <BreadcrumbLink to={resource.href} className="is-active">Books</BreadcrumbLink>
            <BreadcrumbLink to={languageList} className="is-active">{name} Books</BreadcrumbLink>
            <BreadcrumbLink to="#">View</BreadcrumbLink>
        </Box>
    );
};

export default Breadcrumbs;
