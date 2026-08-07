const express = require('express')
const router = express.Router()

const InventoryController = require('../Controllers/InventoryContoller') 

 router.post('/add-inventory', InventoryController.addInventory)
 router.get('/fetchAllinventory', InventoryController.getAllInventory )
 router.post('/delete-inventory', InventoryController.deleteInventory )







module.exports = router