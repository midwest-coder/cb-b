const mongoose = require('mongoose')

const MatchSchema = new mongoose.Schema({
    game: {
        type: String,
        enum: ['Endless War'],
        required: true
    },
    kills: {
        type: Number,
        default: 0,
        required: true
    },
    points: {
        type: Number,
        default: 0,
        required: true
    },
    usersKilled: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    diedTo: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        default: '0',
        required: true}
}, { timestamps: true })


module.exports = mongoose.model('Match', MatchSchema)