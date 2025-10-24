-- =========================================
-- 异步对战系统数据库结构
-- 在 Supabase SQL Editor 中执行此脚本
-- =========================================

-- 1. 创建玩家擂台数据表
CREATE TABLE IF NOT EXISTS ladder_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL UNIQUE,
  
  -- 排名信息
  current_rank INTEGER, -- 1-30 或 NULL（未上榜）
  highest_rank INTEGER,
  rank_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 挑战战绩
  total_challenges INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  
  -- 防守战绩
  total_defenses INTEGER DEFAULT 0,
  defense_wins INTEGER DEFAULT 0,
  defense_losses INTEGER DEFAULT 0,
  
  -- 防守阵容（JSON）
  defense_formation JSONB,
  
  -- 时间戳
  last_active_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 约束
  CONSTRAINT valid_rank CHECK (current_rank IS NULL OR (current_rank >= 1 AND current_rank <= 30)),
  CONSTRAINT valid_stats CHECK (
    total_challenges >= 0 AND
    total_wins >= 0 AND
    total_losses >= 0 AND
    total_defenses >= 0 AND
    defense_wins >= 0 AND
    defense_losses >= 0
  )
);

-- 2. 创建挑战记录表
CREATE TABLE IF NOT EXISTS challenge_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 参战双方
  attacker_id UUID REFERENCES ladder_players(id) ON DELETE CASCADE,
  defender_id UUID REFERENCES ladder_players(id) ON DELETE CASCADE,
  
  -- 战斗结果
  result TEXT NOT NULL CHECK (result IN ('attacker_win', 'defender_win')),
  
  -- 排名变化
  attacker_rank_before INTEGER,
  attacker_rank_after INTEGER,
  defender_rank_before INTEGER NOT NULL,
  defender_rank_after INTEGER NOT NULL,
  
  -- 战斗数据
  battle_duration INTEGER NOT NULL, -- 秒
  battle_stats JSONB, -- 战斗统计数据
  
  -- 时间戳
  challenge_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 索引
  INDEX idx_challenge_time (challenge_time DESC),
  INDEX idx_attacker (attacker_id, challenge_time DESC),
  INDEX idx_defender (defender_id, challenge_time DESC)
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_ladder_rank ON ladder_players(current_rank) WHERE current_rank IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ladder_updated ON ladder_players(rank_updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_player_name ON ladder_players(player_name);

-- 4. 创建更新时间戳触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ladder_players_updated_at 
  BEFORE UPDATE ON ladder_players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. 创建排行榜视图（前30名）
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
  id,
  player_name,
  current_rank,
  highest_rank,
  total_challenges,
  total_wins,
  total_losses,
  total_defenses,
  defense_wins,
  defense_losses,
  CASE 
    WHEN total_defenses > 0 THEN ROUND((defense_wins::NUMERIC / total_defenses::NUMERIC) * 100, 1)
    ELSE 0
  END AS defense_win_rate,
  defense_formation,
  last_active_time,
  rank_updated_at
FROM ladder_players
WHERE current_rank IS NOT NULL AND current_rank <= 30
ORDER BY current_rank ASC;

-- 6. 启用行级安全（RLS）- 简化版，所有人都可以读取排行榜
ALTER TABLE ladder_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_records ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取排行榜数据
CREATE POLICY "Anyone can view leaderboard"
  ON ladder_players FOR SELECT
  USING (true);

-- 允许所有人插入新玩家（注册）
CREATE POLICY "Anyone can register"
  ON ladder_players FOR INSERT
  WITH CHECK (true);

-- 只允许更新自己的数据（需要用户认证，暂时允许所有人）
CREATE POLICY "Anyone can update players"
  ON ladder_players FOR UPDATE
  USING (true);

-- 允许所有人查看挑战记录
CREATE POLICY "Anyone can view challenges"
  ON challenge_records FOR SELECT
  USING (true);

-- 允许所有人插入挑战记录
CREATE POLICY "Anyone can insert challenges"
  ON challenge_records FOR INSERT
  WITH CHECK (true);

-- 7. 创建辅助函数：更新排名
CREATE OR REPLACE FUNCTION update_rankings_after_challenge(
  p_attacker_id UUID,
  p_defender_id UUID,
  p_result TEXT
)
RETURNS TABLE (
  attacker_new_rank INTEGER,
  defender_new_rank INTEGER,
  affected_count INTEGER
) AS $$
DECLARE
  v_attacker_rank INTEGER;
  v_defender_rank INTEGER;
  v_affected_count INTEGER := 0;
BEGIN
  -- 获取当前排名
  SELECT current_rank INTO v_attacker_rank FROM ladder_players WHERE id = p_attacker_id;
  SELECT current_rank INTO v_defender_rank FROM ladder_players WHERE id = p_defender_id;
  
  -- 只有挑战成功才更新排名
  IF p_result = 'attacker_win' THEN
    -- 将防守者及其后的玩家排名+1
    UPDATE ladder_players
    SET current_rank = current_rank + 1
    WHERE current_rank >= v_defender_rank AND current_rank <= 30;
    
    GET DIAGNOSTICS v_affected_count = ROW_COUNT;
    
    -- 设置挑战者为防守者的排名
    UPDATE ladder_players
    SET current_rank = v_defender_rank,
        rank_updated_at = NOW(),
        highest_rank = CASE 
          WHEN highest_rank IS NULL OR v_defender_rank < highest_rank 
          THEN v_defender_rank 
          ELSE highest_rank 
        END
    WHERE id = p_attacker_id;
    
    -- 移除排名31的玩家（被挤出）
    UPDATE ladder_players
    SET current_rank = NULL
    WHERE current_rank = 31;
    
    RETURN QUERY SELECT v_defender_rank, v_defender_rank + 1, v_affected_count;
  ELSE
    -- 挑战失败，排名不变
    RETURN QUERY SELECT v_attacker_rank, v_defender_rank, 0;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 8. 初始化示例数据（可选，用于测试）
-- 你可以手动添加一些测试玩家


