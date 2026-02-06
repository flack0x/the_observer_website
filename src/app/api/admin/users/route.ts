import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/users - List all users
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role - admin only
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Fetch all user profiles
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/users - Update user role
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role - admin only
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: 'userId and role required' }, { status: 400 });
    }

    if (!['admin', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Prevent demoting yourself
    if (userId === user.id) {
      return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
    }

    // Update user role
    const { data: updatedUser, error } = await supabase
      .from('user_profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json({
      data: updatedUser,
      message: 'User role updated successfully',
    });
  } catch (error) {
    console.error('Error in update user API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
