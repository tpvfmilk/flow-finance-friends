
import { SankeyNode, SankeyLink } from "@/lib/types";
import * as d3 from "d3";

// Enhanced color palette for better visual hierarchy
const COLOR_PALETTE = {
  // Income sources (blues and teals)
  deposit: ["#0EA5E9", "#06B6D4", "#3B82F6", "#1D4ED8"],
  // Joint account (purple)
  joint: "#8B5CF6",
  // Categories (greens and oranges)
  category: {
    "Food & Dining": "#10B981",
    "Shopping": "#3B82F6", 
    "Transport": "#8B5CF6",
    "Bills": "#EF4444",
    "Entertainment": "#F59E0B",
    "Groceries": "#059669",
    "Travel": "#EC4899",
    "Healthcare": "#84CC16",
    "Education": "#6366F1",
    "Other": "#6B7280",
    "Dining": "#F97316",
    "Transportation": "#8B5CF6",
    "Baby Expenses": "#EC4899",
    "Date Night": "#F59E0B",
    "Home Expenses": "#84CC16",
    "Savings": "#10B981",
    "Wedding Fund": "#EC4899"
  },
  // Goals/Expenses (various colors)
  goal: {
    "Restaurants & Bars": "#F97316",
    "Coffee Shops": "#92400E", 
    "Clothing": "#7C3AED",
    "New Laptop": "#1F2937",
    "Car Repair": "#DC2626",
    "Weekly Shop": "#059669",
    "Special Dinners": "#F59E0B",
    "Movie Night": "#8B5CF6",
    "Utility Bills": "#EF4444"
  }
};

// Helper function to determine node colors with enhanced palette
export function getNodeColor(node: any) {
  if (node.type === 'deposit') {
    // Cycle through deposit colors based on index
    const colors = COLOR_PALETTE.deposit;
    return colors[(node.originalIndex || 0) % colors.length] || colors[0];
  } else if (node.type === 'joint') {
    return COLOR_PALETTE.joint;
  } else if (node.type === 'category') {
    // Try to match category name
    const categoryName = node.name || node.category || '';
    return COLOR_PALETTE.category[categoryName as keyof typeof COLOR_PALETTE.category] || "#10B981";
  } else if (node.type === 'goal') {
    // Try to match goal name
    const goalName = node.name || '';
    return COLOR_PALETTE.goal[goalName as keyof typeof COLOR_PALETTE.goal] || "#8B5CF6";
  } else {
    return "#6B7280"; // default gray
  }
}

