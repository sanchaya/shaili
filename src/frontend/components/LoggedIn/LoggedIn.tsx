import React, { useEffect, useState } from "react";
import {
    CurrentUserNav,
    Box,
    CurrentUserNavProps,
} from "@adminjs/design-system";
import { CurrentAdmin, useTranslation } from "adminjs";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;
    const [email, setEmail] = useState(session.email);

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
    useEffect(() => {
        axios
            .get(`${BASE_URL}/api/resources/users/records/${session.id}/show`)
            .then((response) => {
                if (response.data.record.params.email != email) {
                    setEmail(response.data.record.params.email);
                }
            });
    });

    return (
        <Box flexShrink={0} data-css="logged-in" style={{ cursor: "pointer" }}>
            <CurrentUserNav
                name={email}
                title={session.title}
                avatarUrl={session.avatarUrl}
                dropActions={dropActions}
            />
        </Box>
    );
};

export default LoggedIn;
