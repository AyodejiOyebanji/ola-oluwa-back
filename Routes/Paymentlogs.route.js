const express = require('express')
const router = express.Router()

const PaymentLogsController = require('../Controllers/PaymentlogsController') 

 router.get('/fetchpaymentlogs', PaymentLogsController.fetchpaymentlogs)
 router.get('/fetchSummaryforCreditAndDebit', PaymentLogsController. fetchSummaryforCreditAndDebit)



module.exports = router