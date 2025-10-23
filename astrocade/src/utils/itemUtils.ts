import itemsData from '../config/items.json';
import type { Item } from '../types';

/**
 * 获取道具配置
 */
export function getItemConfig(itemId: string): Item | undefined {
  return itemsData.items.find(item => item.id === itemId) as Item | undefined;
}

/**
 * 格式化道具名称
 */
export function formatItemName(itemId: string): string {
  const item = getItemConfig(itemId);
  return item ? item.name : itemId;
}

/**
 * 获取道具图标
 */
export function getItemIcon(itemId: string): string {
  const item = getItemConfig(itemId);
  return item ? item.icon : '📦';
}


