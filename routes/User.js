const express = require('express')
const userRouter = express.Router()
const passport = require('passport')
//BEING USED STILL
const passportConfig = require('../passport')
const JWT = require('jsonwebtoken')
const User = require('../models/User')
const Match = require('../models/Match')
const Chatroom = require('../models/Chatroom')
const Message = require('../models/Message')


userRouter.post('/register',(req, res) => {
    const { username, password, email, role, balance} = req.body
    const lcUsername = username.toLowerCase()
    User.findOne({username: lcUsername}, (err, user) => {
        if(err)
            res.status(500).json({message: {msgBody: "Error occured accessing database", msgError: true}})

        if(user)
            res.status(400).json({message: {msgBody: "Username already exists", msgError: true}})
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
})

userRouter.post('/login', passport.authenticate('local', {session: false}), (req, res) => {
    if(req.isAuthenticated()){
        const {_id, username, role, balance, matches } = req.user
        const token = signToken(_id)
        res.cookie('access_token', token, {httpOnly: true, sameSite: true})
        res.status(200).json({isAuthenticated: true, user: {username, role, balance, matches}})
    }
})

const signToken = (id) => {
    return JWT.sign({
        iss: "CryptoWar",
        sub: id
    }, "nh32899i32m908nvjkldmkjl8903f489fjnirefnvd90jdn3eyd8u9f0inrijofjrkcfid9j93", {expiresIn: "4w"})
}

userRouter.get('/checkUser/:username', (req, res) => {
    const { username } = req.params.username
    User.findOne({ username }, (err, user) => {
        if(!user)
        res.status(200).json({isTaken: false})
        else
        res.status(200).json({isTaken: true})
    })
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
userRouter.get('/getMatches', passport.authenticate('jwt', {session: false}), (req, res) => {
        Match.find({}, (err,matches) => {
            res.status(200).json({ matches: matches })
        })
})
userRouter.get('/authenticated', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {username, role, balance, matches } = req.user
    res.status(200).json({isAuthenticated: true, user: {username, role, balance, matches}})
})

userRouter.get('/logout', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.clearCookie('access_token')
    res.json({user:{username: '', role: '', balance: ''}, success: true})
})

userRouter.put('/updateTokens/:amount', passport.authenticate('jwt', {session: false}), (req, res) => {
    const { username } = req.user
    const amount = req.params.amount
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