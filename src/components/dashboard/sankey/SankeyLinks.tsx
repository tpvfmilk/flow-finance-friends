
import { sankeyLinkHorizontal } from "d3-sankey";
import * as d3 from "d3";
import { SankeyLinkExtended } from "./sankeyTypes";
import { formatCurrency } from "@/lib/utils";
import { getNodeColor } from "./sankeyUtils";

interface SankeyLinksProps {
  links: SankeyLinkExtended[];
}

export const SankeyLinks = ({ links }: SankeyLinksProps) => {
  return (
    <g>
      {links.map((link, index) => {
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
        
        return (
          <path
            key={index}
            d={sankeyLinkHorizontal()(link) || undefined}
            strokeWidth={Math.max(1, link.width)}
            stroke={linkColor}
            fill="none"
            strokeOpacity={0.5}
            className="sankey-link hover:stroke-opacity-80"
          >
            <title>{`${link.source.name} → ${link.target.name}: ${formatCurrency(link.value)}`}</title>
          </path>
        );
      })}
    </g>
  );
}
