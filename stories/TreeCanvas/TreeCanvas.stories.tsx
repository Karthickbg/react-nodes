import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { Popover } from 'react-tiny-popover';

import {
  TreeCanvas,
  type CustomNodeRendererProps,
  type ExpandCollapseRendererProps,
  type TreeCanvasHandle,
  type TreeNode,
} from '../../src';

const data: TreeNode[] = [
  {
    id: 'ceo',
    title: 'CEO',
    value: 'John Smith',
  },

  {
    id: 'cto',
    parentId: 'ceo',
    title: 'CTO',
    value: 'Sarah Johnson',
  },
  {
    id: 'cfo',
    parentId: 'ceo',
    title: 'CFO',
    value: 'Michael Brown',
    lineType: 'dashed',
  },
  {
    id: 'coo',
    parentId: 'ceo',
    title: 'COO',
    value: 'Emily Davis',
  },

  {
    id: 'frontend',
    parentId: 'cto',
    title: 'Frontend Team',
    value: '8 engineers',
  },
  {
    id: 'backend',
    parentId: 'cto',
    title: 'Backend Team',
    value: '12 engineers',
  },
  {
    id: 'devops',
    parentId: 'cto',
    title: 'DevOps Team',
    value: '5 engineers',
  },

  {
    id: 'react',
    parentId: 'frontend',
    title: 'React Team',
    value: '4 engineers',
  },
  {
    id: 'design-system',
    parentId: 'frontend',
    title: 'Design System',
    value: '4 engineers',
  },

  {
    id: 'api',
    parentId: 'backend',
    title: 'API Team',
    value: '7 engineers',
  },
  {
    id: 'data',
    parentId: 'backend',
    title: 'Data Team',
    value: '5 engineers',
  },

  {
    id: 'platform',
    parentId: 'devops',
    title: 'Platform',
    value: '3 engineers',
  },
  {
    id: 'infra',
    parentId: 'devops',
    title: 'Infrastructure',
    value: '2 engineers',
  },

  {
    id: 'accounting',
    parentId: 'cfo',
    title: 'Accounting',
    value: '6 employees',
  },
  {
    id: 'finance',
    parentId: 'cfo',
    title: 'Financial Planning',
    value: '3 employees',
  },

  {
    id: 'operations',
    parentId: 'coo',
    title: 'Operations',
    value: '15 employees',
  },
  {
    id: 'hr',
    parentId: 'coo',
    title: 'Human Resources',
    value: '5 employees',
  },
  {
    id: 'founder',
    title: 'Founder',
    value: 'Steve Wallace',
  },
  {
    id: 'advisor',
    parentId: 'founder',
    title: 'Advisor',
    value: 'Jane Doe',
  },
  {
    id: 'cofounder',
    parentId: 'founder',
    title: 'Co-Founder',
    value: 'Alice Johnson',
  },
];

const hoverPopoverPositions: Array<'top' | 'right' | 'bottom' | 'left'> = [
  'top',
  'right',
  'bottom',
  'left',
];
const hoverPopoverContainerStyle: Partial<CSSStyleDeclaration> = {
  zIndex: '1000',
};

