# blog.mahata.org — Personal Blog & Pages

A static blog built with [Eleventy](https://www.11ty.dev/) and hosted on GitHub Pages. Posts are Markdown files with YAML front matter. The build outputs plain HTML and CSS with no client-side JavaScript.

## Features

- **Markdown Blog Posts** — Write posts in Markdown with YAML front matter (title, date)
- **Static Output** — Every page is pre-rendered HTML; no JavaScript is shipped to browsers
- **Paginated Listing** — The home page lists 10 posts per page at `/`, `/page/2/`, and so on
- **RSS Feed and Sitemap** — `rss.xml` and `sitemap.xml` are generated at build time
- **Minimal Dependencies** — `@11ty/eleventy` is the only dependency; tests use Node's built-in `node:test`

## Project Structure

```
├── eleventy.config.js       # Eleventy configuration (collections, filters, passthrough copy)
├── lib/
│   └── posts.js             # Pure helpers for slugs, dates, sorting and XML escaping
├── posts/
│   ├── posts.11tydata.js    # Layout and permalinks for posts
│   └── YYYY-MM-DD-*.md      # Blog posts with YAML front matter
├── src/
│   ├── _data/site.js        # Site title, URL and feed metadata
│   ├── _includes/           # Base and post layouts
│   ├── index.njk            # Paginated post list
│   ├── rss.njk              # RSS feed (/rss.xml)
│   ├── sitemap.njk          # Sitemap (/sitemap.xml)
│   ├── feed.njk             # /feed redirect to /rss.xml
│   ├── health.njk           # /health check page
│   ├── 404.njk              # Not-found page
│   └── styles.css           # Site stylesheet
├── public/                  # Static assets copied as-is (logo, images)
├── tests/                   # Unit and build tests (node:test)
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm 10+

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm run dev
```

This starts the Eleventy dev server with live reload at `http://localhost:8080`.

### Writing Posts

1. Create a Markdown file in `posts/` named `YYYY-MM-DD-slug.md`
2. Add YAML front matter at the top:
   ```yaml
   ---
   title: "Your Post Title"
   date: "2025-01-28"
   ---
   ```
3. Write your Markdown content

Posts with both `title` and `date` are:

- Listed on the home page, newest first
- Included in the RSS feed and sitemap
- Published at `/posts/YYYY-MM-DD-slug/`

Posts missing `title` or `date` are skipped. Invalid YAML or an invalid date fails the build with the file name in the error. Raw HTML in Markdown is rendered as text.

`SITE_URL` overrides the absolute URL used in the RSS feed and sitemap (default: `https://blog.mahata.org`).

## Available Scripts

- `pnpm run dev` — Start the Eleventy dev server
- `pnpm run build` — Build the site into `dist/`
- `pnpm test` — Run unit and build tests with `node:test`

## Deployment

The `Test` workflow runs on every push. When it succeeds on `main`, the `Deploy to GitHub Pages` workflow tests and builds that commit again and publishes `dist/` to GitHub Pages.
