import React, { useEffect } from 'react';

export default function Toast({ toasts, removeToast }) {
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        removeToast(toasts[0].id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts, removeToast]);

  return (
    <div className="fixed top-6 right-6 z-50 space-y-3">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg text-white transition-all duration-300 ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}
        >
          <span>{toast.type === 'success' ? '✔️' : toast.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span>{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-2 text-white hover:text-gray-200">✖</button>
        </div>
      ))}
    </div>
  );
} 