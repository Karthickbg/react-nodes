import { LayoutOptions, NodeLayout } from '../types/tree.internal.types';
import { TreeNode } from '../types';

export const buildChildrenMap = (data: TreeNode[]) => {
  const children = new Map<string | undefined, TreeNode[]>();

  for (const node of data) {
    const siblings = children.get(node.parentId) ?? [];
    siblings.push(node);
    children.set(node.parentId, siblings);
  }

  return children;
};

interface TidyNode {
  node: TreeNode | null;
  parent: TidyNode | null;
  children: TidyNode[];
  number: number;
  depth: number;
  crossSize: number;
  prelim: number;
  modifier: number;
  change: number;
  shift: number;
  thread: TidyNode | null;
  ancestor: TidyNode | null;
}

const createTidyNode = (
  node: TreeNode | null,
  parent: TidyNode | null,
  number: number,
  depth: number,
  crossSize: number,
): TidyNode => {
  const tidyNode: TidyNode = {
    node,
    parent,
    children: [],
    number,
    depth,
    crossSize,
    prelim: 0,
    modifier: 0,
    change: 0,
    shift: 0,
    thread: null,
    ancestor: null,
  };

  tidyNode.ancestor = tidyNode;
  return tidyNode;
};

const leftSibling = (node: TidyNode): TidyNode | null => {
  const siblings = node.parent?.children;

  return siblings && node.number > 1 ? siblings[node.number - 2] : null;
};

const nextLeft = (node: TidyNode): TidyNode | null => node.children[0] ?? node.thread;

const nextRight = (node: TidyNode): TidyNode | null =>
  node.children[node.children.length - 1] ?? node.thread;

