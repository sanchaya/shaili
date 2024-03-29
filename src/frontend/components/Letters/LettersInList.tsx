import React from "react";
import { BaseRecord } from "adminjs";

const LettersInList = (props: { record: BaseRecord; where: string }) => {
    const { record, where } = props;

    return <>{where === "list" && <>{record.params.unicode ?? "-"}</>}</>;
};

export default LettersInList;
