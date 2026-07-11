# Rani Andriani Tunggal — Portfolio Website

A production-ready, bilingual (English & Indonesian) portfolio website for **Rani Andriani Tunggal**, Final-Year Biochemistry Student at IPB University.

Built with **Next.js 16** (App Router), **Three.js**, **GSAP**, **Lenis**, **Swiper**, and **Tailwind CSS v4**. Features a stunning 3D DNA helix in the hero, smooth scroll, parallax effects, theme switching (Light/Dark), and a built-in admin panel for dynamic content editing.

---

## ✨ Features

### Landing Page (Single Page)
- 🎨 **Hero** — Animated 3D DNA double-helix (Three.js) with floating particles
- 📊 **About** — Animated stats counter on scroll
- 🎓 **Education** — Glass-morphism card with gradient border
- 💼 **Experience** — Vertical timeline with scroll-triggered reveal (6 positions)
- 🧬 **Skills** — Categorized proficiency bars with category icons
- 🌱 **Featured Project** — Independent Pilot (horticultural therapy)
- 📚 **Publications** — Swiper coverflow carousel
- 🏆 **Awards** — Tilt cards with shine sweep (Vanilla-tilt.js)
- ✉️ **Contact** — mailto + WhatsApp deep link
- 🦶 **Footer** — Subtle social links

### Technical Features
- 🌐 **2 Languages** — English (`/en`) & Indonesian (`/id`) with `next-intl`
- 🌓 **2 Themes** — Light × Green & Dark × Neon Green via CSS variables
- 📜 **Smooth Scroll** — Lenis global smooth scroll
- ✨ **Animations** — GSAP-style fade-up on scroll via Intersection Observer
- 🎯 **Custom Cursor** — Smooth hover effects
- 📱 **Responsive** — Mobile-first, fully responsive
- ♿ **A11y** — `prefers-reduced-motion` respected, semantic HTML
- 🔍 **SEO** — OpenGraph, metadata, locale alternates

### Admin Panel (`/admin`)
- 🔒 **Password-protected** — bcrypt + httpOnly cookie
- 📊 **Dashboard** — Overview with stats for every section
- 🌐 **Bilingual Editing** — Tab EN/ID inside every editor; save once writes both locales
- 🧱 **Drag-to-Reorder** — Built with `@dnd-kit`, with ↑↓ fallback and keyboard support
- 🖼️ **Image Upload** — Direct upload to `public/uploads/<section>/` via `/api/upload` (or paste URL)
- ✅ **Zod Validation** — Server-side schema validation on every write
- 💾 **Atomic Writes** — Temp-file + rename to prevent corruption
- ↩️ **Bilingual Rollback** — If one locale write fails, the other is restored
- ✏️ **CRUD Editors** for:
  - Profile (name, contacts, photo upload, social links)
  - Hero (greeting, scroll label)
  - Bio (short + long description)
  - Education (array of schools w/ achievements + GPA)
  - Experiences (start/end dates, achievements, isCurrent badge, company URL, images)
  - Skills (drag-reorder, category, level)
  - Projects (array w/ image, impact, team, tags, URL)
  - Publications (drag-reorder, authors as tags, abstract)
  - Awards (drag-reorder, rank, issuer)
  - Certifications (drag-reorder, URL, credential ID)
  - Volunteering (drag-reorder, period, category)
  - Footer (copyright, tagline, socials)
- 🔄 **Auto-Revalidate** — Changes appear immediately on the landing page
- 💾 **JSON File Backend** — Server Actions write directly to `content/{locale}.json`

---

## 🌐 Live Site

- 🔗 **Production**: https://raniandriani.vercel.app
- 🔗 **Admin Login**: https://raniandriani.vercel.app/en/admin/login

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
# Open http://localhost:3000
```

### Default Admin Credentials
- **URL**: `http://localhost:3000/en/admin/login`
- **Password**: `admin123` (change in `.env.local` → `ADMIN_PASSWORD`)

---

## 📦 Deploy to Vercel

