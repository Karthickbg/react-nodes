import { DrawTreeArgs } from "../types/canvas.internal.types";
import { drawEdges } from "./tree-canvas.edges";
import { calculateTreeLayout } from "./tree-canvas.layout";
import { drawNode } from "./tree-canvas.node";



export function drawTree({
    ctx,
    data,
    viewport,
    width,
    height,
    nodeWidth,
    nodeHeight,
    edgeGap,
    nodeGap,
}: DrawTreeArgs) {
    // Clear canvas
    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    ctx.save();

    // Apply viewport
    ctx.translate(
        viewport.x,
        viewport.y
    );

    ctx.scale(
        viewport.zoom,
        viewport.zoom
    );

    // Calculate node layout
    const layouts =
        calculateTreeLayout(
            data,
            {
                nodeWidth,
                nodeHeight,
                edgeGap,
                nodeGap,
            }
        );

    // Draw connections
    drawEdges(
        ctx,
        layouts
    );

    // Draw nodes
    for (const layout of layouts) {
        drawNode(
            ctx,
            layout
        );
    }

    ctx.restore();
}