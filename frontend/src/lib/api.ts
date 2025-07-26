import { Document, APIResponse, PaginationResponse, AuthorDocumentsResponse, Author } from "@/lib/data";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000";

// Documents API functions
export async function getDocuments(params?: {
   page?: number;
   limit?: number;
   search?: string;
   sortBy?: string;
   sortOrder?: 'asc' | 'desc';
}, token?: string): Promise<PaginationResponse<Document>> {
   const searchParams = new URLSearchParams();
   if (params?.page) searchParams.append('page', params.page.toString());
   if (params?.limit) searchParams.append('limit', params.limit.toString());
   if (params?.search) searchParams.append('search', params.search);
   if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
   if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

   const response = await fetch(`${API_BASE_URL}/api/documents?${searchParams}`, {
      method: "GET",
      cache: "no-store",
      headers: {
         "Authorization": `Bearer ${token}`,
      },
   });

   if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
   }

   return await response.json();
}

export async function getDocumentById(id: string, token?: string): Promise<APIResponse<Document>> {
   const headers: HeadersInit = {
      'Content-Type': 'application/json',
   };

   if (token) {
      headers.Authorization = `Bearer ${token}`;
   }

   const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
      method: "GET",
      headers,
      cache: "no-store",
   });

   if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
   }

   return await response.json();
}

export async function getDocumentsByAuthor(authorId: string, params?: {
   page?: number;
   limit?: number;
   search?: string;
}, token?: string): Promise<AuthorDocumentsResponse> {
   const searchParams = new URLSearchParams();
   if (params?.page) searchParams.append('page', params.page.toString());
   if (params?.limit) searchParams.append('limit', params.limit.toString());
   if (params?.search) searchParams.append('search', params.search);

   const headers: HeadersInit = {
      'Content-Type': 'application/json',
   };

   if (token) {
      headers.Authorization = `Bearer ${token}`;
   }

   const response = await fetch(`${API_BASE_URL}/api/authors/${authorId}?${searchParams}`, {
      method: "GET",
      headers,
      cache: "no-store",
   });

   if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
   }

   return await response.json();
}

export async function uploadDocument(data: {
   title: string;
   description: string;
   fileName: string;
   fileUrl: string;
   fileSize: number;
   isPublic: boolean;
}, token: string): Promise<APIResponse<Document>> {
   const response = await fetch(`${API_BASE_URL}/api/documents`, {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
   });

   if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
   }

   return await response.json();
}

export async function updateDocument(id: string, data: {
   title?: string;
   description?: string;
   isPublic?: boolean;
}, token: string): Promise<APIResponse<Document>> {
   const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
      method: "PUT",
      headers: {
         "Content-Type": "application/json",
         "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
   });

   if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
   }

   return await response.json();
}

export async function deleteDocument(id: string, token: string): Promise<APIResponse<null>> {
   const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
      method: "DELETE",
      headers: {
         Authorization: `Bearer ${token}`,
      },
   });

   if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
   }

   return await response.json();
}

export async function checkHealth(): Promise<APIResponse<{ message: string; timestamp: string }>> {
   const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
   });

   if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
   }

   return await response.json();
}

export async function getAuthorById(authorId: string, token?: string): Promise<APIResponse<Author>> {
   const headers: HeadersInit = {
      'Content-Type': 'application/json',
   };

   if (token) {
      headers.Authorization = `Bearer ${token}`;
   }

   const response = await fetch(`${API_BASE_URL}/api/authors/${authorId}/info`, {
      method: "GET",
      headers,
      cache: "no-store",
   });

   if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
   }

   return await response.json();
}

export async function getPresignedUrl(fileName: string, fileType: string, token: string): Promise<APIResponse<{ presignedUrl: string; fileName: string; fileUrl: string }>> {
   const response = await fetch(`${API_BASE_URL}/api/documents/presigned`, {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ fileName, fileType }),
   });

   if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
   }

   return await response.json();
}

export async function getAllAuthors(): Promise<APIResponse<any[]>> {
   const headers: HeadersInit = {
      'Content-Type': 'application/json',
   };

   const response = await fetch(`${API_BASE_URL}/api/authors/`, {
      method: "GET",
      headers,
      cache: "no-store",
   });

   if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
   }

   return await response.json();
}