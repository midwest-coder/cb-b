const express = require('express')
const transactionRouter = express.Router()
const passport = require('passport')
//BEING USED STILL
const passportConfig = require('../passport')
const Transaction = require('../models/Transaction')

transactionRouter.post('/createTransaction/:type/:amount', passport.authenticate('jwt', {session: false}), (req, res) => {
    const user = req.user
    const type = req.params.type
    const amount = req.params.amount
    const status = 'Initiated'
    const newTransaction = new Transaction({user, type, amount, status})
    newTransaction.save((err, transaction) => {
        if(err)
            res.status(500).json({msgBody: "Error occured saving transaction to database", msgError: true})
        else
            res.status(200).json({ msgBody: transaction._id, msgError: false })
    })
})

transactionRouter.put('/updateTransaction/:id/:hash/:status', passport.authenticate('jwt', {session: false}), (req, res) => {
    const id = req.params.id
    const hash = req.params.hash
    const status = req.params.status
    Transaction.updateOne({ _id: id }, {status, hash}, (err) => {
        if(err)
            res.status(500).json({msgBody: "Error occured looking up transaction", msgError: true})
        else 
            res.status(201).json({msgBody: "Transaction successfully updated", msgError: false})
    })
})

transactionRouter.get('/getTransactions', passport.authenticate('jwt', {session: false}), (req, res) => {
        Transaction.find({ user: req.user }, (err,transactions) => {
            res.status(200).json({ transactions: transactions })
        })
})


module.exports = transactionRouter