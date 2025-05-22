
import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { SankeyChartProps, SankeyNodeExtended, SankeyLinkExtended } from "./sankeyTypes";
import { processNodes, processLinks } from "./sankeyUtils";
import { SankeyNodes } from "./SankeyNodes";
import { SankeyLinks } from "./SankeyLinks";

export const SankeyChart = ({ data, height = 500 }: SankeyChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [sankeyData, setSankeyData] = useState<{
    nodes: SankeyNodeExtended[];
    links: SankeyLinkExtended[];
  } | null>(null);

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
      const margin = { top: 10, right: 10, bottom: 10, left: 10 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = chartHeight - margin.top - margin.bottom;

      setDimensions({ width: innerWidth, height: innerHeight });

      // Process nodes and links
      const { processedNodes, nodeMap, depositNodes } = processNodes(data);
      const validProcessedLinks = processLinks(data, nodeMap, depositNodes);

      // Debug logging
      console.log("Total nodes:", processedNodes.length);
      console.log("Valid links:", validProcessedLinks.length);
      console.log("Node Map Contents:", Array.from(nodeMap.entries()));
      
      // Create the sankey generator
      const sankeyGenerator = sankey()
        .nodeWidth(15)
        .nodePadding(50)
        .extent([[0, 0], [innerWidth, innerHeight]]);

      // Generate the sankey layout
      const sankeyDataObj = {
        nodes: processedNodes,
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
      
      // Render links
      svg.append("g")
        .selectAll("path")
        .data(result.links)
        .join("path")
        .attr("d", sankeyLinkHorizontal())
        .attr("stroke-width", (d: any) => Math.max(1, d.width))
        .attr("stroke", (d: any) => {
          return d3.interpolateRgb(
            d.source.color || "#a6cee3",
            d.target.color || "#b2df8a"
          )(0.5);
        })
        .attr("fill", "none")
        .attr("stroke-opacity", 0.5)
        .append("title")
        .text((d: any) => `${d.source.name} → ${d.target.name}: ${d.value}`);
      
      // Render nodes
      const nodeGroup = svg.append("g")
        .selectAll("g")
        .data(result.nodes)
        .join("g")
        .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);
      
      nodeGroup.append("rect")
        .attr("height", (d: any) => d.y1 - d.y0)
        .attr("width", (d: any) => d.x1 - d.x0)
        .attr("fill", (d: any) => d.color || "#ccc")
        .append("title")
        .text((d: any) => `${d.name}\n${d.value}`);
      
      nodeGroup.append("text")
        .attr("x", (d: any) => d.x0 < innerWidth / 2 ? (d.x1 - d.x0) + 6 : -6)
        .attr("y", (d: any) => (d.y1 - d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", (d: any) => d.x0 < innerWidth / 2 ? "start" : "end")
        .text((d: any) => d.name)
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .attr("fill", "black");
    } catch (error) {
      console.error('Error rendering D3 Sankey chart:', error);
      setLoadError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [data, height]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && sankeyData) {
        // Recalculate on resize
        try {
          const width = containerRef.current.clientWidth;
          const chartHeight = typeof height === "string" ? parseInt(height) : height;
          const margin = { top: 10, right: 10, bottom: 10, left: 10 };
          const innerWidth = width - margin.left - margin.right;
          const innerHeight = chartHeight - margin.top - margin.bottom;
          
          // Clear previous rendering
          d3.select(containerRef.current).selectAll("*").remove();
          
          // Create SVG
          const svg = d3.select(containerRef.current)
            .append("svg")
            .attr("width", width)
            .attr("height", chartHeight)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
          
          // Update sankey generator with new width
          const sankeyGenerator = sankey()
            .nodeWidth(15)
            .nodePadding(50)
            .extent([[0, 0], [innerWidth, innerHeight]]);
          
          // Get processed data from previous calculation
          const { processedNodes, nodeMap, depositNodes } = processNodes(data);
          const validProcessedLinks = processLinks(data, nodeMap, depositNodes);
          
          // Regenerate layout with new dimensions
          const result = sankeyGenerator({
            nodes: processedNodes,
            links: validProcessedLinks
          });
          
          // Render links
          svg.append("g")
            .selectAll("path")
            .data(result.links)
            .join("path")
            .attr("d", sankeyLinkHorizontal())
            .attr("stroke-width", (d: any) => Math.max(1, d.width))
            .attr("stroke", (d: any) => {
              return d3.interpolateRgb(
                d.source.color || "#a6cee3",
                d.target.color || "#b2df8a"
              )(0.5);
            })
            .attr("fill", "none")
            .attr("stroke-opacity", 0.5);
          
          // Render nodes
          const nodeGroup = svg.append("g")
            .selectAll("g")
            .data(result.nodes)
            .join("g")
            .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);
          
          nodeGroup.append("rect")
            .attr("height", (d: any) => d.y1 - d.y0)
            .attr("width", (d: any) => d.x1 - d.x0)
            .attr("fill", (d: any) => d.color || "#ccc");
          
          nodeGroup.append("text")
            .attr("x", (d: any) => d.x0 < innerWidth / 2 ? (d.x1 - d.x0) + 6 : -6)
            .attr("y", (d: any) => (d.y1 - d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", (d: any) => d.x0 < innerWidth / 2 ? "start" : "end")
            .text((d: any) => d.name)
            .attr("font-size", "10px")
            .attr("font-weight", "bold")
            .attr("fill", "black");
        } catch (error) {
          console.error('Error resizing D3 Sankey chart:', error);
          setLoadError(error instanceof Error ? error : new Error(String(error)));
        }
      }
    };
    
    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sankeyData, data, height]);

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
