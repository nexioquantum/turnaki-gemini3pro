drop policy if exists "Public profiles are viewable by authenticated users" on public.profiles;
drop policy if exists "Users can manage their own profile" on public.profiles;

create policy "Profiles readable by authenticated" on public.profiles
for select
using (auth.role() = 'authenticated');

create policy "Users insert own profile" on public.profiles
for insert
with check (auth.uid() = id);

create policy "Users update own profile" on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

