# Mini SOC System - API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
Most endpoints require JWT authentication. Include the access token in:
- **Cookie**: `accessToken` (preferred)
- **Header**: `Authorization: Bearer <token>`

---

## Table of Contents
1. [Authentication Routes](#authentication-routes)
2. [Log Routes](#log-routes)
3. [Incident Routes](#incident-routes)
4. [Admin Routes](#admin-routes)
5. [Admin Profile Routes](#admin-profile-routes)
6. [Analyst Profile Routes](#analyst-profile-routes)
7. [AI & Chatbot Routes](#ai--chatbot-routes)

---

## Authentication Routes
**Base Path:** `/api/v1/auth`

### 1. Register Analyst
**POST** `/register/analyst`

Register a new analyst account.

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:**
  ```json
  {
    "name": "string (required)",
    "email": "string (required)",
    "phone_no": "string (required)",
    "password": "string (required)",
    "profilePhoto": "file (optional)"
  }
  ```

**Response:** `201 Created`
```json
{
  "statusCode": 201,
  "data": {
    "user": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "analyst"
    }
  },
  "message": "Analyst registered. Please verify your email to activate your account."
}
```

---

### 2. Register Admin
**POST** `/register/admin`

Register a new admin account.

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:**
  ```json
  {
    "name": "string (required)",
    "email": "string (required)",
    "phone_no": "string (required)",
    "password": "string (required)",
    "profilePhoto": "file (optional)"
  }
  ```

**Response:** `201 Created`
```json
{
  "statusCode": 201,
  "data": {
    "user": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "admin"
    }
  },
  "message": "Admin registered. Please verify your email to activate your account."
}
```

---

### 3. Login
**POST** `/login`

Authenticate user and receive access/refresh tokens.

**Request:**
```json
{
  "identifier": "string (required) - email/phone/username",
  "password": "string (required)",
  "role": "string (required) - 'analyst' or 'admin'"
}
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "profilePhoto": "string"
    },
    "accessToken": "string",
    "refreshToken": "string"
  },
  "message": "User logged in successfully"
}
```

**Cookies Set:**
- `accessToken` (15 minutes)
- `refreshToken` (7 days)

---

### 4. Logout
**POST** `/logout`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {},
  "message": "User logged out successfully"
}
```

---

### 5. Get Current User
**GET** `/me`

**Authentication:** Required (verifyJWT)

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "profilePhoto": "string",
      ...
    }
  },
  "message": "Current user fetched successfully"
}
```

---

### 6. Refresh Access Token
**POST** `/refresh-token`

Refresh the access token using refresh token.

**Request:**
- **Cookie:** `refreshToken` OR
- **Body:**
  ```json
  {
    "refreshToken": "string"
  }
  ```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "string",
    "refreshToken": "string"
  },
  "message": "Access token refreshed"
}
```

---

### 7. Verify Authentication
**GET** `/verify`

Check if the current token is valid.

**Request:**
- **Cookie:** `accessToken` OR
- **Header:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "isAuthenticated": true,
    "user": { ... }
  },
  "message": "Authenticated"
}
```

**Error Responses:**
- `304 Not Modified` - Expired token
- `400 Bad Request` - Malformed token
- `401 Unauthorized` - Invalid/tampered token

---

### 8. Update Profile Image
**POST** `/update-profile-image`

**Authentication:** Required

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:**
  ```json
  {
    "profilePhoto": "file (required)"
  }
  ```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "user": { ... }
  },
  "message": "Profile photo updated"
}
```

---

### 9. Verify Email
**GET** `/verify-email`

Verify email address using token from verification link.

**Query Parameters:**
- `token` (required) - Verification token
- `role` (required) - 'analyst' or 'admin'

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Email verified successfully!"
}
```

---

### 10. Google Login
**POST** `/google-login`

Authenticate using Google OAuth.

**Request:**
```json
{
  "code": "string (required) - OAuth authorization code"
}
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "user": { ... },
    "accessToken": "string",
    "refreshToken": "string",
    "isNewUser": false
  },
  "message": "Google login successful"
}
```

**OR** (if new user):
```json
{
  "statusCode": 200,
  "data": {
    "email": "string",
    "name": "string",
    "profilePhoto": "string",
    "isNewUser": true
  },
  "message": "User not found, please complete registration"
}
```

---

### 11. Google Register
**POST** `/google-register`

Complete registration after Google login.

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:**
  ```json
  {
    "name": "string (required)",
    "email": "string (required)",
    "phone_no": "string (required)",
    "role": "string (required) - 'analyst' or 'admin'",
    "profilePhoto": "string (optional) - Google photo URL",
    "profilePhoto": "file (optional) - Override with custom photo"
  }
  ```

**Response:** `201 Created`
```json
{
  "statusCode": 201,
  "data": {
    "user": { ... },
    "accessToken": "string",
    "refreshToken": "string"
  },
  "message": "Google registration successful"
}
```

---

### 12. Get Profile Image
**GET** `/profile-image`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "profilePhoto": "string"
  },
  "message": "Profile image fetched successfully"
}
```

---

## Log Routes
**Base Path:** `/api/v1/logs`

### 1. Create Log
**POST** `/`

Create a new log entry. Public endpoint (no auth required).

**Request:**
```json
{
  "logId": "string (optional) - auto-generated if missing",
  "timestamp": "ISO date string (optional) - defaults to now",
  "sourceIP": "string (optional)",
  "sourceType": "string (optional) - defaults to 'APP'",
  "targetSystem": "string (optional)",
  "endpoint": "string (optional)",
  "statusCode": "number (optional)",
  "category": "string (optional) - 'REQUEST', 'SECURITY', etc.",
  "eventType": "string (optional)",
  "severity": "string (optional) - 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'",
  "classification": "string (optional)",
  "attackVector": "string (optional)",
  "details": "object (optional)"
}
```

**Response:** `201 Created`
```json
{
  "statusCode": 201,
  "data": {
    "log": { ... }
  },
  "message": "Log created and processed successfully"
}
```

**Note:** If `category` is "SECURITY", the log is automatically processed by the threat engine and may create an incident.

---

### 2. Get Logs
**GET** `/`

Retrieve logs with filtering and pagination.

**Query Parameters:**
- `page` (optional) - Default: 1
- `limit` (optional) - Default: 10
- `severity` (optional) - Filter by severity
- `classification` (optional) - Filter by classification
- `attackVector` (optional) - Filter by attack vector
- `category` (optional) - Filter by category
- `sourceIP` (optional) - Partial match search
- `endpoint` (optional) - Partial match search
- `startTime` (optional) - ISO date string
- `endTime` (optional) - ISO date string

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "logs": [ ... ],
    "totalLogs": 100,
    "page": 1,
    "totalPages": 10
  },
  "message": "Logs fetched successfully"
}
```

