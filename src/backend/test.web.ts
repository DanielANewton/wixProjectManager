import { webMethod, Permissions } from '@wix/web-methods';
import { items } from '@wix/data';
import { auth } from '@wix/essentials'; // <--- 1. Import auth from essentials

const COLLECTION_ID = '@daniel02231/project-manager-v0/KanbanCards';

export const testConnection = webMethod(
  Permissions.Anyone,
  async () => {
    const logs: string[] = [];
    const log = (msg: string, data?: any) => {
      console.log(msg, data || '');
      logs.push(`${msg} ${data ? JSON.stringify(data) : ''}`);
    };

    // 2. Create elevated versions of the methods you need
    const elevatedInsert = auth.elevate(items.insert);
    const elevatedQuery = auth.elevate(items.query);
    const elevatedRemove = auth.elevate(items.remove);

    try {
      log('🚀 Starting connection test...');
      log('📂 Target Collection:', COLLECTION_ID);

      const testItem = {
        profileId: 'test-profile-id',
        stageId: 'engage',
        stage: 'Test Stage',
        notes: 'Connection Test Item'
        // Note: You do not need to manually set _createdDate, Wix does this automatically
      };

      log('📝 Attempting insert...', testItem);
      
      // 3. Use the elevated function instead of the standard one
      const insertResult = await elevatedInsert(COLLECTION_ID, testItem);
      log('✅ Insert successful:', insertResult);

      log('🔍 Attempting query...');
      // 4. Note: elevate() wraps the *entire* builder chain for query is tricky, 
      // sometimes it's easier to elevate a helper function that does the query.
      // However, for simple calls, you can try passing the builder logic or elevating a specific query function.
      // A cleaner way for queries is to wrap the specific query logic in a helper function and elevate THAT.
      const queryResult = await queryWithPrivileges(COLLECTION_ID);
      
      log('✅ Query successful. Found items:', queryResult.items.length);

      if (insertResult._id) {
        log('🗑️ Attempting cleanup delete...', insertResult._id);
        await elevatedRemove(COLLECTION_ID, insertResult._id);
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
      
      // Common Error Check
      if (error.code === 'WDE0025') {
         log('💡 TIP: This error usually means the Collection ID is wrong or the collection hasn\'t been provisioned yet. Did you run "npm run generate" to create the Data Collection Extension?');
      }

      return {
        success: false,
        logs,
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack
        }
      };
    }
  }
);

// Helper function to handle the query builder chain cleanly under elevation
async function _queryCollection(collectionId: string) {
  return items.query(collectionId).limit(1).find();
}
const queryWithPrivileges = auth.elevate(_queryCollection);