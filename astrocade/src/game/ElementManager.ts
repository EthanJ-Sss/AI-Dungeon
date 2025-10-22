/**
 * 元素系统管理器（重构版）
 * 基于配置文件的元素系统，支持元素被动技能自动应用
 */

import type { ElementType } from '../types/index.js';
import elementsData from '../config/elements.json';

/**
 * 元素被动技能接口
 */
export interface ElementPassive {
  burnImmune?: boolean;              // 燃烧免疫
  igniteChance?: number;             // 点燃几率
  igniteDuration?: number;           // 点燃持续时间
  igniteDamagePercent?: number;      // 点燃伤害百分比
  hpRegenPercent?: number;           // HP回复百分比
  hpRegenInterval?: number;          // 回复间隔
  slowChance?: number;               // 减速几率
  slowAmount?: number;               // 减速量
  slowDuration?: number;             // 减速持续时间
  hpBonus?: number;                  // HP加成
  startShieldPercent?: number;       // 开战护盾百分比
  shieldRegenPercent?: number;       // 护盾再生百分比
  shieldRegenCooldown?: number;      // 护盾再生冷却
}

/**
 * 元素配置接口
 */
export interface ElementConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  passive: ElementPassive | null;
  attackBonus: Record<string, number>;
  burnDamageMultiplier: number;
}

/**
 * 元素管理器类
 */
class ElementManager {
  private elements: Map<string, ElementConfig>;

  constructor() {
    this.elements = new Map();
    this.loadElements();
  }

  /**
   * 加载元素配置
   */
  private loadElements() {
    elementsData.elements.forEach((elem: any) => {
      this.elements.set(elem.id, elem as ElementConfig);
    });
    console.log(`[ElementManager] 已加载 ${this.elements.size} 种元素配置`);
  }

  /**
   * 获取元素被动技能
   */
  getElementPassive(element?: ElementType): ElementPassive | null {
    if (!element) return null;
    return this.elements.get(element)?.passive || null;
  }

  /**
   * 获取元素配置
   */
  getElementConfig(element?: ElementType): ElementConfig | null {
    if (!element) return null;
    return this.elements.get(element) || null;
  }

  /**
   * 计算元素克制后的伤害
   */
  calculateElementalDamage(
    baseDamage: number,
    attackerElement?: ElementType,
    targetElement?: ElementType
  ): number {
    if (!attackerElement || !targetElement) {
      return baseDamage;
    }
    
    const attackerConfig = this.elements.get(attackerElement);
    if (!attackerConfig) {
      return baseDamage;
    }
    
    const bonus = attackerConfig.attackBonus[targetElement] || 1.0;
    const finalDamage = Math.round(baseDamage * bonus);
    
    if (bonus !== 1.0) {
      console.log(`[ElementManager] ${attackerConfig.name}克制${this.elements.get(targetElement)?.name}！伤害: ${baseDamage} → ${finalDamage}`);
    }
    
    return finalDamage;
  }

  /**
   * 计算燃烧伤害（考虑元素抗性）
   */
  calculateBurnDamage(
    baseBurnDamage: number,
    targetElement?: ElementType
  ): number {
    if (!targetElement) {
      return baseBurnDamage;
    }
    
    const targetConfig = this.elements.get(targetElement);
    if (!targetConfig) {
      return baseBurnDamage;
    }
    
    return Math.round(baseBurnDamage * targetConfig.burnDamageMultiplier);
  }

  /**
   * 计算岩浆喷发伤害（考虑元素抗性）
   * 目前岩浆伤害使用燃烧伤害系数
   */
  calculateLavaDamage(
    baseLavaDamage: number,
    targetElement?: ElementType
  ): number {
    // 使用相同的燃烧伤害系数
    return this.calculateBurnDamage(baseLavaDamage, targetElement);
  }
}

// 导出单例
export const elementManager = new ElementManager();

/**
 * 兼容旧代码的函数导出
 */
export function calculateElementalDamage(
  baseDamage: number,
  attackerElement?: ElementType,
  targetElement?: ElementType
): number {
  return elementManager.calculateElementalDamage(baseDamage, attackerElement, targetElement);
}

export function calculateBurnDamage(
  baseBurnDamage: number,
  targetElement?: ElementType
): number {
  return elementManager.calculateBurnDamage(baseBurnDamage, targetElement);
}

export function calculateLavaDamage(
  baseLavaDamage: number,
  targetElement?: ElementType
): number {
  return elementManager.calculateLavaDamage(baseLavaDamage, targetElement);
}

/**
 * 获取元素名称（中文）
 */
export function getElementName(element?: ElementType): string {
  if (!element) return '无';
  const config = elementManager.getElementConfig(element);
  return config?.name || '无';
}

/**
 * 获取元素颜色
 */
export function getElementColor(element?: ElementType): number {
  if (!element) return 0xffffff;
  const config = elementManager.getElementConfig(element);
  if (!config) return 0xffffff;
  
  // 将hex颜色字符串转换为number
  return parseInt(config.color.replace('#', ''), 16);
}

/**
 * 获取元素图标（emoji）
 */
export function getElementIcon(element?: ElementType): string {
  if (!element) return '⚪';
  const config = elementManager.getElementConfig(element);
  return config?.icon || '⚪';
}

