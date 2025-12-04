# 10SAT Console - Modern Blog Platform

A feature-rich, modern blog platform built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Express custom server, and PostgreSQL database using Prisma ORM. Features a beautiful oklch color palette, rich text editing, image management, and comprehensive post management.

## ✨ Features

### Core Features
- 📝 **Rich Text Editor** - Full-featured contentEditable editor with sticky toolbar
- 🖼️ **Thumbnail Management** - Drag & drop, image cropping, and base64 storage
- 📌 **Pin/Unpin Posts** - Pin important posts to the top
- 🔍 **Search & Filter** - Search by title and filter pinned posts
- 📄 **Pagination** - Navigate through posts efficiently
- ✅ **Bulk Operations** - Select and delete multiple posts
- 🎨 **Modern UI** - Beautiful oklch color palette throughout
- 📱 **Responsive Design** - Works seamlessly on all devices

### Rich Text Editor Features
- **Font Controls**: Font size (12px-48px), font family selection
- **Text Formatting**: Bold, Italic, Underline
- **Text Styling**: Text color, highlight/background color
- **Layout**: Line spacing adjustment
- **Links**: Insert and remove hyperlinks
- **Tables**: Create and edit tables
- **Images**: Drag & drop images directly into content
- **Keyboard Shortcuts**: 
  - `Ctrl/Cmd + B` - Bold
  - `Ctrl/Cmd + +` - Increase font size
  - `Ctrl/Cmd + -` - Decrease font size

### Admin Dashboard Features
- **Post Creation**: Create posts with title, topic (1-5), slug, excerpt, thumbnail, and rich content
- **Post Editing**: Full-featured edit modal with all editor capabilities
- **Post Management**: View, edit, pin/unpin, and delete posts
- **Thumbnail Editor**: 
  - Drag & drop images
  - Click to select from file system
  - Paste from clipboard (Ctrl+V)
  - Image cropping with preview
  - Base64 storage in database
- **Sticky Toolbar**: Editor toolbar that follows scroll from title to content end
- **Collapsible Post List**: Show/hide post list in admin panel

### Home Page Features
- **3-Column Grid Layout**: Display posts in a responsive grid
- **Post Cards**: Show thumbnail, title, and excerpt
- **Post Actions**: 
  - "More" button (3 dots) on hover
  - Select, Edit, Pin/Unpin options
- **Search Bar**: Search posts by title
- **Pinned Filter**: Show only pinned posts
- **Pagination**: Navigate through pages (9 posts per page)
- **Bulk Selection**: Select multiple posts with checkboxes (visible on hover)
- **Bulk Delete**: Delete selected posts at once

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom oklch color palette
- **Backend**: Express.js custom server
- **Database**: PostgreSQL with Prisma ORM
- **Image Processing**: react-image-crop
- **Build Tool**: tsx (TypeScript execution)

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (self-hosted or cloud-hosted)
- npm or yarn package manager

## 🚀 Installation

### 1. Install Dependencies

```powershell
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and update with your PostgreSQL credentials:

```powershell
cp .env.example .env.local
```

Edit `.env.local`:
```env
# PostgreSQL connection string
DATABASE_URL="postgresql://username:password@host:5432/database_name"
NODE_ENV="development"
NEXT_PUBLIC_SITE_URL="http://localhost:3001"
```

### 3. Database Setup

**Connection string format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Example:**
```env
DATABASE_URL="postgresql://admin:SecurePass123@db.example.com:5432/blog_db"
```

### 4. Initialize Database Schema

Run Prisma to create the database schema:

```powershell
npm run prisma:push
```

This will create the `post` table with the following structure:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (CUID) | PRIMARY KEY | Unique post identifier |
| `title` | String | NOT NULL | Post title (HTML supported) |
| `slug` | String | UNIQUE, NOT NULL | URL-friendly identifier |
| `topic` | Int | NULLABLE | Topic number (1-5) |
| `excerpt` | String | NOT NULL | Short summary (HTML supported) |
| `content` | String | NOT NULL | Post body (HTML) |
| `thumbnail` | String | NULLABLE | Base64 encoded image |
| `pinned` | Boolean | DEFAULT false | Pin status (indexed) |
| `fontSize` | String | DEFAULT "16px" | Default font size |
| `date` | DateTime | DEFAULT now() | Publication date |
| `createdAt` | DateTime | DEFAULT now() | Creation timestamp |
| `updatedAt` | DateTime | AUTO | Last update timestamp |

### 5. Generate Prisma Client

```powershell
npm run prisma:generate
```

### 6. Start Development Server

```powershell
npm run dev
```

The application will run on `http://localhost:3001`

