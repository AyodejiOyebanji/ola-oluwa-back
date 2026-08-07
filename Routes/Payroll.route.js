const express = require('express')
const router = express.Router()
const  PayrollController = require('../Controllers/PayrollController')
router.post('/createpayroll',  PayrollController.createPayroll);
router.get('/fetchallpayroll',  PayrollController.fetchallpayroll);
router.get('/fetcheachpayroll/:id',  PayrollController.fetcheachpayroll);
router.get('/downloadpayroll',  PayrollController.downloadpayroll);





module.exports = router