// Process nodes for D3 Sankey layout
export function processNodes(data: { nodes: SankeyNode[] }) {
  console.log("=== processNodes function called ===");
  console.log("Input data:", data);
  
  // Validate input
  if (!data || !Array.isArray(data.nodes)) {
    throw new Error("Invalid data: nodes must be an array");
  }

  console.log("Number of input nodes:", data.nodes.length);

  // Ensure all nodes have IDs and required properties
  const nodesWithIds = data.nodes.map((node, index) => {
    if (!node) {
      throw new Error(`Node at index ${index} is null or undefined`);
    }
    
    if (!node.id) {
      console.warn(`Node missing ID, assigning one based on index and type: ${index}-${node.type}`);
      return { ...node, id: `${node.type}-${index}` };
    }
    
    // Ensure node has required properties
    if (!node.name) {
      throw new Error(`Node ${node.id} is missing name property`);
    }
    
    if (typeof node.value !== 'number' || node.value < 0) {
      throw new Error(`Node ${node.id} has invalid value: ${node.value}`);
    }
    
    return node;
  });

  console.log("Nodes with IDs:", nodesWithIds);

  // Classify nodes by type
  const depositNodes = nodesWithIds.filter(node => node.type === "deposit");
  const categoryNodes = nodesWithIds.filter(node => node.type === "category");
  const goalNodes = nodesWithIds.filter(node => node.type === "goal");
  
  console.log("Deposit nodes:", depositNodes.length);
  console.log("Category nodes:", categoryNodes.length);
  console.log("Goal nodes:", goalNodes.length);
  
  // Calculate total deposit amount
  const totalDepositAmount = depositNodes.reduce((total, node) => total + (node.value || 0), 0);
  console.log("Total deposit amount:", totalDepositAmount);
  
  // Create joint account node
  const jointAccountNode = {
    name: "Income",
    id: "joint",
    type: "joint" as const,
    value: totalDepositAmount,
  };
  
  // Create a node map for ID lookups
  const nodeMap = new Map();
  let currentIndex = 0;
  
  // Add all nodes to the processed array with correct indices and enhanced colors
  const processedNodes = [];
  
  // Deposit nodes (left side) - indices 0 to depositNodes.length-1
  depositNodes.forEach((node, index) => {
    const nodeId = node.id || `deposit-${index}`;
    nodeMap.set(nodeId, currentIndex);
    processedNodes.push({
      ...node,
      id: nodeId,
      index: currentIndex,
      name: node.name,
      type: node.type,
      value: node.value,
      originalIndex: index,
      color: getNodeColor({ ...node, originalIndex: index })
    });
    currentIndex++;
  });
  
  // Joint account node (middle-left) - index depositNodes.length
  nodeMap.set(jointAccountNode.id, currentIndex);
  processedNodes.push({
    name: jointAccountNode.name,
    id: jointAccountNode.id,
    type: jointAccountNode.type,
    value: jointAccountNode.value,
    index: currentIndex,
    color: getNodeColor({ type: 'joint' })
  });
  currentIndex++;
  
  // Category nodes (middle-right) - indices starting after joint node
  categoryNodes.forEach((node, index) => {
    const nodeId = node.id || `category-${index}`;
    nodeMap.set(nodeId, currentIndex);
    processedNodes.push({
      ...node,
      id: nodeId,
      index: currentIndex,
      name: node.name,
      category: node.category || '',
      type: node.type,
      value: node.value,
      originalIndex: index,
      color: getNodeColor({ ...node, type: 'category' })
    });
    currentIndex++;
  });
  
  // Goal nodes (right side) - indices starting after category nodes
  goalNodes.forEach((node, index) => {
    const nodeId = node.id || `goal-${index}`;
    nodeMap.set(nodeId, currentIndex);
    processedNodes.push({
      ...node,
      id: nodeId,
      index: currentIndex,
      name: node.name,
      type: node.type,
      value: node.value,
      originalIndex: index,
      color: getNodeColor({ ...node, type: 'goal' })
    });
    currentIndex++;
  });

  console.log("=== processNodes result ===");
  console.log("Processed nodes count:", processedNodes.length);
  console.log("Node map size:", nodeMap.size);
  console.log("Processed nodes sample:", processedNodes.slice(0, 3));
  console.log("Node map entries:", Array.from(nodeMap.entries()));

  return { processedNodes, nodeMap, depositNodes };
}

