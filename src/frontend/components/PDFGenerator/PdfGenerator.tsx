import React, { useState } from "react";
import { Button, Icon } from "@adminjs/design-system";

const PdfGenerator = ({ bookId, bookName, loading }) => {
    const BASE_URL = (window as any).AdminJS.env.BASE_URL;
    const [pdfLoading, setPdfLoading] = useState(false);

    const handleDownloadClick = async () => {
        try {
            setPdfLoading(true);

            const response = await fetch(
                `${BASE_URL}/pdf-generator?bookId=` + bookId
            );
            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = bookName;

            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error initiating download:", error);
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <div>
            <Button
                onClick={handleDownloadClick}
                disabled={pdfLoading || loading}
            >
                {pdfLoading ? (
                    <Icon
                        icon="Loader"
                        spin
                        style={{
                            color: "rgb(48, 64, 214)",
                        }}
                    />
                ) : (
                    <Icon
                        icon="Download"
                        size={20}
                        style={{
                            lineHeight: "0px",
                        }}
                    />
                )}
            </Button>
        </div>
    );
};

export default PdfGenerator;
