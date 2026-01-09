import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/articles/[id] - Get single article
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    if (!profile || !['admin', 'editor'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Decode the ID (it may contain slashes)
    const decodedId = decodeURIComponent(id);

    // Fetch article
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('telegram_id', decodedId)
      .single();

    if (error || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // If this is a website article, fetch the paired article too
    if (decodedId.startsWith('website/')) {
      const baseId = decodedId.replace(/-en$|-ar$/, '');
      const otherChannel = article.channel === 'en' ? 'ar' : 'en';
      const otherId = `${baseId}-${otherChannel}`;

      const { data: pairedArticle } = await supabase
        .from('articles')
        .select('*')
        .eq('telegram_id', otherId)
        .single();

      return NextResponse.json({
        data: {
          [article.channel]: article,
          [otherChannel]: pairedArticle || null,
        },
      });
    }

    return NextResponse.json({ data: article });
  } catch (error) {
    console.error('Error in get article API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/articles/[id] - Update article
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    if (!profile || !['admin', 'editor'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const decodedId = decodeURIComponent(id);

    // Fetch existing article
    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('telegram_id', decodedId)
      .single();

    if (fetchError || !existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Build update object
    const updateData: Record<string, any> = {
      last_edited_by: user.id,
      updated_at: new Date().toISOString(),
    };

    // Only update fields that are provided
    if (body.title !== undefined) updateData.title = body.title;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.countries !== undefined) updateData.countries = body.countries;
    if (body.organizations !== undefined) updateData.organizations = body.organizations;
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.video_url !== undefined) updateData.video_url = body.video_url;

    // Handle status change
    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === 'published' && !existingArticle.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }

    // Save revision before updating
    await supabase.from('article_revisions').insert({
      article_id: existingArticle.id,
      title: existingArticle.title,
      content: existingArticle.content,
      edited_by: user.id,
    });

    // Update article
    const { data: updatedArticle, error: updateError } = await supabase
      .from('articles')
      .update(updateData)
      .eq('telegram_id', decodedId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating article:', updateError);
      return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
    }

    return NextResponse.json({
      data: updatedArticle,
      message: 'Article updated successfully',
    });
  } catch (error) {
    console.error('Error in update article API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/articles/[id] - Delete article
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

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

    const decodedId = decodeURIComponent(id);

    // Delete article
    const { error: deleteError } = await supabase
      .from('articles')
      .delete()
      .eq('telegram_id', decodedId);

    if (deleteError) {
      console.error('Error deleting article:', deleteError);
      return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
    }

    // If this is a website article, also delete the paired article
    if (decodedId.startsWith('website/')) {
      const baseId = decodedId.replace(/-en$|-ar$/, '');
      const otherChannel = decodedId.endsWith('-en') ? 'ar' : 'en';
      const otherId = `${baseId}-${otherChannel}`;

      await supabase.from('articles').delete().eq('telegram_id', otherId);
    }

    return NextResponse.json({
      message: 'Article deleted successfully',
    });
  } catch (error) {
    console.error('Error in delete article API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
