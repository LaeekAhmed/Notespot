export interface Document {
   _id: string;
   title: string;
   description?: string;
   fileSize: number;
   fileName: string;
   fileUrl: string;
   uuid: string;
   authorId: string; // Clerk user ID
   authorName: string;
   mimeType: string;
   downloadCount: number;
   formattedSize: string;
   isPublic: boolean;
   coverImage?: string;
   createdAt: string;
   updatedAt: string;
}

export interface Author {
   id: string;
   name: string;
   email: string;
   imageUrl?: string;
}

export interface APIResponse<T> {
   success: boolean;
   data?: T;
   error?: string;
   message?: string;
}

export interface PaginationResponse<T> {
   success: boolean;
   data: T[];
   pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNext: boolean;
      hasPrev: boolean;
      limit: number;
   };
}

export interface AuthorDocumentsResponse {
   success: boolean;
   author: Author;
   isOwnProfile: boolean;
   data: Document[];
   pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNext: boolean;
      hasPrev: boolean;
      limit: number;
   };
}