import React, { useState } from 'react';
import { Box, Tabs } from '@wix/design-system';
import { KanbanCard, CardAction } from '../../types/kanbanCard.js';
import HistoryTab from './tabs/HistoryTab.js';
import CommentsTab from './tabs/CommentsTab.js';
import QualificationTab from './tabs/QualificationTab.js';
import AssessmentTab from './tabs/AssessmentTab.js';
import TenderTab from './tabs/TenderTab.js';
import SalesTab from './tabs/SalesTab.js';

/**
 * ActionTabs - Row C of the expanded card view
 * 
 * Tabbed interface with 6 tabs:
 * - History: Read-only log of changes
 * - Comments: Threaded comments from users/boards
 * - Qualification: Tags and form data
 * - Assessment: Portal actions and status
 * - Tender: Tender submission form
 * - Sales: Invoice, quotes, and compliance
 * 
 * @param card - Current card data
 * @param actions - History and comments for the card
 * @param onUpdateCard - Callback to update card fields
 * @param onAddComment - Callback to add a new comment
 */

export interface ActionTabsProps {
  card: KanbanCard | null;
  actions: CardAction[];
  onUpdateCard: (updates: Partial<KanbanCard>) => void;
  onAddComment: (content: string) => void;
}

type TabId = 'history' | 'comments' | 'qualification' | 'assessment' | 'tender' | 'sales';

export default function ActionTabs({
  card,
  actions,
  onUpdateCard,
  onAddComment,
}: ActionTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('history');

  // Split actions into history and comments
  const historyActions = actions.filter(a => a.actionType === 'history');
  const commentActions = actions.filter(a => a.actionType === 'comment');

  // Tab configuration
  const tabs = [
    { id: 'history', title: 'History', count: historyActions.length },
    { id: 'comments', title: 'Comments', count: commentActions.length },
    { id: 'qualification', title: 'Qualification' },
    { id: 'assessment', title: 'Assessment' },
    { id: 'tender', title: 'Tender', count: card?.tenders?.length },
    { id: 'sales', title: 'Sales' },
  ];

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'history':
        return <HistoryTab actions={historyActions} />;
      case 'comments':
        return (
          <CommentsTab
            comments={commentActions}
            onAddComment={onAddComment}
          />
        );
      case 'qualification':
        return (
          <QualificationTab
            tags={card?.tags || []}
            formData={card?.formData || []}
            onUpdateTags={(tags) => onUpdateCard({ tags })}
            onUpdateFormData={(formData) => onUpdateCard({ formData })}
          />
        );
      case 'assessment':
        return (
          <AssessmentTab
            partnerPortalRef={card?.partnerPortalRef}
            clientPortalRef={card?.clientPortalRef}
            assessmentStatus={card?.externalAssessmentStatus}
            clientStatus={card?.externalClientStatus}
            onCreateAssessment={() => {
              console.log('🔧 Creating assessment card...');
              // TODO: Implement assessment creation
            }}
            onCreateClientPortal={() => {
              console.log('🔧 Creating client portal...');
              // TODO: Implement client portal creation
            }}
          />
        );
      case 'tender':
        return (
          <TenderTab
            tenders={card?.tenders || []}
            onSubmitTender={(tender) => {
              const newTenders = [...(card?.tenders || []), tender];
              onUpdateCard({ tenders: newTenders });
            }}
          />
        );
      case 'sales':
        return (
          <SalesTab
            invoiceRef={card?.invoiceRef}
            quotes={card?.quotes}
            approvalStatus={card?.approvalStatus}
            financeTC={card?.financeTC || false}
            installationTC={card?.installationTC || false}
            projectCompleteTC={card?.projectCompleteTC || false}
            onGenerateInvoice={() => {
              console.log('💰 Generating invoice...');
              // TODO: Implement invoice generation
            }}
            onGenerateQuote={() => {
              console.log('💰 Generating quote...');
              // TODO: Implement quote generation
            }}
            onUpdateApproval={(status) => onUpdateCard({ approvalStatus: status })}
            onUpdateCompliance={(field, value) => onUpdateCard({ [field]: value })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box direction="vertical" flex={1}>
      {/* Tabs Header */}
      <Tabs
        activeId={activeTab}
        onClick={(tab) => setActiveTab(tab.id as TabId)}
        items={tabs.map(tab => ({
          id: tab.id,
          title: tab.count !== undefined && tab.count > 0
            ? `${tab.title} (${tab.count})`
            : tab.title,
        }))}
      />

      {/* Tab Content */}
      <Box
        padding="16px"
        backgroundColor="#f7f8fa"
        borderRadius="0 0 8px 8px"
        minHeight="300px"
        direction="vertical"
      >
        {renderTabContent()}
      </Box>
    </Box>
  );
}

