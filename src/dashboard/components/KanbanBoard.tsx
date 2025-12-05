import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Loader, Box, Text } from '@wix/design-system';
import KanbanColumn, { CardData } from './KanbanColumn.js';
import { useContacts, ContactCard } from '../hooks/useContacts.js';

/**
 * KanbanBoard - Main Kanban board component with drag-and-drop functionality
 * 
 * This component manages the state of all columns and cards, handling:
 * - Loading contacts from Wix CRM
 * - Drag and drop between columns
 * - Reordering cards within the same column
 * - Adding, editing, and deleting cards
 * 
 * @param onBoardChange - Optional callback when board state changes (for persistence)
 */

export interface ColumnData {
  id: string;
  title: string;
  cards: CardData[];
}

export interface KanbanBoardProps {
  onBoardChange?: (columns: ColumnData[]) => void;
}

// Column configuration with titles
const columnConfig = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

/**
 * Organizes contact cards into columns based on their status
 */
function organizeContactsIntoColumns(contacts: ContactCard[]): ColumnData[] {
  return columnConfig.map(col => ({
    id: col.id,
    title: col.title,
    cards: contacts
      .filter(contact => contact.status === col.id)
      .map(contact => ({
        id: contact.id,
        title: contact.title,
        description: contact.description,
        priority: contact.priority,
      })),
  }));
}

export default function KanbanBoard({ onBoardChange }: KanbanBoardProps) {
  // Fetch contacts from Wix CRM
  const { contacts, isLoading, isError, error, refetch } = useContacts();
  
  // State to track all columns and their cards
  const [columns, setColumns] = useState<ColumnData[]>(
    columnConfig.map(col => ({ ...col, cards: [] }))
  );

  // Update columns when contacts are loaded
  useEffect(() => {
    if (contacts.length > 0) {
      const organizedColumns = organizeContactsIntoColumns(contacts);
      setColumns(organizedColumns);
      console.log('📋 Board initialized with contacts:', contacts.length);
    }
  }, [contacts]);

  /**
   * Handles the end of a drag operation
   * Updates card positions based on where the card was dropped
   */
  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    // If dropped outside a valid droppable area, do nothing
    if (!destination) return;

    // If dropped in the same position, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Find source and destination columns
    const sourceColumn = columns.find((col) => col.id === source.droppableId);
    const destColumn = columns.find((col) => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    // Moving within the same column
    if (sourceColumn.id === destColumn.id) {
      const newCards = Array.from(sourceColumn.cards);
      const [movedCard] = newCards.splice(source.index, 1);
      newCards.splice(destination.index, 0, movedCard);

      const newColumns = columns.map((col) =>
        col.id === sourceColumn.id ? { ...col, cards: newCards } : col
      );

      setColumns(newColumns);
      onBoardChange?.(newColumns);
    } else {
      // Moving between different columns
      const sourceCards = Array.from(sourceColumn.cards);
      const destCards = Array.from(destColumn.cards);

      // Remove card from source column
      const [movedCard] = sourceCards.splice(source.index, 1);

      // Add card to destination column
      destCards.splice(destination.index, 0, movedCard);

      const newColumns = columns.map((col) => {
        if (col.id === sourceColumn.id) {
          return { ...col, cards: sourceCards };
        }
        if (col.id === destColumn.id) {
          return { ...col, cards: destCards };
        }
        return col;
      });

      setColumns(newColumns);
      onBoardChange?.(newColumns);
      
      // Log the status change - this could trigger a CRM update
      console.log('📋 Card moved:', movedCard.id, 'to column:', destColumn.id);
    }
  };

  /**
   * Adds a new card to the specified column
   */
  const handleAddCard = (columnId: string) => {
    const newCard: CardData = {
      id: `card-${Date.now()}`,
      title: 'New Contact',
      description: 'Add contact details',
      priority: 'medium',
    };

    const newColumns = columns.map((col) =>
      col.id === columnId
        ? { ...col, cards: [...col.cards, newCard] }
        : col
    );

    setColumns(newColumns);
    onBoardChange?.(newColumns);
  };

  /**
   * Handles card edit - logs for now, can be extended with modal
   */
  const handleEditCard = (cardId: string) => {
    console.log('📋 Edit card:', cardId);
    // TODO: Implement edit modal to update contact in CRM
  };

  /**
   * Deletes a card from all columns
   */
  const handleDeleteCard = (cardId: string) => {
    const newColumns = columns.map((col) => ({
      ...col,
      cards: col.cards.filter((card) => card.id !== cardId),
    }));

    setColumns(newColumns);
    onBoardChange?.(newColumns);
    console.log('📋 Card deleted:', cardId);
  };

  // Show loading state while fetching contacts
  if (isLoading) {
    return (
      <Box align="center" verticalAlign="middle" height="400px">
        <Box direction="vertical" align="center" gap={3}>
          <Loader size="medium" />
          <Text>Loading contacts from CRM...</Text>
        </Box>
      </Box>
    );
  }

  // Show error state if fetching failed
  if (isError) {
    return (
      <Box align="center" verticalAlign="middle" height="400px">
        <Box direction="vertical" align="center" gap={3}>
          <Text>Failed to load contacts</Text>
          <Text size="small" secondary>
            {error instanceof Error ? error.message : 'Unknown error'}
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div
        style={{
          display: 'flex',
          gap: '24px',
          overflowX: 'auto',
          padding: '16px',
          minHeight: '600px',
        }}
      >
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            cards={column.cards}
            onAddCard={handleAddCard}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
