import fireSkills from '../config/skills/fire_skills.json';
import waterSkills from '../config/skills/water_skills.json';
import iceSkills from '../config/skills/ice_skills.json';
import earthSkills from '../config/skills/earth_skills.json';
import commonSkills from '../config/skills/common_skills.json';

/**
 * 加载所有技能配置
 * 从各个元素的配置文件中合并所有技能
 */
export function loadAllSkills() {
  return [
    ...fireSkills,
    ...waterSkills,
    ...iceSkills,
    ...earthSkills,
    ...commonSkills
  ];
}

