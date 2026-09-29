import { NodeLayout } from '../types/tree.internal.types';
import { ExpandCollapseRendererProps } from '../types/tree.types';

export const drawEdges = (
  ctx: CanvasRenderingContext2D,
  layouts: NodeLayout[],
  edgeType: 'bezier' | 'polyline',
  orientation: 'horizontal' | 'vertical',
  showExpandCollapse: boolean,
  expandCollapseRenderer?: ExpandCollapseRendererProps,
) => {
  const isHorizontal = orientation === 'horizontal';
  const toCanvasPoint = (primary: number, secondary: number) =>
    isHorizontal ? { x: primary, y: secondary } : { x: secondary, y: primary };
  const layoutMap = new Map(layouts.map((layout) => [layout.node.id, layout]));

  ctx.lineWidth = 2;

  for (const layout of layouts) {
    const parentId = layout.node.parentId;

    if (!parentId) {
      continue;
    }

    const parent = layoutMap.get(parentId);

    if (!parent) {
      continue;
    }

    const parentWidth = parent.node.width ?? parent.width;
    const parentHeight = parent.node.height ?? parent.height;
    const childWidth = layout.node.width ?? layout.width;
    const childHeight = layout.node.height ?? layout.height;
    const iconPadding = showExpandCollapse
      ? isHorizontal
        ? (expandCollapseRenderer?.width ?? 10)
        : (expandCollapseRenderer?.height ?? 10)
      : 0;
    const start = toCanvasPoint(
      isHorizontal ? parent.x + parentWidth + iconPadding : parent.y + parentHeight + iconPadding,
      isHorizontal ? parent.y + parentHeight / 2 : parent.x + parentWidth / 2,
    );
    const end = toCanvasPoint(
      isHorizontal ? layout.x : layout.y,
      isHorizontal ? layout.y + childHeight / 2 : layout.x + childWidth / 2,
    );
    const middlePrimary = ((isHorizontal ? start.x : start.y) + (isHorizontal ? end.x : end.y)) / 2;
    const startSecondary = isHorizontal ? start.y : start.x;
    const endSecondary = isHorizontal ? end.y : end.x;

    ctx.save();
    ctx.strokeStyle = layout.node.edgeColor ?? '#bbbbbb';

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);

    if (edgeType === 'polyline') {
      const firstBend = toCanvasPoint(middlePrimary, startSecondary);
      const secondBend = toCanvasPoint(middlePrimary, endSecondary);
      ctx.lineTo(firstBend.x, firstBend.y);
      ctx.lineTo(secondBend.x, secondBend.y);
      ctx.lineTo(end.x, end.y);
    } else {
      const firstControl = toCanvasPoint(middlePrimary, startSecondary);
      const secondControl = toCanvasPoint(middlePrimary, endSecondary);
      ctx.bezierCurveTo(
        firstControl.x,
        firstControl.y,
        secondControl.x,
        secondControl.y,
        end.x,
        end.y,
      );
    }

    ctx.setLineDash([layout.node.lineType === 'dashed' ? 5 : 0]);

    ctx.stroke();
    ctx.restore();
  }
};
