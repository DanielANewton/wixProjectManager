import React from 'react';
import { Page, Box, Text } from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import { withProviders } from '../../withProviders.js';
import KanbanBoard from '../../components/KanbanBoard.js';

/**
 * KanbanPage - PMS Master Workflow Dashboard
 * 
 * This page provides the main Project Management System interface with:
 * - 17 workflow stages from Engage to Project Completion
 * - Draggable cards for each CRM contact
 * - Card priority indicators based on contact labels
 * - Visual pipeline for customer journey tracking
 */
function KanbanPage() {
  /**
   * Handle board state changes
   * This fires when cards are moved between columns
   * Can be extended to update contact labels in CRM
   */
  const handleBoardChange = (columns: any) => {
    console.log('📋 Board updated:', columns);
    // TODO: Update contact labels in CRM when moved between columns
  };

  return (
    <Page height="100vh">
      <Page.Header
        title="PMS Workflow"
        subtitle="Master Kanban board for customer journey management"
      />
      <Page.Content>
        <Box direction="vertical" gap={4}>
          {/* Instructions text */}
          <Text secondary size="small">
            Drag contacts between stages to update their journey. Scroll horizontally to view all 17 stages.
          </Text>
          
          {/* Main Kanban board component - loads contacts from CRM */}
          <KanbanBoard onBoardChange={handleBoardChange} />
        </Box>
      </Page.Content>
    </Page>
  );
}

// Wrap with providers for Wix Design System and React Query support
export default withProviders(KanbanPage);

