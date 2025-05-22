
import { SankeyNode, SankeyLink } from "@/lib/types";
import * as d3 from "d3";

// Helper function to determine node colors
export function getNodeColor(node: any) {
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

// Process nodes for D3 Sankey layout
export function processNodes(data: { nodes: SankeyNode[] }) {
  // Ensure all nodes have IDs
  const nodesWithIds = data.nodes.map((node, index) => {
    if (!node.id) {
      console.warn(`Node missing ID, assigning one based on index and type: ${index}-${node.type}`);
      return { ...node, id: `${node.type}-${index}` };
    }
    return node;
  });

  // Classify nodes by type
  const depositNodes = nodesWithIds.filter(node => node.type === "deposit");
  const categoryNodes = nodesWithIds.filter(node => node.type === "category");
  const expenseNodes = nodesWithIds.filter(node => node.type === "expense");
  const goalNodes = nodesWithIds.filter(node => node.type === "goal");
  
  // Calculate total deposit amount
  const totalDepositAmount = depositNodes.reduce((total, node) => total + node.value, 0);
  
  // Create joint account node
  const jointAccountNode = {
    name: "Joint Account",
    id: "joint",
    type: "joint" as const,
    value: totalDepositAmount,
  };
  
  // Create a node map for ID lookups
  const nodeMap = new Map();
  
  // Add all nodes to the processed array with correct indices
  const processedNodes = [
    ...depositNodes.map((node, index) => {
      const nodeId = node.id || `deposit-${index}`;
      nodeMap.set(nodeId, index);
      return {
        ...node,
        id: nodeId,
        index,
        name: node.name,
        type: node.type,
        color: getNodeColor(node)
      };
    }),
    {
      name: jointAccountNode.name,
      id: jointAccountNode.id,
      type: jointAccountNode.type,
      value: jointAccountNode.value,
      index: depositNodes.length,
      color: "#6366F1", // indigo for joint account
    },
    ...categoryNodes.map((node, index) => {
      const nodeIndex = index + depositNodes.length + 1;
      const nodeId = node.id || `category-${index}`;
      nodeMap.set(nodeId, nodeIndex);
      return {
        ...node,
        id: nodeId,
        index: nodeIndex,
        name: node.name,
        category: node.category || '',
        type: node.type,
        color: getNodeColor(node)
      };
    }),
    ...expenseNodes.map((node, index) => {
      const nodeIndex = index + depositNodes.length + categoryNodes.length + 1;
      const nodeId = node.id || `expense-${index}`;
      nodeMap.set(nodeId, nodeIndex);
      return {
        ...node,
        id: nodeId,
        index: nodeIndex,
        name: node.name,
        type: node.type,
        color: getNodeColor(node)
      };
    }),
    ...goalNodes.map((node, index) => {
      const nodeIndex = index + depositNodes.length + categoryNodes.length + expenseNodes.length + 1;
      const nodeId = node.id || `goal-${index}`;
      nodeMap.set(nodeId, nodeIndex);
      return {
        ...node,
        id: nodeId,
        index: nodeIndex,
        name: node.name,
        type: node.type,
        color: getNodeColor(node)
      };
    })
  ];

  return { processedNodes, nodeMap, depositNodes };
}

// Process links for D3 Sankey layout
export function processLinks(data: { links: SankeyLink[], nodes: SankeyNode[] }, nodeMap: Map<string, number>, depositNodes: SankeyNode[]) {
  // Create links from deposits to joint account
  const depositToJointLinks = depositNodes.map(node => ({
    source: nodeMap.get(node.id),
    target: depositNodes.length, // Joint account node index
    value: node.value
  }));
  
  // Create links from joint account to categories
  const jointToCategoryLinks = data.links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.toString();
    const sourceNode = data.nodes.find(n => n.id === sourceId);
    return sourceNode && sourceNode.type === 'deposit';
  }).map(link => {
    const targetId = typeof link.target === 'string' ? link.target : link.target.toString();
    const target = nodeMap.get(targetId);
    
    if (target === undefined) {
      console.warn(`Target node not found for link: ${targetId}`);
      return null;
    }
    
    return {
      source: depositNodes.length, // Joint account node index
      target,
      value: link.value,
      category: link.category || ''
    };
  }).filter(Boolean); // Remove null links
  
  // Keep category to expense links as they are
  const categoryToExpenseLinks = data.links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.toString();
    const sourceNode = data.nodes.find(n => n.id === sourceId);
    const targetId = typeof link.target === 'string' ? link.target : link.target.toString();
    const targetNode = data.nodes.find(n => n.id === targetId);
    
    return sourceNode && targetNode && 
           ((sourceNode.type === 'category' && (targetNode.type === 'expense' || targetNode.type === 'goal')) || 
            (sourceNode.type === 'expense' && targetNode.type === 'goal'));
  }).map(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.toString();
    const targetId = typeof link.target === 'string' ? link.target : link.target.toString();
    
    const source = nodeMap.get(sourceId);
    const target = nodeMap.get(targetId);
    
    if (source === undefined || target === undefined) {
      console.warn(`Source or target node not found for link: ${sourceId} -> ${targetId}`);
      return null;
    }
    
    return {
      source,
      target,
      value: link.value,
      category: link.category || ''
    };
  }).filter(Boolean); // Remove null links
  
  // Combine all links
  const processedLinks = [
    ...depositToJointLinks,
    ...jointToCategoryLinks,
    ...categoryToExpenseLinks
  ];

  // Deep verification of links before rendering
  const validProcessedLinks = processedLinks.filter(link => {
    if (link.source === undefined || link.target === undefined) {
      console.error("Invalid link detected:", link);
      return false;
    }
    return true;
  });

  return validProcessedLinks;
}
