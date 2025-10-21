import type { SkillConfig, SkillInstance } from '../types';
import skillsData from '../config/skills.json';

/**
 * 技能管理器
 * 负责技能配置加载、技能实例创建和CD管理
 */
export class SkillManager {
  private static skillConfigs: Map<string, SkillConfig> = new Map();
  private static initialized = false;

  /**
   * 初始化技能配置
   */
  static initialize() {
    if (this.initialized) return;
    
    skillsData.forEach((skill) => {
      this.skillConfigs.set(skill.id, skill as SkillConfig);
    });
    
    this.initialized = true;
    console.log(`[SkillManager] 已加载 ${this.skillConfigs.size} 个技能配置`);
  }

  /**
   * 获取技能配置
   */
  static getSkillConfig(skillId: string): SkillConfig | undefined {
    return this.skillConfigs.get(skillId);
  }

  /**
   * 根据技能ID列表创建技能实例
   */
  static createSkillInstances(skillIds: string[]): SkillInstance[] {
    if (!this.initialized) {
      this.initialize();
    }

    const instances: SkillInstance[] = [];
    
    skillIds.forEach((skillId) => {
      const config = this.getSkillConfig(skillId);
      if (config) {
        const instance = {
          config,
          currentCD: 0, // 🔧 修改：初始CD为0，立即可用
          isReady: true, // 🔧 修改：初始状态为准备好
          lastUsedTime: 0,
        };
        instances.push(instance);
        console.log(`[SkillManager] 创建技能实例: ${config.name} (CD: ${config.cd}秒, 初始状态: 准备好)`);
      } else {
        console.warn(`[SkillManager] 找不到技能配置: ${skillId}`);
      }
    });

    console.log(`[SkillManager] 共创建 ${instances.length} 个技能实例`);
    return instances;
  }

  /**
   * 更新技能CD
   * @param skills 技能实例列表
   * @param deltaTime 距离上次更新的时间（秒）
   * @param cdReduction CD减少量（秒）
   */
  static updateSkillCD(
    skills: SkillInstance[],
    deltaTime: number,
    cdReduction: number = 0
  ) {
    skills.forEach((skill) => {
      if (!skill.isReady) {
        skill.currentCD -= deltaTime + cdReduction;
        
        if (skill.currentCD <= 0) {
          skill.currentCD = 0;
          skill.isReady = true;
        }
      }
    });
  }

  /**
   * 使用技能（重置CD）
   */
  static useSkill(skill: SkillInstance, currentTime: number) {
    skill.currentCD = skill.config.cd;
    skill.isReady = false;
    skill.lastUsedTime = currentTime;
  }

  /**
   * 获取可用的技能（CD已转好）
   */
  static getReadySkills(skills: SkillInstance[]): SkillInstance[] {
    return skills.filter((skill) => skill.isReady);
  }

  /**
   * 普攻触发CD减少（-1秒）
   */
  static onAttack(skills: SkillInstance[]) {
    this.updateSkillCD(skills, 0, 1);
  }

  /**
   * 受击触发CD减少（-0.5秒）
   */
  static onHit(skills: SkillInstance[]) {
    this.updateSkillCD(skills, 0, 0.5);
  }
}

