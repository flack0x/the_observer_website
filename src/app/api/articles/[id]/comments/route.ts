import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

// Create admin client for reading comments (bypasses RLS for count)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/articles/[id]/comments - Get comments for an article
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const articleId = parseInt(id, 10);

  if (isNaN(articleId)) {
    return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 });
  }

  try {
    // Fetch comments
    const { data: comments, error } = await supabaseAdmin
      .from('article_comments')
      .select('id, content, parent_id, is_edited, created_at, user_id')
      .eq('article_id', articleId)
      .eq('is_approved', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    // Fetch user profiles for all commenters
    const userIds = [...new Set((comments || []).map(c => c.user_id))];
    const { data: profiles } = userIds.length > 0
      ? await supabaseAdmin
          .from('user_profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds)
      : { data: [] };

    const profileMap = new Map(
      (profiles || []).map(p => [p.id, { full_name: p.full_name, avatar_url: p.avatar_url }])
    );

    // Transform the data to flatten user info
    const transformedComments = (comments || []).map((comment) => {
      const profile = profileMap.get(comment.user_id);
      return {
        id: comment.id,
        content: comment.content,
        parentId: comment.parent_id,
        isEdited: comment.is_edited,
        createdAt: comment.created_at,
        userId: comment.user_id,
        author: {
          name: profile?.full_name || 'Anonymous',
          avatar: profile?.avatar_url || null,
        },
      };
    });

    return NextResponse.json({ comments: transformedComments });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/articles/[id]/comments - Create a new comment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const articleId = parseInt(id, 10);

  if (isNaN(articleId)) {
    return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 });
  }

  // Create authenticated Supabase client
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore if called from Server Component
          }
        },
      },
    }
  );

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content, parentId } = body;

    // Validate content
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length < 3) {
      return NextResponse.json({ error: 'Comment must be at least 3 characters' }, { status: 400 });
    }

    if (trimmedContent.length > 2000) {
      return NextResponse.json({ error: 'Comment must be less than 2000 characters' }, { status: 400 });
    }

    // Verify article exists
    const { data: article, error: articleError } = await supabaseAdmin
      .from('articles')
      .select('id')
      .eq('id', articleId)
      .single();

    if (articleError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // If parentId is provided, verify it exists
    if (parentId) {
      const { data: parentComment, error: parentError } = await supabaseAdmin
        .from('article_comments')
        .select('id')
        .eq('id', parentId)
        .eq('article_id', articleId)
        .single();

      if (parentError || !parentComment) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }
    }

    // Insert comment using admin client to avoid RLS issues
    const { data: comment, error: insertError } = await supabaseAdmin
      .from('article_comments')
      .insert({
        article_id: articleId,
        user_id: user.id,
        content: trimmedContent,
        parent_id: parentId || null,
      })
      .select(`
        id,
        content,
        parent_id,
        is_edited,
        created_at,
        user_id
      `)
      .single();

    if (insertError) {
      console.error('Error creating comment:', insertError);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    // Fetch user profile for response
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single();

    const transformedComment = {
      id: comment.id,
      content: comment.content,
      parentId: comment.parent_id,
      isEdited: comment.is_edited,
      createdAt: comment.created_at,
      userId: comment.user_id,
      author: {
        name: profile?.full_name || 'Anonymous',
        avatar: profile?.avatar_url || null,
      },
    };

    return NextResponse.json({ comment: transformedComment }, { status: 201 });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
