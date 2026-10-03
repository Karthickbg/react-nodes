import type { Meta, StoryObj } from '@storybook/react-vite';

import { TreeCanvas, type CustomNodeRendererProps, type TreeNode } from '../../src';

const metricSeries: Record<string, number[]> = {
  root: [61, 66, 63, 72, 70, 76, 82, 84],
};

const drawMetricNode = (
  { ctx, rect }: Parameters<CustomNodeRendererProps['draw']>[0],
  node: TreeNode,
) => {
  const values = metricSeries[node.id] ?? [];
  const minValue = Math.min(...values, 0);
  const maxValue = Math.max(...values, 1);
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

const metricNodeRenderer: CustomNodeRendererProps = {
  type: 'metric',
  draw: drawMetricNode,
};

function buildMetricTree(nodeCount: number): TreeNode[] {
  const count = Math.max(1, Math.floor(nodeCount));
  const rootNode: TreeNode = {
    id: 'metric-root',
    title: 'Root',
    value: '1,280 req/s',
    type: 'metric',
    width: 240,
    height: 132,
  };

  const nodes: TreeNode[] = [rootNode];

  for (let index = 1; index < count; index += 1) {
    const parentIndex = Math.max(0, Math.floor((index - 1) / 3));
    const parentId = nodes[parentIndex]?.id ?? rootNode.id;
    const value = 38 + ((index * 17) % 130);

    nodes.push({
      id: `metric-${index}`,
      parentId,
      title: `Metric ${index}`,
      value: `${value} req/s`,
      type: 'metric',
      width: 240,
      height: 132,
    });
  }

  return nodes;
}

const meta = {
  title: 'Performance/Tree',
  component: TreeCanvas,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    nodeCount: 5000,
  },
  argTypes: {
    nodeCount: {
      control: { type: 'number', min: 100, max: 20000, step: 100 },
      description: 'Number of nodes to render for performance testing',
    },
  },
} satisfies Meta<typeof TreeCanvas>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PerformanceTest: Story = {
  render: ({ nodeCount }) => (
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
      <div style={{ marginBottom: 12, color: '#16372a' }}>
        <strong>{Number(nodeCount ?? 5000).toLocaleString()} nodes</strong> · metric renderer
        performance test
      </div>
      <div
        style={{
          width: '100%',
          height: 'calc(100% - 40px)',
          border: '1px solid #cbd8cf',
          background: '#ffffff',
        }}
      >
        <TreeCanvas
          data={buildMetricTree(Number(nodeCount ?? 5000))}
          nodeRenderers={[metricNodeRenderer]}
          width="100%"
          height="100%"
          nodeGap={34}
        />
      </div>
    </div>
  ),
};
