
import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { SankeyChartProps, SankeyNodeExtended, SankeyLinkExtended } from "./sankeyTypes";
import { processNodes, processLinks } from "./sankeyUtils";

export const SankeyChart = ({ data, height = 500 }: SankeyChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [sankeyData, setSankeyData] = useState<{
    nodes: SankeyNodeExtended[];
    links: SankeyLinkExtended[];
  } | null>(null);

  // Create linear gradient definitions for links
  const createGradientDefs = (svg: any, links: any[]) => {
    const defs = svg.append("defs");
    
    links.forEach((link, index) => {
      const gradientId = `gradient-${index}`;
      const gradient = defs.append("linearGradient")
        .attr("id", gradientId)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", link.source.x1)
        .attr("x2", link.target.x0);

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", link.source.color || "#3B82F6")
        .attr("stop-opacity", 0.8);

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", link.target.color || "#10B981")
        .attr("stop-opacity", 0.8);

      link.gradientId = gradientId;
    });
  };

  // Process data and create the chart
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
      const margin = { top: 20, right: 40, bottom: 20, left: 40 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = chartHeight - margin.top - margin.bottom;

      setDimensions({ width: innerWidth, height: innerHeight });

      // Process nodes and links
      const { processedNodes, nodeMap, depositNodes } = processNodes(data);
      const validProcessedLinks = processLinks(data, nodeMap, depositNodes);

      // Debug logging
      console.log("Total nodes:", processedNodes.length);
      console.log("Valid links:", validProcessedLinks.length);
      
      // Create the sankey generator with top alignment
      const sankeyGenerator = sankey()
        .nodeWidth(24) // Slightly wider nodes
        .nodePadding(20) // Tighter padding for better top alignment
        .nodeAlign(d3.sankeyJustify) // Use justify for top alignment
        .nodeSort((a: any, b: any) => {
          // Custom sorting for consistent top alignment
          if (a.layer !== b.layer) {
            return a.layer - b.layer;
          }
          // Sort by value within layer for better visual hierarchy
          return b.value - a.value;
        })
        .extent([[0, 0], [innerWidth, innerHeight]]);

      // Add layer information to nodes for proper alignment
      const layeredNodes = processedNodes.map((node, index) => ({
        ...node,
        originalIndex: index,
        layer: node.type === 'deposit' ? 0 : 
               node.type === 'joint' ? 1 : 
               node.type === 'category' ? 2 : 3
      }));

      // Generate the sankey layout
      const sankeyDataObj = {
        nodes: layeredNodes,
        links: validProcessedLinks
      };
      
      // Check for data validity before rendering
      if (sankeyDataObj.nodes.length === 0 || sankeyDataObj.links.length === 0) {
        throw new Error("Invalid Sankey data: No nodes or links to display");
      }
      
      // Generate the layout
      const result = sankeyGenerator(sankeyDataObj);
      setSankeyData(result as { nodes: SankeyNodeExtended[], links: SankeyLinkExtended[] });

      // Create SVG
      const svg = d3.select(containerRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", chartHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      // Create gradient definitions for beautiful link colors
      createGradientDefs(svg, result.links);
      
      // Render links with gradients
      svg.append("g")
        .selectAll("path")
        .data(result.links)
        .join("path")
        .attr("d", sankeyLinkHorizontal())
        .attr("stroke-width", (d: any) => Math.max(2, d.width))
        .attr("stroke", (d: any) => `url(#${d.gradientId})`)
        .attr("fill", "none")
        .attr("stroke-opacity", 0.6)
        .style("mix-blend-mode", "multiply") // Beautiful blend mode
        .on("mouseover", function(event, d: any) {
          d3.select(this).attr("stroke-opacity", 0.8);
        })
        .on("mouseout", function(event, d: any) {
          d3.select(this).attr("stroke-opacity", 0.6);
        })
        .append("title")
        .text((d: any) => `${d.source.name} → ${d.target.name}: $${d.value.toLocaleString()}`);
      
      // Render nodes with enhanced styling
      const nodeGroup = svg.append("g")
        .selectAll("g")
        .data(result.nodes)
        .join("g")
        .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);
      
      // Node rectangles with rounded corners
      nodeGroup.append("rect")
        .attr("height", (d: any) => Math.max(4, d.y1 - d.y0))
        .attr("width", (d: any) => d.x1 - d.x0)
        .attr("fill", (d: any) => d.color || "#E5E7EB")
        .attr("rx", 3) // Rounded corners
        .attr("ry", 3)
        .style("filter", "drop-shadow(0 1px 3px rgba(0,0,0,0.1))") // Subtle shadow
        .on("mouseover", function(event, d: any) {
          d3.select(this).style("filter", "drop-shadow(0 2px 6px rgba(0,0,0,0.15))");
        })
        .on("mouseout", function(event, d: any) {
          d3.select(this).style("filter", "drop-shadow(0 1px 3px rgba(0,0,0,0.1))");
        })
        .append("title")
        .text((d: any) => `${d.name}\n$${d.value?.toLocaleString() || 'N/A'}`);
      
      // Enhanced text labels with better positioning
      nodeGroup.append("text")
        .attr("x", (d: any) => {
          const nodeWidth = d.x1 - d.x0;
          const isLeftSide = d.x0 < innerWidth / 2;
          return isLeftSide ? nodeWidth + 10 : -10;
        })
        .attr("y", (d: any) => {
          const nodeHeight = d.y1 - d.y0;
          return Math.max(nodeHeight / 2, 8); // Top-aligned positioning
        })
        .attr("dy", "0.35em")
        .attr("text-anchor", (d: any) => d.x0 < innerWidth / 2 ? "start" : "end")
        .text((d: any) => d.name)
        .attr("font-size", "13px")
        .attr("font-weight", "600")
        .attr("fill", "#1F2937")
        .style("pointer-events", "none");

      // Add percentage labels for nodes with sufficient height
      nodeGroup
        .filter((d: any) => (d.y1 - d.y0) > 20) // Only show on larger nodes
        .append("text")
        .attr("x", (d: any) => {
          const nodeWidth = d.x1 - d.x0;
          const isLeftSide = d.x0 < innerWidth / 2;
          return isLeftSide ? nodeWidth + 10 : -10;
        })
        .attr("y", (d: any) => {
          const nodeHeight = d.y1 - d.y0;
          return Math.max(nodeHeight / 2 + 16, 24);
        })
        .attr("dy", "0.35em")
        .attr("text-anchor", (d: any) => d.x0 < innerWidth / 2 ? "start" : "end")
        .text((d: any) => {
          if (!d.value) return '';
          // Calculate percentage if this is a category node
          const totalValue = result.nodes
            .filter((n: any) => n.layer === d.layer)
            .reduce((sum: number, n: any) => sum + (n.value || 0), 0);
          const percentage = totalValue > 0 ? ((d.value / totalValue) * 100).toFixed(1) : '0';
          return `$${d.value.toLocaleString()} (${percentage}%)`;
        })
        .attr("font-size", "11px")
        .attr("font-weight", "400")
        .attr("fill", "#6B7280")
        .style("pointer-events", "none");
        
    } catch (error) {
      console.error('Error rendering D3 Sankey chart:', error);
      setLoadError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [data, height]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && sankeyData) {
        // Trigger re-render on resize
        const resizeEvent = new Event('sankeyResize');
        containerRef.current.dispatchEvent(resizeEvent);
      }
    };
    
    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sankeyData]);

  if (loadError) {
    return (
      <div className="w-full">
        <div className="text-center p-10">
          <div className="text-red-500 font-medium">
            Error rendering Sankey chart: {loadError.message}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Please check the console for more details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full bg-white rounded-lg" style={{ height }}>
      {!data.nodes.length && (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-muted-foreground">No data available for Sankey chart</p>
        </div>
      )}
    </div>
  );
};
