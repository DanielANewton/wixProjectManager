/**
 * useExpandedCard - Hook for managing expanded card view state
 * 
 * This hook provides:
 * - Card data fetching
 * - Profile data fetching (via card's profileId)
 * - Activity log (history/comments) fetching
 * - Mutation functions for updates
 * 
 * Data Flow: Card -> Profile (via profileId) -> ActivityLog entries
 * 
 * @param cardId - The ID of the card to fetch
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  KanbanCard, 
  ClientProfile, 
  ActivityLogEntry,
  ClientInfo,
} from '../types/kanbanCard.js';
import * as cardService from '../services/cardService.js';
import * as profileService from '../services/clientProfileService.js';
import * as activityLogService from '../services/activityLogService.js';
import { useCurrentUser } from './useCurrentUser.js';

// Query keys
const QUERY_KEYS = {
  EXPANDED_CARD: 'expandedCard',
  CARD_PROFILE: 'cardProfile',
  ACTIVITY_LOG: 'activityLog',
} as const;

/**
 * Return type for the useExpandedCard hook
 */
export interface UseExpandedCardResult {
  // Data
  card: KanbanCard | null;
  profile: ClientProfile | null;
  activityLog: ActivityLogEntry[];
  
  // Loading states
  isLoading: boolean;
  isCardLoading: boolean;
  isProfileLoading: boolean;
  isActivityLoading: boolean;
  
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
  refetchActivity: () => void;
}

export function useExpandedCard(cardId: string): UseExpandedCardResult {
  const queryClient = useQueryClient();
  
  // Get current user info for recording who makes changes
  // Includes userPhoto for displaying avatars in comments/history
  const { userId, userName, userPhoto } = useCurrentUser();

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

  // Get profileId from the card
  const profileId = cardQuery.data?.profileId;

  // Fetch profile data using the card's profileId
  const profileQuery = useQuery({
    queryKey: [QUERY_KEYS.CARD_PROFILE, profileId],
    enabled: !!profileId,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!profileId) return null;
      const profile = await profileService.getProfileById(profileId);
      console.log('🔍 Fetched profile for card:', cardId, 'profileId:', profileId);
      return profile;
    },
  });

  // Fetch activity log (history and comments)
  const activityQuery = useQuery({
    queryKey: [QUERY_KEYS.ACTIVITY_LOG, cardId],
    enabled: !!cardId,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const entries = await activityLogService.getCardEntries(cardId);
      console.log('🔍 Fetched activity log:', cardId, 'count:', entries.length);
      return entries;
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CARD_PROFILE, profileId] });
    },
  });

  // Mutation: Add comment
  // Uses current user info from useCurrentUser hook for record keeping
  // Includes userPhoto for displaying avatars alongside comments
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      // Use real user ID, name, and photo from auth
      return activityLogService.addComment(cardId, userId, userName, content, userPhoto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACTIVITY_LOG, cardId] });
    },
  });

  // Mutation: Add history entry
  // Uses current user info from useCurrentUser hook for record keeping
  // Includes userName and userPhoto for audit trail
  const addHistoryMutation = useMutation({
    mutationFn: async (content: string) => {
      // Use real user ID, name, and photo from auth
      return activityLogService.addHistory(cardId, userId, content, userName, userPhoto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACTIVITY_LOG, cardId] });
    },
  });

  // Combined loading state
  const isLoading = cardQuery.isLoading || profileQuery.isLoading || activityQuery.isLoading;

  // Combined error state
  const isError = cardQuery.isError || profileQuery.isError || activityQuery.isError;
  const error = cardQuery.error || profileQuery.error || activityQuery.error;

  return {
    // Data
    card: cardQuery.data || null,
    profile: profileQuery.data || null,
    activityLog: activityQuery.data || [],
    
    // Loading states
    isLoading,
    isCardLoading: cardQuery.isLoading,
    isProfileLoading: profileQuery.isLoading,
    isActivityLoading: activityQuery.isLoading,
    
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
    refetchActivity: () => activityQuery.refetch(),
  };
}

// Legacy aliases for backwards compatibility
/** @deprecated Use activityLog instead of actions */
export type { UseExpandedCardResult };
