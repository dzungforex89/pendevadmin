'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchPosts, createPost, updatePost, prefetchPost } from './api';

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
        fetchPosts().then(setPosts).catch(() => setPosts([]));
    }, []);

    // When editing modal opens, populate editor with original content
    useEffect(() => {
        if (editingId && editingPost && editContentRef.current) {
            editContentRef.current.innerHTML = editingPost.content;
        }
    }, [editingId, editingPost]);

    function makeSlug(value: string): string {
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

            // Move caret after inserted node
            sel.removeAllRanges();
            const newRange = document.createRange();
            newRange.setStartAfter(span);
            newRange.collapse(true);
            sel.addRange(newRange);
        } catch (e) {
            // Fallback: try execCommand insertHTML
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
           