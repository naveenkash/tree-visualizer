import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { addStep, clearSteps, setPlaying } from "../store";

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

const BinaryTreeTraversalVisualizer: React.FC = () => {
  const dispatch = useDispatch();
  const animationSpeed = useSelector(
    (state: {
      animation: {
        animationSpeed: number;
      };
    }) => state.animation.animationSpeed
  );

  const dataStructure = useSelector(
    (state: {
      algorithm: {
        dataStructure: {
          nodes: Node[];
        }[];
      };
    }) => state.algorithm.dataStructure
  );
  // Ensure a deep copy of nodes to avoid mutating the original state
  const nodes: Node[] = dataStructure[0]?.nodes
    ? JSON.parse(JSON.stringify(dataStructure[0].nodes))
    : [];

  // Helper function to create a node map for quick lookup
  const createNodeMap = (nodes: Node[]) => {
    const nodeMap = new Map<string, Node>();
    nodes.forEach((node: Node) => {
      if (!node.id) {
        console.error("Node missing id:", node);
        return;
      }
      nodeMap.set(node.id, node);
    });
    return nodeMap;
  };

  // Helper function to dispatch steps with a delay
  const dispatchWithDelay = (
    steps: {
      currentNode: Node | null;
      searchTarget: number;
      remainingNodes: Node[];
    }[],
    index: number,
    callback: () => void
  ) => {
    if (index >= steps.length) {
      callback();
      return;
    }

    setTimeout(() => {
      dispatch(addStep(steps[index]));
      dispatchWithDelay(steps, index + 1, callback);
    }, animationSpeed);
  };

  // In-order traversal: Left -> Root -> Right
  const inOrderTraversal = (nodes: Node[]) => {
    dispatch(clearSteps());

    const root = nodes.find((n: Node) => n.from === null);
    if (!root) {
      console.error("Root node not found in nodes:", nodes);
      return;
    }

    const nodeMap = createNodeMap(nodes);
    console.log(
      "Node Map:",
      Array.from(nodeMap.entries()).map(([id, node]) => ({
        id,
        value: node.value,
      }))
    );

    const steps: {
      currentNode: Node | null;
      searchTarget: number;
      remainingNodes: Node[];
    }[] = [];
    const visitedNodes: Node[] = [];
    const stack: Node[] = [];
    let currentNode: Node | null = root;

    while (currentNode || stack.length > 0) {
      // Traverse to the leftmost node
      while (currentNode) {
        stack.push(currentNode);
        const leftChildId = currentNode.left;
        currentNode = leftChildId ? nodeMap.get(String(leftChildId))! : null;
      }

      // Process the current node (pop from stack)
      currentNode = stack.pop()!;
      console.log(
        `Visiting node ${currentNode.id} with value ${currentNode.value} (In-order)`
      );
      visitedNodes.push({ ...currentNode });

      steps.push({
        currentNode: { ...currentNode },
        searchTarget: 0,
        remainingNodes: [...visitedNodes],
      });

      // Move to the right child
      const rightChildId = currentNode.right;
      currentNode = rightChildId ? nodeMap.get(String(rightChildId))! : null;
    }

    // Add the final step
    steps.push({
      currentNode: null,
      searchTarget: 0,
      remainingNodes: [...visitedNodes],
    });

    console.log("In-order traversal steps prepared:", steps.length);
    dispatchWithDelay(steps, 0, () => {
      dispatch(setPlaying(false));
      console.log("In-order traversal completed");
    });
  };

  // Pre-order traversal: Root -> Left -> Right
  const preOrderTraversal = (nodes: Node[]) => {
    dispatch(clearSteps());

    const root = nodes.find((n: Node) => n.from === null);
    if (!root) {
      console.error("Root node not found in nodes:", nodes);
      return;
    }

    const nodeMap = createNodeMap(nodes);
    console.log(
      "Node Map:",
      Array.from(nodeMap.entries()).map(([id, node]) => ({
        id,
        value: node.value,
      }))
    );

    const steps: {
      currentNode: Node | null;
      searchTarget: number;
      remainingNodes: Node[];
    }[] = [];
    const visitedNodes: Node[] = [];
    const stack: Node[] = [root];

    while (stack.length > 0) {
      const currentNode = stack.pop()!;
      console.log(
        `Visiting node ${currentNode.id} with value ${currentNode.value} (Pre-order)`
      );
      visitedNodes.push({ ...currentNode });

      steps.push({
        currentNode: { ...currentNode },
        searchTarget: 0,
        remainingNodes: [...visitedNodes],
      });

      // Push right child first (so it will be processed after left)
      const rightChildId = currentNode.right;
      if (rightChildId) {
        const rightChild = nodeMap.get(String(rightChildId));
        if (rightChild) stack.push(rightChild);
        else console.error(`Right child ${rightChildId} not found in nodeMap`);
      }

      // Push left child (so it will be processed next)
      const leftChildId = currentNode.left;
      if (leftChildId) {
        const leftChild = nodeMap.get(String(leftChildId));
        if (leftChild) stack.push(leftChild);
        else console.error(`Left child ${leftChildId} not found in nodeMap`);
      }
    }

    // Add the final step
    steps.push({
      currentNode: null,
      searchTarget: 0,
      remainingNodes: [...visitedNodes],
    });

    console.log("Pre-order traversal steps prepared:", steps.length);
    dispatchWithDelay(steps, 0, () => {
      dispatch(setPlaying(false));
      console.log("Pre-order traversal completed");
    });
  };

  // Post-order traversal: Left -> Right -> Root
  const postOrderTraversal = (nodes: Node[]) => {
    dispatch(clearSteps());

    const root = nodes.find((n: Node) => n.from === null);
    if (!root) {
      console.error("Root node not found in nodes:", nodes);
      return;
    }

    const nodeMap = createNodeMap(nodes);
    console.log(
      "Node Map:",
      Array.from(nodeMap.entries()).map(([id, node]) => ({
        id,
        value: node.value,
      }))
    );

    const steps: {
      currentNode: Node | null;
      searchTarget: number;
      remainingNodes: Node[];
    }[] = [];
    const visitedNodes: Node[] = [];
    const stack: { node: Node; visited: boolean }[] = [
      { node: root, visited: false },
    ];

    while (stack.length > 0) {
      const { node: currentNode, visited } = stack.pop()!;

      if (visited) {
        // If we've visited the children, process the node
        console.log(
          `Visiting node ${currentNode.id} with value ${currentNode.value} (Post-order)`
        );
        visitedNodes.push({ ...currentNode });

        steps.push({
          currentNode: { ...currentNode },
          searchTarget: 0,
          remainingNodes: [...visitedNodes],
        });
      } else {
        // Push the node back with visited flag set to true
        stack.push({ node: currentNode, visited: true });

        // Push right child first (so it will be processed before the node)
        const rightChildId = currentNode.right;
        if (rightChildId) {
          const rightChild = nodeMap.get(String(rightChildId));
          if (rightChild) stack.push({ node: rightChild, visited: false });
          else
            console.error(`Right child ${rightChildId} not found in nodeMap`);
        }

        // Push left child (so it will be processed first)
        const leftChildId = currentNode.left;
        if (leftChildId) {
          const leftChild = nodeMap.get(String(leftChildId));
          if (leftChild) stack.push({ node: leftChild, visited: false });
          else console.error(`Left child ${leftChildId} not found in nodeMap`);
        }
      }
    }

    // Add the final step
    steps.push({
      currentNode: null,
      searchTarget: 0,
      remainingNodes: [...visitedNodes],
    });

    console.log("Post-order traversal steps prepared:", steps.length);
    dispatchWithDelay(steps, 0, () => {
      dispatch(setPlaying(false));
      console.log("Post-order traversal completed");
    });
  };

  const handleInOrder = () => {
    if (nodes.length === 0) {
      console.error("No nodes available for traversal");
      return;
    }
    dispatch(setPlaying(false));
    inOrderTraversal(nodes);
  };

  const handlePreOrder = () => {
    if (nodes.length === 0) {
      console.error("No nodes available for traversal");
      return;
    }
    dispatch(setPlaying(false));
    preOrderTraversal(nodes);
  };

  const handlePostOrder = () => {
    if (nodes.length === 0) {
      console.error("No nodes available for traversal");
      return;
    }
    dispatch(setPlaying(false));
    postOrderTraversal(nodes);
  };

  return (
    <>
      <button
        className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        onClick={handleInOrder}
      >
        In-order Traversal
      </button>
      <button
        className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        onClick={handlePreOrder}
      >
        Pre-order Traversal
      </button>
      <button
        className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        onClick={handlePostOrder}
      >
        Post-order Traversal
      </button>
    </>
  );
};

export default BinaryTreeTraversalVisualizer;
