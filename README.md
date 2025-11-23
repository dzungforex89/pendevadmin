# Minimalist Personal Blog (Next.js 14 + Tailwind + Express + PostgreSQL)

This is a modern minimalist personal blog built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Express custom server, and PostgreSQL database using Prisma ORM.

## Features
- 📝 Minimalist design with Tailwind CSS
- 🎨 Client-side editor with contentEditable for post creation
- 🗄️ PostgreSQL backend with Prisma ORM
- 🔄 RESTful API for CRUD operations
- ⚡ Next.js 14 with App Router
- 🛡️ TypeScript throughout

## Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (self-hosted or cloud-hosted)

### Installation

1. **Install dependencies:**
```powershell
npm install
```

2. **Configure environment variables:**

Copy `.env.example` to `.env.local` and update with your PostgreSQL credentials:

```powershell
cp .env.example .env.local
```

Edit `.env.local`:
```env
# PostgreSQL connection string (update with your DB host, port, user, password)
DATABASE_URL="postgresql://username:password@your-domain.com:5432/personal_blog"
NODE_ENV="development"
```

### PostgreSQL Setup

**Connection string format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Example for cloud-hosted PostgreSQL:**
```env
DATABASE_URL="postgresql://admin:SecurePass123@db.example.com:5432/blog_db"
```

### Database Schema (Prisma)

The database includes a `Post` table with the following columns:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (CUID) | PRIMARY KEY | Unique post identifier (auto-generated) |
| `title` | String | NOT NULL | Post title |
| `slug` | String | UNIQUE, NOT NULL | URL-friendly post identifier |
| `excerpt` | String | NOT NULL | Short post summary |
| `content` | String | NOT NULL | Post body (HTML) |
| `date` | DateTime | DEFAULT now() | Post publication date |
| `createdAt` | DateTime | DEFAULT now() | Record creation timestamp |
| `updatedAt` | DateTime | AUTO | Last update timestamp |

An index is created on `slug` for faster lookups.

### Initialize the Database

Run Prisma to create the schema:

```powershell
npx prisma db push
```

This will create the `post` table in your PostgreSQL database.

### Start Development Server

```powershell
npm run dev
```

The app will run on `http://localhost:3001`

## Usage

- **Public Blog:** http://localhost:3001
- **Admin Dashboard:** http://localhost:3001/admin
- **API Endpoints:**
  - `GET /api/posts` — List all posts (sorted by date descending)
  - `GET /api/posts/:slug` — Get a specific post by slug
  - `POST /api/posts` — Create a new post
  - `PUT /api/posts/:id` — Update a post
  - `DELETE /api/posts/:id` — Delete a post

## Admin Dashboard

The admin page (`/admin`) provides:
- **Title, Slug, Excerpt** input fields
- **contentEditable rich-text editor** for post content (HTML)
- **Save button** to persist posts to PostgreSQL
- **Post list** showing all published posts

### Creating a Post

1. Navigate to http://localhost:3001/admin
2. Fill in: Title, Slug (auto-generated if empty), Excerpt
3. Type or paste content in the editor
4. Click "Save Post"
5. The post appears on the home page and admin list

## Prisma Scripts

```powershell
# Create or update database schema (run after editing schema.prisma)
npm run prisma:db:push

# Open Prisma Studio (GUI for database management)
npx prisma studio

# Generate Prisma client (auto-run on install)
npm run prisma:generate
```

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Ensure PostgreSQL is accessible from your server
3. Run `npm run build` to build Next.js
4. Start with `npm run dev:server` or deploy via Node hosting (Vercel, Railway, Render, etc.)

## Environment Variables Required

| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | PostgreSQL connection string |
| `NODE_ENV` | `development` or `production` | App environment |

## Troubleshooting

**"Could not connect to database"**
- Check your `DATABASE_URL` is correct
- Verify PostgreSQL is running and accessible
- Ensure firewall allows connections on port 5432 (or your custom port)

**"slug already exists"**
- Slug must be unique. Try a different slug value.

**Prisma client issues**
- Run `npm run prisma:generate` to regenerate the Prisma client
