import { NodeLayout } from "../types/tree.internal.types";

export const drawEdges = (
    ctx: CanvasRenderingContext2D,
    layouts: NodeLayout[],
    edgeType: "bezier" | "polyline",
    orientation: "horizontal" | "vertical",
) => {
    const layoutMap = new Map(
        layouts.map(layout => [
            layout.node.id,
            layout,
        ])
    );

    ctx.strokeStyle = "#bbbbbb";
    ctx.lineWidth = 2;

    for (const layout of layouts) {
        const parentId =
            layout.node.parentId;

        if (!parentId) {
            continue;
        }

        const parent =
            layoutMap.get(parentId);

        if (!parent) {
            continue;
        }

        const iconPadding = 10; // space for expanded/collapsed icon

        const startX = orientation === 'horizontal' ? parent.x + parent.width + iconPadding : parent.x + parent.width / 2;   

        const startY = orientation === 'horizontal' ? parent.y + parent.height / 2 : parent.y + parent.height + iconPadding;

        const endX = orientation === 'horizontal' ? layout.x : layout.x + layout.width / 2;

        const endY = orientation === 'horizontal' ? layout.y + layout.height / 2 : layout.y;

        const middleX =
            (startX + endX) / 2;

        const middleY = (startY + endY) / 2;    

        ctx.save();

        ctx.beginPath();
        ctx.moveTo(
            startX,
            startY
        );

        if (edgeType === "polyline") {
            if(orientation === 'vertical'){
                ctx.lineTo(
                    startX,
                    middleY,
                );

                ctx.lineTo(
                    endX,
                    middleY
                );

                ctx.lineTo(
                    endX,
                    endY
                );
            } else {
                ctx.lineTo(
                    middleX,
                    startY
                );

                ctx.lineTo(
                    middleX,
                    endY
                );

                ctx.lineTo(
                    endX,
                    endY
                );
            }
           
        } else {
            if(orientation === 'horizontal') {
                ctx.bezierCurveTo(
                    middleX,
                    startY,
                    middleX,
                    endY,
                    endX,
                    endY
                );
            } else {
                ctx.bezierCurveTo(
                    startX,
                    middleY,
                    endX,
                    middleY,
                    endX,
                    endY
                );
            }
            
        }



        ctx.setLineDash([layout.node.lineType === "dashed" ? 5 : 0]);

        ctx.stroke();
        ctx.restore();
    }
};