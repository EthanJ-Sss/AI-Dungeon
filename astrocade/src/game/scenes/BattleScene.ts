import Phaser from 'phaser';
import { useGameStore } from '../../store/gameStore';
import { usePlayerStore } from '../../store/playerStore';
import { SkillManager } from '../SkillManager';
import { BuffManager } from '../BuffManager';
import { calculateBurnDamage, calculateLavaDamage, calculateElementalDamage } from '../ElementManager';
import type { Character, BattleUnit, Position, SkillInstance, DebuffInstance, PresetCharacter } from '../../types';
import charactersData from '../../config/characters.json';
import volcanoCharactersData from '../../config/volcanoCharacters.json';

export default class BattleScene extends Phaser.Scene {
  private playerUnits: BattleUnit[] = [];
  private enemyUnits: BattleUnit[] = [];
  private allUnits: Map<string, Phaser.GameObjects.Container> = new Map();
  private battleTimer: number = 30;
  private timerText?: Phaser.GameObjects.Text;
  private battleEnded: boolean = false;
  
  // 棋盘配置：5行×11列（在敌方右侧增加一列空白列）
  private gridSize = 56;
  private gridRows = 5;
  private gridCols = 11;
  private gridOffsetX = 150;
  private gridOffsetY = 130;
  
  // 我方区域（左侧）：列1-3，行1-3（3×3）
  private playerArea = { rowStart: 1, rowEnd: 3, colStart: 1, colEnd: 3 };
  // 敌方区域（右侧）：列8-10，行1-3（3×3，右移一格）
  private enemyArea = { rowStart: 1, rowEnd: 3, colStart: 8, colEnd: 10 };
  
  // 移动速度提升
  private moveSpeedMultiplier = 5;

  // 岩浆地块配置（从关卡配置读取，每关不同）
  private lavaBlocks: Array<{ row: number; col: number; offsetTime: number }> = [];
  private lavaInterval = 10000; // 喷发间隔（10秒）
  private lavaWarningTime = 1500; // 警告时间（1.5秒）
  private lavaDamage = 80; // 岩浆伤害
  private lavaMarkers: Map<string, Phaser.GameObjects.Rectangle> = new Map();

  constructor() {
    super({ key: 'BattleScene' });
  }

  create() {
    // 重置战斗状态
    this.battleEnded = false;
    this.playerUnits = [];
    this.enemyUnits = [];
    this.allUnits.clear();
    
    // 检测是否为Boss关卡
    const currentLevel = useGameStore.getState().currentLevel;
    const isBossLevel = currentLevel?.id === 5; // 火山关卡的Boss是第5关
    this.battleTimer = isBossLevel ? 60 : (currentLevel?.duration || 30); // 使用关卡配置的时长
    
    console.log(`[BattleScene] 关卡ID: ${currentLevel?.id}, 是否为Boss战: ${isBossLevel}, 战斗时长: ${this.battleTimer}秒`);
    
    // 初始化技能管理器
    SkillManager.initialize();
    
    // 初始化BUFF管理器
    BuffManager.init();
    
    // 添加背景（火山场景为深红色）
    const isVolcano = currentLevel?.scene === 'volcano';
    const bgColor = isVolcano ? 0x3d1a1a : 0x1a1a2e;
    this.add.rectangle(600, 350, 1200, 700, bgColor);
    
    // 添加标题
    const levelName = currentLevel?.name || '战斗场景';
    this.add.text(600, 30, levelName, {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 添加计时器
    this.timerText = this.add.text(600, 70, `时间: ${this.battleTimer}s`, {
      fontSize: '24px',
      color: '#ffcc00',
    }).setOrigin(0.5);

    // 添加环境信息显示（火山关卡）
    if (isVolcano && currentLevel?.burnDamage && currentLevel.burnDamage > 0) {
      this.add.text(50, 70, `🔥 燃烧: ${currentLevel.burnDamage}/秒`, {
        fontSize: '20px',
        color: '#ff6600',
        fontStyle: 'bold',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 },
      });

      this.add.text(50, 100, `🌋 岩浆: 80伤害/10秒`, {
        fontSize: '18px',
        color: '#ff9900',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 },
      });
    }

    // 绘制战场网格
    this.drawBattleGrid();

    // 从关卡配置加载岩浆地块（每关不同）
    if (currentLevel?.lavaBlocks && currentLevel.lavaBlocks.length > 0) {
      this.lavaBlocks = currentLevel.lavaBlocks.map((block, index) => ({
        ...block,
        offsetTime: index * 2000, // 每个地块间隔2秒开始喷发
      }));
    } else {
      // 如果关卡没有配置岩浆，使用空数组
      this.lavaBlocks = [];
    }

    // 初始化岩浆地块标记
    this.initializeLavaBlocks();

    // 生成战斗单位
    this.generateBattleUnits();

    // 执行刺客背刺瞬移
    this.executeAssassinBackstab();

    // 应用环境BUFF
    this.applyEnvironmentalBuffs();

    // 启动计时器
    this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // 启动燃烧系统（每秒触发）
    this.time.addEvent({
      delay: 1000,
      callback: this.applyBurnDamage,
      callbackScope: this,
      loop: true,
    });

    // 启动岩浆喷发系统
    this.startLavaEruptions();

    // 启动AI系统（每100ms更新一次）
    this.time.addEvent({
      delay: 100,
      callback: this.updateAI,
      callbackScope: this,
      loop: true,
    });

    // 启动技能CD更新（每100ms更新一次）
    this.time.addEvent({
      delay: 100,
      callback: this.updateSkillCD,
      callbackScope: this,
      loop: true,
    });

    // 启动Debuff更新（每100ms更新一次）
    this.time.addEvent({
      delay: 100,
      callback: this.updateDebuffs,
      callbackScope: this,
      loop: true,
    });

    // 启动BUFF更新（每100ms更新一次）
    this.time.addEvent({
      delay: 100,
      callback: this.updateBuffs,
      callbackScope: this,
      loop: true,
    });

    // 添加返回按钮
    this.addBackButton();
  }

