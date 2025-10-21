# 🔥 火山主题技能设计文档

## 一、元素系统设计

### 1.1 元素类型
```typescript
type ElementType = 'fire' | 'ice' | 'earth' | 'water' | 'neutral';
```

### 1.2 元素克制关系
```
冰系 → 火系 (克制，+30%伤害)
火系 → 冰系 (被克，-20%伤害)
火系 → 火系 (免疫环境燃烧)
冰系 → 燃烧 (抗性50%)
大地系 → 岩浆喷发 (抗性30%)
```

### 1.3 元素属性扩展
```typescript
interface Character {
  // ... 现有属性
  element?: ElementType;           // 元素属性
  elementResistance?: {            // 元素抗性
    fire?: number;    // 火焰抗性 (0-100)
    ice?: number;     // 冰霜抗性
    earth?: number;   // 大地抗性
  };
}
```

---

## 二、主动技能设计

### 🔥 火系攻击技能

#### V_SKILL_001：火球爆裂
```json
{
  "id": "v_skill_001",
  "name": "火球爆裂",
  "element": "fire",
  "type": "area_damage",
  "cd": 5,
  "range": 250,
  "targetType": "enemy",
  "damage": 80,
  "areaRadius": 120,
  "description": "投掷火球造成80点伤害，并在目标位置爆炸，对120范围内敌人造成额外40点伤害",
  "specialEffect": "爆炸附加3秒灼烧(5点/秒)"
}
```

#### V_SKILL_002：烈焰冲击
```json
{
  "id": "v_skill_002",
  "name": "烈焰冲击",
  "element": "fire",
  "type": "dash_damage",
  "cd": 6,
  "range": 0,
  "targetType": "self",
  "dashDistance": 250,
  "damage": 60,
  "description": "向前冲刺250距离，撞击路径上的敌人造成60点伤害并点燃2秒",
  "specialEffect": "留下火焰轨迹，持续2秒，敌人经过受到20点/秒伤害"
}
```

#### V_SKILL_003：岩浆涌动
```json
{
  "id": "v_skill_003",
  "name": "岩浆涌动",
  "element": "fire",
  "type": "area_damage",
  "cd": 8,
  "range": 200,
  "targetType": "ground",
  "damage": 50,
  "areaRadius": 150,
  "description": "在指定地点召唤岩浆池，持续3秒，范围内敌人每秒受到30点伤害",
  "specialEffect": "岩浆池阻碍移动，减速50%"
}
```

#### V_SKILL_004：炎爆术
```json
{
  "id": "v_skill_004",
  "name": "炎爆术",
  "element": "fire",
  "type": "damage",
  "cd": 4,
  "range": 300,
  "targetType": "enemy",
  "damage": 100,
  "description": "对单个敌人造成100点火焰伤害，如果目标已灼烧，伤害+50%",
  "specialEffect": "击杀目标时爆炸，对周围敌人造成50点伤害"
}
```

---

### ❄️ 冰系控制技能

#### V_SKILL_005：冰霜护盾
```json
{
  "id": "v_skill_005",
  "name": "冰霜护盾",
  "element": "ice",
  "type": "buff_shield",
  "cd": 10,
  "range": 0,
  "targetType": "self",
  "shieldValue": 150,
  "duration": 5,
  "description": "为自己创造150点护盾，持续5秒。护盾存在期间，燃烧伤害降低80%",
  "specialEffect": "护盾破碎时对周围敌人造成30点冰霜伤害并减速2秒"
}
```

#### V_SKILL_006：寒冰箭
```json
{
  "id": "v_skill_006",
  "name": "寒冰箭",
  "element": "ice",
  "type": "damage_debuff",
  "cd": 4,
  "range": 300,
  "targetType": "enemy",
  "damage": 70,
  "debuffType": "slow",
  "debuffValue": 40,
  "debuffDuration": 3,
  "description": "发射寒冰箭造成70点伤害，减速目标40%持续3秒。对火系敌人额外+30%伤害",
  "specialEffect": "冻结地面，敌人经过时减速"
}
```

