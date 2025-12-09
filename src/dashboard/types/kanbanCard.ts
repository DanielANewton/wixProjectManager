/**
 * TypeScript interfaces for the Kanban database collections
 * 
 * These types map to three Wix Data Collections:
 * - ClientProfiles: Extended client information (links to CRM)
 * - KanbanCards: Main card data (links to ClientProfiles)
 * - ActivityLog: History and comments for each card
 * 
 * Data Flow: CRM Contact -> ClientProfiles -> KanbanCards -> ActivityLog
 */

// Workflow stages for the YorProject Kanban board
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
 * PRIMARY LINK TO CRM - Stored in the ClientProfiles collection
 * 
 * One ClientProfile per CRM Contact (1:1 relationship)
 */
export interface ClientProfile {
  // Meta fields (auto-managed by Wix)
  _id?: string;
  _createdDate?: string;
  _updatedDate?: string;
  
  // Link to CRM contact (primary reference)
  contactId: string;
  
  // Client data
  clientInfo: ClientInfo;
  extendedDetails: ExtendedDetails;
}

/**
 * KanbanCard - Main card data stored in the KanbanCards collection
 * Links to ClientProfiles via profileId (many cards can belong to one profile)
 */
export interface KanbanCard {
  // Meta fields (auto-managed by Wix)
  _id?: string;
  _createdDate?: string;
  _updatedDate?: string;
  
  // Reference to ClientProfile (NEW: replaces contactId)
  profileId: string;
  
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
 * Entry types for the ActivityLog collection
 */
export type EntryType = 'history' | 'comment';

/**
 * Metadata for history entries - tracks what changed
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
 * ActivityLogEntry - Represents a history entry or comment on a card
 * Stored in the ActivityLog collection (renamed from CardAction)
 */
export interface ActivityLogEntry {
  // Meta fields (auto-managed by Wix)
  _id?: string;
  _createdDate?: string;
  
  // Reference to parent card
  cardId: string;
  
  // Entry type distinguishes between history and comments
  entryType: EntryType;
  
  // Main content of the entry
  content: string;
  
  // Who performed this action
  userId: string;
  userName?: string;
  
  // Additional data based on entryType
  metadata?: HistoryMetadata | CommentMetadata;
}

/**
 * Collection names for Wix Data operations
 */
export const COLLECTIONS = {
  CLIENT_PROFILES: 'ClientProfiles',
  KANBAN_CARDS: 'KanbanCards',
  ACTIVITY_LOG: 'ActivityLog',
} as const;

/**
 * Helper type for creating new profiles (without auto-generated fields)
 */
export type NewClientProfile = Omit<ClientProfile, '_id' | '_createdDate' | '_updatedDate'>;

/**
 * Helper type for creating new cards (without auto-generated fields)
 */
export type NewKanbanCard = Omit<KanbanCard, '_id' | '_createdDate' | '_updatedDate'>;

/**
 * Helper type for creating new activity log entries (without auto-generated fields)
 */
export type NewActivityLogEntry = Omit<ActivityLogEntry, '_id' | '_createdDate'>;

// Legacy aliases for backwards compatibility during migration
/** @deprecated Use ActivityLogEntry instead */
export type CardAction = ActivityLogEntry;
/** @deprecated Use EntryType instead */
export type ActionType = EntryType;
/** @deprecated Use NewActivityLogEntry instead */
export type NewCardAction = NewActivityLogEntry;
