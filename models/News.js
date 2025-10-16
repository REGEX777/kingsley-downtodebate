import mongoose from "mongoose";

const newSchema = new mongoose.Schema({
    title: String,
    body: String
})

const News = mongoose.model('News', newSchema);

export default News;