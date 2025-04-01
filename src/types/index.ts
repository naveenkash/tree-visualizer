export enum AlgorithmType {
  BINARY_SEARCH = "BINARY_SEARCH",
}

export interface Node {
  id: string; // A unique identifier for the node.
  value: number; // The value stored in the node, used for comparisons in algorithms.
  label: string; // A human-readable label for the node, often used for display purposes.
  to: number | null; // The ID of the node that this node points to as a "to" relationship (e.g., a child node).
  from: number | null; // The ID of the parent node (the node that points to this node).
  left?: number | null; // Optional field for the left child ID, used in binary trees to represent the left child.
  right?: number | null; // Optional field for the right child ID, used in binary trees to represent the right child.
  x?: number; // Optional field for the x-coordinate of the node, used for positioning in visualizations.
  y?: number; // Optional field for the y-coordinate of the node, used for positioning in visualizations.
  children?: Node[]; // Optional field for storing child nodes, useful for hierarchical structures.
}
