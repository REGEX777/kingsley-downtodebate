import mongoose from "mongoose";
import slugify from "slugify";


const topicSchema = new mongoose.Schema({
    name: String,
    slug: String
})

topicSchema.pre('validate', function(next) {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true })
  }
  next()
})


const TopicArea = mongoose.model('TopicArea', topicSchema)

export default TopicArea;