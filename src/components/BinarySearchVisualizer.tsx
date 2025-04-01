import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { addStep, clearSteps } from "../store";

interface Node {
  id: string;
  value: number;
  label: string;
  to: number | null;
  from: number | null;
  left?: number | null;
  right?: number | null;
  x?: number;
  y?: number;
  children?: Node[];
}

const BinarySearchVisualizer: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const target = useSelector((state: any) => state.algorithm.searchTarget);

  const dataStructure = useSelector(
    (state: any) => state.algorithm.dataStructure
  );
  // Ensure a deep copy of nodes to avoid mutating the original state
  const nodes: Node[] = dataStructure[0]?.nodes
    ? JSON.parse(JSON.stringify(dataStructure[0].nodes))
    : [];

  const binarySearch = (nodes: Node[], target: number) => {
    if (!target && target !== 0) {
      console.error("Target is not set or invalid:", target);
      return;
    }

    dispatch(clearSteps());

    // Find the root node
    const root = nodes.find((n: Node) => n.from === null);
    if (!root) {
      console.error("Root node not found in nodes:", nodes);
      return;
    }

    // Create a node map for quick lookup
    const nodeMap = new Map<string, Node>();
    nodes.forEach((node: Node) => {
      if (!node.id) {
        console.error("Node missing id:", node);
        return;
      }
      nodeMap.set(node.id, node);
    });

    console.log(
      "Node Map:",
      Array.from(nodeMap.entries()).map(([id, node]) => ({
        id,
        value: node.value,
      }))
    );

    let currentNode: Node | null = root;
    const visitedNodes: Node[] = [];

    while (currentNode) {
      console.log(
        `Visiting node ${currentNode.id} with value ${currentNode.value}`
      );
      visitedNodes.push({ ...currentNode }); // Create a copy to avoid mutating

      dispatch(
        addStep({
          currentNode: { ...currentNode },
          searchTarget: target,
          remainingNodes: [...visitedNodes],
        })
      );

      if (currentNode.value === target) {
        console.log(`Target ${target} found at node ${currentNode.id}`);
        break;
      } else if (target < currentNode.value) {
        const leftChildId = currentNode.left;
        console.log(
          `Target ${target} < ${currentNode.value}, going left to node ${leftChildId}`
        );
        if (leftChildId === null || leftChildId === undefined) {
          console.log(`No left child for node ${currentNode.id}`);
          currentNode = null;
        } else {
          const leftChild = nodeMap.get(String(leftChildId));
          if (!leftChild) {
            console.error(`Left child ${leftChildId} not found in nodeMap`);
            currentNode = null;
          } else {
            currentNode = leftChild;
          }
        }
      } else {
        const rightChildId = currentNode.right;
        console.log(
          `Target ${target} > ${currentNode.value}, going right to node ${rightChildId}`
        );
        if (rightChildId === null || rightChildId === undefined) {
          console.log(`No right child for node ${currentNode.id}`);
          currentNode = null;
        } else {
          const rightChild = nodeMap.get(String(rightChildId));
          if (!rightChild) {
            console.error(`Right child ${rightChildId} not found in nodeMap`);
            currentNode = null;
          } else {
            currentNode = rightChild;
          }
        }
      }
    }

    if (!currentNode) {
      console.log(`Target ${target} not found`);
      dispatch(
        addStep({
          currentNode: null,
          searchTarget: target,
          remainingNodes: [...visitedNodes],
        })
      );
    }
  };

  const handleSearch = () => {
    if (nodes.length === 0) {
      console.error("No nodes available to search");
      return;
    }
    binarySearch(nodes, target);
  };

  return (
    <button
      className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      onClick={handleSearch}
    >
      Start Binary Search ( {target} )
    </button>
  );
};

export default BinarySearchVisualizer;
