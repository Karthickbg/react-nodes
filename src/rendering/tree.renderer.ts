import { RenderTreeArgs } from "../types/tree.internal.types";
import { drawEdges } from "./tree.edges";
import { buildChildrenMap, calculateTreeLayout } from "../utils/tree.layout";
import { drawNode } from "./tree.node";



export function renderTree({
    ctx,
    viewport,
    width,
    height,
    edgeType,
    expandedNodes,
    orientation,
    showExpandCollapse,
    expandCollapseRenderer,
    layouts,
    childrenMap,
    nodeRenderers = []
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

    // Draw connections
    drawEdges(
        ctx,
        layouts,
        edgeType,
        orientation,
        showExpandCollapse,
        expandCollapseRenderer
    );


    // Draw nodes
    for (const layout of layouts) {
        drawNode(
            ctx,
            layout,
            expandedNodes.has(layout.node.id),
            childrenMap.has(layout.node.id),
            orientation,
            showExpandCollapse,
            expandCollapseRenderer,
            nodeRenderers.find(renderer => renderer.type === layout.node.type)
        );
    }

    ctx.restore();

    return layouts;
}