"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import StickyEditorToolbar from '../components/StickyEditorToolbar';
import RelatedArticlesSelector from '../components/RelatedArticlesSelector';
import ImageContextMenu from '../components/ImageContextMenu';
import ImageCropModal from '../components/ImageCropModal';
import AltTextModal from '../components/AltTextModal';
import '../styles/admin.css';

const ThumbnailEditor = dynamic(() => import('../components/ThumbnailEditor'), {
  ssr: false
});

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail?: string | null;
  date: string;
  relatedArticles?: string[] | null;
};

type AdminFrontendProps = {
  initialPosts?: Post[];
};

export default function AdminFrontend({ initialPosts = [] }: AdminFrontendProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [topic, setTopic] = useState<string>('');
  const titleRef = useRef<HTMLDivElement | null>(null);
  const excerptRef = useRef<HTMLDivElement | null>(null);
  const [excerpt, setExcerpt] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [relatedArticles, setRelatedArticles] = useState<string[] | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [fontSize, setFontSize] = useState('16px');
  const [saving, setSaving] = useState(false);
  const [activeEditorRef, setActiveEditorRef] = useState<React.RefObject<HTMLDivElement | null>>(titleRef);
  const [showPostsList, setShowPostsList] = useState(false);
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const editTitleRef = useRef<HTMLDivElement | null>(null);
  const editExcerptRef = useRef<HTMLDivElement | null>(null);
  const editContentRef = useRef<HTMLDivElement | null>(null);
  const [editThumbnail, setEditThumbnail] = useState('');
  const [editRelatedArticles, setEditRelatedArticles] = useState<string[] | null>(null);
  const [editActiveEditorRef, setEditActiveEditorRef] = useState<React.RefObject<HTMLDivElement | null>>(editTitleRef);

  // Image context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; image: HTMLImageElement; editorRef: React.RefObject<HTMLDivElement | null> } | null>(null);
  const [cropModal, setCropModal] = useState<{ imageSrc: string; image: HTMLImageElement; editorRef: React.RefObject<HTMLDivElement | null> } | null>(null);
  const [altTextModal, setAltTextModal] = useState<{ image: HTMLImageElement } | null>(null);

  useEffect(() => {
    fetch('/api/posts')
      .then((r) => r.json())
      .then((data) => setPosts(data))
      .catch(() => setPosts([]));
  }, []);

  // When editing modal opens, populate editor with original content
  useEffect(() => {
    if (editingId && editingPost) {
      if (editTitleRef.current) editTitleRef.current.innerHTML = editingPost.title;
      if (editExcerptRef.current) editExcerptRef.current.innerHTML = editingPost.excerpt;
      if (editContentRef.current) editContentRef.current.innerHTML = editingPost.content;
      setEditThumbnail(editingPost.thumbnail || '');
      setEditRelatedArticles(editingPost.relatedArticles || null);
      // Note: topic is not editable in edit modal as per requirements
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
      // Giữ lại selection sau khi apply
      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.addRange(newRange);
    } catch (e) {
      // fallback: try execCommand insertHTML
      try {
        const sel = window.getSelection();
        if (!sel) return;
        const html = `<span style="font-size:${size}">${sel.toString()}</span>`;
        document.execCommand('insertHTML', false, html);
        // Giữ lại selection
        if (sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const element = range.commonAncestorContainer.parentElement;
          if (element && element.tagName === 'SPAN') {
            const newRange = document.createRange();
            newRange.selectNodeContents(element);
            sel.removeAllRanges();
            sel.addRange(newRange);
          }
        }
      } catch (err) {
        // noop
      }
    }
  }

  function handleContentKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    
    if (isCtrlOrCmd && (e.key === '+' || e.key === '=')) {
      e.preventDefault();
      increaseFontSize();
      // Giữ lại selection
      setTimeout(() => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          if (range.collapsed) {
            // Nếu selection bị mất, thử restore từ element gần nhất
            const element = range.commonAncestorContainer.parentElement;
            if (element && element.tagName === 'SPAN') {
              const newRange = document.createRange();
              newRange.selectNodeContents(element);
              sel.removeAllRanges();
              sel.addRange(newRange);
            }
          }
        }
      }, 0);
    } else if (isCtrlOrCmd && e.key === '-') {
      e.preventDefault();
      decreaseFontSize();
      // Giữ lại selection
      setTimeout(() => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          if (range.collapsed) {
            const element = range.commonAncestorContainer.parentElement;
            if (element && element.tagName === 'SPAN') {
              const newRange = document.createRange();
              newRange.selectNodeContents(element);
              sel.removeAllRanges();
              sel.addRange(newRange);
            }
          }
        }
      }, 0);
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
    const excerptHtml = excerptRef.current?.innerHTML || excerpt;
    const payload = { 
      title: titleHtml, 
      slug: slug || makeSlug(titleText), 
      topic: topic || null,
      excerpt: excerptHtml, 
      content, 
      thumbnail: thumbnail || null,
      relatedArticles: relatedArticles || null
    };
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
      setTopic('');
      setExcerpt('');
      setThumbnail('');
      setRelatedArticles(null);
      if (contentRef.current) contentRef.current.innerHTML = '';
      if (titleRef.current) titleRef.current.innerHTML = '';
      if (excerptRef.current) excerptRef.current.innerHTML = '';
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

  // Check for edit query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId) {
      const postToEdit = posts.find(p => p.id === editId || p.slug === editId);
      if (postToEdit) {
        openEditModal(postToEdit);
        // Remove query parameter from URL
        window.history.replaceState({}, '', '/admin');
      }
    }
  }, [posts]);

  async function handleUpdatePost() {
    if (!editingId) return;
    setSaving(true);
    const titleHtml = editTitleRef.current?.innerHTML || '';
    const excerptHtml = editExcerptRef.current?.innerHTML || '';
    const contentHtml = editContentRef.current?.innerHTML || '';
    try {
      const res = await fetch(`/api/posts/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: titleHtml,
          excerpt: excerptHtml,
          content: contentHtml,
          thumbnail: editThumbnail || null,
          relatedArticles: editRelatedArticles || null
        })
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
    setEditRelatedArticles(null);
  }

  // Image context menu handlers
  const handleImageContextMenu = (e: React.MouseEvent<HTMLDivElement>, editorRef: React.RefObject<HTMLDivElement | null>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        image: target as HTMLImageElement,
        editorRef
      });
    }
  };

  const handleCrop = () => {
    if (contextMenu) {
      setCropModal({
        imageSrc: contextMenu.image.src,
        image: contextMenu.image,
        editorRef: contextMenu.editorRef
      });
      setContextMenu(null);
    }
  };

  const handleAltText = () => {
    if (contextMenu) {
      setAltTextModal({
        image: contextMenu.image
      });
      setContextMenu(null);
    }
  };

  const handleDelete = () => {
    if (contextMenu) {
      contextMenu.image.remove();
      setContextMenu(null);
    }
  };

  const handleCropApply = (croppedImageSrc: string) => {
    if (cropModal) {
      cropModal.image.src = croppedImageSrc;
      setCropModal(null);
    }
  };

  const handleAltTextApply = (altText: string) => {
    if (altTextModal) {
      altTextModal.image.alt = altText;
      setAltTextModal(null);
    }
  };

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => {
      if (contextMenu) {
        setContextMenu(null);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [contextMenu]);

  return (
    <section>
      <StickyEditorToolbar
        activeEditorRef={activeEditorRef}
        titleRef={titleRef}
        excerptRef={excerptRef}
        contentRef={contentRef}
      />
      <h1 className="text-2xl font-semibold mb-4 admin-text">Admin Console</h1>

      <form onSubmit={handleSave} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm admin-text font-medium">Title</label>
          <div
            ref={titleRef}
            contentEditable
            onInput={() => setTitle(titleRef.current?.innerText || '')}
            onKeyDown={handleContentKeyDown}
            onFocus={() => setActiveEditorRef(titleRef)}
            className="w-full admin-input border-2 px-2 py-1 font-semibold text-2xl rounded"
            style={{ color: 'oklch(0.22 0.04 260)' }}
            data-placeholder="Post title"
          />
        </div>
        <div>
          <label className="block text-sm admin-text font-medium">Topic</label>
          <select 
            value={topic} 
            onChange={(e) => setTopic(e.target.value)} 
            className="w-full admin-input border-2 px-2 py-1 rounded"
            style={{ color: 'oklch(0.22 0.04 260)' }}
          >
            <option value="">Select topic...</option>
            <option value="kien_thuc">Kiến thức</option>
            <option value="thu_tuc">Thủ tục</option>
            <option value="thong_tin">Thông tin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm admin-text font-medium">Slug (optional)</label>
          <input 
            value={slug} 
            onChange={(e) => setSlug(e.target.value)} 
            className="w-full admin-input border-2 px-2 py-1 rounded"
            style={{ color: 'oklch(0.22 0.04 260)' }}
          />
        </div>
        <div>
          <label className="block text-sm mb-2 admin-text font-medium">Excerpt</label>
          <div className="admin-input border-2 rounded overflow-hidden">
            <div
              ref={excerptRef}
              contentEditable
              onInput={() => setExcerpt(excerptRef.current?.innerText || '')}
              onFocus={() => setActiveEditorRef(excerptRef)}
              className="w-full min-h-[80px] px-3 py-2 prose"
              style={{ color: 'oklch(0.22 0.04 260)' }}
              data-placeholder="Write excerpt here..."
            />
          </div>
        </div>
        <div>
          <ThumbnailEditor value={thumbnail} onChange={setThumbnail} />
        </div>
        <div>
          <label className="block text-sm mb-2 admin-text font-medium">Content</label>
          <div className="admin-input border-2 rounded overflow-hidden">
            <div
              ref={contentRef}
              contentEditable
              onKeyDown={handleContentKeyDown}
              onFocus={() => setActiveEditorRef(contentRef)}
              onContextMenu={(e) => handleImageContextMenu(e, contentRef)}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const files = e.dataTransfer.files;
                if (files && files.length > 0) {
                  const file = files[0];
                  if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const img = document.createElement('img');
                      img.src = event.target?.result as string;
                      img.style.maxWidth = '100%';
                      img.style.height = 'auto';
                      
                      const selection = window.getSelection();
                      if (selection && selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        range.insertNode(img);
                        // Thêm 1 dòng trống sau ảnh
                        const br = document.createElement('br');
                        range.setStartAfter(img);
                        range.collapse(true);
                        range.insertNode(br);
                        range.setStartAfter(br);
                        range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(range);
                        contentRef.current?.focus();
                      } else if (contentRef.current) {
                        contentRef.current.appendChild(img);
                        // Thêm 1 dòng trống sau ảnh
                        const br = document.createElement('br');
                        contentRef.current.appendChild(br);
                        // Đặt cursor sau dòng trống
                        const range = document.createRange();
                        range.setStartAfter(br);
                        range.collapse(true);
                        const selection = window.getSelection();
                        selection?.removeAllRanges();
                        selection?.addRange(range);
                        contentRef.current.focus();
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }
              }}
              className="w-full min-h-[300px] px-3 py-2 prose"
              style={{ color: 'oklch(0.22 0.04 260)' }}
              data-placeholder="Write your post here..."
            />
          </div>
        </div>
        <div>
          <RelatedArticlesSelector
            value={relatedArticles}
            onChange={setRelatedArticles}
            maxSelections={3}
          />
        </div>
        <div className="flex justify-end mt-6">
          <button 
            type="submit" 
            disabled={saving} 
            className="admin-primary px-6 py-3 text-white rounded-lg font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            style={{
              backgroundColor: 'oklch(0.5638 0.2255 24.24)',
              boxShadow: '0 4px 6px -1px oklch(0.5638 0.2255 24.24 / 0.3), 0 2px 4px -1px oklch(0.5638 0.2255 24.24 / 0.2)'
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.backgroundColor = 'oklch(0.50 0.2255 24.24)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px oklch(0.5638 0.2255 24.24 / 0.4), 0 4px 6px -2px oklch(0.5638 0.2255 24.24 / 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.backgroundColor = 'oklch(0.5638 0.2255 24.24)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px oklch(0.5638 0.2255 24.24 / 0.3), 0 2px 4px -1px oklch(0.5638 0.2255 24.24 / 0.2)';
              }
            }}
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Post</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowPostsList(!showPostsList)}
            className="flex items-center gap-2 px-4 py-2 admin-secondary rounded transition-colors text-sm"
          >
            <span>{showPostsList ? 'Hide' : 'Show'} Posts</span>
            <svg
              className={`w-4 h-4 transition-transform ${showPostsList ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showPostsList && (
            <div className="text-sm admin-text font-medium">Posts ({posts.length})</div>
          )}
        </div>
        
        {showPostsList && (
          <ul className="list-disc pl-5 space-y-2">
            {posts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 py-2 border-b admin-border">
                <div className="flex-1">
                  <Link 
                    href={`/posts/${p.slug}`}
                    className="font-medium admin-link transition-colors"
                  >
                    {p.title}
                  </Link>
                </div>
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    openEditModal(p);
                  }} 
                  title="Edit"
                  className="p-2 admin-link hover:opacity-80 rounded transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] my-4 flex flex-col p-4 overflow-hidden" style={{ backgroundColor: 'oklch(0.98 0.01 260)' }}>
            <h2 className="text-lg font-semibold mb-3 admin-text">Edit Post</h2>
            
            <StickyEditorToolbar
              activeEditorRef={editActiveEditorRef}
              titleRef={editTitleRef}
              excerptRef={editExcerptRef}
              contentRef={editContentRef}
            />
            
            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
              <div>
                <label className="block text-sm mb-1.5 admin-text font-medium">Title</label>
                <div
                  ref={editTitleRef}
                  contentEditable
                  onFocus={() => setEditActiveEditorRef(editTitleRef)}
                  className="w-full admin-input border-2 px-2 py-1 font-semibold text-xl rounded"
                  style={{ color: 'oklch(0.22 0.04 260)' }}
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1.5 admin-text font-medium">Excerpt</label>
                <div
                  ref={editExcerptRef}
                  contentEditable
                  onFocus={() => setEditActiveEditorRef(editExcerptRef)}
                  className="w-full min-h-[60px] admin-input border-2 px-2 py-1.5 prose rounded text-sm"
                  style={{ color: 'oklch(0.22 0.04 260)' }}
                />
              </div>
              
              <div>
                <ThumbnailEditor value={editThumbnail} onChange={setEditThumbnail} />
              </div>
              
              <div>
                <label className="block text-sm mb-1.5 admin-text font-medium">Content</label>
                <div
                  ref={editContentRef}
                  contentEditable
                  onKeyDown={handleContentKeyDown}
                  onFocus={() => setEditActiveEditorRef(editContentRef)}
                  onContextMenu={(e) => handleImageContextMenu(e, editContentRef)}
                  className="w-full min-h-[200px] admin-input border-2 px-2 py-1.5 prose rounded text-sm"
                  style={{ color: 'oklch(0.22 0.04 260)' }}
                />
              </div>
              
              <div>
                <RelatedArticlesSelector
                  value={editRelatedArticles}
                  onChange={setEditRelatedArticles}
                  excludePostId={editingId || undefined}
                  maxSelections={3}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-3 border-t admin-border pt-3 flex-shrink-0">
              <button 
                type="button" 
                onClick={cancelEdit} 
                className="px-3 py-1.5 text-sm admin-secondary rounded transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleUpdatePost} 
                disabled={saving}
                className="px-3 py-1.5 text-sm admin-primary rounded transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Context Menu */}
      {contextMenu && (
        <ImageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onCrop={handleCrop}
          onAltText={handleAltText}
          onDelete={handleDelete}
        />
      )}

      {/* Image Crop Modal */}
      {cropModal && (
        <ImageCropModal
          imageSrc={cropModal.imageSrc}
          onClose={() => setCropModal(null)}
          onApply={handleCropApply}
        />
      )}

      {/* Alt Text Modal */}
      {altTextModal && (
        <AltTextModal
          currentAlt={altTextModal.image.alt || ''}
          onClose={() => setAltTextModal(null)}
          onApply={handleAltTextApply}
        />
      )}
    </section>
  );
}

