import { Component } from "react";

export interface TreeNode {
    id: string;
    parentId?: string;
    title: string;
    value: string;
    width?: number;
    height?: number;
    lineType?: "solid" | "dashed";
    type?: string;
}

export interface CustomNodeRendererProps {
  type: string;
  canRender: (node: TreeNode) => boolean;
  render: (args: { ctx: CanvasRenderingContext2D, rect: DOMRect }, node: TreeNode) => void;
  overlayRenderer: (node: TreeNode) => Component;
}

export interface TreeCanvasProps {
  data: TreeNode[];
  width?: string;
  height?: string;
  nodeWidth?: number;
  nodeHeight?: number;
  
  edgeGap?: number;
  nodeGap?: number;

  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
  zoomEnabled?: boolean;
  panEnabled?: boolean;
  
  orientation?: "left" | "right" | "top" | "bottom";

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

  fitToScreen(): void;
  center(): void;
  centerNode(nodeId: string): void;

  refresh(): void;
}