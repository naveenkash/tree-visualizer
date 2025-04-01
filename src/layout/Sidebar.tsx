import React from "react";
import { useSelector } from "react-redux";

const Sidebar: React.FC = () => {
  const isSidebarOpen = useSelector((state: any) => state.sidePanel.isOpen);

  return (
    <aside
      className={`fixed top-14 right-0 h-[calc(100vh-3.5rem)] bg-gray-50 transition-all duration-300 ease-in-out shadow-inner ${
        isSidebarOpen ? "w-64" : "w-0"
      } overflow-hidden`}
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold">Sidebar</h2>
        <ul className="mt-4 space-y-2">
          <li className="py-2">Item 1</li>
          <li className="py-2">Item 2</li>
          <li className="py-2">Item 3</li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