## 📖 Usage

### Access Points

- **Public Blog**: http://localhost:3001
- **Admin Dashboard**: http://localhost:3001/admin
- **Post Detail**: http://localhost:3001/posts/[slug]

### Creating a Post

1. Navigate to http://localhost:3001/admin
2. Fill in the form:
   - **Title**: Post title (supports rich text formatting)
   - **Topic**: Select a topic number (1-5)
   - **Slug**: URL-friendly identifier (auto-generated from title if empty)
   - **Excerpt**: Short summary (supports rich text)
   - **Thumbnail**: Upload, crop, or paste an image
   - **Content**: Main post content (supports rich text, images, tables, links)
3. Use the sticky editor toolbar to format text
4. Click "Post" to save

### Editing a Post

**From Admin Dashboard:**
1. Click "Show Posts" to view all posts
2. Click the edit icon next to a post
3. Edit in the modal with full editor capabilities
4. Click "Save Changes"

**From Home Page:**
1. Hover over a post card
2. Click the "More" button (3 dots)
3. Select "Edit"
4. Edit in the modal

**From Post Detail Page:**
1. Click "Edit Post" button
2. Edit in the modal

### Managing Posts

**Pin/Unpin:**
- From home page: Hover over post → More → Pin/Unpin
- Pinned posts appear first in the list

**Delete Posts:**
- From home page: Select posts (checkbox appears on hover) → Click "Delete Selected"
- Or use individual delete from More menu

**Search:**
- Use the search bar on the home page to filter by title
- Toggle "Show Pinned Only" to filter pinned posts

### Rich Text Editing

The sticky editor toolbar appears when you focus on Title, Excerpt, or Content fields. It includes:

- **Font Size**: Dropdown (12px-48px) or use `Ctrl/Cmd + +/-`
- **Font Family**: Arial, Times New Roman, Courier New, etc.
- **Formatting**: Bold, Italic, Underline buttons
- **Text Color**: Color picker for text
- **Highlight**: Background color picker
- **Line Spacing**: Adjust paragraph spacing
- **Links**: Insert/edit hyperlinks
- **Tables**: Create and edit tables
- **Unlink**: Remove hyperlinks

**Keyboard Shortcuts:**
- `Ctrl/Cmd + B`: Bold
- `Ctrl/Cmd + +`: Increase font size
- `Ctrl/Cmd + -`: Decrease font size

### Thumbnail Management

1. **Upload Methods:**
   - Drag & drop image into thumbnail area
   - Click to select from file system
   - Paste from clipboard (Ctrl+V)

2. **Crop Image:**
   - After uploading, adjust crop area
   - Click "Apply" to confirm
   - Click "Edit Crop" to re-enter crop mode

3. **Storage:**
   - Thumbnails are stored as base64 strings in the database
   - Default thumbnail is used if none is provided

## 🎨 Color Palette

The application uses a custom oklch color palette:

```css
--secondary: oklch(0.3036 0.1223 288);  /* Purple */
--primary: oklch(0.5638 0.2255 24.24);  /* Red */
--foreground: oklch(0.22 0.04 260);     /* Navy */
```

These colors are applied throughout the UI for a cohesive, modern look.

## 🔌 API Endpoints

### Posts

- `GET /api/posts` - List all posts (sorted by pinned first, then date)
- `GET /api/posts/:slug` - Get a specific post by slug
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post

### Request/Response Examples

