-- Create a table for health records
create table public.health_records (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date not null,
  morning_weight numeric,
  evening_weight numeric,
  bm_count integer default 0,
  has_bm boolean default false,
  notes text,
  user_id uuid references auth.users not null,
  unique (user_id, date)
);

-- Set up Row Level Security (RLS)
alter table public.health_records enable row level security;

-- Policy: Users can only see their own data
create policy "Users can view their own data"
  on public.health_records for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own data
create policy "Users can insert their own data"
  on public.health_records for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own data
create policy "Users can update their own data"
  on public.health_records for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own data
create policy "Users can delete their own data"
  on public.health_records for delete
  using (auth.uid() = user_id);
