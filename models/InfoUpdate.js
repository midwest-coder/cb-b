const mongoose = require('mongoose')

const InfoUpdateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    previousEmailValue: {
        type: String,
        required: true
    },
    previousUsernameValue: {
        type: String,
        required: true
    },
    newEmailValue: {
        type: String,
        required: true
    },
    newUsernameValue: {
        type: String,
        required: true
    }
}, { timestamps: true })


module.exports = mongoose.model('InfoUpdate', InfoUpdateSchema)