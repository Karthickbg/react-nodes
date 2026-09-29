import { NodeLayout } from "../types/tree.internal.types";
import { CustomNodeRendererProps, ExpandCollapseRendererProps } from "../types/tree.types";

export const drawNode = (
    ctx: CanvasRenderingContext2D,
    layout: NodeLayout,
    isExpanded: boolean,
    hasChildren: boolean,
    orientation: "horizontal" | "vertical",
    showExpandCollapse: boolean,
    expandCollapseRenderer: ExpandCollapseRendererProps | undefined,
    nodeRenderer?: CustomNodeRendererProps
) => {
    const {
        node,
        x,
        y,
    } = layout;
    const width = node.width ?? layout.width;
    const height = node.height ?? layout.height;

    ctx.save();
    if (nodeRenderer) {
        ctx.save();
        try {
            nodeRenderer.draw(
                { ctx, rect: new DOMRect(x, y, width, height) },
                node
            );
        } finally {
            ctx.restore();
        }
    } else {
        // Card background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y, width, height);

        // Card border
        ctx.strokeStyle = "#dddddd";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);

        // Title
        ctx.fillStyle = "#666666";
        ctx.font = "12px sans-serif";
        ctx.fillText(node.title, x + 10, y + 20);

        // Value
        ctx.fillStyle = "#111111";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(node.value, x + 10, y + 40);
    }

    if (hasChildren && showExpandCollapse) {
        const iconWidth = expandCollapseRenderer?.width ?? 10;
        const iconHeight = expandCollapseRenderer?.height ?? 10;
        const iconRect = orientation === "horizontal"
            ? new DOMRect(x + width, y + (height - iconHeight) / 2, iconWidth, iconHeight)
            : new DOMRect(x + (width - iconWidth) / 2, y + height, iconWidth, iconHeight);

        if (expandCollapseRenderer) {
            ctx.save();
            try {
                expandCollapseRenderer.draw(
                    { ctx, rect: iconRect },
                    isExpanded,
                    orientation,
                    node
                );
            } finally {
                ctx.restore();
            }
        } else {
            const iconX = iconRect.x + iconWidth / 2;
            const iconY = iconRect.y + iconHeight / 2;
            ctx.beginPath();
            ctx.arc(iconX, iconY, Math.min(iconWidth, iconHeight) / 2, 0, Math.PI * 2, false);
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
    }
    ctx.restore();

};