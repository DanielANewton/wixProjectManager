import React, { useState, useCallback } from 'react';
import {
  Page,
  Box,
  Text,
  Button,
  Loader,
  Card,
  Dropdown,
  Table,
  TableToolbar,
  Checkbox,
  Badge,
  Divider,
} from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import { withProviders } from '../../withProviders.js';
import {
  getLabels,
  getContactsByLabel,
  getAllContacts,
  getContactDisplayName,
  CrmLabel,
  CrmContact,
} from '../../services/crmService.js';
import { upsertProfile } from '../../services/clientProfileService.js';
import { upsertCardForProfile } from '../../services/cardService.js';
import { ClientInfo } from '../../types/kanbanCard.js';

/**
 * ImportPage - CRM Contact Import Dashboard
 *
 * This page allows users to:
 * 1. Select a CRM label/tag to filter contacts
 * 2. Load and view contacts with that label
 * 3. Select individual contacts or select all
 * 4. Import selected contacts to ClientProfiles and create Kanban cards
 *
 * Data Flow: CRM Contacts -> Import Dashboard -> ClientProfiles -> KanbanCards
 */
function ImportPage() {
  // State for labels dropdown
  const [labels, setLabels] = useState<CrmLabel[]>([]);
  const [selectedLabelKey, setSelectedLabelKey] = useState<string>('');
  const [isLoadingLabels, setIsLoadingLabels] = useState(false);

  // State for contacts list
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // State for selection
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());

  // State for import operation
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    total: number;
  } | null>(null);

  /**
   * Loads all available CRM labels for the dropdown
   */
  const loadLabels = useCallback(async () => {
    setIsLoadingLabels(true);
    try {
      const fetchedLabels = await getLabels();
      setLabels(fetchedLabels);
    } catch (error) {
      console.error('Failed to load labels:', error);
    } finally {
      setIsLoadingLabels(false);
    }
  }, []);

  /**
   * Loads contacts filtered by the selected label
   * If no label is selected, loads all contacts
   */
  const loadContacts = useCallback(async () => {
    setIsLoadingContacts(true);
    setSelectedContactIds(new Set()); // Clear selection when loading new contacts
    setImportResults(null);

    try {
      let fetchedContacts: CrmContact[];

      if (selectedLabelKey) {
        fetchedContacts = await getContactsByLabel(selectedLabelKey);
      } else {
        fetchedContacts = await getAllContacts();
      }

      setContacts(fetchedContacts);
    } catch (error) {
      console.error('Failed to load contacts:', error);
      setContacts([]);
    } finally {
      setIsLoadingContacts(false);
    }
  }, [selectedLabelKey]);

  /**
   * Toggles selection for a single contact
   */
  const toggleContactSelection = useCallback((contactId: string) => {
    setSelectedContactIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
      }
      return newSet;
    });
  }, []);

  /**
   * Selects all currently visible contacts
   */
  const selectAll = useCallback(() => {
    const allIds = new Set(contacts.map((c) => c._id));
    setSelectedContactIds(allIds);
  }, [contacts]);

  /**
   * Deselects all contacts
   */
  const deselectAll = useCallback(() => {
    setSelectedContactIds(new Set());
  }, []);

  /**
   * Imports selected contacts to ClientProfiles and creates Kanban cards
   *
   * For each selected contact:
   * 1. Create or update a ClientProfile with the contact data
   * 2. Create or update a KanbanCard linked to that profile
   */
  const importSelectedContacts = useCallback(async () => {
    if (selectedContactIds.size === 0) return;

    setIsImporting(true);
    let successCount = 0;
    let failedCount = 0;

    const selectedContacts = contacts.filter((c) => selectedContactIds.has(c._id));

    for (const contact of selectedContacts) {
      try {
        // Build client info from CRM contact data
        const clientInfo: ClientInfo = {
          firstName: contact.firstName || '',
          lastName: contact.lastName || '',
          email: contact.email || '',
          phone: contact.phone || '',
        };

        // Step 1: Create or update the ClientProfile
        const profile = await upsertProfile(contact._id, clientInfo, {});
        console.log('👤 upsertProfile result', { contactId: contact._id, profile });

        if (profile?._id) {
          console.log('📇 Created/updated profile for contact', contact._id, 'profileId:', profile._id);
          // Step 2: Create or update a KanbanCard for this profile
          // Cards start in the "Engage" stage by default
          const cardResult = await upsertCardForProfile(profile._id, {
            stageId: 'engage',
            stage: '1. Engage',
              readinessLevel: 1,
              financeStatus: 'unknown',
              callBackAppointmentDate: null,
          });
          console.log('🎴 Upsert card result for profile', profile._id, cardResult);

          successCount++;
          console.log('✅ Imported contact:', getContactDisplayName(contact));
        } else {
          failedCount++;
          console.error('❌ Profile missing _id after upsert', { contactId: contact._id, profile });
        }
      } catch (error) {
        failedCount++;
        console.error('❌ Error importing contact:', contact._id, error);
      }
    }

    setImportResults({
      success: successCount,
      failed: failedCount,
      total: selectedContacts.length,
    });

    // Clear selection after import
    setSelectedContactIds(new Set());
    setIsImporting(false);
  }, [contacts, selectedContactIds]);

  /**
   * Converts labels to dropdown options format
   */
  const labelOptions = labels.map((label) => ({
    id: label.key,
    value: label.displayName,
  }));

  /**
   * Table columns configuration
   */
  const columns = [
    {
      title: '',
      render: (row: CrmContact) => (
        <Checkbox
          checked={selectedContactIds.has(row._id)}
          onChange={() => toggleContactSelection(row._id)}
        />
      ),
      width: '48px',
    },
    {
      title: 'Name',
      render: (row: CrmContact) => (
        <Text weight="bold">{getContactDisplayName(row)}</Text>
      ),
    },
    {
      title: 'Email',
      render: (row: CrmContact) => (
        <Text size="small">{row.email || '-'}</Text>
      ),
    },
    {
      title: 'Phone',
      render: (row: CrmContact) => (
        <Text size="small">{row.phone || '-'}</Text>
      ),
    },
    {
      title: 'Labels',
      render: (row: CrmContact) => (
        <Box gap="SP1" direction="horizontal">
          {(row.labelKeys || []).slice(0, 3).map((labelKey) => (
            <Badge key={labelKey} size="small" skin="neutralLight">
              {labelKey}
            </Badge>
          ))}
          {(row.labelKeys || []).length > 3 && (
            <Badge size="small" skin="neutralLight">
              +{(row.labelKeys || []).length - 3}
            </Badge>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Page height="100vh">
      <Page.Header
        title="Import Contacts"
        subtitle="Select CRM contacts to import into the Kanban workflow"
      />
      <Page.Content>
        <Box direction="vertical" gap="SP4">
          {/* Instructions */}
          <Text secondary size="small">
            Filter contacts by label, select the ones you want to import, then click "Import Selected" 
            to create ClientProfiles and Kanban cards.
          </Text>

          {/* Filter Section */}
          <Card>
            <Card.Header title="Filter Contacts" />
            <Card.Divider />
            <Card.Content>
              <Box direction="horizontal" gap="SP3" verticalAlign="bottom">
                {/* Load Labels Button */}
                <Box direction="vertical" gap="SP1">
                  <Text size="tiny" secondary>
                    Step 1: Load available labels
                  </Text>
                  <Button
                    size="small"
                    priority="secondary"
                    onClick={loadLabels}
                    disabled={isLoadingLabels}
                  >
                    {isLoadingLabels ? <Loader size="tiny" /> : 'Load Labels'}
                  </Button>
                </Box>

                {/* Label Dropdown */}
                <Box direction="vertical" gap="SP1" width="250px">
                  <Text size="tiny" secondary>
                    Step 2: Select a label (optional)
                  </Text>
                  <Dropdown
                    placeholder="All Contacts"
                    options={[
                      { id: '', value: 'All Contacts' },
                      ...labelOptions,
                    ]}
                    selectedId={selectedLabelKey}
                    onSelect={(option) =>
                      setSelectedLabelKey(option?.id?.toString() || '')
                    }
                    disabled={labels.length === 0}
                  />
                </Box>

                {/* Load Contacts Button */}
                <Box direction="vertical" gap="SP1">
                  <Text size="tiny" secondary>
                    Step 3: Load contacts
                  </Text>
                  <Button
                    size="small"
                    onClick={loadContacts}
                    disabled={isLoadingContacts}
                  >
                    {isLoadingContacts ? (
                      <Loader size="tiny" />
                    ) : (
                      'Load Contacts'
                    )}
                  </Button>
                </Box>
              </Box>
            </Card.Content>
          </Card>

          {/* Contacts Table */}
          {contacts.length > 0 && (
            <Card>
              <Card.Header
                title={`Contacts (${contacts.length})`}
                suffix={
                  <Box gap="SP2" direction="horizontal">
                    <Text size="small" secondary>
                      {selectedContactIds.size} selected
                    </Text>
                    <Button size="tiny" priority="secondary" onClick={selectAll}>
                      Select All
                    </Button>
                    <Button
                      size="tiny"
                      priority="secondary"
                      onClick={deselectAll}
                      disabled={selectedContactIds.size === 0}
                    >
                      Deselect All
                    </Button>
                  </Box>
                }
              />
              <Card.Divider />
              <Card.Content>
                <Table
                  data={contacts}
                  columns={columns}
                  rowVerticalPadding="small"
                >
                  <Table.Content />
                </Table>
              </Card.Content>
            </Card>
          )}

          {/* Import Section */}
          {contacts.length > 0 && (
            <Card>
              <Card.Header title="Import to Kanban" />
              <Card.Divider />
              <Card.Content>
                <Box direction="vertical" gap="SP3">
                  <Text size="small">
                    Selected contacts will be added to the ClientProfiles collection 
                    and a Kanban card will be created in the "Engage" stage.
                  </Text>

                  <Box direction="horizontal" gap="SP3" verticalAlign="middle">
                    <Button
                      onClick={importSelectedContacts}
                      disabled={selectedContactIds.size === 0 || isImporting}
                      skin="premium"
                    >
                      {isImporting ? (
                        <>
                          <Loader size="tiny" /> Importing...
                        </>
                      ) : (
                        `Import ${selectedContactIds.size} Contact${selectedContactIds.size !== 1 ? 's' : ''}`
                      )}
                    </Button>

                    {/* Import Results */}
                    {importResults && (
                      <Box gap="SP2" direction="horizontal">
                        <Badge skin="success">
                          {importResults.success} imported
                        </Badge>
                        {importResults.failed > 0 && (
                          <Badge skin="danger">
                            {importResults.failed} failed
                          </Badge>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Card.Content>
            </Card>
          )}

          {/* Empty State */}
          {!isLoadingContacts && contacts.length === 0 && (
            <Card>
              <Card.Content>
                <Box
                  direction="vertical"
                  align="center"
                  padding="SP6"
                  gap="SP2"
                >
                  <Text size="medium" weight="bold">
                    No contacts loaded
                  </Text>
                  <Text secondary>
                    Load labels, optionally select a filter, then click "Load Contacts" 
                    to see CRM contacts here.
                  </Text>
                </Box>
              </Card.Content>
            </Card>
          )}
        </Box>
      </Page.Content>
    </Page>
  );
}

// Wrap with providers for Wix Design System and React Query support
export default withProviders(ImportPage);

