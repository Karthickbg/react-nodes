import { NodeLayout, Viewport } from "../types/tree.internal.types";

export const getNodeAtPoint = (
  layouts: NodeLayout[],
  event: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
  viewport: Viewport
): NodeLayout | undefined => {
  const { x, y } = getWorldPoint(event, canvas, viewport);

  return layouts.find(layout =>
    x >= layout.x &&
    x <= layout.x + layout.width &&
    y >= layout.y &&
    y <= layout.y + layout.height
  );
}


export const getWorldPoint = (
  event: PointerEvent | React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
  viewport: Viewport
) => {

  const { screenX, screenY } = getPointerPosition(event, canvas);

  return {
    screenX,
    screenY,
    x: (screenX - viewport.x) / viewport.zoom,
    y: (screenY - viewport.y) / viewport.zoom,
  };
}

export const getPointerPosition = (
  event: PointerEvent | React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
) => {

  const rect = canvas.getBoundingClientRect();

  return {
    screenX: event.clientX - rect.left,
    screenY: event.clientY - rect.top,
  };
}