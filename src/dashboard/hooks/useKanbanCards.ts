/**
 * useKanbanCards - React hook for managing Kanban cards with Wix Data
 * 
 * This hook integrates with the card, actions, and profile services
 * to provide a complete data layer for the Kanban board.
 * 
 * Features:
 * - Fetches all cards with React Query caching
 * - Provides mutations for CRUD operations
 * - Integrates with CRM contacts
 * - Tracks history on card changes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contacts } from '@wix/crm';
import { 
  KanbanCard, 
  NewKanbanCard, 
  ContactStatus,
  ClientInfo,
} from '../types/kanbanCard.js';
import * as cardService from '../services/cardService.js';
import * as actionsService from '../services/actionsService.js';
import * as profileService from '../services/clientProfileService.js';

// Query keys for React Query cache management
export const QUERY_KEYS = {
  CARDS: 'kanbanCards',
  CARD: 'kanbanCard',
  CARD_BY_CONTACT: 'kanbanCardByContact',
} as const;

/**
 * Combined card data with CRM contact info
 */
export interface EnrichedCard extends KanbanCard {
  contact?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
}

/**
 * Main hook for fetching and managing all Kanban cards
 * Returns cards organized by stage for the Kanban board
 */
export function useKanbanCards() {
  const queryClient = useQueryClient();

  // Fetch all cards from the database
  const cardsQuery = useQuery({
    queryKey: [QUERY_KEYS.CARDS],
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<KanbanCard[]> => {
      try {
        const cards = await cardService.getAllCards();
        console.log('🗂️ Fetched kanban cards:', cards.length);
        return cards;
      } catch (error) {
        console.error('🗂️ Error fetching cards:', error);
        throw error;
      }
    },
  });

  // Mutation for creating a new card
  const createCardMutation = useMutation({
    mutationFn: async (card: NewKanbanCard) => {
      return cardService.createCard(card);
    },
    onSuccess: () => {
      // Invalidate and refetch cards
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARDS] });
    },
  });

  // Mutation for updating a card
  const updateCardMutation = useMutation({
    mutationFn: async ({ 
      cardId, 
      updates, 
      userId = 'system' 
    }: { 
      cardId: string; 
      updates: Partial<KanbanCard>; 
      userId?: string;
    }) => {
      const result = await cardService.updateCard(cardId, updates);
      
      // Log the update to history
      if (result) {
        const changedFields = Object.keys(updates);
        for (const field of changedFields) {
          await actionsService.addHistory(
            cardId,
            userId,
            `Updated ${field}`,
            { field, action: 'field_update' }
          );
        }
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARDS] });
    },
  });

  // Mutation for moving a card to a new stage
  const moveCardMutation = useMutation({
    mutationFn: async ({
      cardId,
      fromStage,
      toStageId,
      toStageName,
      userId = 'system',
    }: {
      cardId: string;
      fromStage: string;
      toStageId: ContactStatus;
      toStageName: string;
      userId?: string;
    }) => {
      const result = await cardService.updateCardStage(cardId, toStageId, toStageName);
      
      // Log the stage change to history
      if (result) {
        await actionsService.logStageChange(cardId, userId, fromStage, toStageName);
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARDS] });
    },
  });

  // Mutation for deleting a card
  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: string) => {
      // Delete related actions and profile first
      await actionsService.deleteCardActions(cardId);
      await profileService.deleteProfileByCardId(cardId);
      
      // Then delete the card
      return cardService.deleteCard(cardId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARDS] });
    },
  });

  return {
    // Query data
    cards: cardsQuery.data || [],
    isLoading: cardsQuery.isLoading,
    isError: cardsQuery.isError,
    error: cardsQuery.error,
    refetch: cardsQuery.refetch,
    
    // Mutations
    createCard: createCardMutation.mutateAsync,
    updateCard: updateCardMutation.mutateAsync,
    moveCard: moveCardMutation.mutateAsync,
    deleteCard: deleteCardMutation.mutateAsync,
    
    // Mutation states
    isCreating: createCardMutation.isPending,
    isUpdating: updateCardMutation.isPending,
    isMoving: moveCardMutation.isPending,
    isDeleting: deleteCardMutation.isPending,
  };
}

/**
 * Hook for fetching a single card by ID
 */
export function useKanbanCard(cardId: string | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.CARD, cardId],
    enabled: !!cardId,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!cardId) return null;
      return cardService.getCardById(cardId);
    },
  });
}

/**
 * Hook for fetching a card by contact ID
 */
export function useCardByContact(contactId: string | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.CARD_BY_CONTACT, contactId],
    enabled: !!contactId,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!contactId) return null;
      return cardService.getCardByContactId(contactId);
    },
  });
}

/**
 * Hook for creating cards from CRM contacts
 * Syncs CRM contacts with Kanban cards
 */
export function useSyncContactsToCards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Fetch contacts from CRM
      const response = await contacts.listContacts({});
      const crmContacts = response.contacts || [];
      
      const results: KanbanCard[] = [];
      
      for (const contact of crmContacts) {
        if (!contact._id) continue;
        
        // Check if card already exists for this contact
        const existingCard = await cardService.getCardByContactId(contact._id);
        
        if (!existingCard) {
          // Create a new card for this contact
          const firstName = contact.info?.name?.first || '';
          const lastName = contact.info?.name?.last || '';
          
          const newCard = await cardService.createCard({
            contactId: contact._id,
            stageId: 'engage',
            stage: '1. Engage',
          });
          
          if (newCard) {
            // Create a profile for the card
            const clientInfo: ClientInfo = {
              firstName,
              lastName,
              email: contact.info?.emails?.items?.[0]?.email,
              phone: contact.info?.phones?.items?.[0]?.phone,
            };
            
            await profileService.createProfile({
              cardId: newCard._id!,
              contactId: contact._id,
              clientInfo,
              extendedDetails: {},
            });
            
            results.push(newCard);
          }
        }
      }
      
      console.log('🔄 Synced contacts to cards:', results.length, 'new cards created');
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARDS] });
    },
  });
}

/**
 * Helper function to organize cards into columns by stage
 */
export function organizeCardsByStage(cards: KanbanCard[]): Record<ContactStatus, KanbanCard[]> {
  const stages: ContactStatus[] = [
    'engage', 'intent', 'engagement', 'advice-call', 'qualification',
    'straight-to-quote', 'routing-pqq', 'booking', 'assessment-undertaken',
    'assessment-completed', 'sales-pitch', 'tender-quote', 'supplier-survey',
    'go-no-go', 'finance-payment', 'installation', 'project-completion',
  ];
  
  const organized: Record<ContactStatus, KanbanCard[]> = {} as Record<ContactStatus, KanbanCard[]>;
  
  // Initialize empty arrays for each stage
  for (const stage of stages) {
    organized[stage] = [];
  }
  
  // Organize cards into their respective stages
  for (const card of cards) {
    if (card.stageId && organized[card.stageId]) {
      organized[card.stageId].push(card);
    }
  }
  
  return organized;
}

