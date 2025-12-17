/**
 * useKanbanCards - React hook for managing Kanban cards with Wix Data
 * 
 * This hook integrates with the profile, card, and activity log services
 * to provide a complete data layer for the Kanban board.
 * 
 * Data Flow: CRM Contact -> ClientProfiles -> KanbanCards -> ActivityLog
 * 
 * Features:
 * - Fetches all cards with React Query caching
 * - Provides mutations for CRUD operations
 * - Syncs CRM contacts to profiles first, then creates cards
 * - Tracks history in ActivityLog on card changes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contacts } from '@wix/crm';
import { 
  KanbanCard, 
  NewKanbanCard, 
  ContactStatus,
  ClientInfo,
  ClientProfile,
} from '../types/kanbanCard.js';
import * as cardService from '../services/cardService.js';
import * as activityLogService from '../services/activityLogService.js';
import * as profileService from '../services/clientProfileService.js';

// Query keys for React Query cache management
export const QUERY_KEYS = {
  CARDS: 'kanbanCards',
  CARD: 'kanbanCard',
  PROFILES: 'clientProfiles',
  PROFILE: 'clientProfile',
  CARDS_BY_PROFILE: 'cardsByProfile',
} as const;

/**
 * Combined card data with profile info for display
 */
export interface EnrichedCard extends KanbanCard {
  profile?: ClientProfile;
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

  // Fetch all profiles
  const profilesQuery = useQuery({
    queryKey: [QUERY_KEYS.PROFILES],
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<ClientProfile[]> => {
      try {
        const profiles = await profileService.getAllProfiles();
        console.log('🗂️ Fetched profiles:', profiles.length);
        return profiles;
      } catch (error) {
        console.error('🗂️ Error fetching profiles:', error);
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
      
      // Log the update to activity log
      if (result) {
        const changedFields = Object.keys(updates);
        for (const field of changedFields) {
          await activityLogService.addHistory(
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
      
      // Log the stage change to activity log
      if (result) {
        await activityLogService.logStageChange(cardId, userId, fromStage, toStageName);
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
      // Delete related activity log entries first
      await activityLogService.deleteCardEntries(cardId);
      
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
    profiles: profilesQuery.data || [],
    isLoading: cardsQuery.isLoading || profilesQuery.isLoading,
    isError: cardsQuery.isError || profilesQuery.isError,
    error: cardsQuery.error || profilesQuery.error,
    refetch: cardsQuery.refetch,
    refetchProfiles: profilesQuery.refetch,
    
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
 * Hook for fetching cards by profile ID
 */
export function useCardsByProfile(profileId: string | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.CARDS_BY_PROFILE, profileId],
    enabled: !!profileId,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!profileId) return [];
      return cardService.getCardsByProfileId(profileId);
    },
  });
}

/**
 * @deprecated Use the Import Dashboard page (/import) instead.
 * 
 * Hook for syncing CRM contacts to profiles and cards
 * 
 * DEPRECATED: This automatic sync function is replaced by the Import Dashboard
 * which gives users explicit control over which contacts to import.
 * 
 * Old Flow: CRM Contact -> ClientProfile -> KanbanCard (automatic)
 * New Flow: CRM Contact -> Import Dashboard (user selection) -> ClientProfiles -> KanbanCards
 * 
 * This hook is kept for backward compatibility but should not be used in new code.
 */
export function useSyncContactsToCards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Fetch contacts from CRM
      const response = await contacts.listContacts({});
      const crmContacts = response.contacts || [];
      
      const results: { profile: ClientProfile; card: KanbanCard }[] = [];
      
      for (const contact of crmContacts) {
        if (!contact._id) continue;
        
        // Step 1: Check if profile exists for this contact
        let profile = await profileService.getProfileByContactId(contact._id);
        
        const firstName = contact.info?.name?.first || '';
        const lastName = contact.info?.name?.last || '';
        
        const clientInfo: ClientInfo = {
          firstName,
          lastName,
          email: contact.info?.emails?.items?.[0]?.email,
          phone: contact.info?.phones?.items?.[0]?.phone,
        };
        
        // Step 2: Create profile if it doesn't exist
        if (!profile) {
          profile = await profileService.createProfile({
            contactId: contact._id,
            clientInfo,
            extendedDetails: {},
          });
          
          console.log('👤 Created profile for contact:', contact._id);
        }
        
        if (!profile?._id) continue;
        
        // Step 3: Check if card exists for this profile
        const existingCards = await cardService.getCardsByProfileId(profile._id);
        
        if (existingCards.length === 0) {
          // Create a new card for this profile
          const newCard = await cardService.createCard({
            profileId: profile._id,
            stageId: 'engage',
            stage: '1. Engage',
          });
          
          if (newCard) {
            results.push({ profile, card: newCard });
            console.log('🎴 Created card for profile:', profile._id);
          }
        }
      }
      
      console.log('🔄 Synced contacts:', results.length, 'new cards created');
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARDS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILES] });
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
