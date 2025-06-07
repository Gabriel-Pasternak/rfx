import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 13h4v-2H3v2zm0 4h4v-2H3v2zm0-8h4V7H3v2zm6 8h8v-2H9v2zm0-4h8v-2H9v2zm0-8v2h8V3H9z"/></svg>
  ), path: '/buyer' },
  { key: 'products', label: 'Products', icon: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
  ), path: '/products' },
  { key: 'requests', label: 'Requests', icon: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>
  ), path: '/requests' },
  { key: 'responses', label: 'Responses', icon: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  ), path: '/responses' },
  { key: 'analytics', label: 'Analytics', icon: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>
  ), path: '/analytics' },
  { key: 'support', label: 'Support', icon: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 15h.01M16 15h.01M12 17h.01"/></svg>
  ), path: '/support' },
  { key: 'settings', label: 'Settings', icon: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  ), path: '/settings' },
];

export default function Sidebar({ collapsed, onCollapse }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(collapsed || false);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (onCollapse) onCollapse(!isCollapsed);
  };

  return (
    <aside className={`sidebar h-screen flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between px-4 py-5">
        <span className="logo font-bold text-xl">KEZAD</span>
        <button onClick={handleCollapse} className="p-2 rounded hover:bg-gray-800">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>
      </div>
      <nav className="flex-1 px-2 space-y-2">
        {navItems.map(item => (
          <Link
            key={item.key}
            to={item.path}
            className={`nav-link flex items-center gap-3 font-medium transition-colors duration-200 ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
          >
            <span>{item.icon}</span>
            {!isCollapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
      <div className="footer px-4 py-4">
        <span className="text-xs">© 2024 KEZAD</span>
      </div>
    </aside>
  );
} 