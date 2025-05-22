
import { useRef, useEffect, useState } from "react";
import { 
  ResponsiveContainer, 
  Sankey, 
  Tooltip,
  Rectangle,
  Layer,
  Text,
  XAxis
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { SankeyData as AppSankeyData, SankeyNode as AppSankeyNodeType, SankeyLink as AppSankeyLink } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface CustomNodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  payload: any;
  containerWidth: number;
}

interface SankeyChartProps {
  data: AppSankeyData;
  height?: number | string;
}

const CustomNode = ({ x, y, width, height, index, payload, containerWidth }: CustomNodeProps) => {
  // Get appropriate text color based on background darkness
  const getTextColor = () => {
    if (payload.type === 'category') {
      const category = payload.category?.toLowerCase();
      // Special case for light colors
      if (category === 'savings') {
        return "#000000";
      }
      return "#FFFFFF";
    }
    return "#000000";
  };

  // Get node background color
  const getNodeColor = () => {
    if (payload.type === 'deposit') {
      return "#3B82F6"; // blue for deposits
    } else if (payload.type === 'category') {
      return payload.category ? `hsl(var(--${payload.category.toLowerCase().replace(/\s+/g, '-')}))` : "#9CA3AF";
    } else {
      return "#EF4444"; // red for expenses
    }
  };

  const textX = x + width / 2;
  const textY = y + height / 2;
  const maxTextWidth = Math.min(width * 0.9, 120); // Limit text width
  const fontSize = containerWidth > 640 ? 12 : 10;

  return (
    <Layer key={`CustomNode-${index}`}>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={getNodeColor()}
        fillOpacity={0.9}
        className="sankey-node"
        rx={4}
        ry={4}
      />
      <Text
        x={textX}
        y={textY - 8}
        textAnchor="middle"
        verticalAnchor="middle"
        fill={getTextColor()}
        fontSize={fontSize}
        fontWeight="bold"
        width={maxTextWidth}
      >
        {payload.name}
      </Text>
      <Text
        x={textX}
        y={textY + 10}
        textAnchor="middle"
        verticalAnchor="middle"
        fill={getTextColor()}
        fontSize={fontSize - 2}
        width={maxTextWidth}
      >
        {formatCurrency(payload.value)}
      </Text>
    </Layer>
  );
};

const CustomLink = (props: any) => {
  return <Layer>
    <path
      d={props.path}
      fill="none"
      stroke={props.source.payload.type === 'category' ? `hsl(var(--${props.source.payload.category?.toLowerCase().replace(/\s+/g, '-')}))` : '#9CA3AF'}
      strokeWidth={props.sourceX < props.targetX ? Math.max(1, props.linkWidth) : 0}
      strokeOpacity={0.3}
      className="sankey-link"
    />
  </Layer>
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    if (data.source && data.target) {
      // This is a link tooltip
      return (
        <Card className="p-2 shadow-lg border border-gray-200 bg-white">
          <CardContent className="p-2 text-sm">
            <p className="font-bold">{`${data.source.name} → ${data.target.name}`}</p>
            <p>{formatCurrency(data.value)}</p>
          </CardContent>
        </Card>
      );
    } else {
      // This is a node tooltip
      return (
        <Card className="p-2 shadow-lg border border-gray-200 bg-white">
          <CardContent className="p-2 text-sm">
            <p className="font-bold">{data.name}</p>
            <p>{formatCurrency(data.value)}</p>
            {data.type === 'category' && (
              <p className="text-xs mt-1">(Click for details)</p>
            )}
          </CardContent>
        </Card>
      );
    }
  }
  
  return null;
};

export const SankeyChart = ({ data, height = 500 }: SankeyChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  
  // Process data to ensure compatibility with recharts
  // Convert string IDs to numeric indices for recharts
  const [processedData, setProcessedData] = useState<any>({ nodes: [], links: [] });
  
  useEffect(() => {
    // Create a mapping of node IDs to indices
    const nodeMap = new Map();
    
    // Process nodes first to create id-to-index mapping
    const processedNodes = data.nodes.map((node, index) => {
      if (typeof node.id === 'string') {
        nodeMap.set(node.id, index);
      }
      return { ...node, index };
    });
    
    // Then process links using the mapping
    const processedLinks = data.links.map(link => {
      // Convert source/target from string IDs to numeric indices if needed
      const sourceIndex = typeof link.source === 'string' && nodeMap.has(link.source) 
        ? nodeMap.get(link.source) 
        : link.source;
        
      const targetIndex = typeof link.target === 'string' && nodeMap.has(link.target)
        ? nodeMap.get(link.target)
        : link.target;
        
      return { 
        ...link, 
        source: sourceIndex, 
        target: targetIndex 
      };
    });
    
    setProcessedData({ nodes: processedNodes, links: processedLinks });
  }, [data]);
  
  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle node click
  const handleNodeClick = (nodeData: AppSankeyNodeType) => {
    console.log("Node clicked:", nodeData);
    // TODO: Implement node click handler
    // If category node, show detailed breakdown
  };
  
  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px]">
      {processedData.nodes.length > 0 && processedData.links.length > 0 && (
        <ResponsiveContainer width="100%" height={height}>
          <Sankey
            data={processedData}
            node={(nodeProps: any) => <CustomNode {...nodeProps} containerWidth={containerWidth} />}
            link={<CustomLink />}
            nodePadding={50}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            onClick={handleNodeClick}
          >
            <Tooltip content={<CustomTooltip />} />
            <XAxis />
          </Sankey>
        </ResponsiveContainer>
      )}
    </div>
  );
};
