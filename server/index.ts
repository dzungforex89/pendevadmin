require('dotenv').config();
const express = require('express');
const next = require('next');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  errorFormat: 'pretty'
});

let dbConnected = false;

// Test DB connection
prisma.$connect()
  .then(() => {
    dbConnected = true;
    // eslint-disable-next-line no-console
    console.log('✓ Database connected successfully');
  })
  .catch((err: any) => {
    // eslint-disable-next-line no-console
    console.warn('⚠ Database connection failed (app will still run in demo mode):', err.message);
    dbConnected = false;
  });
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const server = express();
  server.use(express.json());

  // List all posts
  server.get('/api/posts', async (req, res) => {
    try {
      if (!dbConnected) {
        return res.status(503).json({ error: 'Database not connected', posts: [] });
      }
      const posts = await prisma.post.findMany({
        orderBy: { date: 'desc' }
      });
      res.json(posts);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('GET /api/posts error:', err);
      res.status(500).json({ error: 'Could not load posts' });
    }
  });

  // Get post by slug
  server.get('/api/posts/:slug', async (req, res) => {
    try {
      if (!dbConnected) {
        return res.status(503).json({ error: 'Database not connected' });
      }
      const post = await prisma.post.findUnique({
        where: { slug: req.params.slug }
      });
      if (!post) return res.status(404).json({ error: 'Not found' });
      res.json(post);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('GET /api/posts/:slug error:', err);
      res.status(500).json({ error: 'Could not load post' });
    }
  });

  // Create a post
  server.post('/api/posts', async (req, res) => {
    try {
      if (!dbConnected) {
        return res.status(503).json({ error: 'Database not connected' });
      }
      const { title, slug, excerpt, content, fontSize } = req.body;
      if (!title || !slug) return res.status(400).json({ error: 'title and slug required' });
      
      const post = await prisma.post.create({
        data: {
          title,
          slug,
          excerpt: excerpt || '',
          content: content || '',
          fontSize: fontSize || '16px'
        }
      });
      res.status(201).json(post);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('POST /api/posts error:', err);
      if (err.code === 'P2002') {
        return res.status(400).json({ error: 'slug already exists' });
      }
      res.status(500).json({ error: 'Could not create post' });
    }
  });

  // Update a post
  server.put('/api/posts/:id', async (req, res) => {
    try {
      if (!dbConnected) {
        return res.status(503).json({ error: 'Database not connected' });
      }
      const post = await prisma.post.update({
        where: { id: req.params.id },
        data: req.body
      });
      res.json(post);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('PUT /api/posts/:id error:', err);
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.status(500).json({ error: 'Could not update post' });
    }
  });

  // Delete a post
  server.delete('/api/posts/:id', async (req, res) => {
    try {
      if (!dbConnected) {
        return res.status(503).json({ error: 'Database not connected' });
      }
      await prisma.post.delete({
        where: { id: req.params.id }
      });
      res.status(204).end();
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('DELETE /api/posts/:id error:', err);
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.status(500).json({ error: 'Could not delete post' });
    }
  });

  // Let Next.js handle everything else
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const port = process.env.PORT || 3001;
  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`> Server listening on http://localhost:${port} — env ${process.env.NODE_ENV}`);
  });
});
