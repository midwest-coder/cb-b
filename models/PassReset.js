const mongoose = require('mongoose')

const PassResetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    code: {
        type: String,
        required: true,
        default: '0'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600,// this is the expiry time
      },
})

module.exports = mongoose.model('PassReset', PassResetSchema)