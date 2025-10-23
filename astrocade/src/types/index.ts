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

// ============= 羁绊系统基础类型（需在 Character 之前定义） =============

/** 羁绊类型 */
export type BondType = 'element' | 'class' | 'faction' | 'rarity' | 'story';

/** 羁绊效果类型 */
export enum BondEffectType {
  // 基础属性
  HP_PERCENT = 'hp_percent',
  ATTACK_PERCENT = 'attack_percent',
  DEFENSE_PERCENT = 'defense_percent',
  
  // 伤害相关
  DAMAGE_PERCENT = 'damage_percent',
  ELEMENT_DAMAGE = 'element_damage',
  CRIT_RATE = 'crit_rate',
  CRIT_DAMAGE = 'crit_damage',
  
  // 技能相关
  SKILL_DAMAGE = 'skill_damage',
  SKILL_CD_REDUCTION = 'skill_cd_reduction',
  SKILL_RANGE = 'skill_range',
  
  // 防御相关
  DAMAGE_REDUCTION = 'damage_reduction',
  SHIELD = 'shield',
  HEAL_EFFECT = 'heal_effect',
  
  // 特殊效果
  MOVE_SPEED = 'move_speed',
  ATTACK_SPEED = 'attack_speed',
  DODGE = 'dodge',
  
  // 战斗机制
  REVIVE_CHANCE = 'revive_chance',
  HP_REGEN = 'hp_regen',
  COUNTER_ATTACK = 'counter_attack',
  
  // 养成向
  EXP_BONUS = 'exp_bonus',
  GOLD_BONUS = 'gold_bonus'
}

/** 羁绊效果目标 */
export type BondEffectTarget = 'all' | 'tagged' | 'specific';

/** 羁绊Buff（角色身上的） */
export interface BondBuff {
  bondId: string;
  bondName: string;
  effectType: BondEffectType;
  value: number;
  description: string;
}

/** 故事羁绊关系 */
export interface StoryBond {
  bondName: string;
  relatedCharacters: string[];
}

// ============= 角色类型定义 =============

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
  
  // 羁绊系统（暂时注释，待修复）
  // bondTags?: string[]; // 羁绊标签列表
  // storyBonds?: StoryBond[]; // 故事羁绊关系
  // bondBuffs?: BondBuff[]; // 当前激活的羁绊buff
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
  rarity?: CharacterRarity; // 新增：稀有度
  rarityBonus?: {
    hpMultiplier: number;
    attackMultiplier: number;
    specialBonus?: string;
  };
  
  // 羁绊系统
  bondTags?: string[]; // 羁绊标签列表
  storyBonds?: string[]; // 故事羁绊ID列表（简化格式）
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
  damageDealt?: number; // 本场战斗造成的总伤害（旧版，保留兼容）
  damageReceived?: number; // 本场战斗受到的总伤害（旧版，保留兼容）
  
  // 新增：详细战斗统计
  stats?: {
    totalDamageDealt: number;
    totalDamageTaken: number;
    totalHealDone: number;
    killCount: number;
    skillUsedCount: number;
    surviveTime: number;
    deathTime?: number;
  };
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

// ============= 新增：道具系统类型 =============

/** 角色稀有度 */
export type CharacterRarity = 'common' | 'rare' | 'epic';

/** 道具类型 */
export interface Item {
  id: string;
  name: string;
  type: 'consumable' | 'currency' | 'material';
  icon: string;
  description: string;
  stackable: boolean;
  maxStack: number;
  rarity: CharacterRarity;
}

// ============= 新增：招募系统类型 =============

/** 招募概率配置 */
export interface RarityProbability {
  common: number;
  rare: number;
  epic: number;
}

/** 保底系统 */
export interface PitySystem {
  rareCounter: number;
  epicCounter: number;
  lastRareAt: number;
  lastEpicAt: number;
}

/** 招募记录 */
export interface RecruitRecord {
  timestamp: number;
  characterId: string;
  rarity: CharacterRarity;
  isPity: boolean;
}

// ============= 新增：战斗统计类型 =============

/** 战斗统计 */
export interface CharacterBattleStats {
  characterId: string;
  characterName: string;
  element: ElementType;
  role: RoleType;
  totalDamageDealt: number;
  damagePercent: number;
  killCount: number;
  skillUsedCount: number;
  surviveTime: number;
  totalHealDone?: number;
  totalDamageTaken?: number;
}

/** 伤害来源统计 */
export interface DamageSource {
  sourceId: string;
  sourceName: string;
  sourceType: 'enemy' | 'environment' | 'skill' | 'boss_skill';
  totalDamageDealt: number;
  damagePercent: number;
  killCount: number;
  killedCharacters: string[];
  element?: ElementType;
}

/** 战斗结果数据 */
export interface BattleResultData {
  battleResult: 'victory' | 'defeat';
  battleTime: number;
  levelId: number;
  
  // 胜利数据
  playerStats?: {
    characters: CharacterBattleStats[];
    mvp: CharacterBattleStats;
    totalDamage: number;
    teamHpPercent: number;
  };
  
  // 失败数据
  defeatStats?: {
    damageSources: DamageSource[];
    primaryCause: DamageSource;
    suggestions: string[];
    surviveTime: number;
    remainingEnemies: number;
  };
  
  // 奖励
  rewards: {
    recruitTickets: number;
    exp: number;
  };
}

// ============= 羁绊系统复杂类型（依赖 Character） =============

/** 羁绊效果 */
export interface BondEffect {
  type: BondEffectType;
  target: BondEffectTarget;
  value: number;
  description: string;
  condition?: string;
}

/** 羁绊等级配置 */
export interface BondLevel {
  level: number;
  requiredCount: number;
  effects: BondEffect[];
}

/** 羁绊配置 */
export interface BondConfig {
  id: string;
  name: string;
  type: BondType;
  description: string;
  
  // 激活条件
  activation: {
    requiredTags: string[];
    minCount: number;
    maxCount?: number;
    exactCharacters?: string[];
  };
  
  // 等级效果
  levels: BondLevel[];
  
  // UI相关
  ui: {
    icon: string;
    color: string;
    priority: number;
  };
}

/** 应用的羁绊效果 */
export interface AppliedBondEffect {
  effect: BondEffect;
  targets: Character[];
  value: number;
}

/** 激活的羁绊 */
export interface ActivatedBond {
  bond: BondConfig;
  level: number;
  triggeredCharacters: Character[];
  effects: AppliedBondEffect[];
}

/** 羁绊系统状态 */
export interface BondSystemState {
  activatedBonds: ActivatedBond[];
  bondHistory: {
    bondId: string;
    activationCount: number;
    firstActivated: number;
  }[];
  bondAchievements: {
    allElementBonds: boolean;
    allClassBonds: boolean;
    legendary4Element: boolean;
  };
}

// 所有羁绊类型已通过 export interface/type/enum 声明时导出，无需重复导出
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
