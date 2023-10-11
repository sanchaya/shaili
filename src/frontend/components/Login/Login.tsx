import React from "react";
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
  MessageBox,
} from "@adminjs/design-system";
import { useTranslation } from "adminjs";
import { ThemeProvider } from "@adminjs/design-system/styled-components";

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
  message?: string;
  action: string;
};

export const Login: React.FC<LoginProps> = (props) => {
  const { action, message } = props;
  const {
    translateLabel,
    translateButton,
    translateProperty,
    translateMessage,
  } = useTranslation();

  return (
    <ThemeProvider theme={theme}>
      <Wrapper flex variant="grey">
        <Box
          bg="white"
          height="440px"
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
            <H2 fontWeight="lighter">{translateLabel("Welcome")}</H2>
            <Text fontWeight="lighter" mt="default">
              {translateMessage("Login to your account")}
            </Text>
            <IllustrationsWrapper p="xxl">
              <Box display="inline" mr="default">
                <Illustration variant="Planet" width={82} height={91} />
              </Box>
              <Box display="inline">
                <Illustration variant="Astronaut" width={82} height={91} />
              </Box>
              <Box display="inline" position="relative" top="-20px">
                <Illustration variant="FlagInCog" width={82} height={91} />
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
          >
            <H5 marginBottom="xxl">Type Extract</H5>
            {message && (
              <MessageBox
                my="lg"
                message={
                  message.split(" ").length > 1
                    ? message
                    : translateMessage(message)
                }
                variant="danger"
              />
            )}
            <FormGroup>
              <Label required>{translateProperty("email")}</Label>
              <Input name="email" placeholder={translateProperty("email")} />
            </FormGroup>
            <FormGroup>
              <Label required>{translateProperty("password")}</Label>
              <Input
                type="password"
                name="password"
                placeholder={translateProperty("password")}
                autoComplete="new-password"
              />
            </FormGroup>
            <Text mt="xl" textAlign="center">
              <Button variant="primary">{translateButton("login")}</Button>
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
