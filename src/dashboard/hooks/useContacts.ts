import { contacts } from '@wix/crm';
import { useQuery } from '@tanstack/react-query';

/**
 * useContacts - Hook to fetch contacts from Wix CRM
 * 
 * This hook retrieves all contacts from the Wix CRM and transforms them
 * into a format suitable for the Kanban board.
 * 
 * Each contact is mapped to a card with:
 * - id: The contact's unique ID
 * - title: The contact's display name (first + last name)
 * - description: The contact's primary email
 * - priority: Derived from labels or defaults to 'medium'
 * - status: Used to determine which column the card belongs to
 */

export const QUERY_CONTACTS = 'queryContacts';

// Status options for categorizing contacts in Kanban columns
export type ContactStatus = 'todo' | 'in-progress' | 'done';

// Structure of a contact card for the Kanban board
export interface ContactCard {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: ContactStatus;
  email?: string;
  phone?: string;
}

/**
 * Determines the status (column) for a contact based on their labels
 * You can customize this logic based on your CRM setup
 */
function determineStatus(contact: contacts.Contact): ContactStatus {
  const labelKeys = contact.info?.labelKeys?.items || [];
  
  // Check for specific labels to determine status
  // These label keys can be customized based on your CRM labels
  if (labelKeys.some((label: string) => 
    label.toLowerCase().includes('done') || 
    label.toLowerCase().includes('converted') ||
    label.toLowerCase().includes('completed')
  )) {
    return 'done';
  }
  
  if (labelKeys.some((label: string) => 
    label.toLowerCase().includes('progress') || 
    label.toLowerCase().includes('active') ||
    label.toLowerCase().includes('working')
  )) {
    return 'in-progress';
  }
  
  // Default to 'todo' for new/unprocessed contacts
  return 'todo';
}

/**
 * Determines the priority of a contact based on labels or other criteria
 */
function determinePriority(contact: contacts.Contact): 'low' | 'medium' | 'high' {
  const labelKeys = contact.info?.labelKeys?.items || [];
  
  if (labelKeys.some((label: string) => 
    label.toLowerCase().includes('high') || 
    label.toLowerCase().includes('urgent') ||
    label.toLowerCase().includes('vip')
  )) {
    return 'high';
  }
  
  if (labelKeys.some((label: string) => 
    label.toLowerCase().includes('low')
  )) {
    return 'low';
  }
  
  return 'medium';
}

/**
 * Transforms a Wix CRM contact into a Kanban card
 */
function transformContactToCard(contact: contacts.Contact): ContactCard {
  const firstName = contact.info?.name?.first || '';
  const lastName = contact.info?.name?.last || '';
  const displayName = `${firstName} ${lastName}`.trim() || 'Unknown Contact';
  
  // Get primary email
  const primaryEmail = contact.info?.emails?.items?.[0]?.email;
  
  // Get primary phone
  const primaryPhone = contact.info?.phones?.items?.[0]?.phone;
  
  return {
    id: contact._id || `contact-${Date.now()}`,
    title: displayName,
    description: primaryEmail || primaryPhone || 'No contact info',
    priority: determinePriority(contact),
    status: determineStatus(contact),
    email: primaryEmail,
    phone: primaryPhone,
  };
}

/**
 * Main hook to fetch and transform CRM contacts
 * Returns loading state, error state, and transformed contact cards
 */
export function useContacts() {
  const query = useQuery({
    queryKey: [QUERY_CONTACTS],
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<ContactCard[]> => {
      try {
        // Fetch contacts from Wix CRM
        // listContacts returns up to 1000 contacts per request
        const response = await contacts.listContacts({
          // Optional: Add paging for large contact lists
          // paging: { limit: 100, offset: 0 }
        });
        
        // Transform each contact into a Kanban card
        const contactCards = (response.contacts || []).map(transformContactToCard);
        
        console.log('📇 Fetched contacts:', contactCards.length);
        return contactCards;
      } catch (error) {
        console.error('📇 Error fetching contacts:', error);
        throw error;
      }
    },
  });

  return {
    contacts: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

