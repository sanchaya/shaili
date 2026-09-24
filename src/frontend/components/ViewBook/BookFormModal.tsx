import React, { useEffect, useState } from "react";
import { Box, Button, FormGroup, Input, Label } from "@adminjs/design-system";
import Modal from "../Popup/Popup.js";
import { ApiClient, BasePropertyComponent, RecordJSON, useNotice, useRecord, useResource } from "adminjs";
import axios from "axios";

interface BookFormModalProps {
    recordId?: number; // absent → create a new book
    language?: string; // preselected language when creating
    onClose: () => void;
    onSave: (record: RecordJSON) => void;
}

type FormProps = Omit<BookFormModalProps, "recordId"> & { initialRecord?: RecordJSON };

// Same fields as the stock AdminJS form, in a popup that keeps you where you are.
const BookForm = ({ initialRecord, language, onClose, onSave }: FormProps) => {
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;
    const resource = useResource("books")!;
    const { record, handleChange, submit, loading } = useRecord(initialRecord, "books");
    const addNotice = useNotice();
    const [archiveUrl, setArchiveUrl] = useState("");
    const [fetching, setFetching] = useState(false);
    const creating = !initialRecord;

    useEffect(() => {
        if (creating && language) handleChange("language", language);
    }, []);

    const fetchFromArchive = (url: string) => {
        if (!url.trim()) return;
        setFetching(true);
        axios
            .get(`${BASE_URL}/archive-metadata`, { params: { url } })
            .then(({ data }) => {
                // Keep a language already chosen when archive.org's can't be matched.
                Object.entries(data).forEach(([key, value]) => (value || key !== "language") && handleChange(key, value));
                addNotice({ message: "Filled from archive.org, review and save", type: "success" });
            })
            .catch((error) => addNotice({ message: error.response?.data?.error ?? "Fetch failed", type: "error" }))
            .finally(() => setFetching(false));
    };

    const save = () =>
        submit().then((response) => {
            if (response.data.notice?.type !== "error") onSave(response.data.record);
        });

    return (
        <Modal
            title={creating ? "Add book" : "Edit book metadata"}
            onClose={onClose}
            onOverlayClick={onClose}
            buttons={[
                { label: "Cancel", onClick: onClose },
                { label: "Save", variant: "contained", onClick: save, disabled: loading || fetching },
            ]}
        >
            <Box>
                {creating && (
                    <FormGroup>
                        <Label>archive.org URL</Label>
                        <Box flex style={{ gap: 8 }}>
                            <Input
                                width={1}
                                placeholder="https://archive.org/details/…"
                                value={archiveUrl}
                                onChange={(e) => setArchiveUrl(e.target.value)}
                                onPaste={(e) => fetchFromArchive(e.clipboardData.getData("text"))}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), fetchFromArchive(archiveUrl))}
                            />
                            <Button type="button" variant="outlined" disabled={fetching} onClick={() => fetchFromArchive(archiveUrl)}>
                                {fetching ? "Fetching…" : "Fetch"}
                            </Button>
                        </Box>
                    </FormGroup>
                )}
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

const BookFormModal = ({ recordId, ...props }: BookFormModalProps) => {
    const [record, setRecord] = useState<RecordJSON>();

    useEffect(() => {
        if (!recordId) return;
        new ApiClient()
            .recordAction({ resourceId: "books", recordId: String(recordId), actionName: "edit" })
            .then((response) => setRecord(response.data.record));
    }, [recordId]);

    return !recordId || record ? <BookForm initialRecord={record} {...props} /> : null;
};

export default BookFormModal;
