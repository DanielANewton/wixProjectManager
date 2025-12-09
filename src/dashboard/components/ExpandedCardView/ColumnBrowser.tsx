import React from 'react';
import { Box, Text, Dropdown, Card } from '@wix/design-system';
import { ContactStatus } from '../../types/kanbanCard.js';
import { ColumnData } from '../KanbanBoard.js';
import { CardData } from '../KanbanColumn.js';

/**
 * ColumnBrowser - Left panel navigation for the expanded card view
 * 
 * Allows users to:
 * - Switch between stages via dropdown
 * - View and click on other cards in the current stage
 * 
 * @param currentStageId - Currently selected stage
 * @param selectedCardId - Currently selected card ID
 * @param columns - All available columns/stages
 * @param cards - Cards in the current stage
 * @param onStageChange - Callback when stage is changed
 * @param onCardSelect - Callback when a card is selected
 */

export interface ColumnBrowserProps {
  currentStageId: ContactStatus;
  selectedCardId: string;
  columns: ColumnData[];
  cards: CardData[];
  onStageChange: (stageId: ContactStatus) => void;
  onCardSelect: (cardId: string) => void;
}

export default function ColumnBrowser({
  currentStageId,
  selectedCardId,
  columns,
  cards,
  onStageChange,
  onCardSelect,
}: ColumnBrowserProps) {
  // Create dropdown options from columns
  const stageOptions = columns.map(col => ({
    id: col.id,
    value: col.title,
  }));

  // Find current stage option
  const currentStage = stageOptions.find(opt => opt.id === currentStageId);

  return (
    <Box direction="vertical" height="100%">
      {/* Stage Selector Dropdown */}
      <Box padding="16px" borderBottom="1px solid #e0e3e8">
        <Dropdown
          placeholder="Select Stage"
          selectedId={currentStageId}
          options={stageOptions}
          onSelect={(option) => {
            if (option) {
              onStageChange(option.id as ContactStatus);
            }
          }}
        />
      </Box>

      {/* Card Count */}
      <Box padding="12px 16px" borderBottom="1px solid #e0e3e8">
        <Text size="small" secondary>
          {cards.length} card{cards.length !== 1 ? 's' : ''} in {currentStage?.value || 'this stage'}
        </Text>
      </Box>

      {/* Card List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
        }}
      >
        {cards.length === 0 ? (
          <Box align="center" padding="24px">
            <Text secondary size="small">No cards in this stage</Text>
          </Box>
        ) : (
          <Box direction="vertical" gap={2}>
            {cards.map((card) => (
              <MiniCard
                key={card.id}
                card={card}
                isSelected={card.id === selectedCardId}
                onClick={() => onCardSelect(card.id)}
              />
            ))}
          </Box>
        )}
      </div>
    </Box>
  );
}

/**
 * MiniCard - Compact card representation for the column browser
 */
interface MiniCardProps {
  card: CardData;
  isSelected: boolean;
  onClick: () => void;
}

function MiniCard({ card, isSelected, onClick }: MiniCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      <Card>
        <Card.Content
          size="tiny"
        >
          <Box
            padding="8px"
            backgroundColor={isSelected ? '#e3f2fd' : 'transparent'}
            borderRadius="4px"
          >
            <Box direction="vertical" gap={1}>
              <Text
                size="small"
                weight={isSelected ? 'bold' : 'normal'}
                ellipsis
              >
                {card.title}
              </Text>
              {card.description && (
                <Text size="tiny" secondary ellipsis>
                  {card.description}
                </Text>
              )}
            </Box>
          </Box>
        </Card.Content>
      </Card>
    </div>
  );
}

