import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { Popover } from "react-tiny-popover";

import { TreeCanvas, type TreeCanvasHandle, type TreeNode } from "../../src";

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
        lineType: "dashed",
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
    {
        id: "founder",
        title: "Founder",
        value: "Steve Wallace",
    },
    {
        id: "advisor",
        parentId: "founder",
        title: "Advisor",
        value: "Jane Doe",
    },
    {
        id: "cofounder",
        parentId: "founder",
        title: "Co-Founder",
        value: "Alice Johnson",
    }
];

const hoverPopoverPositions: Array<"top" | "right" | "bottom" | "left"> = [
    "top",
    "right",
    "bottom",
    "left",
];
const hoverPopoverContainerStyle: Partial<CSSStyleDeclaration> = {
    zIndex: "1000",
};

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

function ImperativeRefExample() {
    const treeRef = useRef<TreeCanvasHandle>(null);

    const buttonStyle = {
        border: "1px solid #b9c2cc",
        borderRadius: 4,
        background: "#ffffff",
        color: "#202a35",
        padding: "7px 10px",
        font: "inherit",
        cursor: "pointer",
    };

    const groupStyle = {
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap" as const,
        gap: 6,
        paddingRight: 14,
        borderRight: "1px solid #dce1e6",
    };

    return (
        <div
            style={{
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                width: "100%",
                height: "100vh",
                padding: 16,
                background: "#f4f6f8",
                color: "#202a35",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                <div style={groupStyle}>
                    <strong>Zoom and pan</strong>
                    <button style={buttonStyle} onClick={() => treeRef.current?.zoomOut()} aria-label="Zoom out">−</button>
                    <button style={buttonStyle} onClick={() => treeRef.current?.zoomTo(1)}>100%</button>
                    <button style={buttonStyle} onClick={() => treeRef.current?.zoomIn()} aria-label="Zoom in">+</button>
                    <button style={buttonStyle} onClick={() => treeRef.current?.moveBy(0, -40)} aria-label="Move up">↑</button>
                    <button style={buttonStyle} onClick={() => treeRef.current?.moveBy(-40, 0)} aria-label="Move left">←</button>
                    <button style={buttonStyle} onClick={() => treeRef.current?.moveBy(40, 0)} aria-label="Move right">→</button>
                    <button style={buttonStyle} onClick={() => treeRef.current?.moveBy(0, 40)} aria-label="Move down">↓</button>
                    <button style={buttonStyle} onClick={() => treeRef.current?.moveTo(0, 0)}>Move to origin</button>
                    <button style={buttonStyle} onClick={() => treeRef.current?.centerNode("ceo")}>Center CEO</button>
                </div>
                <div style={groupStyle}>
                    <strong>CEO branch</strong>
                    <button style={buttonStyle} onClick={() => treeRef.current?.expand("ceo")}>Expand</button>
                    <button style={buttonStyle} onClick={() => treeRef.current?.collapse("ceo")}>Collapse</button>
                    <button style={buttonStyle} onClick={() => treeRef.current?.toggle("ceo")}>Toggle</button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                    <strong>Tree</strong>
                    <button style={buttonStyle} onClick={() => treeRef.current?.expandAll()}>Expand all</button>
                    <button style={buttonStyle} onClick={() => treeRef.current?.collapseAll()}>Collapse all</button>
                    <button style={buttonStyle} onClick={() => treeRef.current?.refresh()}>Refresh</button>
                </div>
            </div>
            <div style={{ flex: 1, minHeight: 0, border: "1px solid #d5dce3", background: "#ffffff" }}>
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
        ? data.filter(node => node.parentId === hoveredNode.id).length
        : 0;

    const clearHover = () => {
        setHoveredNode(null);
    };

    return (
        <div
            style={{
                boxSizing: "border-box",
                width: "100%",
                height: "100vh",
                padding: 24,
                background: "#f2f5f3",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <div style={{ margin: "0 auto", maxWidth: 1100 }}>
                <h2 style={{ margin: "0 0 6px", color: "#1b342e", fontSize: 20 }}>
                    Organization tree
                </h2>
                <p style={{ margin: "0 0 16px", color: "#52635e", fontSize: 14 }}>
                    Hover a node to inspect its details.
                </p>
                <div
                    ref={treeBoundsRef}
                    onMouseLeave={clearHover}
                    style={{
                        position: "relative",
                        height: "min(72vh, 680px)",
                        minHeight: 380,
                        overflow: "hidden",
                        border: "1px solid #cbd7d1",
                        background: "#ffffff",
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
                                    border: "1px solid #b8ccc2",
                                    borderTop: "3px solid #3b8069",
                                    borderRadius: 4,
                                    background: "#ffffff",
                                    color: "#1b342e",
                                    boxShadow: "0 8px 24px rgba(26, 54, 43, 0.16)",
                                    fontFamily: "Arial, sans-serif",
                                }}
                            >
                                <div style={{ color: "#527266", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
                                    {hoveredNode?.title}
                                </div>
                                <div style={{ marginTop: 4, fontSize: 17, fontWeight: 700 }}>
                                    {hoveredNode?.value}
                                </div>
                                <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "5px 12px", margin: "12px 0 0", fontSize: 12 }}>
                                    <dt style={{ color: "#62736d" }}>ID</dt>
                                    <dd style={{ margin: 0 }}>{hoveredNode?.id}</dd>
                                    <dt style={{ color: "#62736d" }}>Parent</dt>
                                    <dd style={{ margin: 0 }}>{hoveredNode?.parentId ?? "None"}</dd>
                                    <dt style={{ color: "#62736d" }}>Direct reports</dt>
                                    <dd style={{ margin: 0 }}>{directReportCount}</dd>
                                </dl>
                            </div>
                        }
                    >
                        <span
                            aria-hidden="true"
                            style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                width: 1,
                                height: 1,
                                pointerEvents: "none",
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

