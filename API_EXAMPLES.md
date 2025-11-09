# API Testing Examples

This file contains example requests for testing the Kanny Kanban API.

## Setup

Export your token after signing in:
```bash
export TOKEN="your-jwt-token-here"
```

Or use this in each request:
```bash
-H "Authorization: Bearer YOUR_TOKEN"
```

---

## Authentication

### Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Sign In
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Current User
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Sign Out
```bash
curl -X POST http://localhost:5000/api/auth/signout
```

---

## Projects

### List All Projects
```bash
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer $TOKEN"
```

### Create Project
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My New Project",
    "description": "This is a test project"
  }'
```

### Get Single Project
```bash
curl http://localhost:5000/api/projects/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Update Project
```bash
curl -X PATCH http://localhost:5000/api/projects/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Project Name",
    "description": "Updated description"
  }'
```

### Delete Project
```bash
curl -X DELETE http://localhost:5000/api/projects/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Boards

### List All Boards
```bash
curl http://localhost:5000/api/boards \
  -H "Authorization: Bearer $TOKEN"
```

### List Boards by Project
```bash
curl "http://localhost:5000/api/boards?projectId=1" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Board (Standalone)
```bash
curl -X POST http://localhost:5000/api/boards \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Standalone Board"
  }'
```

### Create Board (
## Pro Tips

### Pretty Print JSON Responses
```bash
curl http://localhost:5000/api/boards/1 \
  -H "Authorization: Bearer $TOKEN" | jq
```

### Save Response to File
```bash
curl http://localhost:5000/api/boards/1 \
  -H "Authorization: Bearer $TOKEN" \
  -o board-response.json
```

### Include Response Headers
```bash
curl -i http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'
```

### Verbose Output (for debugging)
```bash
curl -v http://localhost:5000/api/boards/1 \
  -H "Authorization: Bearer $TOKEN"
```
Under Project)
```bash
curl -X POST http://localhost:5000/api/boards \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Project Board",
    "projectId": 1
  }'
```

### Get Board with Lists and Tasks
```bash
curl http://localhost:5000/api/boards/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Update Board
```bash
curl -X PATCH http://localhost:5000/api/boards/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Board Name",
    "projectId": 2
  }'
```

### Delete Board
```bash
curl -X DELETE http://localhost:5000/api/boards/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Lists

### Get All Lists for a Board
```bash
curl http://localhost:5000/api/lists/boards/1/lists \
  -H "Authorization: Bearer $TOKEN"
```

### Create List
```bash
curl -X POST http://localhost:5000/api/lists/boards/1/lists \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "To Do",
    "position": 0
  }'
```

### Update List
```bash
curl -X PATCH http://localhost:5000/api/lists/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "In Progress",
    "position": 1
  }'
```

### Delete List
```bash
curl -X DELETE http://localhost:5000/api/lists/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Tasks

### Get All Tasks for a List
```bash
curl http://localhost:5000/api/tasks/lists/1/tasks \
  -H "Authorization: Bearer $TOKEN"
```

### Create Task
```bash
curl -X POST http://localhost:5000/api/tasks/lists/1/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Task",
    "description": "Task description here",
    "position": 0
  }'
```

### Update Task (Simple)
```bash
curl -X PATCH http://localhost:5000/api/tasks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Task Title",
    "description": "Updated description"
  }'
```

### Move Task to Different List (Drag & Drop)
```bash
curl -X PATCH http://localhost:5000/api/tasks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "listId": 2,
    "position": 0
  }'
```

### Reorder Task Within Same List
```bash
curl -X PATCH http://localhost:5000/api/tasks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "position": 3
  }'
```

### Delete Task
```bash
curl -X DELETE http://localhost:5000/api/tasks/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Testing Flow

### Complete Workflow Example

```bash
# 1. Sign up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# 2. Sign in and save token
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

# 3. Create a project
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Project","description":"A test project"}'

# 4. Create a board
curl -X POST http://localhost:5000/api/boards \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Board","projectId":1}'

# 5. Create lists
curl -X POST http://localhost:5000/api/lists/boards/1/lists \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"To Do","position":0}'

curl -X POST http://localhost:5000/api/lists/boards/1/lists \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Done","position":1}'

# 6. Create a task
curl -X POST http://localhost:5000/api/tasks/lists/1/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My First Task","description":"Test task","position":0}'

# 7. Get the full board
curl http://localhost:5000/api/boards/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Validation Examples

### Invalid Email
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","password":"password123"}'
```

Expected: 400 Bad Request with validation error

### Short Password
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123"}'
```

Expected: 400 Bad Request - password must be at least 6 characters

### Missing Authentication
```bash
curl http://localhost:5000/api/projects
```

Expected: 401 Unauthorized

### Invalid Token
```bash
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer invalid-token"
```

Expected: 401 Unauthorized - Invalid or expired token
