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
        borderColor: 'oklch(0.3036 0.1223 288)',
        borderWidth: '1px',
        backgroundColor: isScrolled ? 'oklch(0.99 0.01 260)' : 'oklch(0.98 0.01 260)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <nav className="flex items-center justify-between px-6 py-4">
        <Link 
          href="/" 
          className="text-2xl font-bold transition-all duration-200 cursor-pointer hover:opacity-80"
          style={{ color: 'oklch(0.5638 0.2255 24.24)' }}
        >
          10SAT Console
        </Link>
        
        <div className="flex items-center gap-2">
          <Link 
            href="/" 
            className="px-4 py-2 rounded-lg font-medium text-base transition-all duration-200 cursor-pointer hover:bg-opacity-80"
            style={{ 
              color: 'oklch(0.22 0.04 260)',
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
              color: 'oklch(0.5638 0.2255 24.24)',
              backgroundColor: 'oklch(0.5638 0.2255 24.24 / 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'oklch(0.5638 0.2255 24.24 / 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'oklch(0.5638 0.2255 24.24 / 0.1)';
            }}
          >
            Admin
          </Link>
        </div>
      </nav>
    </header>
  );
}
