"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
};

export default function PostPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!slug) return;
    // try to read prefetched cache first to avoid fetching on navigation
    const tryPrefetch = async () => {
      try {
        if (typeof window !== 'undefined') {
          const cache = (window as any).__POST_CACHE || {};
          const entry = cache[slug];
          if (entry && typeof entry !== 'function' && typeof entry.then === 'function') {
            // entry is a promise
            const data = await entry;
            setPost(data);
            return;
          }
          if (entry && typeof entry === 'object') {
            setPost(entry as Post);
            return;
          }
        }
        const r = await fetch(`/api/posts/${slug}`);
        if (!r.ok) throw new Error('Not found');
        const data = await r.json();
        setPost(data);
      } catch (err) {
        setPost(null);
      }
    };
    tryPrefetch();
  }, [slug]);

  if (!post) return <div>Post not found.</div>;
  return (
    <article className="prose">
      <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
      <p className="text-sm text-slate-500">{post.date}</p>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