const meta = {
  title: 'Components/Tree',
  component: TreeCanvas,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    data,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TreeCanvas>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function ImperativeRefExample() {
  const treeRef = useRef<TreeCanvasHandle>(null);

  const buttonStyle = {
    border: '1px solid #b9c2cc',
    borderRadius: 4,
    background: '#ffffff',
    color: '#202a35',
    padding: '7px 10px',
    font: 'inherit',
    cursor: 'pointer',
  };

  const groupStyle = {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: 6,
    paddingRight: 14,
    borderRight: '1px solid #dce1e6',
  };

  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: '100%',
        height: '100vh',
        padding: 16,
        background: '#f4f6f8',
        color: '#202a35',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <div style={groupStyle}>
          <strong>Zoom and pan</strong>
          <button
            style={buttonStyle}
            onClick={() => treeRef.current?.zoomOut()}
            aria-label="Zoom out"
          >
            −
          </button>
          <button style={buttonStyle} onClick={() => treeRef.current?.zoomTo(1)}>
            100%
          </button>
          <button
            style={buttonStyle}
            onClick={() => treeRef.current?.zoomIn()}
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            style={buttonStyle}
            onClick={() => treeRef.current?.moveBy(0, -40)}
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            style={buttonStyle}
            onClick={() => treeRef.current?.moveBy(-40, 0)}
            aria-label="Move left"
          >
            ←
          </button>
          <button
            style={buttonStyle}
            onClick={() => treeRef.current?.moveBy(40, 0)}
            aria-label="Move right"
          >
            →
          </button>
          <button
            style={buttonStyle}
            onClick={() => treeRef.current?.moveBy(0, 40)}
            aria-label="Move down"
          >
            ↓
          </button>
          <button style={buttonStyle} onClick={() => treeRef.current?.moveTo(0, 0)}>
            Move to origin
          </button>
          <button style={buttonStyle} onClick={() => treeRef.current?.centerNode('ceo')}>
            Center CEO
          </button>
        </div>
        <div style={groupStyle}>
          <strong>CEO branch</strong>
          <button style={buttonStyle} onClick={() => treeRef.current?.expand('ceo')}>
            Expand
          </button>
          <button style={buttonStyle} onClick={() => treeRef.current?.collapse('ceo')}>
            Collapse
          </button>
          <button style={buttonStyle} onClick={() => treeRef.current?.toggle('ceo')}>
            Toggle
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <strong>Tree</strong>
          <button style={buttonStyle} onClick={() => treeRef.current?.expandAll()}>
            Expand all
          </button>
          <button style={buttonStyle} onClick={() => treeRef.current?.collapseAll()}>
            Collapse all
          </button>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, border: '1px solid #d5dce3', background: '#ffffff' }}>
        <TreeCanvas ref={treeRef} data={data} width="100%" height="100%" />
      </div>
    </div>
  );
}

export const ImperativeRefControls: Story = {
  render: () => <ImperativeRefExample />,
};

function HoverDetailsExample() {
  const treeBoundsRef = useRef<HTMLDivElement>(null);
  const popoverTargetRef = useRef<HTMLElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<TreeNode | null>(null);
  const directReportCount = hoveredNode
    ? data.filter((node) => node.parentId === hoveredNode.id).length
    : 0;

  const clearHover = () => {
    setHoveredNode(null);
  };

  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '100%',
        height: '100vh',
        padding: 24,
        background: '#f2f5f3',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ margin: '0 auto', maxWidth: 1100 }}>
        <h2 style={{ margin: '0 0 6px', color: '#1b342e', fontSize: 20 }}>Organization tree</h2>
        <p style={{ margin: '0 0 16px', color: '#52635e', fontSize: 14 }}>
          Hover a node to inspect its details.
        </p>
        <div
          ref={treeBoundsRef}
          onMouseLeave={clearHover}
          style={{
            position: 'relative',
            height: 'min(72vh, 680px)',
            minHeight: 380,
            overflow: 'hidden',
            border: '1px solid #cbd7d1',
            background: '#ffffff',
          }}
        >
          <TreeCanvas
            data={data}
            width="100%"
            height="100%"
            onHoverNode={(node, event) => {
              if (!node) {
                clearHover();
                return;
              }

              const canvasBounds = treeBoundsRef.current?.getBoundingClientRect();
              const popoverTarget = popoverTargetRef.current;
              if (!canvasBounds || !popoverTarget) return;
              popoverTarget.style.left = `${event.clientX - canvasBounds.left}px`;
              popoverTarget.style.top = `${event.clientY - canvasBounds.top}px`;
              setHoveredNode(node);
            }}
          />
          <Popover
            ref={popoverTargetRef}
            isOpen={hoveredNode !== null}
            positions={hoverPopoverPositions}
            padding={10}
            containerStyle={hoverPopoverContainerStyle}
            content={
              <div
                style={{
                  width: 210,
                  padding: 14,
                  border: '1px solid #b8ccc2',
                  borderTop: '3px solid #3b8069',
                  borderRadius: 4,
                  background: '#ffffff',
                  color: '#1b342e',
                  boxShadow: '0 8px 24px rgba(26, 54, 43, 0.16)',
                  fontFamily: 'Arial, sans-serif',
                }}
              >
                <div
                  style={{
                    color: '#527266',
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {hoveredNode?.title}
                </div>
                <div style={{ marginTop: 4, fontSize: 17, fontWeight: 700 }}>
                  {hoveredNode?.value}
                </div>
                <dl
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gap: '5px 12px',
                    margin: '12px 0 0',
                    fontSize: 12,
                  }}
                >
                  <dt style={{ color: '#62736d' }}>ID</dt>
                  <dd style={{ margin: 0 }}>{hoveredNode?.id}</dd>
                  <dt style={{ color: '#62736d' }}>Parent</dt>
                  <dd style={{ margin: 0 }}>{hoveredNode?.parentId ?? 'None'}</dd>
                  <dt style={{ color: '#62736d' }}>Direct reports</dt>
                  <dd style={{ margin: 0 }}>{directReportCount}</dd>
                </dl>
              </div>
            }
          >
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 1,
                height: 1,
                pointerEvents: 'none',
              }}
            />
          </Popover>
        </div>
      </div>
    </div>
  );
}

