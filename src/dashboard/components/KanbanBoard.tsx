import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Loader, Box, Text, Button } from '@wix/design-system';
import * as Icons from '@wix/wix-ui-icons-common';
import KanbanColumn, { CardData } from './KanbanColumn.js';
import { useKanbanCards } from '../hooks/useKanbanCards.js';
import { ContactStatus, KanbanCard, ClientProfile, NewKanbanCard } from '../types/kanbanCard.js';
import ExpandedCardView from './ExpandedCardView/ExpandedCardView.js';
import CreateCardModal from './CreateCardModal.js';

/**
 * KanbanBoard - Main Kanban board component with drag-and-drop functionality
 *
 * This component manages the state of all columns and cards, handling:
 * - Loading cards from KanbanCards collection (linked to ClientProfiles)
 * - Drag and drop between columns with database persistence
 * - Opening expanded card view on card click
 * - Adding, editing, and deleting cards
 *
 * Data Flow: ClientProfiles -> KanbanCards -> KanbanBoard display
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
 * Gets display name for a card by looking up its linked profile
 *
 * @param card - The KanbanCard
 * @param profilesMap - Map of profile IDs to profiles
 * @returns Formatted display name (firstName lastName) or fallback
 */
function getCardDisplayName(
  card: KanbanCard,
  profilesMap: Map<string, ClientProfile>
): string {
  const profile = profilesMap.get(card.profileId);

  if (!profile?.clientInfo) {
    return 'Unknown Client';
  }

  const { firstName, lastName, email } = profile.clientInfo;
  const fullName = `${firstName || ''} ${lastName || ''}`.trim();

  if (fullName) return fullName;
  if (email) return email;
  return 'Unknown Client';
}

/**
 * Gets description for a card by looking up its linked profile
 *
 * @param card - The KanbanCard
 * @param profilesMap - Map of profile IDs to profiles
 * @returns Email or phone from profile, or notes from card
 */
function getCardDescription(
  card: KanbanCard,
  profilesMap: Map<string, ClientProfile>
): string {
  const profile = profilesMap.get(card.profileId);

  if (profile?.clientInfo?.email) {
    return profile.clientInfo.email;
  }
  if (profile?.clientInfo?.phone) {
    return profile.clientInfo.phone;
  }
  if (card.notes) {
    return card.notes;
  }
  return 'No contact info';
}

/**
 * Organizes KanbanCards into columns by their stageId
 * Enriches cards with profile data for display, including extended fields
 * for the enhanced card display (readiness, tags, callback date, etc.)
 *
 * @param cards - Array of KanbanCards from the database
 * @param profilesMap - Map of profile IDs to profiles for lookup
 * @returns Array of ColumnData with cards organized by stage
 */
function organizeCardsIntoColumns(
  cards: KanbanCard[],
  profilesMap: Map<string, ClientProfile>
): ColumnData[] {
  return columnConfig.map((col) => ({
    id: col.id,
    title: col.title,
    cards: cards
      .filter((card) => card.stageId === col.id)
      .map((card) => ({
        id: card._id || '',
        title: getCardDisplayName(card, profilesMap),
        description: getCardDescription(card, profilesMap),
        priority: 'medium' as const, // Default priority, can be extended later
        // Extended fields for enhanced card display
        readinessLevel: card.readinessLevel,
        interestTags: card.interestTags,
        callBackDate: card.callBackAppointmentDate,
        stageId: card.stageId,
        financeStatus: card.financeStatus,
        // Last updated by info for audit display
        lastUpdatedBy: card.lastUpdatedBy,
      })),
  }));
}