#### V_SKILL_007：极寒光环
```json
{
  "id": "v_skill_007",
  "name": "极寒光环",
  "element": "ice",
  "type": "aura_buff",
  "cd": 15,
  "range": 200,
  "targetType": "allies",
  "auraRadius": 200,
  "duration": 8,
  "description": "激活冰霜光环持续8秒，范围内友军燃烧伤害减少60%，对火系敌人伤害+20%",
  "specialEffect": "光环内敌人移速-20%"
}
```

#### V_SKILL_008：冰封打击
```json
{
  "id": "v_skill_008",
  "name": "冰封打击",
  "element": "ice",
  "type": "damage_control",
  "cd": 8,
  "range": 250,
  "targetType": "enemy",
  "damage": 90,
  "stunDuration": 2,
  "description": "冰霜能量凝聚成冰刺，造成90点伤害并冻结目标2秒",
  "specialEffect": "目标解冻后移速-30%持续3秒"
}
```

#### V_SKILL_009：冰川之怒
```json
{
  "id": "v_skill_009",
  "name": "冰川之怒",
  "element": "ice",
  "type": "area_damage",
  "cd": 12,
  "range": 0,
  "targetType": "area",
  "areaRadius": 250,
  "damage": 120,
  "description": "释放冰霜爆发，对周围所有敌人造成120点伤害，火系敌人受到额外50点伤害并冻结1.5秒",
  "specialEffect": "在地面留下寒冰区域3秒，燃烧效果无效"
}
```

---

### 🪨 大地系防御技能

#### V_SKILL_010：岩石护甲
```json
{
  "id": "v_skill_010",
  "name": "岩石护甲",
  "element": "earth",
  "type": "buff_defense",
  "cd": 12,
  "range": 0,
  "targetType": "self",
  "armorValue": 200,
  "duration": 6,
  "description": "化身岩石，获得200点护甲，持续6秒。岩浆喷发伤害-50%",
  "specialEffect": "护甲状态下免疫击退和定身"
}
```

#### V_SKILL_011：大地之力
```json
{
  "id": "v_skill_011",
  "name": "大地之力",
  "element": "earth",
  "type": "buff_heal",
  "cd": 10,
  "range": 0,
  "targetType": "self",
  "healPercent": 25,
  "description": "汲取大地能量，回复25%最大生命值，并在3秒内持续回复5%/秒",
  "specialEffect": "治疗期间，移速-30%但受到伤害-20%"
}
```

#### V_SKILL_012：地震冲击
```json
{
  "id": "v_skill_012",
  "name": "地震冲击",
  "element": "earth",
  "type": "area_control",
  "cd": 10,
  "range": 0,
  "targetType": "area",
  "areaRadius": 200,
  "damage": 50,
  "stunDuration": 1.5,
  "description": "重击地面，对周围敌人造成50点伤害并晕眩1.5秒",
  "specialEffect": "触发附近岩浆地块提前喷发"
}
```

---

### 💚 治疗辅助技能

#### V_SKILL_013：圣光庇护
```json
{
  "id": "v_skill_013",
  "name": "圣光庇护",
  "element": "neutral",
  "type": "area_heal",
  "cd": 8,
  "range": 200,
  "targetType": "allies",
  "areaRadius": 200,
  "healPercent": 20,
  "description": "治疗范围内所有友军20%最大生命值",
  "specialEffect": "消除燃烧效果，并在3秒内免疫燃烧"
}
```

#### V_SKILL_014：生命之泉
```json
{
  "id": "v_skill_014",
  "name": "生命之泉",
  "element": "water",
  "type": "area_heal_over_time",
  "cd": 15,
  "range": 150,
  "targetType": "ground",
  "areaRadius": 150,
  "healPerSecond": 15,
  "duration": 5,
  "description": "在地面创造治疗泉水，持续5秒，范围内友军每秒回复15HP",
  "specialEffect": "泉水区域内燃烧效果无效，但敌人也可获得治疗"
}
```

#### V_SKILL_015：急救术
```json
{
  "id": "v_skill_015",
  "name": "急救术",
  "element": "neutral",
  "type": "heal",
  "cd": 6,
  "range": 250,
  "targetType": "ally",
  "healPercent": 30,
  "description": "对单个友军回复30%最大生命值",
  "specialEffect": "如果目标生命低于30%，治疗量+50%"
}
```

---

### 🔥 Boss专属技能（仅2个）

