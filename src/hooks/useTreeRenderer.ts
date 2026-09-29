import { useCallback, useEffect, useRef } from 'react';

import { NodeLayout, UseTreeRendererOptions } from '../types/tree.internal.types';

import { renderTree } from '../rendering/tree.renderer';
import { buildChildrenMap, calculateTreeLayout } from '../utils/tree.layout';
import { TreeNode } from '../types/tree.types';

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

    layoutsRef.current = calculateTreeLayout({
      childrenMap: childrenMapRef.current,
      nodeWidth,
      nodeHeight,
      levelGap,
      nodeGap,
      orientation,
      expandedNodes: expandedNodesRef.current,
    });
  }, [data, nodeWidth, nodeHeight, levelGap, nodeGap, orientation]);

  const drawRef = useRef(draw);
  drawRef.current = draw;

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
    calculateLayout();
    scheduleDraw();
  }, [calculateLayout, scheduleDraw]);

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
    };
  }, []);

  return {
    draw,
    requestRender,
    requestLayoutRender,
    layoutsRef,
  };
}
