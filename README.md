# CrowdShield – AI Powered Community Safety & Emergency Alert

CrowdShield is a production-quality cross-platform community safety and emergency alert mobile application built with **React Native (Expo)**, **TypeScript**, and **Supabase**. It helps individuals and groups report safety incidents in real-time, trigger countdown-based SOS broadcasts, coordinate safe check-in trip ETAs with trusted contacts, and leverage AI diagnostic reviews to assess risk severity and immediate countermeasures.

---

## Key Features

1. **SOS Emergency Hub**: A prominent, pulsing SOS activator with a 3-second safety delay countdown to prevent false alarms. Active broadcasts update GPS coordinates dynamically.
2. **Community Incident Reporting**: Allows members to pin incidents on a map, upload media evidence, and submit reports anonymously.
3. **AI Safety Review**: Automates urgency categorization (Low, Medium, High, Critical), summarizes incident descriptions, and suggests immediate survival/first-aid tips.
4. **Safe Check-in Trip Sharing**: Shared routes and arrival deadlines with automated warning dispatches to trusted contacts if check-ins are missed.
5. **Trusted Contact Manager**: Add and rank up to 5 priority contacts with quick-tap call and message configurations.
6. **AI Safety Assistant**: Chatbot offering non-emergency hazard guides, first-aid manuals, and quick action steps.
7. **Moderator Portal & Analytics**: Review queues, action history logs, and urgency distribution metrics.
8. **Interactive Sandboxed Demo Mode**: Automatically active when backend credentials are blank, storing state in Zustand/AsyncStorage so reviewers can try all modules out-of-the-box.

---

## Technical Stack

- **Mobile**: React Native, Expo SDK 57, TypeScript, Expo Router
- **State Management**: Zustand
- **Forms**: React Hook Form, Zod
- **Backend & Auth**: Supabase Auth & PostgreSQL Realtime subscriptions
- **Styling**: Tailored Spacing & Colors theme integrations

---

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Step 1: Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` in the root folder:
```bash
cp .env.example .env
```
Fill in your Supabase variables. Leave them blank to run the app in **Sandbox Demo Mode**.

### Step 3: Run the Application
Start the Expo Metro bundler:
```bash
npm start
```
To test:
- **iOS Simulator**: Press `i`
- **Android Emulator**: Press `a`
- **Web Browser**: Press `w`

---

## Supabase PostgreSQL Schema Setup

Copy and execute the following SQL scripts in the **Supabase SQL Editor** to construct the database schema and enable Row-Level Security (RLS).

```sql
-- 1. Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  phone text,
  address text,
  blood_group text,
  emergency_notes text,
  role text not null default 'member' check (role in ('member', 'moderator', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Emergency Contacts Table
create table public.emergency_contacts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  phone text not null,
  email text,
  priority integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Emergency Alerts (Active SOS Events)
create table public.emergency_alerts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  latitude double precision not null,
  longitude double precision not null,
  type text not null check (type in ('Medical', 'Fire', 'Threat/Crime', 'Accident', 'Disaster', 'Other')),
  status text not null default 'active' check (status in ('active', 'resolved', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone
);

-- 4. Incident Reports Table
create table public.incident_reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references public.profiles(id) on delete set null,
  category text not null,
  description text not null,
  latitude double precision not null,
  longitude double precision not null,
  location_name text,
  incident_time timestamp with time zone not null,
  is_anonymous boolean default false not null,
  urgency text not null default 'Medium' check (urgency in ('Low', 'Medium', 'High', 'Critical')),
  summary text,
  safety_actions text[] default '{}'::text[] not null,
  status text not null default 'Submitted' check (status in ('Submitted', 'Under Review', 'Verified', 'Resolved', 'Rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Incident Media Table
create table public.incident_media (
  id uuid default gen_random_uuid() primary key,
  incident_id uuid references public.incident_reports(id) on delete cascade not null,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Incident Updates Table
create table public.incident_updates (
  id uuid default gen_random_uuid() primary key,
  incident_id uuid references public.incident_reports(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  update_text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Check-Ins (Safe Check-in Trips) Table
create table public.check_ins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  destination_name text not null,
  latitude double precision not null,
  longitude double precision not null,
  eta timestamp with time zone not null,
  status text not null default 'active' check (status in ('active', 'safe', 'delayed', 'missed_check_in')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  checked_in_at timestamp with time zone
);

-- 8. Moderator Actions Table
create table public.moderator_actions (
  id uuid default gen_random_uuid() primary key,
  moderator_id uuid references public.profiles(id) on delete set null not null,
  incident_id uuid references public.incident_reports(id) on delete set null not null,
  action_type text not null check (action_type in ('verify', 'reject', 'resolve', 'escalate')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.emergency_alerts enable row level security;
alter table public.incident_reports enable row level security;
alter table public.incident_media enable row level security;
alter table public.incident_updates enable row level security;
alter table public.check_ins enable row level security;

-- Row Level Security (RLS) Policies

-- Profiles Policies
create policy "Allow profile select for owners or mods" on public.profiles
  for select using (auth.uid() = id or exists (select 1 from public.profiles where id = auth.uid() and role in ('moderator', 'admin')));

create policy "Allow profile update for owners" on public.profiles
  for update using (auth.uid() = id);

-- Emergency Contacts Policies
create policy "Allow contact management for owners" on public.emergency_contacts
  for all using (auth.uid() = user_id);

-- Emergency Alerts Policies
create policy "Allow read for alert owner, emergency contact, or moderators" on public.emergency_alerts
  for select using (
    auth.uid() = user_id 
    or exists (select 1 from public.emergency_contacts where user_id = emergency_alerts.user_id and phone = (select phone from public.profiles where id = auth.uid()))
    or exists (select 1 from public.profiles where id = auth.uid() and role in ('moderator', 'admin'))
  );

create policy "Allow insert for alert owner" on public.emergency_alerts
  for insert with check (auth.uid() = user_id);

-- Incident Reports Policies
create policy "Allow read public verified incidents" on public.incident_reports
  for select using (status in ('Verified', 'Resolved') or auth.uid() = reporter_id or exists (select 1 from public.profiles where id = auth.uid() and role in ('moderator', 'admin')));

create policy "Allow report submission for auth users" on public.incident_reports
  for insert with check (auth.uid() = reporter_id or reporter_id is null);
```

---

## Verification Sandbox Guide

To check individual roles:
1. Go to the **Profile** tab in the app.
2. In the **Testing Sandbox Role** card, select **Member**, **Moderator**, or **Admin**.
3. Selecting **Moderator** or **Admin** will unlock the **Moderation Queue** quick-action button on the Dashboard.
4. From the **Moderation Queue**, you can view, review notes, verify, reject, or resolve submitted reports.
