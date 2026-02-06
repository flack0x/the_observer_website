import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string[] }>;
}

// GET /api/admin/books/[...id] - Get single book review
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const reviewId = id.join('/');

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

    // Fetch book review
    const { data: bookReview, error } = await supabase
      .from('book_reviews')
      .select('*')
      .eq('review_id', reviewId)
      .single();

    if (error || !bookReview) {
      return NextResponse.json({ error: 'Book review not found' }, { status: 404 });
    }

    return NextResponse.json({ data: bookReview });
  } catch (error) {
    console.error('Error fetching book review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/books/[...id] - Update book review
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const reviewId = id.join('/');

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

    const body = await request.json();

    // Build update object (only include provided fields)
    const updateData: Record<string, unknown> = {
      last_edited_by: user.id,
    };

    // Map body fields to database columns
    if (body.book_title !== undefined) updateData.book_title = body.book_title;
    if (body.author !== undefined) updateData.author = body.author;
    if (body.cover_image_url !== undefined) updateData.cover_image_url = body.cover_image_url;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.key_points !== undefined) updateData.key_points = body.key_points;
    if (body.rating !== undefined) updateData.rating = body.rating;
    if (body.recommendation_level !== undefined) updateData.recommendation_level = body.recommendation_level;
    if (body.telegram_link !== undefined) updateData.telegram_link = body.telegram_link;
    if (body.status !== undefined) {
      updateData.status = body.status;
      // Set published_at when status changes to published
      if (body.status === 'published') {
        updateData.published_at = new Date().toISOString();
      }
    }

    // Update book review
    const { data: updatedReview, error } = await supabase
      .from('book_reviews')
      .update(updateData)
      .eq('review_id', reviewId)
      .select()
      .single();

    if (error) {
      console.error('Error updating book review:', error);
      return NextResponse.json({ error: 'Failed to update book review' }, { status: 500 });
    }

    return NextResponse.json({
      data: updatedReview,
      message: 'Book review updated successfully',
    });
  } catch (error) {
    console.error('Error updating book review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/books/[...id] - Delete book review
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const reviewId = id.join('/');

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role - only admins can delete
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Delete book review
    const { error } = await supabase
      .from('book_reviews')
      .delete()
      .eq('review_id', reviewId);

    if (error) {
      console.error('Error deleting book review:', error);
      return NextResponse.json({ error: 'Failed to delete book review' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Book review deleted successfully' });
  } catch (error) {
    console.error('Error deleting book review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
