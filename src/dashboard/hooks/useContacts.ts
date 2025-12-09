import { contacts } from '@wix/crm';
import { useQuery } from '@tanstack/react-query';

/**
 * useContacts - Hook to fetch contacts from Wix CRM
 * 
 * This hook retrieves all contacts from the Wix CRM and transforms them
 * into a format suitable for the YorProject Kanban board with 17 workflow stages.
 * 
 * Each contact is mapped to a card with:
 * - id: The contact's unique ID
 * - title: The contact's display name (first + last name)
 * - description: The contact's primary email
 * - priority: Derived from labels or defaults to 'medium'
 * - status: Used to determine which column the card belongs to
 */

export const QUERY_CONTACTS = 'queryContacts';

// YorProject Workflow stages - 17 stages for the customer journey
export type ContactStatus = 
  | 'engage'
  | 'intent'
  | 'engagement'
  | 'advice-call'
  | 'qualification'
  | 'straight-to-quote'
  | 'routing-pqq'
  | 'booking'
  | 'assessment-undertaken'
  | 'assessment-completed'
  | 'sales-pitch'
  | 'tender-quote'
  | 'supplier-survey'
  | 'go-no-go'
  | 'finance-payment'
  | 'installation'
  | 'project-completion';

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
 * Label to stage mapping - maps CRM labels to workflow stages
 * Add your CRM labels here to automatically place contacts in the right stage
 */
const labelToStageMap: Record<string, ContactStatus> = {
  // Stage 1: Engage - Early interest
  'newsletter': 'engage',
  'calculator': 'engage',
  'plan-builder': 'engage',
  'esc': 'engage',
  'energy-saving': 'engage',
  
  // Stage 2: Intent
  'intent': 'intent',
  'nurture': 'intent',
  
  // Stage 3: Engagement - Formal enquiry
  'enquiry': 'engagement',
  'form-submitted': 'engagement',
  'callback-requested': 'engagement',
  
  // Stage 4: Advice Call
  'advice-call': 'advice-call',
  'adviser-call': 'advice-call',
  'needs-assessment': 'advice-call',
  
  // Stage 5: Qualification
  'qualification': 'qualification',
  'qualified': 'qualification',
  
  // Stage 6: Straight to Quote
  'straight-to-quote': 'straight-to-quote',
  'simple-measure': 'straight-to-quote',
  'solar': 'straight-to-quote',
  'windows': 'straight-to-quote',
  
  // Stage 7: Routing / PQQ
  'routing': 'routing-pqq',
  'pqq': 'routing-pqq',
  'pre-screen': 'routing-pqq',
  
  // Stage 8: Booking
  'booking': 'booking',
  'assessment-booked': 'booking',
  
  // Stage 9: Assessment Undertaken
  'assessment-undertaken': 'assessment-undertaken',
  'assessment-in-progress': 'assessment-undertaken',
  
  // Stage 10: Assessment Completed
  'assessment-completed': 'assessment-completed',
  'report-received': 'assessment-completed',
  
  // Stage 11: Sales Pitch
  'sales-pitch': 'sales-pitch',
  'presentation': 'sales-pitch',
  
  // Stage 12: Tender / Quote
  'tender': 'tender-quote',
  'quote': 'tender-quote',
  'proposal': 'tender-quote',
  
  // Stage 13: Supplier Survey
  'supplier-survey': 'supplier-survey',
  'survey': 'supplier-survey',
  
  // Stage 14: Go / No Go
  'go-no-go': 'go-no-go',
  'approved': 'go-no-go',
  'contract': 'go-no-go',
  
  // Stage 15: Finance & Payment
  'finance': 'finance-payment',
  'payment': 'finance-payment',
  
  // Stage 16: Installation
  'installation': 'installation',
  'installing': 'installation',
  
  // Stage 17: Project Completion
  'completed': 'project-completion',
  'done': 'project-completion',
  'finished': 'project-completion',
};

/**
 * Determines the workflow stage for a contact based on their labels
 * Checks labels against the mapping, defaults to 'engage' for new contacts
 */
function determineStatus(contact: contacts.Contact): ContactStatus {
  const labelKeys = contact.info?.labelKeys?.items || [];
  
  // Check each label against our mapping
  for (const label of labelKeys) {
    const normalizedLabel = (label as string).toLowerCase().replace(/\s+/g, '-');
    
    // Direct match
    if (labelToStageMap[normalizedLabel]) {
      return labelToStageMap[normalizedLabel];
    }
    
    // Partial match - check if label contains any of our keywords
    for (const [keyword, stage] of Object.entries(labelToStageMap)) {
      if (normalizedLabel.includes(keyword)) {
        return stage;
      }
    }
  }
  
  // Default to 'engage' for new/untagged contacts
  return 'engage';
}

/**
 * Determines the priority of a contact based on labels or other criteria
 */
function determinePriority(contact: contacts.Contact): 'low' | 'medium' | 'high' {
  const labelKeys = contact.info?.labelKeys?.items || [];
  
  if (labelKeys.some((label: string) => 
    label.toLowerCase().includes('high') || 
    label.toLowerCase().includes('urgent') ||
    label.toLowerCase().includes('vip') ||
    label.toLowerCase().includes('priority')
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