export const HoverDetailsPopover: Story = {
  render: () => <HoverDetailsExample />,
};

const departmentNodeIds = new Set(['ceo', 'cto', 'cfo', 'coo']);
const customRendererData = data.map((node) =>
  departmentNodeIds.has(node.id) ? { ...node, type: 'department', width: 210, height: 72 } : node,
);

const departmentRenderer: CustomNodeRendererProps = {
  type: 'department',
  draw: ({ ctx, rect }, node) => {
    ctx.fillStyle = '#f1f6f2';
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

    ctx.strokeStyle = '#9bb5a5';
    ctx.lineWidth = 1;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

    ctx.fillStyle = '#34735b';
    ctx.fillRect(rect.x, rect.y, 5, rect.height);

    ctx.fillStyle = '#60796c';
    ctx.font = '12px sans-serif';
    ctx.fillText(node.title, rect.x + 14, rect.y + 25);

    ctx.fillStyle = '#1d382c';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText(node.value, rect.x + 14, rect.y + 51);
  },
};

export const CustomNodeRenderer: Story = {
  args: {
    data: customRendererData,
    nodeRenderers: [departmentRenderer],
  },
};

const metricSeries: Record<string, number[]> = {
  gateway: [61, 66, 63, 72, 70, 76, 82, 84],
  auth: [38, 42, 40, 46, 49, 45, 53, 57],
  catalog: [72, 68, 74, 79, 76, 83, 80, 88],
  checkout: [24, 29, 27, 33, 31, 38, 36, 42],
};

const metricData: TreeNode[] = [
  {
    id: 'gateway',
    title: 'API Gateway',
    value: '84 req/s',
    type: 'metric',
    width: 240,
    height: 132,
  },
  {
    id: 'auth',
    parentId: 'gateway',
    title: 'Auth Service',
    value: '57 req/s',
    type: 'metric',
    width: 240,
    height: 132,
  },
  {
    id: 'catalog',
    parentId: 'gateway',
    title: 'Catalog Service',
    value: '88 req/s',
    type: 'metric',
    width: 240,
    height: 132,
  },
  {
    id: 'checkout',
    parentId: 'gateway',
    title: 'Checkout Service',
    value: '42 req/s',
    type: 'metric',
    width: 240,
    height: 132,
  },
];

const drawMetricNode = (
  { ctx, rect }: Parameters<CustomNodeRendererProps['draw']>[0],
  node: TreeNode,
) => {
  const values = metricSeries[node.id] ?? [];
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const chartLeft = rect.x + 14;
  const chartTop = rect.y + 84;
  const chartWidth = rect.width - 28;
  const chartHeight = 31;

  ctx.fillStyle = '#f2f7f4';
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  ctx.strokeStyle = '#c4d4ca';
  ctx.lineWidth = 1;
  ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.width - 1, rect.height - 1);

  ctx.fillStyle = '#597468';
  ctx.font = '11px sans-serif';
  ctx.fillText(node.title.toUpperCase(), rect.x + 14, rect.y + 24);

  ctx.fillStyle = '#16372a';
  ctx.font = 'bold 21px sans-serif';
  ctx.fillText(node.value, rect.x + 14, rect.y + 54);

  ctx.fillStyle = '#7b8e84';
  ctx.font = '10px sans-serif';
  ctx.fillText('REQUESTS / SECOND', rect.x + 14, rect.y + 73);

  if (values.length < 2) return;
  ctx.beginPath();
  values.forEach((value, index) => {
    const x = chartLeft + (index / (values.length - 1)) * chartWidth;
    const normalized = maxValue === minValue ? 0.5 : (value - minValue) / (maxValue - minValue);
    const y = chartTop + chartHeight - normalized * chartHeight;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#368262';
  ctx.lineWidth = 2;
  ctx.stroke();
};

function MetricNodeOverlay({ node }: { node: TreeNode }) {
  const values = metricSeries[node.id] ?? [];
  const [activeIndex, setActiveIndex] = useState(Math.max(0, values.length - 1));
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const points = values.map((value, index) => {
    const x = values.length < 2 ? 90 : (index / (values.length - 1)) * 180;
    const normalized = maxValue === minValue ? 0.5 : (value - minValue) / (maxValue - minValue);
    return { x, y: 36 - normalized * 30 };
  });
  const activePoint = points[activeIndex];

  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
        padding: '13px 14px 10px',
        overflow: 'hidden',
        border: '1px solid #82aa93',
        borderLeft: '4px solid #368262',
        background: '#f7fbf8',
        boxShadow: '0 5px 15px rgba(23, 55, 42, 0.12)',
        color: '#16372a',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ color: '#597468', fontSize: 11, fontWeight: 700 }}>
        {node.title.toUpperCase()}
      </div>
      <div style={{ marginTop: 4, fontSize: 21, fontWeight: 700 }}>{node.value}</div>
      <div style={{ marginTop: 1, color: '#7b8e84', fontSize: 10 }}>REQUESTS / SECOND</div>
      <svg
        viewBox="0 0 180 42"
        preserveAspectRatio="none"
        aria-label={`${node.title} request rate sparkline`}
        onMouseMove={(event) => {
          if (values.length < 2) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          const ratio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
          setActiveIndex(Math.round(ratio * (values.length - 1)));
        }}
        style={{
          display: 'block',
          width: '100%',
          height: 36,
          marginTop: 3,
          overflow: 'visible',
          cursor: 'crosshair',
        }}
      >
        <polyline
          points={points.map((point) => `${point.x},${point.y}`).join(' ')}
          fill="none"
          stroke="#368262"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {activePoint && <circle cx={activePoint.x} cy={activePoint.y} r="3.5" fill="#173d2e" />}
      </svg>
      <div aria-live="polite" style={{ color: '#34735b', fontSize: 12, fontWeight: 700 }}>
        {values[activeIndex] ?? 0} requests/s
      </div>
    </div>
  );
}

