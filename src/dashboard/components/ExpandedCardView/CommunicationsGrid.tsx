import React, { useState } from 'react';
import { 
  Box, 
  Text, 
  InputArea, 
  Accordion, 
  Badge, 
  Button,
  TextButton,
  Tag,
  Input,
} from '@wix/design-system';
import * as Icons from '@wix/wix-ui-icons-common';
import { MarketingPipelines } from '../../types/kanbanCard.js';

/**
 * CommunicationsGrid - Row B of the expanded card view
 * 
 * Two-column layout:
 * - Left Column: Notes editor (rich text area)
 * - Right Column: Marketing pipelines accordion and Interest Tags
 * 
 * @param notes - Current notes text
 * @param marketingPipelines - Active and available campaigns
 * @param interestTags - Lead source / interest tags
 * @param onNotesChange - Callback when notes are updated
 * @param onUpdateInterestTags - Callback when interest tags are updated
 */

export interface CommunicationsGridProps {
  notes: string;
  marketingPipelines?: MarketingPipelines;
  interestTags?: string[];
  onNotesChange: (notes: string) => void;
  onUpdateInterestTags: (tags: string[]) => void;
}

export default function CommunicationsGrid({
  notes,
  marketingPipelines,
  interestTags = [],
  onNotesChange,
  onUpdateInterestTags,
}: CommunicationsGridProps) {
  const [localNotes, setLocalNotes] = useState(notes);
  const [isSaving, setIsSaving] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Predefined interest tags (lead sources)
  const AVAILABLE_INTERESTS = [
    'Organic Search',
    'Paid Ads',
    'Social Media',
    'Referral',
    'Website Inquiry',
    'Event / Trade Show',
    'Direct Mail',
    'Email Campaign',
  ];

  // Toggle a tag selection
  const handleToggleTag = (tag: string) => {
    if (interestTags.includes(tag)) {
      onUpdateInterestTags(interestTags.filter(t => t !== tag));
    } else {
      onUpdateInterestTags([...interestTags, tag]);
    }
  };

  // Add a custom tag
  const handleAddTag = () => {
    if (newTag.trim() && !interestTags.includes(newTag.trim())) {
      onUpdateInterestTags([...interestTags, newTag.trim()]);
      setNewTag('');
    }
  };

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
    <Box marginBottom={4} width="100%">
      <Text weight="bold" size="small" secondary>
        Communications
      </Text>
      
      <Box gap={4} marginTop={3} wrap="wrap" width="100%">
        {/* Left Column - Notes Editor */}
        <Box direction="vertical" flexBasis="0" flexGrow={1} gap={2} minWidth="300px" width="100%" overflow="hidden">
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
        <Box direction="vertical" flexBasis="0" flexGrow={1} gap={2} minWidth="300px" width="100%" overflow="hidden">
          <Text size="small" weight="bold">
            Marketing Pipelines
          </Text>
          
          <Box
            direction="vertical"
            backgroundColor="#f7f8fa"
            borderRadius="8px"
            padding="12px"
            width="100%"
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

          {/* Interest Tags Section (Lead Source) */}
          <Box direction="vertical" gap={2} marginTop={4}>
            <Text size="small" weight="bold">
              Lead Source / Interest Tags
            </Text>
            <Box
              direction="vertical"
              backgroundColor="#f7f8fa"
              borderRadius="8px"
              padding="12px"
              gap={3}
              width="100%"
            >
              {/* Selected Interest Tags */}
              <Box gap={2} wrap="wrap" width="100%" maxWidth="100%">
                {interestTags.map((tag) => (
                  <Tag
                    key={tag}
                    id={tag}
                    removable
                    onRemove={() => handleToggleTag(tag)}
                    size="small"
                  >
                    {tag}
                  </Tag>
                ))}
                {interestTags.length === 0 && (
                  <Text size="tiny" secondary>No interest tags added yet</Text>
                )}
              </Box>

              {/* Quick Add Interests */}
              <Box direction="vertical" gap={1} width="100%" maxWidth="100%">
                <Text size="tiny" secondary>Quick add lead source:</Text>
                <Box gap={2} wrap="wrap" width="100%" maxWidth="100%">
                  {AVAILABLE_INTERESTS.filter(t => !interestTags.includes(t)).map((tag) => (
                    <Tag
                      key={tag}
                      id={tag}
                      onClick={() => handleToggleTag(tag)}
                      theme="light"
                      size="small"
                    >
                      {tag}
                    </Tag>
                  ))}
                </Box>
              </Box>

              {/* Custom Tag Input */}
              <Box gap={2} verticalAlign="bottom" width="100%">
                <Box flex={1}>
                  <Input
                    size="small"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Other lead source..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                </Box>
                <Button
                  size="small"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  Add
                </Button>
              </Box>
            </Box>
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
      width="100%"
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

