import { useCallback } from "react";
import { UseTreeCanvasActions } from "../types/tree.internal.types";
import { clampZoom } from "../utils/tree.viewport";

export const useTreeCanvasActions = ({
    canvasRef,
    viewportRef,
    setViewport,
    layoutsRef,
    minZoom,
    maxZoom,
    requestRender,
}: UseTreeCanvasActions) => {

    const setZoom = useCallback(
        (zoom: number) => {
            const clampedZoom = clampZoom(zoom, minZoom, maxZoom);
            if (clampedZoom === null) return;

            setViewport({
                ...viewportRef.current,
                zoom: clampedZoom,
            });

            requestRender();
        },
        [
            minZoom,
            maxZoom,
            requestRender,
            setViewport,
        ]
    );

    const moveTo = useCallback(
        (x: number, y: number) => {
            if (!Number.isFinite(x) || !Number.isFinite(y)) return;

            setViewport({
                ...viewportRef.current,
                x,
                y,
            });

            requestRender();
        },
        [requestRender, setViewport]
    );

    const moveBy = useCallback(
        (dx: number, dy: number) => {
            if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;
            const viewport = viewportRef.current;
            const x = viewport.x + dx;
            const y = viewport.y + dy;
            if (!Number.isFinite(x) || !Number.isFinite(y)) return;

            setViewport({
                ...viewport,
                x,
                y,
            });

            requestRender();
        },
        [requestRender, setViewport]
    );

    const centerNode = useCallback(
        (nodeId: string) => {
            const viewport = viewportRef.current;
            const currentLayout = layoutsRef.current.find(
                layout => layout.node.id === nodeId
            );
            if (!currentLayout) return;

            setViewport({
                ...viewport,
                x: (canvasRef.current?.clientWidth || 0) / 2 -
                    (currentLayout.x + currentLayout.width / 2) * viewport.zoom,
                y: (canvasRef.current?.clientHeight || 0) / 2 -
                    (currentLayout.y + currentLayout.height / 2) * viewport.zoom,
            });

            requestRender();
        },
        [requestRender, setViewport]
    );

    return {
        centerNode,
        setZoom,
        moveTo,
        moveBy
    };
};