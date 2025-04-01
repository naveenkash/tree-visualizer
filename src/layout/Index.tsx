import React from "react";
import NetworkGraph from "../components/NetworkGraph";
import NodeSlider from "../components/NodeSlider";
import BinarySearchVisualizer from "../components/BinarySearchVisualizer";
import BinaryTreeTraversalVisualizer from "../components/BinaryTreeTraversalVisualizer";
import { useSelector } from "react-redux";
import AnimationSlider from "../components/AnimationSlider";
const Layout: React.FC = () => {
  const isPlaying = useSelector(
    (state: {
      animation: {
        isPlaying: boolean;
      };
    }) => state.animation.isPlaying
  );
  return (
    <div className="flex min-h-screen flex-col font-sans text-gray-800">
      {/* Topbar */}
      <header
        className={`z-10 w-full bg-white  p-4 text-gray-900 flex  items-center  ${
          isPlaying ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div className="flex gap-2 items-center">
          <BinarySearchVisualizer />
          <BinaryTreeTraversalVisualizer />
          <NodeSlider />
          <AnimationSlider />
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1">
        {/* Main Content */}
        <NetworkGraph />
      </div>
    </div>
  );
};

export default Layout;
