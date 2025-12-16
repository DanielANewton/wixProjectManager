/**
 * Test Web Methods for Wix Data Collection
 * 
 * This file contains separate backend functions for testing data operations.
 * Each function is isolated to make debugging easier.
 */
import { webMethod, Permissions } from '@wix/web-methods';
import { items } from '@wix/data';
import { auth } from '@wix/essentials';

const COLLECTION_ID = '@daniel02231/project-manager-v0/KanbanCards';

/**
 * Helper to log token info for debugging.
 * This shows which identity is calling the web method.
 * Keep this for dev/test only; remove or trim for production.
 */
async function logTokenInfo(logs) {
  try {
    const tokenInfo = await auth.getTokenInfo();
    logs.push(
      'TokenInfo: ' +
        JSON.stringify(
          {
            active: tokenInfo.active,
            subjectType: tokenInfo.subjectType,
            subjectId: tokenInfo.subjectId,
            siteId: tokenInfo.siteId,
            clientId: tokenInfo.clientId,
          },
          null,
          2
        )
    );
  } catch (tokenError) {
    logs.push('TokenInfo ERROR: ' + tokenError.message);
  }
}

/**
 * Simple hello world test - no data operations
 */
export const sayHello = webMethod(
  Permissions.Anyone,
  async () => {
    const logs = [];
    logs.push('Step 1: Function called');
    logs.push('Step 2: Creating response');
    // Debug: who is calling this web method?
    await logTokenInfo(logs);
    
    const response = {
      success: true,
      message: 'Hello from backend!',
      timestamp: new Date().toISOString(),
      collectionId: COLLECTION_ID
    };
    
    logs.push('Step 3: Response ready');
    return { success: true, logs, data: response };
  }
);

/**
 * Test inserting a single item into the collection
 * 
 * Note: Calling items.insert directly without auth.elevate() to test
 * if web methods have app-level permissions by default.
 */
export const testInsert = webMethod(
  Permissions.Anyone,
  async () => {
    const logs = [];
    try {
      logs.push('Step 1: Starting insert test');
      logs.push('Step 2: Target collection: ' + COLLECTION_ID);
      logs.push('Step 3: Calling items.insert directly (no elevation)');

      // Inspect token / identity for debugging
      await logTokenInfo(logs);

      const testItem = {
        profileId: 'test-profile-' + Date.now(),
        stageId: 'engage',
        stage: 'Test Stage',
        notes: 'Test item created at ' + new Date().toISOString()
      };

      logs.push('Step 4: Test item prepared');
      logs.push('Step 5: Calling items.insert...');
      const result = await items.insert(COLLECTION_ID, testItem);
      logs.push('Step 6: Insert successful!');
      logs.push('Step 7: Item ID: ' + result._id);

      return { success: true, logs, data: result };
    } catch (error) {
      logs.push('ERROR: ' + error.message);
      if (error.code === 'WDE0025') {
        logs.push('TIP: Collection ID may be wrong or not provisioned');
      }
      return { success: false, logs, error: { message: error.message, code: error.code } };
    }
  }
);

/**
 * Test querying items from the collection
 * 
 * Note: Calling items.query directly without auth.elevate() to test
 * if web methods have app-level permissions by default.
 */
export const testQuery = webMethod(
  Permissions.Anyone,
  async () => {
    const logs = [];
    try {
      logs.push('Step 1: Starting query test');
      logs.push('Step 2: Target collection: ' + COLLECTION_ID);
      logs.push('Step 3: Calling items.query directly (no elevation)');

      // Inspect token / identity for debugging
      await logTokenInfo(logs);
      
      logs.push('Step 4: Calling items.query...');
      const result = await items.query(COLLECTION_ID).limit(5).find();
      logs.push('Step 5: Query successful!');
      logs.push('Step 6: Items found: ' + result.items.length);
      
      return { success: true, logs, data: { itemCount: result.items.length, items: result.items } };
    } catch (error) {
      logs.push('ERROR: ' + error.message);
      return { success: false, logs, error: { message: error.message, code: error.code } };
    }
  }
);

/**
 * Test deleting an item from the collection
 * 
 * Note: Calling items.remove directly without auth.elevate() to test
 * if web methods have app-level permissions by default.
 */
export const testDelete = webMethod(
  Permissions.Anyone,
  async (itemId) => {
    const logs = [];
    try {
      logs.push('Step 1: Starting delete test');
      logs.push('Step 2: Item to delete: ' + itemId);

      // Inspect token / identity for debugging
      await logTokenInfo(logs);
      
      if (!itemId || itemId.trim() === '') {
        logs.push('ERROR: No item ID provided');
        return { success: false, logs, error: { message: 'Item ID is required' } };
      }
      
      logs.push('Step 3: Calling items.remove directly (no elevation)');
      logs.push('Step 4: Calling items.remove...');
      const result = await items.remove(COLLECTION_ID, itemId);
      logs.push('Step 5: Delete successful!');
      
      return { success: true, logs, data: { deletedItemId: itemId, result } };
    } catch (error) {
      logs.push('ERROR: ' + error.message);
      return { success: false, logs, error: { message: error.message, code: error.code } };
    }
  }
);

/**
 * Debug helper: return only token info logs without doing any data operations.
 * Useful for checking which identity is calling the backend.
 */
export const debugTokenInfo = webMethod(
  Permissions.Anyone,
  async () => {
    const logs = [];
    logs.push('Step 1: Starting token info debug');
    await logTokenInfo(logs);
    logs.push('Step 2: Token info collected');

    return {
      success: true,
      logs,
      data: null,
    };
  }
);