**Create Post:**
```json
POST /api/posts
{
  "title": "<h1>My Post Title</h1>",
  "slug": "my-post-title",
  "topic": 1,
  "excerpt": "<p>Short summary</p>",
  "content": "<p>Full content...</p>",
  "thumbnail": "data:image/png;base64,..."
}
```

**Update Post:**
```json
PUT /api/posts/:id
{
  "title": "<h1>Updated Title</h1>",
  "excerpt": "<p>Updated excerpt</p>",
  "content": "<p>Updated content...</p>",
  "thumbnail": "data:image/png;base64,..."
}
```

## 📁 Project Structure

```
chatbot-s-blog/
├── app/
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout
│   │   ├── page.tsx            # Admin page (renders AdminBackend)
│   │   ├── admin-backend.tsx   # Server component (fetches posts)
│   │   └── admin-frontend.tsx  # Client component (UI & logic)
│   ├── home-backend.tsx        # Server component (fetches posts)
│   ├── home-frontend.tsx       # Client component (home page UI)
│   ├── posts/
│   │   └── [slug]/
│   │       └── page.tsx        # Post detail page
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Root page (renders HomeBackend)
├── components/
│   ├── Header.tsx              # Global header
│   ├── Footer.tsx              # Global footer
│   ├── PostCard.tsx            # Post card component
│   ├── Pagination.tsx          # Pagination component
│   ├── StickyEditorToolbar.tsx # Rich text editor toolbar
│   └── ThumbnailEditor.tsx     # Thumbnail upload/crop component
├── constants/
│   └── defaultThumbnail.ts     # Default thumbnail base64
├── prisma/
│   └── schema.prisma           # Database schema
├── server/
│   └── index.ts                # Express server & API routes
├── styles/
│   ├── globals.css             # Global styles & color variables
│   └── admin.css               # Admin-specific styles
└── package.json
```

## 🛠️ Scripts

```powershell
# Development
npm run dev              # Start Express server (runs Next.js + Express)
npm run dev:next        # Start Next.js dev server only
npm run dev:server      # Start Express server only

# Build
npm run build           # Build Next.js for production

# Database
npm run prisma:generate # Generate Prisma client
npm run prisma:push     # Push schema to database
npm run prisma:migrate  # Create migration

# Other
npm run lint            # Run ESLint
```

## 🚀 Production Deployment

1. Set environment variables:
   ```env
   NODE_ENV=production
   DATABASE_URL="your-production-database-url"
   NEXT_PUBLIC_SITE_URL="https://your-domain.com"
   ```

2. Build the application:
   ```powershell
   npm run build
   ```

3. Start the server:
   ```powershell
   npm start
   ```

4. Or deploy via:
   - **Vercel**: Automatic Next.js deployment
   - **Railway**: Full-stack deployment
   - **Render**: Node.js deployment
   - **DigitalOcean**: App Platform

## 🐛 Troubleshooting

### "Could not connect to database"
- Check your `DATABASE_URL` is correct
- Verify PostgreSQL is running and accessible
- Ensure firewall allows connections on port 5432

### "slug already exists"
- Slug must be unique. Try a different slug value or let it auto-generate from title.

### "PayloadTooLargeError: request entity too large"
- This is already handled (limit set to 50mb for base64 thumbnails)
- If issues persist, check Express body parser configuration in `server/index.ts`

### "Prisma client issues"
- Run `npm run prisma:generate` to regenerate the Prisma client
- Ensure database schema is up to date with `npm run prisma:push`

### Module resolution errors with special characters in path
- The project uses `tsx` instead of `ts-node-dev` to handle paths with special characters
- Dynamic imports are used for components that may have SSR issues

## 📝 Notes

- **Image Storage**: Thumbnails are stored as base64 strings in the database. For production with many images, consider using cloud storage (S3, Cloudinary) and storing URLs instead.
- **Rich Text**: Content is stored as HTML. The editor uses `contentEditable` and `document.execCommand` for formatting.
- **Pagination**: Home page displays 9 posts per page by default.
- **Color Palette**: The oklch color system provides better color consistency and perceptual uniformity compared to RGB/HSL.

## 📄 License

This project is private and proprietary.

## 👤 Author

10SAT Console Development Team

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
