import React, { useState, useMemo } from 'react';
import {
  Modal,
  CustomModalLayout,
  Box,
  FormField,
  Dropdown,
  NumberInput,
  DatePicker,
  Tag,
  Input,
  Button,
  Text,
  Search,
} from '@wix/design-system';
import { ContactStatus, ClientProfile, NewKanbanCard } from '../types/kanbanCard.js';
import { columnConfig } from './KanbanBoard.js';

/**
 * CreateCardModal - Modal for creating a new Kanban card
 *
 * Allows users to:
 * - Select a contact (from existing profiles) with search
 * - Assign a workflow stage
 * - Select interest tags
 * - Set readiness level (1-10)
 * - Set finance status
 * - Set re-engage time (callback date)
 *
 * @param isOpen - Whether the modal is visible
 * @param onClose - Callback to close the modal
 * @param onCreateCard - Callback when card is created (receives NewKanbanCard data)
 * @param profiles - List of available client profiles to select from
 */

export interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCard: (card: NewKanbanCard) => Promise<void>;
  profiles: ClientProfile[];
  isCreating?: boolean;
}

// Predefined interest tags for selection
const AVAILABLE_INTEREST_TAGS = [
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

// Finance status options
const FINANCE_STATUS_OPTIONS = [
  { id: 'not-started', value: 'Not Started' },
  { id: 'in-progress', value: 'In Progress' },
  { id: 'approved', value: 'Approved' },
  { id: 'rejected', value: 'Rejected' },
  { id: 'pending-docs', value: 'Pending Documents' },
  { id: 'completed', value: 'Completed' },
];

export default function CreateCardModal({
  isOpen,
  onClose,
  onCreateCard,
  profiles,
  isCreating = false,
}: CreateCardModalProps) {
  // Form state
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [selectedStageId, setSelectedStageId] = useState<ContactStatus>('engage');
  const [interestTags, setInterestTags] = useState<string[]>([]);
  const [readinessLevel, setReadinessLevel] = useState<number>(1);
  const [financeStatus, setFinanceStatus] = useState<string>('not-started');
  const [reEngageDate, setReEngageDate] = useState<Date | null>(null);
  const [customTag, setCustomTag] = useState('');

  // Convert profiles to dropdown options
  const profileOptions = useMemo(() => {
    return profiles.map((profile) => {
      const name = `${profile.clientInfo?.firstName || ''} ${profile.clientInfo?.lastName || ''}`.trim();
      const email = profile.clientInfo?.email;
      const displayName = name || email || 'Unknown Contact';
      return {
        id: profile._id || '',
        value: displayName,
      };
    });
  }, [profiles]);

  // Filter profile options based on search query
  const filteredProfileOptions = useMemo(() => {
    if (!contactSearchQuery.trim()) {
      return profileOptions;
    }
    const query = contactSearchQuery.toLowerCase();
    return profileOptions.filter((option) =>
      option.value.toLowerCase().includes(query)
    );
  }, [profileOptions, contactSearchQuery]);

  // Convert stage config to dropdown options
  const stageOptions = useMemo(() => {
    return columnConfig.map((col) => ({
      id: col.id,
      value: col.title,
    }));
  }, []);

  // Get the selected stage title
  const selectedStageTitle = useMemo(() => {
    return columnConfig.find((col) => col.id === selectedStageId)?.title || '1. Engage';
  }, [selectedStageId]);

  // Get selected profile name for display
  const selectedProfileName = useMemo(() => {
    if (!selectedProfileId) return '';
    const profile = profileOptions.find((p) => p.id === selectedProfileId);
    return profile?.value || '';
  }, [selectedProfileId, profileOptions]);

  /**
   * Handle adding an interest tag
   */
  const handleAddTag = (tag: string) => {
    if (!interestTags.includes(tag)) {
      setInterestTags([...interestTags, tag]);
    }
  };

  /**
   * Handle removing an interest tag
   */
  const handleRemoveTag = (tag: string) => {
    setInterestTags(interestTags.filter((t) => t !== tag));
  };

  /**
   * Handle adding a custom tag
   */
  const handleAddCustomTag = () => {
    if (customTag.trim() && !interestTags.includes(customTag.trim())) {
      setInterestTags([...interestTags, customTag.trim()]);
      setCustomTag('');
    }
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setSelectedProfileId(null);
    setContactSearchQuery('');
    setSelectedStageId('engage');
    setInterestTags([]);
    setReadinessLevel(1);
    setFinanceStatus('not-started');
    setReEngageDate(null);
    setCustomTag('');
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!selectedProfileId) return;

    const cardData: NewKanbanCard = {
      profileId: selectedProfileId,
      stageId: selectedStageId,
      stage: selectedStageTitle,
      interestTags: interestTags.length > 0 ? interestTags : undefined,
      readinessLevel: readinessLevel,
      financeStatus: financeStatus,
      callBackAppointmentDate: reEngageDate ? reEngageDate.toISOString() : undefined,
    };

    try {
      await onCreateCard(cardData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('❌ Error creating card:', error);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Check if form is valid (at minimum, a profile must be selected)
  const isFormValid = !!selectedProfileId;

  return (
    <Modal isOpen={isOpen} onRequestClose={handleClose} screen="desktop">
      <CustomModalLayout
        title="Create New Card"
        subtitle="Add a new card to the workflow board"
        primaryButtonText={isCreating ? 'Creating...' : 'Create Card'}
        primaryButtonOnClick={handleSubmit}
        primaryButtonProps={{ disabled: !isFormValid || isCreating }}
        secondaryButtonText="Cancel"
        secondaryButtonOnClick={handleClose}
        onCloseButtonClick={handleClose}
        width="600px"
      >
        <Box direction="vertical" gap={4}>
          {/* Contact Selection with Search */}
          <FormField label="Contact *" required>
            <Box direction="vertical" gap={2}>
              {/* Search input for filtering contacts */}
              <Search
                size="small"
                placeholder="Type to search contacts..."
                value={contactSearchQuery}
                onChange={(e) => setContactSearchQuery(e.target.value)}
                onClear={() => setContactSearchQuery('')}
              />
              {/* Dropdown with filtered options */}
              <Dropdown
                placeholder="Select a contact..."
                options={filteredProfileOptions}
                selectedId={selectedProfileId || undefined}
                onSelect={(option) => {
                  setSelectedProfileId(option.id as string);
                  setContactSearchQuery(''); // Clear search after selection
                }}
              />
              {/* Show selected contact */}
              {selectedProfileName && (
                <Text size="small" secondary>
                  Selected: {selectedProfileName}
                </Text>
              )}
            </Box>
          </FormField>

          {/* Stage Selection */}
          <FormField label="Stage">
            <Dropdown
              options={stageOptions}
              selectedId={selectedStageId}
              onSelect={(option) => setSelectedStageId(option.id as ContactStatus)}
            />
          </FormField>

          {/* Interest Tags */}
          <FormField label="Interest Tags">
            <Box direction="vertical" gap={3}>
              {/* Selected tags - tag cloud with full text */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  minHeight: '32px',
                }}
              >
                {interestTags.map((tag) => (
                  <Tag
                    key={tag}
                    id={tag}
                    removable
                    onRemove={() => handleRemoveTag(tag)}
                    theme="dark"
                    size="small"
                  >
                    {tag}
                  </Tag>
                ))}
                {interestTags.length === 0 && (
                  <Text size="small" secondary>
                    No tags selected
                  </Text>
                )}
              </div>

              {/* Available tags - tag cloud */}
              <Text size="tiny" secondary>
                Click to add:
              </Text>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {AVAILABLE_INTEREST_TAGS.filter((t) => !interestTags.includes(t)).map(
                  (tag) => (
                    <Tag
                      key={tag}
                      id={tag}
                      onClick={() => handleAddTag(tag)}
                      theme="light"
                      size="small"
                    >
                      {tag}
                    </Tag>
                  )
                )}
              </div>

              {/* Custom tag input */}
              <Box gap={2} verticalAlign="bottom">
                <Input
                  size="small"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Add custom tag..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag()}
                />
                <Button
                  size="small"
                  onClick={handleAddCustomTag}
                  disabled={!customTag.trim()}
                >
                  Add
                </Button>
              </Box>
            </Box>
          </FormField>

          {/* Readiness Level */}
          <FormField label="Readiness Level (1-10)">
            <NumberInput
              value={readinessLevel}
              onChange={(value) => setReadinessLevel(value ?? 1)}
              min={1}
              max={10}
              step={1}
            />
          </FormField>

          {/* Finance Status */}
          <FormField label="Finance Status">
            <Dropdown
              options={FINANCE_STATUS_OPTIONS}
              selectedId={financeStatus}
              onSelect={(option) => setFinanceStatus(option.id as string)}
            />
          </FormField>

          {/* Re-engage Time (Callback Date) */}
          <FormField label="Re-engage Time">
            <DatePicker
              value={reEngageDate || undefined}
              onChange={(date) => setReEngageDate(date)}
              placeholderText="Select callback date..."
              dateFormatV2="dd/MM/yyyy"
            />
          </FormField>
        </Box>
      </CustomModalLayout>
    </Modal>
  );
}
