import { TreeNode } from "../types";
import { LayoutOptions, NodeLayout } from "../types/tree.internal.types";


export const buildChildrenMap = (data: TreeNode[]) => {
    const children =
        new Map<string | undefined, TreeNode[]>();

    for (const node of data) {
        const list =
            children.get(node.parentId) ?? [];

        list.push(node);

        children.set(
            node.parentId,
            list
        );
    }

    return children;
}

export const calculateTreeLayout = (
    options: LayoutOptions
): NodeLayout[] => {
    const {
        nodeWidth,
        nodeHeight,
        edgeGap,
        nodeGap,
        expandedNodes,
        children,
    } = options;

    const layouts: NodeLayout[] = [];

    const positionSubtree = (
        node: TreeNode,
        depth: number,
        y: number
    ): number => {
        const childNodes =
            children.get(node.id) ?? [];

        if (childNodes.length === 0 || !expandedNodes.has(node.id)) {
            layouts.push({
                node,
                x:
                    depth *
                    (nodeWidth +
                        edgeGap),
                y,
                width: nodeWidth,
                height: nodeHeight,
            });

            return (
                y +
                nodeHeight +
                nodeGap
            );
        }

        const startY = y;

        for (const child of childNodes) {
            y = positionSubtree(
                child,
                depth + 1,
                y
            );
        }

        const endY =
            y - nodeGap;

        layouts.push({
            node,

            x:
                depth *
                (nodeWidth +
                    edgeGap),

            y:
                (startY + endY) / 2 -
                nodeHeight / 2,

            width: nodeWidth,
            height: nodeHeight,
        });

        return y;
    };

    const roots =
        children.get(undefined) ?? [];

    let y = 0;

    for (const root of roots) {
        y = positionSubtree(
            root,
            0,
            y
        );
    }

    return layouts;
}