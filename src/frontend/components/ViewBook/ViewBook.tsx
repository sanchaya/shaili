import React from "react";

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