  private drawBattleGrid() {
    const graphics = this.add.graphics();
    
    // 绘制完整的5×11棋盘（灰色，细线）与布阵界面完全一致
    graphics.lineStyle(1, 0x666666, 0.3);
    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        const posX = this.gridOffsetX + col * this.gridSize;
        const posY = this.gridOffsetY + row * this.gridSize;
        graphics.strokeRect(posX, posY, this.gridSize, this.gridSize);
      }
    }

    // 添加列坐标标签（上方）
    for (let col = 0; col < this.gridCols; col++) {
      const x = this.gridOffsetX + col * this.gridSize + this.gridSize / 2;
      const y = this.gridOffsetY - 15;
      this.add.text(x, y, `${col}`, {
        fontSize: '14px',
        color: '#888888',
      }).setOrigin(0.5);
    }

    // 添加行坐标标签（左侧）
    for (let row = 0; row < this.gridRows; row++) {
      const x = this.gridOffsetX - 20;
      const y = this.gridOffsetY + row * this.gridSize + this.gridSize / 2;
      this.add.text(x, y, `${row}`, {
        fontSize: '14px',
        color: '#888888',
      }).setOrigin(0.5);
    }

    // 高亮我方区域（蓝色背景）- 列1-3，行1-3
    const playerX = this.gridOffsetX + this.playerArea.colStart * this.gridSize;
    const playerY = this.gridOffsetY + this.playerArea.rowStart * this.gridSize;
    const playerWidth = (this.playerArea.colEnd - this.playerArea.colStart + 1) * this.gridSize;
    const playerHeight = (this.playerArea.rowEnd - this.playerArea.rowStart + 1) * this.gridSize;
    
    graphics.fillStyle(0x4488ff, 0.15);
    graphics.fillRect(playerX, playerY, playerWidth, playerHeight);
    graphics.lineStyle(2, 0x4488ff, 0.8);
    graphics.strokeRect(playerX, playerY, playerWidth, playerHeight);

    // 高亮敌方区域（红色背景）- 列8-10，行1-3
    const enemyX = this.gridOffsetX + this.enemyArea.colStart * this.gridSize;
    const enemyY = this.gridOffsetY + this.enemyArea.rowStart * this.gridSize;
    const enemyWidth = (this.enemyArea.colEnd - this.enemyArea.colStart + 1) * this.gridSize;
    const enemyHeight = (this.enemyArea.rowEnd - this.enemyArea.rowStart + 1) * this.gridSize;
    
    graphics.fillStyle(0xff4444, 0.15);
    graphics.fillRect(enemyX, enemyY, enemyWidth, enemyHeight);
    graphics.lineStyle(2, 0xff4444, 0.8);
    graphics.strokeRect(enemyX, enemyY, enemyWidth, enemyHeight);

    // 添加阵营标签
    this.add.text(playerX + playerWidth / 2, playerY - 25, '🛡️ 我方', {
      fontSize: '16px',
      color: '#4488ff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(enemyX + enemyWidth / 2, enemyY - 25, '⚔️ 敌方', {
      fontSize: '16px',
      color: '#ff4444',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  private generateBattleUnits() {
    const gameState = useGameStore.getState();
    const playerState = usePlayerStore.getState();
    const currentLevel = gameState.currentLevel;

    console.log(`\n⚔️ ========== 战斗开始 ==========`);
    console.log(`📍 关卡: ${currentLevel?.name || '未知'}`);
    console.log(`⏱️ 时长: ${this.battleTimer}秒`);
    console.log(`\n🛡️ 我方阵容:`);
    console.log(`   [调试] playerFormation长度: ${gameState.playerFormation.length}`);
    console.log(`   [调试] playerState.characters长度: ${playerState.characters.length}`);

    // 生成玩家单位
    gameState.playerFormation.forEach((formation, index) => {
      console.log(`   [调试] 阵型${index}: characterId=${formation.characterId}, position=(${formation.position.x}, ${formation.position.y})`);
      const character = playerState.characters.find(c => c.id === formation.characterId);
      if (character) {
        const elementIcon = this.getElementIcon(character.element);
        const roleEmoji = this.getRoleEmoji(character.role);
        console.log(`   ${roleEmoji}${elementIcon} ${character.name} (HP: ${character.hp})`);
        const unit = this.createBattleUnit(character, formation.position, 'player');
        this.playerUnits.push(unit);
      } else {
        console.warn(`   ⚠️ [角色丢失] 找不到角色ID: ${formation.characterId}`);
        console.warn(`   [调试] 可用角色IDs: ${playerState.characters.map(c => c.id).join(', ')}`);
      }
    });

    console.log(`\n⚔️ 敌方阵容:`);

    // 生成敌方单位
    if (gameState.currentLevel) {
      gameState.currentLevel.enemies.forEach((enemy, index) => {
        // ✅ 修复：从配置文件读取敌人角色数据（支持旧角色和火山角色）
        const allCharacters = [...charactersData, ...volcanoCharactersData];
        const presetChar = allCharacters.find(c => c.id === enemy.characterId) as PresetCharacter;
        
        if (!presetChar) {
          console.warn(`[BattleScene] 找不到角色配置 ID: ${enemy.characterId}`);
          return;
        }

        // 创建敌人角色（使用配置的技能）
        const enemyChar: Character = {
          id: `enemy_${enemy.characterId}_${Date.now()}_${index}`,
          name: `敌方-${presetChar.name}`,
          hp: presetChar.hp,
          maxHp: presetChar.hp,
          damage: presetChar.damage,
          moveSpeed: presetChar.moveSpeed,
          attackType: presetChar.attackType,
          role: presetChar.role,
          element: presetChar.element, // ✅ 添加元素属性
          skills: presetChar.skills || [], // ✅ 使用配置中的技能
          passiveSkills: presetChar.passiveSkills || [], // ✅ 添加被动技能
        };
        
        const elementIcon = this.getElementIcon(enemyChar.element);
        const roleEmoji = this.getRoleEmoji(enemyChar.role);
        console.log(`   ${roleEmoji}${elementIcon} ${presetChar.name} (HP: ${enemyChar.hp})`);
        
        const unit = this.createBattleUnit(enemyChar, enemy.position, 'enemy');
        this.enemyUnits.push(unit);
      });
    }
    
    console.log(`\n================================\n`);
    
    // 延迟检查角色容器状态（战斗开始0.5秒后）
    this.time.delayedCall(500, () => {
      console.log(`\n🔍 [容器检查] 战斗开始0.5秒后，检查所有角色容器状态:`);
      this.allUnits.forEach((container, characterId) => {
        const unit = (container as any).battleUnit as BattleUnit;
        if (unit) {
          console.log(`   ${unit.team === 'player' ? '🛡️' : '⚔️'} ${unit.character.name}: 存活=${unit.isAlive}, HP=${unit.currentHp.toFixed(0)}, 容器active=${container.active}, 可见=${container.visible}, alpha=${container.alpha}`);
        }
      });
      console.log(`   总计: ${this.allUnits.size} 个容器\n`);
    });
  }

  /**
   * 执行刺客背刺瞬移
   * 刺客在战斗开始时瞬移到敌人身后
   */
  private executeAssassinBackstab() {
    const allUnits = [...this.playerUnits, ...this.enemyUnits];
    
    allUnits.forEach((unit) => {
      // 检查是否是刺客
      if (unit.character.role !== 'assassin' || !unit.isAlive) return;
      
      const container = this.allUnits.get(unit.character.id);
      if (!container) return;
      
      // 确定目标列（我方刺客跳到列10，敌方刺客跳到列0）
      const targetCol = unit.team === 'player' ? 10 : 0;
      
      // 获取当前网格位置
      const currentRow = Math.round((container.y - this.gridOffsetY) / this.gridSize);
      
      // 查找最近的空位置（如果目标位置被占用）
      const finalCol = this.findNearestEmptyColumn(currentRow, targetCol, allUnits);
      
      // 计算新的世界坐标
      const newX = this.gridOffsetX + finalCol * this.gridSize + this.gridSize / 2;
      const newY = container.y; // 保持同一行
      
      // 起点瞬移特效
      const flash = this.add.circle(container.x, container.y, 30, 0x9900ff, 0.8);
      this.tweens.add({
        targets: flash,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 300,
        onComplete: () => flash.destroy()
      });
      
      // 移动刺客
      container.setPosition(newX, newY);
      unit.position.x = newX;
      unit.position.y = newY;
      
      // 终点瞬移特效
      const flash2 = this.add.circle(newX, newY, 30, 0x9900ff, 0.8);
      this.tweens.add({
        targets: flash2,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 300,
        onComplete: () => flash2.destroy()
      });
      
      console.log(`🗡️ [刺客瞬移] ${unit.character.name} 跳到了敌人身后: 列${finalCol}`);
    });
  }

  /**
   * 查找最近的空列
   */
  private findNearestEmptyColumn(row: number, targetCol: number, allUnits: BattleUnit[]): number {
    // 检查目标位置是否被占用
    const occupiedCols = new Set<number>();
    allUnits.forEach(unit => {
      const container = this.allUnits.get(unit.character.id);
      if (!container) return;
      const unitCol = Math.round((container.x - this.gridOffsetX) / this.gridSize);
      const unitRow = Math.round((container.y - this.gridOffsetY) / this.gridSize);
      if (unitRow === row) {
        occupiedCols.add(unitCol);
      }
    });
    
    if (!occupiedCols.has(targetCol)) {
      return targetCol;
    }
    
    // 查找最近的空列
    for (let offset = 1; offset <= this.gridCols; offset++) {
      const left = targetCol - offset;
      const right = targetCol + offset;
      
      if (left >= 0 && !occupiedCols.has(left)) return left;
      if (right < this.gridCols && !occupiedCols.has(right)) return right;
    }
    
    return targetCol; // 降级方案
  }

  private createBattleUnit(character: Character, gridPos: Position, team: 'player' | 'enemy'): BattleUnit {
    // 将本地网格坐标(0-2)转换为全局棋盘坐标
    const area = team === 'player' ? this.playerArea : this.enemyArea;
    const globalCol = area.colStart + gridPos.x;
    const globalRow = area.rowStart + gridPos.y;
    
    // 验证：确保角色不在行0和行4
    if (globalRow < 1 || globalRow > 3) {
      console.error(`[BattleScene] ❌ 角色位置无效: ${character.name}, row=${globalRow}, col=${globalCol}`);
      console.error(`   本地坐标: (${gridPos.x}, ${gridPos.y}), 阵营: ${team}`);
      // 强制修正到有效范围
      const correctedRow = Math.max(1, Math.min(3, globalRow));
      console.warn(`   已修正为: row=${correctedRow}`);
    }
    
    // 计算世界坐标（像素位置）
    const worldX = this.gridOffsetX + globalCol * this.gridSize + this.gridSize / 2;
    const worldY = this.gridOffsetY + globalRow * this.gridSize + this.gridSize / 2;

    // 创建角色容器
    const container = this.add.container(worldX, worldY);

    // 使用方框背景（和布阵界面一致）
    const boxColor = team === 'player' ? 0x4488ff : 0xff4444;
    const boxBg = this.add.rectangle(0, 0, this.gridSize - 8, this.gridSize - 8, boxColor, 0.3);
    const boxBorder = this.add.rectangle(0, 0, this.gridSize - 8, this.gridSize - 8)
      .setStrokeStyle(2, boxColor, 1)
      .setFillStyle(0x000000, 0);
    container.add(boxBg);
    container.add(boxBorder);

    // 添加职业emoji图标
    const roleEmoji = this.getRoleEmoji(character.role);
    const roleIcon = this.add.text(0, -8, roleEmoji, {
      fontSize: '24px',
    }).setOrigin(0.5);
    container.add(roleIcon);

    // 添加元素图标（小号，显示在旁边）
    const elementIcon = this.getElementIcon(character.element);
    if (elementIcon) {
      const elementText = this.add.text(12, -8, elementIcon, {
        fontSize: '12px',
      }).setOrigin(0.5);
      container.add(elementText);
    }

    // 添加角色名称（简短版本）
    const shortName = character.name.slice(0, 4);
    const nameText = this.add.text(0, 8, shortName, {
      fontSize: '10px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    container.add(nameText);

    // 添加HP文字（显示在底部）
    const hpText = this.add.text(0, 20, `${character.hp}`, {
      fontSize: '10px',
      color: '#00ff00',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    container.add(hpText);

    // 创建技能实例
    const skillInstances: SkillInstance[] = character.skills 
      ? SkillManager.createSkillInstances(character.skills)
      : [];

    // 创建战斗单位数据
    const unit: BattleUnit = {
      character: { ...character },
      position: { x: worldX, y: worldY },
      team,
      isAlive: true,
      currentHp: character.hp,
      skills: [],
      skillInstances,
      debuffs: [],
    };

    // 保存容器引用
    this.allUnits.set(character.id, container);

    // 存储数据到容器
    (container as any).battleUnit = unit;
    (container as any).hpText = hpText;
    (container as any).lastAttackTime = 0;
    (container as any).attackCooldown = character.attackType === 'melee' ? 1000 : 1500;

    console.log(`✅ [角色创建] ${team === 'player' ? '🛡️' : '⚔️'} ${character.name} 生成在网格(${globalRow}, ${globalCol}) 世界坐标(${worldX.toFixed(0)}, ${worldY.toFixed(0)}) HP:${character.hp}`);

    return unit;
  }

  private updateAI() {
    // 如果战斗已结束，停止AI更新
    if (this.battleEnded) return;
    
    // 更新所有存活单位的AI
    [...this.playerUnits, ...this.enemyUnits].forEach((unit) => {
      if (!unit.isAlive) return;

      const container = this.allUnits.get(unit.character.id);
      if (!container || !container.active) return;

      // 获取目标（最近的敌人）
      const targets = unit.team === 'player' ? this.enemyUnits : this.playerUnits;
      const aliveTargets = targets.filter(t => t.isAlive);
      
      if (aliveTargets.length === 0) {
        this.checkBattleEnd();
        return;
      }

      // 优先尝试释放技能（每秒最多尝试一次，减少日志刷屏）
      const now = this.time.now;
      const lastTrySkillTime = (unit as any).lastTrySkillTime || 0;
      if (now - lastTrySkillTime >= 1000) { // 每秒尝试一次
        (unit as any).lastTrySkillTime = now;
        const skillUsed = this.tryUseSkill(unit, aliveTargets, container);
        if (skillUsed) return; // 如果释放了技能，本次AI循环结束
      }

      // 检查是否被嘲讽，如果是则强制攻击嘲讽来源
      let closestTarget = this.getTauntTarget(unit);
      if (!closestTarget) {
        closestTarget = this.findClosestTarget(unit, aliveTargets);
      }
      if (!closestTarget) return;

      const targetContainer = this.allUnits.get(closestTarget.character.id);
      if (!targetContainer || !targetContainer.active) return;

      // 计算距离
      const distance = Phaser.Math.Distance.Between(
        container.x, container.y,
        targetContainer.x, targetContainer.y
      );

      // 攻击范围（近战80，远程200）
      const attackRange = unit.character.attackType === 'melee' ? 80 : 200;

      if (distance <= attackRange) {
        // 在攻击范围内，尝试攻击
        this.tryAttack(unit, closestTarget, container, targetContainer);
      } else {
        // 不在范围内，移动靠近（应用减速效果）
        const effectiveSpeed = this.getEffectiveMoveSpeed(unit);
        this.moveTowards(container, targetContainer, effectiveSpeed);
      }
    });
  }

  private findClosestTarget(unit: BattleUnit, targets: BattleUnit[]): BattleUnit | null {
    const container = this.allUnits.get(unit.character.id);
    if (!container || !container.active) return null;

    let closest: BattleUnit | null = null;
    let minDistance = Infinity;

    targets.forEach((target) => {
      if (!target.isAlive) return;
      
      const targetContainer = this.allUnits.get(target.character.id);
      if (!targetContainer || !targetContainer.active) return;

      const distance = Phaser.Math.Distance.Between(
        container.x, container.y,
        targetContainer.x, targetContainer.y
      );

      if (distance < minDistance) {
        minDistance = distance;
        closest = target;
      }
    });

    return closest;
  }

  private moveTowards(
    attacker: Phaser.GameObjects.Container,
    target: Phaser.GameObjects.Container,
    speed: number
  ) {
    const angle = Phaser.Math.Angle.Between(
      attacker.x, attacker.y,
      target.x, target.y
    );

    // 应用移动速度乘数
    const effectiveSpeed = speed * this.moveSpeedMultiplier;
    const newX = attacker.x + Math.cos(angle) * effectiveSpeed * 0.1;
    const newY = attacker.y + Math.sin(angle) * effectiveSpeed * 0.1;

    // 边界限制：确保角色不会移出网格
    const minX = this.gridOffsetX + this.gridSize / 2;
    const maxX = this.gridOffsetX + (this.gridCols - 1) * this.gridSize + this.gridSize / 2;
    const minY = this.gridOffsetY + this.gridSize / 2;
    const maxY = this.gridOffsetY + (this.gridRows - 1) * this.gridSize + this.gridSize / 2;

    attacker.x = Phaser.Math.Clamp(newX, minX, maxX);
    attacker.y = Phaser.Math.Clamp(newY, minY, maxY);
  }

  private tryAttack(
    attacker: BattleUnit,
    target: BattleUnit,
    attackerContainer: Phaser.GameObjects.Container,
    targetContainer: Phaser.GameObjects.Container
  ) {
    const currentTime = this.time.now;
    const lastAttackTime = (attackerContainer as any).lastAttackTime || 0;
    const cooldown = (attackerContainer as any).attackCooldown || 1000;

    if (currentTime - lastAttackTime < cooldown) return;

    // 记录攻击时间
    (attackerContainer as any).lastAttackTime = currentTime;

    // 普攻触发技能CD-1秒
    if (attacker.skillInstances) {
      SkillManager.onAttack(attacker.skillInstances);
    }

    // 攻击动画
    this.tweens.add({
      targets: attackerContainer,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
    });

    // 如果是远程攻击，发射子弹
    if (attacker.character.attackType === 'ranged') {
      this.fireProjectile(attackerContainer, targetContainer, () => {
        this.dealDamage(target, attacker.character.damage, targetContainer, attacker);
      });
    } else {
      // 近战直接造成伤害
      this.dealDamage(target, attacker.character.damage, targetContainer, attacker);
    }
  }

  private fireProjectile(
    from: Phaser.GameObjects.Container,
    to: Phaser.GameObjects.Container,
    onHit: () => void
  ) {
    const projectile = this.add.circle(from.x, from.y, 5, 0xffff00);
    
    this.tweens.add({
      targets: projectile,
      x: to.x,
      y: to.y,
      duration: 300,
      onComplete: () => {
        projectile.destroy();
        onHit();
      },
    });
  }

  private dealDamage(
    target: BattleUnit,
    damage: number,
    targetContainer: Phaser.GameObjects.Container,
    attacker?: BattleUnit
  ) {
    // 扣除血量
    target.currentHp = Math.max(0, target.currentHp - damage);

    // 受击触发技能CD-0.5秒
    if (target.skillInstances) {
      SkillManager.onHit(target.skillInstances);
    }

    // 更新血条显示
    this.updateHealthBar(target);

    // 受击闪烁
    this.tweens.add({
      targets: targetContainer,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1,
    });

    // 显示伤害数字
    const damageText = this.add.text(targetContainer.x, targetContainer.y - 30, `-${damage}`, {
      fontSize: '16px',
      color: '#ff0000',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: damageText,
      y: damageText.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => damageText.destroy(),
    });

    // 检查死亡
    if (target.currentHp <= 0 && target.isAlive) {
      const attackerName = attacker ? attacker.character.name : '未知';
      this.handleUnitDeath(target, `被${attackerName}击杀`);
    }
  }

  private updateTimer() {
    this.battleTimer--;
    if (this.timerText) {
      this.timerText.setText(`时间: ${this.battleTimer}s`);
      
      if (this.battleTimer <= 10) {
        this.timerText.setColor('#ff0000');
      }
    }

    if (this.battleTimer <= 0) {
      this.endBattle('lose');
    }
  }

  private checkBattleEnd() {
    // 避免重复检查
    if (this.battleEnded) return;
    
    const aliveEnemies = this.enemyUnits.filter(u => u.isAlive).length;
    const alivePlayers = this.playerUnits.filter(u => u.isAlive).length;

    if (aliveEnemies === 0) {
      console.log(`\n🎉 ========== 战斗胜利 ==========`);
      console.log(`   我方存活: ${alivePlayers}人，敌方存活: 0人`);
      this.endBattle('win');
    } else if (alivePlayers === 0) {
      console.log(`\n💔 ========== 战斗失败 ==========`);
      console.log(`   我方存活: 0人，敌方存活: ${aliveEnemies}人`);
      this.endBattle('lose');
    }
  }

  private endBattle(result: 'win' | 'lose') {
    // 标记战斗已结束
    if (this.battleEnded) return;
    this.battleEnded = true;
    
    // 停止所有事件
    this.time.removeAllEvents();

    // 如果胜利，保存被击败的敌人数据（用于俘虏选择）并给予经验值
    if (result === 'win') {
      const defeatedEnemies = this.enemyUnits.map(unit => unit.character);
      useGameStore.getState().setDefeatedEnemies(defeatedEnemies);
      console.log(`[BattleScene] 战斗胜利，击败了 ${defeatedEnemies.length} 个敌人`);

      // 战斗统计计数
      useGameStore.getState().incrementStat('battleCount');

      // 给予所有参战角色经验值
      const currentLevel = useGameStore.getState().currentLevel;
      const baseExp = 50;
      let expMultiplier = 1;

      // 根据关卡难度调整经验倍率
      if (currentLevel?.difficulty === '简单') {
        expMultiplier = 1;
      } else if (currentLevel?.difficulty === '中等') {
        expMultiplier = 1.5;
      } else if (currentLevel?.difficulty === '困难') {
        expMultiplier = 2;
      } else if (currentLevel?.difficulty === '极难') {
        expMultiplier = 2.5;
      } else if (currentLevel?.difficulty === 'Boss') {
        expMultiplier = 3; // Boss战给予3倍经验
      }

      const finalExp = Math.floor(baseExp * expMultiplier);
      console.log(`[BattleScene] 关卡难度: ${currentLevel?.difficulty}, 经验倍率: ${expMultiplier}, 最终经验: ${finalExp}`);

      this.playerUnits.forEach((unit) => {
        usePlayerStore.getState().gainExp(unit.character.id, finalExp);
      });

      // 解锁下一关
      if (currentLevel) {
        const nextLevelId = currentLevel.id + 1;
        console.log(`[BattleScene] 当前关卡ID: ${currentLevel.id}, 尝试解锁下一关: ${nextLevelId}`);
        
        // 标记当前关卡为已完成
        useGameStore.getState().completeLevel(currentLevel.id);
        
        // 解锁下一关（如果存在）
        // 火山关卡有 1-5 关
        if (nextLevelId <= 5) {
          useGameStore.getState().unlockLevel(nextLevelId);
          console.log(`[BattleScene] ✅ 已解锁关卡 ${nextLevelId}`);
        } else {
          console.log('[BattleScene] 已经是最后一关了');
        }
      }

      // 检测是否击败了Boss（第5关）
      if (currentLevel?.id === 5) {
        console.log('[BattleScene] 🎉 恭喜！击败了火山Boss - 炎魔之王！');
        // 延迟跳转到胜利界面
        this.time.delayedCall(3000, () => {
          useGameStore.getState().setScene('victory');
        });
        return; // 不显示常规战斗结果，直接返回
      }
    }

    // 显示结果
    const resultText = result === 'win' ? '胜利！' : '失败！';
    const color = result === 'win' ? '#00ff00' : '#ff0000';

    const bg = this.add.rectangle(600, 350, 400, 200, 0x000000, 0.8);
    const text = this.add.text(600, 330, resultText, {
      fontSize: '48px',
      color: color,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const backButton = this.add.text(600, 400, result === 'win' ? '选择俘虏' : '返回主页', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: result === 'win' ? '#ff8800' : '#4488ff',
      padding: { x: 20, y: 10 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        useGameStore.getState().setBattleResult(result);
        useGameStore.getState().setScene('home');
      });

    // 触发游戏结束事件
    this.game.events.emit('battle-end', result);
  }

  private updateSkillCD() {
    if (this.battleEnded) return;

    // 更新所有单位的技能CD
    [...this.playerUnits, ...this.enemyUnits].forEach((unit) => {
      if (!unit.isAlive || !unit.skillInstances) return;
      
      // 每100ms = 0.1秒
      SkillManager.updateSkillCD(unit.skillInstances, 0.1);
    });
  }

  private updateDebuffs() {
    if (this.battleEnded) return;

    // 更新所有单位的Debuff
    [...this.playerUnits, ...this.enemyUnits].forEach((unit) => {
      if (!unit.isAlive || !unit.debuffs) return;
      
      // 更新Debuff持续时间
      unit.debuffs = unit.debuffs.filter((debuff) => {
        debuff.duration -= 0.1; // 100ms = 0.1秒
        return debuff.duration > 0;
      });
    });
  }

  /**
   * 更新所有单位的BUFF
   */
  private updateBuffs() {
    if (this.battleEnded) return;

    const currentTime = this.time.now;
    const deltaSeconds = 0.1; // 100ms = 0.1秒

    [...this.playerUnits, ...this.enemyUnits].forEach((unit) => {
      if (!unit.isAlive) return;
      
      // 更新BUFF
      BuffManager.updateBuffs(unit, currentTime, deltaSeconds);
      
      // 更新BUFF图标显示
      this.updateBuffIcons(unit);

      // 检查单位是否被BUFF击杀
      if (unit.currentHp <= 0 && unit.isAlive) {
        unit.isAlive = false;
        const container = this.allUnits.get(unit.character.id);
        if (container && container.active) {
          this.showDeathAnimation(container);
          this.allUnits.delete(unit.character.id);
        }
        this.checkBattleEnd();
      } else {
        // 更新血条
        this.updateHealthBar(unit);
      }
    });
  }

  private tryUseSkill(unit: BattleUnit, targets: BattleUnit[], container: Phaser.GameObjects.Container) {
    if (!unit.skillInstances || unit.skillInstances.length === 0) {
      return false;
    }

    // 获取准备好的技能
    const readySkills = SkillManager.getReadySkills(unit.skillInstances);
    
    if (readySkills.length === 0) {
      return false;
    }

    // 尝试按顺序释放第一个可用技能
    for (const skill of readySkills) {
      const success = this.executeSkill(skill, unit, targets, container);
      if (success) {
        console.log(`✅ [技能释放] ${unit.team === 'player' ? '🛡️' : '⚔️'} ${unit.character.name} 使用了 ${skill.config.name}`);
        SkillManager.useSkill(skill, this.time.now);
        return true;
      }
    }

    return false;
  }

  private executeSkill(
    skill: SkillInstance,
    caster: BattleUnit,
    targets: BattleUnit[],
    casterContainer: Phaser.GameObjects.Container
  ): boolean {
    const config = skill.config;

    switch (config.id) {
      case 'skill_001': // 火球术
        return this.castFireball(caster, targets, casterContainer, config);
      case 'skill_002': // 紧急回血
        return this.castHeal(caster, casterContainer, config);
      case 'skill_003': // 快速闪现
        return this.castBlink(caster, casterContainer, config);
      case 'skill_004': // 减速射击
        return this.castSlowShot(caster, targets, casterContainer, config);
      case 'skill_005': // 嘲讽吸引
        return this.castTaunt(caster, targets, casterContainer, config);
      case 'skill_006': // 雷电劈击
        return this.castThunderStrike(caster, targets, casterContainer, config);
      case 'skill_007': // 道具投掷
        return this.castBomb(caster, targets, casterContainer, config);
      case 'skill_008': // 自愈脉冲
        return this.castSelfHeal(caster, casterContainer, config);
      case 'skill_009': // 冲刺撞击
        return this.castDash(caster, targets, casterContainer, config);
      case 'skill_010': // 能量扫射
        return this.castEnergySweep(caster, targets, casterContainer, config);
      case 'skill_011': // 冰冻定身
        return this.castFreeze(caster, targets, casterContainer, config);
      case 'skill_012': // 范围回血
        return this.castAreaHeal(caster, targets, casterContainer, config);
      case 'skill_013': // 加速冲锋
        return this.castSpeedBuff(caster, casterContainer, config);
      case 'skill_014': // 毒刺射击
        return this.castPoisonShot(caster, targets, casterContainer, config);
      // 火山技能
      case 'v_skill_001': // 火球爆裂
        return this.castVolcanoFireball(caster, targets, casterContainer, config);
      case 'v_skill_002': // 烈焰冲击
        return this.castFlameDash(caster, targets, casterContainer, config);
      case 'v_skill_006': // 寒冰箭
        return this.castIceArrow(caster, targets, casterContainer, config);
      case 'v_skill_007': // 冰霜护盾
        return this.castIceShield(caster, casterContainer, config);
      case 'v_skill_008': // 冰封打击
        return this.castIceStrike(caster, targets, casterContainer, config);
      case 'v_skill_010': // 岩石护甲
        return this.castRockArmor(caster, casterContainer, config);
      case 'v_skill_013': // 圣光庇护
        return this.castHolyProtection(caster, targets, casterContainer, config);
      case 'v_skill_014': // 生命之泉
        return this.castLifeFountain(caster, targets, casterContainer, config);
      // Boss技能
      case 'boss_skill_01': // 炎魔之怒
        return this.castBossRage(caster, targets, casterContainer, config);
      case 'boss_skill_02': // 熔岩召唤
        return this.castLavaSummon(caster, casterContainer, config);
      default:
        console.warn(`[BattleScene] 未实现的技能: ${config.id}`);
        return false;
    }
  }

  // skill_001: 火球术
  private castFireball(
    caster: BattleUnit,
    targets: BattleUnit[],
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    const target = this.findClosestTarget(caster, targets);
    if (!target) return false;

    const targetContainer = this.allUnits.get(target.character.id);
    if (!targetContainer || !targetContainer.active) return false;

    const distance = Phaser.Math.Distance.Between(
      casterContainer.x, casterContainer.y,
      targetContainer.x, targetContainer.y
    );

    if (distance > config.range) return false;

    // 创建火球特效
    const fireball = this.add.circle(casterContainer.x, casterContainer.y, 8, 0xff4400);
    
    // 增强技能释放提示
    this.showSkillCast(casterContainer, config.name, 0xff4400);
    
    this.tweens.add({
      targets: fireball,
      x: targetContainer.x,
      y: targetContainer.y,
      duration: 500,
      onComplete: () => {
        fireball.destroy();
        
        // 检查目标是否仍然存活和有效
        if (!target.isAlive || !targetContainer.active) return;
        
        this.dealDamage(target, config.damage || 50, targetContainer);
        
        // 火球爆炸特效
        const explosion = this.add.circle(targetContainer.x, targetContainer.y, 20, 0xff8800, 0.6);
        this.tweens.add({
          targets: explosion,
          scaleX: 2,
          scaleY: 2,
          alpha: 0,
          duration: 300,
          onComplete: () => explosion.destroy(),
        });
      },
    });

    return true;
  }

  // skill_002: 紧急回血
  private castHeal(
    caster: BattleUnit,
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    // 如果血量已满，不释放
    if (caster.currentHp >= caster.character.maxHp) return false;

    const healAmount = caster.character.maxHp * ((config.heal || 20) / 100);
    caster.currentHp = Math.min(caster.character.maxHp, caster.currentHp + healAmount);

    // 增强技能释放提示
    this.showSkillCast(casterContainer, config.name, 0x00ff00);

    // 更新血条
    this.updateHealthBar(caster);

    // 回血特效
    const healEffect = this.add.circle(casterContainer.x, casterContainer.y, 30, 0x00ff00, 0.3);
    this.tweens.add({
      targets: healEffect,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 600,
      onComplete: () => healEffect.destroy(),
    });

    // 显示回血数字
    const healText = this.add.text(casterContainer.x, casterContainer.y - 30, `+${Math.ceil(healAmount)}`, {
      fontSize: '16px',
      color: '#00ff00',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: healText,
      y: healText.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => healText.destroy(),
    });

    return true;
  }

  // skill_003: 快速闪现
  private castBlink(
    caster: BattleUnit,
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    const distance = config.teleportDistance || 200;
    
    // 计算向前瞬移的位置（向右移动，因为敌人在右侧）
    const direction = caster.team === 'player' ? 1 : -1;
    const newX = casterContainer.x + distance * direction;
    const newY = casterContainer.y;

    // 边界检查
    if (newX < 100 || newX > 1100) return false;

    // 增强技能释放提示
    this.showSkillCast(casterContainer, config.name, 0x4488ff);

    // 闪现特效（消失）
    this.tweens.add({
      targets: casterContainer,
      alpha: 0,
      duration: 100,
      onComplete: () => {
        // 检查施法者是否仍然存活
        if (!caster.isAlive || !casterContainer.active) return;

        // 瞬移
        casterContainer.x = newX;
        casterContainer.y = newY;
        caster.position.x = newX;
        caster.position.y = newY;

        // 闪现特效（出现）
        const blinkEffect = this.add.circle(newX, newY, 40, 0x4488ff, 0.5);
        this.tweens.add({
          targets: blinkEffect,
          scaleX: 0,
          scaleY: 0,
          alpha: 0,
          duration: 400,
          onComplete: () => blinkEffect.destroy(),
        });

        // 恢复可见
        this.tweens.add({
          targets: casterContainer,
          alpha: 1,
          duration: 100,
        });
      },
    });

    return true;
  }

  // skill_004: 减速射击
  private castSlowShot(
    caster: BattleUnit,
    targets: BattleUnit[],
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    const target = this.findClosestTarget(caster, targets);
    if (!target) return false;

    const targetContainer = this.allUnits.get(target.character.id);
    if (!targetContainer || !targetContainer.active) return false;

    const distance = Phaser.Math.Distance.Between(
      casterContainer.x, casterContainer.y,
      targetContainer.x, targetContainer.y
    );

    if (distance > config.range) return false;

    // 增强技能释放提示
    this.showSkillCast(casterContainer, config.name, 0x0088ff);

    // 创建减速箭矢（蓝色）
    const arrow = this.add.circle(casterContainer.x, casterContainer.y, 6, 0x0088ff);
    
    this.tweens.add({
      targets: arrow,
      x: targetContainer.x,
      y: targetContainer.y,
      duration: 400,
      onComplete: () => {
        arrow.destroy();
        
        // 检查目标是否仍然存活和有效
        if (!target.isAlive || !targetContainer.active) return;
        
        // 造成伤害
        this.dealDamage(target, config.damage || 20, targetContainer);
        
        // 添加减速Debuff
        if (!target.debuffs) target.debuffs = [];
        target.debuffs.push({
          type: 'slow',
          value: config.debuffValue || 30,
          duration: config.debuffDuration || 2,
        });

        // 减速特效（冰冻效果）
        const slowEffect = this.add.circle(targetContainer.x, targetContainer.y, 25, 0x0088ff, 0.4);
        this.tweens.add({
          targets: slowEffect,
          alpha: 0,
          duration: 2000,
          onComplete: () => slowEffect.destroy(),
        });
      },
    });

    return true;
  }

  // skill_005: 嘲讽吸引
  private castTaunt(
    caster: BattleUnit,
    targets: BattleUnit[],
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    const radius = config.areaRadius || 150;
    let taunted = 0;

    // 增强技能释放提示
    this.showSkillCast(casterContainer, config.name, 0xff0000);

    // 查找范围内的所有敌人
    targets.forEach((target) => {
      if (!target.isAlive) return;
      
      const targetContainer = this.allUnits.get(target.character.id);
      if (!targetContainer || !targetContainer.active) return;

      const distance = Phaser.Math.Distance.Between(
        casterContainer.x, casterContainer.y,
        targetContainer.x, targetContainer.y
      );

      if (distance <= radius) {
        // 添加嘲讽Debuff
        if (!target.debuffs) target.debuffs = [];
        target.debuffs.push({
          type: 'taunt',
          value: 0,
          duration: config.debuffDuration || 1,
          source: caster.character.id,
        });

        taunted++;

        // 嘲讽特效（红色感叹号）
        const tauntMark = this.add.text(targetContainer.x, targetContainer.y - 50, '!', {
          fontSize: '24px',
          color: '#ff0000',
          fontStyle: 'bold',
        }).setOrigin(0.5);

        this.tweens.add({
          targets: tauntMark,
          y: tauntMark.y - 20,
          alpha: 0,
          duration: 1000,
          onComplete: () => tauntMark.destroy(),
        });
      }
    });

    if (taunted === 0) return false;

    // 嘲讽范围特效
    const tauntArea = this.add.circle(casterContainer.x, casterContainer.y, radius, 0xff0000, 0.2);
    this.tweens.add({
      targets: tauntArea,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0,
      duration: 500,
      onComplete: () => tauntArea.destroy(),
    });

    return true;
  }

  // skill_006: 雷电劈击（范围伤害）
  private castThunderStrike(
    caster: BattleUnit,
    targets: BattleUnit[],
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    const radius = config.areaRadius || 200;
    let hitCount = 0;

    this.showSkillCast(casterContainer, config.name, 0xffff00);

    // 雷电特效
    const lightning = this.add.circle(casterContainer.x, casterContainer.y, radius, 0xffff00, 0.3);
    
    // 查找范围内的所有敌人
    targets.forEach((target) => {
      if (!target.isAlive) return;
      
      const targetContainer = this.allUnits.get(target.character.id);
      if (!targetContainer || !targetContainer.active) return;

      const distance = Phaser.Math.Distance.Between(
        casterContainer.x, casterContainer.y,
        targetContainer.x, targetContainer.y
      );

      if (distance <= radius) {
        // 造成伤害
        const damage = config.damage || 30;
        target.currentHp = Math.max(0, target.currentHp - damage);
        hitCount++;

        // 雷电特效
        const bolt = this.add.rectangle(targetContainer.x, targetContainer.y - 100, 5, 100, 0xffff00);
        this.tweens.add({
          targets: bolt,
          alpha: 0,
          duration: 200,
          onComplete: () => bolt.destroy(),
        });

        // 伤害数字
        this.showDamageNumber(targetContainer, damage);

        // 检查死亡
        if (target.currentHp <= 0 && target.isAlive) {
          target.isAlive = false;
          this.showDeathAnimation(targetContainer);
          this.allUnits.delete(target.character.id);
        }
      }
    });

    this.tweens.add({
      targets: lightning,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0,
      duration: 500,
      onComplete: () => lightning.destroy(),
    });

    return hitCount > 0;
  }

  // skill_007: 道具投掷（范围伤害）
  private castBomb(
    caster: BattleUnit,
    targets: BattleUnit[],
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    const target = this.findClosestTarget(caster, targets);
    if (!target) return false;

    const targetContainer = this.allUnits.get(target.character.id);
    if (!targetContainer || !targetContainer.active) return false;

    const distance = Phaser.Math.Distance.Between(
      casterContainer.x, casterContainer.y,
      targetContainer.x, targetContainer.y
    );

    if (distance > config.range) return false;

    this.showSkillCast(casterContainer, config.name, 0xff6600);

    // 创建炸弹
    const bomb = this.add.circle(casterContainer.x, casterContainer.y, 10, 0x333333);
    
    this.tweens.add({
      targets: bomb,
      x: targetContainer.x,
      y: targetContainer.y,
      duration: 500,
      onComplete: () => {
        if (!targetContainer.active) {
          bomb.destroy();
          return;
        }

        // 爆炸效果
        const explosion = this.add.circle(targetContainer.x, targetContainer.y, config.areaRadius || 150, 0xff6600, 0.6);
        let hitCount = 0;

        // 范围伤害
        targets.forEach((t) => {
          if (!t.isAlive) return;
          
          const tc = this.allUnits.get(t.character.id);
          if (!tc || !tc.active) return;

          const dist = Phaser.Math.Distance.Between(
            targetContainer.x, targetContainer.y,
            tc.x, tc.y
          );

          if (dist <= (config.areaRadius || 150)) {
            const damage = config.damage || 40;
            t.currentHp = Math.max(0, t.currentHp - damage);
            hitCount++;

            this.showDamageNumber(tc, damage);

            if (t.currentHp <= 0 && t.isAlive) {
              t.isAlive = false;
              this.showDeathAnimation(tc);
              this.allUnits.delete(t.character.id);
            }
          }
        });

        this.tweens.add({
          targets: explosion,
          scaleX: 1.5,
          scaleY: 1.5,
          alpha: 0,
          duration: 400,
          onComplete: () => explosion.destroy(),
        });

        bomb.destroy();
      },
    });

    return true;
  }

  // skill_008: 自愈脉冲（治疗）
  private castSelfHeal(
    caster: BattleUnit,
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    const healPercent = config.heal || 30;
    const healAmount = Math.ceil(caster.character.maxHp * (healPercent / 100));
    
    caster.currentHp = Math.min(caster.character.maxHp, caster.currentHp + healAmount);

    this.showSkillCast(casterContainer, config.name, 0x00ff00);

    // 更新血条
    this.updateHealthBar(caster);

    // 治疗特效
    const healEffect = this.add.circle(casterContainer.x, casterContainer.y, 40, 0x00ff00, 0.5);
    
    // 治疗数字
    const healText = this.add.text(casterContainer.x, casterContainer.y - 50, `+${healAmount}`, {
      fontSize: '20px',
      color: '#00ff00',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: healEffect,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 600,
      onComplete: () => healEffect.destroy(),
    });

    this.tweens.add({
      targets: healText,
      y: healText.y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => healText.destroy(),
    });

    return true;
  }

  // skill_009: 冲刺撞击（冲刺）
  private castDash(
    caster: BattleUnit,
    targets: BattleUnit[],
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    const dashDistance = config.dashDistance || 200;
    
    // 计算冲刺方向（朝向最近的敌人）
    const target = this.findClosestTarget(caster, targets);
    let targetX = casterContainer.x;
    let targetY = casterContainer.y;

    if (target) {
      const targetContainer = this.allUnits.get(target.character.id);
      if (targetContainer && targetContainer.active) {
        const angle = Phaser.Math.Angle.Between(
          casterContainer.x, casterContainer.y,
          targetContainer.x, targetContainer.y
        );
        targetX = casterContainer.x + Math.cos(angle) * dashDistance;
        targetY = casterContainer.y + Math.sin(angle) * dashDistance;
      }
    } else {
      // 没有敌人，向前冲刺
      targetX = casterContainer.x + (caster.team === 'player' ? dashDistance : -dashDistance);
    }

    this.showSkillCast(casterContainer, config.name, 0x00ffff);

    // 冲刺特效
    const dashTrail = this.add.rectangle(casterContainer.x, casterContainer.y, 20, 20, 0x00ffff, 0.5);
    
    // 记录已命中的敌人，防止重复伤害
    const hitEnemies = new Set<string>();
    
    this.tweens.add({
      targets: casterContainer,
      x: targetX,
      y: targetY,
      duration: 300,
      onUpdate: () => {
        // 检查碰撞
        targets.forEach((t) => {
          if (!t.isAlive) return;
          if (hitEnemies.has(t.character.id)) return; // 已命中，跳过
          
          const tc = this.allUnits.get(t.character.id);
          if (!tc || !tc.active) return;

          const dist = Phaser.Math.Distance.Between(
            casterContainer.x, casterContainer.y,
            tc.x, tc.y
          );

          if (dist < 50) {
            // 标记为已命中
            hitEnemies.add(t.character.id);
            
            // 造成伤害
            const damage = config.damage || 13;
            this.dealDamage(t, damage, tc);
          }
        });
      },
      onComplete: () => {
        dashTrail.destroy();
        this.checkBattleEnd();
      },
    });

    return true;
  }

  // skill_010: 能量扫射（扇形伤害）
  private castEnergySweep(
    caster: BattleUnit,
    targets: BattleUnit[],
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    const range = config.range || 200;
    const coneAngle = config.coneAngle || 60;
    let hitCount = 0;

    this.showSkillCast(casterContainer, config.name, 0xff00ff);

    // 扇形特效
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff00ff, 0.3);
    graphics.beginPath();
    graphics.moveTo(casterContainer.x, casterContainer.y);
    
    const startAngle = caster.team === 'player' ? -coneAngle/2 : 180 - coneAngle/2;
    const endAngle = caster.team === 'player' ? coneAngle/2 : 180 + coneAngle/2;
    
    graphics.arc(casterContainer.x, casterContainer.y, range, 
      Phaser.Math.DegToRad(startAngle), 
      Phaser.Math.DegToRad(endAngle), 
      false
    );
    graphics.closePath();
    graphics.fillPath();

    // 检测扇形范围内的敌人
    const casterAngle = caster.team === 'player' ? 0 : 180;
    
    targets.forEach((target) => {
      if (!target.isAlive) return;
      
      const targetContainer = this.allUnits.get(target.character.id);
      if (!targetContainer || !targetContainer.active) return;

      const distance = Phaser.Math.Distance.Between(
        casterContainer.x, casterContainer.y,
        targetContainer.x, targetContainer.y
      );

      if (distance <= range) {
        const angleToTarget = Phaser.Math.RadToDeg(
          Phaser.Math.Angle.Between(
            casterContainer.x, casterContainer.y,
            targetContainer.x, targetContainer.y
          )
        );
        
        let angleDiff = Math.abs(angleToTarget - casterAngle);
        if (angleDiff > 180) angleDiff = 360 - angleDiff;
        
        if (angleDiff <= coneAngle / 2) {
          const damage = config.damage || 25;
          target.currentHp = Math.max(0, target.currentHp - damage);
          hitCount++;

          this.showDamageNumber(targetContainer, damage);

          if (target.currentHp <= 0 && target.isAlive) {
            target.isAlive = false;
            this.showDeathAnimation(targetContainer);
            this.allUnits.delete(target.character.id);
          }
        }
      }
    });

    this.tweens.add({
      targets: graphics,
      alpha: 0,
      duration: 500,
      onComplete: () => graphics.destroy(),
    });

    return hitCount > 0;
  }

  // skill_011: 冰冻定身（控制）
  private castFreeze(
    caster: BattleUnit,
    targets: BattleUnit[],
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    const target = this.findClosestTarget(caster, targets);
    if (!target) return false;

    const targetContainer = this.allUnits.get(target.character.id);
    if (!targetContainer || !targetContainer.active) return false;

    const distance = Phaser.Math.Distance.Between(
      casterContainer.x, casterContainer.y,
      targetContainer.x, targetContainer.y
    );

    if (distance > config.range) return false;

    this.showSkillCast(casterContainer, config.name, 0x00ffff);

    // 添加眩晕BUFF
    BuffManager.addBuff(target, 'buff_stun', this.time.now);

    // 冰冻特效
    const freezeEffect = this.add.circle(targetContainer.x, targetContainer.y, 40, 0x00ffff, 0.5);
    
    this.tweens.add({
      targets: freezeEffect,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0,
      duration: 1500,
      onComplete: () => freezeEffect.destroy(),
    });

    return true;
  }

  // skill_012: 范围回血（范围治疗）
  private castAreaHeal(
    caster: BattleUnit,
    allies: BattleUnit[],
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    const radius = config.areaRadius || 200;
    const healPercent = config.heal || 15;
    let healedCount = 0;

    this.showSkillCast(casterContainer, config.name, 0x00ff00);

    // 获取友军
    const friendlyUnits = caster.team === 'player' ? this.playerUnits : this.enemyUnits;

    friendlyUnits.forEach((ally) => {
      if (!ally.isAlive) return;
      
      const allyContainer = this.allUnits.get(ally.character.id);
      if (!allyContainer || !allyContainer.active) return;

      const distance = Phaser.Math.Distance.Between(
        casterContainer.x, casterContainer.y,
        allyContainer.x, allyContainer.y
      );

      if (distance <= radius) {
        const healAmount = Math.ceil(ally.character.maxHp * (healPercent / 100));
        ally.currentHp = Math.min(ally.character.maxHp, ally.currentHp + healAmount);
        healedCount++;

        // 更新血条
        this.updateHealthBar(ally);

        // 治疗特效
        const healEffect = this.add.circle(allyContainer.x, allyContainer.y, 30, 0x00ff00, 0.5);
        const healText = this.add.text(allyContainer.x, allyContainer.y - 40, `+${healAmount}`, {
          fontSize: '18px',
          color: '#00ff00',
          fontStyle: 'bold',
        }).setOrigin(0.5);

        this.tweens.add({
          targets: healEffect,
          scaleX: 1.5,
          scaleY: 1.5,
          alpha: 0,
          duration: 600,
          onComplete: () => healEffect.destroy(),
        });

        this.tweens.add({
          targets: healText,
          y: healText.y - 20,
          alpha: 0,
          duration: 700,
          onComplete: () => healText.destroy(),
        });
      }
    });

    // 范围特效
    const healArea = this.add.circle(casterContainer.x, casterContainer.y, radius, 0x00ff00, 0.2);
    this.tweens.add({
      targets: healArea,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0,
      duration: 600,
      onComplete: () => healArea.destroy(),
    });

    return healedCount > 0;
  }

  // skill_013: 加速冲锋（BUFF）
  private castSpeedBuff(
    caster: BattleUnit,
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    this.showSkillCast(casterContainer, config.name, 0xffff00);

    // 添加加速BUFF
    const buffId = config.buffId || 'buff_speed';
    BuffManager.addBuff(caster, buffId, this.time.now);

    // 加速特效
    const speedEffect = this.add.circle(casterContainer.x, casterContainer.y, 50, 0xffff00, 0.4);
    
    this.tweens.add({
      targets: speedEffect,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 500,
      onComplete: () => speedEffect.destroy(),
    });

    return true;
  }

  // skill_014: 毒刺射击（Debuff）
  private castPoisonShot(
    caster: BattleUnit,
    targets: BattleUnit[],
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    const target = this.findClosestTarget(caster, targets);
    if (!target) return false;

    const targetContainer = this.allUnits.get(target.character.id);
    if (!targetContainer || !targetContainer.active) return false;

    const distance = Phaser.Math.Distance.Between(
      casterContainer.x, casterContainer.y,
      targetContainer.x, targetContainer.y
    );

    if (distance > config.range) return false;

    this.showSkillCast(casterContainer, config.name, 0x00ff00);

    // 创建毒箭
    const arrow = this.add.circle(casterContainer.x, casterContainer.y, 6, 0x00ff00);
    
    this.tweens.add({
      targets: arrow,
      x: targetContainer.x,
      y: targetContainer.y,
      duration: 300,
      onComplete: () => {
        if (!target.isAlive || !targetContainer.active) {
          arrow.destroy();
          return;
        }

        // 造成伤害
        const damage = config.damage || 15;
        target.currentHp = Math.max(0, target.currentHp - damage);

        this.showDamageNumber(targetContainer, damage);

        // 添加中毒BUFF
        const buffId = config.buffId || 'buff_poison';
        BuffManager.addBuff(target, buffId, this.time.now);

        // 中毒特效
        const poisonEffect = this.add.circle(targetContainer.x, targetContainer.y, 30, 0x00ff00, 0.3);
        this.tweens.add({
          targets: poisonEffect,
          alpha: 0,
          duration: 1000,
          onComplete: () => poisonEffect.destroy(),
        });

        // 检查死亡
        if (target.currentHp <= 0 && target.isAlive) {
          target.isAlive = false;
          this.showDeathAnimation(targetContainer);
          this.allUnits.delete(target.character.id);
        }

        arrow.destroy();
      },
    });

    return true;
  }

  // ========== 火山技能实现 ==========

  // v_skill_001: 火球爆裂（火系AOE）
  private castVolcanoFireball(
    caster: BattleUnit,
    targets: BattleUnit[],
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    const target = this.findClosestTarget(caster, targets);
    if (!target) return false;

    const targetContainer = this.allUnits.get(target.character.id);
    if (!targetContainer || !targetContainer.active) return false;

    const distance = Phaser.Math.Distance.Between(
      casterContainer.x, casterContainer.y,
      targetContainer.x, targetContainer.y
    );

    if (distance > config.range) return false;

    this.showSkillCast(casterContainer, config.name, 0xff4500);

    // 创建火球
    const fireball = this.add.circle(casterContainer.x, casterContainer.y, 10, 0xff4500);
    
    this.tweens.add({
      targets: fireball,
      x: targetContainer.x,
      y: targetContainer.y,
      duration: 500,
      onComplete: () => {
        if (!target.isAlive || !targetContainer.active) {
          fireball.destroy();
          return;
        }

        // 主目标伤害（考虑元素克制）
        const baseDamage = config.damage || 80;
        const mainDamage = calculateElementalDamage(baseDamage, caster.character.element, target.character.element);
        this.dealDamage(target, mainDamage, targetContainer);

        // AOE爆炸效果
        const explosion = this.add.circle(targetContainer.x, targetContainer.y, 40, 0xff6600, 0.7);
        this.tweens.add({
          targets: explosion,
          scaleX: 3,
          scaleY: 3,
          alpha: 0,
          duration: 400,
          onComplete: () => explosion.destroy(),
        });

        // 对范围内的敌人造成额外伤害
        const areaRadius = config.areaRadius || 120;
        targets.forEach((areaTarget) => {
          if (areaTarget === target || !areaTarget.isAlive) return;

          const areaTargetContainer = this.allUnits.get(areaTarget.character.id);
          if (!areaTargetContainer || !areaTargetContainer.active) return;

          const areaDist = Phaser.Math.Distance.Between(
            targetContainer.x, targetContainer.y,
            areaTargetContainer.x, areaTargetContainer.y
          );

          if (areaDist <= areaRadius) {
            const areaDamage = Math.floor(mainDamage * 0.5); // AOE伤害是主伤害的50%
            this.dealDamage(areaTarget, areaDamage, areaTargetContainer);
          }
        });

        fireball.destroy();
      },
    });

    return true;
  }

  // v_skill_002: 烈焰冲击（火系冲刺）
  private castFlameDash(
    caster: BattleUnit,
    targets: BattleUnit[],
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    const target = this.findClosestTarget(caster, targets);
    if (!target) return false;

    const targetContainer = this.allUnits.get(target.character.id);
    if (!targetContainer || !targetContainer.active) return false;

    this.showSkillCast(casterContainer, config.name, 0xff6600);

    // 计算冲刺目标点
    const dashDistance = config.dashDistance || 200;
    const angle = Phaser.Math.Angle.Between(
      casterContainer.x, casterContainer.y,
      targetContainer.x, targetContainer.y
    );
    const targetX = casterContainer.x + Math.cos(angle) * dashDistance;
    const targetY = casterContainer.y + Math.sin(angle) * dashDistance;

    // 火焰尾迹特效
    const trail = this.add.graphics();
    trail.lineStyle(10, 0xff4500, 0.6);
    trail.lineBetween(casterContainer.x, casterContainer.y, targetX, targetY);

    // 记录已命中的敌人，防止重复伤害
    const hitEnemies = new Set<string>();

    // 冲刺动画
    this.tweens.add({
      targets: casterContainer,
      x: targetX,
      y: targetY,
      duration: 300,
      onUpdate: () => {
        // 检查路径上的敌人
        targets.forEach((enemy) => {
          if (!enemy.isAlive) return;
          if (hitEnemies.has(enemy.character.id)) return; // 已命中，跳过
          
          const enemyContainer = this.allUnits.get(enemy.character.id);
          if (!enemyContainer || !enemyContainer.active) return;

          const distance = Phaser.Math.Distance.Between(
            casterContainer.x, casterContainer.y,
            enemyContainer.x, enemyContainer.y
          );

          if (distance < 50) {
            // 标记为已命中
            hitEnemies.add(enemy.character.id);
            
            // 造成伤害（带元素克制计算）
            const damage = config.damage || 40;
            const finalDamage = calculateElementalDamage(damage, caster.character.element, enemy.character.element);
            this.dealDamage(enemy, finalDamage, enemyContainer);
          }
        });
      },
      onComplete: () => {
        trail.destroy();
      },
    });

    return true;
  }

  // v_skill_006: 寒冰箭（冰系减速）
  private castIceArrow(
    caster: BattleUnit,
    targets: BattleUnit[],
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    const target = this.findClosestTarget(caster, targets);
    if (!target) return false;

    const targetContainer = this.allUnits.get(target.character.id);
    if (!targetContainer || !targetContainer.active) return false;

    const distance = Phaser.Math.Distance.Between(
      casterContainer.x, casterContainer.y,
      targetContainer.x, targetContainer.y
    );

    if (distance > config.range) return false;

    this.showSkillCast(casterContainer, config.name, 0x00bfff);

    // 创建寒冰箭
    const iceArrow = this.add.circle(casterContainer.x, casterContainer.y, 8, 0x00bfff);
    
    this.tweens.add({
      targets: iceArrow,
      x: targetContainer.x,
      y: targetContainer.y,
      duration: 300,
      onComplete: () => {
        if (!target.isAlive || !targetContainer.active) {
          iceArrow.destroy();
          return;
        }

        // 造成伤害（考虑元素克制）
        const baseDamage = config.damage || 70;
        const finalDamage = calculateElementalDamage(baseDamage, caster.character.element, target.character.element);
        this.dealDamage(target, finalDamage, targetContainer);

        // 添加减速 debuff
        if (config.debuffType === 'slow' && target.debuffs) {
          const debuff = {
            type: config.debuffType,
            value: config.debuffValue || 40,
            duration: config.debuffDuration || 3,
          };
          target.debuffs.push(debuff);
        }

        // 冰冻特效
        const iceEffect = this.add.circle(targetContainer.x, targetContainer.y, 30, 0x87ceeb, 0.5);
        this.tweens.add({
          targets: iceEffect,
          scaleX: 1.5,
          scaleY: 1.5,
          alpha: 0,
          duration: 600,
          onComplete: () => iceEffect.destroy(),
        });

        iceArrow.destroy();
      },
    });

    return true;
  }

  // v_skill_007: 冰霜护盾（冰系防御）
  private castIceShield(
    caster: BattleUnit,
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    this.showSkillCast(casterContainer, config.name, 0x87ceeb);

    // 添加护盾 buff
    const buffId = config.buffId || 'buff_shield';
    BuffManager.addBuff(caster, buffId, this.time.now);
    this.updateBuffIcons(caster);

    // 冰霜护盾特效
    const shield = this.add.circle(casterContainer.x, casterContainer.y, 45, 0x87ceeb, 0.3);
    this.tweens.add({
      targets: shield,
      scaleX: 1.2,
      scaleY: 1.2,
      alpha: 0.1,
      duration: 500,
      yoyo: true,
      repeat: 4,
      onComplete: () => shield.destroy(),
    });

    return true;
  }

  // v_skill_008: 冰封打击（冰系高伤害+控制）
  private castIceStrike(
    caster: BattleUnit,
    targets: BattleUnit[],
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    const target = this.findClosestTarget(caster, targets);
    if (!target) return false;

    const targetContainer = this.allUnits.get(target.character.id);
    if (!targetContainer || !targetContainer.active) return false;

    const distance = Phaser.Math.Distance.Between(
      casterContainer.x, casterContainer.y,
      targetContainer.x, targetContainer.y
    );

    if (distance > config.range) return false;

    this.showSkillCast(casterContainer, config.name, 0x00bfff);

    // 创建冰锥
    const iceShard = this.add.triangle(
      casterContainer.x, casterContainer.y,
      0, -10, -8, 10, 8, 10, 0x00bfff
    );

    this.tweens.add({
      targets: iceShard,
      x: targetContainer.x,
      y: targetContainer.y,
      duration: 200,
      onComplete: () => {
        if (!target.isAlive || !targetContainer.active) {
          iceShard.destroy();
          return;
        }

        // 造成伤害（考虑元素克制）
        const baseDamage = config.damage || 120;
        const finalDamage = calculateElementalDamage(baseDamage, caster.character.element, target.character.element);
        this.dealDamage(target, finalDamage, targetContainer);

        // 冰封特效
        const freeze = this.add.circle(targetContainer.x, targetContainer.y, 40, 0x00bfff, 0.7);
        this.tweens.add({
          targets: freeze,
          alpha: 0,
          scaleX: 1.5,
          scaleY: 1.5,
          duration: 1000,
          onComplete: () => freeze.destroy(),
        });

        iceShard.destroy();
      },
    });

    return true;
  }

  // v_skill_010: 岩石护甲（大地系防御）
  private castRockArmor(
    caster: BattleUnit,
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    this.showSkillCast(casterContainer, config.name, 0x8b4513);

    // 添加护盾 buff
    const buffId = config.buffId || 'buff_shield';
    BuffManager.addBuff(caster, buffId, this.time.now);
    this.updateBuffIcons(caster);

    // 岩石护甲特效
    const armor = this.add.circle(casterContainer.x, casterContainer.y, 40, 0x8b4513, 0.4);
    this.tweens.add({
      targets: armor,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0.2,
      duration: 500,
      yoyo: true,
      repeat: 5,
      onComplete: () => armor.destroy(),
    });

    return true;
  }

  // v_skill_013: 圣光庇护（治疗+驱散燃烧）
  private castHolyProtection(
    caster: BattleUnit,
    targets: BattleUnit[],
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    // 找到范围内的友军
    const allies = targets.filter((unit) => unit.team === caster.team && unit.isAlive);
    if (allies.length === 0) return false;

    this.showSkillCast(casterContainer, config.name, 0xffd700);

    const areaRadius = config.areaRadius || 200;
    let healedCount = 0;

    allies.forEach((ally) => {
      const allyContainer = this.allUnits.get(ally.character.id);
      if (!allyContainer || !allyContainer.active) return;

      const distance = Phaser.Math.Distance.Between(
        casterContainer.x, casterContainer.y,
        allyContainer.x, allyContainer.y
      );

      if (distance <= areaRadius) {
        // 治疗
        const healPercent = config.heal || 20;
        const healAmount = ally.character.maxHp * (healPercent / 100);
        ally.currentHp = Math.min(ally.character.maxHp, ally.currentHp + healAmount);

        // 更新血条
        this.updateHealthBar(ally);

        // 显示治疗数字
        const healText = this.add.text(allyContainer.x, allyContainer.y - 30, `+${Math.ceil(healAmount)}💚`, {
          fontSize: '18px',
          color: '#00ff00',
          fontStyle: 'bold',
        }).setOrigin(0.5);

        this.tweens.add({
          targets: healText,
          y: healText.y - 30,
          alpha: 0,
          duration: 1000,
          onComplete: () => healText.destroy(),
        });

        // 圣光特效
        const holyLight = this.add.circle(allyContainer.x, allyContainer.y, 35, 0xffd700, 0.6);
        this.tweens.add({
          targets: holyLight,
          scaleX: 1.5,
          scaleY: 1.5,
          alpha: 0,
          duration: 800,
          onComplete: () => holyLight.destroy(),
        });

        // 更新HP条
        this.updateHealthBar(ally);
        healedCount++;
      }
    });

    return healedCount > 0;
  }

  // v_skill_014: 生命之泉（持续治疗）
  private castLifeFountain(
    caster: BattleUnit,
    targets: BattleUnit[],
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    // 找到范围内的友军
    const allies = targets.filter((unit) => unit.team === caster.team && unit.isAlive);
    if (allies.length === 0) return false;

    this.showSkillCast(casterContainer, config.name, 0x00ff88);

    const areaRadius = config.areaRadius || 250;
    let healedCount = 0;

    // 生命之泉特效
    const fountain = this.add.circle(casterContainer.x, casterContainer.y, areaRadius, 0x00ff88, 0.2);
    this.tweens.add({
      targets: fountain,
      alpha: { from: 0.3, to: 0.1 },
      duration: 5000,
      yoyo: true,
      repeat: 2,
      onComplete: () => fountain.destroy(),
    });

    allies.forEach((ally) => {
      const allyContainer = this.allUnits.get(ally.character.id);
      if (!allyContainer || !allyContainer.active) return;

      const distance = Phaser.Math.Distance.Between(
        casterContainer.x, casterContainer.y,
        allyContainer.x, allyContainer.y
      );

      if (distance <= areaRadius) {
        // 立即治疗
        const healPercent = config.heal || 15;
        const healAmount = ally.character.maxHp * (healPercent / 100);
        ally.currentHp = Math.min(ally.character.maxHp, ally.currentHp + healAmount);

        // 更新血条
        this.updateHealthBar(ally);

        // 显示治疗数字
        const healText = this.add.text(allyContainer.x, allyContainer.y - 30, `+${Math.ceil(healAmount)}💚`, {
          fontSize: '18px',
          color: '#00ff88',
          fontStyle: 'bold',
        }).setOrigin(0.5);

        this.tweens.add({
          targets: healText,
          y: healText.y - 30,
          alpha: 0,
          duration: 1000,
          onComplete: () => healText.destroy(),
        });

        // 更新HP条
        this.updateHealthBar(ally);
        healedCount++;
      }
    });

    return healedCount > 0;
  }

  // boss_skill_01: 炎魔之怒（Boss AOE）
  private castBossRage(
    caster: BattleUnit,
    targets: BattleUnit[],
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    this.showSkillCast(casterContainer, '炎魔之怒', 0xff0000);

    const areaRadius = config.areaRadius || 250;
    const baseDamage = config.damage || 100;

    // Boss怒吼特效
    const rage = this.add.circle(casterContainer.x, casterContainer.y, 50, 0xff0000, 0.7);
    this.tweens.add({
      targets: rage,
      scaleX: 5,
      scaleY: 5,
      alpha: 0,
      duration: 800,
      onComplete: () => rage.destroy(),
    });

    // 对范围内所有敌人造成伤害
    let hitCount = 0;
    targets.forEach((target) => {
      if (!target.isAlive) return;

      const targetContainer = this.allUnits.get(target.character.id);
      if (!targetContainer || !targetContainer.active) return;

      const distance = Phaser.Math.Distance.Between(
        casterContainer.x, casterContainer.y,
        targetContainer.x, targetContainer.y
      );

      if (distance <= areaRadius) {
        const finalDamage = calculateElementalDamage(baseDamage, caster.character.element, target.character.element);
        this.dealDamage(target, finalDamage, targetContainer);
        hitCount++;
      }
    });

    return hitCount > 0;
  }

  // boss_skill_02: 熔岩召唤（动态生成岩浆地块）
  private castLavaSummon(
    caster: BattleUnit,
    casterContainer: Phaser.GameObjects.Container,
    config: any
  ): boolean {
    this.showSkillCast(casterContainer, '熔岩召唤', 0xff4500);

    // 在战场中央召唤临时岩浆地块
    const centerRow = 2; // 行2（战场中央）
    const centerCol = 4; // 列4（战场中央）
    
    const x = this.gridOffsetX + centerCol * this.gridSize;
    const y = this.gridOffsetY + centerRow * this.gridSize;

    // 召唤特效
    const summon = this.add.text(x, y, '🌋', {
      fontSize: '48px',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: summon,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 500,
      yoyo: true,
      onComplete: () => {
        // 创建临时岩浆地块
        const tempLava = this.add.rectangle(x, y, this.gridSize - 4, this.gridSize - 4, 0xff0000, 0.6);
        tempLava.setDepth(-1);

        // 持续10秒，每2秒喷发一次
        const duration = (config.summonDuration || 10) * 1000;
        const interval = (config.eruptionInterval || 2) * 1000;
        
        const eruptionTimer = this.time.addEvent({
          delay: interval,
          callback: () => {
            if (this.battleEnded) {
              eruptionTimer.remove();
              return;
            }
            this.triggerLavaEruption(centerRow, centerCol);
          },
          loop: true,
        });

        // 10秒后移除
        this.time.delayedCall(duration, () => {
          eruptionTimer.remove();
          tempLava.destroy();
          summon.destroy();
        });
      },
    });

    return true;
  }

  // 增强的技能释放提示（更明显）
  private showSkillCast(container: Phaser.GameObjects.Container, skillName: string, color: number) {
    // 1. 角色发光效果
    const glow = this.add.circle(container.x, container.y, 50, color, 0.4);
    this.tweens.add({
      targets: glow,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 600,
      onComplete: () => glow.destroy(),
    });

    // 2. 技能名称（大号、彩色）
    const skillText = this.add.text(container.x, container.y - 70, `★ ${skillName} ★`, {
      fontSize: '20px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true
      }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: skillText,
      y: skillText.y - 30,
      alpha: 0,
      duration: 1200,
      ease: 'Power2',
      onComplete: () => skillText.destroy(),
    });

    // 3. 震动效果
    this.tweens.add({
      targets: container,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 100,
      yoyo: true,
      repeat: 2,
    });

  }

  // 旧方法保留备用
  private showSkillName(container: Phaser.GameObjects.Container, skillName: string) {
    const skillText = this.add.text(container.x, container.y - 60, skillName, {
      fontSize: '14px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: skillText,
      y: skillText.y - 20,
      alpha: 0,
      duration: 1000,
      onComplete: () => skillText.destroy(),
    });
  }

  // 显示伤害数字
  private showDamageNumber(container: Phaser.GameObjects.Container, damage: number) {
    const damageText = this.add.text(container.x, container.y - 30, `-${Math.ceil(damage)}`, {
      fontSize: '20px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: damageText,
      y: damageText.y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => damageText.destroy(),
    });
  }

  /**
   * 处理单位死亡
   */
  private handleUnitDeath(unit: BattleUnit, cause?: string) {
    if (!unit.isAlive) return; // 防止重复处理
    
    unit.isAlive = false;
    const container = this.allUnits.get(unit.character.id);
    
    // 🔴 死亡日志
    const teamEmoji = unit.team === 'player' ? '🛡️' : '⚔️';
    const causeText = cause ? ` (${cause})` : '';
    console.log(`💀 [角色死亡] ${teamEmoji} ${unit.character.name} 已阵亡${causeText} 当前HP:${unit.currentHp.toFixed(1)} 位置:(${unit.position.x.toFixed(0)}, ${unit.position.y.toFixed(0)})`);
    
    if (container && container.active) {
      console.log(`   └─ 容器有效，开始死亡动画并从Map中移除`);
      this.showDeathAnimation(container);
      this.allUnits.delete(unit.character.id);
    } else if (container) {
      console.log(`   └─ ⚠️ 警告：容器已失效！`);
    } else {
      console.log(`   └─ ⚠️ 警告：找不到容器！`);
    }
    
    // 检查战斗是否结束
    this.checkBattleEnd();
  }

  // 显示死亡动画
  private showDeathAnimation(container: Phaser.GameObjects.Container) {
    // 淡出动画
    this.tweens.add({
      targets: container,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 500,
      onComplete: () => {
        container.destroy();
      },
    });
  }

  private getEffectiveMoveSpeed(unit: BattleUnit): number {
    // 先使用 BuffManager 获取考虑BUFF的速度
    let speed = BuffManager.getEffectiveMoveSpeed(unit);

    // 再应用 Debuff（Debuff 系统保留兼容性）
    if (unit.debuffs) {
      unit.debuffs.forEach((debuff) => {
        if (debuff.type === 'slow') {
          speed *= (1 - debuff.value / 100);
        }
      });
    }

    return speed;
  }

  private getTauntTarget(unit: BattleUnit): BattleUnit | null {
    if (!unit.debuffs) return null;

    // 查找嘲讽Debuff
    const tauntDebuff = unit.debuffs.find((d) => d.type === 'taunt');
    if (!tauntDebuff || !tauntDebuff.source) return null;

    // 查找嘲讽来源单位
    const allUnits = unit.team === 'player' ? this.enemyUnits : this.playerUnits;
    return allUnits.find((u) => u.character.id === tauntDebuff.source && u.isAlive) || null;
  }

  /**
   * 更新血条显示
   */
  private updateHealthBar(unit: BattleUnit) {
    const container = this.allUnits.get(unit.character.id);
    if (!container || !container.active) return;

    // 从容器引用中获取HP文字
    const hpText = (container as any).hpText as Phaser.GameObjects.Text;
    
    if (hpText) {
      // 更新HP文字和颜色
      const currentHp = Math.ceil(unit.currentHp);
      hpText.setText(`${currentHp}`);
      
      // 根据血量百分比更新颜色
      const hpPercent = unit.currentHp / unit.character.maxHp;
      if (hpPercent > 0.6) {
        hpText.setColor('#00ff00'); // 绿色
      } else if (hpPercent > 0.3) {
        hpText.setColor('#ffaa00'); // 橙色
      } else {
        hpText.setColor('#ff0000'); // 红色
      }
    }
  }

  /**
   * 应用环境BUFF
   */
  private applyEnvironmentalBuffs() {
    const gameState = useGameStore.getState();
    const currentLevel = gameState.currentLevel;
    
    if (!currentLevel || !currentLevel.envEffect) {
      console.log('[BattleScene] 没有环境BUFF');
      return;
    }

    const envBuffId = currentLevel.envEffect;
    console.log(`[BattleScene] 应用环境BUFF: ${envBuffId}`);

    // 给所有单位添加环境BUFF
    const allUnits = [...this.playerUnits, ...this.enemyUnits];
    const currentTime = this.time.now;

    allUnits.forEach((unit) => {
      BuffManager.addBuff(unit, envBuffId, currentTime);
      this.updateBuffIcons(unit); // 更新BUFF图标显示
    });
  }

  /**
   * 更新BUFF图标显示
   */
  private updateBuffIcons(unit: BattleUnit) {
    const container = this.allUnits.get(unit.character.id);
    if (!container) return;

    // 移除旧的BUFF图标容器
    const oldBuffContainer = container.getByName('buffIcons') as Phaser.GameObjects.Container;
    if (oldBuffContainer) {
      oldBuffContainer.destroy();
    }

    // 如果没有BUFF，直接返回
    if (!unit.buffs || unit.buffs.length === 0) return;

    // 创建新的BUFF图标容器
    const buffContainer = this.add.container(0, -40);
    buffContainer.setName('buffIcons');

    // 为每个BUFF添加图标
    unit.buffs.forEach((buff, index) => {
      const icon = this.add.text(index * 25 - 12, 0, buff.config.icon, {
        fontSize: '20px',
      });
      buffContainer.add(icon);
    });

    container.add(buffContainer);
  }

  /**
   * 应用燃烧伤害（火山关卡环境效果）
   */
  private applyBurnDamage() {
    // 战斗已结束，停止燃烧
    if (this.battleEnded) return;

    const currentLevel = useGameStore.getState().currentLevel;
    
    // 检查是否有燃烧伤害配置
    if (!currentLevel || !currentLevel.burnDamage || currentLevel.burnDamage <= 0) {
      return;
    }

    const baseBurnDamage = currentLevel.burnDamage;
    const allUnits = [...this.playerUnits, ...this.enemyUnits];

    allUnits.forEach((unit) => {
      if (!unit.isAlive) return;

      // 计算考虑元素抗性后的燃烧伤害
      const finalBurnDamage = calculateBurnDamage(baseBurnDamage, unit.character.element);

      // 如果伤害为0（火系免疫），跳过
      if (finalBurnDamage === 0) return;

      // 应用伤害
      unit.currentHp = Math.max(0, unit.currentHp - finalBurnDamage);

      // 显示燃烧伤害数字（橙色）
      const container = this.allUnits.get(unit.character.id);
      if (container) {
        const damageText = this.add.text(0, -50, `-${finalBurnDamage}🔥`, {
          fontSize: '18px',
          color: '#ff6600', // 橙色
          fontStyle: 'bold',
        }).setOrigin(0.5);

        container.add(damageText);

        // 燃烧伤害数字向上飘动并消失
        this.tweens.add({
          targets: damageText,
          y: -80,
          alpha: 0,
          duration: 1000,
          onComplete: () => damageText.destroy(),
        });

        // 添加燃烧粒子特效
        this.showBurnEffect(container);
      }

      // 更新HP条
      this.updateHealthBar(unit);

      // 检查是否死亡
      if (unit.currentHp <= 0) {
        this.handleUnitDeath(unit, '燃烧效果');
      }
    });
  }

  /**
   * 显示燃烧特效
   */
  private showBurnEffect(container: Phaser.GameObjects.Container) {
    const flame = this.add.text(0, -30, '🔥', {
      fontSize: '16px',
    }).setOrigin(0.5);

    container.add(flame);

    // 火焰向上飘动并消失
    this.tweens.add({
      targets: flame,
      y: -50,
      alpha: 0,
      duration: 800,
      onComplete: () => flame.destroy(),
    });
  }

  /**
   * 初始化岩浆地块标记
   */
  private initializeLavaBlocks() {
    this.lavaBlocks.forEach((block) => {
      // 岩浆标记位置（格子中心）
      const x = this.gridOffsetX + block.col * this.gridSize + this.gridSize / 2;
      const y = this.gridOffsetY + block.row * this.gridSize + this.gridSize / 2;

      // 创建岩浆地块标记（橙红色）
      const marker = this.add.rectangle(
        x, y, 
        this.gridSize - 8, 
        this.gridSize - 8, 
        0xff4500, // 橙红色
        0.3
      );
      marker.setDepth(-1); // 放在最底层

      const key = `${block.row}-${block.col}`;
      this.lavaMarkers.set(key, marker);
    });
    
    console.log(`🌋 [岩浆系统] 初始化完成，共${this.lavaBlocks.length}个地块`);
  }

  /**
   * 启动岩浆喷发系统
   */
  private startLavaEruptions() {
    this.lavaBlocks.forEach((block) => {
      // 每个地块独立计时，带有初始延迟
      this.time.addEvent({
        delay: block.offsetTime,
        callback: () => {
          // 启动周期性喷发
          this.time.addEvent({
            delay: this.lavaInterval,
            callback: () => this.scheduleLavaEruption(block.row, block.col),
            callbackScope: this,
            loop: true,
          });
          // 立即触发第一次
          this.scheduleLavaEruption(block.row, block.col);
        },
        callbackScope: this,
      });
    });
    
    console.log(`🌋 [岩浆系统] 已为${this.lavaBlocks.length}个地块设置喷发计时器`);
    if (this.lavaBlocks.length === 0) {
      console.warn('⚠️ [岩浆系统] 当前关卡没有配置岩浆地块');
    }
  }

  /**
   * 安排岩浆喷发（先警告，再喷发）
   */
  private scheduleLavaEruption(row: number, col: number) {
    if (this.battleEnded) return;

    // 先显示警告
    this.showLavaWarning(row, col);

    // 延迟后触发喷发
    this.time.delayedCall(this.lavaWarningTime, () => {
      this.triggerLavaEruption(row, col);
    });
  }

  /**
   * 显示岩浆警告特效
   */
  private showLavaWarning(row: number, col: number) {
    const key = `${row}-${col}`;
    const marker = this.lavaMarkers.get(key);
    if (!marker) return;

    // 警告期间闪烁红色
    this.tweens.add({
      targets: marker,
      alpha: { from: 0.8, to: 0.3 },
      fillColor: { from: 0xff0000, to: 0xff4500 }, // 红色闪烁
      duration: 300,
      repeat: Math.floor(this.lavaWarningTime / 600) - 1,
      yoyo: true,
    });
  }

  /**
   * 触发岩浆喷发
   */
  private triggerLavaEruption(row: number, col: number) {
    if (this.battleEnded) return;

    // 喷发特效位置（格子中心）
    const x = this.gridOffsetX + col * this.gridSize + this.gridSize / 2;
    const y = this.gridOffsetY + row * this.gridSize + this.gridSize / 2;

    // 喷发特效
    const eruption = this.add.text(x, y, '💥', {
      fontSize: '48px',
    }).setOrigin(0.5);

    console.log(`🌋 [岩浆喷发] 位置: (${row}, ${col})`);

    this.tweens.add({
      targets: eruption,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 500,
      onComplete: () => eruption.destroy(),
    });

    // 对该地块上的所有单位造成伤害
    const allUnits = [...this.playerUnits, ...this.enemyUnits];
    allUnits.forEach((unit) => {
      if (!unit.isAlive) return;

      const container = this.allUnits.get(unit.character.id);
      if (!container) return;

      // 检查单位是否在岩浆地块上
      const unitGridX = Math.round((container.x - this.gridOffsetX) / this.gridSize);
      const unitGridY = Math.round((container.y - this.gridOffsetY) / this.gridSize);

      if (unitGridX === col && unitGridY === row) {
        console.log(`   ├─ 💥 ${unit.character.name} 被岩浆击中！`);
        // 计算岩浆伤害（考虑大地系抗性）
        const finalDamage = calculateLavaDamage(this.lavaDamage, unit.character.element);

        // 应用伤害
        unit.currentHp = Math.max(0, unit.currentHp - finalDamage);

        // 显示伤害数字（红色）
        const damageText = this.add.text(0, -50, `-${finalDamage}💥`, {
          fontSize: '20px',
          color: '#ff0000', // 红色
          fontStyle: 'bold',
        }).setOrigin(0.5);

        container.add(damageText);

        this.tweens.add({
          targets: damageText,
          y: -80,
          alpha: 0,
          duration: 1000,
          onComplete: () => damageText.destroy(),
        });

        // 更新HP条
        this.updateHealthBar(unit);

        // 检查是否死亡
        if (unit.currentHp <= 0) {
          this.handleUnitDeath(unit, '岩浆喷发');
        }
      }
    });
  }

  private addBackButton() {
    this.add.text(50, 30, '← 返回', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#666666',
      padding: { x: 10, y: 5 },
    })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        useGameStore.getState().setScene('formation');
      });
  }

  /**
   * 获取元素图标
   */
  private getRoleEmoji(role: string): string {
    const roleEmojis: Record<string, string> = {
      warrior: '⚔️',
      mage: '🔮',
      archer: '🏹',
      tank: '🛡️',
      healer: '✨',
    };
    
    return roleEmojis[role] || '⚔️';
  }

  private getElementIcon(element?: string): string {
    if (!element) return '';
    
    const elementIcons: Record<string, string> = {
      fire: '🔥',
      ice: '❄️',
      earth: '🪨',
      water: '💧',
      neutral: '⚪',
    };
    
    return elementIcons[element] || '';
  }
}

