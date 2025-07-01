import mongoose, { Document as MongoDocument, Schema, Model } from 'mongoose';

export interface IDocument extends MongoDocument {
   title: string;
   description?: string;
   fileSize: number;
   fileName: string;
   fileUrl: string;
   uuid: string;
   authorId: string; // Clerk user ID
   authorName: string;
   coverImage?: string; // URL to cover image
   isPublic: boolean;
   downloadCount: number;
   createdAt: Date;
   updatedAt: Date;
}

const documentSchema = new Schema<IDocument>({
   title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
   },
   description: {
      type: String,
      trim: true,
      maxlength: 1000
   },
   fileSize: {
      type: Number,
      required: true
   },
   fileName: {
      type: String,
      required: true
   },
   fileUrl: {
      type: String,
      required: true
   },
   uuid: {
      type: String,
      required: true,
      unique: true
   },
   authorId: {
      type: String,
      required: true
   },
   authorName: {
      type: String,
      required: true
   },
   coverImage: {
      type: String
   },
   isPublic: {
      type: Boolean,
      default: true
   },
   downloadCount: {
      type: Number,
      default: 0
   }
}, {
   timestamps: true,
   toJSON: { virtuals: true },
   toObject: { virtuals: true }
});

// Indexes for better query performance
documentSchema.index({ authorId: 1 });
documentSchema.index({ createdAt: -1 });
documentSchema.index({ isPublic: 1 });
documentSchema.index({ title: 'text', description: 'text' });

// Virtual to format file size in human readable format
documentSchema.virtual('formattedSize').get(function () {
   const bytes = this.fileSize;
   if (bytes === 0) return '0 Bytes';
   const k = 1024;
   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
   const i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual to get file type from extension
documentSchema.virtual('fileType').get(function () {
   const extension = this.fileName.split('.').pop()?.toLowerCase() || '';
   const typeMap: Record<string, string> = {
      'pdf': 'PDF Document',
      'doc': 'Word Document',
      'docx': 'Word Document',
      'txt': 'Text File',
      'ppt': 'PowerPoint',
      'pptx': 'PowerPoint',
      'png': 'Image',
      'jpg': 'Image',
      'jpeg': 'Image'
   };
   return typeMap[extension] || 'Unknown';
});

// Virtual to get MIME type (if needed for S3 uploads)
documentSchema.virtual('mimeType').get(function () {
   const extension = this.fileName.split('.').pop()?.toLowerCase() || '';
   const mimeMap: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg'
   };
   return mimeMap[extension] || 'application/octet-stream';
});

const Document: Model<IDocument> = mongoose.model<IDocument>("Document", documentSchema);
export default Document;