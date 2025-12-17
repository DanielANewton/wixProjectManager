/**
 * ActivityLog Web Methods - Backend CRUD operations
 * 
 * These web methods handle all database operations for the ActivityLog.
 * ActivityLog stores history entries and comments for KanbanCards.
 * 
 * Data Flow: CRM Contact -> ClientProfile -> KanbanCards -> ActivityLog
 */

import { webMethod, Permissions } from '@wix/web-methods';
import { items } from '@wix/data';

// Full namespaced collection ID for app collection
const COLLECTION_ID = '@daniel02231/project-manager-v0/ActivityLog';

/**
 * Creates a new activity log entry
 * 
 * @param entryData - The entry data to create
 * @returns The created entry with _id and timestamps
 */
export const createEntry = webMethod(
  Permissions.Anyone,
  async (entryData) => {
    try {
      const result = await items.insert(COLLECTION_ID, entryData);
      
      console.log('📝 Activity entry created:', result._id);
      return result;
    } catch (error) {
      console.error('📝 Error creating entry:', error);
      throw error;
    }
  }
);

/**
 * Adds a history entry for a card
 * 
 * @param cardId - The ID of the card
 * @param userId - The ID of the user making the change
 * @param content - Description of the change
 * @param metadata - Additional metadata about the change
 * @returns The created history entry
 */
export const addHistory = webMethod(
  Permissions.Anyone,
  async (cardId, userId, content, metadata) => {
    try {
      const result = await items.insert(COLLECTION_ID, {
        cardId,
        entryType: 'history',
        content,
        userId,
        metadata,
      });
      
      console.log('📝 History added for card:', cardId);
      return result;
    } catch (error) {
      console.error('📝 Error adding history:', error);
      throw error;
    }
  }
);

/**
 * Logs a stage change in the activity log
 * 
 * @param cardId - The ID of the card
 * @param userId - The ID of the user making the change
 * @param fromStage - The previous stage name
 * @param toStage - The new stage name
 * @returns The created history entry
 */
export const logStageChange = webMethod(
  Permissions.Anyone,
  async (cardId, userId, fromStage, toStage) => {
    try {
      const result = await items.insert(COLLECTION_ID, {
        cardId,
        entryType: 'history',
        content: `Moved from "${fromStage}" to "${toStage}"`,
        userId,
        metadata: {
          field: 'stage',
          oldValue: fromStage,
          newValue: toStage,
          action: 'stage_change',
        },
      });
      
      console.log('📝 Stage change logged:', cardId);
      return result;
    } catch (error) {
      console.error('📝 Error logging stage change:', error);
      throw error;
    }
  }
);

/**
 * Adds a comment to a card
 * 
 * @param cardId - The ID of the card
 * @param userId - The ID of the user
 * @param userName - The display name of the user
 * @param content - The comment text
 * @param metadata - Additional metadata
 * @returns The created comment entry
 */
export const addComment = webMethod(
  Permissions.Anyone,
  async (cardId, userId, userName, content, metadata) => {
    try {
      const result = await items.insert(COLLECTION_ID, {
        cardId,
        entryType: 'comment',
        content,
        userId,
        userName,
        metadata,
      });
      
      console.log('📝 Comment added for card:', cardId);
      return result;
    } catch (error) {
      console.error('📝 Error adding comment:', error);
      throw error;
    }
  }
);

/**
 * Fetches all activity entries for a card
 * 
 * @param cardId - The ID of the card
 * @returns Array of all entries (history and comments)
 */
export const getEntriesByCardId = webMethod(
  Permissions.Anyone,
  async (cardId) => {
    try {
      const result = await items.query(COLLECTION_ID)
        .eq('cardId', cardId)
        .descending('_createdDate')
        .find();
      
      return result.items || [];
    } catch (error) {
      console.error('📝 Error fetching entries:', error);
      return [];
    }
  }
);

/**
 * Fetches only history entries for a card
 * 
 * @param cardId - The ID of the card
 * @returns Array of history entries
 */
export const getHistoryByCardId = webMethod(
  Permissions.Anyone,
  async (cardId) => {
    try {
      const result = await items.query(COLLECTION_ID)
        .eq('cardId', cardId)
        .eq('entryType', 'history')
        .descending('_createdDate')
        .find();
      
      return result.items || [];
    } catch (error) {
      console.error('📝 Error fetching history:', error);
      return [];
    }
  }
);

/**
 * Fetches only comments for a card
 * 
 * @param cardId - The ID of the card
 * @returns Array of comment entries
 */
export const getCommentsByCardId = webMethod(
  Permissions.Anyone,
  async (cardId) => {
    try {
      const result = await items.query(COLLECTION_ID)
        .eq('cardId', cardId)
        .eq('entryType', 'comment')
        .ascending('_createdDate')
        .find();
      
      return result.items || [];
    } catch (error) {
      console.error('📝 Error fetching comments:', error);
      return [];
    }
  }
);

/**
 * Deletes all entries for a card (used when deleting a card)
 * 
 * @param cardId - The ID of the card
 * @returns Number of entries deleted
 */
export const deleteEntriesByCardId = webMethod(
  Permissions.Anyone,
  async (cardId) => {
    try {
      const entries = await items.query(COLLECTION_ID)
        .eq('cardId', cardId)
        .find();
      
      let deletedCount = 0;
      for (const entry of entries.items || []) {
        if (entry._id) {
          await items.remove(COLLECTION_ID, entry._id);
          deletedCount++;
        }
      }
      
      console.log('📝 Deleted entries for card:', cardId, 'count:', deletedCount);
      return deletedCount;
    } catch (error) {
      console.error('📝 Error deleting entries:', error);
      return 0;
    }
  }
);

/**
 * Deletes a single entry by ID
 * 
 * @param entryId - The ID of the entry to delete
 * @returns True if deletion was successful
 */
export const deleteEntry = webMethod(
  Permissions.Anyone,
  async (entryId) => {
    try {
      await items.remove(COLLECTION_ID, entryId);
      
      console.log('📝 Entry deleted:', entryId);
      return true;
    } catch (error) {
      console.error('📝 Error deleting entry:', error);
      return false;
    }
  }
);