export default function KanbanBoard({ onBoardChange }: KanbanBoardProps) {
  // Fetch cards and profiles from the database
  const {
    cards,
    profiles,
    isLoading,
    isError,
    error,
    moveCard,
    isMoving,
    deleteCard,
    createCard,
    isCreating,
  } = useKanbanCards();

  // State for Create Card modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Create a map of profiles for quick lookup by ID
  const profilesMap = useMemo(() => {
    const map = new Map<string, ClientProfile>();
    for (const profile of profiles) {
      if (profile._id) {
        map.set(profile._id, profile);
      }
    }
    return map;
  }, [profiles]);

  // State to track all columns and their cards
  const [columns, setColumns] = useState<ColumnData[]>(
    columnConfig.map((col) => ({ ...col, cards: [] }))
  );

  // State for expanded card view
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [expandedStageId, setExpandedStageId] = useState<ContactStatus | null>(
    null
  );

  // Update columns when cards or profiles are loaded
  useEffect(() => {
    if (cards.length > 0 || profiles.length > 0) {
      const organizedColumns = organizeCardsIntoColumns(cards, profilesMap);
      setColumns(organizedColumns);
      console.log(
        '📋 Board initialized with cards:',
        cards.length,
        'profiles:',
        profiles.length
      );
    }
  }, [cards, profiles, profilesMap]);

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
        console.log(
          '📋 Card moved and persisted:',
          movedCard.id,
          'to:',
          destColumn.id
        );
      } catch (err) {
        console.error('📋 Failed to persist card move:', err);
        // Could revert the UI change here if persistence fails
      }
    }
  };

  /**
   * Adds a new card to the specified column
   * Note: In the new system, cards should be created via the Import page
   * This is kept for backwards compatibility but may show a placeholder
   */
  const handleAddCard = (columnId: string) => {
    // Cards should now be created via the Import page
    // This creates a placeholder card that won't be persisted
    const newCard: CardData = {
      id: `temp-card-${Date.now()}`,
      title: 'New Contact',
      description: 'Import contacts from the Import page',
      priority: 'medium',
    };

    const newColumns = columns.map((col) =>
      col.id === columnId ? { ...col, cards: [...col.cards, newCard] } : col
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
    const column = columns.find((col) =>
      col.cards.some((card) => card.id === cardId)
    );
    if (column) {
      handleCardClick(cardId, column.id);
    }
  };

  /**
   * Deletes a card from all columns and the database
   */
  const handleDeleteCard = async (cardId: string) => {
    // Update local state immediately for responsive UI
    const newColumns = columns.map((col) => ({
      ...col,
      cards: col.cards.filter((card) => card.id !== cardId),
    }));

    setColumns(newColumns);
    onBoardChange?.(newColumns);

    // Persist deletion to database (skip for temp cards)
    if (!cardId.startsWith('temp-')) {
      try {
        await deleteCard(cardId);
        console.log('📋 Card deleted from database:', cardId);
      } catch (err) {
        console.error('📋 Failed to delete card:', err);
      }
    }
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

  /**
   * Opens the Create Card modal
   */
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  /**
   * Closes the Create Card modal
   */
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  /**
   * Creates a new card via the backend service
   */
  const handleCreateCard = async (cardData: NewKanbanCard) => {
    try {
      const newCard = await createCard(cardData);
      console.log('📋 Card created successfully:', newCard?._id);
      // Modal will close after successful creation
    } catch (err) {
      console.error('📋 Failed to create card:', err);
      throw err; // Re-throw to let modal handle the error
    }
  };

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <Box align="center" verticalAlign="middle" height="400px">
        <Box direction="vertical" align="center" gap={3}>
          <Loader size="medium" />
          <Text>Loading Kanban cards...</Text>
        </Box>
      </Box>
    );
  }

  // Show error state if fetching failed
  if (isError) {
    return (
      <Box align="center" verticalAlign="middle" height="400px">
        <Box direction="vertical" align="center" gap={3}>
          <Text>Failed to load cards</Text>
          <Text size="small" secondary>
            {error instanceof Error ? error.message : 'Unknown error'}
          </Text>
        </Box>
      </Box>
    );
  }

  // Show empty state if no cards exist
  const totalCards = columns.reduce((sum, col) => sum + col.cards.length, 0);

  return (
    <>
      {/* Action Bar with Create Card button */}
      <Box
        align="space-between"
        verticalAlign="middle"
        marginBottom="SP4"
        padding="SP2"
      >
        <Text weight="bold">
          {totalCards} {totalCards === 1 ? 'Card' : 'Cards'} in workflow
        </Text>
        <Button
          size="small"
          prefixIcon={<Icons.Add />}
          onClick={handleOpenCreateModal}
          disabled={profiles.length === 0}
        >
          Create Card
        </Button>
      </Box>

      {totalCards === 0 && (
        <Box
          align="center"
          padding="SP4"
          marginBottom="SP4"
          backgroundColor="D70"
          borderRadius="6px"
        >
          <Text secondary>
            No cards yet. Use the Import Contacts page to import CRM contacts
            into the Kanban workflow, or click "Create Card" to add a card manually.
          </Text>
        </Box>
      )}

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

      {/* Create Card Modal */}
      <CreateCardModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onCreateCard={handleCreateCard}
        profiles={profiles}
        isCreating={isCreating}
      />
    </>
  );
}
