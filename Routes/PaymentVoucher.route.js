const express = require('express')
const router = express.Router()
const  VoucherPaymentController = require('../Controllers/PaymentVoucherController')

router.post('/createvoucherpayment', VoucherPaymentController.addVoucherPayment  );
router.get('/approve-voucher/:id', VoucherPaymentController.getPaymentSOfVoucher );
router.post('/createMaterialvoucherpayment', VoucherPaymentController.addMaterialVoucherPayment  );




module.exports = router


