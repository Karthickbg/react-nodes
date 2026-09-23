import { ReactNode } from "react";

export interface TreeNode {
    id: string;
    parentId?: string;
    title: string;
    value: string;
}

export interface CanvasProps {
  data: TreeNode[];
  renderNode?: (node: TreeNode) => ReactNode;
  width?: string;
  height?: string;
  nodeWidth?: number;
  nodeHeight?: number;
  
  edgeGap?: number;
  nodeGap?: number;
  
  orientation?: "left" | "right" | "top" | "bottom";

  onNodeClick?: (node: TreeNode) => void;
  onHoverNode?: (node: TreeNode) => void;
}