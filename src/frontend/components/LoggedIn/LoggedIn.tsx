import React from "react";
import {
    CurrentUserNav,
    Box,
    CurrentUserNavProps,
} from "@adminjs/design-system";
import { CurrentAdmin, useTranslation } from "adminjs";
import { useNavigate } from "react-router-dom";

export type LoggedInProps = {
    session: CurrentAdmin;
    paths: {
        logoutPath: string;
    };
};

const LoggedIn: React.FC<LoggedInProps> = (props) => {
    const { session, paths } = props;
    const { translateButton } = useTranslation();
    const navigate = useNavigate();

    const dropActions: CurrentUserNavProps["dropActions"] = [
        {
            label: translateButton("edit profile"),
            onClick: (event: Event): void => {
                event.preventDefault();
                navigate(`admin/resources/users/records/${session.id}/edit`);
            },
            icon: "Edit",
        },
        {
            label: translateButton("logout"),
            onClick: (event: Event): void => {
                event.preventDefault();
                window.location.href = paths.logoutPath;
            },
            icon: "LogOut",
        },
    ];
    return (
        <Box flexShrink={0} data-css="logged-in" style={{ cursor: "pointer" }}>
            <CurrentUserNav
                name={session.email}
                title={session.title}
                avatarUrl={session.avatarUrl}
                dropActions={dropActions}
            />
        </Box>
    );
};

export default LoggedIn;
