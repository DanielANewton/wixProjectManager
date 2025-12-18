import React, { useRef, useCallback } from 'react';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { Card, Box, Text, Badge, IconButton } from '@wix/design-system';
import * as Icons from '@wix/wix-ui-icons-common';

/**
 * KanbanCard - A draggable card component for the Kanban board
 * 
 * Interaction behavior:
 * - Click on card body: Opens the expanded card view
 * - Drag using the grip handle (left side): Repositions the card
 * 
 * @param id - Unique identifier for the card (used for drag-and-drop)
 * @param index - Position of the card in its column (required by react-beautiful-dnd)
 * @param title - The main title/heading of the card (client name)
 * @param readinessLevel - Client readiness score (1-5 scale)
 * @param interestTags - Array of interest tags to display
 * @param callBackDate - Callback/re-engage appointment date
 * @param stageId - Current workflow stage identifier
 * @param financeStatus - Finance application status
 * @param onEdit - Optional callback when edit button is clicked
 * @param onDelete - Optional callback when delete button is clicked
 * @param onClick - Callback when card is clicked to open expanded view
 */

export type Priority = 'low' | 'medium' | 'high';

export interface KanbanCardProps {
  id: string;
  index: number;
  title: string;
  description?: string;
  priority?: Priority;
  // Fields for enhanced card display
  readinessLevel?: number;
  interestTags?: string[];
  qualificationTags?: string[];
  callBackDate?: string;
  stageId?: string;
  financeStatus?: string;
  // Last updated by info
  lastUpdatedBy?: {
    userId: string;
    userName: string;
    userPhoto?: string;
    updatedAt: string;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
}

// Maps finance status to badge skins for visual feedback
const financeStatusSkins: Record<string, 'success' | 'warning' | 'danger' | 'general'> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
};

/**
 * Formats a date string to a readable short format
 * @param dateStr - ISO date string or similar
 * @returns Formatted date like "Dec 17" or empty string if invalid
 */
function formatCallbackDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function KanbanCard({
  id,
  index,
  title,
  readinessLevel,
  interestTags,
  qualificationTags,
  callBackDate,
  financeStatus,
  lastUpdatedBy,
  onEdit,
  onDelete,
  onClick,
}: KanbanCardProps) {
  // Track if we're currently dragging to prevent click after drag
  const isDraggingRef = useRef(false);

  /**
   * Handles card click - opens expanded view if not dragging
   * Prevents click from firing when user was dragging
   */
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Don't open if this was a drag operation
    if (isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      isDraggingRef.current = false;
      return;
    }
    onClick?.(id);
  }, [id, onClick]);

  /**
   * Renders the readiness level indicator as 5 horizontal bars
   * Filled bars (green) indicate the current level
   */
  const renderReadinessLevel = () => {
    if (readinessLevel === undefined) return null;
    
    return (
      <Box gap="3px" verticalAlign="middle">
        <Text size="tiny" secondary style={{ whiteSpace: 'nowrap' }}>Readiness:</Text>
        {[1, 2, 3, 4, 5].map(level => (
          <div
            key={level}
            style={{
              width: '14px',
              height: '5px',
              borderRadius: '2px',
              backgroundColor: level <= (readinessLevel || 0)
                ? '#4CAF50'  // Green for filled
                : '#E0E0E0', // Gray for empty
            }}
          />
        ))}
      </Box>
    );
  };

  /**
   * Renders qualification tags (auditor added) with warning style
   * Shows max 3 tags with "+X more" indicator if there are more
   */
  const renderQualificationTags = () => {
    if (!qualificationTags || qualificationTags.length === 0) return null;
    
    const displayTags = qualificationTags.slice(0, 3);
    const remainingCount = qualificationTags.length - 3;
    
    return (
      <Box direction="vertical" gap="2px">
        <Text size="tiny" secondary>Qualification:</Text>
        <Box gap="4px" wrap="wrap">
          {displayTags.map((tag, idx) => (
            <Badge 
              key={idx} 
              size="tiny" 
              skin="warning"
            >
              <span style={{ 
                display: 'block', 
                maxWidth: '80px', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap' 
              }}>
                {tag}
              </span>
            </Badge>
          ))}
          {remainingCount > 0 && (
            <Badge size="tiny" skin="warningLight">
              +{remainingCount}
            </Badge>
          )}
        </Box>
      </Box>
    );
  };

  /**
   * Renders interest tags as a tag cloud with label
   * Shows max 3 tags with "+X more" indicator if there are more
   */
  const renderInterestTags = () => {
    if (!interestTags || interestTags.length === 0) return null;
    
    const displayTags = interestTags.slice(0, 3);
    const remainingCount = interestTags.length - 3;
    
    return (
      <Box direction="vertical" gap="2px">
        <Text size="tiny" secondary>Lead Source / Interests:</Text>
        <Box gap="4px" wrap="wrap">
          {displayTags.map((tag, idx) => (
            <Badge 
              key={idx} 
              size="tiny" 
              skin="neutral"
            >
              <span style={{ 
                display: 'block', 
                maxWidth: '80px', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap' 
              }}>
                {tag}
              </span>
            </Badge>
          ))}
          {remainingCount > 0 && (
            <Badge size="tiny" skin="neutralLight">
              +{remainingCount}
            </Badge>
          )}
        </Box>
      </Box>
    );
  };

  /**
   * Renders the callback/re-engage date with label
   */
  const renderCallbackDate = () => {
    const formattedDate = formatCallbackDate(callBackDate);
    if (!formattedDate) return null;
    
    return (
      <Box gap="4px" verticalAlign="middle">
        <Text size="tiny" secondary style={{ whiteSpace: 'nowrap' }}>Callback:</Text>
        <Text size="tiny">{formattedDate}</Text>
      </Box>
    );
  };

  /**
   * Renders finance status badge with label
   */
  const renderFinanceStatus = () => {
    if (!financeStatus) return null;

    return (
      <Box gap="4px" verticalAlign="middle">
        <Text size="tiny" secondary style={{ whiteSpace: 'nowrap' }}>Finance:</Text>
        <Badge 
          size="tiny" 
          skin={financeStatusSkins[financeStatus] || 'general'}
        >
          {financeStatus.charAt(0).toUpperCase() + financeStatus.slice(1)}
        </Badge>
      </Box>
    );
  };

  /**
   * Renders the last updated by indicator with user photo
   * Shows a small avatar and "Updated by [name]" text
   */
  const renderLastUpdatedBy = () => {
    if (!lastUpdatedBy) return null;

    const { userName, userPhoto } = lastUpdatedBy;
    const initials = userName.charAt(0).toUpperCase();

    return (
      <Box gap="4px" verticalAlign="middle" marginTop="4px">
        {/* User photo or initials */}
        {userPhoto ? (
          <img
            src={userPhoto}
            alt={userName}
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: '#E0E0E0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              fontWeight: 'bold',
              color: '#666',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
        )}
        <Text size="tiny" secondary style={{ whiteSpace: 'nowrap' }}>
          Updated by {userName}
        </Text>
      </Box>
    );
  };

  return (
    <Draggable draggableId={id} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
        // Track dragging state for click prevention
        if (snapshot.isDragging) {
          isDraggingRef.current = true;
        }

        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            style={{
              ...provided.draggableProps.style,
              marginBottom: '8px',
            }}
          >
            <Card>
              <Card.Content
                style={{ 
                  padding: '0',
                }}
              >
                <Box>
                  {/* Drag Handle - Left side grip area with dots pattern */}
                  <div
                    {...provided.dragHandleProps}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '16px',
                      minWidth: '16px',
                      backgroundColor: snapshot.isDragging ? '#E3F2FD' : '#F5F5F5',
                      cursor: 'grab',
                      borderRadius: '4px 0 0 4px',
                      transition: 'background-color 0.2s ease',
                    }}
                    title="Drag to reorder"
                  >
                    {/* Simple 6-dot grip pattern */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {[0, 1, 2].map((row) => (
                        <div key={row} style={{ display: 'flex', gap: '2px' }}>
                          <div style={{ width: '2px', height: '2px', borderRadius: '50%', backgroundColor: '#9E9E9E' }} />
                          <div style={{ width: '2px', height: '2px', borderRadius: '50%', backgroundColor: '#9E9E9E' }} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Body - Clickable area to open expanded view */}
                  <div
                    onClick={handleCardClick}
                    style={{ 
                      flex: 1,
                      cursor: 'pointer',
                      padding: '8px',
                      minWidth: 0, // Allow text to wrap/truncate properly
                      overflow: 'hidden',
                    }}
                  >
                    <Box direction="vertical" gap="6px">
                      {/* Header row with title and action buttons */}
                      <Box align="space-between" verticalAlign="top">
                        <div style={{ 
                          flex: 1, 
                          minWidth: 0, 
                          overflow: 'hidden',
                          paddingRight: '4px',
                        }}>
                          <Text 
                            weight="bold" 
                            size="small"
                            style={{
                              display: 'block',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                            }}
                          >
                            {title}
                          </Text>
                        </div>
                        <Box gap={1} style={{ flexShrink: 0 }}>
                          {onEdit && (
                            <IconButton
                              size="tiny"
                              skin="inverted"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(id);
                              }}
                            >
                              <Icons.Edit />
                            </IconButton>
                          )}
                          {onDelete && (
                            <IconButton
                              size="tiny"
                              skin="inverted"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(id);
                              }}
                            >
                              <Icons.Delete />
                            </IconButton>
                          )}
                        </Box>
                      </Box>

                      {/* Readiness level - inline with label */}
                      {renderReadinessLevel()}

                      {/* Finance status with label */}
                      {renderFinanceStatus()}

                      {/* Callback date with label */}
                      {renderCallbackDate()}

                      {/* Qualification tags cloud */}
                      {renderQualificationTags()}

                      {/* Interest tags cloud at the bottom with label */}
                      {renderInterestTags()}

                      {/* Last updated by indicator with user photo */}
                      {renderLastUpdatedBy()}
                    </Box>
                  </div>
                </Box>
              </Card.Content>
            </Card>
          </div>
        );
      }}
    </Draggable>
  );
}
