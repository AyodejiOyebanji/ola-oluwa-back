const express = require('express')
const router = express.Router()
const  ReceivableController = require('../Controllers/ReceivableController')
router.post('/add-receivable',ReceivableController.AddReceivable);
router.get('/get-receivables',ReceivableController.getReceivables);
router.get('/get-receivable/:id',ReceivableController.getReceivable);
router.post('/add-payment',ReceivableController.addPayment);
router.post('/delete-receivables',ReceivableController.deleteReceivables);
router.get('/get-total-receivables',ReceivableController.gettotalreceivables);





module.exports = router


