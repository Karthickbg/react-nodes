import { NodeLayout } from "../types/tree.internal.types";

export const drawNode = (
    ctx: CanvasRenderingContext2D,
    layout: NodeLayout,
    isExpanded: boolean,
    hasChildren: boolean,
    orientation: "horizontal" | "vertical"
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
        const iconX = orientation === "horizontal"
            ? x + width + 5
            : x + width / 2;
        const iconY = orientation === "horizontal"
            ? y + height / 2
            : y + height + 5;

        ctx.beginPath();
        ctx.arc(iconX, iconY, 5, 0, Math.PI * 2, false);
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.strokeStyle = "#9c9b9b";
        if (orientation === "horizontal") {
            ctx.moveTo(iconX + (isExpanded ? 1 : -1), iconY - 3);
            ctx.lineTo(iconX + (isExpanded ? -2 : 2), iconY);
            ctx.lineTo(iconX + (isExpanded ? 1 : -1), iconY + 3);
        } else {
            ctx.moveTo(iconX - 3, iconY + (isExpanded ? 1 : -1));
            ctx.lineTo(iconX, iconY + (isExpanded ? -2 : 2));
            ctx.lineTo(iconX + 3, iconY + (isExpanded ? 1 : -1));
        }
        ctx.stroke();
        ctx.closePath();
    }
    ctx.restore();

};