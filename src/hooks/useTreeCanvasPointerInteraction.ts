import { useCallback, useEffect, useRef } from "react";
import { UseTreeCanvasPointerInteractionOptions } from "../types/tree.internal.types";
import { getNodeAtPoint, getPointerPosition, getWorldPoint } from "../utils/tree.canvas-interaction";
import { clampZoom } from "../utils/tree.viewport";

export const useTreeCanvasPointerInteraction = ({
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
    onHoverNode,
    toggleNode
}: UseTreeCanvasPointerInteractionOptions) => {
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const pointersRef = useRef(new Map<number, { x: number; y: number }>());
    const pinchRef = useRef<{
        startDistance: number;
        startZoom: number;
        worldX: number;
        worldY: number;
    } | null>(null);
    const clickTimeout = useRef<number | null>(null);
    const hoverTimeout = useRef<number | null>(null);
    const hoveredNodeRef = useRef<string | null>(null);

    const resetHoveredNode = () => {
      if (hoverTimeout.current !== null) {
        clearTimeout(hoverTimeout.current);
        hoverTimeout.current = null;
      }
      hoveredNodeRef.current = null;
    };

    useEffect(() => () => {
      if (clickTimeout.current !== null) {
        clearTimeout(clickTimeout.current);
      }
      if (hoverTimeout.current !== null) {
        clearTimeout(hoverTimeout.current);
      }
    }, []);

    const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!panEnabled || !canvas) return;

        isDraggingRef.current = true;
        const { screenX: x, screenY: y } = getPointerPosition(event, canvas);
        pointersRef.current.set(event.pointerId, { x, y });
        dragStartRef.current = { x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);

        if (pointersRef.current.size === 2) {
            const [firstPointer, secondPointer] = [...pointersRef.current.values()];
            const centerX = (firstPointer.x + secondPointer.x) / 2;
            const centerY = (firstPointer.y + secondPointer.y) / 2;
            const distance = Math.hypot(
                secondPointer.x - firstPointer.x,
                secondPointer.y - firstPointer.y
            );
            const viewport = viewportRef.current;

            pinchRef.current = {
                startDistance: distance,
                startZoom: viewport.zoom,
                worldX: (centerX - viewport.x) / viewport.zoom,
                worldY: (centerY - viewport.y) / viewport.zoom,
            };
        }
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!isDraggingRef.current || !pointersRef.current.has(event.pointerId) || !canvas) {
            return;
        }

        const { screenX: x, screenY: y } = getPointerPosition(event, canvas);
        const viewport = { ...viewportRef.current };
        const dx = event.clientX - dragStartRef.current.x;
        const dy = event.clientY - dragStartRef.current.y;
        pointersRef.current.set(event.pointerId, { x, y });

        if (pointersRef.current.size === 1) {
            viewport.x += dx;
            viewport.y += dy;
            dragStartRef.current = { x: event.clientX, y: event.clientY };
        } else if (pointersRef.current.size === 2 && pinchRef.current && zoomEnabled) {
            const [firstPointer, secondPointer] = [...pointersRef.current.values()];
            const distance = Math.hypot(
                secondPointer.x - firstPointer.x,
                secondPointer.y - firstPointer.y
            );
            const centerX = (firstPointer.x + secondPointer.x) / 2;
            const centerY = (firstPointer.y + secondPointer.y) / 2;
            const pinch = pinchRef.current;
            const newZoom = clampZoom(
              pinch.startZoom * (distance / pinch.startDistance),
              minZoom,
              maxZoom
            );

            if (newZoom !== null) {
              viewport.zoom = newZoom;
              viewport.x = centerX - pinch.worldX * newZoom;
              viewport.y = centerY - pinch.worldY * newZoom;
            }
        }

          setViewport(viewport);
        requestRender();
    };

    const handlePointerEnd = (event: React.PointerEvent<HTMLCanvasElement>) => {
        pointersRef.current.delete(event.pointerId);

      if (pointersRef.current.size === 1) {
        const remainingPointer = pointersRef.current.values().next().value;
        if (!remainingPointer) {
          isDraggingRef.current = false;
          pinchRef.current = null;
          return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        isDraggingRef.current = true;
        dragStartRef.current = {
          x: remainingPointer.x + rect.left,
          y: remainingPointer.y + rect.top,
        };
            pinchRef.current = null;
      } else if (pointersRef.current.size === 0) {
        isDraggingRef.current = false;
        pinchRef.current = null;
        }
    };

    const handlePointerUp = handlePointerEnd;
    const handlePointerCancel = handlePointerEnd;

    const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (clickTimeout.current !== null) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
    
        const { node, toggle } = getNodeAtPoint(
          layoutsRef.current,
          event,
          canvas,
          viewportRef.current,
          orientation,
          showExpandCollapse,
          expandCollapseWidth,
          expandCollapseHeight,
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
          viewportRef.current,
          orientation,
          showExpandCollapse,
          expandCollapseWidth,
          expandCollapseHeight
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
          hoverTimeout.current = null;
        }
        const previousNodeId = hoveredNodeRef.current;
        const previousNode = layoutsRef.current.find(
          layout => layout.node.id === previousNodeId
        )?.node;
        const previousWasCustom = previousNode ? isCustomNode(previousNode) : false;
        const { node, toggle } = getNodeAtPoint(
          layoutsRef.current,
          event,
          canvas,
          viewportRef.current,
          orientation,
          showExpandCollapse,
          expandCollapseWidth,
          expandCollapseHeight,
        );
        setCanvasCursor(node || toggle ? "pointer" : "default");
        const nodeId = node?.node.id ?? null;
        if (previousNodeId === nodeId) {
          return;
        }

        if (node && isCustomNode(node.node)) {
          hoveredNodeRef.current = nodeId;
          onHoverNode?.(node.node, event);
          return;
        }

        if (previousWasCustom) {
          hoveredNodeRef.current = null;
          onHoverNode?.(null, event);
        }

        if (!node && previousWasCustom) {
          return;
        }

        if (!node && previousNodeId === null) {
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

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleWheel = (event: WheelEvent) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            event.preventDefault();
            if (!zoomEnabled) return;

            const currentViewport = viewportRef.current;
            const { screenX, screenY, x, y } = getWorldPoint(event as unknown as React.MouseEvent<HTMLCanvasElement>, canvas, currentViewport);

            const zoomFactor =
                event.deltaY > 0 ? 0.9 : 1.1;

            const zoom = clampZoom(
                currentViewport.zoom * zoomFactor,
                minZoom,
                maxZoom
            );
            if (zoom === null) return;

            setViewport({
              ...currentViewport,
              zoom,
              x: screenX - x * zoom,
              y: screenY - y * zoom,
            });

            requestRender();
        };

        canvas.addEventListener("wheel", handleWheel, {
            passive: false,
        });

        return () => {
            canvas.removeEventListener("wheel", handleWheel);
        };
    }, [zoomEnabled, minZoom, maxZoom, requestRender, setViewport]);

    return {
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handlePointerCancel,
        handleClick,
        handleDoubleClick,
        handleMouseMove,
        resetHoveredNode,
    };
};