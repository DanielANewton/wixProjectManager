import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Loader, Box, Text } from '@wix/design-system';
import KanbanColumn, { CardData } from './KanbanColumn.js';
import { useContacts, ContactCard } from '../hooks/useContacts.js';
import { useKanbanCards } from '../hooks/useKanbanCards.js';
import { ContactStatus } from '../types/kanbanCard.js';
import ExpandedCardView from './ExpandedCardView/ExpandedCardView.js';

/**
 * KanbanBoard - Main Kanban board component with drag-and-drop functionality
 * 
 * This component manages the state of all columns and cards, handling:
 * - Loading contacts from Wix CRM and syncing with Kanban cards
 * - Drag and drop between columns with database persistence
 * - Opening expanded card view on card click
 * - Adding, editing, and deleting cards
 * 
 * @param onBoardChange - Optional callback when board state changes
 */

export interface ColumnData {
  id: string;
  title: string;
  cards: CardData[];
}

export interface KanbanBoardProps {
  onBoardChange?: (columns: ColumnData[]) => void;
}

// YorProject Kanban Workflow Stages - 17 stages for the customer journey
export const columnConfig = [
  { id: 'engage', title: '1. Engage' },
  { id: 'intent', title: '2. Intent' },
  { id: 'engagement', title: '3. Engagement' },
  { id: 'advice-call', title: '4. Advice Call' },
  { id: 'qualification', title: '5. Qualification' },
  { id: 'straight-to-quote', title: '6. Straight to Quote' },
  { id: 'routing-pqq', title: '7. Routing / PQQ' },
  { id: 'booking', title: '8. Booking' },
  { id: 'assessment-undertaken', title: '9. Assessment Undertaken' },
  { id: 'assessment-completed', title: '10. Assessment Completed' },
  { id: 'sales-pitch', title: '11. Sales Pitch' },
  { id: 'tender-quote', title: '12. Tender / Quote' },
  { id: 'supplier-survey', title: '13. Supplier Survey' },
  { id: 'go-no-go', title: '14. Go / No Go' },
  { id: 'finance-payment', title: '15. Finance & Payment' },
  { id: 'installation', title: '16. Installation' },
  { id: 'project-completion', title: '17. Project Completion' },
] as const;

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
  const { contacts, isLoading: isLoadingContacts, isError, error } = useContacts();
  
  // Kanban cards data layer for persistence
  const { moveCard, isMoving } = useKanbanCards();
  
  // State to track all columns and their cards
  const [columns, setColumns] = useState<ColumnData[]>(
    columnConfig.map(col => ({ ...col, cards: [] }))
  );

  // State for expanded card view
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [expandedStageId, setExpandedStageId] = useState<ContactStatus | null>(null);

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
   * Updates card positions and persists stage changes to database
   */
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

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

    // Moving within the same column (reordering)
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
      // Moving between different columns (stage change)
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
      
      // Persist the stage change to the database
      try {
        await moveCard({
          cardId: draggableId,
          fromStage: sourceColumn.title,
          toStageId: destColumn.id as ContactStatus,
          toStageName: destColumn.title,
        });
        console.log('📋 Card moved and persisted:', movedCard.id, 'to:', destColumn.id);
      } catch (err) {
        console.error('📋 Failed to persist card move:', err);
        // Could revert the UI change here if persistence fails
      }
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
   * Opens the expanded card view when a card is clicked
   */
  const handleCardClick = (cardId: string, columnId: string) => {
    setExpandedCardId(cardId);
    setExpandedStageId(columnId as ContactStatus);
    console.log('📋 Opening expanded view for card:', cardId);
  };

  /**
   * Closes the expanded card view
   */
  const handleCloseExpandedView = () => {
    setExpandedCardId(null);
    setExpandedStageId(null);
  };

  /**
   * Handles card edit - opens expanded view for editing
   */
  const handleEditCard = (cardId: string) => {
    // Find which column this card is in
    const column = columns.find(col => 
      col.cards.some(card => card.id === cardId)
    );
    if (column) {
      handleCardClick(cardId, column.id);
    }
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

  /**
   * Handles card selection from the expanded view's column browser
   */
  const handleExpandedCardSelect = (cardId: string) => {
    setExpandedCardId(cardId);
  };

  /**
   * Handles stage change from the expanded view's column browser
   */
  const handleExpandedStageChange = (stageId: ContactStatus) => {
    setExpandedStageId(stageId);
  };

  // Show loading state while fetching contacts
  if (isLoadingContacts) {
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
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          style={{
            display: 'flex',
            gap: '24px',
            overflowX: 'auto',
            padding: '16px',
            minHeight: '600px',
            opacity: isMoving ? 0.7 : 1,
            transition: 'opacity 0.2s ease',
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
              onCardClick={(cardId) => handleCardClick(cardId, column.id)}
            />
          ))}
        </div>
      </DragDropContext>

      {/* Expanded Card View Modal */}
      {expandedCardId && expandedStageId && (
        <ExpandedCardView
          cardId={expandedCardId}
          stageId={expandedStageId}
          columns={columns}
          onClose={handleCloseExpandedView}
          onCardSelect={handleExpandedCardSelect}
          onStageChange={handleExpandedStageChange}
        />
      )}
    </>
  );
}