---

### 3. Get Log Statistics
**GET** `/stats`

Get aggregated log statistics.

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "summary": {
      "totalLogs": 1000,
      "securityLogs": 150
    },
    "severityDistribution": [
      { "_id": "HIGH", "count": 50 },
      { "_id": "MEDIUM", "count": 100 }
    ],
    "attackVectors": [
      { "_id": "SQL_INJECTION", "count": 20 }
    ],
    "timeline": [
      { "_id": 10, "count": 50, "securityCount": 5 }
    ],
    "topIPs": [
      { "_id": "192.168.1.1", "count": 100 }
    ],
    "topEndpoints": [
      { "_id": "/api/login", "count": 200 }
    ],
    "statusDist": [
      { "_id": 200, "count": 800 },
      { "_id": 401, "count": 50 }
    ],
    "incidentSummary": {
      "active": 10,
      "critical": 3
    }
  },
  "message": "Log stats fetched successfully"
}
```

---

## Incident Routes
**Base Path:** `/api/v1/incidents`

**Authentication:** Required (verifyJWT)

### 1. Get Incidents
**GET** `/`

Retrieve incidents with filtering and pagination.

**Query Parameters:**
- `page` (optional) - Default: 1
- `limit` (optional) - Default: 10
- `status` (optional) - 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'FALSE_POSITIVE', 'ASSIGNED'
- `severity` (optional) - 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
- `attackerIP` (optional) - Filter by source IP
- `assignedTo` (optional) - 
  - `'me'` - Get incidents assigned to current user
  - `'null'` or `'unassigned'` - Get unassigned incidents
  - `'pending'` - Get incidents with pending assignment requests
  - `userId` - Get incidents assigned to specific user

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "incidents": [ ... ],
    "totalIncidents": 50,
    "page": 1,
    "totalPages": 5
  },
  "message": "Incidents fetched successfully"
}
```

