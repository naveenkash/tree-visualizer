// src/components/NodeSlider.tsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateDataStructure } from "../store";

const NodeSlider: React.FC = () => {
  const dispatch = useDispatch();

  const nodeCount = useSelector(
    (state) => state.algorithm.dataStructure[0].nodes.length
  );

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);
    dispatch(updateDataStructure(newValue));
  };

  return (
    <div style={{ padding: "20px" }}>
      <label htmlFor="node-slider">Number of Nodes: {nodeCount}</label>
      <input
        id="node-slider"
        type="range"
        value={nodeCount}
        min={7}
        max={127}
        onChange={handleSliderChange}
        style={{ width: "200px", marginLeft: "10px" }}
      />
    </div>
  );
};

export default NodeSlider;
