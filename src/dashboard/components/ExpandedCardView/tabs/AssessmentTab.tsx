import React from 'react';
import { 
  Box, 
  Text, 
  Button, 
  TextButton, 
  Badge,
  Card,
  Divider,
} from '@wix/design-system';
import * as Icons from '@wix/wix-ui-icons-common';

/**
 * AssessmentTab - Portal management and status display
 * 
 * Features:
 * - Create assessment card button
 * - Create client portal button
 * - View partner portal link
 * - View client portal link
 * - Assessment and client status display
 * 
 * @param partnerPortalRef - Reference to partner portal card
 * @param clientPortalRef - Reference to client portal page
 * @param assessmentStatus - Latest assessment status
 * @param clientStatus - Latest client status
 * @param onCreateAssessment - Callback to create assessment card
 * @param onCreateClientPortal - Callback to create client portal
 */

export interface AssessmentTabProps {
  partnerPortalRef?: string;
  clientPortalRef?: string;
  assessmentStatus?: string;
  clientStatus?: string;
  onCreateAssessment: () => void;
  onCreateClientPortal: () => void;
}

export default function AssessmentTab({
  partnerPortalRef,
  clientPortalRef,
  assessmentStatus,
  clientStatus,
  onCreateAssessment,
  onCreateClientPortal,
}: AssessmentTabProps) {
  return (
    <Box direction="vertical" gap={4}>
      {/* Actions Section */}
      <Box direction="vertical" gap={3}>
        <Text size="small" weight="bold">Portal Actions</Text>
        
        <Box gap={3}>
          {/* Partner Portal Card */}
          <Card>
            <Card.Header
              title="Partner Portal"
              subtitle="Assessment card for partners"
            />
            <Card.Divider />
            <Card.Content>
              <Box direction="vertical" gap={3}>
                {partnerPortalRef ? (
                  <Box direction="vertical" gap={2}>
                    <Box gap={2} verticalAlign="middle">
                      <Icons.Check />
                      <Text size="small" skin="success">
                        Assessment card created
                      </Text>
                    </Box>
                    <TextButton
                      size="small"
                      onClick={() => {
                        // TODO: Open partner portal
                        console.log('🔗 Opening partner portal:', partnerPortalRef);
                      }}
                    >
                      View Partner Portal
                    </TextButton>
                  </Box>
                ) : (
                  <Button
                    size="small"
                    onClick={onCreateAssessment}
                  >
                    Create Assessment Card
                  </Button>
                )}
              </Box>
            </Card.Content>
          </Card>

          {/* Client Portal Card */}
          <Card>
            <Card.Header
              title="Client Portal"
              subtitle="Customer-facing portal page"
            />
            <Card.Divider />
            <Card.Content>
              <Box direction="vertical" gap={3}>
                {clientPortalRef ? (
                  <Box direction="vertical" gap={2}>
                    <Box gap={2} verticalAlign="middle">
                      <Icons.Check />
                      <Text size="small" skin="success">
                        Client portal created
                      </Text>
                    </Box>
                    <TextButton
                      size="small"
                      onClick={() => {
                        // TODO: Open client portal
                        console.log('🔗 Opening client portal:', clientPortalRef);
                      }}
                    >
                      View Client Portal
                    </TextButton>
                  </Box>
                ) : (
                  <Button
                    size="small"
                    onClick={onCreateClientPortal}
                  >
                    Create Client Portal
                  </Button>
                )}
              </Box>
            </Card.Content>
          </Card>
        </Box>
      </Box>

      <Divider />

      {/* Status Section */}
      <Box direction="vertical" gap={3}>
        <Text size="small" weight="bold">Portal Status</Text>
        
        <Box gap={4}>
          {/* Assessment Status */}
          <Box
            direction="vertical"
            gap={2}
            padding="16px"
            backgroundColor="#ffffff"
            borderRadius="8px"
            flex={1}
          >
            <Text size="tiny" secondary>Assessment Status</Text>
            {assessmentStatus ? (
              <Box gap={2} verticalAlign="middle">
                <StatusBadge status={assessmentStatus} />
                <Text size="small">{assessmentStatus}</Text>
              </Box>
            ) : (
              <Text size="small" secondary>No status updates</Text>
            )}
          </Box>

          {/* Client Status */}
          <Box
            direction="vertical"
            gap={2}
            padding="16px"
            backgroundColor="#ffffff"
            borderRadius="8px"
            flex={1}
          >
            <Text size="tiny" secondary>Client Status</Text>
            {clientStatus ? (
              <Box gap={2} verticalAlign="middle">
                <StatusBadge status={clientStatus} />
                <Text size="small">{clientStatus}</Text>
              </Box>
            ) : (
              <Text size="small" secondary>No status updates</Text>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/**
 * StatusBadge - Visual indicator for status
 */
function StatusBadge({ status }: { status: string }) {
  const skin = getStatusSkin(status);
  return <Badge size="tiny" skin={skin}>{status}</Badge>;
}

/**
 * Determines badge skin based on status text
 */
function getStatusSkin(status: string): 'success' | 'warning' | 'danger' | 'general' {
  const lower = status.toLowerCase();
  if (lower.includes('complete') || lower.includes('approved') || lower.includes('done')) {
    return 'success';
  }
  if (lower.includes('pending') || lower.includes('progress') || lower.includes('review')) {
    return 'warning';
  }
  if (lower.includes('fail') || lower.includes('reject') || lower.includes('cancel')) {
    return 'danger';
  }
  return 'general';
}

