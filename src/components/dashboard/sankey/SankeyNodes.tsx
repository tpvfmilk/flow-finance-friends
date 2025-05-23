
import { SankeyNodeExtended } from "./sankeyTypes";
import { formatCurrency } from "@/lib/utils";

interface SankeyNodesProps {
  nodes: SankeyNodeExtended[];
  innerWidth: number;
}

export const SankeyNodes = ({ nodes, innerWidth }: SankeyNodesProps) => {
  // Validate nodes before rendering
  if (!nodes || nodes.length === 0) {
    console.warn("No nodes provided to SankeyNodes component");
    return null;
  }
  
  return (
    <g>
      {nodes.map((node, index) => {
        // Skip nodes with invalid dimensions
        if (node.x0 === undefined || node.y0 === undefined || 
            node.x1 === undefined || node.y1 === undefined) {
          console.warn(`Node at index ${index} has invalid dimensions`, node);
          return null;
        }
        
        const nodeHeight = node.y1 - node.y0;
        const nodeWidth = node.x1 - node.x0;
        
        // Skip nodes with invalid dimensions
        if (isNaN(nodeHeight) || nodeHeight <= 0 || isNaN(nodeWidth) || nodeWidth <= 0) {
          console.warn(`Node at index ${index} has invalid size`, node);
          return null;
        }
        
        return (
          <g key={index} transform={`translate(${node.x0},${node.y0})`}>
            <rect
              height={nodeHeight}
              width={nodeWidth}
              fill={node.color || "#ccc"}
            >
              <title>{`${node.name || 'Unknown'}\n${formatCurrency(node.value || 0)}`}</title>
            </rect>
            <text
              x={node.x0 < innerWidth / 2 ? nodeWidth + 6 : -6}
              y={nodeHeight / 2}
              dy="0.35em"
              textAnchor={node.x0 < innerWidth / 2 ? "start" : "end"}
              fontSize="10px"
              fontWeight="bold"
              fill="black"
            >
              {node.name || 'Unknown'}
            </text>
          </g>
        );
      }).filter(Boolean)}
    </g>
  );
};
