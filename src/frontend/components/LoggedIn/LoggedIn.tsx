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
    const [avatarUrl, setAvatarUrl] = useState(session.avatarUrl);
    const dropActions: CurrentUserNavProps["dropActions"] = [];

    dropActions.push({
        label: translateButton("edit profile"),
        onClick: (event: Event): void => {
            event.preventDefault();
            navigate("/admin/pages/profile");
        },
        icon: "User",
    });

    dropActions.push({
        label: translateButton("logout"),
        onClick: (event: Event): void => {
            event.preventDefault();
            window.location.href = paths.logoutPath;
        },
        icon: "LogOut",
    });

    useEffect(() => {
        // Fetch profile data to get avatar and updated email
        axios
            .get(`${BASE_URL}/profile`, {
                headers: { "X-User-Id": String(session.id) },
            })
            .then((response) => {
                if (response.data.email !== email) {
                    setEmail(response.data.email);
                }
                if (response.data.avatar_url !== avatarUrl) {
                    setAvatarUrl(response.data.avatar_url);
                }
            })
            .catch(() => {
                // Fallback to the old API if profile endpoint fails
                axios
                    .get(
                        `${BASE_URL}/api/resources/users/records/${session.id}/show`
                    )
                    .then((response) => {
                        if (response.data.record.params.email !== email) {
                            setEmail(response.data.record.params.email);
                        }
                    });
            });
    }, []);

    return (
        <Box flexShrink={0} data-css="logged-in" style={{ cursor: "pointer" }}>
            <CurrentUserNav
                name={email}
                title={session.title}
                avatarUrl={avatarUrl}
                dropActions={dropActions}
            />
        </Box>
    );
};

export default LoggedIn;
