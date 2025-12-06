"use client";

import { useSidebar } from '../contexts/SidebarContext';
import Footer from './Footer';

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div 
      className="flex-1 flex flex-col transition-all duration-300"
      style={{
        marginLeft: isCollapsed ? '80px' : '280px'
      }}
    >
      <main className="flex-1 px-4 py-8 lg:px-8">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

