const express = require('express')
const userRouter = express.Router()
const passport = require('passport')
const open = require('open')
//BEING USED STILL
const passportConfig = require('../passport')
const JWT = require('jsonwebtoken')
const User = require('../models/User')
const Match = require('../models/Match')
const InfoUpdate = require('../models/InfoUpdate')
const crypto = require("crypto");
const bcrypt = require('bcrypt')
const Chatroom = require('../models/Chatroom')
const Message = require('../models/Message')
const e = require('express')
const nodemailer = require('nodemailer');
const GMAIL_ACCOUNT = 'cryptobehemoth@gmail.com'
require('dotenv').config()


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASS
  }
});

let emailBody
let emailTitle

const mailOptions = (recipient) => {
    return {
        from: 'Crypto Behemoth <process.env.EMAIL_ADDRESS>',
        to: recipient,
        subject: emailTitle,
        html: emailBody,
        attachments: [{
            filename: 'cb-logo.png',
            path: __dirname + '/images/cb-logo.png',
            cid: 'cb-logo' //same cid value as in the html img src
        }]
    }
  }

const signToken = (id) => {
    return JWT.sign({
        iss: "CryptoWar",
        sub: id
    }, "nh32899i32m908nvjkldmkjl8903f489fjnirefnvd90jdn3eyd8u9f0inrijofjrkcfid9j93", {expiresIn: '1w'})
}

userRouter.post('/register',(req, res) => {
    const { username, password, email, role, balance} = req.body
    const lcUsername = username.toLowerCase()
    User.findOne({username: lcUsername}, (err, user) => {
        if(err)
            res.status(500).json({message: {msgBody: "Error occured accessing database", msgError: true}})

        if(user)
            res.status(400).json({message: {msgBody: "Username already exists", msgError: true}})
        else {
            User.findOne({email: email}, (err, user) => {
                if(err)
                    res.status(500).json({message: {msgBody: "Error occured accessing database", msgError: true}})
        
                if(user)
                    res.status(400).json({message: {msgBody: "Email already being used", msgError: true}})

                else {
                    const newUser = new User({username, password, email, role, balance})
                    newUser.save((err) => {
                        if(err)
                            res.status(500).json({message: {msgBody: "Error occured saving user to database", msgError: true}})
                        else
                            res.status(201).json({message: {msgBody: "Account successfully created", msgError: false}})
                    })
                }
            })
        }
    })
})

userRouter.post('/login', passport.authenticate('local', {session: false}), (req, res) => {
    if(req.isAuthenticated()){
        const {_id, username, email, role, balance, matches } = req.user
        const { expiration } = req.body
        const token = signToken(_id)
        res.cookie('access_token', token, {httpOnly: true, sameSite: true})
        res.status(200).json({isAuthenticated: true, user: {username, email, role, balance, matches}})
    }
})

userRouter.post('/createCode', (req, res) => {
    const { email, type } = req.body
    let msgBody
    User.findOne({ email }, (err, user) => {
        if(err)
            res.status(500).json({ msgBody: 'Error accessing database', msgError: true})

        if(!user)
            res.status(400).json({msgBody: "No user found with that email", msgError: true})
        else {
            let resetToken = crypto.randomBytes(6).toString("hex");
            let hash 
            bcrypt.hash(resetToken,10, (err, hashedCode) => {
                if(!err){
                    hash = hashedCode
                    user.resetCode = hash
                    user.resetExpire = Date.now() + 3600000
                    user.save((err) => {
                        if(!err){
                            if(type === 'Password'){
                                emailTitle = `Password Reset`
                                msgBody = 'Look in your email inbox for a reset message. It may take a few minutes'
                                emailBody = `<img src="cid:cb-logo" style="width: 100%;"/><div><div style="width: 80%;border-radius: 5px;background-color: #e8e8e8;margin: 20px auto;padding: 15px;text-align: center;"><h4 style="color: #363636;">Here is your code to reset your password</h4>` + 
                                `<h3 style="color: #526485;">${resetToken}</h3><h6 style="color: #292929;">This password reset will expire in 1 hour of being requested</h6><h6 style="color: #292929;">If you did not initiate this password reset contact our support team at admin@cryptobehemoth.com</h6></div>`
                            }
                            else {
                                emailTitle = `Email Verification`
                                msgBody = 'Look in your email inbox for a verification message. It may take a few minutes'
                                emailBody = `<img src="cid:cb-logo" style="width: 100%;"/><div><div style="width: 80%;border-radius: 5px;background-color: #e8e8e8;margin: 20px auto;padding: 15px;text-align: center;"><h4 style="color: #363636;">Here is your code to verify your email</h4>` + 
                                `<h3 style="color: #526485;">${resetToken}</h3><h6 style="color: #292929;">This email verification will expire in 1 hour of being requested</h6><h6 style="color: #292929;">If you did not initiate this email verification contact our support team at admin@cryptobehemoth.com</h6></div>`
                            }
                    
                            transporter.sendMail(mailOptions(email), function(error, info){
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                            })
                            
                            res.status(201).json({ msgBody: msgBody, msgError: false})
                        }
                        else
                        res.status(500).json({ msgBody: 'Error accessing database', msgError: true})
                    })
                }
            })
        }
    })
})

