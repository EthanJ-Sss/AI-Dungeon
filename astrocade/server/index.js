/**
 * 极简后端 API - 异步对战系统
 * 使用 JSON 文件存储，无需数据库
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 数据文件路径
const DATA_DIR = path.join(__dirname, 'data');
const PLAYERS_FILE = path.join(DATA_DIR, 'players.json');
const CHALLENGES_FILE = path.join(DATA_DIR, 'challenges.json');

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 确保数据目录和文件存在
async function initDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // 初始化玩家文件
    try {
      await fs.access(PLAYERS_FILE);
    } catch {
      await fs.writeFile(PLAYERS_FILE, JSON.stringify([], null, 2));
    }
    
    // 初始化挑战记录文件
    try {
      await fs.access(CHALLENGES_FILE);
    } catch {
      await fs.writeFile(CHALLENGES_FILE, JSON.stringify([], null, 2));
    }
    
    console.log('✅ 数据文件初始化完成');
  } catch (error) {
    console.error('❌ 数据文件初始化失败:', error);
  }
}

// 读取玩家数据
async function readPlayers() {
  const data = await fs.readFile(PLAYERS_FILE, 'utf-8');
  return JSON.parse(data);
}

// 写入玩家数据
async function writePlayers(players) {
  await fs.writeFile(PLAYERS_FILE, JSON.stringify(players, null, 2));
}

// 读取挑战记录
async function readChallenges() {
  const data = await fs.readFile(CHALLENGES_FILE, 'utf-8');
  return JSON.parse(data);
}

// 写入挑战记录
async function writeChallenges(challenges) {
  await fs.writeFile(CHALLENGES_FILE, JSON.stringify(challenges, null, 2));
}

// ============================================
// API 路由
// ============================================

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '异步对战系统运行中' });
});

// 检查昵称是否可用
app.get('/api/players/check/:playerName', async (req, res) => {
  try {
    const { playerName } = req.params;
    const players = await readPlayers();
    const exists = players.some(p => p.playerName === playerName);
    res.json({ available: !exists });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 注册新玩家
app.post('/api/players/register', async (req, res) => {
  try {
    const { playerName, defenseFormation } = req.body;
    
    const players = await readPlayers();
    
    // 检查昵称是否已存在
    if (players.some(p => p.playerName === playerName)) {
      return res.status(400).json({ error: '昵称已被占用' });
    }
    
    // 创建新玩家
    const newPlayer = {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      playerName,
      currentRank: null,
      highestRank: null,
      totalChallenges: 0,
      totalWins: 0,
      totalLosses: 0,
      totalDefenses: 0,
      defenseWins: 0,
      defenseLosses: 0,
      defenseFormation: defenseFormation || null,
      createdAt: new Date().toISOString(),
      lastActiveTime: new Date().toISOString(),
    };
    
    players.push(newPlayer);
    await writePlayers(players);
    
    res.json(newPlayer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 根据昵称获取玩家
app.get('/api/players/:playerName', async (req, res) => {
  try {
    const { playerName } = req.params;
    const players = await readPlayers();
    const player = players.find(p => p.playerName === playerName);
    
    if (!player) {
      return res.status(404).json({ error: '玩家不存在' });
    }
    
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取排行榜（前30名）
app.get('/api/leaderboard', async (req, res) => {
  try {
    const players = await readPlayers();
    
    // 筛选已上榜的玩家并排序
    const leaderboard = players
      .filter(p => p.currentRank !== null && p.currentRank <= 30)
      .sort((a, b) => a.currentRank - b.currentRank);
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 更新防守阵容
app.put('/api/players/:playerId/defense', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { defenseFormation } = req.body;
    
    const players = await readPlayers();
    const playerIndex = players.findIndex(p => p.id === playerId);
    
    if (playerIndex === -1) {
      return res.status(404).json({ error: '玩家不存在' });
    }
    
    players[playerIndex].defenseFormation = defenseFormation;
    players[playerIndex].lastActiveTime = new Date().toISOString();
    
    await writePlayers(players);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 提交挑战结果
app.post('/api/challenge', async (req, res) => {
  try {
    const { attackerId, defenderId, result, battleDuration, battleStats } = req.body;
    
    const players = await readPlayers();
    
    const attackerIndex = players.findIndex(p => p.id === attackerId);
    const defenderIndex = players.findIndex(p => p.id === defenderId);
    
    if (attackerIndex === -1 || defenderIndex === -1) {
      return res.status(404).json({ error: '玩家不存在' });
    }
    
    const attacker = players[attackerIndex];
    const defender = players[defenderIndex];
    
    const attackerRankBefore = attacker.currentRank;
    const defenderRankBefore = defender.currentRank;
    
    if (defenderRankBefore === null) {
      return res.status(400).json({ error: '被挑战者不在榜单上' });
    }
    
    // 更新战绩
    attacker.totalChallenges += 1;
    defender.totalDefenses += 1;
    
    let attackerNewRank = attackerRankBefore;
    let defenderNewRank = defenderRankBefore;
    let affectedCount = 0;
    
    if (result === 'attacker_win') {
      // 挑战成功
      attacker.totalWins += 1;
      defender.defenseLosses += 1;
      
      // 更新排名：挑战者取代防守者
      attackerNewRank = defenderRankBefore;
      
      // 防守者及其后的玩家排名+1
      players.forEach((p, idx) => {
        if (idx !== attackerIndex && p.currentRank !== null && p.currentRank >= defenderRankBefore) {
          if (p.currentRank < 30) {
            p.currentRank += 1;
            affectedCount++;
          } else if (p.currentRank === 30) {
            p.currentRank = null; // 挤出榜单
          }
        }
      });
      
      defenderNewRank = defenderRankBefore + 1;
      attacker.currentRank = attackerNewRank;
      defender.currentRank = defenderNewRank;
      
      // 更新最高排名
      if (attacker.highestRank === null || attackerNewRank < attacker.highestRank) {
        attacker.highestRank = attackerNewRank;
      }
    } else {
      // 挑战失败
      attacker.totalLosses += 1;
      defender.defenseWins += 1;
    }
    
    attacker.lastActiveTime = new Date().toISOString();
    defender.lastActiveTime = new Date().toISOString();
    
    await writePlayers(players);
    
    // 记录挑战历史
    const challenges = await readChallenges();
    challenges.push({
      id: `challenge_${Date.now()}`,
      attackerId,
      defenderId,
      result,
      attackerRankBefore,
      attackerRankAfter: attackerNewRank,
      defenderRankBefore,
      defenderRankAfter: defenderNewRank,
      battleDuration,
      battleStats,
      challengeTime: new Date().toISOString(),
    });
    
    // 只保留最近1000条记录
    if (challenges.length > 1000) {
      challenges.splice(0, challenges.length - 1000);
    }
    
    await writeChallenges(challenges);
    
    res.json({
      attackerNewRank,
      defenderNewRank,
      affectedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取挑战历史
app.get('/api/challenges/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    const challenges = await readChallenges();
    
    const playerChallenges = challenges
      .filter(c => c.attackerId === playerId || c.defenderId === playerId)
      .slice(-limit)
      .reverse();
    
    res.json(playerChallenges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 重置所有数据（仅用于测试）
app.post('/api/reset', async (req, res) => {
  try {
    await writePlayers([]);
    await writeChallenges([]);
    res.json({ success: true, message: '所有数据已重置' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 启动服务器
// ============================================

async function start() {
  await initDataFiles();
  
  app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║                                                        ║');
    console.log('║     🎮 异步对战系统后端 API 运行中 🎮                ║');
    console.log('║                                                        ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`✅ 服务器运行在: http://localhost:${PORT}`);
    console.log(`📁 数据保存在: ${DATA_DIR}`);
    console.log('');
    console.log('API 端点:');
    console.log(`  - GET    /api/health`);
    console.log(`  - GET    /api/players/check/:playerName`);
    console.log(`  - POST   /api/players/register`);
    console.log(`  - GET    /api/players/:playerName`);
    console.log(`  - GET    /api/leaderboard`);
    console.log(`  - PUT    /api/players/:playerId/defense`);
    console.log(`  - POST   /api/challenge`);
    console.log(`  - GET    /api/challenges/:playerId`);
    console.log('');
  });
}

start().catch(console.error);

