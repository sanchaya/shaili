import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Box, Button, H5, Icon, Label, ModalProps, Text } from "@adminjs/design-system";

// Drop-in for the design-system Modal on a native <dialog>: Esc and backdrop clicks close it,
// and the body scrolls while title and buttons stay put.
const Popup: React.FC<ModalProps> = ({ label, icon, title, subTitle, variant, buttons, onClose, onOverlayClick, children }) => {
    const ref = useRef<HTMLDialogElement>(null);
    const dismiss = onOverlayClick ?? onClose;

    useEffect(() => {
        ref.current?.showModal();
    }, []);

    return ReactDOM.createPortal(
        <dialog
            ref={ref}
            className="popup"
            onCancel={(event) => {
                event.preventDefault(); // parent unmounts us via onClose
                onClose?.();
            }}
            onMouseDown={(event) => event.target === ref.current && dismiss?.()}
        >
            <Box bg="filterBg" color="text" flex flexDirection="column" style={{ maxHeight: "90vh" }}>
                <Box px="xxl" pt="xxl" pb="lg" style={{ position: "relative" }}>
                    {label && (
                        <Label size="lg" variant={variant}>
                            {icon && <Icon icon={icon} />}
                            {label}
                        </Label>
                    )}
                    {title && <H5 mb="sm">{title}</H5>}
                    {subTitle && <Text>{subTitle}</Text>}
                    {onClose && (
                        <Button
                            type="button"
                            size="icon"
                            variant="text"
                            rounded
                            onClick={onClose}
                            style={{ position: "absolute", top: 16, right: 16 }}
                        >
                            <Icon icon="X" />
                        </Button>
                    )}
                </Box>
                <Box px="xxl" style={{ overflowY: "auto", flex: 1 }}>
                    {children}
                </Box>
                {!!buttons?.length && (
                    <Box flex justifyContent="flex-end" px="xxl" py="xl" style={{ gap: 8 }}>
                        {buttons.map((buttonProps, key) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <Button key={key} type="button" {...buttonProps} />
                        ))}
                    </Box>
                )}
            </Box>
        </dialog>,
        document.body
    );
};

export default Popup;
