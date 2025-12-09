import React from 'react';
import { Page, Card, Box, Text } from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import { withProviders } from '../withProviders';

function DashboardHome() {
  return (
    <Page height="100vh">
      <Page.Header title="Project Manager" />
      <Page.Content>
        <Card>
          <Card.Header title="Welcome to Project Manager" />
          <Card.Divider />
          <Card.Content>
            <Box direction="vertical" gap={3}>
              <Text>
                Welcome to your Project Manager dashboard. 
                Navigate to the Workflow tab to manage your projects.
              </Text>
            </Box>
          </Card.Content>
        </Card>
      </Page.Content>
    </Page>
  );
}

export default withProviders(DashboardHome);
