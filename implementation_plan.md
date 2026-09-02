# Design Implementation Plan: OpenAbility Modern Dashboard UI Redesign

This plan details the visual UI redesign of the OpenAbility candidate dashboard into a modern, breathable, human-designed career platform, preserving 100% of existing functionality, dynamic authentication data, database records, and voice architecture.

---

## 1. Design Direction & Palette System

- **Visual Feel:** SaaS-quality, clean, welcoming, professional, accessible, breathable, and minimal.
- **Color System (NO GRADIENTS):**
  - **Surfaces:** Pure bright white (`#ffffff` / `bg-white`) cards on light neutral background (`#f8fafc` / `bg-slate-50`).
  - **Typography:** Dark navy slate (`#0f172a` / `text-slate-900`, `#334155` / `text-slate-700`, `#64748b` / `text-slate-500`).
  - **Accents:** Emerald/Teal (`#0d9488` / `#10b981` / `#059669`) for positive status indicators, match percentages, and primary action buttons.
  - **Borders & Dividers:** Subtle, crisp borders (`#e2e8f0` / `border-slate-200/80`).

---

## 2. Redesigned Layout & Component Hierarchy

### A. Top Welcome Header (`app/dashboard/page.tsx`)
- Compact, breathable greeting banner:
  - *"Good morning, [Candidate Name]"* / *"Let's move your career forward."*
  - Contextual target role pill: `Machine Learning Engineer` (or candidate's actual target role).
  - Profile Completion Bar: `Profile 85% complete` with sleek progress line and `[Complete profile →]` action.

### B. Compact Quick Actions Tiles
- Replace bulky cards with a 4-tile grid:
  1. **Resume:** *Improve my resume*
  2. **Find Jobs:** *Find matching jobs*
  3. **Career Roadmap:** *View career roadmap*
  4. **Mock Interview:** *Practice interview by voice*
- Includes title, 1-line description, icon badge, and subtle arrow.

### C. Personalized Career Snapshot Card
- Displays target role, top skills pill tags (Python, ML, SQL), overall profile match %, and button `[ View Career Profile ]`.

### D. Recommended Job Matches Feed
- Refined job feed cards (`"Recommended for you"`):
  - Job title, company, location, work type (`Remote · Full-time`), Match %, and accessibility badges (`✓ Remote`, `✓ Screen-reader friendly`).

### E. Accessibility Preferences Status Card
- Compact status list:
  - `✓ Remote work`
  - `✓ Screen-reader compatible`
  - `✓ Flexible hours`
  - Button `[Manage preferences]`

### F. Progress Section
- Simple visual progress bars for Resume (80%), Skills (70%), and Career Profile (90%).

### G. Sidebar & Top Navigation (`components/layout/Sidebar.tsx` & `app/dashboard/layout.tsx`)
- Refined navigation with subtle left emerald indicator line on active items, clean typography, and lightweight header.

---

## 3. Files to Modify

| Component | File Path | Action | Description |
| :--- | :--- | :--- | :--- |
| **Main Dashboard Overview** | [app/dashboard/page.tsx](file:///d:/Projects/openability-ai-main/app/dashboard/page.tsx) | `[MODIFY]` | Redesign dashboard layout into breathable SaaS hierarchy |
| **Sidebar Component** | [components/layout/Sidebar.tsx](file:///d:/Projects/openability-ai-main/components/layout/Sidebar.tsx) | `[MODIFY]` | Redesign sidebar navigation with clean active states & typography |
| **Dashboard Layout Header** | [app/dashboard/layout.tsx](file:///d:/Projects/openability-ai-main/app/dashboard/layout.tsx) | `[MODIFY]` | Lightweight top navigation header with user avatar badge |
| **Floating Voice Assistant** | [features/assistant/PersistentAssistant.tsx](file:///d:/Projects/openability-ai-main/features/assistant/PersistentAssistant.tsx) | `[MODIFY]` | Visually refine Ask OpenAbility floating toggle button (voice logic untouched) |

---

## 4. Verification Plan

### Automated Verification
1. **TypeScript Static Check:** `npx --package typescript tsc --noEmit`
2. **Next.js Production Build:** `npm run build`
3. **Authentication Test Suite:** `node scratch/test_auth.js`
