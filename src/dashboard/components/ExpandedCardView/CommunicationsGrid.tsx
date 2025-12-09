import React, { useState } from 'react';
import { 
  Box, 
  Text, 
  InputArea, 
  Accordion, 
  Badge, 
  Button,
  TextButton,
} from '@wix/design-system';
import * as Icons from '@wix/wix-ui-icons-common';
import { MarketingPipelines } from '../../types/kanbanCard.js';

/**
 * CommunicationsGrid - Row B of the expanded card view
 * 
 * Two-column layout:
 * - Left Column: Notes editor (rich text area)
 * - Right Column: Marketing pipelines accordion
 * 
 * @param notes - Current notes text
 * @param marketingPipelines - Active and available campaigns
 * @param onNotesChange - Callback when notes are updated
 */

export interface CommunicationsGridProps {
  notes: string;
  marketingPipelines?: MarketingPipelines;
  onNotesChange: (notes: string) => void;
}

export default function CommunicationsGrid({
  notes,
  marketingPipelines,
  onNotesChange,
}: CommunicationsGridProps) {
  const [localNotes, setLocalNotes] = useState(notes);
  const [isSaving, setIsSaving] = useState(false);

  // Handle notes save
  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      onNotesChange(localNotes);
    } finally {
      setIsSaving(false);
    }
  };

  // Check if notes have changed
  const hasChanges = localNotes !== notes;

  return (
    <Box marginBottom={4}>
      <Text weight="bold" size="small" secondary>
        Communications
      </Text>
      
      <Box gap={4} marginTop={3}>
        {/* Left Column - Notes Editor */}
        <Box direction="vertical" flex={1} gap={2}>
          <Box align="space-between" verticalAlign="middle">
            <Text size="small" weight="bold">
              Notes
            </Text>
            {hasChanges && (
              <Button
                size="tiny"
                onClick={handleSaveNotes}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            )}
          </Box>
          
          <InputArea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            placeholder="Add notes about this client..."
            rows={6}
            resizable
          />
        </Box>

        {/* Right Column - Marketing Pipelines */}
        <Box direction="vertical" flex={1} gap={2}>
          <Text size="small" weight="bold">
            Marketing Pipelines
          </Text>
          
          <Box
            direction="vertical"
            backgroundColor="#f7f8fa"
            borderRadius="8px"
            padding="12px"
          >
            {/* Active Campaigns */}
            <Accordion
              items={[
                {
                  title: (
                    <Box gap={2} verticalAlign="middle">
                      <Text size="small">Active Campaigns</Text>
                      <Badge size="tiny" skin="success">
                        {marketingPipelines?.active?.length || 0}
                      </Badge>
                    </Box>
                  ),
                  children: (
                    <Box direction="vertical" gap={2} padding="8px 0">
                      {marketingPipelines?.active && marketingPipelines.active.length > 0 ? (
                        marketingPipelines.active.map((campaign) => (
                          <CampaignItem
                            key={campaign.id}
                            name={campaign.name}
                            status={campaign.status}
                            isActive
                          />
                        ))
                      ) : (
                        <Text size="small" secondary>
                          No active campaigns
                        </Text>
                      )}
                    </Box>
                  ),
                },
              ]}
            />

            {/* Available Campaigns */}
            <Accordion
              items={[
                {
                  title: (
                    <Box gap={2} verticalAlign="middle">
                      <Text size="small">Available Campaigns</Text>
                      <Badge size="tiny" skin="general">
                        {marketingPipelines?.available?.length || 0}
                      </Badge>
                    </Box>
                  ),
                  children: (
                    <Box direction="vertical" gap={2} padding="8px 0">
                      {marketingPipelines?.available && marketingPipelines.available.length > 0 ? (
                        marketingPipelines.available.map((campaign) => (
                          <CampaignItem
                            key={campaign.id}
                            name={campaign.name}
                            description={campaign.description}
                            onTrigger={() => {
                              console.log('🎯 Trigger campaign:', campaign.id);
                              // TODO: Implement campaign triggering
                            }}
                          />
                        ))
                      ) : (
                        <Text size="small" secondary>
                          No available campaigns
                        </Text>
                      )}
                    </Box>
                  ),
                },
              ]}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/**
 * CampaignItem - Individual campaign display in the accordion
 */
interface CampaignItemProps {
  name: string;
  status?: string;
  description?: string;
  isActive?: boolean;
  onTrigger?: () => void;
}

function CampaignItem({ 
  name, 
  status, 
  description, 
  isActive, 
  onTrigger 
}: CampaignItemProps) {
  return (
    <Box
      padding="8px 12px"
      backgroundColor="#ffffff"
      borderRadius="4px"
      align="space-between"
      verticalAlign="middle"
    >
      <Box direction="vertical" gap={1}>
        <Text size="small">{name}</Text>
        {description && (
          <Text size="tiny" secondary>
            {description}
          </Text>
        )}
      </Box>
      
      {isActive && status && (
        <Badge size="tiny" skin="success">
          {status}
        </Badge>
      )}
      
      {onTrigger && (
        <TextButton size="tiny" onClick={onTrigger}>
          Trigger
        </TextButton>
      )}
    </Box>
  );
}

