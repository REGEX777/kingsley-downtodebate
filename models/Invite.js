import mongoose from 'mongoose'

const inviteSchema = new mongoose.Schema({
    code: String,
    used: {type: Boolean, default: false},
    invitedUserEmail: String,
    expires: Date
})

const Invite = mongoose.model('Invite', inviteSchema)

export default Invite