import { NodeLayout } from "../types/tree.internal.types";

export const drawNode = (
    ctx: CanvasRenderingContext2D,
    layout: NodeLayout,
    isExpanded: boolean,
    hasChildren: boolean
) => {
    const {
        node,
        x,
        y,
        width,
        height,
    } = layout;

    ctx.save();

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
    ctx.font = "12px sans-serif";

    ctx.fillText(
        node.title,
        x + 10,
        y + 20
    );

    // Value
    ctx.fillStyle = "#111111";
    ctx.font = "bold 18px sans-serif";

    ctx.fillText(
        node.value,
        x + 10,
        y + 40
    );

    if (hasChildren) {
        ctx.beginPath();
        ctx.arc(x + width + 5, y + height / 2, 5, 0, Math.PI * 2, false);
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.strokeStyle = "#9c9b9b";
        ctx.moveTo(x + width + (isExpanded ? 6 : 4), y + (height / 2) - 3);
        ctx.lineTo(x + width + (isExpanded ? 3 : 7), y + height / 2);
        ctx.lineTo(x + width + (isExpanded ? 6 : 4), y + (height / 2) + 3);
        ctx.stroke();
        ctx.closePath();
    }
    ctx.restore();

};