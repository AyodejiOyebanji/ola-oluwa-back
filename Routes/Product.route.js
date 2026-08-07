const express = require('express')
const router = express.Router()
const ProductController = require('../Controllers/ProductController')
router.post('/addProduct', ProductController.addProduct);
router.get('/fetchallProducts', ProductController.fetchallProducts);

router.get('/allProducts', ProductController.getAllProducts);
router.post('/deleteproduct', ProductController.getdeleteProduct);
router.post('/deleteproduct/:editedId', ProductController.geteditProduct);
router.post('/addMoreToProduct', ProductController.addMoreToProduct)




module.exports = router