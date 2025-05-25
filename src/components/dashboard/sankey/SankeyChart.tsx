
import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, sankeyLeft } from "d3-sankey";
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Create linear gradient definitions for links
  const createGradientDefs = (svg: any, links: any[]) => {
    if (!Array.isArray(links)) {
      console.error("createGradientDefs: links is not an array:", links);
      return;
    }
    
    const defs = svg.append("defs");
    
    links.forEach((link, index) => {
      if (!link) {
        console.warn(`Skipping null/undefined link at index ${index}`);
        return;
      }
      
      const gradientId = `gradient-${index}`;
      const gradient = defs.append("linearGradient")
        .attr("id", gradientId)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", link.source?.x1 || 0)
        .attr("x2", link.target?.x0 || 0);

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", link.source?.color || "#3B82F6")
        .attr("stop-opacity", 0.8);

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", link.target?.color || "#10B981")
        .attr("stop-opacity", 0.8);

      link.gradientId = gradientId;
    });
  };

  // Initialize the container ref detection
  useEffect(() => {
    if (containerRef.current && !isInitialized) {
      console.log("Container ref now available, initializing...");
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Process data and create the chart
  useEffect(() => {
    console.log("=== SankeyChart useEffect triggered ===");
    console.log("Container ref:", containerRef.current);
    console.log("Is initialized:", isInitialized);
    console.log("Data received:", data);
    
    // Wait for both container ref and initialization
    if (!containerRef.current || !isInitialized) {
      console.log("Waiting for container ref or initialization...");
      return;
    }

    // Add more detailed logging for data validation
    console.log("Data type:", typeof data);
    console.log("Data is object:", data && typeof data === 'object');
    console.log("Data.nodes exists:", data && 'nodes' in data);
    console.log("Data.links exists:", data && 'links' in data);
    
    if (data && 'nodes' in data) {
      console.log("Data.nodes type:", typeof data.nodes);
      console.log("Data.nodes is array:", Array.isArray(data.nodes));
      console.log("Data.nodes length:", data.nodes?.length);
      console.log("First few nodes:", data.nodes?.slice(0, 3));
    }
    
    if (data && 'links' in data) {
      console.log("Data.links type:", typeof data.links);
      console.log("Data.links is array:", Array.isArray(data.links));
      console.log("Data.links length:", data.links?.length);
      console.log("First few links:", data.links?.slice(0, 3));
    }

    // Add defensive checks for data
    if (!data || typeof data !== 'object') {
      console.error("Invalid data: not an object:", data);
      setLoadError(new Error("Invalid data structure: expected object with nodes and links"));
      return;
    }

    if (!('nodes' in data) || !('links' in data)) {
      console.error("Missing nodes or links in data:", data);
      setLoadError(new Error("Invalid data structure: missing nodes or links properties"));
      return;
    }

    if (!Array.isArray(data.nodes) || !Array.isArray(data.links)) {
      console.error("Nodes or links not arrays:", { nodes: data.nodes, links: data.links });
      setLoadError(new Error("Invalid data structure: nodes and links must be arrays"));
      return;
    }

    if (data.nodes.length === 0 || data.links.length === 0) {
      console.warn("Empty nodes or links array");
      return;
    }

    try {
      console.log("=== Starting chart rendering ===");
      
      // Clear previous chart
      d3.select(containerRef.current).selectAll("*").remove();

      // Set dimensions - REDUCED MARGINS: 40px → 20px for left/right
      const width = containerRef.current.clientWidth;
      const chartHeight = typeof height === "string" ? parseInt(height) : height;
      const margin = { top: 20, right: 20, bottom: 20, left: 20 }; // UPDATED: reduced from 40px to 20px
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = chartHeight - margin.top - margin.bottom;

      console.log("Chart dimensions:", { width, chartHeight, innerWidth, innerHeight });

      if (innerWidth <= 0 || innerHeight <= 0) {
        console.warn("Invalid chart dimensions");
        return;
      }

      setDimensions({ width: innerWidth, height: innerHeight });

      // Process nodes and links with detailed logging
      console.log("=== Processing nodes and links ===");
      let processedNodes, nodeMap, depositNodes, validProcessedLinks;
      
      try {
        console.log("Calling processNodes...");
        const nodeResult = processNodes(data);
        console.log("processNodes result:", nodeResult);
        
        processedNodes = nodeResult.processedNodes;
        nodeMap = nodeResult.nodeMap;
        depositNodes = nodeResult.depositNodes;
        
        console.log("Processed nodes length:", processedNodes?.length);
        console.log("Node map size:", nodeMap?.size);
        console.log("Deposit nodes length:", depositNodes?.length);
        console.log("Processed nodes sample:", processedNodes?.slice(0, 3));
        
        console.log("Calling processLinks...");
        validProcessedLinks = processLinks(data, nodeMap, depositNodes);
        console.log("Valid processed links length:", validProcessedLinks?.length);
        console.log("Valid processed links sample:", validProcessedLinks?.slice(0, 3));
        
      } catch (processError) {
        console.error("Error processing nodes and links:", processError);
        console.error("Process error stack:", processError.stack);
        setLoadError(new Error(`Data processing error: ${processError.message}`));
        return;
      }

      // Debug logging
      console.log("=== Final processed data ===");
      console.log("Total nodes:", processedNodes?.length || 0);
      console.log("Valid links:", validProcessedLinks?.length || 0);
      
      // Validate processed data
      if (!processedNodes || !Array.isArray(processedNodes) || processedNodes.length === 0) {
        console.error("No valid nodes after processing:", processedNodes);
        setLoadError(new Error("No valid nodes found after processing"));
        return;
      }

      if (!validProcessedLinks || !Array.isArray(validProcessedLinks) || validProcessedLinks.length === 0) {
        console.error("No valid links after processing:", validProcessedLinks);
        setLoadError(new Error("No valid links found after processing"));
        return;
      }

      // Validate that all nodes have required properties
      const invalidNodes = processedNodes.filter(node => 
        typeof node.index !== 'number' || 
        !node.name || 
        typeof node.value !== 'number'
      );
      
      if (invalidNodes.length > 0) {
        console.error("Invalid nodes found:", invalidNodes);
        setLoadError(new Error(`Found ${invalidNodes.length} invalid nodes`));
        return;
      }

      // Validate that all links reference valid nodes
      const maxNodeIndex = processedNodes.length - 1;
      const invalidLinks = validProcessedLinks.filter(link => 
        typeof link.source !== 'number' || 
        typeof link.target !== 'number' ||
        link.source < 0 || link.source > maxNodeIndex ||
        link.target < 0 || link.target > maxNodeIndex ||
        typeof link.value !== 'number' || link.value <= 0
      );
      
      if (invalidLinks.length > 0) {
        console.error("Invalid links found:", invalidLinks);
        setLoadError(new Error(`Found ${invalidLinks.length} invalid links`));
        return;
      }
      
      console.log("=== Creating Sankey generator ===");
      
      // Create the sankey generator with correct alignment
      const sankeyGenerator = sankey()
        .nodeWidth(24)
        .nodePadding(20)
        .nodeAlign(sankeyLeft) // Fixed: use sankeyLeft instead of d3.sankeyJustify
        .extent([[0, 0], [innerWidth, innerHeight]]);

      // Generate the sankey layout
      const sankeyDataObj = {
        nodes: processedNodes.map(node => ({ ...node })), // Create clean copies
        links: validProcessedLinks.map(link => ({ ...link })) // Create clean copies
      };
      
      console.log("Sankey data object prepared:", sankeyDataObj);
      console.log("Calling sankeyGenerator...");
      
      // Generate the layout with better error handling
      let result;
      try {
        result = sankeyGenerator(sankeyDataObj);
        console.log("Sankey generator completed successfully");
      } catch (sankeyError) {
        console.error("Sankey generator error:", sankeyError);
        setLoadError(new Error(`Sankey generation failed: ${sankeyError.message}`));
        return;
      }
      
      // Validate the result
      if (!result) {
        console.error("Sankey generator returned null/undefined");
        setLoadError(new Error("Sankey generator returned invalid result"));
        return;
      }
      
      if (!result.nodes || !Array.isArray(result.nodes)) {
        console.error("Sankey result has invalid nodes:", result.nodes);
        setLoadError(new Error("Sankey generator returned invalid nodes"));
        return;
      }
      
      if (!result.links || !Array.isArray(result.links)) {
        console.error("Sankey result has invalid links:", result.links);
        setLoadError(new Error("Sankey generator returned invalid links"));
        return;
      }

      console.log("=== Sankey generation successful ===");
      console.log("Result nodes:", result.nodes.length);
      console.log("Result links:", result.links.length);

      setSankeyData(result as { nodes: SankeyNodeExtended[], links: SankeyLinkExtended[] });

      console.log("=== Creating SVG ===");

      // Create SVG
      const svg = d3.select(containerRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", chartHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      // Create gradient definitions for beautiful link colors
      console.log("Creating gradients...");
      createGradientDefs(svg, result.links);
      
      console.log("=== Rendering links ===");
      
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
        .style("mix-blend-mode", "multiply")
        .on("mouseover", function(event, d: any) {
          d3.select(this).attr("stroke-opacity", 0.8);
        })
        .on("mouseout", function(event, d: any) {
          d3.select(this).attr("stroke-opacity", 0.6);
        })
        .append("title")
        .text((d: any) => `${d.source.name} → ${d.target.name}: $${d.value.toLocaleString()}`);
      
      console.log("=== Rendering nodes ===");
      
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
        .attr("rx", 3)
        .attr("ry", 3)
        .style("filter", "drop-shadow(0 1px 3px rgba(0,0,0,0.1))")
        .on("mouseover", function(event, d: any) {
          d3.select(this).style("filter", "drop-shadow(0 2px 6px rgba(0,0,0,0.15))");
        })
        .on("mouseout", function(event, d: any) {
          d3.select(this).style("filter", "drop-shadow(0 1px 3px rgba(0,0,0,0.1))");
        })
        .append("title")
        .text((d: any) => `${d.name}\n$${d.value?.toLocaleString() || 'N/A'}`);
      
      // Enhanced text labels with better positioning and INCREASED FONT SIZES
      nodeGroup.append("text")
        .attr("x", (d: any) => {
          const nodeWidth = d.x1 - d.x0;
          const isLeftSide = d.x0 < innerWidth / 2;
          return isLeftSide ? nodeWidth + 10 : -10;
        })
        .attr("y", (d: any) => {
          const nodeHeight = d.y1 - d.y0;
          return Math.max(nodeHeight / 2, 8);
        })
        .attr("dy", "0.35em")
        .attr("text-anchor", (d: any) => d.x0 < innerWidth / 2 ? "start" : "end")
        .text((d: any) => d.name)
        .attr("font-size", "15px") // UPDATED: increased from 13px to 15px
        .attr("font-weight", "700") // UPDATED: increased from 600 to 700
        .attr("fill", "#1F2937")
        .style("pointer-events", "none");

      // Add value labels for nodes with sufficient height
      nodeGroup
        .filter((d: any) => (d.y1 - d.y0) > 20)
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
          return `$${d.value.toLocaleString()}`;
        })
        .attr("font-size", "12px") // UPDATED: increased from 11px to 12px
        .attr("font-weight", "500") // UPDATED: increased from 400 to 500
        .attr("fill", "#6B7280")
        .style("pointer-events", "none");
        
      console.log("=== Chart rendering complete ===");
        
    } catch (error) {
      console.error('=== Error rendering D3 Sankey chart ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      setLoadError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [data, height, isInitialized]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && sankeyData && isInitialized) {
        // Simple debounced resize handler
        setTimeout(() => {
          // This will trigger the main useEffect to re-render
        }, 100);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sankeyData, isInitialized]);

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
      {(!data?.nodes?.length) && (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-muted-foreground">No data available for Sankey chart</p>
        </div>
      )}
    </div>
  );
};
