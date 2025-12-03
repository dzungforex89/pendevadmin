"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'oklch(0.22 0.04 260)' }}>Post not found</h1>
        <Link href="/" className="hover:opacity-80 transition-opacity" style={{ color: 'oklch(0.5638 0.2255 24.24)' }}>
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="hover:opacity-80 transition-opacity" style={{ color: 'oklch(0.5638 0.2255 24.24)' }}>
          ← Back to home
        </Link>
        <button
          onClick={handleEdit}
          className="px-4 py-2 text-white rounded flex items-center gap-2 transition-colors"
          style={{ backgroundColor: 'oklch(0.5638 0.2255 24.24)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'oklch(0.50 0.2255 24.24)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'oklch(0.5638 0.2255 24.24)'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Post
        </button>
      </div>
      
      {post.thumbnail && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <img 
            src={post.thumbnail} 
            alt={post.title}
            className="w-full h-96 object-cover"
          />
        </div>
      )}
      
      <h1 className="text-4xl font-bold mb-4" style={{ color: 'oklch(0.22 0.04 260)' }}>{post.title}</h1>
      <p className="text-sm mb-6" style={{ color: 'oklch(0.4 0.04 260)' }}>{new Date(post.date).toLocaleDateString()}</p>
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }} 
      />
    </article>
  );
}

