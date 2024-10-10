import mongoose from 'mongoose';

const digitalLibrarySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: String, required: true },
    image: { type: String, required: true },  // Image field for card display
    resourceFile: { type: String, required: true },  // Resource file (PDF or document)
    datePublished: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

const DigitalLibrary = mongoose.model('DigitalLibrary', digitalLibrarySchema);
export default DigitalLibrary;
