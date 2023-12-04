import React from "react";
import { ValueGroup } from "@adminjs/design-system";
import { BaseRecord } from "adminjs";

const SingleCommentInList = (props: { record: BaseRecord; where: string }) => {
    const { record, where } = props;

    return (
        <>
            {where === "show" && (
                <ValueGroup label={"Comment"}>
                    <div
                        dangerouslySetInnerHTML={{
                            __html: record.params.comment,
                        }}
                    />
                </ValueGroup>
            )}
            {where === "list" && (
                <div
                    dangerouslySetInnerHTML={{
                        __html: record.params.comment,
                    }}
                />
            )}
        </>
    );
};

export default SingleCommentInList;
