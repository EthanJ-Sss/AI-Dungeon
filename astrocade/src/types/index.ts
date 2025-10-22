// 游戏核心类型定义

/** 攻击类型 */
export type AttackType = 'melee' | 'ranged';

/** 职业类型 */
export type RoleType = 'warrior' | 'archer' | 'assassin' | 'healer';

/** 元素类型 */
export type ElementType = 'fire' | 'ice' | 'earth' | 'water' | 'neutral';

/** 阵营类型 */
export type TeamType = 'player' | 'enemy';

/** 位置坐标 */
export interface Position {
  x: number;
  y: number;
}

/** 角色基础数据 */
export interface Character {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  damage: number;
  moveSpeed: number;
  attackType: AttackType;
  role: RoleType;
  element?: ElementType; // 元素属性
  skillId?: number; // 旧版单技能（兼容）
  skills?: string[]; // 新版技能ID列表（最多3个）
  passiveSkills?: string[]; // 被动技能ID列表
  level?: number;
  exp?: number; // 当前经验值
  expToNext?: number; // 升级所需经验
}

/** 技能类型 */
export type SkillType = 'damage' | 'heal' | 'teleport' | 'debuff' | 'control';

/** 目标类型 */
export type TargetType = 'enemy' | 'self' | 'ally' | 'area';

/** Debuff类型 */
export type DebuffType = 'slow' | 'taunt' | 'burn' | 'poison';

/** 技能配置 */
export interface SkillConfig {
  id: string;
  name: string;
  type: SkillType;
  cd: number; // 初始CD（秒）
  range: number; // 施法范围（像素）
  targetType: TargetType;
  damage?: number; // 伤害值
  heal?: number; // 治疗值（百分比，如20表示20%）
  teleportDistance?: number; // 瞬移距离（像素）
  debuffType?: DebuffType;
  debuffValue?: number; // Debuff效果值（百分比）
  debuffDuration?: number; // Debuff持续时间（秒）
  areaRadius?: number; // 范围技能半径（像素）
  description: string;
}

/** 技能数据（旧版兼容） */
export interface Skill {
  id: number;
  name: string;
  type: 'active' | 'passive';
  cd: number;
  currentCd?: number;
  range: number;
  damage?: number;
  effect: string;
}

/** 技能实例（战斗中使用） */
export interface SkillInstance {
  config: SkillConfig;
  currentCD: number; // 当前CD（秒）
  isReady: boolean; // 是否准备好
  lastUsedTime: number; // 上次使用时间（ms）
}

/** 俘虏数据 */
export interface Prisoner {
  characterId: string;
  name: string;
  hp: number;
  damage: number;
  attackType: AttackType;
  role: RoleType;
  skills: string[]; // 技能ID列表
}

/** 关卡配置 */
export interface LevelConfig {
  id: number;
  name: string;
  description?: string;
  difficulty?: string;
  scene: string;
  unlocked?: boolean;
  enemies: Array<{
    characterId: number;
    position: Position;
  }>;
  envEffect?: string;
  burnDamage?: number; // 火山关卡燃烧伤害（每秒）
  duration?: number; // 战斗时长（秒）
  lavaBlocks?: Array<{ row: number; col: number }>; // 岩浆地块位置
}

/** 预设角色配置 */
export interface PresetCharacter {
  id: string | number; // 支持新旧ID格式（string: "char_fire_001", number: 1）
  name: string;
  hp: number;
  damage: number;
  attackType: AttackType;
  moveSpeed: number;
  role: RoleType;
  element?: ElementType; // 元素属性
  skillId?: number;
  skills?: string[]; // ✅ 添加：技能ID列表
  passiveSkills?: string[]; // 被动技能ID列表
}

/** Debuff实例 */
export interface DebuffInstance {
  type: DebuffType;
  value: number; // 效果值（百分比）
  duration: number; // 剩余持续时间（秒）
  source?: string; // 来源单位ID
}

/** BUFF类型 */
export type BuffType = 'damage' | 'slow' | 'haste' | 'heal' 
  | 'attack_up' | 'attack_down' | 'stun' | 'shield' | 'combo';

/** BUFF配置 */
export interface BuffConfig {
  id: string;
  name: string;
  type: BuffType;
  description: string;
  damagePerSecond?: number; // 每秒伤害
  slowPercent?: number; // 减速百分比
  hastePercent?: number; // 加速百分比
  healPerSecond?: number; // 每秒治疗
  attackBonus?: number; // 攻击力加成百分比
  attackPenalty?: number; // 攻击力衰减百分比
  damageReduction?: number; // 伤害减免百分比
  duration: number; // 持续时间（秒）
  icon: string; // 图标
  color: string; // 颜色
}

/** BUFF实例 */
export interface BuffInstance {
  config: BuffConfig;
  remainingDuration: number; // 剩余持续时间（秒）
  lastTickTime: number; // 上次tick时间（ms）
}

/** 战斗单位（运行时） */
export interface BattleUnit {
  character: Character;
  position: Position;
  team: TeamType;
  isAlive: boolean;
  currentHp: number;
  skills: Skill[]; // 旧版技能（兼容）
  skillInstances?: SkillInstance[]; // 新版技能实例
  debuffs?: DebuffInstance[]; // Debuff列表
  buffs?: BuffInstance[]; // BUFF列表
  shield?: number; // 护盾值（土系被动等）
  damageDealt?: number; // 本场战斗造成的总伤害
  damageReceived?: number; // 本场战斗受到的总伤害
}

/** 阵型数据 */
export interface Formation {
  playerId: string;
  characterId: string;
  position: Position;
}

/** 升级配置 */
export interface CharacterLevelConfig {
  level: number;
  expRequired: number;
  hpBonus: number;
  damageBonus: number;
}

// 显式导出所有类型（解决 Vite HMR 缓存问题）
export type {
  AttackType,
  RoleType,
  ElementType,
  TeamType,
  SkillType,
  TargetType,
  DebuffType,
  BuffType,
};
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
