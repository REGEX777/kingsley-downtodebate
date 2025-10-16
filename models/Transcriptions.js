import mongoose from "mongoose";
import slugify from "slugify";

const transcriptionSchema = new mongoose.Schema({
    title: String,
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    original: String,
    body: String
})
transcriptionSchema.pre('validate', function(next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true })
  }
  next()
})
const Transcript = new mongoose.model('Transcript', transcriptionSchema);
export default Transcript;