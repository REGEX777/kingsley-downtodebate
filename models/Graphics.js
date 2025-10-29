import mongoose from "mongoose";

const GraphicSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['banner', 'logo'], index: true },
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  path: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const Graphic = mongoose.model('Graphic', GraphicSchema);

export default Graphic;
