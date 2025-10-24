/**
 * Supabase 客户端配置
 * 用于异步对战系统的在线功能
 */

import { createClient } from '@supabase/supabase-js';

// Supabase 配置
// 请在 Supabase Dashboard 中创建项目并获取这些值
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 创建 Supabase 客户端
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// 检查 Supabase 是否配置
export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

// 数据库类型定义
export type Database = {
  public: {
    Tables: {
      ladder_players: {
        Row: {
          id: string;
          player_name: string;
          current_rank: number | null;
          highest_rank: number | null;
          total_challenges: number;
          total_wins: number;
          total_losses: number;
          total_defenses: number;
          defense_wins: number;
          defense_losses: number;
          defense_formation: any; // JSON
          last_active_time: string;
          rank_updated_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          player_name: string;
          current_rank?: number | null;
          highest_rank?: number | null;
          total_challenges?: number;
          total_wins?: number;
          total_losses?: number;
          total_defenses?: number;
          defense_wins?: number;
          defense_losses?: number;
          defense_formation?: any;
          last_active_time?: string;
          rank_updated_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          player_name?: string;
          current_rank?: number | null;
          highest_rank?: number | null;
          total_challenges?: number;
          total_wins?: number;
          total_losses?: number;
          total_defenses?: number;
          defense_wins?: number;
          defense_losses?: number;
          defense_formation?: any;
          last_active_time?: string;
          rank_updated_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      challenge_records: {
        Row: {
          id: string;
          attacker_id: string;
          defender_id: string;
          result: 'attacker_win' | 'defender_win';
          attacker_rank_before: number | null;
          attacker_rank_after: number | null;
          defender_rank_before: number;
          defender_rank_after: number;
          battle_duration: number;
          battle_stats: any; // JSON
          challenge_time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          attacker_id: string;
          defender_id: string;
          result: 'attacker_win' | 'defender_win';
          attacker_rank_before?: number | null;
          attacker_rank_after?: number | null;
          defender_rank_before: number;
          defender_rank_after: number;
          battle_duration: number;
          battle_stats?: any;
          challenge_time?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          attacker_id?: string;
          defender_id?: string;
          result?: 'attacker_win' | 'defender_win';
          attacker_rank_before?: number | null;
          attacker_rank_after?: number | null;
          defender_rank_before?: number;
          defender_rank_after?: number;
          battle_duration?: number;
          battle_stats?: any;
          challenge_time?: string;
          created_at?: string;
        };
      };
    };
  };
};


