# Notespot backend

Backend API built with Express.js, TypeScript, MongoDB, integrated with Clerk for authentication and AWS S3 for file storage.

## Getting Started

Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Next, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## API Endpoints

```
GET /                           - Recently uploaded documents
GET /health                     - Health check
GET /api/documents              - All public documents (main feed)
POST /api/documents             - Upload document
GET /api/documents/:id          - Get specific document
GET /api/documents/author/:id   - Get specific author's documents
PUT /api/documents/:id          - Update document
DELETE /api/documents/:id       - Delete document
GET /api/documents/:id/download - Download document
```

## Base URL

```
Development: http://localhost:2000
Production: [Your production URL]
```

## Authentication

The API uses Clerk for authentication. Include the Clerk session token in the Authorization header:

```
Authorization: Bearer <clerk_session_token>
```

for more information, see https://clerk.com/docs/testing/postman-or-insomnia

## API Endpoints

### Health Check

```http
GET /health
```

**Response:**

```json
{
  "success": true,
  "message": "NoteSpot API is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Documents

#### Get All Public Documents

```http
GET /api/documents
```

**Description:** Returns all public documents sorted by recency with pagination. This is the main feed/index page.

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 50)
- `search` (string, optional): Search term for title/description
- `sortBy` (string, optional): Sort field (default: 'createdAt')
- `sortOrder` (string, optional): 'asc' or 'desc' (default: 'desc')

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "document_id",
      "title": "Document Title",
      "description": "Document description",
      "fileSize": 1024000,
      "fileName": "document.pdf",
      "fileUrl": "https://s3.amazonaws.com/...",
      "authorId": "clerk_user_id",
      "authorName": "John Doe",
      "mimeType": "application/pdf",
      "downloadCount": 5,
      "formattedSize": "1.02 MB",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false,
    "limit": 10
  }
}
```

#### Get Documents by Author

```http
GET /api/documents/author/:authorId
```

**Description:** Get all documents by a specific author. If viewing your own profile (authorId matches your user ID), shows both public and private documents. If viewing someone else's profile, only shows public documents.

**Parameters:**

- `authorId` (string): Clerk user ID of the author

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 50)
- `search` (string, optional): Search term for title/description

**Response:**

```json
{
  "success": true,
  "author": {
    "id": "clerk_user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "imageUrl": "https://..."
  },
  "isOwnProfile": true,
  "data": [...],
  "pagination": {...}
}
```

#### Upload Document

```http
POST /api/documents
```

**Authentication:** Required
**Content-Type:** `multipart/form-data`

**Form Data:**

- `file` (file): The document file
- `title` (string): Document title
- `description` (string, optional): Document description
- `isPublic` (boolean, optional): Whether document is public (default: true)

**Supported File Types:**

- PDF (.pdf)
- Word Documents (.doc, .docx)
- PowerPoint (.ppt, .pptx)
- Text files (.txt)

**Max File Size:** 100MB

**Response:**

```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "_id": "document_id",
    "title": "Document Title"
    // ... other document fields
  }
}
```

#### Get Specific Document

```http
GET /api/documents/:id
```

**Parameters:**

- `id` (string): Document ID

**Authentication:** Required for private documents

#### Update Document

```http
PUT /api/documents/:id
```

**Authentication:** Required (owner only)
**Content-Type:** `application/json`

**Body:**

```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "isPublic": false
}
```

#### Delete Document

```http
DELETE /api/documents/:id
```

**Authentication:** Required (owner only)

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message"
}
```

**Common HTTP Status Codes:**

- `400` - Bad Request (validation errors, missing fields)
- `401` - Unauthorized (missing or invalid authentication)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Data Models

### Document

```typescript
interface IDocument {
  _id: string;
  title: string;
  description?: string;
  filePath: string;
  fileSize: number;
  fileName: string;
  fileUrl: string;
  uuid: string;
  authorId: string; // Clerk user ID
  authorName: string;
  coverImage?: string;
  mimeType: string;
  isPublic: boolean;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
  formattedSize: string; // Virtual field
}
```
