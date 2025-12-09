import React from 'react';
import { Box, Text, Timeline } from '@wix/design-system';
import { ActivityLogEntry, HistoryMetadata } from '../../../types/kanbanCard.js';

/**
 * HistoryTab - Read-only log of card changes from ActivityLog
 * 
 * Displays a timeline of all history entries including:
 * - Stage changes
 * - Field updates
 * - User who made the change
 * - Timestamp
 * 
 * @param entries - History entries from ActivityLog
 */

export interface HistoryTabProps {
  entries: ActivityLogEntry[];
}

export default function HistoryTab({ entries }: HistoryTabProps) {
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
      
      <Timeline>
        {entries.map((entry) => {
          const metadata = entry.metadata as HistoryMetadata | undefined;
          const date = entry._createdDate 
            ? new Date(entry._createdDate).toLocaleString()
            : 'Unknown date';

          return (
            <Timeline.Item
              key={entry._id}
              label={
                <Box direction="vertical" gap={1}>
                  <Text size="small">{entry.content}</Text>
                  {metadata?.field && (
                    <Text size="tiny" secondary>
                      Field: {metadata.field}
                      {metadata.oldValue && metadata.newValue && (
                        <> ({metadata.oldValue} → {metadata.newValue})</>
                      )}
                    </Text>
                  )}
                  <Text size="tiny" light>
                    {date} • {entry.userName || entry.userId || 'System'}
                  </Text>
                </Box>
              }
            />
          );
        })}
      </Timeline>
    </Box>
  );
}
