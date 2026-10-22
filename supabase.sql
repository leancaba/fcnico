-- =========================================================
-- REGALO · base de datos de discos (Supabase → SQL Editor → Run)
-- Antes de correrlo, cambiá 'CAMBIAME' por la clave del panel admin.
-- =========================================================

create extension if not exists pgcrypto with schema extensions;

-- Tabla de discos (lectura pública)
create table if not exists public.discos (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  imagen      text not null,
  comentario  text,
  link        text not null,
  creado      timestamptz not null default now()
);

alter table public.discos enable row level security;

drop policy if exists "discos lectura publica" on public.discos;
create policy "discos lectura publica" on public.discos
  for select using (true);
-- No hay políticas de insert/delete: solo se escribe con las funciones de abajo.

-- Clave del admin (guardada encriptada, nadie la puede leer desde la web)
create table if not exists public.admin_clave (
  id    int primary key default 1 check (id = 1),
  hash  text not null
);
alter table public.admin_clave enable row level security;

insert into public.admin_clave (id, hash)
values (1, extensions.crypt('CAMBIAME', extensions.gen_salt('bf')))
on conflict (id) do update set hash = excluded.hash;

-- Verificar clave
create or replace function public.check_admin(p_clave text)
returns boolean
language sql
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1 from public.admin_clave
    where hash = extensions.crypt(p_clave, hash)
  );
$$;

-- Agregar disco
create or replace function public.add_disco(
  p_clave text, p_titulo text, p_imagen text, p_comentario text, p_link text
)
returns public.discos
language plpgsql
security definer
set search_path = public, extensions
as $$
declare nuevo public.discos;
begin
  if not public.check_admin(p_clave) then
    raise exception 'Clave incorrecta';
  end if;
  insert into public.discos (titulo, imagen, comentario, link)
  values (trim(p_titulo), trim(p_imagen), nullif(trim(p_comentario), ''), trim(p_link))
  returning * into nuevo;
  return nuevo;
end;
$$;

-- Borrar disco
create or replace function public.borrar_disco(p_clave text, p_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not public.check_admin(p_clave) then
    raise exception 'Clave incorrecta';
  end if;
  delete from public.discos where id = p_id;
end;
$$;

grant execute on function public.check_admin(text) to anon;
grant execute on function public.add_disco(text, text, text, text, text) to anon;
grant execute on function public.borrar_disco(text, uuid) to anon;
