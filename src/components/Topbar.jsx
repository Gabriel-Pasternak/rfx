import React from 'react';
import { useAuth } from '../App';

export default function Topbar({ darkMode, toggleDarkMode }) {
  const { user, logout } = useAuth();
  return (
    <header className="topbar w-full flex items-center justify-between px-6 py-3 z-40">
      <div className="flex items-center gap-3">
        <span className="title font-bold text-lg">Dashboard</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded hover:bg-gray-800">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2 rounded hover:bg-gray-800" title="Toggle dark mode" onClick={toggleDarkMode}>
          {darkMode ? (
            // Sun icon
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          ) : (
            // Moon icon
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/></svg>
          )}
        </button>
        <div className="user-info flex items-center gap-2 px-3 py-1 rounded-lg">
          <span className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center font-bold">
            {user?.username?.charAt(0).toUpperCase()}
          </span>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{user?.username}</span>
            <span className="text-xs capitalize">{user?.user_type}</span>
          </div>
          <button onClick={logout} className="ml-2 p-2 rounded hover:bg-gray-800" title="Logout">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </div>
    </header>
  );
} 