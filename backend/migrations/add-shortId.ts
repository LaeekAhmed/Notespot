import mongoose from 'mongoose';
import { generateShortId } from '../utils/helpers';

// Connect to your MongoDB
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/notespot');

import Document from '../models/document';

async function migrateShortIds() {
  try {
    console.log('Starting migration: Adding shortId to existing documents...');
    
    // Find all documents that don't have shortId
    const documents = await Document.find({ shortId: { $exists: false } });
    
    console.log(`Found ${documents.length} documents to migrate`);
    
    for (const doc of documents) {
      // Generate a unique shortId
      let shortId;
      let isUnique = false;
      
      while (!isUnique) {
        shortId = generateShortId();
        const existing = await Document.findOne({ shortId });
        if (!existing) {
          isUnique = true;
        }
      }
      
      // Update the document
      await Document.findByIdAndUpdate(doc._id, { shortId });
      console.log(`Updated document ${doc._id} with shortId: ${shortId}`);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

migrateShortIds(); 