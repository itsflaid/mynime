# MyNime — Product Brief for AI Agent

## Overview
MyNime adalah personal anime tracker web app dengan akun Google dan archive pribadi
untuk setiap user.
Dibangun dengan Vue 3 + TypeScript + Vite + Tailwind CSS v3 + Pinia + Vue Router + Supabase.
Font: Plus Jakarta Sans (semua elemen). Deploy: Vercel.

---

## Design System
- Background: #f9f9fb (light gray)
- White cards: #ffffff, border: #e4e4e7, border-radius: 16px
- Primary accent: #e91e8c (pink)
- Secondary accent: #7c3aed (purple)
- Primary actions: solid pink #e91e8c (tanpa gradient)
- Text primary: #0f0f0f
- Text secondary: #71717a
- Text muted: #a1a1aa
- Font: Plus Jakarta Sans (400/500/600/700/800)
- Aesthetic: clean, minimal, editorial, Japanese-inspired, light theme

## Status System
| key       | label     | color   | bg      | text    |
|-----------|-----------|---------|---------|---------|
| completed | Completed | #e91e8c | #fce4f0 | #c41574 |
| watching  | Watching  | #7c3aed | #ede9fe | #6d28d9 |
| watchlist | Watchlist | #0891b2 | #e0f2fe | #0369a1 |
| onhold    | On Hold   | #d97706 | #fef3c7 | #b45309 |
| dropped   | Dropped   | #dc2626 | #fee2e2 | #b91c1c |

---

## Database Schema (Supabase)

### Table: anime
- id: uuid PK
- user_id: uuid FK → auth.users.id
- title: text
- poster: text (image url from Jikan API)
- status: text (completed/watching/watchlist/onhold/dropped)
- rate: numeric(3,1) nullable
- completed_at: timestamptz nullable (only filled if status = completed)
- notes: text nullable
- top10rank: int nullable (1–10, null = not in top 10)
- created_at: timestamptz default now()

### Table: rewatches
- id: uuid PK
- anime_id: uuid FK → anime.id (cascade delete)
- rate: numeric(3,1) nullable
- rewatched_at: timestamptz nullable
- notes: text nullable
- created_at: timestamptz default now()

---

## Navbar (sticky, semua halaman)
- Kiri: Logo "MyNime" (pink, font bold)
- Tengah: Nav links — Home | List
- Kanan: Search bar (dekoratif) + tombol "+ Add Anime" (solid pink) + avatar circle
- "+ Add Anime" membuka AddModal dari halaman manapun
- Desktop memakai container terpusat agar sejajar dengan konten
- Mobile memakai tombol Add icon dan hamburger menu
- Hamburger membuka search dan nav links dalam panel mobile

---

## Page 1: Home (/)

### Layout (max-w-5xl, centered)

#### Hero Section
- Layout editorial dua kolom di desktop, satu kolom di mobile
- Kiri: label "PERSONAL ARCHIVE", headline besar, subtitle, dan CTA ke List
- Kanan: "Archive Snapshot" dengan poster anime terbaru dan stats ringkas
- Tidak memakai gradient; poster koleksi menjadi focal point

#### Stats Bar
- Stats menjadi grid 2x2 di dalam Archive Snapshot
- Item: Completed | Watching | Watchlist | On Hold

#### Top 10 Favorites (horizontal scroll)
- Hanya tampil jika ada anime dengan top10rank != null
- Card lebih besar (min-w-[180px]), aspect-ratio 2/3
- Rank badge merah muda (circle) di pojok kiri atas poster
- Rate overlay di pojok kanan bawah poster
- Di bawah poster: judul + notes singkat
- Klik → /anime/:id

#### Section: Recently Completed
- Horizontal scroll row
- Card: poster (aspect 2/3, min-w-130px) + rate overlay
- Di bawah: judul (truncate) + tanggal completed
- Card terakhir paling kanan: "See All" card (border dashed) → /list?status=completed
- Klik card → /anime/:id

#### Section: Currently Watching
- Sama seperti Recently Completed
- See All → /list?status=watching

#### Section: Watchlist
- Sama
- See All → /list?status=watchlist

#### Section: On Hold
- Sama
- See All → /list?status=onhold

#### Catatan section:
- Section hanya tampil jika ada datanya (v-if)
- Semua section punya SectionHeader: judul H2 + subtitle kecil
- Sort Recently Completed: by completed_at DESC

---

## Page 2: List (/list)

### Layout (max-w-4xl, centered)

#### Header
- Label: "PERSONAL ARCHIVE"
- H1: "Curated Journey"
- Subtitle + total judul

#### Toolbar (flex, space-between)
- Kiri: Filter tabs pill-shaped
  - Semua | Completed | Watching | Watchlist | On Hold | Dropped
  - Masing-masing tab ada counter badge
  - Active tab: background warna status, teks warna status
- Kanan: Toggle DETAILED | COMPACT
  - Style: pill container abu-abu, active = white card shadow
- Mobile: status filter diringkas menjadi tombol Filter
- Klik Filter membuka pilihan status dalam grid 2 kolom

#### DETAILED Mode
- Layout: responsive grid, 1 kolom di mobile dan 2 kolom di desktop
- Setiap card (AnimeCard detailed):
  - Flex row: poster memenuhi sisi kiri + konten kanan
  - Konten: status badge dan rate di atas, judul, notes italic, tanggal menempel di bawah
  - Rate di pojok kanan atas konten
  - Hover: border pink, shadow pink, translateY(-2px)
  - Klik seluruh card → /anime/:id

