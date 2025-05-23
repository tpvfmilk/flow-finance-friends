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

// Process nodes for D3 Sankey layout with enhanced validation
export function processNodes(data: { nodes: SankeyNode[] }) {
  // Validate input data
  if (!data || !data.nodes || !Array.isArray(data.nodes) || data.nodes.length === 0) {
    console.error("Invalid nodes data provided to processNodes:", data);
    return { processedNodes: [], nodeMap: new Map(), depositNodes: [] };
  }

  // Ensure all nodes have IDs
  const nodesWithIds = data.nodes.map((node, index) => {
    if (!node.id) {
      console.warn(`Node missing ID, assigning one based on index and type: ${index}-${node.type}`);
      return { ...node, id: `${node.type}-${index}` };
    }
    return node;
  });

  // Validate node values - ensure they are numeric and positive
  const validatedNodes = nodesWithIds.map(node => {
    const value = typeof node.value === 'number' && !isNaN(node.value) && node.value > 0 
      ? node.value 
      : 1; // Default to 1 if invalid
      
    if (value !== node.value) {
      console.warn(`Node ${node.id} had invalid value ${node.value}, using ${value} instead`);
    }
    
    return { ...node, value };
  });

  // Classify nodes by type
  const depositNodes = validatedNodes.filter(node => node.type === "deposit");
  const categoryNodes = validatedNodes.filter(node => node.type === "category");
  const expenseNodes = validatedNodes.filter(node => node.type === "expense");
  const goalNodes = validatedNodes.filter(node => node.type === "goal");
  
  // Calculate total deposit amount
  const totalDepositAmount = depositNodes.reduce((total, node) => total + node.value, 0);
  
  // Create joint account node
  const jointAccountNode = {
    name: "Joint Account",
    id: "joint",
    type: "joint" as const,
    value: Math.max(totalDepositAmount, 1), // Ensure minimum value of 1
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
        name: node.name || `Deposit ${index + 1}`, // Ensure name exists
        type: node.type,
        value: node.value,
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
        name: node.name || `Category ${index + 1}`, // Ensure name exists
        category: node.category || '',
        type: node.type,
        value: node.value,
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
        name: node.name || `Expense ${index + 1}`, // Ensure name exists
        type: node.type,
        value: node.value,
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
        name: node.name || `Goal ${index + 1}`, // Ensure name exists
        type: node.type,
        value: node.value,
        color: getNodeColor(node)
      };
    })
  ];

  console.log("Processed nodes:", processedNodes.length, "Node map size:", nodeMap.size);
  return { processedNodes, nodeMap, depositNodes };
}

// Process links for D3 Sankey layout with enhanced validation
export function processLinks(data: { links: SankeyLink[], nodes: SankeyNode[] }, nodeMap: Map<string, number>, depositNodes: SankeyNode[]) {
  // Validate input data
  if (!data || !data.links || !Array.isArray(data.links) || data.links.length === 0) {
    console.error("Invalid links data provided to processLinks:", data);
    return [];
  }
  
  // Create links from deposits to joint account
  const depositToJointLinks = depositNodes.map(node => {
    // Ensure deposit index exists
    const sourceIndex = nodeMap.get(node.id);
    
    if (sourceIndex === undefined) {
      console.error(`Deposit node ${node.id} not found in nodeMap`);
      return null;
    }
    
    return {
      source: sourceIndex,
      target: depositNodes.length, // Joint account node index
      value: Math.max(node.value, 0.1), // Ensure positive value
      category: "deposit" // Add category for coloring
    };
  }).filter(Boolean); // Filter out null links
  
  console.log("Deposit to joint links created:", depositToJointLinks.length);
  
  // Create links from joint account to categories
  const jointToCategoryLinks = data.links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.toString();
    const sourceNode = data.nodes.find(n => n.id === sourceId);
    return sourceNode && sourceNode.type === 'deposit';
  }).map(link => {
    const targetId = typeof link.target === 'string' ? link.target : link.target.toString();
    const targetNode = data.nodes.find(n => n.id === targetId);
    const target = nodeMap.get(targetId);
    
    // Skip invalid links
    if (target === undefined) {
      console.warn(`Target node not found for link: ${targetId}`);
      return null;
    }
    
    // Ensure value is positive
    const linkValue = Math.max(link.value, 0.1);
    if (linkValue !== link.value) {
      console.warn(`Fixed invalid link value: ${link.value} -> ${linkValue}`);
    }
    
    return {
      source: depositNodes.length, // Joint account node index
      target,
      value: linkValue,
      category: targetNode?.category || link.category || ''
    };
  }).filter(Boolean); // Remove null links
  
  console.log("Joint to category links created:", jointToCategoryLinks.length);
  
  // Keep category to expense/goal links with proper categories
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
    
    const sourceNode = data.nodes.find(n => n.id === sourceId);
    const targetNode = data.nodes.find(n => n.id === targetId);
    
    const source = nodeMap.get(sourceId);
    const target = nodeMap.get(targetId);
    
    // Skip invalid links
    if (source === undefined || target === undefined) {
      console.warn(`Source or target node not found for link: ${sourceId} -> ${targetId}`);
      return null;
    }
    
    // Ensure value is positive
    const linkValue = Math.max(link.value, 0.1);
    if (linkValue !== link.value) {
      console.warn(`Fixed invalid link value: ${link.value} -> ${linkValue}`);
    }
    
    return {
      source,
      target,
      value: linkValue,
      category: sourceNode?.category || targetNode?.category || link.category || ''
    };
  }).filter(Boolean); // Remove null links
  
  console.log("Category to expense/goal links created:", categoryToExpenseLinks.length);
  
  // Combine all links
  const processedLinks = [
    ...depositToJointLinks,
    ...jointToCategoryLinks,
    ...categoryToExpenseLinks
  ].filter(link => link !== null);

  // Final validation check of all links
  const validProcessedLinks = processedLinks.filter(link => {
    if (link === null) return false;
    
    if (link.source === undefined || link.target === undefined) {
      console.error("Invalid link detected - source or target undefined:", link);
      return false;
    }
    
    if (typeof link.value !== 'number' || isNaN(link.value) || link.value <= 0) {
      console.error("Invalid link value:", link);
      return false;
    }
    
    return true;
  });

  console.log("Final valid links count:", validProcessedLinks.length);
  return validProcessedLinks;
}
