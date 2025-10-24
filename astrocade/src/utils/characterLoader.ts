import fireChars from '../config/characters/fire.json';
import waterChars from '../config/characters/water.json';
import iceChars from '../config/characters/ice.json';
import earthChars from '../config/characters/earth.json';
import neutralChars from '../config/characters/neutral.json';
import commonChars from '../config/characters/common.json';
import monsterChars from '../config/characters/monsters.json';

/**
 * 加载所有角色配置（包括怪物，用于战斗系统）
 */
export function loadAllCharacters() {
  return [
    ...commonChars,
    ...fireChars,
    ...waterChars,
    ...iceChars,
    ...earthChars,
    ...neutralChars,
    ...monsterChars
  ];
}

/**
 * 加载可招募角色配置（不包括怪物，用于招募系统）
 */
export function loadRecruitableCharacters() {
  return [
    ...commonChars,
    ...fireChars,
    ...waterChars,
    ...iceChars,
    ...earthChars,
    ...neutralChars
  ];
}

