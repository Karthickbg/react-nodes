import { NodeLayout } from "../types/tree.internal.types";

export const drawEdges = (
    ctx: CanvasRenderingContext2D,
    layouts: NodeLayout[],
    edgeType: "bezier" | "polyline",
    orientation: "horizontal" | "vertical",
) => {
    const isHorizontal = orientation === "horizontal";
    const toCanvasPoint = (primary: number, secondary: number) =>
        isHorizontal
            ? { x: primary, y: secondary }
            : { x: secondary, y: primary };
    const layoutMap = new Map(
        layouts.map(layout => [
            layout.node.id,
            layout,
        ])
    );

    ctx.strokeStyle = "#bbbbbb";
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

        const iconPadding = 10;
        const start = toCanvasPoint(
            isHorizontal ? parent.x + parent.width + iconPadding : parent.y + parent.height + iconPadding,
            isHorizontal ? parent.y + parent.height / 2 : parent.x + parent.width / 2
        );
        const end = toCanvasPoint(
            isHorizontal ? layout.x : layout.y,
            isHorizontal ? layout.y + layout.height / 2 : layout.x + layout.width / 2
        );
        const middlePrimary = (
            (isHorizontal ? start.x : start.y) +
            (isHorizontal ? end.x : end.y)
        ) / 2;
        const startSecondary = isHorizontal ? start.y : start.x;
        const endSecondary = isHorizontal ? end.y : end.x;

        ctx.save();

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);

        if (edgeType === "polyline") {
            const firstBend = toCanvasPoint(middlePrimary, startSecondary);
            const secondBend = toCanvasPoint(middlePrimary, endSecondary);
            ctx.lineTo(firstBend.x, firstBend.y);
            ctx.lineTo(secondBend.x, secondBend.y);
            ctx.lineTo(end.x, end.y);
        } else {
            const firstControl = toCanvasPoint(middlePrimary, startSecondary);
            const secondControl = toCanvasPoint(middlePrimary, endSecondary);
            ctx.bezierCurveTo(
                firstControl.x,
                firstControl.y,
                secondControl.x,
                secondControl.y,
                end.x,
                end.y
            );
        }

        ctx.setLineDash([layout.node.lineType === "dashed" ? 5 : 0]);

        ctx.stroke();
        ctx.restore();
    }
};