import React from "react";
import { Box } from "@adminjs/design-system";
import Compare from "./Compare.js";
import { styled } from "@adminjs/design-system/styled-components";

const CompareContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    margin: 20px auto;
`;

const Comparison = () => {
    return (
        <Box style={{ width: "96%", margin: "0 auto" }}>
            <CompareContainer>
                <Compare />
                <Compare />
            </CompareContainer>
        </Box>
    );
};

export default Comparison;
