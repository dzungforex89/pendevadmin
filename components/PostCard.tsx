"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DEFAULT_THUMBNAIL_BASE64 } from '../constants/defaultThumbnail';

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail?: string | null;
  pinned?: boolean;
  date: string;
};

type PostCardProps = {
  post: Post;
  onPinToggle?: (postId: string, pinned: boolean) => void;
  isSelected?: boolean;
  onSelect?: (postId: string, selected: boolean) => void;
  onEdit?: (postId: string) => void;
};

function PostCardComponent({ post, onPinToggle, isSelected = false, onSelect, onEdit }: PostCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const thumbnailSrc = post.thumbnail || DEFAULT_THUMBNAIL_BASE64;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSelect) {
      onSelect(post.id, !isSelected);
    }
    setShowMenu(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(post.id);
    } else {
      router.push(`/admin?edit=${post.id}`);
    }
    setShowMenu(false);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSelect) {
      onSelect(post.id, e.target.checked);
    }
  };

  const handlePin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newPinnedState = !post.pinned;
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: newPinnedState })
      });
      if (res.ok && onPinToggle) {
        onPinToggle(post.id, newPinnedState);
      }
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
    setShowMenu(false);
  };

  // Strip HTML tags for excerpt display
  const stripHtml = (html: string) => {
    if (typeof document === 'undefined') {
      // Server-side: use regex to strip HTML tags
      return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    }
    // Client-side: use DOM method for better accuracy
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || '';
    return text.trim(); // Ensure consistent trimming on both server and client
  };

  // Limit excerpt to approximately 100 words
  const limitExcerpt = (text: string, maxWords: number = 100) => {
    const trimmedText = text.trim();
    const words = trimmedText.split(/\s+/).filter(word => word.length > 0);
    if (words.length <= maxWords) return trimmedText;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/posts/${post.slug}`} className="block cursor-pointer">
        <article 
          className="rounded-xl overflow-hidden bg-white border transition-all duration-200 h-full flex flex-col hover:shadow-lg"
          style={{
            borderColor: isSelected ? 'oklch(0.5638 0.2255 24.24)' : 'oklch(0.3036 0.1223 288 / 0.3)',
            borderWidth: isSelected ? '2px' : '1px',
            boxShadow: isSelected ? '0 4px 12px oklch(0.5638 0.2255 24.24 / 0.2)' : '0 1px 3px oklch(0.22 0.04 260 / 0.1)',
          }}
        >
          <div className="relative w-full h-36 bg-gray-100 overflow-hidden">
            <img 
              src={thumbnailSrc} 
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {post.pinned && (
              <div 
                className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold z-10 flex items-center gap-1.5"
                style={{
                  backgroundColor: 'oklch(0.5638 0.2255 24.24)',
                  color: 'white',
                  boxShadow: '0 2px 8px oklch(0.5638 0.2255 24.24 / 0.3)'
                }}
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
                Pinned
              </div>
            )}
          </div>
          <div className="p-3 flex-1 flex flex-col">
            <h3 
              className="text-base font-semibold mb-1.5 line-clamp-2 transition-colors duration-200"
              style={{ color: 'oklch(0.22 0.04 260)' }}
            >
              {stripHtml(post.title)}
            </h3>
            <p 
              className="text-xs line-clamp-3 flex-1" 
              style={{ color: 'oklch(0.45 0.04 260)' }}
            >
              {limitExcerpt(stripHtml(post.excerpt), 80)}
            </p>
            <div className="mt-1.5 text-xs" style={{ color: 'oklch(0.5 0.04 260)', fontSize: '0.65rem' }}>
              {new Date(post.date).toLocaleDateString('vi-VN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </article>
      </Link>
      
      {/* Checkbox for selection - only show on hover */}
      {onSelect && (isHovered || isSelected) && (
        <div 
          className="absolute top-3 left-3 z-20 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onSelect) {
              onSelect(post.id, !isSelected);
            }
          }}
        >
          <div 
            className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200"
            style={{
              borderColor: isSelected ? 'oklch(0.5638 0.2255 24.24)' : 'oklch(0.3036 0.1223 288)',
              backgroundColor: isSelected ? 'oklch(0.5638 0.2255 24.24)' : 'white',
            }}
          >
            {isSelected && (
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      )}
      
      {/* More button - only show on hover */}
      {isHovered && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="absolute top-3 right-3 p-2 rounded-lg shadow-md transition-all duration-200 z-10 cursor-pointer hover:shadow-lg"
          style={{
            backgroundColor: 'white',
            color: 'oklch(0.22 0.04 260)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'oklch(0.98 0.01 260)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="More options"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      )}

      {/* Dropdown menu */}
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute top-12 right-3 rounded-lg shadow-xl py-1.5 z-20 min-w-[140px] border transition-all duration-200"
          style={{
            backgroundColor: 'white',
            borderColor: 'oklch(0.3036 0.1223 288 / 0.2)',
            boxShadow: '0 4px 12px oklch(0.22 0.04 260 / 0.15)'
          }}
        >
          <button
            onClick={handleSelect}
            className="w-full text-left px-4 py-2 text-sm transition-colors duration-200 cursor-pointer flex items-center gap-2"
            style={{ color: 'oklch(0.22 0.04 260)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'oklch(0.95 0.01 260)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Select
          </button>
          <button
            onClick={handleEdit}
            className="w-full text-left px-4 py-2 text-sm transition-colors duration-200 cursor-pointer flex items-center gap-2"
            style={{ color: 'oklch(0.22 0.04 260)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'oklch(0.95 0.01 260)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={handlePin}
            className="w-full text-left px-4 py-2 text-sm transition-colors duration-200 cursor-pointer flex items-center gap-2"
            style={{ color: 'oklch(0.22 0.04 260)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'oklch(0.95 0.01 260)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            {post.pinned ? 'Unpin' : 'Pin'}
          </button>
        </div>
      )}
    </div>
  );
}

const PostCard = React.memo(PostCardComponent);

export default PostCard;
