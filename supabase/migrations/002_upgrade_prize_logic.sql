-- ============================================================
-- 002_upgrade_prize_logic.sql
-- 抽奖系统概率优化与保留最高奖品
-- ============================================================

-- ============================================================
-- 辅助函数：获取奖品档次数值
-- ============================================================
create or replace function get_prize_rank(p_level prize_level)
returns integer as $$
begin
  return case p_level
    when '特等奖' then 5
    when '一等奖' then 4
    when '二等奖' then 3
    when '三等奖' then 2
    when '参与奖' then 1
  end;
end;
$$ language plpgsql immutable;

-- ============================================================
-- 主存储过程：带升级逻辑的抽奖
-- ============================================================
create or replace function execute_draw_with_upgrade(
  p_participant_id uuid,
  p_prize_id uuid,
  p_riddle_correct boolean,
  p_riddle_attempts integer
) returns uuid as $$
declare
  v_participant participants%rowtype;
  v_prize prizes%rowtype;
  v_old_record_id uuid;
  v_old_prize_id uuid;
  v_old_prize_level prize_level;
  v_new_rank integer;
  v_old_rank integer;
  v_record_id uuid;
begin
  -- 1. 行级锁：参与者
  select * into v_participant
  from participants
  where id = p_participant_id
  for update;

  if not found then
    raise exception 'participant_not_found';
  end if;

  if v_participant.used_chances >= v_participant.total_chances then
    raise exception 'no_chances_left';
  end if;

  -- 2. 行级锁：新奖品
  select * into v_prize
  from prizes
  where id = p_prize_id
  for update;

  if not found then
    raise exception 'prize_not_found';
  end if;

  if v_prize.remaining <= 0 then
    raise exception 'prize_exhausted';
  end if;

  -- 3. 获取新奖品档次
  v_new_rank := get_prize_rank(v_prize.level);

  -- 4. 查询用户当前最高档次记录
  select r.id, r.prize_id, r.prize_level, get_prize_rank(r.prize_level)
  into v_old_record_id, v_old_prize_id, v_old_prize_level, v_old_rank
  from records r
  where r.participant_id = p_participant_id
  order by get_prize_rank(r.prize_level) desc
  limit 1;

  -- 5. 比较档次
  if found and v_new_rank <= v_old_rank then
    -- 新奖品档次不高于旧奖品，拒绝但扣次数
    update participants
    set used_chances = used_chances + 1
    where id = p_participant_id;

    raise exception 'already_have_higher_prize:%', v_old_prize_level;
  end if;

  -- 6. 扣减抽奖次数
  update participants
  set used_chances = used_chances + 1
  where id = p_participant_id;

  -- 7. 若有旧记录，删除并恢复库存
  if found then
    update prizes
    set remaining = remaining + 1
    where id = v_old_prize_id;

    delete from records
    where id = v_old_record_id;
  end if;

  -- 8. 扣减新奖品库存
  update prizes
  set remaining = remaining - 1
  where id = p_prize_id;

  -- 9. 写入新记录
  insert into records (
    participant_id,
    participant_name,
    dept,
    prize_id,
    prize_name,
    prize_level,
    riddle_correct,
    riddle_attempts
  )
  values (
    p_participant_id,
    v_participant.name,
    v_participant.dept,
    p_prize_id,
    v_prize.name,
    v_prize.level,
    p_riddle_correct,
    p_riddle_attempts
  )
  returning id into v_record_id;

  return v_record_id;
end;
$$ language plpgsql security definer;
