/**
 * ClientProfiles Web Methods - Backend CRUD operations
 * 
 * These web methods handle all database operations for ClientProfiles.
 * ClientProfiles are the primary link between CRM contacts and the app.
 * 
 * Data Flow: CRM Contact -> ClientProfile -> KanbanCards -> ActivityLog
 */

import { webMethod, Permissions } from '@wix/web-methods';
import { items } from '@wix/data';

// Full namespaced collection ID for app collection
const COLLECTION_ID = '@daniel02231/project-manager-v0/ClientProfiles';

/**
 * Creates a new ClientProfile linked to a CRM contact
 * 
 * @param profileData - The profile data to create
 * @returns The created profile with _id and timestamps
 */
export const createProfile = webMethod(
  Permissions.Anyone,
  async (profileData) => {
    try {
      const result = await items.insert(COLLECTION_ID, {
        ...profileData,
        extendedDetails: profileData.extendedDetails || {},
      });
      
      console.log('👤 Profile created:', result._id);
      return result;
    } catch (error) {
      console.error('👤 Error creating profile:', error);
      throw error;
    }
  }
);

/**
 * Fetches a profile by its ID
 * 
 * @param profileId - The unique profile ID
 * @returns The profile data or null if not found
 */
export const getProfileById = webMethod(
  Permissions.Anyone,
  async (profileId) => {
    try {
      const result = await items.get(COLLECTION_ID, profileId);
      return result;
    } catch (error) {
      console.error('👤 Error fetching profile:', error);
      return null;
    }
  }
);

/**
 * Fetches a profile by CRM contact ID
 * 
 * @param contactId - The CRM contact ID
 * @returns The profile data or null if not found
 */
export const getProfileByContactId = webMethod(
  Permissions.Anyone,
  async (contactId) => {
    try {
      const result = await items.query(COLLECTION_ID)
        .eq('contactId', contactId)
        .limit(1)
        .find();
      
      return result.items?.[0] || null;
    } catch (error) {
      console.error('👤 Error fetching profile by contact:', error);
      return null;
    }
  }
);

/**
 * Fetches all profiles
 * 
 * @returns Array of all profiles
 */
export const getAllProfiles = webMethod(
  Permissions.Anyone,
  async () => {
    try {
      console.log('👤 Attempting to fetch from collection:', COLLECTION_ID);
      const result = await items.query(COLLECTION_ID).find();
      
      console.log('👤 Fetched all profiles:', result.items?.length || 0);
      return result.items || [];
    } catch (error) {
      console.error('👤 Error fetching all profiles:', JSON.stringify({
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
 * Updates a profile by ID
 * 
 * @param profileId - The ID of the profile to update
 * @param updates - Partial profile data to merge
 * @returns The updated profile
 */
export const updateProfile = webMethod(
  Permissions.Anyone,
  async (profileId, updates) => {
    try {
      // First fetch existing profile
      const existing = await items.get(COLLECTION_ID, profileId);
      
      if (!existing) {
        console.error('👤 Profile not found for update:', profileId);
        return null;
      }
      
      // Merge updates with existing data
      const updatedData = {
        ...existing,
        ...updates,
        _id: profileId // Ensure ID is preserved
      };
      
      const result = await items.update(COLLECTION_ID, updatedData);
      
      console.log('👤 Profile updated:', profileId);
      return result;
    } catch (error) {
      console.error('👤 Error updating profile:', error);
      throw error;
    }
  }
);

/**
 * Updates just the clientInfo portion of a profile
 * 
 * @param profileId - The profile ID
 * @param clientInfo - Updated client info
 * @returns The updated profile
 */
export const updateClientInfo = webMethod(
  Permissions.Anyone,
  async (profileId, clientInfo) => {
    try {
      const existing = await items.get(COLLECTION_ID, profileId);
      
      if (!existing) return null;
      
      const updatedData = {
        ...existing,
        clientInfo: {
          ...existing.clientInfo,
          ...clientInfo,
        },
        _id: profileId // Ensure ID is preserved
      };
      
      const result = await items.update(COLLECTION_ID, updatedData);
      
      return result;
    } catch (error) {
      console.error('👤 Error updating client info:', error);
      throw error;
    }
  }
);

/**
 * Deletes a profile by ID
 * 
 * @param profileId - The profile ID to delete
 * @returns True if deletion was successful
 */
export const deleteProfile = webMethod(
  Permissions.Anyone,
  async (profileId) => {
    try {
      await items.remove(COLLECTION_ID, profileId);
      
      console.log('👤 Profile deleted:', profileId);
      return true;
    } catch (error) {
      console.error('👤 Error deleting profile:', error);
      return false;
    }
  }
);

/**
 * Creates or updates a profile for a contact (upsert)
 * 
 * @param contactId - The CRM contact ID
 * @param profileData - The profile data (without contactId)
 * @returns The created or updated profile
 */
export const upsertProfile = webMethod(
  Permissions.Anyone,
  async (contactId, profileData) => {
    try {
      console.log('👤 Upsert profile start', { contactId, hasClientInfo: !!profileData?.clientInfo });

      // Check if profile exists for this contact
      const existingResult = await items.query(COLLECTION_ID)
        .eq('contactId', contactId)
        .limit(1)
        .find();
      
      const existing = existingResult.items?.[0];
      
      if (existing) {
        console.log('👤 Upsert profile: updating existing', { contactId, profileId: existing._id });
        // Update existing profile
        const updatedData = {
          ...existing,
          ...profileData,
          contactId,
          _id: existing._id // Ensure ID is preserved
        };
        
        const result = await items.update(COLLECTION_ID, updatedData);
        
        console.log('👤 Upsert profile: updated', { profileId: result?._id });
        return result;
      } else {
        console.log('👤 Upsert profile: creating new', { contactId });
        // Create new profile
        const result = await items.insert(COLLECTION_ID, {
          contactId,
          ...profileData,
        });
        
        console.log('👤 Upsert profile: created', { profileId: result?._id });
        return result;
      }
    } catch (error) {
      console.error('👤 Error upserting profile', {
        contactId,
        message: error?.message,
        code: error?.code,
        details: error?.details,
      });
      throw error;
    }
  }
);

