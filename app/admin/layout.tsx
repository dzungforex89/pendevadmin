import React from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-6">
      <header className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Admin</h2>
        <nav className="text-sm">
          <Link href="/">View Site</Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
