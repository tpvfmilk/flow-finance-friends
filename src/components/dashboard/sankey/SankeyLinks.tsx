
import { sankeyLinkHorizontal } from "d3-sankey";
import * as d3 from "d3";
import { SankeyLinkExtended } from "./sankeyTypes";
import { formatCurrency } from "@/lib/utils";
import { getNodeColor } from "./sankeyUtils";

interface SankeyLinksProps {
  links: SankeyLinkExtended[];
}

export const SankeyLinks = ({ links }: SankeyLinksProps) => {
  // Validate links before rendering
  if (!links || links.length === 0) {
    console.warn("No links provided to SankeyLinks component");
    return null;
  }
  
  return (
    <g>
      {links.map((link, index) => {
        // Skip links with invalid properties
        if (!link.source || !link.target) {
          console.warn(`Link at index ${index} has invalid source or target`, link);
          return null;
        }
        
        // Skip links with negative or zero width
        if (!link.width || link.width <= 0) {
          console.warn(`Link at index ${index} has invalid width`, link);
          return null;
        }
        
        // Generate path, skip if invalid
        const path = sankeyLinkHorizontal()(link);
        if (!path) {
          console.warn(`Failed to generate path for link at index ${index}`, link);
          return null;
        }
        
        // Determine the link color based on category
        let linkColor;
        const category = link.source.category || link.target.category || '';
        
        if (category) {
          linkColor = getNodeColor({ type: 'category', category });
        } else {
          linkColor = d3.interpolateRgb(
            link.source.color || "#a6cee3",
            link.target.color || "#b2df8a"
          )(0.5);
        }
        
        // Format value for tooltip
        const sourceNodeName = link.source.name || 'Unknown source';
        const targetNodeName = link.target.name || 'Unknown target';
        const formattedValue = isNaN(link.value) ? '0' : formatCurrency(link.value);
        
        return (
          <path
            key={index}
            d={path}
            strokeWidth={Math.max(1, link.width)}
            stroke={linkColor}
            fill="none"
            strokeOpacity={0.5}
            className="sankey-link hover:stroke-opacity-80"
          >
            <title>{`${sourceNodeName} → ${targetNodeName}: ${formattedValue}`}</title>
          </path>
        );
      }).filter(Boolean)} {/* Filter out null elements */}
    </g>
  );
}
