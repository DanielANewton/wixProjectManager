import React, { useState } from 'react';
import { 
  Box, 
  Text, 
  Input, 
  InputArea, 
  Button, 
  Badge,
  Table,
  TableToolbar,
  Divider,
  FormField,
} from '@wix/design-system';
import { Tender } from '../../../types/kanbanCard.js';

/**
 * TenderTab - Tender submission and management
 * 
 * Features:
 * - Submit new tenders to CRM
 * - View existing tender submissions
 * - Track tender status
 * 
 * @param tenders - Array of submitted tenders
 * @param onSubmitTender - Callback to submit a new tender
 */

export interface TenderTabProps {
  tenders: Tender[];
  onSubmitTender: (tender: Tender) => void;
}

export default function TenderTab({ tenders, onSubmitTender }: TenderTabProps) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle tender submission
  const handleSubmit = async () => {
    if (!amount) return;
    
    setIsSubmitting(true);
    try {
      const newTender: Tender = {
        id: `tender-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        amount: parseFloat(amount),
        status: 'pending',
        notes: notes || undefined,
      };
      
      onSubmitTender(newTender);
      setAmount('');
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(value);
  };

  // Get status badge skin
  const getStatusSkin = (status: Tender['status']) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'danger';
      default: return 'warning';
    }
  };

  return (
    <Box direction="vertical" gap={4}>
      {/* Submit Tender Form */}
      <Box direction="vertical" gap={3}>
        <Text size="small" weight="bold">Submit New Tender</Text>
        
        <Box
          padding="16px"
          backgroundColor="#ffffff"
          borderRadius="8px"
          direction="vertical"
          gap={3}
        >
          <Box gap={3}>
            <FormField label="Tender Amount (£)" required>
              <Input
                size="small"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount..."
                prefix={<Text>£</Text>}
              />
            </FormField>
          </Box>

          <FormField label="Notes">
            <InputArea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes for the tender..."
              rows={2}
            />
          </FormField>

          <Box align="right">
            <Button
              size="small"
              onClick={handleSubmit}
              disabled={!amount || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Tender'}
            </Button>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Tenders List */}
      <Box direction="vertical" gap={3}>
        <Text size="small" weight="bold">
          Submitted Tenders ({tenders.length})
        </Text>

        {tenders.length === 0 ? (
          <Box
            padding="24px"
            backgroundColor="#ffffff"
            borderRadius="8px"
            align="center"
          >
            <Text secondary size="small">
              No tenders submitted yet
            </Text>
          </Box>
        ) : (
          <Box direction="vertical" gap={2}>
            {tenders.map((tender) => (
              <Box
                key={tender.id}
                padding="12px 16px"
                backgroundColor="#ffffff"
                borderRadius="8px"
                align="space-between"
                verticalAlign="middle"
              >
                <Box direction="vertical" gap={1}>
                  <Text size="small" weight="bold">
                    {formatCurrency(tender.amount)}
                  </Text>
                  <Text size="tiny" secondary>
                    Submitted: {new Date(tender.submittedAt).toLocaleDateString()}
                  </Text>
                  {tender.notes && (
                    <Text size="tiny" secondary>
                      {tender.notes}
                    </Text>
                  )}
                </Box>
                
                <Badge size="small" skin={getStatusSkin(tender.status)}>
                  {tender.status.charAt(0).toUpperCase() + tender.status.slice(1)}
                </Badge>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

