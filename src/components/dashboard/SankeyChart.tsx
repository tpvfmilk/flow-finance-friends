import { useRef, useEffect, useState } from "react";
import { SankeyData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, SankeyNode, SankeyLink } from "d3-sankey";

interface SankeyChartProps {
  data: SankeyData;
  height?: number | string;
}

// Define extended types for D3 Sankey
interface SankeyNodeExtended extends SankeyNode<any, any> {
  index: number;
  name: string;
  category?: string;
  type: "deposit" | "joint" | "category" | "expense" | "goal";
  color: string;
  value: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

interface SankeyLinkExtended extends SankeyLink<any, any> {
  source: SankeyNodeExtended;
  target: SankeyNodeExtended;
  width: number;
  value: number;
  category?: string;
}

export const SankeyChart = ({ data, height = 500 }: SankeyChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);

  // Transform data to include joint account node
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

      // Transform the data to add a joint account node
      const depositNodes = data.nodes.filter(node => node.type === "deposit");
      const categoryNodes = data.nodes.filter(node => node.type === "category");
      const expenseNodes = data.nodes.filter(node => node.type === "expense");
      const goalNodes = data.nodes.filter(node => node.type === "goal");
      
      // Calculate total deposit amount
      const totalDepositAmount = depositNodes.reduce((total, node) => total + node.value, 0);
      
      // Create joint account node
      const jointAccountNode = {
        name: "Joint Account",
        id: "joint",
        type: "joint" as const,
        value: totalDepositAmount,
      };
      
      // Process nodes for D3 Sankey layout with joint account included
      const nodeMap = new Map();
      
      // Add all nodes including the joint account node
      const processedNodes = [
        ...depositNodes.map((node, index) => {
          const nodeId = node.id || `deposit-${index}`;
          nodeMap.set(nodeId, index);
          return {
            ...node,
            id: nodeId,
            index,
            name: node.name,
            type: node.type,
            color: getNodeColor(node)
          };
        }),
        {
          name: jointAccountNode.name,
          id: jointAccountNode.id,
          type: jointAccountNode.type,
          value: jointAccountNode.value,
          index: depositNodes.length,
          color: "#6366F1", // indigo for joint account
        },
        ...categoryNodes.map((node, index) => {
          const nodeIndex = index + depositNodes.length + 1;
          const nodeId = node.id || `category-${index}`;
          nodeMap.set(nodeId, nodeIndex);
          return {
            ...node,
            id: nodeId,
            index: nodeIndex,
            name: node.name,
            category: node.category || '',
            type: node.type,
            color: getNodeColor(node)
          };
        }),
        ...expenseNodes.map((node, index) => {
          const nodeIndex = index + depositNodes.length + categoryNodes.length + 1;
          const nodeId = node.id || `expense-${index}`;
          nodeMap.set(nodeId, nodeIndex);
          return {
            ...node,
            id: nodeId,
            index: nodeIndex,
            name: node.name,
            type: node.type,
            color: getNodeColor(node)
          };
        }),
        ...goalNodes.map((node, index) => {
          const nodeIndex = index + depositNodes.length + categoryNodes.length + expenseNodes.length + 1;
          const nodeId = node.id || `goal-${index}`;
          nodeMap.set(nodeId, nodeIndex);
          return {
            ...node,
            id: nodeId,
            index: nodeIndex,
            name: node.name,
            type: node.type,
            color: getNodeColor(node)
          };
        })
      ];
      
      // Create links from deposits to joint account
      const depositToJointLinks = depositNodes.map(node => ({
        source: nodeMap.get(node.id || `deposit-${nodeMap.get(node.id)}`),
        target: depositNodes.length, // Joint account node index
        value: node.value
      }));
      
