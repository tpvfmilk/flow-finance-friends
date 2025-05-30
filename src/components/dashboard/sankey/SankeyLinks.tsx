
import { sankeyLinkHorizontal } from "d3-sankey";
import * as d3 from "d3";
import { SankeyLinkExtended } from "./sankeyTypes";
import { formatCurrency } from "@/lib/utils";

interface SankeyLinksProps {
  links: SankeyLinkExtended[];
}

export const SankeyLinks = ({ links }: SankeyLinksProps) => {
  return (
    <g>
      {links.map((link, index) => (
        <path
          key={index}
          d={sankeyLinkHorizontal()(link) || undefined}
          strokeWidth={Math.max(1, link.width)}
          stroke={d3.interpolateRgb(
            link.source.color || "#a6cee3",
            link.target.color || "#b2df8a"
          )(0.5)}
          fill="none"
          strokeOpacity={0.5}
        >
          <title>{`${link.source.name} → ${link.target.name}: ${formatCurrency(link.value)}`}</title>
        </path>
      ))}
    </g>
  );
};
