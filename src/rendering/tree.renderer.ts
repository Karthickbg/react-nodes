import { RenderTreeArgs } from '../types/tree.internal.types';
import {
  getEdgeBounds,
  getVisibleWorldRect,
  isNodeVisible,
  isRectVisible,
} from '../utils/renderer.utils';
import { drawEdges } from './tree.edges';
import { drawNode } from './tree.node';

// TODO: add virtualization, double buffering / blit if needed

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
  nodeRenderers = [],
}: RenderTreeArgs) {
  const layoutMap = new Map(layouts.map((layout) => [layout.node.id, layout]));
  const visibleRect = getVisibleWorldRect(width, height, viewport);
  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  ctx.save();

  // Apply viewport
  ctx.translate(viewport.x, viewport.y);

  ctx.scale(viewport.zoom, viewport.zoom);

  for (const layout of layouts) {
    // Draw edges
    const parentLayout = layoutMap.get(layout.node.parentId ?? '');

    if (parentLayout) {
      const edgeRect = getEdgeBounds({
        parent: parentLayout,
        layout,
        edgeType,
        orientation,
        showExpandCollapse,
        expandCollapseRenderer,
      });

      if (isRectVisible(edgeRect, visibleRect)) {
        drawEdges(
          ctx,
          edgeType,
          orientation,
          showExpandCollapse,
          layoutMap,
          layout,
          expandCollapseRenderer,
        );
      }
    }

    // Draw nodes
    if (isNodeVisible(layout, visibleRect)) {
      drawNode(
        ctx,
        layout,
        expandedNodes.has(layout.node.id),
        childrenMap.has(layout.node.id),
        orientation,
        showExpandCollapse,
        expandCollapseRenderer,
        nodeRenderers.find((renderer) => renderer.type === layout.node.type),
      );
    }
  }

  ctx.restore();

  return layouts;
}