      // Create links from joint account to categories
      const jointToCategoryLinks = data.links.filter(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.toString();
        const sourceNode = data.nodes.find(n => n.id === sourceId);
        return sourceNode && sourceNode.type === 'deposit';
      }).map(link => {
        const targetId = typeof link.target === 'string' ? link.target : link.target.toString();
        const target = nodeMap.get(targetId);
        
        if (target === undefined) {
          console.warn(`Target node not found for link: ${targetId}`);
          return null;
        }
        
        return {
          source: depositNodes.length, // Joint account node index
          target,
          value: link.value,
          category: link.category || ''
        };
      }).filter(Boolean); // Remove null links
      
      // Keep category to expense links as they are
      const categoryToExpenseLinks = data.links.filter(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.toString();
        const sourceNode = data.nodes.find(n => n.id === sourceId);
        const targetId = typeof link.target === 'string' ? link.target : link.target.toString();
        const targetNode = data.nodes.find(n => n.id === targetId);
        
        return sourceNode && targetNode && 
               ((sourceNode.type === 'category' && (targetNode.type === 'expense' || targetNode.type === 'goal')) || 
                (sourceNode.type === 'expense' && targetNode.type === 'goal'));
      }).map(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.toString();
        const targetId = typeof link.target === 'string' ? link.target : link.target.toString();
        
        const source = nodeMap.get(sourceId);
        const target = nodeMap.get(targetId);
        
        if (source === undefined || target === undefined) {
          console.warn(`Source or target node not found for link: ${sourceId} -> ${targetId}`);
          return null;
        }
        
        return {
          source,
          target,
          value: link.value,
          category: link.category || ''
        };
      }).filter(Boolean); // Remove null links
      
      // Combine all links
      const processedLinks = [
        ...depositToJointLinks,
        ...jointToCategoryLinks,
        ...categoryToExpenseLinks
      ];

      console.log("Processed Nodes:", processedNodes);
      console.log("Processed Links:", processedLinks);
      console.log("Node Map:", Array.from(nodeMap.entries()));

      // Check for potential issues with the links
      processedLinks.forEach(link => {
        if (link.source === undefined || link.target === undefined) {
          console.error("Invalid link:", link);
        }
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
      }) as { nodes: SankeyNodeExtended[], links: SankeyLinkExtended[] };

      // Add links
      svg.append("g")
        .selectAll("path")
        .data(links)
        .join("path")
        .attr("d", sankeyLinkHorizontal())
        .attr("stroke-width", (d: SankeyLinkExtended) => Math.max(1, d.width))
        .attr("stroke", (d: SankeyLinkExtended) => {
          const sourceNode = d.source;
          const targetNode = d.target;
          
          // Creating a gradient for the link
          return d3.interpolateRgb(
            sourceNode.color || "#a6cee3",
            targetNode.color || "#b2df8a"
          )(0.5);
        })
        .attr("fill", "none")
        .attr("stroke-opacity", 0.5)
        .append("title")
        .text((d: SankeyLinkExtended) => {
          const sourceName = d.source.name;
          const targetName = d.target.name;
          return `${sourceName} → ${targetName}: ${formatCurrency(d.value)}`;
        });

      // Add nodes
      const nodeGroup = svg.append("g")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .attr("transform", (d: SankeyNodeExtended) => `translate(${d.x0},${d.y0})`);

      // Add rectangles for nodes
      nodeGroup.append("rect")
        .attr("height", (d: SankeyNodeExtended) => d.y1 - d.y0)
        .attr("width", (d: SankeyNodeExtended) => d.x1 - d.x0)
        .attr("fill", (d: SankeyNodeExtended) => d.color || "#ccc")
        .append("title")
        .text((d: SankeyNodeExtended) => `${d.name}\n${formatCurrency(d.value)}`);

      // Add node labels
      nodeGroup.append("text")
        .attr("x", (d: SankeyNodeExtended) => d.x0 < innerWidth / 2 ? (d.x1 - d.x0) + 6 : -6)
        .attr("y", (d: SankeyNodeExtended) => (d.y1 - d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", (d: SankeyNodeExtended) => d.x0 < innerWidth / 2 ? "start" : "end")
        .text((d: SankeyNodeExtended) => d.name)
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
          }) as { nodes: SankeyNodeExtended[], links: SankeyLinkExtended[] };
          
          // Redraw links
          svg.append("g")
            .selectAll("path")
            .data(newLinks)
            .join("path")
            .attr("d", sankeyLinkHorizontal())
            .attr("stroke-width", (d: SankeyLinkExtended) => Math.max(1, d.width))
            .attr("stroke", (d: SankeyLinkExtended) => {
              const sourceNode = d.source;
              const targetNode = d.target;
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
            .attr("transform", (d: SankeyNodeExtended) => `translate(${d.x0},${d.y0})`);
            
          newNodeGroup.append("rect")
            .attr("height", (d: SankeyNodeExtended) => d.y1 - d.y0)
            .attr("width", (d: SankeyNodeExtended) => d.x1 - d.x0)
            .attr("fill", (d: SankeyNodeExtended) => d.color || "#ccc");
            
          newNodeGroup.append("text")
            .attr("x", (d: SankeyNodeExtended) => d.x0 < (newWidth - margin.left - margin.right) / 2 ? (d.x1 - d.x0) + 6 : -6)
            .attr("y", (d: SankeyNodeExtended) => (d.y1 - d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", (d: SankeyNodeExtended) => d.x0 < (newWidth - margin.left - margin.right) / 2 ? "start" : "end")
            .text((d: SankeyNodeExtended) => d.name)
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
    } else if (node.type === 'joint') {
      return "#6366F1"; // indigo for joint account
    } else if (node.type === 'category') {
      // Try to get color from category name
      const categoryName = node.category?.toLowerCase().replace(/\s+/g, '-');
      // Use a default color if category not found
      return categoryName ? `hsl(var(--${categoryName}))` : "#9CA3AF";
    } else if (node.type === 'goal') {
      return "#8B5CF6"; // purple for goals
    } else {
      return "#EF4444"; // red for expenses
    }
  }

  if (loadError) {
    return (
      <div className="w-full">
        <div className="text-center p-10">
          <div className="text-red-500">
            Error rendering D3 Sankey chart: {loadError.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full" style={{ height }}>
      {!data.nodes.length && (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-muted-foreground">No data available for Sankey chart</p>
        </div>
      )}
    </div>
  );
};
