import { RefObject } from 'react';
import { CustomNodeRendererProps, ExpandCollapseRendererProps, TreeNode } from './tree.types';

export interface NodeLayout {
  node: TreeNode;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface RenderTreeArgs {
  ctx: CanvasRenderingContext2D;

  viewport: Viewport;

  width: number;
  height: number;

  edgeType: 'bezier' | 'polyline';
  expandedNodes: Set<string>;
  orientation: 'horizontal' | 'vertical';
  showExpandCollapse: boolean;
  expandCollapseRenderer?: ExpandCollapseRendererProps;
  layouts: NodeLayout[];
  childrenMap: Map<string | undefined, TreeNode[]>;
  nodeRenderers?: CustomNodeRendererProps[];
}

export interface UseTreeRendererProps extends RenderTreeArgs {
  onRender: () => void;
  canvasRef: RefObject<HTMLCanvasElement>;
  layoutsRef: RefObject<NodeLayout[]>;
  viewportRef: RefObject<Viewport>;
}

export interface LayoutOptions {
  nodeWidth: number;
  nodeHeight: number;

  levelGap: number;
  nodeGap: number;
  expandedNodes: Set<string>;
  childrenMap: Map<string | undefined, TreeNode[]>;
  orientation: 'horizontal' | 'vertical';
}

export interface UseTreeViewportOptions {
  zoomEnabled: boolean;
  initialZoom: number;
  minZoom: number;
  maxZoom: number;
  render: () => void;
  canvas: HTMLCanvasElement;
}

export interface UseTreeCanvasPointerInteractionOptions {
  canvasRef: { current: HTMLCanvasElement | null };
  viewportRef: { current: Viewport };
  setViewport: (viewport: Viewport) => void;
  setCanvasCursor: (cursor: 'pointer' | 'default') => void;
  panEnabled: boolean;
  zoomEnabled: boolean;
  minZoom: number;
  maxZoom: number;
  requestRender: () => void;
  layoutsRef: { current: NodeLayout[] };
  orientation: 'horizontal' | 'vertical';
  showExpandCollapse: boolean;
  expandCollapseWidth: number;
  expandCollapseHeight: number;
  isCustomNode: (node: TreeNode) => boolean;
  toggleNode: (nodeId: string) => void;
  onNodeClick?: (node: TreeNode, event: React.MouseEvent<HTMLCanvasElement>) => void;
  onHoverNode?: (node: TreeNode | null, event: React.MouseEvent<HTMLCanvasElement>) => void;
  onDoubleClickNode?: (node: TreeNode, event: React.MouseEvent<HTMLCanvasElement>) => void;
}

export interface UseTreeRendererOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;

  viewportRef: RefObject<Viewport>;

  expandedNodesRef: RefObject<Set<string>>;

  data: TreeNode[];

  nodeWidth: number;
  nodeHeight: number;
  levelGap: number;
  nodeGap: number;

  edgeType: 'bezier' | 'polyline';
  orientation: 'horizontal' | 'vertical';
  showExpandCollapse: boolean;
  expandCollapseRenderer?: ExpandCollapseRendererProps;

  nodeRenderers?: CustomNodeRendererProps[];

  onRender?: (layouts: NodeLayout[]) => void;
}

export interface UseTreeCanvasActions {
  canvasRef: { current: HTMLCanvasElement | null };
  viewportRef: { current: Viewport };
  setViewport: (viewport: Viewport) => void;
  layoutsRef: { current: NodeLayout[] };
  minZoom: number;
  maxZoom: number;
  requestRender: () => void;
}
