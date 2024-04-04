import React, {
    Dispatch,
    SetStateAction,
    useEffect,
    useRef,
    useState,
} from "react";
import { styled } from "@adminjs/design-system/styled-components";
import { Loader, Icon, Button } from "@adminjs/design-system";
import { Cropper, ReactCropperElement } from "react-cropper";

const CropIcon = styled.div`
    position: absolute;
    left: 10px;
    z-index: 2;
    top: 10px;
    user-select: none;
    background: #fff;
    box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32);
    display: flex;
    flex-direction: column;
`;

const ActionIcons = styled.div`
    position: absolute;
    right: 10px;
    z-index: 2;
    top: 10px;
    user-select: none;
    background: #fff;
    display: flex;
    flex-direction: column;
    box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32);
`;

const ActionButton = styled(Button)`
    background: #fff;
    border-radius: 0px;
    border-bottom: 1px solid #ccc;
`;

const ImageInnerWrap = styled.div`
    height: 720px;
    width: 100%;
    text-align: center;
    background: #0000004a;
    @media (max-width: 800px) {
        height: auto;
    }
`;

interface IBookImageProps {
    image: string;
    setCapturing: Dispatch<SetStateAction<boolean>>;
    capturing: boolean;
    setTag: Dispatch<SetStateAction<string>>;
}

export const BookImage = ({
    image,
    setCapturing,
    capturing,
    setTag,
}: IBookImageProps) => {
    const cropperRef = useRef<ReactCropperElement>(null);
    const [cropperMode, setCropperMode] = useState<string>("crop");

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === "Enter" && capturing) {
                cropImage();
            } else if (e.key === "Escape") {
                setCapturing(false);
                resetAll();
            }
        };

        document.addEventListener("keydown", handleKeyPress);
        return () => {
            document.removeEventListener("keydown", handleKeyPress);
        };
    }, [capturing]);

    const onCropStart = () => {
        setCapturing(true);
    };

    const resetAll = () => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            cropper.reset();
            cropper.clear();
            setCapturing(false);
        }
    };

    const zoom = (factor: number) => () => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            cropper.zoom(factor);
        }
    };

    const cropImage = () => {
        if (cropperRef.current) {
            const cropper = cropperRef.current?.cropper;
            const image = cropper.getCroppedCanvas().toDataURL();
            if (image) {
                setTag(image);
                resetAll();
                setCapturing(false);
            }
        }
    };

    const wheelZoom = (event) => {
        if (event.detail.ratio > 3) {
            event.preventDefault();
        }
    };

    const changeMode = (mode: "crop" | "move") => () => {
        const cropper = cropperRef.current?.cropper;
        if (cropper) {
            setCropperMode(mode);
            cropper.setDragMode(mode);
        }
    };

    return (
        <>
            <ActionIcons>
                <ActionButton
                    onClick={zoom(1)}
                    variant="text"
                    color="primary"
                    size="icon"
                    disabled={!image}
                    title="Zoom In"
                >
                    <Icon
                        icon="ZoomIn"
                        style={{
                            height: "100%",
                            width: "100%",
                        }}
                    />
                </ActionButton>
                <ActionButton
                    onClick={zoom(-1)}
                    variant="text"
                    color="primary"
                    size="icon"
                    disabled={!image}
                    title="Zoom Out"
                >
                    <Icon
                        icon="ZoomOut"
                        style={{
                            height: "100%",
                            width: "100%",
                        }}
                    />
                </ActionButton>
                <ActionButton
                    onClick={resetAll}
                    style={{
                        borderBottom: "none",
                    }}
                    variant="text"
                    color="primary"
                    size="icon"
                    disabled={!image}
                    title="Reset"
                >
                    <Icon
                        icon="RefreshCcw"
                        style={{
                            height: "100%",
                            width: "100%",
                        }}
                    />
                </ActionButton>
            </ActionIcons>
            <CropIcon>
                <ActionButton
                    onClick={cropImage}
                    variant="text"
                    color="primary"
                    size="icon"
                    disabled={!capturing}
                    title="Save"
                >
                    <Icon
                        icon="Save"
                        style={{
                            height: "100%",
                            width: "100%",
                        }}
                    />
                </ActionButton>
                <ActionButton
                    onClick={changeMode("crop")}
                    variant="text"
                    color="primary"
                    size="icon"
                    disabled={!image || cropperMode === "crop"}
                    title="Toggle crop mode"
                >
                    <Icon
                        icon="Crop"
                        style={{
                            height: "100%",
                            width: "100%",
                        }}
                    />
                </ActionButton>
                <ActionButton
                    onClick={changeMode("move")}
                    variant="text"
                    color="primary"
                    size="icon"
                    disabled={!image || cropperMode === "move"}
                    title="Toggle Move mode"
                >
                    <Icon
                        icon="Move"
                        style={{
                            height: "100%",
                            width: "100%",
                        }}
                    />
                </ActionButton>
            </CropIcon>
            <ImageInnerWrap
                onContextMenu={(e: { preventDefault: () => void }) => {
                    e.preventDefault();
                }}
            >
                {!image ? (
                    <Loader />
                ) : (
                    <Cropper
                        src={image}
                        autoCrop={false}
                        aspectRatio={1}
                        style={{ height: 720, width: "100%" }}
                        guides={false}
                        dragMode={"crop"}
                        ref={cropperRef}
                        viewMode={2}
                        minCropBoxHeight={10}
                        minCropBoxWidth={10}
                        background={false}
                        responsive={true}
                        restore={false}
                        wheelZoomRatio={1}
                        cropstart={onCropStart}
                        zoom={wheelZoom}
                    />
                )}
            </ImageInnerWrap>
        </>
    );
};