#### BOSS_SKILL_01：炎魔之怒
```json
{
  "id": "boss_skill_01",
  "name": "炎魔之怒",
  "element": "fire",
  "type": "area_damage",
  "cd": 12,
  "range": 0,
  "targetType": "area",
  "areaRadius": 250,
  "damage": 100,
  "description": "释放炎魔之怒，对周围250范围内所有敌人造成100点火焰伤害",
  "specialEffect": "Boss周身爆发火焰特效"
}
```

#### BOSS_SKILL_02：熔岩召唤
```json
{
  "id": "boss_skill_02",
  "name": "熔岩召唤",
  "element": "fire",
  "type": "terrain_control",
  "cd": 20,
  "range": 0,
  "targetType": "ground",
  "summonDuration": 10,
  "eruptionInterval": 2,
  "eruptionDamage": 50,
  "description": "在战场中央额外召唤一个临时岩浆地块，持续10秒，每2秒喷发一次（伤害50点）",
  "specialEffect": "地面出现岩浆池，召唤期间持续威胁玩家阵型"
}
```

---

## 三、被动技能设计

### 🔥 火系被动

#### V_PASSIVE_001：烈焰之体
```json
{
  "id": "v_passive_001",
  "name": "烈焰之体",
  "element": "fire",
  "type": "elemental_immunity",
  "description": "免疫环境燃烧伤害",
  "effect": {
    "immunityType": "burn",
    "value": 100
  }
}
```

#### V_PASSIVE_002：火焰强化
```json
{
  "id": "v_passive_002",
  "name": "火焰强化",
  "element": "fire",
  "type": "damage_boost",
  "description": "火系技能伤害+20%",
  "effect": {
    "damageBonus": 20,
    "targetElement": "fire"
  }
}
```

#### V_PASSIVE_003：灼热光环
```json
{
  "id": "v_passive_003",
  "name": "灼热光环",
  "element": "fire",
  "type": "aura_damage",
  "description": "周围150范围内敌人每秒受到3点燃烧伤害",
  "effect": {
    "auraRadius": 150,
    "damagePerSecond": 3,
    "element": "fire"
  }
}
```

---

### ❄️ 冰系被动

#### V_PASSIVE_004：寒冰体质
```json
{
  "id": "v_passive_004",
  "name": "寒冰体质",
  "element": "ice",
  "type": "elemental_resistance",
  "description": "燃烧伤害减少50%",
  "effect": {
    "resistanceType": "burn",
    "value": 50
  }
}
```

#### V_PASSIVE_005：冰霜亲和
```json
{
  "id": "v_passive_005",
  "name": "冰霜亲和",
  "element": "ice",
  "type": "damage_bonus",
  "description": "对火系敌人伤害+30%",
  "effect": {
    "damageBonus": 30,
    "targetElement": "fire"
  }
}
```

#### V_PASSIVE_006：冰霜光环
```json
{
  "id": "v_passive_006",
  "name": "冰霜光环",
  "element": "ice",
  "type": "aura_support",
  "description": "周围200范围内友军燃烧伤害减少30%",
  "effect": {
    "auraRadius": 200,
    "burnReduction": 30,
    "targetType": "allies"
  }
}
```

#### V_PASSIVE_007：极寒之触
```json
{
  "id": "v_passive_007",
  "name": "极寒之触",
  "element": "ice",
  "type": "attack_debuff",
  "description": "普通攻击有30%几率减速目标2秒(20%)",
  "effect": {
    "procChance": 30,
    "slowPercent": 20,
    "duration": 2
  }
}
```

---

### 🪨 大地系被动

#### V_PASSIVE_008：坚岩之躯
```json
{
  "id": "v_passive_008",
  "name": "坚岩之躯",
  "element": "earth",
  "type": "damage_reduction",
  "description": "受到的岩浆喷发伤害减少40%",
  "effect": {
    "damageReduction": 40,
    "sourceType": "lava_eruption"
  }
}
```

#### V_PASSIVE_009：大地祝福
```json
{
  "id": "v_passive_009",
  "name": "大地祝福",
  "element": "earth",
  "type": "hp_regen",
  "description": "每秒回复1%最大生命值",
  "effect": {
    "regenPercent": 1,
    "tickRate": 1
  }
}
```

