create extension if not exists pgcrypto;

create table if not exists public.student_profiles (
    id uuid primary key default gen_random_uuid(),
    lesson_code text not null,
    learner_id text not null,
    created_at timestamptz not null default now(),
    constraint student_profiles_lesson_code_format
        check (lesson_code = upper(lesson_code) and lesson_code ~ '^[A-Z0-9_-]{1,24}$'),
    constraint student_profiles_learner_id_format
        check (learner_id = upper(learner_id) and learner_id ~ '^[A-Z0-9]{4,24}$'),
    constraint student_profiles_lesson_learner_unique unique (lesson_code, learner_id)
);

create table if not exists public.student_progress (
    student_id uuid not null references public.student_profiles(id) on delete cascade,
    task_lection_id text not null,
    status text not null check (status in ('green', 'yellow', 'red')),
    updated_at timestamptz not null default now(),
    constraint student_progress_task_format check (task_lection_id ~ '^[A-Za-z0-9_-]{1,64}$'),
    constraint student_progress_student_task_unique unique (student_id, task_lection_id)
);

create or replace function public.set_student_progress_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists student_progress_updated_at on public.student_progress;
create trigger student_progress_updated_at
before update on public.student_progress
for each row execute function public.set_student_progress_updated_at();

alter table public.student_profiles enable row level security;
alter table public.student_progress enable row level security;

revoke all on public.student_profiles from anon, authenticated;
revoke all on public.student_progress from anon, authenticated;
grant all on public.student_profiles to service_role;
grant all on public.student_progress to service_role;
