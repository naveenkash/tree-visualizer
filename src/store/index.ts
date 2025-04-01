import { configureStore } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

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

const generateBinaryTreeData = (maxNodes: number = 31) => {
  const nodes: Node[] = [];
  let nodeId = 1;

  // Root node
  nodes.push({
    id: "1",
    value: 1,
    label: "Node 1",
    to: null,
    from: null,
  });
  nodeId++;

  // Build a complete binary tree up to depth 3 (15 nodes: 1 + 2 + 4 + 8)
  const parentQueue: string[] = ["1"];

  while (nodeId <= maxNodes && parentQueue.length > 0) {
    const parentId = parentQueue.shift()!;
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent) continue;

    // Left child
    if (nodeId <= maxNodes) {
      const leftChildId = String(nodeId);
      nodes.push({
        id: leftChildId,
        value: leftChildId,
        label: `Node ${leftChildId}`,
        to: null,
        from: Number(parentId),
      });
      if (!parent.to) parent.to = Number(leftChildId);
      parentQueue.push(leftChildId);
      nodeId++;
    }

    // Right child
    if (nodeId <= maxNodes) {
      const rightChildId = String(nodeId);
      nodes.push({
        id: rightChildId,
        value: rightChildId,
        label: `Node ${rightChildId}`,
        to: null,
        from: Number(parentId),
      });
      parentQueue.push(rightChildId);
      nodeId++;
    }
  }

  return [{ nodes }];
};

const algorithmSlice = createSlice({
  name: "algorithm",
  initialState: {
    algorithm: "binary-search",
    dataStructure: generateBinaryTreeData(),
  },
  reducers: {
    setAlgorithm: (state, action) => {
      state.algorithm = action.payload;
    },
    updateDataStructure: (state, action) => {
      state.dataStructure = generateBinaryTreeData(action.payload);
    },
  },
});

export const { setAlgorithm, updateDataStructure } = algorithmSlice.actions;

const store = configureStore({
  reducer: {
    sidePanel: sidePanelSlice.reducer,
    algorithm: algorithmSlice.reducer,
  },
});

export default store;
