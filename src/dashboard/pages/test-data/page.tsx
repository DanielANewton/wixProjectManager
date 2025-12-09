import React, { useState } from 'react';
import { Button, Box, Text, Loader, Card } from '@wix/design-system';
import { testConnection } from '../../../backend/test.web';

export default function TestPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runTest = async () => {
    setIsLoading(true);
    setLogs(['🚀 Starting test...']);
    try {
      const response = await testConnection();
      setResult(response);
      setLogs(response.logs || []);
    } catch (error: any) {
      setLogs(prev => [...prev, `❌ Client Error: ${error.message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box direction="vertical" gap="SP4" padding="SP4">
      <Text size="medium" weight="bold">Data Collection Access Test</Text>
      
      <Button onClick={runTest} disabled={isLoading}>
        {isLoading ? <Loader size="tiny" /> : 'Run Connection Test'}
      </Button>

      {logs.length > 0 && (
        <Card>
          <Card.Header title="Test Logs" />
          <Card.Content>
            <Box direction="vertical" gap="SP2">
              {logs.map((log, i) => (
                <Text key={i} size="small" secondary={log.includes('❌')}>{log}</Text>
              ))}
            </Box>
          </Card.Content>
        </Card>
      )}

      {result && (
        <Card>
          <Card.Header title="Raw Result" />
          <Card.Content>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '400px'
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </Card.Content>
        </Card>
      )}
    </Box>
  );
}
