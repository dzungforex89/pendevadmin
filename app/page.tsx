"use client";
import React, { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch('/api/posts')
      .then((r) => r.json())
      .then((data) => setPosts(data))
      .catch(() => setPosts([]));
  }, []);

  return (
    <section>
      <h1 className="text-3xl font-bold mb-4">Latest Posts</h1>
      <div>
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </section>
  );
}
