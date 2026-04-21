create table if not exists users (
  id bigserial primary key,
  app_user_id text unique not null,
  is_premium boolean not null default false,
  premium_expires_at timestamptz,
  created_at timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

create table if not exists usage_daily (
  id bigserial primary key,
  app_user_id text not null,
  date_key text not null,
  review_count int not null default 0,
  conversation_turn_count int not null default 0,
  tts_count int not null default 0,
  stt_count int not null default 0,
  fallback_count int not null default 0,
  unique (app_user_id, date_key)
);

create table if not exists review_sessions (
  id bigserial primary key,
  app_user_id text not null,
  topic text not null,
  transcript text not null,
  corrected_text text,
  advanced_answer text,
  summary text,
  score int,
  grammar_score int,
  fluency_score int,
  pronunciation_score int,
  vocabulary_score int,
  is_fallback boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists conversation_sessions (
  id bigserial primary key,
  app_user_id text not null,
  mode text not null,
  roleplay text,
  learning_goal text,
  average_score int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists conversation_messages (
  id bigserial primary key,
  session_id bigint not null references conversation_sessions(id) on delete cascade,
  role text not null,
  text text not null,
  corrected_user_text text,
  quick_feedback text,
  grammar_score int,
  fluency_score int,
  naturalness_score int,
  pronunciation_tip text,
  is_fallback boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists usage_feature_trials (
  app_user_id text not null,
  feature_key text not null,
  count int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (app_user_id, feature_key)
);
