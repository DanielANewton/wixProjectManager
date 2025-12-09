import React from 'react';
import { Box, Text, Timeline } from '@wix/design-system';
import { CardAction, HistoryMetadata } from '../../../types/kanbanCard.js';

/**
 * HistoryTab - Read-only log of card changes
 * 
 * Displays a timeline of all history entries including:
 * - Stage changes
 * - Field updates
 * - User who made the change
 * - Timestamp
 * 
 * @param actions - History action entries
 */

export interface HistoryTabProps {
  actions: CardAction[];
}

export default function HistoryTab({ actions }: HistoryTabProps) {
  if (actions.length === 0) {
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
        {actions.map((action) => {
          const metadata = action.metadata as HistoryMetadata | undefined;
          const date = action._createdDate 
            ? new Date(action._createdDate).toLocaleString()
            : 'Unknown date';

          return (
            <Timeline.Item
              key={action._id}
              label={
                <Box direction="vertical" gap={1}>
                  <Text size="small">{action.content}</Text>
                  {metadata?.field && (
                    <Text size="tiny" secondary>
                      Field: {metadata.field}
                      {metadata.oldValue && metadata.newValue && (
                        <> ({metadata.oldValue} → {metadata.newValue})</>
                      )}
                    </Text>
                  )}
                  <Text size="tiny" light>
                    {date} • {action.userName || action.userId || 'System'}
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

