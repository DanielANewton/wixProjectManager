/**
 * KanbanCards Web Methods - Backend CRUD operations
 * 
 * These web methods handle all database operations for KanbanCards.
 * Cards are linked to ClientProfiles via profileId.
 * 
 * Data Flow: CRM Contact -> ClientProfile -> KanbanCards -> ActivityLog
 */

import { webMethod, Permissions } from '@wix/web-methods';
import { items } from '@wix/data';

// Full namespaced collection ID for app collection
const COLLECTION_ID = '@daniel02231/project-manager-v0/KanbanCards';

/**
 * Workflow stage type
 */
type ContactStatus = 
  | 'engage' | 'intent' | 'engagement' | 'advice-call' | 'qualification'
  | 'straight-to-quote' | 'routing-pqq' | 'booking' | 'assessment-undertaken'
  | 'assessment-completed' | 'sales-pitch' | 'tender-quote' | 'supplier-survey'
  | 'go-no-go' | 'finance-payment' | 'installation' | 'project-completion';

/**
 * Input type for creating a new card
 */
interface CreateCardInput {
  profileId: string;
  stageId: ContactStatus;
  stage: string;
  callBackAppointmentDate?: string;
  nextAppointment?: string | null;
  readinessLevel?: number;
  financeStatus?: string;
  interestTags?: string[];
  assessmentStatus?: string;
  debriefDate?: string;
  notes?: string;
  marketingPipelines?: {
    active: Array<{ id: string; name: string; status: string }>;
    available: Array<{ id: string; name: string; description?: string }>;
  };
  tags?: string[];
  formData?: Array<{ questionId: string; question: string; answer: string; answeredAt?: string }>;
  partnerPortalRef?: string;
  clientPortalRef?: string;
  externalAssessmentStatus?: string;
  externalClientStatus?: string;
  tenders?: Array<{ id: string; submittedAt: string; amount: number; status: string; notes?: string }>;
  quotes?: { id?: string; generatedAt?: string; amount?: number; validUntil?: string };
  invoiceRef?: string;
  approvalStatus?: 'pending' | 'go' | 'no-go';
  financeTC?: boolean;
  installationTC?: boolean;
  projectCompleteTC?: boolean;
}

/**
 * Creates a new KanbanCard linked to a ClientProfile
 */
export const createCard = webMethod(
  Permissions.Anyone,
  async (cardData: CreateCardInput) => {
    try {
      const result = await items.insert(COLLECTION_ID, cardData);
      
      console.log('🎴 Card created:', result._id);
      return result;
    } catch (error) {
      console.error('🎴 Error creating card:', error);
      throw error;
    }
  }
);

/**
 * Fetches a card by its ID
 */
export const getCardById = webMethod(
  Permissions.Anyone,
  async (cardId: string) => {
    try {
      const result = await items.get(COLLECTION_ID, cardId);
      return result;
    } catch (error) {
      console.error('🎴 Error fetching card:', error);
      return null;
    }
  }
);

/**
 * Fetches all cards for a specific profile
 */
export const getCardsByProfileId = webMethod(
  Permissions.Anyone,
  async (profileId: string) => {
    try {
      const result = await items.query(COLLECTION_ID)
        .eq('profileId', profileId)
        .find();
      
      return result.items || [];
    } catch (error) {
      console.error('🎴 Error fetching cards by profile:', error);
      return [];
    }
  }
);

/**
 * Fetches all cards for a specific stage
 */
export const getCardsByStage = webMethod(
  Permissions.Anyone,
  async (stageId: ContactStatus) => {
    try {
      const result = await items.query(COLLECTION_ID)
        .eq('stageId', stageId)
        .find();
      
      return result.items || [];
    } catch (error) {
      console.error('🎴 Error fetching cards by stage:', error);
      return [];
    }
  }
);

/**
 * Fetches all cards
 */
export const getAllCards = webMethod(
  Permissions.Anyone,
  async () => {
    try {
      const result = await items.query(COLLECTION_ID).find();
      
      console.log('🎴 Fetched all cards:', result.items?.length || 0);
      return result.items || [];
    } catch (error: any) {
      console.error('🎴 Error fetching all cards:', JSON.stringify({
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
 * Updates a card by ID
 */
export const updateCard = webMethod(
  Permissions.Anyone,
  async (cardId: string, updates: Partial<CreateCardInput>) => {
    try {
      const existing = await items.get(COLLECTION_ID, cardId);
      
      if (!existing) {
        console.error('🎴 Card not found for update:', cardId);
        return null;
      }
      
      const updatedData = {
        ...existing,
        ...updates,
        _id: cardId // Ensure ID is preserved
      };
      
      const result = await items.update(COLLECTION_ID, updatedData);
      
      console.log('🎴 Card updated:', cardId);
      return result;
    } catch (error) {
      console.error('🎴 Error updating card:', error);
      throw error;
    }
  }
);

/**
 * Updates just the stage of a card (for drag-and-drop)
 */
export const updateCardStage = webMethod(
  Permissions.Anyone,
  async (cardId: string, stageId: ContactStatus, stageName: string) => {
    try {
      const existing = await items.get(COLLECTION_ID, cardId);
      
      if (!existing) return null;
      
      const updatedData = {
        ...existing,
        stageId,
        stage: stageName,
        _id: cardId // Ensure ID is preserved
      };
      
      const result = await items.update(COLLECTION_ID, updatedData);
      
      console.log('🎴 Card stage updated:', cardId, '->', stageId);
      return result;
    } catch (error) {
      console.error('🎴 Error updating card stage:', error);
      throw error;
    }
  }
);

/**
 * Deletes a card by ID
 */
export const deleteCard = webMethod(
  Permissions.Anyone,
  async (cardId: string) => {
    try {
      await items.remove(COLLECTION_ID, cardId);
      
      console.log('🎴 Card deleted:', cardId);
      return true;
    } catch (error) {
      console.error('🎴 Error deleting card:', error);
      return false;
    }
  }
);

/**
 * Creates a card for a profile if one doesn't exist, otherwise updates it
 */
export const upsertCardForProfile = webMethod(
  Permissions.Anyone,
  async (profileId: string, cardData: Omit<CreateCardInput, 'profileId'>) => {
    try {
      const existingResult = await items.query(COLLECTION_ID)
        .eq('profileId', profileId)
        .limit(1)
        .find();
      
      const existing = existingResult.items?.[0];
      
      if (existing) {
        const updatedData = {
          ...existing,
          ...cardData,
          profileId,
          _id: existing._id // Ensure ID is preserved
        };
        
        const result = await items.update(COLLECTION_ID, updatedData);
        return result;
      } else {
        const result = await items.insert(COLLECTION_ID, {
          profileId,
          ...cardData,
        });
        
        return result;
      }
    } catch (error) {
      console.error('🎴 Error upserting card:', error);
      throw error;
    }
  }
);
