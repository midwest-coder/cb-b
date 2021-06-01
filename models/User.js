const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true,
        lowercase: true,
        min: 3,
        max: 20
    },
    password: {
        type: String, 
        required: true,
        min: 6,
        max: 30
    },
    email: {
        type: String, 
        required: true,
        lowercase: true,
        min: 6,
        max: 50
    },
    emailVerified: {
        type: Boolean,
        required: true,
        default: false
    },
    resetCode: {
        type: String
    },
    resetExpire: {
        type: Date
    },
    role: {
        type: String,
        enum: ['user','admin'],
        required: true
    },
    balance: {
        type: Number, 
        required: true
        //FINISH FILLING THIS OUT
    },
    matches: [{type: mongoose.Schema.Types.ObjectId, ref: 'Match'}],
    transactions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Transaction'}]
}, { timestamps: true })

UserSchema.pre('save', function(next){
    if(this.isModified('username'))
        this.username = this.username.toLowerCase()
    
    if(!this.isModified('password'))
        return next()

    bcrypt.hash(this.password,10, (err,hashedPass) => {
        if(err)
            return next(err)

        this.password = hashedPass
        next()
    })
})

UserSchema.methods.comparePassword = function(password, callback){
    bcrypt.compare(password, this.password, (err, isMatch) => {
        if(err)
            return callback(err)
        else {
            if(!isMatch)
                return callback(null, isMatch)

            return callback(null, this)
        }
    })
}

UserSchema.methods.compareResetCode = function(code, callback){
    bcrypt.compare(code, this.resetCode, (err, isMatch) => {
        if(err)
            return callback(false)
        else {
            if(!isMatch)
                return callback(false)

            return callback(true)
        }
    })
}

module.exports = mongoose.model('User', UserSchema)