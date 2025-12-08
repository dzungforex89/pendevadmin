import React from 'react';
import Link from 'next/link';
import '../../styles/admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4" style={{ backgroundColor: 'oklch(0.98 0.01 260)', minHeight: '100vh' }}>
      <main>{children}</main>
    </div>
  );
}
