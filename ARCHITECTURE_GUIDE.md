# Portfolio, CMS, Database & Block Editor — Step-by-Step Engineering Guide

This guide documents the complete architecture, component breakdown, technology choices, alternatives considered, and step-by-step implementation of both:
1. **`portfolio-react`** (`d:\antigravity-projects\portfolio-react`) — Full-stack React + TypeScript portfolio, Tracklist, CMS, PostgreSQL/Prisma backend, S3 upload service, and Editor.js workspace.
2. **`nextgen-block-editor`** (`d:\antigravity-projects\nextgen-editor`) — The extracted, standalone npm-publishable block editor and renderer library.

---

## 1. Technology Choices & Tradeoffs

| Layer | Chosen Technology | Why It Was Chosen | Alternatives & Why Not |
| :--- | :--- | :--- | :--- |
| **Build Tool** | **Vite 8** (`@vitejs/plugin-react`) | Near-instant HMR, zero-config TypeScript bundling, easy `configureServer` middleware for dev APIs (`/api/fetchUrl`, `/api/gifs`), and simple `/api` proxying. | **Next.js**: Overkill when migrating a client-side static portfolio + localStorage CMS; Vite keeps client/server separation explicit. |
| **UI & Language** | **React 19 + TypeScript** | Strict typing across CMS schemas, Editor.js block data, and API payloads; modular component reuse across Index, CMS, and Editor. | **Vanilla JS**: Hard to scale once CMS forms, live preview, and 20+ custom editor blocks were added. |
| **Routing** | **React Router v7** (`react-router-dom`) | Clean RESTful routes (`/`, `/writing/:slug`, `/tracklist`, `/cms/:section`, `/cms/writing/edit/:id`) plus legacy `.html` / `#hash` redirects. | **Hash-only routing**: Doesn't support clean URLs or deep-linking CMS sections cleanly. |
| **Rich Text Editor** | **Editor.js** (`@editorjs/editorjs` + plugins) | Block-based JSON output (`{ blocks: [...] }`) instead of raw HTML blobs, making it trivial to store in Postgres `Json` columns and render safely with custom interactive React/DOM hooks. | **TipTap / ProseMirror**: Great for inline-heavy docs, but requires much more boilerplate to build self-contained structured blocks (Bento grids, Before/After sliders, Stats rows, Timeline). |
| **Animations** | **`motion`** (`motion/react`) | Declarative React spring/exit animations (`AnimatePresence`, `motion.div`) for the avatar hover, accordion chevrons, project cards, and `SaveToast`. | **Raw CSS keyframes**: Harder to coordinate mount/unmount exit animations like `SaveToast`. |
| **ORM & Database** | **Prisma 7 + PostgreSQL** (`@prisma/adapter-pg`, `pg`) | Type-safe relational + `Json` schema (`SiteConfig`, `ListShelf`, `ListItem`, `Project`, `Post`, `Photo`, `MediaAsset`) with transactional sync and seed script. | **Raw SQL / Knex**: No auto-generated TypeScript types; manual migration management. |
| **API & Uploads** | **Express 5 + Multer + `@aws-sdk/client-s3`** | Lightweight REST API (`/api/cms`, `/api/upload`, `/api/fetchUrl`, `/api/gifs`) supporting any S3-compatible bucket (AWS S3, Cloudflare R2, MinIO, Supabase Storage). | **Direct client-to-S3**: Requires managing presigned URL CORS and exposes bucket structure on the client. |
| **Library Bundler** | **`tsup`** (for `nextgen-block-editor`) | Outputs ESM (`dist/index.js`), CJS (`dist/index.cjs`), and TypeScript declarations (`dist/index.d.ts`) in one command. | **Raw `tsc`**: Doesn't bundle or emit dual ESM/CJS cleanly with CSS bundling. |

---

## 2. Step-by-Step Build Architecture

### Step 1: Scaffolding & CSS Variable Design (`src/styles/`)
Instead of rewriting every pixel from scratch with Tailwind, we preserved the exact design tokens using CSS custom properties on `:root`:
- `--bg`, `--surface`, `--ink`, `--soft`, `--mute`, `--line`, `--accent`, `--accent-ink`, `--tint`, `--serif` / `--mono`.
- **Why CSS Variables?** Setting `data-theme="catppuccin-mocha"` (or `light`, `dark`, `catppuccin-latte`, `catppuccin-frappe`, `catppuccin-macchiato`) on `<html>` (`:root`) instantly re-themes the Portfolio Index, Tracklist, CMS Dashboard, and Editor.js workspace—including popovers, alerts, and link cards—without duplicating component styles.
- **Style Scoping**: Because `cms.css` and `portfolio.css` originally both styled `body`, `nav`, `input`, and `textarea`, we scoped CMS rules under `.cms-page` and editor rules under `.editor-page` so importing all stylesheets globally in `src/main.tsx` causes zero collisions.

### Step 2: Shared State & Dual Persistence (`src/context/CmsContext.tsx`)
`CmsContext` is the single source of truth for all site data (`settings`, `profile`, `about`, `work`, `skills`, `lists`, `posts`, `projects`, `photos`).

