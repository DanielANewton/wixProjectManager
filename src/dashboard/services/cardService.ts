/**
 * Card Service - CRUD operations for the KanbanCards collection
 * 
 * This service handles all data operations for Kanban cards:
 * - Creating new cards linked to CRM contacts
 * - Fetching cards by ID or contact ID
 * - Updating card fields
 * - Deleting cards (cascades to related actions and profiles)
 */

import { items } from '@wix/data';
import { 
  KanbanCard, 
  NewKanbanCard, 
  COLLECTIONS,
  ContactStatus 
} from '../types/kanbanCard.js';

/**
 * Creates a new Kanban card linked to a CRM contact
 * 
 * @param card - The card data to insert (without auto-generated fields)
 * @returns The created card with _id and timestamps
 */
export async function createCard(card: NewKanbanCard): Promise<KanbanCard> {
  try {
    const result = await items.insertDataItemReference({
      dataCollectionId: COLLECTIONS.KANBAN_CARDS,
      dataItem: {
        data: card,
      },
    });
    
    console.log('🎴 Card created:', result.dataItem?._id);
    return result.dataItem?.data as KanbanCard;
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
    const result = await items.getDataItem(cardId, {
      dataCollectionId: COLLECTIONS.KANBAN_CARDS,
    });
    
    return result.dataItem?.data as KanbanCard || null;
  } catch (error) {
    console.error('🎴 Error fetching card:', error);
    return null;
  }
}

/**
 * Fetches a card by its associated CRM contact ID
 * 
 * @param contactId - The CRM contact ID
 * @returns The card data or null if not found
 */
export async function getCardByContactId(contactId: string): Promise<KanbanCard | null> {
  try {
    const result = await items.queryDataItems({
      dataCollectionId: COLLECTIONS.KANBAN_CARDS,
      query: {
        filter: { contactId },
        paging: { limit: 1 },
      },
    });
    
    const card = result.dataItems?.[0]?.data as KanbanCard;
    return card || null;
  } catch (error) {
    console.error('🎴 Error fetching card by contact:', error);
    return null;
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
    const result = await items.queryDataItems({
      dataCollectionId: COLLECTIONS.KANBAN_CARDS,
      query: {
        filter: { stageId },
      },
    });
    
    return (result.dataItems || []).map(item => item.data as KanbanCard);
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
    const result = await items.queryDataItems({
      dataCollectionId: COLLECTIONS.KANBAN_CARDS,
      query: {},
    });
    
    console.log('🎴 Fetched all cards:', result.dataItems?.length || 0);
    return (result.dataItems || []).map(item => item.data as KanbanCard);
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
    // First fetch the existing card
    const existing = await getCardById(cardId);
    if (!existing) {
      console.error('🎴 Card not found for update:', cardId);
      return null;
    }
    
    // Merge updates with existing data
    const updatedData = { ...existing, ...updates };
    
    const result = await items.updateDataItem(cardId, {
      dataCollectionId: COLLECTIONS.KANBAN_CARDS,
      dataItem: {
        _id: cardId,
        data: updatedData,
      },
    });
    
    console.log('🎴 Card updated:', cardId);
    return result.dataItem?.data as KanbanCard;
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
  return updateCard(cardId, {
    stageId: newStageId,
    stage: newStageName,
  });
}

/**
 * Deletes a card by its ID
 * Note: This should also trigger deletion of related actions and profiles
 * 
 * @param cardId - The ID of the card to delete
 * @returns True if deletion was successful
 */
export async function deleteCard(cardId: string): Promise<boolean> {
  try {
    await items.removeDataItem(cardId, {
      dataCollectionId: COLLECTIONS.KANBAN_CARDS,
    });
    
    console.log('🎴 Card deleted:', cardId);
    return true;
  } catch (error) {
    console.error('🎴 Error deleting card:', error);
    return false;
  }
}

/**
 * Creates or updates a card for a contact
 * If a card already exists for the contact, it updates it
 * Otherwise, it creates a new card
 * 
 * @param contactId - The CRM contact ID
 * @param cardData - The card data
 * @returns The created or updated card
 */
export async function upsertCardForContact(
  contactId: string,
  cardData: Partial<NewKanbanCard>
): Promise<KanbanCard | null> {
  try {
    const existingCard = await getCardByContactId(contactId);
    
    if (existingCard && existingCard._id) {
      // Update existing card
      return updateCard(existingCard._id, cardData);
    } else {
      // Create new card
      const newCard: NewKanbanCard = {
        contactId,
        stageId: cardData.stageId || 'engage',
        stage: cardData.stage || '1. Engage',
        ...cardData,
      };
      return createCard(newCard);
    }
  } catch (error) {
    console.error('🎴 Error upserting card:', error);
    throw error;
  }
}

