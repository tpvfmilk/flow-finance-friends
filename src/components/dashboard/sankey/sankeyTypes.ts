
import { SankeyNode, SankeyLink } from "d3-sankey";

export interface SankeyChartProps {
  data: {
    nodes: SankeyNodeType[];
    links: SankeyLinkType[];
  };
  height?: number | string;
}

export interface SankeyNodeType {
  name: string;
  value: number;
  id?: string;
  type: "deposit" | "joint" | "category" | "expense" | "goal";
  category?: string;
  index?: number;
}

export interface SankeyLinkType {
  source: number | string;
  target: number | string;
  value: number;
  category?: string;
}

// Define extended types for D3 Sankey
export interface SankeyNodeExtended extends SankeyNode<any, any> {
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

export interface SankeyLinkExtended extends SankeyLink<any, any> {
  source: SankeyNodeExtended;
  target: SankeyNodeExtended;
  width: number;
  value: number;
  category?: string;
}
