import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const preferredRegion = 'bom1';

// GET /api/admin/activity - Get activity log with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const action = searchParams.get('action');
    const targetType = searchParams.get('targetType');
    const userId = searchParams.get('userId');

    // Build query with user join
    let query = supabase
      .from('activity_log')
      .select(`
        *,
        user:user_profiles!user_id (
          full_name,
          email,
          avatar_url
        )
      `, { count: 'exact' });

    // Apply filters
    if (action) {
      query = query.eq('action', action);
    }
    if (targetType) {
      query = query.eq('target_type', targetType);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data: activities, error, count } = await query;

    if (error) {
      console.error('Error fetching activity log:', error);
      return NextResponse.json({ error: 'Failed to fetch activity log' }, { status: 500 });
    }

    return NextResponse.json({
      data: activities,
      total: count || 0,
      page,
      pageSize,
      hasMore: (count || 0) > to + 1,
    });
  } catch (error) {
    console.error('Error in activity log API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
