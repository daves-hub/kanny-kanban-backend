# API Documentation

Base URL: `http://localhost:5000`

All application endpoints are namespaced under `/api`. Authenticated routes require either the `Authorization: Bearer <token>` header or a valid `token` cookie set by the auth endpoints.

## Common Response Codes

- `200 OK` – Successful request.
- `201 Created` – Resource created successfully.
- `304 Not Modified` – Returned on conditional `GET` requests when an `If-None-Match` header matches the current resource ETag.
- `400 Bad Request` – Validation failure. Responses include an `error` string and, for Zod validation errors, a `details` array describing field issues.
- `401 Unauthorized` – Missing or invalid authentication token (also used for invalid signin credentials).
- `404 Not Found` – Requested resource does not exist or is not owned by the caller.
- `500 Internal Server Error` – Unexpected application error.

Unless noted otherwise, the endpoints below share these common codes alongside their success responses.

---

## Health

### GET /health
- **Auth**: Not required
- **Description**: Service heartbeat check
- **Success**: `200 OK`
- **Cache**: May return `304 Not Modified` when the client sends a matching `If-None-Match` header (see Common Response Codes).
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

---

## Authentication

Authentication endpoints may also return the common codes noted above. `signin` returns `401 Unauthorized` when credentials are invalid, even though the route itself does not require a prior session.

### POST /api/auth/signup
- **Auth**: Not required
- **Body** `application/json`
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Optional Name"
}
```
- **Success**: `201 Created`
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Optional Name",
    "createdAt": "2025-01-01T12:00:00.000Z"
  },
  "token": "jwt-token"
}
```
- **Notes**: Sets an HttpOnly `token` cookie valid for 7 days.

### POST /api/auth/signin
- **Auth**: Not required
- **Body** `application/json`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Success**: `200 OK`
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Optional Name",
    "createdAt": "2025-01-01T12:00:00.000Z"
  },
  "token": "jwt-token"
}
```
- **Notes**: Sets/refreshes the HttpOnly `token` cookie.

### POST /api/auth/signout
- **Auth**: Not required (clears cookie if present)
- **Success**: `200 OK`
```json
{
  "message": "Signed out successfully"
}
```

### GET /api/auth/me
- **Auth**: Required
- **Additional Errors**: `404 Not Found` when the authenticated user record no longer exists.
- **Success**: `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Optional Name",
  "createdAt": "2025-01-01T12:00:00.000Z"
}
```

---

## Projects

All project routes require authentication and therefore may return the common `400`, `401`, and `500` codes. Endpoints that reference a specific project id respond with `404 Not Found` when the project is missing or not owned by the caller.

### GET /api/projects
- **Query Params**: none
- **Success**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "Demo Project",
    "description": "A sample project",
    "ownerId": 1,
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-02T15:04:05.000Z",
    "boards": [
      {
        "id": 1,
        "name": "Project Board"
      }
    ]
  }
]
```

### POST /api/projects
- **Body** `application/json`
```json
{
  "name": "New Project",
  "description": "Optional description"
}
```
- **Success**: `201 Created`
```json
{
  "id": 2,
  "name": "New Project",
  "description": "Optional description",
  "ownerId": 1,
  "createdAt": "2025-01-03T09:00:00.000Z",
  "updatedAt": "2025-01-03T09:00:00.000Z"
}
```

### GET /api/projects/:id
- **Path Params**: `id` (number)
- **Success**: `200 OK`
```json
{
  "id": 1,
  "name": "Demo Project",
  "description": "A sample project",
  "ownerId": 1,
  "createdAt": "2025-01-01T12:00:00.000Z",
  "updatedAt": "2025-01-02T15:04:05.000Z",
  "boards": [
    {
      "id": 1,
      "name": "Project Board",
      "createdAt": "2025-01-01T12:30:00.000Z",
      "updatedAt": "2025-01-02T14:00:00.000Z"
    }
  ]
}
```

### PATCH /api/projects/:id
- **Body** `application/json`
```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```
- **Success**: `200 OK`
```json
{
  "id": 1,
  "name": "Updated Project Name",
  "description": "Updated description",
  "ownerId": 1,
  "createdAt": "2025-01-01T12:00:00.000Z",
  "updatedAt": "2025-01-04T08:00:00.000Z"
}
```

### DELETE /api/projects/:id
- **Success**: `200 OK`
```json
{
  "message": "Project deleted successfully"
}
```

---

## Boards

All board routes require authentication and share the common `400`, `401`, and `500` codes. Requests for a specific board id return `404 Not Found` if the board is missing or belongs to another user. Providing a `projectId` that the user does not own during board creation or updates also results in `404 Not Found`.

