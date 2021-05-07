const mongoose = require('mongoose')

const TransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Buy','Sell'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    hash: {
        type: String,
        required: true,
        default: '0'
    },
    status: {
        type: String,
        enum: ['Initiated','Processing','Success','Error'],
        required: true
    },
}, { timestamps: true })


module.exports = mongoose.model('Transaction', TransactionSchema)