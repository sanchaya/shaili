import React from "react";
import { styled } from "@adminjs/design-system/styled-components";

const ViewBookLink = styled.a`
  color: #fff;
  background-color: #337ab7;
  border-color: #2e6da4;
  margin-bottom: 0;
  font-weight: 400;
  padding: 7px 10px;
  border-radius: 7px;
  text-decoration: none;
  border: none;
`;

interface ViewBookProps {
  record: {
    params: {
      url: string;
    };
  };
}

const ViewBook: React.FC<ViewBookProps> = ({ record }) => {
  const url = record.params.url;

  return (
    <iframe
    src={url}
    width="100%"
    height="500"
    allowFullScreen={true}
  ></iframe>
  );
};

export default ViewBook;
