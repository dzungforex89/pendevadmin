"use client";

import React, { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail?: string | null;
  date: string;
};

type HomeFrontendProps = {
  initialPosts?: Post[];
};

export default function HomeFrontend({ initialPosts = [] }: HomeFrontendProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/posts')
      .then((r) => r.json())
      .then((data) => setPosts(data))
      .catch(() => setPosts([]));
  }, []);

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Latest Posts</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-8">
            {searchQuery ? 'No posts found matching your search.' : 'No posts yet.'}
          </div>
        )}
      </div>
    </section>
  );
}


