import React, { Dispatch, SetStateAction, useRef } from "react";
import { styled } from "@adminjs/design-system/styled-components";
import { Loader, Icon } from "@adminjs/design-system";
import { Cropper, CropperRef } from "react-advanced-cropper";

const CropIcon = styled.div`
    position: absolute;
    left: 10px;
    z-index: 2;
    top: 10px;
    user-select: none;
    border-radius: 2;
    background: #fff;
    box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32);
`;

const ActionIcons = styled.div`
    position: absolute;
    right: 10px;
    z-index: 2;
    top: 10px;
    user-select: none;
    border-radius: 2;
    background: #fff;
    box-shadow: 0px 2px 6px rgba(53, 67, 93, 0.32);
`;

const ActionIcon = styled.div`
    text-align: center;
    cursor: pointer;
    height: 40;
    width: 40;
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
    const cropperRef = useRef<CropperRef>(null);

    const resetStencil = () => {
        cropperRef.current?.setCoordinates({
            width: 400,
            height: 400,
            left: 1007.5,
            top: 1472.5,
        });
    };

    const resetAll = () => {
        if (cropperRef.current) {
            cropperRef.current.setCoordinates(({ imageSize }) => imageSize);
            setCapturing(false);
            resetStencil();
        }
    };

    const zoom = (factor: number) => () => {
        const cropper = cropperRef.current;
        if (cropper) {
            cropper.zoomImage(factor);
        }
    };

    const handleCapture = () => {
        if (!capturing) {
            setCapturing(true);
        } else {
            setCapturing(false);
        }
    };

    const cropImage = () => {
        if (cropperRef.current) {
            const image = cropperRef.current.getCanvas()?.toDataURL();
            if (image) {
                setTag(image);
                setCapturing(false);
                resetAll();
                resetStencil();
            }
        }
    };

    return (
        <>
            <ActionIcons>
                <ActionIcon onClick={zoom(2)}>
                    <Icon
                        icon="ZoomIn"
                        style={{
                            height: "100%",
                            width: "100%",
                            padding: 10,
                            boxSizing: "border-box",
                            color: "#4C68C1",
                        }}
                    />
                </ActionIcon>
                <ActionIcon onClick={zoom(0.5)}>
                    <Icon
                        icon="ZoomOut"
                        style={{
                            height: "100%",
                            width: "100%",
                            padding: 10,
                            boxSizing: "border-box",
                            color: "#4C68C1",
                        }}
                    />
                </ActionIcon>
                <ActionIcon
                    onClick={resetAll}
                    style={{
                        borderBottom: "none",
                    }}
                >
                    <Icon
                        icon="RefreshCcw"
                        style={{
                            height: "100%",
                            width: "100%",
                            padding: 10,
                            boxSizing: "border-box",
                            color: "#4C68C1",
                        }}
                    />
                </ActionIcon>
            </ActionIcons>
            <CropIcon>
                <ActionIcon onClick={handleCapture}>
                    <Icon
                        icon="Crop"
                        style={{
                            height: "100%",
                            width: "100%",
                            padding: 10,
                            boxSizing: "border-box",
                            color: "#4C68C1",
                        }}
                    />
                </ActionIcon>
                {capturing && (
                    <>
                        <ActionIcon onClick={cropImage}>
                            <Icon
                                icon="Save"
                                style={{
                                    height: "100%",
                                    width: "100%",
                                    padding: 10,
                                    boxSizing: "border-box",
                                    color: "#4C68C1",
                                }}
                            />
                        </ActionIcon>
                        <ActionIcon onClick={handleCapture}>
                            <Icon
                                icon="X"
                                style={{
                                    height: "100%",
                                    width: "100%",
                                    padding: 10,
                                    boxSizing: "border-box",
                                    color: "#4C68C1",
                                }}
                            />
                        </ActionIcon>
                    </>
                )}
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
                        ref={cropperRef}
                        src={image}
                        stencilProps={{
                            movable: capturing,
                            resizable: capturing,
                            scalable: capturing,
                            lines: capturing,
                            handlers: capturing
                                ? {
                                      eastNorth: true,
                                      north: false,
                                      westNorth: true,
                                      west: false,
                                      westSouth: true,
                                      south: false,
                                      eastSouth: true,
                                      east: false,
                                  }
                                : "",
                            overlayClassName: !capturing
                                ? "advanced-cropper-stencil-overlay--faded"
                                : "",
                        }}
                        defaultSize={{
                            width: 400,
                            height: 400,
                        }}
                    />
                )}
            </ImageInnerWrap>
        </>
    );
};
