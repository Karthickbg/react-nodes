'use client'

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { TreeCanvasHandle, TreeCanvasProps } from "../../types/tree.types";
import { NodeLayout, RenderTreeArgs, Viewport } from "../../types/tree.internal.types";
import { renderTree } from "../../rendering/tree.renderer";
import { getNodeAtPoint, getPointerPosition, getWorldPoint } from "../../utils/tree.canvas-interaction";

export const TreeCanvas = forwardRef<
  TreeCanvasHandle,
  TreeCanvasProps
>((props, ref) => {
  const {
    width = "100%",
    height = "100%",
    data,
    nodeWidth = 150,
    nodeHeight = 50,
    edgeGap = 150,
    nodeGap = 30,
    edgeType = "bezier",
    minZoom = 0.2,
    maxZoom = 3,
    initialZoom = 1,
    zoomEnabled = true,
    panEnabled = true,
    nodeRenderers,
    onNodeClick,
    onHoverNode,
    onDoubleClickNode,
  } = props;
  const clickTimeout = useRef<number | null>(null);
  const hoverTimeout = useRef<number | null>(null);
  const hoveredNodeRef = useRef<string | null>(null);
  const layoutsRef = useRef<NodeLayout[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<Viewport>({
    x: 0,
    y: 0,
    zoom: initialZoom,
  });

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({
    x: 0,
    y: 0,
  });
  const pointersRef = useRef(
    new Map<number, { x: number; y: number }>()
  );

  const pinchRef = useRef<{
    startDistance: number;
    startZoom: number;
    worldX: number;
    worldY: number;
  } | null>(null);

  const expandedNodesRef = useRef<Set<string>>(
    new Set(data.map(node => node.id))
  );

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
      edgeType,
      width: canvas.clientWidth,
      height: canvas.clientHeight,
      expandedNodes: expandedNodesRef.current,
    };

    const layouts = renderTree(args);
    layoutsRef.current = layouts;
  }, [
    data,
    nodeWidth,
    nodeHeight,
    edgeGap,
    nodeGap,
    edgeType,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (!zoomEnabled) return;

      const viewport = viewportRef.current;
      const { screenX, screenY, x, y } = getWorldPoint(event as unknown as React.MouseEvent<HTMLCanvasElement>, canvas, viewport);

      const zoomFactor =
        event.deltaY > 0 ? 0.9 : 1.1;

      viewport.zoom *= zoomFactor;

      viewport.zoom = Math.max(
        minZoom,
        Math.min(viewport.zoom, maxZoom)
      );

      // to center the zoom on the mouse position, we need to adjust the viewport's x and y
      viewport.x =
        screenX - x * viewport.zoom;

      viewport.y =
        screenY - y * viewport.zoom;

      render();
    };

    canvas.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [zoomEnabled, minZoom, maxZoom, render]);

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
    const canvas = canvasRef.current;
    if (!panEnabled || !canvas) return;
    isDraggingRef.current = true;

    const { screenX: x, screenY: y } = getPointerPosition(event, canvas);
    pointersRef.current.set(event.pointerId, { x, y });

    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    // Capture the pointer to continue receiving events even if it leaves the canvas
    event.currentTarget.setPointerCapture(
      event.pointerId
    );

    // Handle pinch zoom if two pointers are down
    if (pointersRef.current.size === 2) {
      const [p1, p2] = [...pointersRef.current.values()];

      const centerX = (p1.x + p2.x) / 2;
      const centerY = (p1.y + p2.y) / 2;

      const distance = Math.hypot(
        p2.x - p1.x,
        p2.y - p1.y
      );

      const viewport = viewportRef.current;

      // Convert pinch center from screen → world coordinates.
      const worldX =
        (centerX - viewport.x) / viewport.zoom;

      const worldY =
        (centerY - viewport.y) / viewport.zoom;

      pinchRef.current = {
        startDistance: distance,
        startZoom: viewport.zoom,
        worldX,
        worldY,
      };
    }
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!isDraggingRef.current || !pointersRef.current.has(event.pointerId) || !canvas) {
      return;
    }
    const { screenX: x, screenY: y } = getPointerPosition(event, canvas);
    const viewport = viewportRef.current;
    const dx = event.clientX - dragStartRef.current.x;
    const dy = event.clientY - dragStartRef.current.y;

    pointersRef.current.set(
      event.pointerId,
      { x, y }
    );

    if (pointersRef.current.size === 1) {
      viewport.x += dx;
      viewport.y += dy;

      dragStartRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
    } else if (pointersRef.current.size === 2 && pinchRef.current && zoomEnabled) {
      const [p1, p2] = [...pointersRef.current.values()];

      const distance = Math.hypot(
        p2.x - p1.x,
        p2.y - p1.y
      );

      const centerX = (p1.x + p2.x) / 2;
      const centerY = (p1.y + p2.y) / 2;

      const pinch = pinchRef.current;

      if (!pinch) {
        return;
      }

      // Calculate zoom relative to the original pinch distance.
      const scale =
        distance / pinch.startDistance;

      const newZoom = Math.min(
        maxZoom,
        Math.max(
          minZoom,
          pinch.startZoom * scale
        )
      );

      /*
       * Keep the world point that was originally
       * underneath the fingers underneath the
       * current finger center.
       */
      viewport.zoom = newZoom;

      viewport.x =
        centerX - pinch.worldX * newZoom;

      viewport.y =
        centerY - pinch.worldY * newZoom;
    }

    render();
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    pointersRef.current.delete(event.pointerId);

    if (pointersRef.current.size < 2) {
      pinchRef.current = null;
    }
  };

  const handlePointerCancel = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    isDraggingRef.current = false;
    pointersRef.current.delete(event.pointerId);
    pinchRef.current = null;
  };

  const toggleNode = useCallback(
    (nodeId: string) => {
      const viewport = viewportRef.current;
      const currentLayout = layoutsRef.current.find(
        layout => layout.node.id === nodeId
      );
      const screenX = currentLayout
        ? (currentLayout.x + currentLayout.width / 2) * viewport.zoom + viewport.x
        : undefined;
      const screenY = currentLayout
        ? (currentLayout.y + currentLayout.height / 2) * viewport.zoom + viewport.y
        : undefined;
      const expanded = new Set(
        expandedNodesRef.current
      );

      if (expanded.has(nodeId)) {
        expanded.delete(nodeId);
      } else {
        expanded.add(nodeId);
      }

      expandedNodesRef.current = expanded;

      render();

      if (screenX === undefined || screenY === undefined) return;

      const updatedLayout = layoutsRef.current.find(
        layout => layout.node.id === nodeId
      );
      if (!updatedLayout) return;

      viewport.x =
        screenX - (updatedLayout.x + updatedLayout.width / 2) * viewport.zoom;
      viewport.y =
        screenY - (updatedLayout.y + updatedLayout.height / 2) * viewport.zoom;

      render();

    },
    [render]
  );

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (clickTimeout.current !== null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { node, toggle } = getNodeAtPoint(
      layoutsRef.current,
      event,
      canvas,
      viewportRef.current
    );

    if (node || toggle) {
      clickTimeout.current = setTimeout(() => {
        if (toggle) toggleNode(toggle.node.id);
        if (node) onNodeClick?.(node.node, event);
        clickTimeout.current = null; // Reset after execution
      }, 250);
    }
  }


  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (clickTimeout.current !== null) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }
    if (!canvas) return;

    const { node } = getNodeAtPoint(
      layoutsRef.current,
      event,
      canvas,
      viewportRef.current
    );

    if (node) {
      console.log("Double-clicked node:", node.node.id);

      onDoubleClickNode?.(node.node, event);
    }
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    if (hoverTimeout.current !== null) {
      clearTimeout(hoverTimeout.current);
    }
    const { node, toggle } = getNodeAtPoint(
      layoutsRef.current,
      event,
      canvas,
      viewportRef.current
    );
    if (node || toggle) {
      canvas.style.cursor = "pointer";
    } else {
      canvas.style.cursor = "default";
    }
    const nodeId = node?.node.id ?? null;
    // Don't call onHover repeatedly for the same node
    if (hoveredNodeRef.current === nodeId) {
      return;
    }
    hoverTimeout.current = setTimeout(() => {
      if (node) {
        hoveredNodeRef.current = nodeId;
        console.log("Hovered node:", node.node.id);
        onHoverNode?.(node.node, event);
      } else {
        if (hoveredNodeRef.current !== null) {
          hoveredNodeRef.current = null;
          onHoverNode?.(null, event);
        }
      }
    }, 250); // Debounce for 250ms
  };

  const setZoom = useCallback(
    (zoom: number) => {
      const viewport = viewportRef.current;

      viewport.zoom = Math.min(
        Math.max(zoom, minZoom),
        maxZoom
      );

      render();
    },
    [
      minZoom,
      maxZoom,
      render,
    ]
  );

  const moveTo = useCallback(
    (x: number, y: number) => {
      viewportRef.current.x = x;
      viewportRef.current.y = y;

      render();
    },
    [render]
  );

  const moveBy = useCallback(
    (dx: number, dy: number) => {
      viewportRef.current.x += dx;
      viewportRef.current.y += dy;

      render();
    },
    [render]
  );


  useImperativeHandle(
    ref,
    () => ({
      zoomTo(zoom: number) {
        setZoom(zoom);
      },

      zoomIn(step = 0.1) {
        setZoom(
          viewportRef.current.zoom + step
        );
      },

      zoomOut(step = 0.1) {
        setZoom(
          viewportRef.current.zoom - step
        );
      },

      moveTo(x: number, y: number) {
        moveTo(x, y);
      },

      moveBy(dx: number, dy: number) {
        moveBy(dx, dy);
      },

      fitToScreen() {
        // We'll implement this later.
      },

      center() {
        // We'll implement this later.
      },

      centerNode(nodeId: string) {
        // We'll implement this later.
      },

      refresh() {
        render();
      },
    }),
    [
      setZoom,
      moveTo,
      moveBy,
      render,
    ]
  );

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      id="tree-canvas"
      className="tree-canvas"
      style={{ width: width, height: height, display: "block", overscrollBehavior: "contain", touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onMouseMove={handleMouseMove}
      onDoubleClick={handleDoubleClick}
    />
  )
});