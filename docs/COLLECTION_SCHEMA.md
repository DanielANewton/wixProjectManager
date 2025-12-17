# Collection Schema Reference

> **⚠️ IMPORTANT: This is a REFERENCE DOCUMENT ONLY**
> 
> This file documents the data collection schema for reference purposes.
> The **live/authoritative schema** is managed through the **Wix App Management Console**.
> 
> Do NOT rely on this file as the source of truth - always check the Wix console
> for the current schema configuration.
> 
> Last updated from Wix console: December 2024

---

## Overview

This app uses three Wix Data Collections:

| Collection | Purpose |
|------------|---------|
| **ClientProfiles** | Stores client information linked to CRM contacts |
| **KanbanCards** | Stores workflow/sales pipeline cards linked to profiles |
| **ActivityLog** | Stores history entries and comments for cards |

### Data Flow

```
CRM Contact → ClientProfiles → KanbanCards → ActivityLog
```

---

## Collection: ClientProfiles

**ID Suffix:** `ClientProfiles`  
**Display Name:** Client Profiles  
**Display Field:** `contactId`

### Fields

| Key | Type | Description |
|-----|------|-------------|
| `contactId` | TEXT | Reference to the CRM contact ID |
| `clientInfo` | ANY | JSON object with client details (firstName, lastName, email, phone, address, company, jobTitle) |
| `extendedDetails` | ANY | JSON object with additional details (propertyType, propertyAge, currentEnergyCost, notes, customFields) |

### Permissions

- Read: ANYONE
- Insert: ANYONE
- Update: ANYONE
- Remove: ANYONE

---

## Collection: KanbanCards

**ID Suffix:** `KanbanCards`  
**Display Name:** Kanban Cards  
**Display Field:** `stage`

### Fields

| Key | Type | Description |
|-----|------|-------------|
| `profileId` | TEXT | Reference to ClientProfiles._id |
| `stageId` | TEXT | Workflow stage identifier (e.g., 'engage', 'qualification') |
| `stage` | TEXT | Display name of current stage |
| `notes` | TEXT | General notes for the card |
| `readinessLevel` | NUMBER | Client readiness score |
| `financeStatus` | TEXT | Finance status |
| `interestTags` | ANY | Array of interest tags |
| `tags` | ANY | Array of general tags |
| `formData` | ANY | Qualification form responses |
| `marketingPipelines` | ANY | Marketing pipeline data |
| `tenders` | ANY | Array of tender submissions |
| `quotes` | ANY | Quote data |
| `approvalStatus` | TEXT | 'pending', 'go', or 'no-go' |
| `financeTC` | BOOLEAN | Finance T&C accepted |
| `installationTC` | BOOLEAN | Installation T&C accepted |
| `projectCompleteTC` | BOOLEAN | Project completion T&C accepted |
| `callBackAppointmentDate` | DATETIME | Scheduled callback date |
| `nextAppointment` | DATETIME | Next appointment date |
| `debriefDate` | DATETIME | Debrief date |
| `lastUpdatedBy` | ANY | JSON object tracking who last updated the card (userId, userName, userPhoto, updatedAt) |

### Permissions

- Read: ANYONE
- Insert: ANYONE
- Update: ANYONE
- Remove: ANYONE

---

## Collection: ActivityLog

**ID Suffix:** `ActivityLog`  
**Display Name:** Activity Log  
**Display Field:** `content`

### Fields

| Key | Type | Description |
|-----|------|-------------|
| `cardId` | TEXT | Reference to KanbanCards._id |
| `entryType` | TEXT | 'history' or 'comment' |
| `content` | TEXT | Entry content/description |
| `userId` | TEXT | User who created the entry |
| `userName` | TEXT | Display name of the user (nickname preferred) |
| `userPhoto` | TEXT | Profile photo URL of the user (for avatar display) |
| `metadata` | ANY | Additional data (field changes, parent comment ID, etc.) |

### Permissions

- Read: ANYONE
- Insert: ANYONE
- Update: ANYONE
- Remove: ANYONE

---

## Full Namespaced Collection IDs

When accessing collections in code, use the full namespaced IDs:

```javascript
const CLIENT_PROFILES = '@daniel02231/project-manager-v0/ClientProfiles';
const KANBAN_CARDS = '@daniel02231/project-manager-v0/KanbanCards';
const ACTIVITY_LOG = '@daniel02231/project-manager-v0/ActivityLog';
```

---

## Notes for Developers

