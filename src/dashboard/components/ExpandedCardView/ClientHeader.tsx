import React from 'react';
import { Box, Text, Avatar, Badge, Divider } from '@wix/design-system';
import * as Icons from '@wix/wix-ui-icons-common';
import { ClientProfile, KanbanCard, ClientInfo } from '../../types/kanbanCard.js';

/**
 * ClientHeader - Row A of the expanded card view
 * 
 * Displays client information from the ClientProfiles collection:
 * - Avatar with initials
 * - Full name and contact details
 * - Address information
 * - Stage badge
 * 
 * @param profile - Client profile data
 * @param card - Kanban card data for stage info
 * @param onUpdateProfile - Callback to update profile
 */

export interface ClientHeaderProps {
  profile: ClientProfile | null;
  card: KanbanCard | null;
  onUpdateProfile?: (updates: Partial<ClientInfo>) => void;
}

export default function ClientHeader({
  profile,
  card,
  onUpdateProfile,
}: ClientHeaderProps) {
  const clientInfo = profile?.clientInfo;
  
  // Generate initials from name
  const initials = clientInfo
    ? `${clientInfo.firstName?.charAt(0) || ''}${clientInfo.lastName?.charAt(0) || ''}`
    : '?';

  // Full name
  const fullName = clientInfo
    ? `${clientInfo.firstName || ''} ${clientInfo.lastName || ''}`.trim() || 'Unknown Contact'
    : 'Loading...';

  // Format address if available
  const address = clientInfo?.address;
  const formattedAddress = address
    ? [address.street, address.city, address.postcode, address.country]
        .filter(Boolean)
        .join(', ')
    : null;

  return (
    <Box
      direction="vertical"
      padding="20px"
      marginBottom={4}
      backgroundColor="#f7f8fa"
      borderRadius="8px"
    >
      <Box gap={4} verticalAlign="top">
        {/* Avatar */}
        <Avatar
          size="size60"
          name={fullName}
          text={initials}
          color="A1"
        />

        {/* Client Details */}
        <Box direction="vertical" gap={2} flex={1}>
          {/* Name and Stage */}
          <Box align="space-between" verticalAlign="middle">
            <Text weight="bold" size="medium">
              {fullName}
            </Text>
            {card?.stage && (
              <Badge skin="general" size="small">
                {card.stage}
              </Badge>
            )}
          </Box>

          {/* Company and Job Title */}
          {(clientInfo?.company || clientInfo?.jobTitle) && (
            <Text size="small" secondary>
              {[clientInfo.jobTitle, clientInfo.company].filter(Boolean).join(' at ')}
            </Text>
          )}

          <Divider />

          {/* Contact Information */}
          <Box gap={6} wrap="wrap">
            {/* Email */}
            {clientInfo?.email && (
              <Box gap={2} verticalAlign="middle">
                <Icons.Email />
                <Text size="small">{clientInfo.email}</Text>
              </Box>
            )}

            {/* Phone */}
            {clientInfo?.phone && (
              <Box gap={2} verticalAlign="middle">
                <Icons.Phone />
                <Text size="small">{clientInfo.phone}</Text>
              </Box>
            )}

            {/* Address */}
            {formattedAddress && (
              <Box gap={2} verticalAlign="middle">
                <Icons.Location />
                <Text size="small">{formattedAddress}</Text>
              </Box>
            )}
          </Box>

          {/* Extended Details Summary */}
          {profile?.extendedDetails && (
            <Box gap={4} marginTop={2}>
              {profile.extendedDetails.propertyType && (
                <Box gap={1}>
                  <Text size="tiny" secondary>Property:</Text>
                  <Text size="tiny">{profile.extendedDetails.propertyType}</Text>
                </Box>
              )}
              {profile.extendedDetails.preferredContactMethod && (
                <Box gap={1}>
                  <Text size="tiny" secondary>Preferred Contact:</Text>
                  <Text size="tiny">{profile.extendedDetails.preferredContactMethod}</Text>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Readiness and Finance Status */}
      {(card?.readinessLevel || card?.financeStatus) && (
        <Box marginTop={3} gap={4}>
          {card.readinessLevel !== undefined && (
            <Box direction="vertical" gap={1}>
              <Text size="tiny" secondary>Readiness Level</Text>
              <Box gap={1}>
                {[1, 2, 3, 4, 5].map(level => (
                  <div
                    key={level}
                    style={{
                      width: '20px',
                      height: '8px',
                      borderRadius: '4px',
                      backgroundColor: level <= (card.readinessLevel || 0)
                        ? '#4CAF50'
                        : '#E0E0E0',
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
          {card.financeStatus && (
            <Box direction="vertical" gap={1}>
              <Text size="tiny" secondary>Finance Status</Text>
              <Badge
                size="tiny"
                skin={
                  card.financeStatus === 'approved' ? 'success' :
                  card.financeStatus === 'pending' ? 'warning' :
                  card.financeStatus === 'rejected' ? 'danger' : 'general'
                }
              >
                {card.financeStatus}
              </Badge>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

