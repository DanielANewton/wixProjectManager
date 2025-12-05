import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Box, Text, IconButton } from '@wix/design-system';
import * as Icons from '@wix/wix-ui-icons-common';
import KanbanCard from './KanbanCard.js';

/**
 * KanbanColumn - A droppable column that contains KanbanCards
 * 
 * @param id - Unique identifier for the column (used as droppableId)
 * @param title - Display title for the column header
 * @param cards - Array of card data to render in this column
 * @param onAddCard - Optional callback when the add button is clicked
 * @param onEditCard - Optional callback passed to cards for editing
 * @param onDeleteCard - Optional callback passed to cards for deletion
 */

export interface CardData {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface KanbanColumnProps {
  id: string;
  title: string;
  cards: CardData[];
  onAddCard?: (columnId: string) => void;
  onEditCard?: (cardId: string) => void;
  onDeleteCard?: (cardId: string) => void;
}

// Color mapping for different column types
const columnColors: Record<string, string> = {
  todo: '#E8F4FD',
  'in-progress': '#FFF4E5',
  done: '#E8F5E9',
};

export default function KanbanColumn({
  id,
  title,
  cards,
  onAddCard,
  onEditCard,
  onDeleteCard,
}: KanbanColumnProps) {
  // Get background color based on column id, fallback to light gray
  const backgroundColor = columnColors[id] || '#F5F5F5';

  return (
    <div
      style={{
        width: '300px',
        minHeight: '500px',
        padding: '16px',
        backgroundColor,
        borderRadius: '8px',
        flexShrink: 0,
      }}
    >
      {/* Column header with title and add button */}
      <Box align="space-between" verticalAlign="middle" marginBottom={3}>
        <Box gap={2} verticalAlign="middle">
          <Text weight="bold">{title}</Text>
          <CountBadge count={cards.length} />
        </Box>
        {onAddCard && (
          <IconButton
            size="small"
            skin="inverted"
            onClick={() => onAddCard(id)}
          >
            <Icons.Add />
          </IconButton>
        )}
      </Box>

      {/* Droppable area for cards */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              minHeight: '400px',
              backgroundColor: snapshot.isDraggingOver ? 'rgba(0,0,0,0.05)' : 'transparent',
              borderRadius: '4px',
              padding: '4px',
              transition: 'background-color 0.2s ease',
            }}
          >
            {/* Render all cards in this column */}
            {cards.map((card, index) => (
              <KanbanCard
                key={card.id}
                id={card.id}
                index={index}
                title={card.title}
                description={card.description}
                priority={card.priority}
                onEdit={onEditCard}
                onDelete={onDeleteCard}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

/**
 * CountBadge - Simple badge component to show card count
 * Uses a small circular design matching Wix Design System aesthetics
 */
function CountBadge({ count }: { count: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        backgroundColor: '#E0E0E0',
        borderRadius: '50%',
      }}
    >
      <Text size="tiny" weight="bold">
        {count}
      </Text>
    </div>
  );
}
