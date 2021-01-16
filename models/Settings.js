const mongoose = require('mongoose')

const SettingsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    game: {
        type: String,
        enum: ['Endless War'],
        default: 'Endless War',
        required: true
    },
    musicVolume: {
        type: Number,
        default: 1,
        required: true
    },
    sfxVolume: {
        type: Number,
        default: 1,
        required: true
    }
}, { timestamps: true })


module.exports = mongoose.model('Settings', SettingsSchema)