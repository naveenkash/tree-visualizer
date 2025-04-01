import { configureStore } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { Node } from "../types";
const sidePanelSlice = createSlice({
  name: "sidePanel",
  initialState: { isOpen: false },
  reducers: {
    toggleSidePanel: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { toggleSidePanel } = sidePanelSlice.actions;

const generateBinaryTreeData = (maxNodes: number = 15) => {
  const nodes: Node[] = [];
  let nodeId = 1;

  // Create array of available values from 1 to maxNodes
  const availableValues = Array.from({ length: maxNodes }, (_, i) => i + 1);
  const totalNodes = Math.min(maxNodes, availableValues.length);

  // Function to assign values in a balanced BST manner
  const assignValues = (
    min: number,
    max: number,
    depth: number,
    parentId: string | null
  ) => {
    if (nodeId > totalNodes || min > max) return null;

    // Calculate the value for the current node (middle of the range for balance)
    const candidates = availableValues.filter((v) => v >= min && v <= max);
    if (candidates.length === 0) return null;

    // Pick the middle value to keep the tree balanced
    const midIndex = Math.floor(candidates.length / 2);
    const value = candidates[midIndex];
    availableValues.splice(availableValues.indexOf(value), 1);

    const currentId = String(nodeId);
    nodeId++;

    // Create the current node
    nodes.push({
      id: currentId,
      value,
      label: `Node ${currentId}`,
      to: null,
      from: parentId ? Number(parentId) : null,
      left: null,
      right: null,
    });

    // Recursively assign left and right children
    const leftChildId = assignValues(min, value - 1, depth + 1, currentId);
    const rightChildId = assignValues(value + 1, max, depth + 1, currentId);

    // Update the current node's left and right pointers
    const currentNode = nodes.find((n) => n.id === currentId)!;
    currentNode.left = leftChildId;
    currentNode.right = rightChildId;

    return Number(currentId);
  };

  // Start building the tree from the root
  assignValues(1, maxNodes, 0, null);

  // Validation
  console.log("Generated BST Nodes:");
  nodes.forEach((node) => {
    console.log(
      `Node ${node.id}: Value ${node.value}, Parent ${node.from}, Left ${node.left}, Right ${node.right}`
    );
  });

  // Verify BST properties
  const valueSet = new Set(nodes.map((node) => node.value));
  if (valueSet.size !== nodes.length) {
    console.error(
      "Duplicate values detected:",
      nodes.map((node) => node.value)
    );
    throw new Error("Values are not unique");
  }

  nodes.forEach((node) => {
    const leftChild = nodes.find((n) => n.id === String(node.left));
    const rightChild = nodes.find((n) => n.id === String(node.right));

    if (leftChild && leftChild.value >= node.value) {
      console.error(
        `BST violation: Left child ${leftChild.value} >= parent ${node.value} at Node ${node.id}`
      );
      throw new Error("Left child must be less than parent");
    }
    if (rightChild && rightChild.value <= node.value) {
      console.error(
        `BST violation: Right child ${rightChild.value} <= parent ${node.value} at Node ${node.id}`
      );
      throw new Error("Right child must be greater than parent");
    }
  });

  return [{ nodes }];
};

// Example usage
try {
  const treeData = generateBinaryTreeData(7);
  console.log("Generated tree:", treeData);
} catch (error) {
  console.error("Tree generation failed:", error);
}

const algorithmSlice = createSlice({
  name: "algorithm",
  initialState: {
    algorithm: "binary-search",
    dataStructure: generateBinaryTreeData(),
    searchTarget: 18, // Initially null (no target set)
  },
  reducers: {
    setAlgorithm: (state, action) => {
      state.algorithm = action.payload;
    },
    updateDataStructure: (state, action) => {
      state.dataStructure = generateBinaryTreeData(action.payload);
    },
    setSearchTarget: (state, action) => {
      state.searchTarget = action.payload;
    },
  },
});

export const { setAlgorithm, updateDataStructure, setSearchTarget } =
  algorithmSlice.actions;

const initialState = {
  animationSteps: [], // Array to store each step of the animation
  currentStepIndex: -1, // Index of the currently displayed step
  isPlaying: false, // Flag to indicate if the animation is playing
  animationSpeed: 1000, // Milliseconds between each step (default: 1 second)
};

const animationSlice = createSlice({
  name: "animation",
  initialState,
  reducers: {
    addStep: (state, action) => {
      /**@ts-expect-error will take this up in the future*/
      state.animationSteps.push(action.payload);
      state.currentStepIndex = state.animationSteps.length - 1; // update to the last step added
    },
    goToStep: (state, action) => {
      state.currentStepIndex = action.payload;
    },
    clearSteps: (state) => {
      state.animationSteps = [];
      state.currentStepIndex = -1;
    },
    setPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    setAnimationSpeed: (state, action) => {
      state.animationSpeed = action.payload;
    },
    nextStep: (state) => {
      if (state.currentStepIndex < state.animationSteps.length - 1) {
        state.currentStepIndex++;
      }
    },
    previousStep: (state) => {
      if (state.currentStepIndex > 0) {
        state.currentStepIndex--;
      }
    },
    resetAnimation: (state) => {
      state.currentStepIndex = -1;
      state.isPlaying = false;
    },
  },
});

export const {
  addStep,
  goToStep,
  clearSteps,
  setPlaying,
  setAnimationSpeed,
  nextStep,
  previousStep,
  resetAnimation,
} = animationSlice.actions;

const store = configureStore({
  reducer: {
    sidePanel: sidePanelSlice.reducer,
    algorithm: algorithmSlice.reducer,
    animation: animationSlice.reducer,
  },
});

export default store;
