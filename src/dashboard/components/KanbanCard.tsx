import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Card, Box, Text, Badge, IconButton } from '@wix/design-system';
import * as Icons from '@wix/wix-ui-icons-common';

/**
 * KanbanCard - A draggable card component for the Kanban board
 * 
 * @param id - Unique identifier for the card (used for drag-and-drop)
 * @param index - Position of the card in its column (required by react-beautiful-dnd)
 * @param title - The main title/heading of the card
 * @param description - Optional description text for the card
 * @param priority - Priority level: 'low', 'medium', or 'high' (affects badge color)
 * @param onEdit - Optional callback when edit button is clicked
 * @param onDelete - Optional callback when delete button is clicked
 */

export type Priority = 'low' | 'medium' | 'high';

export interface KanbanCardProps {
  id: string;
  index: number;
  title: string;
  description?: string;
  priority?: Priority;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

// Maps priority levels to Wix Design System badge skins
const priorityColors: Record<Priority, 'success' | 'warning' | 'danger'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
};

export default function KanbanCard({
  id,
  index,
  title,
  description,
  priority = 'medium',
  onEdit,
  onDelete,
}: KanbanCardProps) {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            marginBottom: '8px',
          }}
        >
          <Card>
            <Card.Content>
              <Box direction="vertical" gap={2}>
                {/* Header row with title and action buttons */}
                <Box align="space-between" verticalAlign="middle">
                  <Text weight="bold" size="small">
                    {title}
                  </Text>
                  <Box gap={1}>
                    {onEdit && (
                      <IconButton
                        size="tiny"
                        skin="inverted"
                        onClick={() => onEdit(id)}
                      >
                        <Icons.Edit />
                      </IconButton>
                    )}
                    {onDelete && (
                      <IconButton
                        size="tiny"
                        skin="inverted"
                        onClick={() => onDelete(id)}
                      >
                        <Icons.Delete />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                {/* Optional description text */}
                {description && (
                  <Text size="tiny" secondary>
                    {description}
                  </Text>
                )}

                {/* Priority badge */}
                <Box>
                  <Badge size="tiny" skin={priorityColors[priority]}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Badge>
                </Box>
              </Box>
            </Card.Content>
          </Card>
        </div>
      )}
    </Draggable>
  );
}

