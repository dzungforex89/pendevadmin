-- Add relatedArticles column to post table
-- Data type: JSON (to store array of post IDs: ["id1", "id2", "id3"])
-- NULL: allows NULL because relatedArticles is optional

ALTER TABLE "post" 
ADD COLUMN IF NOT EXISTS "relatedArticles" JSON;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'post' AND column_name = 'relatedArticles';