const metricNodeRenderer: CustomNodeRendererProps = {
  type: 'metric',
  allowOverlay: true,
  draw: drawMetricNode,
  overlayRenderer: (node) => <MetricNodeOverlay node={node} />,
};

export const CustomNodeOverlay: Story = {
  render: () => (
    <div
      style={{
        width: '100%',
        height: '100vh',
        padding: 24,
        boxSizing: 'border-box',
        background: '#edf3ef',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h2 style={{ margin: '0 0 5px', color: '#16372a', fontSize: 20 }}>Service metrics</h2>
      <p style={{ margin: '0 0 16px', color: '#60746a', fontSize: 14 }}>
        Hover a metric node, then move along its sparkline to inspect individual samples.
      </p>
      <div
        style={{
          width: '100%',
          height: 'calc(100% - 65px)',
          border: '1px solid #cbd8cf',
          background: '#ffffff',
        }}
      >
        <TreeCanvas
          data={metricData}
          nodeRenderers={[metricNodeRenderer]}
          width="100%"
          height="100%"
          nodeGap={34}
        />
      </div>
    </div>
  ),
};

const edgePalette = ['#ce8050', '#6089a3', '#528e6b', '#b16e74'];
const customIconData = data.map((node, index) => ({
  ...node,
  edgeColor: node.parentId ? edgePalette[index % edgePalette.length] : undefined,
}));

const customExpandCollapseRenderer: ExpandCollapseRendererProps = {
  width: 22,
  height: 22,
  draw: ({ ctx, rect }, isExpanded, orientation) => {
    ctx.fillStyle = isExpanded ? '#327c5e' : '#ffffff';
    ctx.strokeStyle = '#327c5e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(rect.x, rect.y, rect.width, rect.height, 7);
    ctx.fill();
    ctx.stroke();

    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    ctx.fillStyle = isExpanded ? '#ffffff' : '#327c5e';
    ctx.beginPath();

    if (orientation === 'horizontal') {
      const tipX = centerX + (isExpanded ? -5 : 5);
      const baseX = centerX + (isExpanded ? 4 : -4);
      ctx.moveTo(tipX, centerY);
      ctx.lineTo(baseX, centerY - 6);
      ctx.lineTo(baseX, centerY + 6);
    } else {
      const tipY = centerY + (isExpanded ? -5 : 5);
      const baseY = centerY + (isExpanded ? 4 : -4);
      ctx.moveTo(centerX, tipY);
      ctx.lineTo(centerX - 6, baseY);
      ctx.lineTo(centerX + 6, baseY);
    }

    ctx.closePath();
    ctx.fill();
  },
};

export const CustomExpandCollapseIcon: Story = {
  args: {
    data: customIconData,
    expandCollapseRenderer: customExpandCollapseRenderer,
  },
};
