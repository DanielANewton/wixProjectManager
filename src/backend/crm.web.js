/**
 * CRM Web Methods - Backend operations for CRM contacts and labels
 * 
 * This file provides web methods for querying CRM contacts and labels.
 * Used by the Import Dashboard to filter and select contacts for import.
 * 
 * Data Flow: CRM Contacts -> Import Dashboard -> ClientProfiles -> KanbanCards
 */
import { webMethod, Permissions } from '@wix/web-methods';
import { contacts, labels } from '@wix/crm';

/**
 * Fetches all available CRM labels for the label filter dropdown
 * 
 * Labels allow users to categorize contacts. This method retrieves all labels
 * so users can select which group of contacts to import.
 * 
 * @returns Object with success status, logs array, and data containing labels array
 */
export const queryLabels = webMethod(
  Permissions.Anyone,
  async () => {
    const logs = [];
    try {
      logs.push('Step 1: Starting label query');
      logs.push('Step 2: Calling labels.queryLabels()...');
      
      // Query all labels from the CRM
      const result = await labels.queryLabels().find();
      
      logs.push('Step 3: Query successful!');
      logs.push('Step 4: Labels found: ' + (result.items?.length || 0));
      
      // Transform labels into a simpler format for the frontend
      const labelList = (result.items || []).map((label) => ({
        key: label.key || '',
        displayName: label.displayName || label.key || 'Unknown',
        labelType: label.labelType || 'USER_DEFINED',
      }));
      
      return { 
        success: true, 
        logs, 
        data: { 
          labelCount: labelList.length, 
          labels: labelList 
        } 
      };
    } catch (error) {
      logs.push('ERROR: ' + error.message);
      return { 
        success: false, 
        logs, 
        error: { message: error.message, code: error.code } 
      };
    }
  }
);

/**
 * Queries CRM contacts filtered by a specific label key
 * 
 * Uses the hasSome filter on info.labelKeys to find contacts
 * that have the specified label assigned to them.
 * 
 * @param labelKey - The label key to filter contacts by
 * @returns Object with success status, logs array, and data containing contacts array
 */
export const queryContactsByLabel = webMethod(
  Permissions.Anyone,
  async (labelKey) => {
    const logs = [];
    try {
      logs.push('Step 1: Starting contact query by label');
      logs.push('Step 2: Label key: ' + labelKey);
      
      if (!labelKey || labelKey.trim() === '') {
        logs.push('ERROR: No label key provided');
        return { 
          success: false, 
          logs, 
          error: { message: 'Label key is required' } 
        };
      }
      
      logs.push('Step 3: Calling contacts.queryContacts() with hasSome filter...');
      
      // Query contacts that have the specified label
      // hasSome checks if the labelKeys array contains any of the provided values
      const result = await contacts.queryContacts()
        .hasSome('info.labelKeys', [labelKey])
        .limit(100) // Reasonable limit for import batches
        .find();
      
      logs.push('Step 4: Query successful!');
      logs.push('Step 5: Contacts found: ' + (result.items?.length || 0));
      
      // Transform contacts into a simpler format for the frontend
      const contactList = (result.items || []).map((contact) => ({
        _id: contact._id || '',
        firstName: contact.info?.name?.first || '',
        lastName: contact.info?.name?.last || '',
        email: contact.info?.emails?.items?.[0]?.email || '',
        phone: contact.info?.phones?.items?.[0]?.phone || '',
        labelKeys: contact.info?.labelKeys?.items || [],
        _createdDate: contact._createdDate || '',
      }));
      
      return { 
        success: true, 
        logs, 
        data: { 
          contactCount: contactList.length, 
          contacts: contactList 
        } 
      };
    } catch (error) {
      logs.push('ERROR: ' + error.message);
      return { 
        success: false, 
        logs, 
        error: { message: error.message, code: error.code } 
      };
    }
  }
);

/**
 * Fetches all CRM contacts without any label filter
 * 
 * Useful for importing all contacts or when no specific label is selected.
 * 
 * @returns Object with success status, logs array, and data containing contacts array
 */
export const queryAllContacts = webMethod(
  Permissions.Anyone,
  async () => {
    const logs = [];
    try {
      logs.push('Step 1: Starting query for all contacts');
      logs.push('Step 2: Calling contacts.queryContacts()...');
      
      // Query all contacts
      const result = await contacts.queryContacts()
        .limit(100) // Reasonable limit for import batches
        .find();
      
      logs.push('Step 3: Query successful!');
      logs.push('Step 4: Contacts found: ' + (result.items?.length || 0));
      
      // Transform contacts into a simpler format for the frontend
      const contactList = (result.items || []).map((contact) => ({
        _id: contact._id || '',
        firstName: contact.info?.name?.first || '',
        lastName: contact.info?.name?.last || '',
        email: contact.info?.emails?.items?.[0]?.email || '',
        phone: contact.info?.phones?.items?.[0]?.phone || '',
        labelKeys: contact.info?.labelKeys?.items || [],
        _createdDate: contact._createdDate || '',
      }));
      
      return { 
        success: true, 
        logs, 
        data: { 
          contactCount: contactList.length, 
          contacts: contactList 
        } 
      };
    } catch (error) {
      logs.push('ERROR: ' + error.message);
      return { 
        success: false, 
        logs, 
        error: { message: error.message, code: error.code } 
      };
    }
  }
);

