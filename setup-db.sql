-- Create Post table for the personal blog
CREATE TABLE IF NOT EXISTS "post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS "post_slug_idx" ON "post"("slug");

-- Insert sample posts
INSERT INTO "post" ("id", "title", "slug", "excerpt", "content", "date", "createdAt", "updatedAt") 
VALUES 
  ('sample1', 'Welcome to My Blog', 'welcome-to-my-blog', 'A minimalist personal blog', '<h2>Welcome</h2><p>This is your first post.</p>', NOW(), NOW(), NOW()),
  ('sample2', 'Second Post', 'second-post', 'Another sample post', '<h2>Another Post</h2><p>Create and manage posts easily.</p>', NOW(), NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Verify
SELECT COUNT(*) as post_count FROM "post";
