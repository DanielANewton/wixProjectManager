/**
 * CRM Service - Frontend wrapper for CRM Web Methods
 * 
 * This service provides a clean interface to the backend CRM operations.
 * It imports and calls the Web Methods defined in src/backend/crm.web.js
 * 
 * Used by the Import Dashboard to query CRM contacts and labels
 * for selecting which contacts to import into ClientProfiles.
 * 
 * Data Flow: CRM Contacts -> Import Dashboard -> ClientProfiles -> KanbanCards
 */

import {
  queryLabels as backendQueryLabels,
  queryContactsByLabel as backendQueryContactsByLabel,
  queryAllContacts as backendQueryAllContacts,
} from '../../backend/crm.web.js';

/**
 * Represents a CRM label for filtering contacts
 */
export interface CrmLabel {
  key: string;
  displayName: string;
  labelType: string;
}

/**
 * Represents a CRM contact for the import flow
 */
export interface CrmContact {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  labelKeys?: string[];
  _createdDate?: string;
}

/**
 * Fetches all available CRM labels for the label filter dropdown
 * 
 * Labels allow users to categorize contacts. This returns all available
 * labels so users can select which group of contacts to import.
 * 
 * @returns Array of CRM labels
 */
export async function getLabels(): Promise<CrmLabel[]> {
  try {
    const result = await backendQueryLabels();
    
    if (result?.success && result?.data?.labels) {
      console.log('🏷️ Fetched CRM labels:', result.data.labels.length);
      return result.data.labels as CrmLabel[];
    }
    
    console.warn('🏷️ No labels returned from backend');
    return [];
  } catch (error) {
    console.error('🏷️ Error fetching labels:', error);
    return [];
  }
}

/**
 * Queries CRM contacts filtered by a specific label key
 * 
 * @param labelKey - The label key to filter contacts by
 * @returns Array of contacts that have the specified label
 */
export async function getContactsByLabel(labelKey: string): Promise<CrmContact[]> {
  try {
    if (!labelKey || labelKey.trim() === '') {
      console.warn('🏷️ No label key provided');
      return [];
    }
    
    const result = await backendQueryContactsByLabel(labelKey);
    
    if (result?.success && result?.data?.contacts) {
      console.log('📇 Fetched contacts by label:', result.data.contacts.length);
      return result.data.contacts as CrmContact[];
    }
    
    console.warn('📇 No contacts returned from backend');
    return [];
  } catch (error) {
    console.error('📇 Error fetching contacts by label:', error);
    return [];
  }
}

/**
 * Fetches all CRM contacts without any label filter
 * 
 * Useful for importing all contacts or when no specific label is selected.
 * 
 * @returns Array of all contacts (limited to 100)
 */
export async function getAllContacts(): Promise<CrmContact[]> {
  try {
    const result = await backendQueryAllContacts();
    
    if (result?.success && result?.data?.contacts) {
      console.log('📇 Fetched all contacts:', result.data.contacts.length);
      return result.data.contacts as CrmContact[];
    }
    
    console.warn('📇 No contacts returned from backend');
    return [];
  } catch (error) {
    console.error('📇 Error fetching all contacts:', error);
    return [];
  }
}

/**
 * Gets the display name for a contact
 * 
 * Helper function to format a contact's name for display.
 * Falls back to email or 'Unknown Contact' if no name is available.
 * 
 * @param contact - The CRM contact
 * @returns Formatted display name
 */
export function getContactDisplayName(contact: CrmContact): string {
  const firstName = contact.firstName || '';
  const lastName = contact.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  
  if (fullName) return fullName;
  if (contact.email) return contact.email;
  return 'Unknown Contact';
}

