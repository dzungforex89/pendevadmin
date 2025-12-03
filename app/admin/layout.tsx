import React from 'react';
import Link from 'next/link';
import '../../styles/admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6" style={{ backgroundColor: 'oklch(0.98 0.01 260)', minHeight: '100vh' }}>
      <header 
        className="mb-6 flex items-center justify-between pb-4 border-b shadow-sm px-4 py-3 rounded-lg"
        style={{
          borderColor: 'oklch(0.3036 0.1223 288)',
          backgroundColor: 'oklch(0.98 0.01 260)'
        }}
      >
        <h2 className="text-xl font-semibold" style={{ color: 'oklch(0.22 0.04 260)' }}>Home Page</h2>
        <nav className="text-sm">
          <Link 
            href="/" 
            className="admin-header-link font-medium px-3 py-1 rounded transition-colors"
            style={{ 
              color: 'oklch(0.5638 0.2255 24.24)',
              backgroundColor: 'oklch(0.5638 0.2255 24.24 / 0.1)'
            }}
          >
            View Site
          </Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
