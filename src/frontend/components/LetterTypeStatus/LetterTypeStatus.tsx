import { ShowPropertyProps, useNotice } from "adminjs";
import React, { useState } from "react";
import { Modal, ModalProps } from "@adminjs/design-system";
import axios from "axios";

const LetterTypeStatus: React.FC<ShowPropertyProps> = ({ record }) => {
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;
    const addNotice = useNotice();
    const [status, setStatus] = useState<boolean>(record.params.status);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [pendingStatus, setPendingStatus] = useState<boolean>(false);

    const handleStatusChange = () => {
        setShowModal(true);
        setPendingStatus(!status);
    };

    const confirmStatusChange = async () => {
        setStatus(pendingStatus);
        const data = { status: pendingStatus, letterTypeId: record.params.id };
        const response = await axios.post(
            `${BASE_URL}/update-letter-type-status`,
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        if (response.status == 200) {
            setShowModal(false);
            addNotice({
                message: "Letter type status updated successfully",
                type: "success",
            });
        } else {
            addNotice({
                message:
                    "Error updating letter type status. Please try again later.",
                type: "error",
            });
        }
    };

    const cancelStatusChange = () => {
        setShowModal(false);
    };

    const modalProps: ModalProps = {
        label: "Confirm",
        title: "Do you really want to change status?",
        variant: "info",
        buttons: [
            { label: "Cancel", onClick: () => cancelStatusChange() },
            {
                label: "Confirm",
                variant: "info",
                onClick: confirmStatusChange,
            },
        ],
        onClose: () => cancelStatusChange(),
    };

    return (
        <>
            <input
                className="status-toggle-switch"
                id={`statusToggle-${record.params.id}`}
                onChange={handleStatusChange}
                type="checkbox"
                checked={status}
                key={record.params.id}
            />
            <label
                className={`status-toggle-label ${status ? "checked" : ""}`}
                htmlFor={`statusToggle-${record.params.id}`}
            >
                <span className="status-toggle-button" />
            </label>
            {showModal && <Modal {...modalProps} />}
        </>
    );
};

export default LetterTypeStatus;
