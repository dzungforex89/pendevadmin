"use client";
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const titleRef = useRef<HTMLDivElement | null>(null);
  const [excerpt, setExcerpt] = useState('');
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [fontSize, setFontSize] = useState('16px');
  const [saving, setSaving] = useState(false);
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const editContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch('/api/posts')
      .then((r) => r.json())
      .then((data) => setPosts(data))
      .catch(() => setPosts([]));
  }, []);

  // When editing modal opens, populate editor with original content
  useEffect(() => {
    if (editingId && editingPost && editContentRef.current) {
      editContentRef.current.innerHTML = editingPost.content;
    }
  }, [editingId, editingPost]);

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

  function handleContentKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    
    if (isCtrlOrCmd && e.key === '+') {
      e.preventDefault();
      increaseFontSize();
    } else if (isCtrlOrCmd && e.key === '-') {
      e.preventDefault();
      decreaseFontSize();
    } else if (isCtrlOrCmd && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      document.execCommand('bold', false);
    }
  }

  function getCurrentFontSize(): number {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return 16;
    const node = sel.focusNode;
    if (!node) return 16;
    const element = node.parentElement;
    if (!element) return 16;
    const computed = window.getComputedStyle(element).fontSize;
    return parseFloat(computed) || 16;
  }

  function increaseFontSize() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.toString().length === 0) return;
    const currentSize = getCurrentFontSize();
    const newSize = Math.min(currentSize + 2, 48); // max 48px
    applyFontSizeToSelection(`${newSize}px`);
  }

  function decreaseFontSize() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.toString().length === 0) return;
    const currentSize = getCurrentFontSize();
    const newSize = Math.max(currentSize - 2, 12); // min 12px
    applyFontSizeToSelection(`${newSize}px`);
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

  function openEditModal(post: Post) {
    setEditingId(post.id);
    setEditingPost(post);
  }

  async function handleUpdateContent() {
    if (!editingId) return;
    setSaving(true);
    const newContent = editContentRef.current?.innerHTML || '';
    try {
      const res = await fetch(`/api/posts/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setPosts((p) => p.map((post) => (post.id === editingId ? updated : post)));
      setEditingId(null);
      setEditingPost(null);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingPost(null);
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      <form onSubmit={handleSave} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm">Title</label>
          <div
            ref={titleRef}
            contentEditable
            onInput={() => setTitle(titleRef.current?.innerText || '')}
            onKeyDown={handleContentKeyDown}
            className="w-full border px-2 py-1 font-semibold text-2xl"
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
          <div className="mb-2 text-xs text-slate-500">Tips: Use Ctrl + "+" / Ctrl + "-" to adjust font size, Ctrl+ "B/I/U"</div>
          <div
            ref={contentRef}
            contentEditable
            onKeyDown={handleContentKeyDown}
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
            <li key={p.id} className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <Link href={`/posts/${p.slug}`} onMouseEnter={() => prefetchPost(p.slug)} onClick={(e) => handleNavigate(e, p.slug)}>{p.title}</Link>
              </div>
              <button 
                type="button" 
                onClick={() => openEditModal(p)} 
                title="Edit"
                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Edit Modal */}
      {editingId && editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Content</h2>
            
            <div className="flex gap-4 flex-1 overflow-hidden">
              {/* Preview (Left) */}
              <div className="flex-1 overflow-y-auto border-r pr-4">
                <div className="text-sm font-semibold mb-2 text-slate-600">Original Content</div>
                <div className="prose prose-sm max-w-none text-sm">
                  <div dangerouslySetInnerHTML={{ __html: editingPost.content }} />
                </div>
              </div>

              {/* Editor (Right) */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <label className="block text-sm font-semibold mb-2">Edit Content</label>
                <div className="mb-2 text-xs text-slate-500">Ctrl++ / Ctrl+- for font size, Ctrl+B for bold</div>
                <div
                  ref={editContentRef}
                  contentEditable
                  onKeyDown={handleContentKeyDown}
                  className="flex-1 border px-3 py-2 prose overflow-y-auto"
                  suppressContentEditableWarning
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4 border-t pt-4">
              <button 
                type="button" 
                onClick={cancelEdit} 
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleUpdateContent} 
                disabled={saving}
                className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
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
