'use client'

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { TreeCanvasHandle, TreeCanvasProps } from "../../types/tree.types";
import { Viewport } from "../../types/tree.internal.types";
import { useTreeCanvasPointerInteraction } from "../../hooks/useTreeCanvasPointerInteraction";
import { useTreeRenderer } from "../../hooks/useTreeRenderer";
import { useTreeCanvasActions } from "../../hooks/useTreeCanvasActions";
import { clampZoom } from "../../utils/tree.viewport";

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
    levelGap = 150,
    nodeGap = 30,
    edgeType = "bezier",
    minZoom = 0.2,
    maxZoom = 3,
    initialZoom = 1,
    zoomEnabled = true,
    panEnabled = true,
    nodeRenderers,
    orientation = "horizontal",
    onNodeClick,
    onHoverNode,
    onDoubleClickNode,
  } = props;
  
  const initialViewportZoom =
    clampZoom(initialZoom, minZoom, maxZoom) ??
    clampZoom(1, minZoom, maxZoom) ??
    1;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<Viewport>({
    x: 0,
    y: 0,
    zoom: initialViewportZoom,
  });
  const setViewport = useCallback((viewport: Viewport) => {
    viewportRef.current = viewport;
  }, []);
  const setCanvasCursor = useCallback((cursor: "pointer" | "default") => {
    if (canvasRef.current) {
      canvasRef.current.style.cursor = cursor;
    }
  }, []);

  const expandedNodesRef = useRef<Set<string>>(
    new Set(data.map(node => node.id))
  );
  const previousNodeIdsRef = useRef(new Set(data.map(node => node.id)));

  const {
    layoutsRef,
    requestRender,
    requestLayoutRender,
  } =  useTreeRenderer({
    canvasRef,
    viewportRef,
    expandedNodesRef,
    data,
    nodeWidth,
    nodeHeight,
    levelGap,
    nodeGap,
    edgeType,
    orientation,
    nodeRenderers,
  })

  const setNodeExpanded = useCallback(
    (nodeId: string, isExpanded: boolean) => {
      const expandedNodes = new Set(expandedNodesRef.current);
      if (isExpanded) {
        expandedNodes.add(nodeId);
      } else {
        expandedNodes.delete(nodeId);
      }
      expandedNodesRef.current = expandedNodes;
      requestLayoutRender();
    },
    [requestLayoutRender]
  );

  const toggleExpandedNode = useCallback(
    (nodeId: string) => {
      setNodeExpanded(nodeId, !expandedNodesRef.current.has(nodeId));
    },
    [setNodeExpanded]
  );

  const expandAll = useCallback(() => {
    expandedNodesRef.current = new Set(data.map(node => node.id));
    requestLayoutRender();
  }, [data, requestLayoutRender]);

  const collapseAll = useCallback(() => {
    expandedNodesRef.current = new Set();
    requestLayoutRender();
  }, [requestLayoutRender]);

  useEffect(() => {
    const currentNodeIds = new Set(data.map(node => node.id));
    const expandedNodes = new Set(
      [...expandedNodesRef.current].filter(nodeId => currentNodeIds.has(nodeId))
    );

    for (const node of data) {
      if (!previousNodeIdsRef.current.has(node.id)) {
        expandedNodes.add(node.id);
      }
    }

    expandedNodesRef.current = expandedNodes;
    previousNodeIdsRef.current = currentNodeIds;
    requestLayoutRender();
  }, [data, requestLayoutRender]);

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
        toggleExpandedNode(nodeId);
  
        if (screenX === undefined || screenY === undefined) return;
  
        const updatedLayout = layoutsRef.current.find(
          layout => layout.node.id === nodeId
        );
        if (!updatedLayout) return;
  
        viewport.x =
          screenX - (updatedLayout.x + updatedLayout.width / 2) * viewport.zoom;
        viewport.y =
          screenY - (updatedLayout.y + updatedLayout.height / 2) * viewport.zoom;
  
        requestRender();
  
      },
      [toggleExpandedNode, requestRender]
    );

  const {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleClick,
    handleDoubleClick,
    handleMouseMove
  } = useTreeCanvasPointerInteraction({
    canvasRef,
    viewportRef,
    setViewport,
    setCanvasCursor,
    panEnabled,
    zoomEnabled,
    minZoom,
    maxZoom,
    requestRender,
    layoutsRef,
    orientation,
    onNodeClick,
    onDoubleClickNode,
    onHoverNode,
    toggleNode
  });

  const {
    centerNode,
    setZoom,
    moveTo,
    moveBy,
  } = useTreeCanvasActions({
    canvasRef,
    viewportRef,
    setViewport,
    layoutsRef,
    minZoom,
    maxZoom,
    requestRender,
  })


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

      centerNode(nodeId: string) {
        centerNode(nodeId);
      },

      refresh() {
        requestRender();
      },
      expand(nodeId: string) {
        setNodeExpanded(nodeId, true);
      },

      collapse(nodeId: string) {
        setNodeExpanded(nodeId, false);
      },

      toggle(nodeId: string) {
        toggleExpandedNode(nodeId);
      },

      expandAll() {
        expandAll();
      },

      collapseAll() {
        collapseAll();
      }
    }),
    [
      setZoom,
      moveTo,
      moveBy,
      requestRender,
      setNodeExpanded,
      toggleExpandedNode,
      expandAll,
      collapseAll,
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