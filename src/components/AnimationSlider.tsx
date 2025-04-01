// src/components/NodeSlider.tsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setAnimationSpeed } from "../store";

const AnimationSlider: React.FC = () => {
  const dispatch = useDispatch();

  const animationSpeed = useSelector(
    (state: any) => state.animation.animationSpeed
  );

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);
    dispatch(setAnimationSpeed(newValue));
  };

  return (
    <div style={{ padding: "20px" }}>
      <label htmlFor="animation-slider">
        Animation Speed: {animationSpeed}
      </label>
      <input
        id="animation-slider"
        type="range"
        value={animationSpeed}
        min={100}
        max={1000}
        onChange={handleSliderChange}
        style={{ width: "200px", marginLeft: "10px" }}
      />
    </div>
  );
};

export default AnimationSlider;
