# vproof — Landing Page

Nigeria's verification layer. Built with Next.js 14, Tailwind CSS, Framer Motion & Zustand.

## Stack
- **Next.js 14** (App Router)
- **Tailwind CSS** — utility-first styling
- **Framer Motion** — scroll animations, entrance transitions, AnimatePresence
- **Zustand** — global state (auth, vScore store — ready to wire up)
- **TypeScript**

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## File Structure

```
app/
  page.tsx          ← this file (landing page, all sections)
  layout.tsx        ← root layout (add font links here if needed)
  globals.css       ← global styles
```

## Sections

1. **Navbar** — sticky, blur-on-scroll
2. **Hero** — parallax orb, floating transfer card with live vScore ring, floating risk/verified badges
3. **Proof of Work** — stat cards with staggered entrance
4. **Features** — 4-card hover grid
5. **How It Works** — 4-step timeline
6. **Risk Demo** — interactive toggle showing safe vs risky score states with AnimatePresence
7. **Testimonials** — 3 cards with embedded score rings
8. **CTA** — full-width conversion section
9. **Footer**

## Wiring Up

### Auth / Verification state (Zustand)
```ts
// store/useVproofStore.ts
import { create } from 'zustand'

interface VproofStore {
  vScore: number | null
  isVerified: boolean
  setVScore: (score: number) => void
}

export const useVproofStore = create<VproofStore>((set) => ({
  vScore: null,
  isVerified: false,
  setVScore: (score) => set({ vScore: score, isVerified: score >= 50 }),
}))
```

### Transfer flow
When a user initiates a transfer, query `/api/vscore?account=XXXXXXXXXX&bank=GTBank` — return the recipient's vScore. If < 50, surface the risk warning modal.

## Design Tokens
- **Background**: `#06060e`
- **Primary accent**: `violet-600` (#7c3aed)
- **Success**: `emerald-400` (#34d399)
- **Danger**: `red-400` (#f87171)
- **Display font**: Syne (700–800)
- **Body font**: DM Sans (300–500)
- **Mono**: DM Mono