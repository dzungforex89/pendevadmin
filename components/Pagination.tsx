"use client";

import React from 'react';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-xl border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium"
        style={{
          borderColor: currentPage === 1 ? 'rgba(17,24,39,0.08)' : 'rgba(17,24,39,0.12)',
          color: currentPage === 1 ? 'rgba(17,24,39,0.9)' : 'rgba(17,24,39,0.7)',
          backgroundColor: 'white'
        }}
        onMouseEnter={(e) => {
          if (currentPage !== 1) {
            e.currentTarget.style.backgroundColor = 'oklch(0.98 0.01 260)';
            e.currentTarget.style.borderColor = 'oklch(0.5638 0.2255 24.24)';
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage !== 1) {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = 'oklch(0.3036 0.1223 288 / 0.3)';
          }
        }}
      >
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </span>
      </button>

      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <span 
              key={`ellipsis-${index}`} 
              className="px-2"
              style={{ color: 'rgba(17,24,39,0.9)' }}
            >
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = currentPage === pageNum;
        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className="px-4 py-2 rounded-xl border transition-all duration-200 cursor-pointer font-medium min-w-[44px]"
            style={{
              backgroundColor: isActive ? 'var(--primary)' : 'white',
              borderColor: isActive ? 'var(--primary)' : 'rgba(17,24,39,0.12)',
              color: isActive ? 'white' : 'rgba(17,24,39,0.7)',
              boxShadow: isActive ? '0 2px 8px rgba(220,20,60,0.18)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = 'rgba(17,24,39,0.12)';
              }
            }}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-xl border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium"
        style={{
          borderColor: currentPage === totalPages ? 'rgba(17,24,39,0.08)' : 'rgba(17,24,39,0.12)',
          color: currentPage === totalPages ? 'rgba(17,24,39,0.9)' : 'rgba(17,24,39,0.7)',
          backgroundColor: 'white'
        }}
        onMouseEnter={(e) => {
          if (currentPage !== totalPages) {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = 'var(--primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (currentPage !== totalPages) {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = 'rgba(17,24,39,0.12)';
          }
        }}
      >
        <span className="flex items-center gap-1.5">
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </button>
    </div>
  );
}