### Option A: One-Click Deploy
1. Push this repo to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/rani-portfolio.git
   git push -u origin main
   ```
2. Visit [vercel.com/new](https://vercel.com/new) → Import the repo
3. Add environment variables:
   - `ADMIN_PASSWORD` = your strong password
   - `COOKIE_SECRET` = random 32+ character string
4. Click **Deploy**

### Option B: Vercel CLI
```bash
npm i -g vercel
vercel
# Follow prompts
```

### Custom Domain
After deploy, in Vercel dashboard → **Settings** → **Domains** → Add your custom domain.

---

## 🛠️ Tech Stack

| Category | Library |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| i18n | next-intl v4 |
| 3D | Three.js + @react-three/fiber + @react-three/drei |
| Animation | Intersection Observer, CSS transitions |
| Smooth Scroll | Lenis |
| Slider | Swiper.js (Coverflow effect) |
| Card Tilt | Vanilla-tilt.js |
| Icons | Lucide React |
| Auth | bcryptjs + httpOnly cookies |
| Drag-to-Reorder | @dnd-kit/core, @dnd-kit/sortable |
| Validation | Zod |
| Backend | Server Actions + JSON file storage (atomic) |

---

## 📁 Project Structure

```
rani-portfolio/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          # Locale + theme + smooth scroll provider
│   │   ├── page.tsx            # Landing page composition
│   │   └── admin/              # Admin panel
│   │       ├── login/
│   │       └── dashboard/
│   │           ├── profile/
│   │           ├── hero/
│   │           ├── bio/
│   │           ├── education/
│   │           ├── experiences/
│   │           ├── skills/
│   │           ├── projects/
│   │           ├── publications/
│   │           ├── awards/
│   │           ├── certifications/
│   │           ├── volunteering/
│   │           └── footer/
│   ├── api/upload/route.ts       # Image upload endpoint
│   ├── globals.css             # Tailwind + theme variables
├── components/
│   ├── sections/               # All landing page sections
│   ├── three/                  # Three.js DNA helix
│   ├── effects/                # Reusable animation wrappers
│   ├── ui/                     # Navbar, Language switcher
│   └── admin/                  # Admin form components
├── content/
│   ├── en.json                 # English content (editable)
│   └── id.json                 # Indonesian content (editable)
├── messages/
│   ├── en.json                 # UI labels (English)
│   └── id.json                 # UI labels (Indonesian)
├── lib/
│   ├── routing.ts              # next-intl routing config
│   ├── navigation.ts           # Localized Link, useRouter, etc
│   ├── storage/                # Pluggable storage layer
│   │   ├── types.ts            # ContentStorage + UploadStorage interfaces
│   │   ├── fs-content.ts       # Filesystem backend (localhost)
│   │   ├── fs-upload.ts        # Local upload (localhost)
│   │   ├── kv-content.ts       # Vercel KV backend (production)
│   │   ├── blob-upload.ts      # Vercel Blob backend (production)
│   │   ├── github-content.ts   # GitHub Contents API backend (Vercel)
│   │   ├── github-upload.ts    # GitHub-backed image uploads (jsdelivr CDN)
│   │   └── index.ts            # Factory (auto-picks best backend by env vars)
│   ├── content.ts              # Typed section getters
│   ├── schemas.ts              # Zod schemas for every section
│   ├── auth.ts                 # bcrypt + cookie helpers
│   ├── actions.ts              # Server Actions (Zod-validated, bilingual)
│   └── utils.ts
├── proxy.ts                    # i18n + admin auth middleware
├── i18n.ts                     # next-intl config
└── next.config.ts
```

---

## 💾 Storage Backends (Vercel-Compatible)

The admin panel persists content via a pluggable storage layer. Pick **one** backend per environment:

| Backend | Required env vars | Best for |
|---|---|---|
| **GitHub Contents API** (default for Vercel) | `GH_TOKEN` | Zero-setup persistence via repo commits. Images served via jsDelivr CDN. |
| **Vercel KV + Blob** (production-grade) | `KV_REST_API_URL` + `KV_REST_API_TOKEN` + `BLOB_READ_WRITE_TOKEN` | High-throughput, low-latency. Needs Vercel dashboard setup. |
| **Filesystem** (localhost dev) | None | Auto-fallback. JSON files in `content/{locale}.json` + uploads in `public/uploads/`. |

**Priority order** (auto-selected by factory): KV/Blob → GitHub → Filesystem.

**For GitHub backend**, the token needs `repo` scope (use `gh auth token` to get one). Auto-detects repo from `VERCEL_GIT_REPO_*` env vars (set by Vercel) or `GH_REPO_OWNER`/`GH_REPO_NAME`/`GH_REPO_BRANCH`.

**To set env vars on Vercel:**
```bash
vercel env add GH_TOKEN production --token $VERCEL_TOKEN --value "<your-token>"
```

Or via dashboard: https://vercel.com/dashboard → project → Settings → Environment Variables.

---

## ✏️ Editing Content

### Option 1: Via Admin Panel
1. Navigate to `/en/admin/login` (or `/id/admin/login`)
2. Login with password from `.env.local`
3. Edit any section via forms
4. Save → changes appear immediately

### Option 2: Edit JSON Files Directly
Edit `content/en.json` and `content/id.json` for content, or `messages/en.json` and `messages/id.json` for UI labels.

---

## 🎨 Customization

### Theme Colors
Edit CSS variables in `app/globals.css`:
```css
:root {
  --accent: #16a34a;       /* Light theme green */
  --bg-primary: #ffffff;
}

.dark {
  --accent: #4ade80;       /* Dark theme neon green */
  --bg-primary: #0a0f0d;
}
```

### Add New Language
1. Add locale to `lib/routing.ts`:
   ```ts
   locales: ['en', 'id', 'jp'] as const,
   ```
2. Create `messages/jp.json` + `content/jp.json`
3. Add to language switcher in `components/ui/language-switcher.tsx`

---

## 🔐 Security Notes

1. **Change `ADMIN_PASSWORD`** in `.env.local` before deploy
2. **Change `COOKIE_SECRET`** to a random 32+ char string in production
3. **Set environment variables in Vercel dashboard** (not committed to git)
4. **HTTPS only** — Vercel provides automatically

---

## 📝 License

This portfolio is personal work for Rani Andriani Tunggal. Content (text, images, data) belongs to her. Code can be referenced as inspiration for similar projects.

---

## 🙏 Credits

- 3D DNA helix: Custom Three.js implementation
- Icons: [Lucide](https://lucide.dev)
- Fonts: Space Grotesk, Inter, JetBrains Mono via Google Fonts
- Built with ❤️ using Next.js