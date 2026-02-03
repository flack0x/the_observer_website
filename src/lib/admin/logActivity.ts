import { SupabaseClient } from '@supabase/supabase-js';
import { ActivityAction, ActivityTargetType } from './types';

/**
 * Log an admin action to the activity_log table
 */
export async function logActivity(
  supabase: SupabaseClient,
  userId: string,
  action: ActivityAction,
  targetType: ActivityTargetType,
  targetId: string | null,
  targetTitle: string | null,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.from('activity_log').insert({
      user_id: userId,
      action,
      target_type: targetType,
      target_id: targetId,
      target_title: targetTitle,
      details: details || {},
    });
  } catch (error) {
    // Log to console but don't throw - activity logging shouldn't break operations
    console.error('Failed to log activity:', error);
  }
}

/**
 * Helper to get a display-friendly action description
 */
export function getActionLabel(action: ActivityAction): string {
  const labels: Record<ActivityAction, string> = {
    create: 'created',
    update: 'updated',
    publish: 'published',
    unpublish: 'unpublished',
    delete: 'deleted',
    upload: 'uploaded',
    role_change: 'changed role for',
  };
  return labels[action];
}

/**
 * Helper to get action color for UI
 */
export function getActionColor(action: ActivityAction): string {
  const colors: Record<ActivityAction, string> = {
    create: 'text-blue-400',
    update: 'text-slate-400',
    publish: 'text-earth-olive',
    unpublish: 'text-tactical-amber',
    delete: 'text-tactical-red',
    upload: 'text-blue-400',
    role_change: 'text-purple-400',
  };
  return colors[action];
}
