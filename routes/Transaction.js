const express = require('express')
const transactionRouter = express.Router()
const passport = require('passport')
//BEING USED STILL
const passportConfig = require('../passport')
const Transaction = require('../models/Transaction')
const nodemailer = require('nodemailer');
// const transactionPic = require('../images/transaction-successful.png')
require('dotenv').config()


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASS
  }
});

let emailBody

const mailOptions = (recipient) => {
    return {
        from: 'Silent Behemoth <process.env.EMAIL_ADDRESS>',
        to: recipient,
        subject: `Transaction Success`,
        html: emailBody,
        attachments: [{
            filename: 'cb-logo.png',
            path: __dirname + '/images/cb-logo.png',
            cid: 'cb-logo' //same cid value as in the html img src
        }]
    }
  }

transactionRouter.post('/createTransaction', passport.authenticate('jwt', {session: false}), (req, res) => {
    const user = req.user
    const { type, amount } = req.body
    const status = 'Initiated'
    const newTransaction = new Transaction({user, type, amount, status})
    newTransaction.save((err, transaction) => {
        if(err)
            res.status(500).json({msgBody: "Error occured saving transaction to database", msgError: true})
        else
            res.status(200).json({ msgBody: transaction._id, msgError: false })
    })
})

transactionRouter.put('/updateTransaction', passport.authenticate('jwt', {session: false}), (req, res) => {
    const { id, hash, status } = req.body
    const { email } = req.user
    Transaction.updateOne({ _id: id }, {status, hash}, (err, transaction) => {
        if(err)
            res.status(500).json({msgBody: "Error occured looking up transaction", msgError: true})
        else 
            {
                Transaction.findById(id, (err, transaction) => {
                    if(transaction){
                        if(status === 'Success'){
                            const date = new Date(transaction.createdAt)
                            let type
                            if(transaction.type === 'Buy')
                            type = 'bought'
                            else
                            type = 'sold'
                            emailBody = `<img src="cid:cb-logo" style="width: 100%;"/><div><h2 style="color: #363636;text-align: center;">Transaction Successful!</h2><div style="width: 80%;border-radius: 5px;background-color: #e8e8e8;margin: 20px auto;padding: 15px;text-align: center;"><h3 style="color: #363636;">You successfully ${type} ${transaction.amount} credits</h3>` + 
                            `<h5 style="color: #363636;">Time: ${date}</h5 ><h5 style="color: #363636;">Transaction Hash <span style="color: linear-gradient(45deg, #32a883, #3290a8);">${hash}</span></h5><h6 style="color: #292929;">If you did not initiate this transaction contact our support team at admin@silentbehemoth.com</h6></div>`
                            
                            // const info = {type: type, hash: hash, amount: transaction.amount}
                            transporter.sendMail(mailOptions(email), function(error, info){
                                if (error) {
                                    console.log(error);
                                } else {
                                    console.log('Email sent: ' + info.response);
                                }
                            })
                        }
                    }
                })
                    
                res.status(201).json({msgBody: "Transaction successfully updated", msgError: false})
            }
    })
})

transactionRouter.get('/getTransactions', passport.authenticate('jwt', {session: false}), (req, res) => {
        Transaction.find({ user: req.user }, (err,transactions) => {
            if(!transactions)
                res.status(400).json({ transactions: 0 })
            else
                res.status(200).json({ transactions: transactions })
        })
})


module.exports = transactionRouter