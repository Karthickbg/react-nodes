'use client'

import { useCallback, useEffect, useRef } from "react";
import { TreeCanvasProps } from "../../types/tree.types";
import { NodeLayout, RenderTreeArgs, Viewport } from "../../types/tree.internal.types";
import { renderTree } from "../../rendering/tree.renderer";
import { getNodeAtPoint } from "../../utils/tree.hit-test";

export function TreeCanvas(props: TreeCanvasProps) {
  const {
    width = "100%",
    height = "100%",
    data,
    nodeWidth = 150,
    nodeHeight = 50,
    edgeGap = 150,
    nodeGap = 30,
    onNodeClick,
    onHoverNode,
  } = props;
  const hoveredNodeRef = useRef<string | null>(null);
  const layoutsRef = useRef<NodeLayout[]>([]);
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

    const args: RenderTreeArgs = {
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

     const layouts = renderTree(args);
     layoutsRef.current = layouts;
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

    const node = getNodeAtPoint(
        layoutsRef.current,
        event,
        canvas,
        viewportRef.current
    );

    if (node) {
        console.log("Clicked node:", node.node.id);
        onNodeClick?.(node.node);
    }
  }

const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
  const canvas = canvasRef.current;

  if (!canvas) {
    return;
  }

  const node = getNodeAtPoint(
        layoutsRef.current,
        event,
        canvas,
        viewportRef.current
  );

   if (node) {
    const nodeId = node.node.id ?? null;

    // Don't call onHover repeatedly for the same node
    if (hoveredNodeRef.current === nodeId) {
      return;
    }

    hoveredNodeRef.current = nodeId;
    console.log("Hovered node:", node.node.id);
    onHoverNode?.(node.node);
  } else {
    if (hoveredNodeRef.current !== null) {
      hoveredNodeRef.current = null;
      onHoverNode?.(null);
    }
  }
};

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
      onMouseMove={handleMouseMove}
    />
  )
}