import { useCallback, useEffect, useRef } from 'react';

import { NodeLayout, UseTreeRendererOptions } from '../types/tree.internal.types';

import { renderTree } from '../rendering/tree.renderer';
import { buildChildrenMap, calculateTreeLayout } from '../utils/tree.layout';
import { TreeNode } from '../types/tree.types';

const LAYOUT_ANIMATION_DURATION = 300;

const interpolateLayout = (start: NodeLayout, end: NodeLayout, progress: number): NodeLayout => ({
  node: end.node,
  x: start.x + (end.x - start.x) * progress,
  y: start.y + (end.y - start.y) * progress,
  width: start.width + (end.width - start.width) * progress,
  height: start.height + (end.height - start.height) * progress,
});

export function useTreeRenderer({
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
  showExpandCollapse,
  expandCollapseRenderer,
  nodeRenderers,
  onRender,
}: UseTreeRendererOptions) {
  const frameRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const childrenMapRef = useRef<Map<string | undefined, TreeNode[]>>(new Map());
  const layoutsRef = useRef<NodeLayout[]>([]);

  /**
   * Draw immediately.
   */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    renderTree({
      ctx,
      viewport: viewportRef.current,
      edgeType,
      width: canvas.clientWidth,
      height: canvas.clientHeight,
      expandedNodes: expandedNodesRef.current,
      orientation,
      showExpandCollapse,
      expandCollapseRenderer,
      nodeRenderers,
      layouts: layoutsRef.current,
      childrenMap: childrenMapRef.current,
    });

    onRender?.(layoutsRef.current);
  }, [
    canvasRef,
    layoutsRef,
    viewportRef,
    expandedNodesRef,
    orientation,
    edgeType,
    showExpandCollapse,
    expandCollapseRenderer,
    nodeRenderers,
    onRender,
  ]);

  const calculateLayout = useCallback(() => {
    childrenMapRef.current = buildChildrenMap(data);

    return calculateTreeLayout({
      childrenMap: childrenMapRef.current,
      nodeWidth,
      nodeHeight,
      levelGap,
      nodeGap,
      orientation,
      expandedNodes: expandedNodesRef.current,
    });
  }, [data, nodeWidth, nodeHeight, levelGap, nodeGap, orientation, expandedNodesRef]);

  const drawRef = useRef(draw);
  drawRef.current = draw;

  const animateLayout = useCallback(
    (targetLayouts: NodeLayout[]) => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      const previousLayouts = layoutsRef.current;
      if (previousLayouts.length === 0) {
        layoutsRef.current = targetLayouts;
        return;
      }

      const targetById = new Map(targetLayouts.map((layout) => [layout.node.id, layout]));
      const previousById = new Map(previousLayouts.map((layout) => [layout.node.id, layout]));
      const nodesById = new Map(data.map((node) => [node.id, node]));
      const findAncestorLayout = (
        node: TreeNode,
        layoutsById: Map<string, NodeLayout>,
      ): NodeLayout | undefined => {
        let parentId = node.parentId;

        while (parentId !== undefined) {
          const ancestorLayout = layoutsById.get(parentId);
          if (ancestorLayout) {
            return ancestorLayout;
          }
          parentId = nodesById.get(parentId)?.parentId;
        }

        return undefined;
      };

      const startById = new Map<string, NodeLayout>();
      for (const targetLayout of targetLayouts) {
        const previousLayout = previousById.get(targetLayout.node.id);

        if (previousLayout) {
          startById.set(targetLayout.node.id, previousLayout);
          continue;
        }

        const ancestorLayout = findAncestorLayout(targetLayout.node, previousById);
        startById.set(
          targetLayout.node.id,
          ancestorLayout
            ? {
                ...targetLayout,
                x: ancestorLayout.x + (ancestorLayout.width - targetLayout.width) / 2,
                y: ancestorLayout.y + (ancestorLayout.height - targetLayout.height) / 2,
                width: 0,
                height: 0,
              }
            : targetLayout,
        );
      }

      const exitingLayouts = previousLayouts
        .filter((layout) => !targetById.has(layout.node.id) && nodesById.has(layout.node.id))
        .map((layout) => {
          const ancestorLayout =
            findAncestorLayout(layout.node, targetById) ??
            findAncestorLayout(layout.node, previousById);
          const endLayout = {
            ...layout,
            x: ancestorLayout
              ? ancestorLayout.x + (ancestorLayout.width - layout.width) / 2
              : layout.x + layout.width / 2,
            y: ancestorLayout
              ? ancestorLayout.y + (ancestorLayout.height - layout.height) / 2
              : layout.y + layout.height / 2,
            width: 0,
            height: 0,
          };

          return { start: layout, end: endLayout };
        });
      const enteringAndStableLayouts = targetLayouts.map((layout) => ({
        start: startById.get(layout.node.id)!,
        end: layout,
      }));
      const transitions = [...enteringAndStableLayouts, ...exitingLayouts];
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const linearProgress = Math.min(elapsed / LAYOUT_ANIMATION_DURATION, 1);
        const progress =
          linearProgress < 0.5 ? 4 * linearProgress ** 3 : 1 - (-2 * linearProgress + 2) ** 3 / 2;

        layoutsRef.current =
          linearProgress === 1
            ? targetLayouts
            : transitions.map(({ start, end }) => interpolateLayout(start, end, progress));
        drawRef.current();

        if (linearProgress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          animationFrameRef.current = null;
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [data, layoutsRef],
  );

  const scheduleDraw = useCallback(() => {
    if (frameRef.current !== null) {
      return;
    }
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      drawRef.current();
    });
  }, []);

  const requestRender = scheduleDraw;

  const requestLayoutRender = useCallback(() => {
    const targetLayouts = calculateLayout();
    animateLayout(targetLayouts);
    if (animationFrameRef.current === null) {
      scheduleDraw();
    }
  }, [animateLayout, calculateLayout, layoutsRef, scheduleDraw]);

  /**
   * Resize canvas backing store for device pixel ratio.
   */
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect();

      const dpr = window.devicePixelRatio || 1;

      const width = Math.round(rect.width * dpr);
      const height = Math.round(rect.height * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      /*
       * Canvas drawing coordinates remain in CSS pixels.
       *
       * Example:
       * canvas is 500 CSS pixels wide
       * DPR = 2
       * backing store = 1000 pixels
       *
       * ctx coordinates still use 0 → 500.
       */
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      requestRender();
    };

    resize();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => {
      observer.disconnect();
    };
  }, [canvasRef, requestRender]);

  /**
   * Initial render and cleanup.
   */
  useEffect(() => {
    requestLayoutRender();
  }, [requestLayoutRender]);

  useEffect(() => {
    requestRender();
  }, [draw, requestRender]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  return {
    draw,
    requestRender,
    requestLayoutRender,
    layoutsRef,
  };
}
