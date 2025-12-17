import React from 'react';
import { Page, Box, Text } from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import { withProviders } from '../../withProviders.js';
import KanbanBoard from '../../components/KanbanBoard.js';

/**
 * KanbanPage - YorProject Master Workflow Dashboard
 *
 * This page provides the main Project Management System interface with:
 * - 17 workflow stages from Engage to Project Completion
 * - Draggable cards for each client (imported from CRM via Import page)
 * - Cards linked to ClientProfiles for detailed client data
 * - Visual pipeline for customer journey tracking
 *
 * Data Flow: ClientProfiles -> KanbanCards -> KanbanBoard display
 */
function KanbanPage() {
  /**
   * Handle board state changes
   * This fires when cards are moved between columns
   */
  const handleBoardChange = (columns: any) => {
    console.log('📋 Board updated:', columns);
  };

  return (
    <Page height="100vh">
      <Page.Header
        title="YorProject Workflow"
        subtitle="Master Kanban board for customer journey management"
      />
      <Page.Content>
        <Box direction="vertical" gap={4}>
          {/* Instructions text */}
          <Text secondary size="small">
            Drag cards between stages to update their journey. Scroll
            horizontally to view all 17 stages. Import contacts from the Import
            page.
          </Text>

          {/* Main Kanban board component - loads cards from KanbanCards collection */}
          <KanbanBoard onBoardChange={handleBoardChange} />
        </Box>
      </Page.Content>
    </Page>
  );
}

// Wrap with providers for Wix Design System and React Query support
export default withProviders(KanbanPage);
