import mongoose from "mongoose";
import slugify from "slugify";

const formatSchema = new mongoose.Schema({
    name: String,
    slug: String
})

formatSchema.pre('validate', function(next) {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true })
  }
  next()
})

const DebateFormat = mongoose.model('DebateFormat', formatSchema)
export default DebateFormat;