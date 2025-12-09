import React, { useEffect, useCallback } from 'react';
import { Box, IconButton, Text } from '@wix/design-system';
import * as Icons from '@wix/wix-ui-icons-common';
import { ContactStatus } from '../../types/kanbanCard.js';
import { ColumnData } from '../KanbanBoard.js';
import ColumnBrowser from './ColumnBrowser.js';
import ClientHeader from './ClientHeader.js';
import CommunicationsGrid from './CommunicationsGrid.js';
import ActionTabs from './ActionTabs.js';
import { useExpandedCard } from '../../hooks/useExpandedCard.js';

/**
 * ExpandedCardView - Modal overlay for viewing and editing card details
 * 
 * Layout: 30/70 split
 * - Left Panel (30%): Column browser with stage selector and card list
 * - Right Panel (70%): Card details with client info, communications, and activity
 * 
 * Data Flow: Card -> Profile (via profileId) -> ActivityLog
 * 
 * @param cardId - ID of the currently selected card
 * @param stageId - Current stage/column ID
 * @param columns - All column data for the column browser
 * @param onClose - Callback to close the modal
 * @param onCardSelect - Callback when a different card is selected
 * @param onStageChange - Callback when the stage filter changes
 */

export interface ExpandedCardViewProps {
  cardId: string;
  stageId: ContactStatus;
  columns: ColumnData[];
  onClose: () => void;
  onCardSelect: (cardId: string) => void;
  onStageChange: (stageId: ContactStatus) => void;
}

export default function ExpandedCardView({
  cardId,
  stageId,
  columns,
  onClose,
  onCardSelect,
  onStageChange,
}: ExpandedCardViewProps) {
  // Fetch card data, profile, and activity log
  const {
    card,
    profile,
    activityLog,
    isLoading,
    updateCard,
    updateProfile,
    addComment,
  } = useExpandedCard(cardId);

  // Handle escape key to close modal
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [handleKeyDown]);

  // Handle click on backdrop to close
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Get cards for the current stage
  const currentColumn = columns.find(col => col.id === stageId);
  const stageCards = currentColumn?.cards || [];

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px',
      }}
    >
      {/* Modal Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '1400px',
          height: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header with close button */}
        <Box
          padding="12px 16px"
          align="space-between"
          verticalAlign="middle"
          backgroundColor="#f7f8fa"
          borderBottom="1px solid #e0e3e8"
        >
          <Text weight="bold" size="medium">
            Card Details
          </Text>
          <IconButton
            size="small"
            skin="inverted"
            onClick={onClose}
            aria-label="Close"
          >
            <Icons.X />
          </IconButton>
        </Box>

        {/* Main content area with 30/70 split */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {/* Left Panel - Column Browser (30%) */}
          <div
            style={{
              width: '30%',
              minWidth: '280px',
              maxWidth: '400px',
              borderRight: '1px solid #e0e3e8',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#f7f8fa',
            }}
          >
            <ColumnBrowser
              currentStageId={stageId}
              selectedCardId={cardId}
              columns={columns}
              cards={stageCards}
              onStageChange={onStageChange}
              onCardSelect={onCardSelect}
            />
          </div>

          {/* Right Panel - Card Details (70%) */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
              padding: '20px',
            }}
          >
            {isLoading ? (
              <Box align="center" verticalAlign="middle" height="100%">
                <Text secondary>Loading card details...</Text>
              </Box>
            ) : (
              <>
                {/* Row A: Client Information Header */}
                <ClientHeader
                  profile={profile}
                  card={card}
                  onUpdateProfile={updateProfile}
                />

                {/* Row B: Communications Grid */}
                <CommunicationsGrid
                  notes={card?.notes || ''}
                  marketingPipelines={card?.marketingPipelines}
                  onNotesChange={(notes) => updateCard({ notes })}
                />

                {/* Row C: Activity & Tabs */}
                <ActionTabs
                  card={card}
                  activityLog={activityLog}
                  onUpdateCard={updateCard}
                  onAddComment={addComment}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