---

### 2. Get Incident Details
**GET** `/:incidentId`

Get detailed information about a specific incident.

**Path Parameters:**
- `incidentId` (required) - Incident ID

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "incident": {
      "_id": "string",
      "incidentId": "string",
      "type": "string",
      "severity": "string",
      "status": "string",
      "sourceIp": "string",
      "relatedLogs": [ ... ],
      "assignedTo": {
        "name": "string",
        "email": "string"
      },
      ...
    }
  },
  "message": "Details for incident {incidentId} fetched successfully"
}
```

---

### 3. Assign Incident
**POST** `/:incidentId/assign`

**Authorization:** Analyst or Admin

Assign an incident to the current user.

**Path Parameters:**
- `incidentId` (required)

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "incident": { ... }
  },
  "message": "Incident assigned to {email}"
}
```

**Error:** `403 Forbidden` - If incident is already assigned to another analyst (unless admin).

---

### 4. Unassign Incident
**POST** `/:incidentId/unassign`

**Authorization:** Analyst or Admin

Unassign an incident. Analysts can only unassign their own incidents.

**Path Parameters:**
- `incidentId` (required)

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "incident": { ... }
  },
  "message": "Incident unassigned successfully"
}
```

---

### 5. Request Assignment
**POST** `/:incidentId/request-assignment`

**Authorization:** Analyst only

Request assignment of an unassigned incident.

**Path Parameters:**
- `incidentId` (required)

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": null,
  "message": "Assignment request submitted successfully"
}
```

**Error:** `400 Bad Request` - If incident is already assigned or request already exists.

---

### 6. Triage Incident
**PATCH** `/:incidentId`

**Authorization:** Analyst or Admin

Update incident status, severity, assignment, or notes.

**Path Parameters:**
- `incidentId` (required)

**Request:**
```json
{
  "status": "string (optional) - 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'FALSE_POSITIVE', 'ASSIGNED'",
  "assignedTo": "string (optional) - User ID",
  "analystNotes": "string (optional)",
  "newSeverity": "string (optional) - 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'"
}
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "incident": { ... }
  },
  "message": "Incident {incidentId} triaged successfully."
}
```

**Restrictions:**
- Analysts can only move status to `IN_PROGRESS`
- Only admins can set status to `RESOLVED` or `FALSE_POSITIVE`

---

## Admin Routes
**Base Path:** `/api/v1/admin`

**Authentication:** Required (verifyJWT)
**Authorization:** Admin only

### 1. Get System Health
**GET** `/health`

Get system health metrics and statistics.

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "system": {
      "database": "UP",
      "api": "UP",
      "socket": "UNKNOWN"
    },
    "metrics": {
      "activeIncidents": 10,
      "criticalIncidents": 3,
      "blockedIPs": 25,
      "logsLastHour": 150,
      "logsLast24h": 2000,
      "mttr": "45m"
    },
    "topAttackers": [
      {
        "_id": "192.168.1.1",
        "count": 100,
        "country": "US"
      }
    ]
  },
  "message": "System health data fetched successfully"
}
```

---

### 2. Get Assignment Requests
**GET** `/assignment-requests`

Get all pending incident assignment requests.

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "string",
      "incident": {
        "incidentId": "string",
        "type": "string",
        "severity": "string",
        "sourceIp": "string",
        "status": "string"
      },
      "requestedBy": {
        "name": "string",
        "email": "string"
      },
      "status": "PENDING",
      "createdAt": "ISO date"
    }
  ],
  "message": "Assignment requests fetched successfully"
}
```

