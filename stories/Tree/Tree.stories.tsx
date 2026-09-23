import type { Meta, StoryObj } from "@storybook/react-vite";

import { TreeCanvas } from "../../src/components/TreeCanvas";
import { TreeNode } from "../../src/types";

const data: TreeNode[] = [
    {
        id: "ceo",
        title: "CEO",
        value: "John Smith",
    },

    {
        id: "cto",
        parentId: "ceo",
        title: "CTO",
        value: "Sarah Johnson",
    },
    {
        id: "cfo",
        parentId: "ceo",
        title: "CFO",
        value: "Michael Brown",
    },
    {
        id: "coo",
        parentId: "ceo",
        title: "COO",
        value: "Emily Davis",
    },

    {
        id: "frontend",
        parentId: "cto",
        title: "Frontend Team",
        value: "8 engineers",
    },
    {
        id: "backend",
        parentId: "cto",
        title: "Backend Team",
        value: "12 engineers",
    },
    {
        id: "devops",
        parentId: "cto",
        title: "DevOps Team",
        value: "5 engineers",
    },

    {
        id: "react",
        parentId: "frontend",
        title: "React Team",
        value: "4 engineers",
    },
    {
        id: "design-system",
        parentId: "frontend",
        title: "Design System",
        value: "4 engineers",
    },

    {
        id: "api",
        parentId: "backend",
        title: "API Team",
        value: "7 engineers",
    },
    {
        id: "data",
        parentId: "backend",
        title: "Data Team",
        value: "5 engineers",
    },

    {
        id: "platform",
        parentId: "devops",
        title: "Platform",
        value: "3 engineers",
    },
    {
        id: "infra",
        parentId: "devops",
        title: "Infrastructure",
        value: "2 engineers",
    },

    {
        id: "accounting",
        parentId: "cfo",
        title: "Accounting",
        value: "6 employees",
    },
    {
        id: "finance",
        parentId: "cfo",
        title: "Financial Planning",
        value: "3 employees",
    },

    {
        id: "operations",
        parentId: "coo",
        title: "Operations",
        value: "15 employees",
    },
    {
        id: "hr",
        parentId: "coo",
        title: "Human Resources",
        value: "5 employees",
    },
];

const meta = {
  title: "Components/Tree",
  component: TreeCanvas,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    data,
  },
  tags: ["autodocs"],
} satisfies Meta<typeof TreeCanvas>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomNodes: Story = {
  args: {
    renderNode: (node) => (
      <span
        style={{
          background: "#e5f3ee",
          border: "1px solid #a6d6c2",
          borderRadius: 6,
          display: "inline-block",
          padding: "6px 10px",
        }}
      >
        {node.title}
      </span>
    ),
  },
};