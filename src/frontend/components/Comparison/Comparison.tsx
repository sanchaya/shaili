import React from "react";
import { Box } from "@adminjs/design-system";
import Compare from "./Compare.js";
import { styled } from "@adminjs/design-system/styled-components";

const CompareContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
`;

const HeaderItem = styled.div`
  text-align: center;
  padding: 30px;
  font-size: 40px;
  line-height: 1;
  @media (max-width: 600px) {
    font-size: 28px;
`;

const Comparison = () => {
    return (
        <Box style={{ width: "96%", margin: "0 auto" }}>
            <HeaderItem>Comparison of Books Tags</HeaderItem>
            <CompareContainer>
                <Compare />
                <Compare />
            </CompareContainer>
        </Box>
    );
};

export default Comparison;
