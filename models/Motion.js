import mongoose from 'mongoose';
import slugify from 'slugify'


const motionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  motions: [
    {
      name: String,
      slug: String,
      body: String
    }
  ]
}, { timestamps: true });

motionSchema.pre('validate', function(next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true })
  }
  next()
})

const Motion = mongoose.model('Motion', motionSchema);
export default Motion;
