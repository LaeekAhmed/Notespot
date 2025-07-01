import express, { Request, Response, NextFunction, Router } from "express";

import { v4 as uuidv4 } from "uuid";
import { clerkClient, getAuth } from "@clerk/express";
import Document from "../../models/document";
import {
   s3Helper,
   validateFile,
   paginate,
   getUserFromClerk,
   buildSearchQuery,
   PaginationOptions
} from "../../utils/helpers";
import { checkAuth } from "../../utils/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const router: Router = express.Router();


// GET /api/documents - Get all documents with pagination and search
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { userId } = getAuth(req);
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50); // Max 50 per page
      const search = req.query.search as string;
      const sortBy = req.query.sortBy as string || 'uploadDate';
      const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

      let query;
      if (userId) {
         // Authenticated: show public + own private
         query = buildSearchQuery(search, userId, undefined, true);
      } else {
         // Not authenticated: show only public
         query = buildSearchQuery(search, undefined, true);
      }
      const options: PaginationOptions = { page, limit, sortBy, sortOrder };
      const result = await paginate(query, options);
      res.json({
         success: true,
         ...result
      });
   } catch (error) {
      next(error);
   }
});

// POST /api/documents/presigned - Generate pre-signed URL for S3 upload
router.post("/presigned", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
   try {
      const { userId } = getAuth(req);
      const { fileName, fileType } = req.body;
      
      if (!fileName || !fileType) {
         res.status(400).json({
            success: false,
            error: "fileName and fileType are required"
         });
         return;
      }

      // Generate a unique file name to prevent collisions
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;

      const s3Client = new S3Client({
         credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY!,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
         },
         region: process.env.S3_BUCKET_REGION!,
      });

      const command = new PutObjectCommand({
         Bucket: "note-spot",
         Key: uniqueFileName,
         ContentType: fileType,
      });

      // @ts-ignore - Known type issue with AWS SDK v3
      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

      res.json({
         success: true,
         data: {
         presignedUrl,
            fileName: uniqueFileName,
            fileUrl: `https://note-spot.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${uniqueFileName}`
         }
      });
   } catch (error) {
      next(error);
   }
});

// POST /api/documents - Create document record after S3 upload
router.post("/", checkAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
   try {
      const { userId } = getAuth(req);
      const { title, description, fileName, fileUrl, fileSize, isPublic = true } = req.body;

      if (!title || !fileName || !fileUrl || !fileSize) {
         res.status(400).json({
            success: false,
            error: "Missing required fields"
         });
         return;
      }

      // Get author info
      const authorInfo = await getUserFromClerk(userId!)

      const document = new Document({
         title: title.trim(),
         description: description?.trim(),
         fileName,
         fileUrl,
         fileSize,
         authorId: userId,
         authorName: authorInfo.name,
         isPublic,
         uuid: uuidv4()
      });

      await document.save();

      res.status(201).json({
         success: true,
         message: "Document created successfully",
         data: document
      });
   } catch (error) {
      next(error);
   }
});

// GET /api/documents/:id - get document by id
router.get("/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
   try {
      const { userId } = getAuth(req);
      const document = await Document.findById(req.params.id);

      if (!document) {
         res.status(404).json({
            success: false,
            message: "Document not found"
         });
         return;
      }

      // Check if document is public or if the current user owns it
      const isOwner = userId === document.authorId;
      if (!document.isPublic && !isOwner) {
         res.status(403).json({
            success: false,
            message: "Access denied"
         });
         return;
      }

      res.json({
         success: true,
         data: document
      });
   } catch (error) {
      next(error);
   }
});

// PUT /api/documents/:id - Update document
router.put("/:id", checkAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
   try {
      const { userId } = getAuth(req);
      const document = await Document.findById(req.params.id);

      if (!document) {
         res.status(404).json({
            success: false,
            message: "Document not found"
         });
         return;
      }

      // Check ownership
      if (document.authorId !== userId) {
         res.status(403).json({
            success: false,
            message: "Access denied"
         });
         return;
      }

      const { title, description, isPublic } = req.body;

      if (title !== undefined) document.title = title.trim();
      if (description !== undefined) document.description = description?.trim();
      if (isPublic !== undefined) document.isPublic = Boolean(isPublic);

      const updatedDocument = await document.save();

      res.json({
         success: true,
         message: "Document updated successfully",
         data: updatedDocument
      });
   } catch (error) {
      next(error);
   }
});

// DELETE /api/documents/:id - Delete document
router.delete("/:id", checkAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
   try {
      const { userId } = getAuth(req);
      const document = await Document.findById(req.params.id);

      if (!document) {
         res.status(404).json({
            success: false,
            message: "Document not found"
         });
         return;
      }

      // Check ownership
      if (document.authorId !== userId) {
         res.status(403).json({
            success: false,
            message: "Access denied"
         });
         return;
      }

      // Delete the file from S3 first
      try {
         await s3Helper.deleteFile(document.fileName);
      } catch (s3Error: any) {
         console.error('Failed to delete file from S3:', s3Error);
         res.status(500).json({
            success: false,
            message: "Failed to delete document from storage",
            error: s3Error.message
         });
         return;
      }

      // Only delete from MongoDB if S3 deletion succeeded
      console.log(`Attempting to delete document ${req.params.id} from MongoDB...`);
      const deletedDocument = await Document.findByIdAndDelete(req.params.id);

      if (!deletedDocument) {
         console.error('Document was not found in MongoDB for deletion:', req.params.id);
         res.status(500).json({
            success: false,
            message: "Document was deleted from storage but not found in database"
         });
         return;
      }

      console.log(`Successfully deleted document ${req.params.id} from both S3 and MongoDB`);
      res.json({
         success: true,
         message: "Document deleted successfully"
      });
   } catch (error) {
      next(error);
   }
});

// GET /api/documents/:id/ - Download document
router.get("/:id/download", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
   try {
      const document = await Document.findById(req.params.id);

      if (!document) {
         res.status(404).json({
            success: false,
            message: "Document not found"
         });
         return;
      }

      // Check if document is public or user owns it
      const { userId } = getAuth(req);
      const isOwner = userId === document.authorId;
      if (!document.isPublic && !isOwner) {
         res.status(403).json({
            success: false,
            message: "Access denied"
         });
         return;
      }

      // Increment download count
      await Document.findByIdAndUpdate(req.params.id, {
         $inc: { downloadCount: 1 }
      });

      // Redirect to S3 URL for download
      res.redirect(document.fileUrl);
   } catch (error) {
      next(error);
   }
});

export default router;