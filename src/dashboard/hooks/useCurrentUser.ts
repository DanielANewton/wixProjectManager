/**
 * useCurrentUser - Hook for getting the currently logged-in dashboard user
 * 
 * This hook uses the Dashboard SDK authentication strategy to get the current
 * user's profile. This is the correct approach for dashboard pages in Wix CLI apps.
 * 
 * Uses createClient with dashboard.host() and dashboard.auth() to authenticate,
 * then calls members.getCurrentMember() to get full member details.
 * 
 * Returns:
 * - userId: Unique identifier for record keeping
 * - userName: Display name (nickname preferred, then full name, then email)
 * - userPhoto: Profile photo URL (for avatars)
 * - email: Login email
 * - isLoggedIn: Whether a member is logged in
 * - Plus additional profile fields when available
 * 
 * The data is cached for 5 minutes to avoid excessive API calls.
 */

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@wix/sdk';
// @ts-ignore - @wix/dashboard types not fully available
import { dashboard } from '@wix/dashboard';
import { members } from '@wix/members';

/**
 * User data for the current dashboard user
 */
export interface CurrentUser {
  isLoggedIn: boolean;
  userId: string;
  userName: string;
  userPhoto?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  contactId?: string;
  status?: string;
  activityStatus?: string;
  createdDate?: string;
}

/**
 * Default user data for when not logged in or loading
 */
const DEFAULT_USER: CurrentUser = {
  isLoggedIn: false,
  userId: 'anonymous',
  userName: 'Anonymous User',
};

/**
 * Query key for React Query caching
 */
export const CURRENT_USER_QUERY_KEY = ['currentUser'];

/**
 * Hook to get the currently logged-in dashboard user's profile
 * 
 * Uses Dashboard SDK authentication which works in dashboard page context.
 * 
 * Usage:
 * ```tsx
 * const { user, isLoading, isLoggedIn, userPhoto } = useCurrentUser();
 * console.log(user.userName, user.userPhoto);
 * ```
 */
export function useCurrentUser() {
  const query = useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    // Cache for 5 minutes - user doesn't change often
    staleTime: 5 * 60 * 1000,
    // Keep data when refetching
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<CurrentUser> => {
      try {
        console.log('👤 Fetching dashboard user via SDK...');
        
        // Create a WixClient configured for dashboard authentication
        // This combines app permissions with the current dashboard user's permissions
        const dashboardClient = createClient({
          host: dashboard.host(),
          auth: dashboard.auth(),
          modules: { members },
        });
        
        // Call the members API to get current member details
        const response = await (dashboardClient.members as any).getCurrentMember({
          fieldsets: ['FULL']
        });
        
        const member = response.member;
        
        if (!member) {
          console.log('👤 No member found in response');
          return DEFAULT_USER;
        }
        
        // Extract user details
        const firstName = member.contact?.firstName || '';
        const lastName = member.contact?.lastName || '';
        const nickname = member.profile?.nickname || '';
        const email = member.loginEmail || '';
        const photo = member.profile?.photo?.url || '';
        
        // Build display name: prefer nickname, then full name, then email
        let userName = nickname;
        if (!userName) {
          userName = `${firstName} ${lastName}`.trim();
        }
        if (!userName) {
          userName = email || 'Dashboard User';
        }
        
        const userData: CurrentUser = {
          isLoggedIn: true,
          userId: member._id || 'unknown',
          userName,
          userPhoto: photo,
          email,
          firstName,
          lastName,
          nickname,
          contactId: member.contactId,
          status: member.status,
          activityStatus: member.activityStatus,
          createdDate: member._createdDate,
        };
        
        console.log('👤 Dashboard user loaded:', userData.userName, 'photo:', !!userData.userPhoto);
        return userData;
      } catch (error: any) {
        console.error('👤 Error fetching dashboard user:', error.message);
        return DEFAULT_USER;
      }
    },
  });

  return {
    // The user data (with defaults if loading/error)
    user: query.data || DEFAULT_USER,
    
    // Convenience accessors
    userId: query.data?.userId || DEFAULT_USER.userId,
    userName: query.data?.userName || DEFAULT_USER.userName,
    userPhoto: query.data?.userPhoto || undefined,
    isLoggedIn: query.data?.isLoggedIn || false,
    
    // Query states
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    
    // Refetch function
    refetch: query.refetch,
  };
}

export default useCurrentUser;

