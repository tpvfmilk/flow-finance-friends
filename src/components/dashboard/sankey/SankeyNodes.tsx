
import { SankeyNodeExtended } from "./sankeyTypes";

interface SankeyNodesProps {
  nodes: SankeyNodeExtended[];
  innerWidth: number;
}

export const SankeyNodes = ({ nodes, innerWidth }: SankeyNodesProps) => {
  return (
    <g>
      {nodes.map((node, index) => (
        <g key={index} transform={`translate(${node.x0},${node.y0})`}>
          <rect
            height={node.y1 - node.y0}
            width={node.x1 - node.x0}
            fill={node.color || "#ccc"}
          >
            <title>{`${node.name}\n${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(node.value)}`}</title>
          </rect>
          <text
            x={node.x0 < innerWidth / 2 ? (node.x1 - node.x0) + 6 : -6}
            y={(node.y1 - node.y0) / 2}
            dy="0.35em"
            textAnchor={node.x0 < innerWidth / 2 ? "start" : "end"}
            fontSize="10px"
            fontWeight="bold"
            fill="black"
          >
            {node.name}
          </text>
        </g>
      ))}
    </g>
  );
};