1. **Schema changes** must be made in the Wix App Management Console, not in code
2. **ANY type fields** store JSON objects - see TypeScript interfaces in `src/dashboard/types/kanbanCard.ts` for structure
3. **Indexes** are not currently configured - add via Wix console if query performance becomes an issue
4. **Permissions** are set to ANYONE for development - review for production security requirements
5. **User Authentication** - Use the Dashboard SDK approach (`createClient` with `dashboard.host()` and `dashboard.auth()`) to get current user info in dashboard pages. See `src/dashboard/hooks/useCurrentUser.ts` for implementation.
6. **User Tracking** - The `lastUpdatedBy` field on cards and `userPhoto` field on activity log entries enable audit trails showing who made changes with their profile photo for visual identification.

---

## Raw Schema JSON

The following is the raw schema export from the Wix App Management Console.
This can be used as a reference when comparing against the live schema.

```json
{
  "collections": [
    {
      "idSuffix": "ClientProfiles",
      "displayName": "Client Profiles",
      "displayField": "contactId",
      "fields": [
        {
          "key": "contactId",
          "type": "TEXT",
          "encrypted": false
        },
        {
          "key": "clientInfo",
          "type": "ANY",
          "encrypted": false
        },
        {
          "key": "extendedDetails",
          "type": "ANY",
          "encrypted": false
        }
      ],
      "dataPermissions": {
        "itemRead": "ANYONE",
        "itemInsert": "ANYONE",
        "itemUpdate": "ANYONE",
        "itemRemove": "ANYONE"
      },
      "indexes": [],
      "initialData": []
    },
    {
      "idSuffix": "KanbanCards",
      "displayName": "Kanban Cards",
      "displayField": "stage",
      "fields": [
        {
          "key": "profileId",
          "type": "TEXT",
          "encrypted": false
        },
        {
          "key": "stageId",
          "type": "TEXT",
          "encrypted": false
        },
        {
          "key": "stage",
          "type": "TEXT",
          "encrypted": false
        },
        {
          "key": "notes",
          "type": "TEXT",
          "encrypted": false
        },
        {
          "key": "readinessLevel",
          "type": "NUMBER",
          "encrypted": false
        },
        {
          "key": "financeStatus",
          "type": "TEXT",
          "encrypted": false
        },
        {
          "key": "interestTags",
          "type": "ANY",
          "encrypted": false
        },
        {
          "key": "tags",
          "type": "ANY",
          "encrypted": false
        },
        {
          "key": "formData",
          "type": "ANY",
          "encrypted": false
        },
        {
          "key": "marketingPipelines",
          "type": "ANY",
          "encrypted": false
        },
        {
          "key": "tenders",
          "type": "ANY",
          "encrypted": false
        },
        {
          "key": "quotes",
          "type": "ANY",
          "encrypted": false
        },
        {
          "key": "approvalStatus",
          "type": "TEXT",
          "encrypted": false
        },
        {
          "key": "financeTC",
          "type": "BOOLEAN",
          "encrypted": false
        },
        {
          "key": "installationTC",
          "type": "BOOLEAN",
          "encrypted": false
        },
        {
          "key": "projectCompleteTC",
          "type": "BOOLEAN",
          "encrypted": false
        },
        {
          "key": "callBackAppointmentDate",
          "type": "DATETIME",
          "encrypted": false
        },
        {
          "key": "nextAppointment",
          "type": "DATETIME",
          "encrypted": false
        },
        {
          "key": "debriefDate",
          "type": "DATETIME",
          "encrypted": false
        },
        {
          "key": "lastUpdatedBy",
          "type": "ANY",
          "encrypted": false
        }
      ],
      "dataPermissions": {
        "itemRead": "ANYONE",
        "itemInsert": "ANYONE",
        "itemUpdate": "ANYONE",
        "itemRemove": "ANYONE"
      },
      "indexes": [],
      "initialData": []
    },
    {
      "idSuffix": "ActivityLog",
      "displayName": "Activity Log",
      "displayField": "content",
      "fields": [
        {
          "key": "cardId",
          "type": "TEXT",
          "encrypted": false
        },
        {
          "key": "entryType",
          "type": "TEXT",
          "encrypted": false
        },
        {
          "key": "content",
          "type": "TEXT",
          "encrypted": false
        },
        {
          "key": "userId",
          "type": "TEXT",
          "encrypted": false
        },
        {
          "key": "userName",
          "type": "TEXT",
          "encrypted": false
        },
        {
          "key": "userPhoto",
          "type": "TEXT",
          "encrypted": false
        },
        {
          "key": "metadata",
          "type": "ANY",
          "encrypted": false
        }
      ],
      "dataPermissions": {
        "itemRead": "ANYONE",
        "itemInsert": "ANYONE",
        "itemUpdate": "ANYONE",
        "itemRemove": "ANYONE"
      },
      "indexes": [],
      "initialData": []
    }
  ]
}
```

