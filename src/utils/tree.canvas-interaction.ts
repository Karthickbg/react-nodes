import { NodeLayout, Viewport } from '../types/tree.internal.types';

export const getNodeAtPoint = (
  layouts: NodeLayout[],
  event: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
  viewport: Viewport,
  orientation: 'horizontal' | 'vertical',
  showExpandCollapse = true,
  expandCollapseWidth = 10,
  expandCollapseHeight = 10,
): { node: NodeLayout | undefined; toggle: NodeLayout | undefined } => {
  const { x, y } = getWorldPoint(event, canvas, viewport);

  return {
    node: layouts.find(
      (layout) =>
        x >= layout.x &&
        x <= layout.x + layout.width &&
        y >= layout.y &&
        y <= layout.y + layout.height,
    ),
    toggle: showExpandCollapse
      ? layouts.find((layout) =>
          orientation === 'horizontal'
            ? x >= layout.x + layout.width &&
              x <= layout.x + layout.width + expandCollapseWidth &&
              y >= layout.y + layout.height / 2 - expandCollapseHeight / 2 &&
              y <= layout.y + layout.height / 2 + expandCollapseHeight / 2
            : x >= layout.x + layout.width / 2 - expandCollapseWidth / 2 &&
              x <= layout.x + layout.width / 2 + expandCollapseWidth / 2 &&
              y >= layout.y + layout.height &&
              y <= layout.y + layout.height + expandCollapseHeight,
        )
      : undefined,
  };
};

export const getWorldPoint = (
  event: PointerEvent | React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
  viewport: Viewport,
) => {
  const { screenX, screenY } = getPointerPosition(event, canvas);

  return {
    screenX,
    screenY,
    x: (screenX - viewport.x) / viewport.zoom,
    y: (screenY - viewport.y) / viewport.zoom,
  };
};

export const getPointerPosition = (
  event: PointerEvent | React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
) => {
  const rect = canvas.getBoundingClientRect();

  return {
    screenX: event.clientX - rect.left,
    screenY: event.clientY - rect.top,
  };
};