userRouter.put('/verifyCode', (req, res) => {
    const { email, type, code } = req.body
    User.findOne({ email }, (err, user) => {
        if(err)
            res.status(500).json({ msgBody: 'Error accessing database', msgError: true})

        if(!user)
            res.status(400).json({msgBody: "No user found with that email", msgError: true})
        else {
            user.compareResetCode(code, (match) => {
                // console.log(match)
                if(match){
                    if(type === 'Email') {
                        User.updateOne({ email }, { emailVerified: true }, (err) => {
                            if(err)
                                res.status(500).json({ msgBody: 'Error updating email verification in database. Please try again', msgError: true})

                            res.status(200).json({msgBody: 'Code was successful', msgError: false})
                        })
                    }
                    else
                    res.status(200).json({msgBody: 'Code was successful', msgError: false})
                }
                else
                    res.status(400).json({msgBody: 'Code was incorrect', msgError: true})
            })
        }
    })
})

userRouter.put('/updatePassword', (req, res) => {
    const { email, pass } = req.body
    bcrypt.hash(pass,10, (err, hash) => {
        if(!err){
            User.updateOne({ email }, {password: hash}, (err) => {
                if(!err)
                    res.status(201).json({msgBody: "Password successfully updated", msgError: false})
                else
                    res.status(500).json({msgBody: "Error occured saving password to database", msgError: true})
            })
        }
    })
})

userRouter.post('/checkUser', passport.authenticate('jwt', {session: false}), (req, res) => {
    const { id } = req.user
    const { username, email } = req.body
    User.findOne({ username }, (err, user) => {
        if(!user || id == user.id)
            User.findOne({ email }, (err, user) => {
                if(!user || id == user.id)
                    res.status(200).json({ msgBody: username, isTaken: false})
                else 
                    res.status(200).json({msgBody: 'Email is already in use', isTaken: true})
            })
        else
            res.status(200).json({msgBody: 'Username is already in use', isTaken: true})
    })
})

userRouter.post('/checkPassword', passport.authenticate('local', {session: false}), (req, res) => {
    res.status(200).json({info: req.user})
})

userRouter.get('/getUsers', passport.authenticate('jwt', {session: false}), (req, res) => {
        User.find({}, (err,users) => {
            const userData = users.map(user => {
                return (
                    {username: user.username, role: user.role, balance: user.balance, matches: user.matches }
                )
            })
            res.status(200).json({ users: userData })
        })
})
userRouter.get('/getUser', passport.authenticate('jwt', {session: false}), (req, res) => {
    const { username } = req.user
    User.findOne({ username }, (err,user) => {
        if(err)
        res.status(500).json({ msgBody: 'Error saving pass reset to database', msgError: true})

        if(user)
            res.status(200).json({ user: user })
    })
})
userRouter.get('/getMatches', passport.authenticate('jwt', {session: false}), (req, res) => {
        Match.find({}, (err,matches) => {
            res.status(200).json({ matches: matches })
        })
})
userRouter.get('/authenticated', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.status(200).json({isAuthenticated: true, user: req.user})
})

userRouter.put('/updateUser', passport.authenticate('jwt', {session: false}), (req, res) => {
    const { oldUsername, newUsername, oldEmail, newEmail } = req.body
    let verify
    if(oldEmail === newEmail && req.user.emailVerified) 
        verify = true
    else 
        verify = false

    User.updateOne({ username: oldUsername }, {username: newUsername, email: newEmail, emailVerified: verify}, (err) => {
        if(err)
            res.status(500).json({msgBody: "Error occured saving new user info in database", msgError: true})
        
        const infoUpdate = new InfoUpdate({user: req.user, previousEmailValue: oldEmail, previousUsernameValue: oldUsername, newEmailValue: newEmail, newUsernameValue: newUsername });
        infoUpdate.save((err) => {
            if(err)
            res.status(500).json({msgBody: "Error occured saving to infoupdate in database", msgError: true})

            res.status(200).json({ msgBody: verify, msgError: false })
        })
    })
})

userRouter.get('/logout', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.clearCookie('access_token')
    res.json({user:{username: '', role: '', balance: ''}, success: true})
})

userRouter.put('/updateTokens', passport.authenticate('jwt', {session: false}), (req, res) => {
    const { username } = req.user
    const { amount } = req.body
    User.updateOne({ username }, {balance: amount}, (err, user) => {
        if(err)
        res.status(500).json({message: {msgBody: "Error occured accessing database", msgError: true}})

        res.status(200).json({message: { msgBody: user, msgError: false } })
    })
})

userRouter.get('/admin', passport.authenticate('jwt', {session: false}), (req, res) => {
    if(req.user.role === 'admin') {
        res.status(200).json({message: {msgBody: "You're an admin", msgError: false}})
    }
    else
        res.status(403).json({message: {msgBody: "You're not an admin", msgError: true}})
})

module.exports = userRouter