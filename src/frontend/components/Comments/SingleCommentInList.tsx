import React from "react";
import { ValueGroup } from "@adminjs/design-system";
import { BaseRecord } from "adminjs";
import DOMPurify from "dompurify";

const SingleCommentInList = (props: { record: BaseRecord; where: string }) => {
    const { record, where } = props;

    return (
        <>
            {where === "show" && (
                <ValueGroup label={"Comment"}>
                    <div
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(record.params.comment),
                        }}
                    />
                </ValueGroup>
            )}
            {where === "list" && (
                <div
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(record.params.comment),
                    }}
                    className="comment-container overflowing"
                />
            )}
        </>
    );
};

export default SingleCommentInList;
