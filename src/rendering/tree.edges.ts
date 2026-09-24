import { NodeLayout } from "../types/tree.internal.types";

export const drawEdges = (
    ctx: CanvasRenderingContext2D,
    layouts: NodeLayout[]
) => {
    const layoutMap = new Map(
        layouts.map(layout => [
            layout.node.id,
            layout,
        ])
    );

    ctx.strokeStyle = "#c7c7c7";
    ctx.lineWidth = 2;

    for (const layout of layouts) {
        const parentId =
            layout.node.parentId;

        if (!parentId) {
            continue;
        }

        const parent =
            layoutMap.get(parentId);

        if (!parent) {
            continue;
        }

        const startX =
            parent.x + parent.width;

        const startY =
            parent.y + parent.height / 2;

        const endX = layout.x;

        const endY =
            layout.y + layout.height / 2;

        const middleX =
            (startX + endX) / 2;

        ctx.beginPath();

        ctx.moveTo(
            startX,
            startY
        );

        ctx.bezierCurveTo(
            middleX,
            startY,
            middleX,
            endY,
            endX,
            endY
        );

        ctx.stroke();
    }
};