import React from 'react';
import { Page, Box, Text } from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import { withProviders } from '../../withProviders.js';
import KanbanBoard from '../../components/KanbanBoard.js';

/**
 * KanbanPage - Dashboard page that displays a Kanban board with CRM contacts
 * 
 * This page provides a contact management interface with:
 * - Three columns: To Do, In Progress, Done
 * - Draggable cards for each CRM contact
 * - Card priority indicators based on contact labels
 * - Add/Edit/Delete card functionality
 */
function KanbanPage() {
  /**
   * Handle board state changes
   * This fires when cards are moved between columns
   * Can be extended to update contact status in CRM
   */
  const handleBoardChange = (columns: any) => {
    console.log('📋 Board updated:', columns);
    // TODO: Update contact labels in CRM when moved between columns
  };

  return (
    <Page height="100vh">
      <Page.Header
        title="Contact Kanban"
        subtitle="Manage your CRM contacts with drag and drop"
      />
      <Page.Content>
        <Box direction="vertical" gap={4}>
          {/* Instructions text */}
          <Text secondary size="small">
            Your CRM contacts are displayed below. Drag cards between columns to update their status.
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

