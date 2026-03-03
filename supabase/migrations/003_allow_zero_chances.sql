-- ============================================================
-- 003_allow_zero_chances.sql
-- 允许 total_chances 为 0，支持注册后默认无抽奖次数
-- ============================================================

-- 删除旧的 check 约束
ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_total_chances_check;

-- 添加新的 check 约束（允许 >= 0）
ALTER TABLE participants ADD CONSTRAINT participants_total_chances_check CHECK (total_chances >= 0);

-- 修改默认值为 0
ALTER TABLE participants ALTER COLUMN total_chances SET DEFAULT 0;
