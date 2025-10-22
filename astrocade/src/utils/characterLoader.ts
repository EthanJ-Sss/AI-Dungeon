import fireChars from '../config/characters/fire.json';
import waterChars from '../config/characters/water.json';
import iceChars from '../config/characters/ice.json';
import earthChars from '../config/characters/earth.json';
import neutralChars from '../config/characters/neutral.json';

/**
 * 加载所有角色配置
 * 从各个元素的配置文件中合并所有角色
 */
export function loadAllCharacters() {
  return [
    ...fireChars,
    ...waterChars,
    ...iceChars,
    ...earthChars,
    ...neutralChars
  ];
}

