import React, { useEffect, useState } from "react";
import {
    Box,
    FormGroup,
    Label,
    Input,
    Button,
    Select,
    Modal,
    ModalProps,
} from "@adminjs/design-system";
import axios from "axios";
import { useCurrentAdmin, useNotice } from "adminjs";

interface ISelectOptions {
    value: string;
    label: string;
}

interface EditLetterTypeModalProps {
    record: any;
    onClose: () => void;
    onSave: () => void;
}

const EditLetterTypeModal = ({ record, onClose, onSave }: EditLetterTypeModalProps) => {
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;
    const [languageOptions, setLanguageOptions] = useState<ISelectOptions[]>();
    const [language, setLanguage] = useState<{
        value: string;
        label: string;
    } | null>(null);
    const [currentAdmin] = useCurrentAdmin();
    const [typeName, setTypeName] = useState("");
    const [status, setStatus] = useState(true);
    const addNotice = useNotice();

    useEffect(() => {
        setTypeName(record.params.type);
        setStatus(
            record.params.status === true ||
                record.params.status === 1 ||
                record.params.status === "1" ||
                record.params.status === "true"
        );
        const fetchData = async () => {
            try {
                const languagesResponse = await axios.get(`${BASE_URL}/get-languages`);
                const languages = languagesResponse.data.map((language) => ({
                    value: language.language_code,
                    label: language.language,
                }));
                languages.sort((a, b) => a.label.localeCompare(b.label));
                setLanguageOptions(languages);

                const selectedLanguage = languages.find(
                    (option) => option.value === record.params?.language
                );
                if (selectedLanguage) {
                    setLanguage(selectedLanguage);
                } else {
                    console.warn("Language not found for record:", record);
                }
            } catch (error) {
                addNotice({
                    message: "Error fetching data",
                    type: "error",
                });
            }
        };
        fetchData();
    }, [record.params?.language]);

    const saveLetterType = async () => {
        const data = {
            id: record.params.id,
            type: typeName,
            language: language?.value,
            status: status,
            created_by: Number(currentAdmin?.id),
            updated_by: Number(currentAdmin?.id),
        };
        try {
            const response = await axios.post(`${BASE_URL}/edit-letter-type`, data, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.status == 200) {
                addNotice({
                    message: "Letter Type updated successfully",
                    type: "success",
                });
                onSave();
                onClose();
            }
        } catch (error) {
            addNotice({
                message: error.response.data,
                type: "error",
            });
        }
    };

    const handleLanguageChange = (newValue: any) => {
        setLanguage(newValue);
    };

    const modalProps: ModalProps = {
        label: "Edit Letter Type",
        title: `Edit Letter Type: ${record.params.type}`,
        buttons: [
            { label: "Cancel", onClick: onClose },
            {
                label: "Save",
                variant: "primary",
                onClick: saveLetterType,
                disabled: !language || !typeName,
            },
        ],
        onClose: onClose,
    };

    return (
        <Modal {...modalProps}>
            <Box padding="20px">
                <FormGroup>
                    <Label required>Type Name</Label>
                    <Input
                        id="type"
                        name="type"
                        value={typeName}
                        onChange={(e) => setTypeName(e.target.value)}
                    />
                </FormGroup>
                <FormGroup>
                    <Label required>Language</Label>
                    <Select
                        value={language}
                        isClearable={false}
                        options={languageOptions}
                        onChange={handleLanguageChange}
                        placeholder="Select a language"
                    />
                </FormGroup>
                <FormGroup>
                    <Label>Status</Label>
                    <Select
                        value={
                            status
                                ? { value: "true", label: "Active" }
                                : { value: "false", label: "Inactive" }
                        }
                        options={[
                            { value: "true", label: "Active" },
                            { value: "false", label: "Inactive" },
                        ]}
                        onChange={(selected) =>
                            setStatus(selected?.value === "true")
                        }
                    />
                </FormGroup>
            </Box>
        </Modal>
    );
};

export default EditLetterTypeModal;