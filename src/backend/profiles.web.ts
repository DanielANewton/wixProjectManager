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
 * Input type for creating a new profile
 */
interface CreateProfileInput {
  contactId: string;
  clientInfo: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      postcode?: string;
      country?: string;
    };
    company?: string;
    jobTitle?: string;
  };
  extendedDetails?: {
    propertyType?: string;
    propertyAge?: string;
    currentEnergyCost?: number;
    preferredContactMethod?: string;
    notes?: string;
    customFields?: Record<string, string | number | boolean>;
  };
}

/**
 * Creates a new ClientProfile linked to a CRM contact
 */
export const createProfile = webMethod(
  Permissions.Anyone,
  async (profileData: CreateProfileInput) => {
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
 */
export const getProfileById = webMethod(
  Permissions.Anyone,
  async (profileId: string) => {
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
 */
export const getProfileByContactId = webMethod(
  Permissions.Anyone,
  async (contactId: string) => {
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
 */
export const getAllProfiles = webMethod(
  Permissions.Anyone,
  async () => {
    try {
      console.log('👤 Attempting to fetch from collection:', COLLECTION_ID);
      const result = await items.query(COLLECTION_ID).find();
      
      console.log('👤 Fetched all profiles:', result.items?.length || 0);
      return result.items || [];
    } catch (error: any) {
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
 */
export const updateProfile = webMethod(
  Permissions.Anyone,
  async (profileId: string, updates: Partial<CreateProfileInput>) => {
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
 */
export const updateClientInfo = webMethod(
  Permissions.Anyone,
  async (profileId: string, clientInfo: Partial<CreateProfileInput['clientInfo']>) => {
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
 */
export const deleteProfile = webMethod(
  Permissions.Anyone,
  async (profileId: string) => {
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
 */
export const upsertProfile = webMethod(
  Permissions.Anyone,
  async (contactId: string, profileData: Omit<CreateProfileInput, 'contactId'>) => {
    try {
      // Check if profile exists for this contact
      const existingResult = await items.query(COLLECTION_ID)
        .eq('contactId', contactId)
        .limit(1)
        .find();
      
      const existing = existingResult.items?.[0];
      
      if (existing) {
        // Update existing profile
        const updatedData = {
          ...existing,
          ...profileData,
          contactId,
          _id: existing._id // Ensure ID is preserved
        };
        
        const result = await items.update(COLLECTION_ID, updatedData);
        
        return result;
      } else {
        // Create new profile
        const result = await items.insert(COLLECTION_ID, {
          contactId,
          ...profileData,
        });
        
        return result;
      }
    } catch (error) {
      console.error('👤 Error upserting profile:', error);
      throw error;
    }
  }
);
