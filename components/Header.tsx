"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-4 z-50 mx-auto mb-8 transition-all duration-300 ${
        isScrolled ? 'shadow-lg' : 'shadow-sm'
      }`}
      style={{ 
        maxWidth: '1280px',
        width: 'calc(100% - 2rem)',
        borderRadius: '16px',
        borderColor: 'rgba(17,24,39,0.06)',
        borderWidth: '1px',
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <nav className="flex items-center justify-between px-6 py-4">
          <Link 
          href="/" 
          className="text-2xl font-bold transition-all duration-200 cursor-pointer hover:opacity-80"
          style={{ color: 'var(--primary)' }}
        >
          PenDev Console
        </Link>
        
        <div className="flex items-center gap-2">
          <Link 
            href="/" 
            className="px-4 py-2 rounded-lg font-medium text-base transition-all duration-200 cursor-pointer hover:bg-opacity-80"
            style={{ 
              color: 'var(--foreground)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'oklch(0.95 0.01 260)';
              e.currentTarget.style.color = 'oklch(0.5638 0.2255 24.24)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'oklch(0.22 0.04 260)';
            }}
          >
            Trang chủ
          </Link>
          <Link 
            href="/admin" 
            className="px-4 py-2 rounded-lg font-medium text-base transition-all duration-200 cursor-pointer"
            style={{ 
              color: 'var(--primary)',
              backgroundColor: 'rgba(220,20,60,0.08)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(220,20,60,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(220,20,60,0.08)';
            }}
          >
            Admin
          </Link>
        </div>
      </nav>
    </header>
  );
}
