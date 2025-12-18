import React, { useState } from 'react';
import { 
  Box, 
  Text, 
  Tag, 
  Input, 
  Button, 
  Divider,
  FormField,
} from '@wix/design-system';
import * as Icons from '@wix/wix-ui-icons-common';
import { FormDataItem } from '../../../types/kanbanCard.js';

/**
 * QualificationTab - Auditor-added qualification tags and form data
 * 
 * Features:
 * - Tag cloud for selecting qualification tags (auditor findings)
 * - Dynamic form for qualification questions
 * - Add/remove tags
 * 
 * @param tags - Currently selected qualification tags
 * @param formData - Qualification form responses
 * @param onUpdateTags - Callback to update tags
 * @param onUpdateFormData - Callback to update form data
 */

export interface QualificationTabProps {
  tags: string[];
  formData: FormDataItem[];
  onUpdateTags: (tags: string[]) => void;
  onUpdateFormData: (formData: FormDataItem[]) => void;
}

// Predefined qualification tags for the auditor
const AVAILABLE_TAGS = [
  'Solar PV Suitable',
  'Heat Pump Suitable',
  'EV Ready',
  'High Efficiency',
  'Cavity Wall Insulated',
  'Loft Insulated',
  'A-Rated Windows',
  'Smart Meter Installed',
  'Grant Eligible',
  'ECO4 Potential',
  'GBIS Potential',
  'Urgent Requirement',
];

export default function QualificationTab({
  tags,
  formData,
  onUpdateTags,
  onUpdateFormData,
}: QualificationTabProps) {
  const [newTag, setNewTag] = useState('');

  // Toggle a tag selection
  const handleToggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      onUpdateTags(tags.filter(t => t !== tag));
    } else {
      onUpdateTags([...tags, tag]);
    }
  };

  // Add a custom tag
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onUpdateTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // Update a form answer
  const handleUpdateAnswer = (questionId: string, answer: string) => {
    const updated = formData.map(item =>
      item.questionId === questionId
        ? { ...item, answer, answeredAt: new Date().toISOString() }
        : item
    );
    onUpdateFormData(updated);
  };

  return (
    <Box direction="vertical" gap={4}>
      {/* Qualification Tags Section */}
      <Box direction="vertical" gap={3}>
        <Text size="small" weight="bold">Auditor Qualification Tags</Text>
        
        {/* Selected Tags - tag cloud with full text display */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            minHeight: '32px',
          }}
        >
          {tags.map((tag) => (
            <Tag
              key={tag}
              id={tag}
              removable
              onRemove={() => handleToggleTag(tag)}
              theme="dark"
              size="small"
            >
              {tag}
            </Tag>
          ))}
          {tags.length === 0 && (
            <Text size="small" secondary>No qualification tags selected</Text>
          )}
        </div>

        {/* Available Tags Cloud */}
        <Box direction="vertical" gap={2}>
          <Text size="tiny" secondary>Click to add qualification findings:</Text>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            {AVAILABLE_TAGS.filter(t => !tags.includes(t)).map((tag) => (
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
          </div>
        </Box>

        {/* Custom Tag Input */}
        <Box gap={2} verticalAlign="bottom">
          <Input
            size="small"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add custom qualification tag..."
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
          />
          <Button
            size="small"
            onClick={handleAddTag}
            disabled={!newTag.trim()}
          >
            Add
          </Button>
        </Box>
      </Box>

      <Divider />

      {/* Qualification Form Section */}
      <Box direction="vertical" gap={3}>
        <Text size="small" weight="bold">Qualification Form</Text>
        
        {formData.length === 0 ? (
          <Box
            padding="24px"
            backgroundColor="#ffffff"
            borderRadius="8px"
            align="center"
          >
            <Box direction="vertical" align="center" gap={2}>
              {/* Using Text icon as placeholder for empty form state */}
              <Icons.Document />
              <Text secondary size="small">
                No qualification form data yet
              </Text>
              <Text secondary size="tiny">
                Form responses will appear here when the client completes qualification
              </Text>
            </Box>
          </Box>
        ) : (
          <Box direction="vertical" gap={3}>
            {formData.map((item) => (
              <Box
                key={item.questionId}
                padding="12px"
                backgroundColor="#ffffff"
                borderRadius="8px"
                direction="vertical"
                gap={2}
              >
                <FormField label={item.question}>
                  <Input
                    size="small"
                    value={item.answer}
                    onChange={(e) => handleUpdateAnswer(item.questionId, e.target.value)}
                  />
                </FormField>
                {item.answeredAt && (
                  <Text size="tiny" secondary>
                    Answered: {new Date(item.answeredAt).toLocaleDateString()}
                  </Text>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

