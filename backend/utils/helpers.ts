import { S3 } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { readFile } from "node:fs/promises";
import { clerkClient } from "@clerk/express";
import Document, { IDocument } from "../models/document";

export interface PaginationOptions {
   page: number;
   limit: number;
   sortBy?: string;
   sortOrder?: "asc" | "desc";
}

export interface PaginationResult<T> {
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

// S3 Helper Class with encapsulated client
export class S3Helper {
   private s3: S3;
   private bucketName: string;

   constructor(bucketName: string = "note-spot") {
      this.bucketName = bucketName;
      this.s3 = new S3({
         credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY!,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
         },
         region: process.env.S3_BUCKET_REGION!,
      });
   }

   async uploadFile(
      filePath: string,
      fileName: string,
      mimeType: string
   ): Promise<string> {
      const params = {
         Bucket: this.bucketName,
         Body: await readFile(filePath),
         Key: fileName,
         ContentType: mimeType,
      };

      const uploadedFile = await new Upload({
         client: this.s3,
         params,
      }).done();

      return uploadedFile.Location!;
   }

   async deleteFile(fileName: string): Promise<void> {
      const params = { Bucket: this.bucketName, Key: fileName };
      const command = new DeleteObjectCommand(params);
      await this.s3.send(command);
   }
}

// Create and export default S3Helper instance
export const s3Helper = new S3Helper();

// File Validation
export const validateFile = (file: any): { isValid: boolean; error?: string } => {
   const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
   ];

   const maxSize = 100 * 1024 * 1024; // 100MB

   if (!allowedTypes.includes(file.mimetype)) {
      return {
         isValid: false,
         error:
            "File type not allowed. Please upload PDF, DOC, DOCX, TXT, PPT, or PPTX files.",
      };
   }

   if (file.size > maxSize) {
      return {
         isValid: false,
         error: "File size too large. Maximum size is 100MB.",
      };
   }

   return { isValid: true };
};

// Pagination Helper
export const paginate = async (
   query: any = {},
   options: PaginationOptions
): Promise<PaginationResult<any>> => {
   const { page, limit, sortBy = "createdAt", sortOrder = "desc" } = options;

   const skip = (page - 1) * limit;
   const sortOptions: any = {};
   sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

   const [data, totalItems] = await Promise.all([
      Document.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      Document.countDocuments(query),
   ]);

   const totalPages = Math.ceil(totalItems / limit);

   return {
      data,
      pagination: {
         currentPage: page,
         totalPages,
         totalItems,
         hasNext: page < totalPages,
         hasPrev: page > 1,
         limit,
      },
   };
};

// Clerk Helper Functions
export const getUserFromClerk = async (userId: string) => {
   try {
      const user = await clerkClient.users.getUser(userId);
      return {
         id: user.id,
         name:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Anonymous",
         email: user.emailAddresses[0]?.emailAddress || "",
         imageUrl: user.imageUrl,
      };
   } catch (error) {
      throw new Error("User not found");
   }
};

// Search Helper
export const buildSearchQuery = (
   searchTerm?: string,
   authorId?: string,
   isPublic?: boolean,
   orPublicAndOwner?: boolean
) => {
   const query: any = {};

   if (orPublicAndOwner && authorId) {
      query.$or = [
         { isPublic: true },
         { authorId }
      ];
   } else {
      if (isPublic !== undefined) {
         query.isPublic = isPublic;
      }
      if (authorId) {
         query.authorId = authorId;
      }
   }

   if (searchTerm) {
      query.$text = { $search: searchTerm };
   }

   return query;
};
