/**
 * KanbanCards Web Methods - Backend CRUD operations
 * 
 * These web methods handle all database operations for KanbanCards.
 * Cards are linked to ClientProfiles via profileId.
 * 
 * Data Flow: CRM Contact -> ClientProfile -> KanbanCards -> ActivityLog
 */

import { webMethod, Permissions } from '@wix/web-methods';
import { items } from '@wix/data';

// Full namespaced collection ID for app collection
const COLLECTION_ID = '@daniel02231/project-manager-v0/KanbanCards';

/**
 * Creates a new KanbanCard linked to a ClientProfile
 * 
 * @param cardData - The card data to insert
 * @returns The created card with _id and timestamps
 */
export const createCard = webMethod(
  Permissions.Anyone,
  async (cardData) => {
    try {
      const result = await items.insert(COLLECTION_ID, cardData);
      
      console.log('🎴 Card created:', result._id);
      return result;
    } catch (error) {
      console.error('🎴 Error creating card:', error);
      throw error;
    }
  }
);

/**
 * Fetches a card by its ID
 * 
 * @param cardId - The unique card ID
 * @returns The card data or null if not found
 */
export const getCardById = webMethod(
  Permissions.Anyone,
  async (cardId) => {
    try {
      const result = await items.get(COLLECTION_ID, cardId);
      return result;
    } catch (error) {
      console.error('🎴 Error fetching card:', error);
      return null;
    }
  }
);

/**
 * Fetches all cards for a specific profile
 * 
 * @param profileId - The ClientProfile ID
 * @returns Array of cards linked to that profile
 */
export const getCardsByProfileId = webMethod(
  Permissions.Anyone,
  async (profileId) => {
    try {
      const result = await items.query(COLLECTION_ID)
        .eq('profileId', profileId)
        .find();
      
      return result.items || [];
    } catch (error) {
      console.error('🎴 Error fetching cards by profile:', error);
      return [];
    }
  }
);

/**
 * Fetches all cards for a specific stage
 * 
 * @param stageId - The workflow stage ID
 * @returns Array of cards in that stage
 */
export const getCardsByStage = webMethod(
  Permissions.Anyone,
  async (stageId) => {
    try {
      const result = await items.query(COLLECTION_ID)
        .eq('stageId', stageId)
        .find();
      
      return result.items || [];
    } catch (error) {
      console.error('🎴 Error fetching cards by stage:', error);
      return [];
    }
  }
);

/**
 * Fetches all cards
 * 
 * @returns Array of all cards
 */
export const getAllCards = webMethod(
  Permissions.Anyone,
  async () => {
    try {
      const result = await items.query(COLLECTION_ID).find();
      
      console.log('🎴 Fetched all cards:', result.items?.length || 0);
      return result.items || [];
    } catch (error) {
      console.error('🎴 Error fetching all cards:', JSON.stringify({
        message: error?.message,
        code: error?.code,
        details: error?.details,
        collectionId: COLLECTION_ID
      }));
      return [];
    }
  }
);

/**
 * Updates a card by ID
 * 
 * @param cardId - The ID of the card to update
 * @param updates - Partial card data to merge with existing
 * @returns The updated card
 */
export const updateCard = webMethod(
  Permissions.Anyone,
  async (cardId, updates) => {
    try {
      const existing = await items.get(COLLECTION_ID, cardId);
      
      if (!existing) {
        console.error('🎴 Card not found for update:', cardId);
        return null;
      }
      
      const updatedData = {
        ...existing,
        ...updates,
        _id: cardId // Ensure ID is preserved
      };
      
      const result = await items.update(COLLECTION_ID, updatedData);
      
      console.log('🎴 Card updated:', cardId);
      return result;
    } catch (error) {
      console.error('🎴 Error updating card:', error);
      throw error;
    }
  }
);

/**
 * Updates just the stage of a card (for drag-and-drop)
 * 
 * @param cardId - The ID of the card to move
 * @param stageId - The new stage ID
 * @param stageName - The display name of the new stage
 * @returns The updated card
 */
export const updateCardStage = webMethod(
  Permissions.Anyone,
  async (cardId, stageId, stageName) => {
    try {
      const existing = await items.get(COLLECTION_ID, cardId);
      
      if (!existing) return null;
      
      const updatedData = {
        ...existing,
        stageId,
        stage: stageName,
        _id: cardId // Ensure ID is preserved
      };
      
      const result = await items.update(COLLECTION_ID, updatedData);
      
      console.log('🎴 Card stage updated:', cardId, '->', stageId);
      return result;
    } catch (error) {
      console.error('🎴 Error updating card stage:', error);
      throw error;
    }
  }
);

/**
 * Deletes a card by ID
 * 
 * @param cardId - The ID of the card to delete
 * @returns True if deletion was successful
 */
export const deleteCard = webMethod(
  Permissions.Anyone,
  async (cardId) => {
    try {
      await items.remove(COLLECTION_ID, cardId);
      
      console.log('🎴 Card deleted:', cardId);
      return true;
    } catch (error) {
      console.error('🎴 Error deleting card:', error);
      return false;
    }
  }
);

/**
 * Creates a card for a profile if one doesn't exist, otherwise updates it
 * 
 * @param profileId - The ClientProfile ID
 * @param cardData - The card data (without profileId)
 * @returns The created or updated card
 */
export const upsertCardForProfile = webMethod(
  Permissions.Anyone,
  async (profileId, cardData) => {
    try {
      const existingResult = await items.query(COLLECTION_ID)
        .eq('profileId', profileId)
        .limit(1)
        .find();
      
      const existing = existingResult.items?.[0];
      
      if (existing) {
        console.log('🎴 Upsert: existing card found for profile', profileId, 'cardId:', existing._id);
        const updatedData = {
          ...existing,
          ...cardData,
          profileId,
          _id: existing._id // Ensure ID is preserved
        };
        
        const result = await items.update(COLLECTION_ID, updatedData);
        console.log('🎴 Upsert: updated card for profile', profileId, 'cardId:', result?._id);
        return result;
      } else {
        console.log('🎴 Upsert: creating new card for profile', profileId);
        const result = await items.insert(COLLECTION_ID, {
          profileId,
          ...cardData,
        });
        
        console.log('🎴 Upsert: created new card for profile', profileId, 'cardId:', result?._id);
        return result;
      }
    } catch (error) {
      console.error('🎴 Error upserting card for profile', profileId, {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        cardData,
      });
      throw error;
    }
  }
);

