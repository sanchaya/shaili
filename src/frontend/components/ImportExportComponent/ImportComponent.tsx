import React, { FC, useState } from "react";
import { ActionProps, ApiClient, useNotice } from "adminjs";
import {
    DropZoneItem,
    Loader,
    Box,
    Button,
    DropZone,
} from "@adminjs/design-system";
import { useNavigate } from "react-router-dom";

const ImportComponent: FC<ActionProps> = ({ resource }) => {
    const [file, setFile] = useState<null | File>(null);
    const sendNotice = useNotice();
    const [isFetching, setFetching] = useState<boolean>();
    const navigate = useNavigate();

    const onUpload = (uploadedFile: File[]) => {
        setFile(uploadedFile?.[0] ?? null);
    };

    const onSubmit = async () => {
        if (!file) {
            return;
        }

        setFetching(true);
        try {
            const importData = new FormData();
            importData.append("file", file, file?.name);
            await new ApiClient()
                .resourceAction({
                    method: "post",
                    resourceId: resource.id,
                    actionName: "import",
                    data: importData,
                })
                .then((response) => {
                    sendNotice({
                        message: response.data.notice
                            ? response.data.notice.message
                            : "Imported successfully ",
                        type: "success",
                    });
                    if (response.data.redirectUrl)
                        navigate(response.data.redirectUrl, {});
                });
        } catch (e) {
            sendNotice({ message: e.message, type: "error" });
        }
        setFetching(false);
    };

    if (isFetching) {
        return <Loader />;
    }

    return (
        <Box
            margin="auto"
            maxWidth={600}
            display="flex"
            justifyContent="center"
            flexDirection="column"
        >
            <p
                style={{
                    margin: "1em auto",
                    fontSize: "12px",
                    fontStyle: "italic",
                }}
            >
                Supported file format - CSV
            </p>
            <DropZone files={[]} onChange={onUpload} multiple={false} />
            {file && (
                <DropZoneItem
                    file={file}
                    filename={file.name}
                    onRemove={() => setFile(null)}
                />
            )}
            <Box display="flex" justifyContent="center" m={10}>
                <Button onClick={onSubmit} disabled={!file || isFetching}>
                    Upload
                </Button>
            </Box>
        </Box>
    );
};

export default ImportComponent;
