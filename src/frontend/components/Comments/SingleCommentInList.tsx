import React from "react";
import { ValueGroup } from "@adminjs/design-system";
import { BaseRecord } from "adminjs";

const SingleCommentInList = (props: { record: BaseRecord; where: string }) => {
    const { record, where } = props;

    return (
        <>
            {where === "show" && (
                <ValueGroup label={"Comment"}>
                    <p className="comment-container">{record.params.comment}</p>
                </ValueGroup>
            )}
            {where === "list" && (
                <p className="comment-container overflowing">
                    {record.params.comment}
                </p>
            )}
        </>
    );
};

export default SingleCommentInList;
