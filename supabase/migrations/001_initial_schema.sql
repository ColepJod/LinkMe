-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text unique not null,
  display_name text not null default '',
  bio text,
  avatar_url text,
  theme text not null default 'light' check (theme in ('light', 'dark', 'gradient', 'glass')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create links table
create table public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  url text not null,
  description text,
  icon text,
  image_url text,
  is_active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create social_links table
create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null check (platform in ('twitter', 'instagram', 'github', 'linkedin', 'youtube', 'tiktok', 'email', 'discord', 'threads')),
  url text not null,
  position integer not null default 0
);

-- Create profile_views table
create table public.profile_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  referrer text,
  country text
);

-- Create link_clicks table
create table public.link_clicks (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.links(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  clicked_at timestamptz not null default now(),
  referrer text
);

-- Indexes
create index idx_links_user_id on public.links(user_id);
create index idx_links_position on public.links(user_id, position);
create index idx_social_links_user_id on public.social_links(user_id);
create index idx_profile_views_user_id on public.profile_views(user_id);
create index idx_link_clicks_link_id on public.link_clicks(link_id);
create index idx_link_clicks_user_id on public.link_clicks(user_id);

-- RLS policies
alter table public.profiles enable row level security;
alter table public.links enable row level security;
alter table public.social_links enable row level security;
alter table public.profile_views enable row level security;
alter table public.link_clicks enable row level security;

-- Profiles: public read, owner write
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Links: public read for active links, owner full access
create policy "Active links are viewable by everyone"
  on public.links for select
  using (is_active = true);

create policy "Users can view own links"
  on public.links for select
  using (auth.uid() = user_id);

create policy "Users can manage own links"
  on public.links for all
  using (auth.uid() = user_id);

-- Social links: public read, owner write
create policy "Social links are viewable by everyone"
  on public.social_links for select
  using (true);

create policy "Users can manage own social links"
  on public.social_links for all
  using (auth.uid() = user_id);

-- Profile views: owner read, anyone can insert
create policy "Users can view own profile views"
  on public.profile_views for select
  using (auth.uid() = user_id);

create policy "Anyone can record profile views"
  on public.profile_views for insert
  with check (true);

-- Link clicks: owner read, anyone can insert
create policy "Users can view own link clicks"
  on public.link_clicks for select
  using (auth.uid() = user_id);

create policy "Anyone can record link clicks"
  on public.link_clicks for insert
  with check (true);

-- Auto-create profile on signup via trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, username, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
