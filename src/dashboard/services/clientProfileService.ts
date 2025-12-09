/**
 * Client Profile Service - CRUD operations for the ClientProfiles collection
 * 
 * This service handles extended client information:
 * - Creating client profiles linked to cards and contacts
 * - Fetching profile data
 * - Updating client information
 */

import { items } from '@wix/data';
import { 
  ClientProfile, 
  NewClientProfile, 
  ClientInfo,
  ExtendedDetails,
  COLLECTIONS,
} from '../types/kanbanCard.js';

/**
 * Creates a new client profile linked to a card and contact
 * 
 * @param profile - The profile data to insert
 * @returns The created profile with _id and timestamps
 */
export async function createProfile(profile: NewClientProfile): Promise<ClientProfile> {
  try {
    const result = await items.insertDataItemReference({
      dataCollectionId: COLLECTIONS.CLIENT_PROFILES,
      dataItem: {
        data: profile,
      },
    });
    
    console.log('👤 Profile created:', result.dataItem?._id);
    return result.dataItem?.data as ClientProfile;
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
    const result = await items.getDataItem(profileId, {
      dataCollectionId: COLLECTIONS.CLIENT_PROFILES,
    });
    
    return result.dataItem?.data as ClientProfile || null;
  } catch (error) {
    console.error('👤 Error fetching profile:', error);
    return null;
  }
}

/**
 * Fetches a profile by its associated card ID
 * 
 * @param cardId - The Kanban card ID
 * @returns The profile data or null if not found
 */
export async function getProfileByCardId(cardId: string): Promise<ClientProfile | null> {
  try {
    const result = await items.queryDataItems({
      dataCollectionId: COLLECTIONS.CLIENT_PROFILES,
      query: {
        filter: { cardId },
        paging: { limit: 1 },
      },
    });
    
    const profile = result.dataItems?.[0]?.data as ClientProfile;
    return profile || null;
  } catch (error) {
    console.error('👤 Error fetching profile by card:', error);
    return null;
  }
}

/**
 * Fetches a profile by its associated contact ID
 * 
 * @param contactId - The CRM contact ID
 * @returns The profile data or null if not found
 */
export async function getProfileByContactId(contactId: string): Promise<ClientProfile | null> {
  try {
    const result = await items.queryDataItems({
      dataCollectionId: COLLECTIONS.CLIENT_PROFILES,
      query: {
        filter: { contactId },
        paging: { limit: 1 },
      },
    });
    
    const profile = result.dataItems?.[0]?.data as ClientProfile;
    return profile || null;
  } catch (error) {
    console.error('👤 Error fetching profile by contact:', error);
    return null;
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
  updates: Partial<ClientProfile>
): Promise<ClientProfile | null> {
  try {
    const existing = await getProfileById(profileId);
    if (!existing) {
      console.error('👤 Profile not found for update:', profileId);
      return null;
    }
    
    const updatedData = { ...existing, ...updates };
    
    const result = await items.updateDataItem(profileId, {
      dataCollectionId: COLLECTIONS.CLIENT_PROFILES,
      dataItem: {
        _id: profileId,
        data: updatedData,
      },
    });
    
    console.log('👤 Profile updated:', profileId);
    return result.dataItem?.data as ClientProfile;
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
  const existing = await getProfileById(profileId);
  if (!existing) return null;
  
  return updateProfile(profileId, {
    clientInfo: { ...existing.clientInfo, ...clientInfo },
  });
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
  const existing = await getProfileById(profileId);
  if (!existing) return null;
  
  return updateProfile(profileId, {
    extendedDetails: { ...existing.extendedDetails, ...extendedDetails },
  });
}

/**
 * Creates or updates a profile for a card
 * If a profile already exists for the card, it updates it
 * Otherwise, it creates a new profile
 * 
 * @param cardId - The Kanban card ID
 * @param contactId - The CRM contact ID
 * @param clientInfo - Client information
 * @param extendedDetails - Extended details
 * @returns The created or updated profile
 */
export async function upsertProfile(
  cardId: string,
  contactId: string,
  clientInfo: ClientInfo,
  extendedDetails: ExtendedDetails = {}
): Promise<ClientProfile | null> {
  try {
    const existingProfile = await getProfileByCardId(cardId);
    
    if (existingProfile && existingProfile._id) {
      return updateProfile(existingProfile._id, {
        clientInfo,
        extendedDetails,
      });
    } else {
      const newProfile: NewClientProfile = {
        cardId,
        contactId,
        clientInfo,
        extendedDetails,
      };
      return createProfile(newProfile);
    }
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
    await items.removeDataItem(profileId, {
      dataCollectionId: COLLECTIONS.CLIENT_PROFILES,
    });
    
    console.log('👤 Profile deleted:', profileId);
    return true;
  } catch (error) {
    console.error('👤 Error deleting profile:', error);
    return false;
  }
}

/**
 * Deletes a profile by its card ID
 * 
 * @param cardId - The card ID whose profile should be deleted
 * @returns True if deletion was successful
 */
export async function deleteProfileByCardId(cardId: string): Promise<boolean> {
  try {
    const profile = await getProfileByCardId(cardId);
    if (profile && profile._id) {
      return deleteProfile(profile._id);
    }
    return true; // No profile to delete
  } catch (error) {
    console.error('👤 Error deleting profile by card:', error);
    return false;
  }
}

