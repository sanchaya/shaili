import React from "react";
import styled from "styled-components";

const DashboardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically */
  height: 100vh; /* Optional: Adjust the height as needed */
`;

const DashboardItem = styled.div`
  width: calc(33.33% - 10px); /* 10px is the margin between items */
  height: 20vh; /* Adjust the height as needed */
  background-color: #f0f0f0;
  margin-bottom: 10px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
`;

const HeaderItem = styled.div`
  text-align: center;
  padding: 30px;
`;

const Dashboard = () => {
  return (
    <>
      <HeaderItem>
        <p style={{ fontSize: "40px" }}>Custom Dashboard</p>
      </HeaderItem>
      <DashboardContainer>
        <DashboardItem>Item 1</DashboardItem>
        <DashboardItem>Item 2</DashboardItem>
        <DashboardItem>Item 3</DashboardItem>
        <DashboardItem>Item 4</DashboardItem>
        <DashboardItem>Item 5</DashboardItem>
        <DashboardItem>Item 6</DashboardItem>
        <DashboardItem>Item 7</DashboardItem>
        <DashboardItem>Item 8</DashboardItem>
        <DashboardItem>Item 9</DashboardItem>
      </DashboardContainer>
    </>
  );
};

export default Dashboard;
