# Backend Folder Structure

This Express TypeScript backend follows a clean, modular architecture:

## 📁 Folder Structure

```
src/
├── app.ts                 # Main application entry point
├── db.ts                  # Database connection and query utilities
├── constants.ts           # Re-exports for backward compatibility
├── config/
│   └── constants.ts       # Application constants and configuration
├── types/
│   └── index.ts          # TypeScript interfaces and types
├── controllers/
│   ├── aiController.ts   # AI/LLM related business logic
│   └── userController.ts # User management business logic
├── services/
│   ├── openaiService.ts  # OpenAI/Thesys service integration
│   └── userService.ts    # User database operations
├── routes/
│   ├── index.ts          # Main router that combines all routes
│   ├── aiRoutes.ts       # AI/LLM endpoints
│   └── userRoutes.ts     # User CRUD endpoints
└── middleware/
    └── errorHandler.ts   # Error handling middleware
```

## 🚀 API Endpoints

### AI Routes (`/api/ai`)
- `POST /api/ai/generate` - Generate AI responses with streaming

### User Routes (`/api/users`)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### System Routes
- `GET /` - API information
- `GET /api/health` - Health check

## 🔧 Features

- **Modular Architecture**: Separated concerns with controllers, services, and routes
- **Type Safety**: Comprehensive TypeScript interfaces
- **Error Handling**: Centralized error handling middleware
- **Consistent API**: Standardized response format with `ApiResponse<T>`
- **Database Layer**: Abstracted database operations through services
- **Streaming Support**: Server-sent events for AI responses

## 🏗️ Architecture Patterns

1. **Controller Pattern**: Business logic separated from route definitions
2. **Service Pattern**: Database operations and external API calls abstracted
3. **Middleware Pattern**: Cross-cutting concerns handled consistently
4. **Repository Pattern**: Database queries centralized in service layer

## 📝 Response Format

All API responses follow this consistent format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

## 🔄 Migration Notes

The original `/api/thesys-generate` endpoint is now `/api/ai/generate` with the same functionality but better error handling and structure.
