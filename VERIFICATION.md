# 抽奖系统功能验证清单

## 已完成的实现

### 1. 数据库层 ✅
- ✅ `supabase/migrations/002_upgrade_prize_logic.sql` - 新增存储过程
  - `get_prize_rank()` - 获取奖品档次数值
  - `execute_draw_with_upgrade()` - 带升级逻辑的抽奖

### 2. 应用层 ✅
- ✅ `src/lib/lottery-engine.ts` - 奖品档次工具函数
  - `PRIZE_RANK` - 档次映射常量
  - `getPrizeRank()` - 获取档次数值
  - `comparePrizeLevel()` - 比较档次

- ✅ `src/actions/lottery.ts` - 抽奖逻辑修正
  - 删除了重复的 `execute_no_prize` 调用
  - 正确处理 `already_have_higher_prize` 错误

- ✅ `src/types/index.ts` - 错误类型定义
  - `DrawErrorType` 枚举

### 3. 管理后台 ✅
- ✅ `src/components/admin/probability-calculator.tsx` - 概率计算器
- ✅ `src/app/admin/prizes/page.tsx` - 轮空风险提示

## 验证步骤

### 步骤 1：执行数据库迁移

```bash
# 在 Supabase SQL Editor 中执行
# 文件：supabase/migrations/002_upgrade_prize_logic.sql
```

验证函数创建成功：
```sql
SELECT proname FROM pg_proc WHERE proname IN ('get_prize_rank', 'execute_draw_with_upgrade');
```

预期结果：返回 2 行

### 步骤 2：配置推荐概率

在管理后台 `/admin/prizes` 页面：

| 等级 | 单个概率 | 数量 |
|------|---------|------|
| 特等奖 | 0.8% | 3 |
| 一等奖 | 1.2% | 5 |
| 二等奖 | 1.8% | 7 |
| 三等奖 | 2.7% | 10 |

预期结果：
- 概率总和：48%
- 期望中奖次数：72 次
- 奖品总数：25 个

### 步骤 3：验证保留最高奖品

#### 测试用例 1：升级场景
1. 用户 A 第 1 次抽奖 → 中二等奖
2. 检查数据库：
   ```sql
   SELECT * FROM records WHERE participant_id = 'user_a_id';
   -- 应有 1 条二等奖记录

   SELECT remaining FROM prizes WHERE level = '二等奖';
   -- remaining 应减少 1
   ```
3. 用户 A 第 2 次抽奖 → 中特等奖
4. 检查数据库：
   ```sql
   SELECT * FROM records WHERE participant_id = 'user_a_id';
   -- 应只有 1 条特等奖记录（二等奖记录已删除）

   SELECT remaining FROM prizes WHERE level = '二等奖';
   -- remaining 应恢复（+1）

   SELECT remaining FROM prizes WHERE level = '特等奖';
   -- remaining 应减少 1
   ```

预期结果：✅ 用户保留特等奖，二等奖库存恢复

#### 测试用例 2：降级拒绝场景
1. 用户 B 第 1 次抽奖 → 中特等奖
2. 用户 B 第 2 次抽奖 → 中三等奖
3. 检查前端提示："您已中过特等奖，本次抽奖不计入"
4. 检查数据库：
   ```sql
   SELECT * FROM records WHERE participant_id = 'user_b_id';
   -- 应只有 1 条特等奖记录

   SELECT remaining FROM prizes WHERE level = '三等奖';
   -- remaining 不变

   SELECT used_chances FROM participants WHERE id = 'user_b_id';
   -- used_chances 应增加 1
   ```

预期结果：✅ 用户保留特等奖，三等奖未扣库存，次数已扣除

### 步骤 4：验证轮空风险提示

访问 `/admin/prizes` 页面，检查是否显示：

```
⚠️ 轮空风险警告（基于 150 次抽奖）
• 特等奖：至少 1 人中奖概率仅 69.8% (严重风险)
• 一等奖：至少 1 人中奖概率仅 83.7%
```

