/**
 * Activity Log Service - Frontend wrapper for ActivityLog Web Methods
 * 
 * This service provides a clean interface to the backend activity log operations.
 * It imports and calls the Web Methods defined in src/backend/activityLog.web.js
 * 
 * The ActivityLog stores history entries and comments for KanbanCards.
 * Data Flow: CRM Contact -> ClientProfiles -> KanbanCards -> ActivityLog
 */

import {
  createEntry as backendCreateEntry,
  addHistory as backendAddHistory,
  logStageChange as backendLogStageChange,
  addComment as backendAddComment,
  getEntriesByCardId as backendGetEntriesByCardId,
  getHistoryByCardId as backendGetHistoryByCardId,
  getCommentsByCardId as backendGetCommentsByCardId,
  deleteEntriesByCardId as backendDeleteEntriesByCardId,
  deleteEntry as backendDeleteEntry,
} from '../../backend/activityLog.web.js';

import { 
  ActivityLogEntry,
  NewActivityLogEntry,
  HistoryMetadata,
  CommentMetadata,
} from '../types/kanbanCard.js';

/**
 * Creates a new activity log entry
 * 
 * @param entry - The entry data to insert
 * @returns The created entry with _id and timestamp
 */
export async function createEntry(entry: NewActivityLogEntry): Promise<ActivityLogEntry | null> {
  try {
    const result = await backendCreateEntry(entry);
    // Backend returns item directly (not wrapped in { data: ... })
    const entryResult = result?.data ?? result;
    return entryResult as ActivityLogEntry || null;
  } catch (error) {
    console.error('📝 Error creating entry:', error);
    throw error;
  }
}

/**
 * Adds a history entry to track changes on a card
 * 
 * @param cardId - The card that was modified
 * @param userId - Who made the change
 * @param content - Description of the change
 * @param userName - Optional display name of the user
 * @param userPhoto - Optional profile photo URL of the user
 * @param metadata - Additional details about what changed
 * @returns The created history entry
 */
export async function addHistory(
  cardId: string,
  userId: string,
  content: string,
  userName?: string,
  userPhoto?: string,
  metadata?: HistoryMetadata
): Promise<ActivityLogEntry | null> {
  try {
    const result = await backendAddHistory(cardId, userId, content, userName, userPhoto, metadata);
    // Backend returns item directly (not wrapped in { data: ... })
    const entry = result?.data ?? result;
    return entry as ActivityLogEntry || null;
  } catch (error) {
    console.error('📝 Error adding history:', error);
    throw error;
  }
}

/**
 * Logs a stage change in the activity log
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
  userName: string,
  userPhoto: string | undefined,
  fromStage: string,
  toStage: string
): Promise<ActivityLogEntry | null> {
  try {
    const result = await backendLogStageChange(cardId, userId, userName, userPhoto, fromStage, toStage);
    // Backend returns item directly (not wrapped in { data: ... })
    const entry = result?.data ?? result;
    return entry as ActivityLogEntry || null;
  } catch (error) {
    console.error('📝 Error logging stage change:', error);
    throw error;
  }
}

/**
 * Logs a field update in the activity log
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
): Promise<ActivityLogEntry | null> {
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
 * @param userPhoto - Optional profile photo URL of the commenter
 * @param metadata - Optional metadata (parent ID for replies, board info)
 * @returns The created comment
 */
export async function addComment(
  cardId: string,
  userId: string,
  userName: string,
  content: string,
  userPhoto?: string,
  metadata?: CommentMetadata
): Promise<ActivityLogEntry | null> {
  try {
    const result = await backendAddComment(cardId, userId, userName, content, userPhoto, metadata);
    // Backend returns item directly (not wrapped in { data: ... })
    const entry = result?.data ?? result;
    return entry as ActivityLogEntry || null;
  } catch (error) {
    console.error('📝 Error adding comment:', error);
    throw error;
  }
}

/**
 * Fetches all activity entries (history and comments) for a card
 * Sorted by creation date, newest first
 * 
 * @param cardId - The card ID
 * @returns Array of all entries for the card
 */
export async function getCardEntries(cardId: string): Promise<ActivityLogEntry[]> {
  try {
    const results = await backendGetEntriesByCardId(cardId);
    // Backend returns items directly (not wrapped in { data: ... })
    return (results || []) as ActivityLogEntry[];
  } catch (error) {
    console.error('📝 Error fetching card entries:', error);
    return [];
  }
}

/**
 * Fetches only history entries for a card
 * 
 * @param cardId - The card ID
 * @returns Array of history entries
 */
export async function getCardHistory(cardId: string): Promise<ActivityLogEntry[]> {
  try {
    const results = await backendGetHistoryByCardId(cardId);
    // Backend returns items directly (not wrapped in { data: ... })
    return (results || []) as ActivityLogEntry[];
  } catch (error) {
    console.error('📝 Error fetching card history:', error);
    return [];
  }
}

/**
 * Fetches only comments for a card
 * 
 * @param cardId - The card ID
 * @returns Array of comment entries
 */
export async function getCardComments(cardId: string): Promise<ActivityLogEntry[]> {
  try {
    const results = await backendGetCommentsByCardId(cardId);
    // Backend returns items directly (not wrapped in { data: ... })
    return (results || []) as ActivityLogEntry[];
  } catch (error) {
    console.error('📝 Error fetching card comments:', error);
    return [];
  }
}

/**
 * Deletes all entries for a card (used when deleting a card)
 * 
 * @param cardId - The card ID
 * @returns Number of deleted entries
 */
export async function deleteCardEntries(cardId: string): Promise<number> {
  try {
    return await backendDeleteEntriesByCardId(cardId);
  } catch (error) {
    console.error('📝 Error deleting card entries:', error);
    return 0;
  }
}

/**
 * Deletes a single entry by its ID
 * 
 * @param entryId - The entry ID to delete
 * @returns True if deletion was successful
 */
export async function deleteEntry(entryId: string): Promise<boolean> {
  try {
    return await backendDeleteEntry(entryId);
  } catch (error) {
    console.error('📝 Error deleting entry:', error);
    return false;
  }
}

// Legacy aliases for backwards compatibility
/** @deprecated Use getCardEntries instead */
export const getCardActions = getCardEntries;
/** @deprecated Use deleteCardEntries instead */
export const deleteCardActions = deleteCardEntries;

