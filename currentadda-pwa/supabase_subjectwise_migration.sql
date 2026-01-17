-- Migration for Subject-specific Quiz Feature (Separate Tables)

-- 1. Create Subjects Table
create table if not exists public.subjects (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    slug text not null unique,
    created_at timestamptz default now()
);

-- 2. Create Main Topics Table
create table if not exists public.main_topics (
    id uuid primary key default uuid_generate_v4(),
    subject_id uuid references public.subjects(id) on delete cascade,
    name text not null,
    slug text not null,
    created_at timestamptz default now(),
    unique(subject_id, slug)
);

-- 3. Create Sub Topics Table
create table if not exists public.sub_topics (
    id uuid primary key default uuid_generate_v4(),
    main_topic_id uuid references public.main_topics(id) on delete cascade,
    name text not null,
    slug text not null,
    created_at timestamptz default now(),
    unique(main_topic_id, slug)
);

-- 4. Create Subject-specific Quizzes Table (Separate from Daily Quizzes)
create table if not exists public.subject_quizzes (
    id uuid primary key default uuid_generate_v4(),
    sub_topic_id uuid references public.sub_topics(id) on delete cascade,
    title text not null,
    slug text not null unique,
    created_at timestamptz default now()
);

-- 5. Create Subject-specific Questions Table (Separate from Daily Questions)
create table if not exists public.subject_questions (
    id uuid primary key default uuid_generate_v4(),
    quiz_id uuid references public.subject_quizzes(id) on delete cascade,
    q_index int not null,
    text text not null,
    options jsonb not null,
    answer char(1) not null,
    explanation text,
    created_at timestamptz default now()
);

-- 6. Enable Row Level Security (RLS)
alter table public.subjects enable row level security;
alter table public.main_topics enable row level security;
alter table public.sub_topics enable row level security;
alter table public.subject_quizzes enable row level security;
alter table public.subject_questions enable row level security;

-- 7. Policies for Subjects
create policy "Allow public read access for subjects" on public.subjects for select using (true);
create policy "Allow auth all access for subjects" on public.subjects for all using (auth.role() = 'authenticated');

-- 8. Policies for Main Topics
create policy "Allow public read access for main_topics" on public.main_topics for select using (true);
create policy "Allow auth all access for main_topics" on public.main_topics for all using (auth.role() = 'authenticated');

-- 9. Policies for Sub Topics
create policy "Allow public read access for sub_topics" on public.sub_topics for select using (true);
create policy "Allow auth all access for sub_topics" on public.sub_topics for all using (auth.role() = 'authenticated');

-- 10. Policies for Subject Quizzes
create policy "Allow public read access for subject_quizzes" on public.subject_quizzes for select using (true);
create policy "Allow auth all access for subject_quizzes" on public.subject_quizzes for all using (auth.role() = 'authenticated');

-- 11. Policies for Subject Questions
create policy "Allow public read access for subject_questions" on public.subject_questions for select using (true);
create policy "Allow auth all access for subject_questions" on public.subject_questions for all using (auth.role() = 'authenticated');

-- 12. Add indexes
create index if not exists main_topics_subject_id_idx on public.main_topics(subject_id);
create index if not exists sub_topics_main_topic_id_idx on public.sub_topics(main_topic_id);
create index if not exists subject_quizzes_sub_topic_id_idx on public.subject_quizzes(sub_topic_id);
create index if not exists subject_questions_quiz_id_idx on public.subject_questions(quiz_id);
