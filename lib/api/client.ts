import axios, { AxiosInstance } from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for authenticated requests
});

// Article API
export const articleApi = {
  // Get articles with optional filters
  getArticles: (limit: number = 6, page: number = 1, topic?: string) => {
    const params: any = { limit, page };
    if (topic) params.topic = topic;
    return apiClient.get('/articles', { params });
  },

  // Get article by slug
  getArticleBySlug: (slug: string) => apiClient.get(`/articles/${slug}`),

  // Get all article slugs
  getAllSlugs: () => apiClient.get('/articles/slugs'),

  // Get article count
  getCount: () => apiClient.get('/articles/count'),

  // Get paginated articles
  getPaginated: (page: number = 1, perPage: number = 10) =>
    apiClient.get('/articles/paginated', { params: { page, perPage } }),

  // Get recent articles
  getRecent: (limit: number = 5) =>
    apiClient.get('/articles/recent', { params: { limit } }),

  // Get all articles
  getAll: () => apiClient.get('/articles/all'),

  // Get articles by topic
  getByTopic: (topic: string, limit?: number) => {
    const params: any = {};
    if (limit) params.limit = limit;
    return apiClient.get(`/articles/topic/${topic}`, { params });
  },

  // Get related articles
  getRelated: (slug: string) => apiClient.get(`/articles/${slug}/related`),
};

// Submission API
export const submissionApi = {
  // Create submission
  create: (data: { userId?: string; ip: string; name: string; email: string; message?: string }) =>
    apiClient.post('/submissions/create', data),

  // Check if can submit
  canSubmit: (data: { userId?: string; ip: string; limit?: number; windowMinutes?: number }) =>
    apiClient.post('/submissions/can-submit', data),

  // Get recent submissions
  getRecent: (ip: string, userId?: string, limit: number = 5) =>
    apiClient.get('/submissions/recent', { params: { ip, userId, limit } }),

  // Get all submissions (admin only)
  getAll: () => apiClient.get('/submissions'),

  // Get submission count (admin only)
  getCount: () => apiClient.get('/submissions/count'),

  // Delete submission (admin only)
  delete: (id: string) => apiClient.delete(`/submissions/${id}`),
};

// Auth API
export const authApi = {
  // Login
  login: (username: string, password: string) =>
    apiClient.post('/auth/login', { username, password }),

  // Logout
  logout: () => apiClient.post('/auth/logout'),

  // Check auth status
  checkAuth: () => apiClient.get('/auth/check'),
};

// Post API (for Admin - CRUD operations)
export const postApi = {
  // Get all posts
  getAll: () => apiClient.get('/posts'),

  // Get post by slug or id
  getBySlug: (slug: string) => apiClient.get(`/posts/${slug}`),

  // Search posts
  search: (query: string) => apiClient.get('/posts/search', { params: { q: query } }),

  // Get related posts
  getRelated: (slug: string) => apiClient.get(`/posts/${slug}/related`),

  // Create post (protected)
  create: (data: any) => apiClient.post('/posts', data),

  // Update post (protected)
  update: (id: string, data: any) => apiClient.put(`/posts/${id}`, data),

  // Delete post (protected)
  delete: (id: string) => apiClient.delete(`/posts/${id}`),
};

export default apiClient;