#### V_PASSIVE_010：岩石护甲
```json
{
  "id": "v_passive_010",
  "name": "岩石护甲",
  "element": "earth",
  "type": "defense_boost",
  "description": "受到伤害减少15%",
  "effect": {
    "damageReduction": 15
  }
}
```

---

### 💚 治疗系被动

#### V_PASSIVE_011：治疗强化
```json
{
  "id": "v_passive_011",
  "name": "治疗强化",
  "element": "neutral",
  "type": "heal_boost",
  "description": "治疗效果+30%",
  "effect": {
    "healBonus": 30
  }
}
```

#### V_PASSIVE_012：神圣守护
```json
{
  "id": "v_passive_012",
  "name": "神圣守护",
  "element": "neutral",
  "type": "auto_heal",
  "description": "生命值低于30%时，自动回复20%最大生命值（冷却60秒）",
  "effect": {
    "triggerThreshold": 30,
    "healPercent": 20,
    "cooldown": 60
  }
}
```

---

### 🔥 Boss专属被动（简化）

#### BOSS_PASSIVE_01：烈焰之体
```json
{
  "id": "boss_passive_01",
  "name": "烈焰之体",
  "element": "fire",
  "type": "immunity_resistance",
  "description": "免疫环境燃烧伤害。冰系对Boss伤害克制从+30%降为+20%（因为Boss有部分冰系抗性）",
  "effect": {
    "burnImmunity": 100,
    "iceResistance": 10
  }
}
```

**说明**：
- Boss 完全免疫燃烧伤害
- 冰系角色对 Boss 仍有优势，但优势从 +30% 降为 +20%（30% - 10% = 20%）
- 保持单一阶段，无复杂机制

---

## 四、技能组合建议

### 4.1 火系输出角色
**技能配置**：
- 主动1：火球爆裂 (AOE伤害)
- 主动2：炎爆术 (单体高伤)
- 被动：烈焰之体 + 火焰强化

**适用场景**：免疫燃烧，高输出，适合持久战

---

### 4.2 冰系控场角色
**技能配置**：
- 主动1：寒冰箭 (减速+伤害)
- 主动2：极寒光环 (团队增益)
- 被动：寒冰体质 + 冰霜亲和

**适用场景**：克制火系，减少燃烧伤害，控制节奏

---

### 4.3 大地系坦克
**技能配置**：
- 主动1：岩石护甲 (生存)
- 主动2：地震冲击 (控制)
- 被动：坚岩之躯 + 岩石护甲

**适用场景**：抗岩浆喷发，前排承伤，控制敌人

---

### 4.4 治疗辅助
**技能配置**：
- 主动1：圣光庇护 (群体治疗+驱散燃烧)
- 主动2：急救术 (单体救命)
- 被动：治疗强化 + 神圣守护

**适用场景**：团队生存保障，持续作战能力

---

### 4.5 完美队伍配置
```
角色1：冰系输出（极寒光环）
  - 提供团队燃烧抗性
  - 对Boss高伤害
  
角色2：冰系/大地坦克（冰霜护盾/岩石护甲）
  - 前排抗伤
  - 抵御岩浆喷发
  
角色3：治疗辅助（圣光庇护）
  - 驱散燃烧
  - 持续治疗
```

---

## 五、技能实现要点

### 5.1 元素伤害计算
```typescript
function calculateElementalDamage(
  baseDamage: number,
  attackerElement: ElementType,
  targetElement: ElementType
): number {
  let finalDamage = baseDamage;
  
  // 冰克火
  if (attackerElement === 'ice' && targetElement === 'fire') {
    finalDamage *= 1.3;
  }
  
  // 火对冰减伤
  if (attackerElement === 'fire' && targetElement === 'ice') {
    finalDamage *= 0.8;
  }
  
  return finalDamage;
}
```

### 5.2 燃烧伤害计算
```typescript
function calculateBurnDamage(
  baseBurnDamage: number,
  character: Character
): number {
  let finalDamage = baseBurnDamage;
  
  // 火系免疫
  if (character.element === 'fire') {
    return 0;
  }
  
  // 冰系减伤50%
  if (character.element === 'ice') {
    finalDamage *= 0.5;
  }
  
  // 被动技能减伤
  const burnReduction = getBurnReductionFromPassives(character);
  finalDamage *= (1 - burnReduction / 100);
  
  return Math.max(0, finalDamage);
}
```

