import mongoose from "mongoose";

const iconSchema = new mongoose.Schema({
    icon: {type:String, default: '✱'}
})

const Icon = mongoose.model('Icon', iconSchema)

export default Icon;