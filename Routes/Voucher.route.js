const express = require('express')
const router = express.Router()
const  VoucherController = require('../Controllers/VoucherController')
router.post('/addvoucher', VoucherController.addVoucher );
router.get('/getvouchers', VoucherController.getVouchers );
router.get('/getvoucher/:id', VoucherController.getVoucher );
router.post('/approve-voucher', VoucherController.approveVoucher );
router.get('/downloadvoucher', VoucherController.downloadvoucher );

module.exports = router


