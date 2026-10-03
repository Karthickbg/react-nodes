import { NodeLayout } from '../types/tree.internal.types';
import { CustomNodeRendererProps, ExpandCollapseRendererProps } from '../types/tree.types';
import {
  DEFAULT_EXPAND_COLLAPSE_SIZE,
  EXPAND_COLLAPSE_CHEVRON_INSET,
  EXPAND_COLLAPSE_CHEVRON_SIZE,
  EXPAND_COLLAPSE_CHEVRON_TIP_INSET,
  EXPAND_COLLAPSE_ICON_COLOR,
  NODE_BACKGROUND_COLOR,
  NODE_BORDER_COLOR,
  NODE_BORDER_LINE_WIDTH,
  NODE_TEXT_HORIZONTAL_PADDING,
  NODE_TITLE_BASELINE_OFFSET,
  NODE_TITLE_COLOR,
  NODE_TITLE_FONT,
  NODE_VALUE_BASELINE_OFFSET,
  NODE_VALUE_COLOR,
  NODE_VALUE_FONT,
} from '../constants';

export const drawNode = (
  ctx: CanvasRenderingContext2D,
  layout: NodeLayout,
  isExpanded: boolean,
  hasChildren: boolean,
  orientation: 'horizontal' | 'vertical',
  showExpandCollapse: boolean,
  expandCollapseRenderer: ExpandCollapseRendererProps | undefined,
  nodeRenderer?: CustomNodeRendererProps,
) => {
  const { node, x, y } = layout;
  const width = node.width ?? layout.width;
  const height = node.height ?? layout.height;

  ctx.save();
  if (nodeRenderer) {
    ctx.save();
    try {
      nodeRenderer.draw({ ctx, rect: new DOMRect(x, y, width, height) }, node);
    } finally {
      ctx.restore();
    }
  } else {
    // Card background
    ctx.fillStyle = NODE_BACKGROUND_COLOR;
    ctx.fillRect(x, y, width, height);

    // Card border
    ctx.strokeStyle = NODE_BORDER_COLOR;
    ctx.lineWidth = NODE_BORDER_LINE_WIDTH;
    ctx.strokeRect(x, y, width, height);

    // Title
    ctx.fillStyle = NODE_TITLE_COLOR;
    ctx.font = NODE_TITLE_FONT;
    ctx.fillText(node.title, x + NODE_TEXT_HORIZONTAL_PADDING, y + NODE_TITLE_BASELINE_OFFSET);

    // Value
    ctx.fillStyle = NODE_VALUE_COLOR;
    ctx.font = NODE_VALUE_FONT;
    ctx.fillText(node.value, x + NODE_TEXT_HORIZONTAL_PADDING, y + NODE_VALUE_BASELINE_OFFSET);
  }

  if (hasChildren && showExpandCollapse) {
    const iconWidth = expandCollapseRenderer?.width ?? DEFAULT_EXPAND_COLLAPSE_SIZE;
    const iconHeight = expandCollapseRenderer?.height ?? DEFAULT_EXPAND_COLLAPSE_SIZE;
    const iconRect =
      orientation === 'horizontal'
        ? new DOMRect(x + width, y + (height - iconHeight) / 2, iconWidth, iconHeight)
        : new DOMRect(x + (width - iconWidth) / 2, y + height, iconWidth, iconHeight);

    if (expandCollapseRenderer) {
      ctx.save();
      try {
        expandCollapseRenderer.draw({ ctx, rect: iconRect }, isExpanded, orientation, node);
      } finally {
        ctx.restore();
      }
    } else {
      const iconX = iconRect.x + iconWidth / 2;
      const iconY = iconRect.y + iconHeight / 2;
      ctx.beginPath();
      ctx.arc(iconX, iconY, Math.min(iconWidth, iconHeight) / 2, 0, Math.PI * 2, false);
      ctx.stroke();
      ctx.closePath();
      ctx.beginPath();
      ctx.strokeStyle = EXPAND_COLLAPSE_ICON_COLOR;
      if (orientation === 'horizontal') {
        ctx.moveTo(
          iconX + (isExpanded ? EXPAND_COLLAPSE_CHEVRON_INSET : -EXPAND_COLLAPSE_CHEVRON_INSET),
          iconY - EXPAND_COLLAPSE_CHEVRON_SIZE,
        );
        ctx.lineTo(
          iconX +
            (isExpanded ? -EXPAND_COLLAPSE_CHEVRON_TIP_INSET : EXPAND_COLLAPSE_CHEVRON_TIP_INSET),
          iconY,
        );
        ctx.lineTo(
          iconX + (isExpanded ? EXPAND_COLLAPSE_CHEVRON_INSET : -EXPAND_COLLAPSE_CHEVRON_INSET),
          iconY + EXPAND_COLLAPSE_CHEVRON_SIZE,
        );
      } else {
        ctx.moveTo(
          iconX - EXPAND_COLLAPSE_CHEVRON_SIZE,
          iconY + (isExpanded ? EXPAND_COLLAPSE_CHEVRON_INSET : -EXPAND_COLLAPSE_CHEVRON_INSET),
        );
        ctx.lineTo(
          iconX,
          iconY +
            (isExpanded ? -EXPAND_COLLAPSE_CHEVRON_TIP_INSET : EXPAND_COLLAPSE_CHEVRON_TIP_INSET),
        );
        ctx.lineTo(
          iconX + EXPAND_COLLAPSE_CHEVRON_SIZE,
          iconY + (isExpanded ? EXPAND_COLLAPSE_CHEVRON_INSET : -EXPAND_COLLAPSE_CHEVRON_INSET),
        );
      }
      ctx.stroke();
      ctx.closePath();
    }
  }
  ctx.restore();
};