---

### 3. Handle Assignment Request
**POST** `/assignment-request/:requestId/handle`

Approve or reject an assignment request.

**Path Parameters:**
- `requestId` (required)

**Request:**
```json
{
  "action": "string (required) - 'APPROVE' or 'REJECT'"
}
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": null,
  "message": "Request approved and incident assigned"
}
```

**OR**
```json
{
  "statusCode": 200,
  "data": null,
  "message": "Request rejected"
}
```

---

### 4. Get All Incidents (Admin)
**GET** `/incidents`

Get all incidents with admin-specific sorting (by severity priority).

**Query Parameters:**
- `page` (optional) - Default: 1
- `limit` (optional) - Default: 10
- `status` (optional) - Filter by status

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "incidents": [ ... ],
    "total": 50,
    "page": 1,
    "limit": 10
  },
  "message": "Incidents fetched successfully"
}
```

**Note:** Incidents are sorted by severity (CRITICAL > HIGH > MEDIUM > LOW), then by lastSeenAt.

---

### 5. Update Incident (Admin)
**PATCH** `/incidents/:incidentId`

Update incident with admin privileges (can block IPs).

**Path Parameters:**
- `incidentId` (required)

**Request:**
```json
{
  "status": "string (optional)",
  "severity": "string (optional)",
  "assignedTo": "string (optional) - User ID",
  "blockIp": "boolean (optional) - Manually block the source IP",
  "analystNotes": "string (optional)"
}
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "incident": { ... }
  },
  "message": "Incident updated successfully"
}
```

**Note:** If `blockIp` is true, the source IP is automatically added to the blocklist with expiry based on severity:
- MEDIUM: 24 hours
- HIGH: 7 days
- CRITICAL: Permanent

---

### 6. Auto Resolve Incident
**POST** `/incidents/:incidentId/resolve`

Automatically resolve an incident and block the source IP.

**Path Parameters:**
- `incidentId` (required)

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "incident": { ... }
  },
  "message": "Incident auto-resolved successfully"
}
```

**Note:** Automatically blocks the source IP based on severity:
- MEDIUM: 24 hours
- HIGH: 7 days
- CRITICAL: Permanent
- LOW: No block

---

## Admin Sub-Routes

### Users Management
**Base Path:** `/api/v1/admin/users`

#### 1. Get All Users
**GET** `/`

Get all users (admins and analysts).

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      ...
    }
  ],
  "message": "Users fetched successfully"
}
```

---

#### 2. Create User
**POST** `/`

Create a new admin or analyst user.

**Request:**
```json
{
  "username": "string (required)",
  "password": "string (required)",
  "role": "string (required) - 'admin' or 'analyst'"
}
```

**Response:** `201 Created`
```json
{
  "statusCode": 201,
  "data": {
    "user": { ... }
  },
  "message": "User created successfully"
}
```

---

#### 3. Delete User
**DELETE** `/:id`

Delete a user by ID.

**Path Parameters:**
- `id` (required) - User ID

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": null,
  "message": "Admin user deleted successfully"
}
```

---

### Blocklist Management
**Base Path:** `/api/v1/admin/blocklist`

#### 1. Get Blocklist
**GET** `/`

Get all blocked IPs.

