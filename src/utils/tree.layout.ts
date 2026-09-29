import { TreeNode } from "../types";
import { LayoutOptions, NodeLayout } from "../types/tree.internal.types";

export const buildChildrenMap = (data: TreeNode[]) => {
    const children = new Map<string | undefined, TreeNode[]>();

    for (const node of data) {
        const siblingNodes = children.get(node.parentId) ?? [];
        siblingNodes.push(node);
        children.set(node.parentId, siblingNodes);
    }

    return children;
};

const createNodeLayout = (
    node: TreeNode,
    x: number,
    y: number,
    width: number,
    height: number
): NodeLayout => ({
    node,
    x,
    y,
    width,
    height,
});

export const calculateTreeLayout = (
    options: LayoutOptions
): NodeLayout[] => {
    const {
        nodeWidth,
        nodeHeight,
        levelGap,
        nodeGap,
        expandedNodes,
        childrenMap,
        orientation,
    } = options;

    const layouts: NodeLayout[] = [];

    const positionSubtree = (
        node: TreeNode,
        depth: number,
        offset: number
    ): number => {
        const childNodes = childrenMap.get(node.id) ?? [];
        const isExpanded = expandedNodes.has(node.id);

        if (childNodes.length === 0 || !isExpanded) {
            if (orientation === "horizontal") {
                layouts.push(
                    createNodeLayout(
                        node,
                        depth * (nodeWidth + levelGap),
                        offset,
                        nodeWidth,
                        nodeHeight
                    )
                );

                return offset + nodeHeight + nodeGap;
            }

            layouts.push(
                createNodeLayout(
                    node,
                    offset,
                    depth * (nodeHeight + levelGap),
                    nodeWidth,
                    nodeHeight
                )
            );

            return offset + nodeWidth + nodeGap;
        }

        const startOffset = offset;

        for (const child of childNodes) {
            offset = positionSubtree(child, depth + 1, offset);
        }

        const endOffset = offset - nodeGap;

        if (orientation === "horizontal") {
            layouts.push(
                createNodeLayout(
                    node,
                    depth * (nodeWidth + levelGap),
                    (startOffset + endOffset) / 2 - nodeHeight / 2,
                    nodeWidth,
                    nodeHeight
                )
            );

            return offset;
        }

        layouts.push(
            createNodeLayout(
                node,
                (startOffset + endOffset) / 2 - nodeWidth / 2,
                depth * (nodeHeight + levelGap),
                nodeWidth,
                nodeHeight
            )
        );

        return offset;
    };

    const roots = childrenMap.get(undefined) ?? [];

    let offset = 0;

    for (const root of roots) {
        offset = positionSubtree(root, 0, offset);
    }

    return layouts;
};