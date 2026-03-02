-- ============================================================
-- 001_initial_schema.sql
-- 元宵灯谜抽奖大会 — 初始数据库结构
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- 参与者表（关联 auth.users）
-- ============================================================
create table participants (
  id            uuid primary key default uuid_generate_v4(),
  auth_user_id  uuid unique not null references auth.users(id) on delete cascade,
  name          text not null,
  dept          text not null default '',
  total_chances integer not null default 1 check (total_chances >= 1),
  used_chances  integer not null default 0 check (used_chances >= 0),
  created_at    timestamptz not null default now(),
  constraint used_not_exceed_total check (used_chances <= total_chances)
);

create index idx_participants_auth on participants (auth_user_id);

-- ============================================================
-- 奖品表
-- ============================================================
create type prize_level as enum ('特等奖','一等奖','二等奖','三等奖','参与奖');

create table prizes (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  level       prize_level not null default '参与奖',
  total       integer not null default 1 check (total >= 1),
  remaining   integer not null default 1 check (remaining >= 0),
  probability numeric(5,2) not null default 0 check (probability >= 0 and probability <= 100),
  created_at  timestamptz not null default now(),
  constraint remaining_not_exceed_total check (remaining <= total)
);

-- ============================================================
-- 灯谜表
-- ============================================================
create table riddles (
  id       serial primary key,
  riddle   text not null,
  category text not null,
  answer   text not null
);

-- ============================================================
-- 中奖记录表
-- ============================================================
create table records (
  id               uuid primary key default uuid_generate_v4(),
  participant_id   uuid not null references participants(id) on delete cascade,
  participant_name text not null,
  dept             text not null default '',
  prize_id         uuid not null references prizes(id) on delete cascade,
  prize_name       text not null,
  prize_level      prize_level not null,
  riddle_correct   boolean not null default false,
  riddle_attempts  integer not null default 0,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- 存储过程：中奖（原子扣减库存 + 次数 + 写记录）
-- ============================================================
create or replace function execute_draw(
  p_participant_id uuid,
  p_prize_id uuid,
  p_riddle_correct boolean,
  p_riddle_attempts integer
) returns uuid as $$
declare
  v_participant participants%rowtype;
  v_prize prizes%rowtype;
  v_record_id uuid;
begin
  -- 行级锁防并发
  select * into v_participant from participants where id = p_participant_id for update;
  if not found then raise exception 'participant_not_found'; end if;
  if v_participant.used_chances >= v_participant.total_chances then raise exception 'no_chances_left'; end if;

  select * into v_prize from prizes where id = p_prize_id for update;
  if not found then raise exception 'prize_not_found'; end if;
  if v_prize.remaining <= 0 then raise exception 'prize_exhausted'; end if;

  -- 扣减次数和库存
  update participants set used_chances = used_chances + 1 where id = p_participant_id;
  update prizes set remaining = remaining - 1 where id = p_prize_id;

  -- 写入中奖记录
  insert into records (participant_id, participant_name, dept, prize_id, prize_name, prize_level, riddle_correct, riddle_attempts)
  values (p_participant_id, v_participant.name, v_participant.dept, p_prize_id, v_prize.name, v_prize.level, p_riddle_correct, p_riddle_attempts)
  returning id into v_record_id;

  return v_record_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- 存储过程：未中奖（仅扣次数）
-- ============================================================
create or replace function execute_no_prize(p_participant_id uuid) returns void as $$
begin
  update participants set used_chances = used_chances + 1
    where id = p_participant_id and used_chances < total_chances;
  if not found then raise exception 'no_chances_left'; end if;
end;
$$ language plpgsql security definer;

-- ============================================================
-- RLS 策略
-- ============================================================
alter table participants enable row level security;
alter table prizes enable row level security;
alter table riddles enable row level security;
alter table records enable row level security;

-- participants：登录用户可读自己；admin 可读写全部
create policy "participants_select_own" on participants for select to authenticated
  using (auth_user_id = auth.uid() or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
create policy "participants_admin_insert" on participants for insert to authenticated
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
create policy "participants_admin_update" on participants for update to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
create policy "participants_admin_delete" on participants for delete to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- prizes：所有登录用户可读；admin 可写
create policy "prizes_select" on prizes for select to authenticated using (true);
create policy "prizes_admin_insert" on prizes for insert to authenticated
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
create policy "prizes_admin_update" on prizes for update to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
create policy "prizes_admin_delete" on prizes for delete to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- riddles：所有登录用户可读
create policy "riddles_select" on riddles for select to authenticated using (true);

-- records：登录用户可读自己的记录；admin 可读写全部
create policy "records_select_own" on records for select to authenticated
  using (
    participant_id in (select id from participants where auth_user_id = auth.uid())
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
create policy "records_admin_insert" on records for insert to authenticated
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
create policy "records_admin_delete" on records for delete to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
