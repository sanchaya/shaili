import React from "react";
import { BaseRecord } from "adminjs";

const BookThumbnail = (props: { record: BaseRecord }) => {
    const { record } = props;
    const identifier = record.params?.identifier;
    const name = record.params?.name;

    if (!identifier) return <span>-</span>;

    const thumbnailUrl = `https://archive.org/services/img/${identifier}`;
    const bookUrl = record.params?.url || `https://archive.org/details/${identifier}`;

    return (
        <a
            href={bookUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={name || identifier}
            style={{ display: "inline-block" }}
        >
            <img
                src={thumbnailUrl}
                alt={name || ""}
                style={{
                    width: "40px",
                    height: "56px",
                    objectFit: "cover",
                    borderRadius: "3px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#f3f4f6",
                }}
                onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (e.target as HTMLImageElement).nextElementSibling?.removeAttribute("style");
                }}
            />
            <span style={{ display: "none", fontSize: "12px", color: "#6b7280" }}>
                No cover
            </span>
        </a>
    );
};

export default BookThumbnail;
