

# Full Mobile Optimization — All Pages

## What we're doing
Applying comprehensive mobile UX optimizations across the entire app: safe areas for notches/home indicators, consistent spacing, proper touch targets, keyboard handling, overflow prevention, and small-screen typography scaling.

## Changes

### 1. Viewport & PWA Meta Tags
**File: `index.html`**
- Add `viewport-fit=cover` to viewport meta
- Add `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` meta tags
- Add theme-color meta tag

### 2. Global CSS Foundations
**File: `src/index.css`**
- Add `-webkit-tap-highlight-color: transparent` to body
- Add `overflow-x: hidden` on html/body to prevent horizontal scroll leaks
- Add `touch-action: manipulation` to prevent double-tap zoom
- Create `.pb-nav` utility class: `padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px))` for consistent bottom spacing on all pages with BottomNav
- Add `@media (max-width: 374px)` breakpoint to scale down oversized headings (credits counter, profile titles)
- Add `@media (prefers-reduced-motion: reduce)` to disable GSAP-driven animations
- Ensure `.scrollbar-hide` is present for horizontal filter rows
- Add `.safe-top` utility: `padding-top: env(safe-area-inset-top, 0px)`

### 3. TopBar Safe Area
**File: `src/components/layout/TopBar.tsx`**
- Add `padding-top: env(safe-area-inset-top, 0px)` to the header element so content doesn't hide behind notch/dynamic island

### 4. BottomNav Safe Area
**File: `src/components/layout/BottomNav.tsx`**
- Verify and ensure the mobile dock properly accounts for safe area (already has `env(safe-area-inset-bottom)` — confirm it works with `viewport-fit=cover`)
- Ensure all touch targets are minimum 44x44px (current nav items are 44x40 — bump height to 44)

### 5. Standardize Bottom Padding on All Pages
Replace inconsistent `pb-24`/`pb-28` with the new `pb-nav` class on every page that uses BottomNav:
- `HomePage.tsx` — replace `pb-28`
- `MapPage.tsx` — replace `pb-28`
- `ChatsPage.tsx` — standardize padding
- `ProfilePage.tsx` — standardize padding
- `NotificationsPage.tsx` — standardize padding
- `CreditsPage.tsx`, `LeaderboardPage.tsx`, `QuestsPage.tsx`, `CirclePage.tsx`, `FreeNowPage.tsx`, `InviteFriendsPage.tsx`, `SettingsPage.tsx` — standardize padding

Pages without BottomNav (Onboarding, Signup, Splash, Review, Attendance, JoinRequest) keep their own padding.

### 6. Touch Target Audit & Fix
Across all pages, ensure interactive elements meet 44x44px minimum:
- Filter chips (currently `h-8` = 32px) → bump to `h-10` (40px) or add padding to reach 44px tap area
- TopBar action buttons (currently `w-8 h-8`) → bump to `w-10 h-10`
- Small icon buttons throughout cards → ensure min 44px tap area via padding

### 7. Horizontal Overflow Prevention
- `HomePage.tsx` — ensure category filter row has `overflow-x-auto scrollbar-hide` and no items cause page-wide scroll
- `NotificationsPage.tsx` — same for filter tabs
- `MapPage.tsx` — same for category chips

### 8. Keyboard-Aware Layouts
- `SignupPage.tsx` — add `inputmode="tel"` for phone, `inputmode="email"` for email, `inputmode="numeric"` for OTP inputs. Use `100dvh` for container height.
- `CreateRequestPage.tsx` — use `dvh` units, ensure submit button stays visible above keyboard
- `RequestDetailPage.tsx` — ensure chat input uses `position: sticky` at bottom and stays above keyboard with `padding-bottom: env(safe-area-inset-bottom)`

### 9. Map Page Full-Height
**File: `src/pages/MapPage.tsx`**
- Make the map expand to fill available space using `flex-1` instead of fixed `height: 240px` so it uses viewport dynamically

### 10. Small Screen Typography
**File: `src/index.css`**
- `@media (max-width: 374px)`: scale titles from 24px to 20px, reduce card padding, shrink credit counter text
- Ensure all long text has `truncate` or `line-clamp-2` where appropriate

### 11. Onboarding & Signup — Full Viewport Lock
- `OnboardingPage.tsx` — already uses `100dvh`, verify no overflow
- `SignupPage.tsx` — switch to `100dvh`, ensure no scroll needed on any step

## Summary
~20 files touched. Core changes in `index.html`, `src/index.css`, `TopBar.tsx`, `BottomNav.tsx`. All page files get standardized bottom padding. Input pages get keyboard-aware improvements. Filter rows get overflow fixes. Touch targets get bumped to 44px minimum.

