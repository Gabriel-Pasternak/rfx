import React from 'react';

export default function Skeleton({ type = 'rect', width = '100%', height = 20, className = '' }) {
  const base = 'bg-gray-200 animate-pulse';
  if (type === 'circle') {
    return <div className={`${base} rounded-full ${className}`} style={{ width: height, height }} />;
  }
  if (type === 'text') {
    return <div className={`${base} rounded ${className}`} style={{ width, height: 14 }} />;
  }
  // rect
  return <div className={`${base} rounded-lg ${className}`} style={{ width, height }} />;
} 