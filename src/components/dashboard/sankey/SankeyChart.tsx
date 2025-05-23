
import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { sankey } from "d3-sankey";
import { SankeyChartProps, SankeyNodeExtended, SankeyLinkExtended } from "./sankeyTypes";
import { processNodes, processLinks, getNodeColor } from "./sankeyUtils";
import { SankeyNodes } from "./SankeyNodes";
import { SankeyLinks } from "./SankeyLinks";
import { toast } from "@/hooks/use-toast";

export const SankeyChart = ({ data, height = 500 }: SankeyChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: innerHeight });
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
    if (!containerRef.current) return;
    if (!isValidData) {
      console.warn("Invalid Sankey data:", data);
      setLoadError(new Error("Invalid Sankey data provided"));
      return;
    }

    try {
      // Clear previous chart
      d3.select(containerRef.current).selectAll("svg").remove();
      setLoadError(null);

      // Set dimensions
      const width = containerRef.current.clientWidth;
      const chartHeight = typeof height === "number" ? height : parseInt(height);
      const margin = { top: 10, right: 10, bottom: 10, left: 10 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = chartHeight - margin.top - margin.bottom;

      setDimensions({ width: innerWidth, height: innerHeight });

      // Process nodes and links with enhanced validation
      const { processedNodes, nodeMap } = processNodes(data);
      if (processedNodes.length === 0) {
        throw new Error("No valid nodes could be processed");
      }
      
      const processedLinks = processLinks(data, nodeMap);
      if (processedLinks.length === 0) {
        throw new Error("No valid links could be processed");
      }

      // Create sankey generator with fixed alignment
      const sankeyGenerator = sankey()
        .nodeWidth(15)
        .nodePadding(10)
        .extent([[margin.left, margin.top], [innerWidth, innerHeight]])
        .nodeAlign(0); // Use 0 for left alignment

      // Generate the sankey layout
      const sankeyData = {
        nodes: processedNodes,
        links: processedLinks
      };
      
      // Create SVG and render
      const svg = d3.select(containerRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", chartHeight)
        .append("g");

      // Apply the layout with error handling
      try {
        const result = sankeyGenerator(sankeyData);
        setSankeyData(result as { nodes: SankeyNodeExtended[], links: SankeyLinkExtended[] });
      } catch (error) {
        console.error('Error in D3 Sankey layout calculation:', error);
        setLoadError(error instanceof Error ? error : new Error(`D3 Sankey error: ${String(error)}`));
        
        // Display error to user
        toast({
          title: "Chart Error",
          description: "Failed to generate Sankey chart. Please check console for details.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error rendering Sankey chart:', error);
      setLoadError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [data, height, isValidData]);

  // Show error state
  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center p-10 rounded-md border border-red-300 bg-red-50 max-w-md">
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

  // Show loading or empty state if no valid data
  if (!isValidData || !sankeyData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-muted-foreground">
          {!isValidData ? "No valid data available" : "Preparing chart..."}
        </p>
      </div>
    );
  }

  // Render the chart with processed data
  return (
    <div ref={containerRef} className="w-full h-full relative">
      {sankeyData && (
        <svg width="100%" height="100%">
          <g>
            <SankeyLinks links={sankeyData.links} />
            <SankeyNodes nodes={sankeyData.nodes} innerWidth={dimensions.width} />
          </g>
        </svg>
      )}
    </div>
  );
};
