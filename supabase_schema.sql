-- ============================================================
--  PATITAS FELICES — Esquema completo de base de datos
--  Ejecuta esto en: Supabase → SQL Editor → New query
-- ============================================================

-- ── Tabla: animales ─────────────────────────────────────────
create table animales (
  id              uuid primary key default gen_random_uuid(),
  nombre          text not null,
  especie         text not null default 'perro',   -- perro, gato, conejo, ave, otro
  raza            text,
  edad_meses      int,
  sexo            text default 'macho',             -- macho, hembra
  tamano          text default 'mediano',           -- pequeño, mediano, grande
  descripcion     text,
  caracter        text,                              -- "Juguetón, Tranquilo, Cariñoso"
  vacunado        boolean default false,
  castrado        boolean default false,
  desparasitado   boolean default false,
  apto_ninos      boolean default false,
  apto_perros     boolean default false,
  apto_gatos      boolean default false,
  foto_principal  text,                              -- path en storage
  estado          text default 'disponible',        -- disponible, reservado, adoptado
  created_at      timestamptz default now()
);

alter table animales enable row level security;
create policy "Lectura pública" on animales for select using (true);
create policy "Solo admin escribe" on animales for all
  using (auth.jwt() ->> 'rol' = 'admin' or (auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin');

-- ── Tabla: likes ────────────────────────────────────────────
create table likes (
  id          uuid primary key default gen_random_uuid(),
  animal_id   uuid references animales(id) on delete cascade,
  usuario_id  uuid references auth.users(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(animal_id, usuario_id)
);

alter table likes enable row level security;
create policy "Lectura pública likes" on likes for select using (true);
create policy "Usuario gestiona sus likes" on likes for all using (auth.uid() = usuario_id);

-- ── Tabla: chat_publico ─────────────────────────────────────
create table chat_publico (
  id          uuid primary key default gen_random_uuid(),
  animal_id   uuid references animales(id) on delete cascade,
  usuario_id  uuid references auth.users(id) on delete set null,
  mensaje     text not null,
  es_admin    boolean default false,
  created_at  timestamptz default now()
);

alter table chat_publico enable row level security;
create policy "Lectura pública chat" on chat_publico for select using (true);
create policy "Usuarios autenticados escriben" on chat_publico for insert
  with check (auth.uid() = usuario_id);

-- ── Tabla: chat_privado ─────────────────────────────────────
create table chat_privado (
  id          uuid primary key default gen_random_uuid(),
  animal_id   uuid references animales(id) on delete cascade,
  usuario_id  uuid references auth.users(id) on delete cascade,
  mensaje     text not null,
  autor       text default 'user',   -- 'user' | 'admin'
  created_at  timestamptz default now()
);

alter table chat_privado enable row level security;
-- El usuario solo ve su propio hilo; el admin lo ve todo
create policy "Usuario ve su hilo" on chat_privado for select
  using (auth.uid() = usuario_id or (auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin');
create policy "Usuario escribe en su hilo" on chat_privado for insert
  with check (auth.uid() = usuario_id or (auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin');

-- ── Tabla: citas ─────────────────────────────────────────────
create table citas (
  id          uuid primary key default gen_random_uuid(),
  animal_id   uuid references animales(id) on delete cascade,
  usuario_id  uuid references auth.users(id) on delete set null,
  fecha       date not null,
  hora        text not null,          -- '10:30'
  nombre      text not null,
  email       text not null,
  telefono    text,
  notas       text,
  estado      text default 'pendiente',  -- pendiente, confirmada, rechazada
  created_at  timestamptz default now()
);

alter table citas enable row level security;
create policy "Usuario ve sus citas" on citas for select
  using (auth.uid() = usuario_id or (auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin');
create policy "Usuarios autenticados crean citas" on citas for insert
  with check (auth.uid() = usuario_id);
create policy "Admin actualiza citas" on citas for update
  using ((auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin');

-- ── Tabla: adopciones ────────────────────────────────────────
create table adopciones (
  id          uuid primary key default gen_random_uuid(),
  animal_id   uuid references animales(id) on delete cascade,
  usuario_id  uuid references auth.users(id) on delete set null,
  nombre      text,
  apellidos   text,
  email       text,
  telefono    text,
  mensaje     text,
  estado      text default 'pendiente',  -- pendiente, en_proceso, aprobada, rechazada
  created_at  timestamptz default now()
);

alter table adopciones enable row level security;
create policy "Usuario ve sus adopciones" on adopciones for select
  using (auth.uid() = usuario_id or (auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin');
create policy "Insertar adopciones" on adopciones for insert with check (true);
create policy "Admin actualiza adopciones" on adopciones for update
  using ((auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin');

-- ── Storage bucket: animales-fotos ───────────────────────────
insert into storage.buckets (id, name, public)
values ('animales-fotos', 'animales-fotos', true)
on conflict do nothing;

create policy "Fotos públicas" on storage.objects for select
  using (bucket_id = 'animales-fotos');
create policy "Admin sube fotos" on storage.objects for insert
  with check (bucket_id = 'animales-fotos' and (auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin');

-- ── Realtime: activar para chats ─────────────────────────────
alter publication supabase_realtime add table chat_publico;
alter publication supabase_realtime add table chat_privado;

-- ── Datos de ejemplo ─────────────────────────────────────────
insert into animales (nombre, especie, raza, edad_meses, sexo, tamano, descripcion, caracter, vacunado, castrado, desparasitado, apto_ninos, apto_perros, estado)
values
  ('Rocky', 'perro', 'Labrador', 24, 'macho', 'mediano',
   'Rocky es un labrador cariñoso lleno de energía. Lleva 3 meses en el refugio y está muy bien socializado. Le encanta jugar y dar paseos largos.',
   'Juguetón, Cariñoso, Activo', true, true, true, true, true, 'disponible'),
  ('Luna', 'gato', 'Mestiza', 12, 'hembra', 'pequeño',
   'Luna es una gata tranquila y muy cariñosa una vez que coge confianza. Perfecta para un hogar tranquilo.',
   'Tranquila, Cariñosa, Independiente', true, false, true, false, false, 'disponible'),
  ('Nieve', 'conejo', 'Enano', 8, 'hembra', 'pequeño',
   'Nieve es una conejita enana muy dócil. Perfecta para vivir en interior. Ya está acostumbrada a convivir con personas.',
   'Dócil, Tranquila', true, false, true, true, false, 'reservado'),
  ('Kiwi', 'ave', 'Loro amazónico', 36, 'macho', 'pequeño',
   'Kiwi es un loro muy sociable que sabe decir algunas palabras. Necesita atención y estimulación diaria.',
   'Hablador, Social, Inteligente', true, false, false, false, false, 'disponible');
