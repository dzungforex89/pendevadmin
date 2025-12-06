"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DEFAULT_THUMBNAIL_BASE64 } from '../constants/defaultThumbnail';

type RelatedPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail?: string | null;
  date: string;
};

type RelatedArticlesProps = {
  currentSlug: string;
};

function stripHtml(html: string): string {
  if (typeof document === 'undefined') {
    // Server-side: use regex
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
  // Client-side: use DOM
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function limitExcerpt(text: string, maxWords: number = 30): string {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(' ') + '...';
}

export default function RelatedArticles({ currentSlug }: RelatedArticlesProps) {
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentSlug) {
      setLoading(false);
      return;
    }

    fetch(`/api/posts/${currentSlug}/related`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then((data) => {
        setRelatedPosts(data || []);
      })
      .catch((err) => {
        console.error('Error fetching related posts:', err);
        setRelatedPosts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentSlug]);

  if (loading) {
    return (
      <div className="mt-16 pt-12 border-t" style={{ borderColor: 'oklch(0.3036 0.1223 288 / 0.2)' }}>
        <div className="flex items-center justify-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent" style={{ color: 'oklch(0.5638 0.2255 24.24)' }}></div>
        </div>
      </div>
    );
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 pt-12 border-t" style={{ borderColor: 'oklch(0.3036 0.1223 288 / 0.2)' }}>
      <h2 
        className="text-2xl md:text-3xl font-bold mb-8 uppercase tracking-wide"
        style={{ color: 'oklch(0.22 0.04 260)' }}
      >
        Những Bài Viết Liên Quan
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((post) => {
          const thumbnailSrc = post.thumbnail || DEFAULT_THUMBNAIL_BASE64;
          const cleanTitle = stripHtml(post.title);
          const cleanExcerpt = limitExcerpt(stripHtml(post.excerpt), 30);
          const formattedDate = new Date(post.date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          return (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="group block rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer bg-white hover:shadow-lg"
              style={{
                borderColor: 'oklch(0.3036 0.1223 288 / 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'oklch(0.5638 0.2255 24.24)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'oklch(0.3036 0.1223 288 / 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Thumbnail */}
              <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                <img
                  src={thumbnailSrc}
                  alt={cleanTitle}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col">
                {/* Date */}
                <div className="text-xs font-medium mb-3 uppercase tracking-wide" style={{ color: 'oklch(0.5 0.04 260)' }}>
                  {formattedDate}
                </div>

                {/* Title */}
                <h3
                  className="text-lg font-bold mb-2 line-clamp-2 transition-colors duration-200"
                  style={{ color: 'oklch(0.22 0.04 260)' }}
                >
                  {cleanTitle}
                </h3>

                {/* Excerpt */}
                <p
                  className="text-sm leading-relaxed line-clamp-3 mb-4 flex-1"
                  style={{ color: 'oklch(0.5 0.04 260)' }}
                >
                  {cleanExcerpt}
                </p>

                {/* Read More Link */}
                <div className="flex items-center gap-2 text-sm font-medium mt-auto" style={{ color: 'oklch(0.5638 0.2255 24.24)' }}>
                  <span>Đọc thêm</span>
                  <svg
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

