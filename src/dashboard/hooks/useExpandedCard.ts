/**
 * useExpandedCard - Hook for managing expanded card view state
 * 
 * This hook provides:
 * - Card data fetching
 * - Profile data fetching
 * - Actions (history/comments) fetching
 * - Mutation functions for updates
 * 
 * @param cardId - The ID of the card to fetch
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  KanbanCard, 
  ClientProfile, 
  CardAction,
  ClientInfo,
} from '../types/kanbanCard.js';
import * as cardService from '../services/cardService.js';
import * as profileService from '../services/clientProfileService.js';
import * as actionsService from '../services/actionsService.js';

// Query keys
const QUERY_KEYS = {
  EXPANDED_CARD: 'expandedCard',
  CARD_PROFILE: 'cardProfile',
  CARD_ACTIONS: 'cardActions',
} as const;

/**
 * Return type for the useExpandedCard hook
 */
export interface UseExpandedCardResult {
  // Data
  card: KanbanCard | null;
  profile: ClientProfile | null;
  actions: CardAction[];
  
  // Loading states
  isLoading: boolean;
  isCardLoading: boolean;
  isProfileLoading: boolean;
  isActionsLoading: boolean;
  
  // Error states
  isError: boolean;
  error: Error | null;
  
  // Mutation functions
  updateCard: (updates: Partial<KanbanCard>) => Promise<void>;
  updateProfile: (updates: Partial<ClientInfo>) => Promise<void>;
  addComment: (content: string) => Promise<void>;
  addHistory: (content: string) => Promise<void>;
  
  // Refetch functions
  refetchCard: () => void;
  refetchProfile: () => void;
  refetchActions: () => void;
}

export function useExpandedCard(cardId: string): UseExpandedCardResult {
  const queryClient = useQueryClient();

  // Fetch card data
  const cardQuery = useQuery({
    queryKey: [QUERY_KEYS.EXPANDED_CARD, cardId],
    enabled: !!cardId,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const card = await cardService.getCardById(cardId);
      console.log('🔍 Fetched expanded card:', cardId);
      return card;
    },
  });

  // Fetch profile data
  const profileQuery = useQuery({
    queryKey: [QUERY_KEYS.CARD_PROFILE, cardId],
    enabled: !!cardId,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const profile = await profileService.getProfileByCardId(cardId);
      console.log('🔍 Fetched card profile:', cardId);
      return profile;
    },
  });

  // Fetch actions (history and comments)
  const actionsQuery = useQuery({
    queryKey: [QUERY_KEYS.CARD_ACTIONS, cardId],
    enabled: !!cardId,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const actions = await actionsService.getCardActions(cardId);
      console.log('🔍 Fetched card actions:', cardId, 'count:', actions.length);
      return actions;
    },
  });

  // Mutation: Update card
  const updateCardMutation = useMutation({
    mutationFn: async (updates: Partial<KanbanCard>) => {
      const result = await cardService.updateCard(cardId, updates);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EXPANDED_CARD, cardId] });
    },
  });

  // Mutation: Update profile
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<ClientInfo>) => {
      const profile = profileQuery.data;
      if (profile?._id) {
        return profileService.updateClientInfo(profile._id, updates);
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARD_PROFILE, cardId] });
    },
  });

  // Mutation: Add comment
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      // TODO: Get actual user ID and name from auth context
      const userId = 'current-user';
      const userName = 'Current User';
      
      return actionsService.addComment(cardId, userId, userName, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARD_ACTIONS, cardId] });
    },
  });

  // Mutation: Add history entry
  const addHistoryMutation = useMutation({
    mutationFn: async (content: string) => {
      // TODO: Get actual user ID from auth context
      const userId = 'current-user';
      
      return actionsService.addHistory(cardId, userId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARD_ACTIONS, cardId] });
    },
  });

  // Combined loading state
  const isLoading = cardQuery.isLoading || profileQuery.isLoading || actionsQuery.isLoading;

  // Combined error state
  const isError = cardQuery.isError || profileQuery.isError || actionsQuery.isError;
  const error = cardQuery.error || profileQuery.error || actionsQuery.error;

  return {
    // Data
    card: cardQuery.data || null,
    profile: profileQuery.data || null,
    actions: actionsQuery.data || [],
    
    // Loading states
    isLoading,
    isCardLoading: cardQuery.isLoading,
    isProfileLoading: profileQuery.isLoading,
    isActionsLoading: actionsQuery.isLoading,
    
    // Error states
    isError,
    error: error as Error | null,
    
    // Mutation functions (wrapped to return promises)
    updateCard: async (updates: Partial<KanbanCard>) => {
      await updateCardMutation.mutateAsync(updates);
    },
    updateProfile: async (updates: Partial<ClientInfo>) => {
      await updateProfileMutation.mutateAsync(updates);
    },
    addComment: async (content: string) => {
      await addCommentMutation.mutateAsync(content);
    },
    addHistory: async (content: string) => {
      await addHistoryMutation.mutateAsync(content);
    },
    
    // Refetch functions
    refetchCard: () => cardQuery.refetch(),
    refetchProfile: () => profileQuery.refetch(),
    refetchActions: () => actionsQuery.refetch(),
  };
}