**How loading works (`useEffect` on mount):**
1. Fetches `/api/cms` (PostgreSQL) and `/cms/d0.json` (static default fallback) + `/cms/preview-template.html` in parallel.
2. If `/api/cms` succeeds, it uses the database data and mirrors it into `localStorage` (`portfolio-cms-v1`).
3. If the API server is offline, it falls back to `localStorage`, then `/cms/d0.json`.

**How saving works (`updateData`):**
1. Updates React state immediately so the UI feels instant.
2. Debounces (350ms, or immediate when `immediate = true`) a write to `localStorage` and `PUT /api/cms`.
3. Updates `saveStatus` (`Saving…`, `Saved to DB`, `Failed to save to DB (saved locally)`, or `Saved locally (DB offline)`), which drives both the CMS header status and the global bottom-right `<SaveToast />` (`src/components/common/SaveToast.tsx`).

**Why this dual pattern?** You can run `npm run dev` (frontend only) or `npm run dev:all` (frontend + Postgres API) and never lose edits either way.

### Step 3: Portfolio Index & Tracklist (`src/pages/` & `src/components/portfolio/`)
- **`PortfolioPage.tsx`**: Reads `slug` from `/writing/:slug` (and redirects legacy `#post-slug` hashes). Renders:
  - `HeroHeader.tsx`: Cover image, static layered `.waves` SVG, theme toggle button, circular `#pfp` inside `.pfp-wrap` (`aspect-ratio: 1/1`, `overflow: hidden`), stats, bio, and `SocialLinks.tsx`.
  - `AccordionSection.tsx`: Shared collapsible wrapper with `motion.svg` chevron rotation.
  - `AboutSection.tsx`, `WorkSection.tsx`, `SkillsSection.tsx`, `ListsSection.tsx` (tabbed shelves with interactive `--shift` book spines), `WritingSection.tsx`, `ProjectsSection.tsx`, `PhotographySection.tsx`.
  - `PostArticleView.tsx`: Renders the selected post's `bodyHtml` and attaches `useInteractiveArticle` so interactive blocks work inside the article.
- **`TracklistPage.tsx` + `TrackCard.tsx`**: Flattens all `lists` shelves into filterable poster cards with category pills, status pills (`Want to`, `In progress`, `Completed`, `Paused`), live search, and stats counters.

### Step 4: CMS Dashboard (`src/pages/CmsPage.tsx` & `src/components/cms/`)
- **`CmsSidebar.tsx`**: Section navigation (`/cms/general`, `/cms/profile`, `/cms/about`, `/cms/work`, `/cms/skills`, `/cms/lists`, `/cms/writing`, `/cms/projects`, `/cms/photos`), scaled live preview `<iframe>` (`ResizeObserver` scaling a 1200×760 viewport), and export/import/reset actions.
- **`CmsSectionPanel.tsx`**:
  - **General Settings**: Theme selector (System, Light, Dark, Catppuccin Latte/Frappé/Macchiato/Mocha), Font family selector (`Geist Mono`, `Newsreader`, `Inter`, `JetBrains Mono`, `System UI`), and Accent color swatches + custom picker (with automatic `--accent-ink` luminance contrast calculation in `CmsContext.tsx`).
  - Reusable form primitives: `ImageField.tsx` (uploads to `/api/upload` S3 bucket or falls back to canvas-resized JPEG data URL), `StringListField.tsx`, `ObjectListField.tsx` (inline rows or collapsible `<details>` cards), and `ItemControls.tsx` (move up/down + 2-click armed delete).
- **`FullPreviewModal.tsx`**: Desktop (`100%`) / Mobile (`390px`) iframe preview using `public/cms/preview-template.html`.

### Step 5: PostgreSQL, Prisma 7 & S3 Bucket Backend (`prisma/` & `server/`)
- **Schema (`prisma/schema.prisma`)**:
  - `SiteConfig` (id=1, `settings`, `profile`, `about`, `work`, `skills` as `Json`)
  - `ListShelf` & `ListItem` (1-to-many ordered by `position`)
  - `Project`, `Post` (`bodyData Json?`), `Photo`, and `MediaAsset` (bucket upload audit log)
- **Prisma 7 Adapter (`server/db.ts`)**: Uses `@prisma/adapter-pg` + `pg` (`DATABASE_URL` in `.env` and `prisma.config.ts`).
- **Transaction Timeout Optimization (`server/routes/cms.ts`)**:
  - Remote Postgres (`db.prisma.io`) initially hit Prisma's default `5000ms` interactive transaction timeout (`P2028`) when running 12 sequential queries.
  - Fixed by parallelizing independent `deleteMany()` and `create`/`createMany()` calls with `Promise.all(...)` and setting `{ maxWait: 10000, timeout: 30000 }`.
