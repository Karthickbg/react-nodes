import { TreeNode } from "./tree.types";

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

    data: TreeNode[];

    viewport: Viewport;

    width: number;
    height: number;

    nodeWidth: number;
    nodeHeight: number;

    edgeGap: number;
    nodeGap: number;
}


export interface LayoutOptions {
    nodeWidth: number;
    nodeHeight: number;

    edgeGap: number;
    nodeGap: number;
}