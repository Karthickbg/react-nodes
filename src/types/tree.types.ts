import { ReactNode } from 'react';

export interface TreeNode {
  id: string;
  parentId?: string;
  title: string;
  value: string;
  width?: number;
  height?: number;
  lineType?: 'solid' | 'dashed';
  edgeColor?: string;
  type?: string;
}

export interface ExpandCollapseRendererProps {
  width: number;
  height: number;
  draw: (
    args: { ctx: CanvasRenderingContext2D; rect: DOMRect },
    isExpanded: boolean,
    orientation: 'horizontal' | 'vertical',
    node: TreeNode,
  ) => void;
}

export interface CustomNodeRendererProps {
  type: string;
  draw: (args: { ctx: CanvasRenderingContext2D; rect: DOMRect }, node: TreeNode) => void;
  allowOverlay?: boolean;
  overlayRenderer?: (node: TreeNode) => ReactNode;
}

export interface TreeCanvasProps {
  data: TreeNode[];
  width?: string;
  height?: string;
  nodeWidth?: number;
  nodeHeight?: number;

  levelGap?: number;
  nodeGap?: number;
  edgeType?: 'bezier' | 'polyline';

  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
  zoomEnabled?: boolean;
  panEnabled?: boolean;
  showExpandCollapse?: boolean;
  expandCollapseRenderer?: ExpandCollapseRendererProps;

  orientation?: 'horizontal' | 'vertical';

  onNodeClick?: (node: TreeNode, event: React.MouseEvent<HTMLCanvasElement>) => void;
  onHoverNode?: (node: TreeNode | null, event: React.MouseEvent<HTMLCanvasElement>) => void;
  onDoubleClickNode?: (node: TreeNode, event: React.MouseEvent<HTMLCanvasElement>) => void;

  nodeRenderers?: CustomNodeRendererProps[];
}

export interface TreeCanvasHandle {
  zoomTo(zoom: number): void;
  zoomIn(step?: number): void;
  zoomOut(step?: number): void;

  moveTo(x: number, y: number): void;
  moveBy(dx: number, dy: number): void;

  centerNode(nodeId: string): void;

  expand(nodeId: string): void;
  collapse(nodeId: string): void;
  toggle(nodeId: string): void;

  expandAll(): void;
  collapseAll(): void;

  refresh(): void;
}
