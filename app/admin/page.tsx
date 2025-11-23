"use client";
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
};

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const titleRef = useRef<HTMLDivElement | null>(null);
  const [excerpt, setExcerpt] = useState('');
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [fontSize, setFontSize] = useState('16px');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/posts')
      .then((r) => r.json())
      .then((data) => setPosts(data))
      .catch(() => setPosts([]));
  }, []);

  function makeSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  function applyFontSizeToSelection(size: string) {
    try {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const selectedText = range.toString();
      if (!selectedText) return;
      // Create span wrapper with font-size
      const span = document.createElement('span');
      if (size) span.style.fontSize = size;
      span.textContent = selectedText;
      // Replace selected content with span
      range.deleteContents();
      range.insertNode(span);
      // move caret after inserted node
      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.setStartAfter(span);
      newRange.collapse(true);
      sel.addRange(newRange);
    } catch (e) {
      // fallback: try execCommand insertHTML
      try {
        const sel = window.getSelection();
        if (!sel) return;
        const html = `<span style="font-size:${size}">${sel.toString()}</span>`;
        document.execCommand('insertHTML', false, html);
      } catch (err) {
        // noop
      }
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const content = contentRef.current?.innerHTML || '';
    const titleHtml = titleRef.current?.innerHTML || title;
    const titleText = titleRef.current?.innerText || title;
    const payload = { title: titleHtml, slug: slug || makeSlug(titleText), excerpt, content };
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed');
      const created = await res.json();
      setPosts((p) => [created, ...p]);
      setTitle('');
      setSlug('');
      setExcerpt('');
      if (contentRef.current) contentRef.current.innerHTML = '';
      if (titleRef.current) titleRef.current.innerHTML = '';
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      <form onSubmit={handleSave} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm">Title</label>
          <div className="mb-2 flex items-center gap-2">
            <div className="text-sm">Font size:</div>
            <select onChange={(e) => applyFontSizeToSelection(e.target.value)} defaultValue="16px" className="border px-2 py-1">
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
            </select>
            <button type="button" onClick={() => applyFontSizeToSelection('18px')} className="px-2 py-1 border">Apply</button>
            <button type="button" onClick={() => applyFontSizeToSelection('')} className="px-2 py-1 border">Clear</button>
          </div>
          <div
            ref={titleRef}
            contentEditable
            onInput={() => setTitle(titleRef.current?.innerText || '')}
            className="w-full border px-2 py-1 font-semibold text-xl"
            data-placeholder="Post title"
          />
        </div>
        <div>
          <label className="block text-sm">Slug (optional)</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full border px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm">Excerpt</label>
          <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full border px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm">Content</label>
          <div className="mb-2 flex items-center gap-2">
            <div className="text-sm">Font size:</div>
            <select onChange={(e) => applyFontSizeToSelection(e.target.value)} defaultValue="16px" className="border px-2 py-1">
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
            </select>
            <button type="button" onClick={() => applyFontSizeToSelection('')} className="px-2 py-1 border">Clear</button>
          </div>
          <div
            ref={contentRef}
            contentEditable
            className="w-full min-h-[150px] border px-3 py-2 prose"
            data-placeholder="Write your post here..."
          />
        </div>
        <div>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-sky-600 text-white rounded">
            {saving ? 'Saving...' : 'Post'}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        <div className="text-sm text-slate-600">Posts ({posts.length})</div>
          <ul className="list-disc pl-5">
          {posts.map((p) => (
            <li key={p.id}>
              <Link href={`/posts/${p.slug}`} onMouseEnter={() => prefetchPost(p.slug)}>{p.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function prefetchPost(slug: string) {
  try {
    if (typeof window === 'undefined') return;
    // create cache object
    (window as any).__POST_CACHE = (window as any).__POST_CACHE || {};
    const cache = (window as any).__POST_CACHE;
    if (cache[slug]) return; // already cached or fetching
    cache[slug] = fetch(`/api/posts/${slug}`).then((r) => (r.ok ? r.json() : null)).then((d) => { cache[slug] = d; return d; }).catch(() => { cache[slug] = null; });
  } catch (e) {
    // noop
  }
}