// Process links for D3 Sankey layout
export function processLinks(data: { links: SankeyLink[], nodes: SankeyNode[] }, nodeMap: Map<string, number>, depositNodes: SankeyNode[]) {
  console.log("=== processLinks function called ===");
  console.log("Input links count:", data.links?.length);
  console.log("Node map size:", nodeMap.size);
  console.log("Deposit nodes count:", depositNodes.length);
  
  // Validate input
  if (!data || !Array.isArray(data.links) || !Array.isArray(data.nodes)) {
    throw new Error("Invalid data: links and nodes must be arrays");
  }

  if (!nodeMap || !(nodeMap instanceof Map)) {
    throw new Error("Invalid nodeMap: must be a Map instance");
  }

  const processedLinks = [];

  // Create links from deposits to joint account
  const jointNodeIndex = nodeMap.get("joint");
  if (typeof jointNodeIndex !== 'number') {
    throw new Error("Joint account node not found in node map");
  }
  
  console.log("Joint node index:", jointNodeIndex);
  
  depositNodes.forEach((node, index) => {
    const depositNodeIndex = nodeMap.get(node.id);
    if (typeof depositNodeIndex !== 'number') {
      console.warn(`Deposit node ${node.id} not found in node map`);
      return;
    }
    
    processedLinks.push({
      source: depositNodeIndex,
      target: jointNodeIndex,
      value: node.value || 0
    });
  });
  
  console.log("Deposit to joint links created:", depositNodes.length);
  
  // Helper function to safely get node ID from link property
  const getNodeId = (linkProperty: number | string | any): string | null => {
    if (typeof linkProperty === 'string') {
      return linkProperty;
    }
    if (typeof linkProperty === 'number') {
      return data.nodes[linkProperty]?.id || null;
    }
    if (linkProperty && typeof linkProperty === 'object' && 'id' in linkProperty) {
      return linkProperty.id;
    }
    if (linkProperty != null) {
      return String(linkProperty);
    }
    return null;
  };
  
  // Create links from joint account to categories using the input links data
  const jointToCategoryLinks = data.links.filter(link => {
    const sourceNodeId = getNodeId(link.source);
    const targetNodeId = getNodeId(link.target);
    
    if (!sourceNodeId || !targetNodeId) {
      console.warn('Invalid link source or target:', { source: link.source, target: link.target });
      return false;
    }
    
    const sourceNode = data.nodes.find(n => n.id === sourceNodeId);
    const targetNode = data.nodes.find(n => n.id === targetNodeId);
    
    console.log('Checking joint->category link:', { sourceNodeId, targetNodeId, sourceNode: sourceNode?.type, targetNode: targetNode?.type });
    
    return sourceNode && targetNode && 
           sourceNode.type === 'joint' && targetNode.type === 'category';
  }).map(link => {
    const targetNodeId = getNodeId(link.target);
    
    if (!targetNodeId) {
      console.warn(`Invalid target for link:`, link.target);
      return null;
    }
    
    const target = nodeMap.get(targetNodeId);
    
    if (typeof target !== 'number') {
      console.warn(`Target node not found for link: ${targetNodeId}`);
      return null;
    }
    
    if (typeof link.value !== 'number' || link.value <= 0) {
      console.warn(`Invalid link value: ${link.value}`);
      return null;
    }
    
    return {
      source: jointNodeIndex,
      target,
      value: link.value,
      category: link.category || ''
    };
  }).filter((link): link is NonNullable<typeof link> => link !== null);
  
  processedLinks.push(...jointToCategoryLinks);
  console.log("Joint to category links created:", jointToCategoryLinks.length);
  
  // Keep category to goal links as they are
  const categoryToGoalLinks = data.links.filter(link => {
    const sourceNodeId = getNodeId(link.source);
    const targetNodeId = getNodeId(link.target);
    
    if (!sourceNodeId || !targetNodeId) {
      console.warn('Invalid link source or target:', { source: link.source, target: link.target });
      return false;
    }
    
    const sourceNode = data.nodes.find(n => n.id === sourceNodeId);
    const targetNode = data.nodes.find(n => n.id === targetNodeId);
    
    return sourceNode && targetNode && 
           (sourceNode.type === 'category' && targetNode.type === 'goal');
  }).map(link => {
    const sourceNodeId = getNodeId(link.source);
    const targetNodeId = getNodeId(link.target);
    
    if (!sourceNodeId || !targetNodeId) {
      console.warn(`Invalid source or target for link:`, { source: link.source, target: link.target });
      return null;
    }
    
    const source = nodeMap.get(sourceNodeId);
    const target = nodeMap.get(targetNodeId);
    
    if (typeof source !== 'number' || typeof target !== 'number') {
      console.warn(`Source or target node not found for link: ${sourceNodeId} -> ${targetNodeId}`);
      return null;
    }
    
    if (typeof link.value !== 'number' || link.value <= 0) {
      console.warn(`Invalid link value: ${link.value}`);
      return null;
    }
    
    return {
      source,
      target,
      value: link.value,
      category: link.category || ''
    };
  }).filter((link): link is NonNullable<typeof link> => link !== null);
  
  processedLinks.push(...categoryToGoalLinks);
  console.log("Category to goal links created:", categoryToGoalLinks.length);

  // Deep verification of links before rendering
  const validProcessedLinks = processedLinks.filter(link => {
    if (typeof link.source !== 'number' || typeof link.target !== 'number' || typeof link.value !== 'number') {
      console.error("Invalid link detected - wrong types:", link);
      return false;
    }
    
    if (link.source < 0 || link.target < 0) {
      console.error("Invalid link detected - negative indices:", link);
      return false;
    }
    
    if (link.value <= 0) {
      console.error("Invalid link detected - non-positive value:", link);
      return false;
    }
    
    return true;
  });

  console.log("=== processLinks result ===");
  console.log("Total processed links:", processedLinks.length);
  console.log("Valid processed links:", validProcessedLinks.length);
  console.log("Valid links sample:", validProcessedLinks.slice(0, 3));

  return validProcessedLinks;
}
