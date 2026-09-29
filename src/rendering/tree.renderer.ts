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
    levelGap,
    nodeGap,
    edgeType,
    expandedNodes,
    orientation,
    nodeRenderers,
    canvas
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
                levelGap,
                nodeGap,
                expandedNodes,
                children,
                orientation,
            }
        );

    // Draw connections
    drawEdges(
        ctx,
        layouts,
        edgeType,
        orientation
    );


    // Draw nodes
    for (const layout of layouts) {
        drawNode(
            ctx,
            layout,
            expandedNodes.has(layout.node.id),
            children.has(layout.node.id),
            orientation
        );
    }

    ctx.restore();

    return layouts;
}