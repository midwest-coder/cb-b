require('dotenv').config()

const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const url = require("url")
const proxy = url.parse(process.env.QUOTAGUARDSHIELD_URL)
app.use(cookieParser())
app.use(express.json())
const port = (proxy.port || 80)
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const MONGODB_URI = process.env.MONGODB_URI

const mongoose = require('mongoose')

mongoose.connect(MONGODB_URI, {useNewUrlParser: true}, () => {
    console.log('successfully connected to database')  
})


    const userRouter = require('./routes/User')
    app.use('/user', userRouter)

    http.listen(port, () => {
        console.log(`Listening on port ${port}...`)
    })