#### COMPACT Mode
- Layout: CSS grid, auto-fill, minmax(130px, 1fr), gap-3
- Setiap card (AnimeCard compact):
  - Poster full (aspect 2/3), rounded-xl
  - Status badge overlay pojok kiri atas
  - Rate overlay pojok kanan bawah (bg hitam transparan)
  - Di bawah poster: judul (2 baris clamp, font 12px)
  - Hover: translateY(-3px), shadow pink
  - Klik card → /anime/:id

#### Sorting
- Semua list sort by completed_at DESC
- Anime tanpa completed_at (watching/watchlist/onhold) muncul di bawah

---

## Page 3: Detail (/anime/:id)

### Layout (max-w-3xl, centered)

#### Back button
- Kiri atas: "← Back" → kembali ke halaman sebelumnya

#### Card Utama
- Layout: flex row
- Kiri: poster besar (200px wide, aspect 2/3, rounded-2xl, shadow)
- Kanan:
  - Status badge
  - Judul (font bold 28px)
  - Rate: bintang pink + angka besar
  - Completed at: tanggal lengkap Indonesia + jam zona Asia/Makassar (WITA)
  - Notes: italic, quoted

#### Rewatch Section (hanya tampil jika status = completed)
- Header: "Rewatch History" + tombol "+ Rewatch" (kanan)
- Klik "+ Rewatch" → inline form atau mini modal muncul dengan field:
  - Tanggal + Jam
  - Rate
  - Notes
  - Tombol Simpan
- List rewatch cards (urut created_at DESC = terbaru di atas):
  - Setiap card: "Rewatch #N" label + tanggal + jam + rate + notes
  - Tombol delete rewatch (icon trash, pojok kanan)
  - Style: white card, border, rounded-xl

#### Top 10 Management
- Jika belum masuk Top 10: tombol solid pink "Tambah ke Top 10"
- Inline input rank 1–10 dengan tombol Simpan dan Batal
- Jika sudah masuk: badge pink "Top #N", tombol edit, dan tombol remove
- Penyimpanan memakai `updateTop10Rank()` di Pinia store
- Rank yang bentrok digeser ke bawah; rank lebih dari 10 dikeluarkan dari Top 10

#### Edit Anime
- Tombol "Edit Anime" tersedia di card utama tanpa batas waktu
- Field yang dapat diedit: status, rate, completed_at, notes, dan top10rank
- Judul dan poster tidak dapat diedit
- Status selain completed otomatis mengosongkan completed_at
- Perubahan top10rank tetap memakai reordering `updateTop10Rank()`

---

## Component: AddModal (global)

Trigger: tombol "+ Add Anime" di Navbar

### Flow
1. User memilih sumber input: **Cari di Jikan** atau **Tambah Manual**
2. Mode Jikan: search field → debounce 500ms → hit Jikan API
   GET https://api.jikan.moe/v4/anime?q={query}&limit=6&sfw=true
3. Dropdown hasil: poster kecil + judul + type + episode count
4. Klik hasil → auto-fill poster + judul, tutup dropdown
5. Mode manual: user mengisi nama anime dan URL poster publik
6. Selected preview: poster + judul + indikator sumber
7. Status selector: 5 tombol pill (completed/watching/watchlist/onhold/dropped)
8. Jika status = completed → tampilkan: date picker + time picker + rate input
9. Notes textarea (semua status)
10. Tombol "Simpan ke MyNime" disabled sampai nama dan URL poster valid
11. Error dari Jikan atau Supabase ditampilkan tanpa menghilangkan input user
12. Setelah save → navigate ke /anime/:id

---

## Anime API
- Base: https://api.jikan.moe/v4
- Search: GET /anime?q={query}&limit=6&sfw=true
- Response fields yang dipakai: mal_id, title, images.jpg.image_url, images.jpg.small_image_url, type, episodes
- No API key needed

### Manual Entry
- Tidak membutuhkan perubahan schema database
- `title` diisi dari nama manual
- `poster` harus berupa URL publik `http` atau `https`
- Manual entry tetap tersedia walaupun Jikan sedang gagal atau anime tidak ditemukan

---

## Authentication

- Supabase Auth dengan provider Google
- Login Google pertama otomatis menjadi registrasi akun
- Route `/`, `/list`, dan `/anime/:id` hanya dapat dibuka user authenticated
- `/login` menjadi halaman guest dan `/auth/callback` menyelesaikan OAuth redirect
- Semua query anime difilter berdasarkan `user_id`
- Ownership `rewatches` mengikuti anime melalui `anime_id`
- RLS memastikan user hanya dapat membaca dan mengubah datanya sendiri
- Navbar menampilkan profil Google dan tombol logout
- Setup dashboard dan migration dijelaskan di `AUTH_SETUP.md`

---

## Routing
- / → HomePage
- /list → ListPage (support ?status=xxx query param untuk default filter)
- /anime/:id → DetailPage
- /login → LoginPage
- /auth/callback → AuthCallbackPage

---

## State Management (Pinia — useAnimeStore)
- animeList: Anime[] (semua data, di-fetch sekali di HomePage)
- loading: boolean
- fetchAll() → select * from anime order by completed_at desc nulls last
- fetchOne(id) → select *, rewatches(*) from anime where id = id
- addAnime(payload) → insert + push ke animeList
- updateAnime(id, payload) → update + sync animeList
- deleteAnime(id) → delete + filter animeList
- addRewatch(payload) → insert ke rewatches
- deleteRewatch(id) → delete dari rewatches

