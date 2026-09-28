import { RenderTreeArgs } from "../types/tree.internal.types";
import { drawEdges } from "./tree.edges";
import { buildChildrenMap, calculateTreeLayout } from "../utils/tree.layout";
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
    edgeType,
    expandedNodes,
}: RenderTreeArgs) {
    const children = buildChildrenMap(data);
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
            {
                nodeWidth,
                nodeHeight,
                edgeGap,
                nodeGap,
                expandedNodes,
                children,
            }
        );

    // Draw connections
    drawEdges(
        ctx,
        layouts,
        edgeType,
    );


    // Draw nodes
    for (const layout of layouts) {
        drawNode(
            ctx,
            layout,
            expandedNodes.has(layout.node.id),
            children.has(layout.node.id),
        );
    }

    ctx.restore();

    return layouts;
}