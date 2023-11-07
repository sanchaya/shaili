import React, { Dispatch, SetStateAction, useState } from "react";
import { PanViewer } from "react-image-pan-zoom-rotate";
import { styled } from "@adminjs/design-system/styled-components";
import { Loader, Icon } from "@adminjs/design-system";

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
    text-align: center;
    background: #0000004a;
    @media (max-width: 800px) {
        height: auto;
    }
`;

interface IBookImageProps {
    image: string;
    alt?: string;
    setCapturing: Dispatch<SetStateAction<boolean>>;
    capturing: boolean;
    loading: boolean;
}

export const BookImage = ({
    image,
    alt,
    setCapturing,
    capturing,
}: IBookImageProps) => {
    const [dx, setDx] = useState(0);
    const [dy, setDy] = useState(0);
    const [zoom, setZoom] = useState(1);

    const resetAll = () => {
        setDx(0);
        setDy(0);
        setZoom(1);
    };

    const zoomIn = () => {
        setZoom(zoom + 0.2);
    };

    const zoomOut = () => {
        if (zoom > 1) {
            setZoom(zoom - 0.2);
        }
    };

    const onPan = (dx: number, dy: number) => {
        setDx(dx);
        setDy(dy);
    };

    const handleCapture = () => {
        if (!capturing) {
            setCapturing(true);
        } else {
            setCapturing(false);
        }
    };

    return (
        <>
            <ActionIcons>
                <ActionIcon onClick={zoomIn}>
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
                <ActionIcon onClick={zoomOut}>
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
            </CropIcon>
            <ImageInnerWrap
                onContextMenu={(e) => {
                    e.preventDefault();
                }}
            >
                {!image ? (
                    <Loader />
                ) : (
                    <PanViewer
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 1,
                            textAlign: "center",
                        }}
                        zoom={zoom}
                        setZoom={setZoom}
                        pandx={dx}
                        pandy={dy}
                        onPan={onPan}
                        key={dx}
                    >
                        <img
                            style={{
                                width: "66%",
                                height: "100%",
                            }}
                            src={image}
                            alt={alt}
                        />
                    </PanViewer>
                )}
            </ImageInnerWrap>
        </>
    );
};
