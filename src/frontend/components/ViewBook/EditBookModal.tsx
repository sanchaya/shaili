import React, { useEffect, useState } from "react";
import { Box, Modal } from "@adminjs/design-system";
import { ApiClient, BasePropertyComponent, RecordJSON, useRecord, useResource } from "adminjs";

interface EditBookModalProps {
    recordId: number;
    onClose: () => void;
    onSave: (record: RecordJSON) => void;
}

type FormProps = Omit<EditBookModalProps, "recordId"> & { initialRecord: RecordJSON };

// Same fields as the stock AdminJS edit form, but in a popup that keeps you on the book.
const EditBookForm = ({ initialRecord, onClose, onSave }: FormProps) => {
    const resource = useResource("books")!;
    const { record, handleChange, submit, loading } = useRecord(initialRecord, "books");

    const save = () =>
        submit().then((response) => {
            if (response.data.notice?.type !== "error") onSave(response.data.record);
        });

    return (
        <Modal
            title="Edit book metadata"
            onClose={onClose}
            onOverlayClick={onClose}
            buttons={[
                { label: "Cancel", onClick: onClose },
                { label: "Save", variant: "contained", onClick: save, disabled: loading },
            ]}
        >
            {/* Modal pads 32px left / 24px right; +8px here evens the gutters. */}
            <Box style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: 8 }}>
                {resource.editProperties.map((property) => (
                    <BasePropertyComponent
                        key={property.propertyPath}
                        where="edit"
                        onChange={handleChange}
                        property={property}
                        resource={resource}
                        record={record}
                    />
                ))}
            </Box>
        </Modal>
    );
};

const EditBookModal = ({ recordId, ...props }: EditBookModalProps) => {
    const [record, setRecord] = useState<RecordJSON>();

    useEffect(() => {
        new ApiClient()
            .recordAction({ resourceId: "books", recordId: String(recordId), actionName: "edit" })
            .then((response) => setRecord(response.data.record));
    }, [recordId]);

    return record ? <EditBookForm initialRecord={record} {...props} /> : null;
};

export default EditBookModal;
