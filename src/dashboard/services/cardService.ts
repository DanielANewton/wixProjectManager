/**
 * Card Service - Frontend wrapper for card Web Methods
 * 
 * This service provides a clean interface to the backend card operations.
 * It imports and calls the Web Methods defined in src/backend/cards.web.js
 * 
 * Data Flow: CRM Contact -> ClientProfiles -> KanbanCards -> ActivityLog
 * Note: Cards now link to profiles via profileId (not contactId)
 */

import {
  createCard as backendCreateCard,
  getCardById as backendGetCardById,
  getCardsByProfileId as backendGetCardsByProfileId,
  getCardsByStage as backendGetCardsByStage,
  getAllCards as backendGetAllCards,
  updateCard as backendUpdateCard,
  updateCardStage as backendUpdateCardStage,
  deleteCard as backendDeleteCard,
  upsertCardForProfile as backendUpsertCardForProfile,
} from '../../backend/cards.web.js';

import { 
  KanbanCard, 
  NewKanbanCard, 
  ContactStatus,
} from '../types/kanbanCard.js';

/**
 * Creates a new Kanban card linked to a ClientProfile
 * 
 * @param card - The card data to insert (without auto-generated fields)
 * @returns The created card with _id and timestamps
 */
export async function createCard(card: NewKanbanCard): Promise<KanbanCard | null> {
  try {
    const result = await backendCreateCard(card);
    // Backend returns item directly (not wrapped in { data: ... })
    const cardResult = result?.data ?? result;
    return cardResult as KanbanCard || null;
  } catch (error) {
    console.error('🎴 Error creating card:', error);
    throw error;
  }
}

/**
 * Fetches a single card by its ID
 * 
 * @param cardId - The unique card ID
 * @returns The card data or null if not found
 */
export async function getCardById(cardId: string): Promise<KanbanCard | null> {
  try {
    const result = await backendGetCardById(cardId);
    // Backend returns item directly (not wrapped in { data: ... })
    const card = result?.data ?? result;
    return card as KanbanCard || null;
  } catch (error) {
    console.error('🎴 Error fetching card:', error);
    return null;
  }
}

/**
 * Fetches all cards for a specific profile
 * 
 * @param profileId - The ClientProfile ID
 * @returns Array of cards linked to that profile
 */
export async function getCardsByProfileId(profileId: string): Promise<KanbanCard[]> {
  try {
    const results = await backendGetCardsByProfileId(profileId);
    // Backend returns items directly (not wrapped in { data: ... })
    return (results || []) as KanbanCard[];
  } catch (error) {
    console.error('🎴 Error fetching cards by profile:', error);
    return [];
  }
}

/**
 * Fetches all cards for a specific stage/column
 * 
 * @param stageId - The workflow stage ID
 * @returns Array of cards in that stage
 */
export async function getCardsByStage(stageId: ContactStatus): Promise<KanbanCard[]> {
  try {
    const results = await backendGetCardsByStage(stageId);
    // Backend returns items directly (not wrapped in { data: ... })
    return (results || []) as KanbanCard[];
  } catch (error) {
    console.error('🎴 Error fetching cards by stage:', error);
    return [];
  }
}

/**
 * Fetches all Kanban cards
 * 
 * @returns Array of all cards
 */
export async function getAllCards(): Promise<KanbanCard[]> {
  try {
    const results = await backendGetAllCards();
    console.log('🎴 Fetched all cards:', results?.length || 0);
    // Backend returns items directly (not wrapped in { data: ... })
    return (results || []) as KanbanCard[];
  } catch (error) {
    console.error('🎴 Error fetching all cards:', error);
    return [];
  }
}

/**
 * Updates an existing card with new data
 * 
 * @param cardId - The ID of the card to update
 * @param updates - Partial card data to merge with existing
 * @returns The updated card
 */
export async function updateCard(
  cardId: string, 
  updates: Partial<KanbanCard>
): Promise<KanbanCard | null> {
  try {
    const result = await backendUpdateCard(cardId, updates);
    // Backend returns item directly (not wrapped in { data: ... })
    const card = result?.data ?? result;
    return card as KanbanCard || null;
  } catch (error) {
    console.error('🎴 Error updating card:', error);
    throw error;
  }
}

/**
 * Updates the stage/column of a card (for drag-and-drop)
 * 
 * @param cardId - The ID of the card to move
 * @param newStageId - The new stage ID
 * @param newStageName - The display name of the new stage
 * @returns The updated card
 */
export async function updateCardStage(
  cardId: string,
  newStageId: ContactStatus,
  newStageName: string
): Promise<KanbanCard | null> {
  try {
    const result = await backendUpdateCardStage(cardId, newStageId, newStageName);
    // Backend returns item directly (not wrapped in { data: ... })
    const card = result?.data ?? result;
    return card as KanbanCard || null;
  } catch (error) {
    console.error('🎴 Error updating card stage:', error);
    throw error;
  }
}

/**
 * Deletes a card by its ID
 * Note: Related ActivityLog entries should also be deleted
 * 
 * @param cardId - The ID of the card to delete
 * @returns True if deletion was successful
 */
export async function deleteCard(cardId: string): Promise<boolean> {
  try {
    return await backendDeleteCard(cardId);
  } catch (error) {
    console.error('🎴 Error deleting card:', error);
    return false;
  }
}

/**
 * Creates or updates a card for a profile
 * If a card already exists for the profile, it updates it
 * Otherwise, it creates a new card
 * 
 * @param profileId - The ClientProfile ID
 * @param cardData - The card data
 * @returns The created or updated card
 */
export async function upsertCardForProfile(
  profileId: string,
  cardData: Partial<Omit<NewKanbanCard, 'profileId'>>
): Promise<KanbanCard | null> {
  try {
    const result = await backendUpsertCardForProfile(profileId, {
      stageId: cardData.stageId || 'engage',
      stage: cardData.stage || '1. Engage',
      ...cardData,
    });
    // Backend returns card directly (not wrapped in { data: ... })
    // Handle both formats for compatibility
    const card = result?.data ?? result;
    console.log('🎴 Service upsertCardForProfile result:', { profileId, hasData: !!result?.data, hasResult: !!result, cardId: card?._id });
    return card as KanbanCard || null;
  } catch (error) {
    console.error('🎴 Error upserting card:', error);
    throw error;
  }
}
