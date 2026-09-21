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

interface ShowLetterModalProps {
    record: any;
    onClose: () => void;
}

const ShowLetterModal = ({ record, onClose }: ShowLetterModalProps) => {
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;
    const [currentAdmin] = useCurrentAdmin();
    const [language, setLanguage] = useState<{
        value: string;
        label: string;
    } | null>(null);
    const [typeName, setTypeName] = useState("");
    const addNotice = useNotice();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const languagesResponse = await axios.get(`${BASE_URL}/get-languages`);
                const languages = languagesResponse.data.map((language) => ({
                    value: language.language_code,
                    label: language.language,
                }));
                languages.sort((a, b) => a.label.localeCompare(b.label));
                
                const selectedLanguage = languages.find(
                    (option) => option.value === record.params?.language
                );
                if (selectedLanguage) {
                    setLanguage(selectedLanguage);
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

    const modalProps: ModalProps = {
        label: "View Letter",
        title: `Letter: ${record.params.letter}`,
        buttons: [
            { label: "Close", onClick: onClose },
        ],
        onClose: onClose,
    };

    return (
        <Modal {...modalProps}>
            <Box padding="20px">
                <FormGroup>
                    <Label>Letter</Label>
                    <Input value={record.params.letter} readOnly />
                </FormGroup>
                <FormGroup>
                    <Label>Language</Label>
                    <Input value={language?.label || ""} readOnly />
                </FormGroup>
                <FormGroup>
                    <Label>Type</Label>
                    <Input value={record.params.type || ""} readOnly />
                </FormGroup>
                <FormGroup>
                    <Label>Unicode</Label>
                    <Input value={record.params.unicode || ""} readOnly />
                </FormGroup>
                <FormGroup>
                    <Label>Status</Label>
                    <Input value={record.params.status ? "Active" : "Inactive"} readOnly />
                </FormGroup>
            </Box>
        </Modal>
    );
};

export default ShowLetterModal;