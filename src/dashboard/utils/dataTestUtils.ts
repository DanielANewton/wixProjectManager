/**
 * Data Test Utilities - Frontend direct data access
 * 
 * This utility provides functions to interact with Wix Data collections
 * directly from the frontend, without using backend web methods.
 * 
 * This demonstrates direct frontend access to Wix Data, similar to how
 * the project uses @wix/crm directly in useContacts.ts.
 */

import { items } from '@wix/data';

// Collection ID for KanbanCards - same as in test.web.js
const COLLECTION_ID = '@daniel02231/project-manager-v0/KanbanCards';

/**
 * Interface for the test item data structure
 */
interface TestItemData {
  profileId?: string;
  stageId?: string;
  stage?: string;
  notes?: string;
}

/**
 * Result structure matching the backend test functions
 */
interface InsertResult {
  success: boolean;
  logs: string[];
  data?: any;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Inserts an item into the KanbanCards collection directly from the frontend
 * 
 * This function uses @wix/data directly without going through backend web methods.
 * It provides step-by-step logging similar to the backend test functions.
 * 
 * @param itemData - Optional item data to insert. If not provided, uses default test data.
 * @returns Promise with success status, logs, and data/error information
 */
export async function insertItemLocal(
  itemData?: TestItemData
): Promise<InsertResult> {
  const logs: string[] = [];
  
  try {
    logs.push('Step 1: Starting local insert test');
    logs.push('Step 2: Target collection: ' + COLLECTION_ID);
    logs.push('Step 3: Using @wix/data directly (no backend web method)');
    
    // Prepare test item data
    const testItem: TestItemData = itemData || {
      profileId: 'test-profile-local-' + Date.now(),
      stageId: 'engage',
      stage: 'Test Stage (Local)',
      notes: 'Test item created locally at ' + new Date().toISOString()
    };
    
    logs.push('Step 4: Test item prepared');
    logs.push('Step 5: Item data: ' + JSON.stringify(testItem, null, 2));
    logs.push('Step 6: Calling items.insert() directly...');
    
    // Insert item directly using @wix/data
    const result = await items.insert(COLLECTION_ID, testItem);
    
    logs.push('Step 7: Insert successful!');
    logs.push('Step 8: Item ID: ' + result._id);
    
    return {
      success: true,
      logs,
      data: result
    };
  } catch (error: any) {
    logs.push('ERROR: ' + error.message);
    
    if (error.code === 'WDE0025') {
      logs.push('TIP: Collection ID may be wrong or not provisioned');
    }
    
    if (error.code) {
      logs.push('Error code: ' + error.code);
    }
    
    return {
      success: false,
      logs,
      error: {
        message: error.message,
        code: error.code
      }
    };
  }
}

