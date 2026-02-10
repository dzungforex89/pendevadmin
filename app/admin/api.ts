export async function fetchPosts(): Promise<Post[]> {
    try {
        const response = await fetch('/api/posts');
        if (!response.ok) throw new Error('Failed to fetch posts');
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function createPost(post: { title: string; slug?: string; excerpt: string; content: string }): Promise<Post> {
    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(post),
        });
        if (!response.ok) throw new Error('Failed to create post');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function updatePost(id: string, content: string): Promise<Post> {
    try {
        const response = await fetch(`/api/posts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        });
        if (!response.ok) throw new Error('Failed to update post');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export function prefetchPost(slug: string): void {
    try {
        if (typeof window === 'undefined') return;

        (window as any).__POST_CACHE = (window as any).__POST_CACHE || {};
        const cache = (window as any).__POST_CACHE;

        if (cache[slug]) return; // already cached or fetching

        cache[slug] = fetch(`/api/posts/${slug}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => { cache[slug] = d; return d; })
            .catch(() => { cache[slug] = null; });
    } catch (e) {
        // noop
    }
}