**Query Parameters:**
- `isActive` (optional) - Filter by active status ('true' or 'false')
- `ip` (optional) - Partial match search

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "string",
      "ip": "192.168.1.1",
      "reason": "string",
      "source": "MANUAL",
      "isActive": true,
      "expiresAt": "ISO date or null",
      "createdBy": "string",
      "createdAt": "ISO date"
    }
  ],
  "message": "Blocklist fetched successfully"
}
```

---

#### 2. Add Block
**POST** `/`

Manually add an IP to the blocklist.

**Request:**
```json
{
  "ip": "string (required)",
  "reason": "string (required)",
  "expiresAt": "ISO date string (optional) - null for permanent"
}
```

**Response:** `201 Created`
```json
{
  "statusCode": 201,
  "data": {
    "block": { ... }
  },
  "message": "IP blocked successfully"
}
```

**OR** `200 OK` if IP was previously blocked and is being reactivated.

---

#### 3. Remove Block
**DELETE** `/:id`

Deactivate a block entry (soft delete).

**Path Parameters:**
- `id` (required) - Block entry ID

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "block": { ... }
  },
  "message": "IP unblocked successfully"
}
```

---

### Knowledge Base (RAG Chunks)
**Base Path:** `/api/v1/admin/knowledge`

#### 1. Get RAG Chunks
**GET** `/`

Get all knowledge base chunks.

**Query Parameters:**
- `page` (optional) - Default: 1
- `limit` (optional) - Default: 10

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "chunks": [ ... ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalDocs": 50,
      "hasMore": true
    }
  },
  "message": "Chunks retrieved"
}
```

---

#### 2. Create RAG Chunk
**POST** `/`

Create a new knowledge base chunk with AI-generated tags.

**Request:**
```json
{
  "sourceType": "string (required) - e.g., 'DOCUMENT', 'ARTICLE'",
  "sourceName": "string (required) - e.g., 'SQL Injection Guide'",
  "content": "string (required) - The knowledge content"
}
```

**Response:** `201 Created`
```json
{
  "statusCode": 201,
  "data": {
    "chunk": {
      "_id": "string",
      "content": "string",
      "sourceType": "string",
      "sourceName": "string",
      "tags": ["string"],
      "embedding": [ ... ],
      "createdAt": "ISO date"
    }
  },
  "message": "Knowledge Chunk created successfully"
}
```

**Note:** Tags are automatically generated using AI (Gemini).

---

#### 3. Delete RAG Chunk
**DELETE** `/:id`

Delete a knowledge base chunk.

**Path Parameters:**
- `id` (required) - Chunk ID

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": null,
  "message": "Chunk deleted"
}
```

---

## Admin Profile Routes
**Base Path:** `/api/v1/admin/profile`

**Authentication:** Required (verifyJWT)

### 1. Get Admin Profile
**GET** `/`

Get current admin's profile.

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "admin": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "phone_no": "string",
      "profilePhoto": "string",
      "role": "admin",
      ...
    }
  },
  "message": "Admin profile fetched successfully"
}
```

---

### 2. Update Admin Profile
**PUT** `/`

Update admin profile information.

**Request:**
```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "phone_no": "string (optional)"
}
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "admin": { ... }
  },
  "message": "Profile updated successfully"
}
```

---

### 3. Update Admin Profile Image
**PUT** `/image`

Update admin profile photo.

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:**
  ```json
  {
    "profilePhoto": "file (required)"
  }
  ```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "profilePhoto": "string"
  },
  "message": "Profile photo updated successfully"
}
```

---

### 4. Change Password
**PUT** `/password`

Change admin password.

**Request:**
```json
{
  "oldPassword": "string (required)",
  "newPassword": "string (required)"
}
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Password changed successfully"
}
```

---

### 5. Resend Verification Link
**POST** `/resend-verification`

Resend email verification link.

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": null,
  "message": "Verification link sent successfully"
}
```

---

## Analyst Profile Routes
**Base Path:** `/api/v1/analyst/profile`

**Authentication:** Required (verifyJWT)

### 1. Get Analyst Profile
**GET** `/`

Get current analyst's profile.

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "analyst": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "phone_no": "string",
      "profilePhoto": "string",
      "role": "analyst",
      ...
    }
  },
  "message": "Analyst profile fetched successfully"
}
```

