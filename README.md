# Kanny Kanban Backend API

A robust RESTful API backend for the Kanny Kanban project management application, built with Node.js, Express, PostgreSQL, and Prisma ORM.

## 🚀 Features

- **JWT Authentication** - Secure user authentication with JWT tokens
- **Project Management** - Create and manage multiple projects
- **Kanban Boards** - Flexible boards (standalone or project-linked)
- **Drag & Drop Support** - Position-based task and list ordering
- **Cascade Deletion** - Automatic cleanup of related data
- **Data Validation** - Request validation using Zod schemas
- **Error Handling** - Comprehensive error handling with meaningful messages
- **TypeScript** - Full type safety throughout the codebase
- **Testing Ready** - Jest configuration for unit and integration tests

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- pnpm (v8 or higher)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd kanny-kanban-backend
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kanny_kanban?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

4. **Set up the database**

```bash
# Generate Prisma Client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed database with sample data (optional)
pnpm prisma:seed
```

## 🎯 Running the Application

### Development Mode
```bash
pnpm dev
```

The server will start on `http://localhost:5000`

### Production Mode
```bash
pnpm build
pnpm start
```

### Database Management
```bash
# Open Prisma Studio (Database GUI)
pnpm prisma:studio

# Create a new migration
pnpm prisma:migrate

# Reset database
pnpm exec prisma migrate reset
```

## 📡 API Endpoints

### Authentication

#### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Sign In
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-11-08T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Sign Out
```http
POST /api/auth/signout
```

### Projects

#### List All Projects
```http
GET /api/projects
Authorization: Bearer <token>
```

#### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Project",
  "description": "Project description"
}
```

#### Get Project
```http
GET /api/projects/:id
Authorization: Bearer <token>
```

#### Update Project
```http
PATCH /api/projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

#### Delete Project
```http
DELETE /api/projects/:id
Authorization: Bearer <token>
```

### Boards

#### List All Boards
```http
GET /api/boards
Authorization: Bearer <token>

# Optional: Filter by project
GET /api/boards?projectId=1
```

#### Create Board
```http
POST /api/boards
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Board",
  "projectId": 1  // Optional, null for standalone boards
}
```

#### Get Board (with Lists and Tasks)
```http
GET /api/boards/:id
Authorization: Bearer <token>
```

Response:
```json
{
  "id": 1,
  "name": "Main Board",
  "ownerId": 1,
  "projectId": null,
  "createdAt": "2024-11-01T10:00:00.000Z",
  "updatedAt": "2024-11-08T15:30:00.000Z",
  "lists": [
    {
      "id": 1,
      "boardId": 1,
      "title": "Todo",
      "position": 0,
      "createdAt": "2024-11-01T10:00:00.000Z",
      "tasks": [
        {
          "id": 1,
          "listId": 1,
          "title": "Task title",
          "description": "Task description",
          "position": 0,
          "createdAt": "2024-11-01T11:00:00.000Z"
        }
      ]
    }
  ]
}
```

#### Update Board
```http
PATCH /api/boards/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Board Name",
  "projectId": 2
}
```

#### Delete Board
```http
DELETE /api/boards/:id
Authorization: Bearer <token>
```

### Lists

#### Get All Lists for a Board
```http
GET /api/boards/:boardId/lists
Authorization: Bearer <token>
```

#### Create List
```http
POST /api/boards/:boardId/lists
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "In Progress",
  "position": 1
}
```

#### Update List
```http
PATCH /api/lists/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "position": 2
}
```

#### Delete List
```http
DELETE /api/lists/:id
Authorization: Bearer <token>
```

### Tasks

#### Get All Tasks for a List
```http
GET /api/lists/:listId/tasks
Authorization: Bearer <token>
```

#### Create Task
```http
POST /api/lists/:listId/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Task",
  "description": "Task description",
  "position": 0
}
```

#### Update Task (including drag & drop)
```http
PATCH /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Task",
  "description": "Updated description",
  "listId": 2,      // Move to different list
  "position": 3     // New position
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Tokens can be provided in two ways:

1. **Authorization Header** (Recommended)
```
Authorization: Bearer <your-jwt-token>
```

2. **Cookie** (Automatically set after signin)
```
Cookie: token=<your-jwt-token>
```

## 🗄️ Database Schema

```
User
├── id: number
├── email: string (unique)
├── password: string (hashed)
├── name: string?
└── createdAt: DateTime

Project
├── id: number
├── name: string
├── description: string?
├── ownerId: number → User
├── createdAt: DateTime
└── updatedAt: DateTime

Board
├── id: number
├── name: string
├── ownerId: number → User
├── projectId: number? → Project
├── createdAt: DateTime
└── updatedAt: DateTime

List
├── id: number
├── boardId: number → Board
├── title: string
├── position: number
└── createdAt: DateTime

Task
├── id: number
├── listId: number → List
├── title: string
├── description: string?
├── position: number
└── createdAt: DateTime
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test
```

Current coverage (`pnpm test --coverage`):

```
Statements : 71.97%
Branches   : 85.61%
Functions  : 63.41%
Lines      : 70.22%
```

The suite exercises authentication, project/board/list/task controllers (including drag & drop flows), and all middleware. Integration tests against a live database are planned as a follow-up.

## 🛡️ Error Handling

The API uses standardized error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `304` - Reuse cached response
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

Validation errors include details:
```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": "body.email",
      "message": "Invalid email address"
    }
  ]
}
```

## 🔧 Project Structure

```
kanny-kanban-backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts           # Database seeding script
├── src/
│   ├── config/
│   │   └── index.ts      # Configuration
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── project.controller.ts
│   │   ├── board.controller.ts
│   │   ├── list.controller.ts
│   │   └── task.controller.ts
│   ├── lib/
│   │   └── prisma.ts     # Prisma client
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── validate.ts
│   ├── routes/           # API routes
│   │   ├── auth.routes.ts
│   │   ├── project.routes.ts
│   │   ├── board.routes.ts
│   │   ├── list.routes.ts
│   │   ├── task.routes.ts
│   │   └── index.ts
│   ├── schemas/          # Zod validation schemas
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   ├── jwt.ts
│   │   └── password.ts
│   └── server.ts         # Express server setup
├── .env                  # Environment variables
├── .env.example          # Environment template
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## 🚀 Deployment

### Environment Variables for Production

Update these in production:
- `NODE_ENV=production`
- `DATABASE_URL` - Production database connection
- `JWT_SECRET` - Strong random secret
- `FRONTEND_URL` - Production frontend URL

### Docker Support (Optional)

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY . .
RUN pnpm build
RUN pnpm prisma:generate

EXPOSE 5000
CMD ["pnpm", "start"]
```

## 📝 Demo Credentials

After running `pnpm prisma:seed`:
- **Email**: demo@example.com
- **Password**: password123

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists

### Port Already in Use
Change the `PORT` in `.env` file

### Prisma Client Not Found
Run `pnpm prisma:generate`

### Migration Issues
```bash
pnpm exec prisma migrate reset
pnpm prisma:migrate
```

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Node.js, Express, PostgreSQL, Prisma, and pnpm**
