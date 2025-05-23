
import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { SankeyChartProps, SankeyNodeExtended, SankeyLinkExtended } from "./sankeyTypes";
import { processNodes, processLinks, getNodeColor } from "./sankeyUtils";
import { SankeyNodes } from "./SankeyNodes";
import { SankeyLinks } from "./SankeyLinks";
import { toast } from "@/hooks/use-toast";

export const SankeyChart = ({ data, height = 500 }: SankeyChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [sankeyData, setSankeyData] = useState<{
    nodes: SankeyNodeExtended[];
    links: SankeyLinkExtended[];
  } | null>(null);

  // Validate input data
  const isValidData = data && 
                     Array.isArray(data.nodes) && 
                     data.nodes.length > 0 && 
                     Array.isArray(data.links) && 
                     data.links.length > 0;

  // Process data and create the chart
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    if (!isValidData) {
      console.warn("Invalid Sankey data:", data);
      setLoadError(new Error("Invalid Sankey data: No nodes or links to display"));
      return;
    }

    try {
      // Clear previous chart
      d3.select(containerRef.current).selectAll("*").remove();
      setLoadError(null); // Reset any previous errors

      // Set dimensions
      const width = containerRef.current.clientWidth;
      const chartHeight = typeof height === "string" ? parseInt(height) : height;
      const margin = { top: 5, right: 10, bottom: 5, left: 10 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = chartHeight - margin.top - margin.bottom;

      setDimensions({ width: innerWidth, height: innerHeight });

      // Process nodes and links with enhanced validation
      const { processedNodes, nodeMap, depositNodes } = processNodes(data);
      
      if (processedNodes.length === 0) {
        throw new Error("No valid nodes could be processed");
      }
      
      const validProcessedLinks = processLinks(data, nodeMap, depositNodes);
      
      if (validProcessedLinks.length === 0) {
        throw new Error("No valid links could be processed");
      }

      // Log for debugging
      console.log(`Processing Sankey chart: ${processedNodes.length} nodes, ${validProcessedLinks.length} links`);
      
      // Create the sankey generator with proper alignment
      const sankeyGenerator = sankey()
        .nodeWidth(15)
        .nodePadding(10) 
        .nodeAlign(0) // Using 0 for left alignment (d3.sankeyLeft equivalent)
        .extent([[0, 0], [innerWidth, innerHeight]]);

      // Generate the sankey layout
      const sankeyDataObj = {
        nodes: processedNodes,
        links: validProcessedLinks
      };
      
      // Additional validation before rendering
      if (sankeyDataObj.nodes.length === 0 || sankeyDataObj.links.length === 0) {
        throw new Error("Invalid Sankey data: No nodes or links to display");
      }
      
      // Generate the layout with try/catch to handle any d3-sankey internal errors
      try {
        const result = sankeyGenerator(sankeyDataObj);
        setSankeyData(result as { nodes: SankeyNodeExtended[], links: SankeyLinkExtended[] });

        // Create SVG
        const svg = d3.select(containerRef.current)
          .append("svg")
          .attr("width", width)
          .attr("height", chartHeight)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);
        
        // Render links with category-specific colors
        svg.append("g")
          .selectAll("path")
          .data(result.links)
          .join("path")
          .attr("d", sankeyLinkHorizontal())
          .attr("stroke-width", (d: any) => Math.max(1, d.width))
          .attr("stroke", (d: any) => {
            // Get the source category if available, otherwise use target
            const category = d.source.category || d.target.category || '';
            if (category) {
              return getNodeColor({ type: 'category', category });
            }
            return d3.interpolateRgb(
              d.source.color || "#a6cee3",
              d.target.color || "#b2df8a"
            )(0.5);
          })
          .attr("fill", "none")
          .attr("stroke-opacity", 0.5)
          .attr("class", "sankey-link")
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
        console.error('Error in D3 Sankey layout calculation:', error);
        setLoadError(error instanceof Error ? error : new Error(`D3 Sankey error: ${String(error)}`));
      }
    } catch (error) {
      console.error('Error rendering D3 Sankey chart:', error);
      setLoadError(error instanceof Error ? error : new Error(String(error)));
      // Notify the user through toast
      toast({
        title: "Chart Error",
        description: `Error rendering Sankey chart: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      });
    }
  }, [data, height, isValidData]);

  // Handle window resize with debouncing
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (containerRef.current && sankeyData && isValidData) {
          // Recalculate on resize
          try {
            const width = containerRef.current.clientWidth;
            const chartHeight = typeof height === "string" ? parseInt(height) : height;
            const margin = { top: 5, right: 10, bottom: 5, left: 10 };
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
            
            // Update sankey generator with new width and proper alignment
            const sankeyGenerator = sankey()
              .nodeWidth(15)
              .nodePadding(10)
              .nodeAlign(0) // Using 0 for left alignment (d3.sankeyLeft equivalent)
              .extent([[0, 0], [innerWidth, innerHeight]]);
            
            // Get processed data from previous calculation
            const { processedNodes, nodeMap, depositNodes } = processNodes(data);
            const validProcessedLinks = processLinks(data, nodeMap, depositNodes);
            
            // Regenerate layout with new dimensions
            const result = sankeyGenerator({
              nodes: processedNodes,
              links: validProcessedLinks
            });
            
            // Render links with category colors
            svg.append("g")
              .selectAll("path")
              .data(result.links)
              .join("path")
              .attr("d", sankeyLinkHorizontal())
              .attr("stroke-width", (d: any) => Math.max(1, d.width))
              .attr("stroke", (d: any) => {
                // Get the source category if available, otherwise use target
                const category = d.source.category || d.target.category || '';
                if (category) {
                  return getNodeColor({ type: 'category', category });
                }
                return d3.interpolateRgb(
                  d.source.color || "#a6cee3",
                  d.target.color || "#b2df8a"
                )(0.5);
              })
              .attr("fill", "none")
              .attr("stroke-opacity", 0.5)
              .attr("class", "sankey-link");
            
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
      }, 250); // Debounce resize events
    };
    
    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [sankeyData, data, height, isValidData]);

  // Show error state
  if (loadError) {
    return (
      <div className="w-full h-full">
        <div className="text-center p-10 rounded-md border border-red-300 bg-red-50">
          <div className="text-red-500 font-medium mb-2">
            Error rendering Sankey chart
          </div>
          <div className="text-sm text-red-700">
            {loadError.message}
          </div>
          <div className="text-xs text-red-400 mt-2">
            Please check the console for more details.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full" style={{ height }}>
      {(!isValidData || !data.nodes.length) && (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-muted-foreground">No data available for Sankey chart</p>
        </div>
      )}
    </div>
  );
};
