
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
    "Dining": "#F97316"
  },
  // Expenses (various colors)
  expense: {
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
    return colors[node.originalIndex % colors.length] || colors[0];
  } else if (node.type === 'joint') {
    return COLOR_PALETTE.joint;
  } else if (node.type === 'category') {
    // Try to match category name
    const categoryName = node.name || node.category || '';
    return COLOR_PALETTE.category[categoryName as keyof typeof COLOR_PALETTE.category] || "#10B981";
  } else if (node.type === 'expense') {
    // Try to match expense name
    const expenseName = node.name || '';
    return COLOR_PALETTE.expense[expenseName as keyof typeof COLOR_PALETTE.expense] || "#6B7280";
  } else if (node.type === 'goal') {
    return "#8B5CF6"; // purple for goals
  } else {
    return "#6B7280"; // default gray
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
    name: "Income",
    id: "joint",
    type: "joint" as const,
    value: totalDepositAmount,
  };
  
  // Create a node map for ID lookups
  const nodeMap = new Map();
  
  // Add all nodes to the processed array with correct indices and enhanced colors
  const processedNodes = [
    // Deposit nodes (left side)
    ...depositNodes.map((node, index) => {
      const nodeId = node.id || `deposit-${index}`;
      nodeMap.set(nodeId, index);
      return {
        ...node,
        id: nodeId,
        index,
        name: node.name,
        type: node.type,
        originalIndex: index,
        color: getNodeColor({ ...node, originalIndex: index })
      };
    }),
    // Joint account node (middle-left)
    {
      name: jointAccountNode.name,
      id: jointAccountNode.id,
      type: jointAccountNode.type,
      value: jointAccountNode.value,
      index: depositNodes.length,
      color: getNodeColor({ type: 'joint' })
    },
    // Category nodes (middle-right)
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
        originalIndex: index,
        color: getNodeColor({ ...node, type: 'category' })
      };
    }),
    // Expense nodes (right side)
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
        originalIndex: index,
        color: getNodeColor({ ...node, type: 'expense' })
      };
    }),
    // Goal nodes (far right)
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
        originalIndex: index,
        color: getNodeColor({ ...node, type: 'goal' })
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
