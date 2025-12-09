/**
 * TypeScript interfaces for the Kanban database collections
 * 
 * These types map to three Wix Data Collections:
 * - KanbanCards: Main card data linked to CRM contacts
 * - CardActions: History and comments for each card
 * - ClientProfiles: Extended client information
 */

// Re-export the workflow stages from useContacts for consistency
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

/**
 * Marketing pipeline structure for active and available campaigns
 */
export interface MarketingPipelines {
  active: Array<{
    id: string;
    name: string;
    status: string;
  }>;
  available: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}

/**
 * Qualification form data structure
 */
export interface FormDataItem {
  questionId: string;
  question: string;
  answer: string;
  answeredAt?: string;
}

/**
 * Tender submission structure
 */
export interface Tender {
  id: string;
  submittedAt: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  notes?: string;
}

/**
 * Quote generation data structure
 */
export interface QuoteData {
  id?: string;
  generatedAt?: string;
  amount?: number;
  validUntil?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

/**
 * KanbanCard - Main card data stored in the KanbanCards collection
 * Links to CRM contacts via contactId
 */
export interface KanbanCard {
  // Meta fields (auto-managed by Wix)
  _id?: string;
  _createdDate?: string;
  _updatedDate?: string;
  
  // Reference to CRM contact
  contactId: string;
  
  // Stage/workflow fields
  stageId: ContactStatus;
  stage: string;
  
  // Summary fields
  callBackAppointmentDate?: string;
  nextAppointment?: string | null;
  readinessLevel?: number;
  financeStatus?: string;
  interestTags?: string[];
  assessmentStatus?: string;
  debriefDate?: string;
  
  // Communications
  notes?: string;
  marketingPipelines?: MarketingPipelines;
  
  // Qualification
  tags?: string[];
  formData?: FormDataItem[];
  
  // Assessment/Portals
  partnerPortalRef?: string;
  clientPortalRef?: string;
  externalAssessmentStatus?: string;
  externalClientStatus?: string;
  
  // Sales Utils
  tenders?: Tender[];
  quotes?: QuoteData;
  
  // Sales
  invoiceRef?: string;
  approvalStatus?: 'pending' | 'go' | 'no-go';
  
  // Milestones (Terms & Conditions)
  financeTC?: boolean;
  installationTC?: boolean;
  projectCompleteTC?: boolean;
}

/**
 * Action types for the CardActions collection
 */
export type ActionType = 'history' | 'comment';

/**
 * Metadata for history actions - tracks what changed
 */
export interface HistoryMetadata {
  field?: string;
  oldValue?: string;
  newValue?: string;
  action?: string;
}

/**
 * Metadata for comments - tracks thread info
 */
export interface CommentMetadata {
  parentId?: string;
  boardId?: string;
  boardName?: string;
  isFromExternalBoard?: boolean;
}

/**
 * CardAction - Represents a history entry or comment on a card
 * Stored in the CardActions collection
 */
export interface CardAction {
  // Meta fields (auto-managed by Wix)
  _id?: string;
  _createdDate?: string;
  
  // Reference to parent card
  cardId: string;
  
  // Action type distinguishes between history and comments
  actionType: ActionType;
  
  // Main content of the action
  content: string;
  
  // Who performed this action
  userId: string;
  userName?: string;
  
  // Additional data based on actionType
  metadata?: HistoryMetadata | CommentMetadata;
}

/**
 * ClientInfo - Core client information from CRM
 */
export interface ClientInfo {
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
}

/**
 * ExtendedDetails - Additional client details beyond CRM data
 */
export interface ExtendedDetails {
  propertyType?: string;
  propertyAge?: string;
  currentEnergyCost?: number;
  preferredContactMethod?: string;
  notes?: string;
  customFields?: Record<string, string | number | boolean>;
}

/**
 * ClientProfile - Extended client information
 * Stored in the ClientProfiles collection
 */
export interface ClientProfile {
  // Meta fields (auto-managed by Wix)
  _id?: string;
  _createdDate?: string;
  _updatedDate?: string;
  
  // References
  cardId: string;
  contactId: string;
  
  // Client data
  clientInfo: ClientInfo;
  extendedDetails: ExtendedDetails;
}

/**
 * Collection names for Wix Data operations
 */
export const COLLECTIONS = {
  KANBAN_CARDS: 'KanbanCards',
  CARD_ACTIONS: 'CardActions',
  CLIENT_PROFILES: 'ClientProfiles',
} as const;

/**
 * Helper type for creating new cards (without auto-generated fields)
 */
export type NewKanbanCard = Omit<KanbanCard, '_id' | '_createdDate' | '_updatedDate'>;

/**
 * Helper type for creating new actions (without auto-generated fields)
 */
export type NewCardAction = Omit<CardAction, '_id' | '_createdDate'>;

/**
 * Helper type for creating new profiles (without auto-generated fields)
 */
export type NewClientProfile = Omit<ClientProfile, '_id' | '_createdDate' | '_updatedDate'>;

