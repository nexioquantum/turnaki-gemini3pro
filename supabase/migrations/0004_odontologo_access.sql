create policy "Odontologos pueden ver cualquier paciente" on public.patients
for select using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'ODONTOLOGO'
  )
);

create policy "Odontologos ven sus sillones" on public.odontologo_sillon
for select using (
  auth.uid() = odontologo_id
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'ADMIN'
  )
);

create policy "Odontologos y admins ven sillones" on public.sillones
for select using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('ADMIN', 'ODONTOLOGO')
  )
);

