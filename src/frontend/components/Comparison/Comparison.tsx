import React from "react";
import { Box } from "@adminjs/design-system";
import Compare from "./Compare.js";
import { styled } from "@adminjs/design-system/styled-components";

const CompareContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
`;

const Container = styled(Box)`
    background-color: rgb(248, 249, 249);
`;

const CompareItem = styled.div`
    width: calc(50% - 15px);
    background-color: #f0f0f0;
    text-align: center;
    box-sizing: border-box;
    border: 1px solid #ccc;
    padding: 20px;
    @media (max-width: 800px) {
        padding: 8px;
    }
`;

const Comparison = () => {
    return (
        <Container variant="container">
            <CompareContainer>
                <CompareItem style={{ position: "relative" }}>
                    <Compare />
                </CompareItem>
                <CompareItem style={{ position: "relative" }}>
                    <Compare />
                </CompareItem>
            </CompareContainer>
        </Container>
    );
};

export default Comparison;
