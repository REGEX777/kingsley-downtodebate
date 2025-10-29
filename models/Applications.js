import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    ip: String,
    email: String,
    message: String,
    time: Date,
    archived: {type: Boolean, default: false}
})


const Application = mongoose.model('Application', applicationSchema)

export default Application