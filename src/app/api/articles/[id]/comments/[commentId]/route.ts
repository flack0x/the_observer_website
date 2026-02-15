import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';
export const preferredRegion = 'bom1';

// Create admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// DELETE /api/articles/[id]/comments/[commentId] - Delete a comment
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id, commentId } = await params;
  const articleId = parseInt(id, 10);

  if (isNaN(articleId)) {
    return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 });
  }

  try {
    // Get sessionId from query params (for guests)
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    // Check if authenticated user
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
              // Ignore
            }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Fetch the comment to check ownership
    const { data: comment, error: fetchError } = await supabaseAdmin
      .from('article_comments')
      .select('id, user_id, session_id, article_id')
      .eq('id', commentId)
      .eq('article_id', articleId)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check authorization
    let isAuthorized = false;

    if (user) {
      // Authenticated user
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const isOwner = comment.user_id === user.id;
      const isAdmin = profile?.role === 'admin';
      isAuthorized = isOwner || isAdmin;
    } else if (sessionId && comment.session_id) {
      // Guest user - can only delete own comments
      isAuthorized = comment.session_id === sessionId && comment.user_id === null;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Not authorized to delete this comment' }, { status: 403 });
    }

    // Delete the comment (cascade will handle child comments)
    const { error: deleteError } = await supabaseAdmin
      .from('article_comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      console.error('Error deleting comment:', deleteError);
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/articles/[id]/comments/[commentId] - Edit a comment
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id, commentId } = await params;
  const articleId = parseInt(id, 10);

  if (isNaN(articleId)) {
    return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { content, sessionId } = body;

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

    // Check if authenticated user
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
              // Ignore
            }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Fetch the comment to check ownership
    const { data: comment, error: fetchError } = await supabaseAdmin
      .from('article_comments')
      .select('id, user_id, session_id, article_id, guest_name')
      .eq('id', commentId)
      .eq('article_id', articleId)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check authorization
    let isAuthorized = false;
    const isGuest = !comment.user_id;

    if (user) {
      // Authenticated user - can only edit own comments
      isAuthorized = comment.user_id === user.id;
    } else if (sessionId && comment.session_id) {
      // Guest user - can only edit own comments
      isAuthorized = comment.session_id === sessionId && comment.user_id === null;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Not authorized to edit this comment' }, { status: 403 });
    }

    // Update the comment
    const { data: updatedComment, error: updateError } = await supabaseAdmin
      .from('article_comments')
      .update({ content: trimmedContent })
      .eq('id', commentId)
      .select('id, content, parent_id, is_edited, created_at, user_id, guest_name, session_id')
      .single();

    if (updateError) {
      console.error('Error updating comment:', updateError);
      return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
    }

    // Get author name
    let authorName = 'Anonymous';
    let authorAvatar = null;

    if (isGuest) {
      authorName = comment.guest_name || 'Guest';
    } else if (user) {
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();
      authorName = profile?.full_name || 'Anonymous';
      authorAvatar = profile?.avatar_url || null;
    }

    const transformedComment = {
      id: updatedComment.id,
      content: updatedComment.content,
      parentId: updatedComment.parent_id,
      isEdited: updatedComment.is_edited,
      createdAt: updatedComment.created_at,
      userId: updatedComment.user_id,
      sessionId: updatedComment.session_id,
      isGuest,
      author: {
        name: authorName,
        avatar: authorAvatar,
      },
    };

    return NextResponse.json({ comment: transformedComment });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
