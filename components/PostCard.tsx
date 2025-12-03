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

export default function PostCard({ post, onPinToggle, isSelected = false, onSelect, onEdit }: PostCardProps) {
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

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/posts/${post.slug}`} className="block">
        <article 
          className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
          style={{
            borderColor: isSelected ? 'oklch(0.5638 0.2255 24.24)' : 'oklch(0.3036 0.1223 288)',
            borderWidth: isSelected ? '2px' : '1px'
          }}
        >
          <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
            <img 
              src={thumbnailSrc} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
            {post.pinned && (
              <div 
                className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold z-10"
                style={{
                  backgroundColor: 'oklch(0.5638 0.2255 24.24)',
                  color: 'white'
                }}
              >
                📌 Pinned
              </div>
            )}
          </div>
          <div className="p-4 flex-1">
            <h3 
              className="text-lg font-semibold mb-2 line-clamp-2 transition-colors"
              style={{ color: 'oklch(0.22 0.04 260)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'oklch(0.5638 0.2255 24.24)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'oklch(0.22 0.04 260)'}
            >
              {post.title}
            </h3>
            <p className="text-sm line-clamp-3" style={{ color: 'oklch(0.4 0.04 260)' }}>{post.excerpt}</p>
          </div>
        </article>
      </Link>
      
      {/* Checkbox for selection - only show on hover */}
      {onSelect && (isHovered || isSelected) && (
        <div className="absolute top-2 left-2 z-20">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="w-5 h-5 cursor-pointer"
            style={{ accentColor: 'oklch(0.5638 0.2255 24.24)' }}
          />
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
          className="absolute top-2 right-2 p-2 rounded-full shadow-md transition-colors z-10"
          style={{
            backgroundColor: 'white',
            color: 'oklch(0.22 0.04 260)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'oklch(0.98 0.01 260)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
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
          className="absolute top-10 right-2 rounded-lg shadow-lg py-1 z-20 min-w-[120px]"
          style={{
            backgroundColor: 'white',
            borderColor: 'oklch(0.3036 0.1223 288)',
            borderWidth: '1px'
          }}
        >
          <button
            onClick={handleSelect}
            className="w-full text-left px-4 py-2 text-sm transition-colors"
            style={{ color: 'oklch(0.22 0.04 260)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'oklch(0.98 0.01 260)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Select
          </button>
          <button
            onClick={handleEdit}
            className="w-full text-left px-4 py-2 text-sm transition-colors"
            style={{ color: 'oklch(0.22 0.04 260)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'oklch(0.98 0.01 260)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Edit
          </button>
          <button
            onClick={handlePin}
            className="w-full text-left px-4 py-2 text-sm transition-colors"
            style={{ color: 'oklch(0.22 0.04 260)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'oklch(0.98 0.01 260)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {post.pinned ? 'Unpin' : 'Pin'}
          </button>
        </div>
      )}
    </div>
  );
}