---

### 2. Update Analyst Profile
**PUT** `/`

Update analyst profile information.

**Request:**
```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "phone_no": "string (optional)"
}
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "analyst": { ... }
  },
  "message": "Profile updated successfully"
}
```

---

### 3. Update Analyst Profile Image
**PUT** `/image`

Update analyst profile photo.

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:**
  ```json
  {
    "profilePhoto": "file (required)"
  }
  ```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "profilePhoto": "string"
  },
  "message": "Profile photo updated successfully"
}
```

---

### 4. Change Password
**PUT** `/password`

Change analyst password.

**Request:**
```json
{
  "oldPassword": "string (required)",
  "newPassword": "string (required)"
}
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Password changed successfully"
}
```

---

### 5. Resend Verification Link
**POST** `/resend-verification`

Resend email verification link.

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": null,
  "message": "Verification link sent successfully"
}
```

---

## AI & Chatbot Routes

### AI Incident Chat
**Base Path:** `/api/v1/ai`

**Authentication:** Required (verifyJWT)

#### 1. Handle Incident Chat
**POST** `/incident-chat`

Chat with AI assistant about an incident. Returns streaming response.

**Request:**
```json
{
  "incidentId": "string (optional) - If provided, includes incident context",
  "message": "string (required) - User's question"
}
```

**Response:** `200 OK` (Streaming)
```
Content-Type: text/plain; charset=utf-8
Transfer-Encoding: chunked

[AI response streamed in chunks]
```

**Features:**
- Uses RAG (Retrieval Augmented Generation) for knowledge base search
- Includes incident context if `incidentId` provided
- Maintains chat history in Redis (last 20 messages)
- Data masking for sensitive information
- Multiple Gemini API key rotation support

---

#### 2. Clear Chat History
**DELETE** `/history`

Clear user's chat history.

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": null,
  "message": "Chat history cleared"
}
```

---

### General Chatbot
**Base Path:** `/api/v1/chat`

**Authentication:** Required (verifyJWT)

#### 1. Chat
**POST** `/`

General chatbot endpoint using RAG service.

**Request:**
```json
{
  "message": "string (required)"
}
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "response": "string"
  },
  "message": "Response generated successfully"
}
```

---

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "statusCode": 400,
  "data": null,
  "message": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `304` - Not Modified (expired token)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Notes

1. **Authentication Flow:**
   - Login to get `accessToken` and `refreshToken`
   - Tokens are set as HTTP-only cookies
   - Use `/refresh-token` to get new access token
   - Access tokens expire in 15 minutes
   - Refresh tokens expire in 7 days

2. **Role-Based Access:**
   - `admin` - Full system access
   - `analyst` - Limited access (cannot resolve incidents, cannot manage users/blocklist)

3. **File Uploads:**
   - Profile photos use `multipart/form-data`
   - Files are uploaded to Cloudinary
   - Default profile image is used if no file provided

4. **Incident Status Flow:**
   - `OPEN` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED`/`FALSE_POSITIVE`
   - Analysts can only move to `IN_PROGRESS`
   - Only admins can resolve or mark as false positive

5. **IP Blocking:**
   - Automatic blocking on incident resolution (based on severity)
   - Manual blocking available to admins
   - Block expiry: MEDIUM (24h), HIGH (7d), CRITICAL (permanent)

6. **RAG System:**
   - Knowledge base chunks are embedded using vector search
   - AI-generated tags for better categorization
   - Used in AI chat for context-aware responses

---

## Rate Limiting & Security

- All routes are monitored via `monitoring.middleware.js`
- Blocklist middleware can block malicious IPs
- Sensitive data is masked in AI responses
- JWT tokens are validated on protected routes
- CORS is configured for specific origins

---

**Last Updated:** Generated from codebase scan
**API Version:** v1