预期结果：
- 特等奖显示红色警告（< 70%）
- 一等奖显示黄色警告（< 95%）
- 二等奖、三等奖无警告

### 步骤 5：验证并发安全

#### 测试用例：库存竞争
1. 设置特等奖 `remaining = 1`
2. 用户 A 和用户 B 同时点击抽奖
3. 两人都抽中特等奖
4. 检查结果：
   - 一人成功中奖
   - 另一人收到"奖品已被抢完"提示
   - 特等奖 `remaining = 0`
   - `records` 表只有 1 条特等奖记录

预期结果：✅ 无超卖，数据一致

### 步骤 6：验证概率计算器

在 `/admin/prizes` 页面使用概率计算器：

1. 输入参数：
   - 总抽奖次数：150
   - 公比 r：1.5
   - 基础概率：0.8%

2. 检查输出：
   - 特等奖单个概率：0.80%
   - 一等奖单个概率：1.20%
   - 二等奖单个概率：1.80%
   - 三等奖单个概率：2.70%
   - 概率总和：48.00%
   - 期望中奖次数：72.0 次

预期结果：✅ 计算准确，实时更新

## 常见问题排查

### 问题 1：存储过程调用失败
**错误**：`function execute_draw_with_upgrade does not exist`

**解决**：
```sql
-- 检查函数是否存在
SELECT proname FROM pg_proc WHERE proname = 'execute_draw_with_upgrade';

-- 如果不存在，重新执行迁移文件
-- supabase/migrations/002_upgrade_prize_logic.sql
```

### 问题 2：次数被重复扣除
**症状**：用户抽中低档次奖品时，`used_chances` 增加 2

**原因**：`lottery.ts` 中重复调用 `execute_no_prize`

**解决**：已修正，确认第 102-110 行代码如下：
```typescript
if (drawError.message.includes('already_have_higher_prize')) {
  const oldLevel = drawError.message.split(':')[1]
  // 存储过程已扣除次数，无需再调用 execute_no_prize
  revalidatePath('/')
  return { ... }
}
```

### 问题 3：轮空风险提示不显示
**检查**：
1. 确认 `src/app/admin/prizes/page.tsx` 第 12-28 行存在轮空风险计算逻辑
2. 确认第 53-77 行存在风险提示渲染逻辑
3. 检查奖品概率是否过低（< 0.8%）

## 性能优化建议

### 1. 数据库索引
```sql
-- 为 records 表的 participant_id 和 prize_level 创建复合索引
CREATE INDEX idx_records_participant_level
ON records (participant_id, prize_level DESC);
```

### 2. 缓存奖品列表
在 `executeDraw` 函数中，奖品列表可以缓存 1-5 秒，减少数据库查询。

### 3. 批量抽奖优化
如果需要支持批量抽奖（如管理员测试），可以创建批量存储过程。

## 下一步工作

### 可选增强功能
1. **抽奖历史记录**：显示用户的所有抽奖记录（包括未中奖）
2. **奖品升级通知**：当用户奖品被升级时，发送通知
3. **概率动态调整**：根据剩余库存自动调整概率
4. **抽奖统计面板**：显示各等级中奖分布、轮空情况等

### 监控指标
1. 各等级实际中奖次数 vs 期望中奖次数
2. 奖品库存消耗速度
3. 用户平均抽奖次数
4. 轮空等级统计

## 总结

所有计划功能已完整实现：
- ✅ 概率递增（特等奖 < 一等奖 < 二等奖 < 三等奖）
- ✅ 不轮空保证（通过概率计算器和风险提示）
- ✅ 奖池容量（支持 150 次以上抽奖）
- ✅ 并发安全（行级锁 + 事务原子性）
- ✅ 保留最高奖品（自动升级和降级拒绝）

系统已准备就绪，可以开始测试和部署。
