"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import RelatedArticles from '../../../components/RelatedArticles';

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail?: string | null;
  date: string;
};

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string | undefined;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const handleEdit = () => {
    if (post?.id) {
      router.push(`/admin?edit=${post.id}`);
    }
  };

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    fetch(`/api/posts/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then((data) => {
        setPost(data);
      })
      .catch(() => {
        setPost(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-current border-r-transparent mb-4" style={{ color: 'oklch(0.5638 0.2255 24.24)' }}></div>
          <p style={{ color: 'oklch(0.5 0.04 260)' }}>Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <svg 
          className="w-24 h-24 mb-6 opacity-50"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          style={{ color: 'oklch(0.5 0.04 260)' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'oklch(0.22 0.04 260)' }}>Post not found</h1>
        <p className="text-base mb-6" style={{ color: 'oklch(0.5 0.04 260)' }}>
          The post you're looking for doesn't exist or has been removed.
        </p>
        <Link 
          href="/" 
          className="px-6 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
          style={{ 
            color: 'white',
            backgroundColor: 'oklch(0.5638 0.2255 24.24)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'oklch(0.50 0.2255 24.24)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'oklch(0.5638 0.2255 24.24)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto py-8 px-4">
      {/* Navigation Bar */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b" style={{ borderColor: 'oklch(0.3036 0.1223 288 / 0.2)' }}>
        <Link 
          href="/" 
          className="px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
          style={{ 
            color: 'oklch(0.5638 0.2255 24.24)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'oklch(0.95 0.01 260)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to home
        </Link>
        <button
          onClick={handleEdit}
          className="px-5 py-2.5 text-white rounded-xl font-medium transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
          style={{ backgroundColor: 'oklch(0.5638 0.2255 24.24)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'oklch(0.50 0.2255 24.24)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'oklch(0.5638 0.2255 24.24)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Post
        </button>
      </div>
      
      {/* Thumbnail */}
      {post.thumbnail && (
        <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
          <img 
            src={post.thumbnail} 
            alt={post.title}
            className="w-full h-[400px] object-cover"
          />
        </div>
      )}
      
      {/* Post Header */}
      <header className="mb-8">
        <h1 
          className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
          style={{ color: 'oklch(0.22 0.04 260)' }}
        >
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-sm" style={{ color: 'oklch(0.5 0.04 260)' }}>
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('vi-VN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </time>
        </div>
      </header>

      {/* Post Content */}
      <div 
        className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:font-poppins prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold"
        style={{
          color: 'oklch(0.22 0.04 260)',
        }}
        dangerouslySetInnerHTML={{ __html: post.content }} 
      />

      {/* Related Articles */}
      {post.slug && <RelatedArticles currentSlug={post.slug} />}
    </article>
  );
}
