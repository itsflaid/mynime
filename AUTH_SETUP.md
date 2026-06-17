# MyNime Google OAuth Setup

## 1. Jalankan migration

Jalankan isi file berikut di Supabase SQL Editor:

`supabase/migrations/202606120001_google_auth_rls.sql`

Migration menambahkan `anime.user_id`, mengaktifkan RLS, dan melindungi anime serta
rewatch berdasarkan akun Google yang sedang login.

## 2. Buat Google OAuth client

Di Google Auth Platform:

1. Buat OAuth Client ID dengan tipe **Web application**.
2. Tambahkan origin local, misalnya `http://localhost:5173`.
3. Tambahkan origin production Vercel.
4. Tambahkan callback URL Supabase yang ditampilkan pada halaman provider Google di
   Supabase Dashboard.

Scopes minimum:

- `openid`
- `.../auth/userinfo.email`
- `.../auth/userinfo.profile`

## 3. Aktifkan Google provider di Supabase

Di **Authentication > Providers > Google**:

1. Aktifkan Google.
2. Masukkan Client ID dan Client Secret dari Google.

Di **Authentication > URL Configuration**:

- Site URL local: `http://localhost:5173`
- Redirect URL local: `http://localhost:5173/auth/callback`
- Tambahkan URL production: `https://DOMAIN-VERCEL/auth/callback`

Repo sudah memiliki `vercel.json` yang me-rewrite route SPA, termasuk callback OAuth,
ke `index.html`.

## 4. Data lama

Jika hanya ada satu user, migration atau login pertama akan mengklaim anime lama yang
belum memiliki `user_id`. Bila Supabase sudah memiliki beberapa user, assign owner secara
manual sebelum mengaktifkan aplikasi:

```sql
update public.anime
set user_id = 'UUID-USER-PEMILIK'
where user_id is null;
```

Setelah memastikan tidak ada data legacy tanpa owner, constraint berikut boleh dijalankan:

```sql
alter table public.anime alter column user_id set not null;
```
