import React from 'react';
import { Box, Text, Avatar } from '@wix/design-system';
import { ActivityLogEntry, HistoryMetadata } from '../../../types/kanbanCard.js';

/**
 * HistoryTab - Read-only log of card changes from ActivityLog
 * 
 * Displays a list of all history entries including:
 * - Stage changes
 * - Field updates
 * - User who made the change (with photo)
 * - Timestamp
 * 
 * Shows user photos next to each history entry for better audit trail.
 * 
 * @param entries - History entries from ActivityLog
 */

export interface HistoryTabProps {
  entries: ActivityLogEntry[];
}

export default function HistoryTab({ entries }: HistoryTabProps) {
  // Show empty state if no entries
  if (entries.length === 0) {
    return (
      <Box align="center" verticalAlign="middle" height="200px">
        <Text secondary>No history entries yet</Text>
      </Box>
    );
  }

  return (
    <Box direction="vertical" gap={3}>
      <Text size="small" weight="bold">Change History</Text>
      
      <Box direction="vertical" gap={2}>
        {entries.map((entry) => (
          <HistoryItem key={entry._id} entry={entry} />
        ))}
      </Box>
    </Box>
  );
}

/**
 * HistoryItem - Individual history entry with user photo
 */
interface HistoryItemProps {
  entry: ActivityLogEntry;
}

function HistoryItem({ entry }: HistoryItemProps) {
  const metadata = entry.metadata as HistoryMetadata | undefined;
  const date = entry._createdDate 
    ? new Date(entry._createdDate).toLocaleString()
    : 'Unknown date';
  
  // Get display name and photo
  const userName = entry.userName || entry.userId || 'System';
  const userPhoto = entry.userPhoto;
  const initials = userName.charAt(0).toUpperCase();

  return (
    <Box
      padding="8px 12px"
      backgroundColor="#f8f8f8"
      borderRadius="6px"
      gap={2}
      verticalAlign="top"
    >
      {/* User Avatar - show photo if available, otherwise initials */}
      {userPhoto ? (
        <img
          src={userPhoto}
          alt={userName}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0,
            marginTop: '2px',
          }}
        />
      ) : (
        <Avatar
          size="size24"
          name={userName}
          text={initials}
        />
      )}
      
      <Box direction="vertical" gap={1} flex={1}>
        <Box align="space-between" verticalAlign="middle">
          <Text size="small">{entry.content}</Text>
          <Text size="tiny" secondary>{date}</Text>
        </Box>
        
        {metadata?.field && (
          <Text size="tiny" secondary>
            {metadata.field}
            {metadata.oldValue && metadata.newValue && (
              <>: {metadata.oldValue} → {metadata.newValue}</>
            )}
          </Text>
        )}
        
        <Text size="tiny" secondary>by {userName}</Text>
      </Box>
    </Box>
  );
}
