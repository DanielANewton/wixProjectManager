import { webMethod, Permissions } from '@wix/web-methods';
import { items } from '@wix/data';

// Using the namespace we saw in your logs
const COLLECTION_ID = '@daniel02231/project-manager-v0/KanbanCards';

export const testConnection = webMethod(
  Permissions.Anyone,
  async () => {
    const logs: string[] = [];
    const log = (msg: string, data?: any) => {
      console.log(msg, data || '');
      logs.push(`${msg} ${data ? JSON.stringify(data) : ''}`);
    };

    try {
      log('🚀 Starting connection test...');
      log('📂 Target Collection:', COLLECTION_ID);

      // 1. Try to Insert
      const testItem = {
        profileId: 'test-profile-id',
        stageId: 'engage',
        stage: 'Test Stage',
        notes: 'Connection Test Item',
        _createdDate: new Date()
      };

      log('📝 Attempting insert...', testItem);
      
      const insertResult = await items.insert(COLLECTION_ID, testItem);
      log('✅ Insert successful:', insertResult);

      // 2. Try to Query
      log('🔍 Attempting query...');
      const queryResult = await items.query(COLLECTION_ID)
        .limit(1)
        .find();
      
      log('✅ Query successful. Found items:', queryResult.items.length);

      // 3. Try to Remove (cleanup)
      if (insertResult._id) {
        log('🗑️ Attempting cleanup delete...', insertResult._id);
        await items.remove(COLLECTION_ID, insertResult._id);
        log('✅ Cleanup successful');
      }

      return {
        success: true,
        logs,
        data: {
          inserted: insertResult,
          queried: queryResult.items
        }
      };

    } catch (error: any) {
      log('❌ TEST FAILED');
      log('Error Name:', error.name);
      log('Error Message:', error.message);
      log('Error Code:', error.code);
      log('Full Error:', error);

      return {
        success: false,
        logs,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
          stack: error.stack
        }
      };
    }
  }
);
