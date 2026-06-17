-- MyNime Google OAuth ownership and Row Level Security.
-- Run this migration before exposing the application publicly.

alter table public.anime
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.anime
  alter column user_id set default auth.uid();

create index if not exists anime_user_id_idx on public.anime(user_id);
create index if not exists rewatches_anime_id_idx on public.rewatches(anime_id);

-- If exactly one account already exists, preserve the personal archive by assigning
-- all legacy rows to that account.
do $$
declare
  existing_user_count integer;
  existing_user_id uuid;
begin
  if exists (select 1 from public.anime where user_id is null) then
    select count(*) into existing_user_count from auth.users;

    if existing_user_count = 1 then
      select id into existing_user_id from auth.users limit 1;
      update public.anime
      set user_id = existing_user_id
      where user_id is null;
    end if;
  end if;
end;
$$;

-- Called after login to claim legacy rows when the first account was created
-- after this migration ran. It refuses to choose an owner once multiple users exist.
create or replace function public.claim_legacy_anime()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_user_count integer;
  claimed_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (select 1 from public.anime where user_id is null) then
    return 0;
  end if;

  select count(*) into existing_user_count from auth.users;
  if existing_user_count <> 1 then
    raise exception 'Legacy data must be assigned manually because multiple users exist';
  end if;

  update public.anime
  set user_id = auth.uid()
  where user_id is null;

  get diagnostics claimed_count = row_count;
  return claimed_count;
end;
$$;

revoke all on function public.claim_legacy_anime() from public;
grant execute on function public.claim_legacy_anime() to authenticated;

alter table public.anime enable row level security;
alter table public.rewatches enable row level security;

drop policy if exists "Users can read their anime" on public.anime;
create policy "Users can read their anime"
on public.anime
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their anime" on public.anime;
create policy "Users can insert their anime"
on public.anime
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their anime" on public.anime;
create policy "Users can update their anime"
on public.anime
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their anime" on public.anime;
create policy "Users can delete their anime"
on public.anime
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read rewatches for their anime" on public.rewatches;
create policy "Users can read rewatches for their anime"
on public.rewatches
for select
to authenticated
using (
  exists (
    select 1
    from public.anime
    where anime.id = rewatches.anime_id
      and anime.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can insert rewatches for their anime" on public.rewatches;
create policy "Users can insert rewatches for their anime"
on public.rewatches
for insert
to authenticated
with check (
  exists (
    select 1
    from public.anime
    where anime.id = rewatches.anime_id
      and anime.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can update rewatches for their anime" on public.rewatches;
create policy "Users can update rewatches for their anime"
on public.rewatches
for update
to authenticated
using (
  exists (
    select 1
    from public.anime
    where anime.id = rewatches.anime_id
      and anime.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.anime
    where anime.id = rewatches.anime_id
      and anime.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can delete rewatches for their anime" on public.rewatches;
create policy "Users can delete rewatches for their anime"
on public.rewatches
for delete
to authenticated
using (
  exists (
    select 1
    from public.anime
    where anime.id = rewatches.anime_id
      and anime.user_id = (select auth.uid())
  )
);
