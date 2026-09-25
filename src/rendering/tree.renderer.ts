import { RenderTreeArgs } from "../types/tree.internal.types";
import { drawEdges } from "./tree.edges";
import { calculateTreeLayout } from "../utils/tree.layout";
import { drawNode } from "./tree.node";



export function renderTree({
    ctx,
    data,
    viewport,
    width,
    height,
    nodeWidth,
    nodeHeight,
    edgeGap,
    nodeGap,
}: RenderTreeArgs) {
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
    return layouts;
}