### GET /api/boards
- **Query Params**: optional `projectId`
- **Success**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "Standalone Board",
    "ownerId": 1,
    "projectId": null,
    "createdAt": "2025-01-02T10:00:00.000Z",
    "updatedAt": "2025-01-03T11:00:00.000Z"
  }
]
```

### POST /api/boards
- **Body** `application/json`
```json
{
  "name": "Sprint Board",
  "projectId": 1
}
```
- **Success**: `201 Created`
```json
{
  "id": 3,
  "name": "Sprint Board",
  "ownerId": 1,
  "projectId": 1,
  "createdAt": "2025-01-05T09:00:00.000Z",
  "updatedAt": "2025-01-05T09:00:00.000Z",
  "lists": [
    {
      "id": 10,
      "boardId": 3,
      "title": "Todo",
      "position": 0,
      "createdAt": "2025-01-05T09:00:00.000Z"
    },
    {
      "id": 11,
      "boardId": 3,
      "title": "In Progress",
      "position": 1,
      "createdAt": "2025-01-05T09:00:00.000Z"
    },
    {
      "id": 12,
      "boardId": 3,
      "title": "Complete",
      "position": 2,
      "createdAt": "2025-01-05T09:00:00.000Z"
    }
  ]
}
```
- **Notes**: Boards are automatically seeded with `Todo`, `In Progress`, and `Complete` lists.

### GET /api/boards/:id
- **Path Params**: `id` (number)
- **Success**: `200 OK`
```json
{
  "id": 1,
  "name": "Project Board",
  "ownerId": 1,
  "projectId": 1,
  "createdAt": "2025-01-01T12:30:00.000Z",
  "updatedAt": "2025-01-03T16:00:00.000Z",
  "lists": [
    {
      "id": 4,
      "boardId": 1,
      "title": "Todo",
      "position": 0,
      "createdAt": "2025-01-01T12:31:00.000Z",
      "tasks": [
        {
          "id": 1,
          "listId": 4,
          "title": "Add more columns",
          "description": "Optional text",
          "position": 0,
          "createdAt": "2025-01-02T09:00:00.000Z"
        }
      ]
    }
  ]
}
```

### PATCH /api/boards/:id
- **Body** `application/json`
```json
{
  "name": "Renamed Board",
  "projectId": null
}
```
- **Success**: `200 OK`
```json
{
  "id": 1,
  "name": "Renamed Board",
  "ownerId": 1,
  "projectId": null,
  "createdAt": "2025-01-01T12:30:00.000Z",
  "updatedAt": "2025-01-06T10:00:00.000Z"
}
```

### DELETE /api/boards/:id
- **Success**: `200 OK`
```json
{
  "message": "Board deleted successfully"
}
```

---

## Lists

All list routes require authentication and therefore share the common `400`, `401`, and `500` codes. Requests scoped to a specific board or list return `404 Not Found` when the targeted resource is missing or not owned by the authenticated user.

### GET /api/lists/boards/:boardId/lists
- **Path Params**: `boardId` (number)
- **Success**: `200 OK`
```json
[
  {
    "id": 4,
    "boardId": 1,
    "title": "Todo",
    "position": 0,
    "createdAt": "2025-01-01T12:31:00.000Z"
  }
]
```

### POST /api/lists/boards/:boardId/lists
- **Body** `application/json`
```json
{
  "title": "Backlog",
  "position": 3
}
```
- **Success**: `201 Created`
```json
{
  "id": 7,
  "boardId": 1,
  "title": "Backlog",
  "position": 3,
  "createdAt": "2025-01-05T09:30:00.000Z"
}
```

### PATCH /api/lists/:id
- **Body** `application/json`
```json
{
  "title": "Review",
  "position": 2
}
```
- **Success**: `200 OK`
```json
{
  "id": 7,
  "boardId": 1,
  "title": "Review",
  "position": 2,
  "createdAt": "2025-01-05T09:30:00.000Z"
}
```

### DELETE /api/lists/:id
- **Success**: `200 OK`
```json
{
  "message": "List deleted successfully"
}
```

---

## Tasks

All task routes require authentication and therefore share the common `400`, `401`, and `500` codes. Requests referencing a specific list or task return `404 Not Found` when the resource cannot be found or is not owned by the authenticated user.

### GET /api/tasks/lists/:listId/tasks
- **Path Params**: `listId` (number)
- **Success**: `200 OK`
```json
[
  {
    "id": 1,
    "listId": 4,
    "title": "Add more columns",
    "description": "Optional text",
    "position": 0,
    "createdAt": "2025-01-02T09:00:00.000Z"
  }
]
```

### POST /api/tasks/lists/:listId/tasks
- **Body** `application/json`
```json
{
  "title": "New Task",
  "description": "Optional details",
  "position": 1
}
```
- **Success**: `201 Created`
```json
{
  "id": 12,
  "listId": 4,
  "title": "New Task",
  "description": "Optional details",
  "position": 1,
  "createdAt": "2025-01-05T10:00:00.000Z"
}
```

### PATCH /api/tasks/:id
- **Body** `application/json`
```json
{
  "title": "Updated Task",
  "description": "Updated details",
  "listId": 5,
  "position": 0
}
```
- **Success**: `200 OK`
```json
{
  "id": 12,
  "listId": 5,
  "title": "Updated Task",
  "description": "Updated details",
  "position": 0,
  "createdAt": "2025-01-05T10:00:00.000Z"
}
```

### DELETE /api/tasks/:id
- **Success**: `200 OK`
```json
{
  "message": "Task deleted successfully"
}
```

---

## Error Format

Standard error payloads look like:
```json
{
  "error": "Reason for failure"
}
```

Validation failures include field-level detail:
```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": "body.email",
      "message": "Invalid email"
    }
  ]
}
```

## Notes
- All timestamps are ISO 8601 strings in UTC.
- Numeric identifiers are integers.
- Optional fields may be `null` when not provided.
- Authenticated routes reject unauthenticated requests with `401 Unauthorized`.
