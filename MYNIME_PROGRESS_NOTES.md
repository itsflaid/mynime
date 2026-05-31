# MyNime Progress Notes

## Yang sudah dilanjutkan

File yang dibuat/dilengkapi:

- `src/components/StatusBadge.vue`
- `src/components/AnimeCard.vue`
- `src/components/RewatchCard.vue`
- `src/pages/ListPage.vue`
- `src/pages/DetailPage.vue`

File yang diperbaiki:

- `src/main.ts` sekarang sudah memakai Pinia dan Vue Router.
- `src/components/addModal.vue` dinormalisasi menjadi `src/components/AddModal.vue` agar aman saat build di Linux/Vercel.
- `src/pages/HomePage.vue` dibersihkan dari unused import agar `vue-tsc` tidak gagal.

## Alur sekarang

- `/` menampilkan dashboard/home.
- `/list` menampilkan semua anime dengan filter status dan toggle detailed/compact.
- `/list?status=completed` dan status lain bisa langsung membuka filter tertentu.
- `/anime/:id` menampilkan detail anime, notes, rating, tanggal selesai, dan daftar rewatch.
- Tombol `+ Rewatch` muncul hanya jika anime berstatus `completed`.
- Setelah tambah anime dari modal global, user diarahkan ke detail anime tersebut.

## Catatan database

Pastikan tabel Supabase sesuai minimal schema berikut:

```sql
create table if not exists anime (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  poster text not null,
  status text not null check (status in ('completed', 'watching', 'watchlist', 'onhold', 'dropped')),
  rate numeric(3,1),
  completed_at timestamptz,
  notes text,
  top10rank int,
  created_at timestamptz not null default now()
);

create table if not exists rewatches (
  id uuid primary key default gen_random_uuid(),
  anime_id uuid not null references anime(id) on delete cascade,
  rate numeric(3,1),
  rewatched_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);
```

Kalau RLS aktif, buat policy sesuai kebutuhan personal app kamu. Untuk testing cepat, bisa matikan RLS dulu, tapi untuk deploy publik sebaiknya jangan asal buka write access.

## Command cek

```bash
npm install
npm run dev
npm run build
```

Build terakhir sudah lolos di local sandbox.
