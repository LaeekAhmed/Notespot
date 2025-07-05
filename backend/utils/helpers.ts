import { S3Client } from "@aws-sdk/client-s3";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { clerkClient } from "@clerk/express";
import Document from "../models/document";
import { env } from "../config/env";

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
   private s3: S3Client;
   private bucketName: string;

   constructor(bucketName: string = "note-spot") {
      this.bucketName = bucketName;
      this.s3 = new S3Client({
         credentials: {
            accessKeyId: env.S3_ACCESS_KEY,
            secretAccessKey: env.S3_SECRET_ACCESS_KEY,
         },
         region: env.S3_BUCKET_REGION,
      });
   }

   async deleteFile(fileName: string): Promise<void> {
      const params = { Bucket: this.bucketName, Key: fileName };
      const command = new DeleteObjectCommand(params);
      await this.s3.send(command);
   }

   async generatePresignedUrl(fileName: string, fileType: string, expiresIn: number = 3600): Promise<string> {
      const command = new PutObjectCommand({
         Bucket: this.bucketName,
         Key: fileName,
         ContentType: fileType,
      });

      // @ts-ignore - Known type issue with AWS SDK v3
      return await getSignedUrl(this.s3, command, { expiresIn });
   }

   getFileUrl(fileName: string): string {
      return `https://${this.bucketName}.s3.${env.S3_BUCKET_REGION}.amazonaws.com/${fileName}`;
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
