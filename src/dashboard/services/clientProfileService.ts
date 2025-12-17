/**
 * Client Profile Service - Frontend wrapper for profile Web Methods
 * 
 * This service provides a clean interface to the backend profile operations.
 * It imports and calls the Web Methods defined in src/backend/profiles.web.js
 * 
 * Data Flow: CRM Contact -> ClientProfiles -> KanbanCards -> ActivityLog
 */

import {
  createProfile as backendCreateProfile,
  getProfileById as backendGetProfileById,
  getProfileByContactId as backendGetProfileByContactId,
  getAllProfiles as backendGetAllProfiles,
  updateProfile as backendUpdateProfile,
  updateClientInfo as backendUpdateClientInfo,
  deleteProfile as backendDeleteProfile,
  upsertProfile as backendUpsertProfile,
} from '../../backend/profiles.web.js';

import { 
  ClientProfile, 
  NewClientProfile, 
  ClientInfo,
  ExtendedDetails,
} from '../types/kanbanCard.js';

/**
 * Creates a new client profile linked to a CRM contact
 * 
 * @param profile - The profile data to create
 * @returns The created profile with _id and timestamps
 */
export async function createProfile(profile: NewClientProfile): Promise<ClientProfile | null> {
  try {
    const result = await backendCreateProfile({
      contactId: profile.contactId,
      clientInfo: profile.clientInfo,
      extendedDetails: profile.extendedDetails,
    });
    
    return result?.data as ClientProfile || null;
  } catch (error) {
    console.error('👤 Error creating profile:', error);
    throw error;
  }
}

/**
 * Fetches a profile by its ID
 * 
 * @param profileId - The unique profile ID
 * @returns The profile data or null if not found
 */
export async function getProfileById(profileId: string): Promise<ClientProfile | null> {
  try {
    const result = await backendGetProfileById(profileId);
    return result?.data as ClientProfile || null;
  } catch (error) {
    console.error('👤 Error fetching profile:', error);
    return null;
  }
}

/**
 * Fetches a profile by its associated CRM contact ID
 * 
 * @param contactId - The CRM contact ID
 * @returns The profile data or null if not found
 */
export async function getProfileByContactId(contactId: string): Promise<ClientProfile | null> {
  try {
    const result = await backendGetProfileByContactId(contactId);
    return result?.data as ClientProfile || null;
  } catch (error) {
    console.error('👤 Error fetching profile by contact:', error);
    return null;
  }
}

/**
 * Fetches all client profiles
 * 
 * @returns Array of all profiles
 */
export async function getAllProfiles(): Promise<ClientProfile[]> {
  try {
    const results = await backendGetAllProfiles();
    return (results || []).map(item => item.data as ClientProfile);
  } catch (error) {
    console.error('👤 Error fetching all profiles:', error);
    return [];
  }
}

/**
 * Updates an existing profile with new data
 * 
 * @param profileId - The ID of the profile to update
 * @param updates - Partial profile data to merge
 * @returns The updated profile
 */
export async function updateProfile(
  profileId: string,
  updates: Partial<NewClientProfile>
): Promise<ClientProfile | null> {
  try {
    const result = await backendUpdateProfile(profileId, updates);
    return result?.data as ClientProfile || null;
  } catch (error) {
    console.error('👤 Error updating profile:', error);
    throw error;
  }
}

/**
 * Updates just the client info portion of a profile
 * 
 * @param profileId - The profile ID
 * @param clientInfo - Updated client info
 * @returns The updated profile
 */
export async function updateClientInfo(
  profileId: string,
  clientInfo: Partial<ClientInfo>
): Promise<ClientProfile | null> {
  try {
    const result = await backendUpdateClientInfo(profileId, clientInfo);
    return result?.data as ClientProfile || null;
  } catch (error) {
    console.error('👤 Error updating client info:', error);
    throw error;
  }
}

/**
 * Updates just the extended details portion of a profile
 * 
 * @param profileId - The profile ID
 * @param extendedDetails - Updated extended details
 * @returns The updated profile
 */
export async function updateExtendedDetails(
  profileId: string,
  extendedDetails: Partial<ExtendedDetails>
): Promise<ClientProfile | null> {
  try {
    const result = await backendUpdateProfile(profileId, { extendedDetails });
    return result?.data as ClientProfile || null;
  } catch (error) {
    console.error('👤 Error updating extended details:', error);
    throw error;
  }
}

/**
 * Creates or updates a profile for a contact
 * 
 * @param contactId - The CRM contact ID
 * @param clientInfo - Client information
 * @param extendedDetails - Extended details (optional)
 * @returns The created or updated profile
 */
export async function upsertProfile(
  contactId: string,
  clientInfo: ClientInfo,
  extendedDetails: ExtendedDetails = {}
): Promise<ClientProfile | null> {
  try {
    const result = await backendUpsertProfile(contactId, {
      clientInfo,
      extendedDetails,
    });
    return result?.data as ClientProfile || null;
  } catch (error) {
    console.error('👤 Error upserting profile:', error);
    throw error;
  }
}

/**
 * Deletes a profile by its ID
 * 
 * @param profileId - The profile ID to delete
 * @returns True if deletion was successful
 */
export async function deleteProfile(profileId: string): Promise<boolean> {
  try {
    return await backendDeleteProfile(profileId);
  } catch (error) {
    console.error('👤 Error deleting profile:', error);
    return false;
  }
}