- **S3 Bucket Uploads (`server/storage.ts` & `server/routes/uploads.ts`)**:
  - `POST /api/upload` uses `multer` (`memoryStorage()`, 15MB limit) -> `@aws-sdk/client-s3` `PutObjectCommand` -> saves `MediaAsset` row in Postgres -> returns `{ url, key }`.
- **Link Preview & GIF Proxies (`server/lib/fetchLinkMetadata.ts`, `server/lib/searchGifs.ts`, `vite.config.ts`)**:
  - `GET /api/fetchUrl?url=...`: Fetches Open Graph `title`, `description`, `og:image` for `@editorjs/link` (with SSRF private-IP blocking).
  - `GET /api/gifs?q=...`: Searches Giphy (if `GIPHY_API_KEY` is set), Tenor v2 (if `TENOR_API_KEY` is set), or Wikimedia Commons `image/gif` (zero-key fallback).
  - Both endpoints are also mounted as Vite `configureServer` middlewares in `vite.config.ts` so they work even when running `npm run dev` without the Express server.

### Step 6: Editor.js Workspace & Custom Blocks (`src/pages/EditorPage.tsx`, `src/components/editor/`)
- **React 19 StrictMode Fix (`EditorCanvas.tsx`)**:
  - React 19 StrictMode mounts, unmounts, and remounts components in dev mode. Because `editor.destroy()` is async (`isReady.then(...)`), a naive `useEffect` would let the first mount's `destroy()` wipe the DOM of the second mount!
  - Solved by chaining mounts/unmounts on `lifecycleRef.current` (`await lifecycleRef.current` before creating a new `EditorJS` instance).
- **Save-on-Navigation & Auto-Save (`EditorPage.tsx`)**:
  - Debounces edits at 650ms and flushes `await savePost()` before navigating back to `/cms/writing`.
- **Toolbox Ordering (`src/components/editor/editorTools.ts`)**:
  - Editor.js renders the `+` / `/` menu in object-key insertion order. Tools are grouped from most frequent (Heading, List, Image, Quote, Code, Link, Horizontal rule, Checklist, Table, Alert) down to specialized blocks (GIF, Before/After, Slides, Spoiler, Drawing, Comment).
- **Custom Blocks & Rendering**:
  - `mediaBlocks.ts`: `/bento` (3 layout presets), `/carousel` (swipeable + captions + dots), `/compare` (draggable split slider), `/gallery` (lightbox with keyboard nav).
  - `layoutTextBlocks.ts`: `/slides` (`---` separator + Present fullscreen), `/tabs`, `/accordion` (mutually exclusive), `/pullquote`.
  - `structuredBlocks.ts`: `/timeline`, `/stats`, `/proscons`, `/cards`, `/badges`, `/tags`.
  - `editorTools.ts`: `/layout` (2 nested `EditorJS` instances), `/toggleh1`–`/toggleh3` (collapsible nested `EditorJS` instances), `/embed` (YouTube/Vimeo/CodePen/Spotify/Figma/Loom URL converter), `/spoiler`, `/alert` (neutral card + colored SVG icon), `/comment` (internal note omitted from output), `@mention` inline tool.
- **Interactive Hydration (`src/hooks/useInteractiveArticle.ts`)**:
  - `blocksToHtml()` generates clean semantic HTML strings (`<div class="editor-carousel">`, `<div class="editor-compare">`, etc.).
  - `useInteractiveArticle(containerRef, html)` attaches event listeners after render for carousels, comparison sliders, lightbox modals, slide decks, tabs, and accordions—used identically in `PostArticleView.tsx` and `PostPreviewModal.tsx`.

### Step 7: Extracting `nextgen-block-editor` (`d:\antigravity-projects\nextgen-editor`)
To turn the editor into a reusable npm package without breaking `portfolio-react`:
1. Created a separate package with `tsup` (`ESM` + `CJS` + `.d.ts`) and `scripts/copy-css.mjs` (`dist/styles.css`).
2. Decoupled `blocksToHtml` and `types.ts` from portfolio-specific CMS types.
3. Wrapped `EditorJS` in `<BlockEditor />` and `blocksToHtml` + `useInteractiveArticle` in `<BlockRenderer />`.
4. Verified with `npm run typecheck` (`tsc --noEmit`) and `npm run build`.

---

## 3. How to Add Your Own Custom Block (DIY Recipe)

1. **Create the Tool Class** in `src/components/editor/blocks/`:
   - Implement `static get toolbox() { return { title: 'My Block', icon: '<svg ...>' }; }`
   - Implement `render(): HTMLElement` (build your inputs/DOM) and `save(): MyBlockData`.
2. **Register it** in `getEditorTools()` inside `editorTools.ts` (at the position you want it in the `/` menu).
3. **Render HTML** for it in `blocksToHtml()` inside `cmsHelpers.ts` (and `public/cms/preview-template.html` if used in CMS live preview).
4. **Style it** in `src/styles/blocks.css` using `--bg`, `--surface`, `--ink`, `--line`, `--accent`.
5. **Add interactivity (if needed)** inside `src/hooks/useInteractiveArticle.ts` with a `cleanups.push(...)` teardown.
