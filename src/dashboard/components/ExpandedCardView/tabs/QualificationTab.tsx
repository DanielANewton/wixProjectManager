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
 * QualificationTab - Interest tags and qualification form data
 * 
 * Features:
 * - Tag cloud for selecting interest tags
 * - Dynamic form for qualification questions
 * - Add/remove tags
 * 
 * @param tags - Currently selected tags
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

// Predefined interest tags for the tag cloud
const AVAILABLE_TAGS = [
  'Solar PV',
  'Heat Pump',
  'EV Charger',
  'Insulation',
  'Windows',
  'Battery Storage',
  'Smart Home',
  'Boiler',
  'Underfloor Heating',
  'Renewable Energy',
  'Energy Audit',
  'Grant Eligible',
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
      {/* Interest Tags Section */}
      <Box direction="vertical" gap={3}>
        <Text size="small" weight="bold">Interest Tags</Text>
        
        {/* Selected Tags */}
        <Box gap={2} wrap="wrap">
          {tags.map((tag) => (
            <Tag
              key={tag}
              id={tag}
              removable
              onRemove={() => handleToggleTag(tag)}
              theme="dark"
            >
              {tag}
            </Tag>
          ))}
          {tags.length === 0 && (
            <Text size="small" secondary>No tags selected</Text>
          )}
        </Box>

        {/* Available Tags Cloud */}
        <Box direction="vertical" gap={2}>
          <Text size="tiny" secondary>Click to add tags:</Text>
          <Box gap={2} wrap="wrap">
            {AVAILABLE_TAGS.filter(t => !tags.includes(t)).map((tag) => (
              <Tag
                key={tag}
                id={tag}
                onClick={() => handleToggleTag(tag)}
                theme="light"
              >
                {tag}
              </Tag>
            ))}
          </Box>
        </Box>

        {/* Custom Tag Input */}
        <Box gap={2} verticalAlign="bottom">
          <Input
            size="small"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add custom tag..."
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
              <Icons.FormFieldTextArea />
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

