import React from 'react';
import { 
  Box, 
  Text, 
  Button, 
  Badge, 
  ToggleSwitch,
  Card,
  Divider,
  TextButton,
} from '@wix/design-system';
import * as Icons from '@wix/wix-ui-icons-common';
import { QuoteData } from '../../../types/kanbanCard.js';

/**
 * SalesTab - Invoice, quotes, approval, and compliance management
 * 
 * Features:
 * - Generate invoice button
 * - Generate quote button
 * - Customer approval (Go/No-Go) status
 * - Compliance checkboxes (Finance TC, Installation TC, Project Complete TC)
 * 
 * @param invoiceRef - Reference to generated invoice
 * @param quotes - Quote data
 * @param approvalStatus - Customer approval status
 * @param financeTC - Finance Terms & Conditions completed
 * @param installationTC - Installation Terms & Conditions completed
 * @param projectCompleteTC - Project Complete Terms & Conditions completed
 * @param onGenerateInvoice - Callback to generate invoice
 * @param onGenerateQuote - Callback to generate quote
 * @param onUpdateApproval - Callback to update approval status
 * @param onUpdateCompliance - Callback to update compliance fields
 */

export interface SalesTabProps {
  invoiceRef?: string;
  quotes?: QuoteData;
  approvalStatus?: 'pending' | 'go' | 'no-go';
  financeTC: boolean;
  installationTC: boolean;
  projectCompleteTC: boolean;
  onGenerateInvoice: () => void;
  onGenerateQuote: () => void;
  onUpdateApproval: (status: 'pending' | 'go' | 'no-go') => void;
  onUpdateCompliance: (field: string, value: boolean) => void;
}

export default function SalesTab({
  invoiceRef,
  quotes,
  approvalStatus = 'pending',
  financeTC,
  installationTC,
  projectCompleteTC,
  onGenerateInvoice,
  onGenerateQuote,
  onUpdateApproval,
  onUpdateCompliance,
}: SalesTabProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(value);
  };

  return (
    <Box direction="vertical" gap={4}>
      {/* Actions Section */}
      <Box direction="vertical" gap={3}>
        <Text size="small" weight="bold">Sales Actions</Text>
        
        <Box gap={3}>
          {/* Invoice Card */}
          <Card>
            <Card.Header
              title="Invoice"
              subtitle="Generate and manage invoices"
            />
            <Card.Divider />
            <Card.Content>
              <Box direction="vertical" gap={2}>
                {invoiceRef ? (
                  <Box direction="vertical" gap={2}>
                    <Box gap={2} verticalAlign="middle">
                      <Icons.Check />
                      <Text size="small" skin="success">Invoice generated</Text>
                    </Box>
                    <TextButton size="small">
                      View Invoice
                    </TextButton>
                  </Box>
                ) : (
                  <Button size="small" onClick={onGenerateInvoice}>
                    Generate Invoice
                  </Button>
                )}
              </Box>
            </Card.Content>
          </Card>

          {/* Quote Card */}
          <Card>
            <Card.Header
              title="Quote"
              subtitle="Generate customer quotes"
            />
            <Card.Divider />
            <Card.Content>
              <Box direction="vertical" gap={2}>
                {quotes?.id ? (
                  <Box direction="vertical" gap={2}>
                    <Box gap={2} verticalAlign="middle">
                      <Icons.Check />
                      <Text size="small" skin="success">
                        Quote: {quotes.amount ? formatCurrency(quotes.amount) : 'Generated'}
                      </Text>
                    </Box>
                    {quotes.validUntil && (
                      <Text size="tiny" secondary>
                        Valid until: {new Date(quotes.validUntil).toLocaleDateString()}
                      </Text>
                    )}
                    <TextButton size="small">
                      View Quote
                    </TextButton>
                  </Box>
                ) : (
                  <Button size="small" onClick={onGenerateQuote}>
                    Generate Quote
                  </Button>
                )}
              </Box>
            </Card.Content>
          </Card>
        </Box>
      </Box>

      <Divider />

      {/* Customer Approval Section */}
      <Box direction="vertical" gap={3}>
        <Text size="small" weight="bold">Customer Approval</Text>
        
        <Box
          padding="16px"
          backgroundColor="#ffffff"
          borderRadius="8px"
          align="space-between"
          verticalAlign="middle"
        >
          <Text size="small">Go / No Go Decision</Text>
          
          <Box gap={2}>
            <Button
              size="tiny"
              skin={approvalStatus === 'go' ? 'standard' : 'light'}
              onClick={() => onUpdateApproval('go')}
            >
              Go
            </Button>
            <Button
              size="tiny"
              skin={approvalStatus === 'no-go' ? 'destructive' : 'light'}
              onClick={() => onUpdateApproval('no-go')}
            >
              No Go
            </Button>
            <Button
              size="tiny"
              skin={approvalStatus === 'pending' ? 'premium' : 'light'}
              onClick={() => onUpdateApproval('pending')}
            >
              Pending
            </Button>
          </Box>
        </Box>

        {/* Current Status Display */}
        <Box padding="0 16px">
          <Box gap={2} verticalAlign="middle">
            <Text size="tiny" secondary>Current Status:</Text>
            <Badge
              size="small"
              skin={
                approvalStatus === 'go' ? 'success' :
                approvalStatus === 'no-go' ? 'danger' : 'warning'
              }
            >
              {approvalStatus === 'go' ? 'Approved (Go)' :
               approvalStatus === 'no-go' ? 'Rejected (No Go)' : 'Pending Decision'}
            </Badge>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Compliance Milestones Section */}
      <Box direction="vertical" gap={3}>
        <Text size="small" weight="bold">Compliance Milestones</Text>
        
        <Box direction="vertical" gap={2}>
          {/* Finance T&C */}
          <ComplianceToggle
            label="Finance Terms & Conditions"
            description="Customer has agreed to finance terms"
            checked={financeTC}
            onChange={(checked) => onUpdateCompliance('financeTC', checked)}
          />

          {/* Installation T&C */}
          <ComplianceToggle
            label="Installation Terms & Conditions"
            description="Customer has agreed to installation terms"
            checked={installationTC}
            onChange={(checked) => onUpdateCompliance('installationTC', checked)}
          />

          {/* Project Complete T&C */}
          <ComplianceToggle
            label="Project Completion Terms & Conditions"
            description="Project completion acknowledgment signed"
            checked={projectCompleteTC}
            onChange={(checked) => onUpdateCompliance('projectCompleteTC', checked)}
          />
        </Box>

        {/* Progress Summary */}
        <Box
          padding="12px 16px"
          backgroundColor="#e8f5e9"
          borderRadius="8px"
          align="space-between"
          verticalAlign="middle"
        >
          <Text size="small">Compliance Progress</Text>
          <Text size="small" weight="bold">
            {[financeTC, installationTC, projectCompleteTC].filter(Boolean).length} / 3
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

/**
 * ComplianceToggle - Toggle switch for compliance items
 */
interface ComplianceToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ComplianceToggle({ label, description, checked, onChange }: ComplianceToggleProps) {
  return (
    <Box
      padding="12px 16px"
      backgroundColor="#ffffff"
      borderRadius="8px"
      align="space-between"
      verticalAlign="middle"
    >
      <Box direction="vertical" gap={1}>
        <Text size="small">{label}</Text>
        <Text size="tiny" secondary>{description}</Text>
      </Box>
      
      <ToggleSwitch
        checked={checked}
        onChange={() => onChange(!checked)}
      />
    </Box>
  );
}

