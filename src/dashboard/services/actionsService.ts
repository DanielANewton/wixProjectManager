/**
 * Actions Service - CRUD operations for the CardActions collection
 * 
 * This service handles history logs and comments for Kanban cards:
 * - Adding history entries when cards change
 * - Adding and managing comments
 * - Fetching action history for a card
 */

import { items } from '@wix/data';
import { 
  CardAction, 
  NewCardAction, 
  COLLECTIONS,
  HistoryMetadata,
  CommentMetadata,
} from '../types/kanbanCard.js';

/**
 * Creates a new action (history or comment) for a card
 * 
 * @param action - The action data to insert
 * @returns The created action with _id and timestamp
 */
async function createAction(action: NewCardAction): Promise<CardAction> {
  try {
    const result = await items.insertDataItemReference({
      dataCollectionId: COLLECTIONS.CARD_ACTIONS,
      dataItem: {
        data: action,
      },
    });
    
    console.log('📝 Action created:', result.dataItem?._id);
    return result.dataItem?.data as CardAction;
  } catch (error) {
    console.error('📝 Error creating action:', error);
    throw error;
  }
}

/**
 * Adds a history entry to track changes on a card
 * 
 * @param cardId - The card that was modified
 * @param userId - Who made the change
 * @param content - Description of the change
 * @param metadata - Additional details about what changed
 * @returns The created history entry
 */
export async function addHistory(
  cardId: string,
  userId: string,
  content: string,
  metadata?: HistoryMetadata
): Promise<CardAction> {
  const action: NewCardAction = {
    cardId,
    actionType: 'history',
    content,
    userId,
    metadata,
  };
  
  return createAction(action);
}

/**
 * Logs a stage change in the card history
 * 
 * @param cardId - The card that was moved
 * @param userId - Who moved the card
 * @param fromStage - Previous stage name
 * @param toStage - New stage name
 * @returns The created history entry
 */
export async function logStageChange(
  cardId: string,
  userId: string,
  fromStage: string,
  toStage: string
): Promise<CardAction> {
  return addHistory(
    cardId,
    userId,
    `Moved from "${fromStage}" to "${toStage}"`,
    {
      field: 'stage',
      oldValue: fromStage,
      newValue: toStage,
      action: 'stage_change',
    }
  );
}

/**
 * Logs a field update in the card history
 * 
 * @param cardId - The card that was modified
 * @param userId - Who made the change
 * @param fieldName - Name of the field that changed
 * @param oldValue - Previous value
 * @param newValue - New value
 * @returns The created history entry
 */
export async function logFieldUpdate(
  cardId: string,
  userId: string,
  fieldName: string,
  oldValue: string,
  newValue: string
): Promise<CardAction> {
  return addHistory(
    cardId,
    userId,
    `Updated ${fieldName}`,
    {
      field: fieldName,
      oldValue,
      newValue,
      action: 'field_update',
    }
  );
}

/**
 * Adds a comment to a card
 * 
 * @param cardId - The card to comment on
 * @param userId - Who wrote the comment
 * @param userName - Display name of the commenter
 * @param content - The comment text
 * @param metadata - Optional metadata (parent ID for replies, board info)
 * @returns The created comment
 */
export async function addComment(
  cardId: string,
  userId: string,
  userName: string,
  content: string,
  metadata?: CommentMetadata
): Promise<CardAction> {
  const action: NewCardAction = {
    cardId,
    actionType: 'comment',
    content,
    userId,
    userName,
    metadata,
  };
  
  return createAction(action);
}

/**
 * Fetches all actions (history and comments) for a card
 * Sorted by creation date, newest first
 * 
 * @param cardId - The card ID
 * @returns Array of all actions for the card
 */
export async function getCardActions(cardId: string): Promise<CardAction[]> {
  try {
    const result = await items.queryDataItems({
      dataCollectionId: COLLECTIONS.CARD_ACTIONS,
      query: {
        filter: { cardId },
        sort: [{ fieldName: '_createdDate', order: 'DESC' }],
      },
    });
    
    return (result.dataItems || []).map(item => item.data as CardAction);
  } catch (error) {
    console.error('📝 Error fetching card actions:', error);
    return [];
  }
}

/**
 * Fetches only history entries for a card
 * 
 * @param cardId - The card ID
 * @returns Array of history actions
 */
export async function getCardHistory(cardId: string): Promise<CardAction[]> {
  try {
    const result = await items.queryDataItems({
      dataCollectionId: COLLECTIONS.CARD_ACTIONS,
      query: {
        filter: { 
          cardId,
          actionType: 'history',
        },
        sort: [{ fieldName: '_createdDate', order: 'DESC' }],
      },
    });
    
    return (result.dataItems || []).map(item => item.data as CardAction);
  } catch (error) {
    console.error('📝 Error fetching card history:', error);
    return [];
  }
}

/**
 * Fetches only comments for a card
 * 
 * @param cardId - The card ID
 * @returns Array of comment actions
 */
export async function getCardComments(cardId: string): Promise<CardAction[]> {
  try {
    const result = await items.queryDataItems({
      dataCollectionId: COLLECTIONS.CARD_ACTIONS,
      query: {
        filter: { 
          cardId,
          actionType: 'comment',
        },
        sort: [{ fieldName: '_createdDate', order: 'ASC' }],
      },
    });
    
    return (result.dataItems || []).map(item => item.data as CardAction);
  } catch (error) {
    console.error('📝 Error fetching card comments:', error);
    return [];
  }
}

/**
 * Deletes all actions for a card (used when deleting a card)
 * 
 * @param cardId - The card ID
 * @returns Number of deleted actions
 */
export async function deleteCardActions(cardId: string): Promise<number> {
  try {
    const actions = await getCardActions(cardId);
    
    for (const action of actions) {
      if (action._id) {
        await items.removeDataItem(action._id, {
          dataCollectionId: COLLECTIONS.CARD_ACTIONS,
        });
      }
    }
    
    console.log('📝 Deleted actions for card:', cardId, 'count:', actions.length);
    return actions.length;
  } catch (error) {
    console.error('📝 Error deleting card actions:', error);
    return 0;
  }
}

/**
 * Deletes a single comment by its ID
 * 
 * @param actionId - The action/comment ID to delete
 * @returns True if deletion was successful
 */
export async function deleteComment(actionId: string): Promise<boolean> {
  try {
    await items.removeDataItem(actionId, {
      dataCollectionId: COLLECTIONS.CARD_ACTIONS,
    });
    
    console.log('📝 Comment deleted:', actionId);
    return true;
  } catch (error) {
    console.error('📝 Error deleting comment:', error);
    return false;
  }
}

