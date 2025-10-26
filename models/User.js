import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {type: String, unique: true},
    admin: Boolean,
    username: String, 
    superadmin: Boolean,
    password: String,
    signupIp: String,
    accessLogs: [String],

    resetToken: String,
    tokenExpiration: Date,
    lastResetRequest: Date
})

const User = mongoose.model('User', userSchema)

export default User;