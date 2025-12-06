"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSidebar } from '../contexts/SidebarContext';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Trang chủ',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/admin',
    label: 'Admin',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isCollapsed, setIsCollapsed } = useSidebar();

  // Save collapsed state to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, [setIsCollapsed]);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const sidebarWidth = isCollapsed ? '80px' : '280px';
  const isExpanded = !isCollapsed;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg transition-all duration-200 cursor-pointer"
        style={{
          backgroundColor: 'white',
          borderColor: 'oklch(0.3036 0.1223 288 / 0.3)',
          borderWidth: '1px',
          boxShadow: '0 2px 8px oklch(0.22 0.04 260 / 0.1)'
        }}
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'oklch(0.22 0.04 260)' }}>
          {isMobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-200"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Main (always visible, collapsed or expanded) */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{
          width: sidebarWidth,
          backgroundColor: 'oklch(0.98 0.01 260)',
          borderRightColor: 'oklch(0.3036 0.1223 288 / 0.2)',
          borderRightWidth: '1px',
          boxShadow: '2px 0 8px oklch(0.22 0.04 260 / 0.05)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="px-6 py-6 border-b flex items-center justify-between" style={{ borderColor: 'oklch(0.3036 0.1223 288 / 0.2)' }}>
            {isExpanded ? (
              <>
                <Link
                  href="/"
                  className="text-2xl font-bold transition-opacity duration-200 cursor-pointer hover:opacity-80 flex-1"
                  style={{ color: 'oklch(0.5638 0.2255 24.24)' }}
                  onClick={() => setIsMobileOpen(false)}
                >
                  10SAT Console
                </Link>
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-2 rounded-lg transition-all duration-200 cursor-pointer hover:bg-opacity-80"
                  style={{
                    backgroundColor: 'oklch(0.95 0.01 260)',
                    color: 'oklch(0.22 0.04 260)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'oklch(0.90 0.01 260)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'oklch(0.95 0.01 260)';
                  }}
                  aria-label="Collapse sidebar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
              </>
            ) : (
              <div className="w-full flex justify-center">
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-2 rounded-lg transition-all duration-200 cursor-pointer"
                  style={{
                    backgroundColor: 'oklch(0.95 0.01 260)',
                    color: 'oklch(0.22 0.04 260)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'oklch(0.90 0.01 260)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'oklch(0.95 0.01 260)';
                  }}
                  aria-label="Expand sidebar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
                    isActive ? 'shadow-sm' : ''
                  } ${isExpanded ? '' : 'justify-center'}`}
                  style={{
                    backgroundColor: isActive ? 'oklch(0.5638 0.2255 24.24)' : 'transparent',
                    color: isActive ? 'white' : 'oklch(0.22 0.04 260)',
                    minWidth: isExpanded ? 'auto' : '48px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'oklch(0.95 0.01 260)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  onClick={() => setIsMobileOpen(false)}
                  title={!isExpanded ? item.label : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {isExpanded && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer Section */}
          {isExpanded && (
            <div className="px-4 py-6 border-t" style={{ borderColor: 'oklch(0.3036 0.1223 288 / 0.2)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-semibold flex-shrink-0"
                  style={{
                    backgroundColor: 'oklch(0.5638 0.2255 24.24 / 0.1)',
                    color: 'oklch(0.5638 0.2255 24.24)'
                  }}
                >
                  PA
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'oklch(0.22 0.04 260)' }}>
                    Pencil Ai
                  </p>
                  <p className="text-xs truncate" style={{ color: 'oklch(0.5 0.04 260)' }}>
                    ADMIN
                  </p>
                </div>
              </div>
              <p className="text-xs truncate" style={{ color: 'oklch(0.5 0.04 260)' }}>
                aipencilclass@gmail.com
              </p>
            </div>
          )}
        </div>
      </aside>

    </>
  );
}
