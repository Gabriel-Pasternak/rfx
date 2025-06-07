import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Card = ({ title, children, className = '', collapsible = false, defaultCollapsed = false }) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 mb-6 transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => collapsible && setCollapsed(c => !c)}>
        {title && (
          <h2 className="text-xl font-bold mb-4 tracking-tight text-gray-900 dark:text-white flex-1">
            {title}
          </h2>
        )}
        {collapsible && (
          <span className="ml-2">
            {collapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </span>
        )}
      </div>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${collapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'}`}
        style={{ marginTop: collapsible ? (collapsed ? 0 : '1rem') : undefined }}
      >
        {!collapsed && children}
      </div>
    </div>
  );
};

export default Card; 