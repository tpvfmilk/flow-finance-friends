import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, sankeyLeft } from "d3-sankey";
import { SankeyChartProps, SankeyNodeExtended, SankeyLinkExtended } from "./sankeyTypes";
import { processNodes, processLinks } from "./sankeyUtils";
import { 
  UNIFIED_ALLOCATIONS, 
  UNIFIED_EXPENSES, 
  UNIFIED_GOAL_TARGETS, 
  UNIFIED_GOAL_PROGRESS 
} from "@/lib/mock-data";

// Responsive configuration based on screen width
const getResponsiveConfig = (width: number) => {
  if (width < 640) {        // Mobile
    return { 
      nodeWidth: 16, 
      nodePadding: 12, 
      margin: { top: 15, right: 15, bottom: 15, left: 15 },
      fontSize: { main: "13px", value: "10px" }
    };
  } else if (width < 1024) { // Tablet
    return { 
      nodeWidth: 20, 
      nodePadding: 16, 
      margin: { top: 18, right: 18, bottom: 18, left: 18 },
      fontSize: { main: "14px", value: "11px" }
    };
  } else {                   // Desktop
    return { 
      nodeWidth: 24, 
      nodePadding: 20, 
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
      fontSize: { main: "15px", value: "12px" }
    };
  }
};

