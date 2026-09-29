'use client'

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { ExpandCollapseRendererProps, TreeCanvasHandle, TreeCanvasProps, TreeNode } from "../../types/tree.types";
import { NodeLayout, Viewport } from "../../types/tree.internal.types";
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
    showExpandCollapse = true,
    expandCollapseRenderer,
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
  const overlayLayerRef = useRef<HTMLDivElement>(null);
  const overlayNodeRef = useRef<HTMLDivElement>(null);
  const hoveredNodeIdRef = useRef<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
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
  const isCustomNode = useCallback(
    (node: TreeNode) => nodeRenderers?.some(renderer => renderer.type === node.type) ?? false,
    [nodeRenderers]
  );
  const expandCollapseWidth = expandCollapseRenderer?.width ?? 10;
  const expandCollapseHeight = expandCollapseRenderer?.height ?? 10;
  const handleHoverNode = useCallback(
    (node: TreeNode | null, event: React.MouseEvent<HTMLCanvasElement>) => {
      hoveredNodeIdRef.current = node?.id ?? null;
      setHoveredNodeId(node?.id ?? null);
      onHoverNode?.(node, event);
    },
    [onHoverNode]
  );
  const updateOverlayPosition = useCallback((layouts: NodeLayout[]) => {
    const viewport = viewportRef.current;
    const overlayLayer = overlayLayerRef.current;
    if (overlayLayer) {
      overlayLayer.style.transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`;
    }

    const overlayNode = overlayNodeRef.current;
    if (!overlayNode) return;

    const layout = layouts.find(item => item.node.id === hoveredNodeIdRef.current);
    if (!layout) {
      overlayNode.style.display = "none";
      return;
    }

    overlayNode.style.display = "block";
    overlayNode.style.left = `${layout.x}px`;
    overlayNode.style.top = `${layout.y}px`;
    overlayNode.style.width = `${layout.width}px`;
    overlayNode.style.height = `${layout.height}px`;
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
    levelGap: showExpandCollapse
      ? Math.max(
          levelGap,
          orientation === "horizontal" ? expandCollapseWidth : expandCollapseHeight
        )
      : levelGap,
    nodeGap,
    edgeType,
    orientation,
    showExpandCollapse,
    expandCollapseRenderer,
    nodeRenderers,
    onRender: updateOverlayPosition,
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
    handleMouseMove,
    resetHoveredNode,
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
    showExpandCollapse,
    expandCollapseWidth,
    expandCollapseHeight,
    isCustomNode,
    onNodeClick,
    onDoubleClickNode,
    onHoverNode: handleHoverNode,
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

  const hoveredNode = data.find(node => node.id === hoveredNodeId);
  const hoveredNodeRenderer = nodeRenderers?.find(
    renderer => renderer.type === hoveredNode?.type
  );
  const overlayContent = hoveredNode &&
    hoveredNodeRenderer?.allowOverlay === true &&
    hoveredNodeRenderer.overlayRenderer
      ? hoveredNodeRenderer.overlayRenderer(hoveredNode)
      : null;
  const hoveredLayout = overlayContent
    ? layoutsRef.current.find(layout => layout.node.id === hoveredNodeId)
    : undefined;

  const clearHoveredOverlay = () => {
    resetHoveredNode();
    hoveredNodeIdRef.current = null;
    setHoveredNodeId(null);
  };

  return (
    <div
      onMouseLeave={clearHoveredOverlay}
      style={{ position: "relative", width, height, overflow: "hidden" }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        id="tree-canvas"
        className="tree-canvas"
        style={{ width, height, display: "block", overscrollBehavior: "contain", touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onMouseMove={handleMouseMove}
        onDoubleClick={handleDoubleClick}
      />
      {overlayContent && hoveredLayout && (
        <div
          ref={overlayLayerRef}
          style={{
            position: "absolute",
            inset: 0,
            transform: `translate(${viewportRef.current.x}px, ${viewportRef.current.y}px) scale(${viewportRef.current.zoom})`,
            transformOrigin: "top left",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          <div
            ref={overlayNodeRef}
            style={{
              position: "absolute",
              left: hoveredLayout.x,
              top: hoveredLayout.y,
              width: hoveredLayout.width,
              height: hoveredLayout.height,
              pointerEvents: "auto",
            }}
          >
            {overlayContent}
          </div>
        </div>
      )}
    </div>
  )
});