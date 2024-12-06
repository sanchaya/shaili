import React, { useEffect } from "react";
import { styled } from "@adminjs/design-system/styled-components";
import { useBookProgressContext } from "../../context/BookProgressContext.js";
import { useLetterTagContext } from "../../context/LetterTagContext.js";

interface IProgressProps {
    progress: number;
}

const ProgressContainer = styled.div`
    height: 20px;
    width: 20%;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 15px;
    margin: 10px 0;
    position: relative;
    @media (max-width: 500px) {
        width: 70%;
    }
    @media (max-width: 400px) {
        width: 60%;
    }
`;

const ProgressInnerWrap = styled.div<IProgressProps>`
    height: 100%;
    width: ${({ progress }) => (progress > 9 ? progress : 0)}%;
    background-color: #3040d6;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: width 0.5s ease;
`;

const ProgressSpan = styled.span`
    position: absolute;
    top: 50%;
    left: ${({ progress }) => (progress > 12 ? "auto" : "50%")};
    transform: translate(-${({ progress }) => (progress > 12 ? 0 : 50)}%, -50%);
    padding: 10px;
    color: ${({ progress }) => (progress > 12 ? "#fff" : "#000")};
    font-weight: 400;
    font-size: 12px;
`;

const ProgressBar = () => {
    const { processPercentage, fetchData } = useBookProgressContext();
    const { tags } = useLetterTagContext();
    useEffect(() => {
        fetchData();
    }, [tags]);

    return (
        <ProgressContainer>
            <ProgressInnerWrap progress={processPercentage}>
                <ProgressSpan progress={processPercentage}>
                    {processPercentage}%
                </ProgressSpan>
            </ProgressInnerWrap>
        </ProgressContainer>
    );
};

export default ProgressBar;
