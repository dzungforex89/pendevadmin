"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DEFAULT_THUMBNAIL_BASE64 } from '../constants/defaultThumbnail';

type PostOption = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail?: string | null;
};

type RelatedArticlesSelectorProps = {
  value: string[] | null; // Array of post IDs
  onChange: (value: string[] | null) => void;
  excludePostId?: string; // Exclude current post when editing
  maxSelections?: number;
};

export default function RelatedArticlesSelector({
  value,
  onChange,
  excludePostId,
  maxSelections = 3
}: RelatedArticlesSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [allPosts, setAllPosts] = useState<PostOption[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<PostOption[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all posts on mount (similar to home page)
  useEffect(() => {
    fetch('/api/posts')
      .then((r) => r.json())
      .then((data: PostOption[]) => {
        setAllPosts(data);
      })
      .catch(() => setAllPosts([]));
  }, []);

  // Load selected posts when value changes
  useEffect(() => {
    if (value && value.length > 0) {
      fetchSelectedPosts(value);
    } else {
      setSelectedPosts([]);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSelectedPosts = async (postIds: string[]) => {
    try {
      const posts = await Promise.all(
        postIds.map(async (id) => {
          try {
            // Try to fetch by ID first, if that fails, try by slug
            let res = await fetch(`/api/posts/${id}`);
            if (!res.ok) {
              // If not found by ID, it might be a slug, but we'll just return null
              return null;
            }
            const post = await res.json();
            return {
              id: post.id,
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt,
              thumbnail: post.thumbnail
            } as PostOption;
          } catch {
            return null;
          }
        })
      );
      const validPosts = posts.filter((p): p is PostOption => p !== null);
      setSelectedPosts(validPosts);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error fetching selected posts:', err);
    }
  };

  // Strip HTML tags for display and search
  const stripHtml = useCallback((html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }, []);

  // Filter posts in memory (same logic as home page)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase();
    
    // Filter posts by title (same logic as home page: post.title.toLowerCase().includes(query))
    const filtered = allPosts.filter((post) => {
      // Strip HTML from title for search
      const titleText = stripHtml(post.title).toLowerCase();
      const matchesSearch = titleText.includes(query);
      
      // Exclude already selected posts and current post
      const notSelected = !selectedPosts.some((sp) => sp.id === post.id);
      const notExcluded = post.id !== excludePostId;
      
      return matchesSearch && notSelected && notExcluded;
    });
    
    // Limit to 10 results
    return filtered.slice(0, 10);
  }, [allPosts, searchQuery, selectedPosts, excludePostId, stripHtml]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Show dropdown when user types (no debounce needed since we filter in memory)
    if (query.trim().length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleSelectPost = (post: PostOption) => {
    if (selectedPosts.length >= maxSelections) return;
    
    const newSelected = [...selectedPosts, post];
    setSelectedPosts(newSelected);
    onChange(newSelected.map((p) => p.id));
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleRemovePost = (postId: string) => {
    const newSelected = selectedPosts.filter((p) => p.id !== postId);
    setSelectedPosts(newSelected);
    onChange(newSelected.length > 0 ? newSelected.map((p) => p.id) : null);
  };

  const handleRandomSelect = () => {
    // Use allPosts from state (already fetched on mount)
    if (allPosts.length === 0) return;
    
    // Filter out excluded post
    const availablePosts = allPosts.filter(
      (post) => post.id !== excludePostId
    );
    
    // Shuffle and pick random posts
    const shuffled = [...availablePosts].sort(() => 0.5 - Math.random());
    const randomPosts = shuffled.slice(0, maxSelections);
    
    setSelectedPosts(randomPosts);
    onChange(randomPosts.map((p) => p.id));
  };

  const handleClear = () => {
    setSelectedPosts([]);
    onChange(null);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm admin-text font-medium">
        Related Posts (max {maxSelections})
      </label>

      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => {
            if (searchQuery.trim() && searchResults.length > 0) {
              setShowDropdown(true);
            }
          }}
          placeholder="Search posts by title..."
          className="w-full px-3 py-2 rounded pr-10 border-2 admin-input"
          style={{ 
            color: 'var(--foreground)',
            backgroundColor: 'white'
          }}
          autoComplete="off"
        />

        {/* Dropdown Results */}
        {showDropdown && searchResults.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border-2 admin-border rounded shadow-lg max-h-64 overflow-y-auto"
            style={{ backgroundColor: 'white' }}
          >
            {searchResults.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => handleSelectPost(post)}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b admin-border last:border-b-0 transition-colors"
                style={{ color: 'var(--foreground)' }}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={post.thumbnail || DEFAULT_THUMBNAIL_BASE64}
                    alt={stripHtml(post.title)}
                    className="w-12 h-12 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-medium text-sm line-clamp-1"
                      dangerouslySetInnerHTML={{ __html: post.title }}
                    />
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {stripHtml(post.excerpt)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {showDropdown && searchQuery.trim().length > 0 && searchResults.length === 0 && (
          <div
            className="absolute z-50 w-full mt-1 bg-white border-2 admin-border rounded shadow-lg p-4 text-center text-sm"
            style={{ backgroundColor: 'white', color: 'var(--foreground)' }}
          >
            No posts found
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleRandomSelect}
          className="px-3 py-1.5 text-sm admin-secondary rounded transition-colors"
        >
          Suggested Posts
        </button>
        {selectedPosts.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 text-sm admin-secondary rounded transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Selected Posts Preview */}
      {selectedPosts.length > 0 && (
            <div className="space-y-2">
          <div className="text-xs admin-text font-medium">
            Selected ({selectedPosts.length}/{maxSelections}):
          </div>
          {selectedPosts.map((post) => (
            <div
              key={post.id}
              className="flex items-start gap-3 p-3 border-2 admin-border rounded bg-gray-50"
                  style={{ backgroundColor: 'white' }}
            >
              <img
                src={post.thumbnail || DEFAULT_THUMBNAIL_BASE64}
                alt={stripHtml(post.title)}
                className="w-16 h-16 object-cover rounded flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div
                  className="font-medium text-sm mb-1 line-clamp-2"
                  style={{ color: 'var(--foreground)' }}
                  dangerouslySetInnerHTML={{ __html: post.title }}
                />
                <div className="text-xs text-gray-500 line-clamp-2">
                  {stripHtml(post.excerpt)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  /{post.slug}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemovePost(post.id)}
                className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 transition-colors"
                title="Remove"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

