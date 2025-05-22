
import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SankeyData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";

interface SankeyChartProps {
  data: SankeyData;
  height?: number | string;
}

export const SankeyChart = ({ data, height = 500 }: SankeyChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);

  // Draw the chart when data is ready and component mounts
  useEffect(() => {
    if (!containerRef.current || !data.nodes.length || !data.links.length) {
      return;
    }

    try {
      // Clear previous chart
      d3.select(containerRef.current).selectAll("*").remove();

      // Set dimensions
      const width = containerRef.current.clientWidth;
      const chartHeight = typeof height === "string" ? parseInt(height) : height;
      const margin = { top: 10, right: 10, bottom: 10, left: 10 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = chartHeight - margin.top - margin.bottom;

      // Create SVG
      const svg = d3.select(containerRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", chartHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Process data for D3 Sankey layout
      // D3 Sankey expects nodes with numeric indices
      const nodeMap = new Map();
      const processedNodes = data.nodes.map((node, index) => {
        nodeMap.set(node.id || index.toString(), index);
        return {
          ...node,
          index,
          name: node.name,
          category: node.category || '',
          type: node.type,
          color: getNodeColor(node)
        };
      });

      // Process links for D3 Sankey
      const processedLinks = data.links.map(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.toString();
        const targetId = typeof link.target === 'string' ? link.target : link.target.toString();
        
        return {
          source: nodeMap.get(sourceId),
          target: nodeMap.get(targetId),
          value: link.value,
          category: link.category || ''
        };
      });

      // Create the sankey generator
      const sankeyGenerator = sankey()
        .nodeWidth(15)
        .nodePadding(50)
        .extent([[0, 0], [innerWidth, innerHeight]]);

      // Generate the sankey layout
      const { nodes, links } = sankeyGenerator({
        nodes: processedNodes,
        links: processedLinks
      });

      // Add links
      svg.append("g")
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("d", sankeyLinkHorizontal())
        .attr("stroke-width", d => Math.max(1, d.width))
        .attr("stroke", d => {
          const sourceNode = nodes[d.source.index];
          const targetNode = nodes[d.target.index];
          
          // Creating a gradient for the link
          return d3.interpolateRgb(
            sourceNode.color || "#a6cee3",
            targetNode.color || "#b2df8a"
          )(0.5);
        })
        .attr("fill", "none")
        .attr("stroke-opacity", 0.5)
        .append("title")
        .text(d => {
          const sourceName = nodes[d.source.index].name;
          const targetName = nodes[d.target.index].name;
          return `${sourceName} → ${targetName}: ${formatCurrency(d.value)}`;
        });

      // Add nodes
      const nodeGroup = svg.append("g")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

      // Add rectangles for nodes
      nodeGroup.append("rect")
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", d => d.color || "#ccc")
        .append("title")
        .text(d => `${d.name}\n${formatCurrency(d.value)}`);

      // Add node labels
      nodeGroup.append("text")
        .attr("x", d => d.x0 < innerWidth / 2 ? (d.x1 - d.x0) + 6 : -6)
        .attr("y", d => (d.y1 - d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < innerWidth / 2 ? "start" : "end")
        .text(d => d.name)
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .attr("fill", "black");

      // Handle resize events
      const handleResize = () => {
        if (containerRef.current) {
          // Recreate chart on resize
          d3.select(containerRef.current).selectAll("*").remove();
          // Recalculate dimensions and redraw
          const newWidth = containerRef.current.clientWidth;
          const svg = d3.select(containerRef.current)
            .append("svg")
            .attr("width", newWidth)
            .attr("height", chartHeight)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
            
          // Update sankey generator with new width
          sankeyGenerator.extent([[0, 0], [newWidth - margin.left - margin.right, innerHeight]]);
          
          // Regenerate layout with new dimensions
          const { nodes: newNodes, links: newLinks } = sankeyGenerator({
            nodes: processedNodes,
            links: processedLinks
          });
          
          // Redraw links
          svg.append("g")
            .selectAll("path")
            .data(newLinks)
            .join("path")
            .attr("d", sankeyLinkHorizontal())
            .attr("stroke-width", d => Math.max(1, d.width))
            .attr("stroke", d => {
              const sourceNode = newNodes[d.source.index];
              const targetNode = newNodes[d.target.index];
              return d3.interpolateRgb(
                sourceNode.color || "#a6cee3", 
                targetNode.color || "#b2df8a"
              )(0.5);
            })
            .attr("fill", "none")
            .attr("stroke-opacity", 0.5);
            
          // Redraw nodes
          const newNodeGroup = svg.append("g")
            .selectAll("g")
            .data(newNodes)
            .join("g")
            .attr("transform", d => `translate(${d.x0},${d.y0})`);
            
          newNodeGroup.append("rect")
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("fill", d => d.color || "#ccc");
            
          newNodeGroup.append("text")
            .attr("x", d => d.x0 < (newWidth - margin.left - margin.right) / 2 ? (d.x1 - d.x0) + 6 : -6)
            .attr("y", d => (d.y1 - d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < (newWidth - margin.left - margin.right) / 2 ? "start" : "end")
            .text(d => d.name)
            .attr("font-size", "10px")
            .attr("font-weight", "bold")
            .attr("fill", "black");
        }
      };
      
      // Add resize event listener
      window.addEventListener('resize', handleResize);
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    } catch (error) {
      console.error('Error rendering D3 Sankey chart:', error);
      setLoadError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [data, height]);

  // Helper function to determine node colors
  function getNodeColor(node: any) {
    if (node.type === 'deposit') {
      return "#3B82F6"; // blue for deposits
    } else if (node.type === 'category') {
      // Try to get color from category name
      const categoryName = node.category?.toLowerCase().replace(/\s+/g, '-');
      // Use a default color if category not found
      return categoryName ? `hsl(var(--${categoryName}))` : "#9CA3AF";
    } else {
      return "#EF4444"; // red for expenses
    }
  }

  if (loadError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Money Flow</CardTitle>
        </CardHeader>
        <CardContent className="text-center p-10">
          <div className="text-red-500">
            Error rendering D3 Sankey chart: {loadError.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div ref={containerRef} className="w-full" style={{ height }}>
      {!data.nodes.length && (
        <Card className="w-full h-full flex items-center justify-center">
          <CardContent>
            <p className="text-muted-foreground">No data available for Sankey chart</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