export const SankeyChart = ({ data, height = 500 }: SankeyChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [sankeyData, setSankeyData] = useState<{
    nodes: SankeyNodeExtended[];
    links: SankeyLinkExtended[];
  } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: "" });

  // Function to get tooltip content based on node type using unified data
  const getTooltipContent = (node: any) => {
    if (node.type === "category") {
      const allocated = UNIFIED_ALLOCATIONS[node.id] || 0;
      const spent = UNIFIED_EXPENSES[node.id] || 0;
      const remaining = allocated - spent;
      const percentSpent = allocated > 0 ? ((spent / allocated) * 100).toFixed(1) : "0";
      
      return `
        <div class="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs">
          <h3 class="font-semibold text-gray-900 text-lg mb-3">${node.name}</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Allocated:</span>
              <span class="font-medium text-green-600">$${allocated.toLocaleString()}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Spent:</span>
              <span class="font-medium text-red-600">$${spent.toLocaleString()}</span>
            </div>
            <div class="flex justify-between border-t pt-2">
              <span class="text-gray-600">Remaining:</span>
              <span class="font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}">
                $${remaining.toLocaleString()}
              </span>
            </div>
            <div class="text-xs text-gray-500 mt-2">
              ${percentSpent}% of budget used
            </div>
          </div>
        </div>
      `;
    } else if (node.type === "goal") {
      const target = UNIFIED_GOAL_TARGETS[node.id] || 0;
      const saved = UNIFIED_GOAL_PROGRESS[node.id] || 0;
      const remaining = target - saved;
      const percentSaved = target > 0 ? ((saved / target) * 100).toFixed(1) : "0";
      
      return `
        <div class="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs">
          <h3 class="font-semibold text-gray-900 text-lg mb-3">${node.name}</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Goal Target:</span>
              <span class="font-medium text-blue-600">$${target.toLocaleString()}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Saved So Far:</span>
              <span class="font-medium text-green-600">$${saved.toLocaleString()}</span>
            </div>
            <div class="flex justify-between border-t pt-2">
              <span class="text-gray-600">Still Need:</span>
              <span class="font-semibold ${remaining <= 0 ? 'text-green-600' : 'text-orange-600'}">
                $${remaining.toLocaleString()}
              </span>
            </div>
            <div class="text-xs text-gray-500 mt-2">
              ${percentSaved}% of goal reached
              ${remaining <= 0 ? ' 🎉 Goal Complete!' : ''}
            </div>
          </div>
        </div>
      `;
    } else if (node.type === "deposit") {
      return `
        <div class="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs">
          <h3 class="font-semibold text-gray-900 text-lg mb-3">${node.name}</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Total Contributed:</span>
              <span class="font-medium text-blue-600">$${node.value?.toLocaleString() || 'N/A'}</span>
            </div>
            <div class="text-xs text-gray-500 mt-2">
              Individual contributor
            </div>
          </div>
        </div>
      `;
    }
    
    // Default tooltip for other node types
    return `
      <div class="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs">
        <h3 class="font-semibold text-gray-900 text-lg mb-3">${node.name}</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Value:</span>
            <span class="font-medium">$${node.value?.toLocaleString() || 'N/A'}</span>
          </div>
        </div>
      </div>
    `;
  };

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

  // Enhanced resize handler with immediate re-render
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && isInitialized) {
        const newWidth = containerRef.current.clientWidth;
        setDimensions(prev => {
          // Trigger re-render if width changed significantly (>50px)
          if (Math.abs(prev.width - newWidth) > 50) {
            console.log(`Width changed from ${prev.width} to ${newWidth}, triggering re-render`);
            return { width: newWidth, height: prev.height };
          }
          return prev;
        });
      }
    };
    
    // Use ResizeObserver for better performance if available
    if (containerRef.current && window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    } else {
      // Fallback to window resize listener
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
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

      // Get responsive configuration based on container width
      const width = containerRef.current.clientWidth;
      const chartHeight = typeof height === "string" ? parseInt(height) : height;
      const config = getResponsiveConfig(width);
      
      const innerWidth = width - config.margin.left - config.margin.right;
      const innerHeight = chartHeight - config.margin.top - config.margin.bottom;

      console.log("Chart dimensions:", { 
        width, 
        chartHeight, 
        innerWidth, 
        innerHeight, 
        config 
      });

      if (innerWidth <= 0 || innerHeight <= 0) {
        console.warn("Invalid chart dimensions");
        return;
      }

      setDimensions({ width: innerWidth, height: innerHeight });

      // Process nodes and links
      console.log("=== Processing nodes and links ===");
      let processedNodes, nodeMap, depositNodes, validProcessedLinks;
      
      try {
        const nodeResult = processNodes(data);
        processedNodes = nodeResult.processedNodes;
        nodeMap = nodeResult.nodeMap;
        depositNodes = nodeResult.depositNodes;
        
        validProcessedLinks = processLinks(data, nodeMap, depositNodes);
        
      } catch (processError) {
        console.error("Error processing nodes and links:", processError);
        setLoadError(new Error(`Data processing error: ${processError.message}`));
        return;
      }

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

      console.log("=== Creating Sankey generator ===");
      
      // Create the sankey generator with responsive configuration
      const sankeyGenerator = sankey()
        .nodeWidth(config.nodeWidth)
        .nodePadding(config.nodePadding)
        .nodeAlign(sankeyLeft)
        .extent([[0, 0], [innerWidth, innerHeight]]);

      // Generate the sankey layout
      const sankeyDataObj = {
        nodes: processedNodes.map(node => ({ ...node })),
        links: validProcessedLinks.map(link => ({ ...link }))
      };
      
      console.log("Calling sankeyGenerator...");
      
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
      if (!result || !result.nodes || !Array.isArray(result.nodes) || 
          !result.links || !Array.isArray(result.links)) {
        console.error("Sankey generator returned invalid result:", result);
        setLoadError(new Error("Sankey generator returned invalid result"));
        return;
      }

      console.log("=== Sankey generation successful ===");
      setSankeyData(result as { nodes: SankeyNodeExtended[], links: SankeyLinkExtended[] });

      console.log("=== Creating SVG ===");

      // Create SVG with responsive margins
      const svg = d3.select(containerRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", chartHeight)
        .append("g")
        .attr("transform", `translate(${config.margin.left},${config.margin.top})`);
      
      // Create gradient definitions
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
      
      // Render nodes with enhanced styling and tooltip functionality
      const nodeGroup = svg.append("g")
        .selectAll("g")
        .data(result.nodes)
        .join("g")
        .attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);
      
      // Node rectangles with rounded corners and hover effects
      nodeGroup.append("rect")
        .attr("height", (d: any) => Math.max(4, d.y1 - d.y0))
        .attr("width", (d: any) => d.x1 - d.x0)
        .attr("fill", (d: any) => d.color || "#E5E7EB")
        .attr("rx", 3)
        .attr("ry", 3)
        .style("filter", "drop-shadow(0 1px 3px rgba(0,0,0,0.1))")
        .style("cursor", "pointer")
        .on("mouseover", function(event, d: any) {
          d3.select(this).style("filter", "drop-shadow(0 2px 6px rgba(0,0,0,0.15))");
          
          const [mouseX, mouseY] = d3.pointer(event, containerRef.current);
          setTooltip({
            visible: true,
            x: mouseX + 10,
            y: mouseY - 10,
            content: getTooltipContent(d)
          });
        })
        .on("mouseout", function(event, d: any) {
          d3.select(this).style("filter", "drop-shadow(0 1px 3px rgba(0,0,0,0.1))");
          setTooltip({ visible: false, x: 0, y: 0, content: "" });
        })
        .on("mousemove", function(event, d: any) {
          const [mouseX, mouseY] = d3.pointer(event, containerRef.current);
          setTooltip(prev => ({
            ...prev,
            x: mouseX + 10,
            y: mouseY - 10
          }));
        });
      
      // Enhanced text labels with responsive font sizes
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
        .attr("font-size", config.fontSize.main)
        .attr("font-weight", "700")
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
        .attr("font-size", config.fontSize.value)
        .attr("font-weight", "500")
        .attr("fill", "#6B7280")
        .style("pointer-events", "none");
        
      console.log("=== Chart rendering complete ===");
        
    } catch (error) {
      console.error('=== Error rendering D3 Sankey chart ===');
      console.error('Error:', error);
      setLoadError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [data, height, isInitialized, dimensions.width]); // Added dimensions.width to trigger re-render

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
    <div className="relative w-full bg-white rounded-lg" style={{ height }}>
      <div ref={containerRef} className="w-full h-full">
        {(!data?.nodes?.length) && (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-muted-foreground">No data available for Sankey chart</p>
          </div>
        )}
      </div>
      
      {/* Custom Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute pointer-events-none z-50"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateY(-100%)'
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  );
};
