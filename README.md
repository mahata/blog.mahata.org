# blog.mahata.org — Personal Blog & Pages

A modern full-stack blog application built with React, TypeScript, and Vite. Features markdown-based posts with YAML front matter, automatic RSS feed generation, paginated post listing, and comprehensive testing with Playwright and Vitest.

## Features

- **Markdown Blog Posts** — Write posts in Markdown with YAML front matter (title, date)
- **RSS Feed Generation** — Automatically generates `rss.xml` from all posts
- **Paginated Listing** — Home page displays 10 most recent posts per page
- **Individual Post Pages** — Clean rendering of each markdown post with syntax highlighting
- **Component Testing** — Playwright component tests for UI reliability
- **Fast Development** — Vite with SWC for instant HMR and fast builds
- **Type Safe** — Full TypeScript support for confidence in refactoring
- **Code Quality** — oxlint and oxfmt for linting and formatting

## Project Structure

```
├── src/                     # React application source
│   ├── pages/               # Page components (Home)
│   ├── routes/              # Route components (Post page, health check)
│   ├── components/          # Reusable React components
│   ├── utils/               # Utilities (front matter parsing, post loading)
│   ├── main.tsx             # React entry point
│   └── global.css           # Global styles
├── posts/                   # Blog post markdown files
│   └── YYYY-MM-DD-*.md      # Named by date; includes YAML front matter
├── posts-test/              # Test fixtures for post parsing
├── scripts/
│   └── generate-rss.ts      # Reads posts and generates RSS feed
├── public/
│   ├── rss.xml              # Generated RSS feed
│   └── images/              # Static images
├── playwright/              # Component test setup
├── vite.config.ts           # Vite build configuration
├── playwright-ct.config.ts  # Playwright component test configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts

```

## Tech Stack

- **Frontend**: React 19, React Router 7, TypeScript 5.9
- **Build**: Vite with SWC (Fast Refresh)
- **Markdown Processing**: remark, remark-html, remark-frontmatter, remark-extract-frontmatter
- **RSS Generation**: feed package
- **Testing**: Playwright (component & E2E), Vitest
- **Code Quality**: oxlint, oxfmt
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm run dev
```

This runs the Vite dev server with HMR at `http://localhost:5173`.

The `dev` script automatically runs `prebuild` before starting, which generates the RSS feed.

### Building Blog Content

To create a new post:

1. Create a markdown file in `posts/` named `YYYY-MM-DD-slug.md`
2. Add YAML front matter at the top:
   ```yaml
   ---
   title: Your Post Title
   date: 2025-01-28
   ---
   ```
3. Write your markdown content

Posts are automatically:

- Indexed on the home page (paginated, 10 per page)
- Included in the generated RSS feed
- Accessible at `/posts/YYYY-MM-DD-slug`

Run `pnpm run prebuild` after adding posts to regenerate the RSS feed.

## Available Scripts

- `pnpm run dev` — Start development server with HMR
- `pnpm run build` — Build for production (TypeScript check + Vite build)
- `pnpm run prebuild` — Generate RSS feed from posts
- `pnpm run preview` — Preview production build locally
- `pnpm run lint` — Run oxlint
- `pnpm run fmt` — Auto-format with oxfmt
- `pnpm run test` — Run unit tests with Vitest
- `pnpm run test:ct` — Run component tests with Playwright
- `pnpm run test:e2e` — Run E2E tests with Playwright

## Testing

### Component Tests

Located in `src/**/*.ct.spec.tsx`. Run with:

```bash
pnpm run test:ct
```

### Unit Tests

Located in `src/**/*.spec.ts(x)`. Run with:

```bash
pnpm run test
```
