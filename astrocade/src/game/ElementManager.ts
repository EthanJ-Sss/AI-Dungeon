/**
 * 元素系统管理器
 * 处理元素克制关系和伤害计算
 */

import type { ElementType } from '../types/index.js';

/**
 * 元素克制关系常量
 */
export const ELEMENT_RELATIONS = {
  // 冰克火：对火系敌人+30%伤害
  ICE_VS_FIRE_BONUS: 1.3,
  
  // 火对冰减伤：受到冰系攻击-20%伤害
  FIRE_VS_ICE_PENALTY: 0.8,
  
  // 冰系燃烧抗性：燃烧伤害-70%
  ICE_BURN_RESISTANCE: 0.3,
  
  // 火系燃烧免疫：燃烧伤害-100%
  FIRE_BURN_IMMUNITY: 0,
  
  // 大地系岩浆抗性：岩浆喷发伤害-40%
  EARTH_LAVA_RESISTANCE: 0.6,
} as const;

/**
 * 计算元素克制后的伤害
 * @param baseDamage 基础伤害
 * @param attackerElement 攻击者元素
 * @param targetElement 目标元素
 * @returns 最终伤害
 */
export function calculateElementalDamage(
  baseDamage: number,
  attackerElement?: ElementType,
  targetElement?: ElementType
): number {
  let finalDamage = baseDamage;
  
  // 没有元素属性，返回基础伤害
  if (!attackerElement || !targetElement) {
    return finalDamage;
  }
  
  // 冰克火：+30%伤害
  if (attackerElement === 'ice' && targetElement === 'fire') {
    finalDamage *= ELEMENT_RELATIONS.ICE_VS_FIRE_BONUS;
    console.log(`[ElementManager] 冰克火！伤害: ${baseDamage} → ${finalDamage.toFixed(1)}`);
  }
  
  // 火对冰减伤：-20%伤害
  if (attackerElement === 'fire' && targetElement === 'ice') {
    finalDamage *= ELEMENT_RELATIONS.FIRE_VS_ICE_PENALTY;
    console.log(`[ElementManager] 火对冰减伤！伤害: ${baseDamage} → ${finalDamage.toFixed(1)}`);
  }
  
  return Math.round(finalDamage);
}

/**
 * 计算燃烧伤害（考虑元素抗性）
 * @param baseBurnDamage 基础燃烧伤害
 * @param targetElement 目标元素
 * @returns 最终燃烧伤害
 */
export function calculateBurnDamage(
  baseBurnDamage: number,
  targetElement?: ElementType
): number {
  // 没有元素属性，全额承受
  if (!targetElement || targetElement === 'neutral') {
    return baseBurnDamage;
  }
  
  // 火系完全免疫燃烧
  if (targetElement === 'fire') {
    return 0;
  }
  
  // 冰系减伤70%
  if (targetElement === 'ice') {
    return Math.round(baseBurnDamage * ELEMENT_RELATIONS.ICE_BURN_RESISTANCE);
  }
  
  // 大地系、水系全额承受
  return baseBurnDamage;
}

/**
 * 计算岩浆喷发伤害（考虑元素抗性）
 * @param baseLavaDamage 基础岩浆伤害
 * @param targetElement 目标元素
 * @returns 最终岩浆伤害
 */
export function calculateLavaDamage(
  baseLavaDamage: number,
  targetElement?: ElementType
): number {
  // 没有元素属性，全额承受
  if (!targetElement || targetElement === 'neutral') {
    return baseLavaDamage;
  }
  
  // 大地系抗性：-40%伤害
  if (targetElement === 'earth') {
    return Math.round(baseLavaDamage * ELEMENT_RELATIONS.EARTH_LAVA_RESISTANCE);
  }
  
  // 其他元素全额承受
  return baseLavaDamage;
}

/**
 * 获取元素名称（中文）
 * @param element 元素类型
 * @returns 元素中文名
 */
export function getElementName(element?: ElementType): string {
  if (!element) return '无';
  
  const elementNames: Record<ElementType, string> = {
    fire: '火',
    ice: '冰',
    earth: '地',
    water: '水',
    neutral: '无',
  };
  
  return elementNames[element] || '无';
}

/**
 * 获取元素颜色
 * @param element 元素类型
 * @returns 颜色代码
 */
export function getElementColor(element?: ElementType): number {
  if (!element) return 0xffffff;
  
  const elementColors: Record<ElementType, number> = {
    fire: 0xff4500,     // 橙红色
    ice: 0x00bfff,      // 深天蓝
    earth: 0x8b4513,    // 棕色
    water: 0x1e90ff,    // 道奇蓝
    neutral: 0xc0c0c0,  // 银色
  };
  
  return elementColors[element] || 0xffffff;
}

/**
 * 获取元素图标（emoji）
 * @param element 元素类型
 * @returns 图标字符
 */
export function getElementIcon(element?: ElementType): string {
  if (!element) return '⚪';
  
  const elementIcons: Record<ElementType, string> = {
    fire: '🔥',
    ice: '❄️',
    earth: '🪨',
    water: '💧',
    neutral: '⚪',
  };
  
  return elementIcons[element] || '⚪';
}

