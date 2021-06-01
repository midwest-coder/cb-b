require('dotenv').config()

const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const path = require('path')
// const url = require("url")
// const proxy = url.parse(process.env.QUOTAGUARDSHIELD_URL)
app.use(cookieParser())
app.use(express.json())
const port = (process.env.PORT || 4000)
const http = require('http').createServer(app)
// const io = require('socket.io')(http)
const MONGODB_URI = process.env.MONGODB_URI
const test = 'mongodb://127.0.0.1/chatroom'

const mongoose = require('mongoose')

mongoose.connect(MONGODB_URI, {useNewUrlParser: true,  useUnifiedTopology: true }, () => {
    console.log('successfully connected to database')  
})

// app.use(express.static(path.join(__dirname, '../client/CW/build')))

//     app.get('/', (res,req) => {
//         res.sendFile(path.join(__dirname, '../client/CW/build', 'index.html'))
//     })


    const userRouter = require('./routes/User')
    const transactionRouter = require('./routes/Transaction')
    app.use('/user', userRouter)
    app.use('/transaction', transactionRouter)

    http.listen(port, () => {
        console.log(`Listening on port ${port}...`)
    })