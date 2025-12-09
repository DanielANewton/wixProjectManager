import React, { useState } from 'react';
import { Box, Text, InputArea, Button, Avatar, Divider } from '@wix/design-system';
import { ActivityLogEntry, CommentMetadata } from '../../../types/kanbanCard.js';

/**
 * CommentsTab - Threaded comments from users and boards
 * 
 * Features:
 * - Display existing comments with author and timestamp
 * - Add new comments
 * - Show if comment is from external board
 * 
 * @param comments - Comment entries from ActivityLog
 * @param onAddComment - Callback to add a new comment
 */

export interface CommentsTabProps {
  comments: ActivityLogEntry[];
  onAddComment: (content: string) => void;
}

export default function CommentsTab({ comments, onAddComment }: CommentsTabProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle submit
  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      onAddComment(newComment);
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box direction="vertical" gap={4}>
      {/* Add Comment Form */}
      <Box direction="vertical" gap={2}>
        <Text size="small" weight="bold">Add Comment</Text>
        <InputArea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          rows={3}
        />
        <Box align="right">
          <Button
            size="small"
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </Box>
      </Box>

      <Divider />

      {/* Comments List */}
      <Box direction="vertical" gap={3}>
        <Text size="small" weight="bold">
          Comments ({comments.length})
        </Text>

        {comments.length === 0 ? (
          <Box align="center" padding="24px">
            <Text secondary size="small">No comments yet. Be the first to comment!</Text>
          </Box>
        ) : (
          <Box direction="vertical" gap={3}>
            {comments.map((comment) => (
              <CommentItem key={comment._id} comment={comment} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

/**
 * CommentItem - Individual comment display
 */
interface CommentItemProps {
  comment: ActivityLogEntry;
}

function CommentItem({ comment }: CommentItemProps) {
  const metadata = comment.metadata as CommentMetadata | undefined;
  const date = comment._createdDate
    ? new Date(comment._createdDate).toLocaleString()
    : '';
  
  // Get initials for avatar
  const userName = comment.userName || comment.userId || 'User';
  const initials = userName.charAt(0).toUpperCase();

  return (
    <Box
      padding="12px"
      backgroundColor="#ffffff"
      borderRadius="8px"
      gap={3}
    >
      <Avatar
        size="size30"
        name={userName}
        text={initials}
      />
      
      <Box direction="vertical" gap={1} flex={1}>
        <Box align="space-between" verticalAlign="middle">
          <Box gap={2} verticalAlign="middle">
            <Text size="small" weight="bold">
              {userName}
            </Text>
            {metadata?.isFromExternalBoard && metadata.boardName && (
              <Text size="tiny" secondary>
                from {metadata.boardName}
              </Text>
            )}
          </Box>
          <Text size="tiny" secondary>
            {date}
          </Text>
        </Box>
        
        <Text size="small">
          {comment.content}
        </Text>
      </Box>
    </Box>
  );
}
