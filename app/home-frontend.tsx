"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail?: string | null;
  pinned?: boolean;
  date: string;
};

type HomeFrontendProps = {
  initialPosts?: Post[];
};

const POSTS_PER_PAGE = 9;

export default function HomeFrontend({ initialPosts = [] }: HomeFrontendProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch('/api/posts')
      .then((r) => r.json())
      .then((data) => setPosts(data))
      .catch(() => setPosts([]));
  }, []);

  const handlePinToggle = useCallback((postId: string, pinned: boolean) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, pinned } : post
      )
    );
  }, []);

  const handleSelect = useCallback((postId: string, selected: boolean) => {
    setSelectedPosts((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(postId);
      } else {
        newSet.delete(postId);
      }
      return newSet;
    });
  }, []);

  const handleUnselectAll = () => {
    setSelectedPosts(new Set());
  };

  const handleDeleteSelected = async () => {
    if (selectedPosts.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedPosts.size} post(s)?`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedPosts).map((postId) =>
        fetch(`/api/posts/${postId}`, { method: 'DELETE' })
      );
      await Promise.all(deletePromises);
      
      setPosts((prevPosts) => prevPosts.filter((post) => !selectedPosts.has(post.id)));
      setSelectedPosts(new Set());
    } catch (err) {
      console.error('Failed to delete posts:', err);
      alert('Failed to delete posts. Please try again.');
    }
  };

  const handleEdit = useCallback((postId: string) => {
    router.push(`/admin?edit=${postId}`);
  }, [router]);

  // Memoize filtered posts to avoid recalculation on every render
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPinnedFilter = !showPinnedOnly || post.pinned === true;
      return matchesSearch && matchesPinnedFilter;
    });
  }, [posts, searchQuery, showPinnedOnly]);

  // Memoize sorted posts
  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [filteredPosts]);

  // Memoize pagination calculations
  const { totalPages, paginatedPosts } = useMemo(() => {
    const total = Math.ceil(sortedPosts.length / POSTS_PER_PAGE);
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const paginated = sortedPosts.slice(startIndex, endIndex);
    return { totalPages: total, paginatedPosts: paginated };
  }, [sortedPosts, currentPage]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, showPinnedOnly]);

  // Smooth scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Memoize page change handler
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    <section className="space-y-8">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg px-3 py-2 pl-9 text-sm border transition-all duration-200 focus:outline-none focus:ring-2 cursor-pointer"
              style={{
                borderColor: 'oklch(0.3036 0.1223 288 / 0.3)',
                color: 'oklch(0.22 0.04 260)',
                backgroundColor: 'white',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'oklch(0.5638 0.2255 24.24)';
                e.target.style.boxShadow = '0 0 0 3px oklch(0.5638 0.2255 24.24 / 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'oklch(0.3036 0.1223 288 / 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <svg
              className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: 'oklch(0.5 0.04 260)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={() => setShowPinnedOnly(!showPinnedOnly)}
            className="px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer font-medium flex items-center gap-2 whitespace-nowrap text-sm"
            style={{
              backgroundColor: showPinnedOnly ? 'oklch(0.5638 0.2255 24.24)' : 'white',
              borderColor: showPinnedOnly ? 'oklch(0.5638 0.2255 24.24)' : 'oklch(0.3036 0.1223 288 / 0.3)',
              color: showPinnedOnly ? 'white' : 'oklch(0.22 0.04 260)',
            }}
            onMouseEnter={(e) => {
              if (!showPinnedOnly) {
                e.currentTarget.style.backgroundColor = 'oklch(0.98 0.01 260)';
                e.currentTarget.style.borderColor = 'oklch(0.5638 0.2255 24.24)';
              }
            }}
            onMouseLeave={(e) => {
              if (!showPinnedOnly) {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = 'oklch(0.3036 0.1223 288 / 0.3)';
              }
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            {showPinnedOnly ? 'Showing Pinned' : 'Show Pinned Only'}
          </button>
        </div>
        
        {/* Selected posts actions */}
        {selectedPosts.size > 0 && (
          <div 
            className="flex items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-200"
            style={{
              backgroundColor: 'oklch(0.98 0.01 260)',
              borderColor: 'oklch(0.5638 0.2255 24.24)',
              borderWidth: '2px',
              boxShadow: '0 2px 8px oklch(0.5638 0.2255 24.24 / 0.15)'
            }}
          >
            <span className="text-sm font-semibold flex items-center gap-2" style={{ color: 'oklch(0.22 0.04 260)' }}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {selectedPosts.size} post(s) selected
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleUnselectAll}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor: 'oklch(0.3036 0.1223 288)',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'oklch(0.35 0.1223 288)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'oklch(0.3036 0.1223 288)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Unselect All
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-2"
                style={{ backgroundColor: 'oklch(0.5638 0.2255 24.24)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'oklch(0.50 0.2255 24.24)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'oklch(0.5638 0.2255 24.24)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Selected
              </button>
            </div>
          </div>
        )}

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {paginatedPosts.length > 0 ? (
          paginatedPosts.map((p) => (
            <PostCard 
              key={p.id} 
              post={p} 
              onPinToggle={handlePinToggle}
              isSelected={selectedPosts.has(p.id)}
              onSelect={handleSelect}
              onEdit={handleEdit}
            />
          ))
        ) : (
          <div 
            className="col-span-full text-center py-16 rounded-xl border"
            style={{ 
              color: 'oklch(0.5 0.04 260)',
              borderColor: 'oklch(0.3036 0.1223 288 / 0.2)',
              backgroundColor: 'oklch(0.98 0.01 260)'
            }}
          >
            <svg 
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">
              {searchQuery || showPinnedOnly
                ? 'No posts found matching your search.'
                : 'No posts yet.'}
            </p>
            <p className="text-sm mt-2">
              {searchQuery || showPinnedOnly
                ? 'Try adjusting your search or filter.'
                : 'Start creating your first post in the admin panel.'}
            </p>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </section>
  );
}
