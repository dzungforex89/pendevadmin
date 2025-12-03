"use client";

import React, { useEffect, useState } from 'react';
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

  const handlePinToggle = (postId: string, pinned: boolean) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, pinned } : post
      )
    );
  };

  const handleSelect = (postId: string, selected: boolean) => {
    setSelectedPosts((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(postId);
      } else {
        newSet.delete(postId);
      }
      return newSet;
    });
  };

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

  const handleEdit = (postId: string) => {
    router.push(`/admin?edit=${postId}`);
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPinnedFilter = !showPinnedOnly || post.pinned === true;
    return matchesSearch && matchesPinnedFilter;
  });

  // Sort: pinned posts first, then by date
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Pagination
  const totalPages = Math.ceil(sortedPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedPosts = sortedPosts.slice(startIndex, endIndex);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, showPinnedOnly]);

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'oklch(0.22 0.04 260)' }}>Latest Posts</h1>
        <div className="flex gap-4 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg px-4 py-2 pl-10 focus:outline-none transition-colors"
              style={{
                borderColor: 'oklch(0.3036 0.1223 288)',
                borderWidth: '1px',
                color: 'oklch(0.22 0.04 260)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'oklch(0.5638 0.2255 24.24)';
                e.target.style.boxShadow = '0 0 0 2px oklch(0.5638 0.2255 24.24 / 0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'oklch(0.3036 0.1223 288)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: 'oklch(0.4 0.04 260)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={() => setShowPinnedOnly(!showPinnedOnly)}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: showPinnedOnly ? 'oklch(0.5638 0.2255 24.24)' : 'transparent',
              borderColor: 'oklch(0.3036 0.1223 288)',
              borderWidth: '1px',
              color: showPinnedOnly ? 'white' : 'oklch(0.22 0.04 260)'
            }}
            onMouseEnter={(e) => {
              if (!showPinnedOnly) {
                e.currentTarget.style.backgroundColor = 'oklch(0.98 0.01 260)';
              }
            }}
            onMouseLeave={(e) => {
              if (!showPinnedOnly) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {showPinnedOnly ? '📌 Showing Pinned' : '📌 Show Pinned Only'}
          </button>
        </div>
        
        {/* Selected posts actions */}
        {selectedPosts.size > 0 && (
          <div 
            className="mt-4 flex items-center gap-4 p-4 rounded-lg"
            style={{
              backgroundColor: 'oklch(0.98 0.01 260)',
              borderColor: 'oklch(0.3036 0.1223 288)',
              borderWidth: '1px'
            }}
          >
            <span className="text-sm font-medium" style={{ color: 'oklch(0.22 0.04 260)' }}>
              {selectedPosts.size} post(s) selected
            </span>
            <button
              onClick={handleUnselectAll}
              className="px-4 py-2 rounded text-sm transition-colors"
              style={{
                backgroundColor: 'oklch(0.3036 0.1223 288)',
                color: 'white'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'oklch(0.35 0.1223 288)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'oklch(0.3036 0.1223 288)'}
            >
              Unselect All
            </button>
            <button
              onClick={handleDeleteSelected}
              className="px-4 py-2 text-white rounded text-sm transition-colors"
              style={{ backgroundColor: 'oklch(0.5638 0.2255 24.24)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'oklch(0.50 0.2255 24.24)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'oklch(0.5638 0.2255 24.24)'}
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="col-span-full text-center py-8" style={{ color: 'oklch(0.4 0.04 260)' }}>
            {searchQuery || showPinnedOnly
              ? 'No posts found matching your search.'
              : 'No posts yet.'}
          </div>
        )}
      </div>
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}


