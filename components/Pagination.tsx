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
        className="px-3 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          borderColor: 'oklch(0.3036 0.1223 288)',
          borderWidth: '1px',
          color: currentPage === 1 ? 'oklch(0.5 0.04 260)' : 'oklch(0.22 0.04 260)',
          backgroundColor: 'transparent'
        }}
        onMouseEnter={(e) => {
          if (currentPage !== 1) {
            e.currentTarget.style.backgroundColor = 'oklch(0.98 0.01 260)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        Previous
      </button>

      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="px-2" style={{ color: 'oklch(0.4 0.04 260)' }}>
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
            className="px-3 py-2 rounded transition-colors"
            style={{
              backgroundColor: isActive ? 'oklch(0.5638 0.2255 24.24)' : 'transparent',
              borderColor: 'oklch(0.3036 0.1223 288)',
              borderWidth: '1px',
              color: isActive ? 'white' : 'oklch(0.22 0.04 260)'
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'oklch(0.98 0.01 260)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
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
        className="px-3 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          borderColor: 'oklch(0.3036 0.1223 288)',
          borderWidth: '1px',
          color: currentPage === totalPages ? 'oklch(0.5 0.04 260)' : 'oklch(0.22 0.04 260)',
          backgroundColor: 'transparent'
        }}
        onMouseEnter={(e) => {
          if (currentPage !== totalPages) {
            e.currentTarget.style.backgroundColor = 'oklch(0.98 0.01 260)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        Next
      </button>
    </div>
  );
}

