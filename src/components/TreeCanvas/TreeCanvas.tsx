import { useCallback, useEffect, useRef } from "react";
import { CanvasProps } from "../../types/canvas.types";
import { DrawTreeArgs, Viewport } from "../../types/canvas.internal.types";
import { drawTree } from "../../Renderer/tree-canvas.lib";

export function TreeCanvas(props: CanvasProps) {
  const {
    width = "100%",
    height = "100%",
    data,
    nodeWidth = 100,
    nodeHeight = 50,
    edgeGap = 20,
    nodeGap = 20,
  } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<Viewport>({
    x: 0,
    y: 0,
    zoom: 1,
  });

  const isDraggingRef = useRef(false);

  const dragStartRef = useRef({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      const viewport = viewportRef.current;

      const zoomFactor =
        event.deltaY > 0 ? 0.9 : 1.1;

      viewport.zoom *= zoomFactor;

      viewport.zoom = Math.max(
        0.2,
        Math.min(viewport.zoom, 3)
      );

      render();
    };

    canvas.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, []);


  const render = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const args: DrawTreeArgs = {
      ctx,
      data,

      viewport: viewportRef.current,

      nodeWidth,
      nodeHeight,

      edgeGap,
      nodeGap,

      width: canvas.clientWidth,
      height: canvas.clientHeight,
    };

    drawTree(args);
  }, [
    data,
    nodeWidth,
    nodeHeight,
    edgeGap,
    nodeGap,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const resize = () => {
      const rect =
        canvas.getBoundingClientRect();

      const dpr =
        window.devicePixelRatio || 1;

      canvas.width =
        rect.width * dpr;

      canvas.height =
        rect.height * dpr;

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      render();
    };

    resize();

    const observer =
      new ResizeObserver(resize);

    observer.observe(canvas);

    return () => {
      observer.disconnect();
    };
  }, [render]);

  const handlePointerDown = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    isDraggingRef.current = true;

    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    if (!isDraggingRef.current) {
      return;
    }

    const dx =
      event.clientX -
      dragStartRef.current.x;

    const dy =
      event.clientY -
      dragStartRef.current.y;

    const viewport =
      viewportRef.current;

    viewport.x += dx;
    viewport.y += dy;

    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    render();
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = (canvas as HTMLCanvasElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // alert(`Clicked at: (${x}, ${y})`);
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      id="tree-canvas"
      className="tree-canvas"
      style={{ width: width, height: height, display: "block", overscrollBehavior: "contain" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  )
}