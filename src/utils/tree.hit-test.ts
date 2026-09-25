import { NodeLayout, Viewport } from "../types/tree.internal.types";

export function getNodeAtPoint(
    layouts: NodeLayout[],
    event: React.MouseEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement,
    viewport: Viewport
): NodeLayout | undefined {
    const { x, y } = getWorldPoint(event, canvas, viewport);

    return layouts.find(layout =>
        x >= layout.x &&
        x <= layout.x + layout.width &&
        y >= layout.y &&
        y <= layout.y + layout.height
    );
}


export function getWorldPoint(
  event: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
  viewport: Viewport
) {
  const rect = canvas.getBoundingClientRect();

  const screenX = event.clientX - rect.left;
  const screenY = event.clientY - rect.top;

  return {
    x: (screenX - viewport.x) / viewport.zoom,
    y: (screenY - viewport.y) / viewport.zoom,
  };
}