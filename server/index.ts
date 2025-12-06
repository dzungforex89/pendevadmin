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
  // Tăng limit để có thể nhận base64 string lớn (ảnh thumbnail có thể lên đến vài MB)
  server.use(express.json({ limit: '50mb' }));
  server.use(express.urlencoded({ limit: '50mb', extended: true }));

  // List all posts
  server.get('/api/posts', async (req, res) => {
    try {
      if (!dbConnected) {
        return res.status(503).json({ error: 'Database not connected', posts: [] });
      }
      const posts = await prisma.post.findMany({
        orderBy: [
          { pinned: 'desc' },
          { date: 'desc' }
        ]
      });
      res.json(posts);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('GET /api/posts error:', err);
      
      // Handle enum type mismatch - try raw query to convert enum strings
      if (err.code === 'P2032' && err.meta?.field === 'topic') {
        try {
          const rawPosts = await prisma.$queryRaw`
            SELECT id, title, slug, excerpt, content, date, "createdAt", "updatedAt", 
                   "fontSize", thumbnail, pinned,
                   CASE 
                     WHEN topic::text IN ('TECHNOLOGY', 'HEALTH', 'LIFESTYLE', 'EDUCATION', 'ENTERTAINMENT') 
                     THEN topic::text
                     ELSE NULL
                   END as topic
            FROM post
            ORDER BY pinned DESC, date DESC
          `;
          res.json(rawPosts);
          return;
        } catch (rawErr: any) {
          // eslint-disable-next-line no-console
          console.error('Raw query also failed:', rawErr);
        }
      }
      
      res.status(500).json({ error: 'Could not load posts', posts: [] });
    }
  });

  // Get post by slug or id
  server.get('/api/posts/:slug', async (req, res) => {
    try {
      if (!dbConnected) {
        return res.status(503).json({ error: 'Database not connected' });
      }
      // Try to find by slug first, then by id
      let post = await prisma.post.findUnique({
        where: { slug: req.params.slug }
      });
      if (!post) {
        post = await prisma.post.findUnique({
          where: { id: req.params.slug }
        });
      }
      if (!post) return res.status(404).json({ error: 'Not found' });
      res.json(post);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('GET /api/posts/:slug error:', err);
      res.status(500).json({ error: 'Could not load post' });
    }
  });

  // Search posts by title (for autocomplete)
  // Flow: Frontend -> Debounce -> API Call -> Prisma Query -> Response
  server.get('/api/posts/search', async (req, res) => {
    try {
      if (!dbConnected) {
        return res.status(503).json({ error: 'Database not connected' });
      }
      
      // Step 1: Get query parameter
      const query = req.query.q as string;
      if (!query || query.trim().length === 0) {
        return res.json([]);
      }
      
      const searchQuery = query.trim();
      
      // Step 2: Prisma query - Find posts with title containing the keyword
      const posts = await prisma.post.findMany({
        where: {
          title: {
            contains: searchQuery,
            mode: 'insensitive' // Case-insensitive search
          }
        },
        take: 10, // Limit to 10 results
        orderBy: { date: 'desc' }, // Latest first
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          thumbnail: true
        }
      });
      
      // Step 3: Return response (ID, Title, Thumbnail, Slug, Excerpt)
      res.json(posts);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('GET /api/posts/search error:', err);
      res.status(500).json({ error: 'Could not search posts' });
    }
  });

  // Get related posts (3 posts excluding current)
  server.get('/api/posts/:slug/related', async (req, res) => {
    try {
      if (!dbConnected) {
        return res.status(503).json({ error: 'Database not connected', posts: [] });
      }
      const currentPost = await prisma.post.findUnique({
        where: { slug: req.params.slug },
        select: { topic: true }
      });
      
      // Try to get posts with same topic first, then fallback to latest posts
      let relatedPosts;
      if (currentPost?.topic) {
        relatedPosts = await prisma.post.findMany({
          where: {
            slug: { not: req.params.slug },
            topic: currentPost.topic
          },
          orderBy: [
            { pinned: 'desc' },
            { date: 'desc' }
          ],
          take: 3
        });
      }
      
      // If not enough posts with same topic, fill with latest posts
      if (!relatedPosts || relatedPosts.length < 3) {
        const additionalPosts = await prisma.post.findMany({
          where: {
            slug: { not: req.params.slug },
            ...(currentPost?.topic ? { topic: { not: currentPost.topic } } : {})
          },
          orderBy: [
            { pinned: 'desc' },
            { date: 'desc' }
          ],
          take: 3 - (relatedPosts?.length || 0)
        });
        relatedPosts = [...(relatedPosts || []), ...additionalPosts].slice(0, 3);
      }
      
      res.json(relatedPosts || []);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('GET /api/posts/:slug/related error:', err);
      res.status(500).json({ error: 'Could not load related posts', posts: [] });
    }
  });

  // Create a post
  server.post('/api/posts', async (req, res) => {
    try {
      if (!dbConnected) {
        return res.status(503).json({ error: 'Database not connected' });
      }
      const { title, slug, topic, excerpt, content, thumbnail, pinned, fontSize, relatedArticles } = req.body;
      if (!title || !slug) return res.status(400).json({ error: 'title and slug required' });
      
      // Validate and convert topic if provided
      // Support both enum values and numeric values (1-5) for backward compatibility
      const validTopics = ['TECHNOLOGY', 'HEALTH', 'LIFESTYLE', 'EDUCATION', 'ENTERTAINMENT'];
      const topicEnumMap: { [key: number]: string } = {
        1: 'TECHNOLOGY',
        2: 'HEALTH',
        3: 'LIFESTYLE',
        4: 'EDUCATION',
        5: 'ENTERTAINMENT'
      };
      
      let topicValue: string | null = null;
      if (topic) {
        if (typeof topic === 'number' || (typeof topic === 'string' && /^\d+$/.test(topic))) {
          // Numeric topic (1-5) - convert to enum
          const numTopic = typeof topic === 'number' ? topic : parseInt(topic);
          topicValue = (numTopic >= 1 && numTopic <= 5) ? topicEnumMap[numTopic] : null;
        } else if (typeof topic === 'string' && validTopics.includes(topic)) {
          // Already an enum value
          topicValue = topic;
        }
      }

      // Validate relatedArticles - should be array of strings (post IDs) or null
      let relatedArticlesValue: any = null;
      if (relatedArticles !== undefined && relatedArticles !== null) {
        if (Array.isArray(relatedArticles) && relatedArticles.length > 0) {
          // Validate that all items are strings
          if (relatedArticles.every((id: any) => typeof id === 'string')) {
            relatedArticlesValue = relatedArticles;
          }
        }
      }
      
      const post = await prisma.post.create({
        data: {
          title,
          slug,
          topic: topicValue as any,
          excerpt: excerpt || '',
          content: content || '',
          thumbnail: thumbnail || null,
          pinned: pinned || false,
          fontSize: fontSize || '16px',
          relatedArticles: relatedArticlesValue
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
      const { title, topic, excerpt, content, thumbnail, pinned, fontSize, relatedArticles } = req.body;
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (topic !== undefined) {
        // Validate and convert topic if provided
        // Support both enum values and numeric values (1-5) for backward compatibility
        const validTopics = ['TECHNOLOGY', 'HEALTH', 'LIFESTYLE', 'EDUCATION', 'ENTERTAINMENT'];
        const topicEnumMap: { [key: number]: string } = {
          1: 'TECHNOLOGY',
          2: 'HEALTH',
          3: 'LIFESTYLE',
          4: 'EDUCATION',
          5: 'ENTERTAINMENT'
        };
        
        let topicValue: string | null = null;
        if (topic) {
          if (typeof topic === 'number' || (typeof topic === 'string' && /^\d+$/.test(topic))) {
            // Numeric topic (1-5) - convert to enum
            const numTopic = typeof topic === 'number' ? topic : parseInt(topic);
            topicValue = (numTopic >= 1 && numTopic <= 5) ? topicEnumMap[numTopic] : null;
          } else if (typeof topic === 'string' && validTopics.includes(topic)) {
            // Already an enum value
            topicValue = topic;
          }
        }
        updateData.topic = topicValue as any;
      }
      if (excerpt !== undefined) updateData.excerpt = excerpt;
      if (content !== undefined) updateData.content = content;
      if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
      if (pinned !== undefined) updateData.pinned = pinned;
      if (fontSize !== undefined) updateData.fontSize = fontSize;
      if (relatedArticles !== undefined) {
        // Validate relatedArticles - should be array of strings (post IDs) or null
        if (relatedArticles === null) {
          updateData.relatedArticles = null;
        } else if (Array.isArray(relatedArticles) && relatedArticles.length > 0) {
          // Validate that all items are strings
          if (relatedArticles.every((id: any) => typeof id === 'string')) {
            updateData.relatedArticles = relatedArticles;
          }
        } else if (Array.isArray(relatedArticles) && relatedArticles.length === 0) {
          updateData.relatedArticles = null;
        }
      }
      
      const post = await prisma.post.update({
        where: { id: req.params.id },
        data: updateData
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
