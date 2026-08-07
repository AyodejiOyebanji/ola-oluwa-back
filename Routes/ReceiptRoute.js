const express = require('express')
const router = express.Router()
const  ReceiptController = require('../Controllers/ReceiptController')
router.post('/addReceipt', ReceiptController.AddReceipt);

router.get('/getReceipt/:receiptId', ReceiptController.getReceipt);
router.post('/getTodaysale', ReceiptController.getTodaySale);
router.get('/allReceipt', ReceiptController.getAllReceipt);
router.post('/deleteReceipt', ReceiptController.getdeleteReceipt);
router.post('/getTodaystats', ReceiptController.getTodaystats);
router.get('/downloadsales', ReceiptController.downloadSales)
router.get('/fetchTheLastSevenReceipts', ReceiptController.fetchTheLastSevenReceipts)
router.get('/calculateTotalRevenueForEachMonth', ReceiptController.calculateCumulativeRevenueForEachMonth)
router.get('/searchReceipt/:receiptId', ReceiptController.getSearchedReceipt);
router.post('/addpaymentforexistingreceipt', ReceiptController.addPaymentForExistingReceipt);
router.post('/updateReciptDate', ReceiptController.updateReciptDate);
router.post('/getRangeSales', ReceiptController.getRangeSales);



module.exports = router


