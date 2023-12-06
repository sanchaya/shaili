import React, { useState } from "react";
import { styled } from "@adminjs/design-system/styled-components";
import {
    theme,
    Box,
    BoxProps,
    H5,
    H2,
    Label,
    Illustration,
    Input,
    FormGroup,
    Button,
    Text,
} from "@adminjs/design-system";
import { useTranslation } from "adminjs";
import { LoginTemplateAttributes } from "adminjs/bundler";
import { ThemeProvider } from "styled-components";

const Wrapper = styled(Box)<BoxProps>`
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 100%;
`;

const IllustrationsWrapper = styled(Box)<BoxProps>`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    & svg [stroke="#3B3552"] {
        stroke: rgba(255, 255, 255, 0.5);
    }
    & svg [fill="#3040D6"] {
        fill: rgba(255, 255, 255, 1);
    }
`;

export type LoginProps = {
    action: string;
    errorMessage?: string;
    children?: any;
};

export const Login: React.FC<LoginProps> = () => {
    const props = (window as any).__APP_STATE__ as LoginTemplateAttributes;
    const [loginEmail, setLoginEmail] = useState<string>();
    const [loginPassword, setLoginPassword] = useState<string>();
    const [showError, setShowError] = useState<boolean>();
    const { action, errorMessage } = props;
    const {
        translateLabel,
        translateButton,
        translateProperty,
        translateMessage,
    } = useTranslation();

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        if (!loginEmail || !loginPassword || !validateEmail(loginEmail)) {
            e.preventDefault();
            setShowError(true);
        } else {
            setShowError(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Wrapper flex variant="grey">
                <Box
                    bg="white"
                    height={["auto", "auto", "440px"]}
                    flex
                    boxShadow="login"
                    width={[1, 2 / 3, "auto"]}
                >
                    <Box
                        bg="primary100"
                        color="white"
                        p="x3"
                        width="380px"
                        flexGrow={0}
                        display={["none", "none", "block"]}
                        position="relative"
                    >
                        <H2 fontWeight="lighter">
                            {translateLabel("Welcome")}
                        </H2>
                        <Text fontWeight="lighter" mt="default">
                            {translateMessage("Login to your account")}
                        </Text>
                        <IllustrationsWrapper p="xxl">
                            <Box display="inline" mr="default">
                                <Illustration
                                    variant="Planet"
                                    width={82}
                                    height={91}
                                />
                            </Box>
                            <Box display="inline">
                                <Illustration
                                    variant="Astronaut"
                                    width={82}
                                    height={91}
                                />
                            </Box>
                            <Box
                                display="inline"
                                position="relative"
                                top="-20px"
                            >
                                <Illustration
                                    variant="FlagInCog"
                                    width={82}
                                    height={91}
                                />
                            </Box>
                        </IllustrationsWrapper>
                    </Box>
                    <Box
                        as="form"
                        action={action}
                        method="POST"
                        p="x3"
                        flexGrow={1}
                        width={["100%", "100%", "480px"]}
                        onSubmit={handleSubmit}
                    >
                        <h1 className="pageTitle">Login</h1>
                        <H5 marginBottom="xxl">Type Extract</H5>
                        {errorMessage && (
                            <div className="loginError">
                                {errorMessage.split(" ").length > 1
                                    ? errorMessage
                                    : translateMessage(errorMessage)}
                            </div>
                        )}
                        <FormGroup>
                            <Label required>{translateProperty("email")}</Label>
                            <Input
                                style={{ marginBottom: "2px" }}
                                name="email"
                                type="text"
                                placeholder={translateProperty("email")}
                                onChange={(e: {
                                    target: {
                                        value: React.SetStateAction<
                                            string | undefined
                                        >;
                                    };
                                }) => setLoginEmail(e.target.value)}
                            />
                            {showError &&
                                (!loginEmail || !validateEmail(loginEmail)) && (
                                    <span
                                        style={{
                                            color: "red",
                                        }}
                                    >
                                        Enter valid email address
                                    </span>
                                )}
                        </FormGroup>
                        <FormGroup>
                            <Label required>
                                {translateProperty("password")}
                            </Label>
                            <Input
                                style={{ marginBottom: "2px" }}
                                type="password"
                                name="password"
                                placeholder={translateProperty("password")}
                                autoComplete="password"
                                onChange={(e: {
                                    target: {
                                        value: React.SetStateAction<
                                            string | undefined
                                        >;
                                    };
                                }) => setLoginPassword(e.target.value)}
                            />
                            {!loginPassword && showError && (
                                <span
                                    style={{
                                        color: "red",
                                    }}
                                >
                                    Enter valid password
                                </span>
                            )}
                        </FormGroup>
                        <Text mt="xl" textAlign="center">
                            <Button variant="primary">
                                {translateButton("login")}
                            </Button>
                        </Text>
                        <Text mt="lg" textAlign="center">
                            <a href="/admin/forgot-password">
                                {translateMessage("Forgot Password?")}
                            </a>
                        </Text>
                    </Box>
                </Box>
            </Wrapper>
        </ThemeProvider>
    );
};

export default Login;
