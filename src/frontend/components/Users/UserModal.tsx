import React, { useState } from "react";
import { Box } from "@adminjs/design-system";
import Modal from "../Popup/Popup.js";
import { BasePropertyComponent, RecordJSON, useCurrentAdmin, useRecord, useResource } from "adminjs";

interface UserModalProps {
    record: RecordJSON;
    startEditing?: boolean;
    onClose: () => void;
    onSave: () => void;
}

// User details in a popup; switch to edit mode to change any field in place.
const UserModal = ({ record: initialRecord, startEditing = false, onClose, onSave }: UserModalProps) => {
    const resource = useResource("users")!;
    const [currentAdmin] = useCurrentAdmin();
    const canEdit = initialRecord.recordActions.some(({ name }) => name === "edit");
    const [editing, setEditing] = useState(startEditing && canEdit);
    const isAdmin = currentAdmin?.role === 1;
    const { record, handleChange, submit, loading } = useRecord(initialRecord, "users", {
        includeParams: resource.editProperties.map((p) => p.propertyPath),
    });

    const save = () =>
        submit().then((response) => {
            if (response.data.notice?.type !== "error") onSave();
        });

    const buttons = editing
        ? [
              { label: "Cancel", onClick: () => (startEditing ? onClose() : setEditing(false)) },
              { label: "Save", variant: "contained" as const, onClick: save, disabled: loading },
          ]
        : [
              { label: "Close", onClick: onClose },
              ...(canEdit ? [{ label: "Edit", variant: "contained" as const, onClick: () => setEditing(true) }] : []),
          ];

    return (
        <Modal
            title={initialRecord.params.name}
            subTitle={initialRecord.params.email}
            onClose={onClose}
            onOverlayClick={onClose}
            buttons={buttons}
        >
            <Box>
                {(editing ? resource.editProperties : resource.showProperties).map((property) =>
                    // Only admins may change roles (UserEditHandler ignores it otherwise).
                    editing && (property.name !== "role" || isAdmin) ? (
                        <BasePropertyComponent
                            key={property.propertyPath}
                            where="edit"
                            onChange={handleChange}
                            property={property}
                            resource={resource}
                            record={record}
                        />
                    ) : (
                        <BasePropertyComponent
                            key={property.propertyPath}
                            where="show"
                            property={property}
                            resource={resource}
                            record={initialRecord}
                        />
                    )
                )}
            </Box>
        </Modal>
    );
};

export default UserModal;
