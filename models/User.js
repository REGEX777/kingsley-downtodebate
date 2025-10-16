import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: String,
    admin: Boolean,
    username: String, 
    password: String,
    ip: String,
    accessLogs: Array
})

const User = mongoose.model('User', userSchema)

export default User