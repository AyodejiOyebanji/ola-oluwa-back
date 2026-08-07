const express = require('express')
const router = express.Router()

const HistoryController = require('../Controllers/HistoryController') 

 router.post('/addHistory', HistoryController.addHistory)
 router.get('/allHistory', HistoryController.getAllHistory)
 router.get('/fetchProductHistory', HistoryController.fetchProductHistory)



module.exports = router