export const calculateTreeLayout = (options: LayoutOptions): NodeLayout[] => {
  const { nodeWidth, nodeHeight, levelGap, nodeGap, expandedNodes, childrenMap, orientation } =
    options;
  const isHorizontal = orientation === 'horizontal';
  const maxPrimarySizeByDepth = new Map<number, number>();
  const root = createTidyNode(null, null, 0, -1, 0);

  const createSubtree = (node: TreeNode, parent: TidyNode, number: number, depth: number) => {
    const width = node.width ?? nodeWidth;
    const height = node.height ?? nodeHeight;
    const tidyNode = createTidyNode(node, parent, number, depth, isHorizontal ? height : width);
    const primarySize = isHorizontal ? width : height;
    maxPrimarySizeByDepth.set(depth, Math.max(maxPrimarySizeByDepth.get(depth) ?? 0, primarySize));

    if (expandedNodes.has(node.id)) {
      const children = childrenMap.get(node.id) ?? [];
      tidyNode.children = children.map((child, index) =>
        createSubtree(child, tidyNode, index + 1, depth + 1),
      );
    }

    return tidyNode;
  };

  root.children = (childrenMap.get(undefined) ?? []).map((node, index) =>
    createSubtree(node, root, index + 1, 0),
  );

  if (root.children.length === 0) {
    return [];
  }

  const separation = (left: TidyNode, right: TidyNode) =>
    (left.crossSize + right.crossSize) / 2 + nodeGap;

  const moveSubtree = (left: TidyNode, right: TidyNode, distance: number) => {
    const subtreeCount = right.number - left.number;

    right.change -= distance / subtreeCount;
    right.shift += distance;
    left.change += distance / subtreeCount;
    right.prelim += distance;
    right.modifier += distance;
  };

  const ancestorFor = (insideLeft: TidyNode, node: TidyNode, defaultAncestor: TidyNode) => {
    const ancestor = insideLeft.ancestor;

    return ancestor?.parent === node.parent ? ancestor : defaultAncestor;
  };

  const apportion = (node: TidyNode, defaultAncestor: TidyNode): TidyNode => {
    const sibling = leftSibling(node);

    if (!sibling) {
      return defaultAncestor;
    }

    let insideRight = node;
    let outsideRight = node;
    let insideLeft = sibling;
    let outsideLeft = node.parent!.children[0];
    let insideRightModifier = insideRight.modifier;
    let outsideRightModifier = outsideRight.modifier;
    let insideLeftModifier = insideLeft.modifier;
    let outsideLeftModifier = outsideLeft.modifier;

    while (nextRight(insideLeft) && nextLeft(insideRight)) {
      insideLeft = nextRight(insideLeft)!;
      insideRight = nextLeft(insideRight)!;
      outsideLeft = nextLeft(outsideLeft)!;
      outsideRight = nextRight(outsideRight)!;
      outsideRight.ancestor = node;

      const distance =
        insideLeft.prelim +
        insideLeftModifier -
        (insideRight.prelim + insideRightModifier) +
        separation(insideLeft, insideRight);

      if (distance > 0) {
        moveSubtree(ancestorFor(insideLeft, node, defaultAncestor), node, distance);
        insideRightModifier += distance;
        outsideRightModifier += distance;
      }

      insideLeftModifier += insideLeft.modifier;
      insideRightModifier += insideRight.modifier;
      outsideLeftModifier += outsideLeft.modifier;
      outsideRightModifier += outsideRight.modifier;
    }

    if (nextRight(insideLeft) && !nextRight(outsideRight)) {
      outsideRight.thread = nextRight(insideLeft);
      outsideRight.modifier += insideLeftModifier - outsideRightModifier;
    }

    if (nextLeft(insideRight) && !nextLeft(outsideLeft)) {
      outsideLeft.thread = nextLeft(insideRight);
      outsideLeft.modifier += insideRightModifier - outsideLeftModifier;
      defaultAncestor = node;
    }

    return defaultAncestor;
  };

  const executeShifts = (node: TidyNode) => {
    let shift = 0;
    let change = 0;

    for (let index = node.children.length - 1; index >= 0; index -= 1) {
      const child = node.children[index];

      child.prelim += shift;
      child.modifier += shift;
      change += child.change;
      shift += child.shift + change;
    }
  };

  const firstWalk = (node: TidyNode) => {
    if (node.children.length === 0) {
      const sibling = leftSibling(node);
      if (sibling) {
        node.prelim = sibling.prelim + separation(node, sibling);
      }
      return;
    }

    let defaultAncestor = node.children[0];

    for (const child of node.children) {
      firstWalk(child);
      defaultAncestor = apportion(child, defaultAncestor);
    }

    executeShifts(node);
    const midpoint = (node.children[0].prelim + node.children[node.children.length - 1].prelim) / 2;
    const sibling = leftSibling(node);

    if (sibling) {
      node.prelim = sibling.prelim + separation(node, sibling);
      node.modifier = node.prelim - midpoint;
    } else {
      node.prelim = midpoint;
    }
  };

  firstWalk(root);

  const crossCenters = new Map<TidyNode, number>();
  let minimumCrossEdge = Number.POSITIVE_INFINITY;

  const secondWalk = (node: TidyNode, modifier: number) => {
    const crossCenter = node.prelim + modifier;

    if (node.node) {
      crossCenters.set(node, crossCenter);
      minimumCrossEdge = Math.min(minimumCrossEdge, crossCenter - node.crossSize / 2);
    }

    for (const child of node.children) {
      secondWalk(child, modifier + node.modifier);
    }
  };

  secondWalk(root, 0);
  const crossAxisOffset = -minimumCrossEdge;
  const primaryOffsetByDepth = new Map<number, number>();
  let primaryOffset = 0;

  for (let depth = 0; maxPrimarySizeByDepth.has(depth); depth += 1) {
    primaryOffsetByDepth.set(depth, primaryOffset);
    primaryOffset += maxPrimarySizeByDepth.get(depth)! + levelGap;
  }

  const layouts: NodeLayout[] = [];
  const appendPostorder = (node: TidyNode) => {
    for (const child of node.children) {
      appendPostorder(child);
    }

    if (!node.node) {
      return;
    }

    const width = node.node.width ?? nodeWidth;
    const height = node.node.height ?? nodeHeight;
    const crossStart = crossCenters.get(node)! - node.crossSize / 2 + crossAxisOffset;
    const depthOffset = primaryOffsetByDepth.get(node.depth)!;

    layouts.push({
      node: node.node,
      x: isHorizontal ? depthOffset : crossStart,
      y: isHorizontal ? crossStart : depthOffset,
      width,
      height,
    });
  };

  appendPostorder(root);
  return layouts;
};
