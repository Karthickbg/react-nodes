import { NodeLayout, Viewport } from '../types/tree.internal.types';
import { ExpandCollapseRendererProps } from '../types/tree.types';

export function getVisibleWorldRect(
  width: number,
  height: number,
  viewport: Viewport,
  overscan = 200,
) {
  const x = -viewport.x / viewport.zoom;
  const y = -viewport.y / viewport.zoom;
  const w = width / viewport.zoom;
  const h = height / viewport.zoom;

  return {
    x: x - overscan,
    y: y - overscan,
    width: w + overscan * 2,
    height: h + overscan * 2,
  };
}

export const isRectVisible = (
  rect: { x: number; y: number; width: number; height: number },
  viewportRect: { x: number; y: number; width: number; height: number },
) => {
  return (
    rect.x < viewportRect.x + viewportRect.width &&
    rect.x + rect.width > viewportRect.x &&
    rect.y < viewportRect.y + viewportRect.height &&
    rect.y + rect.height > viewportRect.y
  );
};

export const isNodeVisible = (
  node: NodeLayout,
  viewportRect: { x: number; y: number; width: number; height: number },
) => {
  return isRectVisible(node, viewportRect);
};

export const getEdgeBounds = ({
  parent,
  layout,
  edgeType,
  orientation,
  showExpandCollapse,
  expandCollapseRenderer,
}: {
  parent: NodeLayout;
  layout: NodeLayout;
  edgeType: 'bezier' | 'polyline';
  orientation: 'horizontal' | 'vertical';
  showExpandCollapse: boolean;
  expandCollapseRenderer?: ExpandCollapseRendererProps;
}) => {
  const isHorizontal = orientation === 'horizontal';
  const parentWidth = parent.node.width ?? parent.width;
  const parentHeight = parent.node.height ?? parent.height;
  const childWidth = layout.node.width ?? layout.width;
  const childHeight = layout.node.height ?? layout.height;
  const iconPadding = showExpandCollapse
    ? isHorizontal
      ? (expandCollapseRenderer?.width ?? 10)
      : (expandCollapseRenderer?.height ?? 10)
    : 0;

  const start = isHorizontal
    ? {
        x: parent.x + parentWidth + iconPadding,
        y: parent.y + parentHeight / 2,
      }
    : {
        x: parent.x + parentWidth / 2,
        y: parent.y + parentHeight + iconPadding,
      };

  const end = isHorizontal
    ? {
        x: layout.x,
        y: layout.y + childHeight / 2,
      }
    : {
        x: layout.x + childWidth / 2,
        y: layout.y,
      };

  const middlePrimary = ((isHorizontal ? start.x : start.y) + (isHorizontal ? end.x : end.y)) / 2;
  const startSecondary = isHorizontal ? start.y : start.x;
  const endSecondary = isHorizontal ? end.y : end.x;

  const points = [start];

  if (edgeType === 'polyline') {
    const firstBend = isHorizontal
      ? { x: middlePrimary, y: startSecondary }
      : { x: startSecondary, y: middlePrimary };
    const secondBend = isHorizontal
      ? { x: middlePrimary, y: endSecondary }
      : { x: endSecondary, y: middlePrimary };

    points.push(firstBend, secondBend, end);
  } else {
    const firstControl = isHorizontal
      ? { x: middlePrimary, y: startSecondary }
      : { x: startSecondary, y: middlePrimary };
    const secondControl = isHorizontal
      ? { x: middlePrimary, y: endSecondary }
      : { x: endSecondary, y: middlePrimary };

    points.push(firstControl, secondControl, end);
  }

  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxX = Math.max(...points.map((point) => point.x));
  const maxY = Math.max(...points.map((point) => point.y));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};
