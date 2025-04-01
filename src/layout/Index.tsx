import React from "react";
import { useDispatch } from "react-redux";
import { toggleSidePanel } from "../store/index";
import Sidebar from "./Sidebar";
import NetworkGraph from "../components/NetworkGraph";
import NodeSlider from "../components/NodeSlider";
const Layout: React.FC = () => {
  const dispatch = useDispatch();

  return (
    <div className="flex min-h-screen flex-col font-sans text-gray-800">
      {/* Topbar */}
      <header className=" z-10 w-full bg-white  p-4 text-gray-900 flex  items-center">
        <button
          onClick={() => dispatch(toggleSidePanel())}
          className="text-xl focus:outline-none cursor-pointer  "
        >
          ☰
        </button>
        {/* Algorithm Selector */}
        <div className="ml-4">
          <select
            id="algorithm"
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="binary-search">Binary Search</option>
            {/* More options can be added here */}
          </select>
        </div>
        <NodeSlider />
      </header>

      {/* Main Container */}
      <div className="flex flex-1">
        {/* Main Content */}
        <NetworkGraph />
        <Sidebar />
      </div>
    </div>
  );
};

export default Layout;
