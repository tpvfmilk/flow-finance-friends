
import { SankeyNode, SankeyLink } from "@/lib/types";
import * as d3 from "d3";

// Helper function to determine node colors
export function getNodeColor(node: any) {
  if (!node) return "#ccc";
  
  if (node.type === 'deposit') {
    return "#3B82F6"; // blue for deposits
  } else if (node.type === 'joint') {
    return "#6366F1"; // indigo for joint account
  } else if (node.type === 'category') {
    // Try to get color from category name
    const categoryName = node.category?.toLowerCase().replace(/\s+/g, '-');
    // Use a default color if category not found
    return categoryName ? `hsl(var(--${categoryName}))` : "#9CA3AF";
  } else if (node.type === 'goal') {
    return "#8B5CF6"; // purple for goals
  } else {
    return "#EF4444"; // red for expenses
  }
}

// Process nodes for D3 Sankey layout with robust validation
export function processNodes(data: { nodes: SankeyNode[] }) {
  // Validate input data
  if (!data?.nodes || !Array.isArray(data.nodes)) {
    console.error("Invalid nodes data provided to processNodes");
    return { processedNodes: [], nodeMap: new Map() };
  }

  // Filter out invalid nodes
  const validNodes = data.nodes.filter(node => 
    node && typeof node === 'object' && 
    node.name && typeof node.value === 'number' && !isNaN(node.value) &&
    node.type
  );

  if (validNodes.length === 0) {
    console.error("No valid nodes found after filtering");
    return { processedNodes: [], nodeMap: new Map() };
  }

  // Ensure all nodes have unique IDs
  const nodesWithIds = validNodes.map((node, index) => {
    if (!node.id) {
      return { ...node, id: `${node.type}-${index}` };
    }
    return node;
  });

  // Ensure all values are positive
  const validatedNodes = nodesWithIds.map(node => ({
    ...node,
    value: Math.max(node.value, 0.1) // Ensure minimum positive value
  }));

  // Classify nodes by type
  const depositNodes = validatedNodes.filter(node => node.type === "deposit");
  const jointNodes = validatedNodes.filter(node => node.type === "joint");
  const categoryNodes = validatedNodes.filter(node => node.type === "category");
  const expenseNodes = validatedNodes.filter(node => node.type === "expense");
  const goalNodes = validatedNodes.filter(node => node.type === "goal");
  
  // Create joint account node if none exists
  let processedNodes = [];
  const nodeMap = new Map();
  let nodeIndex = 0;
  
  // Add deposit nodes
  processedNodes = depositNodes.map((node, i) => {
    const enhancedNode = {
      ...node,
      index: nodeIndex,
      color: getNodeColor(node),
    };
    nodeMap.set(node.id, nodeIndex);
    nodeIndex++;
    return enhancedNode;
  });
  
  // Add or create joint account node
  if (jointNodes.length > 0) {
    jointNodes.forEach(node => {
      processedNodes.push({
        ...node,
        index: nodeIndex,
        color: getNodeColor(node)
      });
      nodeMap.set(node.id, nodeIndex);
      nodeIndex++;
    });
  } else {
    // Create a joint account node if none exists
    const jointNode = {
      name: "Joint Account",
      id: "joint-account",
      type: "joint" as const,
      value: depositNodes.reduce((sum, node) => sum + node.value, 0),
      index: nodeIndex,
      color: "#6366F1"
    };
    processedNodes.push(jointNode);
    nodeMap.set(jointNode.id, nodeIndex);
    nodeIndex++;
  }
  
  // Add remaining nodes with proper indexing
  [...categoryNodes, ...expenseNodes, ...goalNodes].forEach(node => {
    processedNodes.push({
      ...node,
      index: nodeIndex,
      color: getNodeColor(node)
    });
    nodeMap.set(node.id, nodeIndex);
    nodeIndex++;
  });

  // Log summary
  console.log(`Processed ${processedNodes.length} nodes; Map size: ${nodeMap.size}`);
  
  return { 
    processedNodes, 
    nodeMap,
    depositNodeCount: depositNodes.length,
    jointNodeIndex: depositNodes.length // Joint account index (assuming it follows deposits)
  };
}

// Process links for D3 Sankey layout with robust validation
export function processLinks(data: { links: SankeyLink[] }, nodeMap: Map<string, number>) {
  // Validate input data
  if (!data?.links || !Array.isArray(data.links)) {
    console.error("Invalid links data provided to processLinks");
    return [];
  }
  
  // Filter links with valid source and target
  let validLinks = data.links.map(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source?.toString();
    const targetId = typeof link.target === 'string' ? link.target : link.target?.toString();
    
    // Skip if source or target is missing
    if (!sourceId || !targetId) {
      console.warn(`Link has invalid source or target: ${sourceId} -> ${targetId}`);
      return null;
    }
    
    // Convert string IDs to numeric indices
    const sourceIndex = nodeMap.get(sourceId);
    const targetIndex = nodeMap.get(targetId);
    
    // Skip if source or target node isn't in our nodeMap
    if (sourceIndex === undefined || targetIndex === undefined) {
      console.warn(`Link references missing node: ${sourceId} -> ${targetId}`);
      return null;
    }
    
    // Ensure value is positive
    const value = typeof link.value === 'number' && !isNaN(link.value) ? Math.max(link.value, 0.1) : 0.1;
    
    return {
      source: sourceIndex,
      target: targetIndex,
      value,
      category: link.category
    };
  }).filter(Boolean) as any[];

  // Create person to joint links if needed (based on mock data structure)
  if (validLinks.length === 0) {
    console.error("No valid links found after processing");
    return [];
  }
  
  // Log summary
  console.log(`Processed ${validLinks.length} links`);
  
  return validLinks;
}
