import { TreeNode } from '../types';
import { LayoutOptions, NodeLayout } from '../types/tree.internal.types';

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
  height: number,
): NodeLayout => ({
  node,
  x,
  y,
  width,
  height,
});

export const calculateTreeLayout = (options: LayoutOptions): NodeLayout[] => {
  const { nodeWidth, nodeHeight, levelGap, nodeGap, expandedNodes, childrenMap, orientation } =
    options;

  const layouts: NodeLayout[] = [];
  const maxPrimarySizeByDepth = new Map<number, number>();

  const collectLevelSizes = (node: TreeNode, depth: number) => {
    const width = node.width ?? nodeWidth;
    const height = node.height ?? nodeHeight;
    const primarySize = orientation === 'horizontal' ? width : height;
    const currentMax = maxPrimarySizeByDepth.get(depth) ?? 0;
    maxPrimarySizeByDepth.set(depth, Math.max(currentMax, primarySize));

    if (expandedNodes.has(node.id)) {
      for (const child of childrenMap.get(node.id) ?? []) {
        collectLevelSizes(child, depth + 1);
      }
    }
  };

  const roots = childrenMap.get(undefined) ?? [];
  for (const root of roots) {
    collectLevelSizes(root, 0);
  }

  const primaryOffsetByDepth = new Map<number, number>();
  let primaryOffset = 0;
  for (let depth = 0; maxPrimarySizeByDepth.has(depth); depth += 1) {
    primaryOffsetByDepth.set(depth, primaryOffset);
    primaryOffset += maxPrimarySizeByDepth.get(depth)! + levelGap;
  }

  const positionSubtree = (node: TreeNode, depth: number, offset: number): number => {
    const childNodes = childrenMap.get(node.id) ?? [];
    const isExpanded = expandedNodes.has(node.id);
    const width = node.width ?? nodeWidth;
    const height = node.height ?? nodeHeight;
    const levelOffset = primaryOffsetByDepth.get(depth) ?? 0;

    if (childNodes.length === 0 || !isExpanded) {
      if (orientation === 'horizontal') {
        layouts.push(createNodeLayout(node, levelOffset, offset, width, height));

        return offset + height + nodeGap;
      }

      layouts.push(createNodeLayout(node, offset, levelOffset, width, height));

      return offset + width + nodeGap;
    }

    const startOffset = offset;

    for (const child of childNodes) {
      offset = positionSubtree(child, depth + 1, offset);
    }

    const endOffset = offset - nodeGap;

    if (orientation === 'horizontal') {
      layouts.push(
        createNodeLayout(
          node,
          levelOffset,
          (startOffset + endOffset) / 2 - height / 2,
          width,
          height,
        ),
      );

      return offset;
    }

    layouts.push(
      createNodeLayout(node, (startOffset + endOffset) / 2 - width / 2, levelOffset, width, height),
    );

    return offset;
  };

  let offset = 0;

  for (const root of roots) {
    offset = positionSubtree(root, 0, offset);
  }

  return layouts;
};
