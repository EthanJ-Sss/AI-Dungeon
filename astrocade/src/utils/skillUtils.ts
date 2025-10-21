import skillsData from '../config/skills.json';
import type { SkillConfig } from '../types';

/**
 * 根据技能ID获取技能配置
 */
export function getSkillConfig(skillId: string): SkillConfig | undefined {
  return skillsData.find(skill => skill.id === skillId) as SkillConfig | undefined;
}

/**
 * 根据技能ID列表获取技能信息
 */
export function getSkillsInfo(skillIds: string[] | undefined): Array<{
  id: string;
  name: string;
  description: string;
}> {
  if (!skillIds || skillIds.length === 0) {
    return [];
  }

  return skillIds
    .map(id => {
      const config = getSkillConfig(id);
      if (!config) return null;
      return {
        id: config.id,
        name: config.name,
        description: config.description || '暂无描述',
      };
    })
    .filter((skill): skill is NonNullable<typeof skill> => skill !== null);
}

/**
 * 获取技能类型的图标（根据技能ID或类型）
 */
export function getSkillTypeIcon(skillIdOrType: string): string {
  // 先尝试根据技能ID获取特定图标
  const specificIconMap: Record<string, string> = {
    skill_001: '🔥', // 火球术
    skill_002: '💚', // 紧急回血
    skill_003: '⚡', // 快速闪现
    skill_004: '❄️', // 减速射击
    skill_005: '😡', // 嘲讽吸引
    skill_006: '⚡', // 雷电劈击
    skill_007: '💣', // 道具投掷
    skill_008: '💚', // 自愈脉冲
    skill_009: '🚀', // 冲刺撞击
    skill_010: '🌟', // 能量扫射
    skill_011: '❄️', // 冰冻定身
    skill_012: '✨', // 范围回血
    skill_013: '⚡', // 加速冲锋
    skill_014: '☠️', // 毒刺射击
    skill_015: '🌑', // 暗影冲击
    skill_016: '🩸', // 黑暗治愈
  };

  if (specificIconMap[skillIdOrType]) {
    return specificIconMap[skillIdOrType];
  }

  // 根据技能类型获取配置
  const config = getSkillConfig(skillIdOrType);
  const type = config?.type || skillIdOrType;
  
  const iconMap: Record<string, string> = {
    damage: '🔥',
    heal: '💚',
    teleport: '⚡',
    debuff: '❄️',
    control: '😡',
    area_damage: '💥',
    dash: '🚀',
    cone_damage: '🌟',
    area_heal: '✨',
    buff: '⬆️',
  };
  return iconMap[type] || '⭐';
}

/**
 * 获取技能类型的颜色类名
 */
export function getSkillTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    damage: 'text-red-400',
    heal: 'text-green-400',
    teleport: 'text-blue-400',
    debuff: 'text-cyan-400',
    control: 'text-orange-400',
  };
  return colorMap[type] || 'text-gray-400';
}

