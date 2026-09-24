import { NodeLayout } from "../types/tree.internal.types";

export const drawNode = (
    ctx: CanvasRenderingContext2D,
    layout: NodeLayout
) => {
    const {
        node,
        x,
        y,
        width,
        height,
    } = layout;

    // Card background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
        x,
        y,
        width,
        height
    );

    // Card border
    ctx.strokeStyle = "#dddddd";
    ctx.lineWidth = 1;

    ctx.strokeRect(
        x,
        y,
        width,
        height
    );

    // Title
    ctx.fillStyle = "#666666";
    ctx.font = "16px sans-serif";

    ctx.fillText(
        node.title,
        x + 20,
        y + 30
    );

    // Value
    ctx.fillStyle = "#111111";
    ctx.font = "bold 28px sans-serif";

    ctx.fillText(
        node.value,
        x + 20,
        y + 70
    );
};