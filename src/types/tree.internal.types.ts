import { CustomNodeRendererProps, TreeNode } from "./tree.types";

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
    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D;

    data: TreeNode[];

    viewport: Viewport;

    width: number;
    height: number;

    nodeWidth: number;
    nodeHeight: number;

    levelGap: number;
    nodeGap: number;
    edgeType: "bezier" | "polyline";
    expandedNodes: Set<string>;
    orientation: "horizontal" | "vertical";
    nodeRenderers?: CustomNodeRendererProps[];
}


export interface LayoutOptions {
    nodeWidth: number;
    nodeHeight: number;

    levelGap: number;
    nodeGap: number;
    expandedNodes: Set<string>;
    children: Map<string | undefined, TreeNode[]>;
    orientation: "horizontal" | "vertical";
}