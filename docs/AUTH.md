# Authentication Documentation

## Overview

This backend implements JWT-based authentication with role-based access control. Users can register with three different roles: **student**, **college**, or **company**.

## User Roles

- `student` - Student users
- `college` - College/Educational institution users
- `company` - Company/Employer users

## Authentication Flow

### 1. User Registration

**Endpoint:** `POST /api/v1/users/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "student"
}
```

**Response:**

```json
{
  "statusCode": 201,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "student",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "jwt-token"
  },
  "message": "User registered successfully",
  "success": true
}
```

### 2. User Login

**Endpoint:** `POST /api/v1/users/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as registration response

### 3. Get User Profile (Protected)

**Endpoint:** `GET /api/v1/users/profile`

**Headers:**

```
Authorization: Bearer <access-token>
```

Or use cookie-based authentication (token is automatically set in cookies on login/register)

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "User profile fetched successfully",
  "success": true
}
```

### 4. Update User Profile (Protected)

**Endpoint:** `PUT /api/v1/users/profile`

**Headers:**

```
Authorization: Bearer <access-token>
```

**Request Body:**

```json
{
  "name": "New Name",
  "email": "newemail@example.com"
}
```

Both fields are optional.

### 5. Logout (Protected)

**Endpoint:** `POST /api/v1/users/logout`

**Headers:**

```
Authorization: Bearer <access-token>
```

Clears the authentication cookie.

## Authentication Methods

The API supports two authentication methods:

1. **Cookie-based**: Access token is automatically set in httpOnly cookie on login/register
2. **Bearer token**: Pass token in Authorization header as `Bearer <token>`

## Middleware

### `verifyJWT`

Middleware to verify JWT token and attach user info to request.

```typescript
router.get("/profile", verifyJWT, getUserProfile);
```

### `requireRole(...roles)`

Middleware to restrict access to specific roles.

```typescript
router.post("/job", verifyJWT, requireRole(UserRole.COMPANY), createJob);
```

## Environment Variables

Add these to your `.env` file:

```
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

## Security Features

- Passwords are hashed using bcrypt (10 salt rounds)
- JWT tokens expire after configurable time (default: 7 days)
- HttpOnly cookies in production for CSRF protection
- Email uniqueness validation
- Zod schema validation for all inputs
- Global error handling

## Example Usage

### cURL Examples

**Register:**

```bash
curl -X POST http://localhost:3001/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "password123",
    "name": "Test Student",
    "role": "student"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:3001/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

**Get Profile (with cookie):**

```bash
curl -X GET http://localhost:3001/api/v1/users/profile \
  -b cookies.txt
```

**Get Profile (with Bearer token):**

```bash
curl -X GET http://localhost:3001/api/v1/users/profile \
  -H "Authorization: Bearer <your-token>"
```

## Error Responses

### Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Invalid email address"]
}
```

### Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized request - No token provided"
}
```

### Forbidden (Wrong Role)

```json
{
  "success": false,
  "message": "Forbidden - Required role(s): company"
}
```

## Data Storage

Currently uses an in-memory store for development. For production:

1. Replace `UserStore` in `src/models/user.model.ts` with a database implementation
2. Consider using Prisma, TypeORM, or Mongoose
3. The interface is already designed for async operations
