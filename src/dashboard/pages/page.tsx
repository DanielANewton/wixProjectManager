import React from 'react';
import { Page, Card, Box, Text } from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import { withProviders } from '../withProviders';

function DashboardHome() {
  return (
    <Page height="100vh">
      <Page.Header title="Overview" />
      <Page.Content>
        <Card>
          <Card.Header title="Welcome to Overview" />
          <Card.Divider />
          <Card.Content>
            <Box direction="vertical" gap={3}>
              <Text>
                Welcome to your Overview dashboard.
                Navigate to Project Cards to manage your projects.
              </Text>
            </Box>
          </Card.Content>
        </Card>
      </Page.Content>
    </Page>
  );
}

export default withProviders(DashboardHome);
