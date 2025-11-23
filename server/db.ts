import fs from 'fs/promises';
import path from 'path';

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
};

const dbDir = path.resolve(__dirname, 'data');
const dbFile = path.join(dbDir, 'posts.json');

async function ensureDb() {
  try {
    await fs.mkdir(dbDir, { recursive: true });
    await fs.access(dbFile);
  } catch (err) {
    // create with empty array
    await fs.writeFile(dbFile, JSON.stringify([], null, 2), 'utf8');
  }
}

export async function readPosts(): Promise<Post[]> {
  await ensureDb();
  const raw = await fs.readFile(dbFile, 'utf8');
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

export async function writePosts(posts: Post[]): Promise<void> {
  await ensureDb();
  await fs.writeFile(dbFile, JSON.stringify(posts, null, 2), 'utf8');
}
