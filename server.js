require('dotenv').config()

const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
app.use(cookieParser())
app.use(express.json())
const port = (process.env.PORT || 4000)
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const mongoURL = 'mongodb+srv://grandmaster:<password>@cluster0.9qvgf.mongodb.net/<dbname>?retryWrites=true&w=majority';
const test = 'mongodb://127.0.0.1/chatroom';

const mongoose = require('mongoose')
// const passport = require('passport')
// const passportConfig = require('./passport')
// const JWT = require('jsonwebtoken')
// const socketioJwt = require('socketio-jwt')

const User = require('./models/User')
const Chatroom = require('./models/Chatroom')
const Message = require('./models/Message')

mongoose.connect(mongoURL, {useNewUrlParser: true}, () => {
    console.log('successfully connected to database')  
})
//     io.use(socketioJwt.authorize({
//         secret: 'yguhbn678hb67678gytuu',
//         handshake: true,
//         auth_header_required: true
//       }));

//     io.on('connection', socketioJwt.authorize({
//         secret: 'yguhbn678hb67678gytuu',
//         timeout: 15000 // 15 seconds to send the authentication message
//       }))
//       .on('authenticated', (socket) => {
//         socket.on('addUser', (user) =>{
//             const { username, password, email, role, account, balance } = user
//             const error = false
//             User.findOne({account}, (err, user) => {
//                 if(err)
//                     io.emit('error', {message: "Error connecting to database, try again later", error:err})
//                 else {
//                     if(user)
//                     io.emit('error', {message: "User with that wallet already exists"})
//                     else {
//                         User.findOne({username}, (err, user) =>{
//                             if(err)
//                                 io.emit('error', {message: "Error connecting to database, try again later", error:err})
//                             else {
//                                 if(user)
//                                 io.emit('error', {message: "Username already exists"})
//                                 else {
//                                     const newUser = new User({username, password, email, role, account, balance})
//                                     newUser.save((err) => {
//                                         if(err)
//                                         io.emit('error', {message: "Error saving to database, try again later", error:err})
//                                         else
//                                         io.emit('userAdded', {message: "Account successful"})
//                                     })
//                                 }
//                             }
//                         })
//                     }
//                 }
//             })
//         })

//         socket.on('/login', passport.authenticate('local', {session: false}), (user) => {

//         })

//         socket.on('message', (message) => {
//             console.log(`name: ${message.username} / text: ${message.text}`)
//             io.emit('message', message)
//         })
//     })
    
// })

    const userRouter = require('./routes/User')
    app.use('/user', userRouter)

    http.listen(port, () => {
        console.log(`Listening on port ${port}...`)
    })