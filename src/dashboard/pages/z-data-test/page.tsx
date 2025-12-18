import React, { useState } from 'react';
import { Button, Box, Text, Loader, Card, Input, Divider } from '@wix/design-system';
import { sayHello, testInsert, testQuery, testDelete } from '../../../backend/test.web.js';
import { multiply } from '../../../backend/generate-web-1.web.js';
import { insertItemLocal } from '../../utils/dataTestUtils.js';
import { createClient } from '@wix/sdk';
// @ts-ignore - @wix/dashboard types not fully available
import { dashboard } from '@wix/dashboard';
import { members } from '@wix/members';

/**
 * Test Page for Data Collection Operations
 * 
 * This page provides individual buttons to test each backend operation:
 * - Test Multiply: Wix-generated boilerplate (simplest possible test)
 * - Say Hello: Basic connectivity test
 * - Test Insert: Creates a test item in the collection
 * - Test Query: Retrieves items from the collection
 * - Test Delete: Removes an item by ID
 * 
 * Each operation shows step-by-step logs for debugging.
 * 
 * Note: This CLI app uses auth.elevate() from @wix/essentials for elevation.
 * The Velo elevate() from wix-auth is only available in Velo web-based development.
 */
export default function TestPage() {
  // State for tracking loading status of each operation
  const [loadingState, setLoadingState] = useState({
    multiply: false,
    hello: false,
    token: false,
    currentUser: false,
    dashboardUser: false,
    insert: false,
    insertLocal: false,
    query: false,
    delete: false
  });
  
  // State for storing results from each operation
  const [results, setResults] = useState<{
    multiply: any;
    hello: any;
    token: any;
    currentUser: any;
    dashboardUser: any;
    insert: any;
    insertLocal: any;
    query: any;
    delete: any;
  }>({
    multiply: null,
    hello: null,
    token: null,
    currentUser: null,
    dashboardUser: null,
    insert: null,
    insertLocal: null,
    query: null,
    delete: null
  });
  
  // State for the delete item ID input
  const [deleteItemId, setDeleteItemId] = useState('');

  /**
   * Helper to set loading state for a specific operation
   */
  const setLoading = (key: keyof typeof loadingState, value: boolean) => {
    setLoadingState(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Helper to set result for a specific operation
   */
  const setResult = (key: keyof typeof results, value: any) => {
    setResults(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Run the multiply boilerplate test (from wix app generate)
   */
  const runMultiply = async () => {
    setLoading('multiply', true);
    setResult('multiply', null);
    try {
      const result = await multiply(3, 4);
      setResult('multiply', { 
        success: true, 
        logs: ['Called multiply(3, 4)', 'Result: ' + result],
        data: { result }
      });
    } catch (error: any) {
      setResult('multiply', { 
        success: false, 
        logs: ['Client error: ' + error.message],
        error: { message: error.message }
      });
    } finally {
      setLoading('multiply', false);
    }
  };

  /**
   * Run the hello world test
   */
  const runHello = async () => {
    setLoading('hello', true);
    setResult('hello', null);
    try {
      const response = await sayHello();
      setResult('hello', response);
    } catch (error: any) {
      setResult('hello', { success: false, logs: ['Client error: ' + error.message] });
    } finally {
      setLoading('hello', false);
    }
  };

  /**
   * Run the token info debug test (no data operations)
   */
  const runTokenInfo = async () => {
    setLoading('token', true);
    setResult('token', null);
    try {
      // Dynamic import and cast to any so we can call the debug helper
      // even though it's not declared in the generated type definitions.
      const backend: any = await import('../../../backend/test.web.js');
      const response = await backend.debugTokenInfo();
      setResult('token', response);
    } catch (error: any) {
      setResult('token', { success: false, logs: ['Client error: ' + error.message] });
    } finally {
      setLoading('token', false);
    }
  };

  /**
   * Get the currently logged-in user information
   * Useful for record keeping and audit logs
   */
  const runGetCurrentUser = async () => {
    setLoading('currentUser', true);
    setResult('currentUser', null);
    try {
      const backend: any = await import('../../../backend/test.web.js');
      const response = await backend.getCurrentUser();
      setResult('currentUser', response);
    } catch (error: any) {
      setResult('currentUser', { success: false, logs: ['Client error: ' + error.message] });
    } finally {
      setLoading('currentUser', false);
    }
  };

  /**
   * Get the dashboard user using the Dashboard SDK authentication strategy
   * 
   * This uses createClient with dashboard.host() and dashboard.auth() which
   * provides the authentication context for the currently logged-in Wix user
   * in the dashboard. This is the correct approach for dashboard pages.
   */
  const runGetDashboardUser = async () => {
    setLoading('dashboardUser', true);
    setResult('dashboardUser', null);
    
    const logs: string[] = [];
    
    try {
      logs.push('Step 1: Creating WixClient with dashboard.host() and dashboard.auth()...');
      
      // Create a WixClient configured for dashboard authentication
      // This combines app permissions with the current dashboard user's permissions
      const dashboardClient = createClient({
        host: dashboard.host(),
        auth: dashboard.auth(),
        modules: { members },
      });
      
      logs.push('Step 2: WixClient created successfully');
      logs.push('Step 3: Calling members.getCurrentMember({ fieldsets: ["FULL"] })...');
      
      // Call the members API to get the current member's details
      // Using 'as any' to bypass strict typing - the runtime API works correctly
      const response = await (dashboardClient.members as any).getCurrentMember({
        fieldsets: ['FULL']
      });
      
      logs.push('Step 4: API call successful');
      
      const member = response.member;
      
      // Log key details for debugging
      logs.push('Step 5: Member ID: ' + (member?._id || 'not found'));
      logs.push('Step 6: Login Email: ' + (member?.loginEmail || 'not found'));
      
      const firstName = member?.contact?.firstName || '';
      const lastName = member?.contact?.lastName || '';
      logs.push('Step 7: Name: ' + (firstName + ' ' + lastName).trim() || 'not found');
      logs.push('Step 8: Status: ' + (member?.status || 'not found'));
      logs.push('Step 9: Activity Status: ' + (member?.activityStatus || 'not found'));
      
      setResult('dashboardUser', {
        success: true,
        logs,
        data: {
          memberId: member?._id,
          loginEmail: member?.loginEmail,
          firstName: firstName,
          lastName: lastName,
          nickname: member?.profile?.nickname,
          photo: member?.profile?.photo?.url,
          status: member?.status,
          activityStatus: member?.activityStatus,
          contactId: member?.contactId,
          createdDate: member?._createdDate,
          // Include raw member object for full inspection
          rawMember: member
        }
      });
    } catch (error: any) {
      logs.push('ERROR: ' + error.message);
      
      // Log additional error details if available
      if (error.code) {
        logs.push('ERROR CODE: ' + error.code);
      }
      if (error.details) {
        logs.push('ERROR DETAILS: ' + JSON.stringify(error.details));
      }
      
      setResult('dashboardUser', {
        success: false,
        logs,
        error: { 
          message: error.message, 
          code: error.code, 
          details: error.details 
        }
      });
    } finally {
      setLoading('dashboardUser', false);
    }
  };

  /**
   * Run the insert test (backend web method)
   */
  const runInsert = async () => {
    setLoading('insert', true);
    setResult('insert', null);
    try {
      const response = await testInsert();
      setResult('insert', response);
      // If insert was successful, pre-fill delete input with the new item's ID
      if (response.success && response.data?._id) {
        setDeleteItemId(response.data._id);
      }
    } catch (error: any) {
      setResult('insert', { success: false, logs: ['Client error: ' + error.message] });
    } finally {
      setLoading('insert', false);
    }
  };

  /**
   * Run the local insert test (frontend direct access)
   */
  const runInsertLocal = async () => {
    setLoading('insertLocal', true);
    setResult('insertLocal', null);
    try {
      const response = await insertItemLocal();
      setResult('insertLocal', response);
      // If insert was successful, pre-fill delete input with the new item's ID
      if (response.success && response.data?._id) {
        setDeleteItemId(response.data._id);
      }
    } catch (error: any) {
      setResult('insertLocal', { success: false, logs: ['Client error: ' + error.message] });
    } finally {
      setLoading('insertLocal', false);
    }
  };

  /**
   * Run the query test
   */
  const runQuery = async () => {
    setLoading('query', true);
    setResult('query', null);
    try {
      const response = await testQuery();
      setResult('query', response);
    } catch (error: any) {
      setResult('query', { success: false, logs: ['Client error: ' + error.message] });
    } finally {
      setLoading('query', false);
    }
  };

  /**
   * Run the delete test
   */
  const runDelete = async () => {
    setLoading('delete', true);
    setResult('delete', null);
    try {
      const response = await testDelete(deleteItemId);
      setResult('delete', response);
      // Clear the input if delete was successful
      if (response.success) {
        setDeleteItemId('');
      }
    } catch (error: any) {
      setResult('delete', { success: false, logs: ['Client error: ' + error.message] });
    } finally {
      setLoading('delete', false);
    }
  };

  /**
   * Component to display logs and result for an operation
   */
  const ResultCard = ({ title, result }: { title: string; result: any }) => {
    if (!result) return null;
    
    return (
      <Card>
        <Card.Header 
          title={title} 
          suffix={
            <Text size="small" skin={result.success ? 'success' : 'error'}>
              {result.success ? '✓ Success' : '✗ Failed'}
            </Text>
          }
        />
        <Card.Divider />
        <Card.Content>
          <Box direction="vertical" gap="SP2">
            {/* Display step-by-step logs */}
            <Text size="small" weight="bold">Logs:</Text>
            <Box 
              direction="vertical" 
              gap="SP1"
              padding="SP2"
              backgroundColor="D70"
              borderRadius="6px"
            >
              {result.logs?.map((log: string, i: number) => (
                <Text 
                  key={i} 
                  size="tiny" 
                  skin={log.includes('ERROR') ? 'error' : 'standard'}
                >
                  {log}
                </Text>
              ))}
            </Box>
            
            {/* Display data if available */}
            {result.data && (
              <>
                <Text size="small" weight="bold">Data:</Text>
                <Box
                  padding="SP2"
                  backgroundColor="D70"
                  borderRadius="6px"
                >
                  <pre style={{ 
                    margin: 0,
                    fontSize: '12px',
                    overflow: 'auto',
                    maxHeight: '200px'
                  }}>
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </Box>
              </>
            )}
            
            {/* Display error if available */}
            {result.error && (
              <>
                <Text size="small" weight="bold" skin="error">Error:</Text>
                <Box
                  padding="SP2"
                  backgroundColor="D70"
                  borderRadius="6px"
                >
                  <pre style={{ 
                    margin: 0,
                    fontSize: '12px',
                    color: '#d32f2f'
                  }}>
                    {JSON.stringify(result.error, null, 2)}
                  </pre>
                </Box>
              </>
            )}
          </Box>
        </Card.Content>
      </Card>
    );
  };

  return (
    <Box direction="vertical" gap="SP4" padding="SP4">
      <Text size="medium" weight="bold">Data Collection Test Suite</Text>
      <Text size="small" secondary>
        Test each operation individually to debug data collection access.
      </Text>
      <Text size="tiny" secondary>
        Uses auth.elevate() from @wix/essentials (CLI app SDK approach)
      </Text>
      
      <Divider />
      
      {/* Multiply Boilerplate Test - from wix app generate */}
      <Box direction="vertical" gap="SP2">
        <Box direction="horizontal" gap="SP2" verticalAlign="middle">
          <Button 
            onClick={runMultiply} 
            disabled={loadingState.multiply}
            size="small"
            skin="premium"
          >
            {loadingState.multiply ? <Loader size="tiny" /> : '0. Test Multiply (boilerplate)'}
          </Button>
          <Text size="tiny" secondary>Tests the wix-generated boilerplate: multiply(3, 4) = 12</Text>
        </Box>
        <ResultCard title="Multiply Result" result={results.multiply} />
      </Box>
      
      <Divider />
      
      {/* Hello World Test */}
      <Box direction="vertical" gap="SP2">
        <Box direction="horizontal" gap="SP2" verticalAlign="middle">
          <Button 
            onClick={runHello} 
            disabled={loadingState.hello}
            size="small"
            priority="secondary"
          >
            {loadingState.hello ? <Loader size="tiny" /> : '1. Say Hello'}
          </Button>
          <Text size="tiny" secondary>Basic connectivity test - no data operations</Text>
        </Box>
        <ResultCard title="Hello Result" result={results.hello} />
      </Box>

      <Divider />

      {/* Token Info Debug */}
      <Box direction="vertical" gap="SP2">
        <Box direction="horizontal" gap="SP2" verticalAlign="middle">
          <Button
            onClick={runTokenInfo}
            disabled={loadingState.token}
            size="small"
            priority="secondary"
          >
            {loadingState.token ? <Loader size="tiny" /> : '1b. Log Token Info'}
          </Button>
          <Text size="tiny" secondary>
            Shows which identity is calling the backend (TokenInfo logs only)
          </Text>
        </Box>
        <ResultCard title="Token Info Result" result={results.token} />
      </Box>
      
      <Divider />

      {/* Current User Info (Backend - often fails in dashboard context) */}
      <Box direction="vertical" gap="SP2">
        <Box direction="horizontal" gap="SP2" verticalAlign="middle">
          <Button
            onClick={runGetCurrentUser}
            disabled={loadingState.currentUser}
            size="small"
            priority="secondary"
          >
            {loadingState.currentUser ? <Loader size="tiny" /> : '1c. Get Current User (Backend)'}
          </Button>
          <Text size="tiny" secondary>
            Backend auth.getTokenInfo() - may not work in dashboard context
          </Text>
        </Box>
        <ResultCard title="Current User (Backend)" result={results.currentUser} />
      </Box>
      
      <Divider />

      {/* Dashboard User Info (SDK - recommended approach) */}
      <Box direction="vertical" gap="SP2">
        <Box direction="horizontal" gap="SP2" verticalAlign="middle">
          <Button
            onClick={runGetDashboardUser}
            disabled={loadingState.dashboardUser}
            size="small"
            skin="premium"
          >
            {loadingState.dashboardUser ? <Loader size="tiny" /> : '1d. Get Dashboard User (SDK)'}
          </Button>
          <Text size="tiny" secondary>
            Dashboard SDK auth - recommended for dashboard pages
          </Text>
        </Box>
        <ResultCard title="Dashboard User (SDK)" result={results.dashboardUser} />
      </Box>
      
      <Divider />
      
      {/* Insert Test (Backend) */}
      <Box direction="vertical" gap="SP2">
        <Box direction="horizontal" gap="SP2" verticalAlign="middle">
          <Button 
            onClick={runInsert} 
            disabled={loadingState.insert}
            size="small"
          >
            {loadingState.insert ? <Loader size="tiny" /> : '2. Test Insert'}
          </Button>
          <Text size="tiny" secondary>Creates a test item via backend web method</Text>
        </Box>
        <ResultCard title="Insert Result" result={results.insert} />
      </Box>
      
      <Divider />
      
      {/* Insert Test (Local/Frontend) */}
      <Box direction="vertical" gap="SP2">
        <Box direction="horizontal" gap="SP2" verticalAlign="middle">
          <Button 
            onClick={runInsertLocal} 
            disabled={loadingState.insertLocal}
            size="small"
            priority="secondary"
          >
            {loadingState.insertLocal ? <Loader size="tiny" /> : '2b. Test Insert (Local)'}
          </Button>
          <Text size="tiny" secondary>Creates a test item directly from frontend using @wix/data</Text>
        </Box>
        <ResultCard title="Insert Local Result" result={results.insertLocal} />
      </Box>
      
      <Divider />
      
      {/* Query Test */}
      <Box direction="vertical" gap="SP2">
        <Box direction="horizontal" gap="SP2" verticalAlign="middle">
          <Button 
            onClick={runQuery} 
            disabled={loadingState.query}
            size="small"
          >
            {loadingState.query ? <Loader size="tiny" /> : '3. Test Query'}
          </Button>
          <Text size="tiny" secondary>Retrieves up to 5 items from the collection</Text>
        </Box>
        <ResultCard title="Query Result" result={results.query} />
      </Box>
      
      <Divider />
      
      {/* Delete Test */}
      <Box direction="vertical" gap="SP2">
        <Box direction="horizontal" gap="SP2" verticalAlign="middle">
          <Box width="300px">
            <Input
              size="small"
              placeholder="Enter item ID to delete"
              value={deleteItemId}
              onChange={(e) => setDeleteItemId(e.target.value)}
            />
          </Box>
          <Button 
            onClick={runDelete} 
            disabled={loadingState.delete || !deleteItemId.trim()}
            size="small"
            skin="destructive"
          >
            {loadingState.delete ? <Loader size="tiny" /> : '4. Test Delete'}
          </Button>
        </Box>
        <Text size="tiny" secondary>
          Tip: Run Insert first, then the item ID will auto-fill here for cleanup
        </Text>
        <ResultCard title="Delete Result" result={results.delete} />
      </Box>
    </Box>
  );
}
