const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    text: {
        type: String,
        required: true
    } 
})

module.exports = mongoose.model('Message', MessageSchema)