### 5.3 岩浆喷发警告
```typescript
interface LavaEruption {
  position: { x: number; y: number };
  frequency: number; // 秒
  damage: number;
  warningTime: number; // 秒
}

function triggerLavaWarning(eruption: LavaEruption) {
  // 显示红色警告特效
  showWarningEffect(eruption.position, eruption.warningTime);
  
  // 延迟触发伤害
  setTimeout(() => {
    dealLavaDamage(eruption);
  }, eruption.warningTime * 1000);
}
```

---

## 六、平衡性数值表

### 6.1 伤害系数
| 技能类型 | 基础伤害 | CD | 范围 | 备注 |
|---------|---------|-----|-----|------|
| 单体伤害 | 70-100 | 4-6s | 250-300 | 标准输出 |
| AOE伤害 | 50-80 | 6-10s | 120-200 | 范围伤害 |
| 持续伤害 | 20-30/s | 8-12s | - | DOT技能 |
| 控制技能 | 30-50 | 8-12s | 200-250 | 附带控制 |

### 6.2 治疗系数
| 治疗类型 | 治疗量 | CD | 范围 | 备注 |
|---------|--------|-----|-----|------|
| 单体治疗 | 30% | 6s | 250 | 快速响应 |
| AOE治疗 | 20% | 8s | 200 | 团队治疗 |
| HOT治疗 | 15/s | 15s | 150 | 持续治疗 |

### 6.3 环境伤害（简化版）
| 关卡 | 燃烧伤害 | 岩浆喷发（统一） | 喷发周期 |
|------|---------|---------------|---------|
| 第1关 | 3/s | 50点 | 每10秒 |
| 第2关 | 5/s | 50点 | 每10秒 |
| 第3关 | 8/s | 50点 | 每10秒 |
| 第4关 | 12/s | 50点 | 每10秒 |
| 第5关(Boss) | 15/s | 50点 + Boss召唤 | 每10秒 + 临时2秒 |

**说明**：
- 所有关卡的岩浆喷发伤害统一为 50 点
- 固定 5 个地块，周期性喷发（错峰触发）
- Boss 战额外增加"熔岩召唤"技能，临时增加危险区域

---

## 七、测试要点

### 7.1 元素克制测试
- [ ] 冰系对火系伤害+30%生效
- [ ] 火系免疫燃烧生效
- [ ] 冰系燃烧减伤50%生效
- [ ] 大地系岩浆减伤生效

### 7.2 技能功能测试
- [ ] 所有主动技能可正常释放
- [ ] CD计算正确
- [ ] 伤害计算准确
- [ ] 特殊效果正常触发

### 7.3 被动技能测试
- [ ] 被动效果全程生效
- [ ] 多个被动可叠加
- [ ] 光环范围正确
- [ ] 触发型被动正确触发

---

## 八、Boss 设计总结（简化版）

### 8.1 核心理念
- ✅ **仅2个主动技能**：炎魔之怒（AOE伤害）+ 熔岩召唤（地形控制）
- ✅ **仅1个被动技能**：烈焰之体（免疫燃烧 + 部分冰系抗性）
- ✅ **单一阶段**：无血量阶段切换，无复活机制
- ✅ **简单清晰**：所有技能都与火焰/岩浆主题相关

### 8.2 Boss 战术要点
- **炎魔之怒**：范围 AOE，看到动画后拉开距离
- **熔岩召唤**：临时增加中央危险区域，远离中心
- **元素优势**：冰系角色仍有 +20% 伤害优势
- **时间压力**：60 秒限制，需要持续输出

### 8.3 推荐对策
- **最优配置**：2 个冰系输出 + 1 个治疗
- **走位技巧**：注意 Boss 技能前摇，及时拉开
- **治疗节奏**：燃烧伤害 15 点/秒，需要频繁治疗
- **岩浆规避**：Boss 召唤后立刻撤离中央

---

**设计版本**：v2.0 (Simplified Boss)  
**设计日期**：2024-10  
**设计者**：Game Design Team  
**最后修改**：简化 Boss 技能，仅保留 2 个主动技能和 1 个被动技能，与 level-design 保持一致

